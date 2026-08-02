# PPT Visual Spec — 幻灯片视觉设计规范

> **本文件定义 PPT 的视觉呈现**，与 `ppt-6page.md`（槽位定义）配套使用。
> `ppt-6page.md` 定义"每页填什么内容"，本文件定义"每页长什么样"。

---

## 1. 页面类型总览

**8 种**页面类型（更新：新增目录页 + 过渡页）：

| 类型 | 页码 | 视觉风格 | 布局特征 |
|------|------|---------|---------|
| **开场** | 1 | 大气、留白、品牌感 | 居中标语 + 副标题 + 背景渐变 |
| **目录** | 2 | 清晰、结构化、引导 | **新增** 左编号+模块标题+当前高亮 |
| **过渡** | 3/6/9 | 简洁、节奏、分隔 | **新增** 大号章节编号 + 标题 + dark背景 |
| **问题** | 4~5 | 冲击、对比、高亮 | 左文右图 / 大数字 + 数据倾斜 |
| **破除** | 6~7 | 对比、翻转、戏剧性 | 左右分栏 + 箭头/分隔线 |
| **核心** | 8~10 | 清晰、节奏、层次 | 上标题 + 下卡片/列表 |
| **行动** | 11~12 | 方向、进度、引导 | 步骤编号 + 时间线/路径 |
| **总结** | 13~14 | 温暖、升华、金句 | 引用框 + 故事框 + CTA 按钮 |

**注意**：加入目录页和过渡页后，标准课程从 12 页 → 14 页。
总视频时长仍保持 600 秒（过渡页分配 8~10 秒/页）。

---

## 2. 配色方案

### 2.1 按 Style 预设

#### calm — 温暖、柔和、低饱和度

```
主色:    #2D3436   (深灰蓝)
次色:    #636E72   (中灰)
强调:    #FDCB6E   (暖黄)
背景:    #F8F9FA   (暖白)
卡片:    #FFFFFF   (白)
高亮:    #E17055   (暖橙)
文字:    #2D3436   (主文字)
文字轻:  #636E72   (辅助文字)
成功:    #00B894   (绿)
```

#### hype — 活力、高对比、饱和

```
主色:    #0A0A23   (深蓝黑)
次色:    #1B1B4B   (深蓝)
强调:    #FF6B6B   (亮红)
背景:    #0A0A23   (深色背景)
卡片:    #1B1B4B   (深色卡片)
高亮:    #FFD93D   (亮黄)
文字:    #FFFFFF   (白色文字)
文字轻:  #A0A0C0   (淡灰)
成功:    #6BCB77   (绿)
```

#### academic — 正式、干净、专业

```
主色:    #1A365D   (深蓝)
次色:    #2B6CB0   (中蓝)
强调:    #E53E3E   (红)
背景:    #FFFFFF   (纯白)
卡片:    #F7FAFC   (极浅灰)
高亮:    #DD6B20   (橙)
文字:    #1A202C   (近黑)
文字轻:  #718096   (灰蓝)
成功:    #38A169   (绿)
```

#### storytelling — 温暖、叙事、亲和

```
主色:    #4A3728   (暖棕)
次色:    #7F5539   (中棕)
强调:    #D4A373   (米金)
背景:    #FFF8F0   (米白)
卡片:    #FFFFFF   (白)
高亮:    #E07A5F   (珊瑚)
文字:    #3D2B1F   (深棕)
文字轻:  #9C7C5D   (浅棕)
成功:    #81B29A   (灰绿)
```

### 2.2 色彩应用规则

```
背景层:    background_color           (全页底色)
主内容层:  background_color + shadow  (卡片/区块底色)
文字层:    text_color                 (正文)
强调层:    accent_color               (标题/数字/CTA)
轻文字层:  light_text_color           (副标题/引用)
高亮层:    highlight_color            (关键数据/高亮词)
```

---

## 3. 字体层级

| 层级 | 字号 | 字重 | 颜色 | 用途 |
|------|------|------|------|------|
| H1 | 56~64pt | Bold | 主色 | 页面大标题 |
| H2 | 40~48pt | SemiBold | 主色 | 章节标题 |
| H3 | 32~36pt | SemiBold | 主色 | 卡片/区块标题 |
| Body | 26~30pt | Regular | 文字 | 正文内容 |
| Caption | 20~24pt | Regular | 文字轻 | 副标题/注释 |
| Highlight | 72~96pt | Bold | 强调 | 数字/关键数据 |
| Quote | 28~32pt | Italic/Bold | 高亮 | 金句/引用 |

