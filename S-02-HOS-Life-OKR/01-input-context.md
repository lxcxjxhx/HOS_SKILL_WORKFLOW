---
name: 01-input-context
description: "输入层设计 — 用户上下文Schema、状态收集协议"
metadata:
  module: 01
  category: input
---

# 01 — 输入层设计 (Input Context Schema)

## 输入结构

```json
{
  "objective": "3个月内成为信息安全工程师",
  "key_results": [
    {
      "id": "KR1",
      "desc": "完成2个安全项目",
      "target": 2,
      "current": 0.5,
      "deadline": "2026-09-27",
      "weight": 1.5
    },
    {
      "id": "KR2",
      "desc": "通过Security+认证",
      "target": 1,
      "current": 0,
      "deadline": "2026-09-27",
      "weight": 1.0
    }
  ],
  "kpis": [
    { "name": "学习时长", "daily_target": 90, "weekly_target": 540, "current_week": 270 },
    { "name": "输出任务", "daily_target": 1, "weekly_target": 5, "current_week": 2 },
    { "name": "实践任务", "remaining": 2, "priority": 0.8 }
  ],
  "energy_level": 8,
  "available_minutes": 150,
  "history_completion_rate": 0.72,
  "archive": {
    "total_questions": 347,
    "correct": 232,
    "wrong": 115,
    "accuracy_trend": [55, 62, 68, 72, 75, 73, 78, 80, 82]
  },
  "review_queue": {
    "due_today": 8,
    "overdue": 2,
    "total_in_queue": 45
  },
  "last_snapshot_id": "SNAP-20260627-001"
}
```

## 用户状态收集

当用户开始对话时，收集：
1. **当前 OKR 目标** — 长期目标
2. **KR 完成进度** — 每个关键结果完成度
3. **KPI 执行数据** — 本周各 KPI 累计值
4. **当前能量水平** — 1-10 自评
5. **可用时间** — 今日可投入分钟数
6. **历史完成率** — 过去7天平均完成率
7. **存档ID** — 如有之前存档，提供以便恢复
