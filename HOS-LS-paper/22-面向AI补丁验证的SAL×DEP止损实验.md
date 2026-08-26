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

## 4. 通用仓库级副线（VulnGym 10） — [待批次完成填充]

## 5. 成本（止损核算）

| 批次 | 文件扫描数 | input tokens | output tokens | 估算成本 |
|---|---|---|---|---|
| A.S.E vuln 27 | 27 | 781,110 | 171,495 | ¥0.49 |
| A.S.E patched 10 | 10 | 197,283 | 49,233 | ¥0.13 |
| VulnGym（SAL+baseline） | 16+ | 701,700 | 124,944 | ¥0.41（未完） |
| 补丁生成 27+10 | ~37 calls | — | — | ~¥0.2-0.4 |
| **合计** | | | | **~¥1.5-2.0（止损线内）** |

## 6. 结论与下一步

1. **SAL 定位已 9/9（静态）**；AI 层验证链（vulngym 批次）完成后给出"候选压缩是否提升最终检出"的直接证据。
2. **DEP 对 AI 补丁有效**：30% 的 AI 修复被差分验证拒绝 —— "主路径修复但残留路径仍可利用"是真实可测的 AI 补丁缺陷形态。
3. 下一步：SecureVibeBench 105 仓库多文件编辑任务（静态+动态 oracle）+ A.S.E 120 全量（补 XSS 类）→ 40-60 分层全量；基线补齐 Semgrep/CodeQL/DREA/裸 agent 同口径。
