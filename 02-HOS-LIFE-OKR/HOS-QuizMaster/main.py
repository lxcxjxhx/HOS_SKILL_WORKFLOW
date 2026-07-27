#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
HOS-QuizMaster - 刷题工具
主程序入口
"""

import sys
from PyQt6.QtWidgets import QApplication
from ui.main_window import MainWindow


def main():
    app = QApplication(sys.argv)
    app.setStyle('Fusion')
    
    window = MainWindow()
    window.show()
    
    sys.exit(app.exec())


if __name__ == '__main__':
    main()
