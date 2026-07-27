#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
格式检测引擎
自动检测内容属于哪种格式，并返回置信度
"""

from typing import List, Tuple
from parser.format_standard import StandardFormatParser
from parser.format_simplified import SimplifiedFormatParser
from parser.format_numbered import NumberedFormatParser


class FormatDetector:
    """格式检测器"""

    def __init__(self):
        self.parsers = {
            'standard': StandardFormatParser(),
            'simplified': SimplifiedFormatParser(),
            'numbered': NumberedFormatParser()
        }

    def detect(self, content: str) -> str:
        """
        检测内容格式，返回置信度最高的格式名称
        """
        scores = self.detect_all(content)
        if not scores:
            return 'standard'  # 默认返回标准格式
        # 返回置信度最高的格式
        return max(scores, key=lambda x: x[1])[0]

    def detect_all(self, content: str) -> List[Tuple[str, float]]:
        """
        检测所有格式的置信度，返回 [(格式名, 置信度), ...]
        """
        scores = []
        for name, parser in self.parsers.items():
            confidence = parser.can_parse(content)
            scores.append((name, confidence))
        # 按置信度降序排序
        scores.sort(key=lambda x: x[1], reverse=True)
        return scores

    def get_parser(self, format_name: str):
        """根据格式名称获取对应的解析器"""
        return self.parsers.get(format_name)