**字重映射**:
- Bold → Pillow: `ImageFont.truetype(weight="bold")`
- SemiBold → 若无则使用 Bold 0.8 倍大小
- Regular → 默认
- Italic → 若无则使用 Regular + 倾斜

---

## 4. 6 种页面类型布局

### 类型 1: 开场 — Page 1

```
┌─────────────────────────────────────┐
│                                     │
│            ┌──────────┐             │
│            │  LOGO     │            │
│            │  (可选)   │            │
│            └──────────┘             │
│                                     │
│        ╔══════════════════╗         │
│        ║  {{title}}       ║   H1    │
│        ║  主标题 ≤20字     ║         │
│        ╚══════════════════╝         │
│                                     │
│          {{subtitle}}              │
│          副标题 ≤30字                │
│                                     │
│         ── ● ● ● ──                │
│         装饰分隔线                    │
│                                     │
│     {{direction}} | {{duration}}     │
│                                     │
└─────────────────────────────────────┘

装饰: 大字体居中 / 底部渐变色块 / 顶部可能放 Logo
背景: 渐变 (background_color → 浅 10%)
```

### 类型 2: 问题冲击 — Pages 2~3

```
┌─────────────────────────────────────┐
│  ◉ 问题                          │
│  左上角类型标记 + 进度: 2/12         │
│                                     │
│  ┌─────────────────────────┐        │
│  │   {{shock_title}}       │  H2    │
│  │   冲击性标题              │        │
│  │                         │        │
│  │   {{shock_desc}}        │  Body  │
│  │   问题描述                │        │
│  └─────────────────────────┘        │
│                                     │
│     ╔══════════════╗               │
│     ║  {{数字}}     ║  Highlight   │
│     ║  核心数据高亮   ║              │
│     ╚══════════════╝               │
│                                     │
│  ─────────────────────────────────  │
│  底部进度条 (2/12)                   │
└─────────────────────────────────────┘

装饰: 大数字高亮 / 左侧或右侧可能配装饰性图标
数据: 使用 Highlight 字体, 加背景色块
```

### 类型 3: 破除误区/真相揭示 — Pages 4~5

```
┌─────────────────────────────────────┐
│  ◉ 破除                          │
│                                     │
│  ┌──────────┐   ┌──────────┐       │
│  │ ❌ 误区   │ → │ ✅ 真相   │      │
│  │          │   │          │       │
│  │ {{myth}} │   │ {{truth}}│       │
│  │          │   │          │       │
│  └──────────┘   └──────────┘       │
│                                     │
│  ┌──────────┐   ┌──────────┐       │
│  │ ❌ 误区   │ → │ ✅ 真相   │      │
│  │ ...      │   │ ...      │       │
│  └──────────┘   └──────────┘       │
│                                     │
│  ─────────────────────────────────  │
│  底部进度条                          │
└─────────────────────────────────────┘

装饰: 左右分栏 + 箭头 → / 左灰右彩色 / 
      误区卡片用低透明度, 真相卡片用强调色边框
      箭头 = "→" 或 "▸" 或自定义图标
```

### 类型 4: 核心观点 — Pages 6~8

```
┌─────────────────────────────────────┐
│  ◉ 核心观点                        │
│                                     │
│  ┌──────────────────────┐           │
│  │  {{core_title}}      │  H3      │
│  │  观点标题              │          │
│  │                      │          │
│  │  ┌────────────────┐  │          │
│  │  │ 观点1: detail  │  │  卡片1   │
│  │  ├────────────────┤  │          │
│  │  │ 观点2: detail  │  │  卡片2   │
│  │  └────────────────┘  │          │
│  └──────────────────────┘           │
│                                     │
│  ① ● ● ○ ○ ○ ○   进度: 6/12        │
│  页码小圆点 (当前页高亮)              │
└─────────────────────────────────────┘

装饰: 圆角卡片 / 编号圆圈 ①②③ / 卡片间留白 20px
      每页2个观点, 3页共6个观点
      视图2: 可使用子帧轮播, 先显示观点1, 10秒后显示观点2
```

### 类型 5: 行动方案/步骤 — Pages 9~10

