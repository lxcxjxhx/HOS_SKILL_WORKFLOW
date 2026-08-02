---
name: 11-save-load
description: "存档与快照系统 — SAVE/LOAD、版本化快照、输出归档索引"
metadata:
  module: 11
  category: persistence
---

# 11 — 存档与快照系统 (SAVE/LOAD & Versioned Snapshots)

## 存档触发时机

| 触发时机 | 存档类型 | 说明 |
|---------|---------|------|
| 🆕 每次对话结束 | 自动存档 | 系统状态完整写入 |
| 📅 每日第一次启动 | 自动读档 | 从最近存档恢复 |
| 🏁 每周复盘 | 周快照 | 里程碑快照 |
| 📝 每次模拟考完成 | 增量存档 | 更新留档+进度 |
| 👤 用户"SAVE" | 命名存档 | 用户自定义存档点 |
| 👤 用户"LOAD" | 指定读档 | 恢复到指定点 |

## 存档结构 (摘要)

```json
{
  "snapshot_version": "2.0.0",
  "snapshot_id": "SNAP-20260627-001",
  "snapshot_tag": "阶段测评后-第6章完成",
  "created_at": "2026-06-27T18:30:00Z",
  "okr_state": { /* KR进度 */ },
  "course_plan_state": { /* 阶段进度 */ },
  "kpi_data": { /* 周日志+趋势 */ },
  "archive_summary": { /* 总题数+准确率 */ },
  "review_queue_summary": { /* 复习队列 */ },
  "output_archive_index": [ /* 产出索引 */ ]
}
```

## SAVE/LOAD 交互

```
用户: "SAVE"
系统: 生成快照 SNAP-20260627-001 → 输出可复制编码

用户: "LOAD"
系统: 提示粘贴存档 → 解码 → 恢复完整状态 → 生成今日计划

📦 存档编码格式:
ID: SNAP-20260627-001
Tag: 阶段测评后-第6章完成
{base64_encoded_json_data}
```

## 输出归档索引

| 索引字段 | 说明 | 示例 |
|---------|------|------|
| 📅 日期 | 产出日期 | 2026-06-27 |
| 🏷️ 类型 | code/report/note/blog/review | code |
| 📌 标题 | 产出物名称 | 端口扫描模块 |
| 🔗 链接 | GitHub/本地路径 | https://github.com/... |
| 🎯 关联KR | 所属关键结果 | KR1 |
| 📊 状态 | active/archived/reviewed | active |
