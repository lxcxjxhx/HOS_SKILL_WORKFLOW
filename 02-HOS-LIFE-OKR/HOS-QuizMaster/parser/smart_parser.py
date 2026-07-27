#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
智能解析器
自动检测格式并使用对应的解析器
"""

import os
from typing import List, Dict
from parser.format_detector import FormatDetector


class SmartParser:
    """智能解析器 - 自动检测格式并解析"""

    def __init__(self):
        self.detector = FormatDetector()

    def parse_file(self, file_path: str) -> List[Dict]:
        """
        解析文件，自动检测格式
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"文件不存在: {file_path}")

        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        base_dir = os.path.dirname(file_path)
        return self.parse_content(content, base_dir)

    def parse_content(self, content: str, base_dir: str = '') -> List[Dict]:
        """
        解析内容，自动检测格式
        """
        # 检测格式
        format_name = self.detector.detect(content)

        # 获取对应解析器
        parser = self.detector.get_parser(format_name)
        if not parser:
            raise ValueError(f"无法识别的格式: {format_name}")

        # 解析内容
        questions = parser.parse_content(content, base_dir)

        # 为每个题目添加默认字段（如果缺失）
        for q in questions:
            q.setdefault('tags', [])
            q.setdefault('difficulty', 0)

        return questions

    def detect_format(self, content: str) -> str:
        """
        仅检测格式，不解析
        """
        return self.detector.detect(content)

    def detect_format_all(self, content: str) -> List[tuple]:
        """
        检测所有格式的置信度
        """
        return self.detector.detect_all(content)
