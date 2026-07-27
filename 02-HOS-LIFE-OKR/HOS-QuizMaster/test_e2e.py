#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
端到端测试 - HOS-QuizMaster V2
验证核心功能的完整流程
"""

import json
import os
import sys
import tempfile
import unittest
from pathlib import Path

# 添加项目根目录到路径
_project_root = os.path.dirname(os.path.abspath(__file__))
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

from data.database import Database
from core.quiz_manager import QuizManager
from core.stats_analyzer import StatsAnalyzer


class TestE2E(unittest.TestCase):
    """端到端测试"""

    def setUp(self):
        """测试前准备：创建临时数据库"""
        self.temp_db = tempfile.NamedTemporaryFile(delete=False, suffix='.db')
        self.temp_db.close()
        
        self.database = Database(self.temp_db.name)
        self.quiz_manager = QuizManager()
        self.stats_analyzer = StatsAnalyzer(self.database)

    def tearDown(self):
        """测试后清理"""
        self.database.close()
        if os.path.exists(self.temp_db.name):
            os.unlink(self.temp_db.name)

    def test_01_database_initialization(self):
        """测试 1: 数据库初始化"""
        print("\n[端到端测试 1] 数据库初始化...")
        
        # 验证表已创建
        cursor = self.database.execute(
            "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
        )
        tables = [row[0] for row in cursor.fetchall()]
        
        expected_tables = ['questions', 'answers', 'knowledge_points', 
                          'question_knowledge', 'study_sessions']
        
        for table in expected_tables:
            self.assertIn(table, tables, f"表 {table} 应该存在")
        
        print(f"  ✓ 数据库表已创建: {', '.join(tables)}")

    def test_02_question_import(self):
        """测试 2: 题目导入"""
        print("\n[端到端测试 2] 题目导入...")
        
        # 准备测试题目
        questions = [
            {
                'number': 1,
                'type': '单选题',
                'stem': 'Python 是什么类型的语言？',
                'options': [
                    {'label': 'A', 'text': '编译型'},
                    {'label': 'B', 'text': '解释型'},
                    {'label': 'C', 'text': '汇编语言'},
                    {'label': 'D', 'text': '机器语言'},
                ],
                'answer': 'B',
                'explanation': 'Python 是解释型语言',
                'tags': ['Python', '基础'],
                'difficulty': 1,
                'source_file': 'test.md'
            },
            {
                'number': 2,
                'type': '多选题',
                'stem': '以下哪些是 Python 的数据类型？',
                'options': [
                    {'label': 'A', 'text': 'int'},
                    {'label': 'B', 'text': 'float'},
                    {'label': 'C', 'text': 'string'},
                    {'label': 'D', 'text': 'array'},
                ],
                'answer': 'ABC',
                'explanation': 'Python 有 int、float、str 等类型',
                'tags': ['Python', '数据类型'],
                'difficulty': 2,
                'source_file': 'test.md'
            }
        ]
        
        # 批量插入
        count = self.database.batch_insert_questions(questions)
        self.assertEqual(count, 2, "应该插入 2 道题目")
        
        # 验证插入成功
        result = self.database.execute('SELECT COUNT(*) FROM questions').fetchone()
        self.assertEqual(result[0], 2, "数据库中应该有 2 道题目")
        
        print(f"  ✓ 成功导入 {count} 道题目")

    def test_03_answer_recording(self):
        """测试 3: 答题记录保存"""
        print("\n[端到端测试 3] 答题记录保存...")
        
        # 先插入题目
        questions = [
            {
                'number': i,
                'type': '单选题',
                'stem': f'测试题目 {i}',
                'options': [
                    {'label': 'A', 'text': f'选项 A'},
                    {'label': 'B', 'text': f'选项 B'},
                ],
                'answer': 'A',
                'explanation': f'解析 {i}',
                'tags': ['测试'],
                'difficulty': 1,
                'source_file': 'test.md'
            }
            for i in range(1, 6)
        ]
        self.database.batch_insert_questions(questions)
        
        # 插入答题记录
        answers = [
            {'question_id': 1, 'selected_options': ['A'], 'is_correct': True},
            {'question_id': 2, 'selected_options': ['B'], 'is_correct': False},
            {'question_id': 3, 'selected_options': ['A'], 'is_correct': True},
            {'question_id': 4, 'selected_options': ['A'], 'is_correct': True},
            {'question_id': 5, 'selected_options': ['B'], 'is_correct': False},
        ]
        
        count = self.database.batch_insert_answers(answers)
        self.assertEqual(count, 5, "应该插入 5 条答题记录")
        
        # 验证插入成功
        result = self.database.execute('SELECT COUNT(*) FROM answers').fetchone()
        self.assertEqual(result[0], 5, "数据库中应该有 5 条答题记录")
        
        print(f"  ✓ 成功保存 {count} 条答题记录")

    def test_04_statistics_query(self):
        """测试 4: 统计查询"""
        print("\n[端到端测试 4] 统计查询...")
        
        # 插入测试数据
        questions = [
            {
                'number': i,
                'type': '单选题',
                'stem': f'测试题目 {i}',
                'options': [
                    {'label': 'A', 'text': f'选项 A'},
                    {'label': 'B', 'text': f'选项 B'},
                ],
                'answer': 'A',
                'explanation': f'解析 {i}',
                'tags': ['测试'],
                'difficulty': i % 3 + 1,
                'source_file': 'test.md'
            }
            for i in range(1, 11)
        ]
        self.database.batch_insert_questions(questions)
        
        # 插入答题记录（7 对 3 错）
        answers = [
            {'question_id': i, 'selected_options': ['A'], 'is_correct': i <= 7}
            for i in range(1, 11)
        ]
        self.database.batch_insert_answers(answers)
        
        # 获取快速统计
        stats = self.database.get_statistics_fast()
        
        self.assertEqual(stats['total_questions'], 10, "应该有 10 道题目")
        self.assertEqual(stats['total_answers'], 10, "应该有 10 条答题记录")
        self.assertEqual(stats['correct_answers'], 7, "应该有 7 条正确记录")
        self.assertAlmostEqual(stats['accuracy'], 0.7, places=2, 
                              msg="正确率应该是 70%")
        
        print(f"  ✓ 统计查询成功:")
        print(f"    - 总题目数: {stats['total_questions']}")
        print(f"    - 总答题数: {stats['total_answers']}")
        print(f"    - 正确数: {stats['correct_answers']}")
        print(f"    - 正确率: {stats['accuracy']:.2%}")

    def test_05_quiz_manager_integration(self):
        """测试 5: 刷题管理器集成"""
        print("\n[端到端测试 5] 刷题管理器集成...")
        
        # 插入题目
        questions = [
            {
                'number': i,
                'type': '单选题',
                'stem': f'测试题目 {i}',
                'options': [
                    {'label': 'A', 'text': f'选项 A'},
                    {'label': 'B', 'text': f'选项 B'},
                ],
                'answer': 'A',
                'explanation': f'解析 {i}',
                'tags': ['测试'],
                'difficulty': 1,
                'source_file': 'test.md'
            }
            for i in range(1, 6)
        ]
        self.database.batch_insert_questions(questions)
        
        # 从数据库加载题目到 QuizManager
        db_questions = self.database.execute('SELECT * FROM questions ORDER BY number').fetchall()
        quiz_questions = []
        for row in db_questions:
            quiz_questions.append({
                'number': row['number'],
                'type': row['type'],
                'stem': row['stem'],
                'options': json.loads(row['options']),
                'answer': row['answer'],
                'explanation': row['explanation'],
                'tags': json.loads(row['tags']) if row['tags'] else [],
                'difficulty': row['difficulty'],
            })
        
        self.quiz_manager.load_questions(quiz_questions)
        
        # 测试顺序模式
        self.quiz_manager.set_mode('sequential')
        question_list = self.quiz_manager.get_question_list()
        self.assertEqual(len(question_list), 5, "应该有 5 道题目")
        self.assertEqual(question_list, [0, 1, 2, 3, 4], "顺序模式应该是 0-4")
        
        # 测试随机模式
        self.quiz_manager.set_mode('random')
        random_list = self.quiz_manager.get_question_list()
        self.assertEqual(len(random_list), 5, "随机模式应该有 5 道题目")
        self.assertEqual(sorted(random_list), [0, 1, 2, 3, 4], "随机模式应该包含所有题目")
        
        print(f"  ✓ 刷题管理器集成成功")
        print(f"    - 顺序模式: {question_list}")
        print(f"    - 随机模式: {random_list}")

    def test_06_stats_analyzer_integration(self):
        """测试 6: 统计分析器集成"""
        print("\n[端到端测试 6] 统计分析器集成...")
        
        # 插入测试数据
        questions = [
            {
                'number': i,
                'type': '单选题' if i % 2 == 0 else '多选题',
                'stem': f'测试题目 {i}',
                'options': [
                    {'label': 'A', 'text': f'选项 A'},
                    {'label': 'B', 'text': f'选项 B'},
                ],
                'answer': 'A',
                'explanation': f'解析 {i}',
                'tags': ['测试'],
                'difficulty': (i % 3) + 1,
                'source_file': 'test.md'
            }
            for i in range(1, 11)
        ]
        self.database.batch_insert_questions(questions)
        
        answers = [
            {'question_id': i, 'selected_options': ['A'], 'is_correct': i <= 7}
            for i in range(1, 11)
        ]
        self.database.batch_insert_answers(answers)
        
        # 测试趋势分析
        trend = self.stats_analyzer.get_trend_analysis(period='all')
        self.assertIn('dates', trend, "趋势分析应该包含 dates")
        self.assertIn('accuracies', trend, "趋势分析应该包含 accuracies")
        
        # 测试题型分析
        type_result = self.stats_analyzer.get_question_type_analysis()
        self.assertIn('type_stats', type_result, "题型分析应该包含 type_stats")
        type_analysis = type_result['type_stats']
        self.assertIsInstance(type_analysis, list, "type_stats 应该是列表")
        self.assertTrue(len(type_analysis) > 0, "题型分析应该有数据")

        # 测试难度分析
        diff_result = self.stats_analyzer.get_difficulty_analysis()
        self.assertIn('difficulty_stats', diff_result, "难度分析应该包含 difficulty_stats")
        difficulty_analysis = diff_result['difficulty_stats']
        self.assertIsInstance(difficulty_analysis, list, "difficulty_stats 应该是列表")

        print(f"  ✓ 统计分析器集成成功")
        print(f"    - 趋势分析: {len(trend.get('dates', []))} 天")
        print(f"    - 题型分析: {len(type_analysis)} 种题型")
        print(f"    - 难度分析: {len(difficulty_analysis)} 个难度级别")

    def test_07_pagination_query(self):
        """测试 7: 分页查询"""
        print("\n[端到端测试 7] 分页查询...")
        
        # 插入 100 道题目
        questions = [
            {
                'number': i,
                'type': '单选题',
                'stem': f'测试题目 {i}',
                'options': [
                    {'label': 'A', 'text': f'选项 A'},
                    {'label': 'B', 'text': f'选项 B'},
                ],
                'answer': 'A',
                'explanation': f'解析 {i}',
                'tags': ['测试'],
                'difficulty': 1,
                'source_file': 'test.md'
            }
            for i in range(1, 101)
        ]
        self.database.batch_insert_questions(questions)
        
        # 测试分页查询
        page1 = self.database.get_questions_paginated(page=1, page_size=20)
        self.assertEqual(len(page1), 20, "第一页应该有 20 道题目")
        self.assertEqual(page1[0]['number'], 1, "第一题应该是第 1 题")
        
        page2 = self.database.get_questions_paginated(page=2, page_size=20)
        self.assertEqual(len(page2), 20, "第二页应该有 20 道题目")
        self.assertEqual(page2[0]['number'], 21, "第二页第一题应该是第 21 题")
        
        page5 = self.database.get_questions_paginated(page=5, page_size=20)
        self.assertEqual(len(page5), 20, "第五页应该有 20 道题目")
        
        print(f"  ✓ 分页查询成功")
        print(f"    - 第 1 页: {len(page1)} 道题目")
        print(f"    - 第 2 页: {len(page2)} 道题目")
        print(f"    - 第 5 页: {len(page5)} 道题目")

    def test_08_batch_query_optimization(self):
        """测试 8: 批量查询优化"""
        print("\n[端到端测试 8] 批量查询优化...")
        
        # 插入题目和答题记录
        questions = [
            {
                'number': i,
                'type': '单选题',
                'stem': f'测试题目 {i}',
                'options': [
                    {'label': 'A', 'text': f'选项 A'},
                    {'label': 'B', 'text': f'选项 B'},
                ],
                'answer': 'A',
                'explanation': f'解析 {i}',
                'tags': ['测试'],
                'difficulty': 1,
                'source_file': 'test.md'
            }
            for i in range(1, 51)
        ]
        self.database.batch_insert_questions(questions)
        
        answers = [
            {'question_id': i, 'selected_options': ['A'], 'is_correct': True}
            for i in range(1, 51)
        ]
        self.database.batch_insert_answers(answers)
        
        # 批量查询前 20 题的答题记录
        question_ids = list(range(1, 21))
        records = self.database.get_answers_by_question_ids(question_ids)
        
        self.assertEqual(len(records), 20, "应该查询到 20 条记录")
        
        print(f"  ✓ 批量查询成功: 查询到 {len(records)} 条记录")


if __name__ == '__main__':
    print("=" * 60)
    print("HOS-QuizMaster V2 端到端测试")
    print("=" * 60)
    
    # 运行测试
    unittest.main(verbosity=2)
