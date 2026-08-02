---
name: 06-task-generator
description: "任务生成器 — 5步生成算法、TaskScore优先级公式"
metadata:
  module: 06
  category: generation
---

# 06 — 任务生成器 (Task Generator)

## 核心职责

将以下输入转化为**今日任务列表**：
- KR 优先级排序
- KPI 缺口列表
- 当前能量状态
- 可用时间窗口
- 复习队列到期数据

## 任务生成规则 (5步算法)

```
Step 1: 选 KR（优先级最高）
Step 2: 匹配能量等级 → 任务类型
Step 3: 填充 KPI 缺口任务
Step 4: 插入复盘任务 + 复习块
Step 5: 限制总时长 ≤ available_minutes
```

## 优先级公式

```
TaskScore = KR权重 × 紧急度 × (1 - 完成率)
            + KPI缺口权重
            + 能量匹配加成
```

## 任务结构

```json
{
  "date": "2026-06-27",
  "energy_level": 8,
  "total_duration": 150,
  "tasks": [
    {
      "name": "推进KR1: 安全工具开发 - 编写端口扫描模块",
      "type": "coding",
      "priority": 1,
      "duration": 90,
      "kr": "KR1",
      "output": {
        "type": "GitHub commit",
        "description": "提交端口扫描模块代码 + README",
        "suggested_path": "outputs/code/port-scanner/"
      }
    },
    {
      "name": "输出任务: 撰写TCP连接实验报告",
      "type": "writing",
      "priority": 2,
      "duration": 30,
      "kr": "KR1",
      "output": {
        "type": "实验报告",
        "description": "记录扫描结果和技术要点",
        "suggested_path": "outputs/reports/exp-port-scan-20260627.md"
      }
    },
    {
      "name": "复盘: 今日学习总结",
      "type": "review",
      "priority": 3,
      "duration": 15,
      "kr": "system",
      "output": {
        "type": "复盘文档",
        "description": "今日完成/问题/明日计划",
        "suggested_path": "outputs/notes/review-20260627.md"
      }
    }
  ]
}
```
