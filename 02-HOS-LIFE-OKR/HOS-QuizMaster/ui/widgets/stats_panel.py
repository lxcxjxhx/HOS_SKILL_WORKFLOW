#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
统计面板组件 - HOS-QuizMaster V2
Linear/Notion 风格重构
"""

from PyQt6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QLabel,
                              QFrame, QProgressBar)
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QFont

from ui.design_tokens import Color, Spacing, Radius, Typography


class StatsPanel(QWidget):
    """统计信息面板 - Linear 风格"""

    def __init__(self, parent=None):
        super().__init__(parent)
        self.init_ui()

    def init_ui(self):
        """初始化 UI"""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(Spacing.XL)

        # 标题
        title = QLabel("学习统计")
        title.setFont(QFont("Microsoft YaHei", Typography.SIZE_LG, Typography.WEIGHT_BOLD))
        title.setStyleSheet(f"color: {Color.TEXT_PRIMARY};")
        layout.addWidget(title)

        # 统计卡片网格
        stats_grid = QHBoxLayout()
        stats_grid.setSpacing(Spacing.MD)

        # 总题数卡片
        self.total_card = self._create_stat_card("总题数", "0", Color.ACCENT)
        stats_grid.addWidget(self.total_card)

        # 已答题数卡片
        self.answered_card = self._create_stat_card("已答题", "0", Color.SUCCESS)
        stats_grid.addWidget(self.answered_card)

        # 正确数卡片
        self.correct_card = self._create_stat_card("正确数", "0", Color.SUCCESS)
        stats_grid.addWidget(self.correct_card)

        # 正确率卡片
        self.accuracy_card = self._create_stat_card("正确率", "0%", Color.WARNING)
        stats_grid.addWidget(self.accuracy_card)

        layout.addLayout(stats_grid)

        # 进度区域
        progress_section = QFrame()
        progress_section.setStyleSheet(f"""
            QFrame {{
                background: {Color.BG_SECONDARY};
                border-radius: {Radius.XL}px;
            }}
        """)

        progress_layout = QVBoxLayout(progress_section)
        progress_layout.setContentsMargins(Spacing.XL, Spacing.LG, Spacing.XL, Spacing.LG)
        progress_layout.setSpacing(Spacing.MD)

        # 进度标题
        progress_title = QLabel("学习进度")
        progress_title.setFont(QFont("Microsoft YaHei", Typography.SIZE_MD, Typography.WEIGHT_SEMI))
        progress_title.setStyleSheet(f"color: {Color.TEXT_PRIMARY};")
        progress_layout.addWidget(progress_title)

        # 进度条
        self.progress_bar = QProgressBar()
        self.progress_bar.setFixedHeight(6)
        self.progress_bar.setTextVisible(False)
        self.progress_bar.setStyleSheet(f"""
            QProgressBar {{
                background: {Color.BORDER_LIGHT};
                border: none;
                border-radius: 3px;
            }}
            QProgressBar::chunk {{
                background: {Color.ACCENT};
                border-radius: 3px;
            }}
        """)
        progress_layout.addWidget(self.progress_bar)

        # 进度详情行
        progress_row = QHBoxLayout()
        self.progress_label = QLabel("0 / 0 题")
        self.progress_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM))
        self.progress_label.setStyleSheet(f"color: {Color.TEXT_SECONDARY};")
        progress_row.addWidget(self.progress_label)
        
        progress_row.addStretch()
        
        self.progress_detail = QLabel("完成度: 0%")
        self.progress_detail.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM, Typography.WEIGHT_MEDIUM))
        self.progress_detail.setStyleSheet(f"color: {Color.ACCENT};")
        progress_row.addWidget(self.progress_detail)
        
        progress_layout.addLayout(progress_row)
        layout.addWidget(progress_section)

        # 知识点分布（占位）
        knowledge_section = QFrame()
        knowledge_section.setStyleSheet(f"""
            QFrame {{
                background: {Color.BG_SECONDARY};
                border-radius: {Radius.XL}px;
            }}
        """)

        knowledge_layout = QVBoxLayout(knowledge_section)
        knowledge_layout.setContentsMargins(Spacing.XL, Spacing.LG, Spacing.XL, Spacing.LG)
        knowledge_layout.setSpacing(Spacing.MD)

        knowledge_title = QLabel("知识点分布")
        knowledge_title.setFont(QFont("Microsoft YaHei", Typography.SIZE_MD, Typography.WEIGHT_SEMI))
        knowledge_title.setStyleSheet(f"color: {Color.TEXT_PRIMARY};")
        knowledge_layout.addWidget(knowledge_title)

        knowledge_placeholder = QLabel("雷达图将在此显示各知识点的掌握情况")
        knowledge_placeholder.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM))
        knowledge_placeholder.setStyleSheet(f"color: {Color.TEXT_TERTIARY};")
        knowledge_placeholder.setAlignment(Qt.AlignmentFlag.AlignCenter)
        knowledge_placeholder.setMinimumHeight(160)
        knowledge_layout.addWidget(knowledge_placeholder)

        layout.addWidget(knowledge_section)
        layout.addStretch()

    def _create_stat_card(self, title: str, value: str, color: str) -> QFrame:
        """创建统计卡片 - Linear 风格"""
        card = QFrame()
        card.setStyleSheet(f"""
            QFrame {{
                background: {Color.BG_SECONDARY};
                border-radius: {Radius.LG}px;
            }}
        """)

        layout = QVBoxLayout(card)
        layout.setContentsMargins(Spacing.LG, Spacing.MD, Spacing.LG, Spacing.MD)
        layout.setSpacing(Spacing.XS)

        # 标题
        title_label = QLabel(title)
        title_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_XS))
        title_label.setStyleSheet(f"color: {Color.TEXT_SECONDARY};")
        layout.addWidget(title_label)

        # 数值
        value_label = QLabel(value)
        value_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_XXL, Typography.WEIGHT_BOLD))
        value_label.setStyleSheet(f"color: {color};")
        layout.addWidget(value_label)

        # 保存引用以便更新
        card.setProperty("value_label", value_label)

        return card

    def update_stats(self, stats: dict):
        """更新统计信息"""
        total = stats.get('total', 0)
        answered = stats.get('answered', 0)
        correct = stats.get('correct', 0)
        accuracy = stats.get('accuracy', 0)

        # 更新卡片数值
        self._update_card_value(self.total_card, str(total))
        self._update_card_value(self.answered_card, str(answered))
        self._update_card_value(self.correct_card, str(correct))
        self._update_card_value(self.accuracy_card, f"{accuracy:.1f}%")

        # 更新进度条
        self.progress_bar.setMaximum(total)
        self.progress_bar.setValue(answered)

        # 更新进度详情
        completion = (answered / total * 100) if total > 0 else 0
        self.progress_detail.setText(f"完成度: {completion:.1f}%")

    def _update_card_value(self, card: QFrame, value: str):
        """更新卡片数值"""
        value_label = card.property("value_label")
        if value_label:
            value_label.setText(value)
