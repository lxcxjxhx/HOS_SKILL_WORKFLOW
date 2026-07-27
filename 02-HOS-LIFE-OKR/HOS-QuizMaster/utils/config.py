#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
统一配置管理 - HOS-QuizMaster V2
Phase 14: 系统集成
"""

import json
import os
import sys
from typing import Any, Dict, Optional
from pathlib import Path


class ConfigManager:
    """统一配置管理器"""
    
    # 默认配置
    DEFAULT_CONFIG = {
        'app': {
            'name': 'HOS-QuizMaster',
            'version': '2.0.0',
            'language': 'zh-CN',
        },
        'database': {
            'path': 'quizmaster.db',
            'backup_enabled': True,
            'backup_interval_days': 7,
        },
        'ui': {
            'theme': 'light',
            'font_size': 14,
            'animation_enabled': True,
            'window_width': 1200,
            'window_height': 800,
        },
        'quiz': {
            'default_mode': 'sequential',
            'auto_save': True,
            'show_explanation': True,
            'image_enhancement': True,
        },
        'ai': {
            'enabled': False,
            'provider': 'openai',
            'model': 'gpt-3.5-turbo',
            'api_key': '',
            'base_url': '',
            'temperature': 0.7,
            'max_tokens': 2000,
        },
        'logging': {
            'level': 'INFO',
            'file': 'quizmaster.log',
            'max_size_mb': 10,
            'backup_count': 5,
        },
        'cache': {
            'enabled': True,
            'image_cache_dir': '.cache/images',
            'max_cache_size_mb': 500,
        },
    }
    
    def __init__(self, config_file: Optional[str] = None):
        self.config_file = config_file or self._get_default_config_path()
        self.config: Dict[str, Any] = {}
        self._load_config()
    
    def _get_default_config_path(self) -> str:
        """获取默认配置文件路径"""
        # 优先使用用户目录
        user_config_dir = Path.home() / '.quizmaster'
        user_config_dir.mkdir(exist_ok=True)
        return str(user_config_dir / 'config.json')
    
    def _load_config(self):
        """加载配置"""
        # 先加载默认配置
        self.config = self.DEFAULT_CONFIG.copy()
        
        # 尝试从文件加载
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    file_config = json.load(f)
                    # 深度合并
                    self._deep_merge(self.config, file_config)
            except Exception as e:
                print(f"警告: 加载配置文件失败: {e}，使用默认配置")
    
    def _deep_merge(self, base: Dict, override: Dict):
        """深度合并字典"""
        for key, value in override.items():
            if key in base and isinstance(base[key], dict) and isinstance(value, dict):
                self._deep_merge(base[key], value)
            else:
                base[key] = value
    
    def save_config(self):
        """保存配置到文件"""
        try:
            # 确保目录存在
            config_dir = os.path.dirname(self.config_file)
            if config_dir:
                os.makedirs(config_dir, exist_ok=True)
            
            with open(self.config_file, 'w', encoding='utf-8') as f:
                json.dump(self.config, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"错误: 保存配置失败: {e}")
    
    def get(self, key: str, default: Any = None) -> Any:
        """获取配置项（支持点分隔路径）"""
        keys = key.split('.')
        value = self.config
        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return default
        return value
    
    def set(self, key: str, value: Any):
        """设置配置项（支持点分隔路径）"""
        keys = key.split('.')
        config = self.config
        for k in keys[:-1]:
            if k not in config:
                config[k] = {}
            config = config[k]
        config[keys[-1]] = value
    
    def get_section(self, section: str) -> Dict[str, Any]:
        """获取配置节"""
        return self.config.get(section, {})
    
    def set_section(self, section: str, data: Dict[str, Any]):
        """设置配置节"""
        self.config[section] = data
    
    def reset_to_default(self):
        """重置为默认配置"""
        self.config = self.DEFAULT_CONFIG.copy()
    
    def export_config(self, file_path: str):
        """导出配置到指定文件"""
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(self.config, f, ensure_ascii=False, indent=2)
    
    def import_config(self, file_path: str):
        """从文件导入配置"""
        with open(file_path, 'r', encoding='utf-8') as f:
            imported = json.load(f)
        self._deep_merge(self.config, imported)


# 全局配置实例
_config_instance: Optional[ConfigManager] = None


def get_config(config_file: Optional[str] = None) -> ConfigManager:
    """获取全局配置实例"""
    global _config_instance
    if _config_instance is None:
        _config_instance = ConfigManager(config_file)
    return _config_instance


def reload_config(config_file: Optional[str] = None):
    """重新加载配置"""
    global _config_instance
    _config_instance = ConfigManager(config_file)
    return _config_instance
