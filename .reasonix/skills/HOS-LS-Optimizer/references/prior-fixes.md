# 既有修复与教训（prior fixes）

> 全部为同模型（deepseek-v4-flash）RepoPairBench 评测的实测记录。
> 来源：`HOS-LS-paper/10-RepoPairBench评测数据-HOS-LS.md` + 本优化循环新增。

## 历史 PR（进入 v3 基线 35%/49%）

| PR | 根因 | 改动 | 效果 |
|----|------|------|------|
| #21 | FindingVerification 兼容层缺失 | 兼容层 + JSON 序列化 + max_tokens | 评测跑通 |
| #23 | 验证状态只在 metadata | 顶层 status 字段 | 评测可统计 |
| #26 | Agent-6 location 规则过严 | location 规则放宽 | CONFIRMED 19%→38% |
| #27 | Agent-2 候选风险过少 | 候选风险放宽 | 无 finding 0/6→3/6 |
| #28 | Agent-6 先判定后分析 | 先分析后判定 + 双轨输出 | 双口径 35%/49% |

## 本优化循环新增（OPT-*）

| 改动 | 根因 | 机制 | 门控状态 |
|------|------|------|---------|
| OPT-P2 | Agent-4 攻击链空（schema 输出契约过严 + 无兜底） | prompt 放宽"至少 1 条链" + `_fallback_attack_chains` 确定性单步链 | 待 A/B |
| OPT-P1/P3 | Agent-6 保守拒绝吞真漏洞（22 个 WEAK high 全真） | `_deterministic_promote`：高危 + Agent-3 CONFIRMED → CONFIRMED；REFINED → 人工复核 | 待 A/B |
| OPT-P0 | 函数级切片截断可判定信息 | `context_builder` 深 CPG 跨文件被调函数注入（≤6K 字符） | 仓库级验证 |
| OPT-TOKEN | Agent-5/6 上游输入膨胀 | `_slim_json_for_prompt`（12K/16K 截断） | 待对账 |

## 已排除/无效尝试（不进论文正文）

| 尝试 | 结果 | 教训 |
|------|------|------|
| temperature 0.1→0.3 | 无益（00c73b6e 检出→0） | 低温度保持，别调 |
| 多轮并集（3 轮） | 波动样本有效，稳定 0 无效 | 并集是评测口径非修复 |
| NVD 接入 | 排除为根因（禁用后 7/10 相同） | 环境因素先对照 |
| 浅 CPG（同文件被调） | 微弱正向（1/4） | 需完整源码 + 跨文件 |
| 判定收紧（仅 CONFIRMED+HIGH） | 牺牲召回换精度 | 用双口径替代 |

## 根因诊断方法（复用）

Agent 级信号链诊断：直接调用 pipeline 逐 Agent 看输出（`bench-tmp/trace_agent0.py` 模式）：
Agent-2 risks → Agent-3 vulns → Agent-4 attack_chains → Agent-5 adversarial → Agent-6 final_findings。
断链点 = 根因（历史：Agent-4 空 → 4/5/6 弱输入 → 保守拒绝）。
