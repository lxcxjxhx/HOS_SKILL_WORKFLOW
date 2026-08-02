---
name: HOS-Content-Adapt
description: "HOS 多平台内容适配引擎 — 一篇原始内容自动转换为 CSDN/FreeBuf/Dev.to/Medium/社交平台格式"
license: MIT
metadata:
  author: HOS Team
  version: "1.0.0"
  tags: [content-adapt, 多平台, CSDN, Dev.to, Medium, FreeBuf, SEO]
  category: content-production
  risk-level: low
---

# hos-content-adapt

## Description
HOS 多平台内容适配引擎。将一篇原始技术内容自动转换为适合不同平台发布的格式，覆盖中文开发者社区、安全社区、国际开发者社区、社交平台、视频脚本等全矩阵。

## Trigger
当用户提到以下关键词时激活：
- "适配"、"改写"、"转载"、"同步"
- "发到 XX 平台"、"改成 XX 格式"
- "多平台"、"内容分发"、"cross-post"

## Context

### HOS 传播矩阵

| 层级 | 平台 | 受众 | 内容风格 |
|------|------|------|---------|
| **核心层** | GitHub (Repo/Release/Discussion) | 开源开发者 | 英文、技术深度 |
| **中文开发者** | CSDN、博客园、掘金、开发者头条 | 国内程序员 | 中文、实战导向 |
| **安全社区** | FreeBuf、看雪、先知、奇安信 | 安全从业者 | 中文、安全视角 |
| **国际开发者** | Dev.to、Hashnode、Medium | 全球开发者 | 英文、工程实践 |
| **国际曝光** | Reddit、Hacker News、Lobsters | 技术爱好者 | 英文、讨论导向 |
| **社交平台** | X/Twitter、LinkedIn、Bluesky | 行业人群 | 短文本、数据驱动 |
| **视频平台** | Bilibili、YouTube、抖音 | 广泛受众 | 视觉化、3 分钟内 |
| **AI 生态** | Hugging Face、ModelScope | AI 开发者 | Dataset/Tool/Demo |

## Workflow

### Step 1: 接收原始内容
用户输入一篇原始文章（可以是任何格式），或者指定 `hos-dev-log` / `hos-weekly-update` / `hos-release-notes` 的输出文件。

### Step 2: 确定目标平台
用户指定目标平台，或选择以下预设组合：

| 预设 | 包含平台 |
|------|---------|
| **全平台** | 所有层级 |
| **中文开发者** | CSDN + 博客园 + 掘金 |
| **安全社区** | FreeBuf + 看雪 + 先知 |
| **国际推广** | Dev.to + Medium + Reddit + HN |
| **社交快发** | X/Twitter + LinkedIn + 微博 |
| **视频脚本** | Bilibili + YouTube |

### Step 3: 按平台规则改写

#### CSDN / 博客园
```
格式: Markdown，1500-3000 字
语言: 中文，保留英文技术术语
结构: 标题 + 摘要 + 正文 + 参考链接
特殊要求:
  - 标题要有吸引力，可用数字（"3 种方法"、"降低 68%"）
  - 开头 2 段必须有钩子（问题/数据/反直觉观点）
  - 代码块必须完整可运行
  - 末尾加 GitHub 链接和 "Star 支持" 引导
  - 可加目录（CSDN 支持 TOC）
标签: AI安全, 开源, <具体技术关键词>
```

#### FreeBuf / 看雪 / 先知
```
格式: Markdown，1000-2500 字
语言: 中文
结构: 安全视角重构
  - 从攻击/防御角度切入
  - 强调漏洞原理和检测方法
  - 工具使用部分侧重安全场景
特殊要求:
  - 不涉及具体攻击 payload
  - 强调防御价值和合规性
  - 可引用 CVE / OWASP 编号
  - 末尾加项目链接
```

#### Dev.to / Medium
```
格式: Markdown, 1000-2000 words
语言: English
结构:
  - Catchy title with numbers or "How I..."
  - TL;DR at the top
  - Problem → Solution → Results
  - Code snippets (key parts only)
  - Call to action (GitHub star / follow)
特殊要求:
  - Dev.to: use front matter (title, published, tags, cover_image)
  - Medium: use subtitles, keep paragraphs short (3-4 lines max)
  - Include "Originally published at [CSDN link]" if cross-posting
```

#### Reddit / Hacker News
```
格式: Plain text, 200-500 words
语言: English
结构:
  - Reddit: Title + body with key insight + question to discussion
  - HN: "Show HN: <project>" + 2-3 sentences + link
特殊要求:
  - 不要像广告，要像分享经历
  - 承认局限性和 trade-offs
  - 准备好回答评论
  - Reddit 标题格式: "[Project] How we solved X" 或 "I built X to solve Y"
```

#### X/Twitter
```
格式: Thread (每条 ≤ 280 字符) 或单条
语言: English (国际) / 中文 (国内)
结构:
  - Hook (第一条抓注意力)
  - 3-5 条核心内容
  - 数据对比 (Before → After)
  - GitHub link (最后一条)
特殊要求:
  - 用 ↓ 表示 thread 继续
  - 可用截图/代码片段配图
  - Hashtags: #AI #Security #OpenSource #<specific>
```

#### LinkedIn
```
格式: 长文 post, 500-1000 words
语言: English
结构:
  - 开头用个人故事/反思
  - 中间讲技术成就
  - 结尾讲愿景和邀请合作
特殊要求:
  - 专业但不枯燥
  - 强调 impact 和 learning
  - Tag 相关人和组织
```

#### Bilibili / YouTube 脚本
```
格式: 视频脚本, 3 分钟
语言: 中文 (B站) / English (YouTube)
结构:
  0:00-0:15  Hook (问题/痛点)
  0:15-0:45  背景 (为什么要做)
  0:45-2:00  Demo (git clone → 启动 → 分析 → 输出)
  2:00-2:30  技术亮点 (1-2 个)
  2:30-3:00  总结 + GitHub 链接
特殊要求:
  - 口语化，不要念稿感
  - 每个步骤配屏幕录制
  - B站加弹幕互动引导
```

### Step 4: 生成发布清单
输出一个 checklist，包含每个平台的发布状态：

```markdown
## 发布清单

| 平台 | 状态 | 链接 | 备注 |
|------|------|------|------|
| CSDN | ☐ 待发布 | | |
| FreeBuf | ☐ 待发布 | | |
| Dev.to | ☐ 待发布 | | |
| X/Twitter | ☐ 待发布 | | |
| ... | | | |
```

## Rules
1. 同一篇文章在不同平台发布时，标题必须不同（避免 SEO 重复）
2. 中文平台保留英文技术术语，不强行翻译
3. 安全社区版本必须从安全视角重构，不是简单翻译
4. 社交平台内容必须包含具体数据
5. 所有内容末尾必须包含 GitHub 仓库链接
6. 视频脚本必须控制在 3 分钟以内（约 500 字中文 / 400 词英文）
7. 输出保存到 `c:\1AAA-PROJECT\BOS\BOS-OPER\hos-skills\output\adapted\` 目录，按平台名分子目录
