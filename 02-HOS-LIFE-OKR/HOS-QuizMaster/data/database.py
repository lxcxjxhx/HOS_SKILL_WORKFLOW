#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SQLite 数据库管理模块 - Phase 15 性能优化版
"""

import sqlite3
import json
import time
import threading
from pathlib import Path
from typing import Optional, List, Dict, Any
from contextlib import contextmanager


class Database:
    """SQLite 数据库管理类（支持连接池和批量操作）"""
    
    def __init__(self, db_path: Optional[str] = None):
        """
        初始化数据库连接
        
        Args:
            db_path: 数据库文件路径，默认为 data/quizmaster.db
        """
        if db_path is None:
            db_path = str(Path(__file__).parent / 'quizmaster.db')
        
        self.db_path = db_path
        self._local = threading.local()
        self._create_tables()
    
    @property
    def conn(self) -> sqlite3.Connection:
        """获取当前线程的数据库连接（连接池）"""
        if not hasattr(self._local, 'conn') or self._local.conn is None:
            self._local.conn = sqlite3.connect(self.db_path, timeout=30)
            self._local.conn.row_factory = sqlite3.Row
            # 启用 WAL 模式提升并发性能
            self._local.conn.execute('PRAGMA journal_mode=WAL')
            # 优化缓存大小
            self._local.conn.execute('PRAGMA cache_size=10000')
            # 优化同步设置
            self._local.conn.execute('PRAGMA synchronous=NORMAL')
        return self._local.conn
    
    def _create_tables(self):
        """创建数据库表结构"""
        cursor = self.conn.cursor()
        
        # 题目表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                number INTEGER NOT NULL,
                type TEXT NOT NULL,
                stem TEXT NOT NULL,
                options TEXT NOT NULL,
                answer TEXT NOT NULL,
                explanation TEXT,
                tags TEXT,
                difficulty INTEGER DEFAULT 0,
                source_file TEXT
            )
        ''')
        
        # 答题记录表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS answers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                question_id INTEGER NOT NULL,
                selected_options TEXT NOT NULL,
                is_correct INTEGER NOT NULL,
                answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (question_id) REFERENCES questions(id)
            )
        ''')
        
        # 知识点表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS knowledge_points (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                parent_id INTEGER,
                description TEXT,
                FOREIGN KEY (parent_id) REFERENCES knowledge_points(id)
            )
        ''')
        
        # 题目 - 知识点关联表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS question_knowledge (
                question_id INTEGER NOT NULL,
                knowledge_point_id INTEGER NOT NULL,
                PRIMARY KEY (question_id, knowledge_point_id),
                FOREIGN KEY (question_id) REFERENCES questions(id),
                FOREIGN KEY (knowledge_point_id) REFERENCES knowledge_points(id)
            )
        ''')
        
        # 学习会话表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS study_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                end_time TIMESTAMP,
                mode TEXT NOT NULL,
                stats TEXT
            )
        ''')
        
        # 创建索引以优化查询性能
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_questions_number ON questions(number)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_answers_is_correct ON answers(is_correct)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_answers_answered_at ON answers(answered_at)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_knowledge_points_name ON knowledge_points(name)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_knowledge_points_parent_id ON knowledge_points(parent_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_question_knowledge_question_id ON question_knowledge(question_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_question_knowledge_kp_id ON question_knowledge(knowledge_point_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_study_sessions_start_time ON study_sessions(start_time)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_study_sessions_mode ON study_sessions(mode)')
        
        self.conn.commit()
    
    def execute(self, query: str, params: tuple = ()) -> sqlite3.Cursor:
        """执行 SQL 查询"""
        cursor = self.conn.cursor()
        cursor.execute(query, params)
        return cursor
    
    def execute_many(self, query: str, params_list: List[tuple]) -> sqlite3.Cursor:
        """
        批量执行 SQL 查询（性能优化）
        
        Args:
            query: SQL 查询语句
            params_list: 参数列表
            
        Returns:
            游标对象
        """
        cursor = self.conn.cursor()
        cursor.executemany(query, params_list)
        return cursor
    
    @contextmanager
    def transaction(self):
        """
        事务上下文管理器
        
        Usage:
            with db.transaction():
                db.execute("INSERT ...")
                db.execute("UPDATE ...")
        """
        try:
            yield
            self.conn.commit()
        except Exception as e:
            self.conn.rollback()
            raise e
    
    def batch_insert_questions(self, questions: List[Dict[str, Any]]) -> int:
        """
        批量插入题目（性能优化）
        
        Args:
            questions: 题目列表
            
        Returns:
            插入的题目数量
        """
        if not questions:
            return 0
        
        sql = '''
            INSERT INTO questions (number, type, stem, options, answer, explanation, tags, difficulty, source_file)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        '''
        
        params_list = [
            (
                q.get('number'),
                q.get('type'),
                q.get('stem'),
                json.dumps(q.get('options', []), ensure_ascii=False),
                q.get('answer'),
                q.get('explanation'),
                json.dumps(q.get('tags', []), ensure_ascii=False),
                q.get('difficulty', 0),
                q.get('source_file')
            )
            for q in questions
        ]
        
        with self.transaction():
            self.execute_many(sql, params_list)
        
        return len(questions)
    
    def batch_insert_answers(self, answers: List[Dict[str, Any]]) -> int:
        """
        批量插入答题记录（性能优化）
        
        Args:
            answers: 答题记录列表
            
        Returns:
            插入的记录数量
        """
        if not answers:
            return 0
        
        sql = '''
            INSERT INTO answers (question_id, selected_options, is_correct)
            VALUES (?, ?, ?)
        '''
        
        params_list = [
            (
                a.get('question_id'),
                json.dumps(a.get('selected_options', []), ensure_ascii=False),
                1 if a.get('is_correct') else 0
            )
            for a in answers
        ]
        
        with self.transaction():
            self.execute_many(sql, params_list)
        
        return len(answers)
    
    def get_questions_paginated(self, page: int = 1, page_size: int = 50) -> List[sqlite3.Row]:
        """
        分页查询题目（性能优化）
        
        Args:
            page: 页码（从 1 开始）
            page_size: 每页数量
            
        Returns:
            题目列表
        """
        offset = (page - 1) * page_size
        sql = 'SELECT * FROM questions ORDER BY number LIMIT ? OFFSET ?'
        cursor = self.execute(sql, (page_size, offset))
        return cursor.fetchall()
    
    def get_answers_by_question_ids(self, question_ids: List[int]) -> List[sqlite3.Row]:
        """
        批量查询答题记录（性能优化）
        
        Args:
            question_ids: 题目 ID 列表
            
        Returns:
            答题记录列表
        """
        if not question_ids:
            return []
        
        placeholders = ','.join(['?' for _ in question_ids])
        sql = f'SELECT * FROM answers WHERE question_id IN ({placeholders}) ORDER BY answered_at DESC'
        cursor = self.execute(sql, tuple(question_ids))
        return cursor.fetchall()
    
    def get_statistics_fast(self) -> Dict[str, Any]:
        """
        快速获取统计数据（使用索引优化）
        
        Returns:
            统计信息字典
        """
        # 使用索引优化的查询
        total_questions = self.execute('SELECT COUNT(*) FROM questions').fetchone()[0]
        total_answers = self.execute('SELECT COUNT(*) FROM answers').fetchone()[0]
        correct_answers = self.execute('SELECT COUNT(*) FROM answers WHERE is_correct = 1').fetchone()[0]
        
        accuracy = correct_answers / total_answers if total_answers > 0 else 0
        
        return {
            'total_questions': total_questions,
            'total_answers': total_answers,
            'correct_answers': correct_answers,
            'accuracy': accuracy
        }
    
    def measure_query_time(self, query: str, params: tuple = ()) -> float:
        """
        测量查询执行时间（性能测试）
        
        Args:
            query: SQL 查询语句
            params: 查询参数
            
        Returns:
            执行时间（毫秒）
        """
        start_time = time.time()
        self.execute(query, params).fetchall()
        end_time = time.time()
        return (end_time - start_time) * 1000  # 转换为毫秒
    
    def close(self):
        """关闭当前线程的数据库连接"""
        if hasattr(self._local, 'conn') and self._local.conn:
            self._local.conn.close()
            self._local.conn = None
    
    def close_all(self):
        """关闭所有数据库连接（用于清理）"""
        self.close()
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
