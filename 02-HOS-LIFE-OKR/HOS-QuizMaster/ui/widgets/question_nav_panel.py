#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
题目导航面板 - Linear 风格
紧凑、清晰、克制
"""

from PyQt6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QPushButton,
                              QLabel, QScrollArea, QFrame, QGridLayout, QSizePolicy,
                              QGraphicsDropShadowEffect)
from PyQt6.QtCore import Qt, pyqtSignal, QTimer
from PyQt6.QtGui import QFont, QColor

from ui.design_tokens import Color, Spacing, Typography, Radius, Shadow


class QuestionNavPanel(QWidget):
    """题目导航面板 - 克制设计"""

    question_clicked = pyqtSignal(int)

    def __init__(self, parent=None):
        super().__init__(parent)
        self.question_buttons = []
        self.current_index = -1
        self.total_questions = 0
        self.answer_status = {}
        self.question_types = {}
        self._current_cols = 6  # 默认列数
        self._is_hovered = False
        self.init_ui()

    def init_ui(self):
        """初始化 UI"""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # 面板容器 - 使用 BG_SECONDARY 背景 + 细腻边框 + 阴影
        self.panel = QFrame()
        self.panel.setStyleSheet(f"""
            QFrame {{
                background: {Color.BG_SECONDARY};
                border: 1px solid {Color.BORDER_LIGHT};
                border-radius: {Radius.XL}px;
            }}
        """)

        # 面板阴影 - CARD_DEFAULT
        self._panel_shadow = QGraphicsDropShadowEffect()
        self._panel_shadow.setBlurRadius(Shadow.CARD_DEFAULT[0])
        self._panel_shadow.setXOffset(Shadow.CARD_DEFAULT[1])
        self._panel_shadow.setYOffset(Shadow.CARD_DEFAULT[2])
        self._panel_shadow.setColor(QColor(0, 0, 0, int(Shadow.CARD_DEFAULT[3] * 255)))
        self.panel.setGraphicsEffect(self._panel_shadow)

        panel_layout = QVBoxLayout(self.panel)
        panel_layout.setContentsMargins(Spacing.XL, Spacing.LG, Spacing.XL, Spacing.LG)
        panel_layout.setSpacing(Spacing.MD)

        # ===== 标题栏 =====
        header = QHBoxLayout()
        header.setSpacing(Spacing.SM)

        # 标题 - SIZE_MD + WEIGHT_SEMI
        self.title_label = QLabel("导航")
        self.title_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_MD, Typography.WEIGHT_SEMI))
        self.title_label.setStyleSheet(f"color: {Color.TEXT_PRIMARY};")
        header.addWidget(self.title_label)

        # 统计
        self.stats_badge = QLabel("0/0")
        self.stats_badge.setFont(QFont("Microsoft YaHei", Typography.SIZE_XS, Typography.WEIGHT_MEDIUM))
        self.stats_badge.setStyleSheet(f"""
            color: {Color.TEXT_SECONDARY};
            background: {Color.BG_TERTIARY};
            border-radius: {Radius.SM}px;
            padding: {Spacing.XXS}px {Spacing.XS}px;
        """)
        header.addWidget(self.stats_badge)

        header.addStretch()

        panel_layout.addLayout(header)

        # ===== 进度条 - 6px 高，圆角 3px =====
        self.progress_bar = QFrame()
        self.progress_bar.setFixedHeight(6)
        self.progress_bar.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        self.progress_bar.setStyleSheet(f"""
            background: {Color.BG_TERTIARY};
            border-radius: 3px;
        """)
        self.progress_fill = QFrame(self.progress_bar)
        self.progress_fill.setFixedSize(0, 6)
        self.progress_fill.setStyleSheet(f"""
            background: {Color.ACCENT};
            border-radius: 3px;
        """)
        panel_layout.addWidget(self.progress_bar)

        # 进度文字 - SIZE_SM + WEIGHT_SEMI
        self.progress_label = QLabel("0%")
        self.progress_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM, Typography.WEIGHT_SEMI))
        self.progress_label.setStyleSheet(f"color: {Color.TEXT_SECONDARY};")
        self.progress_label.setAlignment(Qt.AlignmentFlag.AlignRight)
        panel_layout.addWidget(self.progress_label)

        # ===== 滚动区 =====
        self.scroll_area = QScrollArea()
        self.scroll_area.setWidgetResizable(True)
        self.scroll_area.setFrameShape(QFrame.Shape.NoFrame)
        self.scroll_area.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        self.scroll_area.setVerticalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAsNeeded)
        self.scroll_area.setMaximumHeight(260)
        self.scroll_area.setStyleSheet(f"""
            QScrollArea {{ border: none; background: transparent; }}
            QScrollBar:vertical {{
                background: transparent;
                width: 4px;
                margin: 0;
            }}
            QScrollBar::handle:vertical {{
                background: {Color.BORDER_DEFAULT};
                border-radius: 2px;
                min-height: 20px;
            }}
            QScrollBar::handle:vertical:hover {{
                background: {Color.BORDER_DARK};
            }}
            QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {{
                height: 0;
            }}
        """)

        # 网格容器 - 间距 6px，增强按钮视觉区分
        self.grid_container = QWidget()
        self.grid_container.setStyleSheet("background: transparent;")
        self.grid_layout = QGridLayout(self.grid_container)
        self.grid_layout.setSpacing(Spacing.SM)
        self.grid_layout.setContentsMargins(0, 0, 0, 0)

        self.scroll_area.setWidget(self.grid_container)
        panel_layout.addWidget(self.scroll_area)

        # ===== 图例 - 增强视觉区分 =====
        legend = QHBoxLayout()
        legend.setSpacing(Spacing.LG)

        legend_items = [
            (Color.BG_TERTIARY, "transparent", "未答"),
            (Color.ACCENT_BG, Color.ACCENT_BORDER, "已答"),
            (Color.SUCCESS_BG, Color.SUCCESS, "正确"),
            (Color.ERROR_BG, Color.ERROR, "错误"),
            (Color.ACCENT, Color.ACCENT_HOVER, "当前"),
        ]
        for bg, border, text in legend_items:
            item = self._create_legend(bg, border, text)
            legend.addWidget(item)

        legend.addStretch()
        panel_layout.addLayout(legend)

        layout.addWidget(self.panel)

    def _create_legend(self, bg_color: str, border_color: str, text: str) -> QWidget:
        """创建图例 - 14x14px 圆角方块，增强可见性"""
        item = QWidget()
        item.setStyleSheet("background: transparent;")
        item_layout = QHBoxLayout(item)
        item_layout.setContentsMargins(0, 0, 0, 0)
        item_layout.setSpacing(Spacing.SM)

        # 14x14px 圆角方块 - 增大尺寸
        dot = QLabel()
        dot.setFixedSize(14, 14)
        dot.setStyleSheet(f"""
            background: {bg_color};
            border: 1.5px solid {border_color};
            border-radius: {Radius.SM}px;
        """)
        item_layout.addWidget(dot)

        # SIZE_XS 字号，增强对比度
        label = QLabel(text)
        label.setFont(QFont("Microsoft YaHei", Typography.SIZE_XS, Typography.WEIGHT_MEDIUM))
        label.setStyleSheet(f"color: {Color.TEXT_SECONDARY};")
        item_layout.addWidget(label)

        return item

    def set_questions(self, total: int, question_types: dict = None):
        """设置题目"""
        self.total_questions = total
        self.question_types = question_types or {}
        self.answer_status = {}
        self.current_index = -1

        # 清空
        for btn in self.question_buttons:
            btn.deleteLater()
        self.question_buttons.clear()

        # 根据面板宽度计算列数
        cols = self._calculate_cols()
        self._current_cols = cols
        
        # 创建按钮 - 自适应列数网格，增强按钮样式
        for i in range(total):
            btn = QPushButton(str(i + 1))
            btn.setFixedSize(40, 40)  # 增大按钮尺寸，更易点击
            btn.setCursor(Qt.CursorShape.PointingHandCursor)
            btn.setProperty('question_index', i)
            btn.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM, Typography.WEIGHT_SEMI))

            q_type = self.question_types.get(i, '未知')
            btn.setToolTip(f"第 {i + 1} 题 ({q_type})")

            self._update_button_style(btn, 'unanswered')
            btn.clicked.connect(lambda checked, idx=i: self._on_question_clicked(idx))
            self.question_buttons.append(btn)

            row = i // cols
            col = i % cols
            self.grid_layout.addWidget(btn, row, col)

        self.grid_layout.setAlignment(Qt.AlignmentFlag.AlignTop | Qt.AlignmentFlag.AlignLeft)
        self._update_stats()
    
    def _calculate_cols(self) -> int:
        """根据面板宽度计算网格列数"""
        panel_width = self.width()
        if panel_width >= 260:
            return 6
        elif panel_width >= 220:
            return 5
        elif panel_width >= 180:
            return 4
        else:
            return 3
    
    def resizeEvent(self, event):
        """面板大小改变时重新计算列数"""
        super().resizeEvent(event)
        if self.total_questions > 0:
            new_cols = self._calculate_cols()
            if new_cols != self._current_cols:
                self._current_cols = new_cols
                self._rebuild_grid()
    
    def _rebuild_grid(self):
        """重建网格布局"""
        # 保存当前状态
        current_index = self.current_index
        answer_status = self.answer_status.copy()
        
        # 清空网格
        for btn in self.question_buttons:
            self.grid_layout.removeWidget(btn)
        
        # 重新排列
        cols = self._current_cols
        for i, btn in enumerate(self.question_buttons):
            row = i // cols
            col = i % cols
            self.grid_layout.addWidget(btn, row, col)
        
        # 恢复状态
        self.current_index = current_index
        self.answer_status = answer_status
        self._update_stats()

    def _update_button_style(self, btn: QPushButton, status: str):
        """更新按钮样式 - 增强状态视觉区分，使用 QGraphicsDropShadowEffect 实现阴影"""
        # 移除现有阴影效果
        if hasattr(btn, '_shadow_effect') and btn._shadow_effect:
            btn.setGraphicsEffect(None)
            btn._shadow_effect = None

        if status == 'correct':
            bg = Color.SUCCESS_BG
            fg = Color.SUCCESS
            border = f"border: 2px solid {Color.SUCCESS};"
            hover_bg = Color.SUCCESS_BG_HOVER
        elif status == 'incorrect':
            bg = Color.ERROR_BG
            fg = Color.ERROR
            border = f"border: 2px solid {Color.ERROR};"
            hover_bg = Color.ERROR_BG_HOVER
        elif status == 'current':
            bg = Color.ACCENT
            fg = Color.TEXT_INVERSE
            border = f"border: 2px solid {Color.ACCENT_HOVER};"
            hover_bg = Color.ACCENT_HOVER
            # 为当前题目添加阴影效果
            shadow_effect = QGraphicsDropShadowEffect()
            shadow_effect.setBlurRadius(Shadow.SM[0])
            shadow_effect.setXOffset(Shadow.SM[1])
            shadow_effect.setYOffset(Shadow.SM[2])
            shadow_effect.setColor(QColor(0, 0, 0, int(Shadow.SM[3] * 255)))
            btn.setGraphicsEffect(shadow_effect)
            btn._shadow_effect = shadow_effect
        elif status == 'answered':
            bg = Color.ACCENT_BG
            fg = Color.ACCENT
            border = f"border: 1.5px solid {Color.ACCENT_BORDER};"
            hover_bg = Color.ACCENT_BG_HOVER
        else:  # unanswered
            bg = Color.BG_TERTIARY
            fg = Color.TEXT_SECONDARY
            border = "border: 1px solid transparent;"
            hover_bg = Color.BG_QUATERNARY

        btn.setStyleSheet(f"""
            QPushButton {{
                background: {bg};
                color: {fg};
                {border}
                border-radius: {Radius.MD}px;
                font-size: {Typography.SIZE_SM}px;
                font-weight: {Typography.WEIGHT_SEMI};
            }}
            QPushButton:hover {{
                background: {hover_bg};
            }}
            QPushButton:pressed {{
                background: {Color.BG_ACTIVE};
            }}
            QPushButton:disabled {{
                background: {Color.BG_QUATERNARY};
                color: {Color.TEXT_DISABLED};
                border: 1px solid {Color.BORDER_LIGHT};
            }}
        """)

    def _on_question_clicked(self, index: int):
        """题目点击"""
        self.question_clicked.emit(index)

    def set_current_question(self, index: int):
        """设置当前题目 - 增强当前题目的强调效果"""
        # 恢复上一个
        if 0 <= self.current_index < len(self.question_buttons):
            prev_btn = self.question_buttons[self.current_index]
            prev_status = self.answer_status.get(self.current_index, 'unanswered')
            self._update_button_style(prev_btn, prev_status)

        # 设置新的 - 使用更强的视觉强调
        self.current_index = index
        if 0 <= index < len(self.question_buttons):
            current_btn = self.question_buttons[index]
            self._update_button_style(current_btn, 'current')
            # 确保当前题目可见，并居中显示
            self.scroll_area.ensureWidgetVisible(current_btn, 0, 50)

    def update_answer_status(self, index: int, is_correct: bool):
        """更新答题状态"""
        status = 'correct' if is_correct else 'incorrect'
        self.answer_status[index] = status

        if 0 <= index < len(self.question_buttons):
            btn = self.question_buttons[index]
            if index != self.current_index:
                self._update_button_style(btn, status)

        self._update_stats()

    def _update_stats(self):
        """更新统计"""
        answered = len(self.answer_status)
        correct = sum(1 for s in self.answer_status.values() if s == 'correct')
        self.stats_badge.setText(f"{correct}/{self.total_questions}")

        if self.total_questions > 0:
            # 更新进度条
            progress = answered / self.total_questions
            bar_width = self.progress_bar.width()
            fill_width = int(bar_width * progress)
            self.progress_fill.setFixedSize(max(0, fill_width), 6)
            
            # 更新进度文字
            percentage = int(progress * 100)
            self.progress_label.setText(f"{percentage}%")

    def clear(self):
        """清空"""
        for btn in self.question_buttons:
            btn.deleteLater()
        self.question_buttons.clear()
        self.answer_status.clear()
        self.question_types.clear()
        self.total_questions = 0
        self.current_index = -1
        self._update_stats()

    def _animate_shadow(self, target_blur, target_y, target_alpha):
        """平滑过渡阴影效果 (200ms)"""
        if not hasattr(self, '_panel_shadow'):
            return
        if hasattr(self, '_hover_timer'):
            self._hover_timer.stop()
        start_blur = self._panel_shadow.blurRadius()
        start_y = self._panel_shadow.yOffset()
        start_alpha = self._panel_shadow.color().alpha() / 255.0
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
        self._panel_shadow.setBlurRadius(int(blur))
        self._panel_shadow.setYOffset(int(y))
        self._panel_shadow.setColor(QColor(0, 0, 0, int(alpha * 255)))
        if progress >= 1.0:
            self._hover_timer.stop()

    def enterEvent(self, event):
        """鼠标进入 - 使用 Shadow.CARD_HOVER 加深阴影 + 边框强调 + 微妙上浮"""
        self._is_hovered = True
        self._animate_shadow(
            Shadow.CARD_HOVER[0],
            Shadow.CARD_HOVER[2],
            Shadow.CARD_HOVER[3]
        )
        # 边框加深 + 微妙上浮效果（translateY: -2px 等效视觉）
        self.panel.setStyleSheet(f"""
            QFrame {{
                background: {Color.BG_SECONDARY};
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
        # 恢复默认边框和位置
        self.panel.setStyleSheet(f"""
            QFrame {{
                background: {Color.BG_SECONDARY};
                border: 1px solid {Color.BORDER_LIGHT};
                border-radius: {Radius.XL}px;
                margin-top: 0px;
                margin-bottom: 0px;
            }}
        """)
        super().leaveEvent(event)
