#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
知识点管理器 - HOS-QuizMaster V2
Phase 7: 知识点管理系统

负责：
- 从题目中自动提取知识点
- 知识点层级结构管理（父子关系）
- 知识点掌握度计算
- 知识点关联分析
"""

import re
import math
from typing import List, Dict, Optional, Tuple, Set
from datetime import datetime, timedelta
from collections import defaultdict

from data.database import Database
from data.dao import QuestionDAO, AnswerDAO, KnowledgePointDAO


class KnowledgeManager:
    """
    知识点管理器
    
    核心功能：
    1. 知识点提取：从题目标签、题干、解析中自动提取知识点
    2. 层级结构管理：支持父子关系的知识点树
    3. 掌握度计算：基于正确率、答题次数、时间衰减的综合算法
    4. 关联分析：分析知识点之间的共现关系
    """
    
    def __init__(self, db: Database):
        """
        初始化知识点管理器
        
        Args:
            db: 数据库实例
        """
        self.db = db
        self.question_dao = QuestionDAO(db)
        self.answer_dao = AnswerDAO(db)
        self.kp_dao = KnowledgePointDAO(db)
        
        # 预定义的知识领域关键词库（用于自动提取）
        self._keyword_patterns: Dict[str, List[str]] = {}
        self._init_keyword_patterns()
    
    def _init_keyword_patterns(self):
        """初始化关键词模式库，用于从题目文本中提取知识点"""
        # 默认关键词库，可根据实际题库内容扩展
        self._keyword_patterns = {
            '基础概念': ['定义', '概念', '原理', '基本', '基础', '概述'],
            '法规标准': ['法规', '标准', '规范', '条例', '规定', '要求'],
            '操作流程': ['流程', '步骤', '程序', '操作', '步骤', '顺序'],
            '安全管理': ['安全', '风险', '隐患', '事故', '应急', '防护'],
            '技术方法': ['技术', '方法', '工艺', '设备', '工具', '仪器'],
            '计算分析': ['计算', '公式', '分析', '评估', '测量', '数据'],
        }
    
    # ========== 知识点提取 ==========
    
    def extract_knowledge_points(self, question: Dict) -> List[str]:
        """
        从题目中提取知识点
        
        提取策略（优先级从高到低）：
        1. 题目标签（tags 字段）
        2. 题干中的关键词匹配
        3. 解析中的关键词匹配
        
        Args:
            question: 题目字典，包含 tags, stem, explanation 等字段
            
        Returns:
            提取到的知识点名称列表（去重）
        """
        extracted = set()
        
        # 策略1：从标签中提取
        tags = question.get('tags', [])
        if tags:
            for tag in tags:
                tag_str = str(tag).strip()
                if tag_str:
                    extracted.add(tag_str)
        
        # 策略2：从题干中提取关键词
        stem = question.get('stem', '')
        if stem:
            stem_kps = self._extract_from_text(stem)
            extracted.update(stem_kps)
        
        # 策略3：从解析中提取关键词
        explanation = question.get('explanation', '')
        if explanation:
            expl_kps = self._extract_from_text(explanation)
            extracted.update(expl_kps)
        
        return list(extracted)
    
    def _extract_from_text(self, text: str) -> List[str]:
        """
        从文本中提取知识点（基于关键词匹配）
        
        Args:
            text: 待分析文本
            
        Returns:
            匹配到的知识点名称列表
        """
        matched = set()
        text_lower = text.lower()
        
        for category, keywords in self._keyword_patterns.items():
            for keyword in keywords:
                if keyword in text_lower:
                    matched.add(category)
                    break
        
        return list(matched)
    
    def auto_link_questions(self) -> int:
        """
        自动为所有题目关联知识点
        
        遍历所有题目，提取知识点并建立关联关系。
        如果知识点不存在则自动创建。
        
        Returns:
            新建的关联数量
        """
        questions = self.question_dao.get_all()
        link_count = 0
        
        for question in questions:
            kp_names = self.extract_knowledge_points(question)
            question_id = question['id']
            
            for kp_name in kp_names:
                # 查找或创建知识点
                kp = self.kp_dao.get_by_name(kp_name)
                if not kp:
                    kp_id = self.kp_dao.create(name=kp_name)
                else:
                    kp_id = kp['id']
                
                # 建立关联（忽略重复）
                if self.kp_dao.link_question(question_id, kp_id):
                    link_count += 1
        
        return link_count
    
    # ========== 层级结构管理 ==========
    
    def create_hierarchy(self, parent_name: str, child_name: str) -> Tuple[int, int]:
        """
        创建父子知识点关系
        
        Args:
            parent_name: 父知识点名称
            child_name: 子知识点名称
            
        Returns:
            (parent_id, child_id) 元组
        """
        # 查找或创建父知识点
        parent = self.kp_dao.get_by_name(parent_name)
        if not parent:
            parent_id = self.kp_dao.create(name=parent_name)
        else:
            parent_id = parent['id']
        
        # 查找或创建子知识点
        child = self.kp_dao.get_by_name(child_name)
        if not child:
            child_id = self.kp_dao.create(name=child_name, parent_id=parent_id)
        else:
            child_id = child['id']
            # 更新父关系
            self.db.execute(
                'UPDATE knowledge_points SET parent_id = ? WHERE id = ?',
                (parent_id, child_id)
            )
            self.db.commit()
        
        return (parent_id, child_id)
    
    def get_knowledge_tree(self) -> List[Dict]:
        """
        获取完整的知识点树结构
        
        Returns:
            树形结构的知识点列表，每个节点包含 children 字段
        """
        all_kps = self.kp_dao.get_all()
        
        # 构建 ID -> 节点 映射
        kp_map = {}
        for kp in all_kps:
            kp['children'] = []
            kp['mastery_level'] = self.calculate_mastery(kp['id'])
            kp_map[kp['id']] = kp
        
        # 构建树
        roots = []
        for kp in all_kps:
            parent_id = kp.get('parent_id')
            if parent_id and parent_id in kp_map:
                kp_map[parent_id]['children'].append(kp)
            else:
                roots.append(kp)
        
        return roots
    
    def get_descendants(self, knowledge_point_id: int) -> List[Dict]:
        """
        获取知识点的所有后代（递归）
        
        Args:
            knowledge_point_id: 知识点 ID
            
        Returns:
            所有后代知识点列表
        """
        descendants = []
        children = self.kp_dao.get_children(knowledge_point_id)
        
        for child in children:
            descendants.append(child)
            descendants.extend(self.get_descendants(child['id']))
        
        return descendants
    
    # ========== 掌握度计算 ==========
    
    def calculate_mastery(self, knowledge_point_id: int) -> float:
        """
        计算单个知识点的掌握度
        
        算法：
        mastery = base_accuracy * weight_accuracy + recency_score * weight_recency + volume_score * weight_volume
        
        其中：
        - base_accuracy: 基础正确率（0-100）
        - recency_score: 最近答题表现分（考虑时间衰减）
        - volume_score: 答题量分（答题越多越稳定）
        
        Args:
            knowledge_point_id: 知识点 ID
            
        Returns:
            掌握度百分比（0-100）
        """
        # 获取该知识点关联的所有题目
        question_ids = self._get_knowledge_question_ids(knowledge_point_id)
        
        if not question_ids:
            return 0.0
        
        # 收集所有答题记录
        total_answers = 0
        correct_answers = 0
        recent_correct = 0
        recent_total = 0
        
        now = datetime.now()
        
        for qid in question_ids:
            answers = self.answer_dao.get_answers_for_question(qid)
            for ans in answers:
                total_answers += 1
                if ans['is_correct']:
                    correct_answers += 1
                
                # 最近7天的答题情况
                answered_at = ans.get('answered_at', '')
                if answered_at:
                    try:
                        ans_time = datetime.fromisoformat(str(answered_at))
                        days_ago = (now - ans_time).days
                        if days_ago <= 7:
                            recent_total += 1
                            if ans['is_correct']:
                                recent_correct += 1
                    except (ValueError, TypeError):
                        pass
        
        if total_answers == 0:
            return 0.0
        
        # 基础正确率（权重 0.5）
        base_accuracy = (correct_answers / total_answers) * 100
        
        # 最近表现分（权重 0.3）
        if recent_total > 0:
            recency_score = (recent_correct / recent_total) * 100
        else:
            recency_score = base_accuracy  # 无近期数据则用总体
        
        # 答题量分（权重 0.2）- 答题越多，掌握越稳定
        # 使用对数函数，10题以上趋于满分
        volume_score = min(100, (math.log(total_answers + 1) / math.log(11)) * 100)
        
        # 综合计算
        mastery = (
            base_accuracy * 0.5 +
            recency_score * 0.3 +
            volume_score * 0.2
        )
        
        return round(min(100.0, max(0.0, mastery)), 1)
    
    def calculate_all_mastery(self) -> Dict[int, float]:
        """
        计算所有知识点的掌握度
        
        Returns:
            {知识点ID: 掌握度} 字典
        """
        all_kps = self.kp_dao.get_all()
        result = {}
        
        for kp in all_kps:
            result[kp['id']] = self.calculate_mastery(kp['id'])
        
        return result
    
    def get_weak_points(self, threshold: float = 60.0, limit: int = 10) -> List[Dict]:
        """
        获取薄弱知识点列表
        
        Args:
            threshold: 掌握度阈值，低于此值视为薄弱
            limit: 最多返回数量
            
        Returns:
            薄弱知识点列表，按掌握度升序排列
        """
        all_mastery = self.calculate_all_mastery()
        
        weak = []
        for kp_id, mastery in all_mastery.items():
            if mastery < threshold:
                kp = self.kp_dao.get_by_id(kp_id)
                if kp:
                    kp['mastery_level'] = mastery
                    # 获取关联题目数
                    qids = self._get_knowledge_question_ids(kp_id)
                    kp['question_count'] = len(qids)
                    weak.append(kp)
        
        # 按掌握度升序排列
        weak.sort(key=lambda x: x['mastery_level'])
        
        return weak[:limit]
    
    def get_suggested_exercises(self, knowledge_point_id: int) -> List[Dict]:
        """
        获取针对某知识点的练习建议（推荐题目）
        
        优先推荐：
        1. 该知识点下答错的题目
        2. 该知识点下未答过的题目
        3. 该知识点下最近答错的题目
        
        Args:
            knowledge_point_id: 知识点 ID
            
        Returns:
            推荐练习的题目列表
        """
        question_ids = self._get_knowledge_question_ids(knowledge_point_id)
        if not question_ids:
            return []
        
        wrong_questions = []  # 答错的题
        unanswered = []       # 未答的题
        
        for qid in question_ids:
            answers = self.answer_dao.get_answers_for_question(qid)
            if not answers:
                # 未答过
                q = self.question_dao.get_by_id(qid)
                if q:
                    unanswered.append(q)
            else:
                # 检查是否有答错
                latest = answers[0]  # 最新记录（已按时间降序）
                if not latest['is_correct']:
                    q = self.question_dao.get_by_id(qid)
                    if q:
                        q['wrong_count'] = sum(1 for a in answers if not a['is_correct'])
                        q['total_attempts'] = len(answers)
                        wrong_questions.append(q)
        
        # 排序：答错的按错误次数降序，未答的按题号升序
        wrong_questions.sort(key=lambda x: x.get('wrong_count', 0), reverse=True)
        unanswered.sort(key=lambda x: x.get('number', 0))
        
        # 合并推荐列表（错题优先）
        suggested = wrong_questions + unanswered
        return suggested[:20]  # 最多返回20题
    
    # ========== 关联分析 ==========
    
    def analyze_correlations(self, min_cooccurrence: int = 2) -> List[Dict]:
        """
        分析知识点之间的关联（共现分析）
        
        如果两道题共享同一个知识点，则这两个知识点存在关联。
        关联强度由共现次数决定。
        
        Args:
            min_cooccurrence: 最小共现次数阈值
            
        Returns:
            关联列表，每项包含 {kp1_id, kp1_name, kp2_id, kp2_name, strength}
        """
        all_kps = self.kp_dao.get_all()
        if len(all_kps) < 2:
            return []
        
        # 构建 知识点 -> 题目集合 映射
        kp_to_questions: Dict[int, Set[int]] = {}
        for kp in all_kps:
            qids = set(self._get_knowledge_question_ids(kp['id']))
            if qids:
                kp_to_questions[kp['id']] = qids
        
        # 计算两两共现次数
        correlations = []
        kp_ids = list(kp_to_questions.keys())
        
        for i in range(len(kp_ids)):
            for j in range(i + 1, len(kp_ids)):
                id1 = kp_ids[i]
                id2 = kp_ids[j]
                
                # 共现题目数
                common = kp_to_questions[id1] & kp_to_questions[id2]
                strength = len(common)
                
                if strength >= min_cooccurrence:
                    kp1 = self.kp_dao.get_by_id(id1)
                    kp2 = self.kp_dao.get_by_id(id2)
                    correlations.append({
                        'kp1_id': id1,
                        'kp1_name': kp1['name'] if kp1 else f'KP_{id1}',
                        'kp2_id': id2,
                        'kp2_name': kp2['name'] if kp2 else f'KP_{id2}',
                        'strength': strength,
                        'common_questions': list(common)
                    })
        
        # 按关联强度降序排列
        correlations.sort(key=lambda x: x['strength'], reverse=True)
        
        return correlations
    
    def get_correlation_matrix(self) -> Tuple[List[str], List[List[int]]]:
        """
        获取知识点关联矩阵（用于热力图）
        
        Returns:
            (知识点名称列表, 关联矩阵) 元组
            矩阵中 matrix[i][j] 表示知识点 i 和 j 的共现题目数
        """
        all_kps = self.kp_dao.get_all()
        
        if not all_kps:
            return ([], [])
        
        # 限制最多取前20个知识点（避免矩阵过大）
        kps = all_kps[:20]
        names = [kp['name'] for kp in kps]
        n = len(names)
        
        # 构建 知识点 -> 题目集合
        kp_to_questions = {}
        for kp in kps:
            qids = set(self._get_knowledge_question_ids(kp['id']))
            kp_to_questions[kp['id']] = qids
        
        # 计算矩阵
        matrix = [[0] * n for _ in range(n)]
        kp_ids = [kp['id'] for kp in kps]
        
        for i in range(n):
            matrix[i][i] = len(kp_to_questions[kp_ids[i]])  # 对角线 = 题目数
            for j in range(i + 1, n):
                common = len(kp_to_questions[kp_ids[i]] & kp_to_questions[kp_ids[j]])
                matrix[i][j] = common
                matrix[j][i] = common
        
        return (names, matrix)
    
    # ========== 辅助方法 ==========
    
    def _get_knowledge_question_ids(self, knowledge_point_id: int) -> List[int]:
        """
        获取某知识点关联的所有题目 ID
        
        Args:
            knowledge_point_id: 知识点 ID
            
        Returns:
            题目 ID 列表
        """
        cursor = self.db.execute('''
            SELECT question_id FROM question_knowledge
            WHERE knowledge_point_id = ?
        ''', (knowledge_point_id,))
        
        return [row['question_id'] for row in cursor.fetchall()]
    
    def get_knowledge_stats(self, knowledge_point_id: int) -> Dict:
        """
        获取某知识点的详细统计信息
        
        Args:
            knowledge_point_id: 知识点 ID
            
        Returns:
            统计信息字典
        """
        question_ids = self._get_knowledge_question_ids(knowledge_point_id)
        
        total_questions = len(question_ids)
        total_answers = 0
        correct_answers = 0
        answered_questions = 0
        
        for qid in question_ids:
            answers = self.answer_dao.get_answers_for_question(qid)
            if answers:
                answered_questions += 1
                total_answers += len(answers)
                # 以最新一次答题为准
                if answers[0]['is_correct']:
                    correct_answers += 1
        
        accuracy = (correct_answers / answered_questions * 100) if answered_questions > 0 else 0
        mastery = self.calculate_mastery(knowledge_point_id)
        
        return {
            'total_questions': total_questions,
            'answered_questions': answered_questions,
            'total_answers': total_answers,
            'correct_answers': correct_answers,
            'accuracy': round(accuracy, 1),
            'mastery': mastery
        }
    
    def set_keyword_patterns(self, patterns: Dict[str, List[str]]):
        """
        设置自定义关键词模式库
        
        Args:
            patterns: {知识点类别: [关键词列表]} 字典
        """
        self._keyword_patterns = patterns
    
    def add_keyword_pattern(self, category: str, keywords: List[str]):
        """
        添加关键词模式
        
        Args:
            category: 知识点类别
            keywords: 关键词列表
        """
        if category in self._keyword_patterns:
            self._keyword_patterns[category].extend(keywords)
        else:
            self._keyword_patterns[category] = keywords
