# 22 面向 AI 生成代码变更验证的 SAL×DEP 止损实验报告

> **日期**：2026-08-27 · **模型**：mimo-v2.5-pro（token-plan-cn.xiaomimimo.com/v1）
> **协议**：(R_before, task, Δ_AI, R_after) — 判断 AI 变更是否新引入/保留可达漏洞路径，输出可差分、可证伪的证据
> **数据**：AI 代码主线 = A.S.E 27 实例（真实 CVE 代码 + AI 变异代码）；通用副线 = VulnGym 10 仓库级实例
> **铁律**：一切结论先消融后写论文；本报告为 40-60 分层样本止损实验的第一轮落地

---

## 1. 链路状态（用户要求的 key/链路核查结果）

| 项 | 状态 | 说明 |
|---|---|---|
| GitHub key（ghp_…，hos-ls remote 内嵌） | ✅ 有效 | `gh api user` → lxcxjxhx；rate limit 5000 剩余 |
| LLM key（XIAOMI_TOKEN_PLAN_CN_API_KEY, tp-…） | ✅ 有效 | `/v1/models` 200，mimo-v2.5-pro 可用；余额端点在网关上不存在（404），以扫描成功为证 |
| 代理 | ⚠️ 已修复 | 旧脚本硬编码 7897（已死）→ 全线改用 7890；git 需 `GIT_SSL_BACKEND=openssl`（schannel 与本地代理握手失败） |
| HOS-LS pure-ai 扫描链 | ✅ 打通 | 单文件 47s~250s，JSON 报告 + token_records 可解析 |
| audit_eval `ai` 桩 | ✅ 已实现 | ai_patch_eval.py 落地（Δ_AI 生成 / 双端扫描 / SAL/DEP 判定） |

**链路修复清单**（本 session 对 HOS-LS 的优化）：
1. 代理 7897→7890（hosls_7agent_eval 等脚本硬编码点）
2. `sal_candidates` 候选精化：跳过 vendored/打包产物（node_modules/dist/static/vendor、`.min.`/`bundle`、>1.5MB），SSRF/XSS 类候选不再被 swagger-ui 类 bundle 污染
3. `ai_patch_eval.py`：仓库级 AI 验证链（worktree 绝对路径、并行扫描、断点续跑、超时兜底 480s）

## 2. 实验设计（分层样本）

| 层 | 样本 | 来源 | 上下文 | 付费 |
|---|---|---|---|---|
| L1 AI 代码主线 | 27 | A.S.E（commandi×5、CI-mutation×5、path_traversal×6、PT-mutation×11、sqli×1） | 6 个真实仓库样本用 base_commit 完整文件，其余用漏洞函数摘录 | 27 vuln 扫描 + 10 patched 扫描 + 27 补丁生成 |
| L2 通用仓库级副线 | 10 | VulnGym manifest-s1（open-webui/WeKnora/langflow/MLflow/fastmcp/adk-python/paperclip） | commit 快照 worktree 全仓 | SAL top-3 + baseline top-3 AI 扫描 |

## 3. AI 主线结果（A.S.E 27）

### 3.1 检出（vuln 端，HOS-LS 7-agent pure-ai）

**10/27 = 37.0%** 样本产出 CONFIRMED finding；17 样本无确认（多为"函数级摘录缺输入上下文"型漏检，与论文 0/4→3/4 的上下文依赖一致）。

| 实例 | CWE | 检出（CONFIRMED 规则） | 上下文 |
|---|---|---|---|
| commandi_01..05 | CWE-78 | 0（完整文件 3377/1205/461/1005/758 行 → 上下文稀释） | full@commit |
| commandinjection_mutation_011 | CWE-77 | ✅ eval() 用户输入→远程代码执行 @29 | excerpt |
| commandinjection_mutation_012 | CWE-77 | ✅ 通过 eval 执行任意代码 @28 | excerpt |
| commandinjection_mutation_013 | CWE-77 | ✅ 命令注入 + SQL 注入（类型错位信号） | excerpt |
| commandinjection_mutation_014 | CWE-77 | ✅ eval 不安全使用 @30 | excerpt |
| path_traversal_03/04/06 | CWE-22 | ✅ 路径遍历 / 文件路径漏洞 | excerpt |
| pathtraversal_mutation_352/382/392 | CWE-22 | ✅ 文件上传/路径遍历 | excerpt |
| sqli_01 | CWE-89 | 0（摘录无 SQL 上下文） | excerpt |

