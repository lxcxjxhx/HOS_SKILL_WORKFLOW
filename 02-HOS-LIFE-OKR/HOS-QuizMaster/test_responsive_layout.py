#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
响应式布局测试 - HOS-QuizMaster V2
Phase 15 集成测试：验证不同分辨率下的界面布局
直接测试组件而非完整 MainWindow，避免阻塞
"""

import sys
import unittest
from PyQt6.QtWidgets import QApplication, QWidget, QVBoxLayout, QHBoxLayout

# 添加项目根目录到路径
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ui.widgets.sidebar import Sidebar
from ui.widgets.nav_bar import NavBar
from ui.widgets.question_card import QuestionCard


class TestResponsiveLayout(unittest.TestCase):
    """响应式布局测试"""

    @classmethod
    def setUpClass(cls):
        """初始化 QApplication"""
        cls.app = QApplication.instance()
        if cls.app is None:
            cls.app = QApplication([])

    def test_01_sidebar_minimum_width(self):
        """测试 1: 侧边栏最小宽度约束"""
        print("\n[响应式布局测试 1] 侧边栏最小宽度约束...")
        
        sidebar = Sidebar()
        
        # 检查最小宽度设置
        min_width = sidebar.minimumWidth()
        self.assertGreaterEqual(min_width, 200, 
            f"侧边栏最小宽度应该 >= 200px，实际: {min_width}px")
        
        print(f"  ✓ 侧边栏最小宽度: {min_width}px >= 200px")
        
        # 测试不同窗口大小下的侧边栏
        test_widths = [800, 1366, 1920]
        for width in test_widths:
            sb = Sidebar()
            container = QWidget()
            layout = QHBoxLayout(container)
            layout.addWidget(sb)
            container.resize(width, 600)
            container.show()
            
            # 强制布局计算
            container.adjustSize()
            
            sidebar_width = sb.width()
            self.assertGreaterEqual(sidebar_width, 200,
                f"窗口宽度 {width}px 时，侧边栏宽度应该 >= 200px，实际: {sidebar_width}px")
            print(f"  ✓ 窗口宽度 {width}px: 侧边栏宽度 {sidebar_width}px >= 200px")
            
            container.close()

    def test_02_question_card_adaptive_height(self):
        """测试 2: 题目卡片自适应高度"""
        print("\n[响应式布局测试 2] 题目卡片自适应高度...")
        
        card = QuestionCard()
        
        # 测试不同宽度下的高度自适应
        test_widths = [800, 1000, 1366, 1920]
        for width in test_widths:
            card.resize(width, 600)
            card.show()
            
            # 验证卡片可见
            self.assertTrue(card.isVisible(), "题目卡片应该可见")
            
            # 验证高度自适应
            height = card.height()
            self.assertGreater(height, 0, "题目卡片高度应该 > 0")
            print(f"  ✓ 宽度 {width}px: 高度 {height}px")
            
            card.close()

    def test_03_nav_bar_layout(self):
        """测试 3: 导航栏布局"""
        print("\n[响应式布局测试 3] 导航栏布局...")
        
        nav_bar = NavBar()
        
        # 测试不同窗口大小
        test_sizes = [(800, 600), (1366, 768), (1920, 1080)]
        for width, height in test_sizes:
            nav_bar.resize(width, 80)
            nav_bar.show()
            
            # 验证导航栏可见
            self.assertTrue(nav_bar.isVisible(), "导航栏应该可见")
            
            # 验证宽度
            nav_width = nav_bar.width()
            self.assertGreater(nav_width, 0, "导航栏宽度应该 > 0")
            print(f"  ✓ 窗口 {width}x{height}: 导航栏宽度 {nav_width}px")
            
            nav_bar.close()

    def test_04_component_integration(self):
        """测试 4: 组件集成测试"""
        print("\n[响应式布局测试 4] 组件集成测试...")
        
        # 创建容器模拟主窗口布局
        container = QWidget()
        main_layout = QHBoxLayout(container)
        
        sidebar = Sidebar()
        nav_bar = NavBar()
        
        main_layout.addWidget(sidebar)
        main_layout.addWidget(nav_bar)
        
        # 测试不同分辨率
        test_sizes = [
            (800, 600, "最小分辨率"),
            (1366, 768, "中等分辨率"),
            (1920, 1080, "标准分辨率"),
        ]
        
        for width, height, desc in test_sizes:
            container.resize(width, height)
            container.show()
            
            # 验证组件可见
            self.assertTrue(sidebar.isVisible(), f"{desc}: 侧边栏应该可见")
            self.assertTrue(nav_bar.isVisible(), f"{desc}: 导航栏应该可见")
            
            # 验证侧边栏最小宽度
            sidebar_width = sidebar.width()
            self.assertGreaterEqual(sidebar_width, 200,
                f"{desc}: 侧边栏宽度应该 >= 200px，实际: {sidebar_width}px")
            
            print(f"  ✓ {desc} ({width}x{height}): 布局正常")
            
            container.close()


if __name__ == '__main__':
    print("=" * 60)
    print("HOS-QuizMaster V2 响应式布局测试")
    print("=" * 60)
    
    # 运行测试
    unittest.main(verbosity=2)
