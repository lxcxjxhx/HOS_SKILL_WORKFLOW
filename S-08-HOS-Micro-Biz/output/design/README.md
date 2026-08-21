# HOS 对外获客设计资产

> 为拼多多 / 淘宝 / 咸鱼 / 朋友圈 / 小红书等纯视觉竞争场准备的全套可视化素材。
> 视觉系统：风信子深紫罗兰 + 勃艮第红 + 青铜绿 + 暗背景高对比，与满屏橙红的低价竞品差异化。

## 一键入口

打开 `index.html` 即可浏览全部 68 个文件，按产品线 / 按平台两种方式速查。

## 目录结构

```
design/
├── index.html                      # 总索引页（一键入口）
├── README.md                       # 本文件
├── design-system/                  # B0 视觉系统基线
│   ├── colors_and_type.css         # 配色 token / 字体 / 间距 / 工具类
│   ├── hos-visual-sample.jpg       # 风信子主视觉样板
│   └── image-prompt-templates.md   # 4 类 GenerateImage prompt 模板
├── pdp/                            # B1 详情页长图
│   ├── kv-{产品线}.jpg             # 4 张 KV 主视觉
│   └── pdp-{产品线}.html           # 4 个八模块 HTML 长图
├── main-and-posters/               # B2 主图与海报
│   ├── main-{产品线}.jpg           # 4 张商品主图 1024×1024
│   ├── poster-{产品线}.jpg         # 4 张促销海报 720×1280
│   └── lead-{产品线}.jpg           # 4 张闲鱼引流图 864×1152
├── landing-pages/                  # B3 精装落地页
│   └── lp-{产品线}.html            # 4 个 H5 落地页（单文件无依赖）
├── cases/                          # B5 案例展示页（信任外壳）
│   ├── case-course-project.html    # 课设毕设 5 案例 + 信任墙
│   ├── case-ai-app.html            # AI 应用 5 案例 + 技术栈
│   ├── case-security.html          # 信息安全 5 案例 + 授权声明
│   └── case-all-in-one.html        # 全四类 6 案例 + 生态背书
└── packs/                          # B4 全套素材包
    ├── pack-course-project/        # 课设毕设 8 图 + README
    ├── pack-ai-app/                # AI 应用 8 图 + README
    ├── pack-security/              # 信息安全 8 图 + README
    └── pack-all-in-one/            # 全四类综合 9 图 + README（含生态图）
```

## 四条产品线

| 产品线 | 关键词 | 价格锚 | 红线 |
|--------|--------|--------|------|
| 课设/毕设 | 硕士背景/代码讲解/答辩辅导 | 9.9 → 200 → 800 | 不代写论文/不代考 |
| AI 应用 | 大模型部署/RAG/Agent | 100 → 500 → 1000 | 数据安全可本地部署 |
| 信息安全 | 授权渗透/加固/CTF/等保 | 50 → 300 → 500 → 1000 | 不接非法攻击 |
| 全四类综合 | 一站式 + HOS 生态 | 9.9 通用引流 | 统一红线 + 生态背书 |

## 按平台使用指南

### 闲鱼（9 图位）

进入 `packs/pack-{产品线}/`，按其 README 的 9 图位规划上传：
1. 首图 = `lead-{产品线}.jpg`（引用 `../../main-and-posters/`）
2. 卖点 = `main-{产品线}.jpg`（引用 `../../main-and-posters/`）
3. 服务菜单 = `kv-{产品线}.jpg`（引用 `../../pdp/`）
4. 案例展示 = `06-friend-case.jpg`（pack 内）
5-7. 流程/价格/保障 = 文字图（参考 README）
8. 好评截图 = 实际好评脱敏
9. 引流二维码 = `poster-{产品线}.jpg`（引用 `../../main-and-posters/`）

### 拼多多 / 淘宝 PDP

- 主图：`main-and-posters/main-{产品线}.jpg`
- 详情页长图：用浏览器打开 `pdp/pdp-{产品线}.html`，截图为长图上传；或直接用 `pdp/kv-{产品线}.jpg`

### 微信私域转化

