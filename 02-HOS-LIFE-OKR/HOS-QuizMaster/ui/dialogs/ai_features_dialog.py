#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI 功能对话框 - HOS-QuizMaster V2
Phase 10: AI 功能实现

提供 AI 功能的用户交互界面：
1. 智能题目推荐
2. AI 题目生成
3. 批量生成解析
4. 知识点分析报告
"""

from PyQt6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QPushButton, QLabel,
    QTextEdit, QSpinBox, QComboBox, QGroupBox, QTabWidget,
    QWidget, QMessageBox, QProgressBar, QListWidget, QListWidgetItem,
    QGraphicsDropShadowEffect, QFrame, QScrollArea
)
from PyQt6.QtCore import Qt, QThread, pyqtSignal, QSize
from PyQt6.QtGui import QFont, QColor

from ai.ai_features import AIFeatures
from ai.ai_service import AIServiceError
from ui.design_tokens import Color, Spacing, Radius, Typography, Shadow


class AITaskThread(QThread):
    """AI 任务后台线程"""
    finished = pyqtSignal(object)
    error = pyqtSignal(str)
    progress = pyqtSignal(str)

    def __init__(self, task_func, *args, **kwargs):
        super().__init__()
        self.task_func = task_func
        self.args = args
        self.kwargs = kwargs

    def run(self):
        try:
            result = self.task_func(*self.args, **self.kwargs)
            self.finished.emit(result)
        except Exception as e:
            self.error.emit(str(e))


class AIFeaturesDialog(QDialog):
    """AI 功能对话框"""

    def __init__(self, ai_features: AIFeatures, parent=None):
        super().__init__(parent)
        self.ai_features = ai_features
        self.task_thread = None

        self.setWindowTitle("AI 智能助手")
        self.setMinimumSize(600, 500)

        self.setup_ui()
        self._apply_window_style()
        self._apply_shadow()

    def _apply_window_style(self):
        """应用弹窗整体样式"""
        self.setStyleSheet(f"""
            QDialog {{
                background-color: {Color.BG_PRIMARY};
                border: 1px solid {Color.BORDER_DEFAULT};
                border-radius: {Radius.XL}px;
            }}
        """)

    def _apply_shadow(self):
        """应用阴影效果"""
        shadow = QGraphicsDropShadowEffect()
        shadow.setBlurRadius(Shadow.DIALOG[0])
        shadow.setXOffset(Shadow.DIALOG[1])
        shadow.setYOffset(Shadow.DIALOG[2])
        shadow.setColor(QColor(0, 0, 0, int(255 * Shadow.DIALOG[3])))
        self.setGraphicsEffect(shadow)

    def sizeHint(self) -> QSize:
        """根据内容计算合适的尺寸"""
        from PyQt6.QtWidgets import QApplication
        # AI 功能对话框包含 4 个标签页，需要较大空间
        width = 900
        # 标签页头部(40) + 标签页内容区(~500) + 底部按钮(50) + 边距间距(48)
        height = 40 + 500 + 50 + 48
        # 限制高度：最小 600px，最大不超过屏幕高度的 90%
        screen = QApplication.primaryScreen()
        max_height = int(screen.availableGeometry().height() * 0.9) if screen else 700
        height = min(max(height, 600), max_height)
        return QSize(width, height)

    def setup_ui(self):
        """设置界面"""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(Spacing.XXL, Spacing.XXL, Spacing.XXL, Spacing.XXL)
        layout.setSpacing(Spacing.XL)

        # 标题
        title = QLabel("AI 智能助手")
        title.setStyleSheet(f"font-size: {Typography.SIZE_XL}px; font-weight: {Typography.WEIGHT_BOLD}; color: {Color.TEXT_PRIMARY};")
        layout.addWidget(title)
        
        # 分隔线
        separator = QFrame()
        separator.setFrameShape(QFrame.Shape.HLine)
        separator.setStyleSheet(f"background-color: {Color.BORDER_LIGHT}; max-height: 1px;")
        layout.addWidget(separator)

        # 标签页
        self.tabs = QTabWidget()
        self.tabs.setStyleSheet(f"""
            QTabWidget::pane {{
                border: 1px solid {Color.BORDER_LIGHT};
                border-radius: {Radius.LG}px;
                background-color: {Color.BG_PRIMARY};
            }}
            QTabBar::tab {{
                background-color: {Color.BG_SECONDARY};
                border: 1px solid {Color.BORDER_LIGHT};
                border-bottom: none;
                border-top-left-radius: {Radius.MD}px;
                border-top-right-radius: {Radius.MD}px;
                padding: {Spacing.SM}px {Spacing.LG}px;
                margin-right: 2px;
                font-size: {Typography.SIZE_SM}px;
                color: {Color.TEXT_SECONDARY};
            }}
            QTabBar::tab:selected {{
                background-color: {Color.BG_PRIMARY};
                color: {Color.ACCENT};
                font-weight: {Typography.WEIGHT_SEMI};
            }}
            QTabBar::tab:hover {{
                background-color: {Color.BG_HOVER};
            }}
        """)
        layout.addWidget(self.tabs, stretch=1)

        # 标签页1: 智能推荐
        self.tabs.addTab(self._create_recommend_tab(), "智能推荐")

        # 标签页2: 题目生成
        self.tabs.addTab(self._create_generate_tab(), "生成题目")

        # 标签页3: 解析生成
        self.tabs.addTab(self._create_explanation_tab(), "生成解析")

        # 标签页4: 分析报告
        self.tabs.addTab(self._create_report_tab(), "分析报告")

        # 底部按钮
        btn_layout = QHBoxLayout()
        btn_layout.addStretch()

        close_btn = QPushButton("关闭")
        close_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        close_btn.setMinimumWidth(80)
        close_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {Color.ACCENT};
                color: {Color.TEXT_INVERSE};
                border: none;
                border-radius: {Radius.MD}px;
                padding: {Spacing.SM}px {Spacing.LG}px;
                font-size: {Typography.SIZE_SM}px;
                font-weight: {Typography.WEIGHT_SEMI};
            }}
            QPushButton:hover {{
                background-color: {Color.ACCENT_HOVER};
            }}
            QPushButton:pressed {{
                background-color: {Color.ACCENT_ACTIVE};
            }}
            QPushButton:disabled {{
                background-color: {Color.BG_QUATERNARY};
                color: {Color.TEXT_DISABLED};
            }}
        """)
        close_btn.clicked.connect(self.close)
        btn_layout.addWidget(close_btn)

        layout.addLayout(btn_layout)

    # ========== 智能推荐标签页 ==========

    def _create_recommend_tab(self) -> QWidget:
        """创建智能推荐标签页"""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.setContentsMargins(Spacing.LG, Spacing.LG, Spacing.LG, Spacing.LG)
        layout.setSpacing(Spacing.LG)

        # 说明
        info_label = QLabel("基于您的学习情况，智能推荐需要重点练习的题目")
        info_label.setWordWrap(True)
        info_label.setStyleSheet(f"""
            color: {Color.TEXT_SECONDARY};
            font-size: {Typography.SIZE_SM}px;
        """)
        layout.addWidget(info_label)

        # 控制区
        control_layout = QHBoxLayout()
        control_layout.setSpacing(Spacing.MD)
        
        count_label = QLabel("推荐数量:")
        count_label.setStyleSheet(f"""
            color: {Color.TEXT_PRIMARY};
            font-size: {Typography.SIZE_SM}px;
        """)
        control_layout.addWidget(count_label)
        
        self.recommend_count = QSpinBox()
        self.recommend_count.setRange(5, 50)
        self.recommend_count.setValue(10)
        self.recommend_count.setStyleSheet(f"""
            QSpinBox {{
                background-color: {Color.BG_PRIMARY};
                border: 1px solid {Color.BORDER_DEFAULT};
                border-radius: {Radius.MD}px;
                padding: {Spacing.XS}px {Spacing.SM}px;
                font-size: {Typography.SIZE_SM}px;
                color: {Color.TEXT_PRIMARY};
                min-width: 80px;
            }}
            QSpinBox:hover {{
                border-color: {Color.BORDER_DARK};
            }}
            QSpinBox:focus {{
                border-color: {Color.ACCENT};
            }}
        """)
        control_layout.addWidget(self.recommend_count)

        recommend_btn = QPushButton("开始推荐")
        recommend_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        recommend_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {Color.ACCENT};
                color: {Color.TEXT_INVERSE};
                border: none;
                border-radius: {Radius.MD}px;
                padding: {Spacing.SM}px {Spacing.LG}px;
                font-size: {Typography.SIZE_SM}px;
                font-weight: {Typography.WEIGHT_SEMI};
            }}
            QPushButton:hover {{
                background-color: {Color.ACCENT_HOVER};
            }}
            QPushButton:pressed {{
                background-color: {Color.ACCENT_ACTIVE};
            }}
            QPushButton:disabled {{
                background-color: {Color.BG_QUATERNARY};
                color: {Color.TEXT_DISABLED};
            }}
        """)
        recommend_btn.clicked.connect(self._on_recommend_clicked)
        control_layout.addWidget(recommend_btn)
        control_layout.addStretch()
        layout.addLayout(control_layout)

        # 进度条
        self.recommend_progress = QProgressBar()
        self.recommend_progress.setVisible(False)
        self.recommend_progress.setStyleSheet(f"""
            QProgressBar {{
                border: 1px solid {Color.BORDER_LIGHT};
                border-radius: {Radius.SM}px;
                background-color: {Color.BG_SECONDARY};
                text-align: center;
                color: {Color.TEXT_SECONDARY};
            }}
            QProgressBar::chunk {{
                background-color: {Color.ACCENT};
                border-radius: {Radius.SM}px;
            }}
        """)
        layout.addWidget(self.recommend_progress)

        # 结果列表
        self.recommend_list = QListWidget()
        self.recommend_list.setFont(QFont("Consolas", Typography.SIZE_XS))
        self.recommend_list.setStyleSheet(f"""
            QListWidget {{
                background-color: {Color.BG_PRIMARY};
                border: 1px solid {Color.BORDER_LIGHT};
                border-radius: {Radius.LG}px;
                padding: {Spacing.SM}px;
            }}
            QListWidget::item {{
                padding: {Spacing.SM}px;
                border-bottom: 1px solid {Color.BORDER_LIGHT};
            }}
            QListWidget::item:last {{
                border-bottom: none;
            }}
            QListWidget::item:hover {{
                background-color: {Color.BG_HOVER};
            }}
            QListWidget::item:selected {{
                background-color: {Color.ACCENT_BG};
                color: {Color.TEXT_PRIMARY};
            }}
            QScrollBar:vertical {{
                background: {Color.BG_PRIMARY};
                width: 6px;
                border-radius: {Radius.SM}px;
                margin: 0px;
            }}
            QScrollBar::handle:vertical {{
                background: {Color.BORDER_DARK};
                border-radius: 3px;
                min-height: 30px;
            }}
            QScrollBar::handle:vertical:hover {{
                background: {Color.TEXT_TERTIARY};
            }}
            QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {{
                height: 0px;
            }}
            QScrollBar::add-page:vertical, QScrollBar::sub-page:vertical {{
                background: transparent;
            }}
        """)
        layout.addWidget(self.recommend_list)

        return widget

    def _on_recommend_clicked(self):
        """开始推荐"""
        count = self.recommend_count.value()
        self.recommend_progress.setVisible(True)
        self.recommend_progress.setRange(0, 0)  # 忙碌状态
        self.recommend_list.clear()

        self.task_thread = AITaskThread(
            self.ai_features.recommend_questions,
            count=count
        )
        self.task_thread.finished.connect(self._on_recommend_finished)
        self.task_thread.error.connect(self._on_task_error)
        self.task_thread.start()

    def _on_recommend_finished(self, results):
        """推荐完成"""
        self.recommend_progress.setVisible(False)

        if not results:
            self.recommend_list.addItem("暂无推荐题目，请先完成一些练习")
            return

        for item in results:
            q = item['question']
            reason = item['recommend_reason']
            text = f"第 {q['number']} 题 [{q['type']}] - {reason}\n{q['stem'][:80]}..."
            list_item = QListWidgetItem(text)
            list_item.setData(Qt.ItemDataRole.UserRole, q)
            self.recommend_list.addItem(list_item)

    # ========== 题目生成标签页 ==========

    def _create_generate_tab(self) -> QWidget:
        """创建题目生成标签页"""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.setContentsMargins(Spacing.LG, Spacing.LG, Spacing.LG, Spacing.LG)
        layout.setSpacing(Spacing.LG)

        # 参数设置
        param_group = QGroupBox("生成参数")
        param_group.setStyleSheet(f"""
            QGroupBox {{
                font-size: {Typography.SIZE_SM}px;
                font-weight: {Typography.WEIGHT_SEMI};
                color: {Color.TEXT_PRIMARY};
                border: 1px solid {Color.BORDER_DEFAULT};
                border-radius: {Radius.LG}px;
                margin-top: {Spacing.MD}px;
                padding-top: {Spacing.LG}px;
            }}
            QGroupBox::title {{
                subcontrol-origin: margin;
                left: {Spacing.MD}px;
                padding: 0 {Spacing.SM}px;
            }}
        """)
        param_layout = QVBoxLayout(param_group)
        param_layout.setSpacing(Spacing.MD)

        # 知识点
        topic_layout = QHBoxLayout()
        topic_label = QLabel("知识点/主题:")
        topic_label.setStyleSheet(f"color: {Color.TEXT_PRIMARY}; font-size: {Typography.SIZE_SM}px;")
        topic_layout.addWidget(topic_label)
        
        self.topic_input = QComboBox()
        self.topic_input.setEditable(True)
        self.topic_input.setMinimumWidth(300)
        self.topic_input.setStyleSheet(f"""
            QComboBox {{
                background-color: {Color.BG_PRIMARY};
                border: 1px solid {Color.BORDER_DEFAULT};
                border-radius: {Radius.MD}px;
                padding: {Spacing.SM}px {Spacing.MD}px;
                font-size: {Typography.SIZE_SM}px;
                color: {Color.TEXT_PRIMARY};
            }}
            QComboBox:hover {{
                border-color: {Color.BORDER_DARK};
            }}
            QComboBox:focus {{
                border-color: {Color.ACCENT};
            }}
        """)
        self._load_topics()
        topic_layout.addWidget(self.topic_input)
        param_layout.addLayout(topic_layout)

        # 题型和难度
        settings_layout = QHBoxLayout()
        settings_layout.setSpacing(Spacing.MD)
        
        type_label = QLabel("题型:")
        type_label.setStyleSheet(f"color: {Color.TEXT_PRIMARY}; font-size: {Typography.SIZE_SM}px;")
        settings_layout.addWidget(type_label)
        
        self.question_type_combo = QComboBox()
        self.question_type_combo.addItems(["单选题", "多选题", "判断题"])
        self.question_type_combo.setStyleSheet(f"""
            QComboBox {{
                background-color: {Color.BG_PRIMARY};
                border: 1px solid {Color.BORDER_DEFAULT};
                border-radius: {Radius.MD}px;
                padding: {Spacing.SM}px {Spacing.MD}px;
                font-size: {Typography.SIZE_SM}px;
                color: {Color.TEXT_PRIMARY};
            }}
            QComboBox:hover {{
                border-color: {Color.BORDER_DARK};
            }}
        """)
        settings_layout.addWidget(self.question_type_combo)

        diff_label = QLabel("难度:")
        diff_label.setStyleSheet(f"color: {Color.TEXT_PRIMARY}; font-size: {Typography.SIZE_SM}px;")
        settings_layout.addWidget(diff_label)
        
        self.difficulty_combo = QComboBox()
        self.difficulty_combo.addItems(["简单", "中等", "困难"])
        self.difficulty_combo.setCurrentIndex(1)
        self.difficulty_combo.setStyleSheet(f"""
            QComboBox {{
                background-color: {Color.BG_PRIMARY};
                border: 1px solid {Color.BORDER_DEFAULT};
                border-radius: {Radius.MD}px;
                padding: {Spacing.SM}px {Spacing.MD}px;
                font-size: {Typography.SIZE_SM}px;
                color: {Color.TEXT_PRIMARY};
            }}
            QComboBox:hover {{
                border-color: {Color.BORDER_DARK};
            }}
        """)
        settings_layout.addWidget(self.difficulty_combo)

        count_label = QLabel("数量:")
        count_label.setStyleSheet(f"color: {Color.TEXT_PRIMARY}; font-size: {Typography.SIZE_SM}px;")
        settings_layout.addWidget(count_label)
        
        self.generate_count = QSpinBox()
        self.generate_count.setRange(1, 20)
        self.generate_count.setValue(5)
        self.generate_count.setStyleSheet(f"""
            QSpinBox {{
                background-color: {Color.BG_PRIMARY};
                border: 1px solid {Color.BORDER_DEFAULT};
                border-radius: {Radius.MD}px;
                padding: {Spacing.XS}px {Spacing.SM}px;
                font-size: {Typography.SIZE_SM}px;
                color: {Color.TEXT_PRIMARY};
                min-width: 80px;
            }}
            QSpinBox:hover {{
                border-color: {Color.BORDER_DARK};
            }}
        """)
        settings_layout.addWidget(self.generate_count)
        settings_layout.addStretch()
        param_layout.addLayout(settings_layout)

        layout.addWidget(param_group)

        # 生成按钮
        generate_btn = QPushButton("生成题目")
        generate_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        generate_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {Color.ACCENT};
                color: {Color.TEXT_INVERSE};
                border: none;
                border-radius: {Radius.MD}px;
                padding: {Spacing.SM}px {Spacing.LG}px;
                font-size: {Typography.SIZE_SM}px;
                font-weight: {Typography.WEIGHT_SEMI};
            }}
            QPushButton:hover {{
                background-color: {Color.ACCENT_HOVER};
            }}
            QPushButton:pressed {{
                background-color: {Color.ACCENT_ACTIVE};
            }}
            QPushButton:disabled {{
                background-color: {Color.BG_QUATERNARY};
                color: {Color.TEXT_DISABLED};
            }}
        """)
        generate_btn.clicked.connect(self._on_generate_clicked)
        layout.addWidget(generate_btn)

        # 进度条
        self.generate_progress = QProgressBar()
        self.generate_progress.setVisible(False)
        self.generate_progress.setStyleSheet(f"""
            QProgressBar {{
                border: 1px solid {Color.BORDER_LIGHT};
                border-radius: {Radius.SM}px;
                background-color: {Color.BG_SECONDARY};
                text-align: center;
                color: {Color.TEXT_SECONDARY};
            }}
            QProgressBar::chunk {{
                background-color: {Color.ACCENT};
                border-radius: {Radius.SM}px;
            }}
        """)
        layout.addWidget(self.generate_progress)

        # 结果显示
        self.generate_result = QTextEdit()
        self.generate_result.setReadOnly(True)
        self.generate_result.setFont(QFont("Consolas", Typography.SIZE_XS))
        self.generate_result.setStyleSheet(f"""
            QTextEdit {{
                background-color: {Color.BG_SECONDARY};
                border: 1px solid {Color.BORDER_LIGHT};
                border-radius: {Radius.LG}px;
                padding: {Spacing.MD}px;
                font-size: {Typography.SIZE_SM}px;
                color: {Color.TEXT_PRIMARY};
            }}
            QScrollBar:vertical {{
                background: {Color.BG_PRIMARY};
                width: 6px;
                border-radius: {Radius.SM}px;
                margin: 0px;
            }}
            QScrollBar::handle:vertical {{
                background: {Color.BORDER_DARK};
                border-radius: 3px;
                min-height: 30px;
            }}
            QScrollBar::handle:vertical:hover {{
                background: {Color.TEXT_TERTIARY};
            }}
            QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {{
                height: 0px;
            }}
            QScrollBar::add-page:vertical, QScrollBar::sub-page:vertical {{
                background: transparent;
            }}
        """)
        layout.addWidget(self.generate_result)

        # 保存按钮
        save_btn = QPushButton("保存到题库")
        save_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        save_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {Color.SUCCESS};
                color: {Color.TEXT_INVERSE};
                border: none;
                border-radius: {Radius.MD}px;
                padding: {Spacing.SM}px {Spacing.LG}px;
                font-size: {Typography.SIZE_SM}px;
                font-weight: {Typography.WEIGHT_SEMI};
            }}
            QPushButton:hover {{
                background-color: {Color.SUCCESS_HOVER};
            }}
            QPushButton:pressed {{
                background-color: {Color.SUCCESS_ACTIVE};
            }}
            QPushButton:disabled {{
                background-color: {Color.BG_TERTIARY};
                color: {Color.TEXT_DISABLED};
            }}
        """)
        save_btn.clicked.connect(self._on_save_generated_clicked)
        save_btn.setEnabled(False)
        self.save_generated_btn = save_btn
        layout.addWidget(save_btn)

        self._generated_questions = []

        return widget

    def _load_topics(self):
        """加载知识点列表"""
        try:
            all_kps = self.ai_features.kp_dao.get_all()
            for kp in all_kps[:20]:  # 最多显示20个
                self.topic_input.addItem(kp['name'])
            # 添加一些默认主题
            if not all_kps:
                self.topic_input.addItems([
                    "网络安全基础",
                    "防火墙技术",
                    "入侵检测",
                    "加密算法",
                    "身份认证"
                ])
        except Exception:
            self.topic_input.addItems(["网络安全", "信息安全", "系统安全"])

    def _on_generate_clicked(self):
        """开始生成题目"""
        topic = self.topic_input.currentText().strip()
        if not topic:
            QMessageBox.warning(self, "提示", "请输入知识点或主题")
            return

        difficulty_map = {0: 'easy', 1: 'medium', 2: 'hard'}
        difficulty = difficulty_map.get(self.difficulty_combo.currentIndex(), 'medium')
        question_type = self.question_type_combo.currentText()
        count = self.generate_count.value()

        self.generate_progress.setVisible(True)
        self.generate_progress.setRange(0, 0)
        self.generate_result.clear()
        self.save_generated_btn.setEnabled(False)

        self.task_thread = AITaskThread(
            self.ai_features.generate_questions,
            topic=topic,
            count=count,
            difficulty=difficulty,
            question_type=question_type
        )
        self.task_thread.finished.connect(self._on_generate_finished)
        self.task_thread.error.connect(self._on_task_error)
        self.task_thread.start()

    def _on_generate_finished(self, questions):
        """生成完成"""
        self.generate_progress.setVisible(False)
        self._generated_questions = questions

        if not questions:
            self.generate_result.setPlainText("生成失败，请重试")
            return

        # 显示生成的题目
        text = f"成功生成 {len(questions)} 道题目：\n\n"
        for i, q in enumerate(questions, 1):
            text += f"{i}. [{q['type']}] {q['stem']}\n"
            for opt in q.get('options', []):
                if isinstance(opt, dict):
                    text += f"   {opt.get('label', '')}. {opt.get('text', '')}\n"
            text += f"   答案: {q.get('answer', '')}\n"
            text += f"   解析: {q.get('explanation', '')}\n\n"

        self.generate_result.setPlainText(text)
        self.save_generated_btn.setEnabled(True)

    def _on_save_generated_clicked(self):
        """保存生成的题目"""
        if not self._generated_questions:
            return

        count = self.ai_features.save_generated_questions(self._generated_questions)
        QMessageBox.information(
            self, "保存成功",
            f"已保存 {count} 道题目到题库"
        )
        self.save_generated_btn.setEnabled(False)

    # ========== 解析生成标签页 ==========

    def _create_explanation_tab(self) -> QWidget:
        """创建解析生成标签页"""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.setContentsMargins(Spacing.LG, Spacing.LG, Spacing.LG, Spacing.LG)
        layout.setSpacing(Spacing.LG)

        # 说明
        info_label = QLabel("为缺少解析的题目自动生成详细解析")
        info_label.setWordWrap(True)
        info_label.setStyleSheet(f"color: {Color.TEXT_SECONDARY}; font-size: {Typography.SIZE_SM}px;")
        layout.addWidget(info_label)

        # 控制区
        control_layout = QHBoxLayout()
        control_layout.setSpacing(Spacing.MD)
        
        count_label = QLabel("处理数量:")
        count_label.setStyleSheet(f"""
            color: {Color.TEXT_PRIMARY};
            font-size: {Typography.SIZE_SM}px;
        """)
        control_layout.addWidget(count_label)
        
        self.explanation_count = QSpinBox()
        self.explanation_count.setRange(1, 50)
        self.explanation_count.setValue(10)
        self.explanation_count.setStyleSheet(f"""
            QSpinBox {{
                background-color: {Color.BG_PRIMARY};
                border: 1px solid {Color.BORDER_DEFAULT};
                border-radius: {Radius.MD}px;
                padding: {Spacing.XS}px {Spacing.SM}px;
                font-size: {Typography.SIZE_SM}px;
                color: {Color.TEXT_PRIMARY};
                min-width: 80px;
            }}
            QSpinBox:hover {{
                border-color: {Color.BORDER_DARK};
            }}
            QSpinBox:focus {{
                border-color: {Color.ACCENT};
            }}
        """)
        control_layout.addWidget(self.explanation_count)

        generate_btn = QPushButton("开始生成")
        generate_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        generate_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {Color.ACCENT};
                color: {Color.TEXT_INVERSE};
                border: none;
                border-radius: {Radius.MD}px;
                padding: {Spacing.SM}px {Spacing.LG}px;
                font-size: {Typography.SIZE_SM}px;
                font-weight: {Typography.WEIGHT_SEMI};
            }}
            QPushButton:hover {{
                background-color: {Color.ACCENT_HOVER};
            }}
            QPushButton:pressed {{
                background-color: {Color.ACCENT_ACTIVE};
            }}
            QPushButton:disabled {{
                background-color: {Color.BG_QUATERNARY};
                color: {Color.TEXT_DISABLED};
            }}
        """)
        generate_btn.clicked.connect(self._on_explanation_clicked)
        control_layout.addWidget(generate_btn)
        control_layout.addStretch()
        layout.addLayout(control_layout)

        # 进度条
        self.explanation_progress = QProgressBar()
        self.explanation_progress.setVisible(False)
        self.explanation_progress.setStyleSheet(f"""
            QProgressBar {{
                border: 1px solid {Color.BORDER_LIGHT};
                border-radius: {Radius.SM}px;
                background-color: {Color.BG_SECONDARY};
                text-align: center;
                color: {Color.TEXT_SECONDARY};
            }}
            QProgressBar::chunk {{
                background-color: {Color.ACCENT};
                border-radius: {Radius.SM}px;
            }}
        """)
        layout.addWidget(self.explanation_progress)

        # 结果显示
        self.explanation_result = QTextEdit()
        self.explanation_result.setReadOnly(True)
        self.explanation_result.setFont(QFont("Consolas", Typography.SIZE_XS))
        self.explanation_result.setStyleSheet(f"""
            QTextEdit {{
                background-color: {Color.BG_SECONDARY};
                border: 1px solid {Color.BORDER_LIGHT};
                border-radius: {Radius.LG}px;
                padding: {Spacing.MD}px;
                font-size: {Typography.SIZE_SM}px;
                color: {Color.TEXT_PRIMARY};
            }}
            QScrollBar:vertical {{
                background: {Color.BG_PRIMARY};
                width: 6px;
                border-radius: {Radius.SM}px;
                margin: 0px;
            }}
            QScrollBar::handle:vertical {{
                background: {Color.BORDER_DARK};
                border-radius: 3px;
                min-height: 30px;
            }}
            QScrollBar::handle:vertical:hover {{
                background: {Color.TEXT_TERTIARY};
            }}
            QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {{
                height: 0px;
            }}
            QScrollBar::add-page:vertical, QScrollBar::sub-page:vertical {{
                background: transparent;
            }}
        """)
        layout.addWidget(self.explanation_result)

        # 应用按钮
        apply_btn = QPushButton("应用到题库")
        apply_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        apply_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {Color.SUCCESS};
                color: {Color.TEXT_INVERSE};
                border: none;
                border-radius: {Radius.MD}px;
                padding: {Spacing.SM}px {Spacing.LG}px;
                font-size: {Typography.SIZE_SM}px;
                font-weight: {Typography.WEIGHT_SEMI};
            }}
            QPushButton:hover {{
                background-color: {Color.SUCCESS_HOVER};
            }}
            QPushButton:pressed {{
                background-color: {Color.SUCCESS_ACTIVE};
            }}
            QPushButton:disabled {{
                background-color: {Color.BG_TERTIARY};
                color: {Color.TEXT_DISABLED};
            }}
        """)
        apply_btn.clicked.connect(self._on_apply_explanations_clicked)
        apply_btn.setEnabled(False)
        self.apply_explanations_btn = apply_btn
        layout.addWidget(apply_btn)

        self._explanation_results = []

        return widget

    def _on_explanation_clicked(self):
        """开始生成解析"""
        count = self.explanation_count.value()
        self.explanation_progress.setVisible(True)
        self.explanation_progress.setRange(0, 0)
        self.explanation_result.clear()
        self.apply_explanations_btn.setEnabled(False)

        self.task_thread = AITaskThread(
            self.ai_features.batch_generate_explanations,
            limit=count
        )
        self.task_thread.finished.connect(self._on_explanation_finished)
        self.task_thread.error.connect(self._on_task_error)
        self.task_thread.start()

    def _on_explanation_finished(self, results):
        """生成完成"""
        self.explanation_progress.setVisible(False)
        self._explanation_results = results

        if not results:
            self.explanation_result.setPlainText("没有找到缺少解析的题目")
            return

        # 显示结果
        text = f"为 {len(results)} 道题目生成了解析：\n\n"
        success_count = 0
        for r in results:
            if 'error' in r:
                text += f"第 {r.get('question_number', '?')} 题: 生成失败 - {r['error']}\n\n"
            else:
                success_count += 1
                text += f"第 {r.get('question_number', '?')} 题:\n"
                text += f"  {r.get('generated_explanation', '')}\n\n"

        text += f"\n成功生成 {success_count} 条解析"
        self.explanation_result.setPlainText(text)
        self.apply_explanations_btn.setEnabled(success_count > 0)

    def _on_apply_explanations_clicked(self):
        """应用生成的解析"""
        if not self._explanation_results:
            return

        count = self.ai_features.apply_generated_explanations(self._explanation_results)
        QMessageBox.information(
            self, "应用成功",
            f"已更新 {count} 道题目的解析"
        )
        self.apply_explanations_btn.setEnabled(False)

    # ========== 分析报告标签页 ==========

    def _create_report_tab(self) -> QWidget:
        """创建分析报告标签页"""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.setContentsMargins(Spacing.LG, Spacing.LG, Spacing.LG, Spacing.LG)
        layout.setSpacing(Spacing.LG)

        # 说明
        info_label = QLabel("生成个人学习情况分析报告，包含知识点掌握度、薄弱环节和改进建议")
        info_label.setWordWrap(True)
        info_label.setStyleSheet(f"""
            color: {Color.TEXT_SECONDARY};
            font-size: {Typography.SIZE_SM}px;
        """)
        layout.addWidget(info_label)

        # 生成按钮
        generate_btn = QPushButton("生成报告")
        generate_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        generate_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {Color.ACCENT};
                color: {Color.TEXT_INVERSE};
                border: none;
                border-radius: {Radius.MD}px;
                padding: {Spacing.SM}px {Spacing.LG}px;
                font-size: {Typography.SIZE_SM}px;
                font-weight: {Typography.WEIGHT_SEMI};
            }}
            QPushButton:hover {{
                background-color: {Color.ACCENT_HOVER};
            }}
            QPushButton:pressed {{
                background-color: {Color.ACCENT_ACTIVE};
            }}
            QPushButton:disabled {{
                background-color: {Color.BG_QUATERNARY};
                color: {Color.TEXT_DISABLED};
            }}
        """)
        generate_btn.clicked.connect(self._on_report_clicked)
        layout.addWidget(generate_btn)

        # 进度条
        self.report_progress = QProgressBar()
        self.report_progress.setVisible(False)
        self.report_progress.setStyleSheet(f"""
            QProgressBar {{
                border: 1px solid {Color.BORDER_LIGHT};
                border-radius: {Radius.SM}px;
                background-color: {Color.BG_SECONDARY};
                text-align: center;
                color: {Color.TEXT_SECONDARY};
            }}
            QProgressBar::chunk {{
                background-color: {Color.ACCENT};
                border-radius: {Radius.SM}px;
            }}
        """)
        layout.addWidget(self.report_progress)

        # 报告显示
        self.report_result = QTextEdit()
        self.report_result.setReadOnly(True)
        self.report_result.setFont(QFont("Consolas", Typography.SIZE_XS))
        self.report_result.setStyleSheet(f"""
            QTextEdit {{
                background-color: {Color.BG_SECONDARY};
                border: 1px solid {Color.BORDER_LIGHT};
                border-radius: {Radius.LG}px;
                padding: {Spacing.MD}px;
                font-size: {Typography.SIZE_SM}px;
                color: {Color.TEXT_PRIMARY};
            }}
            QScrollBar:vertical {{
                background: {Color.BG_PRIMARY};
                width: 6px;
                border-radius: {Radius.SM}px;
                margin: 0px;
            }}
            QScrollBar::handle:vertical {{
                background: {Color.BORDER_DARK};
                border-radius: 3px;
                min-height: 30px;
            }}
            QScrollBar::handle:vertical:hover {{
                background: {Color.TEXT_TERTIARY};
            }}
            QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {{
                height: 0px;
            }}
            QScrollBar::add-page:vertical, QScrollBar::sub-page:vertical {{
                background: transparent;
            }}
        """)
        layout.addWidget(self.report_result)

        return widget

    def _on_report_clicked(self):
        """开始生成报告"""
        self.report_progress.setVisible(True)
        self.report_progress.setRange(0, 0)
        self.report_result.clear()

        self.task_thread = AITaskThread(
            self.ai_features.generate_knowledge_report
        )
        self.task_thread.finished.connect(self._on_report_finished)
        self.task_thread.error.connect(self._on_task_error)
        self.task_thread.start()

    def _on_report_finished(self, report):
        """报告生成完成"""
        self.report_progress.setVisible(False)
        self.report_result.setPlainText(report)

    # ========== 通用错误处理 ==========

    def _on_task_error(self, error_msg):
        """任务执行错误"""
        if hasattr(self, 'recommend_progress'):
            self.recommend_progress.setVisible(False)
        if hasattr(self, 'generate_progress'):
            self.generate_progress.setVisible(False)
        if hasattr(self, 'explanation_progress'):
            self.explanation_progress.setVisible(False)
        if hasattr(self, 'report_progress'):
            self.report_progress.setVisible(False)

        QMessageBox.critical(self, "错误", f"AI 任务执行失败：\n{error_msg}")
