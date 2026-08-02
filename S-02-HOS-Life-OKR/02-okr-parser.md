---
name: 02-okr-parser
description: "OKR解析模块 — KR优先级算法、拆解逻辑"
metadata:
  module: 02
  category: analysis
---

# 02 — OKR 解析模块 (Objective → KR 拆解)

## 核心算法

```
KR优先级 = 权重 × (1 - 完成率) × 紧急度
```

其中 `紧急度 = 剩余天数 / 总天数`（归一化到 0-1，越接近截止日越接近 1）

## 输出结构

```json
{
  "okr_tree": {
    "objective": "3个月内成为信息安全工程师",
    "krs": [
      { "id": "KR1", "priority_score": 0.87, "progress_gap": 1.5, "urgency": 0.9 },
      { "id": "KR2", "priority_score": 0.72, "progress_gap": 1.0, "urgency": 0.75 }
    ]
  }
}
```

## 操作步骤

1. 解析用户输入的 Objective（目标）
2. 提取所有 KR（关键结果）及其进度数据
3. 计算每个 KR 的优先级分数
4. 按优先级从高到低排序
5. 输出排序后的 KR 执行序列
