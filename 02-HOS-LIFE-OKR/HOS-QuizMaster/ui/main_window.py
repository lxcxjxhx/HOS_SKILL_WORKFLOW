#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
主窗口 - Linear 风格
干净侧边栏 + 正确布局
"""

from PyQt6.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                             QHBoxLayout, QStackedWidget, QLabel, QPushButton,
                             QFrame, QSizePolicy)
from PyQt6.QtCore import Qt, QSize, QPropertyAnimation, QEasingCurve
from PyQt6.QtGui import QFont, QIcon, QResizeEvent

from ui.design_tokens import Color, Spacing, Typography, Radius, Shadow
from ui.views.quiz_view import QuizView
from ui.views.exam_view import ExamView
from ui.views.wrong_view import WrongView
from ui.views.stats_view import StatsView
from ui.views.settings_view import SettingsView


class SidebarButton(QPushButton):
    """侧边栏按钮 - 增强视觉效果"""
    
    def __init__(self, text: str, icon_char: str = "", parent=None):
        super().__init__(parent)
        self.setText(f"{icon_char}  {text}" if icon_char else text)
        self.setCheckable(True)
        self.setCursor(Qt.CursorShape.PointingHandCursor)
        self.setFixedHeight(40)
        self.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM, Typography.WEIGHT_MEDIUM))
        self.setStyleSheet(f"""
            QPushButton {{
                text-align: left;
                padding: 0 {Spacing.LG}px;
                background: transparent;
                border: none;
                border-left: 3px solid transparent;
                border-radius: {Radius.MD}px;
                color: {Color.TEXT_SECONDARY};
            }}
            QPushButton:hover {{
                background: {Color.BG_HOVER};
                color: {Color.TEXT_PRIMARY};
                border-left: 3px solid {Color.BORDER_DARK};
            }}
            QPushButton:checked {{
                background: {Color.ACCENT_BG_HOVER};
                color: {Color.ACCENT};
                font-weight: {Typography.WEIGHT_SEMI};
                border-left: 3px solid {Color.ACCENT};
            }}
            QPushButton:checked:hover {{
                background: {Color.ACCENT_BG};
                border-left: 3px solid {Color.ACCENT_HOVER};
            }}
        """)


class MainWindow(QMainWindow):
    """主窗口 - Linear 风格"""
    
    def __init__(self):
        super().__init__()
        self.setWindowTitle("HOS-QuizMaster")
        self.resize(1600, 1000)
        self.setMinimumSize(1200, 700)
        
        # 侧边栏宽度配置
        self.sidebar_expanded_width = 260  # 展开状态
        self.sidebar_collapsed_width = 60  # 折叠状态
        self._current_sidebar_state = None  # 跟踪当前状态：'expanded' 或 'collapsed'
        
        # 中心部件
        central = QWidget()
        self.setCentralWidget(central)
        main_layout = QHBoxLayout(central)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)
        
        # 侧边栏
        self.sidebar = self._create_sidebar()
        main_layout.addWidget(self.sidebar)
        
        # 侧边栏宽度动画（在 sidebar 创建后初始化）
        self.sidebar_min_anim = QPropertyAnimation(self.sidebar, b"minimumWidth")
        self.sidebar_min_anim.setDuration(250)
        self.sidebar_min_anim.setEasingCurve(QEasingCurve.Type.OutCubic)
        self.sidebar_max_anim = QPropertyAnimation(self.sidebar, b"maximumWidth")
        self.sidebar_max_anim.setDuration(250)
        self.sidebar_max_anim.setEasingCurve(QEasingCurve.Type.OutCubic)
        
        # 内容区
        content_wrapper = QWidget()
        content_wrapper.setStyleSheet(f"background: {Color.BG_PRIMARY};")
        content_layout = QVBoxLayout(content_wrapper)
        content_layout.setContentsMargins(Spacing.XXL, Spacing.XL, Spacing.XXL, Spacing.XL)
        self.content_area = QStackedWidget()
        content_layout.addWidget(self.content_area)
        main_layout.addWidget(content_wrapper, 1)
        
        # 初始化视图
        self._init_views()
        
        # 默认选中第一个
        self.sidebar_buttons[0].setChecked(True)
        self.content_area.setCurrentIndex(0)
        
        # 初始化响应式布局
        self._update_responsive_layout()
    
    def _create_sidebar(self) -> QWidget:
        """创建侧边栏"""
        sidebar = QFrame()
        sidebar.setMinimumWidth(self.sidebar_collapsed_width)
        sidebar.setMaximumWidth(self.sidebar_expanded_width)
        sidebar.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Expanding)
        sidebar.setStyleSheet(f"""
            QFrame {{
                background: {Color.BG_SECONDARY};
                border: none;
                border-right: 1px solid {Color.BORDER_LIGHT};
            }}
        """)
        
        layout = QVBoxLayout(sidebar)
        layout.setContentsMargins(Spacing.SM, Spacing.LG, Spacing.SM, Spacing.LG)
        layout.setSpacing(Spacing.XS)
        
        # Logo 区域 - 增强视觉权重
        self.logo_label = QLabel("HOS-QuizMaster")
        self.logo_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_XXL, Typography.WEIGHT_BOLD))
        self.logo_label.setStyleSheet(f"""
            QLabel {{
                color: {Color.TEXT_PRIMARY};
                padding: {Spacing.XXL}px {Spacing.LG}px;
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 {Color.ACCENT_BG},
                    stop:1 transparent);
                border-radius: {Radius.MD}px;
            }}
        """)
        layout.addWidget(self.logo_label)
        
        # Logo 下方的分隔线 - 增强视觉
        logo_divider = QFrame()
        logo_divider.setFrameShape(QFrame.Shape.HLine)
        logo_divider.setStyleSheet(f"""
            QFrame {{
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 transparent,
                    stop:0.2 {Color.BORDER_DEFAULT},
                    stop:0.8 {Color.BORDER_DEFAULT},
                    stop:1 transparent);
                max-height: 1px;
            }}
        """)
        layout.addWidget(logo_divider)
        
        # 间距
        layout.addSpacing(Spacing.XXL)
        
        # 导航按钮
        self.sidebar_buttons = []
        nav_items = [
            ("刷题模式", "📚"),
            ("模拟考试", "📝"),
            ("错题本", "❌"),
            ("数据统计", "📊"),
            ("设置", "⚙️"),
        ]
        
        for text, icon in nav_items:
            btn = SidebarButton(text, icon)
            btn.setProperty("_full_text", btn.text())
            btn.clicked.connect(lambda checked, b=btn: self._on_nav_clicked(b))
            layout.addWidget(btn)
            self.sidebar_buttons.append(btn)
        
        layout.addStretch()
        
        return sidebar
    
    def resizeEvent(self, event: QResizeEvent):
        """窗口大小改变事件"""
        super().resizeEvent(event)
        self._update_responsive_layout()
    
    def _update_responsive_layout(self):
        """根据窗口大小更新响应式布局
        
        响应式断点：
        - width < 1000px: 侧边栏折叠为图标模式（60px）
        - width >= 1000px: 侧边栏展开为完整模式（220px）
        """
        width = self.width()
        
        # 判断当前应该处于哪种状态
        should_be_collapsed = width < 1000
        new_state = 'collapsed' if should_be_collapsed else 'expanded'
        
        # 只有状态真正改变时才触发动画和更新
        if new_state != self._current_sidebar_state:
            self._current_sidebar_state = new_state
            target_width = self.sidebar_collapsed_width if should_be_collapsed else self.sidebar_expanded_width
            current_width = self.sidebar.width()
            
            # 停止当前动画
            for anim in (self.sidebar_min_anim, self.sidebar_max_anim):
                if anim.state() == QPropertyAnimation.State.Running:
                    anim.stop()
            
            # 使用动画平滑过渡侧边栏宽度（同时动画 minimumWidth 和 maximumWidth）
            for anim in (self.sidebar_min_anim, self.sidebar_max_anim):
                anim.setStartValue(current_width)
                anim.setEndValue(target_width)
                anim.start()
            
            # 更新侧边栏内容显示模式
            self._update_sidebar_display_mode(should_be_collapsed)
            
            # 更新内容区边距
            if should_be_collapsed:
                self._update_content_margins(Spacing.LG, Spacing.MD)
            else:
                self._update_content_margins(Spacing.XXL, Spacing.XL)
        
        # 通知子视图更新布局（每次 resize 都需要通知，以便细粒度调整）
        if hasattr(self, 'quiz_view'):
            self.quiz_view.update_layout_for_size(width)
        if hasattr(self, 'exam_view'):
            self.exam_view.update_layout_for_size(width)
        if hasattr(self, 'wrong_view'):
            self.wrong_view.update_layout_for_size(width)
        if hasattr(self, 'stats_view'):
            self.stats_view.update_layout_for_size(width)
    
    def _update_sidebar_display_mode(self, collapsed: bool):
        """更新侧边栏显示模式（展开/折叠）
        
        Args:
            collapsed: True 表示折叠为图标模式，False 表示展开为完整模式
        """
        if collapsed:
            # 折叠状态 - 只显示图标，隐藏文字
            self.logo_label.setText("HQ")
            self.logo_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_LG, Typography.WEIGHT_BOLD))
            self.logo_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
            self.logo_label.setStyleSheet(
                f"color: {Color.TEXT_PRIMARY}; padding: {Spacing.MD}px;"
            )
            for btn in self.sidebar_buttons:
                # 只保留图标字符（取第一个 token 作为 icon）
                full_text = btn.property("_full_text") or btn.text()
                icon_char = full_text.split()[0] if full_text.split() else ""
                btn.setText(icon_char)
                btn.setProperty("_collapsed", True)
                btn.setStyleSheet(self._collapsed_button_style())
        else:
            # 展开状态 - 显示图标 + 文字
            self.logo_label.setText("HOS-QuizMaster")
            self.logo_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_XXL, Typography.WEIGHT_BOLD))
            self.logo_label.setAlignment(Qt.AlignmentFlag.AlignLeft)
            self.logo_label.setStyleSheet(
                f"color: {Color.TEXT_PRIMARY}; padding: {Spacing.XXL}px {Spacing.LG}px;"
            )
            for btn in self.sidebar_buttons:
                full_text = btn.property("_full_text")
                if full_text:
                    btn.setText(full_text)
                btn.setProperty("_collapsed", False)
                btn.setStyleSheet(self._expanded_button_style())
    
    def _collapsed_button_style(self) -> str:
        """折叠状态下的按钮样式 - 居中显示图标，增强悬停效果"""
        return f"""
            QPushButton {{
                text-align: center;
                padding: 0;
                background: transparent;
                border: none;
                border-radius: {Radius.MD}px;
                color: {Color.TEXT_SECONDARY};
            }}
            QPushButton:hover {{
                background: {Color.BG_HOVER};
                color: {Color.TEXT_PRIMARY};
            }}
            QPushButton:checked {{
                background: {Color.ACCENT_BG_HOVER};
                color: {Color.ACCENT};
                font-weight: {Typography.WEIGHT_SEMI};
            }}
            QPushButton:checked:hover {{
                background: {Color.ACCENT_BG};
            }}
        """
    
    def _expanded_button_style(self) -> str:
        """展开状态下的按钮样式 - 左对齐显示图标+文字，增强悬停效果"""
        return f"""
            QPushButton {{
                text-align: left;
                padding: 0 {Spacing.LG}px;
                background: transparent;
                border: none;
                border-left: 3px solid transparent;
                border-radius: {Radius.MD}px;
                color: {Color.TEXT_SECONDARY};
            }}
            QPushButton:hover {{
                background: {Color.BG_HOVER};
                color: {Color.TEXT_PRIMARY};
                border-left: 3px solid {Color.BORDER_DARK};
            }}
            QPushButton:checked {{
                background: {Color.ACCENT_BG_HOVER};
                color: {Color.ACCENT};
                font-weight: {Typography.WEIGHT_SEMI};
                border-left: 3px solid {Color.ACCENT};
            }}
            QPushButton:checked:hover {{
                background: {Color.ACCENT_BG};
                border-left: 3px solid {Color.ACCENT_HOVER};
            }}
        """
    
    def _update_content_margins(self, horizontal: int, vertical: int):
        """更新内容区边距"""
        content_wrapper = self.content_area.parent()
        if content_wrapper:
            layout = content_wrapper.layout()
            if layout:
                layout.setContentsMargins(horizontal, vertical, horizontal, vertical)
    
    def _init_views(self):
        """初始化视图"""
        self.quiz_view = QuizView()
        self.exam_view = ExamView()
        self.wrong_view = WrongView()
        self.stats_view = StatsView()
        self.settings_view = SettingsView()
        
        self.content_area.addWidget(self.quiz_view)
        self.content_area.addWidget(self.exam_view)
        self.content_area.addWidget(self.wrong_view)
        self.content_area.addWidget(self.stats_view)
        self.content_area.addWidget(self.settings_view)
    
    def _on_nav_clicked(self, clicked_btn: SidebarButton):
        """导航点击处理"""
        # 取消所有按钮选中
        for btn in self.sidebar_buttons:
            btn.setChecked(False)
        
        # 选中当前按钮
        clicked_btn.setChecked(True)
        
        # 切换视图
        index = self.sidebar_buttons.index(clicked_btn)
        self.content_area.setCurrentIndex(index)


if __name__ == "__main__":
    import sys
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec())
