#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
增强错误对话框 - HOS-QuizMaster V2
Phase 15: 交互细节打磨
显示具体错误原因和恢复建议
"""

from PyQt6.QtWidgets import (QDialog, QVBoxLayout, QHBoxLayout, QLabel,
                              QPushButton, QTextEdit, QFrame,
                              QGraphicsDropShadowEffect, QScrollArea, QWidget)
from PyQt6.QtCore import Qt, QSize
from PyQt6.QtGui import QIcon, QColor

from ui.design_tokens import Color, Spacing, Radius, Typography, Shadow


class ErrorDialog(QDialog):
    """增强错误对话框，显示错误原因和恢复建议"""

    def __init__(self, title: str, error_message: str, recovery_suggestion: str = "",
                 details: str = "", parent=None):
        super().__init__(parent)
        self.setWindowTitle(title)
        self.setModal(True)
        # 移除固定尺寸，改用 sizeHint() 动态计算
        self.setMinimumSize(600, 500)

        # 保存参数用于 sizeHint
        self._error_message = error_message
        self._recovery_suggestion = recovery_suggestion
        self._details = details

        self.init_ui()
        self._apply_window_style()
        self._apply_shadow()

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

    def init_ui(self):
        """初始化 UI"""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(Spacing.XXL, Spacing.XXL, Spacing.XXL, Spacing.XXL)
        layout.setSpacing(Spacing.XL)

        # 标题图标 + 标题
        header_layout = QHBoxLayout()
        header_layout.setSpacing(Spacing.MD)

        icon_label = QLabel("⚠")
        icon_label.setStyleSheet(f"""
            font-size: {Typography.SIZE_MASSIVE}px;
            color: {Color.ERROR};
        """)
        header_layout.addWidget(icon_label)

        title_label = QLabel(self.windowTitle())
        title_label.setStyleSheet(f"""
            font-size: {Typography.SIZE_LG}px;
            font-weight: {Typography.WEIGHT_BOLD};
            color: {Color.TEXT_PRIMARY};
        """)
        header_layout.addWidget(title_label, stretch=1)

        layout.addLayout(header_layout)

        # 分隔线
        line1 = QFrame()
        line1.setFrameShape(QFrame.Shape.HLine)
        line1.setStyleSheet(f"background-color: {Color.BORDER_LIGHT}; max-height: 1px;")
        layout.addWidget(line1)

        # 滚动区域（内容可能超出时）
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(QFrame.Shape.NoFrame)
        scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        scroll.setStyleSheet(f"""
            QScrollArea {{
                border: none;
                background: transparent;
            }}
            QScrollBar:vertical {{
                background: {Color.BG_PRIMARY};
                width: 6px;
                border-radius: {Radius.SM}px;
                margin: 0px;
            }}
            QScrollBar::handle:vertical {{
                background: {Color.BORDER_DARK};
                border-radius: 3px;
                min-height: 30px;
            }}
            QScrollBar::handle:vertical:hover {{
                background: {Color.TEXT_TERTIARY};
            }}
            QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {{
                height: 0px;
            }}
            QScrollBar::add-page:vertical, QScrollBar::sub-page:vertical {{
                background: transparent;
            }}
        """)

        content_widget = QWidget()
        content_layout = QVBoxLayout(content_widget)
        content_layout.setContentsMargins(0, 0, 0, 0)
        content_layout.setSpacing(Spacing.XL)

        # 错误原因
        error_section = QVBoxLayout()
        error_section.setSpacing(Spacing.SM)

        error_header = QLabel("错误原因")
        error_header.setStyleSheet(f"""
            font-size: {Typography.SIZE_SM}px;
            font-weight: {Typography.WEIGHT_BOLD};
            color: {Color.TEXT_SECONDARY};
        """)
        error_section.addWidget(error_header)

        error_text = QLabel(self._error_message)
        error_text.setWordWrap(True)
        error_text.setStyleSheet(f"""
            font-size: {Typography.SIZE_SM}px;
            color: {Color.ERROR};
            background-color: {Color.ERROR_BG};
            padding: {Spacing.MD}px {Spacing.MD}px;
            border-radius: {Radius.MD}px;
            border: 1px solid {Color.ERROR_BG_HOVER};
        """)
        error_section.addWidget(error_text)

        content_layout.addLayout(error_section)

        # 恢复建议（如果有）
        if self._recovery_suggestion:
            recovery_section = QVBoxLayout()
            recovery_section.setSpacing(Spacing.SM)

            recovery_header = QLabel("恢复建议")
            recovery_header.setStyleSheet(f"""
                font-size: {Typography.SIZE_SM}px;
                font-weight: {Typography.WEIGHT_BOLD};
                color: {Color.TEXT_SECONDARY};
            """)
            recovery_section.addWidget(recovery_header)

            recovery_text = QLabel(self._recovery_suggestion)
            recovery_text.setWordWrap(True)
            recovery_text.setStyleSheet(f"""
                font-size: {Typography.SIZE_SM}px;
                color: {Color.SUCCESS};
                background-color: {Color.SUCCESS_BG};
                padding: {Spacing.MD}px {Spacing.MD}px;
                border-radius: {Radius.MD}px;
                border: 1px solid {Color.SUCCESS_BG_HOVER};
            """)
            recovery_section.addWidget(recovery_text)

            content_layout.addLayout(recovery_section)

        # 详细信息（如果有）
        if self._details:
            details_section = QVBoxLayout()
            details_section.setSpacing(Spacing.SM)

            details_header = QLabel("详细信息")
            details_header.setStyleSheet(f"""
                font-size: {Typography.SIZE_SM}px;
                font-weight: {Typography.WEIGHT_BOLD};
                color: {Color.TEXT_SECONDARY};
            """)
            details_section.addWidget(details_header)

            details_text = QTextEdit()
            details_text.setReadOnly(True)
            details_text.setPlainText(self._details)
            details_text.setMaximumHeight(120)
            details_text.setStyleSheet(f"""
                font-size: {Typography.SIZE_XS}px;
                color: {Color.TEXT_TERTIARY};
                background-color: {Color.BG_SECONDARY};
                border: 1px solid {Color.BORDER_LIGHT};
                border-radius: {Radius.MD}px;
                padding: {Spacing.SM}px;
                font-family: 'Consolas', 'Courier New', monospace;
            """)
            details_section.addWidget(details_text)

            content_layout.addLayout(details_section)

        content_layout.addStretch()
        scroll.setWidget(content_widget)
        layout.addWidget(scroll, stretch=1)

        # 按钮区域
        button_layout = QHBoxLayout()
        button_layout.addStretch()

        close_btn = QPushButton("关闭")
        close_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        close_btn.setMinimumWidth(80)
        close_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {Color.ACCENT};
                color: {Color.TEXT_INVERSE};
                border: none;
                border-radius: {Radius.MD}px;
                padding: {Spacing.SM}px {Spacing.XL}px;
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
        close_btn.clicked.connect(self.accept)
        button_layout.addWidget(close_btn)

        layout.addLayout(button_layout)

    def sizeHint(self) -> QSize:
        """根据内容动态计算合适的尺寸"""
        from PyQt6.QtWidgets import QApplication
        width = 550
        # 基础高度：标题区(50) + 分隔线(10) + 错误原因(~80) + 按钮(50) + 边距间距(48)
        height = 50 + 10 + 80 + 50 + 48

        # 如果有恢复建议，增加高度
        if self._recovery_suggestion:
            height += 80

        # 如果有详细信息，增加高度
        if self._details:
            height += 140  # 标题(20) + 文本框(120)

        # 限制高度：最小 350px，最大不超过屏幕高度的 90%
        screen = QApplication.primaryScreen()
        max_height = int(screen.availableGeometry().height() * 0.9) if screen else 700
        height = min(max(height, 500), max_height)
        return QSize(width, height)
