#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
设计系统 - Linear/Notion 风格
克制层级、强排版、少颜色、密集但可读
"""


class Color:
    """颜色系统 - 克制使用，高对比度，清晰层次"""
    # 背景 - 多层次灰阶（每层约 5-8% 亮度差，确保可感知）
    BG_PRIMARY = "#ffffff"        # 主内容区
    BG_SECONDARY = "#f5f5f5"    # 侧栏/次级面板（与 PRIMARY 差 ~4%）
    BG_TERTIARY = "#ebebeb"     # 分组区域/表格头（与 SECONDARY 差 ~4%）
    BG_QUATERNARY = "#d9d9d9"   # 选中行/强高亮（与 TERTIARY 差 ~7%）
    BG_HOVER = "#f0f0f0"        # 悬停态
    BG_ACTIVE = "#e0e0e0"       # 按下态

    # 文字 - 高对比度（次要文字加深，确保 WCAG AA）
    TEXT_PRIMARY = "#0a0a0a"      # 标题/正文 — 近黑
    TEXT_SECONDARY = "#404040"    # 副标题/描述 — 深灰（对比度 ≈ 9:1 on white）
    TEXT_TERTIARY = "#616161"     # 辅助信息/placeholder — 中灰（对比度 ≈ 5.5:1）
    TEXT_DISABLED = "#9e9e9e"     # 禁用态
    TEXT_INVERSE = "#ffffff"      # 深色背景上的文字

    # 边框 - 细腻但可见（偏冷灰，不抢视觉）
    BORDER_LIGHT = "#eeeeee"     # 分割线/极弱边界
    BORDER_DEFAULT = "#dcdcdc"   # 默认边框
    BORDER_DARK = "#bdbdbd"      # 聚焦/强调边框

    # 强调色 - 单一蓝色，完整交互状态（hover 加深 ≥12%）
    ACCENT = "#3b82f6"
    ACCENT_HOVER = "#2563eb"      # ≈15% darker
    ACCENT_ACTIVE = "#1e40af"     # ≈25% darker
    ACCENT_BG = "#eff6ff"
    ACCENT_BG_HOVER = "#dbeafe"
    ACCENT_BORDER = "#93c5fd"

    # 状态色 - 含交互变体（hover ≥12% darker，active ≥20% darker）
    SUCCESS = "#10b981"
    SUCCESS_HOVER = "#059669"     # ≈15% darker
    SUCCESS_ACTIVE = "#047857"    # ≈25% darker
    SUCCESS_BG = "#ecfdf5"
    SUCCESS_BG_HOVER = "#d1fae5"
    ERROR = "#ef4444"
    ERROR_HOVER = "#dc2626"       # ≈13% darker
    ERROR_ACTIVE = "#b91c1c"      # ≈24% darker
    ERROR_BG = "#fef2f2"
    ERROR_BG_HOVER = "#fee2e2"
    WARNING = "#f59e0b"
    WARNING_HOVER = "#d97706"     # ≈14% darker
    WARNING_ACTIVE = "#b45309"    # ≈25% darker
    WARNING_BG = "#fffbeb"
    WARNING_BG_HOVER = "#fef3c7"

    # 特殊
    OVERLAY = "rgba(0, 0, 0, 0.5)"
    OVERLAY_LIGHT = "rgba(0, 0, 0, 0.25)"
    SHADOW = "rgba(0, 0, 0, 0.10)"


class Spacing:
    """间距系统 - 4px 基准，清晰层次，充足留白"""
    # 基础间距 - 从微小到宏大的完整层次
    XXS = 2   # 图标与文字间距
    XS = 4    # 紧凑元素内边距
    SM = 8    # 小间距/按钮内边距
    MD = 12   # 中等间距/表单元素间距
    LG = 16   # 大间距/卡片间距
    XL = 24   # 区块间距/卡片垂直内边距
    XXL = 32  # 卡片水平内边距/大区块间距
    XXXL = 48  # 页面级大边距
    
    # 页面级留白 - 充足呼吸空间
    PAGE_H = 48  # 页面水平边距（左右）
    PAGE_V = 32  # 页面垂直边距（上下）


class Radius:
    """圆角系统"""
    NONE = 0
    SM = 4
    MD = 6
    LG = 8
    XL = 12
    XXL = 16


class Typography:
    """排版系统 - 强排版，标题与正文字号差异明显"""
    # 字号 - 拉大层次差异（12→14→16→18→24，每级 ≥2px）
    SIZE_XXS = 11   # 极小标签/角标
    SIZE_XS = 12    # 辅助文本/说明文字
    SIZE_SM = 14    # 正文/默认字号
    SIZE_MD = 16    # 卡片标题
    SIZE_LG = 18    # 区块标题
    SIZE_XL = 20    # 次级页面标题
    SIZE_XXL = 24   # 页面标题
    SIZE_XXXL = 32  # 大标题/数据展示
    SIZE_HUGE = 36  # 超大标题
    SIZE_MASSIVE = 40  # 英雄区标题

    # 字重 - 明确的层次（Regular/Semi/Bold 三级核心）
    WEIGHT_LIGHT = 300
    WEIGHT_REGULAR = 400   # 正文
    WEIGHT_MEDIUM = 500
    WEIGHT_SEMI = 600      # 卡片/区块标题
    WEIGHT_BOLD = 700      # 页面标题/强调

    # 行高
    LINE_HEIGHT_TIGHT = 1.25    # 标题
    LINE_HEIGHT_NORMAL = 1.5    # 正文
    LINE_HEIGHT_RELAXED = 1.7   # 长段落/辅助文本

    # ── 排版预设（语义化快捷引用） ──
    # 页面标题：24px + Bold
    PAGE_TITLE = (SIZE_XXL, WEIGHT_BOLD, LINE_HEIGHT_TIGHT)
    # 区块标题：18px + Semi
    SECTION_TITLE = (SIZE_LG, WEIGHT_SEMI, LINE_HEIGHT_TIGHT)
    # 卡片标题：16px + Semi
    CARD_TITLE = (SIZE_MD, WEIGHT_SEMI, LINE_HEIGHT_TIGHT)
    # 正文：14px + Regular
    BODY = (SIZE_SM, WEIGHT_REGULAR, LINE_HEIGHT_NORMAL)
    # 辅助文本：12px + Regular
    CAPTION = (SIZE_XS, WEIGHT_REGULAR, LINE_HEIGHT_NORMAL)


class Shadow:
    """阴影系统 - PyQt6 QGraphicsDropShadowEffect 参数
    格式：(blur_radius, x_offset, y_offset, alpha)
    """
    # 基础阴影层次 - 从极弱到强烈
    NONE = (0, 0, 0, 0)
    SM = (4, 0, 1, 0.04)    # 极弱阴影/微浮起
    MD = (8, 0, 2, 0.06)    # 轻微浮起
    LG = (16, 0, 4, 0.08)   # 明显浮起
    XL = (28, 0, 8, 0.12)   # 强烈浮起

    # ── 语义化阴影预设 ──
    # 卡片默认阴影 - 柔和自然，轻微浮起感
    CARD_DEFAULT = (12, 0, 2, 0.08)
    # 卡片悬停阴影 - 加深 + 上浮效果（y_offset 增加）
    CARD_HOVER = (20, 0, 6, 0.14)
    # 弹窗/对话框阴影 - 强烈，突出层级
    DIALOG = (32, 0, 12, 0.20)
    # 下拉菜单阴影 - 中等强度
    DROPDOWN = (16, 0, 4, 0.10)


# 便捷访问
Colors = Color
