#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
共享样式常量 - HOS-QuizMaster V2
现代设计系统 - 参考 Ant Design 5.x / Material Design 3
"""


class Colors:
    """颜色常量 - 现代设计系统"""
    # 主色调 - 品牌蓝
    PRIMARY = "#1677ff"
    PRIMARY_LIGHT = "#4096ff"
    PRIMARY_DARK = "#0958d9"
    PRIMARY_BG = "#e6f4ff"
    PRIMARY_BORDER = "#91caff"
    PRIMARY_HOVER = "#4096ff"
    PRIMARY_ACTIVE = "#0958d9"

    # 成功色 - 翡翠绿
    SUCCESS = "#52c41a"
    SUCCESS_LIGHT = "#95de64"
    SUCCESS_DARK = "#389e0d"
    SUCCESS_BG = "#f6ffed"
    SUCCESS_BORDER = "#b7eb8f"

    # 危险色 - 珊瑚红
    DANGER = "#ff4d4f"
    DANGER_LIGHT = "#ff7875"
    DANGER_DARK = "#d9363e"
    DANGER_BG = "#fff2f0"
    DANGER_BORDER = "#ffccc7"

    # 警告色 - 琥珀橙
    WARNING = "#faad14"
    WARNING_LIGHT = "#ffc53d"
    WARNING_DARK = "#d48806"
    WARNING_BG = "#fffbe6"
    WARNING_BORDER = "#ffe58f"

    # 信息色 - 青蓝
    INFO = "#13c2c2"
    INFO_LIGHT = "#36cfc9"
    INFO_DARK = "#08979c"
    INFO_BG = "#e6fffb"
    INFO_BORDER = "#87e8de"

    # 中性色 - 灰阶
    WHITE = "#ffffff"
    GRAY_50 = "#fafafa"
    GRAY_100 = "#f5f5f5"
    GRAY_200 = "#f0f0f0"
    GRAY_300 = "#d9d9d9"
    GRAY_400 = "#bfbfbf"
    GRAY_500 = "#8c8c8c"
    GRAY_600 = "#595959"
    GRAY_700 = "#434343"
    GRAY_800 = "#262626"
    GRAY_900 = "#1f1f1f"
    BLACK = "#000000"

    # 语义色 - 文本
    TEXT_PRIMARY = "#262626"
    TEXT_SECONDARY = "#595959"
    TEXT_TERTIARY = "#8c8c8c"
    TEXT_DISABLED = "#bfbfbf"
    TEXT_WHITE = "#ffffff"

    # 语义色 - 背景
    BACKGROUND = "#ffffff"
    BACKGROUND_SECONDARY = "#fafafa"
    BACKGROUND_TERTIARY = "#f5f5f5"
    BACKGROUND_ELEVATED = "#ffffff"

    # 语义色 - 边框
    BORDER = "#d9d9d9"
    BORDER_LIGHT = "#f0f0f0"
    BORDER_DARK = "#bfbfbf"

    # 特殊色
    SHADOW_LIGHT = "rgba(0, 0, 0, 0.06)"
    SHADOW_MEDIUM = "rgba(0, 0, 0, 0.08)"
    SHADOW_HEAVY = "rgba(0, 0, 0, 0.12)"


class Spacing:
    """间距常量 - 4px 基础网格"""
    XXS = "2px"
    XS = "4px"
    SM = "8px"
    MD = "12px"
    LG = "16px"
    XL = "20px"
    XXL = "24px"
    XXXL = "32px"
    HUGE = "48px"


class Fonts:
    """字体常量"""
    FAMILY = '"Inter", "SF Pro Display", "Microsoft YaHei", "Segoe UI", sans-serif'
    FAMILY_MONO = '"JetBrains Mono", "SF Mono", "Consolas", monospace'
    
    # 字号
    SIZE_XS = "11px"
    SIZE_SM = "12px"
    SIZE_BASE = "13px"
    SIZE_MD = "14px"
    SIZE_LG = "16px"
    SIZE_XL = "18px"
    SIZE_XXL = "20px"
    SIZE_HUGE = "24px"
    
    # 字重
    WEIGHT_NORMAL = "400"
    WEIGHT_MEDIUM = "500"
    WEIGHT_SEMIBOLD = "600"
    WEIGHT_BOLD = "700"
    
    # 行高
    LINE_HEIGHT_TIGHT = "1.25"
    LINE_HEIGHT_NORMAL = "1.5"
    LINE_HEIGHT_RELAXED = "1.75"


class BorderRadius:
    """圆角常量"""
    NONE = "0"
    SM = "4px"
    MD = "6px"
    LG = "8px"
    XL = "12px"
    XXL = "16px"
    FULL = "9999px"


class Shadows:
    """阴影效果参数 (blur, x, y, alpha)"""
    # 轻量级 - 用于卡片、按钮
    SM = (4, 0, 1, 0.04)
    # 中等 - 用于悬浮卡片
    MD = (8, 0, 4, 0.08)
    # 重量级 - 用于弹窗、下拉菜单
    LG = (16, 0, 8, 0.12)
    # 超轻 - 用于微妙提升
    XS = (2, 0, 1, 0.02)


class Transitions:
    """过渡动画时长"""
    FAST = "150ms"
    NORMAL = "200ms"
    SLOW = "300ms"
    SLOWER = "400ms"
    
    # 缓动函数
    EASE_IN_OUT = "cubic-bezier(0.645, 0.045, 0.355, 1)"
    EASE_OUT = "cubic-bezier(0.215, 0.61, 0.355, 1)"
    EASE_IN = "cubic-bezier(0.55, 0.055, 0.675, 0.19)"


class ZIndex:
    """层级管理"""
    DROP = 1000
    POPUP = 1030
    STICKY = 1040
    FIXED = 1050
    MODAL_BACKDROP = 1060
    MODAL = 1070
    POPOVER = 1080
    TOOLTIP = 1090
    TOAST = 1100
