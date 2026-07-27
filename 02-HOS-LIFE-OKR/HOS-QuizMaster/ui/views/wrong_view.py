#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
错题本视图 - HOS-QuizMaster V2
Linear/Notion 风格重构
"""

from PyQt6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QLabel,
                              QPushButton, QScrollArea, QFrame, QGridLayout,
                              QMessageBox, QGraphicsDropShadowEffect)
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QFont, QColor

from ui.design_tokens import Color, Spacing, Radius, Typography, Shadow


class _HoverShadowWidget(QWidget):
    """带悬停阴影加深效果的 QWidget 容器"""

    def __init__(self, parent=None):
        super().__init__(parent)
        self._hover_shadow = None

    def set_hover_shadow(self, shadow):
        self._hover_shadow = shadow
        self.setGraphicsEffect(shadow)

    def enterEvent(self, event):
        if self._hover_shadow:
            self._hover_shadow.setBlurRadius(Shadow.CARD_HOVER[0])
            self._hover_shadow.setXOffset(Shadow.CARD_HOVER[1])
            self._hover_shadow.setYOffset(Shadow.CARD_HOVER[2])
            self._hover_shadow.setColor(QColor(0, 0, 0, int(Shadow.CARD_HOVER[3] * 255)))
        super().enterEvent(event)

    def leaveEvent(self, event):
        if self._hover_shadow:
            self._hover_shadow.setBlurRadius(Shadow.CARD_DEFAULT[0])
            self._hover_shadow.setXOffset(Shadow.CARD_DEFAULT[1])
            self._hover_shadow.setYOffset(Shadow.CARD_DEFAULT[2])
            self._hover_shadow.setColor(QColor(0, 0, 0, int(Shadow.CARD_DEFAULT[3] * 255)))
        super().leaveEvent(event)


class WrongView(QWidget):
    """错题本视图 - Linear 风格"""

    question_clicked = pyqtSignal(int)

    def __init__(self, parent=None):
        super().__init__(parent)
        self.wrong_questions = []
        self.current_index = 0
        self.selected_button = None  # 当前选中的按钮
        self.init_ui()

    def init_ui(self):
        """初始化 UI"""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        content = QWidget()
        content.setStyleSheet(f"background: {Color.BG_PRIMARY};")
        self.content_layout = QVBoxLayout(content)
        self.content_layout.setContentsMargins(Spacing.XXXL, Spacing.XXL, Spacing.XXXL, Spacing.XXL)
        self.content_layout.setSpacing(Spacing.XL)

        # ===== 顶部栏 =====
        header = QHBoxLayout()
        header.setSpacing(Spacing.LG)

        title_layout = QVBoxLayout()
        title_layout.setSpacing(Spacing.XS)

        title = QLabel("错题本")
        title.setFont(QFont("Microsoft YaHei", Typography.SIZE_XXL, Typography.WEIGHT_BOLD))
        title.setStyleSheet(f"color: {Color.TEXT_PRIMARY};")
        title_layout.addWidget(title)

        subtitle = QLabel("查漏补缺 · 针对性复习")
        subtitle.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM))
        subtitle.setStyleSheet(f"color: {Color.TEXT_TERTIARY};")
        title_layout.addWidget(subtitle)

        header.addLayout(title_layout)
        header.addStretch()

        self.stats_label = QLabel("共 0 道错题")
        self.stats_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_XS, Typography.WEIGHT_MEDIUM))
        self.stats_label.setStyleSheet(f"""
            color: {Color.TEXT_SECONDARY};
            background: {Color.BG_TERTIARY};
            border-radius: {Radius.LG}px;
            padding: {Spacing.XS}px {Spacing.MD}px;
        """)
        header.addWidget(self.stats_label)

        self.content_layout.addLayout(header)

        # ===== 操作栏 =====
        actions = QHBoxLayout()
        actions.setSpacing(Spacing.SM)

        review_btn = QPushButton("重做所有错题")
        review_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        review_btn.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM, Typography.WEIGHT_MEDIUM))
        review_btn.setFixedHeight(32)
        review_btn.setStyleSheet(f"""
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
        review_btn.clicked.connect(self._on_review_all_clicked)
        actions.addWidget(review_btn)

        clear_btn = QPushButton("清空错题本")
        clear_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        clear_btn.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM, Typography.WEIGHT_MEDIUM))
        clear_btn.setFixedHeight(32)
        clear_btn.setStyleSheet(f"""
            QPushButton {{
                background: {Color.BG_PRIMARY};
                color: {Color.ERROR};
                border: 1px solid {Color.ERROR};
                border-radius: {Radius.MD}px;
                padding: 0 {Spacing.LG}px;
            }}
            QPushButton:hover {{
                background: {Color.ERROR_BG};
                border: 1px solid {Color.ERROR_HOVER};
            }}
            QPushButton:pressed {{
                background: {Color.ERROR_BG_HOVER};
                border: 1px solid {Color.ERROR_ACTIVE};
            }}
            QPushButton:disabled {{
                background: {Color.BG_SECONDARY};
                color: {Color.TEXT_DISABLED};
                border: 1px solid {Color.BORDER_LIGHT};
            }}
        """)
        clear_btn.clicked.connect(self._on_clear_clicked)
        actions.addWidget(clear_btn)

        actions.addStretch()
        self.content_layout.addLayout(actions)

        # ===== 主内容区 =====
        main_layout = QHBoxLayout()
        main_layout.setSpacing(Spacing.XL)

        # 左侧：错题列表
        left_panel = QWidget()
        left_panel.setStyleSheet("background: transparent;")
        left_layout = QVBoxLayout(left_panel)
        left_layout.setContentsMargins(0, 0, 0, 0)
        left_layout.setSpacing(0)

        # 错题网格 - 增强视觉层次
        grid_container = _HoverShadowWidget()
        grid_container.setStyleSheet(f"""
            QWidget {{
                background: {Color.BG_SECONDARY};
                border: 1px solid {Color.BORDER_LIGHT};
                border-radius: {Radius.XL}px;
            }}
            QWidget:hover {{
                border: 1px solid {Color.BORDER_DEFAULT};
            }}
        """)
        # 添加阴影 - 使用设计令牌 Shadow.CARD_DEFAULT
        shadow = QGraphicsDropShadowEffect()
        shadow.setBlurRadius(Shadow.CARD_DEFAULT[0])
        shadow.setXOffset(Shadow.CARD_DEFAULT[1])
        shadow.setYOffset(Shadow.CARD_DEFAULT[2])
        shadow.setColor(QColor(0, 0, 0, int(Shadow.CARD_DEFAULT[3] * 255)))
        grid_container.set_hover_shadow(shadow)
        
        grid_inner_layout = QVBoxLayout(grid_container)
        grid_inner_layout.setContentsMargins(Spacing.LG, Spacing.LG, Spacing.LG, Spacing.LG)
        grid_inner_layout.setSpacing(Spacing.MD)

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

        self.grid_widget = QWidget()
        self.grid_widget.setStyleSheet("background: transparent;")
        self.grid_layout = QGridLayout(self.grid_widget)
        self.grid_layout.setSpacing(Spacing.SM)
        self.grid_layout.setContentsMargins(0, 0, 0, 0)
        
        grid_inner_layout.addWidget(self.scroll_area)

        self.scroll_area.setWidget(self.grid_widget)
        left_layout.addWidget(grid_container, stretch=1)

        # 空状态
        self.empty_state = _HoverShadowWidget()
        self.empty_state.setStyleSheet(f"""
            QWidget {{
                background: {Color.BG_SECONDARY};
                border: 1px dashed {Color.BORDER_DEFAULT};
                border-radius: {Radius.XL}px;
            }}
        """)
        # 添加阴影 - 使用设计令牌 Shadow.CARD_DEFAULT
        shadow = QGraphicsDropShadowEffect()
        shadow.setBlurRadius(Shadow.CARD_DEFAULT[0])
        shadow.setXOffset(Shadow.CARD_DEFAULT[1])
        shadow.setYOffset(Shadow.CARD_DEFAULT[2])
        shadow.setColor(QColor(0, 0, 0, int(Shadow.CARD_DEFAULT[3] * 255)))
        self.empty_state.set_hover_shadow(shadow)
        
        empty_layout = QVBoxLayout(self.empty_state)
        empty_layout.setContentsMargins(Spacing.XXL, Spacing.XXXL, Spacing.XXL, Spacing.XXXL)
        empty_layout.setSpacing(Spacing.LG)
        empty_layout.setAlignment(Qt.AlignmentFlag.AlignCenter)

        empty_icon = QLabel("❌")
        empty_icon.setFixedSize(56, 56)
        empty_icon.setFont(QFont("Microsoft YaHei", 56))
        empty_icon.setAlignment(Qt.AlignmentFlag.AlignCenter)
        empty_layout.addWidget(empty_icon)

        empty_title = QLabel("暂无错题")
        empty_title.setFont(QFont("Microsoft YaHei", Typography.SIZE_XL, Typography.WEIGHT_SEMI))
        empty_title.setStyleSheet(f"color: {Color.TEXT_PRIMARY};")
        empty_title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        empty_layout.addWidget(empty_title)

        empty_subtitle = QLabel("答错的题目会自动收集到这里")
        empty_subtitle.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM))
        empty_subtitle.setStyleSheet(f"color: {Color.TEXT_TERTIARY};")
        empty_subtitle.setAlignment(Qt.AlignmentFlag.AlignCenter)
        empty_layout.addWidget(empty_subtitle)

        left_layout.addWidget(self.empty_state)
        self.empty_label = self.empty_state

        self.scroll_area.setVisible(False)
        main_layout.addWidget(left_panel, stretch=1)

        # 右侧：题目详情（初始隐藏）- 增强视觉层次
        self.detail_widget = _HoverShadowWidget()
        self.detail_widget.setStyleSheet(f"""
            QWidget {{
                background: {Color.BG_SECONDARY};
                border: 1px solid {Color.BORDER_LIGHT};
                border-radius: {Radius.XL}px;
            }}
            QWidget:hover {{
                border: 1px solid {Color.BORDER_DEFAULT};
            }}
        """)
        # 添加阴影 - 使用设计令牌 Shadow.CARD_DEFAULT
        shadow = QGraphicsDropShadowEffect()
        shadow.setBlurRadius(Shadow.CARD_DEFAULT[0])
        shadow.setXOffset(Shadow.CARD_DEFAULT[1])
        shadow.setYOffset(Shadow.CARD_DEFAULT[2])
        shadow.setColor(QColor(0, 0, 0, int(Shadow.CARD_DEFAULT[3] * 255)))
        self.detail_widget.set_hover_shadow(shadow)
        
        detail_layout = QVBoxLayout(self.detail_widget)
        detail_layout.setContentsMargins(Spacing.XL, Spacing.LG, Spacing.XL, Spacing.LG)
        detail_layout.setSpacing(Spacing.LG)

        detail_header = QHBoxLayout()
        self.detail_title = QLabel("题目详情")
        self.detail_title.setFont(QFont("Microsoft YaHei", Typography.SIZE_MD, Typography.WEIGHT_SEMI))
        self.detail_title.setStyleSheet(f"color: {Color.TEXT_PRIMARY};")
        detail_header.addWidget(self.detail_title)
        detail_header.addStretch()

        close_btn = QPushButton("✕")
        close_btn.setFixedSize(28, 28)
        close_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        close_btn.setStyleSheet(f"""
            QPushButton {{
                background: transparent;
                border: none;
                border-radius: 14px;
                color: {Color.TEXT_TERTIARY};
                font-size: 16px;
                font-weight: {Typography.WEIGHT_MEDIUM};
            }}
            QPushButton:hover {{
                background: {Color.BG_TERTIARY};
                color: {Color.TEXT_PRIMARY};
            }}
            QPushButton:pressed {{
                background: {Color.BG_QUATERNARY};
            }}
            QPushButton:disabled {{
                color: {Color.TEXT_DISABLED};
            }}
        """)
        close_btn.clicked.connect(self._hide_detail)
        detail_header.addWidget(close_btn)
        detail_layout.addLayout(detail_header)

        # 分隔线
        divider = QFrame()
        divider.setFrameShape(QFrame.Shape.HLine)
        divider.setStyleSheet(f"background: {Color.BORDER_LIGHT}; max-height: 1px;")
        detail_layout.addWidget(divider)

        # 题目卡片滚动区
        self.detail_scroll = QScrollArea()
        self.detail_scroll.setWidgetResizable(True)
        self.detail_scroll.setFrameShape(QFrame.Shape.NoFrame)
        self.detail_scroll.setStyleSheet(f"""
            QScrollArea {{ border: none; background: transparent; }}
            QScrollBar:vertical {{
                background: transparent;
                width: 6px;
                margin: 0;
            }}
            QScrollBar::handle:vertical {{
                background: {Color.BORDER_DEFAULT};
                border-radius: 3px;
            }}
            QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {{
                height: 0;
            }}
        """)

        self.detail_card = QWidget()
        self.detail_card.setStyleSheet("background: transparent;")
        self.detail_card_layout = QVBoxLayout(self.detail_card)
        self.detail_card_layout.setContentsMargins(0, 0, 0, 0)
        self.detail_card_layout.setSpacing(Spacing.MD)

        self.detail_scroll.setWidget(self.detail_card)
        detail_layout.addWidget(self.detail_scroll, stretch=1)

        self.detail_widget.setVisible(False)
        self.detail_widget.setFixedWidth(380)
        main_layout.addWidget(self.detail_widget)

        self.content_layout.addLayout(main_layout)
        layout.addWidget(content)

    def set_wrong_questions(self, wrong_list: list):
        """设置错题列表"""
        self.wrong_questions = wrong_list
        self._update_grid()
        self._update_stats()

    def _update_grid(self):
        """更新错题网格"""
        for i in reversed(range(self.grid_layout.count())):
            widget = self.grid_layout.itemAt(i).widget()
            if widget:
                widget.deleteLater()

        if not self.wrong_questions:
            self.empty_label.setVisible(True)
            self.scroll_area.setVisible(False)
            return

        self.empty_label.setVisible(False)
        self.scroll_area.setVisible(True)
        self.selected_button = None

        cols = 10
        for idx, (orig_idx, question) in enumerate(self.wrong_questions):
            btn = QPushButton(str(orig_idx + 1))
            btn.setFixedSize(32, 32)
            btn.setCursor(Qt.CursorShape.PointingHandCursor)
            
            # 获取错误次数，用于颜色深浅
            error_count = question.get('error_count', 1)
            bg_color, border_color, text_color = self._get_error_colors(error_count)
            
            btn.setToolTip(f"第 {orig_idx + 1} 题 - {question.get('type', '未知')} (错{error_count}次)")
            btn.setFont(QFont("Microsoft YaHei", Typography.SIZE_XXS, Typography.WEIGHT_MEDIUM))
            btn.setProperty("orig_index", orig_idx)
            btn.setProperty("bg_color", bg_color)
            btn.setProperty("border_color", border_color)
            btn.setProperty("text_color", text_color)
            btn.setStyleSheet(f"""
                QPushButton {{
                    background: {bg_color};
                    border: 1px solid {border_color};
                    border-radius: {Radius.SM}px;
                    color: {text_color};
                }}
                QPushButton:hover {{
                    background: {Color.ERROR_BG_HOVER};
                    border-color: {Color.ERROR};
                }}
                QPushButton:pressed {{
                    background: {Color.ERROR_BG_HOVER};
                    border-color: {Color.ERROR_HOVER};
                }}
            """)
            btn.clicked.connect(lambda checked, i=orig_idx: self._on_question_clicked(i))
            self.grid_layout.addWidget(btn, idx // cols, idx % cols)

    def _get_error_colors(self, error_count: int) -> tuple:
        """根据错误次数返回颜色（深浅表示）"""
        if error_count >= 4:
            return Color.ERROR, Color.ERROR_HOVER, Color.TEXT_INVERSE
        elif error_count == 3:
            return "#fca5a5", "#f87171", Color.TEXT_PRIMARY
        elif error_count == 2:
            return "#fecaca", "#fca5a5", Color.TEXT_PRIMARY
        else:
            return Color.ERROR_BG, "#fecaca", Color.ERROR

    def _update_stats(self):
        """更新统计信息"""
        count = len(self.wrong_questions)
        self.stats_label.setText(f"共 {count} 道错题")

    def _on_question_clicked(self, orig_index: int):
        """错题点击处理"""
        self.current_index = orig_index
        self._highlight_selected(orig_index)
        self._show_detail(orig_index)
        self.question_clicked.emit(orig_index)

    def _highlight_selected(self, orig_index: int):
        """高亮当前选中的网格按钮"""
        # 恢复之前选中按钮的样式
        if self.selected_button and self.selected_button != None:
            bg = self.selected_button.property("bg_color") or Color.ERROR_BG
            border = self.selected_button.property("border_color") or "#fecaca"
            text = self.selected_button.property("text_color") or Color.ERROR
            self.selected_button.setStyleSheet(f"""
                QPushButton {{
                    background: {bg};
                    border: 1px solid {border};
                    border-radius: {Radius.SM}px;
                    color: {text};
                }}
                QPushButton:hover {{
                    background: {Color.ERROR_BG_HOVER};
                    border-color: {Color.ERROR};
                }}
                QPushButton:pressed {{
                    background: {Color.ERROR_BG_HOVER};
                    border-color: {Color.ERROR_HOVER};
                }}
            """)
        # 高亮当前选中按钮
        for i in range(self.grid_layout.count()):
            btn = self.grid_layout.itemAt(i).widget()
            if btn and btn.property("orig_index") == orig_index:
                bg = btn.property("bg_color") or Color.ERROR_BG
                text = btn.property("text_color") or Color.ERROR
                btn.setStyleSheet(f"""
                    QPushButton {{
                        background: {bg};
                        border: 2px solid {Color.ACCENT};
                        border-radius: {Radius.SM}px;
                        color: {text};
                    }}
                    QPushButton:hover {{
                        background: {Color.ERROR_BG_HOVER};
                        border-color: {Color.ACCENT};
                    }}
                    QPushButton:pressed {{
                        background: {Color.ERROR_BG_HOVER};
                        border-color: {Color.ACCENT_ACTIVE};
                    }}
                """)
                self.selected_button = btn
                break

    def _show_detail(self, orig_index: int):
        """显示题目详情"""
        question = None
        for idx, q in self.wrong_questions:
            if idx == orig_index:
                question = q
                break
        if not question:
            return

        for i in reversed(range(self.detail_card_layout.count())):
            widget = self.detail_card_layout.itemAt(i).widget()
            if widget:
                widget.deleteLater()

        # 题号和类型
        header = QHBoxLayout()
        number_label = QLabel(f"第 {orig_index + 1} 题")
        number_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_MD, Typography.WEIGHT_BOLD))
        number_label.setStyleSheet(f"color: {Color.TEXT_PRIMARY};")
        header.addWidget(number_label)

        type_badge = QLabel(question.get('type', '未知'))
        type_badge.setFont(QFont("Microsoft YaHei", Typography.SIZE_XS, Typography.WEIGHT_MEDIUM))
        type_badge.setStyleSheet(f"""
            background: {Color.ERROR_BG};
            color: {Color.ERROR};
            padding: {Spacing.XXS}px {Spacing.SM}px;
            border-radius: {Radius.SM}px;
        """)
        header.addWidget(type_badge)
        header.addStretch()
        self.detail_card_layout.addLayout(header)

        # 题干
        stem_label = QLabel(question.get('stem', ''))
        stem_label.setWordWrap(True)
        stem_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM))
        stem_label.setStyleSheet(f"color: {Color.TEXT_PRIMARY}; line-height: 1.7;")
        stem_label.setTextInteractionFlags(Qt.TextInteractionFlag.TextSelectableByMouse)
        self.detail_card_layout.addWidget(stem_label)

        # 选项
        for option in question.get('options', []):
            opt_label = QLabel(f"{option['label']}. {option['text']}")
            opt_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM))
            opt_label.setStyleSheet(f"color: {Color.TEXT_SECONDARY}; padding: {Spacing.XS}px 0;")
            self.detail_card_layout.addWidget(opt_label)

        # 答案
        answer = question.get('answer', [])
        answer_text = ', '.join(answer) if isinstance(answer, list) else str(answer)
        answer_label = QLabel(f"正确答案: {answer_text}")
        answer_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM, Typography.WEIGHT_SEMI))
        answer_label.setStyleSheet(f"""
            color: {Color.SUCCESS};
            background: {Color.SUCCESS_BG};
            padding: {Spacing.SM}px {Spacing.MD}px;
            border-radius: {Radius.MD}px;
        """)
        self.detail_card_layout.addWidget(answer_label)

        # 解析
        explanation = question.get('explanation', '')
        if explanation:
            exp_label = QLabel(f"解析: {explanation}")
            exp_label.setWordWrap(True)
            exp_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM))
            exp_label.setStyleSheet(f"""
                color: {Color.TEXT_SECONDARY};
                background: {Color.BG_TERTIARY};
                padding: {Spacing.SM}px {Spacing.MD}px;
                border-radius: {Radius.MD}px;
                line-height: 1.5;
            """)
            self.detail_card_layout.addWidget(exp_label)

        # 操作按钮
        actions = QHBoxLayout()
        remove_btn = QPushButton("已掌握，移出错题本")
        remove_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        remove_btn.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM, Typography.WEIGHT_MEDIUM))
        remove_btn.setFixedHeight(32)
        remove_btn.setStyleSheet(f"""
            QPushButton {{
                background: {Color.SUCCESS};
                color: white;
                border: none;
                border-radius: {Radius.MD}px;
                padding: 0 {Spacing.LG}px;
            }}
            QPushButton:hover {{
                background: {Color.SUCCESS_HOVER};
                border: 1px solid {Color.SUCCESS};
            }}
            QPushButton:pressed {{
                background: {Color.SUCCESS_ACTIVE};
                border: 1px solid {Color.SUCCESS_HOVER};
            }}
            QPushButton:disabled {{
                background: {Color.BORDER_LIGHT};
                color: {Color.TEXT_DISABLED};
                border: none;
            }}
        """)
        remove_btn.clicked.connect(lambda: self._on_remove_clicked(orig_index))
        actions.addWidget(remove_btn)
        actions.addStretch()
        self.detail_card_layout.addLayout(actions)

        self.detail_widget.setVisible(True)
        self.detail_title.setText(f"第 {orig_index + 1} 题")

    def _hide_detail(self):
        """隐藏详情面板"""
        self.detail_widget.setVisible(False)

    def _on_remove_clicked(self, orig_index: int):
        """移除错题"""
        reply = QMessageBox.question(
            self, "确认移除",
            f"确定要将第 {orig_index + 1} 题从错题本中移除吗？",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
        )
        if reply == QMessageBox.StandardButton.Yes:
            self.wrong_questions = [(idx, q) for idx, q in self.wrong_questions if idx != orig_index]
            self._update_grid()
            self._update_stats()
            self._hide_detail()

    def _on_review_all_clicked(self):
        """重做所有错题"""
        if not self.wrong_questions:
            QMessageBox.information(self, "提示", "暂无错题可重做")
            return
        QMessageBox.information(
            self, "提示",
            f"将重做 {len(self.wrong_questions)} 道错题\n\n"
            "请在刷题模式中选择「错题模式」进行练习"
        )

    def _on_clear_clicked(self):
        """清空错题本"""
        if not self.wrong_questions:
            QMessageBox.information(self, "提示", "错题本已为空")
            return
        reply = QMessageBox.warning(
            self, "确认清空",
            f"确定要清空所有 {len(self.wrong_questions)} 道错题吗？\n\n此操作不可恢复！",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
        )
        if reply == QMessageBox.StandardButton.Yes:
            self.wrong_questions.clear()
            self._update_grid()
            self._update_stats()
            self._hide_detail()

    def update_layout_for_size(self, width: int):
        """根据窗口宽度更新布局 - 响应式设计"""
        # 调整内容区边距
        if width >= 1400:
            self.content_layout.setContentsMargins(Spacing.XXXL, Spacing.XXL, Spacing.XXXL, Spacing.XXL)
        elif width >= 1200:
            self.content_layout.setContentsMargins(Spacing.XXL, Spacing.XL, Spacing.XXL, Spacing.XL)
        else:
            self.content_layout.setContentsMargins(Spacing.XL, Spacing.LG, Spacing.XL, Spacing.LG)
        
        # 根据窗口宽度调整错题网格列数
        if hasattr(self, 'grid_layout') and self.wrong_questions:
            if width >= 1600:
                cols = 12
            elif width >= 1400:
                cols = 10
            elif width >= 1200:
                cols = 8
            else:
                cols = 6
            # 重新构建网格以适应新列数
            self._update_grid_with_cols(cols)
    
    def _update_grid_with_cols(self, cols: int):
        """使用指定列数更新错题网格"""
        for i in reversed(range(self.grid_layout.count())):
            widget = self.grid_layout.itemAt(i).widget()
            if widget:
                widget.deleteLater()

        if not self.wrong_questions:
            self.empty_label.setVisible(True)
            self.scroll_area.setVisible(False)
            return

        self.empty_label.setVisible(False)
        self.scroll_area.setVisible(True)
        self.selected_button = None

        for idx, (orig_idx, question) in enumerate(self.wrong_questions):
            btn = QPushButton(str(orig_idx + 1))
            btn.setFixedSize(32, 32)
            btn.setCursor(Qt.CursorShape.PointingHandCursor)
            
            # 获取错误次数，用于颜色深浅
            error_count = question.get('error_count', 1)
            bg_color, border_color, text_color = self._get_error_colors(error_count)
            
            btn.setToolTip(f"第 {orig_idx + 1} 题 - {question.get('type', '未知')} (错{error_count}次)")
            btn.setFont(QFont("Microsoft YaHei", Typography.SIZE_XXS, Typography.WEIGHT_MEDIUM))
            btn.setProperty("orig_index", orig_idx)
            btn.setProperty("bg_color", bg_color)
            btn.setProperty("border_color", border_color)
            btn.setProperty("text_color", text_color)
            btn.setStyleSheet(f"""
                QPushButton {{
                    background: {bg_color};
                    border: 1px solid {border_color};
                    border-radius: {Radius.SM}px;
                    color: {text_color};
                }}
                QPushButton:hover {{
                    background: {Color.ERROR_BG_HOVER};
                    border-color: {Color.ERROR};
                }}
                QPushButton:pressed {{
                    background: {Color.ERROR_BG_HOVER};
                    border-color: {Color.ERROR_HOVER};
                }}
            """)
            btn.clicked.connect(lambda checked, i=orig_idx: self._on_question_clicked(i))
            self.grid_layout.addWidget(btn, idx // cols, idx % cols)
