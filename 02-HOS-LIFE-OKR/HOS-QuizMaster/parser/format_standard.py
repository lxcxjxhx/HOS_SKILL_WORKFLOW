#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
标准格式解析器
支持格式:
### 第N题 [题型]
题干内容
- A. 选项A
- B. 选项B
**答案：** X
**解析：** (可选)
"""

import re
import os
from typing import List, Dict
from parser.base_parser import BaseParser


class StandardFormatParser(BaseParser):
    """标准格式解析器"""

    def __init__(self):
        self.question_pattern = re.compile(r'^###\s*第(\d+)题\s*\[(.*?)\]')
        self.option_pattern = re.compile(r'^-\s*([A-E])\.\s*(.+)$')
        self.answer_pattern = re.compile(r'^\*\*答案[：:]\*\*\s*(.+)$')
        self.explanation_pattern = re.compile(r'^\*\*解析[：:]\*\*\s*(.+)$')
        self.image_md_pattern = re.compile(r'!\[.*?\]\((.*?)\)')
        self.image_img_pattern = re.compile(r'<img\s+src=["\']([^"\']+)["\']', re.IGNORECASE)
        self.tag_pattern = re.compile(r'\*\*标签[：:]\*\*\s*(.+)')
        self.difficulty_pattern = re.compile(r'\*\*难度[：:]\*\*\s*(.+)')

    def can_parse(self, content: str) -> float:
        """检测是否能解析标准格式"""
        q_matches = len(self.question_pattern.findall(content))
        a_matches = len(self.answer_pattern.findall(content))
        if q_matches == 0:
            return 0.0
        # 题目数和答案数都大于0，且格式匹配度高
        score = 0.0
        if q_matches > 0 and a_matches > 0:
            score = 0.8
        # 有选项加分
        if self.option_pattern.search(content):
            score += 0.1
        # 有解析加分
        if self.explanation_pattern.search(content):
            score += 0.1
        return min(score, 1.0)

    def parse_content(self, content: str, base_dir: str = '') -> List[Dict]:
        """解析标准格式内容"""
        lines = content.split('\n')
        questions = []
        current_question = None
        current_section = None

        for line in lines:
            stripped = line.strip()

            # 检查是否是题目开始
            q_match = self.question_pattern.match(stripped)
            if q_match:
                if current_question:
                    self._finalize_question(current_question)
                    questions.append(current_question)
                current_question = self._new_question(
                    int(q_match.group(1)),
                    q_match.group(2).strip()
                )
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

            # 检查标签
            t_match = self.tag_pattern.match(stripped)
            if t_match:
                tags = [t.strip() for t in re.split(r'[,，、]', t_match.group(1)) if t.strip()]
                current_question['tags'] = tags
                continue

            # 检查难度
            d_match = self.difficulty_pattern.match(stripped)
            if d_match:
                current_question['difficulty'] = self._parse_difficulty(d_match.group(1).strip())
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
            if stripped and current_section == 'stem':
                if current_question['stem']:
                    current_question['stem'] += '\n' + stripped
                else:
                    current_question['stem'] = stripped

        # 添加最后一题
        if current_question:
            self._finalize_question(current_question)
            questions.append(current_question)

        return questions

    def _new_question(self, number: int, q_type: str) -> Dict:
        """创建新题目字典"""
        return {
            'number': number,
            'type': self._normalize_type(q_type),
            'stem': '',
            'options': [],
            'answer': '',
            'explanation': '',
            'images': [],
            'tags': [],
            'difficulty': 0
        }

    def _finalize_question(self, question: Dict):
        """完成题目解析后的清理工作"""
        # 从题干中提取内嵌图片
        pass

    def _extract_images(self, text: str, base_dir: str) -> List[str]:
        """从文本中提取图片路径"""
        paths = []
        # Markdown 图片: ![alt](path)
        for match in self.image_md_pattern.finditer(text):
            img_path = match.group(1)
            if not os.path.isabs(img_path) and base_dir:
                img_path = os.path.join(base_dir, img_path)
            paths.append(img_path)
        # HTML img 标签: <img src="path">
        for match in self.image_img_pattern.finditer(text):
            img_path = match.group(1)
            if not os.path.isabs(img_path) and base_dir:
                img_path = os.path.join(base_dir, img_path)
            paths.append(img_path)
        return paths

    def _normalize_type(self, q_type: str) -> str:
        """标准化题型名称"""
        type_map = {
            '单选': '单选题', '单选 ': '单选题',
            '多选': '多选题', '多选 ': '多选题',
            '判断': '判断题', '判断 ': '判断题',
            '填空': '填空题', '填空 ': '填空题',
            '简答': '简答题', '简答 ': '简答题',
        }
        q_type = q_type.strip()
        return type_map.get(q_type, q_type)

    def _parse_difficulty(self, text: str) -> int:
        """解析难度值，返回 0-2"""
        text = text.strip()
        # 数字
        try:
            val = int(text)
            return max(0, min(2, val))
        except ValueError:
            pass
        # 中文
        if '简单' in text or '易' in text:
            return 0
        if '中等' in text or '中' in text:
            return 1
        if '困难' in text or '难' in text:
            return 2
        return 0
