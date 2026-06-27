---
name: 15-review-system
description: "复盘系统 — 调整规则、复盘模板、输入输出结构"
metadata:
  module: 15
  category: feedback
---

# 15 — 复盘系统 (Feedback Loop)

## 输入

```json
{
  "kr_completion_rate": 0.6,
  "kpi_execution_rate": 0.85,
  "output_count": 2,
  "total_planned_tasks": 3,
  "completed_tasks": 2,
  "task_results": [
    { "task": "安全工具开发", "status": "完成", "output_url": "https://github.com/..." },
    { "task": "实验报告", "status": "完成", "output_url": "./reports/tcp-scan.md" },
    { "task": "复盘", "status": "未完成", "reason": "时间不足" }
  ]
}
```

## 调整规则

| 周执行率 | 系统动作 | 具体调整 |
|----------|---------|---------|
| < 60% | 🔻 降低复杂度 | 减少KR数量、降低KPI目标、简化任务 |
| 60%-85% | ➡️ 保持 | 微调任务分配 |
| > 85% | 🔺 提升难度 | 增加KR权重、提高KPI目标、扩展深度 |

## 复盘模板

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 每日复盘 (YYYY-MM-DD)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 完成:
  • 任务1 — [输出物链接]
  • 任务2 — [输出物链接]
❌ 未完成:
  • 任务3 — 原因: [分析]

📈 数据:
  • KR 完成率: 60%  |  KPI 执行率: 85%
  • 输出物数量: 2   |  复习完成: 8/8题
  • 准确率趋势: 73%→78%↗

🔍 问题分析: [主要障碍]
🔄 系统调整: [明日任务调整]
📅 明日计划预览: [核心任务+输出目标]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
