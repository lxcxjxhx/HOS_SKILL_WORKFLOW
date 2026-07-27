#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
本地模型适配器 - HOS-QuizMaster V2
Phase 9: AI 接口设计

占位实现，支持未来集成 Ollama 等本地模型。
当前提供模拟实现用于测试。

支持的本地模型后端（计划）：
- Ollama (http://localhost:11434/v1)
- LM Studio (http://localhost:1234/v1)
- vLLM
- llama.cpp server
"""

import time
import random
import logging
from typing import List, Dict, Any, Generator

from .ai_config import AIProviderConfig
from .ai_service import (
    AIService, AIMessage, AIResponse,
    AIServiceError, AIServiceConnectionError,
)

logger = logging.getLogger(__name__)


class LocalModelAdapter(AIService):
    """
    本地模型适配器
    当前为模拟实现，未来将集成 Ollama 等本地模型服务

    本地模型通常使用 OpenAI 兼容 API，因此底层实现与 OpenAI 适配器类似，
    但增加了本地模型特有的功能（如模型列表查询、模型拉取等）。
    """

    def __init__(self, config: AIProviderConfig):
        """
        初始化本地模型适配器

        Args:
            config: AI 提供商配置
        """
        super().__init__(config)
        self._mock_mode = True  # 当前为模拟模式
        self._client = None

        # 尝试初始化 OpenAI 兼容客户端（Ollama 等支持 OpenAI 兼容 API）
        self._try_init_client()

    def _try_init_client(self):
        """尝试初始化 OpenAI 兼容客户端"""
        try:
            import openai
            self._client = openai.OpenAI(
                api_key=self.config.api_key or 'ollama',
                base_url=self.config.base_url,
                timeout=self.config.timeout,
                max_retries=0,
            )
            # 尝试连接以检查服务是否可用
            self._mock_mode = False
            logger.info(f"本地模型客户端已初始化: {self.config.base_url}")
        except ImportError:
            logger.warning("openai 库未安装，本地模型适配器将使用模拟模式")
            self._mock_mode = True
        except Exception as e:
            logger.warning(f"本地模型客户端初始化失败，使用模拟模式: {e}")
            self._mock_mode = True

    @property
    def is_mock_mode(self) -> bool:
        """是否处于模拟模式"""
        return self._mock_mode

    # ===== 核心方法实现 =====

    def chat(self, messages: List[AIMessage], **kwargs) -> AIResponse:
        """
        发送对话请求

        Args:
            messages: 对话消息列表
            **kwargs: 额外参数

        Returns:
            AIResponse 对象
        """
        if self._mock_mode:
            return self._mock_chat(messages, **kwargs)

        # 实际调用（使用 OpenAI 兼容 API）
        return self._real_chat(messages, **kwargs)

    def chat_stream(self, messages: List[AIMessage], **kwargs) -> Generator[str, None, None]:
        """
        发送对话请求（流式）

        Args:
            messages: 对话消息列表
            **kwargs: 额外参数

        Yields:
            响应内容片段
        """
        if self._mock_mode:
            yield from self._mock_chat_stream(messages, **kwargs)
            return

        # 实际调用
        yield from self._real_chat_stream(messages, **kwargs)

    def test_connection(self) -> Dict[str, Any]:
        """
        测试与本地模型的连接

        Returns:
            包含 success, message 的字典
        """
        if self._mock_mode:
            return {
                'success': True,
                'message': '模拟模式 - 本地模型服务未连接，使用模拟响应',
            }

        try:
            # 尝试列出模型
            if self._client:
                models = self._client.models.list()
                model_names = [m.id for m in models.data] if models.data else []
                return {
                    'success': True,
                    'message': f'连接成功！可用模型: {", ".join(model_names[:5])}',
                }
            return {'success': False, 'message': '客户端未初始化'}
        except Exception as e:
            return {'success': False, 'message': f'连接失败: {e}'}

    # ===== 实际调用方法 =====

    def _real_chat(self, messages: List[AIMessage], **kwargs) -> AIResponse:
        """实际的 API 调用"""
        if not self._client:
            raise AIServiceConnectionError("本地模型客户端未初始化")

        try:
            params = {
                'model': self.config.model,
                'messages': [msg.to_dict() for msg in messages],
                'temperature': kwargs.get('temperature', self.config.temperature),
                'max_tokens': kwargs.get('max_tokens', self.config.max_tokens),
                'stream': False,
            }

            response = self._call_with_retry(self._client.chat.completions.create, **params)

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
            raise AIServiceConnectionError(f"本地模型调用失败: {e}") from e

    def _real_chat_stream(self, messages: List[AIMessage],
                          **kwargs) -> Generator[str, None, None]:
        """实际的流式 API 调用"""
        if not self._client:
            raise AIServiceConnectionError("本地模型客户端未初始化")

        try:
            params = {
                'model': self.config.model,
                'messages': [msg.to_dict() for msg in messages],
                'temperature': kwargs.get('temperature', self.config.temperature),
                'max_tokens': kwargs.get('max_tokens', self.config.max_tokens),
                'stream': True,
            }

            response = self._client.chat.completions.create(**params)
            for chunk in response:
                if chunk.choices and len(chunk.choices) > 0:
                    delta = chunk.choices[0].delta
                    if delta and delta.content:
                        yield delta.content
        except AIServiceError:
            raise
        except Exception as e:
            raise AIServiceConnectionError(f"本地模型流式调用失败: {e}") from e

    # ===== 模拟方法（用于测试）=====

    def _mock_chat(self, messages: List[AIMessage], **kwargs) -> AIResponse:
        """模拟对话响应"""
        # 获取最后一条用户消息
        user_msg = ''
        for msg in reversed(messages):
            if msg.role == 'user':
                user_msg = msg.content
                break

        # 根据消息内容生成模拟响应
        content = self._generate_mock_response(user_msg)

        # 模拟延迟
        time.sleep(0.5)

        return AIResponse(
            content=content,
            model=f'{self.config.model} (模拟)',
            usage={
                'prompt_tokens': len(user_msg) // 2,
                'completion_tokens': len(content) // 2,
                'total_tokens': (len(user_msg) + len(content)) // 2,
            },
            finish_reason='stop',
        )

    def _mock_chat_stream(self, messages: List[AIMessage],
                          **kwargs) -> Generator[str, None, None]:
        """模拟流式对话响应"""
        user_msg = ''
        for msg in reversed(messages):
            if msg.role == 'user':
                user_msg = msg.content
                break

        content = self._generate_mock_response(user_msg)

        # 逐字符输出模拟流式效果
        for char in content:
            time.sleep(0.02)
            yield char

    def _generate_mock_response(self, user_message: str) -> str:
        """
        根据用户消息生成模拟响应

        Args:
            user_message: 用户消息

        Returns:
            模拟响应文本
        """
        # 简单的关键词匹配
        if '生成' in user_message and '题目' in user_message:
            return self._mock_questions()
        elif '知识点' in user_message or '分析' in user_message:
            return self._mock_knowledge_analysis()
        elif '解析' in user_message:
            return self._mock_parse_result()
        else:
            return (
                "【模拟响应】这是本地模型适配器的模拟回复。"
                "实际使用时，请确保本地模型服务（如 Ollama）已启动并正确配置。"
                f"\n\n您的消息：{user_message[:100]}"
            )

    def _mock_questions(self) -> str:
        """模拟题目生成"""
        return """【模拟题目 - 本地模型适配器】

1. (单选) 以下哪个是 Python 的内置数据类型？
A. 数组 (Array)
B. 列表 (List)
C. 链表 (LinkedList)
D. 树 (Tree)
答案: B
解析: Python 内置数据类型包括 list、dict、tuple、set 等。数组需要通过 numpy 等库实现。

2. (判断) Python 中的元组 (tuple) 是不可变的。
答案: 正确
解析: 元组创建后不能修改其元素，这是元组与列表的主要区别。

3. (单选) 以下哪个关键字用于定义函数？
A. class
B. def
C. function
D. define
答案: B
解析: Python 使用 def 关键字定义函数。

（注意：这是模拟数据，实际使用时 AI 模型会生成真实题目）"""

    def _mock_knowledge_analysis(self) -> str:
        """模拟知识点分析"""
        return """【模拟知识点分析 - 本地模型适配器】

关键知识点：
1. Python 基础语法 - 变量、数据类型、运算符
2. 控制流 - 条件语句、循环语句
3. 函数 - 定义、参数、返回值
4. 数据结构 - 列表、字典、元组、集合
5. 面向对象 - 类、对象、继承、多态

（注意：这是模拟数据，实际使用时 AI 模型会生成真实分析结果）"""

    def _mock_parse_result(self) -> str:
        """模拟题目解析"""
        return """【模拟解析结果 - 本地模型适配器】

已解析题目结构：
- 题号: 1
- 题型: 单选
- 题干: ...
- 选项: A/B/C/D
- 答案: B
- 解析: ...

（注意：这是模拟数据，实际使用时 AI 模型会生成真实解析结果）"""

    # ===== 本地模型特有方法 =====

    def list_local_models(self) -> List[str]:
        """
        列出本地可用的模型

        Returns:
            模型名称列表
        """
        if self._mock_mode or not self._client:
            return ['模拟模型 (mock-mode)']

        try:
            models = self._client.models.list()
            return [m.id for m in models.data] if models.data else []
        except Exception as e:
            logger.error(f"获取本地模型列表失败: {e}")
            return []