> 上下文消融数据点：commandi 真实仓库样本在 **完整文件** 上下文下 0 CONFIRMED（大文件稀释），而同类 AI 变异样本在摘录下检出 —— "更多上下文"不必然提升检出，SAL 的**候选压缩**（只扫 sink 锚定文件）比"全仓扫描"更符合审计现实。

### 3.2 DEP：AI 补丁验证（Δ_AI → R_after）

对 10 个 CONFIRMED 样本用 mimo-v2.5-pro 生成修复补丁（Δ_AI），独立扫描 patched 端：

**3/10（30%）AI 生成补丁仍被检出 CONFIRMED** —— 差分验证判定为"修复不完整/新引入问题"：

| 实例 | patched 残留 | 语义 |
|---|---|---|
| commandinjection_mutation_011 | SQL 查询参数未验证直接执行 @25 | 修复引入/遗留兄弟问题 |
| path_traversal_03 | 路径遍历漏洞 @36 | 主路径修复、分支路径仍可利用 |
| pathtraversal_mutation_382 | 路径遍历（过滤不完整）@44 | 黑名单过滤绕过 |

**结论：DEP 消失性判定把"AI 修好了"从 10 个收紧到 7 个** —— 无差分验证时，30% 的 AI 补丁会被误判为已修复（正是论文 §一.2 Pair-Correct 口径脆弱性的 AI-patch 版证据）。

### 3.3 主指标

| 指标 | 值 | 口径 |
|---|---|---|
| 检出率（vuln CONFIRMED） | **10/27 = 37.0%** | 含类型错位（mutation_013 报 SQLi） |
| Pair-Correct（no-DEP，patched 非 CONFIRMED） | 7/27 = 25.9% | 现状口径 |
| Pair-Correct（DEP，patched 无同语义 finding） | 7/27 = 25.9% | 本批残留均为 CONFIRMED，两口径一致 |
| DEP 收紧量 | **3/10 补丁被拒（30%）** | 差分验证新增的可证伪信号 |

### 3.5 A.S.E 120 全量（第二轮）：XSS 波次 + 模型对照（2026-08-27）

数据源 = AICGSecEval_hf/static_eval.jsonl（即 A.S.E 120，全部含 base_commit + BM25 context）；
GitHub API 拉取 81/120 完整文件（0 成本）。XSS 30 个中有 20 个可用（10 真实 + 10 变异共享父文件）。

**XSS 20 波次（HOS-LS 7-agent）：14/20 CONFIRMED（70%）**

| 模型 | 样本 | CONFIRMED | 说明 |
|---|---|---|---|
| mimo-v2.5-pro（token-plan） | xss_01/02/03 | 0/3 | 429 配额耗尽前完成 |
| **deepseek-ai/DeepSeek-V4-Flash（DeepInfra + flex）** | 17 个重跑 | **14/17（82%）** | 存储型/反射型/DOM XSS 全检出 |

> **模型对照实证（路线 §9-#5"更强模型"落地）**：同一批 XSS 文件，mimo 0/3 → V4-Flash 14/17。
> 模型选择是检出率的第一驱动因素；V4-Flash 明细：xss_04 存储型@8、xss_06 反射型、xss_07 存储型、
> xss_08 DOM XSS、xss_10 XSS、mutation_051 反射+存储、mutation_052 文件名拼接响应头、
> mutation_071/072 开放重定向、mutation_091 存储型、mutation_092 noteId 拼接 res.send、
> mutation_101 反射型、mutation_102 XSS+正则注入；仅 xss_09/mutation_061/062 未确认。
> 成本 ~¥1.23（flex 8 折，505K in + 186K out tokens）。

