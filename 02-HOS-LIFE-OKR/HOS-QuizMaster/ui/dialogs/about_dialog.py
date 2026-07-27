#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
关于对话框 - HOS-QuizMaster V2
"""

from PyQt6.QtWidgets import (QDialog, QVBoxLayout, QHBoxLayout, QLabel,
                              QPushButton, QTextBrowser, QFrame,
                              QGraphicsDropShadowEffect, QScrollArea)
from PyQt6.QtCore import Qt, QSize
from PyQt6.QtGui import QColor

from ui.design_tokens import Color, Spacing, Radius, Typography, Shadow


class AboutDialog(QDialog):
    """关于对话框"""

    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("关于 HOS-QuizMaster")
        # 移除固定尺寸，改用 sizeHint() 动态计算
        self.setMinimumSize(600, 500)
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

    def sizeHint(self) -> QSize:
        """根据内容计算合适的尺寸"""
        from PyQt6.QtWidgets import QApplication
        width = 550
        # 标题(30) + 版本(20) + 描述(20) + 分隔线(10) + 信息区(~200) + 按钮(40) + 边距间距(64)
        height = 30 + 20 + 20 + 10 + 200 + 40 + 64
        # 限制高度：最小 400px，最大不超过屏幕高度的 90%
        screen = QApplication.primaryScreen()
        max_height = int(screen.availableGeometry().height() * 0.9) if screen else 600
        height = min(max(height, 500), max_height)
        return QSize(width, height)

    def init_ui(self):
        """初始化 UI"""
        layout = QVBoxLayout(self)
        layout.setSpacing(Spacing.XL)
        layout.setContentsMargins(Spacing.XXL, Spacing.XXL, Spacing.XXL, Spacing.XXL)

        # 标题
        title = QLabel("HOS-QuizMaster V2")
        title.setStyleSheet(f"""
            font-size: {Typography.SIZE_XXL}px;
            font-weight: {Typography.WEIGHT_BOLD};
            color: {Color.TEXT_PRIMARY};
        """)
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(title)

        # 版本
        version = QLabel("版本 2.0.0")
        version.setStyleSheet(f"""
            font-size: {Typography.SIZE_SM}px;
            color: {Color.TEXT_TERTIARY};
        """)
        version.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(version)

        # 描述
        desc = QLabel("智能刷题工具 - 高效备考助手")
        desc.setStyleSheet(f"""
            font-size: {Typography.SIZE_SM}px;
            color: {Color.TEXT_SECONDARY};
        """)
        desc.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(desc)

        # 分隔线
        separator = QFrame()
        separator.setFrameShape(QFrame.Shape.HLine)
        separator.setStyleSheet(f"background-color: {Color.BORDER_LIGHT}; max-height: 1px;")
        layout.addWidget(separator)

        # 详细信息（带滚动支持）
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

        info_browser = QTextBrowser()
        info_browser.setOpenExternalLinks(True)
        info_browser.setStyleSheet(f"""
            QTextBrowser {{
                background-color: {Color.BG_SECONDARY};
                border: 1px solid {Color.BORDER_LIGHT};
                border-radius: {Radius.LG}px;
                padding: {Spacing.MD}px;
                font-size: {Typography.SIZE_SM}px;
                color: {Color.TEXT_SECONDARY};
            }}
        """)
        info_browser.setHtml("""
            <div style="line-height: 1.8;">
                <p><b>功能特性：</b></p>
                <ul>
                    <li>支持单选题、多选题、判断题等多种题型</li>
                    <li>智能解析 Markdown 格式题库</li>
                    <li>刷题模式、考试模式、收藏模式</li>
                    <li>题目导航、搜索、标记、收藏</li>
                    <li>答题统计与进度追踪</li>
                    <li>图片支持（自动加载、缩放）</li>
                </ul>
                <p><b>技术栈：</b> Python 3 + PyQt6</p>
                <p><b>开源协议：</b> MIT License</p>
            </div>
        """)

        scroll.setWidget(info_browser)
        layout.addWidget(scroll, stretch=1)

        # 按钮
        btn_layout = QHBoxLayout()
        btn_layout.addStretch()

        close_btn = QPushButton("关闭")
        close_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        close_btn.setMinimumWidth(100)
        close_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {Color.ACCENT};
                color: {Color.TEXT_INVERSE};
                border: none;
                padding: {Spacing.SM}px {Spacing.LG}px;
                border-radius: {Radius.MD}px;
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
        close_btn.clicked.connect(self.close)
        btn_layout.addWidget(close_btn)

        layout.addLayout(btn_layout)
