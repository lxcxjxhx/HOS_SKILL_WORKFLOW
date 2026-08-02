---
name: 09-answer-archive
description: "对题/错题留档系统 — 完整留档结构、掌握度趋势分析"
metadata:
  module: 09
  category: archive
---

# 09 — 对题/错题留档系统 (Right/Wrong Answer Archive)

## 核心原则

> ❗ 只记错题 = 只看到一半的真相。对题也有价值——告诉系统"哪些知识已巩固到可降低复习频率"。

## 留档条目结构

```json
{
  "answer_archive": {
    "total_entries": 347,
    "correct_count": 232,
    "wrong_count": 115,
    "overall_accuracy_trend": [68, 72, 75, 73, 78, 80, 82],
    "last_updated": "2026-06-27"
  },
  "archive_detail": [
    {
      "question_id": "Q007",
      "topic": "密码学-对称加密",
      "result": "wrong",
      "date": "2026-06-27",
      "error_reason": "混淆了对称与非对称算法分类",
      "review_count": 0,
      "mastery_level": 0.3
    },
    {
      "question_id": "Q008",
      "topic": "访问控制-MAC",
      "result": "correct",
      "date": "2026-06-27",
      "confidence": "high",
      "review_count": 0,
      "mastery_level": 0.95
    }
  ]
}
```

## 对题价值

| 对题状态 | 含义 | 系统动作 |
|---------|------|---------|
| ✅ 高信心正确 | 完全掌握 | 降低复习频率，进入长间隔 |
| ⚠️ 低信心正确 | 蒙对的 | 仍标记为待复习 |
| 🔄 连续3次正确 | 已巩固 | 移入已掌握池，月度抽查 |
| 📊 趋势下降 | 开始遗忘 | 提升复习优先级 |

## 留档触发

```
每次模拟考 → 全部题目（对+错）写入
每次章节测验 → 全部题目写入存档
每次复习完成 → 更新 mastery_level
每周复盘 → 生成知识掌握度趋势报告
```

## 知识掌握度趋势

```json
{
  "mastery_trend": {
    "topic": "密码学",
    "history": [
      { "date": "2026-06-01", "accuracy": 55, "level": "薄弱" },
      { "date": "2026-06-15", "accuracy": 70, "level": "待加强" },
      { "date": "2026-06-27", "accuracy": 82, "level": "基本掌握" }
    ],
    "trend_direction": "上升 ↗",
    "stability": "稳定提升"
  }
}
```
