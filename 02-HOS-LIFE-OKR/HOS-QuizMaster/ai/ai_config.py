#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI 配置管理模块 - HOS-QuizMaster V2
Phase 9: AI 接口设计

负责：
- API Key 安全存储（使用系统 keyring 或加密文件）
- 模型配置管理
- 提供商切换
- 配置持久化
"""

import json
import os
import base64
import logging
from pathlib import Path
from typing import Dict, Optional, Any
from dataclasses import dataclass, field, asdict

logger = logging.getLogger(__name__)


# ===== 默认配置常量 =====
DEFAULT_CONFIG_DIR = Path.home() / '.quizmaster'
DEFAULT_CONFIG_FILE = DEFAULT_CONFIG_DIR / 'ai_config.json'

# 支持的 AI 提供商
PROVIDER_OPENAI = 'openai'
PROVIDER_LOCAL = 'local'
SUPPORTED_PROVIDERS = [PROVIDER_OPENAI, PROVIDER_LOCAL]

# OpenAI 默认配置
DEFAULT_OPENAI_MODELS = [
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-3.5-turbo',
]
DEFAULT_OPENAI_BASE_URL = 'https://api.openai.com/v1'

# 本地模型默认配置
DEFAULT_LOCAL_MODELS = [
    'qwen2.5:7b',
    'llama3.1:8b',
    'mistral:7b',
]
DEFAULT_LOCAL_BASE_URL = 'http://localhost:11434/v1'  # Ollama 默认地址


@dataclass
class AIProviderConfig:
    """单个 AI 提供商的配置"""
    provider: str = PROVIDER_OPENAI
    api_key: str = ''
    base_url: str = DEFAULT_OPENAI_BASE_URL
    model: str = 'gpt-4o-mini'
    temperature: float = 0.7
    max_tokens: int = 4096
    timeout: int = 60
    # 额外参数（如自定义 header 等）
    extra_params: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """转为字典（不含敏感信息用于日志）"""
        return {
            'provider': self.provider,
            'base_url': self.base_url,
            'model': self.model,
            'temperature': self.temperature,
            'max_tokens': self.max_tokens,
            'timeout': self.timeout,
        }


@dataclass
class AIConfig:
    """AI 全局配置"""
    active_provider: str = PROVIDER_OPENAI
    providers: Dict[str, AIProviderConfig] = field(default_factory=dict)
    # 全局开关
    ai_enabled: bool = False
    # 自动保存答题记录到 AI 分析
    auto_analyze: bool = False

    def __post_init__(self):
        """初始化默认提供商配置"""
        if not self.providers:
            self.providers = {
                PROVIDER_OPENAI: AIProviderConfig(
                    provider=PROVIDER_OPENAI,
                    base_url=DEFAULT_OPENAI_BASE_URL,
                ),
                PROVIDER_LOCAL: AIProviderConfig(
                    provider=PROVIDER_LOCAL,
                    base_url=DEFAULT_LOCAL_BASE_URL,
                    model='qwen2.5:7b',
                ),
            }

    def get_active_config(self) -> AIProviderConfig:
        """获取当前激活的提供商配置"""
        return self.providers.get(self.active_provider, AIProviderConfig())

    def set_active_provider(self, provider: str):
        """切换激活的提供商"""
        if provider in self.providers:
            self.active_provider = provider
        else:
            logger.warning(f"未知的提供商: {provider}")


class SimpleCipher:
    """
    简易加密/解密工具（基于 base64 + 简单 XOR）
    注意：这不是生产级加密，仅用于避免明文存储 API Key。
    生产环境建议使用 keyring 或系统凭据管理器。
    """

    # 固定密钥（实际项目中应从环境变量或安全存储获取）
    _KEY = b'QuizMaster2026!'

    @classmethod
    def encrypt(cls, plaintext: str) -> str:
        """加密字符串"""
        if not plaintext:
            return ''
        data = plaintext.encode('utf-8')
        key = cls._KEY
        encrypted = bytes([data[i] ^ key[i % len(key)] for i in range(len(data))])
        return base64.b64encode(encrypted).decode('ascii')

    @classmethod
    def decrypt(cls, ciphertext: str) -> str:
        """解密字符串"""
        if not ciphertext:
            return ''
        try:
            data = base64.b64decode(ciphertext.encode('ascii'))
            key = cls._KEY
            decrypted = bytes([data[i] ^ key[i % len(key)] for i in range(len(data))])
            return decrypted.decode('utf-8')
        except Exception as e:
            logger.error(f"解密失败: {e}")
            return ''


class AIConfigManager:
    """
    AI 配置管理器
    负责配置的加载、保存、API Key 安全存储
    """

    def __init__(self, config_path: Optional[str] = None):
        """
        初始化配置管理器

        Args:
            config_path: 配置文件路径，默认 ~/.quizmaster/ai_config.json
        """
        if config_path:
            self.config_path = Path(config_path)
        else:
            self.config_path = DEFAULT_CONFIG_FILE

        self.config = AIConfig()
        self._cipher = SimpleCipher()

        # 确保配置目录存在
        self.config_path.parent.mkdir(parents=True, exist_ok=True)

        # 加载已有配置
        self.load()

    def load(self) -> AIConfig:
        """从文件加载配置"""
        if not self.config_path.exists():
            logger.info(f"配置文件不存在，使用默认配置: {self.config_path}")
            return self.config

        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                data = json.load(f)

            # 解析全局配置
            self.config.active_provider = data.get('active_provider', PROVIDER_OPENAI)
            self.config.ai_enabled = data.get('ai_enabled', False)
            self.config.auto_analyze = data.get('auto_analyze', False)

            # 解析各提供商配置
            providers_data = data.get('providers', {})
            for provider_name, provider_data in providers_data.items():
                # 解密 API Key
                encrypted_key = provider_data.get('api_key_encrypted', '')
                api_key = self._cipher.decrypt(encrypted_key) if encrypted_key else ''

                config = AIProviderConfig(
                    provider=provider_name,
                    api_key=api_key,
                    base_url=provider_data.get('base_url', DEFAULT_OPENAI_BASE_URL),
                    model=provider_data.get('model', 'gpt-4o-mini'),
                    temperature=provider_data.get('temperature', 0.7),
                    max_tokens=provider_data.get('max_tokens', 4096),
                    timeout=provider_data.get('timeout', 60),
                    extra_params=provider_data.get('extra_params', {}),
                )
                self.config.providers[provider_name] = config

            logger.info(f"已加载 AI 配置: {self.config_path}")
        except Exception as e:
            logger.error(f"加载 AI 配置失败: {e}")
            # 使用默认配置
            self.config = AIConfig()

        return self.config

    def save(self) -> bool:
        """保存配置到文件"""
        try:
            data = {
                'active_provider': self.config.active_provider,
                'ai_enabled': self.config.ai_enabled,
                'auto_analyze': self.config.auto_analyze,
                'providers': {},
            }

            for provider_name, config in self.config.providers.items():
                provider_data = {
                    'base_url': config.base_url,
                    'model': config.model,
                    'temperature': config.temperature,
                    'max_tokens': config.max_tokens,
                    'timeout': config.timeout,
                    'extra_params': config.extra_params,
                }
                # 加密存储 API Key
                if config.api_key:
                    provider_data['api_key_encrypted'] = self._cipher.encrypt(config.api_key)
                data['providers'][provider_name] = provider_data

            with open(self.config_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

            logger.info(f"已保存 AI 配置: {self.config_path}")
            return True
        except Exception as e:
            logger.error(f"保存 AI 配置失败: {e}")
            return False

    def get_config(self) -> AIConfig:
        """获取当前配置"""
        return self.config

    def get_active_provider_config(self) -> AIProviderConfig:
        """获取当前激活的提供商配置"""
        return self.config.get_active_config()

    def set_api_key(self, provider: str, api_key: str):
        """设置指定提供商的 API Key"""
        if provider in self.config.providers:
            self.config.providers[provider].api_key = api_key
        else:
            # 创建新的提供商配置
            self.config.providers[provider] = AIProviderConfig(
                provider=provider,
                api_key=api_key,
            )

    def set_active_provider(self, provider: str):
        """切换激活的提供商"""
        self.config.set_active_provider(provider)

    def update_provider_config(self, provider: str, **kwargs):
        """
        更新提供商配置参数

        Args:
            provider: 提供商名称
            **kwargs: 要更新的参数（如 model, temperature, max_tokens 等）
        """
        if provider not in self.config.providers:
            self.config.providers[provider] = AIProviderConfig(provider=provider)

        config = self.config.providers[provider]
        for key, value in kwargs.items():
            if hasattr(config, key):
                setattr(config, key, value)
            else:
                logger.warning(f"未知的配置参数: {key}")

    def test_connection(self, provider: Optional[str] = None) -> Dict[str, Any]:
        """
        测试与指定提供商的连接

        Args:
            provider: 提供商名称，默认使用当前激活的提供商

        Returns:
            包含 success, message 的字典
        """
        if provider is None:
            provider = self.config.active_provider

        config = self.config.providers.get(provider)
        if not config:
            return {'success': False, 'message': f'未找到提供商配置: {provider}'}

        if not config.api_key and provider == PROVIDER_OPENAI:
            return {'success': False, 'message': 'API Key 未设置'}

        # 实际连接测试在 ai_service 中实现
        # 这里仅做基本配置校验
        if not config.base_url:
            return {'success': False, 'message': 'Base URL 未设置'}

        return {'success': True, 'message': '配置校验通过，请通过 AI 服务进行实际连接测试'}

    def get_available_models(self, provider: Optional[str] = None) -> list:
        """获取指定提供商的可用模型列表"""
        if provider is None:
            provider = self.config.active_provider

        if provider == PROVIDER_OPENAI:
            return DEFAULT_OPENAI_MODELS
        elif provider == PROVIDER_LOCAL:
            return DEFAULT_LOCAL_MODELS
        return []