```
┌─────────────────────────────────────┐
│  ◉ 行动方案                        │
│                                     │
│  ① ──────── ② ──────── ③          │
│  ┌──────┐   ┌──────┐   ┌──────┐   │
│  │ step │   │ step │   │ step │   │
│  │  1   │ → │  2   │ → │  3   │   │
│  │      │   │      │   │      │   │
│  │ detail│   │ detail│   │ detail│  │
│  └──────┘   └──────┘   └──────┘   │
│                                     │
│  ─────────────────────   ─────      │
│  时间线/进度线                       │
│                                     │
│  💡 {{method_tip}}                 │
│  底部提示框, 圆角背景                 │
└─────────────────────────────────────┘

装饰: 横向时间线 / 编号圆圈 ①②③ / 步骤间箭头 →
      底部提示框用浅色背景 + 左边框强调
      Page 10 用纵向列表布局 (如果步骤多)
```

### 类型 6: 总结/金句/CTA — Pages 11~12

```
┌─────────────────────────────────────┐
│  ◉ 总结                            │
│                                     │
│  ┌─────────────────────────┐        │
│  │  " {{golden_sentence}}  │  金句  │
│  │    一句话金句             │        │
│  │                         │        │
│  │  — {{takeaway_1}}       │  要点  │
│  │  — {{takeaway_2}}       │        │
│  │  — {{takeaway_3}}       │        │
│  └─────────────────────────┘        │
│                                     │
│  ┌─────────────────────────┐        │
│  │  {{cta_text}}           │  按钮  │
│  │  CTA 行动号召, 强调色背景  │        │
│  └─────────────────────────┘        │
│                                     │
│  感谢观看 / 关注引导 (小字)           │
└─────────────────────────────────────┘

装饰: 金句引用框 (左边竖线 + 引号图标)
      要点用列表符号 — 或 ●
      CTA 按钮用强调色背景 + 白色文字
      Page 12 可加案例故事框
```

---

## 5. 装饰元素规范

### 5.1 进度条

```
位置: 每页底部, 距离底边 40px
样式: 圆角矩形, 高度 6px
      ━━━━━━━━━━━━━━━━━━━━━━━━━━
      已完成部分用强调色, 剩余用 20% 透明度

已读: 前 x 页用强调色实心
当前: 当前页用强调色高亮圆点
未读: 灰色半透明
```

### 5.2 编号圆圈

```
直径: 48px (带圈数字)
样式: 实心圆 + 白色数字
      Circle: 背景色 = 强调色 (当前) 或 灰色 (未到)
      Number: 白色, Bold, 20pt
```

### 5.3 卡片阴影

```
标准卡片: 
  ┌─────────────────────┐
  │  background: #FFF   │
  │  border-radius: 16px│
  │  box-shadow: 0 4px  │
  │    12px rgba(0,0,0, │
  │    0.08)            │
  └─────────────────────┘

高亮卡片:
  border-left: 4px solid {accent_color}
```

### 5.4 分隔线

```
类型1: 点线 ── ● ● ● ──    (开场页)
类型2: 实线 ──────────────  (内容页)
颜色: {accent_color} at 30% opacity
宽度: 60% 页面宽度
```

### 5.5 背景图

每类页面预设 AI 生成 prompt，详见 `config/visual-assets-spec.md`。

---

## 6. 新增页面类型

> **🚨 关键升级**：从 6 种 → **8 种**页面类型。增加目录页(TOC)和过渡页(Section Divider)。

### 6.1 完整页面序列（标准课程 12 页）

```
页码  类型        主题                 视觉主题
─────────────────────────────────────────────
  1   开场        封面标题              dark 背景
  2   目录        TOC                  亮色/卡片
  3   ─ 过渡 ─    Part 1: 问题认知      dark 背景
  4   问题        问题冲击              数据+大数字
  5   破除        误区 vs 真相          左右对比
  6   ─ 过渡 ─    Part 2: 核心观点      dark 背景
  7   核心        观点 1~2              卡片+子帧
  8   核心        观点 3~4              卡片+子帧
  9   ─ 过渡 ─    Part 3: 行动指南      dark 背景
 10   行动        步骤 1~3              时间线
 11   行动        步骤 4~5              进度条
 12   总结        金句+CTA              dark 背景

✅ 新增: 页码2=目录页, 页码3/6/9=过渡页(视内容拆为3~4部分)
```

