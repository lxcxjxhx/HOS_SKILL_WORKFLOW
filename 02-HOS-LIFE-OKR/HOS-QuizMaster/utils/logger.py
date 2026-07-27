#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
统一日志系统 - HOS-QuizMaster V2
Phase 14: 系统集成
"""

import logging
import os
import sys
from logging.handlers import RotatingFileHandler
from typing import Optional


class LogManager:
    """统一日志管理器"""
    
    _loggers = {}
    
    @classmethod
    def get_logger(
        cls,
        name: str = 'quizmaster',
        level: int = logging.INFO,
        log_file: Optional[str] = None,
        max_size_mb: int = 10,
        backup_count: int = 5,
    ) -> logging.Logger:
        """获取日志记录器"""
        if name in cls._loggers:
            return cls._loggers[name]
        
        logger = logging.getLogger(name)
        logger.setLevel(level)
        logger.propagate = False
        
        # 避免重复添加 handler
        if logger.handlers:
            cls._loggers[name] = logger
            return logger
        
        # 格式化器
        formatter = logging.Formatter(
            fmt='%(asctime)s | %(levelname)-8s | %(name)s | %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        
        # 控制台 handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(level)
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)
        
        # 文件 handler（可选）
        if log_file:
            try:
                # 确保目录存在
                log_dir = os.path.dirname(log_file)
                if log_dir:
                    os.makedirs(log_dir, exist_ok=True)
                
                file_handler = RotatingFileHandler(
                    log_file,
                    maxBytes=max_size_mb * 1024 * 1024,
                    backupCount=backup_count,
                    encoding='utf-8'
                )
                file_handler.setLevel(level)
                file_handler.setFormatter(formatter)
                logger.addHandler(file_handler)
            except Exception as e:
                print(f"警告: 无法创建日志文件: {e}")
        
        cls._loggers[name] = logger
        return logger
    
    @classmethod
    def set_level(cls, name: str, level: int):
        """设置日志级别"""
        if name in cls._loggers:
            cls._loggers[name].setLevel(level)
    
    @classmethod
    def close_all(cls):
        """关闭所有日志处理器"""
        for logger in cls._loggers.values():
            for handler in logger.handlers[:]:
                try:
                    handler.close()
                    logger.removeHandler(handler)
                except Exception:
                    pass
        cls._loggers.clear()


def get_logger(name: str = 'quizmaster') -> logging.Logger:
    """快捷获取日志记录器"""
    return LogManager.get_logger(name)


# 便捷日志函数
def debug(msg: str, *args, **kwargs):
    get_logger().debug(msg, *args, **kwargs)


def info(msg: str, *args, **kwargs):
    get_logger().info(msg, *args, **kwargs)


def warning(msg: str, *args, **kwargs):
    get_logger().warning(msg, *args, **kwargs)


def error(msg: str, *args, **kwargs):
    get_logger().error(msg, *args, **kwargs)


def critical(msg: str, *args, **kwargs):
    get_logger().critical(msg, *args, **kwargs)
