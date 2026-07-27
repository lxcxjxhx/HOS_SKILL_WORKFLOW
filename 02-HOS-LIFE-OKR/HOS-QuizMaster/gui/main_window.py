#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
主窗口
"""

from PyQt6.QtWidgets import (QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
                              QPushButton, QLabel, QFileDialog, QMessageBox,
                              QProgressBar, QSpinBox, QRadioButton, QCheckBox,
                              QTextEdit, QGroupBox, QButtonGroup, QScrollArea)
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QPixmap, QKeyEvent
import os
from parser.md_parser import MDParser
from core.quiz_manager import QuizManager


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("HOS-QuizMaster - 刷题工具")
        self.setGeometry(100, 100, 900, 700)
        
        self.parser = MDParser()
        self.quiz_manager = QuizManager()
        
        self.init_ui()
        self.setFocusPolicy(Qt.FocusPolicy.StrongFocus)
        
    def init_ui(self):
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QVBoxLayout(central_widget)
        
        # 顶部控制栏
        top_bar = QHBoxLayout()
        
        self.btn_load = QPushButton("导入题库")
        self.btn_load.clicked.connect(self.load_quiz_file)
        top_bar.addWidget(self.btn_load)
        
        self.lbl_status = QLabel("未加载题库")
        top_bar.addWidget(self.lbl_status)
        
        top_bar.addStretch()
        
        # 模式选择
        self.radio_sequential = QRadioButton("顺序模式")
        self.radio_random = QRadioButton("随机模式")
        self.radio_sequential.setChecked(True)
        self.radio_sequential.toggled.connect(self.change_mode)
        top_bar.addWidget(self.radio_sequential)
        top_bar.addWidget(self.radio_random)
        
        main_layout.addLayout(top_bar)
        
        # 题目显示区域
        self.scroll_area = QScrollArea()
        self.scroll_area.setWidgetResizable(True)
        self.question_widget = QWidget()
        self.question_layout = QVBoxLayout(self.question_widget)
        self.scroll_area.setWidget(self.question_widget)
        main_layout.addWidget(self.scroll_area, stretch=1)
        
        # 进度控制栏
        progress_bar = QHBoxLayout()
        
        self.btn_prev = QPushButton("上一题")
        self.btn_prev.clicked.connect(self.prev_question)
        self.btn_prev.setEnabled(False)
        progress_bar.addWidget(self.btn_prev)
        
        self.spin_question = QSpinBox()
        self.spin_question.setMinimum(1)
        self.spin_question.valueChanged.connect(self.goto_question)
        progress_bar.addWidget(QLabel("题号:"))
        progress_bar.addWidget(self.spin_question)
        
        self.progress_bar = QProgressBar()
        progress_bar.addWidget(self.progress_bar)
        
        self.btn_next = QPushButton("下一题")
        self.btn_next.clicked.connect(self.next_question)
        self.btn_next.setEnabled(False)
        progress_bar.addWidget(self.btn_next)
        
        main_layout.addLayout(progress_bar)
        
        # 统计栏
        stats_bar = QHBoxLayout()
        self.lbl_stats = QLabel("总题数: 0 | 已答: 0 | 正确: 0 | 正确率: 0%")
        stats_bar.addWidget(self.lbl_stats)
        stats_bar.addStretch()
        main_layout.addLayout(stats_bar)
        
    def load_quiz_file(self):
        file_path, _ = QFileDialog.getOpenFileName(
            self, "选择题库文件", "", "Markdown Files (*.md);;All Files (*)"
        )
        
        if file_path:
            try:
                questions = self.parser.parse_file(file_path)
                self.quiz_manager.load_questions(questions, file_path)
                
                self.lbl_status.setText(f"已加载: {len(questions)} 题")
                self.spin_question.setMaximum(len(questions))
                self.spin_question.setMinimum(1)
                self.progress_bar.setMaximum(len(questions))
                
                # 恢复模式选择
                if self.quiz_manager.mode == 'random':
                    self.radio_random.setChecked(True)
                else:
                    self.radio_sequential.setChecked(True)
                
                self.btn_next.setEnabled(True)
                self.show_question(0)
                self.update_stats()
                
            except Exception as e:
                QMessageBox.critical(self, "错误", f"加载题库失败:\n{str(e)}")
    
    def show_question(self, index):
        # 清空当前题目
        for i in reversed(range(self.question_layout.count())):
            widget = self.question_layout.itemAt(i).widget()
            if widget:
                widget.deleteLater()
        
        question = self.quiz_manager.get_question(index)
        if not question:
            return
        
        # 题目标题
        title = QLabel(f"第 {index + 1} 题 [{question['type']}]")
        title.setStyleSheet("font-weight: bold; font-size: 14px;")
        self.question_layout.addWidget(title)
        
        # 题干
        stem = QLabel(question['stem'])
        stem.setWordWrap(True)
        self.question_layout.addWidget(stem)
        
        # 显示图片
        if question.get('images'):
            for img_path in question['images']:
                if os.path.exists(img_path):
                    img_label = QLabel()
                    pixmap = QPixmap(img_path)
                    if not pixmap.isNull():
                        # 缩放图片适应窗口宽度
                        scaled_pixmap = pixmap.scaledToWidth(600, Qt.TransformationMode.SmoothTransformation)
                        img_label.setPixmap(scaled_pixmap)
                        img_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
                        self.question_layout.addWidget(img_label)
        
        # 选项
        self.option_buttons = []
        if question['type'] in ['单选题', '判断题']:
            self.button_group = QButtonGroup()
            
        for option in question['options']:
            if question['type'] == '判断题':
                btn = QRadioButton(option['text'])
            elif question['type'] == '多选题':
                btn = QCheckBox(option['text'])
            else:
                btn = QRadioButton(option['text'])
                
            btn.setProperty('option_label', option['label'])
            
            if question['type'] in ['单选题', '判断题']:
                self.button_group.addButton(btn)
            
            btn.toggled.connect(self.on_answer_changed)
            self.question_layout.addWidget(btn)
            self.option_buttons.append(btn)
        
        # 答案和解析区域
        self.answer_label = QLabel()
        self.answer_label.setWordWrap(True)
        self.question_layout.addWidget(self.answer_label)
        
        self.explanation_label = QLabel()
        self.explanation_label.setWordWrap(True)
        self.explanation_label.setStyleSheet("color: #666; margin-top: 10px;")
        self.question_layout.addWidget(self.explanation_label)
        
        self.question_layout.addStretch()
        
        # 更新进度
        self.spin_question.setValue(index + 1)
        self.progress_bar.setValue(index + 1)
        self.btn_prev.setEnabled(index > 0)
        self.btn_next.setEnabled(index < len(self.quiz_manager.questions) - 1)
        
        # 恢复之前的答案
        if index in self.quiz_manager.answers:
            self.restore_answer(index)
    
    def on_answer_changed(self):
        current_index = self.spin_question.value() - 1
        question = self.quiz_manager.get_question(current_index)
        
        selected = []
        for btn in self.option_buttons:
            if btn.isChecked():
                selected.append(btn.property('option_label'))
        
        if selected:
            self.quiz_manager.set_answer(current_index, selected)
            
            # 显示答案和解析
            correct = question['answer']
            is_correct = set(selected) == set(correct)
            
            result_text = f"正确答案: {correct}"
            if is_correct:
                result_text += " ✓"
                self.answer_label.setStyleSheet("color: green; font-weight: bold;")
            else:
                result_text += " ✗"
                self.answer_label.setStyleSheet("color: red; font-weight: bold;")
            
            self.answer_label.setText(result_text)
            
            if question.get('explanation'):
                self.explanation_label.setText(f"解析: {question['explanation']}")
            
            self.update_stats()
            
            # 自动保存进度
            self.quiz_manager.save_progress()
    
    def restore_answer(self, index):
        saved_answer = self.quiz_manager.answers[index]
        for btn in self.option_buttons:
            if btn.property('option_label') in saved_answer:
                btn.setChecked(True)
    
    def prev_question(self):
        current = self.spin_question.value() - 1
        if current > 0:
            self.show_question(current - 1)
    
    def next_question(self):
        current = self.spin_question.value() - 1
        if current < len(self.quiz_manager.questions) - 1:
            self.show_question(current + 1)
    
    def goto_question(self, value):
        self.show_question(value - 1)
    
    def change_mode(self):
        if self.radio_random.isChecked():
            self.quiz_manager.set_mode('random')
        else:
            self.quiz_manager.set_mode('sequential')
    
    def update_stats(self):
        stats = self.quiz_manager.get_stats()
        self.lbl_stats.setText(
            f"总题数: {stats['total']} | "
            f"已答: {stats['answered']} | "
            f"正确: {stats['correct']} | "
            f"正确率: {stats['accuracy']:.1f}%"
        )
    
    def keyPressEvent(self, event: QKeyEvent):
        """快捷键支持"""
        key = event.key()
        
        # 空格或右箭头 - 下一题
        if key in [Qt.Key.Key_Space, Qt.Key.Key_Right]:
            self.next_question()
        # 左箭头 - 上一题
        elif key == Qt.Key.Key_Left:
            self.prev_question()
        # A-E - 选择选项
        elif key in [Qt.Key.Key_A, Qt.Key.Key_B, Qt.Key.Key_C, Qt.Key.Key_D, Qt.Key.Key_E]:
            option_index = key - Qt.Key.Key_A
            if hasattr(self, 'option_buttons') and option_index < len(self.option_buttons):
                btn = self.option_buttons[option_index]
                if isinstance(btn, QCheckBox):
                    btn.setChecked(not btn.isChecked())
                elif isinstance(btn, QRadioButton):
                    btn.setChecked(True)
        
        super().keyPressEvent(event)
