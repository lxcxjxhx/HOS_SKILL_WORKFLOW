#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
主题系统 - HOS-QuizMaster V2
现代设计系统 - 参考 Ant Design 5.x / Linear / Vercel
"""

from typing import List


class ThemeManager:
    """主题管理器"""

    LIGHT_THEME = """
    /* ===== 全局基础 ===== */
    QMainWindow, QWidget {
        background-color: #fafafa;
        color: #262626;
        font-family: "Inter", "SF Pro Display", "Microsoft YaHei", "Segoe UI", system-ui, sans-serif;
        font-size: 13px;
        font-weight: 400;
        letter-spacing: -0.01em;
    }

    /* ===== 菜单栏 ===== */
    QMenuBar {
        background-color: #ffffff;
        color: #262626;
        border-bottom: 1px solid #f0f0f0;
        padding: 0px;
        font-size: 13px;
        font-weight: 500;
    }
    QMenuBar::item {
        background: transparent;
        padding: 8px 14px;
        border-radius: 6px;
        margin: 4px 2px;
        color: #595959;
    }
    QMenuBar::item:selected {
        background-color: #f5f5f5;
        color: #262626;
    }
    QMenuBar::item:pressed {
        background-color: #e6f4ff;
        color: #1677ff;
    }
    QMenu {
        background-color: #ffffff;
        border: 1px solid #f0f0f0;
        border-radius: 10px;
        padding: 6px;
    }
    QMenu::item {
        padding: 8px 32px 8px 12px;
        border-radius: 6px;
        margin: 2px 0px;
        color: #262626;
        font-size: 13px;
    }
    QMenu::item:selected {
        background-color: #f5f5f5;
        color: #262626;
    }
    QMenu::item:disabled {
        color: #bfbfbf;
    }
    QMenu::separator {
        height: 1px;
        background-color: #f0f0f0;
        margin: 4px 8px;
    }
    QMenu::indicator {
        width: 16px;
        height: 16px;
        margin-left: 6px;
    }
    QMenu::indicator:checked {
        image: none;
        background-color: #1677ff;
        border: 2px solid #1677ff;
        border-radius: 4px;
    }

    /* ===== 工具栏 ===== */
    QToolBar {
        background-color: #ffffff;
        border-bottom: 1px solid #f0f0f0;
        padding: 6px 12px;
        spacing: 6px;
    }
    QToolBar QToolButton {
        background-color: transparent;
        border: 1px solid transparent;
        border-radius: 8px;
        padding: 6px 14px;
        color: #595959;
        font-size: 13px;
        font-weight: 500;
    }
    QToolBar QToolButton:hover {
        background-color: #f5f5f5;
        color: #262626;
    }
    QToolBar QToolButton:pressed {
        background-color: #e6f4ff;
        color: #1677ff;
    }

    /* ===== 状态栏 ===== */
    QStatusBar {
        background-color: #ffffff;
        color: #8c8c8c;
        border-top: 1px solid #f0f0f0;
        font-size: 12px;
        padding: 6px 12px;
    }
    QStatusBar::item {
        border: none;
    }

    /* ===== 按钮基础 ===== */
    QPushButton {
        background-color: #ffffff;
        color: #262626;
        border: 1px solid #d9d9d9;
        border-radius: 8px;
        padding: 7px 16px;
        font-size: 13px;
        font-weight: 500;
        min-height: 22px;
    }
    QPushButton:hover {
        background-color: #ffffff;
        border-color: #4096ff;
        color: #4096ff;
    }
    QPushButton:pressed {
        background-color: #f5f5f5;
        border-color: #0958d9;
        color: #0958d9;
    }
    QPushButton:disabled {
        background-color: #f5f5f5;
        color: #bfbfbf;
        border-color: #d9d9d9;
    }

    /* 主要按钮 */
    QPushButton#primaryBtn {
        background-color: #1677ff;
        color: #ffffff;
        border: 1px solid #1677ff;
        font-weight: 600;
    }
    QPushButton#primaryBtn:hover {
        background-color: #4096ff;
        border-color: #4096ff;
        color: #ffffff;
    }
    QPushButton#primaryBtn:pressed {
        background-color: #0958d9;
        border-color: #0958d9;
    }
    QPushButton#primaryBtn:disabled {
        background-color: #bae0ff;
        border-color: transparent;
        color: #ffffff;
    }

    /* 成功按钮 */
    QPushButton#successBtn {
        background-color: #52c41a;
        color: #ffffff;
        border: 1px solid #52c41a;
    }
    QPushButton#successBtn:hover {
        background-color: #95de64;
        border-color: #95de64;
    }
    QPushButton#successBtn:pressed {
        background-color: #389e0d;
        border-color: #389e0d;
    }

    /* 危险按钮 */
    QPushButton#dangerBtn {
        background-color: #ff4d4f;
        color: #ffffff;
        border: 1px solid #ff4d4f;
    }
    QPushButton#dangerBtn:hover {
        background-color: #ff7875;
        border-color: #ff7875;
    }
    QPushButton#dangerBtn:pressed {
        background-color: #d9363e;
        border-color: #d9363e;
    }

    /* 文字按钮 / 链接按钮 */
    QPushButton#flatBtn {
        background-color: transparent;
        border: none;
        color: #1677ff;
        padding: 6px 12px;
        font-weight: 500;
    }
    QPushButton#flatBtn:hover {
        background-color: #e6f4ff;
        color: #4096ff;
    }
    QPushButton#flatBtn:pressed {
        background-color: #bae0ff;
        color: #0958d9;
    }

    /* 幽灵按钮 */
    QPushButton#ghostBtn {
        background-color: transparent;
        border: 1px solid #d9d9d9;
        color: #595959;
    }
    QPushButton#ghostBtn:hover {
        border-color: #1677ff;
        color: #1677ff;
    }

    /* ===== 卡片容器 ===== */
    QFrame#card {
        background-color: #ffffff;
        border: 1px solid #f0f0f0;
        border-radius: 12px;
    }
    QFrame#cardHover {
        background-color: #ffffff;
        border: 1px solid #f0f0f0;
        border-radius: 12px;
    }
    QFrame#cardHover:hover {
        border-color: #d9d9d9;
    }

    /* ===== 滚动条 ===== */
    QScrollArea {
        border: none;
        background-color: transparent;
    }
    QScrollBar:vertical {
        background-color: transparent;
        width: 6px;
        margin: 8px 4px;
        border-radius: 3px;
    }
    QScrollBar::handle:vertical {
        background-color: #d9d9d9;
        border-radius: 3px;
        min-height: 24px;
    }
    QScrollBar::handle:vertical:hover {
        background-color: #bfbfbf;
    }
    QScrollBar::handle:vertical:pressed {
        background-color: #8c8c8c;
    }
    QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {
        height: 0px;
    }
    QScrollBar::add-page:vertical, QScrollBar::sub-page:vertical {
        background: transparent;
    }
    QScrollBar:horizontal {
        background-color: transparent;
        height: 6px;
        margin: 4px 8px;
        border-radius: 3px;
    }
    QScrollBar::handle:horizontal {
        background-color: #d9d9d9;
        border-radius: 3px;
        min-width: 24px;
    }
    QScrollBar::handle:horizontal:hover {
        background-color: #bfbfbf;
    }
    QScrollBar::handle:horizontal:pressed {
        background-color: #8c8c8c;
    }
    QScrollBar::add-line:horizontal, QScrollBar::sub-line:horizontal {
        width: 0px;
    }
    QScrollBar::add-page:horizontal, QScrollBar::sub-page:horizontal {
        background: transparent;
    }

    /* ===== 单选按钮 ===== */
    QRadioButton {
        spacing: 8px;
        color: #262626;
        font-size: 13px;
        padding: 6px 0px;
    }
    QRadioButton::indicator {
        width: 16px;
        height: 16px;
        border: 2px solid #d9d9d9;
        border-radius: 9px;
        background-color: #ffffff;
    }
    QRadioButton::indicator:hover {
        border-color: #1677ff;
    }
    QRadioButton::indicator:checked {
        border: 5px solid #1677ff;
        background-color: #ffffff;
    }
    QRadioButton::indicator:checked:hover {
        border-color: #4096ff;
    }
    QRadioButton::indicator:disabled {
        border-color: #d9d9d9;
        background-color: #f5f5f5;
    }

    /* ===== 复选框 ===== */
    QCheckBox {
        spacing: 8px;
        color: #262626;
        font-size: 13px;
        padding: 4px 0px;
    }
    QCheckBox::indicator {
        width: 16px;
        height: 16px;
        border: 2px solid #d9d9d9;
        border-radius: 4px;
        background-color: #ffffff;
    }
    QCheckBox::indicator:hover {
        border-color: #1677ff;
    }
    QCheckBox::indicator:checked {
        background-color: #1677ff;
        border-color: #1677ff;
    }
    QCheckBox::indicator:checked:hover {
        background-color: #4096ff;
        border-color: #4096ff;
    }
    QCheckBox::indicator:disabled {
        background-color: #f5f5f5;
        border-color: #d9d9d9;
    }

    /* ===== 进度条 ===== */
    QProgressBar {
        background-color: #f0f0f0;
        border: none;
        border-radius: 4px;
        text-align: center;
        font-size: 0px;
    }
    QProgressBar::chunk {
        background-color: #1677ff;
        border-radius: 4px;
    }

    /* ===== SpinBox ===== */
    QSpinBox {
        background-color: #ffffff;
        border: 1px solid #d9d9d9;
        border-radius: 8px;
        padding: 6px 10px;
        color: #262626;
        font-size: 13px;
        min-height: 22px;
    }
    QSpinBox:hover {
        border-color: #4096ff;
    }
    QSpinBox:focus {
        border-color: #1677ff;
    }
    QSpinBox::up-button, QSpinBox::down-button {
        width: 20px;
        background-color: transparent;
        border: none;
    }
    QSpinBox::up-button:hover, QSpinBox::down-button:hover {
        background-color: #f5f5f5;
    }

    /* ===== 标签 ===== */
    QLabel {
        color: #262626;
        background: transparent;
        border: none;
    }
    QLabel#title {
        font-size: 18px;
        font-weight: 700;
        color: #262626;
        letter-spacing: -0.02em;
    }
    QLabel#subtitle {
        font-size: 13px;
        color: #8c8c8c;
    }
    QLabel#badge {
        background-color: #e6f4ff;
        color: #1677ff;
        border-radius: 4px;
        padding: 2px 8px;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.02em;
    }
    QLabel#badgeSuccess {
        background-color: #f6ffed;
        color: #389e0d;
        border-radius: 4px;
        padding: 2px 8px;
        font-size: 11px;
        font-weight: 600;
    }
    QLabel#badgeDanger {
        background-color: #fff2f0;
        color: #d9363e;
        border-radius: 4px;
        padding: 2px 8px;
        font-size: 11px;
        font-weight: 600;
    }
    QLabel#badgeWarning {
        background-color: #fffbe6;
        color: #d48806;
        border-radius: 4px;
        padding: 2px 8px;
        font-size: 11px;
        font-weight: 600;
    }

    /* ===== 分组框 ===== */
    QGroupBox {
        background-color: #ffffff;
        border: 1px solid #f0f0f0;
        border-radius: 12px;
        margin-top: 16px;
        padding: 20px 16px 16px 16px;
        font-size: 14px;
        font-weight: 600;
        color: #262626;
    }
    QGroupBox::title {
        subcontrol-origin: margin;
        subcontrol-position: top left;
        left: 16px;
        padding: 0px 8px;
        color: #262626;
        font-weight: 600;
    }

    /* ===== 分割线 ===== */
    QFrame[frameShape="4"], QFrame[frameShape="5"] {
        color: #f0f0f0;
        max-height: 1px;
    }

    /* ===== 选项卡 ===== */
    QTabWidget::pane {
        border: 1px solid #f0f0f0;
        border-radius: 8px;
        background-color: #ffffff;
        padding: 12px;
    }
    QTabBar::tab {
        background-color: transparent;
        color: #8c8c8c;
        border: none;
        padding: 10px 20px;
        font-size: 13px;
        font-weight: 500;
        border-bottom: 2px solid transparent;
    }
    QTabBar::tab:selected {
        color: #1677ff;
        border-bottom-color: #1677ff;
        font-weight: 600;
    }
    QTabBar::tab:hover {
        color: #4096ff;
    }

    /* ===== 侧边栏专用 ===== */
    QWidget#sidebar {
        background-color: #ffffff;
        border-right: 1px solid #f0f0f0;
    }
    QPushButton#sidebarItem {
        background-color: transparent;
        border: none;
        border-radius: 8px;
        padding: 10px 16px;
        text-align: left;
        color: #595959;
        font-size: 13px;
        font-weight: 500;
    }
    QPushButton#sidebarItem:hover {
        background-color: #f5f5f5;
        color: #262626;
    }
    QPushButton#sidebarItemActive {
        background-color: #e6f4ff;
        border: none;
        border-radius: 8px;
        padding: 10px 16px;
        text-align: left;
        color: #1677ff;
        font-size: 13px;
        font-weight: 600;
    }
    QPushButton#sidebarItemActive:hover {
        background-color: #bae0ff;
    }

    /* ===== 底部导航栏 ===== */
    QWidget#bottomNav {
        background-color: #ffffff;
        border-top: 1px solid #f0f0f0;
    }

    /* ===== 文本编辑 ===== */
    QLineEdit {
        background-color: #ffffff;
        border: 1px solid #d9d9d9;
        border-radius: 8px;
        padding: 7px 12px;
        color: #262626;
        font-size: 13px;
        selection-background-color: #e6f4ff;
        selection-color: #262626;
    }
    QLineEdit:hover {
        border-color: #4096ff;
    }
    QLineEdit:focus {
        border-color: #1677ff;
    }
    QLineEdit:disabled {
        background-color: #f5f5f5;
        border-color: #d9d9d9;
        color: #bfbfbf;
    }
    QLineEdit::placeholder {
        color: #bfbfbf;
    }

    QTextEdit, QPlainTextEdit {
        background-color: #ffffff;
        border: 1px solid #d9d9d9;
        border-radius: 8px;
        padding: 8px;
        color: #262626;
        font-size: 13px;
        selection-background-color: #e6f4ff;
        selection-color: #262626;
    }
    QTextEdit:focus, QPlainTextEdit:focus {
        border-color: #1677ff;
    }

    /* ===== 列表 ===== */
    QListWidget {
        background-color: #ffffff;
        border: 1px solid #f0f0f0;
        border-radius: 8px;
        padding: 4px;
        outline: none;
    }
    QListWidget::item {
        padding: 8px 12px;
        border-radius: 6px;
        margin: 1px 0px;
        color: #262626;
    }
    QListWidget::item:selected {
        background-color: #e6f4ff;
        color: #1677ff;
    }
    QListWidget::item:hover {
        background-color: #f5f5f5;
    }

    /* ===== 组合框 ===== */
    QComboBox {
        background-color: #ffffff;
        border: 1px solid #d9d9d9;
        border-radius: 8px;
        padding: 6px 12px;
        color: #262626;
        font-size: 13px;
        min-height: 22px;
    }
    QComboBox:hover {
        border-color: #4096ff;
    }
    QComboBox:focus {
        border-color: #1677ff;
    }
    QComboBox::drop-down {
        border: none;
        width: 28px;
        padding-right: 8px;
    }
    QComboBox QAbstractItemView {
        background-color: #ffffff;
        border: 1px solid #f0f0f0;
        border-radius: 10px;
        selection-background-color: #f5f5f5;
        selection-color: #262626;
        padding: 4px;
        outline: none;
    }
    QComboBox QAbstractItemView::item {
        padding: 8px 12px;
        border-radius: 6px;
    }
    QComboBox QAbstractItemView::item:hover {
        background-color: #f5f5f5;
    }

    /* ===== 工具提示 ===== */
    QToolTip {
        background-color: #262626;
        color: #ffffff;
        border: none;
        border-radius: 8px;
        padding: 8px 12px;
        font-size: 12px;
        font-weight: 500;
    }

    /* ===== 滑块 ===== */
    QSlider::groove:horizontal {
        height: 4px;
        background: #f0f0f0;
        border-radius: 2px;
    }
    QSlider::handle:horizontal {
        width: 14px;
        height: 14px;
        margin: -5px 0;
        background: #ffffff;
        border: 2px solid #1677ff;
        border-radius: 8px;
    }
    QSlider::handle:horizontal:hover {
        border-color: #4096ff;
    }
    QSlider::sub-page:horizontal {
        background: #1677ff;
        border-radius: 2px;
    }
    """

    DARK_THEME = """
    /* ===== 全局基础 ===== */
    QMainWindow, QWidget {
        background-color: #141414;
        color: #e5e5e5;
        font-family: "Inter", "SF Pro Display", "Microsoft YaHei", "Segoe UI", system-ui, sans-serif;
        font-size: 13px;
        font-weight: 400;
        letter-spacing: -0.01em;
    }

    /* ===== 菜单栏 ===== */
    QMenuBar {
        background-color: #1f1f1f;
        color: #e5e5e5;
        border-bottom: 1px solid #2a2a2a;
        padding: 0px;
        font-size: 13px;
        font-weight: 500;
    }
    QMenuBar::item {
        background: transparent;
        padding: 8px 14px;
        border-radius: 6px;
        margin: 4px 2px;
        color: #a6a6a6;
    }
    QMenuBar::item:selected {
        background-color: #2a2a2a;
        color: #e5e5e5;
    }
    QMenuBar::item:pressed {
        background-color: #111d2c;
        color: #4096ff;
    }
    QMenu {
        background-color: #1f1f1f;
        border: 1px solid #2a2a2a;
        border-radius: 10px;
        padding: 6px;
    }
    QMenu::item {
        padding: 8px 32px 8px 12px;
        border-radius: 6px;
        margin: 2px 0px;
        color: #e5e5e5;
        font-size: 13px;
    }
    QMenu::item:selected {
        background-color: #2a2a2a;
        color: #e5e5e5;
    }
    QMenu::item:disabled {
        color: #595959;
    }
    QMenu::separator {
        height: 1px;
        background-color: #2a2a2a;
        margin: 4px 8px;
    }

    /* ===== 工具栏 ===== */
    QToolBar {
        background-color: #1f1f1f;
        border-bottom: 1px solid #2a2a2a;
        padding: 6px 12px;
        spacing: 6px;
    }
    QToolBar QToolButton {
        background-color: transparent;
        border: 1px solid transparent;
        border-radius: 8px;
        padding: 6px 14px;
        color: #a6a6a6;
        font-size: 13px;
        font-weight: 500;
    }
    QToolBar QToolButton:hover {
        background-color: #2a2a2a;
        color: #e5e5e5;
    }
    QToolBar QToolButton:pressed {
        background-color: #111d2c;
        color: #4096ff;
    }

    /* ===== 状态栏 ===== */
    QStatusBar {
        background-color: #1f1f1f;
        color: #8c8c8c;
        border-top: 1px solid #2a2a2a;
        font-size: 12px;
        padding: 6px 12px;
    }
    QStatusBar::item {
        border: none;
    }

    /* ===== 按钮基础 ===== */
    QPushButton {
        background-color: #2a2a2a;
        color: #e5e5e5;
        border: 1px solid #434343;
        border-radius: 8px;
        padding: 7px 16px;
        font-size: 13px;
        font-weight: 500;
        min-height: 22px;
    }
    QPushButton:hover {
        background-color: #353535;
        border-color: #4096ff;
        color: #4096ff;
    }
    QPushButton:pressed {
        background-color: #1f1f1f;
        border-color: #0958d9;
        color: #0958d9;
    }
    QPushButton:disabled {
        background-color: #1f1f1f;
        color: #595959;
        border-color: #2a2a2a;
    }

    /* 主要按钮 */
    QPushButton#primaryBtn {
        background-color: #1677ff;
        color: #ffffff;
        border: 1px solid #1677ff;
        font-weight: 600;
    }
    QPushButton#primaryBtn:hover {
        background-color: #4096ff;
        border-color: #4096ff;
        color: #ffffff;
    }
    QPushButton#primaryBtn:pressed {
        background-color: #0958d9;
        border-color: #0958d9;
    }
    QPushButton#primaryBtn:disabled {
        background-color: #111d2c;
        border-color: transparent;
        color: #595959;
    }

    /* 成功按钮 */
    QPushButton#successBtn {
        background-color: #49aa19;
        color: #ffffff;
        border: 1px solid #49aa19;
    }
    QPushButton#successBtn:hover {
        background-color: #6abe39;
        border-color: #6abe39;
    }

    /* 危险按钮 */
    QPushButton#dangerBtn {
        background-color: #d9363e;
        color: #ffffff;
        border: 1px solid #d9363e;
    }
    QPushButton#dangerBtn:hover {
        background-color: #e8514f;
        border-color: #e8514f;
    }

    /* 文字按钮 */
    QPushButton#flatBtn {
        background-color: transparent;
        border: none;
        color: #4096ff;
        padding: 6px 12px;
        font-weight: 500;
    }
    QPushButton#flatBtn:hover {
        background-color: #111d2c;
        color: #69b1ff;
    }

    /* 幽灵按钮 */
    QPushButton#ghostBtn {
        background-color: transparent;
        border: 1px solid #434343;
        color: #a6a6a6;
    }
    QPushButton#ghostBtn:hover {
        border-color: #4096ff;
        color: #4096ff;
    }

    /* ===== 卡片容器 ===== */
    QFrame#card {
        background-color: #1f1f1f;
        border: 1px solid #2a2a2a;
        border-radius: 12px;
    }
    QFrame#cardHover {
        background-color: #1f1f1f;
        border: 1px solid #2a2a2a;
        border-radius: 12px;
    }
    QFrame#cardHover:hover {
        border-color: #434343;
    }

    /* ===== 滚动条 ===== */
    QScrollArea {
        border: none;
        background-color: transparent;
    }
    QScrollBar:vertical {
        background-color: transparent;
        width: 6px;
        margin: 8px 4px;
        border-radius: 3px;
    }
    QScrollBar::handle:vertical {
        background-color: #434343;
        border-radius: 3px;
        min-height: 24px;
    }
    QScrollBar::handle:vertical:hover {
        background-color: #595959;
    }
    QScrollBar::handle:vertical:pressed {
        background-color: #8c8c8c;
    }
    QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {
        height: 0px;
    }
    QScrollBar::add-page:vertical, QScrollBar::sub-page:vertical {
        background: transparent;
    }
    QScrollBar:horizontal {
        background-color: transparent;
        height: 6px;
        margin: 4px 8px;
        border-radius: 3px;
    }
    QScrollBar::handle:horizontal {
        background-color: #434343;
        border-radius: 3px;
        min-width: 24px;
    }
    QScrollBar::handle:horizontal:hover {
        background-color: #595959;
    }
    QScrollBar::handle:horizontal:pressed {
        background-color: #8c8c8c;
    }
    QScrollBar::add-line:horizontal, QScrollBar::sub-line:horizontal {
        width: 0px;
    }
    QScrollBar::add-page:horizontal, QScrollBar::sub-page:horizontal {
        background: transparent;
    }

    /* ===== 单选按钮 ===== */
    QRadioButton {
        spacing: 8px;
        color: #e5e5e5;
        font-size: 13px;
        padding: 6px 0px;
    }
    QRadioButton::indicator {
        width: 16px;
        height: 16px;
        border: 2px solid #434343;
        border-radius: 9px;
        background-color: transparent;
    }
    QRadioButton::indicator:hover {
        border-color: #4096ff;
    }
    QRadioButton::indicator:checked {
        border: 5px solid #4096ff;
        background-color: transparent;
    }

    /* ===== 复选框 ===== */
    QCheckBox {
        spacing: 8px;
        color: #e5e5e5;
        font-size: 13px;
        padding: 4px 0px;
    }
    QCheckBox::indicator {
        width: 16px;
        height: 16px;
        border: 2px solid #434343;
        border-radius: 4px;
        background-color: transparent;
    }
    QCheckBox::indicator:hover {
        border-color: #4096ff;
    }
    QCheckBox::indicator:checked {
        background-color: #1677ff;
        border-color: #1677ff;
    }
    QCheckBox::indicator:checked:hover {
        background-color: #4096ff;
        border-color: #4096ff;
    }

    /* ===== 进度条 ===== */
    QProgressBar {
        background-color: #2a2a2a;
        border: none;
        border-radius: 4px;
        text-align: center;
        font-size: 0px;
    }
    QProgressBar::chunk {
        background-color: #1677ff;
        border-radius: 4px;
    }

    /* ===== SpinBox ===== */
    QSpinBox {
        background-color: #2a2a2a;
        border: 1px solid #434343;
        border-radius: 8px;
        padding: 6px 10px;
        color: #e5e5e5;
        font-size: 13px;
        min-height: 22px;
    }
    QSpinBox:hover {
        border-color: #4096ff;
    }
    QSpinBox:focus {
        border-color: #1677ff;
    }
    QSpinBox::up-button, QSpinBox::down-button {
        width: 20px;
        background-color: transparent;
        border: none;
    }
    QSpinBox::up-button:hover, QSpinBox::down-button:hover {
        background-color: #353535;
    }

    /* ===== 标签 ===== */
    QLabel {
        color: #e5e5e5;
        background: transparent;
        border: none;
    }
    QLabel#title {
        font-size: 18px;
        font-weight: 700;
        color: #f5f5f5;
        letter-spacing: -0.02em;
    }
    QLabel#subtitle {
        font-size: 13px;
        color: #8c8c8c;
    }
    QLabel#badge {
        background-color: #111d2c;
        color: #4096ff;
        border-radius: 4px;
        padding: 2px 8px;
        font-size: 11px;
        font-weight: 600;
    }
    QLabel#badgeSuccess {
        background-color: #162312;
        color: #6abe39;
        border-radius: 4px;
        padding: 2px 8px;
        font-size: 11px;
        font-weight: 600;
    }
    QLabel#badgeDanger {
        background-color: #2a1215;
        color: #e8514f;
        border-radius: 4px;
        padding: 2px 8px;
        font-size: 11px;
        font-weight: 600;
    }
    QLabel#badgeWarning {
        background-color: #2b2111;
        color: #d89614;
        border-radius: 4px;
        padding: 2px 8px;
        font-size: 11px;
        font-weight: 600;
    }

    /* ===== 分组框 ===== */
    QGroupBox {
        background-color: #1f1f1f;
        border: 1px solid #2a2a2a;
        border-radius: 12px;
        margin-top: 16px;
        padding: 20px 16px 16px 16px;
        font-size: 14px;
        font-weight: 600;
        color: #e5e5e5;
    }
    QGroupBox::title {
        subcontrol-origin: margin;
        subcontrol-position: top left;
        left: 16px;
        padding: 0px 8px;
        color: #e5e5e5;
        font-weight: 600;
    }

    /* ===== 分割线 ===== */
    QFrame[frameShape="4"], QFrame[frameShape="5"] {
        color: #2a2a2a;
        max-height: 1px;
    }

    /* ===== 选项卡 ===== */
    QTabWidget::pane {
        border: 1px solid #2a2a2a;
        border-radius: 8px;
        background-color: #1f1f1f;
        padding: 12px;
    }
    QTabBar::tab {
        background-color: transparent;
        color: #8c8c8c;
        border: none;
        padding: 10px 20px;
        font-size: 13px;
        font-weight: 500;
        border-bottom: 2px solid transparent;
    }
    QTabBar::tab:selected {
        color: #4096ff;
        border-bottom-color: #4096ff;
        font-weight: 600;
    }
    QTabBar::tab:hover {
        color: #69b1ff;
    }

    /* ===== 侧边栏专用 ===== */
    QWidget#sidebar {
        background-color: #1f1f1f;
        border-right: 1px solid #2a2a2a;
    }
    QPushButton#sidebarItem {
        background-color: transparent;
        border: none;
        border-radius: 8px;
        padding: 10px 16px;
        text-align: left;
        color: #a6a6a6;
        font-size: 13px;
        font-weight: 500;
    }
    QPushButton#sidebarItem:hover {
        background-color: #2a2a2a;
        color: #e5e5e5;
    }
    QPushButton#sidebarItemActive {
        background-color: #111d2c;
        border: none;
        border-radius: 8px;
        padding: 10px 16px;
        text-align: left;
        color: #4096ff;
        font-size: 13px;
        font-weight: 600;
    }
    QPushButton#sidebarItemActive:hover {
        background-color: #112a45;
    }

    /* ===== 底部导航栏 ===== */
    QWidget#bottomNav {
        background-color: #1f1f1f;
        border-top: 1px solid #2a2a2a;
    }

    /* ===== 文本编辑 ===== */
    QLineEdit {
        background-color: #2a2a2a;
        border: 1px solid #434343;
        border-radius: 8px;
        padding: 7px 12px;
        color: #e5e5e5;
        font-size: 13px;
        selection-background-color: #111d2c;
        selection-color: #e5e5e5;
    }
    QLineEdit:hover {
        border-color: #4096ff;
    }
    QLineEdit:focus {
        border-color: #1677ff;
    }
    QLineEdit:disabled {
        background-color: #1f1f1f;
        border-color: #2a2a2a;
        color: #595959;
    }

    QTextEdit, QPlainTextEdit {
        background-color: #2a2a2a;
        border: 1px solid #434343;
        border-radius: 8px;
        padding: 8px;
        color: #e5e5e5;
        font-size: 13px;
        selection-background-color: #111d2c;
        selection-color: #e5e5e5;
    }
    QTextEdit:focus, QPlainTextEdit:focus {
        border-color: #1677ff;
    }

    /* ===== 列表 ===== */
    QListWidget {
        background-color: #1f1f1f;
        border: 1px solid #2a2a2a;
        border-radius: 8px;
        padding: 4px;
        outline: none;
    }
    QListWidget::item {
        padding: 8px 12px;
        border-radius: 6px;
        margin: 1px 0px;
        color: #e5e5e5;
    }
    QListWidget::item:selected {
        background-color: #111d2c;
        color: #4096ff;
    }
    QListWidget::item:hover {
        background-color: #2a2a2a;
    }

    /* ===== 组合框 ===== */
    QComboBox {
        background-color: #2a2a2a;
        border: 1px solid #434343;
        border-radius: 8px;
        padding: 6px 12px;
        color: #e5e5e5;
        font-size: 13px;
        min-height: 22px;
    }
    QComboBox:hover {
        border-color: #4096ff;
    }
    QComboBox:focus {
        border-color: #1677ff;
    }
    QComboBox::drop-down {
        border: none;
        width: 28px;
        padding-right: 8px;
    }
    QComboBox QAbstractItemView {
        background-color: #1f1f1f;
        border: 1px solid #2a2a2a;
        border-radius: 10px;
        selection-background-color: #2a2a2a;
        selection-color: #e5e5e5;
        padding: 4px;
        outline: none;
    }
    QComboBox QAbstractItemView::item {
        padding: 8px 12px;
        border-radius: 6px;
    }
    QComboBox QAbstractItemView::item:hover {
        background-color: #2a2a2a;
    }

    /* ===== 工具提示 ===== */
    QToolTip {
        background-color: #2a2a2a;
        color: #e5e5e5;
        border: 1px solid #434343;
        border-radius: 8px;
        padding: 8px 12px;
        font-size: 12px;
        font-weight: 500;
    }

    /* ===== 滑块 ===== */
    QSlider::groove:horizontal {
        height: 4px;
        background: #2a2a2a;
        border-radius: 2px;
    }
    QSlider::handle:horizontal {
        width: 14px;
        height: 14px;
        margin: -5px 0;
        background: #2a2a2a;
        border: 2px solid #1677ff;
        border-radius: 8px;
    }
    QSlider::handle:horizontal:hover {
        border-color: #4096ff;
    }
    QSlider::sub-page:horizontal {
        background: #1677ff;
        border-radius: 2px;
    }
    """

    @staticmethod
    def get_theme(name: str) -> str:
        """获取指定名称的主题 QSS"""
        themes = {
            "light": ThemeManager.LIGHT_THEME,
            "dark": ThemeManager.DARK_THEME,
        }
        return themes.get(name, ThemeManager.LIGHT_THEME)

    @staticmethod
    def get_available_themes() -> List[str]:
        """获取可用主题列表"""
        return ["light", "dark"]
