---
name: HOS-LS-Optimizer
description: "HOS-LS 扫描优化流程 / Scan Optimization Loop — 提升 HOS-LS 漏洞扫描准确率（召回+精度）并节约 token 的可复现优化流程：基线 → Agent 级根因诊断 → 单变量修复 → 同协议 A/B 门控 → 台账记录 → 论文更新。触发时机：用户要求提升扫描准确率/降低误报/节约 token/优化检出率，或要求跑评测/消融/把结果写进论文。本技能是流程引擎，不是一次性改代码——每个改动必须过门控才有资格进论文。"
version: "1.0.0"
author: "HOS"
tags:
  - optimization
  - benchmark
  - vulnerability-scanning
  - token-efficiency
  - paper
  - ab-testing
category: "research"
risk-level: medium
confidence: 0.9
---

# HOS-LS-Optimizer：HOS-LS 扫描优化流程

> **Baseline → Diagnose → Hypothesize → Fix (single-variable) → A/B gate → Record → Paper**
>
> 一个可复现的优化循环：每次只改一个变量，用同一数据同一模型做受控 A/B，有实测增益才采纳，
> 所有数字落台账，只有过了门控的结果才有资格写进论文。

**不是随缘调参器。不是"试试这个 prompt"。是测量驱动的工程循环。**

---

## 一、核心理念

```
基线（同协议） → 根因诊断（Agent 级信号链） → 假设（改哪里、为什么）
→ 定向修复（单变量） → A/B 子集 → 门控（有增益且不倒退） → 台账
→ 全量终测 → 论文更新（只写验证过的数字）
```

**一句话纪律**：没有 A/B 数据的改动不进代码；没有门控通过的改动不进论文。

**与 HOS-Paper-RedTeam 的关系**：RedTeam 审别人的论文，本技能优化自己的系统；
共同铁律是「口径第一、证据挂编号、不可核验不进正式输出」。

---

## 二、六步流水线

| 步 | Agent | 动作 | 产物 |
|----|-------|------|------|
| 1 | [Baseline Runner](agents/01-baseline-runner.md) | 同协议重测锁定基线 | 基线 JSON + 台账行 |
| 2 | [Root-Cause Diagnoser](agents/02-root-cause-diagnoser.md) | Agent 级信号链根因分析 | 根因链（哪个 Agent 断链/保守） |
| 3 | [Fix Designer](agents/03-fix-designer.md) | 从模式库选单变量修复 | 改动说明 + 预期增益 |
| 4 | [A/B Benchmarker](agents/04-ab-benchmarker.md) | 同数据同模型 A/B 子集 | A/B 对比 JSON |
| 5 | [Result Gater](agents/05-result-gater.md) | 门控裁决（增益/倒退/随机性） | 采纳/排除 + 理由 |
| 6 | [Paper Updater](agents/06-paper-updater.md) | 只写门控通过的数字进论文 | 初稿更新 diff |

**最小路径**：单次小优化走 1→3→4→5；涉及论文数字必须走满 6 步。

---

## 三、执行规则（铁律）

1. **口径第一**：所有指标给分子/分母/判定定义（CONFIRMED / 识别 / 目标CWE / FPR），
   禁止只报相对提升。口径定义见 [references/metric-protocol.md](references/metric-protocol.md)。
2. **同模型同数据**：A/B 必须同一模型（默认 deepseek-v4-flash）、同一评测集、同一协议。
   换模型/换数据集 = 新基线，不能跨组对比。
3. **单变量**：一次只改一个机制。prompt 改动与代码逻辑改动分开 A/B。
4. **随机性声明**：deepseek-v4-flash 单次运行有波动（实测同文件 2→1→0）；
   关键结论多 seed / 多轮并集，标注置信区间。
5. **缓存纪律**：llm-cache / pure-ai cache 命中可复用；prompt/schema 改动会使相关键失效，
   必须清对应缓存再跑，禁止混用新旧缓存结果（历史教训：脏缓存致误判 76%→80% 假象）。
6. **门控规则**：子集有增益（≥1 个样本且非随机波动）+ 全量不倒退才采纳；
   失败实验进「排除清单」（[references/prior-fixes.md](references/prior-fixes.md)），不进论文正文。
7. **台账必填**：每次评测追加 [opt-ledger.md](../../../../HOS-LS-paper/bench-runs/hosls-eval/opt-ledger.md)
   一行（标签/n/CONFIRMED/识别/token/时间），或写 `database/optimization.json`。
