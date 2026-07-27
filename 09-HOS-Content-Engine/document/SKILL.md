---
name: Document
description: "D4 多格式输出子技能 — B站视频脚本、博客文章、GitHub仓库与多格式资产编排"
version: "1.0.0"
author: "HOS Team"
tags:
  - content-output
  - bilibili
  - blog
  - github
  - multi-format
category: "content-production"
risk-level: low
confidence: 0.90
---

# D4 Document：多格式输出子技能

> **一句话定位**：将 4D 素材包转化为 B站视频脚本、博客文章、GitHub 仓库等多格式内容资产。
> 编排调用 06-HOS-Fuck-Demo（资产生成）和 07-HOS-IP-Writing/blog（博客写作）。

---

## 一、触发条件

| 触发场景 | 示例表达 |
|---------|---------|
| 生成 B站视频脚本 | `生成 B站视频脚本`、`写一个视频分镜` |
| 把这个内容做成视频 | `把这个做成视频`、`出视频脚本` |
| 生成配套博客文章 | `生成配套博客`、`写一篇博客` |
| 创建 GitHub 仓库 | `创建 GitHub 仓库`、`初始化项目仓库` |
| 多格式输出 | `多格式输出`、`全平台发布` |
| 生成封面简报 | `生成封面简报`、`设计封面` |
| 生成 Demo 规格 | `生成 Demo 规格`、`做个演示` |

**不触发**：选题发现（→ D1 Discover）、源码分析（→ D2 Dissect）、开发实现（→ D3 Develop）。

---

## 二、核心能力

### 2.1 B站视频脚本生成

**标准 10 分钟结构**：

```yaml
video_script_structure:
  total_duration: 600s  # 10 分钟

  segments:
    - name: "Hook (钩子)"
      timecode: "0:00 - 0:30"
      duration: 30s
      purpose: "30 秒内抓住观众注意力"
      techniques:
        - 抛出震撼数据/事实
        - 提出引人好奇的问题
        - 展示最终效果/成果
      required_elements:
        - 视觉冲击画面
        - 悬念/期待感

    - name: "背景铺垫"
      timecode: "0:30 - 2:00"
      duration: 90s
      purpose: "建立上下文，让观众理解为什么要关注这个话题"
      techniques:
        - 行业背景/事件回顾
        - 痛点/问题引入
        - 与观众的关联点

    - name: "核心内容"
      timecode: "2:00 - 7:00"
      duration: 300s
      purpose: "传递核心价值，技术深度讲解"
      techniques:
        - 原理讲解 (配合动画/图解)
        - 代码演示 (Live Coding / 录屏)
        - 实战演示 (PoC / Demo)
        - 案例对比

    - name: "深度延伸"
      timecode: "7:00 - 8:30"
      duration: 90s
      purpose: "提供更深层次的思考或进阶内容"
      techniques:
        - 底层原理剖析
        - 行业趋势预测
        - 与其他技术的关联

    - name: "总结回顾"
      timecode: "8:30 - 9:30"
      duration: 60s
      purpose: "总结核心要点，强化记忆"
      techniques:
        - 3-5 个要点回顾
        - 关键结论强调
        - 行动建议

    - name: "CTA (行动号召)"
      timecode: "9:30 - 10:00"
      duration: 30s
      purpose: "引导互动和关注"
      techniques:
        - 一键三连引导
        - 下期预告
        - 评论区互动话题
```

**每个分镜 (Shot) 包含的元素**：

```yaml
shot_elements:
  timecode: str              # 时间码 (MM:SS - MM:SS)
  visual: str                # 画面描述 (屏幕录制/动画/图解/真人出镜)
  voiceover: str             # 旁白文案
  subtitles: str             # 字幕文本 (可与旁白不同，用于强调)
  transition: str            # 转场方式 (cut/fade/slide/zoom)
  bgm: str                   # 背景音乐建议 (风格/情绪/参考曲目)
  notes: str                 # 制作备注
```

