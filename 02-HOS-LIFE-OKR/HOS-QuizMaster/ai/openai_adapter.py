#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
OpenAI API 适配器 - HOS-QuizMaster V2
Phase 9: AI 接口设计

实现 OpenAI API 调用，支持：
- 自定义 API Key 和 endpoint（兼容 OpenAI 兼容 API）
- 流式响应
- 题目生成、解析生成、知识点分析等功能
- 完善的错误处理
"""

import json
import logging
from typing import List, Dict, Optional, Any, Generator

from .ai_config import AIProviderConfig
from .ai_service import (
    AIService, AIMessage, AIResponse,
    AIServiceError, AIServiceConnectionError,
    AIServiceRateLimitError, AIServiceResponseError,
    AIServiceTimeoutError,
)

logger = logging.getLogger(__name__)

# 尝试导入 openai 库
try:
    import openai
    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False
    logger.warning("openai 库未安装，OpenAI 适配器将不可用。请运行: pip install openai")


class OpenAIAdapter(AIService):
    """
    OpenAI API 适配器
    支持 OpenAI 官方 API 及所有 OpenAI 兼容的 API（如中转站、Azure OpenAI 等）
    """

    def __init__(self, config: AIProviderConfig):
        """
        初始化 OpenAI 适配器

        Args:
            config: AI 提供商配置
        """
        super().__init__(config)
        self._client = None
        self._init_client()

    def _init_client(self):
        """初始化 OpenAI 客户端"""
        if not HAS_OPENAI:
            logger.error("openai 库未安装")
            return

        try:
            self._client = openai.OpenAI(
                api_key=self.config.api_key or 'not-needed',
                base_url=self.config.base_url,
                timeout=self.config.timeout,
                max_retries=0,  # 我们自己管理重试
            )
            logger.info(f"OpenAI 客户端已初始化: {self.config.base_url}")
        except Exception as e:
            logger.error(f"初始化 OpenAI 客户端失败: {e}")
            self._client = None

    def _ensure_client(self):
        """确保客户端可用"""
        if self._client is None:
            if not HAS_OPENAI:
                raise AIServiceConnectionError(
                    "openai 库未安装，请运行: pip install openai"
                )
            # 尝试重新初始化
            self._init_client()
            if self._client is None:
                raise AIServiceConnectionError("OpenAI 客户端初始化失败")

    def _build_messages(self, messages: List[AIMessage]) -> List[Dict[str, str]]:
        """将 AIMessage 列表转为 OpenAI API 格式"""
        return [msg.to_dict() for msg in messages]

    def _handle_openai_error(self, error) -> None:
        """
        将 OpenAI 异常转为自定义异常

        Args:
            error: openai 库抛出的异常

        Raises:
            AIServiceError 的子类
        """
        if not HAS_OPENAI:
            raise AIServiceError(f"openai 库异常: {error}")

        # 根据 openai 异常类型映射
        if isinstance(error, openai.AuthenticationError):
            raise AIServiceConnectionError(f"API Key 无效: {error.message}") from error
        elif isinstance(error, openai.RateLimitError):
            raise AIServiceRateLimitError(f"速率限制: {error.message}") from error
        elif isinstance(error, openai.APITimeoutError):
            raise AIServiceTimeoutError(f"请求超时: {error.message}") from error
        elif isinstance(error, openai.APIConnectionError):
            raise AIServiceConnectionError(
                f"连接失败，请检查网络和 Base URL: {error}"
            ) from error
        elif isinstance(error, openai.BadRequestError):
            raise AIServiceResponseError(f"请求参数错误: {error.message}") from error
        elif isinstance(error, openai.APIStatusError):
            raise AIServiceError(
                f"API 错误 (HTTP {error.status_code}): {error.message}"
            ) from error
        else:
            raise AIServiceError(f"OpenAI API 未知错误: {error}") from error

    # ===== 核心方法实现 =====

    def chat(self, messages: List[AIMessage], **kwargs) -> AIResponse:
        """
        发送对话请求（非流式）

        Args:
            messages: 对话消息列表
            **kwargs: 额外参数（temperature, max_tokens 等）

        Returns:
            AIResponse 对象
        """
        self._ensure_client()

        # 合并默认参数和调用参数
        params = self._build_params(messages, stream=False, **kwargs)

        try:
            response = self._call_with_retry(self._client.chat.completions.create, **params)

            # 解析响应
            choice = response.choices[0] if response.choices else None
            content = choice.message.content if choice else ''
            usage = {}
            if response.usage:
                usage = {
                    'prompt_tokens': response.usage.prompt_tokens,
                    'completion_tokens': response.usage.completion_tokens,
                    'total_tokens': response.usage.total_tokens,
                }

            return AIResponse(
                content=content or '',
                model=response.model or self.config.model,
                usage=usage,
                finish_reason=choice.finish_reason if choice else '',
                raw_response=response,
            )
        except AIServiceError:
            raise
        except Exception as e:
            self._handle_openai_error(e)

    def chat_stream(self, messages: List[AIMessage], **kwargs) -> Generator[str, None, None]:
        """
        发送对话请求（流式）

        Args:
            messages: 对话消息列表
            **kwargs: 额外参数

        Yields:
            响应内容片段
        """
        self._ensure_client()

        params = self._build_params(messages, stream=True, **kwargs)

        try:
            response = self._client.chat.completions.create(**params)

            for chunk in response:
                if chunk.choices and len(chunk.choices) > 0:
                    delta = chunk.choices[0].delta
                    if delta and delta.content:
                        yield delta.content
        except AIServiceError:
            raise
        except Exception as e:
            self._handle_openai_error(e)

    def test_connection(self) -> Dict[str, Any]:
        """
        测试与 OpenAI API 的连接

        Returns:
            包含 success, message 的字典
        """
        self._ensure_client()

        try:
            # 发送一个最小化的请求来测试连接
            test_messages = [{'role': 'user', 'content': 'Hi'}]
            response = self._client.chat.completions.create(
                model=self.config.model,
                messages=test_messages,
                max_tokens=5,
                timeout=min(self.config.timeout, 15),
            )

            if response.choices:
                return {
                    'success': True,
                    'message': f'连接成功！模型: {response.model}',
                }
            else:
                return {'success': False, 'message': '连接成功但响应异常'}

        except Exception as e:
            try:
                self._handle_openai_error(e)
            except AIServiceError as ai_err:
                return {'success': False, 'message': f'连接失败: {ai_err}'}

    # ===== 辅助方法 =====

    def _build_params(self, messages: List[AIMessage], stream: bool = False,
                      **kwargs) -> Dict[str, Any]:
        """
        构建 API 调用参数

        Args:
            messages: 消息列表
            stream: 是否流式
            **kwargs: 覆盖参数

        Returns:
            API 调用参数字典
        """
        params = {
            'model': self.config.model,
            'messages': self._build_messages(messages),
            'temperature': kwargs.get('temperature', self.config.temperature),
            'max_tokens': kwargs.get('max_tokens', self.config.max_tokens),
            'stream': stream,
        }

        # 流式时需要设置 stream_options 以获取 usage
        if stream:
            params['stream_options'] = {'include_usage': True}

        # 合并额外参数
        if self.config.extra_params:
            for key, value in self.config.extra_params.items():
                if key not in params:
                    params[key] = value

        # 调用参数覆盖
        for key in ('top_p', 'frequency_penalty', 'presence_penalty', 'stop'):
            if key in kwargs:
                params[key] = kwargs[key]

        return params