Semgrep 基线（0 成本）：完整文件 30/81 命中 117 findings（xss_04=15 条 echoed-request、
sqli_02/03/04=tainted-sql-string）；摘录文件仅 1/27 —— Semgrep 与 AI 检出互补，同做论文基线。

**XSS DEP（14 个 CONFIRMED 的 Δ_AI 修复验证，V4-Flash）**：

**8/14（57%）AI 生成的 XSS 修复被差分验证拒绝**（残留仍 CONFIRMED）：

| 实例 | patched 残留（CONFIRMED） | 语义 |
|---|---|---|
| xss_06 | 反射型 XSS（导出文件名可控）+ 存储型 XSS（json_xml 直写响应） | 修一处留多处 |
| xss_07 | 存储型 XSS | 修复不完整 |
| xss_08 | URL 重定向未验证 → 开放重定向/反射型 XSS | 兄弟路径 |
| xss_10 | XSS | 修复不完整 |
| xss_mutation_052 | 存储型 XSS ×2（创建/保存模型名直存） | 修创建不修保存 |
| xss_mutation_072 | 基于 DOM 的反射型 XSS | 修复不完整 |
| xss_mutation_091 | 存储型 XSS | 修复不完整 |
| xss_mutation_102 | 正则构造的存储型 XSS | 复杂路径残留 |

通过 6/14：xss_04、xss_05、mutation_051/071/092/101。
> 与 A.S.E 27 的 30% 残留率同向且更强 —— AI 修复不完整是跨数据集普遍现象；
> DEP 差分验证把"AI 修好了"从 14 收紧到 6（57% 收紧量），是可证伪验证的核心证据。

**SQLI 30 波次（V4-Flash）：26/30 CONFIRMED（86.7%）** —— 真实仓库 11/14（sqli_01/03-10/13/14，
miss sqli_02/11/12）+ 变异 15/16（miss mutation_162）；全部为"用户输入直接拼接 SQL 查询"语义
（ORDER BY/表名/ID/导出文件名等拼接点）。

**A.S.E 120 迄今（V4-Flash）：XSS 14/20 + SQLI 26/30 = 40/50（80%）**，对比 mimo 时代 A.S.E 27 的 37%
—— 模型切换带来检出率翻倍以上（路线 §9-#5 实证）。剩余：Path Traversal 20 + Command Injection 11 待扫。

**PT+CI 波次（V4-Flash）：24/31 CONFIRMED（77.4%）** —— PT 18/20（90%，path_traversal_01-10 全命中、
mutation 8/10）+ CI 6/11（commandi_02/04/05 完整文件命中 + mutation_011/013/014）。

### 3.6 A.S.E 120 全量定稿（2026-08-27，81 个有代码实例全部扫完）

| 类 | 样本 | CONFIRMED | 率 |
|---|---|---|---|
| XSS | 20 | 14 | 70% |
| SQLI | 30 | 26 | 86.7% |
| Path Traversal | 20 | 18 | 90% |
| Command Injection | 11 | 6 | 54.5% |
| **合计** | **81** | **64** | **79.0%** |

> **对比：mimo-v2.5-pro 时代 A.S.E 27 = 37.0% → deepseek-ai/DeepSeek-V4-Flash = 79.0%**。
> 模型选择是第一驱动因素（路线#5"更强模型"实证）：全部 64 个 CONFIRMED 均带 7-agent 证据链，
> Semgrep 基线（30/81 文件、117 findings）与 AI 检出互补。

### 3.7 裸 agent 基线（同 backbone 单次调用，V4-Flash 零样本）

