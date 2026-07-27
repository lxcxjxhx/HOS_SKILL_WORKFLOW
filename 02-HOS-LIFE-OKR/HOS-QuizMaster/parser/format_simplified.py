#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简化格式解析器
支持格式:
1. [单选] 题干内容
A. 选项A
B. 选项B
答案: A
解析: xxx

或:
1. 题干内容（单选）
A、选项A
B、选项B
【答案】A
【解析】xxx
"""

import re
import os
from typing import List, Dict
from parser.base_parser import BaseParser


class SimplifiedFormatParser(BaseParser):
    """简化格式解析器"""

    def __init__(self):
        # 题目开始: 数字. [题型] 题干 或 数字. 题干（题型）
        self.question_pattern1 = re.compile(r'^(\d+)[.、．]\s*\[(.*?)\]\s*(.+)$')
        self.question_pattern2 = re.compile(r'^(\d+)[.、．]\s*(.+?)[（(](.*?)[）)]\s*$')
        self.question_pattern3 = re.compile(r'^(\d+)[.、．]\s*(.+)$')

        # 选项: A. 或 A、
        self.option_pattern1 = re.compile(r'^([A-E])[.、．]\s*(.+)$')

        # 答案: 答案: 或 【答案】
        self.answer_pattern1 = re.compile(r'^答案[：:]\s*(.+)$')
        self.answer_pattern2 = re.compile(r'^【答案】\s*(.+)$')

        # 解析: 解析: 或 【解析】
        self.explanation_pattern1 = re.compile(r'^解析[：:]\s*(.+)$')
        self.explanation_pattern2 = re.compile(r'^【解析】\s*(.+)$')

        # 图片
        self.image_md_pattern = re.compile(r'!\[.*?\]\((.*?)\)')
        self.image_img_pattern = re.compile(r'<img\s+src=["\']([^"\']+)["\']', re.IGNORECASE)

    def can_parse(self, content: str) -> float:
        """检测是否能解析简化格式"""
        lines = content.split('\n')
        question_count = 0
        answer_count = 0
        option_count = 0

        for line in lines:
            stripped = line.strip()
            if self.question_pattern1.match(stripped) or self.question_pattern2.match(stripped):
                question_count += 1
            if self.answer_pattern1.match(stripped) or self.answer_pattern2.match(stripped):
                answer_count += 1
            if self.option_pattern1.match(stripped):
                option_count += 1

        if question_count == 0:
            return 0.0

        score = 0.0
        if question_count > 0 and answer_count > 0:
            score = 0.7
        if option_count > 0:
            score += 0.2
        if question_count > 1:
            score += 0.1

        return min(score, 1.0)

    def parse_content(self, content: str, base_dir: str = '') -> List[Dict]:
        """解析简化格式内容"""
        lines = content.split('\n')
        questions = []
        current_question = None
        current_section = None
        question_number = 0

        for line in lines:
            stripped = line.strip()
            if not stripped:
                continue

            # 检查题目开始
            q_match = self.question_pattern1.match(stripped)
            if q_match:
                if current_question:
                    questions.append(current_question)
                question_number += 1
                q_type = self._extract_type(q_match.group(2))
                stem = q_match.group(3)
                current_question = self._new_question(question_number, q_type, stem)
                current_section = 'stem'
                continue

            q_match = self.question_pattern2.match(stripped)
            if q_match:
                if current_question:
                    questions.append(current_question)
                question_number += 1
                stem = q_match.group(2)
                q_type = self._extract_type(q_match.group(3))
                current_question = self._new_question(question_number, q_type, stem)
                current_section = 'stem'
                continue

            if not current_question:
                continue

            # 检查图片
            img_paths = self._extract_images(stripped, base_dir)
            if img_paths:
                current_question['images'].extend(img_paths)

            # 检查答案
            a_match = self.answer_pattern1.match(stripped) or self.answer_pattern2.match(stripped)
            if a_match:
                current_question['answer'] = a_match.group(1).strip()
                current_section = 'answer'
                continue

            # 检查解析
            e_match = self.explanation_pattern1.match(stripped) or self.explanation_pattern2.match(stripped)
            if e_match:
                current_question['explanation'] = e_match.group(1).strip()
                current_section = 'explanation'
                continue

            # 检查选项
            o_match = self.option_pattern1.match(stripped)
            if o_match:
                current_question['options'].append({
                    'label': o_match.group(1),
                    'text': o_match.group(2).strip()
                })
                current_section = 'options'
                continue

            # 其他内容追加到题干
            if current_section == 'stem':
                if current_question['stem']:
                    current_question['stem'] += '\n' + stripped
                else:
                    current_question['stem'] = stripped

        # 添加最后一题
        if current_question:
            questions.append(current_question)

        return questions

    def _extract_type(self, type_str: str) -> str:
        """从题型字符串中提取标准化题型"""
        type_str = type_str.strip()
        type_map = {
            '单选': '单选题', '单选 ': '单选题',
            '多选': '多选题', '多选 ': '多选题',
            '判断': '判断题', '判断 ': '判断题',
            '填空': '填空题', '填空 ': '填空题',
            '简答': '简答题', '简答 ': '简答题',
        }
        return type_map.get(type_str, type_str)

    def _new_question(self, number: int, q_type: str, stem: str) -> Dict:
        """创建新题目字典"""
        return {
            'number': number,
            'type': q_type,
            'stem': stem,
            'options': [],
            'answer': '',
            'explanation': '',
            'images': [],
            'tags': [],
            'difficulty': 0
        }

    def _extract_images(self, text: str, base_dir: str) -> List[str]:
        """从文本中提取图片路径"""
        paths = []
        for match in self.image_md_pattern.finditer(text):
            img_path = match.group(1)
            if not os.path.isabs(img_path) and base_dir:
                img_path = os.path.join(base_dir, img_path)
            paths.append(img_path)
        for match in self.image_img_pattern.finditer(text):
            img_path = match.group(1)
            if not os.path.isabs(img_path) and base_dir:
                img_path = os.path.join(base_dir, img_path)
            paths.append(img_path)
        return paths