8. **论文数字可追溯**：初稿每个数字必须能指向一个评测产物 JSON（pair_id 级）。

---

## 四、评测命令手册（速查）

评测统一入口 `hosls-eval/opt_eval.py`（cwd = `bench-runs/`）：

```bash
# 冒烟（1 文件，验证代码无运行错误）
python hosls-eval/opt_eval.py smoke <config> <file>

# 子集 A/B（默认 10 样本，3 并发）
python hosls-eval/opt_eval.py subset hos-ls.yaml vuln 10 3        # 基线配置
python hosls-eval/opt_eval.py subset hos-ls-opt.yaml vuln 10 3    # 优化配置

# 全量 100（终测用，4 并发，约 25-40 分钟/轮）
python hosls-eval/opt_eval.py full hos-ls-opt.yaml vuln 4

# 聚合 / 台账
python hosls-eval/opt_eval.py summary <results.json>
python hosls-eval/opt_eval.py ledger <results.json> <tag>
```

配置门（`hos-ls-opt.yaml`，可消融）：
- `deterministic_promote_enabled`：Agent-3 CONFIRMED + 高危 → 覆盖 Agent-6 保守裁决
- `ast_evidence_enabled`：M4 AST/污点证据注入 Agent-3（有扰动，需 A/B）
- `cwe_guidance_enabled`：M7 CWE 专项指引（+1K token/文件）
- `cpg_context_enabled`：深 CPG 跨文件被调函数注入（仓库级收益）

完整命令与口径见 [references/benchmark-guide.md](references/benchmark-guide.md)。

---

## 五、方法库（调研成果速查）

arXiv/CCF 调研采纳矩阵（adopt 10 / consider 12 / reject 3）见
[references/method-catalog.md](references/method-catalog.md) 与
`HOS-LS-paper/12-方法调研-CCF与arXiv.md`。核心映射：

| 调研方法 | 落点 | 对应实现 |
|---------|------|---------|
| LLMxCPG / OpenAnt | 上下文注入（阶段 2/3） | context_builder CPG 模式（`cpg_context_enabled`） |
| RECEIPT / AnyPoC | 确定性验证（阶段 4） | `_deterministic_promote` + PoC 执行（仓库级） |
| VulAgent / VulnAgent-R2 | 证据链 + 置信度校准 | 证据链 tracker + promote 规则 |
| Sifting the Noise (ISSTA'26) | FPR 口径 / FP 过滤 | metric-protocol FPR 定义 |
| DREA / Strategic Heterogeneous | token 分工 | 双层架构成本实验 + `_slim_json_for_prompt` |

---

## 六、已确认的根因与修复（prior-fixes 摘要）

| PR/改动 | 根因 | 效果 |
|---------|------|------|
| PR #26 | Agent-6 location 规则过严 | CONFIRMED 19%→38% |
| PR #27 | Agent-2 候选风险过少 | 无 finding 样本 0/6→3/6 |
| PR #28 | Agent-6 先分析后判定 | 双口径 35%/49% |
| OPT-P2 | Agent-4 攻击链空（schema 过严） | prompt 放宽 + 确定性兜底单步链 |
| OPT-P1/P3 | Agent-6 保守拒绝吞真漏洞 | 高危+Agent-3 CONFIRMED → 确定性升级 |
| OPT-P0 | 函数级切片截断信息 | 深 CPG 跨文件被调函数注入 |

完整清单见 [references/prior-fixes.md](references/prior-fixes.md)。

---

## 七、论文写入口径（结果门控后）

只写：全量双口径（CONFIRMED/识别）、目标 CWE 判定、误报（patched 端）、
token 对账表、优化历程表（新 PR 追加行）。不写：小样本（<10）结论、单次运行
数字、未过门控的实验。数字必须能对应 `hosls-eval/reports/` 下的 JSON 产物。

---

## 八、伦理与边界

1. 评测集污染禁止：评测用 RepoPairBench 100 pairs（2021-2025 CVE，post-cutoff 设计）；
   自建样本必须公开去重与时间切分方法。
2. 不编造数字：跑不出来的声称写「待补」，不进正文（与论文 §4.7 口径一致）。
3. 动态执行验证（PoC）仅在沙箱/隔离环境进行，禁止在评测机上跑真实攻击负载。