### 2.2 B站元数据优化

```yaml
bilibili_metadata:
  title:
    max_length: 80
    rules:
      - 包含核心关键词 (前 20 字内)
      - 使用数字增加点击率 (如 "3 种方法"、"5 分钟学会")
      - 避免标题党，保持信息准确
      - 可使用 | 或 : 分隔信息层次
    examples:
      - "CVE-2024-XXXX 复现：从 0 到 PoC 的完整过程 | AI 安全实验室"
      - "3 分钟搞懂供应链攻击：你的 npm 包安全吗？"

  description:
    max_length: 2000
    structure:
      - "一句话摘要 (前 50 字，折叠前可见)"
      - "时间线目录"
      - "关键链接 (GitHub/参考文献)"
      - "相关标签"
      - "关注/三连引导"

  tags:
    max_count: 12
    strategy:
      - 2-3 个热门大标签 (安全, 编程, 技术)
      - 3-4 个精准中标签 (漏洞复现, 代码审计, Python)
      - 2-3 个长尾标签 (具体技术/工具名)
      - 1-2 个时效标签 (CVE编号/事件名)

  partition:
    main: "科技"
    sub_options:
      - "科技 · 软件应用"
      - "科技 · 计算机技术"
      - "知识 · 科技科普"
      - "知识 · 社科人文"

  thumbnail_brief:
    text_overlay:
      max_chars: 10
      font_style: "粗体/高对比"
      color: "与背景形成强对比"
    composition:
      - 主体元素 (人脸/代码/漏洞截图)
      - 文字叠加 (核心关键词)
      - 品牌标识 (角标/水印)
    mood: "专业 + 吸引眼球"
```

### 2.3 博客文章生成

**委托机制**：

```yaml
blog_generation:
  delegate_to: "07-HOS-IP-Writing/blog"
  input_package:
    topic: str               # 选题名称
    core_content: str        # 核心内容 (来自 D1+D2 素材)
    technical_details: str   # 技术细节 (来自 D2+D3 素材)
    target_platforms: list[str]  # 目标平台列表
    seo_keywords: list[str]  # SEO 关键词
  output:
    - platform_adapted_articles  # 各平台适配文章
    - seo_metadata               # SEO 元数据
```

### 2.4 GitHub 仓库生成

**仓库结构模板**：

```yaml
github_repo_structure:
  files:
    - path: "README.md"
      template: "github-readme"
      content: |
        # 项目名称
        一句话描述

        ## 特性
        ## 快速开始
        ## 安装
        ## 使用方法
        ## 项目结构
        ## 贡献指南
        ## 许可证

    - path: "LICENSE"
      template: "mit"

    - path: ".gitignore"
      template: "auto-detect"  # 根据语言自动选择

    - path: "src/"
      description: "源代码目录"

    - path: "docs/"
      description: "文档目录"

    - path: "assets/"
      description: "静态资源 (图片/数据)"

    - path: "tests/"
      description: "测试代码"

    - path: ".github/"
      description: "GitHub 配置 (Actions/Issue 模板)"
```

### 2.5 资产生成编排

**委托 06-HOS-Fuck-Demo**：

```yaml
asset_generation:
  delegate_to: "06-HOS-Fuck-Demo"
  input:
    direction: str           # 内容方向
    depth: str               # 深度级别
    style: str               # 风格要求
    assets_needed:
      - type: "ppt"
        spec: "演示 PPT"
      - type: "audio"
        spec: "旁白音频"
      - type: "video_clip"
        spec: "视频片段"
  output:
    - generated_assets       # 生成的资产列表
    - asset_paths            # 资产路径
```

---

## 三、工作流程

