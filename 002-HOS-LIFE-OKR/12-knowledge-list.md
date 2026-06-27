---
name: 12-knowledge-list
description: "知识清单自动生成 — 自动触发场景、3种模板引用"
metadata:
  module: 12
  category: output
---

# 12 — 知识清单自动生成系统 (Knowledge List Auto-Generation)

## 自动触发场景

| 触发时机 | 生成类型 | 文件命名 |
|---------|---------|---------|
| 📖 完成章节学习 | 章节知识清单 | `knowledge/chN-章节名.md` |
| 📝 完成模拟考 | 考后知识总结 | `exam-review/YYYY-MM-DD-总结.md` |
| 🧠 完成一轮复习 | 复习要点速记 | `review/YYYY-MM-DD-复习速记.md` |
| 🏁 完成一个阶段 | 阶段知识图谱 | `phase/阶段名-知识图谱.md` |
| ❌ 错题累计达10题 | 错题专题分析 | `error-analysis/专题名-高频错误.md` |
| 🗓️ 每周复盘 | 周知识资产报告 | `weekly/Wxx-报告.md` |

## 自动化规则

```
每次完成学习/考试/复习 → 自动判断触发时机
  ├── 匹配到章节 → 用章节模板生成知识清单
  ├── 匹配到考试 → 用考后总结模板
  └── 匹配到复习 → 用复习速记模板
每个清单自动:
  ├── 写入标准文件路径
  ├── 追加到输出归档索引
  ├── 关联到对应 KR
  └── 标记复习依赖
```

## 模板

见 `templates/knowledge-list.md` 完整章节知识清单模板
见 `templates/exam-paper.md` 完整试卷模板
见 `templates/review-notes.md` 复习速记模板
