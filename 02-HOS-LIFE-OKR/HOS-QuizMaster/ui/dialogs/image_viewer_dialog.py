#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
图片查看器对话框 - HOS-QuizMaster V2
支持缩放、平移、增强、前后对比等功能
"""

import os
import logging
from typing import Optional

import numpy as np

from PyQt6.QtWidgets import (QDialog, QVBoxLayout, QHBoxLayout, QLabel,
                              QPushButton, QSlider, QScrollArea, QWidget,
                              QFileDialog, QMessageBox, QFrame, QSizePolicy,
                              QGraphicsView, QGraphicsScene, QToolBar,
                              QGraphicsDropShadowEffect)
from PyQt6.QtCore import Qt, pyqtSignal, QThread, QObject, pyqtSlot, QRectF, QSize
from PyQt6.QtGui import QPixmap, QImage, QIcon, QAction, QWheelEvent, QMouseEvent, QColor

from ui.design_tokens import Color, Spacing, Radius, Typography, Shadow

logger = logging.getLogger(__name__)


def _numpy_to_qpixmap(img: np.ndarray) -> QPixmap:
    """
    将 numpy array (BGR) 转换为 QPixmap

    Args:
        img: numpy array (BGR 或灰度)

    Returns:
        QPixmap
    """
    if img is None:
        return QPixmap()

    if img.dtype != np.uint8:
        img = img.astype(np.uint8)

    if img.ndim == 2:
        # 灰度图
        h, w = img.shape
        bytes_per_line = w
        qimg = QImage(img.data, w, h, bytes_per_line, QImage.Format.Format_Grayscale8)
    elif img.ndim == 3:
        h, w, ch = img.shape
        if ch == 3:
            # BGR -> RGB
            rgb = img[:, :, ::-1].copy()
            bytes_per_line = 3 * w
            qimg = QImage(rgb.data, w, h, bytes_per_line, QImage.Format.Format_RGB888)
        elif ch == 4:
            rgb = img[:, :, [2, 1, 0, 3]].copy()
            bytes_per_line = 4 * w
            qimg = QImage(rgb.data, w, h, bytes_per_line, QImage.Format.Format_RGBA8888)
        else:
            return QPixmap()
    else:
        return QPixmap()

    # 必须保持 qimg 存活，因此 deep copy
    return QPixmap.fromImage(qimg.copy())


class _ProcessingWorker(QObject):
    """后台处理工作器，避免阻塞 UI"""
    finished = pyqtSignal(object)
    error = pyqtSignal(str)

    def __init__(self, processor, image_path: str, operation: str, level: int = 1):
        super().__init__()
        self.processor = processor
        self.image_path = image_path
        self.operation = operation
        self.level = level

    @pyqtSlot()
    def run(self):
        try:
            if self.operation == "sharpen":
                result = self.processor.sharpen(self.image_path, self.level)
            elif self.operation == "denoise":
                result = self.processor.denoise(self.image_path, self.level)
            elif self.operation == "auto_enhance":
                result = self.processor.auto_enhance(self.image_path)
            else:
                result = self.processor._load_image(self.image_path)
            self.finished.emit(result)
        except Exception as e:
            self.error.emit(str(e))


class _ZoomableImageView(QGraphicsView):
    """支持缩放和平移的图片视图"""

    zoom_changed = pyqtSignal(float)

    def __init__(self, parent=None):
        super().__init__(parent)
        self._scene = QGraphicsScene(self)
        self.setScene(self._scene)
        self._pixmap_item = None
        self._zoom_factor = 1.0
        self._min_zoom = 0.1
        self._max_zoom = 10.0
        self._panning = False
        self._pan_start = None

        # 视图设置
        try:
            from PyQt6.QtGui import QPainter
            self.setRenderHint(QPainter.RenderHint.SmoothPixmapTransform, True)
        except Exception:
            pass
        self.setDragMode(QGraphicsView.DragMode.NoDrag)
        self.setTransformationAnchor(QGraphicsView.ViewportAnchor.NoAnchor)
        self.setResizeAnchor(QGraphicsView.ViewportAnchor.AnchorViewCenter)
        self.setViewportUpdateMode(QGraphicsView.ViewportUpdateMode.SmartViewportUpdate)
        self.setBackgroundBrush(Qt.GlobalColor.darkGray)
        self.setFrameShape(QFrame.Shape.NoFrame)

    def setPixmap(self, pixmap: QPixmap):
        """设置要显示的图片"""
        if pixmap.isNull():
            return
        if self._pixmap_item is None:
            self._pixmap_item = self._scene.addPixmap(pixmap)
        else:
            self._pixmap_item.setPixmap(pixmap)
        self._scene.setSceneRect(QRectF(pixmap.rect()))
        self._fit_to_view()

    def _fit_to_view(self):
        """将图片适配到视图"""
        if self._pixmap_item is None:
            return
        rect = self._scene.sceneRect()
        self.fitInView(rect, Qt.AspectRatioMode.KeepAspectRatio)
        self._zoom_factor = self.transform().m11()
        self.zoom_changed.emit(self._zoom_factor)

    def fitInView(self, rect, mode=Qt.AspectRatioMode.KeepAspectRatio):
        super().fitInView(rect, mode)
        self._zoom_factor = self.transform().m11()

    def resetZoom(self):
        """重置缩放"""
        self._fit_to_view()

    def zoomIn(self):
        """放大"""
        self._scale(1.2)

    def zoomOut(self):
        """缩小"""
        self._scale(1 / 1.2)

    def _scale(self, factor: float):
        """缩放"""
        new_zoom = self._zoom_factor * factor
        if new_zoom < self._min_zoom or new_zoom > self._max_zoom:
            return
        self.scale(factor, factor)
        self._zoom_factor = new_zoom
        self.zoom_changed.emit(self._zoom_factor)

    def wheelEvent(self, event: QWheelEvent):
        """鼠标滚轮缩放"""
        delta = event.angleDelta().y()
        if delta > 0:
            self._scale(1.15)
        elif delta < 0:
            self._scale(1 / 1.15)
        event.accept()

    def mousePressEvent(self, event: QMouseEvent):
        """鼠标按下 - 开始平移"""
        if event.button() == Qt.MouseButton.LeftButton:
            self._panning = True
            self._pan_start = event.position().toPoint()
            self.setCursor(Qt.CursorShape.ClosedHandCursor)
            event.accept()
        else:
            super().mousePressEvent(event)

    def mouseMoveEvent(self, event: QMouseEvent):
        """鼠标移动 - 平移"""
        if self._panning and self._pan_start is not None:
            delta = event.position().toPoint() - self._pan_start
            self._pan_start = event.position().toPoint()
            self.horizontalScrollBar().setValue(
                self.horizontalScrollBar().value() - delta.x()
            )
            self.verticalScrollBar().setValue(
                self.verticalScrollBar().value() - delta.y()
            )
            event.accept()
        else:
            super().mouseMoveEvent(event)

    def mouseReleaseEvent(self, event: QMouseEvent):
        """鼠标释放 - 结束平移"""
        if event.button() == Qt.MouseButton.LeftButton:
            self._panning = False
            self._pan_start = None
            self.setCursor(Qt.CursorShape.ArrowCursor)
            event.accept()
        else:
            super().mouseReleaseEvent(event)

    def resizeEvent(self, event):
        super().resizeEvent(event)


class ImageViewerDialog(QDialog):
    """全屏图片查看器对话框"""

    def __init__(self, image_path: str, processor=None, parent=None):
        super().__init__(parent)
        self.image_path = image_path
        self.processor = processor
        self._original_image: Optional[np.ndarray] = None
        self._current_image: Optional[np.ndarray] = None
        self._showing_enhanced = False
        self._worker: Optional[_ProcessingWorker] = None
        self._thread: Optional[QThread] = None

        self.setWindowTitle(f"图片查看器 - {os.path.basename(image_path)}")
        # 移除固定尺寸，改用 sizeHint() 动态计算
        self.setMinimumSize(800, 600)

        self.init_ui()
        self._apply_window_style()
        self._apply_shadow()
        self.load_image()

    def _apply_window_style(self):
        """应用弹窗整体样式"""
        self.setStyleSheet(f"""
            QDialog {{
                background-color: {Color.BG_PRIMARY};
                border: 1px solid {Color.BORDER_DEFAULT};
                border-radius: {Radius.XL}px;
            }}
        """)

    def _apply_shadow(self):
        """应用阴影效果"""
        shadow = QGraphicsDropShadowEffect()
        shadow.setBlurRadius(Shadow.DIALOG[0])
        shadow.setXOffset(Shadow.DIALOG[1])
        shadow.setYOffset(Shadow.DIALOG[2])
        shadow.setColor(QColor(0, 0, 0, int(255 * Shadow.DIALOG[3])))
        self.setGraphicsEffect(shadow)

    def sizeHint(self) -> QSize:
        """根据内容计算合适的尺寸"""
        from PyQt6.QtWidgets import QApplication
        # 图片查看器需要较大空间
        width = 1100
        # 限制高度：最小 600px，最大不超过屏幕高度的 90%
        screen = QApplication.primaryScreen()
        max_height = int(screen.availableGeometry().height() * 0.9) if screen else 800
        height = min(max(800, 600), max_height)
        return QSize(width, height)

    def init_ui(self):
        """初始化 UI"""
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)

        # 顶部工具栏
        toolbar = QFrame()
        toolbar.setStyleSheet(f"""
            QFrame {{
                background-color: {Color.BG_SECONDARY};
                border-bottom: 1px solid {Color.BORDER_LIGHT};
            }}
        """)
        toolbar_layout = QHBoxLayout(toolbar)
        toolbar_layout.setContentsMargins(Spacing.MD, Spacing.SM, Spacing.MD, Spacing.SM)
        toolbar_layout.setSpacing(Spacing.SM)
        
        # 统一按钮样式 - 增强交互反馈，添加完整状态和过渡动画
        toolbar_btn_style = f"""
            QPushButton {{
                background-color: {Color.BG_PRIMARY};
                border: 1px solid {Color.BORDER_DEFAULT};
                border-radius: {Radius.MD}px;
                padding: {Spacing.XS}px {Spacing.SM}px;
                font-size: {Typography.SIZE_XS}px;
                color: {Color.TEXT_PRIMARY};
            }}
            QPushButton:hover {{
                background-color: {Color.BG_HOVER};
                border-color: {Color.BORDER_DARK};
            }}
            QPushButton:pressed {{
                background-color: {Color.BG_ACTIVE};
            }}
            QPushButton:disabled {{
                background-color: {Color.BG_QUATERNARY};
                color: {Color.TEXT_DISABLED};
                border-color: {Color.BORDER_LIGHT};
            }}
        """

        # 缩放控制
        zoom_out_btn = QPushButton("−")
        zoom_out_btn.setFixedSize(32, 32)
        zoom_out_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        zoom_out_btn.setToolTip("缩小")
        zoom_out_btn.clicked.connect(self._on_zoom_out)
        zoom_out_btn.setStyleSheet(toolbar_btn_style)
        toolbar_layout.addWidget(zoom_out_btn)

        self.zoom_label = QLabel("100%")
        self.zoom_label.setMinimumWidth(60)
        self.zoom_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.zoom_label.setStyleSheet(f"color: {Color.TEXT_PRIMARY}; font-size: {Typography.SIZE_SM}px;")
        toolbar_layout.addWidget(self.zoom_label)

        zoom_in_btn = QPushButton("+")
        zoom_in_btn.setFixedSize(32, 32)
        zoom_in_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        zoom_in_btn.setToolTip("放大")
        zoom_in_btn.clicked.connect(self._on_zoom_in)
        zoom_in_btn.setStyleSheet(toolbar_btn_style)
        toolbar_layout.addWidget(zoom_in_btn)

        zoom_reset_btn = QPushButton("适应")
        zoom_reset_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        zoom_reset_btn.setToolTip("适应窗口")
        zoom_reset_btn.clicked.connect(self._on_zoom_reset)
        zoom_reset_btn.setStyleSheet(toolbar_btn_style)
        toolbar_layout.addWidget(zoom_reset_btn)

        toolbar_layout.addSpacing(Spacing.LG)

        # 增强控制
        sharpen_label = QLabel("锐化:")
        sharpen_label.setStyleSheet(f"color: {Color.TEXT_SECONDARY}; font-size: {Typography.SIZE_SM}px;")
        toolbar_layout.addWidget(sharpen_label)
        self.sharpen_slider = QSlider(Qt.Orientation.Horizontal)
        self.sharpen_slider.setRange(0, 3)
        self.sharpen_slider.setValue(0)
        self.sharpen_slider.setFixedWidth(100)
        self.sharpen_slider.setToolTip("锐化级别 (0=关闭)")
        self.sharpen_slider.valueChanged.connect(self._on_enhance_changed)
        toolbar_layout.addWidget(self.sharpen_slider)

        denoise_label = QLabel("降噪:")
        denoise_label.setStyleSheet(f"color: {Color.TEXT_SECONDARY}; font-size: {Typography.SIZE_SM}px;")
        toolbar_layout.addWidget(denoise_label)
        self.denoise_slider = QSlider(Qt.Orientation.Horizontal)
        self.denoise_slider.setRange(0, 3)
        self.denoise_slider.setValue(0)
        self.denoise_slider.setFixedWidth(100)
        self.denoise_slider.setToolTip("降噪级别 (0=关闭)")
        self.denoise_slider.valueChanged.connect(self._on_enhance_changed)
        toolbar_layout.addWidget(self.denoise_slider)

        auto_btn = QPushButton("自动增强")
        auto_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        auto_btn.clicked.connect(self._on_auto_enhance)
        auto_btn.setStyleSheet(toolbar_btn_style)
        toolbar_layout.addWidget(auto_btn)

        toolbar_layout.addSpacing(Spacing.LG)

        # 前后对比
        self.compare_btn = QPushButton("原图对比")
        self.compare_btn.setCheckable(True)
        self.compare_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.compare_btn.clicked.connect(self._on_toggle_compare)
        self.compare_btn.setStyleSheet(toolbar_btn_style)
        toolbar_layout.addWidget(self.compare_btn)

        # 重置
        reset_btn = QPushButton("重置")
        reset_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        reset_btn.clicked.connect(self._on_reset)
        reset_btn.setStyleSheet(toolbar_btn_style)
        toolbar_layout.addWidget(reset_btn)

        toolbar_layout.addStretch()

        # 保存
        save_btn = QPushButton("保存")
        save_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        save_btn.clicked.connect(self._on_save)
        save_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {Color.ACCENT};
                color: {Color.TEXT_INVERSE};
                border: none;
                border-radius: {Radius.MD}px;
                padding: {Spacing.XS}px {Spacing.MD}px;
                font-size: {Typography.SIZE_SM}px;
                font-weight: {Typography.WEIGHT_SEMI};
            }}
            QPushButton:hover {{
                background-color: {Color.ACCENT_HOVER};
            }}
            QPushButton:pressed {{
                background-color: {Color.ACCENT_ACTIVE};
            }}
            QPushButton:disabled {{
                background-color: {Color.BG_QUATERNARY};
                color: {Color.TEXT_DISABLED};
            }}
        """)
        toolbar_layout.addWidget(save_btn)

        # 关闭
        close_btn = QPushButton("关闭 (ESC)")
        close_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        close_btn.clicked.connect(self.close)
        close_btn.setStyleSheet(toolbar_btn_style)
        toolbar_layout.addWidget(close_btn)

        main_layout.addWidget(toolbar)

        # 图片视图
        self.image_view = _ZoomableImageView()
        self.image_view.zoom_changed.connect(self._on_zoom_changed)
        main_layout.addWidget(self.image_view, stretch=1)

        # 底部状态栏
        status_bar = QFrame()
        status_bar.setStyleSheet(f"""
            QFrame {{
                background-color: {Color.BG_SECONDARY};
                border-top: 1px solid {Color.BORDER_LIGHT};
            }}
        """)
        status_layout = QHBoxLayout(status_bar)
        status_layout.setContentsMargins(Spacing.MD, Spacing.XS, Spacing.MD, Spacing.XS)

        self.info_label = QLabel("")
        self.info_label.setStyleSheet(f"color: {Color.TEXT_SECONDARY}; font-size: {Typography.SIZE_XS}px;")
        status_layout.addWidget(self.info_label)
        status_layout.addStretch()

        self.quality_label = QLabel("")
        self.quality_label.setStyleSheet(f"color: {Color.TEXT_SECONDARY}; font-size: {Typography.SIZE_XS}px;")
        status_layout.addWidget(self.quality_label)

        main_layout.addWidget(status_bar)

    def load_image(self):
        """加载图片"""
        if self.processor is None:
            # 没有处理器，直接用 QPixmap 加载
            pixmap = QPixmap(self.image_path)
            if pixmap.isNull():
                QMessageBox.warning(self, "错误", f"无法加载图片:\n{self.image_path}")
                return
            self.image_view.setPixmap(pixmap)
            self._update_info()
            return

        try:
            self._original_image = self.processor._load_image(self.image_path)
            self._current_image = self._original_image.copy()
            self._display_image(self._current_image)
            self._update_info()
            self._update_quality_info()
        except Exception as e:
            QMessageBox.warning(self, "错误", f"加载图片失败:\n{str(e)}")

    def _display_image(self, img: np.ndarray):
        """显示图片"""
        pixmap = _numpy_to_qpixmap(img)
        self.image_view.setPixmap(pixmap)

    def _update_info(self):
        """更新信息栏"""
        if self._current_image is not None:
            h, w = self._current_image.shape[:2]
            self.info_label.setText(f"{os.path.basename(self.image_path)} | {w} × {h}")

    def _update_quality_info(self):
        """更新质量信息"""
        if self.processor is None or self._original_image is None:
            return
        try:
            quality = self.processor.analyze_quality(self.image_path)
            parts = []
            if quality.get("is_blurry"):
                parts.append("模糊")
            if quality.get("is_noisy"):
                parts.append("有噪声")
            if quality.get("is_low_contrast"):
                parts.append("低对比度")
            if parts:
                self.quality_label.setText("检测到: " + "、".join(parts))
            else:
                self.quality_label.setText("图片质量良好")
        except Exception:
            self.quality_label.setText("")

    def _on_zoom_in(self):
        self.image_view.zoomIn()

    def _on_zoom_out(self):
        self.image_view.zoomOut()

    def _on_zoom_reset(self):
        self.image_view.resetZoom()

    def _on_zoom_changed(self, factor: float):
        self.zoom_label.setText(f"{int(factor * 100)}%")

    def _on_enhance_changed(self):
        """锐化或降噪滑块变化时重新处理"""
        if self.processor is None or self._original_image is None:
            return

        # 避免在处理过程中重复触发
        if self._worker is not None:
            return

        sharpen_level = self.sharpen_slider.value()
        denoise_level = self.denoise_slider.value()

        # 如果都是 0，显示原图
        if sharpen_level == 0 and denoise_level == 0:
            self._current_image = self._original_image.copy()
            self._display_image(self._current_image)
            self._showing_enhanced = False
            self.compare_btn.setChecked(False)
            return

        # 先降噪再锐化
        result = self._original_image.copy()

        # 使用后台线程处理
        operation = "denoise" if denoise_level > 0 else "sharpen"
        level = denoise_level if denoise_level > 0 else sharpen_level

        self._run_processing(operation, level, apply_both=True)

    def _run_processing(self, operation: str, level: int, apply_both: bool = False):
        """在后台线程运行处理"""
        if self.processor is None or self._original_image is None:
            return

        self._thread = QThread()
        self._worker = _ProcessingWorker(self.processor, self.image_path, operation, level)
        self._worker.moveToThread(self._thread)

        self._thread.started.connect(self._worker.run)
        self._worker.finished.connect(self._on_processing_finished)
        self._worker.error.connect(self._on_processing_error)
        self._worker.finished.connect(self._thread.quit)
        self._worker.error.connect(self._thread.quit)

        self._worker._apply_both = apply_both
        self._worker._sharpen_level = self.sharpen_slider.value()
        self._worker._denoise_level = self.denoise_slider.value()

        self._thread.start()

    @pyqtSlot(object)
    def _on_processing_finished(self, result):
        """处理完成"""
        apply_both = getattr(self._worker, '_apply_both', False)
        sharpen_level = getattr(self._worker, '_sharpen_level', 0)
        denoise_level = getattr(self._worker, '_denoise_level', 0)

        if apply_both and denoise_level > 0 and sharpen_level > 0:
            # 降噪后再锐化
            # 直接在当前线程做第二步（结果已经拿到）
            try:
                from utils.image_processor import ImageProcessor
                # 对 result 应用锐化
                if self.processor._cv2 is not None:
                    cv2 = self.processor._cv2
                    kernel_sizes = {1: (3, 3), 2: (5, 5), 3: (7, 7)}
                    sigmas = {1: 1.0, 2: 2.0, 3: 3.0}
                    amounts = {1: 0.5, 2: 1.0, 3: 1.5}
                    ksize = kernel_sizes.get(sharpen_level, (3, 3))
                    sigma = sigmas.get(sharpen_level, 1.0)
                    amount = amounts.get(sharpen_level, 0.5)
                    blurred = cv2.GaussianBlur(result, ksize, sigma)
                    result = cv2.addWeighted(result, 1.0 + amount, blurred, -amount, 0)
            except Exception as e:
                logger.error(f"锐化步骤失败: {e}")

        self._current_image = result
        self._display_image(self._current_image)
        self._showing_enhanced = True
        self._cleanup_worker()

    @pyqtSlot(str)
    def _on_processing_error(self, error_msg: str):
        """处理出错"""
        logger.error(f"图片处理失败: {error_msg}")
        self._cleanup_worker()

    def _cleanup_worker(self):
        """清理工作线程"""
        if self._thread is not None:
            self._thread.wait(1000)
            self._thread = None
        self._worker = None

    def _on_auto_enhance(self):
        """自动增强"""
        if self.processor is None or self._original_image is None:
            return
        if self._worker is not None:
            return

        self.sharpen_slider.blockSignals(True)
        self.denoise_slider.blockSignals(True)
        self.sharpen_slider.setValue(0)
        self.denoise_slider.setValue(0)
        self.sharpen_slider.blockSignals(False)
        self.denoise_slider.blockSignals(False)

        self._run_processing("auto_enhance", 1)

    def _on_toggle_compare(self):
        """切换原图/增强对比"""
        if self.processor is None or self._original_image is None:
            return

        if self.compare_btn.isChecked():
            # 显示对比图
            if self._current_image is not None:
                comparison = self.processor.compare_before_after(
                    self._original_image, self._current_image
                )
                self._display_image(comparison)
        else:
            # 恢复当前图
            if self._current_image is not None:
                self._display_image(self._current_image)

    def _on_reset(self):
        """重置到原图"""
        if self._original_image is not None:
            self._current_image = self._original_image.copy()
            self._display_image(self._current_image)
            self.sharpen_slider.setValue(0)
            self.denoise_slider.setValue(0)
            self.compare_btn.setChecked(False)
            self._showing_enhanced = False

    def _on_save(self):
        """保存增强后的图片"""
        if self._current_image is None:
            QMessageBox.information(self, "提示", "没有可保存的图片")
            return

        default_name = os.path.splitext(os.path.basename(self.image_path))[0] + "_enhanced.png"
        file_path, _ = QFileDialog.getSaveFileName(
            self, "保存增强图片", default_name,
            "PNG 图片 (*.png);;JPEG 图片 (*.jpg);;所有文件 (*)"
        )

        if file_path and self.processor is not None:
            try:
                self.processor.save_enhanced(self._current_image, file_path)
                QMessageBox.information(self, "成功", f"图片已保存到:\n{file_path}")
            except Exception as e:
                QMessageBox.critical(self, "错误", f"保存失败:\n{str(e)}")

    def keyPressEvent(self, event):
        """键盘事件"""
        key = event.key()
        if key == Qt.Key.Key_Escape:
            self.close()
        elif key == Qt.Key.Key_Plus or key == Qt.Key.Key_Equal:
            self.image_view.zoomIn()
        elif key == Qt.Key.Key_Minus:
            self.image_view.zoomOut()
        elif key == Qt.Key.Key_0:
            self.image_view.resetZoom()
        elif key == Qt.Key.Key_Space:
            self._on_toggle_compare()
            self.compare_btn.setChecked(not self.compare_btn.isChecked())
        else:
            super().keyPressEvent(event)

    def closeEvent(self, event):
        """关闭时清理工作线程"""
        if self._thread is not None:
            self._thread.quit()
            self._thread.wait(1000)
        super().closeEvent(event)
