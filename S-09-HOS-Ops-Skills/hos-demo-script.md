---
name: HOS-Demo-Script
description: "HOS Demo 视频脚本生成器 — 3 分钟演示脚本 + GIF 截取建议 + 多平台适配"
license: MIT
metadata:
  author: HOS Team
  version: "1.0.0"
  tags: [demo, 视频脚本, screen-recording, GIF, Bilibili, YouTube]
  category: content-production
  risk-level: low
---

# hos-demo-script

## Description
HOS Demo 视频脚本生成器。为每个版本/功能生成 3 分钟演示视频脚本，包含屏幕录制指导、旁白文本、GIF 截取建议。输出可直接用于 Bilibili、YouTube 录制，也可截取关键帧作为 README GIF。

## Trigger
当用户提到以下关键词时激活：
- "demo"、"演示"、"录屏"
- "视频脚本"、"demo video"
- "GIF"、"README 动图"
- "录一个"、"演示一下"

## Context

### HOS 项目 Demo 特点
- **HOS-Forge**: IDE 操作为主，展示分析流程、安全检测、Agent 交互
- **HOS-LS**: 命令行工具为主，展示分析输入→检测→输出报告
- **HOS_SKILL_WORKFLOW**: 工作流编排，展示多步骤自动化

### 核心原则
1. **3 分钟原则**: 每个视频不超过 3 分钟
2. **可复现**: 观众看完能自己跑起来
3. **数据说话**: 展示具体数字（Token 数、检测时间、准确率）
4. **GIF 优先**: README 里放 GIF 比放视频链接有效 10 倍

## Workflow

### Step 1: 确定 Demo 类型

| 类型 | 时长 | 适用场景 |
|------|------|---------|
| **Quick Demo** | 60s | 单个功能展示，README GIF |
| **Feature Demo** | 3min | 版本发布，新功能介绍 |
| **Tutorial** | 5-10min | 完整使用教程（较少用） |
| **Comparison** | 2min | Before/After 对比 |

### Step 2: 生成脚本

#### Quick Demo（60 秒）
```markdown
# Quick Demo: <feature_name>

## Setup (0:00-0:10)
[屏幕] 终端 / IDE 界面
[旁白] "Let me show you <feature> in HOS-LS."
[操作] 打开终端，cd 到项目目录

## Action (0:10-0:40)
[屏幕] 命令行 / IDE 操作
[旁白] "We run <command> on this Java file."
[操作] 执行分析命令
[屏幕] 输出结果高亮
[旁白] "Notice the output: 9,000 tokens instead of 28,000."

## Result (0:40-0:60)
[屏幕] 结果对比 / 数据
[旁白] "68% reduction, same detection accuracy."
[屏幕] GitHub 链接
[旁白] "Link in description. Star if useful."
```

#### Feature Demo（3 分钟）
```markdown
# Feature Demo: HOS-LS v0.4.0

## Hook (0:00-0:15)
[屏幕] 黑底白字: "28,000 tokens → 9,000 tokens"
[旁白] "What if I told you we cut AI analysis costs by 68%?"
[屏幕] 切换到终端

## Problem (0:15-0:45)
[屏幕] 展示一个大型 Java 文件
[旁白] "This is a typical Java file. 800 lines. When we feed it to an LLM for security analysis, it costs 28,000 tokens. That's expensive and slow."
[屏幕] 展示 token 计数
[旁白] "And most of those tokens are boilerplate — imports, annotations, getters."

## Solution (0:45-1:30)
[屏幕] git clone / git pull
[旁白] "In v0.4.0, we added AST pre-filtering."
[操作] 运行分析命令
[屏幕] 实时显示分析过程
[旁白] "Instead of the whole file, we extract only security-relevant nodes: method declarations, input handling, crypto operations, database queries."
[屏幕] 高亮提取的节点
[旁白] "This reduces the input from 28,000 to 9,000 tokens."

## Demo (1:30-2:15)
[屏幕] 完整分析流程
[操作] 分析一个包含真实漏洞的文件
[旁白] "Let's test it on a file with SQL injection."
[屏幕] 检测结果
[旁白] "It catches the vulnerability. Same detection rate, but 68% cheaper."
[操作] 再测一个正常文件
[旁白] "And on clean code — no false positives."

## What's New (2:15-2:40)
[屏幕] Release notes 列表
[旁白] "This release also includes 12 new OWASP Top 10 rules and Windows compatibility fixes."

## CTA (2:40-3:00)
[屏幕] GitHub 页面
[旁白] "HOS-LS is open source. Link in description. If you're working on AI security, consider starring the repo or contributing a rule."
[屏幕] HOS 生态图
[旁白] "And check out HOS-Forge — our AI security IDE."
```

### Step 3: 生成 GIF 截取建议

```markdown
## GIF 截取建议

### GIF 1: AST Pre-filtering Demo
- 时间段: 0:50-1:10
- 尺寸: 800x450
- 帧率: 10fps
- 时长: 8-10s
- 用途: README 顶部
- 文件名: ast-prefilter-demo.gif

### GIF 2: Detection Result
- 时间段: 1:45-1:55
- 尺寸: 800x450
- 帧率: 10fps
- 时长: 5-8s
- 用途: Release notes
- 文件名: sql-injection-detection.gif
```

### Step 4: 生成录制清单

```markdown
## 录制前准备

### 环境
- [ ] 终端字体大小调到 16px+
- [ ] 终端主题用高对比度（深色背景）
- [ ] 关闭无关通知和标签页
- [ ] 准备测试数据（有漏洞的文件 + 正常文件）

### 数据
- [ ] 准备一个 "有说服力" 的目标文件（够大、够真实）
- [ ] 提前跑一遍确保命令能正常执行
- [ ] 准备 token 计数的对比数据

### 录制
- [ ] 使用 asciinema（终端）或 OBS（IDE）
- [ ] 分辨率 1920x1080
- [ ] 录制前先完整演练一遍
```

## Rules
1. 脚本语言默认中文（B站），用户要求英文时切换（YouTube）
2. 每个脚本必须包含明确的屏幕操作指导（[屏幕] + [操作] + [旁白]）
3. Demo 必须从 `git clone` 或 `git pull` 开始（可复现）
4. 必须展示具体数据（Token 数、时间、准确率）
5. 每个脚本必须附带 GIF 截取建议
6. 结尾必须包含 GitHub 链接和 CTA
7. 输出保存到 `c:\1AAA-PROJECT\BOS\BOS-OPER\hos-skills\output\demos\` 目录
