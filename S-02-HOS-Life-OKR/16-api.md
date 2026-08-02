---
name: 16-api
description: "API设计 — 20个核心函数定义与说明"
metadata:
  module: 16
  category: reference
---

# 16 — Skill API 设计

## 核心函数

| 函数 | 输入 | 输出 | 说明 |
|------|------|------|------|
| `generate_daily_plan(context)` | 用户上下文 | TaskList | 生成今日计划（含复习块） |
| `update_progress(task_result)` | 执行结果 | UpdatedContext | 更新KR/KPI |
| `weekly_review(logs)` | 周日志 | SystemAdjustment | 周复盘调整 |
| `energy_assessment(user_state)` | 状态描述 | EnergyLevel | 能量评估 1-10 |
| `kr_priority_analysis(krs)` | KR列表 | PriorityQueue | KR优先级排序 |
| `kpi_gap_analysis(kpis)` | KPI数据 | GapList | KPI缺口分析 |
| `task_generation(kr, kpi, energy, time, review_queue)` | 多输入 | TaskList | 生成任务（含间隔重复） |
| `course_exam_planning(krs, exam_date)` | KR+日期 | PhasePlan | 四阶段备考计划 |
| `mock_exam_generation(scope, type)` | 范围+模式 | ExamPaper | 自动生成试卷 |
| `exam_grading(answers, key)` | 答案 | ExamResult | 评分+知识分析 |
| `archive_answer(question, answer, result)` | 单题数据 | ArchiveEntry | 对题错题留档 |
| `update_review_queue(entry)` | 留档条目 | ReviewQueue | 更新间隔重复 |
| `check_review_due()` | 无 | DueReviewList | 今日到期复习 |
| `save_snapshot(tag)` | 标签可选 | Snapshot | 完整状态快照 |
| `load_snapshot(id)` | 存档ID | FullState | 恢复状态 |
| `generate_knowledge_list(type, scope)` | 类型+范围 | Markdown | 自动生成知识清单 |
| `batch_process_one_click(command)` | 命令串 | MultiResult | 一键批处理 |
| `organize_files()` | 无 | DirectoryTree | 整理产出文件 |
| `asset_overview()` | 无 | Dashboard | 资产总览仪表盘 |
| `search_archive(keyword)` | 关键词 | SearchResult | 跨模块搜索 |
