#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
题目卡片 - Linear 风格
克制、清晰、强排版
"""

from PyQt6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QLabel,
                              QPushButton, QFrame, QButtonGroup,
                              QRadioButton, QCheckBox, QScrollArea,
                              QSizePolicy, QGraphicsDropShadowEffect)
from PyQt6.QtCore import Qt, pyqtSignal, QPropertyAnimation, QEasingCurve, QTimer
from PyQt6.QtGui import QFont, QPixmap, QColor

from ui.design_tokens import Color, Spacing, Typography, Radius, Shadow


class QuestionCard(QWidget):
    """题目卡片 - 克制设计"""

    answer_changed = pyqtSignal(list)

    def __init__(self, parent=None):
        super().__init__(parent)
        self.question = None
        self.option_buttons = []
        self.button_group = None
        self.is_favorite = False
        self.is_bookmarked = False
        self.image_labels = []
        self.image_zoom = 1.0
        self._is_hovered = False
        self.init_ui()

    def init_ui(self):
        """初始化 UI"""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # 卡片 - Linear 风格：细腻边框 + 微妙阴影
        self.card = QFrame()
        self.card.setStyleSheet(f"""
            QFrame {{
                background: {Color.BG_PRIMARY};
                border: 1px solid {Color.BORDER_LIGHT};
                border-radius: {Radius.XL}px;
            }}
        """)
        
        # 使用设计令牌的卡片默认阴影
        self._shadow = QGraphicsDropShadowEffect()
        self._shadow.setBlurRadius(Shadow.CARD_DEFAULT[0])
        self._shadow.setXOffset(Shadow.CARD_DEFAULT[1])
        self._shadow.setYOffset(Shadow.CARD_DEFAULT[2])
        self._shadow.setColor(QColor(0, 0, 0, int(Shadow.CARD_DEFAULT[3] * 255)))
        self.card.setGraphicsEffect(self._shadow)

        # 卡片内边距：XL (24px) 左右，LG (16px) 上下
        card_layout = QVBoxLayout(self.card)
        card_layout.setContentsMargins(Spacing.XL, Spacing.LG, Spacing.XL, Spacing.LG)
        card_layout.setSpacing(Spacing.XL)

        # 滚动区
        self.scroll_area = QScrollArea()
        self.scroll_area.setWidgetResizable(True)
        self.scroll_area.setFrameShape(QFrame.Shape.NoFrame)
        self.scroll_area.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        self.scroll_area.setVerticalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAsNeeded)
        self.scroll_area.setStyleSheet(f"""
            QScrollArea {{ border: none; background: transparent; }}
            QScrollBar:vertical {{
                background: transparent;
                width: 6px;
                margin: 0;
            }}
            QScrollBar::handle:vertical {{
                background: {Color.BORDER_DEFAULT};
                border-radius: 3px;
                min-height: 20px;
            }}
            QScrollBar::handle:vertical:hover {{
                background: {Color.BORDER_DARK};
            }}
            QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {{
                height: 0;
            }}
        """)

        scroll_content = QWidget()
        scroll_content.setStyleSheet("background: transparent;")
        self.content_layout = QVBoxLayout(scroll_content)
        self.content_layout.setSpacing(Spacing.XL)
        self.content_layout.setContentsMargins(0, 0, 0, 0)

        self.scroll_area.setWidget(scroll_content)
        card_layout.addWidget(self.scroll_area, 1)

        # ===== 标题区 =====
        title_row = QHBoxLayout()
        title_row.setSpacing(Spacing.MD)

        # 题号 - SIZE_MD (16px) + WEIGHT_SEMI
        self.question_number = QLabel()
        self.question_number.setFont(QFont("Microsoft YaHei", Typography.SIZE_MD, Typography.WEIGHT_SEMI))
        self.question_number.setStyleSheet(f"color: {Color.TEXT_PRIMARY};")
        self.question_number.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Preferred)
        title_row.addWidget(self.question_number)

        # 题型
        self.type_badge = QLabel()
        self.type_badge.setFont(QFont("Microsoft YaHei", Typography.SIZE_XS, Typography.WEIGHT_MEDIUM))
        self.type_badge.setStyleSheet(f"""
            color: {Color.TEXT_SECONDARY};
            background: {Color.BG_TERTIARY};
            border-radius: {Radius.SM}px;
            padding: {Spacing.XS}px {Spacing.SM}px;
        """)
        title_row.addWidget(self.type_badge)

        # 难度
        self.difficulty_label = QLabel()
        self.difficulty_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM))
        self.difficulty_label.setStyleSheet(f"color: {Color.WARNING};")
        title_row.addWidget(self.difficulty_label)

        title_row.addStretch()

        # 收藏 - 增强交互反馈（增大尺寸）
        self.favorite_btn = QPushButton("☆")
        self.favorite_btn.setFixedSize(36, 36)
        self.favorite_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.favorite_btn.setToolTip("收藏")
        self.favorite_btn.setStyleSheet(f"""
            QPushButton {{
                background: transparent;
                border: none;
                border-radius: {Radius.MD}px;
                color: {Color.TEXT_DISABLED};
                font-size: 20px;
            }}
            QPushButton:hover {{
                background: {Color.WARNING_BG};
                color: {Color.WARNING};
            }}
            QPushButton:pressed {{
                background: {Color.WARNING_BG_HOVER};
            }}
            QPushButton:disabled {{
                color: {Color.TEXT_DISABLED};
                background: transparent;
            }}
        """)
        self.favorite_btn.clicked.connect(self._on_favorite_clicked)
        title_row.addWidget(self.favorite_btn)

        # 标记 - 增强交互反馈（增大尺寸）
        self.bookmark_btn = QPushButton("⚑")
        self.bookmark_btn.setFixedSize(36, 36)
        self.bookmark_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.bookmark_btn.setToolTip("标记")
        self.bookmark_btn.setStyleSheet(f"""
            QPushButton {{
                background: transparent;
                border: none;
                border-radius: {Radius.MD}px;
                color: {Color.TEXT_DISABLED};
                font-size: 18px;
            }}
            QPushButton:hover {{
                background: {Color.ACCENT_BG};
                color: {Color.ACCENT};
            }}
            QPushButton:pressed {{
                background: {Color.ACCENT_BG_HOVER};
            }}
            QPushButton:disabled {{
                color: {Color.TEXT_DISABLED};
                background: transparent;
            }}
        """)
        self.bookmark_btn.clicked.connect(self._on_bookmark_clicked)
        title_row.addWidget(self.bookmark_btn)

        self.content_layout.addLayout(title_row)

        # 分隔线
        divider = QFrame()
        divider.setFrameShape(QFrame.Shape.HLine)
        divider.setStyleSheet(f"background: {Color.BORDER_LIGHT}; max-height: 1px;")
        self.content_layout.addWidget(divider)

        # 题干 - 使用 Typography.BODY 预设，增强可读性
        self.stem_label = QLabel()
        self.stem_label.setWordWrap(True)
        self.stem_label.setFont(QFont("Microsoft YaHei", Typography.BODY[0], Typography.BODY[1]))
        self.stem_label.setStyleSheet(f"""
            color: {Color.TEXT_PRIMARY};
            line-height: {Typography.LINE_HEIGHT_RELAXED};
            padding: {Spacing.SM}px 0;
        """)
        self.stem_label.setTextInteractionFlags(Qt.TextInteractionFlag.TextSelectableByMouse)
        self.content_layout.addWidget(self.stem_label)

        # ===== 图片 =====
        self.image_container = QVBoxLayout()
        self.image_container.setSpacing(Spacing.SM)

        self.image_controls = QHBoxLayout()
        self.image_controls.setSpacing(Spacing.SM)

        self.zoom_label = QLabel("100%")
        self.zoom_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_XS))
        self.zoom_label.setStyleSheet(f"color: {Color.TEXT_TERTIARY};")
        self.image_controls.addWidget(self.zoom_label)

        for text, callback in [("-", lambda: self._zoom_image(-0.2)), ("+", lambda: self._zoom_image(0.2))]:
            btn = QPushButton(text)
            btn.setFixedSize(22, 22)
            btn.setCursor(Qt.CursorShape.PointingHandCursor)
            btn.setStyleSheet(f"""
                QPushButton {{
                    background: {Color.BG_SECONDARY};
                    border: 1px solid {Color.BORDER_LIGHT};
                    border-radius: {Radius.SM}px;
                    color: {Color.TEXT_SECONDARY};
                    font-weight: {Typography.WEIGHT_BOLD};
                    font-size: 12px;
                }}
                QPushButton:hover {{
                    background: {Color.BG_TERTIARY};
                    border-color: {Color.BORDER_DARK};
                }}
                QPushButton:pressed {{
                    background: {Color.BG_QUATERNARY};
                    border-color: {Color.BORDER_DARK};
                }}
                QPushButton:disabled {{
                    background: {Color.BG_QUATERNARY};
                    color: {Color.TEXT_DISABLED};
                    border: 1px solid {Color.BORDER_LIGHT};
                }}
            """)
            btn.clicked.connect(callback)
            self.image_controls.addWidget(btn)

        reset_btn = QPushButton("重置")
        reset_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        reset_btn.setStyleSheet(f"""
            QPushButton {{
                background: transparent;
                border: none;
                color: {Color.ACCENT};
                font-size: {Typography.SIZE_XS}px;
            }}
            QPushButton:hover {{ text-decoration: underline; }}
            QPushButton:disabled {{
                color: {Color.TEXT_DISABLED};
                text-decoration: none;
            }}
        """)
        reset_btn.clicked.connect(lambda: self._zoom_image(0, reset=True))
        self.image_controls.addWidget(reset_btn)
        self.image_controls.addStretch()

        self.image_controls_widget = QWidget()
        self.image_controls_widget.setLayout(self.image_controls)
        self.image_controls_widget.setVisible(False)
        self.content_layout.addWidget(self.image_controls_widget)
        self.content_layout.addLayout(self.image_container)

        # ===== 选项 =====
        self.options_container = QVBoxLayout()
        self.options_container.setSpacing(Spacing.SM)
        self.content_layout.addLayout(self.options_container)

        # ===== 答案区 =====
        self.answer_section = QWidget()
        self.answer_section.setStyleSheet(f"background: {Color.BG_SECONDARY}; border-radius: {Radius.LG}px;")
        answer_layout = QVBoxLayout(self.answer_section)
        answer_layout.setContentsMargins(Spacing.LG, Spacing.MD, Spacing.LG, Spacing.MD)
        answer_layout.setSpacing(Spacing.SM)

        # 按钮行
        btn_row = QHBoxLayout()
        self.toggle_answer_btn = QPushButton("显示答案")
        self.toggle_answer_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.toggle_answer_btn.setFont(QFont("Microsoft YaHei", Typography.SIZE_XS, Typography.WEIGHT_MEDIUM))
        self.toggle_answer_btn.setStyleSheet(f"""
            QPushButton {{
                background: transparent;
                border: none;
                color: {Color.ACCENT};
                padding: {Spacing.XS}px {Spacing.SM}px;
            }}
            QPushButton:hover {{ text-decoration: underline; }}
            QPushButton:disabled {{
                color: {Color.TEXT_DISABLED};
                text-decoration: none;
            }}
        """)
        self.toggle_answer_btn.clicked.connect(self.toggle_answer_visibility)
        btn_row.addWidget(self.toggle_answer_btn)

        self.toggle_explanation_btn = QPushButton("显示解析")
        self.toggle_explanation_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.toggle_explanation_btn.setFont(QFont("Microsoft YaHei", Typography.SIZE_XS, Typography.WEIGHT_MEDIUM))
        self.toggle_explanation_btn.setStyleSheet(f"""
            QPushButton {{
                background: transparent;
                border: none;
                color: {Color.ACCENT};
                padding: {Spacing.XS}px {Spacing.SM}px;
            }}
            QPushButton:hover {{ text-decoration: underline; }}
            QPushButton:disabled {{
                color: {Color.TEXT_DISABLED};
                text-decoration: none;
            }}
        """)
        self.toggle_explanation_btn.clicked.connect(self.toggle_explanation_visibility)
        btn_row.addWidget(self.toggle_explanation_btn)
        btn_row.addStretch()
        answer_layout.addLayout(btn_row)

        # 答案内容
        self.answer_content = QWidget()
        ac_layout = QVBoxLayout(self.answer_content)
        ac_layout.setContentsMargins(0, Spacing.SM, 0, 0)
        ac_layout.setSpacing(Spacing.XS)

        self.result_label = QLabel()
        self.result_label.setWordWrap(True)
        self.result_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM, Typography.WEIGHT_SEMI))
        ac_layout.addWidget(self.result_label)

        self.answer_content.setVisible(False)
        answer_layout.addWidget(self.answer_content)

        # 解析内容 - 增强排版和视觉层次（增大内边距）
        self.explanation_content = QWidget()
        self.explanation_content.setStyleSheet(f"""
            background: {Color.BG_SECONDARY};
            border-left: 3px solid {Color.ACCENT};
            border-radius: {Radius.MD}px;
            margin-top: {Spacing.SM}px;
        """)
        ec_layout = QVBoxLayout(self.explanation_content)
        ec_layout.setContentsMargins(Spacing.XL, Spacing.LG, Spacing.XL, Spacing.LG)
        ec_layout.setSpacing(Spacing.MD)

        self.explanation_title = QLabel("💡 解析")
        self.explanation_title.setFont(QFont("Microsoft YaHei", Typography.CARD_TITLE[0], Typography.CARD_TITLE[1]))
        self.explanation_title.setStyleSheet(f"color: {Color.ACCENT};")
        ec_layout.addWidget(self.explanation_title)

        self.explanation_label = QLabel()
        self.explanation_label.setWordWrap(True)
        self.explanation_label.setFont(QFont("Microsoft YaHei", Typography.BODY[0], Typography.BODY[1]))
        self.explanation_label.setStyleSheet(f"""
            color: {Color.TEXT_SECONDARY};
            line-height: {Typography.LINE_HEIGHT_RELAXED};
        """)
        self.explanation_label.setTextInteractionFlags(Qt.TextInteractionFlag.TextSelectableByMouse)
        ec_layout.addWidget(self.explanation_label)

        self.explanation_content.setVisible(False)
        answer_layout.addWidget(self.explanation_content)

        self.answer_section.setVisible(False)
        self.content_layout.addWidget(self.answer_section)

        layout.addWidget(self.card)

    def set_question(self, question: dict, index: int, total: int):
        """设置题目数据"""
        self.question = question
        self.clear_options()
        self.image_zoom = 1.0
        self.zoom_label.setText("100%")

        # 题号
        self.question_number.setText(f"第 {index + 1} 题")

        # 题型
        self.type_badge.setText(question['type'])

        # 难度
        difficulty = question.get('difficulty', 0)
        if difficulty > 0:
            self.difficulty_label.setText("★" * difficulty + "☆" * (5 - difficulty))
            self.difficulty_label.setToolTip(f"难度: {difficulty}/5")
        else:
            self.difficulty_label.setText("")

        # 题干
        self.stem_label.setText(question['stem'])

        # 图片
        self._load_images(question.get('images', []))

        # 选项
        self._create_options(question)

        # 重置答案区
        self.answer_section.setVisible(True)
        self.answer_content.setVisible(False)
        self.explanation_content.setVisible(False)
        self.toggle_answer_btn.setText("显示答案")
        self.toggle_explanation_btn.setText("显示解析")
        self.result_label.clear()
        self.explanation_label.clear()

    def _load_images(self, images: list):
        """加载图片"""
        for i in reversed(range(self.image_container.count())):
            item = self.image_container.itemAt(i)
            if item and item.widget():
                item.widget().deleteLater()
        self.image_labels.clear()

        if not images:
            self.image_controls_widget.setVisible(False)
            return

        self.image_controls_widget.setVisible(True)

        for img_path in images:
            try:
                if isinstance(img_path, str) and img_path:
                    pixmap = QPixmap(img_path)
                    if not pixmap.isNull():
                        img_label = QLabel()
                        img_label.setProperty('original_pixmap', pixmap)
                        self._apply_zoom_to_label(img_label, pixmap)
                        img_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
                        img_label.setStyleSheet(f"""
                            margin: {Spacing.MD}px 0;
                            border: 1px solid {Color.BORDER_DEFAULT};
                            border-radius: {Radius.LG}px;
                            padding: {Spacing.MD}px;
                            background: {Color.BG_SECONDARY};
                        """)
                        self.image_container.addWidget(img_label)
                        self.image_labels.append(img_label)
            except Exception:
                pass

    def _apply_zoom_to_label(self, label: QLabel, pixmap: QPixmap):
        """应用缩放"""
        base_width = 600
        scaled_width = int(base_width * self.image_zoom)
        scaled_pixmap = pixmap.scaledToWidth(max(100, scaled_width), Qt.TransformationMode.SmoothTransformation)
        label.setPixmap(scaled_pixmap)

    def _zoom_image(self, delta: float, reset: bool = False):
        """缩放图片"""
        if reset:
            self.image_zoom = 1.0
        else:
            self.image_zoom = max(0.2, min(3.0, self.image_zoom + delta))

        self.zoom_label.setText(f"{int(self.image_zoom * 100)}%")

        for label in self.image_labels:
            pixmap = label.property('original_pixmap')
            if pixmap:
                self._apply_zoom_to_label(label, pixmap)

    def _create_options(self, question: dict):
        """创建选项"""
        self.clear_options()

        if question['type'] in ['单选题', '判断题']:
            self.button_group = QButtonGroup()
            self.button_group.buttonClicked.connect(self._on_answer_changed)

        for option in question['options']:
            if question['type'] == '判断题':
                btn = QRadioButton(option['text'])
            elif question['type'] == '多选题':
                btn = QCheckBox(option['text'])
                btn.stateChanged.connect(self._on_answer_changed)
            else:
                btn = QRadioButton(option['text'])

            btn.setProperty('option_label', option['label'])
            btn.setFont(QFont("Microsoft YaHei", Typography.SIZE_MD))
            btn.setStyleSheet(self._get_option_style())

            if question['type'] in ['单选题', '判断题']:
                self.button_group.addButton(btn)

            self.options_container.addWidget(btn)
            self.option_buttons.append(btn)

    def _get_option_style(self) -> str:
        """选项基础样式 - 增强交互反馈，添加完整状态和过渡动画"""
        return f"""
            QRadioButton, QCheckBox {{
                spacing: {Spacing.MD}px;
                padding: {Spacing.LG}px {Spacing.XL}px;
                min-height: 48px;
                font-size: {Typography.SIZE_MD}px;
                color: {Color.TEXT_PRIMARY};
                background: {Color.BG_SECONDARY};
                border: 1.5px solid {Color.BORDER_DEFAULT};
                border-radius: {Radius.LG}px;
            }}
            QRadioButton:hover, QCheckBox:hover {{
                background: {Color.BG_HOVER};
                border-color: {Color.BORDER_DARK};
            }}
            QRadioButton:pressed, QCheckBox:pressed {{
                background: {Color.BG_ACTIVE};
                border-color: {Color.BORDER_DARK};
            }}
            QRadioButton:disabled, QCheckBox:disabled {{
                background: {Color.BG_QUATERNARY};
                color: {Color.TEXT_DISABLED};
                border-color: {Color.BORDER_LIGHT};
            }}
            QRadioButton:checked, QCheckBox:checked {{
                background: {Color.ACCENT_BG};
                border-color: {Color.ACCENT};
                color: {Color.ACCENT};
            }}
            QRadioButton::indicator, QCheckBox::indicator {{
                width: 18px;
                height: 18px;
                border-radius: 9px;
                border: 2px solid {Color.BORDER_DEFAULT};
                background: {Color.BG_PRIMARY};
            }}
            QRadioButton::indicator:hover, QCheckBox::indicator:hover {{
                border-color: {Color.ACCENT_HOVER};
            }}
            QRadioButton::indicator:checked, QCheckBox::indicator:checked {{
                border-color: {Color.ACCENT};
                background: {Color.ACCENT};
            }}
            QCheckBox::indicator {{
                border-radius: {Radius.SM}px;
            }}
        """

    def clear_options(self):
        """清空选项"""
        for btn in self.option_buttons:
            btn.deleteLater()
        self.option_buttons.clear()
        if self.button_group:
            self.button_group.deleteLater()
            self.button_group = None

    def _on_answer_changed(self):
        """答案变更"""
        selected = []
        for btn in self.option_buttons:
            if btn.isChecked():
                selected.append(btn.property('option_label'))

        if selected:
            self.answer_changed.emit(selected)

            if self.question:
                correct = self.question['answer']
                is_correct = set(selected) == set(correct)

                result_text = f"正确答案: {', '.join(correct)}"
                if is_correct:
                    result_text += "  ✓"
                    self.result_label.setStyleSheet(f"color: {Color.SUCCESS};")
                else:
                    result_text += "  ✗"
                    self.result_label.setStyleSheet(f"color: {Color.ERROR};")

                self.result_label.setText(result_text)

                if self.question.get('explanation'):
                    self.explanation_label.setText(f"解析: {self.question['explanation']}")

                self.answer_content.setVisible(True)
                self.toggle_answer_btn.setText("隐藏答案")

                self._apply_feedback(selected, correct)

    def _apply_feedback(self, selected: list, correct: list):
        """答题反馈"""
        for btn in self.option_buttons:
            label = btn.property('option_label')
            is_selected = label in selected
            is_correct_option = label in correct

            if is_correct_option:
                btn.setStyleSheet(f"""
                    QRadioButton, QCheckBox {{
                        spacing: {Spacing.MD}px;
                        padding: {Spacing.MD}px {Spacing.LG}px;
                        min-height: 44px;
                        font-size: {Typography.SIZE_MD}px;
                        color: {Color.SUCCESS};
                        background: {Color.SUCCESS_BG};
                        border: 1px solid {Color.SUCCESS};
                        border-radius: {Radius.MD}px;
                    }}
                """)
            elif is_selected and not is_correct_option:
                btn.setStyleSheet(f"""
                    QRadioButton, QCheckBox {{
                        spacing: {Spacing.MD}px;
                        padding: {Spacing.MD}px {Spacing.LG}px;
                        min-height: 44px;
                        font-size: {Typography.SIZE_MD}px;
                        color: {Color.ERROR};
                        background: {Color.ERROR_BG};
                        border: 1px solid {Color.ERROR};
                        border-radius: {Radius.MD}px;
                    }}
                """)
            else:
                btn.setStyleSheet(self._get_option_style())

    def toggle_answer_visibility(self):
        """切换答案显示"""
        is_visible = self.answer_content.isVisible()
        self.answer_content.setVisible(not is_visible)
        self.toggle_answer_btn.setText("隐藏答案" if not is_visible else "显示答案")

    def toggle_explanation_visibility(self):
        """切换解析显示"""
        is_visible = self.explanation_content.isVisible()
        self.explanation_content.setVisible(not is_visible)
        self.toggle_explanation_btn.setText("隐藏解析" if not is_visible else "显示解析")

    def _on_favorite_clicked(self):
        """收藏"""
        self.is_favorite = not self.is_favorite
        self.favorite_btn.setText("★" if self.is_favorite else "☆")
        # 保持完整的交互状态
        self.favorite_btn.setStyleSheet(f"""
            QPushButton {{
                background: transparent;
                border: none;
                border-radius: {Radius.MD}px;
                color: {Color.WARNING if self.is_favorite else Color.TEXT_DISABLED};
                font-size: 20px;
            }}
            QPushButton:hover {{
                background: {Color.WARNING_BG};
            }}
            QPushButton:pressed {{
                background: {Color.WARNING_BG_HOVER};
            }}
            QPushButton:disabled {{
                color: {Color.TEXT_DISABLED};
                background: transparent;
            }}
        """)

    def _on_bookmark_clicked(self):
        """标记"""
        self.is_bookmarked = not self.is_bookmarked
        # 保持完整的交互状态
        self.bookmark_btn.setStyleSheet(f"""
            QPushButton {{
                background: transparent;
                border: none;
                border-radius: {Radius.MD}px;
                color: {Color.ACCENT if self.is_bookmarked else Color.TEXT_DISABLED};
                font-size: 18px;
            }}
            QPushButton:hover {{
                background: {Color.ACCENT_BG};
            }}
            QPushButton:pressed {{
                background: {Color.ACCENT_BG_HOVER};
            }}
            QPushButton:disabled {{
                color: {Color.TEXT_DISABLED};
                background: transparent;
            }}
        """)

    def restore_answer(self, selected: list):
        """恢复答案"""
        for btn in self.option_buttons:
            if btn.property('option_label') in selected:
                btn.setChecked(True)

        if self.question:
            correct = self.question['answer']
            self._apply_feedback(selected, correct)
            self.answer_content.setVisible(True)
            self.toggle_answer_btn.setText("隐藏答案")

            if set(selected) == set(correct):
                self.result_label.setText(f"正确答案: {', '.join(correct)}  ✓")
                self.result_label.setStyleSheet(f"color: {Color.SUCCESS};")
            else:
                self.result_label.setText(f"正确答案: {', '.join(correct)}  ✗")
                self.result_label.setStyleSheet(f"color: {Color.ERROR};")

            if self.question.get('explanation'):
                self.explanation_label.setText(f"解析: {self.question['explanation']}")

    def get_selected_options(self) -> list:
        """获取选中选项"""
        return [btn.property('option_label') for btn in self.option_buttons if btn.isChecked()]

    def _animate_shadow(self, target_blur, target_y, target_alpha):
        """平滑过渡阴影效果 (200ms)"""
        if not hasattr(self, '_shadow'):
            return
        if hasattr(self, '_hover_timer'):
            self._hover_timer.stop()
        start_blur = self._shadow.blurRadius()
        start_y = self._shadow.yOffset()
        start_alpha = self._shadow.color().alpha() / 255.0
        self._hover_t = 0
        self._hover_duration = 200
        self._hover_start_blur = start_blur
        self._hover_start_y = start_y
        self._hover_start_alpha = start_alpha
        self._hover_target_blur = target_blur
        self._hover_target_y = target_y
        self._hover_target_alpha = target_alpha
        if not hasattr(self, '_hover_timer'):
            self._hover_timer = QTimer(self)
            self._hover_timer.timeout.connect(self._hover_tick)
        self._hover_timer.start(16)

    def _hover_tick(self):
        """阴影动画帧"""
        self._hover_t += 16
        progress = min(1.0, self._hover_t / self._hover_duration)
        ease = progress * (2 - progress)
        blur = self._hover_start_blur + (self._hover_target_blur - self._hover_start_blur) * ease
        y = self._hover_start_y + (self._hover_target_y - self._hover_start_y) * ease
        alpha = self._hover_start_alpha + (self._hover_target_alpha - self._hover_start_alpha) * ease
        self._shadow.setBlurRadius(int(blur))
        self._shadow.setYOffset(int(y))
        self._shadow.setColor(QColor(0, 0, 0, int(alpha * 255)))
        if progress >= 1.0:
            self._hover_timer.stop()

    def enterEvent(self, event):
        """鼠标进入 - 使用 Shadow.CARD_HOVER 加深阴影 + 微妙上浮"""
        self._is_hovered = True
        self._animate_shadow(
            Shadow.CARD_HOVER[0],
            Shadow.CARD_HOVER[2],
            Shadow.CARD_HOVER[3]
        )
        if hasattr(self, 'card'):
            # 微妙上浮效果：通过 margin 调整实现 translateY: -2px 等效视觉
            self.card.setStyleSheet(f"""
                QFrame {{
                    background: {Color.BG_PRIMARY};
                    border: 1px solid {Color.BORDER_DARK};
                    border-radius: {Radius.XL}px;
                    margin-top: -2px;
                    margin-bottom: 2px;
                }}
            """)
        super().enterEvent(event)

    def leaveEvent(self, event):
        """鼠标离开 - 恢复 Shadow.CARD_DEFAULT 和默认边框"""
        self._is_hovered = False
        self._animate_shadow(
            Shadow.CARD_DEFAULT[0],
            Shadow.CARD_DEFAULT[2],
            Shadow.CARD_DEFAULT[3]
        )
        if hasattr(self, 'card'):
            # 恢复默认位置
            self.card.setStyleSheet(f"""
                QFrame {{
                    background: {Color.BG_PRIMARY};
                    border: 1px solid {Color.BORDER_LIGHT};
                    border-radius: {Radius.XL}px;
                    margin-top: 0px;
                    margin-bottom: 0px;
                }}
            """)
        super().leaveEvent(event)
