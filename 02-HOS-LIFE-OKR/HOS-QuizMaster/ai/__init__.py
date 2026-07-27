#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI 包 - HOS-QuizMaster V2
Phase 9: AI 接口设计

提供 AI 服务抽象层和多提供商支持
"""

from .ai_config import (
    AIConfig,
    AIProviderConfig,
    AIConfigManager,
    PROVIDER_OPENAI,
    PROVIDER_LOCAL,
    SUPPORTED_PROVIDERS,
)

from .ai_service import (
    AIService,
    AIServiceFactory,
    AIMessage,
    AIResponse,
    AIServiceError,
    AIServiceConnectionError,
    AIServiceRateLimitError,
    AIServiceResponseError,
    AIServiceTimeoutError,
)

from .openai_adapter import OpenAIAdapter
from .local_model_adapter import LocalModelAdapter

__all__ = [
    # 配置相关
    'AIConfig',
    'AIProviderConfig',
    'AIConfigManager',
    'PROVIDER_OPENAI',
    'PROVIDER_LOCAL',
    'SUPPORTED_PROVIDERS',
    # 服务相关
    'AIService',
    'AIServiceFactory',
    'AIMessage',
    'AIResponse',
    # 异常
    'AIServiceError',
    'AIServiceConnectionError',
    'AIServiceRateLimitError',
    'AIServiceResponseError',
    'AIServiceTimeoutError',
    # 适配器
    'OpenAIAdapter',
    'LocalModelAdapter',
]
