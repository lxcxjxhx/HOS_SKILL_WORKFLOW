#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
考试配置对话框 - HOS-QuizMaster V2
Phase 6: 考试系统
"""

import json
from typing import Dict, List, Optional

from PyQt6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QLabel, QPushButton,
    QSpinBox, QDoubleSpinBox, QGroupBox, QCheckBox, QComboBox,
    QLineEdit, QScrollArea, QWidget, QRadioButton, QButtonGroup,
    QFileDialog, QMessageBox, QFrame, QGraphicsDropShadowEffect
)
from PyQt6.QtCore import Qt, pyqtSignal, QSize
from PyQt6.QtGui import QColor, QFont

from ui.design_tokens import Color, Spacing, Radius, Typography, Shadow


class ExamConfigDialog(QDialog):
    """
    考试配置对话框
    
    支持配置:
    - 题型分布
    - 知识点筛选
    - 难度分布
    - 考试时长
    - 预设模板
    """
    
    # 预设模板
    PRESETS = {
        "模拟考试": {
            "type_counts": {"单选题": 20, "多选题": 10, "判断题": 20},
            "time_limit": 120,
            "difficulty_dist": {"简单": 0.3, "中等": 0.5, "困难": 0.2},
        },
        "练习卷": {
            "type_counts": {"单选题": 10, "多选题": 5, "判断题": 10},
            "time_limit": 60,
            "difficulty_dist": {"简单": 0.5, "中等": 0.4, "困难": 0.1},
        },
        "专项训练": {
            "type_counts": {"单选题": 30},
            "time_limit": 0,
            "difficulty_dist": {"简单": 0.2, "中等": 0.5, "困难": 0.3},
        },
    }
    
    def __init__(
        self,
        available_types: List[str],
        available_knowledge: List[str],
        parent=None,
    ):
        super().__init__(parent)
        self.setWindowTitle("配置试卷")
        self.setMinimumSize(600, 500)
        
        self.available_types = available_types
        self.available_knowledge = available_knowledge
        
        self.init_ui()
        self._apply_window_style()
        self._apply_shadow()
        self.load_preset("模拟考试")  # 默认加载模拟考试模板
    
    def _apply_window_style(self):
        """应用弹窗整体样式"""
        self.setStyleSheet(f"""
            QDialog {{
                background-color: {Color.BG_PRIMARY};
                border: 1px solid {Color.BORDER_LIGHT};
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
        # 基础宽度：考虑边距和滚动条
        width = 700
        # 计算内容高度：标题 + 预设 + 标题输入 + 题型 + 难度 + 知识点 + 时长 + 预览 + 按钮
        base_height = 48  # 标题
        base_height += 80  # 预设模板组
        base_height += 70  # 试卷标题组
        base_height += 40 + len(self.available_types) * 35  # 题型分布（动态）
        base_height += 150  # 难度分布组
        if self.available_knowledge:
            base_height += 60 + min(len(self.available_knowledge), 20) * 28  # 知识点（最多20项）
        base_height += 70  # 考试时长组
        base_height += 60  # 预览组
        base_height += 50  # 按钮区域
        base_height += 40  # 边距和间距
        # 限制高度：最小 400px，最大不超过屏幕高度的 90%
        screen = QApplication.primaryScreen()
        max_height = int(screen.availableGeometry().height() * 0.9) if screen else 900
        height = min(max(base_height, 500), max_height)
        return QSize(width, height)

    def init_ui(self):
        """初始化 UI"""
        layout = QVBoxLayout(self)
        layout.setSpacing(Spacing.XL)
        layout.setContentsMargins(Spacing.XXL, Spacing.XXL, Spacing.XXL, Spacing.XXL)
        
        # 标题
        title = QLabel("配置试卷生成规则")
        title.setFont(QFont("Microsoft YaHei", Typography.SIZE_XL, Typography.WEIGHT_BOLD))
        title.setStyleSheet(f"color: {Color.TEXT_PRIMARY};")
        layout.addWidget(title)
        
        # 分隔线
        divider = QFrame()
        divider.setFrameShape(QFrame.Shape.HLine)
        divider.setStyleSheet(f"background: {Color.BORDER_DEFAULT}; max-height: 1px; margin: {Spacing.MD}px 0;")
        layout.addWidget(divider)
        
        # 预设模板
        preset_group = QGroupBox("预设模板")
        preset_group.setStyleSheet(f"""
            QGroupBox {{
                font-size: {Typography.SIZE_SM}px;
                font-weight: {Typography.WEIGHT_SEMI};
                color: {Color.TEXT_SECONDARY};
                border: 1px solid {Color.BORDER_DEFAULT};
                border-radius: {Radius.LG}px;
                margin-top: {Spacing.MD}px;
                padding-top: {Spacing.XL}px;
                background: {Color.BG_SECONDARY};
            }}
            QGroupBox::title {{
                subcontrol-origin: margin;
                left: {Spacing.MD}px;
                padding: 0 {Spacing.SM}px;
            }}
        """)
        preset_layout = QHBoxLayout(preset_group)
        
        self.preset_combo = QComboBox()
        self.preset_combo.addItems(list(self.PRESETS.keys()) + ["自定义"])
        self.preset_combo.currentTextChanged.connect(self.on_preset_changed)
        self.preset_combo.setStyleSheet(f"""
            QComboBox {{
                background: {Color.BG_PRIMARY};
                border: 1px solid {Color.BORDER_DEFAULT};
                border-radius: {Radius.MD}px;
                padding: {Spacing.SM}px {Spacing.MD}px;
                font-size: {Typography.SIZE_SM}px;
                color: {Color.TEXT_PRIMARY};
            }}
            QComboBox:hover {{
                border-color: {Color.ACCENT};
            }}
            QComboBox:focus {{
                border-color: {Color.ACCENT};
            }}
        """)
        preset_layout.addWidget(QLabel("选择模板:"))
        preset_layout.addWidget(self.preset_combo, stretch=1)
        
        layout.addWidget(preset_group)
        
        # 滚动区域
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(QFrame.Shape.NoFrame)
        scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        scroll.setStyleSheet(f"""
            QScrollArea {{
                border: none;
                background: transparent;
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
        
        scroll_content = QWidget()
        scroll_layout = QVBoxLayout(scroll_content)
        scroll_layout.setSpacing(Spacing.LG)
        scroll_layout.setContentsMargins(0, 0, 0, 0)
        
        # 试卷标题
        title_group = QGroupBox("试卷标题")
        title_layout = QVBoxLayout(title_group)
        self.title_input = QLineEdit("模拟试卷")
        self.title_input.setPlaceholderText("输入试卷标题")
        title_layout.addWidget(self.title_input)
        scroll_layout.addWidget(title_group)
        
        # 题型分布
        type_group = QGroupBox("题型分布")
        type_layout = QVBoxLayout(type_group)
        
        self.type_spins = {}
        for q_type in self.available_types:
            row = QHBoxLayout()
            label = QLabel(f"{q_type}:")
            label.setMinimumWidth(80)
            spin = QSpinBox()
            spin.setRange(0, 100)
            spin.setValue(0)
            spin.setSuffix(" 题")
            self.type_spins[q_type] = spin
            row.addWidget(label)
            row.addWidget(spin, stretch=1)
            type_layout.addLayout(row)
        
        scroll_layout.addWidget(type_group)
        
        # 难度分布
        diff_group = QGroupBox("难度分布")
        diff_layout = QVBoxLayout(diff_group)
        
        self.diff_spins = {}
        for diff in ["简单", "中等", "困难"]:
            row = QHBoxLayout()
            label = QLabel(f"{diff}:")
            label.setMinimumWidth(80)
            spin = QDoubleSpinBox()
            spin.setRange(0.0, 1.0)
            spin.setSingleStep(0.1)
            spin.setDecimals(1)
            self.diff_spins[diff] = spin
            row.addWidget(label)
            row.addWidget(spin, stretch=1)
            diff_layout.addLayout(row)
        
        # 难度分布提示
        diff_hint = QLabel("提示: 难度比例之和应为 1.0")
        diff_hint.setStyleSheet("font-size: 11px; color: #6b7280;")
        diff_layout.addWidget(diff_hint)
        
        scroll_layout.addWidget(diff_group)
        
        # 知识点筛选
        if self.available_knowledge:
            knowledge_group = QGroupBox("知识点筛选（可选）")
            knowledge_layout = QVBoxLayout(knowledge_group)
            
            knowledge_hint = QLabel("选择要考察的知识点（留空表示不限制）:")
            knowledge_hint.setStyleSheet("font-size: 12px; color: #6b7280;")
            knowledge_layout.addWidget(knowledge_hint)
            
            self.knowledge_checks = {}
            for kp in self.available_knowledge[:20]:  # 限制最多显示 20 个
                cb = QCheckBox(kp)
                self.knowledge_checks[kp] = cb
                knowledge_layout.addWidget(cb)
            
            if len(self.available_knowledge) > 20:
                more_label = QLabel(f"... 还有 {len(self.available_knowledge) - 20} 个知识点")
                more_label.setStyleSheet("font-size: 11px; color: #9ca3af;")
                knowledge_layout.addWidget(more_label)
            
            scroll_layout.addWidget(knowledge_group)
        
        # 考试时长
        time_group = QGroupBox("考试时长")
        time_layout = QHBoxLayout(time_group)
        
        self.time_spin = QSpinBox()
        self.time_spin.setRange(0, 300)
        self.time_spin.setValue(120)
        self.time_spin.setSuffix(" 分钟")
        self.time_spin.setSpecialValueText("不限时")
        time_layout.addWidget(QLabel("时长:"))
        time_layout.addWidget(self.time_spin, stretch=1)
        
        scroll_layout.addWidget(time_group)
        
        # 预览
        preview_group = QGroupBox("预览")
        preview_layout = QVBoxLayout(preview_group)
        
        self.preview_label = QLabel("预计题目数: 0")
        self.preview_label.setStyleSheet("font-size: 13px; color: #374151;")
        preview_layout.addWidget(self.preview_label)
        
        scroll_layout.addWidget(preview_group)
        
        scroll_layout.addStretch()
        scroll.setWidget(scroll_content)
        layout.addWidget(scroll, stretch=1)
        
        # 按钮
        button_layout = QHBoxLayout()
        
        self.save_config_btn = QPushButton("保存配置")
        self.save_config_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.save_config_btn.setStyleSheet(f"""
            QPushButton {{
                background: {Color.BG_PRIMARY};
                color: {Color.TEXT_PRIMARY};
                border: 1px solid {Color.BORDER_DEFAULT};
                border-radius: {Radius.MD}px;
                padding: {Spacing.SM}px {Spacing.LG}px;
                font-size: {Typography.SIZE_SM}px;
            }}
            QPushButton:hover {{
                background: {Color.BG_HOVER};
                border-color: {Color.BORDER_DARK};
            }}
            QPushButton:pressed {{
                background: {Color.BG_ACTIVE};
            }}
            QPushButton:disabled {{
                background: {Color.BG_SECONDARY};
                color: {Color.TEXT_DISABLED};
                border-color: {Color.BORDER_LIGHT};
            }}
        """)
        self.save_config_btn.clicked.connect(self.save_config)
        
        self.load_config_btn = QPushButton("加载配置")
        self.load_config_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.load_config_btn.setStyleSheet(f"""
            QPushButton {{
                background: {Color.BG_PRIMARY};
                color: {Color.TEXT_PRIMARY};
                border: 1px solid {Color.BORDER_DEFAULT};
                border-radius: {Radius.MD}px;
                padding: {Spacing.SM}px {Spacing.LG}px;
                font-size: {Typography.SIZE_SM}px;
            }}
            QPushButton:hover {{
                background: {Color.BG_HOVER};
                border-color: {Color.BORDER_DARK};
            }}
            QPushButton:pressed {{
                background: {Color.BG_ACTIVE};
            }}
            QPushButton:disabled {{
                background: {Color.BG_SECONDARY};
                color: {Color.TEXT_DISABLED};
                border-color: {Color.BORDER_LIGHT};
            }}
        """)
        self.load_config_btn.clicked.connect(self.load_config)
        
        self.generate_btn = QPushButton("生成试卷")
        self.generate_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.generate_btn.setStyleSheet(f"""
            QPushButton {{
                background: {Color.ACCENT};
                color: {Color.TEXT_INVERSE};
                border: none;
                border-radius: {Radius.MD}px;
                padding: {Spacing.SM}px {Spacing.LG}px;
                font-size: {Typography.SIZE_SM}px;
                font-weight: {Typography.WEIGHT_SEMI};
            }}
            QPushButton:hover {{
                background: {Color.ACCENT_HOVER};
            }}
            QPushButton:pressed {{
                background: {Color.ACCENT_ACTIVE};
            }}
            QPushButton:disabled {{
                background: {Color.BG_QUATERNARY};
                color: {Color.TEXT_DISABLED};
            }}
        """)
        self.generate_btn.clicked.connect(self.accept)
        
        button_layout.addWidget(self.save_config_btn)
        button_layout.addWidget(self.load_config_btn)
        button_layout.addStretch()
        button_layout.addWidget(self.generate_btn)
        
        layout.addLayout(button_layout)
        
        # 连接信号更新预览
        for spin in self.type_spins.values():
            spin.valueChanged.connect(self.update_preview)
        for spin in self.diff_spins.values():
            spin.valueChanged.connect(self.update_preview)
    
    def on_preset_changed(self, preset_name: str):
        """预设模板变更"""
        if preset_name in self.PRESETS:
            self.load_preset(preset_name)
    
    def load_preset(self, preset_name: str):
        """加载预设模板"""
        if preset_name not in self.PRESETS:
            return
        
        preset = self.PRESETS[preset_name]
        
        # 题型分布
        type_counts = preset.get("type_counts", {})
        for q_type, count in type_counts.items():
            if q_type in self.type_spins:
                self.type_spins[q_type].setValue(count)
        
        # 难度分布
        diff_dist = preset.get("difficulty_dist", {})
        for diff, ratio in diff_dist.items():
            if diff in self.diff_spins:
                self.diff_spins[diff].setValue(ratio)
        
        # 考试时长
        self.time_spin.setValue(preset.get("time_limit", 120))
        
        self.update_preview()
    
    def update_preview(self):
        """更新预览信息"""
        total = sum(spin.value() for spin in self.type_spins.values())
        self.preview_label.setText(f"预计题目数: {total}")
    
    def get_config(self) -> Dict:
        """获取配置"""
        # 题型分布
        type_counts = {}
        for q_type, spin in self.type_spins.items():
            count = spin.value()
            if count > 0:
                type_counts[q_type] = count
        
        # 难度分布
        difficulty_dist = {}
        for diff, spin in self.diff_spins.items():
            ratio = spin.value()
            if ratio > 0:
                difficulty_dist[diff] = ratio
        
        # 知识点
        knowledge_points = []
        if hasattr(self, 'knowledge_checks'):
            for kp, cb in self.knowledge_checks.items():
                if cb.isChecked():
                    knowledge_points.append(kp)
        
        return {
            "title": self.title_input.text() or "模拟试卷",
            "type_counts": type_counts,
            "difficulty_dist": difficulty_dist,
            "knowledge_points": knowledge_points,
            "time_limit": self.time_spin.value(),
        }
    
    def save_config(self):
        """保存配置到文件"""
        config = self.get_config()
        file_path, _ = QFileDialog.getSaveFileName(
            self, "保存配置", "exam_config.json",
            "JSON Files (*.json)"
        )
        
        if file_path:
            try:
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(config, f, ensure_ascii=False, indent=2)
                QMessageBox.information(self, "成功", "配置已保存")
            except Exception as e:
                QMessageBox.critical(self, "错误", f"保存配置失败:\n{str(e)}")
    
    def load_config(self):
        """从文件加载配置"""
        file_path, _ = QFileDialog.getOpenFileName(
            self, "加载配置", "",
            "JSON Files (*.json)"
        )
        
        if not file_path:
            return
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                config = json.load(f)
            
            # 应用配置
            if "title" in config:
                self.title_input.setText(config["title"])
            
            type_counts = config.get("type_counts", {})
            for q_type, count in type_counts.items():
                if q_type in self.type_spins:
                    self.type_spins[q_type].setValue(count)
            
            diff_dist = config.get("difficulty_dist", {})
            for diff, ratio in diff_dist.items():
                if diff in self.diff_spins:
                    self.diff_spins[diff].setValue(ratio)
            
            if hasattr(self, 'knowledge_checks'):
                knowledge_points = config.get("knowledge_points", [])
                for kp in knowledge_points:
                    if kp in self.knowledge_checks:
                        self.knowledge_checks[kp].setChecked(True)
            
            if "time_limit" in config:
                self.time_spin.setValue(config["time_limit"])
            
            self.preset_combo.setCurrentText("自定义")
            self.update_preview()
            
            QMessageBox.information(self, "成功", "配置已加载")
        except Exception as e:
            QMessageBox.critical(self, "错误", f"加载配置失败:\n{str(e)}")
    
    def validate_config(self) -> Optional[str]:
        """
        验证配置是否有效
        
        Returns:
            错误信息，如果有效则返回 None
        """
        config = self.get_config()
        
        # 检查题型分布
        if not config["type_counts"]:
            return "请至少设置一种题型的数量"
        
        total_questions = sum(config["type_counts"].values())
        if total_questions == 0:
            return "题目总数不能为 0"
        
        # 检查难度分布
        if config["difficulty_dist"]:
            total_ratio = sum(config["difficulty_dist"].values())
            if abs(total_ratio - 1.0) > 0.01:
                return f"难度分布比例之和应为 1.0，当前为 {total_ratio:.1f}"
        
        # 检查考试时长
        if config["time_limit"] < 0:
            return "考试时长不能为负数"
        
        return None
