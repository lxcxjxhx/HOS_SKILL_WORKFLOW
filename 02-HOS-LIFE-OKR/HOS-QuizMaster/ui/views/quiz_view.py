#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
刷题视图 - Linear 风格
克制层级、强排版、清晰结构
"""

from PyQt6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QLabel,
                              QScrollArea, QFrame, QLineEdit, QPushButton,
                              QSizePolicy, QGraphicsDropShadowEffect)
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QFont, QColor

from ui.design_tokens import Color, Spacing, Typography, Radius, Shadow
from ui.widgets.question_card import QuestionCard
from ui.widgets.question_nav_panel import QuestionNavPanel


class QuizView(QWidget):
    """刷题视图 - Linear 风格"""

    # 信号
    answer_changed = pyqtSignal(int, list)
    import_requested = pyqtSignal()

    def __init__(self, parent=None):
        super().__init__(parent)
        self.questions = []
        self.current_index = -1
        self.init_ui()

    def init_ui(self):
        """初始化 UI"""
        # 主布局：左侧题目区 + 右侧导航
        main_layout = QHBoxLayout(self)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)

        # 左侧：题目区域
        left_panel = QWidget()
        left_layout = QVBoxLayout(left_panel)
        left_layout.setContentsMargins(Spacing.XXXL, Spacing.XXL, Spacing.XXXL, Spacing.XXL)
        left_layout.setSpacing(Spacing.XXL)

        # 顶部栏：标题 + 搜索
        header = QHBoxLayout()
        header.setSpacing(Spacing.LG)
        
        # 标题区
        title_layout = QVBoxLayout()
        title_layout.setSpacing(Spacing.XS)
        
        title = QLabel("刷题模式")
        title.setFont(QFont("Microsoft YaHei", Typography.SIZE_XXL, Typography.WEIGHT_BOLD))
        title.setStyleSheet(f"color: {Color.TEXT_PRIMARY};")
        title_layout.addWidget(title)
        
        subtitle = QLabel("智能刷题 · 高效备考")
        subtitle.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM, Typography.WEIGHT_REGULAR))
        subtitle.setStyleSheet(f"color: {Color.TEXT_TERTIARY};")
        title_layout.addWidget(subtitle)
        
        header.addLayout(title_layout)
        header.addStretch()

        # 搜索框
        self.search_input = QLineEdit()
        self.search_input.setPlaceholderText("搜索题目...")
        self.search_input.setFixedWidth(200)
        self.search_input.setFixedHeight(36)
        self.search_input.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM))
        self.search_input.setStyleSheet(f"""
            QLineEdit {{
                background: {Color.BG_SECONDARY};
                border: 1px solid {Color.BORDER_DEFAULT};
                border-radius: {Radius.MD}px;
                padding: 0 {Spacing.MD}px;
                color: {Color.TEXT_PRIMARY};
            }}
            QLineEdit:hover {{
                border: 1px solid {Color.BORDER_DARK};
            }}
            QLineEdit:focus {{
                border: 1px solid {Color.ACCENT};
                background: {Color.BG_PRIMARY};
            }}
            QLineEdit::placeholder {{
                color: {Color.TEXT_TERTIARY};
            }}
        """)
        self.search_input.textChanged.connect(self._on_search_changed)
        header.addWidget(self.search_input)

        # 状态标签 - pill 样式
        self.status_label = QLabel("未加载题库")
        self.status_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_XS, Typography.WEIGHT_MEDIUM))
        self.status_label.setStyleSheet(f"""
            color: {Color.TEXT_SECONDARY};
            background: {Color.BG_TERTIARY};
            border-radius: {Radius.XL}px;
            padding: {Spacing.XS}px {Spacing.LG}px;
        """)
        header.addWidget(self.status_label)

        left_layout.addLayout(header)

        # 题目卡片滚动区
        self.scroll_area = QScrollArea()
        self.scroll_area.setWidgetResizable(True)
        self.scroll_area.setFrameShape(QFrame.Shape.NoFrame)
        self.scroll_area.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        self.scroll_area.setVerticalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAsNeeded)
        self.scroll_area.setStyleSheet(f"""
            QScrollArea {{
                border: none;
                background: transparent;
            }}
            QScrollBar:vertical {{
                background: transparent;
                width: 8px;
                margin: 0;
            }}
            QScrollBar::handle:vertical {{
                background: {Color.BORDER_DARK};
                border-radius: 4px;
                min-height: 20px;
            }}
            QScrollBar::handle:vertical:hover {{
                background: {Color.TEXT_TERTIARY};
            }}
            QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {{
                height: 0;
            }}
        """)

        # 题目卡片
        self.question_card = QuestionCard()
        self.question_card.answer_changed.connect(self._on_answer_changed)

        # 包装容器 - 添加边框、圆角和阴影
        container = QWidget()
        container.setStyleSheet(f"""
            QWidget {{
                background: {Color.BG_PRIMARY};
                border: 1px solid {Color.BORDER_LIGHT};
                border-radius: {Radius.XL}px;
            }}
            QWidget:hover {{
                border: 1px solid {Color.BORDER_DEFAULT};
            }}
        """)
        # 添加阴影效果 - 使用设计令牌 Shadow.CARD_DEFAULT
        shadow = QGraphicsDropShadowEffect()
        shadow.setBlurRadius(Shadow.CARD_DEFAULT[0])
        shadow.setXOffset(Shadow.CARD_DEFAULT[1])
        shadow.setYOffset(Shadow.CARD_DEFAULT[2])
        shadow.setColor(QColor(0, 0, 0, int(Shadow.CARD_DEFAULT[3] * 255)))
        container.setGraphicsEffect(shadow)
        
        container_layout = QVBoxLayout(container)
        container_layout.setContentsMargins(Spacing.XXL, Spacing.XL, Spacing.XXL, Spacing.XL)
        container_layout.setSpacing(Spacing.LG)
        container_layout.addWidget(self.question_card)
        container_layout.addStretch()

        self.scroll_area.setWidget(container)
        left_layout.addWidget(self.scroll_area)

        # 空状态 - 增强视觉层次
        self.empty_state = QWidget()
        self.empty_state.setStyleSheet(f"""
            QWidget {{
                background: {Color.BG_SECONDARY};
                border: 1px dashed {Color.BORDER_LIGHT};
                border-radius: {Radius.XL}px;
            }}
            QWidget:hover {{
                border: 1px dashed {Color.BORDER_DEFAULT};
            }}
        """)
        # 添加阴影效果 - 使用设计令牌 Shadow.CARD_DEFAULT
        shadow = QGraphicsDropShadowEffect()
        shadow.setBlurRadius(Shadow.CARD_DEFAULT[0])
        shadow.setXOffset(Shadow.CARD_DEFAULT[1])
        shadow.setYOffset(Shadow.CARD_DEFAULT[2])
        shadow.setColor(QColor(0, 0, 0, int(Shadow.CARD_DEFAULT[3] * 255)))
        self.empty_state.setGraphicsEffect(shadow)
        
        empty_layout = QVBoxLayout(self.empty_state)
        empty_layout.setContentsMargins(Spacing.XXXL, Spacing.XXXL, Spacing.XXXL, Spacing.XXXL)
        empty_layout.setSpacing(Spacing.XL)
        empty_layout.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        # 图标 - 56px 大小
        empty_icon = QLabel("📚")
        empty_icon.setFont(QFont("Microsoft YaHei", 56))
        empty_icon.setAlignment(Qt.AlignmentFlag.AlignCenter)
        empty_layout.addWidget(empty_icon)
        
        # 标题 - SIZE_XL + WEIGHT_SEMI
        empty_title = QLabel("暂无题目")
        empty_title.setFont(QFont("Microsoft YaHei", Typography.SIZE_XL, Typography.WEIGHT_SEMI))
        empty_title.setStyleSheet(f"color: {Color.TEXT_PRIMARY};")
        empty_title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        empty_layout.addWidget(empty_title)
        
        # 副标题
        empty_subtitle = QLabel("请点击「导入题库」加载题目")
        empty_subtitle.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM))
        empty_subtitle.setStyleSheet(f"color: {Color.TEXT_TERTIARY};")
        empty_subtitle.setAlignment(Qt.AlignmentFlag.AlignCenter)
        empty_layout.addWidget(empty_subtitle)
        
        # 导入按钮 - 完整交互状态
        import_btn = QPushButton("导入题库")
        import_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        import_btn.setFixedHeight(40)
        import_btn.setMinimumWidth(140)
        import_btn.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM, Typography.WEIGHT_MEDIUM))
        import_btn.setStyleSheet(f"""
            QPushButton {{
                background: {Color.ACCENT};
                color: {Color.TEXT_INVERSE};
                border: none;
                border-radius: {Radius.MD}px;
                padding: 0 {Spacing.XXL}px;
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
        import_btn.clicked.connect(self.import_requested.emit)
        empty_layout.addWidget(import_btn, alignment=Qt.AlignmentFlag.AlignCenter)
        
        left_layout.addWidget(self.empty_state)
        self.empty_label = self.empty_state

        self.question_card.setVisible(False)
        self.scroll_area.setVisible(False)

        main_layout.addWidget(left_panel, 1)

        # 右侧：导航面板
        self.nav_panel = QuestionNavPanel()
        self.nav_panel.setFixedWidth(260)
        main_layout.addWidget(self.nav_panel)

    def set_questions(self, questions: list):
        """设置题目列表"""
        self.questions = questions
        self.nav_panel.set_questions(len(questions))
        if questions:
            self.show_question_by_index(0)

    def show_question_by_index(self, index: int):
        """显示指定索引的题目"""
        if not self.questions or index < 0 or index >= len(self.questions):
            return

        self.current_index = index
        question = self.questions[index]

        # 切换显示状态
        self.empty_label.setVisible(False)
        self.scroll_area.setVisible(True)
        self.question_card.setVisible(True)

        # 更新卡片
        self.question_card.set_question(question, index, len(self.questions))

        # 更新状态
        self.status_label.setText(f"第 {index + 1} / {len(self.questions)} 题")
        self.nav_panel.set_current_question(index)

    def _on_answer_changed(self, selected: list):
        """答案变更"""
        if self.current_index >= 0:
            self.answer_changed.emit(self.current_index, selected)

    def _on_search_changed(self, text: str):
        """搜索变更"""
        # TODO: 实现搜索逻辑
        pass

    def show_empty_state(self):
        """显示空状态"""
        self.empty_label.setVisible(True)
        self.scroll_area.setVisible(False)
        self.question_card.setVisible(False)
        self.status_label.setText("未加载题库")

    def update_layout_for_size(self, width: int):
        """根据窗口宽度更新布局 - 响应式设计
        
        响应式策略：
        - width < 1000: 隐藏导航面板，紧凑边距，搜索框缩小
        - width >= 1000: 显示导航面板，正常边距
        - 题目卡片最大宽度随窗口调整
        """
        # 小窗口时隐藏导航面板，大窗口时显示
        if width < 1000:
            self.nav_panel.setVisible(False)
            self.search_input.setFixedWidth(150)
        else:
            self.nav_panel.setVisible(True)
            self.search_input.setFixedWidth(200)
            
        # 调整内容区边距
        left_panel = self.layout().itemAt(0).widget()
        if left_panel:
            left_layout = left_panel.layout()
            if left_layout:
                if width >= 1400:
                    left_layout.setContentsMargins(Spacing.XXXL, Spacing.XXL, Spacing.XXXL, Spacing.XXL)
                elif width >= 1200:
                    left_layout.setContentsMargins(Spacing.XXL, Spacing.XL, Spacing.XXL, Spacing.XL)
                else:
                    left_layout.setContentsMargins(Spacing.XL, Spacing.LG, Spacing.XL, Spacing.LG)
        
        # 题目卡片容器最大宽度自适应
        if hasattr(self, 'scroll_area'):
            container = self.scroll_area.widget()
            if container:
                if width >= 1400:
                    container.setMaximumWidth(900)
                elif width >= 1200:
                    container.setMaximumWidth(800)
                elif width >= 1000:
                    container.setMaximumWidth(700)
                else:
                    container.setMaximumWidth(16777215)  # 无限制
