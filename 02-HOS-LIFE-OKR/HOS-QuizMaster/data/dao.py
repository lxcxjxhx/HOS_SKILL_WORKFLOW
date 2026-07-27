#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数据访问对象 (DAO) 层
"""

import json
from typing import List, Dict, Optional
from datetime import datetime
from data.database import Database


class QuestionDAO:
    """题目数据访问对象"""
    
    def __init__(self, db: Database):
        self.db = db
    
    def create(self, question: Dict) -> int:
        """
        创建题目
        
        Args:
            question: 题目字典，包含 number, type, stem, options, answer, explanation, tags, difficulty, source_file
            
        Returns:
            新创建的题目 ID
        """
        options_json = json.dumps(question.get('options', []), ensure_ascii=False)
        tags_json = json.dumps(question.get('tags', []), ensure_ascii=False) if question.get('tags') else None
        
        # 答案格式转换：list -> 字符串存储
        answer = question['answer']
        if isinstance(answer, list):
            answer_str = ''.join(answer)
        else:
            answer_str = str(answer)
        
        cursor = self.db.execute('''
            INSERT INTO questions (number, type, stem, options, answer, explanation, tags, difficulty, source_file)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            question['number'],
            question['type'],
            question['stem'],
            options_json,
            answer_str,
            question.get('explanation', ''),
            tags_json,
            question.get('difficulty', 0),
            question.get('source_file', '')
        ))
        self.db.commit()
        return cursor.lastrowid
    
    def get_by_id(self, question_id: int) -> Optional[Dict]:
        """根据 ID 获取题目"""
        cursor = self.db.execute('SELECT * FROM questions WHERE id = ?', (question_id,))
        row = cursor.fetchone()
        if row:
            return self._row_to_dict(row)
        return None
    
    def get_by_number(self, number: int, source_file: str = '') -> Optional[Dict]:
        """根据题号和源文件获取题目"""
        if source_file:
            cursor = self.db.execute(
                'SELECT * FROM questions WHERE number = ? AND source_file = ?',
                (number, source_file)
            )
        else:
            cursor = self.db.execute('SELECT * FROM questions WHERE number = ?', (number,))
        
        row = cursor.fetchone()
        if row:
            return self._row_to_dict(row)
        return None
    
    def get_all(self, source_file: str = '') -> List[Dict]:
        """获取所有题目"""
        if source_file:
            cursor = self.db.execute(
                'SELECT * FROM questions WHERE source_file = ? ORDER BY number',
                (source_file,)
            )
        else:
            cursor = self.db.execute('SELECT * FROM questions ORDER BY number')
        
        return [self._row_to_dict(row) for row in cursor.fetchall()]
    
    def update(self, question_id: int, question: Dict) -> bool:
        """更新题目"""
        options_json = json.dumps(question.get('options', []), ensure_ascii=False)
        tags_json = json.dumps(question.get('tags', []), ensure_ascii=False) if question.get('tags') else None
        
        cursor = self.db.execute('''
            UPDATE questions 
            SET number = ?, type = ?, stem = ?, options = ?, answer = ?, 
                explanation = ?, tags = ?, difficulty = ?, source_file = ?
            WHERE id = ?
        ''', (
            question['number'],
            question['type'],
            question['stem'],
            options_json,
            question['answer'],
            question.get('explanation', ''),
            tags_json,
            question.get('difficulty', 0),
            question.get('source_file', ''),
            question_id
        ))
        self.db.commit()
        return cursor.rowcount > 0
    
    def delete(self, question_id: int) -> bool:
        """删除题目"""
        cursor = self.db.execute('DELETE FROM questions WHERE id = ?', (question_id,))
        self.db.commit()
        return cursor.rowcount > 0
    
    def _row_to_dict(self, row) -> Dict:
        """将数据库行转换为字典"""
        # 答案格式转换：字符串 -> list，如 "C" -> ['C'], "CD" -> ['C', 'D']
        answer_raw = row['answer']
        if isinstance(answer_raw, list):
            answer_list = answer_raw
        else:
            answer_list = list(str(answer_raw).replace(',', '').replace('，', '').replace(' ', ''))
        return {
            'id': row['id'],
            'number': row['number'],
            'type': row['type'],
            'stem': row['stem'],
            'options': json.loads(row['options']),
            'answer': answer_list,
            'explanation': row['explanation'],
            'tags': json.loads(row['tags']) if row['tags'] else [],
            'difficulty': row['difficulty'],
            'source_file': row['source_file']
        }


class AnswerDAO:
    """答题记录数据访问对象"""
    
    def __init__(self, db: Database):
        self.db = db
    
    def record_answer(self, question_id: int, selected_options: List[str], is_correct: bool) -> int:
        """
        记录答题
        
        Args:
            question_id: 题目 ID
            selected_options: 选择的答案选项列表
            is_correct: 是否答对
            
        Returns:
            新创建的答题记录 ID
        """
        selected_json = json.dumps(selected_options, ensure_ascii=False)
        is_correct_int = 1 if is_correct else 0
        
        cursor = self.db.execute('''
            INSERT INTO answers (question_id, selected_options, is_correct)
            VALUES (?, ?, ?)
        ''', (question_id, selected_json, is_correct_int))
        self.db.commit()
        return cursor.lastrowid
    
    def get_answers_for_question(self, question_id: int) -> List[Dict]:
        """获取某个题目的所有答题记录"""
        cursor = self.db.execute(
            'SELECT * FROM answers WHERE question_id = ? ORDER BY answered_at DESC',
            (question_id,)
        )
        return [self._row_to_dict(row) for row in cursor.fetchall()]
    
    def get_latest_answer(self, question_id: int) -> Optional[Dict]:
        """获取某个题目的最新答题记录"""
        cursor = self.db.execute(
            'SELECT * FROM answers WHERE question_id = ? ORDER BY answered_at DESC LIMIT 1',
            (question_id,)
        )
        row = cursor.fetchone()
        if row:
            return self._row_to_dict(row)
        return None
    
    def get_all_answers(self, limit: int = 100) -> List[Dict]:
        """获取所有答题记录"""
        cursor = self.db.execute(
            'SELECT * FROM answers ORDER BY answered_at DESC LIMIT ?',
            (limit,)
        )
        return [self._row_to_dict(row) for row in cursor.fetchall()]
    
    def get_stats(self) -> Dict:
        """获取答题统计"""
        cursor = self.db.execute('''
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct,
                SUM(CASE WHEN is_correct = 0 THEN 1 ELSE 0 END) as incorrect
            FROM answers
        ''')
        row = cursor.fetchone()
        
        total = row['total'] or 0
        correct = row['correct'] or 0
        accuracy = (correct / total * 100) if total > 0 else 0
        
        return {
            'total': total,
            'correct': correct,
            'incorrect': total - correct,
            'accuracy': accuracy
        }
    
    def _row_to_dict(self, row) -> Dict:
        """将数据库行转换为字典"""
        return {
            'id': row['id'],
            'question_id': row['question_id'],
            'selected_options': json.loads(row['selected_options']),
            'is_correct': bool(row['is_correct']),
            'answered_at': row['answered_at']
        }


class KnowledgePointDAO:
    """知识点数据访问对象"""
    
    def __init__(self, db: Database):
        self.db = db
    
    def create(self, name: str, parent_id: Optional[int] = None, description: str = '') -> int:
        """
        创建知识点
        
        Args:
            name: 知识点名称
            parent_id: 父知识点 ID（可选）
            description: 描述
            
        Returns:
            新创建的知识点 ID
        """
        cursor = self.db.execute('''
            INSERT INTO knowledge_points (name, parent_id, description)
            VALUES (?, ?, ?)
        ''', (name, parent_id, description))
        self.db.commit()
        return cursor.lastrowid
    
    def get_by_id(self, knowledge_point_id: int) -> Optional[Dict]:
        """根据 ID 获取知识点"""
        cursor = self.db.execute(
            'SELECT * FROM knowledge_points WHERE id = ?',
            (knowledge_point_id,)
        )
        row = cursor.fetchone()
        if row:
            return dict(row)
        return None
    
    def get_by_name(self, name: str) -> Optional[Dict]:
        """根据名称获取知识点"""
        cursor = self.db.execute(
            'SELECT * FROM knowledge_points WHERE name = ?',
            (name,)
        )
        row = cursor.fetchone()
        if row:
            return dict(row)
        return None
    
    def get_all(self) -> List[Dict]:
        """获取所有知识点"""
        cursor = self.db.execute('SELECT * FROM knowledge_points ORDER BY name')
        return [dict(row) for row in cursor.fetchall()]
    
    def get_children(self, parent_id: int) -> List[Dict]:
        """获取子知识点"""
        cursor = self.db.execute(
            'SELECT * FROM knowledge_points WHERE parent_id = ? ORDER BY name',
            (parent_id,)
        )
        return [dict(row) for row in cursor.fetchall()]
    
    def update(self, knowledge_point_id: int, name: str, description: str = '') -> bool:
        """更新知识点"""
        cursor = self.db.execute('''
            UPDATE knowledge_points 
            SET name = ?, description = ?
            WHERE id = ?
        ''', (name, description, knowledge_point_id))
        self.db.commit()
        return cursor.rowcount > 0
    
    def delete(self, knowledge_point_id: int) -> bool:
        """删除知识点"""
        cursor = self.db.execute('DELETE FROM knowledge_points WHERE id = ?', (knowledge_point_id,))
        self.db.commit()
        return cursor.rowcount > 0
    
    def link_question(self, question_id: int, knowledge_point_id: int) -> bool:
        """关联题目和知识点"""
        try:
            self.db.execute('''
                INSERT INTO question_knowledge (question_id, knowledge_point_id)
                VALUES (?, ?)
            ''', (question_id, knowledge_point_id))
            self.db.commit()
            return True
        except Exception:
            return False
    
    def unlink_question(self, question_id: int, knowledge_point_id: int) -> bool:
        """取消关联题目和知识点"""
        cursor = self.db.execute('''
            DELETE FROM question_knowledge 
            WHERE question_id = ? AND knowledge_point_id = ?
        ''', (question_id, knowledge_point_id))
        self.db.commit()
        return cursor.rowcount > 0
    
    def get_question_knowledge_points(self, question_id: int) -> List[Dict]:
        """获取题目的所有知识点"""
        cursor = self.db.execute('''
            SELECT kp.* FROM knowledge_points kp
            JOIN question_knowledge qk ON kp.id = qk.knowledge_point_id
            WHERE qk.question_id = ?
            ORDER BY kp.name
        ''', (question_id,))
        return [dict(row) for row in cursor.fetchall()]
    
    def get_questions_by_knowledge_point(self, knowledge_point_id: int) -> List[Dict]:
        """
        获取某知识点关联的所有题目
        
        Args:
            knowledge_point_id: 知识点 ID
            
        Returns:
            题目列表
        """
        cursor = self.db.execute('''
            SELECT q.* FROM questions q
            JOIN question_knowledge qk ON q.id = qk.question_id
            WHERE qk.knowledge_point_id = ?
            ORDER BY q.number
        ''', (knowledge_point_id,))
        return [self._question_row_to_dict(row) for row in cursor.fetchall()]
    
    def _question_row_to_dict(self, row) -> Dict:
        """将题目数据库行转换为字典"""
        # 答案格式转换：字符串 -> list
        answer_raw = row['answer']
        if isinstance(answer_raw, list):
            answer_list = answer_raw
        else:
            answer_list = list(str(answer_raw).replace(',', '').replace('，', '').replace(' ', ''))
        return {
            'id': row['id'],
            'number': row['number'],
            'type': row['type'],
            'stem': row['stem'],
            'options': json.loads(row['options']),
            'answer': answer_list,
            'explanation': row['explanation'],
            'tags': json.loads(row['tags']) if row['tags'] else [],
            'difficulty': row['difficulty'],
            'source_file': row['source_file']
        }
    
    def get_knowledge_stats(self, knowledge_point_id: int) -> Dict:
        """
        获取某知识点的统计信息
        
        Args:
            knowledge_point_id: 知识点 ID
            
        Returns:
            统计信息字典，包含：
            - total_questions: 关联题目总数
            - answered_questions: 已答题数
            - correct_count: 正确数（以最新答题记录为准）
            - accuracy: 正确率
            - total_attempts: 总答题次数
        """
        # 获取关联题目数
        cursor = self.db.execute('''
            SELECT COUNT(*) as cnt FROM question_knowledge
            WHERE knowledge_point_id = ?
        ''', (knowledge_point_id,))
        total_questions = cursor.fetchone()['cnt']
        
        # 获取已答题数和正确数
        cursor = self.db.execute('''
            SELECT 
                COUNT(DISTINCT a.question_id) as answered,
                COUNT(a.id) as attempts,
                SUM(CASE WHEN a.is_correct = 1 THEN 1 ELSE 0 END) as correct
            FROM answers a
            JOIN question_knowledge qk ON a.question_id = qk.question_id
            WHERE qk.knowledge_point_id = ?
        ''', (knowledge_point_id,))
        row = cursor.fetchone()
        
        answered = row['answered'] or 0
        attempts = row['attempts'] or 0
        correct = row['correct'] or 0
        accuracy = (correct / attempts * 100) if attempts > 0 else 0
        
        return {
            'total_questions': total_questions,
            'answered_questions': answered,
            'total_attempts': attempts,
            'correct_count': correct,
            'accuracy': round(accuracy, 1)
        }
    
    def get_all_knowledge_with_stats(self) -> List[Dict]:
        """
        获取所有知识点及其统计信息
        
        Returns:
            知识点列表，每项包含知识点基本信息和统计数据
        """
        all_kps = self.get_all()
        result = []
        
        for kp in all_kps:
            stats = self.get_knowledge_stats(kp['id'])
            kp_with_stats = {**kp, **stats}
            result.append(kp_with_stats)
        
        return result
    
    def get_knowledge_mastery_history(self, knowledge_point_id: int, days: int = 30) -> List[Dict]:
        """
        获取知识点掌握度历史（按天统计）
        
        Args:
            knowledge_point_id: 知识点 ID
            days: 统计天数（默认30天）
            
        Returns:
            历史记录列表，每项包含 date, attempts, correct, accuracy
        """
        cursor = self.db.execute('''
            SELECT 
                DATE(a.answered_at) as date,
                COUNT(*) as attempts,
                SUM(CASE WHEN a.is_correct = 1 THEN 1 ELSE 0 END) as correct
            FROM answers a
            JOIN question_knowledge qk ON a.question_id = qk.question_id
            WHERE qk.knowledge_point_id = ?
                AND a.answered_at >= DATE('now', '-' || ? || ' days')
            GROUP BY DATE(a.answered_at)
            ORDER BY date
        ''', (knowledge_point_id, days))
        
        result = []
        for row in cursor.fetchall():
            attempts = row['attempts']
            correct = row['correct']
            accuracy = (correct / attempts * 100) if attempts > 0 else 0
            result.append({
                'date': row['date'],
                'attempts': attempts,
                'correct': correct,
                'accuracy': round(accuracy, 1)
            })
        
        return result


class StudySessionDAO:
    """学习会话数据访问对象"""
    
    def __init__(self, db: Database):
        self.db = db
    
    def create_session(self, mode: str, stats: Optional[Dict] = None) -> int:
        """
        创建学习会话
        
        Args:
            mode: 学习模式（如 'sequential', 'random'）
            stats: 统计信息字典
            
        Returns:
            新创建的会话 ID
        """
        stats_json = json.dumps(stats, ensure_ascii=False) if stats else None
        
        cursor = self.db.execute('''
            INSERT INTO study_sessions (mode, stats)
            VALUES (?, ?)
        ''', (mode, stats_json))
        self.db.commit()
        return cursor.lastrowid
    
    def end_session(self, session_id: int, stats: Optional[Dict] = None) -> bool:
        """
        结束学习会话
        
        Args:
            session_id: 会话 ID
            stats: 最终统计信息
            
        Returns:
            是否成功
        """
        stats_json = json.dumps(stats, ensure_ascii=False) if stats else None
        
        cursor = self.db.execute('''
            UPDATE study_sessions 
            SET end_time = CURRENT_TIMESTAMP, stats = ?
            WHERE id = ?
        ''', (stats_json, session_id))
        self.db.commit()
        return cursor.rowcount > 0
    
    def get_session(self, session_id: int) -> Optional[Dict]:
        """获取会话"""
        cursor = self.db.execute(
            'SELECT * FROM study_sessions WHERE id = ?',
            (session_id,)
        )
        row = cursor.fetchone()
        if row:
            return self._row_to_dict(row)
        return None
    
    def get_recent_sessions(self, limit: int = 10) -> List[Dict]:
        """获取最近的学习会话"""
        cursor = self.db.execute(
            'SELECT * FROM study_sessions ORDER BY start_time DESC LIMIT ?',
            (limit,)
        )
        return [self._row_to_dict(row) for row in cursor.fetchall()]
    
    def _row_to_dict(self, row) -> Dict:
        """将数据库行转换为字典"""
        return {
            'id': row['id'],
            'start_time': row['start_time'],
            'end_time': row['end_time'],
            'mode': row['mode'],
            'stats': json.loads(row['stats']) if row['stats'] else None
        }
