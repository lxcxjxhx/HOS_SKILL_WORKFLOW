#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
底部导航栏组件 - HOS-QuizMaster V2
使用统一设计系统
"""

from PyQt6.QtWidgets import (QWidget, QHBoxLayout, QVBoxLayout, QPushButton, QLabel,
                              QLineEdit, QProgressBar, QFrame, QComboBox,
                              QSizePolicy)
from PyQt6.QtCore import (Qt, pyqtSignal, QTimer, QRectF)
from PyQt6.QtGui import QColor, QPainter, QPen, QFont, QPaintEvent
from PyQt6.QtSvg import QSvgRenderer

from ui.design_tokens import Colors, Spacing, Radius, Typography


# SVG 图标定义 (Lucide Icons 风格)
ICONS = {
    "chevron_left": """<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>""",
    "chevron_right": """<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>""",
    "arrow_right": """<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>""",
    "clock": """<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>""",
    "filter": """<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>""",
    "shuffle": """<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>""",
    "book": """<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>""",
    "keyboard": """<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"/><line x1="6" y1="8" x2="6" y2="8"/><line x1="10" y1="8" x2="10" y2="8"/><line x1="14" y1="8" x2="14" y2="8"/><line x1="18" y1="8" x2="18" y2="8"/><line x1="8" y1="12" x2="8" y2="12"/><line x1="12" y1="12" x2="12" y2="12"/><line x1="16" y1="12" x2="16" y2="12"/><line x1="7" y1="16" x2="17" y2="16"/></svg>""",
}


class ProgressRing(QWidget):
    """圆形进度指示器"""

    def __init__(self, size: int = 36, stroke_width: int = 3, parent=None):
        super().__init__(parent)
        self._size = size
        self._stroke_width = stroke_width
        self._progress = 0.0  # 0.0 ~ 1.0
        self._track_color = "#e5e7eb"
        self._fill_color = "#1677ff"
        self._text_color = "#262626"
        self.setFixedSize(size, size)

    def set_progress(self, value: float):
        """设置进度 (0.0 ~ 1.0)"""
        self._progress = max(0.0, min(1.0, value))
        self.update()

    def set_colors(self, track: str = None, fill: str = None, text: str = None):
        if track:
            self._track_color = track
        if fill:
            self._fill_color = fill
        if text:
            self._text_color = text
        self.update()

    def paintEvent(self, event: QPaintEvent):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)

        center_x = self._size / 2
        center_y = self._size / 2
        radius = (self._size - self._stroke_width) / 2 - 1

        # 背景轨道
        pen_track = QPen(QColor(self._track_color))
        pen_track.setWidth(self._stroke_width)
        pen_track.setCapStyle(Qt.PenCapStyle.RoundCap)
        painter.setPen(pen_track)
        rect = QRectF(
            center_x - radius, center_y - radius,
            radius * 2, radius * 2
        )
        painter.drawArc(rect, 0, 360 * 16)

        # 进度弧
        if self._progress > 0:
            pen_fill = QPen(QColor(self._fill_color))
            pen_fill.setWidth(self._stroke_width)
            pen_fill.setCapStyle(Qt.PenCapStyle.RoundCap)
            painter.setPen(pen_fill)
            span_angle = int(-self._progress * 360 * 16)
            painter.drawArc(rect, 90 * 16, span_angle)

        # 中心文字 (百分比)
        pct_text = f"{int(self._progress * 100)}%"
        painter.setPen(QColor(self._text_color))
        font = QFont("Inter", 8, QFont.Weight.Bold)
        painter.setFont(font)
        painter.drawText(self.rect(), Qt.AlignmentFlag.AlignCenter, pct_text)

        painter.end()


from PyQt6.QtCore import QRectF


