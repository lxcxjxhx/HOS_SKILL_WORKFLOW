#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数据库性能测试 - HOS-QuizMaster V2
Phase 15.2: SubTask 1.4

验证大数据量下的查询性能
"""

import os
import sys
import time
import tempfile
import unittest
from pathlib import Path

# 添加项目根目录到路径
_project_root = os.path.dirname(os.path.abspath(__file__))
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

from data.database import Database


class TestDatabasePerformance(unittest.TestCase):
    """数据库性能测试"""

    def setUp(self):
        """测试前准备：创建临时数据库并插入大量测试数据"""
        # 创建临时数据库
        self.temp_db = tempfile.NamedTemporaryFile(delete=False, suffix='.db')
        self.temp_db.close()
        
        self.database = Database(self.temp_db.name)
        
        # 插入 1000+ 道测试题目
        print("\n[性能测试] 正在插入 1200 道测试题目...")
        questions = []
        for i in range(1, 1201):
            questions.append({
                'number': i,
                'type': '单选题' if i % 3 != 0 else '多选题',
                'stem': f'这是第 {i} 道测试题目的题干内容',
                'options': [
                    {'label': 'A', 'text': f'选项 A {i}'},
                    {'label': 'B', 'text': f'选项 B {i}'},
                    {'label': 'C', 'text': f'选项 C {i}'},
                    {'label': 'D', 'text': f'选项 D {i}'},
                ],
                'answer': 'A' if i % 3 != 0 else 'AB',
                'explanation': f'这是第 {i} 道题的解析',
                'tags': ['测试', '性能'],
                'difficulty': i % 3,
                'source_file': 'test.md'
            })
        
        start_time = time.time()
        count = self.database.batch_insert_questions(questions)
        insert_time = time.time() - start_time
        print(f"[性能测试] 插入 {count} 道题目耗时: {insert_time*1000:.2f}ms")
        
        # 插入 5000+ 条答题记录
        print("[性能测试] 正在插入 5000 条答题记录...")
        answers = []
        for i in range(1, 5001):
            answers.append({
                'question_id': (i % 1200) + 1,
                'selected_options': ['A'],
                'is_correct': i % 2 == 0,
            })
        
        start_time = time.time()
        count = self.database.batch_insert_answers(answers)
        insert_time = time.time() - start_time
        print(f"[性能测试] 插入 {count} 条答题记录耗时: {insert_time*1000:.2f}ms")

    def tearDown(self):
        """测试后清理"""
        self.database.close()
        if os.path.exists(self.temp_db.name):
            os.unlink(self.temp_db.name)

    def test_01_question_list_query(self):
        """测试 1: 题目列表查询性能（应 < 100ms）"""
        print("\n[性能测试 1] 题目列表查询...")
        
        # 查询所有题目
        query = "SELECT * FROM questions ORDER BY number"
        exec_time = self.database.measure_query_time(query)
        
        print(f"  查询耗时: {exec_time:.2f}ms")
        self.assertLess(exec_time, 100, f"题目列表查询应 < 100ms，实际: {exec_time:.2f}ms")
        print("  ✓ 性能达标")

    def test_02_paginated_query(self):
        """测试 2: 分页查询性能（应 < 50ms）"""
        print("\n[性能测试 2] 分页查询...")
        
        # 分页查询
        query = "SELECT * FROM questions ORDER BY number LIMIT 50 OFFSET 500"
        exec_time = self.database.measure_query_time(query)
        
        print(f"  查询耗时: {exec_time:.2f}ms")
        self.assertLess(exec_time, 50, f"分页查询应 < 50ms，实际: {exec_time:.2f}ms")
        print("  ✓ 性能达标")

    def test_03_answer_stats_query(self):
        """测试 3: 答题统计查询性能（应 < 200ms）"""
        print("\n[性能测试 3] 答题统计查询...")
        
        # 统计查询
        query = """
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
            FROM answers
        """
        exec_time = self.database.measure_query_time(query)
        
        print(f"  查询耗时: {exec_time:.2f}ms")
        self.assertLess(exec_time, 200, f"统计查询应 < 200ms，实际: {exec_time:.2f}ms")
        print("  ✓ 性能达标")

    def test_04_batch_answer_query(self):
        """测试 4: 批量答题记录查询性能（应 < 100ms）"""
        print("\n[性能测试 4] 批量答题记录查询...")
        
        # 批量查询特定题目的答题记录
        question_ids = list(range(1, 101))  # 查询前 100 题的答题记录
        start_time = time.time()
        records = self.database.get_answers_by_question_ids(question_ids)
        exec_time = (time.time() - start_time) * 1000
        
        print(f"  查询耗时: {exec_time:.2f}ms")
        print(f"  查询到 {len(records)} 条记录")
        self.assertLess(exec_time, 100, f"批量查询应 < 100ms，实际: {exec_time:.2f}ms")
        print("  ✓ 性能达标")

    def test_05_fast_statistics(self):
        """测试 5: 快速统计接口性能（应 < 50ms）"""
        print("\n[性能测试 5] 快速统计接口...")
        
        start_time = time.time()
        stats = self.database.get_statistics_fast()
        exec_time = (time.time() - start_time) * 1000
        
        print(f"  查询耗时: {exec_time:.2f}ms")
        print(f"  统计结果: {stats}")
        self.assertLess(exec_time, 50, f"快速统计应 < 50ms，实际: {exec_time:.2f}ms")
        self.assertIn('total_questions', stats)
        self.assertIn('accuracy', stats)
        print("  ✓ 性能达标")


if __name__ == '__main__':
    print("=" * 60)
    print("HOS-QuizMaster V2 数据库性能测试")
    print("=" * 60)
    
    # 运行测试
    unittest.main(verbosity=2)
