#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
统计分析器 - HOS-QuizMaster V2
提供答题趋势、题型分析、难度分析、时间分析和预测分数计算
"""

from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
from collections import defaultdict

from data.database import Database


class StatsAnalyzer:
    """统计分析器"""

    def __init__(self, db: Database):
        """
        初始化统计分析器

        Args:
            db: 数据库连接
        """
        self.db = db

    # ==================== 答题趋势分析 ====================

    def get_trend_analysis(self, period: str = 'week') -> Dict:
        """
        获取答题趋势分析（按天/周/月统计正确率变化）

        Args:
            period: 时间周期 ('day', 'week', 'month', 'all')

        Returns:
            包含日期和正确率列表的字典
        """
        if period == 'day':
            start_date = datetime.now().date()
        elif period == 'week':
            start_date = datetime.now().date() - timedelta(days=7)
        elif period == 'month':
            start_date = datetime.now().date() - timedelta(days=30)
        else:
            start_date = None

        if start_date:
            cursor = self.db.execute('''
                SELECT
                    DATE(answered_at) as date,
                    COUNT(*) as total,
                    SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
                FROM answers
                WHERE DATE(answered_at) >= ?
                GROUP BY DATE(answered_at)
                ORDER BY date
            ''', (start_date.isoformat(),))
        else:
            cursor = self.db.execute('''
                SELECT
                    DATE(answered_at) as date,
                    COUNT(*) as total,
                    SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
                FROM answers
                GROUP BY DATE(answered_at)
                ORDER BY date
            ''')

        results = cursor.fetchall()

        dates = []
        accuracies = []
        totals = []

        for row in results:
            dates.append(row['date'])
            total = row['total']
            correct = row['correct']
            accuracy = (correct / total * 100) if total > 0 else 0
            totals.append(total)
            accuracies.append(accuracy)

        return {
            'dates': dates,
            'accuracies': accuracies,
            'totals': totals,
            'period': period
        }

    # ==================== 题型分析 ====================

    def get_question_type_analysis(self) -> Dict:
        """
        获取题型分析（各题型的正确率、答题数量）

        Returns:
            包含题型统计的字典
        """
        cursor = self.db.execute('''
            SELECT
                q.type,
                COUNT(a.id) as total,
                SUM(CASE WHEN a.is_correct = 1 THEN 1 ELSE 0 END) as correct
            FROM answers a
            JOIN questions q ON a.question_id = q.id
            GROUP BY q.type
            ORDER BY total DESC
        ''')

        results = cursor.fetchall()

        type_stats = []
        for row in results:
            total = row['total']
            correct = row['correct']
            accuracy = (correct / total * 100) if total > 0 else 0

            type_stats.append({
                'type': row['type'],
                'total': total,
                'correct': correct,
                'accuracy': accuracy
            })

        return {'type_stats': type_stats}

    # ==================== 难度分析 ====================

    def get_difficulty_analysis(self) -> Dict:
        """
        获取难度分析（不同难度题目的表现）

        Returns:
            包含难度统计的字典
        """
        cursor = self.db.execute('''
            SELECT
                q.difficulty,
                COUNT(a.id) as total,
                SUM(CASE WHEN a.is_correct = 1 THEN 1 ELSE 0 END) as correct
            FROM answers a
            JOIN questions q ON a.question_id = q.id
            GROUP BY q.difficulty
            ORDER BY q.difficulty
        ''')

        results = cursor.fetchall()

        difficulty_stats = []
        for row in results:
            total = row['total']
            correct = row['correct']
            accuracy = (correct / total * 100) if total > 0 else 0

            difficulty_stats.append({
                'difficulty': row['difficulty'],
                'total': total,
                'correct': correct,
                'accuracy': accuracy
            })

        return {'difficulty_stats': difficulty_stats}

    # ==================== 时间分析 ====================

    def get_time_analysis(self) -> Dict:
        """
        获取时间分析（最佳学习时段、学习时长统计）

        Returns:
            包含时间统计的字典
        """
        # 按小时统计答题情况
        cursor = self.db.execute('''
            SELECT
                CAST(strftime('%H', answered_at) AS INTEGER) as hour,
                COUNT(*) as total,
                SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
            FROM answers
            GROUP BY hour
            ORDER BY hour
        ''')

        results = cursor.fetchall()

        hourly_stats = []
        best_hour = None
        best_accuracy = 0

        for row in results:
            hour = row['hour']
            total = row['total']
            correct = row['correct']
            accuracy = (correct / total * 100) if total > 0 else 0

            hourly_stats.append({
                'hour': hour,
                'total': total,
                'correct': correct,
                'accuracy': accuracy
            })

            # 至少5题才有参考价值
            if accuracy > best_accuracy and total >= 5:
                best_accuracy = accuracy
                best_hour = hour

        # 计算学习时长（基于学习会话）
        cursor = self.db.execute('''
            SELECT
                start_time, end_time,
                (julianday(end_time) - julianday(start_time)) * 24 as duration_hours
            FROM study_sessions
            WHERE end_time IS NOT NULL
        ''')

        sessions = cursor.fetchall()
        total_study_hours = 0
        session_count = 0

        for session in sessions:
            if session['duration_hours']:
                total_study_hours += session['duration_hours']
                session_count += 1

        avg_session_duration = (total_study_hours / session_count) if session_count > 0 else 0

        return {
            'hourly_stats': hourly_stats,
            'best_hour': best_hour,
            'best_accuracy': best_accuracy,
            'total_study_hours': round(total_study_hours, 1),
            'session_count': session_count,
            'avg_session_duration': round(avg_session_duration * 60, 1)  # 转为分钟
        }

    # ==================== 预测分数计算 ====================

    def calculate_predicted_score(self) -> Dict:
        """
        计算预测分数（基于历史表现预测考试成绩）
        综合考虑基础正确率和难度加权正确率

        Returns:
            包含预测分数的字典
        """
        cursor = self.db.execute('''
            SELECT a.is_correct, q.difficulty
            FROM answers a
            JOIN questions q ON a.question_id = q.id
            ORDER BY a.answered_at DESC
            LIMIT 100
        ''')

        results = cursor.fetchall()

        if not results:
            return {
                'predicted_score': 0,
                'confidence': 0,
                'total_questions': 0,
                'base_accuracy': 0,
                'weighted_accuracy': 0
            }

        total_questions = len(results)
        correct_count = sum(1 for r in results if r['is_correct'] == 1)

        # 基础正确率
        base_accuracy = (correct_count / total_questions) * 100

        # 难度加权：难度越高，答对的权重越大
        difficulty_weights = {0: 1.0, 1: 0.95, 2: 0.9, 3: 0.85, 4: 0.8, 5: 0.75}
        weighted_score = 0
        weight_sum = 0

        for row in results:
            difficulty = row['difficulty'] if row['difficulty'] else 0
            weight = difficulty_weights.get(difficulty, 1.0)
            weighted_score += row['is_correct'] * weight
            weight_sum += weight

        weighted_accuracy = (weighted_score / weight_sum) * 100 if weight_sum > 0 else 0

        # 综合预测分数（基础60% + 加权40%）
        predicted_score = base_accuracy * 0.6 + weighted_accuracy * 0.4

        # 置信度（基于样本量，100题以上为100%）
        confidence = min(100, total_questions)

        return {
            'predicted_score': round(predicted_score, 1),
            'confidence': confidence,
            'total_questions': total_questions,
            'base_accuracy': round(base_accuracy, 1),
            'weighted_accuracy': round(weighted_accuracy, 1)
        }

    # ==================== 综合统计 ====================

    def get_overall_stats(self) -> Dict:
        """
        获取总体统计信息

        Returns:
            包含总体统计的字典
        """
        cursor = self.db.execute('''
            SELECT
                COUNT(DISTINCT q.id) as total_questions,
                COUNT(a.id) as total_answers,
                SUM(CASE WHEN a.is_correct = 1 THEN 1 ELSE 0 END) as correct_answers
            FROM questions q
            LEFT JOIN answers a ON q.id = a.question_id
        ''')

        row = cursor.fetchone()

        total_questions = row['total_questions'] or 0
        total_answers = row['total_answers'] or 0
        correct_answers = row['correct_answers'] or 0
        accuracy = (correct_answers / total_answers * 100) if total_answers > 0 else 0

        return {
            'total_questions': total_questions,
            'total_answers': total_answers,
            'correct_answers': correct_answers,
            'incorrect_answers': total_answers - correct_answers,
            'accuracy': accuracy
        }

    # ==================== 薄弱知识点分析 ====================

    def get_weak_knowledge_points(self, limit: int = 5) -> List[Dict]:
        """
        获取薄弱知识点（正确率最低的知识点）

        Args:
            limit: 返回数量限制

        Returns:
            薄弱知识点列表
        """
        cursor = self.db.execute('''
            SELECT
                kp.name,
                kp.id,
                COUNT(a.id) as total,
                SUM(CASE WHEN a.is_correct = 1 THEN 1 ELSE 0 END) as correct
            FROM knowledge_points kp
            JOIN question_knowledge qk ON kp.id = qk.knowledge_point_id
            JOIN answers a ON qk.question_id = a.question_id
            GROUP BY kp.id
            HAVING total >= 3
            ORDER BY (CAST(correct AS REAL) / total) ASC
            LIMIT ?
        ''', (limit,))

        results = cursor.fetchall()

        weak_points = []
        for row in results:
            total = row['total']
            correct = row['correct']
            accuracy = (correct / total * 100) if total > 0 else 0

            weak_points.append({
                'name': row['name'],
                'total': total,
                'correct': correct,
                'accuracy': accuracy
            })

        return weak_points

    # ==================== 今日统计 ====================

    def get_today_stats(self) -> Dict:
        """
        获取今日统计信息

        Returns:
            包含今日统计的字典
        """
        today = datetime.now().date().isoformat()

        cursor = self.db.execute('''
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
            FROM answers
            WHERE DATE(answered_at) = ?
        ''', (today,))

        row = cursor.fetchone()
        total = row['total'] or 0
        correct = row['correct'] or 0
        accuracy = (correct / total * 100) if total > 0 else 0

        # 计算今日学习时长
        cursor = self.db.execute('''
            SELECT (julianday(end_time) - julianday(start_time)) * 60 as duration_minutes
            FROM study_sessions
            WHERE DATE(start_time) = ? AND end_time IS NOT NULL
        ''', (today,))

        sessions = cursor.fetchall()
        study_minutes = sum(s['duration_minutes'] for s in sessions if s['duration_minutes'])

        return {
            'total': total,
            'correct': correct,
            'incorrect': total - correct,
            'accuracy': accuracy,
            'study_minutes': round(study_minutes, 1)
        }

    # ==================== 本周统计 ====================

    def get_week_stats(self) -> Dict:
        """
        获取本周统计信息

        Returns:
            包含本周统计的字典
        """
        week_start = (datetime.now() - timedelta(days=datetime.now().weekday())).date().isoformat()

        cursor = self.db.execute('''
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
            FROM answers
            WHERE DATE(answered_at) >= ?
        ''', (week_start,))

        row = cursor.fetchone()
        total = row['total'] or 0
        correct = row['correct'] or 0
        accuracy = (correct / total * 100) if total > 0 else 0

        # 计算本周学习时长
        cursor = self.db.execute('''
            SELECT (julianday(end_time) - julianday(start_time)) * 60 as duration_minutes
            FROM study_sessions
            WHERE DATE(start_time) >= ? AND end_time IS NOT NULL
        ''', (week_start,))

        sessions = cursor.fetchall()
        study_minutes = sum(s['duration_minutes'] for s in sessions if s['duration_minutes'])

        return {
            'total': total,
            'correct': correct,
            'incorrect': total - correct,
            'accuracy': accuracy,
            'study_minutes': round(study_minutes, 1)
        }

    # ==================== 本月统计 ====================

    def get_month_stats(self) -> Dict:
        """
        获取本月统计信息

        Returns:
            包含本月统计的字典
        """
        month_start = datetime.now().replace(day=1).date().isoformat()

        cursor = self.db.execute('''
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
            FROM answers
            WHERE DATE(answered_at) >= ?
        ''', (month_start,))

        row = cursor.fetchone()
        total = row['total'] or 0
        correct = row['correct'] or 0
        accuracy = (correct / total * 100) if total > 0 else 0

        # 计算本月学习时长
        cursor = self.db.execute('''
            SELECT (julianday(end_time) - julianday(start_time)) * 60 as duration_minutes
            FROM study_sessions
            WHERE DATE(start_time) >= ? AND end_time IS NOT NULL
        ''', (month_start,))

        sessions = cursor.fetchall()
        study_minutes = sum(s['duration_minutes'] for s in sessions if s['duration_minutes'])

        return {
            'total': total,
            'correct': correct,
            'incorrect': total - correct,
            'accuracy': accuracy,
            'study_minutes': round(study_minutes, 1)
        }
