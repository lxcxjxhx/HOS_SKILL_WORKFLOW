#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
考试视图 - HOS-QuizMaster V2
Linear/Notion 风格重构
"""

from PyQt6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QLabel,
                              QPushButton, QScrollArea, QFrame, QButtonGroup,
                              QRadioButton, QCheckBox, QMessageBox, QFileDialog,
                              QGridLayout, QSizePolicy, QGraphicsDropShadowEffect)
from PyQt6.QtCore import Qt, pyqtSignal, QTimer
from PyQt6.QtGui import QFont, QColor

from core.exam_paper import ExamPaper
from core.exam_generator import ExamGenerator
from ui.dialogs.exam_config_dialog import ExamConfigDialog
from utils.exam_exporter import ExamExporter
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


class _HoverShadowFrame(QFrame):
    """带悬停阴影加深效果的 QFrame 容器"""

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


class ExamView(QWidget):
    """考试视图 - Linear 风格"""

    exam_started = pyqtSignal()
    exam_submitted = pyqtSignal(dict)

    def __init__(self, question_dao=None, parent=None):
        super().__init__(parent)
        self.question_dao = question_dao
        self.generator = ExamGenerator(question_dao) if question_dao else None
        self.exporter = ExamExporter()
        self.current_exam: ExamPaper = None
        self.current_question_index = 0
        self.timer = QTimer()
        self.time_remaining = 0
        self.init_ui()

    def init_ui(self):
        """初始化 UI"""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # 内容容器
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

        title = QLabel("模拟考试")
        title.setFont(QFont("Microsoft YaHei", Typography.SIZE_XXL, Typography.WEIGHT_BOLD))
        title.setStyleSheet(f"color: {Color.TEXT_PRIMARY};")
        title_layout.addWidget(title)

        subtitle = QLabel("模拟真实考试环境 · 检验学习成果")
        subtitle.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM))
        subtitle.setStyleSheet(f"color: {Color.TEXT_TERTIARY};")
        title_layout.addWidget(subtitle)

        header.addLayout(title_layout)
        header.addStretch()

        self.status_label = QLabel("未开始")
        self.status_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_XS, Typography.WEIGHT_SEMI))
        self.status_label.setStyleSheet(f"""
            color: {Color.TEXT_SECONDARY};
            background: {Color.BG_TERTIARY};
            border-radius: {Radius.XL}px;
            padding: {Spacing.XS}px {Spacing.LG}px;
        """)
        header.addWidget(self.status_label)

        self.content_layout.addLayout(header)

        # ===== 配置区域（初始显示）=====
        self.config_widget = QWidget()
        config_layout = QVBoxLayout(self.config_widget)
        config_layout.setContentsMargins(0, 0, 0, 0)

        # 空状态样式 - 增强视觉层次
        empty_container = _HoverShadowWidget()
        empty_container.setStyleSheet(f"""
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
        empty_container.set_hover_shadow(shadow)
        
        empty_inner = QVBoxLayout(empty_container)
        empty_inner.setContentsMargins(Spacing.XXXL, Spacing.XXL, Spacing.XXXL, Spacing.XXL)
        empty_inner.setSpacing(Spacing.XL)
        empty_inner.setAlignment(Qt.AlignmentFlag.AlignCenter)

        empty_icon = QLabel("📝")
        empty_icon.setFont(QFont("Microsoft YaHei", 56))
        empty_icon.setAlignment(Qt.AlignmentFlag.AlignCenter)
        empty_inner.addWidget(empty_icon)

        empty_title = QLabel("开始模拟考试")
        empty_title.setFont(QFont("Microsoft YaHei", Typography.SIZE_XL, Typography.WEIGHT_SEMI))
        empty_title.setStyleSheet(f"color: {Color.TEXT_PRIMARY};")
        empty_title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        empty_inner.addWidget(empty_title)

        empty_subtitle = QLabel("配置试卷参数，生成模拟试卷进行练习")
        empty_subtitle.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM))
        empty_subtitle.setStyleSheet(f"color: {Color.TEXT_TERTIARY};")
        empty_subtitle.setAlignment(Qt.AlignmentFlag.AlignCenter)
        empty_inner.addWidget(empty_subtitle)

        config_btn = QPushButton("配置并生成试卷")
        config_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        config_btn.setFixedHeight(40)
        config_btn.setMinimumWidth(180)
        config_btn.setFont(QFont("Microsoft YaHei", Typography.SIZE_MD, Typography.WEIGHT_MEDIUM))
        config_btn.setStyleSheet(f"""
            QPushButton {{
                background: {Color.ACCENT};
                color: white;
                border: none;
                border-radius: {Radius.LG}px;
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
        config_btn.clicked.connect(self.show_config_dialog)
        empty_inner.addWidget(config_btn, alignment=Qt.AlignmentFlag.AlignCenter)

        config_layout.addWidget(empty_container)
        self.content_layout.addWidget(self.config_widget)

        # ===== 考试区域（初始隐藏）=====
        self.exam_widget = QWidget()
        exam_layout = QVBoxLayout(self.exam_widget)
        exam_layout.setContentsMargins(0, 0, 0, 0)
        exam_layout.setSpacing(Spacing.LG)

        # 考试信息栏 - 增强视觉层次
        info_bar = _HoverShadowFrame()
        info_bar.setStyleSheet(f"""
            QFrame {{
                background: {Color.BG_SECONDARY};
                border: 1px solid {Color.BORDER_LIGHT};
                border-radius: {Radius.XL}px;
            }}
            QFrame:hover {{
                border: 1px solid {Color.BORDER_DEFAULT};
            }}
        """)
        # 添加阴影 - 使用设计令牌 Shadow.CARD_DEFAULT
        shadow = QGraphicsDropShadowEffect()
        shadow.setBlurRadius(Shadow.CARD_DEFAULT[0])
        shadow.setXOffset(Shadow.CARD_DEFAULT[1])
        shadow.setYOffset(Shadow.CARD_DEFAULT[2])
        shadow.setColor(QColor(0, 0, 0, int(Shadow.CARD_DEFAULT[3] * 255)))
        info_bar.set_hover_shadow(shadow)
        
        info_layout = QHBoxLayout(info_bar)
        info_layout.setContentsMargins(Spacing.XXL, Spacing.LG, Spacing.XXL, Spacing.LG)
        info_layout.setSpacing(Spacing.XL)

        self.exam_title_label = QLabel()
        self.exam_title_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_LG, Typography.WEIGHT_SEMI))
        self.exam_title_label.setStyleSheet(f"color: {Color.TEXT_PRIMARY};")
        info_layout.addWidget(self.exam_title_label)

        info_layout.addStretch()

        # 计时器 - 突出显示
        self.timer_label = QLabel()
        self.timer_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_XL, Typography.WEIGHT_BOLD))
        self.timer_label.setStyleSheet(f"color: {Color.TEXT_PRIMARY};")
        info_layout.addWidget(self.timer_label)

        # 进度标签 - pill 样式
        self.progress_label = QLabel()
        self.progress_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_XS, Typography.WEIGHT_MEDIUM))
        self.progress_label.setStyleSheet(f"""
            color: {Color.TEXT_SECONDARY};
            background: {Color.BG_TERTIARY};
            border-radius: {Radius.XL}px;
            padding: {Spacing.XS}px {Spacing.MD}px;
        """)
        info_layout.addWidget(self.progress_label)

        exam_layout.addWidget(info_bar)

        # 题目导航网格 - 增强视觉层次
        self.nav_grid_widget = _HoverShadowWidget()
        self.nav_grid_widget.setStyleSheet(f"""
            QWidget {{
                background: {Color.BG_SECONDARY};
                border: 1px solid {Color.BORDER_DEFAULT};
                border-radius: {Radius.XL}px;
            }}
        """)
        # 添加阴影 - 使用设计令牌 Shadow.CARD_DEFAULT
        shadow = QGraphicsDropShadowEffect()
        shadow.setBlurRadius(Shadow.CARD_DEFAULT[0])
        shadow.setXOffset(Shadow.CARD_DEFAULT[1])
        shadow.setYOffset(Shadow.CARD_DEFAULT[2])
        shadow.setColor(QColor(0, 0, 0, int(Shadow.CARD_DEFAULT[3] * 255)))
        self.nav_grid_widget.set_hover_shadow(shadow)
        
        self.nav_grid_layout = QGridLayout(self.nav_grid_widget)
        self.nav_grid_layout.setSpacing(Spacing.SM)
        self.nav_grid_layout.setContentsMargins(Spacing.LG, Spacing.LG, Spacing.LG, Spacing.LG)
        exam_layout.addWidget(self.nav_grid_widget)

        # 滚动区域
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

        self.question_container = QWidget()
        self.question_container.setStyleSheet("background: transparent;")
        self.question_layout = QVBoxLayout(self.question_container)
        self.question_layout.setContentsMargins(0, 0, 0, 0)
        self.question_layout.setSpacing(Spacing.LG)

        self.scroll_area.setWidget(self.question_container)
        exam_layout.addWidget(self.scroll_area, stretch=1)

        # 底部操作栏 - 增强视觉层次
        action_bar = _HoverShadowFrame()
        action_bar.setStyleSheet(f"""
            QFrame {{
                background: {Color.BG_SECONDARY};
                border: 1px solid {Color.BORDER_LIGHT};
                border-radius: {Radius.XL}px;
            }}
            QFrame:hover {{
                border: 1px solid {Color.BORDER_DEFAULT};
            }}
        """)
        # 添加阴影 - 使用设计令牌 Shadow.CARD_DEFAULT
        shadow = QGraphicsDropShadowEffect()
        shadow.setBlurRadius(Shadow.CARD_DEFAULT[0])
        shadow.setXOffset(Shadow.CARD_DEFAULT[1])
        shadow.setYOffset(Shadow.CARD_DEFAULT[2])
        shadow.setColor(QColor(0, 0, 0, int(Shadow.CARD_DEFAULT[3] * 255)))
        action_bar.set_hover_shadow(shadow)
        
        action_layout = QHBoxLayout(action_bar)
        action_layout.setContentsMargins(Spacing.XXL, Spacing.LG, Spacing.XXL, Spacing.LG)

        self.prev_btn = self._create_nav_button("上一题")
        self.prev_btn.clicked.connect(self.prev_question)
        self.prev_btn.setEnabled(False)
        action_layout.addWidget(self.prev_btn)

        action_layout.addStretch()

        self.submit_btn = QPushButton("提交试卷")
        self.submit_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.submit_btn.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM, Typography.WEIGHT_SEMI))
        self.submit_btn.setFixedHeight(36)
        self.submit_btn.setMinimumWidth(100)
        self.submit_btn.setStyleSheet(f"""
            QPushButton {{
                background: {Color.SUCCESS};
                color: {Color.TEXT_INVERSE};
                border: none;
                border-radius: {Radius.LG}px;
                padding: 0 {Spacing.XL}px;
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
        self.submit_btn.clicked.connect(self.submit_exam)
        action_layout.addWidget(self.submit_btn)

        action_layout.addStretch()

        self.next_btn = self._create_nav_button("下一题")
        self.next_btn.clicked.connect(self.next_question)
        action_layout.addWidget(self.next_btn)

        exam_layout.addWidget(action_bar)

        self.exam_widget.setVisible(False)
        self.content_layout.addWidget(self.exam_widget)

        # ===== 结果区域（初始隐藏）=====
        self.result_widget = QWidget()
        result_layout = QVBoxLayout(self.result_widget)
        result_layout.setContentsMargins(0, 0, 0, 0)
        result_layout.setSpacing(Spacing.LG)

        # 成绩概览 - 增强视觉层次
        score_card = QFrame()
        score_card.setStyleSheet(f"""
            QFrame {{
                background: {Color.SUCCESS_BG};
                border: 1px solid {Color.SUCCESS};
                border-radius: {Radius.XL}px;
            }}
        """)
        score_layout = QVBoxLayout(score_card)
        score_layout.setContentsMargins(Spacing.XXXL, Spacing.XXL, Spacing.XXXL, Spacing.XXL)
        score_layout.setSpacing(Spacing.LG)

        self.score_title = QLabel("考试成绩")
        self.score_title.setFont(QFont("Microsoft YaHei", Typography.SIZE_XL, Typography.WEIGHT_SEMI))
        self.score_title.setStyleSheet(f"color: {Color.SUCCESS_ACTIVE};")
        self.score_title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        score_layout.addWidget(self.score_title)

        self.score_label = QLabel()
        self.score_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_MASSIVE, Typography.WEIGHT_BOLD))
        self.score_label.setStyleSheet(f"color: {Color.SUCCESS_ACTIVE};")
        self.score_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        score_layout.addWidget(self.score_label)

        # 统计数据网格布局
        stats_grid = QGridLayout()
        stats_grid.setSpacing(Spacing.LG)
        stats_grid.setContentsMargins(0, 0, 0, 0)
        
        self.stats_correct = QLabel()
        self.stats_correct.setFont(QFont("Microsoft YaHei", Typography.SIZE_MD, Typography.WEIGHT_MEDIUM))
        self.stats_correct.setStyleSheet(f"color: {Color.SUCCESS_ACTIVE};")
        self.stats_correct.setAlignment(Qt.AlignmentFlag.AlignCenter)
        stats_grid.addWidget(self.stats_correct, 0, 0)
        
        self.stats_incorrect = QLabel()
        self.stats_incorrect.setFont(QFont("Microsoft YaHei", Typography.SIZE_MD, Typography.WEIGHT_MEDIUM))
        self.stats_incorrect.setStyleSheet(f"color: {Color.SUCCESS_ACTIVE};")
        self.stats_incorrect.setAlignment(Qt.AlignmentFlag.AlignCenter)
        stats_grid.addWidget(self.stats_incorrect, 0, 1)
        
        self.stats_unanswered = QLabel()
        self.stats_unanswered.setFont(QFont("Microsoft YaHei", Typography.SIZE_MD, Typography.WEIGHT_MEDIUM))
        self.stats_unanswered.setStyleSheet(f"color: {Color.SUCCESS_ACTIVE};")
        self.stats_unanswered.setAlignment(Qt.AlignmentFlag.AlignCenter)
        stats_grid.addWidget(self.stats_unanswered, 0, 2)
        
        self.stats_accuracy = QLabel()
        self.stats_accuracy.setFont(QFont("Microsoft YaHei", Typography.SIZE_MD, Typography.WEIGHT_MEDIUM))
        self.stats_accuracy.setStyleSheet(f"color: {Color.SUCCESS_ACTIVE};")
        self.stats_accuracy.setAlignment(Qt.AlignmentFlag.AlignCenter)
        stats_grid.addWidget(self.stats_accuracy, 0, 3)
        
        score_layout.addLayout(stats_grid)

        result_layout.addWidget(score_card)

        # 详细结果滚动区域
        self.result_scroll = QScrollArea()
        self.result_scroll.setWidgetResizable(True)
        self.result_scroll.setFrameShape(QFrame.Shape.NoFrame)
        self.result_scroll.setStyleSheet(f"""
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
        """)

        self.result_container = QWidget()
        self.result_container.setStyleSheet("background: transparent;")
        self.result_layout_inner = QVBoxLayout(self.result_container)
        self.result_layout_inner.setContentsMargins(0, 0, 0, 0)
        self.result_layout_inner.setSpacing(Spacing.SM)

        self.result_scroll.setWidget(self.result_container)
        result_layout.addWidget(self.result_scroll, stretch=1)

        # 底部按钮 - 增强视觉层次
        result_actions = QHBoxLayout()
        result_actions.setSpacing(Spacing.MD)

        export_btn = self._create_action_button("导出试卷", Color.BG_PRIMARY, Color.TEXT_PRIMARY, Color.BORDER_DEFAULT)
        export_btn.clicked.connect(self.export_exam)
        result_actions.addWidget(export_btn)

        review_wrong_btn = self._create_action_button("查看错题", Color.BG_PRIMARY, Color.TEXT_PRIMARY, Color.BORDER_DEFAULT)
        review_wrong_btn.clicked.connect(self.review_wrong_answers)
        result_actions.addWidget(review_wrong_btn)

        result_actions.addStretch()

        new_exam_btn = self._create_action_button("新建考试", Color.ACCENT, Color.TEXT_INVERSE, None, True)
        new_exam_btn.clicked.connect(self.reset_exam)
        result_actions.addWidget(new_exam_btn)

        result_layout.addLayout(result_actions)

        self.result_widget.setVisible(False)
        self.content_layout.addWidget(self.result_widget)

        layout.addWidget(content)

        # 计时器信号
        self.timer.timeout.connect(self.update_timer)

    def _create_nav_button(self, text: str) -> QPushButton:
        """创建导航按钮"""
        btn = QPushButton(text)
        btn.setCursor(Qt.CursorShape.PointingHandCursor)
        btn.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM, Typography.WEIGHT_MEDIUM))
        btn.setFixedHeight(36)
        btn.setStyleSheet(f"""
            QPushButton {{
                background: {Color.BG_PRIMARY};
                color: {Color.TEXT_PRIMARY};
                border: 1px solid {Color.BORDER_DEFAULT};
                border-radius: {Radius.LG}px;
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

    def _create_action_button(self, text: str, bg_color: str, text_color: str,
                              border_color: str = None, is_primary: bool = False) -> QPushButton:
        """创建操作按钮"""
        btn = QPushButton(text)
        btn.setCursor(Qt.CursorShape.PointingHandCursor)
        btn.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM, Typography.WEIGHT_MEDIUM))
        btn.setFixedHeight(36)
        btn.setMinimumWidth(90)

        border_style = f"border: 1px solid {border_color};" if border_color else "border: none;"

        if is_primary:
            hover_color = Color.ACCENT_HOVER
            active_color = Color.ACCENT_ACTIVE
            hover_border = f"border: 1px solid {Color.ACCENT_BORDER};"
            active_border = f"border: 1px solid {Color.ACCENT_HOVER};"
        else:
            hover_color = Color.BG_HOVER
            active_color = Color.BG_ACTIVE
            hover_border = f"border: 1px solid {Color.BORDER_DARK};" if border_color else "border: none;"
            active_border = f"border: 1px solid {Color.BORDER_DARK};" if border_color else "border: none;"

        btn.setStyleSheet(f"""
            QPushButton {{
                background: {bg_color};
                color: {text_color};
                {border_style}
                border-radius: {Radius.LG}px;
                padding: 0 {Spacing.LG}px;
            }}
            QPushButton:hover {{
                background: {hover_color};
                {hover_border}
            }}
            QPushButton:pressed {{
                background: {active_color};
                {active_border}
            }}
            QPushButton:disabled {{
                background: {Color.BG_SECONDARY};
                color: {Color.TEXT_DISABLED};
                border: 1px solid {Color.BORDER_LIGHT};
            }}
        """)
        return btn

    def show_config_dialog(self):
        """显示配置对话框"""
        if not self.generator:
            QMessageBox.warning(self, "错误", "题库未加载，请先导入题库")
            return

        all_questions = self.question_dao.get_all()
        available_types = list(set(q.get('type', '未知') for q in all_questions))

        all_tags = set()
        for q in all_questions:
            tags = q.get('tags', [])
            if isinstance(tags, list):
                all_tags.update(tags)
        available_knowledge = sorted(list(all_tags))

        dialog = ExamConfigDialog(available_types, available_knowledge, self)
        if dialog.exec() == dialog.DialogCode.Accepted:
            config = dialog.get_config()
            error = dialog.validate_config()
            if error:
                QMessageBox.warning(self, "配置错误", error)
                return
            self.generate_exam(config)

    def generate_exam(self, config: dict):
        """生成试卷"""
        try:
            rules = {
                'type_counts': config['type_counts'],
                'knowledge_points': config.get('knowledge_points', []),
            }
            if config.get('difficulty_dist'):
                total_questions = sum(config['type_counts'].values())
                rules['difficulty_dist'] = config['difficulty_dist']
                rules['total'] = total_questions

            questions = self.generator.generate_composite(rules)

            self.current_exam = ExamPaper(
                title=config['title'],
                questions=questions,
                time_limit=config['time_limit'],
            )
            self.start_exam()

        except ValueError as e:
            QMessageBox.warning(self, "生成失败", str(e))
        except Exception as e:
            QMessageBox.critical(self, "错误", f"生成试卷失败:\n{str(e)}")

    def start_exam(self):
        """开始考试"""
        self.config_widget.setVisible(False)
        self.exam_widget.setVisible(True)
        self.result_widget.setVisible(False)

        self.exam_title_label.setText(self.current_exam.title)
        self.status_label.setText("进行中")
        self.status_label.setStyleSheet(f"""
            color: {Color.ACCENT};
            background: {Color.ACCENT_BG};
            border-radius: {Radius.XL}px;
            padding: {Spacing.XS}px {Spacing.LG}px;
        """)
        self.update_progress()

        if self.current_exam.time_limit > 0:
            self.time_remaining = self.current_exam.time_limit * 60
            self.timer.start(1000)
            self.update_timer()
        else:
            self.timer_label.setText("不限时")

        self.current_question_index = 0
        self.show_current_question()
        self.build_nav_grid()

        self.exam_started.emit()

    def build_nav_grid(self):
        """构建题目导航网格"""
        for i in reversed(range(self.nav_grid_layout.count())):
            widget = self.nav_grid_layout.itemAt(i).widget()
            if widget:
                widget.deleteLater()

        total = len(self.current_exam.questions)
        cols = 10
        for idx in range(total):
            btn = QPushButton(str(idx + 1))
            btn.setFixedSize(30, 30)
            btn.setCheckable(True)
            btn.setCursor(Qt.CursorShape.PointingHandCursor)
            btn.setFont(QFont("Microsoft YaHei", Typography.SIZE_XXS))
            btn.setStyleSheet(f"""
                QPushButton {{
                    background: {Color.BG_PRIMARY};
                    border: 1px solid {Color.BORDER_LIGHT};
                    border-radius: {Radius.SM}px;
                    color: {Color.TEXT_SECONDARY};
                    }}
                QPushButton:checked {{
                    background: {Color.ACCENT};
                    color: {Color.TEXT_INVERSE};
                    border-color: {Color.ACCENT};
                }}
                QPushButton:hover {{
                    border-color: {Color.ACCENT};
                    background: {Color.BG_HOVER};
                }}
                QPushButton:pressed {{
                    background: {Color.BG_ACTIVE};
                    border-color: {Color.ACCENT_ACTIVE};
                }}
                QPushButton:disabled {{
                    background: {Color.BG_QUATERNARY};
                    color: {Color.TEXT_DISABLED};
                    border: 1px solid {Color.BORDER_LIGHT};
                }}
            """)
            btn.clicked.connect(lambda checked, i=idx: self.go_to_question(i))
            self.nav_grid_layout.addWidget(btn, idx // cols, idx % cols)

        self.update_nav_grid()

    def update_nav_grid(self):
        """更新导航网格状态"""
        for idx in range(self.nav_grid_layout.count()):
            btn = self.nav_grid_layout.itemAt(idx).widget()
            if btn:
                btn.setChecked(idx == self.current_question_index)

    def go_to_question(self, index: int):
        """跳转到指定题目"""
        self.current_question_index = index
        self.show_current_question()
        self.update_nav_grid()

    def show_current_question(self):
        """显示当前题目"""
        for i in reversed(range(self.question_layout.count())):
            widget = self.question_layout.itemAt(i).widget()
            if widget:
                widget.deleteLater()

        question = self.current_exam.questions[self.current_question_index]
        card = self.create_question_card(question, self.current_question_index)
        self.question_layout.addWidget(card)

        self.update_progress()

        self.prev_btn.setEnabled(self.current_question_index > 0)
        self.next_btn.setEnabled(self.current_question_index < len(self.current_exam.questions) - 1)

    def create_question_card(self, question: dict, index: int) -> QWidget:
        """创建题目卡片"""
        card = QFrame()
        card.setStyleSheet(f"""
            QFrame {{
                background: {Color.BG_PRIMARY};
                border: 1px solid {Color.BORDER_LIGHT};
                border-radius: {Radius.XL}px;
            }}
            QFrame:hover {{
                border: 1px solid {Color.BORDER_DEFAULT};
            }}
        """)
        # 添加阴影效果 - 使用设计令牌 Shadow.CARD_DEFAULT
        shadow = QGraphicsDropShadowEffect()
        shadow.setBlurRadius(Shadow.CARD_DEFAULT[0])
        shadow.setXOffset(Shadow.CARD_DEFAULT[1])
        shadow.setYOffset(Shadow.CARD_DEFAULT[2])
        shadow.setColor(QColor(0, 0, 0, int(Shadow.CARD_DEFAULT[3] * 255)))
        card.setGraphicsEffect(shadow)

        layout = QVBoxLayout(card)
        layout.setContentsMargins(Spacing.XL, Spacing.LG, Spacing.XL, Spacing.LG)
        layout.setSpacing(Spacing.LG)

        # 题号和类型
        header = QHBoxLayout()

        number_label = QLabel(f"第 {index + 1} 题")
        number_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_LG, Typography.WEIGHT_BOLD))
        number_label.setStyleSheet(f"color: {Color.TEXT_PRIMARY};")
        header.addWidget(number_label)

        type_badge = QLabel(question['type'])
        type_badge.setFont(QFont("Microsoft YaHei", Typography.SIZE_XS, Typography.WEIGHT_MEDIUM))
        type_badge.setStyleSheet(f"""
            background: {Color.BG_TERTIARY};
            color: {Color.TEXT_SECONDARY};
            padding: {Spacing.XXS}px {Spacing.SM}px;
            border-radius: {Radius.SM}px;
        """)
        header.addWidget(type_badge)
        header.addStretch()
        layout.addLayout(header)

        # 分隔线
        divider = QFrame()
        divider.setFrameShape(QFrame.Shape.HLine)
        divider.setStyleSheet(f"background: {Color.BORDER_LIGHT}; max-height: 1px;")
        layout.addWidget(divider)

        # 题干
        stem_label = QLabel(question['stem'])
        stem_label.setWordWrap(True)
        stem_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_MD))
        stem_label.setStyleSheet(f"color: {Color.TEXT_PRIMARY}; line-height: 1.7;")
        stem_label.setTextInteractionFlags(Qt.TextInteractionFlag.TextSelectableByMouse)
        layout.addWidget(stem_label)

        # 选项
        options_layout = QVBoxLayout()
        options_layout.setSpacing(Spacing.SM)

        if question['type'] in ['单选题', '判断题']:
            button_group = QButtonGroup()
            button_group.buttonClicked.connect(lambda: self.on_answer_changed(index))

            for option in question['options']:
                btn = QRadioButton(f"{option['label']}. {option['text']}")
                btn.setProperty('option_label', option['label'])
                btn.setProperty('question_index', index)
                btn.setCursor(Qt.CursorShape.PointingHandCursor)
                btn.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM))
                btn.setStyleSheet(f"""
                    QRadioButton {{
                        spacing: {Spacing.SM}px;
                        padding: {Spacing.SM}px {Spacing.MD}px;
                        color: {Color.TEXT_PRIMARY};
                        background: {Color.BG_PRIMARY};
                        border: 1px solid {Color.BORDER_LIGHT};
                        border-radius: {Radius.MD}px;
                    }}
                    QRadioButton:hover {{
                        background: {Color.BG_HOVER};
                        border-color: {Color.BORDER_DEFAULT};
                    }}
                    QRadioButton:checked {{
                        background: {Color.ACCENT_BG};
                        border-color: {Color.ACCENT};
                        color: {Color.ACCENT};
                    }}
                """)
                button_group.addButton(btn)
                options_layout.addWidget(btn)
        else:
            for option in question['options']:
                btn = QCheckBox(f"{option['label']}. {option['text']}")
                btn.setProperty('option_label', option['label'])
                btn.setProperty('question_index', index)
                btn.setCursor(Qt.CursorShape.PointingHandCursor)
                btn.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM))
                btn.setStyleSheet(f"""
                    QCheckBox {{
                        spacing: {Spacing.SM}px;
                        padding: {Spacing.SM}px {Spacing.MD}px;
                        color: {Color.TEXT_PRIMARY};
                        background: {Color.BG_PRIMARY};
                        border: 1px solid {Color.BORDER_LIGHT};
                        border-radius: {Radius.MD}px;
                    }}
                    QCheckBox:hover {{
                        background: {Color.BG_HOVER};
                        border-color: {Color.BORDER_DEFAULT};
                    }}
                    QCheckBox:checked {{
                        background: {Color.ACCENT_BG};
                        border-color: {Color.ACCENT};
                        color: {Color.ACCENT};
                    }}
                """)
                btn.stateChanged.connect(lambda: self.on_answer_changed(index))
                options_layout.addWidget(btn)

        layout.addLayout(options_layout)

        # 恢复之前的答案
        saved_answer = self.current_exam.get_answer(index)
        if saved_answer:
            for btn in card.findChildren((QRadioButton, QCheckBox)):
                if btn.property('option_label') in saved_answer:
                    btn.setChecked(True)

        return card

    def on_answer_changed(self, question_index: int):
        """答案变更"""
        card = self.question_layout.itemAt(0).widget()
        if not card:
            return

        selected = []
        for btn in card.findChildren((QRadioButton, QCheckBox)):
            if btn.isChecked():
                selected.append(btn.property('option_label'))

        self.current_exam.set_answer(question_index, selected)

    def prev_question(self):
        """上一题"""
        if self.current_question_index > 0:
            self.current_question_index -= 1
            self.show_current_question()
            self.update_nav_grid()

    def next_question(self):
        """下一题"""
        if self.current_question_index < len(self.current_exam.questions) - 1:
            self.current_question_index += 1
            self.show_current_question()
            self.update_nav_grid()

    def update_progress(self):
        """更新进度显示"""
        total = len(self.current_exam.questions)
        answered = self.current_exam.answered_count
        self.progress_label.setText(f"已答 {answered}/{total} 题")

    def update_timer(self):
        """更新计时器"""
        if self.time_remaining > 0:
            self.time_remaining -= 1
            minutes = self.time_remaining // 60
            seconds = self.time_remaining % 60
            self.timer_label.setText(f"{minutes:02d}:{seconds:02d}")
            
            # 时间不足时改变颜色
            if self.time_remaining <= 300:  # 5分钟内
                self.timer_label.setStyleSheet(f"color: {Color.ERROR};")
            elif self.time_remaining <= 600:  # 10分钟内
                self.timer_label.setStyleSheet(f"color: {Color.WARNING};")
            else:
                self.timer_label.setStyleSheet(f"color: {Color.TEXT_PRIMARY};")

            if self.time_remaining == 0:
                self.timer.stop()
                QMessageBox.information(self, "时间到", "考试时间已到，自动提交试卷")
                self.submit_exam()
        else:
            self.timer_label.setText("不限时")
            self.timer_label.setStyleSheet(f"color: {Color.TEXT_TERTIARY};")

    def submit_exam(self):
        """提交试卷"""
        unanswered = len(self.current_exam.questions) - self.current_exam.answered_count
        if unanswered > 0:
            reply = QMessageBox.question(
                self,
                "确认提交",
                f"还有 {unanswered} 题未作答，确定要提交吗？",
                QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
            )
            if reply == QMessageBox.StandardButton.No:
                return

        self.timer.stop()
        result = self.current_exam.calculate_score()
        self.show_results(result)
        self.exam_submitted.emit(result)

    def show_results(self, result: dict):
        """显示考试结果"""
        self.exam_widget.setVisible(False)
        self.result_widget.setVisible(True)
        self.status_label.setText("已完成")
        self.status_label.setStyleSheet(f"""
            color: {Color.SUCCESS};
            background: {Color.SUCCESS_BG};
            border-radius: {Radius.XL}px;
            padding: {Spacing.XS}px {Spacing.LG}px;
        """)

        self.score_label.setText(f"{result['user_score']:.1f} / {result['total_score']}")
        
        # 更新统计数据网格
        self.stats_correct.setText(f"正确 {result['correct']} 题")
        self.stats_incorrect.setText(f"错误 {result['incorrect']} 题")
        self.stats_unanswered.setText(f"未答 {result['unanswered']} 题")
        self.stats_accuracy.setText(f"正确率 {result['accuracy']:.1f}%")

        for i in reversed(range(self.result_layout_inner.count())):
            widget = self.result_layout_inner.itemAt(i).widget()
            if widget:
                widget.deleteLater()

        for detail in result['details']:
            idx = detail['index']
            question = self.current_exam.questions[idx]

            if detail['is_correct']:
                bg = Color.SUCCESS_BG
                border = Color.SUCCESS
                result_text = "正确"
                result_color = Color.SUCCESS
            elif detail['user_answer']:
                bg = Color.ERROR_BG
                border = Color.ERROR
                result_text = "错误"
                result_color = Color.ERROR
            else:
                bg = Color.BG_SECONDARY
                border = Color.BORDER_LIGHT
                result_text = "未答"
                result_color = Color.TEXT_TERTIARY

            card = QFrame()
            card.setStyleSheet(f"""
                QFrame {{
                    background: {bg};
                    border: 1px solid {border};
                    border-radius: {Radius.LG}px;
                }}
            """)

            card_layout = QVBoxLayout(card)
            card_layout.setContentsMargins(Spacing.MD, Spacing.SM, Spacing.MD, Spacing.SM)
            card_layout.setSpacing(Spacing.XS)

            header = QHBoxLayout()
            number_label = QLabel(f"第 {idx + 1} 题")
            number_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM, Typography.WEIGHT_SEMI))
            number_label.setStyleSheet(f"color: {Color.TEXT_PRIMARY};")
            header.addWidget(number_label)

            header.addStretch()

            result_badge = QLabel(result_text)
            result_badge.setFont(QFont("Microsoft YaHei", Typography.SIZE_XS, Typography.WEIGHT_MEDIUM))
            result_badge.setStyleSheet(f"color: {result_color};")
            header.addWidget(result_badge)
            card_layout.addLayout(header)

            stem_text = question['stem']
            if len(stem_text) > 100:
                stem_text = stem_text[:100] + "..."
            stem_label = QLabel(stem_text)
            stem_label.setWordWrap(True)
            stem_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_XS))
            stem_label.setStyleSheet(f"color: {Color.TEXT_SECONDARY};")
            card_layout.addWidget(stem_label)

            user_ans = ', '.join(detail['user_answer']) if detail['user_answer'] else '未作答'
            correct_ans = ', '.join(detail['correct_answer'])
            answer_info = QLabel(f"你的答案: {user_ans}  |  正确答案: {correct_ans}")
            answer_info.setFont(QFont("Microsoft YaHei", Typography.SIZE_XXS))
            answer_info.setStyleSheet(f"color: {Color.TEXT_TERTIARY};")
            answer_info.setWordWrap(True)
            card_layout.addWidget(answer_info)

            explanation = question.get('explanation', '')
            if explanation:
                exp_label = QLabel(f"解析: {explanation}")
                exp_label.setWordWrap(True)
                exp_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_XXS))
                exp_label.setStyleSheet(f"color: {Color.TEXT_TERTIARY};")
                card_layout.addWidget(exp_label)

            self.result_layout_inner.addWidget(card)

    def export_exam(self):
        """导出试卷"""
        file_path, _ = QFileDialog.getSaveFileName(
            self, "导出试卷", f"{self.current_exam.title}.md",
            "Markdown Files (*.md)"
        )
        if file_path:
            try:
                self.exporter.export_to_markdown(
                    self.current_exam,
                    file_path,
                    include_answers=True
                )
                QMessageBox.information(self, "成功", "试卷已导出")
            except Exception as e:
                QMessageBox.critical(self, "错误", f"导出失败:\n{str(e)}")

    def review_wrong_answers(self):
        """查看错题"""
        QMessageBox.information(self, "提示", "错题复习功能请在错题本中查看")

    def reset_exam(self):
        """重置考试"""
        self.current_exam = None
        self.current_question_index = 0
        self.timer.stop()

        self.config_widget.setVisible(True)
        self.exam_widget.setVisible(False)
        self.result_widget.setVisible(False)

        self.status_label.setText("未开始")
        self.status_label.setStyleSheet(f"""
            color: {Color.TEXT_SECONDARY};
            background: {Color.BG_TERTIARY};
            border-radius: {Radius.XL}px;
            padding: {Spacing.XS}px {Spacing.LG}px;
        """)

    def set_question_dao(self, question_dao):
        """设置题目DAO"""
        self.question_dao = question_dao
        if question_dao:
            self.generator = ExamGenerator(question_dao)

    def update_layout_for_size(self, width: int):
        """根据窗口宽度更新布局 - 响应式设计
        
        响应式策略：
        - width < 1000: 紧凑边距，导航网格 8 列
        - 1000 <= width < 1200: 正常边距，导航网格 10 列
        - 1200 <= width < 1400: 正常边距，导航网格 10 列
        - width >= 1400: 宽松边距，导航网格 12 列
        """
        # 调整内容区边距
        if width >= 1400:
            self.content_layout.setContentsMargins(Spacing.XXXL, Spacing.XXL, Spacing.XXXL, Spacing.XXL)
        elif width >= 1200:
            self.content_layout.setContentsMargins(Spacing.XXL, Spacing.XL, Spacing.XXL, Spacing.XL)
        else:
            self.content_layout.setContentsMargins(Spacing.XL, Spacing.LG, Spacing.XL, Spacing.LG)
        
        # 根据窗口宽度调整导航网格列数
        if hasattr(self, 'nav_grid_layout') and self.current_exam:
            if width >= 1400:
                cols = 12
            elif width >= 1000:
                cols = 10
            else:
                cols = 8
            # 重新构建导航网格以适应新列数
            self.build_nav_grid_with_cols(cols)
    
    def build_nav_grid_with_cols(self, cols: int):
        """使用指定列数构建题目导航网格"""
        for i in reversed(range(self.nav_grid_layout.count())):
            widget = self.nav_grid_layout.itemAt(i).widget()
            if widget:
                widget.deleteLater()

        total = len(self.current_exam.questions)
        for idx in range(total):
            btn = QPushButton(str(idx + 1))
            btn.setFixedSize(30, 30)
            btn.setCheckable(True)
            btn.setCursor(Qt.CursorShape.PointingHandCursor)
            btn.setFont(QFont("Microsoft YaHei", Typography.SIZE_XXS))
            btn.setStyleSheet(f"""
                QPushButton {{
                    background: {Color.BG_PRIMARY};
                    border: 1px solid {Color.BORDER_LIGHT};
                    border-radius: {Radius.SM}px;
                    color: {Color.TEXT_SECONDARY};
                    }}
                QPushButton:checked {{
                    background: {Color.ACCENT};
                    color: {Color.TEXT_INVERSE};
                    border-color: {Color.ACCENT};
                }}
                QPushButton:hover {{
                    border-color: {Color.ACCENT};
                    background: {Color.BG_HOVER};
                }}
                QPushButton:pressed {{
                    background: {Color.BG_ACTIVE};
                    border-color: {Color.ACCENT_ACTIVE};
                }}
                QPushButton:disabled {{
                    background: {Color.BG_QUATERNARY};
                    color: {Color.TEXT_DISABLED};
                    border: 1px solid {Color.BORDER_LIGHT};
                }}
            """)
            btn.clicked.connect(lambda checked, i=idx: self.go_to_question(i))
            self.nav_grid_layout.addWidget(btn, idx // cols, idx % cols)

        self.update_nav_grid()
