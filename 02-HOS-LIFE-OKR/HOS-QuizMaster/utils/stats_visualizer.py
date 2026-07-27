#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
统计可视化 - HOS-QuizMaster V2
使用 matplotlib 生成各类统计图表
"""

import io
from typing import List, Dict, Optional
from datetime import datetime

import matplotlib
matplotlib.use('Agg')  # 使用非交互式后端
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from matplotlib.figure import Figure
import numpy as np


class StatsVisualizer:
    """统计可视化器"""
    
    def __init__(self):
        """初始化可视化器"""
        # 设置中文字体
        plt.rcParams['font.sans-serif'] = ['SimHei', 'Microsoft YaHei', 'Arial Unicode MS']
        plt.rcParams['axes.unicode_minus'] = False
    
    def create_trend_chart(self, dates: List[str], accuracies: List[float], 
                          title: str = "答题趋势") -> Figure:
        """
        创建答题趋势折线图
        
        Args:
            dates: 日期列表
            accuracies: 正确率列表
            title: 图表标题
            
        Returns:
            matplotlib Figure 对象
        """
        fig, ax = plt.subplots(figsize=(8, 4))
        
        if not dates or not accuracies:
            ax.text(0.5, 0.5, '暂无数据', ha='center', va='center', 
                   fontsize=14, color='#9ca3af')
            ax.set_xlim(0, 1)
            ax.set_ylim(0, 1)
            ax.axis('off')
            return fig
        
        # 转换日期格式
        date_objects = [datetime.strptime(d, '%Y-%m-%d') for d in dates]
        
        # 绘制折线图
        ax.plot(date_objects, accuracies, marker='o', linewidth=2, 
               markersize=6, color='#2563eb', markerfacecolor='#3b82f6')
        
        # 设置标题和标签
        ax.set_title(title, fontsize=14, fontweight='bold', pad=15)
        ax.set_xlabel('日期', fontsize=11)
        ax.set_ylabel('正确率 (%)', fontsize=11)
        
        # 设置 Y 轴范围
        ax.set_ylim(0, 100)
        ax.grid(True, linestyle='--', alpha=0.6)
        
        # 格式化 X 轴日期
        ax.xaxis.set_major_formatter(mdates.DateFormatter('%m-%d'))
        plt.setp(ax.xaxis.get_majorticklabels(), rotation=45, ha='right')
        
        # 添加数值标签
        for i, (date, acc) in enumerate(zip(date_objects, accuracies)):
            ax.annotate(f'{acc:.1f}%', 
                       xy=(date, acc),
                       xytext=(0, 10),
                       textcoords='offset points',
                       fontsize=9,
                       ha='center')
        
        plt.tight_layout()
        return fig
    
    def create_type_comparison_chart(self, type_stats: List[Dict], 
                                     title: str = "题型表现对比") -> Figure:
        """
        创建题型对比柱状图
        
        Args:
            type_stats: 题型统计列表
            title: 图表标题
            
        Returns:
            matplotlib Figure 对象
        """
        fig, ax = plt.subplots(figsize=(8, 4))
        
        if not type_stats:
            ax.text(0.5, 0.5, '暂无数据', ha='center', va='center', 
                   fontsize=14, color='#9ca3af')
            ax.set_xlim(0, 1)
            ax.set_ylim(0, 1)
            ax.axis('off')
            return fig
        
        types = [stat['type'] for stat in type_stats]
        accuracies = [stat['accuracy'] for stat in type_stats]
        totals = [stat['total'] for stat in type_stats]
        
        # 创建柱状图
        x = np.arange(len(types))
        width = 0.6
        
        bars = ax.bar(x, accuracies, width, color='#2563eb', alpha=0.8)
        
        # 设置标题和标签
        ax.set_title(title, fontsize=14, fontweight='bold', pad=15)
        ax.set_xlabel('题型', fontsize=11)
        ax.set_ylabel('正确率 (%)', fontsize=11)
        ax.set_ylim(0, 100)
        ax.set_xticks(x)
        ax.set_xticklabels(types)
        ax.grid(True, linestyle='--', alpha=0.3, axis='y')
        
        # 添加数值标签
        for bar, acc, total in zip(bars, accuracies, totals):
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height,
                   f'{acc:.1f}%\n({total}题)',
                   ha='center', va='bottom', fontsize=9)
        
        plt.tight_layout()
        return fig
    
    def create_difficulty_chart(self, difficulty_stats: List[Dict], 
                               title: str = "难度表现分析") -> Figure:
        """
        创建难度分析柱状图
        
        Args:
            difficulty_stats: 难度统计列表
            title: 图表标题
            
        Returns:
            matplotlib Figure 对象
        """
        fig, ax = plt.subplots(figsize=(8, 4))
        
        if not difficulty_stats:
            ax.text(0.5, 0.5, '暂无数据', ha='center', va='center', 
                   fontsize=14, color='#9ca3af')
            ax.set_xlim(0, 1)
            ax.set_ylim(0, 1)
            ax.axis('off')
            return fig
        
        difficulties = [f"难度{stat['difficulty']}" for stat in difficulty_stats]
        accuracies = [stat['accuracy'] for stat in difficulty_stats]
        totals = [stat['total'] for stat in difficulty_stats]
        
        # 根据难度设置不同颜色
        colors = ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444']
        bar_colors = [colors[min(i, len(colors)-1)] for i in range(len(difficulties))]
        
        # 创建柱状图
        x = np.arange(len(difficulties))
        width = 0.6
        
        bars = ax.bar(x, accuracies, width, color=bar_colors, alpha=0.8)
        
        # 设置标题和标签
        ax.set_title(title, fontsize=14, fontweight='bold', pad=15)
        ax.set_xlabel('难度等级', fontsize=11)
        ax.set_ylabel('正确率 (%)', fontsize=11)
        ax.set_ylim(0, 100)
        ax.set_xticks(x)
        ax.set_xticklabels(difficulties)
        ax.grid(True, linestyle='--', alpha=0.3, axis='y')
        
        # 添加数值标签
        for bar, acc, total in zip(bars, accuracies, totals):
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height,
                   f'{acc:.1f}%\n({total}题)',
                   ha='center', va='bottom', fontsize=9)
        
        plt.tight_layout()
        return fig
    
    def create_distribution_pie_chart(self, correct: int, incorrect: int, 
                                     title: str = "答题分布") -> Figure:
        """
        创建答题分布饼图
        
        Args:
            correct: 正确题数
            incorrect: 错误题数
            title: 图表标题
            
        Returns:
            matplotlib Figure 对象
        """
        fig, ax = plt.subplots(figsize=(6, 6))
        
        total = correct + incorrect
        
        if total == 0:
            ax.text(0.5, 0.5, '暂无数据', ha='center', va='center', 
                   fontsize=14, color='#9ca3af')
            ax.set_xlim(0, 1)
            ax.set_ylim(0, 1)
            ax.axis('off')
            return fig
        
        # 饼图数据
        sizes = [correct, incorrect]
        labels = [f'正确\n{correct}题', f'错误\n{incorrect}题']
        colors = ['#22c55e', '#ef4444']
        explode = (0.05, 0.05)
        
        # 绘制饼图
        wedges, texts, autotexts = ax.pie(sizes, explode=explode, labels=labels, 
                                         colors=colors, autopct='%1.1f%%',
                                         shadow=True, startangle=90,
                                         textprops={'fontsize': 11})
        
        for autotext in autotexts:
            autotext.set_color('white')
            autotext.set_fontweight('bold')
            autotext.set_fontsize(12)
        
        ax.set_title(title, fontsize=14, fontweight='bold', pad=20)
        
        plt.tight_layout()
        return fig
    
    def create_hourly_heatmap(self, hourly_stats: List[Dict], 
                             title: str = "最佳学习时段") -> Figure:
        """
        创建学习时段热力图
        
        Args:
            hourly_stats: 小时统计列表
            title: 图表标题
            
        Returns:
            matplotlib Figure 对象
        """
        fig, ax = plt.subplots(figsize=(10, 4))
        
        if not hourly_stats:
            ax.text(0.5, 0.5, '暂无数据', ha='center', va='center', 
                   fontsize=14, color='#9ca3af')
            ax.set_xlim(0, 1)
            ax.set_ylim(0, 1)
            ax.axis('off')
            return fig
        
        # 准备数据
        hours = [stat['hour'] for stat in hourly_stats]
        totals = [stat['total'] for stat in hourly_stats]
        accuracies = [stat['accuracy'] for stat in hourly_stats]
        
        # 创建柱状图
        x = np.arange(24)
        width = 0.8
        
        # 根据正确率设置颜色
        colors = []
        for acc in accuracies:
            if acc >= 80:
                colors.append('#22c55e')
            elif acc >= 60:
                colors.append('#eab308')
            else:
                colors.append('#ef4444')
        
        bars = ax.bar(x, totals, width, color=colors, alpha=0.7)
        
        # 设置标题和标签
        ax.set_title(title, fontsize=14, fontweight='bold', pad=15)
        ax.set_xlabel('小时', fontsize=11)
        ax.set_ylabel('答题数量', fontsize=11)
        ax.set_xticks(x)
        ax.set_xticklabels([f'{h}:00' for h in range(24)])
        plt.setp(ax.xaxis.get_majorticklabels(), rotation=45, ha='right')
        ax.grid(True, linestyle='--', alpha=0.3, axis='y')
        
        # 添加正确率标签
        for i, (bar, total, acc) in enumerate(zip(bars, totals, accuracies)):
            if total > 0:
                height = bar.get_height()
                ax.text(bar.get_x() + bar.get_width()/2., height,
                       f'{acc:.0f}%',
                       ha='center', va='bottom', fontsize=8)
        
        plt.tight_layout()
        return fig
    
    def figure_to_image(self, fig: Figure) -> bytes:
        """
        将 matplotlib Figure 转换为图片字节数据
        
        Args:
            fig: matplotlib Figure 对象
            
        Returns:
            PNG 图片的字节数据
        """
        buf = io.BytesIO()
        fig.savefig(buf, format='png', dpi=100, bbox_inches='tight')
        buf.seek(0)
        image_data = buf.getvalue()
        buf.close()
        plt.close(fig)
        return image_data
