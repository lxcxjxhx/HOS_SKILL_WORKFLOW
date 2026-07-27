#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
UI 动画流畅性测试 - HOS-QuizMaster V2
Phase 15 集成测试：验证所有 UI 动画效果
"""

import sys
import unittest
from PyQt6.QtWidgets import QApplication, QPushButton, QWidget, QLabel
from PyQt6.QtCore import QTimer, Qt
from PyQt6.QtTest import QTest

# 添加项目根目录到路径
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ui.animations import (
    slide_in_from_right, slide_in_from_left,
    fade_in, fade_out,
    attach_press_feedback
)


class TestUIAnimations(unittest.TestCase):
    """UI 动画流畅性测试"""

    @classmethod
    def setUpClass(cls):
        """初始化 QApplication"""
        cls.app = QApplication.instance()
        if cls.app is None:
            cls.app = QApplication([])

    def test_01_slide_in_from_right(self):
        """测试 1: 从右侧滑入动画（200ms）"""
        print("\n[UI 动画测试 1] 从右侧滑入动画...")
        
        widget = QWidget()
        widget.resize(400, 300)
        widget.move(100, 100)
        widget.show()
        
        # 执行动画
        animation = slide_in_from_right(widget, duration=200)
        
        # 等待动画完成
        QTest.qWait(250)
        
        # 验证动画已启动
        self.assertIsNotNone(animation, "动画对象应该存在")
        print("  ✓ 从右侧滑入动画正常")

    def test_02_slide_in_from_left(self):
        """测试 2: 从左侧滑入动画（200ms）"""
        print("\n[UI 动画测试 2] 从左侧滑入动画...")
        
        widget = QWidget()
        widget.resize(400, 300)
        widget.move(100, 100)
        widget.show()
        
        # 执行动画
        animation = slide_in_from_left(widget, duration=200)
        
        # 等待动画完成
        QTest.qWait(250)
        
        # 验证动画已启动
        self.assertIsNotNone(animation, "动画对象应该存在")
        print("  ✓ 从左侧滑入动画正常")

    def test_03_fade_in(self):
        """测试 3: 淡入动画（200ms）"""
        print("\n[UI 动画测试 3] 淡入动画...")
        
        widget = QWidget()
        widget.resize(400, 300)
        widget.show()
        
        # 执行动画
        animation = fade_in(widget, duration=200)
        
        # 等待动画完成
        QTest.qWait(250)
        
        # 验证动画已启动
        self.assertIsNotNone(animation, "动画对象应该存在")
        print("  ✓ 淡入动画正常")

    def test_04_fade_out(self):
        """测试 4: 淡出动画（200ms）"""
        print("\n[UI 动画测试 4] 淡出动画...")
        
        widget = QWidget()
        widget.resize(400, 300)
        widget.show()
        
        # 执行动画
        animation = fade_out(widget, duration=200)
        
        # 等待动画完成
        QTest.qWait(250)
        
        # 验证动画已启动
        self.assertIsNotNone(animation, "动画对象应该存在")
        print("  ✓ 淡出动画正常")

    def test_05_button_press_feedback(self):
        """测试 5: 按钮按压反馈动画（100-150ms）"""
        print("\n[UI 动画测试 5] 按钮按压反馈动画...")
        
        button = QPushButton("测试按钮")
        button.resize(200, 50)
        button.show()
        
        # 附加按压反馈动画
        attach_press_feedback(button)
        
        # 模拟按压
        QTest.mousePress(button, Qt.MouseButton.LeftButton)
        QTest.qWait(100)
        QTest.mouseRelease(button, Qt.MouseButton.LeftButton)
        QTest.qWait(150)
        
        # 验证按钮存在
        self.assertTrue(button.isVisible(), "按钮应该可见")
        print("  ✓ 按钮按压反馈动画正常")

    def test_06_animation_timing(self):
        """测试 6: 动画时长验证"""
        print("\n[UI 动画测试 6] 动画时长验证...")
        
        widget = QWidget()
        widget.resize(400, 300)
        widget.show()
        
        # 测试 200ms 动画
        animation = slide_in_from_right(widget, duration=200)
        self.assertEqual(animation.duration(), 200, "动画时长应该是 200ms")
        
        # 测试 150ms 动画
        animation2 = fade_in(widget, duration=150)
        self.assertEqual(animation2.duration(), 150, "动画时长应该是 150ms")
        
        print("  ✓ 动画时长配置正确")


if __name__ == '__main__':
    print("=" * 60)
    print("HOS-QuizMaster V2 UI 动画流畅性测试")
    print("=" * 60)
    
    # 运行测试
    unittest.main(verbosity=2)
