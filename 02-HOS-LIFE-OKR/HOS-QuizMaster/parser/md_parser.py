#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Markdown题库解析器
支持格式:
### 第N题 [题型]
题干内容

- A. 选项A
- B. 选项B
...

**答案：** X
**解析：** (可选)
"""

import re
import os
from typing import List, Dict


class MDParser:
    def __init__(self):
        self.question_pattern = re.compile(r'^###\s*第(\d+)题\s*\[(.*?)\]')
        self.option_pattern = re.compile(r'^-\s*([A-E])\.\s*(.+)$')
        self.answer_pattern = re.compile(r'^\*\*答案[：:]\*\*\s*(.+)$')
        self.explanation_pattern = re.compile(r'^\*\*解析[：:]\*\*\s*(.+)$')
        self.image_pattern = re.compile(r'!\[.*?\]\((.*?)\)')
    
    def parse_file(self, file_path: str) -> List[Dict]:
        """解析MD文件，返回题目列表"""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"文件不存在: {file_path}")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        return self.parse_content(content, os.path.dirname(file_path))
    
    def parse_content(self, content: str, base_dir: str = '') -> List[Dict]:
        """解析MD内容"""
        lines = content.split('\n')
        questions = []
        current_question = None
        current_section = None  # 'stem', 'options', 'answer', 'explanation'
        
        for line in lines:
            stripped = line.strip()
            
            # 检查是否是题目开始
            q_match = self.question_pattern.match(stripped)
            if q_match:
                if current_question:
                    questions.append(current_question)
                current_question = {
                    'number': int(q_match.group(1)),
                    'type': q_match.group(2),
                    'stem': '',
                    'options': [],
                    'answer': '',
                    'explanation': '',
                    'images': []
                }
                current_section = 'stem'
                continue
            
            if not current_question:
                continue
            
            # 检查图片
            img_match = self.image_pattern.search(stripped)
            if img_match:
                img_path = img_match.group(1)
                if not os.path.isabs(img_path) and base_dir:
                    img_path = os.path.join(base_dir, img_path)
                current_question['images'].append(img_path)
                continue
            
            # 检查答案
            a_match = self.answer_pattern.match(stripped)
            if a_match:
                # 将答案字符串转换为列表格式，如 "C" -> ['C'], "CD" -> ['C', 'D']
                answer_str = a_match.group(1).strip().replace(',', '').replace('，', '').replace(' ', '')
                current_question['answer'] = list(answer_str)
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
                    'text': o_match.group(2)
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
            questions.append(current_question)
        
        return questions