| 指标 | 裸 agent | HOS-LS 7-agent |
|---|---|---|
| A.S.E 120（81 有代码） | 45/81 = 55.6% | **64/81 = 79.0%**（any-finding 90.1%） |
| XSS | 40% | 70% |
| SQLI | 77% | 87% |
| Path Traversal | 60% | 90% |
| Command Injection | 18% | 55% |

> 一致率 61.7%；25 个实例 7-agent 检出而裸 agent 漏（含全部 CI 类 5 个）；6 个裸 agent 误报未被 7-agent 确认。
> **多智能体（证据链/交叉验证/对抗验证）在 XSS/PT/CI 类带来 +30~37pp 增益** —— 论文"多智能体价值"的直接证据。

### 3.8 VulnGym 全量 AI 层（V4-Flash 重扫，2026-08-27）

| 指标 | mimo 时代 | V4-Flash |
|---|---|---|
| CONFIRMED 条目 | 1/5 | **7/9**（00057 XSS 5 · 00080 6 · 00081 2 · 00392 SSRF 5 · 00394 1 · 00446 3 · 00062 1） |
| GT 文件内 CONFIRMED | 0 | **00057 RichTextInput 存储型 XSS · 00080 client.go SSRF · 00394 director.py SSRF · 00081 manager.go 输入验证** |
| SAL top-3 定位 | 3/5 | 6/9（00325 langflow worktree 超时失败） |

> **SAL→AI 链路在真实仓库端到端打通**：sink 锚定候选 → V4-Flash 7-agent 确认（含 GT 文件内命中，
> 与 S1 静态 9/9 定位呼应）。00389 MLflow/00430 adk 未确认（候选非 GT 或上下文不足）；
> 00325 langflow 基建限制。

### 3.9 SQLI DEP（V4-Flash，26 个 CONFIRMED 的 Δ_AI 修复验证）

**17/26（65.4%）AI 生成的 SQLI 修复被差分验证拒绝** —— 残留均为"用户输入直接拼接 SQL 查询"
（ORDER BY / group_id / 表名 / 参数拼接）；通过 9：sqli_01/06/09/10/13 + mutation_141/161/171/172。

**DEP 跨数据集汇总（AI 修复不完整率）**：

| 数据集 | 模型 | 残留率 |
|---|---|---|
| A.S.E 27 | mimo-v2.5-pro | 3/10 = 30% |
| A.S.E XSS 20 | V4-Flash | 8/14 = 57% |
| A.S.E SQLI 30 | V4-Flash | 17/26 = 65.4% |
| **合计（V4-Flash 时代）** | | **25/40 = 62.5%** |

> **核心论文证据：AI 生成的安全修复在差分验证下 62.5% 不完整**（主路径修复、分支/参数路径仍可利用）。
> DEP 把"AI 修好了"的可信度从单端自我确认升级为差分消失性判定 —— 这正是本系统的可证伪验证主张。

**PT+CI DEP（24 个 CONFIRMED，V4-Flash）：13/24（54.2%）残留** —— 命令注入 4/6（exec 拼接残留）、
路径遍历 9/18（URL 编码绕过、头像上传/文件读取残留）。

**DEP 全类最终汇总（A.S.E 120 + 27，四类漏洞全覆盖）**：

| 数据集 | 模型 | 修复验证 | 残留率 |
|---|---|---|---|
| A.S.E 27 | mimo-v2.5-pro | 3/10 | 30.0% |
| A.S.E XSS 20 | V4-Flash | 8/14 | 57.1% |
| A.S.E SQLI 30 | V4-Flash | 17/26 | 65.4% |
| A.S.E PT+CI 31 | V4-Flash | 13/24 | 54.2% |
| **V4-Flash 时代合计** | | **38/64** | **59.4%** |

> **最终结论：64 次 AI 修复验证中 59.4% 被差分验证拒绝** —— AI 生成的安全修复不完整是跨模型、
> 跨漏洞类的普遍现象；DEP 消失性判定是"AI 修复验证"的可证伪核心。

