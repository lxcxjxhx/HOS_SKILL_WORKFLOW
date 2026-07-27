#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
知识点可视化模块 - HOS-QuizMaster V2
Phase 7: 知识点管理系统

提供知识点相关的可视化图表：
- 雷达图（Radar Chart）：展示各知识点掌握度
- 热力图（Heatmap）：展示知识点关联强度
"""

import io
import math
from typing import List, Dict, Tuple, Optional

import numpy as np
import matplotlib
matplotlib.use('Agg')  # 使用非交互式后端，避免 GUI 问题
import matplotlib.pyplot as plt
from matplotlib.patches import Circle, RegularPolygon
from matplotlib.path import Path
from matplotlib.projections import register_projection
from matplotlib.spines import Spine
import matplotlib.patches as mpatches


# 设置中文字体（支持中文显示）
plt.rcParams['font.sans-serif'] = ['SimHei', 'Microsoft YaHei', 'DejaVu Sans']
plt.rcParams['axes.unicode_minus'] = False  # 解决负号显示问题


class KnowledgeVisualizer:
    """
    知识点可视化器
    
    提供知识点掌握度和关联性的可视化图表生成
    """
    
    def __init__(self, figsize: Tuple[int, int] = (8, 8), dpi: int = 100):
        """
        初始化可视化器
        
        Args:
            figsize: 图表尺寸 (宽, 高)，单位英寸
            dpi: 图像分辨率
        """
        self.figsize = figsize
        self.dpi = dpi
        self._setup_style()
    
    def _setup_style(self):
        """设置图表样式"""
        # 定义配色方案
        self.colors = {
            'primary': '#2563eb',      # 主色 - 蓝色
            'secondary': '#06b6d4',    # 辅色 - 青色
            'success': '#22c55e',      # 成功 - 绿色
            'warning': '#f59e0b',      # 警告 - 橙色
            'danger': '#ef4444',       # 危险 - 红色
            'gray': '#6b7280',         # 灰色
            'light_gray': '#e5e7eb',   # 浅灰
            'background': '#ffffff',   # 背景
        }
        
        # 掌握度颜色映射（低 -> 高）
        self.mastery_cmap = plt.cm.RdYlGn  # 红->黄->绿
    
    def create_radar_chart(
        self,
        labels: List[str],
        values: List[float],
        title: str = "知识点掌握度",
        max_value: float = 100.0,
        fill_alpha: float = 0.25
    ) -> Optional[bytes]:
        """
        创建雷达图展示各知识点掌握度
        
        Args:
            labels: 知识点名称列表
            values: 对应的掌握度值列表（0-100）
            title: 图表标题
            max_value: 最大值（用于归一化）
            fill_alpha: 填充区域透明度
            
        Returns:
            PNG 图片的字节数据，如果数据为空则返回 None
        """
        if not labels or not values or len(labels) != len(values):
            return None
        
        # 限制最多显示12个知识点（避免过于拥挤）
        if len(labels) > 12:
            labels = labels[:12]
            values = values[:12]
        
        n = len(labels)
        
        # 计算角度
        angles = np.linspace(0, 2 * np.pi, n, endpoint=False).tolist()
        angles += angles[:1]  # 闭合
        values_closed = values + values[:1]  # 闭合
        
        # 创建图形
        fig, ax = plt.subplots(figsize=self.figsize, subplot_kw=dict(polar=True))
        
        # 绘制雷达图
        ax.plot(angles, values_closed, 'o-', linewidth=2, color=self.colors['primary'])
        ax.fill(angles, values_closed, alpha=fill_alpha, color=self.colors['primary'])
        
        # 设置刻度和标签
        ax.set_ylim(0, max_value)
        ax.set_yticks([20, 40, 60, 80, 100])
        ax.set_yticklabels(['20', '40', '60', '80', '100'], fontsize=9, color=self.colors['gray'])
        ax.set_xticks(angles[:-1])
        ax.set_xticklabels(labels, fontsize=10, color=self.colors['gray'])
        
        # 添加网格线
        ax.grid(True, linestyle='--', alpha=0.6, color=self.colors['light_gray'])
        
        # 设置标题
        ax.set_title(title, fontsize=14, fontweight='bold', pad=20, color=self.colors['gray'])
        
        # 添加数值标注
        for angle, value, label in zip(angles[:-1], values, labels):
            ax.annotate(
                f'{value:.0f}',
                xy=(angle, value),
                xytext=(5, 5),
                textcoords='offset points',
                fontsize=8,
                color=self.colors['primary'],
                fontweight='bold'
            )
        
        # 转换为字节
        img_bytes = self._fig_to_bytes(fig)
        plt.close(fig)
        
        return img_bytes
    
    def create_heatmap(
        self,
        matrix: List[List[int]],
        labels: List[str],
        title: str = "知识点关联热力图",
        colorbar_label: str = "共现题目数"
    ) -> Optional[bytes]:
        """
        创建热力图展示知识点关联强度
        
        Args:
            matrix: 关联矩阵（二维列表）
            labels: 知识点名称列表（对应矩阵的行和列）
            title: 图表标题
            colorbar_label: 颜色条标签
            
        Returns:
            PNG 图片的字节数据，如果数据为空则返回 None
        """
        if not matrix or not labels:
            return None
        
        # 转换为 numpy 数组
        data = np.array(matrix)
        
        # 限制最多显示15个知识点
        if len(labels) > 15:
            data = data[:15, :15]
            labels = labels[:15]
        
        n = len(labels)
        
        # 创建图形
        fig, ax = plt.subplots(figsize=self.figsize)
        
        # 绘制热力图
        im = ax.imshow(data, cmap='YlOrRd', aspect='auto')
        
        # 设置刻度标签
        ax.set_xticks(np.arange(n))
        ax.set_yticks(np.arange(n))
        ax.set_xticklabels(labels, rotation=45, ha='right', fontsize=9)
        ax.set_yticklabels(labels, fontsize=9)
        
        # 在每个单元格中显示数值
        for i in range(n):
            for j in range(n):
                value = data[i, j]
                # 根据背景颜色选择文字颜色
                text_color = 'white' if value > data.max() * 0.6 else 'black'
                ax.text(
                    j, i, str(value),
                    ha='center', va='center',
                    color=text_color, fontsize=8
                )
        
        # 添加颜色条
        cbar = plt.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
        cbar.set_label(colorbar_label, fontsize=10)
        
        # 设置标题
        ax.set_title(title, fontsize=14, fontweight='bold', pad=15)
        
        # 调整布局
        fig.tight_layout()
        
        # 转换为字节
        img_bytes = self._fig_to_bytes(fig)
        plt.close(fig)
        
        return img_bytes
    
    def create_mastery_bar_chart(
        self,
        labels: List[str],
        values: List[float],
        title: str = "知识点掌握度排名",
        horizontal: bool = True
    ) -> Optional[bytes]:
        """
        创建柱状图展示知识点掌握度排名
        
        Args:
            labels: 知识点名称列表
            values: 掌握度值列表
            title: 图表标题
            horizontal: 是否使用水平柱状图
            
        Returns:
            PNG 图片的字节数据
        """
        if not labels or not values:
            return None
        
        # 按掌握度排序
        sorted_pairs = sorted(zip(values, labels), reverse=True)
        values = [v for v, _ in sorted_pairs]
        labels = [l for _, l in sorted_pairs]
        
        # 根据掌握度分配颜色
        colors = []
        for v in values:
            if v >= 80:
                colors.append(self.colors['success'])
            elif v >= 60:
                colors.append(self.colors['warning'])
            else:
                colors.append(self.colors['danger'])
        
        # 创建图形
        fig, ax = plt.subplots(figsize=self.figsize)
        
        if horizontal:
            y_pos = np.arange(len(labels))
            bars = ax.barh(y_pos, values, color=colors, height=0.6)
            ax.set_yticks(y_pos)
            ax.set_yticklabels(labels, fontsize=10)
            ax.set_xlabel('掌握度 (%)', fontsize=10)
            ax.set_xlim(0, 100)
            
            # 在柱状图上显示数值
            for bar, value in zip(bars, values):
                ax.text(
                    bar.get_width() + 1, bar.get_y() + bar.get_height() / 2,
                    f'{value:.1f}%', va='center', fontsize=9, color=self.colors['gray']
                )
        else:
            x_pos = np.arange(len(labels))
            bars = ax.bar(x_pos, values, color=colors, width=0.6)
            ax.set_xticks(x_pos)
            ax.set_xticklabels(labels, rotation=45, ha='right', fontsize=9)
            ax.set_ylabel('掌握度 (%)', fontsize=10)
            ax.set_ylim(0, 100)
            
            # 在柱状图上显示数值
            for bar, value in zip(bars, values):
                ax.text(
                    bar.get_x() + bar.get_width() / 2, bar.get_height() + 1,
                    f'{value:.1f}%', ha='center', va='bottom', fontsize=9,
                    color=self.colors['gray']
                )
        
        # 添加参考线
        ax.axhline(y=60, color=self.colors['warning'], linestyle='--', alpha=0.5, label='及格线')
        ax.axhline(y=80, color=self.colors['success'], linestyle='--', alpha=0.5, label='优秀线')
        
        ax.set_title(title, fontsize=14, fontweight='bold', pad=15)
        ax.legend(loc='lower right', fontsize=9)
        ax.grid(axis='x' if horizontal else 'y', linestyle='--', alpha=0.3)
        
        fig.tight_layout()
        
        img_bytes = self._fig_to_bytes(fig)
        plt.close(fig)
        
        return img_bytes
    
    def create_weak_points_chart(
        self,
        weak_points: List[Dict],
        title: str = "薄弱知识点分析"
    ) -> Optional[bytes]:
        """
        创建薄弱知识点分析图
        
        Args:
            weak_points: 薄弱知识点列表，每项包含 name, mastery_level, question_count
            title: 图表标题
            
        Returns:
            PNG 图片的字节数据
        """
        if not weak_points:
            return None
        
        # 提取数据
        names = [kp['name'] for kp in weak_points[:10]]  # 最多10个
        mastery = [kp['mastery_level'] for kp in weak_points[:10]]
        counts = [kp.get('question_count', 0) for kp in weak_points[:10]]
        
        # 创建图形
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 6))
        
        # 左侧：掌握度柱状图
        colors = [self.colors['danger'] if m < 40 else self.colors['warning'] for m in mastery]
        y_pos = np.arange(len(names))
        ax1.barh(y_pos, mastery, color=colors, height=0.6)
        ax1.set_yticks(y_pos)
        ax1.set_yticklabels(names, fontsize=9)
        ax1.set_xlabel('掌握度 (%)', fontsize=10)
        ax1.set_xlim(0, 100)
        ax1.set_title('掌握度', fontsize=12, fontweight='bold')
        ax1.axvline(x=60, color=self.colors['warning'], linestyle='--', alpha=0.5)
        
        # 在柱状图上显示数值
        for i, (bar, value) in enumerate(zip(ax1.patches, mastery)):
            ax1.text(
                bar.get_width() + 1, bar.get_y() + bar.get_height() / 2,
                f'{value:.1f}%', va='center', fontsize=8, color=self.colors['gray']
            )
        
        # 右侧：题目数量气泡图
        sizes = [max(50, c * 20) for c in counts]  # 气泡大小
        ax2.scatter(mastery, range(len(names)), s=sizes, alpha=0.6, 
                   color=self.colors['primary'], edgecolors='white', linewidth=1)
        ax2.set_yticks(range(len(names)))
        ax2.set_yticklabels(names, fontsize=9)
        ax2.set_xlabel('掌握度 (%)', fontsize=10)
        ax2.set_xlim(0, 100)
        ax2.set_title('关联题目数', fontsize=12, fontweight='bold')
        ax2.grid(axis='x', linestyle='--', alpha=0.3)
        
        # 添加气泡大小图例
        for i, count in enumerate(counts[:3]):
            ax2.annotate(
                f'{count}题', 
                xy=(mastery[i], i),
                xytext=(10, 0),
                textcoords='offset points',
                fontsize=8,
                color=self.colors['gray']
            )
        
        fig.suptitle(title, fontsize=14, fontweight='bold', y=1.02)
        fig.tight_layout()
        
        img_bytes = self._fig_to_bytes(fig)
        plt.close(fig)
        
        return img_bytes
    
    def _fig_to_bytes(self, fig) -> bytes:
        """
        将 matplotlib Figure 转换为 PNG 字节数据
        
        Args:
            fig: matplotlib Figure 对象
            
        Returns:
            PNG 图片的字节数据
        """
        buf = io.BytesIO()
        fig.savefig(buf, format='png', dpi=self.dpi, bbox_inches='tight',
                   facecolor=self.colors['background'], edgecolor='none')
        buf.seek(0)
        return buf.getvalue()
    
    def save_chart(self, img_bytes: bytes, filepath: str) -> bool:
        """
        保存图表到文件
        
        Args:
            img_bytes: 图片字节数据
            filepath: 保存路径
            
        Returns:
            是否保存成功
        """
        try:
            with open(filepath, 'wb') as f:
                f.write(img_bytes)
            return True
        except Exception:
            return False


class KnowledgeWidget:
    """
    知识点可视化组件（用于 PyQt6 集成）
    
    提供将 matplotlib 图表嵌入到 PyQt6 界面的功能
    """
    
    @staticmethod
    def create_qt_pixmap(img_bytes: bytes):
        """
        将图片字节数据转换为 QPixmap
        
        Args:
            img_bytes: PNG 图片字节数据
            
        Returns:
            QPixmap 对象，如果转换失败则返回 None
        """
        try:
            from PyQt6.QtGui import QPixmap
            from PyQt6.QtCore import QByteArray
            
            qbytes = QByteArray(img_bytes)
            pixmap = QPixmap()
            pixmap.loadFromData(qbytes, 'PNG')
            return pixmap
        except Exception:
            return None
    
    @staticmethod
    def create_scaled_pixmap(img_bytes: bytes, max_width: int = 600, max_height: int = 400):
        """
        创建缩放的 QPixmap（保持宽高比）
        
        Args:
            img_bytes: PNG 图片字节数据
            max_width: 最大宽度
            max_height: 最大高度
            
        Returns:
            缩放后的 QPixmap 对象
        """
        pixmap = KnowledgeWidget.create_qt_pixmap(img_bytes)
        if pixmap is None:
            return None
        
        # 缩放（保持宽高比）
        scaled = pixmap.scaled(
            max_width, max_height,
            aspectRatioMode=1,  # Qt.AspectRatioMode.KeepAspectRatio
            transformMode=1     # Qt.TransformationMode.SmoothTransformation
        )
        return scaled
