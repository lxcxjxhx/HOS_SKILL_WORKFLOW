---
name: HOS-Brand-Guard
description: "HOS 品牌一致性守护器 — 检查三仓库命名规范、README 结构、生态关系展示的一致性"
license: MIT
metadata:
  author: HOS Team
  version: "1.0.0"
  tags: [brand, 品牌一致性, README, ecosystem, naming-convention]
  category: brand
  risk-level: low
---

# hos-brand-guard

## Description
HOS 品牌一致性守护器。检查三个仓库（HOS-Forge、HOS-LS、HOS_SKILL_WORKFLOW）的品牌表达是否统一，包括命名规范、描述一致性、README 结构、生态关系展示等。确保用户访问任何一个仓库时，都能理解 HOS 是一个整体生态。

## Trigger
当用户提到以下关键词时激活：
- "品牌"、"brand"、"一致性"
- "检查 README"、"统一"
- "生态图"、"ecosystem"
- "命名规范"、"logo"

## Context

### HOS 品牌核心
```
品牌名: HOS（Hyacinth Open Security）
Tagline: AI Native Open Source Security Ecosystem

三个子项目:
├── HOS-Forge        → AI Security IDE
├── HOS-LS           → AI Static Analysis Engine
└── HOS_SKILL_WORKFLOW → AI Workflow & Prompt Library
```

### 仓库路径
- HOS-Forge: `c:\1AAA-PROJECT\HOS\HOS-Forge`
- HOS-LS: `c:\1AAA-PROJECT\HOS\HOS-LS`
- HOS_SKILL_WORKFLOW: `c:\1AAA-PROJECT\WORKFLOW`

## Checks

### 1. 命名一致性
检查以下命名规则是否在所有仓库中统一：

| 检查项 | 正确 | 错误示例 |
|--------|------|---------|
| 生态名称 | HOS / Hyacinth Open Security | "我的项目"、无统一名称 |
| IDE 名称 | HOS-Forge | "HOS IDE"、"Forge"（单独使用时需上下文） |
| 分析引擎名称 | HOS-LS | "HOS LS"、"hos-ls"（大小写不一致） |
| 工作流名称 | HOS_SKILL_WORKFLOW | "workflow"、"HOS Workflow"（模糊引用） |
| 子项目引用 | 首次出现用全名，后续可简称 | 混用多种简称 |

### 2. README 结构检查
每个仓库的 README 应包含以下统一结构：

```markdown
# <Project Name>

> <一句话描述，包含 HOS 生态引用>

<!-- 生态图（所有仓库共用） -->
<p align="center">
  <img src="https://raw.githubusercontent.com/<org>/hos-brand/main/ecosystem.svg" />
</p>

<p align="center">
  <a href="https://github.com/<org>/HOS-Forge">HOS-Forge</a> •
  <a href="https://github.com/<org>/HOS-LS">HOS-LS</a> •
  <a href="https://github.com/<org>/HOS_SKILL_WORKFLOW">Workflow</a>
</p>

## Features
...

## Quick Start
...

## Ecosystem
| Project | Description |
|---------|-------------|
| [HOS-Forge](link) | AI Security IDE |
| [HOS-LS](link) | AI Static Analysis Engine |
| [HOS_SKILL_WORKFLOW](link) | AI Workflow & Prompt Library |

## Roadmap
...

## Contributing
...

## License
...
```

### 3. 描述一致性
检查各位置的描述是否对齐：

| 位置 | 应包含 |
|------|--------|
| GitHub repo description | 项目定位 + "Part of HOS ecosystem" |
| README 第一行 | 项目名 + 一句话描述 |
| README 生态区 | 三个项目的关系和链接 |
| Release notes | 引用 HOS 生态 |
| Discussion | 引用 HOS 生态 |

### 4. 生态关系表达
检查是否正确表达了三个项目的关系：

