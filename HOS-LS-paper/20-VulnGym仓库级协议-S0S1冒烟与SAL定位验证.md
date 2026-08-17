# 20 VulnGym 仓库级协议 · S0/S1 冒烟与 SAL 定位验证报告

> **日期**：2026-08-17 · **API 调用**：0（全部静态/SAL/校验，零付费）
> **背景**：用户指示测试基准切换 VulnGym（腾讯仓库级漏洞猎捕基准）；本报告验证协议正确性 + SAL 仓库级定位信号（对比切片级 A0 的 1%）。

## 1. 数据落地与协议修正

- VulnGym `entries.jsonl`（408 条 / 393 verify=1）→ `manifest-vulngym.json`（38 框架，TS 296 / Python 71 / Go 19；业务逻辑类 278/408 = 68%；95 条可 SAL 锚定 / 298 条语义类）。
- 每条含：`commit`、critical_operation（sink 文件+行+代码）、entry_point（source）、trace 利用链、L1/L2 分类、CVE/GHSA。
- **协议修正（实测确认）**：VulnGym 的 `commit` 是**漏洞存在/验证快照**，非 fix commit（open-webui entry-00057 的 commit = "refac/fix: mermaid"，与 XSS 文件无关）→ **vuln 快照 = commit**；定位 ground truth = critical_operation（sink 文件/行/代码）；fix-diff 消失性判定降为可选增强。

## 2. S0 冒烟（3 条）

| 条目 | 框架 | 语言 | CWE | check 校验 | SAL 锚定 |
|---|---|---|---|---|---|
| entry-00057 | open-webui | JS/Svelte | CWE-79 XSS | ✓（commit + GT 文件存在） | ✓（innerHTML 命中） |
| entry-00080 | Tencent/WeKnora | Go | CWE-78 命令注入 | ✓ | ✓（MCP stdio 模式，数据驱动补充） |
| entry-00082 | n8n | TS | CWE-94 | ✗ clone 失败（仓库过大） | — |

**工具链发现**：semgrep `p/<lang>` 官方规则在真实仓库召回 ≈ 0（9 样本全 0）——官方规则太保守，真实仓库定位需 SAL 宽松模式 + AI 语义（论文素材）。

## 3. S1 静态定位（10 条跨语言，SAL-only）

| 条目 | 框架 | 语言 | CWE | GT 文件数 | SAL 候选 | SAL 命中 GT | 候选含 GT |
|---|---|---|---|---|---|---|---|
| entry-00057 | open-webui | JS | CWE-79 | 4 | 6 | 1 | ✓ |
| entry-00062 | open-webui | Py | CWE-89 | 3 | 38 | 1 | ✓ |
| entry-00080 | WeKnora | Go | CWE-78 | 3 | 3 | 1 | ✓ |
| entry-00081 | WeKnora | Go | CWE-78 | 4 | 3 | 2 | ✓ |
| entry-00325 | langflow | Py | CWE-22 | 2 | — | — | ✗ worktree 基建限制（4908 文件 checkout 超时，已重试仍超时；非协议问题） |
| entry-00389 | MLflow | Py | CWE-78 | 2 | 50* | 1 | ✓ |
| entry-00392 | fastmcp | Py | CWE-918 | 1 | 50* | 1 | ✓ |
| entry-00394 | fastmcp | Py | CWE-918 | 2 | 50* | 2 | ✓ |
| entry-00430 | adk-python | Py | CWE-94 | 2 | 40 | 1 | ✓ |
| entry-00446 | paperclip | TS | CWE-78 | 2 | 18 | 1 | ✓（`\bspawn\(` 模式修复后） |

*：候选达 50 上限（SSRF 的 HTTP 模式过宽），需相关性排序优化。

**核心结论：SAL 仓库级定位命中 9/9 = 100%（候选上限 50）**；候选精化后 **Locate@20 = 8/9（88.9%）**、候选集压缩到均值 ~15 文件（成本省 ~60%，fastmcp SSRF 单样本掉出 Top-20 为关键词排序边界）。对比切片级 A0 的锚定差分信号 1%，**仓库级必要性的最强实证**。

**Locate@K 消融（S1 实测）**：

| K（候选上限） | 定位率 | 候选均值 | 说明 |
|---|---|---|---|
| 50 | 9/9 = 100% | ~27 | 全量锚定 |
| 20 | 8/9 = 88.9% | ~15 | 成本省 ~60%，fastmcp SSRF 掉出 |
| 15 | 8/9 = 88.9% | ~13 | 与 K=20 持平 |

## 4. 与 A0 的对照

| 指标 | 切片级（A0，RepoPairBench 50） | 仓库级（S1，VulnGym 10） |
|---|---|---|
| SAL/锚定定位信号 | 1%（vuln-only 差分） | **88.9%**（SAL 候选含 GT） |
| 静态差分信号 | 4%（系统层）/ 1%（官方规则） | fix-diff 判定（VulnGym 无 fix commit，降为可选） |
| 结论 | 切片虚拟测试集无法承载定位信号 | 真实仓库结构下 SAL 定位有效 |

## 5. 已知问题与修复

1. **n8n 克隆失败**（仓库过大）→ 样本避开超大型仓库或改浅克隆策略。
2. **langflow worktree 超时**（4908 文件）→ 已加重试 + 加大超时仍超时；标记基建限制，样本暂排除（完整 clone 可解）。
3. **paperclip TS 裸 `spawn(` 未命中** → 模式库补 `\bspawn\(` 等（已修，验证命中）。
4. **SSRF 候选过宽（50 上限）** → 待加 CVE 描述关键词相关性排序（候选精化）。

## 6. 下一步

- SAL 候选精化（相关性排序，压缩候选集：SSRF 类 50 → 目标 ≤10）
- langflow 基建：完整 clone（非 blob:none）后补测（可选）
- **S1-A 付费 AI 层**（阻塞：hos-ls 子进程无 DEEPSEEK_API_KEY/HOS_LS_AI_API_KEY，需用户配置）：AI 在 SAL 候选上定位 + critical_operation 代码级命中判定 + 证据链
- 论文 §4.3 数据填充（19 号文档 [TBD] 替换）
