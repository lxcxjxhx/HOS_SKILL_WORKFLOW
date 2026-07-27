#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
导入对话框 - HOS-QuizMaster V2
Phase 4: 导入题库文件对话框
"""

from PyQt6.QtWidgets import (QDialog, QVBoxLayout, QHBoxLayout, QLabel,
                              QPushButton, QFileDialog, QTextEdit, QFrame,
                              QGraphicsDropShadowEffect, QScrollArea, QWidget)
from PyQt6.QtCore import Qt, QSize
from PyQt6.QtGui import QColor, QFont
from parser.smart_parser import SmartParser

from ui.design_tokens import Color, Spacing, Radius, Typography, Shadow


class ImportDialog(QDialog):
    """导入题库对话框"""

    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("导入题库")
        self.setMinimumSize(700, 600)
        self.file_path = None
        self.questions = []
        self.init_ui()
        self._apply_window_style()
        self._apply_shadow()
    
    def _apply_window_style(self):
        """应用弹窗整体样式"""
        self.setStyleSheet(f"""
            QDialog {{
                background-color: {Color.BG_PRIMARY};
                border: 1px solid {Color.BORDER_LIGHT};
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
        width = 700
        # 标题(48) + 文件区域(~100) + 预览标签(30) + 预览区(250) + 统计(30) + 按钮(50) + 边距间距(48)
        height = 48 + 100 + 30 + 250 + 30 + 50 + 48
        # 限制高度：最小 400px，最大不超过屏幕高度的 90%
        screen = QApplication.primaryScreen()
        max_height = int(screen.availableGeometry().height() * 0.9) if screen else 700
        height = min(max(height, 600), max_height)
        return QSize(width, height)

    def init_ui(self):
        """初始化 UI"""
        layout = QVBoxLayout(self)
        layout.setSpacing(Spacing.XL)
        layout.setContentsMargins(Spacing.XXL, Spacing.XXL, Spacing.XXL, Spacing.XXL)

        # 标题
        title = QLabel("导入题库文件")
        title.setFont(QFont("Microsoft YaHei", Typography.SIZE_XL, Typography.WEIGHT_BOLD))
        title.setStyleSheet(f"color: {Color.TEXT_PRIMARY};")
        layout.addWidget(title)
        
        # 分隔线
        divider = QFrame()
        divider.setFrameShape(QFrame.Shape.HLine)
        divider.setStyleSheet(f"background: {Color.BORDER_DEFAULT}; max-height: 1px; margin: {Spacing.MD}px 0;")
        layout.addWidget(divider)

        # 文件选择区域
        file_frame = QFrame()
        file_frame.setStyleSheet(f"""
            QFrame {{
                background: {Color.BG_SECONDARY};
                border: 1px solid {Color.BORDER_DEFAULT};
                border-radius: {Radius.LG}px;
                padding: {Spacing.XL}px;
            }}
        """)
        file_layout = QVBoxLayout(file_frame)

        self.file_label = QLabel("未选择文件")
        self.file_label.setStyleSheet(f"font-size: {Typography.SIZE_SM}px; color: {Color.TEXT_SECONDARY};")
        file_layout.addWidget(self.file_label)

        btn_layout = QHBoxLayout()
        self.browse_btn = QPushButton("浏览文件...")
        self.browse_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.browse_btn.setStyleSheet(f"""
            QPushButton {{
                background: {Color.ACCENT};
                color: {Color.TEXT_INVERSE};
                border: none;
                border-radius: {Radius.MD}px;
                padding: {Spacing.SM}px {Spacing.LG}px;
                font-size: {Typography.SIZE_SM}px;
                font-weight: {Typography.WEIGHT_SEMI};
            }}
            QPushButton:hover {{
                background: {Color.ACCENT_HOVER};
            }}
            QPushButton:pressed {{
                background: {Color.ACCENT_ACTIVE};
            }}
            QPushButton:disabled {{
                background: {Color.BG_QUATERNARY};
                color: {Color.TEXT_DISABLED};
            }}
        """)
        self.browse_btn.clicked.connect(self._on_browse)
        btn_layout.addWidget(self.browse_btn)
        btn_layout.addStretch()
        file_layout.addLayout(btn_layout)

        layout.addWidget(file_frame)

        # 预览区域（用 QScrollArea 包裹，支持内容滚动）
        preview_label = QLabel("格式预览:")
        preview_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM, Typography.WEIGHT_SEMI))
        preview_label.setStyleSheet(f"color: {Color.TEXT_SECONDARY};")
        layout.addWidget(preview_label)

        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(QFrame.Shape.NoFrame)
        scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        scroll.setStyleSheet(f"""
            QScrollArea {{
                border: 1px solid {Color.BORDER_DEFAULT};
                border-radius: {Radius.MD}px;
                background: {Color.BG_PRIMARY};
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

        self.preview_text = QTextEdit()
        self.preview_text.setReadOnly(True)
        self.preview_text.setStyleSheet(f"""
            QTextEdit {{
                background: transparent;
                border: none;
                padding: {Spacing.MD}px;
                font-size: {Typography.SIZE_XS}px;
                color: {Color.TEXT_PRIMARY};
                font-family: "Consolas", "Courier New", monospace;
            }}
        """)
        scroll.setWidget(self.preview_text)
        layout.addWidget(scroll, stretch=1)

        # 统计信息
        self.stats_label = QLabel("题目数量: 0")
        self.stats_label.setStyleSheet(f"font-size: {Typography.SIZE_XS}px; color: {Color.TEXT_TERTIARY};")
        layout.addWidget(self.stats_label)

        # 按钮区域
        btn_layout = QHBoxLayout()
        btn_layout.addStretch()

        self.cancel_btn = QPushButton("取消")
        self.cancel_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.cancel_btn.setStyleSheet(f"""
            QPushButton {{
                background: {Color.BG_PRIMARY};
                color: {Color.TEXT_PRIMARY};
                border: 1px solid {Color.BORDER_DEFAULT};
                border-radius: {Radius.MD}px;
                padding: {Spacing.SM}px {Spacing.LG}px;
                font-size: {Typography.SIZE_SM}px;
            }}
            QPushButton:hover {{
                background: {Color.BG_HOVER};
                border-color: {Color.BORDER_DARK};
            }}
            QPushButton:pressed {{
                background: {Color.BG_ACTIVE};
            }}
            QPushButton:disabled {{
                background: {Color.BG_SECONDARY};
                color: {Color.TEXT_DISABLED};
                border-color: {Color.BORDER_LIGHT};
            }}
        """)
        self.cancel_btn.clicked.connect(self.reject)
        btn_layout.addWidget(self.cancel_btn)

        self.import_btn = QPushButton("导入")
        self.import_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.import_btn.setStyleSheet(f"""
            QPushButton {{
                background: {Color.ACCENT};
                color: {Color.TEXT_INVERSE};
                border: none;
                border-radius: {Radius.MD}px;
                padding: {Spacing.SM}px {Spacing.LG}px;
                font-size: {Typography.SIZE_SM}px;
                font-weight: {Typography.WEIGHT_SEMI};
            }}
            QPushButton:hover {{
                background: {Color.ACCENT_HOVER};
            }}
            QPushButton:pressed {{
                background: {Color.ACCENT_ACTIVE};
            }}
            QPushButton:disabled {{
                background: {Color.BG_QUATERNARY};
                color: {Color.TEXT_DISABLED};
            }}
        """)
        self.import_btn.clicked.connect(self._on_import)
        self.import_btn.setEnabled(False)
        btn_layout.addWidget(self.import_btn)

        layout.addLayout(btn_layout)

    def _on_browse(self):
        """浏览文件"""
        file_path, _ = QFileDialog.getOpenFileName(
            self, "选择题库文件", "",
            "Markdown Files (*.md);;Text Files (*.txt);;All Files (*)"
        )

        if file_path:
            self.file_path = file_path
            self.file_label.setText(f"文件: {file_path}")
            self._preview_file()

    def _preview_file(self):
        """预览文件"""
        if not self.file_path:
            return

        try:
            # 读取文件内容
            with open(self.file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # 显示前 500 字符
            preview = content[:500]
            if len(content) > 500:
                preview += "\n... (内容已截断)"

            self.preview_text.setPlainText(preview)

            # 尝试解析
            parser = SmartParser()
            self.questions = parser.parse_file(self.file_path)
            self.stats_label.setText(f"题目数量: {len(self.questions)}")
            self.import_btn.setEnabled(len(self.questions) > 0)

        except Exception as e:
            self.preview_text.setPlainText(f"错误: {str(e)}")
            self.stats_label.setText("题目数量: 0")
            self.import_btn.setEnabled(False)

    def _on_import(self):
        """导入确认"""
        self.accept()

    def get_questions(self) -> list:
        """获取解析的题目"""
        return self.questions

    def get_file_path(self) -> str:
        """获取文件路径"""
        return self.file_path
