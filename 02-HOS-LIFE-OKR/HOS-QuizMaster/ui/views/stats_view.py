#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
统计视图 - HOS-QuizMaster V2
Linear/Notion 风格重构

包含：
- 基础学习统计（总题数、已答题、正确率等）
- 统计卡片（今日/本周/总体/预测分数）
- 答题趋势折线图
- 题型表现柱状图
- 答题分布饼图
- 学习时段分析
- 知识点掌握度雷达图
- 知识点关联热力图
- 薄弱知识点列表及练习建议
"""

from PyQt6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QLabel,
                              QScrollArea, QFrame, QSizePolicy, QPushButton,
                              QProgressBar, QGraphicsDropShadowEffect)
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QPixmap, QFont, QColor

from ui.design_tokens import Color, Spacing, Radius, Typography, Shadow
from ui.widgets.stats_panel import StatsPanel
from ui.widgets.stats_cards import (TodayStatsCard, WeekStatsCard,
                                     OverallStatsCard, PredictedScoreCard)
from utils.stats_visualizer import StatsVisualizer


class HoverableSection(QFrame):
    """可悬停的区块容器 - Linear 风格：细腻边框 + 微妙阴影"""
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self._shadow = None
    
    def set_shadow(self, shadow):
        """设置阴影效果"""
        self._shadow = shadow
        self.setGraphicsEffect(shadow)
    
    def enterEvent(self, event):
        """鼠标进入 - 悬停阴影 + 边框加深 + 微妙上浮"""
        if self._shadow:
            # 使用设计令牌的悬停阴影
            self._shadow.setBlurRadius(Shadow.CARD_HOVER[0])
            self._shadow.setXOffset(Shadow.CARD_HOVER[1])
            self._shadow.setYOffset(Shadow.CARD_HOVER[2])
            self._shadow.setColor(QColor(0, 0, 0, int(Shadow.CARD_HOVER[3] * 255)))
        # 边框加深
        self.setStyleSheet(f"""
            QFrame {{
                background: {Color.BG_PRIMARY};
                border: 1px solid {Color.BORDER_DEFAULT};
                border-radius: {Radius.XL}px;
            }}
        """)
        super().enterEvent(event)
    
    def leaveEvent(self, event):
        """鼠标离开 - 恢复默认阴影和边框"""
        if self._shadow:
            # 恢复设计令牌的默认阴影
            self._shadow.setBlurRadius(Shadow.CARD_DEFAULT[0])
            self._shadow.setXOffset(Shadow.CARD_DEFAULT[1])
            self._shadow.setYOffset(Shadow.CARD_DEFAULT[2])
            self._shadow.setColor(QColor(0, 0, 0, int(Shadow.CARD_DEFAULT[3] * 255)))
        # 恢复默认边框
        self.setStyleSheet(f"""
            QFrame {{
                background: {Color.BG_PRIMARY};
                border: 1px solid {Color.BORDER_LIGHT};
                border-radius: {Radius.XL}px;
            }}
        """)
        super().leaveEvent(event)


class StatsView(QWidget):
    """统计视图 - Linear 风格"""

    def __init__(self, parent=None):
        super().__init__(parent)
        self.knowledge_manager = None
        self.visualizer = None
        self.stats_analyzer = None
        self.stats_visualizer = StatsVisualizer()
        self._init_ui()

    def _init_ui(self):
        """初始化 UI 布局"""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        content = QWidget()
        content.setStyleSheet(f"background: {Color.BG_PRIMARY};")
        self.container_layout = QVBoxLayout(content)
        self.container_layout.setContentsMargins(
            Spacing.XXXL, Spacing.XXL, Spacing.XXXL, Spacing.XXL)
        self.container_layout.setSpacing(Spacing.XL)

        # ===== 顶部栏 =====
        header = QHBoxLayout()
        header.setSpacing(Spacing.LG)

        title_layout = QVBoxLayout()
        title_layout.setSpacing(Spacing.XS)

        title = QLabel("数据统计")
        title.setFont(QFont("Microsoft YaHei", Typography.SIZE_XXL,
                            Typography.WEIGHT_BOLD))
        title.setStyleSheet(f"color: {Color.TEXT_PRIMARY};")
        title_layout.addWidget(title)

        subtitle = QLabel("学习分析 · 数据洞察")
        subtitle.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM))
        subtitle.setStyleSheet(f"color: {Color.TEXT_TERTIARY};")
        title_layout.addWidget(subtitle)

        header.addLayout(title_layout)
        header.addStretch()

        # 分段控件样式的时间段选择器
        self.period_buttons = []
        period_container = QFrame()
        period_container.setStyleSheet(f"""
            QFrame {{
                background: {Color.BG_SECONDARY};
                border-radius: {Radius.LG}px;
            }}
        """)
        period_layout = QHBoxLayout(period_container)
        period_layout.setContentsMargins(Spacing.XS, Spacing.XS,
                                         Spacing.XS, Spacing.XS)
        period_layout.setSpacing(Spacing.XXS)

        period_labels = ["今日", "本周", "本月", "全部"]
        for i, label in enumerate(period_labels):
            btn = QPushButton(label)
            btn.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM,
                              Typography.WEIGHT_MEDIUM))
            btn.setCursor(Qt.CursorShape.PointingHandCursor)
            btn.setFixedHeight(28)
            btn.setMinimumWidth(56)
            btn.setCheckable(False)
            btn.setStyleSheet(self._segment_btn_style(i == 0))
            btn.clicked.connect(lambda checked, idx=i: self._on_period_btn_clicked(idx))
            period_layout.addWidget(btn)
            self.period_buttons.append(btn)

        self._selected_period = 0
        header.addWidget(period_container)

        self.container_layout.addLayout(header)

        # ===== 滚动区域 =====
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(QFrame.Shape.NoFrame)
        scroll.setHorizontalScrollBarPolicy(
            Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        scroll.setVerticalScrollBarPolicy(
            Qt.ScrollBarPolicy.ScrollBarAsNeeded)
        scroll.setStyleSheet(f"""
            QScrollArea {{ border: none; background: transparent; }}
            QScrollBar:vertical {{
                background: transparent;
                width: 6px;
                margin: 0;
            }}
            QScrollBar::handle:vertical {{
                background: {Color.BORDER_DEFAULT};
                border-radius: 3px;
                min-height: 20px;
            }}
            QScrollBar::handle:vertical:hover {{
                background: {Color.BORDER_DARK};
            }}
            QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {{
                height: 0;
            }}
        """)

        scroll_container = QWidget()
        scroll_container.setStyleSheet("background: transparent;")
        inner_layout = QVBoxLayout(scroll_container)
        inner_layout.setContentsMargins(0, 0, 0, 0)
        inner_layout.setSpacing(Spacing.XL)

        # 统计卡片
        self._create_stats_cards_section(inner_layout)

        # 基础统计面板
        self.stats_panel = StatsPanel()
        inner_layout.addWidget(self.stats_panel)

        # 各图表区域
        self._create_trend_section(inner_layout)
        self._create_type_analysis_section(inner_layout)
        self._create_distribution_section(inner_layout)
        self._create_time_analysis_section(inner_layout)
        self._create_radar_section(inner_layout)
        self._create_heatmap_section(inner_layout)
        self._create_weak_points_section(inner_layout)
        self._create_suggestion_section(inner_layout)

        inner_layout.addStretch()
        scroll.setWidget(scroll_container)
        self.container_layout.addWidget(scroll, stretch=1)

        layout.addWidget(content)

    def _segment_btn_style(self, selected: bool) -> str:
        """分段控件按钮样式"""
        if selected:
            return f"""
                QPushButton {{
                    background: {Color.ACCENT_BG_HOVER};
                    color: {Color.ACCENT};
                    border: none;
                    border-radius: {Radius.MD}px;
                    padding: {Spacing.XS}px {Spacing.MD}px;
                    font-weight: {Typography.WEIGHT_SEMI};
                }}
                QPushButton:hover {{
                    background: {Color.ACCENT_BG};
                    border: 1px solid {Color.ACCENT_BORDER};
                }}
                QPushButton:pressed {{
                    background: {Color.ACCENT_BG_HOVER};
                    border: 1px solid {Color.ACCENT};
                }}
            """
        else:
            return f"""
                QPushButton {{
                    background: transparent;
                    color: {Color.TEXT_SECONDARY};
                    border: none;
                    border-radius: {Radius.MD}px;
                    padding: {Spacing.XS}px {Spacing.MD}px;
                }}
                QPushButton:hover {{
                    background: {Color.BG_HOVER};
                    color: {Color.TEXT_PRIMARY};
                    border: 1px solid {Color.BORDER_LIGHT};
                }}
                QPushButton:pressed {{
                    background: {Color.BG_ACTIVE};
                    color: {Color.TEXT_PRIMARY};
                    border: 1px solid {Color.BORDER_DEFAULT};
                }}
            """

    def _on_period_btn_clicked(self, index: int):
        """处理时间段按钮点击"""
        self._selected_period = index
        for i, btn in enumerate(self.period_buttons):
            btn.setStyleSheet(self._segment_btn_style(i == index))
        self.update_all_stats()

    def _create_section(self, title_text: str) -> QFrame:
        """创建统一的区块容器 - 图表区域优化"""
        section = HoverableSection()
        section.setStyleSheet(f"""
            QFrame {{
                background: {Color.BG_PRIMARY};
                border: 1px solid {Color.BORDER_LIGHT};
                border-radius: {Radius.XL}px;
            }}
        """)
        # 添加阴影 - 使用设计令牌 Shadow.CARD_DEFAULT
        shadow = QGraphicsDropShadowEffect()
        shadow.setBlurRadius(Shadow.CARD_DEFAULT[0])
        shadow.setXOffset(Shadow.CARD_DEFAULT[1])
        shadow.setYOffset(Shadow.CARD_DEFAULT[2])
        shadow.setColor(QColor(0, 0, 0, int(Shadow.CARD_DEFAULT[3] * 255)))
        section.set_shadow(shadow)
        
        layout = QVBoxLayout(section)
        layout.setContentsMargins(Spacing.XL, Spacing.LG, Spacing.XL, Spacing.LG)
        layout.setSpacing(Spacing.MD)

        title = QLabel(title_text)
        title.setFont(QFont("Microsoft YaHei", Typography.SIZE_MD,
                            Typography.WEIGHT_SEMI))
        title.setStyleSheet(f"color: {Color.TEXT_PRIMARY};")
        layout.addWidget(title)

        return section

    def _create_chart_placeholder(self, text: str) -> QLabel:
        """创建图表占位标签"""
        label = QLabel(text)
        label.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM))
        label.setStyleSheet(f"color: {Color.TEXT_TERTIARY};")
        label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        label.setMinimumHeight(240)
        label.setSizePolicy(QSizePolicy.Policy.Expanding,
                            QSizePolicy.Policy.Fixed)
        return label

    def _create_stats_cards_section(self, parent_layout):
        """创建统计卡片区域 - 增强视觉层次"""
        section = QFrame()
        section.setStyleSheet(f"""
            QFrame {{
                background: {Color.BG_PRIMARY};
            }}
        """)
        section_layout = QVBoxLayout(section)
        section_layout.setContentsMargins(0, 0, 0, 0)
        section_layout.setSpacing(Spacing.LG)

        # 区域标题
        section_title = QLabel("学习概览")
        section_title.setFont(QFont("Microsoft YaHei", Typography.SIZE_MD,
                                    Typography.WEIGHT_SEMI))
        section_title.setStyleSheet(f"color: {Color.TEXT_PRIMARY};")
        section_layout.addWidget(section_title)

        # 卡片行 - 间距 LG
        cards_row = QHBoxLayout()
        cards_row.setSpacing(Spacing.LG)

        self.today_card = TodayStatsCard()
        self.week_card = WeekStatsCard()
        self.overall_card = OverallStatsCard()
        self.predicted_card = PredictedScoreCard()

        cards_row.addWidget(self.today_card)
        cards_row.addWidget(self.week_card)
        cards_row.addWidget(self.overall_card)
        cards_row.addWidget(self.predicted_card)

        section_layout.addLayout(cards_row)
        parent_layout.addWidget(section)

    def _create_trend_section(self, parent_layout):
        """答题趋势"""
        section = self._create_section("答题趋势")
        self.trend_label = self._create_chart_placeholder(
            "答题后将显示正确率变化趋势")
        section.layout().addWidget(self.trend_label)
        parent_layout.addWidget(section)

    def _create_type_analysis_section(self, parent_layout):
        """题型表现"""
        section = self._create_section("题型表现分析")
        self.type_label = self._create_chart_placeholder(
            "答题后将显示各题型正确率对比")
        section.layout().addWidget(self.type_label)
        parent_layout.addWidget(section)

    def _create_distribution_section(self, parent_layout):
        """答题分布"""
        section = self._create_section("答题分布")
        self.dist_label = self._create_chart_placeholder(
            "答题后将显示正确/错误分布")
        section.layout().addWidget(self.dist_label)
        parent_layout.addWidget(section)

    def _create_time_analysis_section(self, parent_layout):
        """学习时段"""
        section = self._create_section("最佳学习时段")
        section_layout = section.layout()

        self.time_label = self._create_chart_placeholder(
            "答题后将显示各时段表现分析")
        section_layout.addWidget(self.time_label)

        self.study_time_label = QLabel("累计学习时长: 0 小时")
        self.study_time_label.setFont(QFont(
            "Microsoft YaHei", Typography.SIZE_SM))
        self.study_time_label.setStyleSheet(
            f"color: {Color.TEXT_SECONDARY};")
        section_layout.addWidget(self.study_time_label)

        parent_layout.addWidget(section)

    def _create_radar_section(self, parent_layout):
        """雷达图"""
        section = self._create_section("知识点掌握度")
        self.radar_label = self._create_chart_placeholder(
            "加载题库并答题后将显示知识点掌握度雷达图")
        section.layout().addWidget(self.radar_label)
        parent_layout.addWidget(section)

    def _create_heatmap_section(self, parent_layout):
        """热力图"""
        section = self._create_section("知识点关联热力图")
        self.heatmap_label = self._create_chart_placeholder(
            "答题数据充足后将显示知识点关联热力图")
        section.layout().addWidget(self.heatmap_label)
        parent_layout.addWidget(section)

    def _create_weak_points_section(self, parent_layout):
        """薄弱知识点 - 带进度条的卡片列表"""
        section = self._create_section("薄弱知识点")
        section_layout = section.layout()

        # 使用 QWidget 作为列表容器，便于自定义样式
        self.weak_list_container = QVBoxLayout()
        self.weak_list_container.setSpacing(Spacing.SM)
        self.weak_list_container.setContentsMargins(0, 0, 0, 0)

        # 占位提示
        self.weak_hint = QLabel("暂无薄弱知识点数据")
        self.weak_hint.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM))
        self.weak_hint.setStyleSheet(f"color: {Color.TEXT_TERTIARY};")
        self.weak_hint.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.weak_hint.setMinimumHeight(120)
        self.weak_list_container.addWidget(self.weak_hint)

        section_layout.addLayout(self.weak_list_container)
        parent_layout.addWidget(section)

    def _create_suggestion_section(self, parent_layout):
        """练习建议 - ACCENT_BG 背景 + 左侧指示条"""
        section = self._create_section("针对性练习建议")
        section_layout = section.layout()

        # 建议列表容器
        self.suggestion_container = QVBoxLayout()
        self.suggestion_container.setSpacing(Spacing.SM)
        self.suggestion_container.setContentsMargins(0, 0, 0, 0)

        # 占位提示
        self.suggestion_hint = QLabel("完成答题后将生成针对性练习建议")
        self.suggestion_hint.setFont(
            QFont("Microsoft YaHei", Typography.SIZE_SM))
        self.suggestion_hint.setStyleSheet(f"color: {Color.TEXT_TERTIARY};")
        self.suggestion_hint.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.suggestion_hint.setMinimumHeight(100)
        self.suggestion_container.addWidget(self.suggestion_hint)

        section_layout.addLayout(self.suggestion_container)
        parent_layout.addWidget(section)

    # ===== 数据注入 =====

    def set_knowledge_manager(self, km):
        self.knowledge_manager = km

    def set_visualizer(self, viz):
        self.visualizer = viz

    def set_stats_analyzer(self, analyzer):
        self.stats_analyzer = analyzer

    # ===== 更新逻辑 =====

    def _on_period_changed(self, index):
        self.update_all_stats()

    def update_all_stats(self):
        if not self.stats_analyzer:
            return
        try:
            self._update_stats_cards()
            self._update_trend_chart()
            self._update_type_chart()
            self._update_distribution_chart()
            self._update_time_chart()
            if self.knowledge_manager and self.visualizer:
                self._update_knowledge_visuals()
        except Exception as e:
            print(f"统计更新失败: {e}")

    def _update_stats_cards(self):
        analyzer = self.stats_analyzer
        self.today_card.update_stats(analyzer.get_today_stats())
        self.week_card.update_stats(analyzer.get_week_stats())
        self.overall_card.update_stats(analyzer.get_overall_stats())
        self.predicted_card.update_stats(analyzer.calculate_predicted_score())

    def _update_trend_chart(self):
        period_map = {0: 'day', 1: 'week', 2: 'month', 3: 'all'}
        period = period_map.get(self._selected_period, 'week')
        period_labels = ["今日", "本周", "本月", "全部"]
        period_text = period_labels[self._selected_period]
        trend_data = self.stats_analyzer.get_trend_analysis(period)
        if trend_data['dates']:
            fig = self.stats_visualizer.create_trend_chart(
                trend_data['dates'],
                trend_data['accuracies'],
                title=f"答题趋势（{period_text}）")
            img_bytes = self.stats_visualizer.figure_to_image(fig)
            self._set_chart_image(self.trend_label, img_bytes)

    def _update_type_chart(self):
        type_data = self.stats_analyzer.get_question_type_analysis()
        if type_data['type_stats']:
            fig = self.stats_visualizer.create_type_comparison_chart(
                type_data['type_stats'], title="题型表现对比")
            img_bytes = self.stats_visualizer.figure_to_image(fig)
            self._set_chart_image(self.type_label, img_bytes)

    def _update_distribution_chart(self):
        overall = self.stats_analyzer.get_overall_stats()
        if overall['total_answers'] > 0:
            fig = self.stats_visualizer.create_distribution_pie_chart(
                overall['correct_answers'],
                overall['incorrect_answers'], title="答题分布")
            img_bytes = self.stats_visualizer.figure_to_image(fig)
            self._set_chart_image(self.dist_label, img_bytes)

    def _update_time_chart(self):
        time_data = self.stats_analyzer.get_time_analysis()
        total_hours = time_data['total_study_hours']
        session_count = time_data['session_count']
        self.study_time_label.setText(
            f"累计学习时长: {total_hours:.1f} 小时 | "
            f"学习次数: {session_count} 次 | "
            f"平均时长: {time_data['avg_session_duration']:.0f} 分钟")
        if time_data['hourly_stats']:
            fig = self.stats_visualizer.create_hourly_heatmap(
                time_data['hourly_stats'], title="最佳学习时段")
            img_bytes = self.stats_visualizer.figure_to_image(fig)
            self._set_chart_image(self.time_label, img_bytes)

    def update_stats(self, stats: dict):
        self.stats_panel.update_stats(stats)
        if self.knowledge_manager and self.visualizer:
            self._update_knowledge_visuals()

    def _update_knowledge_visuals(self):
        try:
            km = self.knowledge_manager
            viz = self.visualizer
            all_kps = km.kp_dao.get_all()
            if not all_kps:
                km.auto_link_questions()
                all_kps = km.kp_dao.get_all()
            if not all_kps:
                return
            all_mastery = km.calculate_all_mastery()
            self._update_radar_chart(all_kps, all_mastery, viz)
            self._update_heatmap(km, viz)
            self._update_weak_points(km)
            self._update_suggestions(km)
        except Exception as e:
            print(f"知识点可视化更新失败: {e}")

    def _update_radar_chart(self, all_kps, all_mastery, viz):
        labels, values = [], []
        for kp in all_kps:
            mastery = all_mastery.get(kp['id'], 0)
            if mastery > 0:
                labels.append(kp['name'])
                values.append(mastery)
            if len(labels) >= 12:
                break
        if not labels:
            return
        img_bytes = viz.create_radar_chart(labels, values, title="知识点掌握度")
        if img_bytes:
            self._set_chart_image(self.radar_label, img_bytes)

    def _update_heatmap(self, km, viz):
        names, matrix = km.get_correlation_matrix()
        if not names or not matrix:
            return
        img_bytes = viz.create_heatmap(
            matrix, names, title="知识点关联热力图")
        if img_bytes:
            self._set_chart_image(self.heatmap_label, img_bytes)

    def _set_chart_image(self, label: QLabel, img_bytes: bytes):
        try:
            pixmap = QPixmap()
            pixmap.loadFromData(img_bytes, 'PNG')
            if not pixmap.isNull():
                scaled = pixmap.scaled(
                    600, 400,
                    Qt.AspectRatioMode.KeepAspectRatio,
                    Qt.TransformationMode.SmoothTransformation)
                label.setPixmap(scaled)
                label.setStyleSheet("")
        except Exception:
            pass

    def _update_weak_points(self, km):
        """更新薄弱知识点列表 - 带进度条的卡片"""
        weak_points = km.get_weak_points(threshold=60.0, limit=10)
        
        # 清空现有项
        while self.weak_list_container.count():
            item = self.weak_list_container.takeAt(0)
            if item.widget():
                item.widget().deleteLater()
        
        if not weak_points:
            self.weak_hint.setText("暂无薄弱知识点，继续保持！")
            self.weak_hint.setStyleSheet(f"color: {Color.SUCCESS};")
            self.weak_hint.show()
            return
        
        self.weak_hint.hide()
        
        for kp in weak_points:
            mastery = kp['mastery_level']
            name = kp['name']
            q_count = kp.get('question_count', 0)
            
            # 根据掌握度确定颜色
            if mastery < 40:
                color = Color.ERROR
            elif mastery < 60:
                color = Color.WARNING
            else:
                color = Color.SUCCESS
            
            # 创建卡片项
            item_widget = QFrame()
            item_widget.setStyleSheet(f"""
                QFrame {{
                    background: {Color.BG_SECONDARY};
                    border-radius: {Radius.LG}px;
                }}
                QFrame:hover {{
                    background: {Color.BG_HOVER};
                }}
            """)
            item_widget.setCursor(Qt.CursorShape.PointingHandCursor)
            item_widget.setProperty("_kp_data", kp)
            item_widget.mousePressEvent = lambda event, k=kp: self._on_weak_point_clicked(k)
            
            item_layout = QHBoxLayout(item_widget)
            item_layout.setContentsMargins(Spacing.MD, Spacing.SM,
                                          Spacing.MD, Spacing.SM)
            item_layout.setSpacing(Spacing.MD)
            
            # 左侧信息
            info_layout = QVBoxLayout()
            info_layout.setSpacing(Spacing.XS)
            
            name_label = QLabel(name)
            name_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM,
                                    Typography.WEIGHT_MEDIUM))
            name_label.setStyleSheet(f"color: {Color.TEXT_PRIMARY};")
            info_layout.addWidget(name_label)
            
            detail_label = QLabel(f"关联题目: {q_count} 题")
            detail_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_XS))
            detail_label.setStyleSheet(f"color: {Color.TEXT_TERTIARY};")
            info_layout.addWidget(detail_label)
            
            item_layout.addLayout(info_layout, stretch=1)
            
            # 右侧进度条
            progress = QProgressBar()
            progress.setValue(int(mastery))
            progress.setFixedWidth(120)
            progress.setFixedHeight(8)
            progress.setTextVisible(False)
            progress.setStyleSheet(f"""
                QProgressBar {{
                    background: {Color.BG_QUATERNARY};
                    border-radius: 4px;
                    border: none;
                }}
                QProgressBar::chunk {{
                    background: {color};
                    border-radius: 4px;
                }}
            """)
            item_layout.addWidget(progress)
            
            # 掌握度数值
            mastery_label = QLabel(f"{mastery:.1f}%")
            mastery_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM,
                                       Typography.WEIGHT_SEMI))
            mastery_label.setStyleSheet(f"color: {color};")
            mastery_label.setFixedWidth(50)
            mastery_label.setAlignment(Qt.AlignmentFlag.AlignRight |
                                      Qt.AlignmentFlag.AlignVCenter)
            item_layout.addWidget(mastery_label)
            
            self.weak_list_container.addWidget(item_widget)

    def _update_suggestions(self, km):
        """更新练习建议 - ACCENT_BG 背景 + 左侧指示条"""
        weak_points = km.get_weak_points(threshold=60.0, limit=5)
        
        # 清空现有项
        while self.suggestion_container.count():
            item = self.suggestion_container.takeAt(0)
            if item.widget():
                item.widget().deleteLater()
        
        if not weak_points:
            self.suggestion_hint.setText("所有知识点掌握良好，建议挑战更高难度！")
            self.suggestion_hint.setStyleSheet(f"color: {Color.SUCCESS};")
            self.suggestion_hint.show()
            return
        
        self.suggestion_hint.hide()
        
        for kp in weak_points:
            name = kp['name']
            mastery = kp['mastery_level']
            suggested = km.get_suggested_exercises(kp['id'])
            
            # 创建建议卡片
            card = QFrame()
            card.setStyleSheet(f"""
                QFrame {{
                    background: {Color.ACCENT_BG};
                    border-left: 3px solid {Color.ACCENT};
                    border-radius: {Radius.MD}px;
                }}
            """)
            card_layout = QHBoxLayout(card)
            card_layout.setContentsMargins(Spacing.MD, Spacing.SM,
                                          Spacing.MD, Spacing.SM)
            
            # 文本内容
            text_layout = QVBoxLayout()
            text_layout.setSpacing(Spacing.XS)
            
            title_label = QLabel(f"【{name}】掌握度 {mastery:.1f}%")
            title_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_SM,
                                     Typography.WEIGHT_MEDIUM))
            title_label.setStyleSheet(f"color: {Color.TEXT_PRIMARY};")
            text_layout.addWidget(title_label)
            
            if suggested:
                q_numbers = [str(q.get('number', '?')) for q in suggested[:5]]
                nums_str = ', '.join(q_numbers)
                detail_text = f"建议练习第 {nums_str} 题"
            else:
                detail_text = "暂无推荐题目"
            
            detail_label = QLabel(detail_text)
            detail_label.setFont(QFont("Microsoft YaHei", Typography.SIZE_XS))
            detail_label.setStyleSheet(f"color: {Color.TEXT_SECONDARY};")
            text_layout.addWidget(detail_label)
            
            card_layout.addLayout(text_layout, stretch=1)
            self.suggestion_container.addWidget(card)

    def _on_weak_point_clicked(self, kp: dict):
        """处理薄弱知识点点击"""
        if kp and self.knowledge_manager:
            stats = self.knowledge_manager.get_knowledge_stats(kp['id'])
            self.weak_hint.setText(
                f"【{kp['name']}】关联 {stats['total_questions']} 题，"
                f"已答 {stats['answered_questions']} 题，"
                f"正确率 {stats['accuracy']:.1f}%")
            self.weak_hint.setStyleSheet(f"color: {Color.TEXT_SECONDARY};")
            self.weak_hint.show()

    def update_layout_for_size(self, width: int):
        """根据窗口宽度更新布局 - 响应式设计"""
        # 调整内容区边距
        if width >= 1400:
            self.container_layout.setContentsMargins(Spacing.XXXL, Spacing.XXL, Spacing.XXXL, Spacing.XXL)
        elif width >= 1200:
            self.container_layout.setContentsMargins(Spacing.XXL, Spacing.XL, Spacing.XXL, Spacing.XL)
        else:
            self.container_layout.setContentsMargins(Spacing.XL, Spacing.LG, Spacing.XL, Spacing.LG)
        
        # 根据窗口宽度调整图表尺寸
        if hasattr(self, 'trend_label'):
            if width >= 1400:
                chart_height = 320
            elif width >= 1200:
                chart_height = 280
            else:
                chart_height = 240
            
            # 更新所有图表占位符的高度
            for label in [self.trend_label, self.type_label, self.dist_label, 
                         self.time_label, self.radar_label, self.heatmap_label]:
                label.setMinimumHeight(chart_height)