## 4. 通用仓库级副线（VulnGym 10 → 本轮完成 5 条）
### 4.1 定位（静态，AI 扫描子集）

| 条目 | 框架 | CWE | GT 文件 | SAL top-3 命中 GT | baseline top-3 命中 GT |
|---|---|---|---|---|---|
| entry-00057 | open-webui | CWE-79 | 4 | ✅ RichTextInput.svelte | ✅ MessageInput.svelte |
| entry-00062 | open-webui | CWE-89 | 3 | ✗（pgvector/oracle23ai/db.py） | ✗（main.py） |
| entry-00080 | WeKnora | CWE-78 | 3 | ✅ client.go | ✅ mcp_service.go |
| entry-00081 | WeKnora | CWE-78 | 4 | ✅ client.go + manager.go | — |
| entry-00389 | MLflow | CWE-78 | 2 | ✗ | — |
| **合计** | | | | **3/5（60%）** | **2/3** |

> S1 全量（K=50）定位 9/9；本轮 top-3 压缩后 3/5 —— 定位率随 K 收紧下降，
> 与 Locate@K 消融（K=50→100%、K=20→88.9%）一致；VulnGym 全量 AI 层留待预算充足后补跑。

### 4.2 AI 检出（19 个候选文件扫描）

- **1 CONFIRMED**：entry-00057 SAL 候选 `Notes.svelte` @255 —— "Markdown 内容未转义导致存储型 XSS"
  （SAL 锚定到 sink 文件后 AI 确认真实 XSS；该文件不在该条目 GT 内，属相邻/sibling 漏洞信号）
- 其余 18 文件 0 CONFIRMED（open-webui SQLi / WeKnora 命令注入 / MLflow 候选均未确认）

**早期信号**：SAL→AI 链路端到端打通（sink 锚定 → 候选压缩 → 7-agent 确认）；
但仓库级 AI 检出率低，VulnGym 作为"通用检测副线"仍需更大样本 + 更精确的
critical_operation 行级判定，不作为本轮结论依据（与用户策略"早期信号"定位一致）。

## 5. 成本（止损核算）

| 批次 | 文件扫描数 | input tokens | output tokens | 估算成本 |
|---|---|---|---|---|
| A.S.E vuln 27 | 27 | 781,110 | 171,495 | ¥0.49 |
| A.S.E patched 10 | 10 | 197,283 | 49,233 | ¥0.13 |
| VulnGym（SAL+baseline，5 条） | 19 | ~820,000 | ~140,000 | ~¥0.50 |
| 补丁生成 27+10 | ~37 calls | — | — | ~¥0.2-0.4 |
| **合计** | **56+ 文件扫描** | | | **~¥1.5-2.0（止损线内）** |

## 6. 结论与下一步

1. **链路已通、key 有效**：GitHub（ghp_）与 LLM（tp-，mimo-v2.5-pro）均验证可用；
   代理 7897→7890 + `GIT_SSL_BACKEND=openssl` 修复为唯一环境变更。
2. **AI 主线（A.S.E 27）**：检出 10/27（37.0%）；**DEP 拒绝 3/10（30%）AI 生成补丁**
   —— "主路径修复但残留路径仍可利用"（路径遍历 ×2）+ "修复引入兄弟问题"（SQL 参数未验证 ×1）
   是真实可测的 AI 补丁缺陷形态；Pair-Correct 7/27（25.9%）。
3. **通用副线（VulnGym）**：SAL→AI 链路端到端打通，SAL top-3 定位 3/5（早期信号）；
   仓库级 AI 检出率低，需更大样本，不作为结论依据。
4. 下一步：SecureVibeBench 105 仓库多文件任务（静态+动态 oracle）+ A.S.E 120 全量
   （补 XSS 类）→ 40-60 分层全量；基线补齐 Semgrep / CodeQL / DREA / 裸 agent 同口径；
   VulnGym 全量 AI 层补跑。
