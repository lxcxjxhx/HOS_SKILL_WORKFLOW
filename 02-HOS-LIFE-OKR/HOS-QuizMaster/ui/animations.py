#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
UI 过渡动画工具模块 - HOS-QuizMaster V2
Phase 15.3: 提供可复用的动画辅助函数与事件过滤器
增强版：弹性曲线、页面切换、微交互
"""

from PyQt6.QtWidgets import QWidget, QGraphicsOpacityEffect, QApplication, QGraphicsDropShadowEffect
from PyQt6.QtCore import (QPropertyAnimation, QEasingCurve, QObject, QEvent,
                          QPoint, pyqtSignal, QSize, QRect, QTimer)
from PyQt6.QtGui import QMouseEvent, QColor


# ========== 常量 ==========
SLIDE_DURATION_MS = 200
FADE_DURATION_MS = 180
BUTTON_PRESS_DURATION_MS = 120
ELASTIC_DURATION_MS = 400
PAGE_TRANSITION_MS = 300
MICRO_INTERACTION_MS = 150


# ========== 淡入动画 ==========

def fade_in(widget: QWidget, duration: int = FADE_DURATION_MS,
            start: float = 0.0, end: float = 1.0) -> QPropertyAnimation:
    """对 widget 应用透明度淡入动画，返回动画对象（调用方需持有引用）"""
    effect = widget.graphicsEffect()
    if not isinstance(effect, QGraphicsOpacityEffect):
        effect = QGraphicsOpacityEffect(widget)
        widget.setGraphicsEffect(effect)
    anim = QPropertyAnimation(effect, b"opacity")
    anim.setDuration(duration)
    anim.setStartValue(start)
    anim.setEndValue(end)
    anim.setEasingCurve(QEasingCurve.Type.OutCubic)
    anim.start(QPropertyAnimation.DeletionPolicy.DeleteWhenStopped)
    return anim


def fade_out(widget: QWidget, duration: int = FADE_DURATION_MS) -> QPropertyAnimation:
    """对 widget 应用透明度淡出动画"""
    return fade_in(widget, duration=duration, start=1.0, end=0.0)


# ========== 滑动动画 ==========

def slide_in_from_right(widget: QWidget, duration: int = SLIDE_DURATION_MS,
                        offset: int = 60) -> QPropertyAnimation:
    """从右侧滑入 widget（位置偏移动画）"""
    anim = QPropertyAnimation(widget, b"pos")
    anim.setDuration(duration)
    start_pos = widget.pos()
    anim.setStartValue(QPoint(start_pos.x() + offset, start_pos.y()))
    anim.setEndValue(start_pos)
    anim.setEasingCurve(QEasingCurve.Type.OutCubic)
    anim.start(QPropertyAnimation.DeletionPolicy.DeleteWhenStopped)
    return anim


def slide_in_from_left(widget: QWidget, duration: int = SLIDE_DURATION_MS,
                       offset: int = 60) -> QPropertyAnimation:
    """从左侧滑入 widget"""
    anim = QPropertyAnimation(widget, b"pos")
    anim.setDuration(duration)
    start_pos = widget.pos()
    anim.setStartValue(QPoint(start_pos.x() - offset, start_pos.y()))
    anim.setEndValue(start_pos)
    anim.setEasingCurve(QEasingCurve.Type.OutCubic)
    anim.start(QPropertyAnimation.DeletionPolicy.DeleteWhenStopped)
    return anim


def slide_in_from_top(widget: QWidget, duration: int = SLIDE_DURATION_MS,
                      offset: int = 40) -> QPropertyAnimation:
    """从顶部滑入 widget"""
    anim = QPropertyAnimation(widget, b"pos")
    anim.setDuration(duration)
    start_pos = widget.pos()
    anim.setStartValue(QPoint(start_pos.x(), start_pos.y() - offset))
    anim.setEndValue(start_pos)
    anim.setEasingCurve(QEasingCurve.Type.OutCubic)
    anim.start(QPropertyAnimation.DeletionPolicy.DeleteWhenStopped)
    return anim


# ========== 按钮点击反馈事件过滤器 ==========

class ButtonPressFilter(QObject):
    """按钮点击反馈事件过滤器：按下时缩放至 0.95，松开时恢复 1.0。

    通过样式表中的 padding 变化模拟缩放效果，避免破坏原有布局。
    """

    def __init__(self, scale_factor: float = 0.96):
        super().__init__()
        self._scale_factor = scale_factor
        self._original_styles: dict = {}

    def _apply_press_visual(self, widget: QWidget):
        """按下时追加视觉反馈样式"""
        if widget not in self._original_styles:
            self._original_styles[widget] = widget.styleSheet()
        base = self._original_styles[widget]
        # 追加 pressed 伪状态样式：略微加深背景，模拟按压反馈
        pressed_style = base + """
            QPushButton:pressed {
                padding-top: 2px;
                padding-bottom: 0px;
            }
        """
        widget.setStyleSheet(pressed_style)

    def _restore_visual(self, widget: QWidget):
        """松开时恢复原始样式"""
        if widget in self._original_styles:
            widget.setStyleSheet(self._original_styles.pop(widget))

    def eventFilter(self, obj, event):
        if event.type() == QEvent.Type.MouseButtonPress:
            self._apply_press_visual(obj)
        elif event.type() in (QEvent.Type.MouseButtonRelease,
                              QEvent.Type.MouseButtonDblClick,
                              QEvent.Type.Leave):
            self._restore_visual(obj)
        return False


# 全局单例，便于复用
_button_press_filter = ButtonPressFilter()


def attach_press_feedback(widget: QWidget) -> None:
    """为按钮附加点击反馈动画（样式变化）"""
    widget.installEventFilter(_button_press_filter)
    widget.setCursor(widget.cursor())  # 保持光标


def attach_press_feedback_to_children(parent: QWidget,
                                       button_types=(type(None),)) -> int:
    """为 parent 下所有 QPushButton 附加点击反馈，返回附加数量"""
    from PyQt6.QtWidgets import QPushButton
    count = 0
    for btn in parent.findChildren(QPushButton):
        attach_press_feedback(btn)
        count += 1
    return count


# ========== 组合过渡：淡入 + 轻微上滑 ==========

def transition_show(widget: QWidget, duration: int = SLIDE_DURATION_MS) -> list:
    """对 widget 同时应用淡入 + 上滑过渡，返回动画对象列表（需持有引用）"""
    anims = []
    anims.append(fade_in(widget, duration=duration))
    # 上滑通过临时调整 pos 实现
    pos = widget.pos()
    anim = QPropertyAnimation(widget, b"pos")
    anim.setDuration(duration)
    anim.setStartValue(QPoint(pos.x(), pos.y() + 12))
    anim.setEndValue(pos)
    anim.setEasingCurve(QEasingCurve.Type.OutCubic)
    anim.start(QPropertyAnimation.DeletionPolicy.DeleteWhenStopped)
    anims.append(anim)
    return anims


# ========== 弹性动画 ==========

def elastic_scale(widget: QWidget, duration: int = ELASTIC_DURATION_MS,
                  scale_from: float = 0.8, scale_to: float = 1.0) -> QPropertyAnimation:
    """弹性缩放动画 - 模拟 iOS 风格的弹性效果"""
    anim = QPropertyAnimation(widget, b"size")
    anim.setDuration(duration)
    
    original_size = widget.size()
    start_size = QSize(int(original_size.width() * scale_from), 
                       int(original_size.height() * scale_from))
    end_size = QSize(int(original_size.width() * scale_to), 
                     int(original_size.height() * scale_to))
    
    anim.setStartValue(start_size)
    anim.setEndValue(end_size)
    anim.setEasingCurve(QEasingCurve.Type.OutElastic)
    anim.start(QPropertyAnimation.DeletionPolicy.DeleteWhenStopped)
    return anim


def elastic_bounce(widget: QWidget, duration: int = ELASTIC_DURATION_MS,
                   offset: int = 20) -> QPropertyAnimation:
    """弹性弹跳动画 - 从下方弹入"""
    anim = QPropertyAnimation(widget, b"pos")
    anim.setDuration(duration)
    start_pos = widget.pos()
    anim.setStartValue(QPoint(start_pos.x(), start_pos.y() + offset))
    anim.setEndValue(start_pos)
    anim.setEasingCurve(QEasingCurve.Type.OutElastic)
    anim.start(QPropertyAnimation.DeletionPolicy.DeleteWhenStopped)
    return anim


# ========== 页面切换动画 ==========

def page_transition(widget: QWidget, direction: str = "right",
                    duration: int = PAGE_TRANSITION_MS) -> list:
    """页面切换动画 - 淡入 + 滑动组合"""
    anims = []
    
    # 淡入
    anims.append(fade_in(widget, duration=duration))
    
    # 滑动
    pos = widget.pos()
    offset = 80
    
    if direction == "right":
        start_pos = QPoint(pos.x() + offset, pos.y())
    elif direction == "left":
        start_pos = QPoint(pos.x() - offset, pos.y())
    elif direction == "up":
        start_pos = QPoint(pos.x(), pos.y() + offset)
    else:  # down
        start_pos = QPoint(pos.x(), pos.y() - offset)
    
    anim = QPropertyAnimation(widget, b"pos")
    anim.setDuration(duration)
    anim.setStartValue(start_pos)
    anim.setEndValue(pos)
    anim.setEasingCurve(QEasingCurve.Type.OutCubic)
    anim.start(QPropertyAnimation.DeletionPolicy.DeleteWhenStopped)
    anims.append(anim)
    
    return anims


# ========== 微交互动画 ==========

def hover_grow(widget: QWidget, duration: int = MICRO_INTERACTION_MS) -> QPropertyAnimation:
    """悬停放大效果 - 按钮/卡片悬停时轻微放大"""
    anim = QPropertyAnimation(widget, b"size")
    anim.setDuration(duration)
    
    original_size = widget.size()
    hover_size = QSize(int(original_size.width() * 1.05), 
                       int(original_size.height() * 1.05))
    
    anim.setStartValue(original_size)
    anim.setEndValue(hover_size)
    anim.setEasingCurve(QEasingCurve.Type.OutCubic)
    anim.start(QPropertyAnimation.DeletionPolicy.DeleteWhenStopped)
    return anim


def hover_shrink(widget: QWidget, duration: int = MICRO_INTERACTION_MS) -> QPropertyAnimation:
    """悬停恢复效果 - 按钮/卡片离开悬停时恢复原始大小"""
    anim = QPropertyAnimation(widget, b"size")
    anim.setDuration(duration)
    
    original_size = widget.size()
    hover_size = QSize(int(original_size.width() * 1.05), 
                       int(original_size.height() * 1.05))
    
    anim.setStartValue(hover_size)
    anim.setEndValue(original_size)
    anim.setEasingCurve(QEasingCurve.Type.OutCubic)
    anim.start(QPropertyAnimation.DeletionPolicy.DeleteWhenStopped)
    return anim


def pulse_effect(widget: QWidget, duration: int = 800) -> QPropertyAnimation:
    """脉冲效果 - 用于吸引注意力（如新消息提示）"""
    effect = widget.graphicsEffect()
    if not isinstance(effect, QGraphicsOpacityEffect):
        effect = QGraphicsOpacityEffect(widget)
        widget.setGraphicsEffect(effect)
    
    anim = QPropertyAnimation(effect, b"opacity")
    anim.setDuration(duration)
    anim.setStartValue(1.0)
    anim.setEndValue(0.5)
    anim.setEasingCurve(QEasingCurve.Type.InOutSine)
    anim.start(QPropertyAnimation.DeletionPolicy.DeleteWhenStopped)
    return anim


def shadow_pulse(widget: QWidget, duration: int = 600) -> QPropertyAnimation:
    """阴影脉冲效果 - 用于强调重要元素"""
    effect = widget.graphicsEffect()
    if not isinstance(effect, QGraphicsDropShadowEffect):
        effect = QGraphicsDropShadowEffect(widget)
        effect.setBlurRadius(20)
        effect.setColor(QColor(0, 0, 0, 50))
        widget.setGraphicsEffect(effect)
    
    anim = QPropertyAnimation(effect, b"blurRadius")
    anim.setDuration(duration)
    anim.setStartValue(10)
    anim.setEndValue(30)
    anim.setEasingCurve(QEasingCurve.Type.InOutSine)
    anim.start(QPropertyAnimation.DeletionPolicy.DeleteWhenStopped)
    return anim


# ========== 交错动画 ==========

def staggered_fade_in(widgets: list, delay: int = 50, 
                      duration: int = FADE_DURATION_MS) -> list:
    """交错淡入动画 - 多个组件依次淡入"""
    anims = []
    for i, widget in enumerate(widgets):
        QTimer.singleShot(i * delay, lambda w=widget: fade_in(w, duration))
    return anims


def staggered_slide_in(widgets: list, direction: str = "right",
                       delay: int = 50, duration: int = SLIDE_DURATION_MS) -> list:
    """交错滑入动画 - 多个组件依次滑入"""
    anims = []
    for i, widget in enumerate(widgets):
        QTimer.singleShot(i * delay, lambda w=widget, d=direction: page_transition(w, d, duration))
    return anims
