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
| M4 AST 证据 / M7 CWE 指引 | 10 样本无增益且 +token | 保持默认关（PR #30 扰动记录一致） |

## 静态门控成本账（2026-08-15，零 API 成本测算）

- 静态层 100 文件命中 76/100、0 召回 24 个。
- **硬门控**（AI 只扫静态命中文件）：AI 层 token 省 **21.8%**，但丢 AI 可检盲区样本
  （21 子集中 `06fdf927` 跨函数 XSS 即 AI-CONFIRMED 而静态 0 召回；`08926a1a` 亦为零命中但
  AI 曾确认——硬门控连丢 2 个可检样本）。
- **结论**：软门控 + 早停（Agent-2 零风险 + 静态门零命中 → 跳过 Agent-3~6）是正解——
  保留盲区检出能力同时控成本。
- 复算命令：`python hosls-eval/opt_eval.py static-gate <static-results.json> <ai-results.json>`

## OPT-SASTR2：三级 cascade 流水线 + 项目内环境（2026-08-15，代码已合入）

- **架构**：semgrep/bandit(S1 快扫) → codeql(S2 确认，官方安全套件) → pure-AI(S3 盲区)。
  codeql 确认文件 → 硬 findings（0 AI token）；其余（候选验证+盲区）→ AI。
- **环境**：`hos-ls/envs/` 独立可维护环境（sast-venv semgrep1.159/bandit1.9.4；codeql2.26.3；
  codeql-packs python-queries@1.8.8；semgrep-rules 337 条）；依赖分组入 requirements.txt/-sast。
- **实测（21 子集，松散函数切片）**：codeql 确认 **0/21**（污点分析需真实代码结构→价值在仓库级）；
  bandit 候选 5/21（193c77fa/1a1914c0 与 AI 检出正相关）；AI 覆盖 21/21（盲区保留，检出不倒退）。
- **环境事实**：semgrep OCaml X509 需完整权限访问系统证书库（沙箱拦 Windows 证书库，
  与 curl SEC_E_NO_CREDENTIALS 同源）；bandit 纯 Python 沙箱可用；codeql analyze 沙箱可跑，
  database create 需完整权限（multiprocessing 命名管道）；查询包下载/网络走 7897 代理。
- **教训**：切片级评测无法体现 codeql 价值——仓库级才是 token 节省主场；
  S1 候选高 FP 是特性不是 bug（AI 验证 = SAST-Genius -91% FP 模式）；B101 类噪声按 severity 过滤。

## 根因诊断方法（复用）

Agent 级信号链诊断：直接调用 pipeline 逐 Agent 看输出（`bench-tmp/trace_agent0.py` 模式）：
Agent-2 risks → Agent-3 vulns → Agent-4 attack_chains → Agent-5 adversarial → Agent-6 final_findings。
断链点 = 根因（历史：Agent-4 空 → 4/5/6 弱输入 → 保守拒绝）。
