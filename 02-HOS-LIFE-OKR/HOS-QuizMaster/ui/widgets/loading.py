#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
加载状态组件 - HOS-QuizMaster V2
Linear/Notion 风格重构
"""

from PyQt6.QtWidgets import (QWidget, QVBoxLayout, QLabel, QProgressBar, QFrame)
from PyQt6.QtCore import Qt, QTimer
from PyQt6.QtGui import QFont

from ui.design_tokens import Color, Spacing, Radius, Typography


class LoadingOverlay(QWidget):
    """加载状态覆盖层 - Linear 风格"""

    def __init__(self, parent=None, message: str = "加载中..."):
        super().__init__(parent)
        self.setWindowFlags(Qt.WindowType.FramelessWindowHint | Qt.WindowType.Tool)
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(Spacing.XL, Spacing.XL, Spacing.XL, Spacing.XL)

        self.setStyleSheet(f"""
            QWidget {{
                background: {Color.BG_PRIMARY};
                border-radius: {Radius.XL}px;
            }}
        """)

        self.msg_label = QLabel(message)
        self.msg_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.msg_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM, Typography.WEIGHT_MEDIUM))
        self.msg_label.setStyleSheet(f"color: {Color.TEXT_PRIMARY}; padding: {Spacing.SM}px 0;")
        layout.addWidget(self.msg_label)

        self.progress_bar = QProgressBar()
        self.progress_bar.setRange(0, 0)
        self.progress_bar.setFixedHeight(4)
        self.progress_bar.setStyleSheet(f"""
            QProgressBar {{
                background: {Color.BORDER_LIGHT};
                border: none;
                border-radius: 2px;
            }}
            QProgressBar::chunk {{
                background: {Color.ACCENT};
                border-radius: 2px;
            }}
        """)
        layout.addWidget(self.progress_bar)

        self.adjustSize()

    def set_message(self, message: str):
        self.msg_label.setText(message)

    def set_progress(self, value: int, maximum: int):
        self.progress_bar.setRange(0, maximum)
        self.progress_bar.setValue(value)


class SkeletonScreen(QWidget):
    """骨架屏加载效果 - Linear 风格"""

    def __init__(self, parent=None, item_count: int = 3):
        super().__init__(parent)
        self._item_count = item_count
        self._pulse_timer = QTimer(self)
        self._pulse_timer.timeout.connect(self._pulse_animation)
        self._pulse_value = 0.3

        layout = QVBoxLayout(self)
        layout.setContentsMargins(Spacing.XXL, Spacing.XXL, Spacing.XXL, Spacing.XXL)
        layout.setSpacing(Spacing.LG)

        self._skeleton_items = []

        for _ in range(item_count):
            item = self._create_skeleton_item()
            layout.addWidget(item)
            self._skeleton_items.append(item)

        layout.addStretch()

        self.setStyleSheet(f"background: {Color.BG_PRIMARY};")
        self._pulse_timer.start(800)

    def _create_skeleton_item(self) -> QWidget:
        container = QWidget()
        layout = QVBoxLayout(container)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(Spacing.SM)

        title_skeleton = QFrame()
        title_skeleton.setFixedHeight(16)
        title_skeleton.setMinimumWidth(200)
        title_skeleton.setStyleSheet(f"""
            background: {Color.BG_TERTIARY};
            border-radius: {Radius.SM}px;
        """)
        title_skeleton.setProperty("skeleton", True)
        layout.addWidget(title_skeleton)

        content_skeleton = QFrame()
        content_skeleton.setFixedHeight(12)
        content_skeleton.setMinimumWidth(300)
        content_skeleton.setStyleSheet(f"""
            background: {Color.BG_SECONDARY};
            border-radius: {Radius.SM}px;
        """)
        content_skeleton.setProperty("skeleton", True)
        layout.addWidget(content_skeleton)

        line = QFrame()
        line.setFrameShape(QFrame.Shape.HLine)
        line.setStyleSheet(f"background: {Color.BG_SECONDARY}; max-height: 1px; margin: {Spacing.SM}px 0;")
        layout.addWidget(line)

        return container

    def _pulse_animation(self):
        self._pulse_value = 1.0 - self._pulse_value
        opacity = 0.3 + (self._pulse_value * 0.4)
        color = f"rgba(239, 239, 239, {opacity})"

        for item in self._skeleton_items:
            for child in item.findChildren(QFrame):
                if child.property("skeleton"):
                    child.setStyleSheet(f"""
                        background: {color};
                        border-radius: {Radius.SM}px;
                    """)

    def stop_animation(self):
        self._pulse_timer.stop()
