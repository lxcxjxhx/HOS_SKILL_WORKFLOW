#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
设置对话框 - HOS-QuizMaster V2
Phase 4: 设置对话框
"""

from PyQt6.QtWidgets import (QDialog, QVBoxLayout, QHBoxLayout, QLabel,
                              QPushButton, QComboBox, QCheckBox, QFrame,
                              QGroupBox, QSpinBox, QGraphicsDropShadowEffect,
                              QScrollArea, QWidget)
from PyQt6.QtCore import Qt, pyqtSignal, QSize
from PyQt6.QtGui import QColor, QFont

from ui.design_tokens import Color, Spacing, Radius, Typography, Shadow


class SettingsDialog(QDialog):
    """设置对话框"""

    settings_changed = pyqtSignal(dict)

    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("设置")
        self.setMinimumSize(600, 500)
        self.settings = {}
        self.init_ui()
        self._apply_window_style()
        self._apply_shadow()
        self._load_settings()

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
        width = 600
        # 标题(48) + 外观组(~120) + 学习组(~180) + 按钮(50) + 边距间距(48)
        height = 48 + 120 + 180 + 50 + 48
        # 限制高度：最小 400px，最大不超过屏幕高度的 90%
        screen = QApplication.primaryScreen()
        max_height = int(screen.availableGeometry().height() * 0.9) if screen else 500
        height = min(max(height, 500), max_height)
        return QSize(width, height)

    def init_ui(self):
        """初始化 UI"""
        layout = QVBoxLayout(self)
        layout.setSpacing(Spacing.XL)
        layout.setContentsMargins(Spacing.XXL, Spacing.XXL, Spacing.XXL, Spacing.XXL)

        # 标题
        title = QLabel("设置")
        title.setFont(QFont("Microsoft YaHei", Typography.SIZE_XL, Typography.WEIGHT_BOLD))
        title.setStyleSheet(f"color: {Color.TEXT_PRIMARY};")
        layout.addWidget(title)

        # 分隔线
        divider = QFrame()
        divider.setFrameShape(QFrame.Shape.HLine)
        divider.setStyleSheet(f"background: {Color.BORDER_DEFAULT}; max-height: 1px; margin: {Spacing.MD}px 0;")
        layout.addWidget(divider)

        # 滚动区域
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

        scroll_content = QWidget()
        scroll_layout = QVBoxLayout(scroll_content)
        scroll_layout.setSpacing(Spacing.XL)
        scroll_layout.setContentsMargins(0, 0, 0, 0)

        # ===== 外观设置 =====
        appearance_group = QGroupBox("外观")
        appearance_group.setStyleSheet(f"""
            QGroupBox {{
                font-size: {Typography.SIZE_SM}px;
                font-weight: {Typography.WEIGHT_SEMI};
                color: {Color.TEXT_SECONDARY};
                border: 1px solid {Color.BORDER_DEFAULT};
                border-radius: {Radius.LG}px;
                margin-top: {Spacing.MD}px;
                padding-top: {Spacing.XL}px;
                background: {Color.BG_SECONDARY};
            }}
            QGroupBox::title {{
                subcontrol-origin: margin;
                left: {Spacing.MD}px;
                padding: 0 {Spacing.SM}px;
            }}
        """)
        appearance_layout = QVBoxLayout(appearance_group)

        # 主题选择
        theme_layout = QHBoxLayout()
        theme_label = QLabel("主题:")
        theme_label.setStyleSheet(f"font-size: {Typography.SIZE_SM}px; color: {Color.TEXT_SECONDARY};")
        theme_layout.addWidget(theme_label)

        self.theme_combo = QComboBox()
        self.theme_combo.addItem("浅色主题", "light")
        self.theme_combo.addItem("深色主题", "dark")
        self.theme_combo.setStyleSheet(f"""
            QComboBox {{
                background: {Color.BG_PRIMARY};
                border: 1px solid {Color.BORDER_DEFAULT};
                border-radius: {Radius.MD}px;
                padding: {Spacing.SM}px {Spacing.MD}px;
                font-size: {Typography.SIZE_SM}px;
                color: {Color.TEXT_PRIMARY};
                min-width: 150px;
            }}
            QComboBox:hover {{
                border-color: {Color.ACCENT};
            }}
            QComboBox:focus {{
                border-color: {Color.ACCENT};
            }}
        """)
        theme_layout.addWidget(self.theme_combo)
        theme_layout.addStretch()
        appearance_layout.addLayout(theme_layout)

        scroll_layout.addWidget(appearance_group)

        # ===== 学习设置 =====
        study_group = QGroupBox("学习")
        study_group.setStyleSheet(appearance_group.styleSheet())
        study_layout = QVBoxLayout(study_group)

        # 自动保存
        self.auto_save_check = QCheckBox("自动保存答题进度")
        self.auto_save_check.setStyleSheet(f"""
            QCheckBox {{
                font-size: {Typography.SIZE_SM}px;
                color: {Color.TEXT_SECONDARY};
                spacing: {Spacing.SM}px;
            }}
            QCheckBox::indicator {{
                width: 16px;
                height: 16px;
                border: 1px solid {Color.BORDER_DARK};
                border-radius: 3px;
                background: {Color.BG_PRIMARY};
            }}
            QCheckBox::indicator:checked {{
                background: {Color.ACCENT};
                border-color: {Color.ACCENT};
            }}
            QCheckBox::indicator:hover {{
                border-color: {Color.ACCENT};
            }}
        """)
        study_layout.addWidget(self.auto_save_check)

        # 自动显示答案
        self.auto_show_answer_check = QCheckBox("答题后自动显示答案")
        self.auto_show_answer_check.setStyleSheet(self.auto_save_check.styleSheet())
        study_layout.addWidget(self.auto_show_answer_check)

        # 随机模式题数
        random_layout = QHBoxLayout()
        random_label = QLabel("随机模式题数:")
        random_label.setStyleSheet(f"font-size: {Typography.SIZE_SM}px; color: {Color.TEXT_SECONDARY};")
        random_layout.addWidget(random_label)

        self.random_count_spin = QSpinBox()
        self.random_count_spin.setMinimum(10)
        self.random_count_spin.setMaximum(1000)
        self.random_count_spin.setValue(50)
        self.random_count_spin.setStyleSheet(f"""
            QSpinBox {{
                background: {Color.BG_PRIMARY};
                border: 1px solid {Color.BORDER_DEFAULT};
                border-radius: {Radius.MD}px;
                padding: {Spacing.XS}px {Spacing.SM}px;
                font-size: {Typography.SIZE_SM}px;
                color: {Color.TEXT_PRIMARY};
                min-width: 80px;
            }}
            QSpinBox:hover {{
                border-color: {Color.ACCENT};
            }}
            QSpinBox:focus {{
                border-color: {Color.ACCENT};
            }}
        """)
        random_layout.addWidget(self.random_count_spin)
        random_layout.addStretch()
        study_layout.addLayout(random_layout)

        scroll_layout.addWidget(study_group)
        scroll_layout.addStretch()
        scroll.setWidget(scroll_content)
        layout.addWidget(scroll, stretch=1)

        # ===== 按钮区域 =====
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

        self.apply_btn = QPushButton("应用")
        self.apply_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.apply_btn.setStyleSheet(f"""
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
        self.apply_btn.clicked.connect(self._on_apply)
        btn_layout.addWidget(self.apply_btn)

        self.ok_btn = QPushButton("确定")
        self.ok_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.ok_btn.setStyleSheet(f"""
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
        self.ok_btn.clicked.connect(self._on_ok)
        btn_layout.addWidget(self.ok_btn)

        layout.addLayout(btn_layout)

    def _load_settings(self):
        """加载设置"""
        # 默认设置
        self.settings = {
            'theme': 'light',
            'auto_save': True,
            'auto_show_answer': True,
            'random_count': 50,
        }

        # 应用到 UI
        theme_index = self.theme_combo.findData(self.settings['theme'])
        if theme_index >= 0:
            self.theme_combo.setCurrentIndex(theme_index)

        self.auto_save_check.setChecked(self.settings['auto_save'])
        self.auto_show_answer_check.setChecked(self.settings['auto_show_answer'])
        self.random_count_spin.setValue(self.settings['random_count'])

    def _on_apply(self):
        """应用设置"""
        self.settings = {
            'theme': self.theme_combo.currentData(),
            'auto_save': self.auto_save_check.isChecked(),
            'auto_show_answer': self.auto_show_answer_check.isChecked(),
            'random_count': self.random_count_spin.value(),
        }
        self.settings_changed.emit(self.settings)

    def _on_ok(self):
        """确定"""
        self._on_apply()
        self.accept()

    def get_settings(self) -> dict:
        """获取设置"""
        return self.settings
