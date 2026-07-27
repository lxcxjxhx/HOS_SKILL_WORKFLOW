#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
刷题管理器
"""

import json
import os
import random
from typing import List, Dict, Optional


class QuizManager:
    def __init__(self):
        self.questions: List[Dict] = []
        self.answers: Dict[int, List[str]] = {}  # index -> selected options
        self.mode: str = 'sequential'  # 'sequential', 'random', 'memorize', 'test', 'wrong'
        self.random_order: List[int] = []
        self.wrong_questions: set = set()  # 错题索引集合
        self.current_file: str = ''  # 当前加载的题库文件路径
        self.test_mode_timer: int = 0  # 测试模式计时（秒）
        self.test_mode_active: bool = False  # 测试模式是否激活
    
    def load_questions(self, questions: List[Dict], file_path: str = ''):
        """加载题目"""
        self.questions = questions
        self.answers.clear()
        self.current_file = file_path
        self._generate_random_order()
        
        # 尝试加载进度
        if file_path:
            self.load_progress()
    
    def _generate_random_order(self):
        """生成随机顺序"""
        self.random_order = list(range(len(self.questions)))
        random.shuffle(self.random_order)
    
    def set_mode(self, mode: str):
        """设置刷题模式"""
        self.mode = mode
        if mode == 'random':
            self._generate_random_order()
        elif mode == 'test':
            self.test_mode_active = True
            self.test_mode_timer = 0
        elif mode == 'wrong':
            # 错题模式：只练习答错的题目
            if not self.wrong_questions:
                self.mode = 'sequential'  # 如果没有错题，回退到顺序模式
    
    def get_question_list(self) -> List[int]:
        """获取当前模式的题目索引列表"""
        if self.mode == 'wrong':
            return sorted(list(self.wrong_questions))
        elif self.mode == 'random':
            return self.random_order
        else:  # sequential, memorize, test
            return list(range(len(self.questions)))
    
    def add_wrong_question(self, index: int):
        """添加错题"""
        self.wrong_questions.add(index)
    
    def remove_wrong_question(self, index: int):
        """移除错题（答对后）"""
        self.wrong_questions.discard(index)
    
    def is_wrong_question(self, index: int) -> bool:
        """判断是否为错题"""
        return index in self.wrong_questions
    
    def get_question(self, index: int) -> Optional[Dict]:
        """获取题目"""
        if 0 <= index < len(self.questions):
            return self.questions[index]
        return None
    
    def set_answer(self, index: int, selected: List[str]):
        """设置答案"""
        self.answers[index] = selected
    
    def get_stats(self) -> Dict:
        """获取统计信息"""
        total = len(self.questions)
        answered = len(self.answers)
        correct = 0
        
        for idx, selected in self.answers.items():
            question = self.questions[idx]
            # 答案已经是 list 格式，直接使用
            correct_answer = question['answer'] if isinstance(question['answer'], list) else list(question['answer'])
            if set(selected) == set(correct_answer):
                correct += 1
        
        accuracy = (correct / answered * 100) if answered > 0 else 0
        
        return {
            'total': total,
            'answered': answered,
            'correct': correct,
            'accuracy': accuracy
        }
    
    def _get_progress_path(self) -> str:
        """获取进度文件路径"""
        if not self.current_file:
            return ''
        base = os.path.splitext(self.current_file)[0]
        return base + '.progress.json'
    
    def save_progress(self):
        """保存答题进度"""
        path = self._get_progress_path()
        if not path:
            return
        data = {
            'file': self.current_file,
            'mode': self.mode,
            'answers': {str(k): v for k, v in self.answers.items()}
        }
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    def load_progress(self) -> bool:
        """加载答题进度"""
        path = self._get_progress_path()
        if not path or not os.path.exists(path):
            return False
        try:
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            self.answers = {int(k): v for k, v in data.get('answers', {}).items()}
            self.mode = data.get('mode', 'sequential')
            return True
        except Exception:
            return False
