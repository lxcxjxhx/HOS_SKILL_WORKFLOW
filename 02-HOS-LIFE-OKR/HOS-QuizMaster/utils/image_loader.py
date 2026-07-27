#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
图片异步加载器 - HOS-QuizMaster V2
Phase 15.2: 性能优化

实现图片的异步加载、缓存和渐进显示
"""

import os
from typing import Optional
from PyQt6.QtWidgets import QLabel
from PyQt6.QtCore import Qt, QThread, pyqtSignal, QObject
from PyQt6.QtGui import QPixmap, QImage
from utils.image_cache import ImageCache
from utils.image_processor import ImageProcessor


class ImageLoadWorker(QObject):
    """图片加载工作对象（用于 QThread）"""
    
    finished = pyqtSignal(str, Optional[QPixmap])  # image_path, pixmap
    error = pyqtSignal(str, str)  # image_path, error_msg
    
    def __init__(self, image_path: str, cache: ImageCache, processor: ImageProcessor):
        super().__init__()
        self.image_path = image_path
        self.cache = cache
        self.processor = processor
    
    def load(self):
        """执行图片加载（包含锐化等增强处理）"""
        try:
            # 检查缓存
            cached_path = self.cache.get(self.image_path, {})
            
            if cached_path and os.path.exists(cached_path):
                # 从缓存加载
                pixmap = QPixmap(cached_path)
                if not pixmap.isNull():
                    self.finished.emit(self.image_path, pixmap)
                    return
            
            # 缓存未命中，加载原图
            if not os.path.exists(self.image_path):
                self.error.emit(self.image_path, "图片文件不存在")
                return
            
            # 应用图片增强处理（在后台线程执行）
            # 使用 auto_enhance 自动分析并应用最佳增强方案（包括锐化、降噪等）
            processed_array = self.processor.auto_enhance(self.image_path)
            
            if processed_array is not None:
                # 将 numpy array (BGR) 转换为 QPixmap
                pixmap = self._array_to_pixmap(processed_array)
                if pixmap and not pixmap.isNull():
                    # 缓存处理后的图片
                    cached_path = self.cache.put(self.image_path, {"operation": "auto_enhance"}, processed_array)
                    self.finished.emit(self.image_path, pixmap)
                    return
            
            # 如果增强处理失败，回退到加载原图
            pixmap = QPixmap(self.image_path)
            if pixmap.isNull():
                self.error.emit(self.image_path, "无法加载图片")
                return
            
            self.finished.emit(self.image_path, pixmap)
            
        except Exception as e:
            self.error.emit(self.image_path, str(e))
    
    def _array_to_pixmap(self, array) -> Optional[QPixmap]:
        """
        将 numpy array (BGR) 转换为 QPixmap
        
        Args:
            array: numpy array (BGR 格式)
        
        Returns:
            QPixmap 或 None
        """
        try:
            import numpy as np
            
            if array is None:
                return None
            
            # 处理不同维度的数组
            if array.ndim == 2:
                # 灰度图
                h, w = array.shape
                bytes_per_line = w
                q_image = QImage(array.data, w, h, bytes_per_line, QImage.Format.Format_Grayscale8)
            elif array.ndim == 3:
                # 彩色图 (BGR)
                h, w, channels = array.shape
                if channels == 3:
                    # BGR -> RGB
                    rgb_array = np.ascontiguousarray(array[:, :, ::-1])
                    bytes_per_line = 3 * w
                    q_image = QImage(rgb_array.data, w, h, bytes_per_line, QImage.Format.Format_RGB888)
                elif channels == 4:
                    # BGRA -> RGBA
                    rgba_array = np.ascontiguousarray(array[:, :, [2, 1, 0, 3]])
                    bytes_per_line = 4 * w
                    q_image = QImage(rgba_array.data, w, h, bytes_per_line, QImage.Format.Format_RGBA8888)
                else:
                    return None
            else:
                return None
            
            # 确保数据不被回收
            q_image = q_image.copy()
            return QPixmap.fromImage(q_image)
            
        except Exception as e:
            print(f"转换 numpy array 到 QPixmap 失败: {e}")
            return None


class AsyncImageLoader:
    """异步图片加载器"""
    
    def __init__(self, cache: Optional[ImageCache] = None, processor: Optional[ImageProcessor] = None):
        """
        初始化异步加载器
        
        Args:
            cache: 图片缓存管理器
            processor: 图片处理器
        """
        self.cache = cache or ImageCache()
        self.processor = processor or ImageProcessor()
        self._threads: dict[str, QThread] = {}
        self._workers: dict[str, ImageLoadWorker] = {}
    
    def load_async(self, image_path: str, label: QLabel, placeholder: Optional[QPixmap] = None):
        """
        异步加载图片到 QLabel
        
        Args:
            image_path: 图片路径
            label: 目标 QLabel
            placeholder: 占位图（加载过程中显示）
        """
        # 如果已在加载中，忽略
        if image_path in self._threads:
            return
        
        # 显示占位图
        if placeholder:
            label.setPixmap(placeholder)
        
        # 创建工作对象和线程
        worker = ImageLoadWorker(image_path, self.cache, self.processor)
        thread = QThread()
        worker.moveToThread(thread)
        
        # 连接信号
        thread.started.connect(worker.load)
        worker.finished.connect(lambda path, pixmap: self._on_finished(path, pixmap, label))
        worker.error.connect(lambda path, msg: self._on_error(path, msg, label))
        
        # 清理
        worker.finished.connect(thread.quit)
        worker.error.connect(thread.quit)
        thread.finished.connect(lambda: self._cleanup(image_path))
        
        # 保存引用
        self._threads[image_path] = thread
        self._workers[image_path] = worker
        
        # 启动
        thread.start()
    
    def _on_finished(self, image_path: str, pixmap: Optional[QPixmap], label: QLabel):
        """加载完成回调"""
        if pixmap and not pixmap.isNull():
            # 渐进显示效果（可选）
            label.setPixmap(pixmap)
            label.setAlignment(Qt.AlignmentFlag.AlignCenter)
    
    def _on_error(self, image_path: str, error_msg: str, label: QLabel):
        """加载错误回调"""
        print(f"图片加载失败 [{image_path}]: {error_msg}")
        # 可以设置错误图标或文本
        label.setText(f"图片加载失败\n{error_msg}")
        label.setAlignment(Qt.AlignmentFlag.AlignCenter)
    
    def _cleanup(self, image_path: str):
        """清理线程和工作对象"""
        if image_path in self._threads:
            del self._threads[image_path]
        if image_path in self._workers:
            del self._workers[image_path]
    
    def cancel_all(self):
        """取消所有加载任务"""
        for thread in self._threads.values():
            if thread.isRunning():
                thread.quit()
                thread.wait(1000)
        
        self._threads.clear()
        self._workers.clear()
    
    def __del__(self):
        """析构时清理"""
        self.cancel_all()
