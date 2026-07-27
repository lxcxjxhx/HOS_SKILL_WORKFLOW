#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
图片缓存管理 - HOS-QuizMaster V2
管理处理后的图片缓存，避免重复处理
"""

import os
import hashlib
import json
import tempfile
import time
import threading
from pathlib import Path
from typing import Optional, Any


class ImageCache:
    """图片处理缓存管理器"""

    def __init__(self, cache_dir: Optional[str] = None, max_age_days: int = 7):
        """
        初始化缓存管理器

        Args:
            cache_dir: 缓存目录路径，默认使用系统临时目录下的子目录
            max_age_days: 缓存最大保留天数，默认7天
        """
        if cache_dir is None:
            cache_dir = os.path.join(tempfile.gettempdir(), "hos_quizmaster_imgcache")
        self.cache_dir = cache_dir
        self.max_age_seconds = max_age_days * 86400
        self._lock = threading.Lock()

        # 内存缓存：key -> (numpy_array_or_path, timestamp)
        self._memory_cache: dict[str, tuple[Any, float]] = {}
        self._memory_max_items = 50

        os.makedirs(self.cache_dir, exist_ok=True)

    def _compute_key(self, image_path: str, params: dict) -> str:
        """
        根据图片路径和处理参数计算缓存键

        Args:
            image_path: 原始图片路径
            params: 处理参数字典

        Returns:
            缓存键字符串
        """
        # 用文件内容哈希 + 参数哈希
        hasher = hashlib.sha256()

        # 文件内容哈希
        try:
            with open(image_path, "rb") as f:
                for chunk in iter(lambda: f.read(8192), b""):
                    hasher.update(chunk)
        except OSError:
            # 文件不可读时使用路径+修改时间
            try:
                mtime = os.path.getmtime(image_path)
                hasher.update(f"{image_path}:{mtime}".encode())
            except OSError:
                hasher.update(image_path.encode())

        # 参数哈希
        param_str = json.dumps(params, sort_keys=True)
        hasher.update(param_str.encode())

        return hasher.hexdigest()[:32]

    def get(self, image_path: str, params: dict) -> Optional[str]:
        """
        从缓存获取处理后的图片路径

        Args:
            image_path: 原始图片路径
            params: 处理参数字典

        Returns:
            缓存的处理后图片路径，未命中返回 None
        """
        key = self._compute_key(image_path, params)

        with self._lock:
            # 先查内存缓存
            if key in self._memory_cache:
                cached_path, ts = self._memory_cache[key]
                if os.path.exists(cached_path):
                    self._memory_cache[key] = (cached_path, time.time())
                    return cached_path
                else:
                    del self._memory_cache[key]

        # 查磁盘缓存
        cache_path = os.path.join(self.cache_dir, f"{key}.png")
        if os.path.exists(cache_path):
            # 检查是否过期
            try:
                file_age = time.time() - os.path.getmtime(cache_path)
                if file_age > self.max_age_seconds:
                    os.remove(cache_path)
                    return None
            except OSError:
                return None

            # 写入内存缓存
            with self._lock:
                self._put_memory(key, cache_path)

            return cache_path

        return None

    def put(self, image_path: str, params: dict, processed_image) -> str:
        """
        将处理后的图片存入缓存

        Args:
            image_path: 原始图片路径
            params: 处理参数字典
            processed_image: 处理后的图片（numpy array 或文件路径）

        Returns:
            缓存文件路径
        """
        import numpy as np

        key = self._compute_key(image_path, params)
        cache_path = os.path.join(self.cache_dir, f"{key}.png")

        try:
            if isinstance(processed_image, str):
                # 已经是文件路径，复制过去
                import shutil
                shutil.copy2(processed_image, cache_path)
            elif isinstance(processed_image, np.ndarray):
                # numpy array，用 cv2 保存
                try:
                    import cv2
                    cv2.imwrite(cache_path, processed_image)
                except ImportError:
                    # fallback: 用 Pillow
                    from PIL import Image
                    if processed_image.ndim == 3:
                        img = Image.fromarray(processed_image[:, :, ::-1])  # BGR->RGB
                    else:
                        img = Image.fromarray(processed_image)
                    img.save(cache_path)
            else:
                # 尝试当作 PIL Image
                processed_image.save(cache_path)
        except Exception:
            # 缓存写入失败不影响主流程
            return ""

        # 写入内存缓存
        with self._lock:
            self._put_memory(key, cache_path)

        return cache_path

    def _put_memory(self, key: str, path: str):
        """写入内存缓存，超出上限时淘汰最旧的"""
        if len(self._memory_cache) >= self._memory_max_items:
            # 淘汰最旧条目
            oldest_key = min(self._memory_cache, key=lambda k: self._memory_cache[k][1])
            del self._memory_cache[oldest_key]
        self._memory_cache[key] = (path, time.time())

    def clear(self):
        """清除所有缓存"""
        with self._lock:
            self._memory_cache.clear()

        try:
            for f in Path(self.cache_dir).glob("*.png"):
                try:
                    f.unlink()
                except OSError:
                    pass
        except OSError:
            pass

    def cleanup_old(self):
        """清理过期缓存"""
        now = time.time()
        try:
            for f in Path(self.cache_dir).glob("*"):
                try:
                    if f.is_file() and (now - f.stat().st_mtime) > self.max_age_seconds:
                        f.unlink()
                except OSError:
                    pass
        except OSError:
            pass

        # 清理内存缓存中不存在的条目
        with self._lock:
            dead_keys = [k for k, (p, _) in self._memory_cache.items() if not os.path.exists(p)]
            for k in dead_keys:
                del self._memory_cache[k]

    def get_stats(self) -> dict:
        """获取缓存统计信息"""
        disk_count = 0
        disk_size = 0
        try:
            for f in Path(self.cache_dir).glob("*"):
                if f.is_file():
                    disk_count += 1
                    disk_size += f.stat().st_size
        except OSError:
            pass

        with self._lock:
            mem_count = len(self._memory_cache)

        return {
            "disk_entries": disk_count,
            "disk_size_bytes": disk_size,
            "memory_entries": mem_count,
            "cache_dir": self.cache_dir,
        }
