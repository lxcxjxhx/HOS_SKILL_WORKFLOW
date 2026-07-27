#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI配置对话框 - HOS-QuizMaster V2
"""

from PyQt6.QtWidgets import (QDialog, QVBoxLayout, QHBoxLayout, QLabel,
                              QPushButton, QLineEdit, QTextEdit, QFrame,
                              QComboBox, QStackedWidget, QWidget, QMessageBox,
                              QGraphicsDropShadowEffect, QScrollArea)
from PyQt6.QtCore import Qt, QSize
from PyQt6.QtGui import QColor

from ui.design_tokens import Color, Spacing, Radius, Typography, Shadow


class AIConfigDialog(QDialog):
    """AI配置对话框"""

    def __init__(self, config_manager, parent=None):
        super().__init__(parent)
        self.config_manager = config_manager
        self.setWindowTitle("AI 服务配置")
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
        width = 600
        # 标题区(50) + 分隔线(10) + API选择(~80) + 密钥区(~120) + 模型区(~100) + 按钮(50) + 边距间距(64)
        height = 50 + 10 + 80 + 120 + 100 + 50 + 64
        # 限制高度：最小 400px，最大不超过屏幕高度的 90%
        screen = QApplication.primaryScreen()
        max_height = int(screen.availableGeometry().height() * 0.9) if screen else 700
        height = min(max(height, 500), max_height)
        return QSize(width, height)

    def init_ui(self):
        """初始化UI"""
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(Spacing.XXL, Spacing.XXL, Spacing.XXL, Spacing.XXL)
        main_layout.setSpacing(Spacing.XL)

        # ── 标题区 ──
        title = QLabel("AI 服务配置")
        title.setStyleSheet(f"""
            font-size: {Typography.SIZE_XL}px;
            font-weight: {Typography.WEIGHT_BOLD};
            color: {Color.TEXT_PRIMARY};
        """)
        main_layout.addWidget(title)

        # 分隔线
        separator = QFrame()
        separator.setFrameShape(QFrame.Shape.HLine)
        separator.setStyleSheet(f"background-color: {Color.BORDER_LIGHT}; max-height: 1px;")
        main_layout.addWidget(separator)

        # ── 滚动区域（内容可能超出时） ──
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(QFrame.Shape.NoFrame)
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

        # ── API 提供商选择 ──
        provider_group = self._create_group("API 提供商")
        provider_layout = QVBoxLayout(provider_group)
        provider_layout.setSpacing(Spacing.SM)

        self.provider_combo = QComboBox()
        self.provider_combo.addItems(["OpenAI", "Custom"])
        self.provider_combo.currentTextChanged.connect(self.on_provider_changed)
        self.provider_combo.setStyleSheet(self._input_style())
        provider_layout.addWidget(self.provider_combo)

        # 自定义 Base URL
        self.base_url_label = QLabel("API Base URL:")
        self.base_url_label.setStyleSheet(self._label_style())
        provider_layout.addWidget(self.base_url_label)

        self.base_url_input = QLineEdit()
        self.base_url_input.setPlaceholderText("https://api.example.com/v1")
        self.base_url_input.setStyleSheet(self._input_style())
        provider_layout.addWidget(self.base_url_input)

        content_layout.addWidget(provider_group)

        # ── API Key ──
        key_group = self._create_group("API 密钥")
        key_layout = QVBoxLayout(key_group)
        key_layout.setSpacing(Spacing.SM)

        self.api_key_input = QLineEdit()
        self.api_key_input.setPlaceholderText("sk-...")
        self.api_key_input.setEchoMode(QLineEdit.EchoMode.Password)
        self.api_key_input.setStyleSheet(self._input_style())
        key_layout.addWidget(self.api_key_input)

        hint = QLabel("密钥仅保存在本地，不会上传到任何服务器")
        hint.setStyleSheet(f"""
            font-size: {Typography.SIZE_XS}px;
            color: {Color.TEXT_TERTIARY};
        """)
        key_layout.addWidget(hint)

        content_layout.addWidget(key_group)

        # ── 模型选择 ──
        model_group = self._create_group("模型选择")
        model_layout = QVBoxLayout(model_group)
        model_layout.setSpacing(Spacing.SM)

        self.model_input = QComboBox()
        self.model_input.setEditable(True)
        self.model_input.setStyleSheet(self._input_style())
        model_layout.addWidget(self.model_input)

        self.model_stack = QStackedWidget()
        self.model_stack.addWidget(QWidget())  # placeholder page 0
        model_layout.addWidget(self.model_stack)

        content_layout.addWidget(model_group)

        # ── 测试连接按钮 ──
        test_btn = QPushButton("测试连接")
        test_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        test_btn.setStyleSheet(self._secondary_btn_style())
        test_btn.clicked.connect(self.test_connection)
        content_layout.addWidget(test_btn)

        content_layout.addStretch()

        scroll.setWidget(content_widget)
        main_layout.addWidget(scroll, stretch=1)

        # ── 底部按钮 ──
        btn_layout = QHBoxLayout()
        btn_layout.addStretch()

        cancel_btn = QPushButton("取消")
        cancel_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        cancel_btn.setMinimumWidth(80)
        cancel_btn.setStyleSheet(self._secondary_btn_style())
        cancel_btn.clicked.connect(self.reject)
        btn_layout.addWidget(cancel_btn)

        save_btn = QPushButton("保存")
        save_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        save_btn.setMinimumWidth(80)
        save_btn.setStyleSheet(self._primary_btn_style())
        save_btn.clicked.connect(self.save_config)
        btn_layout.addWidget(save_btn)

        main_layout.addLayout(btn_layout)

        # 加载配置
        self.load_config()
        self.on_provider_changed(self.provider_combo.currentText())

    # ── 辅助方法 ──

    def _create_group(self, title_text: str) -> QFrame:
        """创建带标题的分组卡片"""
        frame = QFrame()
        frame.setStyleSheet(f"""
            QFrame {{
                background-color: {Color.BG_SECONDARY};
                border: 1px solid {Color.BORDER_LIGHT};
                border-radius: {Radius.LG}px;
            }}
        """)
        layout = QVBoxLayout(frame)
        layout.setContentsMargins(Spacing.LG, Spacing.LG, Spacing.LG, Spacing.LG)
        layout.setSpacing(Spacing.SM)

        label = QLabel(title_text)
        label.setStyleSheet(f"""
            font-size: {Typography.SIZE_SM}px;
            font-weight: {Typography.WEIGHT_SEMI};
            color: {Color.TEXT_PRIMARY};
        """)
        layout.addWidget(label)
        return frame

    def _label_style(self) -> str:
        return f"""
            font-size: {Typography.SIZE_SM}px;
            color: {Color.TEXT_SECONDARY};
        """

    def _input_style(self) -> str:
        return f"""
            QLineEdit, QComboBox {{
                background-color: {Color.BG_PRIMARY};
                border: 1px solid {Color.BORDER_DEFAULT};
                border-radius: {Radius.MD}px;
                padding: {Spacing.SM}px {Spacing.MD}px;
                font-size: {Typography.SIZE_SM}px;
                color: {Color.TEXT_PRIMARY};
            }}
            QLineEdit:hover, QComboBox:hover {{
                border-color: {Color.BORDER_DARK};
            }}
            QLineEdit:focus, QComboBox:focus {{
                border-color: {Color.ACCENT};
                background-color: {Color.BG_PRIMARY};
            }}
        """

    def _primary_btn_style(self) -> str:
        return f"""
            QPushButton {{
                background-color: {Color.ACCENT};
                color: {Color.TEXT_INVERSE};
                border: none;
                border-radius: {Radius.MD}px;
                padding: {Spacing.SM}px {Spacing.LG}px;
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
        """

    def _secondary_btn_style(self) -> str:
        return f"""
            QPushButton {{
                background-color: {Color.BG_PRIMARY};
                color: {Color.TEXT_PRIMARY};
                border: 1px solid {Color.BORDER_DEFAULT};
                border-radius: {Radius.MD}px;
                padding: {Spacing.SM}px {Spacing.LG}px;
                font-size: {Typography.SIZE_SM}px;
                font-weight: {Typography.WEIGHT_MEDIUM};
            }}
            QPushButton:hover {{
                background-color: {Color.BG_HOVER};
                border-color: {Color.BORDER_DARK};
            }}
            QPushButton:pressed {{
                background-color: {Color.BG_ACTIVE};
            }}
            QPushButton:disabled {{
                background-color: {Color.BG_SECONDARY};
                color: {Color.TEXT_DISABLED};
                border-color: {Color.BORDER_LIGHT};
            }}
        """

    def on_provider_changed(self, provider: str):
        """切换提供商"""
        is_custom = provider == "Custom"
        self.base_url_label.setVisible(is_custom)
        self.base_url_input.setVisible(is_custom)

        self.model_input.clear()
        if provider == "OpenAI":
            self.model_input.addItems([
                "gpt-4o",
                "gpt-4o-mini",
                "gpt-4-turbo",
                "gpt-3.5-turbo"
            ])
        else:
            self.model_input.setEditable(True)
            self.model_input.setPlaceholderText("输入模型名称...")

    def load_config(self):
        """加载配置"""
        try:
            provider = self.config_manager.get_ai_provider()
            idx = self.provider_combo.findText(provider)
            if idx >= 0:
                self.provider_combo.setCurrentIndex(idx)

            self.base_url_input.setText(self.config_manager.get_ai_base_url())
            self.api_key_input.setText(self.config_manager.get_ai_api_key())

            model = self.config_manager.get_ai_model()
            idx = self.model_input.findText(model)
            if idx >= 0:
                self.model_input.setCurrentIndex(idx)
            else:
                self.model_input.setEditText(model)
        except Exception as e:
            QMessageBox.warning(self, "加载失败", f"无法加载配置: {str(e)}")

    def save_config(self):
        """保存配置"""
        try:
            self.config_manager.set_ai_provider(self.provider_combo.currentText())
            self.config_manager.set_ai_base_url(self.base_url_input.text().strip())
            self.config_manager.set_ai_api_key(self.api_key_input.text().strip())
            self.config_manager.set_ai_model(self.model_input.currentText().strip())
            self.accept()
        except Exception as e:
            QMessageBox.critical(self, "保存失败", f"无法保存配置: {str(e)}")

    def test_connection(self):
        """测试连接"""
        QMessageBox.information(
            self, "测试连接",
            "连接测试功能将在实际集成 AI 服务时实现"
        )
