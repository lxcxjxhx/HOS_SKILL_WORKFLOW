---
name: 13-file-mgmt
description: "文件目录管理规范 — 标准目录结构、命名规范、自动整理规则"
metadata:
  module: 13
  category: management
---

# 13 — 文件目录管理规范 (File Organization & Document Management)

## 标准目录结构

```
📁 HOS-LIFE-OKR/
├── 📂 knowledge/              # 知识清单（自动生成）
│   ├── ch1-security-basics.md
│   ├── ch7-cryptography.md
│   └── index.md               # 总索引（自动维护）
├── 📂 exam-papers/            # 试卷库（自动生成）
│   ├── 📂 quiz/              # 章节测验
│   ├── 📂 phase/             # 阶段测评
│   ├── 📂 mock/              # 全真模拟
│   └── 📂 special/           # 专项突破
├── 📂 exam-review/            # 考后总结
├── 📂 review/                 # 复习记录
│   ├── 📂 review-notes/
│   └── review-queue.md
├── 📂 error-analysis/         # 错题专题分析
├── 📂 weekly/                 # 周报
├── 📂 outputs/                # 学习产出物
│   ├── 📂 code/
│   ├── 📂 reports/
│   ├── 📂 notes/
│   └── 📂 blogs/
├── 📂 snapshots/              # 存档快照
└── 📂 reference/              # 参考资料
```

## 文件命名规范

| 文件类型 | 命名规则 | 示例 |
|---------|---------|------|
| 知识清单 | `ch{N}-{英文短名}.md` | `ch7-cryptography.md` |
| 试卷 | `{类型}-{范围}-{日期}.md` | `quiz-ch7-20260627.md` |
| 考后总结 | `{日期}-{类型}-总结.md` | `20260627-phase1-review.md` |
| 复习速记 | `{日期}-review-notes.md` | `20260627-review-notes.md` |
| 错题分析 | `{专题名}-error-analysis.md` | `cryptography-error-analysis.md` |
| 周报 | `W{周数}-{年份}.md` | `W26-2026.md` |
| 快照 | `SNAP-{日期}-{序号}.json` | `SNAP-20260627-001.json` |
| 实验报告 | `exp-{项目名}-{日期}.md` | `exp-port-scan-20260627.md` |

## 自动管理规则

```
每条学习产出物 → 自动:
  1. 按类型选择目标目录
  2. 按命名规范生成文件名
  3. 写入标准路径
  4. 更新对应目录的 index.md
  5. 记录到输出归档索引
  6. 知识清单同时写入 knowledge/index.md
```
