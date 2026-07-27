#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Toast 提示组件 - HOS-QuizMaster V2
Linear/Notion 风格重构
轻量级自动消失提示，支持 success / error / warning / info 四种类型
"""

from PyQt6.QtWidgets import QWidget, QLabel, QHBoxLayout, QGraphicsDropShadowEffect
from PyQt6.QtCore import Qt, QTimer, QPropertyAnimation, QEasingCurve
from PyQt6.QtGui import QColor, QFont

from ui.design_tokens import Color, Spacing, Radius, Typography


class Toast(QWidget):
    """轻量级 Toast 提示 - Linear 风格"""

    _THEMES = {
        "success": {"icon": "✓", "bg": Color.SUCCESS_BG, "fg": "#166534", "border": Color.SUCCESS},
        "error":   {"icon": "✗", "bg": Color.ERROR_BG, "fg": "#991b1b", "border": Color.ERROR},
        "warning": {"icon": "⚠", "bg": Color.WARNING_BG, "fg": "#92400e", "border": Color.WARNING},
        "info":    {"icon": "ℹ", "bg": Color.ACCENT_BG, "fg": "#1e40af", "border": Color.ACCENT},
    }

    def __init__(self, message: str, toast_type: str = "info", duration_ms: int = 3000, parent=None):
        super().__init__(parent)
        self._duration = duration_ms
        theme = self._THEMES.get(toast_type, self._THEMES["info"])

        self.setWindowFlags(Qt.WindowType.FramelessWindowHint | Qt.WindowType.Tool | Qt.WindowType.WindowStaysOnTopHint)
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        self.setAttribute(Qt.WidgetAttribute.WA_ShowWithoutActivating)

        layout = QHBoxLayout(self)
        layout.setContentsMargins(Spacing.MD, Spacing.SM, Spacing.LG, Spacing.SM)
        layout.setSpacing(Spacing.SM)

        icon_label = QLabel(theme["icon"])
        icon_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_MD, Typography.WEIGHT_BOLD))
        icon_label.setStyleSheet(f"color: {theme['border']};")
        layout.addWidget(icon_label)

        msg_label = QLabel(message)
        msg_label.setWordWrap(True)
        msg_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM))
        msg_label.setStyleSheet(
            f"background: {theme['bg']}; color: {theme['fg']}; "
            f"padding: {Spacing.SM}px {Spacing.MD}px; border-radius: {Radius.MD}px; "
            f"border: 1px solid {theme['border']};"
        )
        layout.addWidget(msg_label, stretch=1)

        shadow = QGraphicsDropShadowEffect()
        shadow.setBlurRadius(12)
        shadow.setXOffset(0)
        shadow.setYOffset(2)
        shadow.setColor(QColor(0, 0, 0, 30))
        self.setGraphicsEffect(shadow)

        self.adjustSize()

        self._fade_timer = QTimer(self)
        self._fade_timer.setSingleShot(True)
        self._fade_timer.timeout.connect(self._start_fade_out)

        self._fade_anim = QPropertyAnimation(self, b"windowOpacity")
        self._fade_anim.setDuration(250)
        self._fade_anim.setStartValue(1.0)
        self._fade_anim.setEndValue(0.0)
        self._fade_anim.setEasingCurve(QEasingCurve.Type.OutCubic)
        self._fade_anim.finished.connect(self.close)

    def show_toast(self):
        """显示 Toast（定位到父组件底部居中）"""
        parent = self.parent()
        if parent:
            parent_rect = parent.geometry()
            x = parent_rect.x() + (parent_rect.width() - self.width()) // 2
            y = parent_rect.y() + parent_rect.height() - self.height() - 40
            self.move(x, y)
        self.setWindowOpacity(1.0)
        self.show()
        self._fade_timer.start(self._duration)

    def _start_fade_out(self):
        self._fade_anim.start()