### 6.2 目录页 (TOC) — Page 2

```
┌─────────────────────────────────────┐
│  课程大纲                            │
│  COURSE OUTLINE                     │
│                                     │
│  01 ──────── 问题认知               │
│  │  认识AI安全的真实威胁              │
│                                     │
│  02 ──────── 核心观点               │
│  │  理解安全漏洞的本质                │
│                                     │
│  03 ──────── 行动指南               │
│  │  可立即执行的防护方案              │
│                                     │
│  本集: 01/03  时长: 10分钟           │
│                              ● ● ○ │
│  底部小圆点指示当前位置                │
└─────────────────────────────────────┘

布局: 左对齐编号(01/02/03) + 标题 + 副标题
装饰: 当前部分用强调色高亮，其余灰色
背景: light 主题 (亮色)
```

### 6.3 过渡页 (Section Divider) — 插入在 Part 之间

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│     01                              │
│   ╔══════════════════╗              │
│   ║ 问题认知          ║              │
│   ║ 认识AI安全的真实     ║            │
│   ║ 威胁              ║              │
│   ╚══════════════════╝              │
│                                     │
│  ━━━━━━━━━━━━━━━━━                  │
│  装饰底线，宽度 30%                   │
│                                     │
│                                     │
└─────────────────────────────────────┘

布局: 居中大号章节编号(72pt, 半透明) + 标题
背景: dark 主题 (与开场/总结一致)
装饰: 底部装饰线(accent色)、章节编号作为背景装饰(低透明度)
时长: 8~10秒 (简短过渡，不停留)
```

---

## 7. 内容密度标准（与 course-quality-standards.md 配套）

**每页最低内容量**，由 `course-quality-standards.md` 定义，此处仅做摘要：

| 页面类型 | 建议字数下限 | 信息密度标准 |
|---------|------------|------------|
| 标题页 | 15~30 字 | 主标题+副标题 |
| 目录页 | 30~60 字 | 3个模块标题+描述 |
| 过渡页 | 10~20 字 | 仅章节标题 |
| 问题/数据页 | **80~150 字** | 数据+解释+来源 |
| 误区/破除页 | 100~200 字 | 3组误区→真相 |
| 核心观点页 | **120~250 字** | 观点+原理+例证+小结 |
| 行动步骤页 | 100~200 字 | 步骤+说明+效果 |
| 总结页 | 80~150 字 | 3个takeaway+金句+CTA |

**规则**：不满足字数下限的内容页，STEP8 验证时标记 WARN。

---

## 6. 输出格式扩展

PPT 数据输出时增加 visual 字段：

```json
{
  "project": "project-id",
  "template": "12page-10min",
  "style": "calm",
  "colors": {
    "primary": "#2D3436",
    "secondary": "#636E72",
    "accent": "#FDCB6E",
    "background": "#F8F9FA",
    "card": "#FFFFFF",
    "highlight": "#E17055",
    "text": "#2D3436",
    "text_light": "#636E72"
  },
  "pages": [
    {
      "page": 1,
      "type": "opening",
      "layout": "centered",
      "title": "...",
      "subtitle": "...",
      "duration_sec": 30,
      "visual": {
        "background": "gradient",
        "decoration": "dots_divider",
        "progress": "1/12"
      }
    }
  ]
}
```

---

## 7. Pillow 实现参考

```python
from PIL import Image, ImageDraw, ImageFont
import os

# 全局风格参数
STYLE = "calm"

# ═══════════════════════════════════════
# 字体系统 (P0: 放弃SimSun → 思源黑体)
# ═══════════════════════════════════════
# 安装: 从 https://github.com/adobe-fonts/source-han-sans/releases 下载
# 或: 使用系统已有字体 (macOS: PingFang SC, Windows: Microsoft YaHei)
FONTS = {
    "heading": "SourceHanSansSC-Bold",     # 思源黑体 Bold → 标题
    "heading_alt": "SourceHanSansSC-Medium", # 思源黑体 Medium → 副标题
    "body": "SourceHanSansSC-Regular",     # 思源黑体 Regular → 正文
    "body_bold": "SourceHanSansSC-Bold",   # 思源黑体 Bold → 强调正文
    "accent": "SourceHanSansSC-Heavy",     # 思源黑体 Heavy → 大数字
    "quote": "SourceHanSerifSC-Bold",      # 思源宋体 Bold → 金句(保留衬线)
    "number": "Georgia-Bold",              # 英文数字衬线 → 页码/数据
    
    # 回退字体 (当思源不可用时)
    "fallback_heading": "Microsoft YaHei UI Bold",
    "fallback_body": "Microsoft YaHei UI Regular",
}

