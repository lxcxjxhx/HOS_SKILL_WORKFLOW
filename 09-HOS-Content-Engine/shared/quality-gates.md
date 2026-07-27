# 4D Quality Gates — 质量门禁定义

> 每个阶段的产出必须通过对应质量门禁，才能流入下一阶段。门禁分为 ERROR（阻断）和 WARN（告警）两级。

---

## D1 Discover — 数据发现质量门禁

| # | 检查项 | 标准 | 级别 | 自动化 |
|---|--------|------|------|--------|
| D1-01 | 数据源可用性 | 至少 3/4 个数据源成功获取（GitHub Trending, arXiv, CVE, PR Tracker） | **ERROR** | 检查 sources[] 中 fetched_at 非空数量 ≥ 3 |
| D1-02 | 候选选题数量 | 筛选后 selected_topics ≥ 20 个 | **ERROR** | len(selected_topics) ≥ 20 |
| D1-03 | 趋势评分完整性 | trend_scores 四个维度均有值 | **ERROR** | github_stars_delta, arxiv_mentions, cve_count, community_heat 均非 null |
| D1-04 | 数据新鲜度 | 所有数据源 fetched_at 在 7 天内 | **WARN** | now() - fetched_at ≤ 7d |
| D1-05 | 选题评分分布 | 最高分 ≥ 80 且标准差 ≥ 10 | **WARN** | max(score) ≥ 80, stdev(score) ≥ 10 |
| D1-06 | 支柱覆盖均衡 | 单次扫描至少覆盖 3 个内容支柱 | **WARN** | count(distinct pillar_fit) ≥ 3 |
| D1-07 | 原始数据归档 | raw-data/ 目录 4 个 JSON 文件均存在且非空 | **ERROR** | 文件存在性 + size > 0 |

---

## D2 Dissect — 深度解析质量门禁

| # | 检查项 | 标准 | 级别 | 自动化 |
|---|--------|------|------|--------|
| D2-01 | 架构图完整性 | architecture.components ≥ 3 个且 data_flow 非空 | **ERROR** | len(components) ≥ 3, data_flow 非空字符串 |
| D2-02 | 设计决策数量 | design_decisions ≥ 3 条 | **ERROR** | len(design_decisions) ≥ 3 |
| D2-03 | 安全分析覆盖 | security_analysis 包含 attack_surface, cve_history, mitre_mapping, risk_level | **ERROR** | 四个字段均非空 |
| D2-04 | MITRE ATT&CK 映射 | 至少映射 1 个 ATT&CK 技术编号 | **WARN** | len(mitre_mapping) ≥ 1 |
| D2-05 | 依赖分析深度 | dependencies ≥ 3 个关键依赖 | **WARN** | len(dependencies) ≥ 3 |
| D2-06 | 安全发现质量 | findings 至少包含 1 个 HIGH 或 CRITICAL 级别发现 | **WARN** | any(f.level in [HIGH, CRITICAL]) |
| D2-07 | 对比分析 | comparison.md 存在且 ≥ 500 字 | **WARN** | 文件存在 + word_count ≥ 500 |

---

## D3 Develop — 开发贡献质量门禁

| # | 检查项 | 标准 | 级别 | 自动化 |
|---|--------|------|------|--------|
| D3-01 | 测试通过 | 所有新增/修改代码的测试通过 | **ERROR** | CI 绿灯 / 本地 pytest 全通过 |
| D3-02 | 代码风格 | 通过 lint 检查（flake8/black/eslint 视语言而定） | **ERROR** | lint exit code = 0 |
| D3-03 | PR 描述完整性 | pr_plan 包含 branch_name, approach, files_to_change | **ERROR** | 三个字段均非空 |
| D3-04 | 开发日志连续 | dev_log 条目 ≥ 3 且时间戳单调递增 | **WARN** | len(dev_log) ≥ 3, 时间戳有序 |
| D3-05 | Review 响应 | 所有 reviewer comment 均有 response | **ERROR** | all(resolved = true) 或 all(response 非空) |
| D3-06 | 变更范围合理 | files_to_change ≤ 10 个文件 | **WARN** | len(files_to_change) ≤ 10 |
| D3-07 | 复杂度评估 | estimated_complexity 已填写 | **WARN** | 字段非空 |
| D3-08 | 合并回溯 | merge-retrospective.yaml 已填写（合并后） | **WARN** | 文件存在且关键字段非空 |

---

## D4 Document — 内容产出质量门禁

| # | 检查项 | 标准 | 级别 | 自动化 |
|---|--------|------|------|--------|
| D4-01 | 脚本时间线连续 | bilibili-script 包含完整时间线标记（00:00 格式） | **ERROR** | 正则匹配 ≥ 5 个时间戳且单调递增 |
| D4-02 | 标题规格 | bilibili title ≤ 80 字符，含核心关键词 | **ERROR** | len(title) ≤ 80 |
| D4-03 | 标签规格 | tags 数量 ≤ 12，≥ 5 | **ERROR** | 5 ≤ len(tags) ≤ 12 |
| D4-04 | 描述规格 | description ≤ 2000 字符，包含时间戳章节 | **ERROR** | len(description) ≤ 2000 |
| D4-05 | 博客一致性 | 三个平台博客文件均存在 | **ERROR** | csdn.md, juejin.md, zhihu.md 均存在 |
| D4-06 | 封面设计说明 | thumbnail-brief.md 存在且文字说明 ≤ 10 字 | **WARN** | 文件存在，主标题字符数 ≤ 10 |
| D4-07 | 资产完整性 | assets/ 下 ppt.json, audio-script.md, video-spec.md 均存在 | **ERROR** | 三个文件均存在 |
| D4-08 | GitHub 仓库 | repo/ 下 README.md, LICENSE, .gitignore 均存在 | **WARN** | 三个文件均存在 |
| D4-09 | 分区正确性 | partition 为 "科技 > 软件应用" 或 "科技 > 计算机技术" | **WARN** | partition in 允许列表 |

---

## Pipeline Level — 流水线级质量门禁

| # | 检查项 | 标准 | 级别 | 自动化 |
|---|--------|------|------|--------|
| PL-01 | 4D 数据一致性 | 同一 id 在四个阶段的 YAML 中字段值一致 | **ERROR** | 跨阶段 YAML diff 无冲突 |
| PL-02 | 跨技能产出完整 | 每个项目至少产出: 1个视频脚本 + 3篇博客 + 1个GitHub仓库 | **ERROR** | 文件计数检查 |
| PL-03 | 状态流转正确 | status 变化符合 draft → in-progress → review → ready → published | **WARN** | 状态机校验 |
| PL-04 | 时间线合理 | created_at 到 published 间隔 ≥ 1天且 ≤ 30天 | **WARN** | 时间差检查 |
| PL-05 | 归档完整性 | output/ 目录结构与 output-spec.md 一致 | **WARN** | 目录树对比 |

---

## 门禁执行机制

```
阶段完成 → 运行该阶段所有 ERROR 级检查
           ├─ 全部通过 → 进入下一阶段
           ├─ 任一失败 → 阻断，输出失败报告
           └─ WARN 级 → 记录告警，不阻断

执行方式:
  1. 自动化检查: 通过 Python 脚本校验 YAML schema 和文件存在性
  2. 半自动检查: AI Agent 评估内容质量（脚本可读性、分析深度等）
  3. 人工审核: 最终发布前人工确认（可选）
```
