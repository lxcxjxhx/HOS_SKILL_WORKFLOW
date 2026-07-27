#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
编号格式解析器
支持格式:
一、单选题
1. 题干
A. 选项
答案: A

二、多选题
1. 题干
A. 选项
答案: AB

支持章节标题如: 一、二、三 或 ## 单选题 等
"""

import re
import os
from typing import List, Dict
from parser.base_parser import BaseParser


class NumberedFormatParser(BaseParser):
    """编号格式解析器"""

    def __init__(self):
        # 章节标题: 一、单选题 或 ## 单选题
        self.section_pattern1 = re.compile(r'^[一二三四五六七八九十]+[、.．]\s*(.+?)(?:题)?$')
        self.section_pattern2 = re.compile(r'^##\s*(.+?)(?:题)?$')

        # 题目: 1. 题干
        self.question_pattern = re.compile(r'^(\d+)[.、．]\s*(.+)$')

        # 选项: A. 或 A、
        self.option_pattern = re.compile(r'^([A-E])[.、．]\s*(.+)$')

        # 答案: 答案: 或 答案：
        self.answer_pattern = re.compile(r'^答案[：:]\s*(.+)$')

        # 解析: 解析: 或 解析：
        self.explanation_pattern = re.compile(r'^解析[：:]\s*(.+)$')

        # 图片
        self.image_md_pattern = re.compile(r'!\[.*?\]\((.*?)\)')
        self.image_img_pattern = re.compile(r'<img\s+src=["\']([^"\']+)["\']', re.IGNORECASE)

    def can_parse(self, content: str) -> float:
        """检测是否能解析编号格式"""
        lines = content.split('\n')
        section_count = 0
        question_count = 0
        answer_count = 0

        for line in lines:
            stripped = line.strip()
            if self.section_pattern1.match(stripped) or self.section_pattern2.match(stripped):
                section_count += 1
            if self.question_pattern.match(stripped):
                question_count += 1
            if self.answer_pattern.match(stripped):
                answer_count += 1

        # 有章节标题且有问题和答案
        if section_count > 0 and question_count > 0 and answer_count > 0:
            return 0.9
        # 只有问题和答案，无章节
        if question_count > 0 and answer_count > 0:
            return 0.6

        return 0.0

    def parse_content(self, content: str, base_dir: str = '') -> List[Dict]:
        """解析编号格式内容"""
        lines = content.split('\n')
        questions = []
        current_question = None
        current_section = None
        current_type = '单选题'  # 默认题型
        question_counter = 0

        for line in lines:
            stripped = line.strip()
            if not stripped:
                continue

            # 检查章节标题
            s_match = self.section_pattern1.match(stripped) or self.section_pattern2.match(stripped)
            if s_match:
                section_title = s_match.group(1).strip()
                current_type = self._extract_type_from_section(section_title)
                # 重置题号计数器
                question_counter = 0
                continue

            # 检查题目开始
            q_match = self.question_pattern.match(stripped)
            if q_match:
                if current_question:
                    questions.append(current_question)
                question_counter += 1
                stem = q_match.group(2)
                current_question = self._new_question(question_counter, current_type, stem)
                current_section = 'stem'
                continue

            if not current_question:
                continue

            # 检查图片
            img_paths = self._extract_images(stripped, base_dir)
            if img_paths:
                current_question['images'].extend(img_paths)

            # 检查答案
            a_match = self.answer_pattern.match(stripped)
            if a_match:
                current_question['answer'] = a_match.group(1).strip()
                current_section = 'answer'
                continue

            # 检查解析
            e_match = self.explanation_pattern.match(stripped)
            if e_match:
                current_question['explanation'] = e_match.group(1).strip()
                current_section = 'explanation'
                continue

            # 检查选项
            o_match = self.option_pattern.match(stripped)
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

    def _extract_type_from_section(self, section_title: str) -> str:
        """从章节标题中提取题型"""
        type_map = {
            '单选': '单选题', '单选 ': '单选题',
            '多选': '多选题', '多选 ': '多选题',
            '判断': '判断题', '判断 ': '判断题',
            '填空': '填空题', '填空 ': '填空题',
            '简答': '简答题', '简答 ': '简答题',
        }
        for key, value in type_map.items():
            if key in section_title:
                return value
        return '单选题'

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
