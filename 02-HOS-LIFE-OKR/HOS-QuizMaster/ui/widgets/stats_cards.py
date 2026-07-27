#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
统计卡片组件 - HOS-QuizMaster V2
Linear/Notion 风格重构
"""

from PyQt6.QtWidgets import QVBoxLayout, QHBoxLayout, QLabel, QFrame, QGraphicsDropShadowEffect
from PyQt6.QtCore import Qt, QPropertyAnimation, QEasingCurve, QTimer
from PyQt6.QtGui import QFont, QColor

from ui.design_tokens import Color, Spacing, Radius, Typography, Shadow


class StatCard(QFrame):
    """统计卡片基类 - Linear 风格 - 增强视觉层次"""
    
    def __init__(self, title: str, color: str, parent=None):
        super().__init__(parent)
        # 保存主题色用于悬停效果
        self._accent_color = color
        self._is_hovered = False

        # 默认边框：BORDER_LIGHT + 过渡动画
        self.setStyleSheet(f"""
            QFrame {{
                background: {Color.BG_PRIMARY};
                border: 1px solid {Color.BORDER_LIGHT};
                border-radius: {Radius.XL}px;
            }}
        """)

        # 使用设计令牌的 Shadow.CARD_DEFAULT
        self._shadow = QGraphicsDropShadowEffect()
        self._shadow.setBlurRadius(Shadow.CARD_DEFAULT[0])
        self._shadow.setXOffset(Shadow.CARD_DEFAULT[1])
        self._shadow.setYOffset(Shadow.CARD_DEFAULT[2])
        self._shadow.setColor(QColor(0, 0, 0, int(Shadow.CARD_DEFAULT[3] * 255)))
        self.setGraphicsEffect(self._shadow)

        # 卡片内边距：XXL (32px) 左右，XL (24px) 上下 - 更充足的留白
        layout = QVBoxLayout(self)
        layout.setContentsMargins(Spacing.XXL, Spacing.XL, Spacing.XXL, Spacing.XL)
        layout.setSpacing(Spacing.MD)

        # 标签 - 使用 CAPTION 预设，增强对比度（TEXT_SECONDARY 替代 TEXT_TERTIARY）
        # 增大 letter-spacing 到 1px，增强视觉层次
        self.title_label = QLabel(title)
        self.title_label.setFont(QFont("Microsoft YaHei", Typography.CAPTION[0], Typography.WEIGHT_MEDIUM))
        self.title_label.setStyleSheet(f"color: {Color.TEXT_SECONDARY}; letter-spacing: 1px;")
        layout.addWidget(self.title_label)

        # 数值 - SIZE_XXXL (32px) + WEIGHT_BOLD + 主题色，增强视觉冲击
        self.value_label = QLabel("0")
        self.value_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_XXXL, Typography.WEIGHT_BOLD))
        self.value_label.setStyleSheet(f"color: {color};")
        layout.addWidget(self.value_label)

        # 副标题 - 使用 CAPTION 预设，增强对比度，增加 letter-spacing
        self.subtitle_label = QLabel("")
        self.subtitle_label.setFont(QFont("Microsoft YaHei", Typography.CAPTION[0], Typography.CAPTION[1]))
        self.subtitle_label.setStyleSheet(f"color: {Color.TEXT_SECONDARY}; letter-spacing: 0.3px;")
        layout.addWidget(self.subtitle_label)
    
    def set_value(self, value: str):
        self.value_label.setText(value)
    
    def set_subtitle(self, subtitle: str):
        self.subtitle_label.setText(subtitle)

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
        """鼠标进入 - 使用 Shadow.CARD_HOVER 加深阴影 + 边框强调 + 微妙上浮"""
        self._is_hovered = True
        self._animate_shadow(
            Shadow.CARD_HOVER[0],
            Shadow.CARD_HOVER[2],
            Shadow.CARD_HOVER[3]
        )
        # 边框加深为 BORDER_DARK + 微妙上浮效果（translateY: -2px 等效视觉）
        self.setStyleSheet(f"""
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
        # 恢复默认边框和位置
        self.setStyleSheet(f"""
            QFrame {{
                background: {Color.BG_PRIMARY};
                border: 1px solid {Color.BORDER_LIGHT};
                border-radius: {Radius.XL}px;
                margin-top: 0px;
                margin-bottom: 0px;
            }}
        """)
        super().leaveEvent(event)


class TodayStatsCard(StatCard):
    """今日统计卡片"""
    
    def __init__(self, parent=None):
        super().__init__("今日", Color.ACCENT, parent)
        self.set_subtitle("今日学习情况")
    
    def update_stats(self, stats: dict):
        total = stats.get('total', 0)
        accuracy = stats.get('accuracy', 0)
        study_minutes = stats.get('study_minutes', 0)
        
        self.set_value(f"{total}题")
        self.set_subtitle(f"正确率 {accuracy:.0f}% · {study_minutes:.0f}分钟")


class WeekStatsCard(StatCard):
    """本周统计卡片"""
    
    def __init__(self, parent=None):
        super().__init__("本周", Color.ACCENT, parent)
        self.set_subtitle("本周学习情况")
    
    def update_stats(self, stats: dict):
        total = stats.get('total', 0)
        accuracy = stats.get('accuracy', 0)
        study_minutes = stats.get('study_minutes', 0)
        
        self.set_value(f"{total}题")
        self.set_subtitle(f"正确率 {accuracy:.0f}% · {study_minutes:.0f}分钟")


class OverallStatsCard(StatCard):
    """总体统计卡片"""
    
    def __init__(self, parent=None):
        super().__init__("累计", Color.SUCCESS, parent)
        self.set_subtitle("历史学习数据")
    
    def update_stats(self, stats: dict):
        total_questions = stats.get('total_questions', 0)
        total_answers = stats.get('total_answers', 0)
        accuracy = stats.get('accuracy', 0)
        
        self.set_value(f"{total_answers}题")
        self.set_subtitle(f"题库 {total_questions} · 正确率 {accuracy:.0f}%")


class PredictedScoreCard(StatCard):
    """预测分数卡片"""
    
    def __init__(self, parent=None):
        super().__init__("预测", Color.WARNING, parent)
        self.set_subtitle("基于历史表现")
    
    def update_stats(self, stats: dict):
        predicted_score = stats.get('predicted_score', 0)
        confidence = stats.get('confidence', 0)
        
        self.set_value(f"{predicted_score:.0f}")
        self.set_subtitle(f"置信度 {confidence}%")
