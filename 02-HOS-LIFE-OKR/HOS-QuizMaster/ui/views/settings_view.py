#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
设置视图 - HOS-QuizMaster V2
Linear/Notion 风格重构
"""

from PyQt6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QLabel, QFrame,
                              QComboBox, QCheckBox, QPushButton, QStackedWidget,
                              QGraphicsDropShadowEffect)
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QFont, QColor

from ui.design_tokens import Color, Spacing, Radius, Typography, Shadow


class SettingsView(QWidget):
    """设置视图 - Linear 风格"""

    theme_changed = pyqtSignal(str)

    def __init__(self, parent=None):
        super().__init__(parent)
        self.init_ui()

    def init_ui(self):
        """初始化 UI"""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        content = QWidget()
        content.setStyleSheet(f"background: {Color.BG_PRIMARY};")
        self.content_layout = QVBoxLayout(content)
        self.content_layout.setContentsMargins(
            Spacing.XXXL, Spacing.XXL, Spacing.XXXL, Spacing.XXL)
        self.content_layout.setSpacing(Spacing.XL)

        # ===== 顶部栏 =====
        header = QHBoxLayout()
        header.setSpacing(Spacing.LG)

        title_layout = QVBoxLayout()
        title_layout.setSpacing(Spacing.XS)

        title = QLabel("设置")
        title.setFont(QFont("Microsoft YaHei", Typography.SIZE_XXL,
                            Typography.WEIGHT_BOLD))
        title.setStyleSheet(f"color: {Color.TEXT_PRIMARY};")
        title_layout.addWidget(title)

        subtitle = QLabel("偏好配置 · 个性化")
        subtitle.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM))
        subtitle.setStyleSheet(f"color: {Color.TEXT_TERTIARY};")
        title_layout.addWidget(subtitle)

        header.addLayout(title_layout)
        header.addStretch()

        self.content_layout.addLayout(header)

        # ===== 外观设置（卡片区域）=====
        appearance_card = self._create_section_card("外观设置")
        appearance_row = self._create_form_row("主题")
        self.theme_combo = QComboBox()
        self.theme_combo.addItem("浅色主题", "light")
        self.theme_combo.addItem("深色主题", "dark")
        self.theme_combo.setFont(QFont(
            "Microsoft YaHei", Typography.SIZE_SM, Typography.WEIGHT_MEDIUM))
        self.theme_combo.setFixedHeight(36)
        self.theme_combo.setMinimumWidth(160)
        self.theme_combo.setStyleSheet(f"""
            QComboBox {{
                padding: 0 {Spacing.MD}px;
                border: 1px solid {Color.BORDER_DEFAULT};
                border-radius: {Radius.MD}px;
                background: {Color.BG_PRIMARY};
                color: {Color.TEXT_PRIMARY};
            }}
            QComboBox:hover {{
                border-color: {Color.BORDER_DARK};
                background: {Color.BG_PRIMARY};
            }}
            QComboBox:focus {{
                border-color: {Color.ACCENT};
                background: {Color.BG_PRIMARY};
            }}
            QComboBox::drop-down {{ border: none; width: 24px; }}
        """)
        self.theme_combo.currentIndexChanged.connect(self._on_theme_changed)
        appearance_row.addWidget(self.theme_combo)
        appearance_card.layout().addLayout(appearance_row)
        self.content_layout.addWidget(appearance_card)

        # ===== 刷题设置（卡片区域）=====
        quiz_card = self._create_section_card("刷题设置")

        self.auto_next_check = self._create_checkbox("答题后自动跳转下一题")
        quiz_card.layout().addWidget(self.auto_next_check)

        self.show_answer_check = self._create_checkbox("答题后立即显示答案")
        self.show_answer_check.setChecked(True)
        quiz_card.layout().addWidget(self.show_answer_check)

        self.content_layout.addWidget(quiz_card)

        # ===== 导入导出（卡片区域）=====
        data_card = self._create_section_card("数据管理")

        io_row = QHBoxLayout()
        io_row.setSpacing(Spacing.SM)

        import_btn = self._create_action_button("导入题库", primary=True)
        io_row.addWidget(import_btn)

        export_btn = self._create_action_button("导出数据", primary=False)
        io_row.addWidget(export_btn)

        io_row.addStretch()
        data_card.layout().addLayout(io_row)
        self.content_layout.addWidget(data_card)

        # ===== 关于（卡片区域）=====
        about_card = self._create_section_card("关于")

        about_inner = QVBoxLayout()
        about_inner.setContentsMargins(0, 0, 0, 0)
        about_inner.setSpacing(Spacing.XS)

        name_label = QLabel("HOS-QuizMaster")
        name_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_LG,
                                  Typography.WEIGHT_BOLD))
        name_label.setStyleSheet(f"color: {Color.ACCENT};")
        about_inner.addWidget(name_label)

        version_label = QLabel("版本 2.0.0")
        version_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM))
        version_label.setStyleSheet(f"color: {Color.TEXT_SECONDARY};")
        about_inner.addWidget(version_label)

        desc_label = QLabel("一个现代化的刷题工具，支持多种题型和学习模式。")
        desc_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM))
        desc_label.setStyleSheet(f"color: {Color.TEXT_TERTIARY};")
        desc_label.setWordWrap(True)
        about_inner.addWidget(desc_label)

        about_card.layout().addLayout(about_inner)
        self.content_layout.addWidget(about_card)

        self.content_layout.addStretch()

        layout.addWidget(content)

    def _create_section_card(self, title_text: str) -> QWidget:
        """创建卡片样式的分组区域 - 增强视觉层次与悬停效果"""
        card = QWidget()
        card.setProperty("class", "section-card")
        card.setStyleSheet(f"""
            QWidget[class="section-card"] {{
                background: {Color.BG_SECONDARY};
                border: 1px solid {Color.BORDER_LIGHT};
                border-radius: {Radius.XL}px;
            }}
            QWidget[class="section-card"]:hover {{
                border: 1px solid {Color.BORDER_DEFAULT};
            }}
        """)
        # 添加阴影
        shadow = QGraphicsDropShadowEffect()
        shadow.setBlurRadius(Shadow.CARD_DEFAULT[0])
        shadow.setXOffset(Shadow.CARD_DEFAULT[1])
        shadow.setYOffset(Shadow.CARD_DEFAULT[2])
        shadow.setColor(QColor(0, 0, 0, int(Shadow.CARD_DEFAULT[3] * 255)))
        card.setGraphicsEffect(shadow)
        
        # 保存阴影引用以便悬停时修改
        card._shadow = shadow

        card_layout = QVBoxLayout(card)
        card_layout.setContentsMargins(
            Spacing.XL, Spacing.XL, Spacing.XL, Spacing.XL)
        card_layout.setSpacing(Spacing.LG)

        # 区域标题
        title_label = QLabel(title_text)
        title_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_MD,
                                  Typography.WEIGHT_SEMI))
        title_label.setStyleSheet(f"""
            color: {Color.TEXT_PRIMARY};
            background: transparent;
            border: none;
        """)
        card_layout.addWidget(title_label)

        # 安装事件过滤器以处理悬停效果
        card.enterEvent = lambda event: self._on_card_enter(card)
        card.leaveEvent = lambda event: self._on_card_leave(card)

        return card
    
    def _on_card_enter(self, card):
        """卡片悬停进入 - 加深阴影 + 轻微上浮"""
        if hasattr(card, '_shadow'):
            shadow = card._shadow
            shadow.setBlurRadius(Shadow.CARD_HOVER[0])
            shadow.setXOffset(Shadow.CARD_HOVER[1])
            shadow.setYOffset(Shadow.CARD_HOVER[2])
            shadow.setColor(QColor(0, 0, 0, int(Shadow.CARD_HOVER[3] * 255)))
        card.setStyleSheet(f"""
            QWidget[class="section-card"] {{
                background: {Color.BG_SECONDARY};
                border: 1px solid {Color.BORDER_DEFAULT};
                border-radius: {Radius.XL}px;
            }}
        """)
    
    def _on_card_leave(self, card):
        """卡片悬停离开 - 恢复默认阴影"""
        if hasattr(card, '_shadow'):
            shadow = card._shadow
            shadow.setBlurRadius(Shadow.CARD_DEFAULT[0])
            shadow.setXOffset(Shadow.CARD_DEFAULT[1])
            shadow.setYOffset(Shadow.CARD_DEFAULT[2])
            shadow.setColor(QColor(0, 0, 0, int(Shadow.CARD_DEFAULT[3] * 255)))
        card.setStyleSheet(f"""
            QWidget[class="section-card"] {{
                background: {Color.BG_SECONDARY};
                border: 1px solid {Color.BORDER_LIGHT};
                border-radius: {Radius.XL}px;
            }}
        """)

    def _create_form_row(self, label_text: str) -> QHBoxLayout:
        """创建表单行"""
        row = QHBoxLayout()
        row.setSpacing(Spacing.LG)

        label = QLabel(label_text)
        label.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM))
        label.setStyleSheet(f"""
            color: {Color.TEXT_SECONDARY};
            background: transparent;
            border: none;
        """)
        label.setFixedWidth(80)
        row.addWidget(label)

        row.addStretch()
        # 注意：row 需要由调用者添加到 card layout
        return row

    def _create_checkbox(self, text: str) -> QCheckBox:
        """创建复选框"""
        cb = QCheckBox(text)
        cb.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM))
        cb.setStyleSheet(f"""
            QCheckBox {{
                color: {Color.TEXT_PRIMARY};
                spacing: {Spacing.SM}px;
                background: transparent;
                border: none;
            }}
            QCheckBox::indicator {{
                width: 18px;
                height: 18px;
                border: 1px solid {Color.BORDER_DEFAULT};
                border-radius: {Radius.SM}px;
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
        return cb

    def _create_action_button(self, text: str, primary: bool) -> QPushButton:
        """创建操作按钮"""
        btn = QPushButton(text)
        btn.setCursor(Qt.CursorShape.PointingHandCursor)
        btn.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM,
                          Typography.WEIGHT_MEDIUM))
        btn.setFixedHeight(36)
        if primary:
            btn.setStyleSheet(f"""
                QPushButton {{
                    background: {Color.ACCENT};
                    color: {Color.TEXT_INVERSE};
                    border: none;
                    border-radius: {Radius.MD}px;
                    padding: 0 {Spacing.LG}px;
                }}
                QPushButton:hover {{
                    background: {Color.ACCENT_HOVER};
                    border: 1px solid {Color.ACCENT_BORDER};
                }}
                QPushButton:pressed {{
                    background: {Color.ACCENT_ACTIVE};
                    border: 1px solid {Color.ACCENT_HOVER};
                }}
                QPushButton:disabled {{
                    background: {Color.BORDER_LIGHT};
                    color: {Color.TEXT_DISABLED};
                    border: none;
                }}
            """)
        else:
            btn.setStyleSheet(f"""
                QPushButton {{
                    background: {Color.BG_PRIMARY};
                    color: {Color.TEXT_PRIMARY};
                    border: 1px solid {Color.BORDER_DEFAULT};
                    border-radius: {Radius.MD}px;
                    padding: 0 {Spacing.LG}px;
                }}
                QPushButton:hover {{
                    background: {Color.BG_HOVER};
                    border: 1px solid {Color.BORDER_DARK};
                }}
                QPushButton:pressed {{
                    background: {Color.BG_ACTIVE};
                    border: 1px solid {Color.BORDER_DARK};
                }}
                QPushButton:disabled {{
                    background: {Color.BG_SECONDARY};
                    color: {Color.TEXT_DISABLED};
                    border: 1px solid {Color.BORDER_LIGHT};
                }}
            """)
        return btn

    def _on_theme_changed(self, index: int):
        """主题切换"""
        theme = self.theme_combo.itemData(index)
        if theme:
            self.theme_changed.emit(theme)

    def set_theme(self, theme: str):
        """设置当前主题"""
        for i in range(self.theme_combo.count()):
            if self.theme_combo.itemData(i) == theme:
                self.theme_combo.setCurrentIndex(i)
                break
