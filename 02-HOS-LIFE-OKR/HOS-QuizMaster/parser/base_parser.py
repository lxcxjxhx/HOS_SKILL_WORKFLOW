#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
基础解析器抽象类
定义所有解析器的接口规范
"""

from abc import ABC, abstractmethod
from typing import List, Dict


class BaseParser(ABC):
    """解析器抽象基类"""
    
    @abstractmethod
    def can_parse(self, content: str) -> float:
        """
        检测解析器是否能解析该内容
        返回置信度 0-1，1 表示完全匹配
        """
        pass
    
    @abstractmethod
    def parse_content(self, content: str, base_dir: str = '') -> List[Dict]:
        """
        解析内容，返回题目列表
        每个题目应包含: number, type, stem, options, answer, explanation, images, tags, difficulty
        """
        pass
    
    def parse_file(self, file_path: str) -> List[Dict]:
        """解析文件，返回题目列表"""
        import os
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"文件不存在: {file_path}")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        return self.parse_content(content, os.path.dirname(file_path))
