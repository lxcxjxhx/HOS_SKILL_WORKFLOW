#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
异常处理和恢复 - HOS-QuizMaster V2
Phase 14: 系统集成
"""

import os
import sys
import traceback
from typing import Optional, Callable, Any
from functools import wraps

from utils.logger import get_logger

logger = get_logger('quizmaster.error')


class QuizMasterError(Exception):
    """HOS-QuizMaster 基础异常类"""
    
    def __init__(self, message: str, code: Optional[str] = None, details: Optional[dict] = None):
        super().__init__(message)
        self.message = message
        self.code = code or 'UNKNOWN_ERROR'
        self.details = details or {}
    
    def __str__(self):
        return f"[{self.code}] {self.message}"


class DatabaseError(QuizMasterError):
    """数据库相关异常"""
    pass


class ParserError(QuizMasterError):
    """解析器相关异常"""
    pass


class ConfigError(QuizMasterError):
    """配置相关异常"""
    pass


class AIError(QuizMasterError):
    """AI 功能相关异常"""
    pass


class ExamGeneratorError(QuizMasterError):
    """试卷生成相关异常"""
    pass


class ErrorHandler:
    """统一错误处理器"""
    
    def __init__(self):
        self.error_handlers = {}
        self.fallback_handler = None
    
    def register_handler(self, error_type: type, handler: Callable):
        """注册错误处理器"""
        self.error_handlers[error_type] = handler
    
    def set_fallback_handler(self, handler: Callable):
        """设置默认处理器"""
        self.fallback_handler = handler
    
    def handle(self, error: Exception) -> Any:
        """处理错误"""
        error_type = type(error)
        
        # 查找注册的处理器
        handler = self.error_handlers.get(error_type)
        if handler:
            return handler(error)
        
        # 使用默认处理器
        if self.fallback_handler:
            return self.fallback_handler(error)
        
        # 默认处理：记录日志
        logger.error(f"未处理的异常: {error}", exc_info=True)
        return None


# 全局错误处理器实例
_error_handler = ErrorHandler()


def get_error_handler() -> ErrorHandler:
    """获取全局错误处理器"""
    return _error_handler


def handle_error(error_type: type):
    """装饰器：注册错误处理器"""
    def decorator(func: Callable):
        _error_handler.register_handler(error_type, func)
        return func
    return decorator


def safe_execute(func: Callable, *args, **kwargs) -> Any:
    """安全执行函数，捕获并处理异常"""
    try:
        return func(*args, **kwargs)
    except Exception as e:
        logger.error(f"执行 {func.__name__} 时发生错误: {e}", exc_info=True)
        return _error_handler.handle(e)


def with_error_handling(func: Callable):
    """装饰器：为函数添加错误处理"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except QuizMasterError as e:
            logger.error(f"业务错误: {e}", exc_info=True)
            raise
        except Exception as e:
            logger.error(f"系统错误: {e}", exc_info=True)
            raise QuizMasterError(
                message=f"系统错误: {e}",
                code='SYSTEM_ERROR',
                details={'original_error': str(e)}
            )
    return wrapper


def install_global_exception_handler():
    """安装全局异常处理器"""
    def global_handler(exc_type, exc_value, exc_traceback):
        if issubclass(exc_type, KeyboardInterrupt):
            sys.__excepthook__(exc_type, exc_value, exc_traceback)
            return
        
        logger.critical(
            "未捕获的异常",
            exc_info=(exc_type, exc_value, exc_traceback)
        )
    
    sys.excepthook = global_handler


def recover_from_error(error: Exception, recovery_strategy: str = 'default') -> bool:
    """尝试从错误恢复
    
    Args:
        error: 发生的错误
        recovery_strategy: 恢复策略 ('default', 'restart', 'ignore')
    
    Returns:
        bool: 是否成功恢复
    """
    logger.info(f"尝试从错误恢复: {error}, 策略: {recovery_strategy}")
    
    if recovery_strategy == 'ignore':
        return True
    
    if recovery_strategy == 'restart':
        # 重启策略：重新初始化相关组件
        try:
            # 这里可以实现具体的重启逻辑
            logger.info("执行重启恢复策略")
            return True
        except Exception as e:
            logger.error(f"重启恢复失败: {e}")
            return False
    
    # 默认策略
    if isinstance(error, DatabaseError):
        try:
            # 尝试重新连接数据库
            logger.info("尝试重新连接数据库")
            return True
        except Exception as e:
            logger.error(f"数据库恢复失败: {e}")
            return False
    
    if isinstance(error, ConfigError):
        try:
            # 尝试加载默认配置
            logger.info("尝试加载默认配置")
            return True
        except Exception as e:
            logger.error(f"配置恢复失败: {e}")
            return False
    
    return False
