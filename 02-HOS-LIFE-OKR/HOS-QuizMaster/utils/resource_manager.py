#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
资源管理 - HOS-QuizMaster V2
Phase 14: 系统集成
"""

import atexit
import os
import shutil
from typing import List, Optional
from pathlib import Path

from utils.logger import get_logger

logger = get_logger('quizmaster.resource')


class ResourceManager:
    """资源管理器"""
    
    def __init__(self):
        self.managed_files: List[str] = []
        self.managed_dirs: List[str] = []
        self.temp_files: List[str] = []
    
    def register_file(self, file_path: str):
        """注册文件资源"""
        if file_path not in self.managed_files:
            self.managed_files.append(file_path)
    
    def register_dir(self, dir_path: str):
        """注册目录资源"""
        if dir_path not in self.managed_dirs:
            self.managed_dirs.append(dir_path)
    
    def register_temp(self, file_path: str):
        """注册临时文件"""
        if file_path not in self.temp_files:
            self.temp_files.append(file_path)
    
    def cleanup_temp(self):
        """清理临时文件"""
        for temp_file in self.temp_files:
            try:
                if os.path.exists(temp_file):
                    os.remove(temp_file)
                    logger.debug(f"已清理临时文件: {temp_file}")
            except Exception as e:
                logger.warning(f"清理临时文件失败: {temp_file}, {e}")
        self.temp_files.clear()
    
    def cleanup_all(self):
        """清理所有资源"""
        # 清理临时文件
        self.cleanup_temp()
        
        # 清理管理的文件
        for file_path in self.managed_files:
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
                    logger.debug(f"已清理文件: {file_path}")
            except Exception as e:
                logger.warning(f"清理文件失败: {file_path}, {e}")
        
        # 清理管理的目录
        for dir_path in self.managed_dirs:
            try:
                if os.path.exists(dir_path):
                    shutil.rmtree(dir_path, ignore_errors=True)
                    logger.debug(f"已清理目录: {dir_path}")
            except Exception as e:
                logger.warning(f"清理目录失败: {dir_path}, {e}")
        
        self.managed_files.clear()
        self.managed_dirs.clear()


# 全局资源管理器
_resource_manager: Optional[ResourceManager] = None


def get_resource_manager() -> ResourceManager:
    """获取全局资源管理器"""
    global _resource_manager
    if _resource_manager is None:
        _resource_manager = ResourceManager()
        # 注册退出时清理
        atexit.register(_resource_manager.cleanup_all)
    return _resource_manager


def cleanup_cache(cache_dir: Optional[str] = None):
    """清理缓存目录"""
    if cache_dir is None:
        cache_dir = str(Path.home() / '.quizmaster' / 'cache')
    
    if os.path.exists(cache_dir):
        try:
            shutil.rmtree(cache_dir)
            logger.info(f"已清理缓存: {cache_dir}")
        except Exception as e:
            logger.warning(f"清理缓存失败: {e}")


def get_cache_size(cache_dir: Optional[str] = None) -> int:
    """获取缓存大小（字节）"""
    if cache_dir is None:
        cache_dir = str(Path.home() / '.quizmaster' / 'cache')
    
    total_size = 0
    if os.path.exists(cache_dir):
        for dirpath, _, filenames in os.walk(cache_dir):
            for f in filenames:
                fp = os.path.join(dirpath, f)
                try:
                    total_size += os.path.getsize(fp)
                except Exception:
                    pass
    
    return total_size
