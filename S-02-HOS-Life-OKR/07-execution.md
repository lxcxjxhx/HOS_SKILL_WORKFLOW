---
name: 07-execution
description: "输出执行层 — 输出类型绑定、强制输出规则、文件路径规范"
metadata:
  module: 07
  category: execution
---

# 07 — 输出执行层 (Output System)

## 输出类型绑定（强制规则）

每个任务**必须绑定输出**，无输出即无效任务：

| 任务类型 | 强制输出物 | 标准路径 | 验证方式 |
|----------|-----------|---------|---------|
| `coding` | GitHub commit + README | `outputs/code/` | commit hash |
| `experiment` | 实验报告 (markdown) | `outputs/reports/exp-*.md` | 原理/过程/结果 |
| `reading` | 结构化笔记 | `knowledge/chN-*.md` | 用自己的话重述 |
| `writing` | 技术博客/NOTE | `outputs/blogs/*.md` | 发布或存档 |
| `review` | 复盘文档 | `outputs/notes/review-*.md` | 三段式 |
| `exam` | 试卷 | `exam-papers/{type}/*.md` | 按规范命名 |
| `knowledge_list` | 知识清单 | `knowledge/chN-*.md` | 结构化MD |

## 执行建议输出格式

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 今日学习计划
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 目标: 3个月内成为信息安全工程师
⚡ 能量状态: 8/10 | ⏱ 可用时间: 150分钟

─────────────────────────────────────────
🥇 任务1: 推进KR1 - 安全工具开发
  类型: coding | 时长: 90min | 优先级: 最高
  📎 输出: GitHub commit (端口扫描模块)
  📁 路径: outputs/code/port-scanner/
─────────────────────────────────────────
🥈 任务2: 撰写TCP连接实验报告
  类型: writing | 时长: 30min
  📎 输出: 实验报告 (markdown)
  📁 路径: outputs/reports/exp-port-scan-20260627.md
─────────────────────────────────────────
🥉 任务3: 今日复盘
  类型: review | 时长: 15min
  📎 输出: 复盘文档
  📁 路径: outputs/notes/review-20260627.md
─────────────────────────────────────────

💡 执行建议:
  • 从任务1开始，趁能量高处理最难的任务
  • 每完成一个任务记录输出物链接
  • 完成后反馈给我，我会更新进度并生成明日计划
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