class NavBar(QWidget):
    """底部导航栏 - 大厂级视觉设计"""

    # 信号
    prev_clicked = pyqtSignal()
    next_clicked = pyqtSignal()
    question_changed = pyqtSignal(int)
    mode_changed = pyqtSignal(str)
    type_filter_changed = pyqtSignal(str)
    jump_requested = pyqtSignal(int)

    def __init__(self, parent=None):
        super().__init__(parent)
        self._total = 0
        self._answered = 0
        self._timer_seconds = 0
        self._timer_running = False
        self.init_ui()

    def init_ui(self):
        """初始化 UI - 使用设计令牌"""
        self.setObjectName("bottomNav")
        self.setStyleSheet(f"""
            QWidget#bottomNav {{
                background-color: {Colors.BG_WHITE};
                border-top: 1px solid {Colors.BORDER_LIGHT};
            }}
        """)

        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(Spacing.XL, Spacing.SM, Spacing.XL, Spacing.SM + 2)
        main_layout.setSpacing(Spacing.SM - 2)

        # ===== 第一行：核心导航 =====
        row1 = QHBoxLayout()
        row1.setSpacing(10)

        # 上一题按钮 (图标化)
        self.btn_prev = self._create_icon_btn("← 上一题", "chevron_left")
        self.btn_prev.clicked.connect(self.prev_clicked.emit)
        self.btn_prev.setEnabled(False)
        row1.addWidget(self.btn_prev)

        # 进度环 + 位置指示
        progress_group = QHBoxLayout()
        progress_group.setSpacing(10)

        self.progress_ring = ProgressRing(size=36, stroke_width=3)
        progress_group.addWidget(self.progress_ring)

        # 位置标签
        self.position_label = QLabel("0 / 0")
        self.position_label.setStyleSheet(f"""
            font-size: {Typography.SIZE_LG}px;
            font-weight: {Typography.WEIGHT_SEMI};
            color: {Colors.PRIMARY};
            letter-spacing: -0.01em;
        """)
        progress_group.addWidget(self.position_label)

        # 进度条 (细长型)
        self.progress_bar = QProgressBar()
        self.progress_bar.setStyleSheet(f"""
            QProgressBar {{
                background-color: {Colors.BORDER_LIGHT};
                border: none;
                border-radius: 2px;
                text-align: center;
                font-size: 0px;
                max-height: 4px;
                min-height: 4px;
            }}
            QProgressBar::chunk {{
                background-color: qlineargradient(
                    x1:0, y1:0, x2:1, y2:0,
                    x1start:0, x1end:1,
                    y1start:0, y1end:0,
                    stop:0 {Colors.PRIMARY}, stop:1 {Colors.PRIMARY_HOVER}
                );
                border-radius: 2px;
            }}
        """)
        self.progress_bar.setFixedHeight(4)
        self.progress_bar.setTextVisible(False)
        progress_group.addWidget(self.progress_bar, stretch=1)

        # 已答统计
        self.answered_label = QLabel("已答 0")
        self.answered_label.setStyleSheet(f"""
            font-size: {Typography.SIZE_XS}px;
            color: {Colors.TEXT_SECONDARY};
            font-weight: {Typography.WEIGHT_MEDIUM};
        """)
        progress_group.addWidget(self.answered_label)

        row1.addLayout(progress_group, stretch=1)

        # 计时器 (图标 + 文字)
        timer_container = QHBoxLayout()
        timer_container.setSpacing(Spacing.XS)
        self.timer_icon = self._create_svg_label(ICONS["clock"], Colors.TEXT_SECONDARY, 14)
        timer_container.addWidget(self.timer_icon)
        self.timer_label = QLabel("00:00")
        self.timer_label.setStyleSheet(f"""
            font-size: {Typography.SIZE_MD}px;
            font-weight: {Typography.WEIGHT_SEMI};
            color: {Colors.TEXT_REGULAR};
            font-family: "JetBrains Mono", "SF Mono", "Consolas", monospace;
            letter-spacing: 0.02em;
        """)
        self.timer_label.setToolTip("计时器")
        timer_container.addWidget(self.timer_label)

        timer_widget = QWidget()
        timer_widget.setLayout(timer_container)
        timer_widget.setStyleSheet(f"""
            QWidget {{
                background-color: {Colors.BG_GRAY};
                border: 1px solid {Colors.BORDER_LIGHT};
                border-radius: {Radius.LG}px;
                padding: {Spacing.XS}px {Spacing.SM + 2}px;
            }}
        """)
        row1.addWidget(timer_widget)

        # 跳转输入
        jump_container = QHBoxLayout()
        jump_container.setSpacing(Spacing.XS)
        jump_container.setContentsMargins(Spacing.SM - 2, 2, Spacing.SM - 2, 2)

        self.jump_input = QLineEdit()
        self.jump_input.setPlaceholderText("跳转")
        self.jump_input.setFixedWidth(52)
        self.jump_input.setFixedHeight(28)
        self.jump_input.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.jump_input.setStyleSheet(f"""
            QLineEdit {{
                background-color: {Colors.BG_GRAY};
                border: 1px solid {Colors.BORDER_REGULAR};
                border-radius: {Radius.MD}px;
                padding: 2px {Spacing.SM - 2}px;
                font-size: {Typography.SIZE_SM}px;
                color: {Colors.TEXT_PRIMARY};
                font-weight: {Typography.WEIGHT_MEDIUM};
            }}
            QLineEdit:focus {{
                border-color: {Colors.PRIMARY};
                background-color: {Colors.BG_WHITE};
            }}
            QLineEdit::placeholder {{
                color: {Colors.TEXT_DISABLED};
            }}
        """)
        self.jump_input.returnPressed.connect(self._on_jump)
        jump_container.addWidget(self.jump_input)

        self.jump_btn = QPushButton("Go")
        self.jump_btn.setFixedSize(32, 28)
        self.jump_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.jump_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {Colors.PRIMARY};
                color: {Colors.BG_WHITE};
                border: none;
                border-radius: {Radius.MD}px;
                font-size: {Typography.SIZE_XS}px;
                font-weight: {Typography.WEIGHT_SEMI};
                letter-spacing: 0.02em;
            }}
            QPushButton:hover {{ background-color: {Colors.PRIMARY_HOVER}; }}
            QPushButton:pressed {{ background-color: {Colors.PRIMARY_ACTIVE}; }}
        """)
        self.jump_btn.clicked.connect(self._on_jump)
        jump_container.addWidget(self.jump_btn)

        jump_widget = QWidget()
        jump_widget.setLayout(jump_container)
        jump_widget.setStyleSheet("background: transparent;")
        row1.addWidget(jump_widget)

        # 下一题按钮 (图标化)
        self.btn_next = self._create_icon_btn("下一题 →", "chevron_right", primary=True)
        self.btn_next.clicked.connect(self.next_clicked.emit)
        self.btn_next.setEnabled(False)
        row1.addWidget(self.btn_next)

        main_layout.addLayout(row1)

        # ===== 第二行：筛选 + 模式 + 快捷键 =====
        row2 = QHBoxLayout()
        row2.setSpacing(Spacing.MD)

        # 题型筛选 (图标 + 下拉)
        filter_group = QHBoxLayout()
        filter_group.setSpacing(Spacing.SM - 2)
        filter_icon = self._create_svg_label(ICONS["filter"], Colors.TEXT_SECONDARY, 14)
        filter_group.addWidget(filter_icon)

        self.type_filter = self._create_styled_combo()
        self.type_filter.addItem("全部题型", "all")
        self.type_filter.addItem("单选题", "单选题")
        self.type_filter.addItem("多选题", "多选题")
        self.type_filter.addItem("判断题", "判断题")
        self.type_filter.currentIndexChanged.connect(self._on_type_filter_changed)
        filter_group.addWidget(self.type_filter)

        filter_widget = QWidget()
        filter_widget.setLayout(filter_group)
        filter_widget.setStyleSheet(f"""
            QWidget {{
                background-color: {Colors.BG_GRAY};
                border: 1px solid {Colors.BORDER_LIGHT};
                border-radius: {Radius.LG}px;
                padding: 2px {Spacing.SM + 2}px;
            }}
        """)
        row2.addWidget(filter_widget)

        # 模式切换 (图标 + 下拉)
        mode_group = QHBoxLayout()
        mode_group.setSpacing(Spacing.SM - 2)
        self.mode_icon = self._create_svg_label(ICONS["book"], Colors.TEXT_SECONDARY, 14)
        mode_group.addWidget(self.mode_icon)

        self.mode_combo = self._create_styled_combo()
        self.mode_combo.addItem("顺序", "sequential")
        self.mode_combo.addItem("随机", "random")
        self.mode_combo.addItem("背题", "memorize")
        self.mode_combo.addItem("测试", "test")
        self.mode_combo.addItem("错题", "wrong")
        self.mode_combo.currentIndexChanged.connect(self._on_mode_changed)
        mode_group.addWidget(self.mode_combo)

        mode_widget = QWidget()
        mode_widget.setLayout(mode_group)
        mode_widget.setStyleSheet(f"""
            QWidget {{
                background-color: {Colors.BG_GRAY};
                border: 1px solid {Colors.BORDER_LIGHT};
                border-radius: {Radius.LG}px;
                padding: 2px {Spacing.SM + 2}px;
            }}
        """)
        row2.addWidget(mode_widget)

        row2.addStretch()

        # 快捷键提示 (图标 + 文字)
        shortcuts_group = QHBoxLayout()
        shortcuts_group.setSpacing(Spacing.XS)
        kb_icon = self._create_svg_label(ICONS["keyboard"], Colors.TEXT_DISABLED, 12)
        shortcuts_group.addWidget(kb_icon)
        shortcuts_label = QLabel("← → 导航 · A-E 选择 · Ctrl+O 导入")
        shortcuts_label.setStyleSheet(f"""
            font-size: {Typography.SIZE_XS}px;
            color: {Colors.TEXT_DISABLED};
            font-weight: {Typography.WEIGHT_REGULAR};
        """)
        shortcuts_group.addWidget(shortcuts_label)
        shortcuts_widget = QWidget()
        shortcuts_widget.setLayout(shortcuts_group)
        shortcuts_widget.setStyleSheet("background: transparent;")
        row2.addWidget(shortcuts_widget)

        main_layout.addLayout(row2)

        # 计时器
        self._timer = QTimer()
        self._timer.setInterval(1000)
        self._timer.timeout.connect(self._on_timer_tick)

    def _create_icon_btn(self, text: str, icon_name: str, primary: bool = False) -> QPushButton:
        """创建带图标的导航按钮 - 使用设计令牌"""
        btn = QPushButton(text)
        btn.setCursor(Qt.CursorShape.PointingHandCursor)
        btn.setFixedHeight(32)
        btn.setMinimumWidth(90)

        if primary:
            btn.setStyleSheet(f"""
                QPushButton {{
                    background-color: {Colors.PRIMARY};
                    color: {Colors.BG_WHITE};
                    border: none;
                    border-radius: {Radius.LG}px;
                    padding: 0 {Spacing.LG}px;
                    font-size: {Typography.SIZE_MD}px;
                    font-weight: {Typography.WEIGHT_SEMI};
                    letter-spacing: -0.01em;
                }}
                QPushButton:hover {{ background-color: {Colors.PRIMARY_HOVER}; }}
                QPushButton:pressed {{ background-color: {Colors.PRIMARY_ACTIVE}; }}
                QPushButton:disabled {{
                    background-color: {Colors.BG_LIGHT};
                    color: {Colors.TEXT_DISABLED};
                }}
            """)
        else:
            btn.setStyleSheet(f"""
                QPushButton {{
                    background-color: {Colors.BG_WHITE};
                    color: {Colors.TEXT_PRIMARY};
                    border: 1px solid {Colors.BORDER_REGULAR};
                    border-radius: {Radius.LG}px;
                    padding: 0 {Spacing.LG}px;
                    font-size: {Typography.SIZE_MD}px;
                    font-weight: {Typography.WEIGHT_MEDIUM};
                    letter-spacing: -0.01em;
                }}
                QPushButton:hover {{
                    background-color: {Colors.BG_GRAY};
                    border-color: {Colors.BORDER_DARK};
                    color: {Colors.PRIMARY};
                }}
                QPushButton:pressed {{ background-color: {Colors.BG_LIGHT}; }}
                QPushButton:disabled {{
                    background-color: {Colors.BG_GRAY};
                    border-color: {Colors.BORDER_LIGHT};
                    color: {Colors.TEXT_DISABLED};
                }}
            """)

        return btn

    def _create_styled_combo(self) -> QComboBox:
        """创建统一下拉框样式"""
        combo = QComboBox()
        combo.setFixedHeight(26)
        combo.setMinimumWidth(80)
        combo.setSizePolicy(QSizePolicy.Policy.Preferred, QSizePolicy.Policy.Fixed)
        combo.setStyleSheet("""
            QComboBox {
                background-color: transparent;
                border: none;
                padding: 0 4px;
                font-size: 12px;
                color: #374151;
                font-weight: 500;
            }
            QComboBox:hover { color: #1677ff; }
            QComboBox::drop-down {
                border: none;
                width: 16px;
                subcontrol-origin: margin;
                subcontrol-position: center right;
            }
            QComboBox::down-arrow {
                image: none;
                border-left: 3px solid transparent;
                border-right: 3px solid transparent;
                border-top: 4px solid #8c8c8c;
                margin-right: 4px;
            }
            QComboBox QAbstractItemView {
                background-color: #ffffff;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                selection-background-color: #e6f4ff;
                selection-color: #1677ff;
                padding: 4px;
                outline: none;
            }
            QComboBox QAbstractItemView::item {
                padding: 6px 8px;
                border-radius: 4px;
                font-size: 12px;
            }
            QComboBox QAbstractItemView::item:hover {
                background-color: #f5f5f5;
            }
        """)
        return combo

    def _create_svg_label(self, svg_content: str, color: str, size: int = 14) -> QLabel:
        """创建 SVG 图标标签"""
        svg_colored = svg_content.replace('currentColor', color)
        renderer = QSvgRenderer(svg_colored.encode('utf-8'))
        from PyQt6.QtGui import QPixmap
        pixmap = QPixmap(size, size)
        pixmap.fill(Qt.GlobalColor.transparent)
        painter = QPainter(pixmap)
        renderer.render(painter)
        painter.end()

        label = QLabel()
        label.setPixmap(pixmap)
        label.setFixedSize(size, size)
        return label

    def _on_jump(self):
        """跳转处理"""
        text = self.jump_input.text().strip()
        if text and text.isdigit():
            q_num = int(text)
            if 1 <= q_num <= max(1, self._total):
                self.jump_requested.emit(q_num - 1)
                self.jump_input.clear()

    def _on_type_filter_changed(self, index: int):
        """题型筛选变更"""
        q_type = self.type_filter.itemData(index)
        self.type_filter_changed.emit(q_type)

    def _on_mode_changed(self, index: int):
        """模式变更"""
        mode = self.mode_combo.itemData(index)
        # 更新模式图标
        mode_icons = {
            "sequential": "book",
            "random": "shuffle",
        }
        icon_name = mode_icons.get(mode, "book")
        self.mode_changed.emit(mode)

    def _on_timer_tick(self):
        """计时器 tick"""
        self._timer_seconds += 1
        minutes = self._timer_seconds // 60
        seconds = self._timer_seconds % 60
        self.timer_label.setText(f"{minutes:02d}:{seconds:02d}")

    def start_timer(self):
        """启动计时器"""
        self._timer_seconds = 0
        self._timer_running = True
        self._timer.start()
        self.timer_label.setStyleSheet("""
            font-size: 13px;
            font-weight: 600;
            color: #52c41a;
            font-family: "JetBrains Mono", "SF Mono", "Consolas", monospace;
            letter-spacing: 0.02em;
        """)
        self.progress_ring.set_colors(fill="#52c41a")

    def stop_timer(self):
        """停止计时器"""
        self._timer_running = False
        self._timer.stop()
        self.timer_label.setStyleSheet("""
            font-size: 13px;
            font-weight: 600;
            color: #595959;
            font-family: "JetBrains Mono", "SF Mono", "Consolas", monospace;
            letter-spacing: 0.02em;
        """)
        self.progress_ring.set_colors(fill="#1677ff")

    def reset_timer(self):
        """重置计时器"""
        self.stop_timer()
        self._timer_seconds = 0
        self.timer_label.setText("00:00")

    def set_total(self, total: int):
        """设置总题数"""
        self._total = total
        self.progress_bar.setMaximum(max(1, total))
        self.progress_bar.setValue(0)
        self.progress_ring.set_progress(0.0)
        self._update_position(0, total)

    def set_current(self, current: int, total: int):
        """设置当前题号"""
        self._total = total
        self._update_position(current + 1, total)

        # 更新按钮状态
        self.btn_prev.setEnabled(current > 0)
        self.btn_next.setEnabled(current < total - 1)

        # 更新跳转输入的最大值提示
        self.jump_input.setPlaceholderText(f"1-{total}")

    def set_answered_count(self, answered: int):
        """设置已答题数"""
        self._answered = answered
        self.progress_bar.setValue(answered)
        self.answered_label.setText(f"已答 {answered}")

        # 更新进度环
        if self._total > 0:
            self.progress_ring.set_progress(answered / self._total)

    def _update_position(self, current: int, total: int):
        """更新位置显示"""
        self.position_label.setText(f"{current} / {total}")

    def set_mode(self, mode: str):
        """设置模式"""
        mode_map = {
            "sequential": 0,
            "random": 1,
            "memorize": 2,
            "test": 3,
            "wrong": 4,
        }
        index = mode_map.get(mode, 0)
        self.mode_combo.blockSignals(True)
        self.mode_combo.setCurrentIndex(index)
        self.mode_combo.blockSignals(False)

    def set_type_filter(self, q_type: str):
        """设置题型筛选"""
        type_map = {
            "all": 0,
            "单选题": 1,
            "多选题": 2,
            "判断题": 3,
        }
        index = type_map.get(q_type, 0)
        self.type_filter.blockSignals(True)
        self.type_filter.setCurrentIndex(index)
        self.type_filter.blockSignals(False)

    def get_current_question(self) -> int:
        """获取当前题号（0-based）"""
        text = self.position_label.text()
        try:
            parts = text.split("/")
            current = int(parts[0].strip())
            return current - 1
        except (ValueError, IndexError):
            return 0

    def get_mode(self) -> str:
        """获取当前模式"""
        return self.mode_combo.currentData()

    def get_type_filter(self) -> str:
        """获取当前题型筛选"""
        return self.type_filter.currentData()
