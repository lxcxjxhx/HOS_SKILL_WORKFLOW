#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""测试运行并捕获错误"""

import sys
import traceback

try:
    from PyQt6.QtWidgets import QApplication
    from gui.main_window import MainWindow
    
    app = QApplication(sys.argv)
    app.setStyle('Fusion')
    
    window = MainWindow()
    window.show()
    
    print("窗口已显示，按 Ctrl+C 退出")
    sys.exit(app.exec())
    
except Exception as e:
    print("=" * 60)
    print("程序崩溃！")
    print("=" * 60)
    print(f"错误类型: {type(e).__name__}")
    print(f"错误信息: {str(e)}")
    print("=" * 60)
    print("详细堆栈:")
    print(traceback.format_exc())
    print("=" * 60)
    input("按回车键退出...")
    sys.exit(1)