```
正确:
"HOS-LS is the analysis engine powering HOS-Forge's security insights."
"Together with HOS_SKILL_WORKFLOW, they form the HOS security ecosystem."

错误:
"HOS-LS is a standalone tool."（缺少生态关联）
"These three unrelated projects."（没有表达关系）
```

### 5. 视觉一致性
检查以下内容：
- [ ] 生态图（ecosystem.svg）是否在所有 README 中引用
- [ ] 颜色方案是否一致（如果有 badge / logo）
- [ ] 代码风格是否一致（README 中的代码示例）

## Workflow

### Step 1: 扫描所有仓库
```powershell
# 读取各仓库 README
Get-Content "<repo_path>\README.md"

# 读取各仓库 repo description
gh repo view <owner/repo> --json description

# 检查是否有 ecosystem 引用
Select-String -Path "<repo_path>\README.md" -Pattern "HOS|ecosystem|Forge|LS|WORKFLOW"
```

### Step 2: 生成检查报告
```markdown
# HOS Brand Consistency Report — <date>

## Summary
- Overall Score: <N>/100
- Issues Found: <count>
- Critical: <count>
- Warning: <count>

## Per-Repo Results

### HOS-Forge
| Check | Status | Details |
|-------|--------|---------|
| Naming | ✅/❌ | ... |
| README Structure | ✅/❌ | ... |
| Ecosystem Reference | ✅/❌ | ... |
| Description | ✅/❌ | ... |

### HOS-LS
(same structure)

### HOS_SKILL_WORKFLOW
(same structure)

## Issues to Fix

### Critical
1. <issue_description> — <which_repo> — <suggested_fix>

### Warning
1. <issue_description> — <which_repo> — <suggested_fix>

## Suggested Actions
1. <action_1>
2. <action_2>
```

### Step 3: 生成修复补丁
对于可自动修复的问题（如 README 缺少生态图），直接生成修复后的内容。

### Step 4: 生成统一生态图
如果用户需要，生成一个 SVG 生态图：

```svg
<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
  <!-- HOS 中心 -->
  <text x="300" y="50" text-anchor="middle" font-size="24" font-weight="bold">HOS</text>
  <text x="300" y="75" text-anchor="middle" font-size="12">Hyacinth Open Security</text>

  <!-- 三个子项目 -->
  <rect x="50" y="150" width="150" height="80" rx="8" fill="#2563eb" />
  <text x="125" y="185" text-anchor="middle" fill="white" font-size="14">HOS-Forge</text>
  <text x="125" y="205" text-anchor="middle" fill="white" font-size="10">AI Security IDE</text>

  <rect x="225" y="150" width="150" height="80" rx="8" fill="#7c3aed" />
  <text x="300" y="185" text-anchor="middle" fill="white" font-size="14">HOS-LS</text>
  <text x="300" y="205" text-anchor="middle" fill="white" font-size="10">Analysis Engine</text>

  <rect x="400" y="150" width="150" height="80" rx="8" fill="#059669" />
  <text x="475" y="185" text-anchor="middle" fill="white" font-size="14">Workflow</text>
  <text x="475" y="205" text-anchor="middle" fill="white" font-size="10">AI Workflow Library</text>

  <!-- 连接线 -->
  <line x1="175" y1="190" x2="225" y2="190" stroke="#666" stroke-width="2" />
  <line x1="375" y1="190" x2="400" y2="190" stroke="#666" stroke-width="2" />
  <line x1="300" y1="75" x2="300" y2="150" stroke="#666" stroke-width="2" />
</svg>
```

## Rules
1. 品牌检查默认覆盖所有三个仓库
2. 命名以本 skill 中的 "命名一致性" 表格为准
3. README 结构中的生态图必须使用统一 URL
4. 每个仓库的 README 必须引用其他两个仓库
5. 报告保存到 `c:\1AAA-PROJECT\BOS\BOS-OPER\hos-skills\output\brand\` 目录
6. 建议每季度执行一次全面品牌检查
