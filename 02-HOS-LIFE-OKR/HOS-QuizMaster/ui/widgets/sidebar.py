#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
侧边栏组件 - HOS-QuizMaster V2
使用统一设计系统
"""

from PyQt6.QtWidgets import (QWidget, QVBoxLayout, QPushButton, QLabel,
                              QFrame, QHBoxLayout)
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QColor
from PyQt6.QtSvg import QSvgRenderer
from PyQt6.QtGui import QPainter, QPixmap

from ui.design_tokens import Colors, Spacing, Radius, Typography


class Sidebar(QWidget):
    """可折叠的侧边栏导航"""

    # 导航项切换信号
    item_clicked = pyqtSignal(str)

    # SVG 图标定义 (Lucide Icons 风格)
    ICONS = {
        "quiz": """<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>""",
        "exam": """<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>""",
        "wrong": """<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>""",
        "stats": """<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>""",
        "settings": """<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>""",
        "collapse": """<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/></svg>"""
    }

    # 导航项定义
    NAV_ITEMS = [
        ("quiz", "刷题模式", "quiz"),
        ("exam", "模拟考试", "exam"),
        ("wrong", "错题本", "wrong"),
        ("stats", "数据统计", "stats"),
        ("settings", "设置", "settings"),
    ]

    def __init__(self, parent=None):
        super().__init__(parent)
        self.current_item = "quiz"
        self.buttons = {}
        self.icons = {}  # 缓存图标
        self.indicators = {}
        self.collapsed = False
        self.init_ui()

    def _create_svg_icon(self, icon_name: str, color: str = "currentColor") -> QLabel:
        """创建 SVG 图标"""
        svg_content = self.ICONS.get(icon_name, "")
        if color != "currentColor":
            svg_content = svg_content.replace('stroke="currentColor"', f'stroke="{color}"')
        
        label = QLabel()
        label.setFixedSize(20, 20)
        
        renderer = QSvgRenderer(svg_content.encode())
        pixmap = QPixmap(20, 20)
        pixmap.fill(Qt.GlobalColor.transparent)
        painter = QPainter(pixmap)
        renderer.render(painter)
        painter.end()
        
        label.setPixmap(pixmap)
        return label

    def init_ui(self):
        """初始化 UI - 使用设计令牌"""
        self.setObjectName("sidebar")
        self.setMinimumWidth(240)
        self.setMaximumWidth(280)
        
        # 应用侧边栏样式 - 使用设计令牌
        self.setStyleSheet(f"""
            QWidget#sidebar {{
                background-color: {Colors.BG_WHITE};
                border-right: 1px solid {Colors.BORDER_LIGHT};
            }}
        """)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(Spacing.LG, Spacing.XL, Spacing.LG, Spacing.LG)
        layout.setSpacing(Spacing.XS)

        # ===== Logo/标题区域 =====
        logo_container = QWidget()
        logo_container.setStyleSheet("background: transparent;")
        logo_layout = QHBoxLayout(logo_container)
        logo_layout.setContentsMargins(Spacing.SM, 0, 0, 0)
        logo_layout.setSpacing(Spacing.SM + 2)
        
        # Logo 图标 - 渐变背景
        logo_icon = QLabel("H")
        logo_icon.setFixedSize(32, 32)
        logo_icon.setAlignment(Qt.AlignmentFlag.AlignCenter)
        logo_icon.setStyleSheet(f"""
            background-color: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                stop:0 {Colors.PRIMARY}, stop:1 {Colors.PRIMARY_ACTIVE});
            color: {Colors.BG_WHITE};
            font-size: {Typography.SIZE_LG}px;
            font-weight: {Typography.WEIGHT_BOLD};
            border-radius: {Radius.LG}px;
        """)
        logo_layout.addWidget(logo_icon)
        
        # 标题文字
        title_container = QVBoxLayout()
        title_container.setSpacing(0)
        
        title = QLabel("HOS-QuizMaster")
        title.setStyleSheet(f"""
            font-size: {Typography.SIZE_LG + 1}px;
            font-weight: {Typography.WEIGHT_SEMI};
            color: {Colors.TEXT_PRIMARY};
            letter-spacing: -0.02em;
        """)
        title_container.addWidget(title)
        
        subtitle = QLabel("智能刷题助手")
        subtitle.setStyleSheet(f"""
            font-size: {Typography.SIZE_XS}px;
            color: {Colors.TEXT_SECONDARY};
            margin-top: 2px;
        """)
        title_container.addWidget(subtitle)
        
        logo_layout.addLayout(title_container)
        logo_layout.addStretch()
        
        layout.addWidget(logo_container)
        layout.addSpacing(Spacing.LG)

        # ===== 分区标题 =====
        section_label = QLabel("导航菜单")
        section_label.setStyleSheet(f"""
            font-size: {Typography.SIZE_XS}px;
            font-weight: {Typography.WEIGHT_SEMI};
            color: {Colors.TEXT_SECONDARY};
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 0 {Spacing.SM}px {Spacing.SM}px {Spacing.SM}px;
        """)
        layout.addWidget(section_label)

        # ===== 导航项 =====
        nav_container = QWidget()
        nav_container.setStyleSheet("background: transparent;")
        nav_layout = QVBoxLayout(nav_container)
        nav_layout.setContentsMargins(0, 0, 0, 0)
        nav_layout.setSpacing(2)
        
        for item_id, label, icon_name in self.NAV_ITEMS:
            btn_container = self._create_nav_item(item_id, label, icon_name)
            nav_layout.addWidget(btn_container)
            
        layout.addWidget(nav_container)
        layout.addStretch()

        # ===== 底部折叠按钮 =====
        collapse_container = QWidget()
        collapse_container.setStyleSheet(f"""
            QWidget {{
                background: transparent;
                border-top: 1px solid {Colors.BORDER_LIGHT};
                padding-top: {Spacing.MD}px;
            }}
        """)
        collapse_layout = QHBoxLayout(collapse_container)
        collapse_layout.setContentsMargins(Spacing.XS, 0, Spacing.XS, 0)
        
        collapse_btn = QPushButton()
        collapse_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        collapse_btn.setFixedSize(32, 32)
        collapse_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: transparent;
                border: 1px solid {Colors.BORDER_LIGHT};
                border-radius: {Radius.LG}px;
            }}
            QPushButton:hover {{
                background-color: {Colors.BG_LIGHT};
                border-color: {Colors.BORDER_DARK};
            }}
        """)
        
        # 设置图标
        icon_label = self._create_svg_icon("collapse", Colors.TEXT_SECONDARY)
        icon_label.setParent(collapse_btn)
        icon_label.move(6, 6)
        icon_label.setAttribute(Qt.WidgetAttribute.WA_TransparentForMouseEvents)
        
        collapse_btn.clicked.connect(self.toggle_collapse)
        collapse_layout.addWidget(collapse_btn)
        collapse_layout.addStretch()
        
        collapse_text = QLabel("收起菜单")
        collapse_text.setStyleSheet(f"font-size: {Typography.SIZE_SM}px; color: {Colors.TEXT_SECONDARY};")
        collapse_layout.addWidget(collapse_text)
        
        layout.addWidget(collapse_container)

        # 设置当前项
        self.set_current_item("quiz")

    def _create_nav_item(self, item_id: str, label: str, icon_name: str) -> QWidget:
        """创建导航项容器（包含按钮和指示条）- 使用设计令牌"""
        container = QWidget()
        container.setStyleSheet("background: transparent;")
        container_layout = QHBoxLayout(container)
        container_layout.setContentsMargins(0, 0, 0, 0)
        container_layout.setSpacing(0)
        
        # 活跃指示条
        indicator = QFrame()
        indicator.setFixedSize(3, 24)
        indicator.setStyleSheet(f"background-color: transparent; border-radius: {Radius.SM // 2}px;")
        container_layout.addWidget(indicator)
        self.indicators[item_id] = indicator
        
        # 导航按钮
        btn = QPushButton()
        btn.setProperty("item_id", item_id)
        btn.setCursor(Qt.CursorShape.PointingHandCursor)
        btn.setFixedHeight(40)
        btn.setStyleSheet(f"""
            QPushButton {{
                background-color: transparent;
                border: none;
                border-radius: {Radius.LG}px;
                padding: 0 {Spacing.MD}px;
                text-align: left;
            }}
            QPushButton:hover {{
                background-color: {Colors.BG_LIGHT};
            }}
        """)
        
        # 按钮内容布局
        btn_layout = QHBoxLayout(btn)
        btn_layout.setContentsMargins(Spacing.SM, 0, Spacing.MD, 0)
        btn_layout.setSpacing(Spacing.MD)
        
        # 图标 - 缓存
        icon = self._create_svg_icon(icon_name, Colors.TEXT_REGULAR)
        icon.setAttribute(Qt.WidgetAttribute.WA_TransparentForMouseEvents)
        btn_layout.addWidget(icon)
        self.icons[item_id] = {"icon": icon, "icon_name": icon_name}
        
        # 文字
        text_label = QLabel(label)
        text_label.setStyleSheet(f"""
            font-size: {Typography.SIZE_MD}px;
            font-weight: {Typography.WEIGHT_MEDIUM};
            color: {Colors.TEXT_REGULAR};
        """)
        text_label.setAttribute(Qt.WidgetAttribute.WA_TransparentForMouseEvents)
        btn_layout.addWidget(text_label)
        
        btn_layout.addStretch()
        
        # 存储引用以便更新样式
        btn._icon_label = icon
        btn._text_label = text_label
        
        btn.clicked.connect(lambda: self._on_item_clicked(item_id))
        container_layout.addWidget(btn, stretch=1)
        
        self.buttons[item_id] = btn
        
        return container

    def _on_item_clicked(self, item_id: str):
        """导航项点击处理"""
        self.set_current_item(item_id)
        self.item_clicked.emit(item_id)

    def set_current_item(self, item_id: str):
        """设置当前选中项 - 使用设计令牌，优化性能"""
        self.current_item = item_id
        
        for key, btn in self.buttons.items():
            indicator = self.indicators[key]
            text_label = btn._text_label
            icon_name = self.icons[key]["icon_name"]
            
            if key == item_id:
                # 活跃状态 - 使用设计令牌
                indicator.setStyleSheet(f"background-color: {Colors.PRIMARY}; border-radius: {Radius.SM // 2}px;")
                btn.setStyleSheet(f"""
                    QPushButton {{
                        background-color: {Colors.PRIMARY_BG};
                        border: none;
                        border-radius: {Radius.LG}px;
                        padding: 0 {Spacing.MD}px;
                        text-align: left;
                    }}
                    QPushButton:hover {{
                        background-color: #bae0ff;
                    }}
                """)
                # 更新图标颜色
                new_icon = self._create_svg_icon(icon_name, Colors.PRIMARY)
                btn_layout = btn.layout()
                old_icon = btn_layout.itemAt(0).widget()
                btn_layout.replaceWidget(old_icon, new_icon)
                old_icon.deleteLater()
                btn._icon_label = new_icon
                self.icons[key]["icon"] = new_icon
                
                text_label.setStyleSheet(f"""
                    font-size: {Typography.SIZE_MD}px;
                    font-weight: {Typography.WEIGHT_SEMI};
                    color: {Colors.PRIMARY};
                """)
            else:
                # 非活跃状态 - 使用设计令牌
                indicator.setStyleSheet(f"background-color: transparent; border-radius: {Radius.SM // 2}px;")
                btn.setStyleSheet(f"""
                    QPushButton {{
                        background-color: transparent;
                        border: none;
                        border-radius: {Radius.LG}px;
                        padding: 0 {Spacing.MD}px;
                        text-align: left;
                    }}
                    QPushButton:hover {{
                        background-color: {Colors.BG_LIGHT};
                    }}
                """)
                # 更新图标颜色
                new_icon = self._create_svg_icon(icon_name, Colors.TEXT_REGULAR)
                btn_layout = btn.layout()
                old_icon = btn_layout.itemAt(0).widget()
                btn_layout.replaceWidget(old_icon, new_icon)
                old_icon.deleteLater()
                btn._icon_label = new_icon
                self.icons[key]["icon"] = new_icon
                
                text_label.setStyleSheet(f"""
                    font-size: {Typography.SIZE_MD}px;
                    font-weight: {Typography.WEIGHT_MEDIUM};
                    color: {Colors.TEXT_REGULAR};
                """)

    def toggle_collapse(self):
        """切换折叠状态"""
        self.collapsed = not self.collapsed
        if self.collapsed:
            self.setMinimumWidth(64)
            self.setMaximumWidth(64)
            # 隐藏文字和指示条，只显示图标
            for btn in self.buttons.values():
                btn._text_label.setVisible(False)
                btn._icon_label.setVisible(True)
            for indicator in self.indicators.values():
                indicator.setVisible(False)
        else:
            self.setMinimumWidth(240)
            self.setMaximumWidth(280)
            # 恢复文字和指示条
            for btn in self.buttons.values():
                btn._text_label.setVisible(True)
            for indicator in self.indicators.values():
                indicator.setVisible(True)

    def get_current_item(self) -> str:
        """获取当前选中项"""
        return self.current_item
