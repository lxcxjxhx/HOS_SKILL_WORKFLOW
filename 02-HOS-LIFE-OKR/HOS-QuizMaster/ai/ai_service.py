#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI 服务抽象层 - HOS-QuizMaster V2
Phase 9: AI 接口设计

定义 AI 服务的统一接口（ABC 抽象类），支持多种 AI 提供商。
包含：
- 抽象基类 AIService
- AI 服务工厂 AIServiceFactory
- 统一的错误类型
- 重试机制
"""

import time
import logging
from abc import ABC, abstractmethod
from typing import List, Dict, Optional, Any, Generator
from dataclasses import dataclass

from .ai_config import AIConfigManager, AIProviderConfig, PROVIDER_OPENAI, PROVIDER_LOCAL

logger = logging.getLogger(__name__)


# ===== 自定义异常 =====
class AIServiceError(Exception):
    """AI 服务基础异常"""
    pass


class AIServiceConnectionError(AIServiceError):
    """连接错误（网络问题、API Key 无效等）"""
    pass


class AIServiceRateLimitError(AIServiceError):
    """速率限制错误"""
    pass


class AIServiceResponseError(AIServiceError):
    """响应解析错误"""
    pass


class AIServiceTimeoutError(AIServiceError):
    """请求超时错误"""
    pass


# ===== 数据类 =====
@dataclass
class AIMessage:
    """AI 对话消息"""
    role: str  # 'system', 'user', 'assistant'
    content: str

    def to_dict(self) -> Dict[str, str]:
        return {'role': self.role, 'content': self.content}


@dataclass
class AIResponse:
    """AI 响应结果"""
    content: str
    model: str = ''
    usage: Dict[str, int] = None  # {'prompt_tokens': N, 'completion_tokens': N, 'total_tokens': N}
    finish_reason: str = ''
    raw_response: Any = None

    def __post_init__(self):
        if self.usage is None:
            self.usage = {}


class AIService(ABC):
    """
    AI 服务抽象基类
    所有 AI 提供商适配器必须继承此类并实现抽象方法
    """

    def __init__(self, config: AIProviderConfig):
        """
        初始化 AI 服务

        Args:
            config: AI 提供商配置
        """
        self.config = config
        self._retry_count = 3
        self._retry_delay = 1.0  # 秒

    @property
    def provider_name(self) -> str:
        """提供商名称"""
        return self.config.provider

    # ===== 核心抽象方法 =====

    @abstractmethod
    def chat(self, messages: List[AIMessage], **kwargs) -> AIResponse:
        """
        发送对话请求（非流式）

        Args:
            messages: 对话消息列表
            **kwargs: 额外参数（如 temperature, max_tokens 等）

        Returns:
            AIResponse 对象

        Raises:
            AIServiceError: 请求失败时抛出
        """
        pass

    @abstractmethod
    def chat_stream(self, messages: List[AIMessage], **kwargs) -> Generator[str, None, None]:
        """
        发送对话请求（流式）

        Args:
            messages: 对话消息列表
            **kwargs: 额外参数

        Yields:
            响应内容片段
        """
        pass

    @abstractmethod
    def test_connection(self) -> Dict[str, Any]:
        """
        测试连接是否正常

        Returns:
            包含 success, message 的字典
        """
        pass

    # ===== 业务方法（基于核心方法实现）=====

    def generate_questions(self, topic: str, count: int = 10,
                           difficulty: str = 'medium', **kwargs) -> AIResponse:
        """
        生成题目

        Args:
            topic: 题目主题/知识点
            count: 题目数量
            difficulty: 难度 ('easy', 'medium', 'hard')
            **kwargs: 额外参数

        Returns:
            AIResponse，content 包含生成的题目文本
        """
        prompt = self._build_question_prompt(topic, count, difficulty)
        messages = [
            AIMessage(role='system', content=self._get_question_system_prompt()),
            AIMessage(role='user', content=prompt),
        ]
        return self.chat(messages, **kwargs)

    def analyze_knowledge_points(self, text: str, **kwargs) -> AIResponse:
        """
        分析文本中的知识点

        Args:
            text: 待分析的文本
            **kwargs: 额外参数

        Returns:
            AIResponse，content 包含知识点分析结果
        """
        prompt = f"请分析以下文本中的关键知识点，并以结构化方式列出：\n\n{text}"
        messages = [
            AIMessage(role='system', content='你是一个专业的教育分析助手，擅长从文本中提取关键知识点。'),
            AIMessage(role='user', content=prompt),
        ]
        return self.chat(messages, **kwargs)

    def parse_questions(self, raw_text: str, **kwargs) -> AIResponse:
        """
        解析/格式化题目文本

        Args:
            raw_text: 原始题目文本
            **kwargs: 额外参数

        Returns:
            AIResponse，content 包含解析后的结构化题目
        """
        prompt = (
            "请将以下题目文本解析为结构化格式。每道题包含：题号、题型（单选/多选/判断）、"
            "题干、选项（A/B/C/D）、答案、解析。\n\n"
            f"题目文本：\n{raw_text}"
        )
        messages = [
            AIMessage(role='system', content='你是一个专业的题目解析助手。'),
            AIMessage(role='user', content=prompt),
        ]
        return self.chat(messages, **kwargs)

    # ===== 重试机制 =====

    def _call_with_retry(self, func, *args, **kwargs):
        """
        带重试机制的函数调用

        Args:
            func: 要调用的函数
            *args, **kwargs: 函数参数

        Returns:
            函数返回值

        Raises:
            AIServiceError: 重试耗尽后仍然失败
        """
        last_error = None
        for attempt in range(1, self._retry_count + 1):
            try:
                return func(*args, **kwargs)
            except AIServiceRateLimitError as e:
                # 速率限制，等待更长时间后重试
                wait_time = self._retry_delay * (2 ** (attempt - 1))
                logger.warning(f"速率限制，第 {attempt}/{self._retry_count} 次重试，等待 {wait_time}s: {e}")
                time.sleep(wait_time)
                last_error = e
            except AIServiceConnectionError as e:
                # 连接错误，等待后重试
                wait_time = self._retry_delay * attempt
                logger.warning(f"连接错误，第 {attempt}/{self._retry_count} 次重试，等待 {wait_time}s: {e}")
                time.sleep(wait_time)
                last_error = e
            except AIServiceTimeoutError as e:
                # 超时错误，等待后重试
                wait_time = self._retry_delay * attempt
                logger.warning(f"请求超时，第 {attempt}/{self._retry_count} 次重试，等待 {wait_time}s: {e}")
                time.sleep(wait_time)
                last_error = e
            except AIServiceError:
                # 其他 AI 服务错误不重试，直接抛出
                raise

        raise last_error

    def set_retry_params(self, count: int = 3, delay: float = 1.0):
        """
        设置重试参数

        Args:
            count: 最大重试次数
            delay: 重试间隔（秒）
        """
        self._retry_count = max(1, count)
        self._retry_delay = max(0.1, delay)

    # ===== Prompt 构建辅助方法 =====

    def _get_question_system_prompt(self) -> str:
        """获取题目生成的系统提示"""
        return (
            '你是一个专业的考试题库生成助手。你需要根据用户的要求生成高质量的考试题目。'
            '题目格式要求：\n'
            '1. 每道题包含题号、题型（单选/多选/判断）、题干\n'
            '2. 选择题需要 A/B/C/D 四个选项\n'
            '3. 每道题需要标注正确答案\n'
            '4. 每道题需要简要解析\n'
            '5. 题目难度要适中，符合考试要求\n'
            '请以清晰的文本格式输出题目。'
        )

    def _build_question_prompt(self, topic: str, count: int, difficulty: str) -> str:
        """构建题目生成提示"""
        difficulty_map = {
            'easy': '简单',
            'medium': '中等',
            'hard': '困难',
        }
        diff_text = difficulty_map.get(difficulty, '中等')
        return f"请围绕「{topic}」生成 {count} 道{diff_text}难度的考试题目。"


class AIServiceFactory:
    """
    AI 服务工厂
    根据配置创建对应的 AI 服务实例
    """

    # 注册表：延迟导入以避免循环依赖
    _registry = {}

    @classmethod
    def register(cls, provider: str, service_class):
        """
        注册 AI 服务适配器

        Args:
            provider: 提供商名称
            service_class: 服务类（AIService 的子类）
        """
        if not issubclass(service_class, AIService):
            raise TypeError(f"{service_class} 必须是 AIService 的子类")
        cls._registry[provider] = service_class
        logger.debug(f"已注册 AI 服务适配器: {provider}")

    @classmethod
    def create(cls, config_manager: AIConfigManager,
               provider: Optional[str] = None) -> AIService:
        """
        创建 AI 服务实例

        Args:
            config_manager: AI 配置管理器
            provider: 提供商名称，默认使用当前激活的提供商

        Returns:
            AIService 实例

        Raises:
            AIServiceError: 不支持的提供商
        """
        if provider is None:
            provider = config_manager.get_config().active_provider

        provider_config = config_manager.get_config().providers.get(provider)
        if not provider_config:
            raise AIServiceError(f"未找到提供商配置: {provider}")

        # 延迟加载适配器
        cls._ensure_registered(provider)

        service_class = cls._registry.get(provider)
        if not service_class:
            raise AIServiceError(f"不支持的 AI 提供商: {provider}")

        return service_class(provider_config)

    @classmethod
    def _ensure_registered(cls, provider: str):
        """确保适配器已注册（延迟导入）"""
        if provider in cls._registry:
            return

        if provider == PROVIDER_OPENAI:
            from .openai_adapter import OpenAIAdapter
            cls.register(PROVIDER_OPENAI, OpenAIAdapter)
        elif provider == PROVIDER_LOCAL:
            from .local_model_adapter import LocalModelAdapter
            cls.register(PROVIDER_LOCAL, LocalModelAdapter)

    @classmethod
    def get_supported_providers(cls) -> List[str]:
        """获取已注册的提供商列表"""
        # 确保所有内置适配器都已注册
        cls._ensure_registered(PROVIDER_OPENAI)
        cls._ensure_registered(PROVIDER_LOCAL)
        return list(cls._registry.keys())