```
接收 4D 素材包 (D1+D2+D3 输出)
         │
         ▼
┌─────────────────────┐
│ 判断内容支柱类型     │
│ (漏洞复现/工具开发/  │
│  攻防实战/安全科普/  │
│  代码审计/行业观察)  │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 生成 B站视频脚本     │
│ + 元数据优化         │
│ + 封面简报           │
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
┌─────────┐ ┌──────────┐
│ 调用    │ │ 调用     │
│ 07/blog │ │ 06/Demo  │
│ 生成博客│ │ 生成资产 │
└────┬────┘ └────┬─────┘
     │           │
     └─────┬─────┘
           ▼
┌─────────────────────┐
│ (可选) 生成          │
│ GitHub 仓库          │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 一致性检查           │
│ + 质量门禁           │
└──────────┬──────────┘
           ▼
  输出到 output/document/{project-id}/
```

---

## 四、质量门禁

```yaml
quality_gates:
  script_timeline:
    description: "脚本时间线连续性"
    condition: "所有分镜时间码无缝衔接，无重叠/间隙"
    check: "timeline_continuity == true"
  voiceover_word_count:
    description: "旁白字数匹配 (3 字/秒 ±20%)"
    condition: "abs(actual_chars / expected_chars - 1) <= 0.20"
    expected_rate: 3  # 字/秒
  title_length:
    description: "标题长度 <= 80 字符"
    condition: "len(title) <= 80"
  description_length:
    description: "简介长度 <= 2000 字符"
    condition: "len(description) <= 2000"
  tag_count:
    description: "标签数量 <= 12"
    condition: "len(tags) <= 12"
  thumbnail_text:
    description: "封面文字 <= 10 字符"
    condition: "len(thumbnail_text) <= 10"
  cross_format_consistency:
    description: "跨格式内容一致性"
    condition: "核心事实/数据在视频脚本和博客中一致"
```

---

## 五、输出规范

```
output/document/{project-id}/
├── bilibili/
│   ├── video-script.md        # B站视频分镜脚本
│   ├── metadata.yaml          # B站元数据 (标题/简介/标签/分区)
│   └── thumbnail-brief.md     # 封面设计简报
├── blog/
│   ├── csdn.md                # CSDN 版本
│   ├── juejin.md              # 掘金版本
│   ├── zhihu.md               # 知乎版本
│   ├── medium.md              # Medium 版本 (如需要)
│   └── seo-metadata.yaml     # SEO 元数据
├── github/
│   ├── repo-structure/        # 仓库结构模板
│   ├── README.md              # 项目 README
│   └── publish-checklist.md   # 发布检查清单
├── demo/
│   ├── demo-spec.md           # Demo 规格说明
│   └── asset-list.yaml        # 资产清单
├── consistency-check.yaml     # 一致性检查报告
└── metadata.json              # 元数据
```

---

## 六、依赖关系

| 依赖目标 | 依赖原因 | 调用方式 |
|----------|----------|----------|
| 07-HOS-IP-Writing/blog | 博客文章生成 | 委托调用 |
| 06-HOS-Fuck-Demo | PPT/音频/视频资产生成 | 委托调用 |
| 00-HOS-Sec-Engine | 安全内容准确性校验 | API 查询 |

---

## 七、模板索引

| 模板名称 | 路径 | 用途 |
|----------|------|------|
| B站视频脚本模板 | `templates/bilibili-video-script.md` | 分镜级视频脚本 |
| B站元数据模板 | `templates/bilibili-metadata.md` | 标题/简介/标签 |
| GitHub README 模板 | `templates/github-readme.md` | 仓库首页 |
| Demo 规格模板 | `templates/demo-spec.md` | Demo 需求说明 |
| 封面简报模板 | `templates/thumbnail-brief.md` | 封面设计需求 |
| 视频制作工作流 | `workflows/video-production.md` | 调用 06 的流程 |
| 博客适配工作流 | `workflows/blog-adaptation.md` | 调用 07 的流程 |
| GitHub 发布工作流 | `workflows/github-publish.md` | 仓库发布流程 |