直接发 `landing-pages/lp-{产品线}.html` 链接到微信（单文件无依赖，含表单/案例轮播/交互）。

### 朋友圈运营

按"案例/知识/促销"三型轮换：
- 案例型 = pack 内 `06-friend-case.jpg`
- 知识型 = pack 内 `07-friend-knowledge.jpg`
- 促销型 = pack 内 `08-friend-promo.jpg`

文案配合 `hos-skills/hos-micro-biz.md` 第三节朋友圈模板。

### 小红书种草

用 pack 内 `05-xhs-cover.jpg` 作首图封面（1080×1440 竖版，大字钩子标题）。

### 案例展示页（信任外壳）

客户从电商详情页或朋友圈点进来后，需要一个"看得见实力"的落地页建立信任。直接发 `cases/case-{产品线}.html` 链接到微信：

- 课设毕设：`cases/case-course-project.html` — 5 个脱敏案例 + 信任统计 + 信任墙 + 红线声明
- AI 应用：`cases/case-ai-app.html` — 5 个脱敏案例 + 技术栈展示 + 能力矩阵 + 红线声明
- 信息安全：`cases/case-security.html` — 5 个脱敏案例 + 授权合规声明 + 交付物清单 + 强化红线
- 全四类综合：`cases/case-all-in-one.html` — 6 个跨领域案例 + HOS 三色生态背书 + 四类能力总览

所有案例页均为移动端竖版长图（max-width 480px），单文件无依赖，含 CTA 按钮和微信二维码占位区。

## 视觉系统规范

### 配色（CSS 变量定义在 `design-system/colors_and_type.css`）

| 用途 | 色值 | 占比 |
|------|------|------|
| 暗背景 | `#0F0A1F` / `#1A1129` / `#241638` | ≥55% |
| 风信子紫系 | `#5B2C91` / `#7C3AED` / `#A78BFA` | 25-30% |
| 勃艮第红 | `#8B1A3C`（警示/红线） | ≤10% |
| 青铜绿 | `#3D5A4C`（信任/流程） | ≤10% |
| 价格锚金 | `#FFB347`（唯一暖色例外） | ≤3% |

### 字体

- 标题：`Noto Serif SC`（衬线，高级感）
- 正文：`Noto Sans SC`（无衬线）
- 价格/代码：`JetBrains Mono`（等宽）

### 版式

- 暗背景高对比，文字近白
- 页头页脚用紫-红-绿三色细色带作品牌识别符
- 卡片化分块，圆角 16px
- 移动端优先，图片宽度基准 750px，落地页 max-width 480px

## 资产统计

| 批次 | 产物 | 文件数 |
|------|------|--------|
| B0 视觉系统 | token + 样板 + prompt 模板 | 3 |
| B1 详情页 | 4 KV + 4 HTML | 8 |
| B2 主图海报 | 4 主图 + 4 海报 + 4 引流 | 12 |
| B3 落地页 | 4 个 HTML H5 | 4 |
| B4 素材包 | 4 套（4+4+4+5 图 + 4 README） | 21 |
| B5 案例展示 | 4 个 HTML（信任外壳） | 4 |
| 索引 | index.html + README.md | 2 |
| **合计** | | **54** |

## 红线声明（严格遵守）

- 不代考
- 不代写论文
- 不接非法攻击
- 不接未授权测试
- 案例截图均已脱敏

## 与现有资产对齐

- 服务菜单与定价：对齐 `hos-skills/hos-micro-biz.md` 第一节服务分层与第二节定价公式
- 品牌色：主色复用 `hos-skills/hos-brand-guard.md` 的 HOS-LS=#7C3AED
- 文案红线：对齐 `hos-skills/hos-micro-biz.md` 第六节红线清单
- 内容适配：配合 `hos-skills/hos-content-adapt.md` 多平台文案规则

## HOS 生态背书

- HOS-Forge（#2563EB）：系统底层与开源工具
- HOS-LS（#7C3AED）：生活方式与技术服务
- HOS-Workflow（#059669）：工作流与效率

三仓库协同，技术深度可信。
