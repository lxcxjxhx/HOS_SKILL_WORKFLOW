#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI 功能实现 - HOS-QuizMaster V2
Phase 10: AI 功能实现

基于 AIService 抽象层，实现四大 AI 功能：
1. 智能题目推送 - 基于知识点掌握度推荐薄弱题目
2. AI 题目生成 - 调用 LLM 围绕指定知识点生成新题目
3. 智能解析生成 - 为缺少解析的题目自动生成解析
4. 知识点分析报告 - 生成学习情况分析报告
"""

import json
import re
import time
import logging
import threading
from typing import List, Dict, Optional, Generator, Callable
from datetime import datetime

from .ai_service import AIService, AIServiceFactory, AIMessage, AIResponse, AIServiceError, AIServiceTimeoutError
from .ai_config import AIConfigManager
from core.knowledge_manager import KnowledgeManager
from core.stats_analyzer import StatsAnalyzer
from data.dao import QuestionDAO, AnswerDAO, KnowledgePointDAO

logger = logging.getLogger(__name__)


# ===== 自定义异常 =====
class AICancelledError(Exception):
    """AI 操作被用户取消时抛出"""
    pass

# 默认超时时间（秒）
DEFAULT_TIMEOUT = 30
# 默认重试次数
DEFAULT_RETRY_COUNT = 3
# 重试间隔基数（秒），实际间隔为 base * 2^attempt: 1s, 2s, 4s
DEFAULT_RETRY_BASE_DELAY = 1.0


class AIFeatures:
    """
    AI 功能集合

    将 AI 服务与业务逻辑（知识点管理、统计分析、题库数据）连接起来，
    提供面向用户的高层 AI 功能。
    """

    def __init__(
        self,
        ai_service: AIService,
        knowledge_manager: KnowledgeManager,
        stats_analyzer: StatsAnalyzer,
        question_dao: QuestionDAO,
        answer_dao: AnswerDAO,
        kp_dao: KnowledgePointDAO,
        timeout: int = DEFAULT_TIMEOUT,
        retry_count: int = DEFAULT_RETRY_COUNT,
        retry_base_delay: float = DEFAULT_RETRY_BASE_DELAY,
    ):
        self.ai = ai_service
        self.km = knowledge_manager
        self.stats = stats_analyzer
        self.question_dao = question_dao
        self.answer_dao = answer_dao
        self.kp_dao = kp_dao

        # 优化参数
        self.timeout = timeout
        self.retry_count = retry_count
        self.retry_base_delay = retry_base_delay

        # 取消控制
        self._cancel_event = threading.Event()

    # ================================================================
    # AI 响应优化：超时 / 重试 / 取消 / 流式
    # ================================================================

    def cancel(self):
        """
        取消当前正在进行的 AI 生成操作

        调用后，正在运行的流式生成会在下一次 yield 前终止，
        并抛出 AICancelledError。
        """
        self._cancel_event.set()
        logger.info("已请求取消 AI 生成操作")

    def reset_cancel(self):
        """重置取消标志，开始新的生成任务前调用"""
        self._cancel_event.clear()

    def _check_cancelled(self):
        """检查是否已取消，若已取消则抛出 AICancelledError"""
        if self._cancel_event.is_set():
            raise AICancelledError("用户取消了生成操作")

    def _stream_with_optimizations(
        self,
        gen_factory: Callable[[], Generator[str, None, None]],
        timeout: Optional[int] = None,
        on_timeout: Optional[Callable[[], None]] = None,
    ) -> Generator[str, None, None]:
        """
        为流式生成包装超时、重试、取消机制

        Args:
            gen_factory: 返回 generator 的工厂函数（每次重试需重新创建）
            timeout: 超时秒数，默认使用 self.timeout
            on_timeout: 超时后的回调（用于清理资源）

        Yields:
            流式内容片段

        Raises:
            AICancelledError: 用户取消
            AIServiceTimeoutError: 超时
            AIServiceError: 重试耗尽后仍然失败
        """
        timeout = timeout if timeout is not None else self.timeout
        last_error: Optional[Exception] = None

        for attempt in range(1, self.retry_count + 1):
            self._check_cancelled()
            start = time.monotonic()
            try:
                gen = gen_factory()
                for chunk in gen:
                    # 每次 yield 前检查取消
                    self._check_cancelled()
                    # 检查超时
                    if time.monotonic() - start > timeout:
                        if on_timeout:
                            on_timeout()
                        raise AIServiceTimeoutError(
                            f"AI 响应超时（{timeout} 秒），请简化问题或稍后再试"
                        )
                    yield chunk
                # 成功完成
                return
            except AICancelledError:
                raise
            except AIServiceTimeoutError:
                raise
            except AIServiceError as e:
                last_error = e
                if attempt < self.retry_count:
                    delay = self.retry_base_delay * (2 ** (attempt - 1))
                    logger.warning(
                        f"AI 调用失败，第 {attempt}/{self.retry_count} 次重试，"
                        f"等待 {delay}s: {e}"
                    )
                    # 等待期间分段检查取消
                    self._interruptible_sleep(delay)
                else:
                    logger.error(f"AI 调用重试 {self.retry_count} 次后仍失败: {e}")

        if last_error is not None:
            raise last_error

    def _call_with_optimizations(
        self,
        func: Callable,
        *args,
        timeout: Optional[int] = None,
    ):
        """
        为非流式调用包装超时、重试、取消机制

        Args:
            func: 要调用的函数
            *args: 函数参数
            timeout: 超时秒数

        Returns:
            函数返回值
        """
        timeout = timeout if timeout is not None else self.timeout
        last_error: Optional[Exception] = None

        for attempt in range(1, self.retry_count + 1):
            self._check_cancelled()
            result_container: List = []
            error_container: List[Exception] = []

            def _worker():
                try:
                    result_container.append(func(*args))
                except Exception as e:
                    error_container.append(e)

            t = threading.Thread(target=_worker, daemon=True)
            t.start()
            t.join(timeout=timeout)

            if t.is_alive():
                # 超时
                raise AIServiceTimeoutError(
                    f"AI 响应超时（{timeout} 秒），请简化问题或稍后再试"
                )

            if error_container:
                err = error_container[0]
                if isinstance(err, AICancelledError):
                    raise err
                if isinstance(err, AIServiceError):
                    last_error = err
                    if attempt < self.retry_count:
                        delay = self.retry_base_delay * (2 ** (attempt - 1))
                        logger.warning(
                            f"AI 调用失败，第 {attempt}/{self.retry_count} 次重试，"
                            f"等待 {delay}s: {err}"
                        )
                        self._interruptible_sleep(delay)
                        continue
                    else:
                        logger.error(f"AI 调用重试 {self.retry_count} 次后仍失败: {err}")
                        raise err
                raise err

            if result_container:
                return result_container[0]

        if last_error is not None:
            raise last_error
        raise AIServiceError("AI 调用失败，未知错误")

    def _interruptible_sleep(self, seconds: float):
        """可被取消中断的 sleep"""
        end = time.monotonic() + seconds
        while time.monotonic() < end:
            self._check_cancelled()
            time.sleep(min(0.1, end - time.monotonic()))

    # ================================================================
    # 1. 智能题目推送
    # ================================================================

    def recommend_questions(self, count: int = 10) -> List[Dict]:
        """
        基于知识点掌握度智能推荐题目

        推荐策略（优先级从高到低）：
        1. 薄弱知识点下答错的题（掌握度 < 40%）
        2. 薄弱知识点下未答过的题
        3. 中等掌握度知识点（40%-70%）下答错的题
        4. 随机从未答过的题中抽取

        Args:
            count: 推荐题目数量

        Returns:
            推荐的题目列表，每项包含 question 和 recommend_reason
        """
        recommended: List[Dict] = []
        seen_ids = set()

        # 获取薄弱知识点
        weak_points = self.km.get_weak_points(threshold=40.0, limit=5)
        medium_points = self.km.get_weak_points(threshold=70.0, limit=10)
        # medium_points 包含 weak_points，需要排除
        medium_only = [kp for kp in medium_points if kp['mastery_level'] >= 40.0]

        # 策略1: 薄弱知识点下答错的题
        for kp in weak_points:
            if len(recommended) >= count:
                break
            suggestions = self.km.get_suggested_exercises(kp['id'])
            for q in suggestions:
                if q['id'] not in seen_ids and q.get('wrong_count', 0) > 0:
                    seen_ids.add(q['id'])
                    recommended.append({
                        'question': q,
                        'recommend_reason': f"薄弱知识点「{kp['name']}」(掌握度 {kp['mastery_level']}%) 的错题",
                        'knowledge_point': kp['name'],
                        'priority': 1,
                    })
                    if len(recommended) >= count:
                        break

        # 策略2: 薄弱知识点下未答过的题
        for kp in weak_points:
            if len(recommended) >= count:
                break
            suggestions = self.km.get_suggested_exercises(kp['id'])
            for q in suggestions:
                if q['id'] not in seen_ids and not q.get('wrong_count'):
                    seen_ids.add(q['id'])
                    recommended.append({
                        'question': q,
                        'recommend_reason': f"薄弱知识点「{kp['name']}」的未答题目",
                        'knowledge_point': kp['name'],
                        'priority': 2,
                    })
                    if len(recommended) >= count:
                        break

        # 策略3: 中等掌握度知识点下答错的题
        for kp in medium_only:
            if len(recommended) >= count:
                break
            suggestions = self.km.get_suggested_exercises(kp['id'])
            for q in suggestions:
                if q['id'] not in seen_ids and q.get('wrong_count', 0) > 0:
                    seen_ids.add(q['id'])
                    recommended.append({
                        'question': q,
                        'recommend_reason': f"知识点「{kp['name']}」(掌握度 {kp['mastery_level']}%) 的错题",
                        'knowledge_point': kp['name'],
                        'priority': 3,
                    })
                    if len(recommended) >= count:
                        break

        # 策略4: 随机补充未答过的题
        if len(recommended) < count:
            all_questions = self.question_dao.get_all()
            answered_ids = set()
            all_answers = self.answer_dao.get_all_answers(limit=10000)
            for ans in all_answers:
                answered_ids.add(ans['question_id'])

            for q in all_questions:
                if len(recommended) >= count:
                    break
                if q['id'] not in seen_ids and q['id'] not in answered_ids:
                    seen_ids.add(q['id'])
                    recommended.append({
                        'question': q,
                        'recommend_reason': "尚未练习的题目",
                        'knowledge_point': '',
                        'priority': 4,
                    })

        # 按优先级排序
        recommended.sort(key=lambda x: x['priority'])
        return recommended[:count]

    # ================================================================
    # 2. AI 题目生成
    # ================================================================

    def generate_questions(
        self,
        topic: str,
        count: int = 5,
        difficulty: str = 'medium',
        question_type: str = '单选题',
    ) -> List[Dict]:
        """
        调用 AI 围绕指定知识点生成新题目（带超时、重试、取消支持）

        Args:
            topic: 知识点/主题
            count: 生成数量
            difficulty: 难度 ('easy', 'medium', 'hard')
            question_type: 题型 ('单选题', '多选题', '判断题')

        Returns:
            解析后的题目列表

        Raises:
            AICancelledError: 用户取消操作
            AIServiceTimeoutError: 超时
            AIServiceError: 重试耗尽后仍然失败
        """
        self.reset_cancel()
        prompt = self._build_generate_prompt(topic, count, difficulty, question_type)
        messages = [
            AIMessage(role='system', content=self._get_generate_system_prompt()),
            AIMessage(role='user', content=prompt),
        ]

        def _call():
            return self.ai.chat(messages, temperature=0.8)

        response = self._call_with_optimizations(_call)
        return self._parse_generated_questions(response.content)

    def generate_questions_stream(
        self,
        topic: str,
        count: int = 5,
        difficulty: str = 'medium',
        question_type: str = '单选题',
    ) -> Generator[str, None, None]:
        """
        流式生成题目，用于 UI 实时显示（带超时、重试、取消支持）

        Yields:
            生成的内容片段

        Raises:
            AICancelledError: 用户取消操作
            AIServiceTimeoutError: 超时
            AIServiceError: 重试耗尽后仍然失败
        """
        self.reset_cancel()
        prompt = self._build_generate_prompt(topic, count, difficulty, question_type)
        messages = [
            AIMessage(role='system', content=self._get_generate_system_prompt()),
            AIMessage(role='user', content=prompt),
        ]

        def _gen_factory():
            return self.ai.chat_stream(messages, temperature=0.8)

        yield from self._stream_with_optimizations(_gen_factory)

    def _build_generate_prompt(
        self, topic: str, count: int, difficulty: str, question_type: str
    ) -> str:
        diff_map = {'easy': '简单', 'medium': '中等', 'hard': '困难'}
        diff_text = diff_map.get(difficulty, '中等')

        return (
            f"请围绕知识点「{topic}」生成 {count} 道{diff_text}难度的{question_type}。\n"
            "要求：\n"
            "1. 每道题严格按以下 JSON 格式输出，不要输出其他内容\n"
            "2. 题干要清晰准确，选项要有区分度\n"
            "3. 答案必须正确，解析要简明扼要\n\n"
            "输出格式（JSON 数组）：\n"
            "```json\n"
            "[\n"
            "  {\n"
            '    "stem": "题干内容",\n'
            '    "options": {"A": "选项A", "B": "选项B", "C": "选项C", "D": "选项D"},\n'
            '    "answer": "A",\n'
            '    "explanation": "解析内容",\n'
            '    "difficulty": 1\n'
            "  }\n"
            "]\n"
            "```\n"
            "difficulty 取值：0=简单, 1=中等, 2=困难\n"
            "只输出 JSON，不要输出其他文字。"
        )

    def _get_generate_system_prompt(self) -> str:
        return (
            "你是一个专业的考试题库生成助手。你生成的题目必须：\n"
            "1. 知识点准确，不出现事实性错误\n"
            "2. 题干表述清晰，无歧义\n"
            "3. 选项之间有明确区分度，干扰项要合理\n"
            "4. 答案必须正确\n"
            "5. 解析简明扼要，点出关键知识点\n"
            "请只输出 JSON 格式的题目数据。"
        )

    def _parse_generated_questions(self, content: str) -> List[Dict]:
        """从 AI 响应中解析题目列表"""
        questions = []

        # 尝试提取 JSON
        json_match = re.search(r'```(?:json)?\s*\n?([\s\S]*?)\n?```', content)
        if json_match:
            json_str = json_match.group(1)
        else:
            json_str = content

        try:
            items = json.loads(json_str.strip())
            if isinstance(items, list):
                for i, item in enumerate(items):
                    q = {
                        'number': i + 1,
                        'type': 'AI生成',
                        'stem': item.get('stem', ''),
                        'options': [],
                        'answer': item.get('answer', ''),
                        'explanation': item.get('explanation', ''),
                        'difficulty': item.get('difficulty', 1),
                        'tags': item.get('tags', []),
                        'source_file': 'AI生成',
                    }
                    # 转换选项格式
                    opts = item.get('options', {})
                    if isinstance(opts, dict):
                        for label in sorted(opts.keys()):
                            q['options'].append({
                                'label': label,
                                'text': opts[label],
                            })
                    elif isinstance(opts, list):
                        q['options'] = opts

                    if q['stem']:
                        questions.append(q)
        except (json.JSONDecodeError, TypeError) as e:
            logger.error(f"解析 AI 生成的题目失败: {e}")
            # 降级：尝试用正则提取
            questions = self._fallback_parse_questions(content)

        return questions

    def _fallback_parse_questions(self, content: str) -> List[Dict]:
        """降级解析：从非 JSON 格式的 AI 响应中提取题目"""
        questions = []
        # 简单匹配：数字. 题干 ... 答案: X
        blocks = re.split(r'\n\d+[\.\、]\s*', content)
        for i, block in enumerate(blocks[1:], 1):  # 跳过第一段（通常是说明文字）
            lines = block.strip().split('\n')
            if not lines:
                continue
            stem = lines[0].strip()
            options = []
            answer = ''
            explanation = ''
            for line in lines[1:]:
                line = line.strip()
                opt_match = re.match(r'^([A-D])[\.\、]\s*(.+)', line)
                if opt_match:
                    options.append({'label': opt_match.group(1), 'text': opt_match.group(2)})
                elif '答案' in line:
                    ans_match = re.search(r'答案[：:]\s*([A-D]+)', line)
                    if ans_match:
                        answer = ans_match.group(1)
                elif '解析' in line:
                    explanation = line.split('解析', 1)[-1].strip('：: ').strip()

            if stem:
                questions.append({
                    'number': i,
                    'type': 'AI生成',
                    'stem': stem,
                    'options': options,
                    'answer': answer,
                    'explanation': explanation,
                    'difficulty': 1,
                    'tags': [],
                    'source_file': 'AI生成',
                })

        return questions

    # ================================================================
    # 3. 智能解析生成
    # ================================================================

    def generate_explanation(self, question: Dict) -> str:
        """
        为单道题目生成解析（带超时、重试、取消支持）

        Args:
            question: 题目字典（需包含 stem, options, answer）

        Returns:
            生成的解析文本

        Raises:
            AICancelledError: 用户取消操作
            AIServiceTimeoutError: 超时
            AIServiceError: 重试耗尽后仍然失败
        """
        self.reset_cancel()
        prompt = self._build_explanation_prompt(question)
        messages = [
            AIMessage(role='system', content=(
                "你是一个专业的考试辅导老师。请为以下题目编写清晰的解析。\n"
                "要求：\n"
                "1. 先说明正确答案\n"
                "2. 解释为什么正确答案是正确的\n"
                "3. 简要说明其他选项为什么错误（如果是选择题）\n"
                "4. 点出涉及的知识点\n"
                "5. 控制在 100 字以内\n"
                "直接输出解析内容，不要加前缀。"
            )),
            AIMessage(role='user', content=prompt),
        ]

        def _call():
            return self.ai.chat(messages, temperature=0.3)

        response = self._call_with_optimizations(_call)
        return response.content.strip()

    def batch_generate_explanations(self, limit: int = 20) -> List[Dict]:
        """
        批量为缺少解析的题目生成解析

        Args:
            limit: 最多处理题目数

        Returns:
            处理结果列表 [{question_id, original_explanation, generated_explanation}]
        """
        questions = self.question_dao.get_all()
        no_explanation = [q for q in questions if not q.get('explanation', '').strip()]

        results = []
        for q in no_explanation[:limit]:
            try:
                generated = self.generate_explanation(q)
                results.append({
                    'question_id': q['id'],
                    'question_number': q['number'],
                    'original_explanation': q.get('explanation', ''),
                    'generated_explanation': generated,
                })
            except AIServiceError as e:
                logger.error(f"为题目 #{q['number']} 生成解析失败: {e}")
                results.append({
                    'question_id': q['id'],
                    'question_number': q['number'],
                    'error': str(e),
                })

        return results

    def _build_explanation_prompt(self, question: Dict) -> str:
        """构建解析生成提示"""
        parts = [f"题目：{question.get('stem', '')}"]

        options = question.get('options', [])
        if options:
            parts.append("\n选项：")
            for opt in options:
                if isinstance(opt, dict):
                    parts.append(f"  {opt.get('label', '')}. {opt.get('text', '')}")
                else:
                    parts.append(f"  {opt}")

        answer = question.get('answer', '')
        if answer:
            parts.append(f"\n正确答案：{answer}")

        return '\n'.join(parts)

    # ================================================================
    # 4. 知识点分析报告
    # ================================================================

    def generate_knowledge_report(self) -> str:
        """
        生成知识点学习分析报告（带超时、重试、取消支持）

        包含：
        - 整体学习概况
        - 各知识点掌握度排名
        - 薄弱知识点分析
        - 学习建议

        Returns:
            报告文本（Markdown 格式）

        Raises:
            AICancelledError: 用户取消操作
            AIServiceTimeoutError: 超时
            AIServiceError: 重试耗尽后仍然失败
        """
        self.reset_cancel()
        # 收集数据
        overall = self.stats.get_overall_stats()
        weak_points = self.km.get_weak_points(threshold=70.0, limit=10)
        all_mastery = self.km.calculate_all_mastery()
        knowledge_tree = self.km.get_knowledge_tree()

        # 构建上下文
        context = self._build_report_context(overall, weak_points, all_mastery, knowledge_tree)

        messages = [
            AIMessage(role='system', content=(
                "你是一个专业的学习分析师。请根据以下学习数据生成一份简洁的学习分析报告。\n"
                "报告要求：\n"
                "1. 使用 Markdown 格式\n"
                "2. 包含：学习概况、知识点掌握分析、薄弱环节、学习建议\n"
                "3. 语言简洁，重点突出\n"
                "4. 给出具体可操作的学习建议\n"
                "5. 控制在 500 字以内"
            )),
            AIMessage(role='user', content=f"以下是我的学习数据：\n\n{context}"),
        ]

        def _call():
            return self.ai.chat(messages, temperature=0.5)

        response = self._call_with_optimizations(_call)
        return response.content

    def generate_knowledge_report_stream(self) -> Generator[str, None, None]:
        """
        流式生成知识点分析报告（带超时、重试、取消支持）

        Yields:
            报告内容片段

        Raises:
            AICancelledError: 用户取消操作
            AIServiceTimeoutError: 超时
            AIServiceError: 重试耗尽后仍然失败
        """
        self.reset_cancel()
        overall = self.stats.get_overall_stats()
        weak_points = self.km.get_weak_points(threshold=70.0, limit=10)
        all_mastery = self.km.calculate_all_mastery()
        knowledge_tree = self.km.get_knowledge_tree()
        context = self._build_report_context(overall, weak_points, all_mastery, knowledge_tree)

        messages = [
            AIMessage(role='system', content=(
                "你是一个专业的学习分析师。请根据以下学习数据生成一份简洁的学习分析报告。\n"
                "使用 Markdown 格式，包含学习概况、知识点掌握分析、薄弱环节、学习建议。\n"
                "控制在 500 字以内。"
            )),
            AIMessage(role='user', content=f"以下是我的学习数据：\n\n{context}"),
        ]

        def _gen_factory():
            return self.ai.chat_stream(messages, temperature=0.5)

        yield from self._stream_with_optimizations(_gen_factory)

    def _build_report_context(
        self,
        overall: Dict,
        weak_points: List[Dict],
        all_mastery: Dict[int, float],
        knowledge_tree: List[Dict],
    ) -> str:
        """构建报告数据上下文"""
        lines = []

        # 总体数据
        lines.append(f"总题目数: {overall.get('total_questions', 0)}")
        lines.append(f"已答题数: {overall.get('total_answers', 0)}")
        lines.append(f"正确率: {overall.get('accuracy', 0):.1f}%")
        lines.append("")

        # 知识点掌握度
        lines.append("知识点掌握度：")
        sorted_mastery = sorted(all_mastery.items(), key=lambda x: x[1], reverse=True)
        for kp_id, mastery in sorted_mastery[:15]:
            kp = self.kp_dao.get_by_id(kp_id)
            name = kp['name'] if kp else f'知识点{kp_id}'
            lines.append(f"  - {name}: {mastery:.1f}%")
        lines.append("")

        # 薄弱知识点
        if weak_points:
            lines.append("薄弱知识点（掌握度 < 70%）：")
            for kp in weak_points:
                lines.append(
                    f"  - {kp['name']}: 掌握度 {kp['mastery_level']:.1f}%, "
                    f"关联题目 {kp.get('question_count', 0)} 道"
                )

        return '\n'.join(lines)

    # ================================================================
    # 辅助方法
    # ================================================================

    def save_generated_questions(
        self, questions: List[Dict], source_file: str = 'AI生成'
    ) -> int:
        """
        将 AI 生成的题目保存到数据库

        Args:
            questions: 题目列表
            source_file: 来源标记

        Returns:
            成功保存的题目数
        """
        saved = 0
        for q in questions:
            try:
                q['source_file'] = source_file
                self.question_dao.create(q)
                saved += 1
            except Exception as e:
                logger.error(f"保存题目失败: {e}")
        return saved

    def apply_generated_explanations(self, results: List[Dict]) -> int:
        """
        将 AI 生成的解析写回数据库

        Args:
            results: batch_generate_explanations 返回的结果列表

        Returns:
            成功更新的题目数
        """
        updated = 0
        for r in results:
            if 'error' in r:
                continue
            qid = r.get('question_id')
            explanation = r.get('generated_explanation', '')
            if qid and explanation:
                q = self.question_dao.get_by_id(qid)
                if q:
                    q['explanation'] = explanation
                    self.question_dao.update(qid, q)
                    updated += 1
        return updated
