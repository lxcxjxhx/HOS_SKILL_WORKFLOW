#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
试卷生成器 - HOS-QuizMaster V2
Phase 6: 考试系统
"""

import random
from typing import List, Dict, Optional

from data.dao import QuestionDAO
from core.exam_paper import ExamPaper


class ExamGenerator:
    """
    试卷生成器
    
    支持多种组卷策略:
    - 按题型分布
    - 按知识点筛选
    - 按难度分布
    - 组合规则
    """
    
    def __init__(self, question_dao: QuestionDAO):
        """
        初始化生成器
        
        Args:
            question_dao: 题目数据访问对象
        """
        self.dao = question_dao
    
    def generate_by_type(self, type_counts: Dict[str, int]) -> List[Dict]:
        """
        按题型数量生成试卷
        
        Args:
            type_counts: 题型及对应数量，如 {"单选题": 20, "多选题": 10, "判断题": 20}
            
        Returns:
            题目列表（已随机排序）
            
        Raises:
            ValueError: 题库中某题型数量不足
        """
        all_questions = self.dao.get_all()
        selected = []
        
        for q_type, count in type_counts.items():
            if count <= 0:
                continue
            
            # 筛选该题型的题目
            pool = [q for q in all_questions if q.get('type') == q_type]
            
            if len(pool) < count:
                raise ValueError(
                    f"题库中 {q_type} 数量不足: 需要 {count} 题，仅有 {len(pool)} 题"
                )
            
            # 随机抽取
            sampled = random.sample(pool, count)
            selected.extend(sampled)
        
        # 打乱顺序
        random.shuffle(selected)
        return selected
    
    def generate_by_knowledge(self, knowledge_points: List[str], count: int) -> List[Dict]:
        """
        按知识点生成试卷
        
        Args:
            knowledge_points: 知识点名称列表
            count: 总题数
            
        Returns:
            题目列表（已随机排序）
            
        Raises:
            ValueError: 符合条件的题目数量不足
        """
        if not knowledge_points:
            raise ValueError("知识点列表不能为空")
        
        all_questions = self.dao.get_all()
        
        # 筛选包含指定知识点的题目
        pool = []
        for q in all_questions:
            q_tags = q.get('tags', [])
            # 检查题目标签是否包含任一指定知识点
            if any(kp in q_tags for kp in knowledge_points):
                pool.append(q)
        
        if len(pool) < count:
            raise ValueError(
                f"符合知识点条件的题目不足: 需要 {count} 题，仅有 {len(pool)} 题"
            )
        
        # 随机抽取
        selected = random.sample(pool, count)
        random.shuffle(selected)
        return selected
    
    def generate_by_difficulty(self, difficulty_dist: Dict[str, float], total: int) -> List[Dict]:
        """
        按难度分布生成试卷
        
        Args:
            difficulty_dist: 难度分布比例，如 {"简单": 0.3, "中等": 0.5, "困难": 0.2}
                比例之和应为 1.0
            total: 总题数
            
        Returns:
            题目列表（已随机排序）
            
        Raises:
            ValueError: 分布比例不合理或题目不足
        """
        # 验证比例
        total_ratio = sum(difficulty_dist.values())
        if abs(total_ratio - 1.0) > 0.01:
            raise ValueError(f"难度分布比例之和应为 1.0，当前为 {total_ratio}")
        
        all_questions = self.dao.get_all()
        
        # 按难度分组
        pools = {'简单': [], '中等': [], '困难': []}
        for q in all_questions:
            diff = q.get('difficulty', 0)
            label = self._difficulty_label(diff)
            if label in pools:
                pools[label].append(q)
        
        selected = []
        for diff_label, ratio in difficulty_dist.items():
            count = int(total * ratio)
            if count <= 0:
                continue
            
            pool = pools.get(diff_label, [])
            if len(pool) < count:
                raise ValueError(
                    f"难度为 {diff_label} 的题目不足: 需要 {count} 题，仅有 {len(pool)} 题"
                )
            
            sampled = random.sample(pool, count)
            selected.extend(sampled)
        
        # 如果因四舍五入导致题数不足，从最多的难度组补充
        while len(selected) < total:
            largest_pool = max(pools.values(), key=len)
            remaining = [q for q in largest_pool if q not in selected]
            if not remaining:
                break
            selected.append(random.choice(remaining))
        
        random.shuffle(selected)
        return selected[:total]
    
    def generate_composite(self, rules: Dict) -> List[Dict]:
        """
        组合规则生成试卷
        
        Args:
            rules: 组合规则字典，可包含:
                - type_counts: 题型分布 {"单选题": 20, ...}
                - knowledge_points: 知识点列表
                - difficulty_dist: 难度分布 {"简单": 0.3, ...}
                - total: 总题数（与 difficulty_dist 配合使用）
            
        Returns:
            题目列表（已随机排序）
            
        示例:
            rules = {
                "type_counts": {"单选题": 15, "多选题": 5},
                "knowledge_points": ["函数", "导数"],
                "difficulty_dist": {"简单": 0.4, "中等": 0.4, "困难": 0.2},
                "total": 20
            }
        """
        all_questions = self.dao.get_all()
        
        # 第一步：按知识点筛选（如果有）
        knowledge_points = rules.get('knowledge_points', [])
        if knowledge_points:
            pool = [
                q for q in all_questions
                if any(kp in q.get('tags', []) for kp in knowledge_points)
            ]
        else:
            pool = all_questions
        
        # 第二步：按难度分布筛选（如果有）
        difficulty_dist = rules.get('difficulty_dist')
        total = rules.get('total')
        if difficulty_dist and total:
            # 验证比例
            total_ratio = sum(difficulty_dist.values())
            if abs(total_ratio - 1.0) > 0.01:
                raise ValueError(f"难度分布比例之和应为 1.0，当前为 {total_ratio}")
            
            # 按难度分组
            diff_pools = {'简单': [], '中等': [], '困难': []}
            for q in pool:
                diff = q.get('difficulty', 0)
                label = self._difficulty_label(diff)
                if label in diff_pools:
                    diff_pools[label].append(q)
            
            filtered = []
            for diff_label, ratio in difficulty_dist.items():
                count = int(total * ratio)
                if count <= 0:
                    continue
                
                diff_pool = diff_pools.get(diff_label, [])
                if len(diff_pool) < count:
                    raise ValueError(
                        f"难度为 {diff_label} 的题目不足: 需要 {count} 题，仅有 {len(diff_pool)} 题"
                    )
                
                sampled = random.sample(diff_pool, count)
                filtered.extend(sampled)
            
            pool = filtered
        
        # 第三步：按题型分布筛选（如果有）
        type_counts = rules.get('type_counts', {})
        if type_counts:
            filtered = []
            for q_type, count in type_counts.items():
                if count <= 0:
                    continue
                
                type_pool = [q for q in pool if q.get('type') == q_type]
                if len(type_pool) < count:
                    raise ValueError(
                        f"题库中 {q_type} 数量不足: 需要 {count} 题，仅有 {len(type_pool)} 题"
                    )
                
                sampled = random.sample(type_pool, count)
                filtered.extend(sampled)
            
            pool = filtered
        
        random.shuffle(pool)
        return pool
    
    def create_exam_paper(
        self,
        questions: List[Dict],
        title: str = "模拟试卷",
        time_limit: int = 0,
        scoring_rules: Optional[Dict[str, int]] = None,
        metadata: Optional[Dict] = None,
    ) -> ExamPaper:
        """
        从题目列表创建试卷对象
        
        Args:
            questions: 题目列表
            title: 试卷标题
            time_limit: 考试时长（分钟），0 = 不限时
            scoring_rules: 评分规则
            metadata: 附加元数据
            
        Returns:
            ExamPaper 对象
        """
        return ExamPaper(
            title=title,
            questions=questions,
            time_limit=time_limit,
            scoring_rules=scoring_rules,
            metadata=metadata,
        )
    
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
        return '未标注'
