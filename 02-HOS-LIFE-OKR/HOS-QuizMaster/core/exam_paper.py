#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
试卷数据模型 - HOS-QuizMaster V2
Phase 6: 考试系统
"""

import json
from datetime import datetime
from typing import List, Dict, Optional


# 默认评分规则（每种题型的单题分值）
DEFAULT_SCORING = {
    '单选题': 1,
    '多选题': 2,
    '判断题': 1,
    '填空题': 2,
    '简答题': 5,
}


class ExamPaper:
    """
    表示一张生成的试卷。

    属性:
        title: 试卷标题
        questions: 题目列表（每个元素是带元信息的题目字典）
        total_score: 总分
        time_limit: 考试时长（分钟），0 表示不限时
        metadata: 附加元数据（生成规则、创建时间等）
        scoring_rules: 评分规则 {题型: 单题分值}
    """

    def __init__(
        self,
        title: str = "模拟试卷",
        questions: Optional[List[Dict]] = None,
        time_limit: int = 0,
        scoring_rules: Optional[Dict[str, int]] = None,
        metadata: Optional[Dict] = None,
    ):
        self.title = title
        self.questions: List[Dict] = questions or []
        self.time_limit = time_limit  # 分钟，0 = 不限时
        self.scoring_rules = dict(scoring_rules or DEFAULT_SCORING)
        self.metadata = metadata or {}
        self.metadata.setdefault('created_at', datetime.now().isoformat())
        self.metadata.setdefault('question_count', len(self.questions))

        # 用户答案 {题目索引: 选中的选项列表}
        self._answers: Dict[int, List[str]] = {}
        # 每道题的得分 {题目索引: 得分}
        self._scores: Dict[int, float] = {}

    # ========== 属性 ==========

    @property
    def total_score(self) -> int:
        """计算试卷总分"""
        total = 0
        for q in self.questions:
            q_type = q.get('type', '单选题')
            total += self.scoring_rules.get(q_type, 1)
        return total

    @property
    def user_score(self) -> float:
        """用户当前得分"""
        return sum(self._scores.values())

    @property
    def answered_count(self) -> int:
        """已答题数"""
        return len(self._answers)

    # ========== 答案与评分 ==========

    def set_answer(self, question_index: int, selected: List[str]):
        """
        设置某题的用户答案。

        Args:
            question_index: 题目在试卷中的索引
            selected: 用户选中的选项标签列表，如 ['A', 'C']
        """
        self._answers[question_index] = selected

    def get_answer(self, question_index: int) -> List[str]:
        """获取某题的用户答案"""
        return self._answers.get(question_index, [])

    def calculate_score(self, answers: Optional[Dict[int, List[str]]] = None,
                        partial_credit: bool = False) -> Dict:
        """
        计算成绩。

        Args:
            answers: 答案字典，若为 None 则使用已存储的 _answers
            partial_credit: 多选题是否启用部分给分
                （选对部分选项、无多选给对应比例分数）

        Returns:
            统计字典，包含 total_score, user_score, correct, incorrect,
            unanswered, accuracy, details
        """
        if answers is not None:
            self._answers = answers

        self._scores.clear()
        correct = 0
        incorrect = 0
        unanswered = 0
        details = []

        for idx, question in enumerate(self.questions):
            q_type = question.get('type', '单选题')
            max_score = self.scoring_rules.get(q_type, 1)
            user_ans = self._answers.get(idx, [])
            correct_ans = self._parse_correct_answer(question.get('answer', ''))

            if not user_ans:
                unanswered += 1
                score = 0.0
                is_correct = False
            elif q_type == '多选题' and partial_credit:
                # 部分给分：选对的选项数 / 正确选项数 * 满分，多选倒扣为 0
                correct_set = set(correct_ans)
                user_set = set(user_ans)
                extra = user_set - correct_set
                if extra:
                    score = 0.0
                    is_correct = False
                else:
                    hit = len(user_set & correct_set)
                    score = round(max_score * hit / max(len(correct_set), 1), 1)
                    is_correct = (user_set == correct_set)
            else:
                is_correct = (set(user_ans) == set(correct_ans))
                score = float(max_score) if is_correct else 0.0

            if is_correct:
                correct += 1
            elif user_ans:
                incorrect += 1

            self._scores[idx] = score
            details.append({
                'index': idx,
                'question_id': question.get('id'),
                'type': q_type,
                'max_score': max_score,
                'score': score,
                'is_correct': is_correct,
                'user_answer': user_ans,
                'correct_answer': correct_ans,
            })

        answered = correct + incorrect
        accuracy = (correct / answered * 100) if answered > 0 else 0.0

        return {
            'total_score': self.total_score,
            'user_score': sum(self._scores.values()),
            'correct': correct,
            'incorrect': incorrect,
            'unanswered': unanswered,
            'accuracy': accuracy,
            'details': details,
        }

    def get_statistics(self) -> Dict:
        """
        获取试卷统计信息（不依赖答案）。

        Returns:
            包含题型分布、难度分布、总分、题数等信息的字典
        """
        type_dist = {}
        difficulty_dist = {}
        for q in self.questions:
            t = q.get('type', '未知')
            type_dist[t] = type_dist.get(t, 0) + 1
            d = q.get('difficulty', 0)
            diff_label = self._difficulty_label(d)
            difficulty_dist[diff_label] = difficulty_dist.get(diff_label, 0) + 1

        return {
            'title': self.title,
            'question_count': len(self.questions),
            'total_score': self.total_score,
            'time_limit': self.time_limit,
            'type_distribution': type_dist,
            'difficulty_distribution': difficulty_dist,
            'scoring_rules': dict(self.scoring_rules),
        }

    # ========== 序列化 ==========

    def to_dict(self) -> Dict:
        """序列化为字典"""
        return {
            'title': self.title,
            'time_limit': self.time_limit,
            'scoring_rules': dict(self.scoring_rules),
            'metadata': dict(self.metadata),
            'questions': self.questions,
            'answers': {str(k): v for k, v in self._answers.items()},
            'scores': {str(k): v for k, v in self._scores.items()},
        }

    @classmethod
    def from_dict(cls, data: Dict) -> 'ExamPaper':
        """从字典反序列化"""
        paper = cls(
            title=data.get('title', '模拟试卷'),
            questions=data.get('questions', []),
            time_limit=data.get('time_limit', 0),
            scoring_rules=data.get('scoring_rules'),
            metadata=data.get('metadata'),
        )
        raw_answers = data.get('answers', {})
        paper._answers = {int(k): v for k, v in raw_answers.items()}
        raw_scores = data.get('scores', {})
        paper._scores = {int(k): v for k, v in raw_scores.items()}
        return paper

    def to_json(self) -> str:
        """序列化为 JSON 字符串"""
        return json.dumps(self.to_dict(), ensure_ascii=False, indent=2)

    @classmethod
    def from_json(cls, json_str: str) -> 'ExamPaper':
        """从 JSON 字符串反序列化"""
        return cls.from_dict(json.loads(json_str))

    # ========== 内部工具 ==========

    @staticmethod
    def _parse_correct_answer(answer) -> List[str]:
        """
        将各种格式的答案统一为标签列表。
        支持: "AB", "A,B", "A，B", ["A","B"], "正确"/"错误" 等。
        """
        if isinstance(answer, list):
            return [str(x).strip() for x in answer if str(x).strip()]
        if isinstance(answer, str):
            answer = answer.strip()
            if not answer:
                return []
            # 逗号分隔
            if ',' in answer or '，' in answer:
                parts = answer.replace('，', ',').split(',')
                return [p.strip() for p in parts if p.strip()]
            # 判断题
            if answer in ('正确', '对', '√', 'T', 'true'):
                return ['正确']
            if answer in ('错误', '错', '×', 'F', 'false'):
                return ['错误']
            # 连续字母 "ABCD"
            return [ch.strip() for ch in answer if ch.strip()]
        return []

    @staticmethod
    def _difficulty_label(difficulty) -> str:
        """将难度数值转为文字标签"""
        if isinstance(difficulty, (int, float)):
            if difficulty <= 1:
                return '简单'
            elif difficulty <= 2:
                return '中等'
            else:
                return '困难'
        return str(difficulty) if difficulty else '未标注'

    def __repr__(self):
        return (f"ExamPaper(title={self.title!r}, "
                f"questions={len(self.questions)}, "
                f"total_score={self.total_score})")
