---
name: 04-scheduler
description: "时间&能量调度引擎 — 时间切片模型、能量映射规则"
metadata:
  module: 04
  category: scheduling
---

# 04 — 时间 & 能量调度引擎 (核心调度)

## 时间切片模型

```
恢复期 → 复习块(间隔重复) → 核心学习块 → 输出块 → 复盘块
```

## 能量映射规则

| 能量水平 | 适合任务类型 | 输出类型 |
|----------|-------------|---------|
| 8-10 (高) | 编码、实验、深度工作 | GitHub commit + 实验报告 |
| 5-7 (中) | 看课、阅读、资料整理 | 结构化笔记 |
| 3-4 (低) | 整理、复盘、轻度回顾 | 复盘文档 |
| 任何 | 间隔复习(2-15min微块) | 复习记录 → 存档 |

## 输出结构

```json
{
  "time_blocks": [
    { "type": "warmup_review", "duration": 10, "allowed_tasks": ["spaced_repetition", "error_review"] },
    { "type": "core_learning", "duration": 90, "allowed_tasks": ["coding", "experiment"] },
    { "type": "output", "duration": 30, "allowed_tasks": ["writing", "commit"] },
    { "type": "cooldown_review", "duration": 10, "allowed_tasks": ["rapid_recall", "archive_update"] }
  ]
}
```

## 操作步骤

1. 接收用户能量水平 (1-10)
2. 根据能量水平选择任务类型范围
3. 按时间切片模型分配时间块
4. 确保总时长 ≤ 用户可用时间
5. 每个时间块绑定允许的任务类型