# 字号层级系统
TYPE_SCALE = {
    "cover_title": 44,     # 封面主标题
    "cover_sub": 20,       # 封面副标题
    "section_title": 36,   # 章节页/过渡页标题
    "slide_title": 28,     # 内容页标题
    "body": 16,            # 正文
    "body_large": 18,      # 强调正文
    "caption": 12,         # 注释/来源
    "page_num": 10,        # 页码
    "big_number": 72,      # 大数字 (如90%)
    "quote": 20,           # 金句/引用
}

# ═══════════════════════════════════════
# 优化后的配色系统 (增加功能色)
# ═══════════════════════════════════════
COLOR_SCHEMES = {
    "calm": {
        "dark": {
            "bg": "#0F172A", "bg_alt": "#1E293B",
            "accent": "#E11D48", "accent_light": "#FB7185",
            "success": "#10B981", "warning": "#F59E0B", "info": "#3B82F6",
            "text": "#F8FAFC", "text_muted": "#94A3B8",
        },
        "light": {
            "bg": "#FFFFFF", "bg_alt": "#F1F5F9",
            "accent": "#E11D48", "accent_light": "#FECDD3",
            "success": "#059669", "warning": "#D97706", "info": "#2563EB",
            "text": "#0F172A", "text_muted": "#64748B", "border": "#E2E8F0",
        }
    },
    "hype": { ... },  # 略，保持格式一致
    "academic": { ... },
    "storytelling": { ... },
}

def get_colors(style, theme="light"):
    return COLOR_SCHEMES.get(style, COLOR_SCHEMES["calm"])[theme]

W, H = 1920, 1080

def draw_opening_page(title, subtitle, direction, duration, page_idx, total_pages):
    """开场页渲染"""
    img = Image.new("RGB", (W, H), COLORS["background"])
    draw = ImageDraw.Draw(img)

    # 渐变背景 (顶部深 → 底部浅)
    for y in range(H):
        ratio = y / H
        r = int(248 * (1 - ratio) + 248 * ratio)
        g = int(249 * (1 - ratio) + 249 * ratio)
        b = int(250 * (1 - ratio) + 250 * ratio)
        draw.point((0, y), fill=(r, g, b))

    # 主标题
    draw.text((W//2, H//3), title, fill=COLORS["primary"],
              font=ImageFont.truetype("msyh.ttf", 64), anchor="mm")

    # 副标题
    draw.text((W//2, H//2 + 60), subtitle, fill=COLORS["text_light"],
              font=ImageFont.truetype("msyh.ttf", 32), anchor="mm")

    # 底部进度条
    draw_progress_bar(draw, page_idx, total_pages)

    return img

def draw_progress_bar(draw, current, total, y_offset=1040):
    """底部进度条"""
    bar_w, bar_h = 800, 6
    bar_x = (W - bar_w) // 2
    bar_y = y_offset
    # 背景
    draw.rounded_rectangle([bar_x, bar_y, bar_x+bar_w, bar_y+bar_h],
                          radius=3, fill=COLORS["secondary"] + "33")
    # 已读
    progress = bar_w * current // total
    draw.rounded_rectangle([bar_x, bar_y, bar_x+progress, bar_y+bar_h],
                          radius=3, fill=COLORS["accent"])
    # 圆点
    dot_x = bar_x + progress
    draw.ellipse([dot_x-8, bar_y-5, dot_x+8, bar_y+11],
                fill=COLORS["highlight"])

def draw_content_page(page_type, title, body_items, notes,
                      page_idx, total_pages, subframe_idx=None):
    """通用内容页渲染"""
    # 按 page_type 选择布局
    layouts = {
        "problem":   draw_problem_layout,
        "myth":      draw_myth_layout,
        "core":      draw_core_layout,
        "action":    draw_action_layout,
        "summary":   draw_summary_layout,
    }
    render = layouts.get(page_type, draw_problem_layout)
    return render(title, body_items, notes, page_idx, total_pages)
```
