# 18 差分证据协议（DEP）与 Sink 锚定定位（SAL）— 机制设计与 A0 消融报告

> **日期**：2026-08-17 · **定位**：HOS-LS 自己的研究贡献（相对 DREA 的探索式 / AEGIS 的辩证式，本文提出**差分证据式**定位-验证一体机制）
> **铁律**：一切结论先消融后写论文；本报告 A0 部分零 API 成本，AI 端结论待 S1-A 付费消融确认。

---

## 一、研究问题（动机）

1. **Lucky Hit 问题**：DREA 自曝其 26–55% 真阳性为 Lucky Hits——"AI 报对了漏洞"不等于"验证链可复现"。现有 CONFIRMED 依赖模型自我确认，审稿人无法复验。
2. **Pair-Correct 口径脆弱性**：Pair-Correct（vuln 端报 + patched 端不报）与验证链脱节——系统从不显式检查"漏洞模式在修复后是否消失"。
3. **虚拟测试集脱离实际**：RepoPairBench 的函数级切片（code_before/code_after 提取）天然缺乏差分与锚定信号（A0 量化见 §四），无法承载真实审计能力。

## 二、DEP —— Differential Evidence Protocol（差分证据协议）

**定义**：把"漏洞"操作化为**双快照差分中消失且可达的危险模式**。

- 协议：vuln 快照（fix~1）与 patched 快照（fix）**分别、独立**地交给系统（模型不知配对，无泄露）；验证链合并两端输出做**消失性判定**：
  **CONFIRMED ⇔ 定位命中（文件/函数 ∈ fix diff）∧ 该危险模式在 patched 快照同构位置消失。**
- 结构收益：
  - Pair-Correct 从"事后统计"变成"验证链内建语义"；
  - "修复不完整误报"（表 6 的 0294b9f1 XXE / 0f0215bf SSRF 类）被结构性压制；
  - 与 DREA（单快照探索取证）、AEGIS（单快照 CPG + 辩论）的本质差异在**协议层**。
- 真实场景映射：审计员手上同时有升级前后两个版本——双快照差分就是真实审计动作，不是评测取巧。

## 三、SAL —— Sink-Anchored Localization（Sink 锚定定位）

**定义**：CWE→sink 模式映射 + 数据流可达性判定，定位从"全仓语义猜测"变为"sink 锚定的候选生成 + 可达性剪枝"。

- 机制：CVE 描述/CWE → sink 模式集（如 CWE-78 → `Runtime.exec`/`ProcessBuilder`/`subprocess`；CWE-502 → `pickle.loads`/反序列化入口）→ 仓库内锚定候选文件 → AI 只分析"可达 sink"。
- 收益：① 消除类型错位/描述错位类漏检（表 6 的 00c73b6e/03e97308/0dc2e99d 类）；② AI 候选集从全仓 Top-K 压缩到 sink 相关文件（token 成本直接下降）；③ 与 DEP 叠加：锚定 + 消失性 = 静态可计算的证据对。

## 四、A0 零成本消融结果（2026-08-17，API 调用 0 次）

### 4.1 静态差分在函数级切片上不可用（DEP 的 SAST 部分需仓库级）

| 类别 | 系统静态层（复用 100 文件全量结果） | 官方规则（semgrep p/python + bandit 全量重跑） |
|---|---|---|
| V+P-（消失模式，差分信号可用） | **4/100（4%）** | 1/100（1%） |
| V+P+（残留，误报风险） | 72/100 | 3/100 |
| V-P-（静态不可见，需 AI） | 20/100 | 96/100 |
| V-P+（静态误报） | 4/100 | 0 |

> 结论：切片粒度下 vuln/patched 函数结构高度相似（补丁仅改数行），危险模式必然双端命中 → **差分信号在仓库级才有**（文件粒度差异 + 真实结构下 CodeQL 污点分析；已有旁证：仓库级 cascade 9 对中 CodeQL 硬命中 5/9，含 AI 曾漏检样本）。

### 4.2 锚定差分信号在切片上同样不可用（SAL 需仓库级）

SAL-A0（100 对，CWE→sink 正则）：vuln 端锚定命中 52%，patched 端 58%，**vuln-only（差分信号）仅 1%**；双侧命中 51%。

### 4.3 AI 双端 DEP 后处理：现状 Pair-Correct 的 46% 是残留型假阳性

复用 50 样本 AI 结果（vuln/patched 双端）：
- 现状 Pair-Correct（vuln CONFIRMED 且 patched 非 CONFIRMED）：**13/50**
- DEP 消失性判定后（vuln CONFIRMED 且 patched 无 finding）：**7/50**
- **6/13（46%）的 Pair-Correct 其 patched 端仍残留 finding**——即"修复不完整"类样本被现状口径错误计为正确。

> caveat：50 样本结果文件 stderr 含 `AI API key not configured, skipping AI verification`（验证链部分环节当时未配 key）；本分析仅用 confirmed/recog/findings 字段做数学结构对照，最终结论需 S1-A 付费消融确认。

### 4.4 A0 对论文与工程的含义

1. **可发表的机制发现**："Pair-Correct 口径 46% 残留假阳性"揭示现有 AI 漏洞定位评测的验证缺陷，DEP 是协议级修正。
2. **数据提升的正路**：DEP 是"诚实性收紧器"（数字下降但可信），**定位率提升必须来自仓库级上下文（表 7：0/4→3/4）+ SAL 锚定**；DEP 保证提升后的数字可复现。
3. **换基准的必要性实证**：函数级切片缺乏差分/锚定信号（4%/1%）——这正是"虚拟测试集脱离实际"的量化证据，支持切换到真实框架审计基准。

## 五、待验证项（付费阶段，余额门槛内）

| 项 | 内容 | 预估 |
|---|---|---|
| S1-A | 完整验证链下重测 DEP 收紧效应（vuln+patched 双端） | ≤¥5 预估 / ~¥2.5 实付 |
| S2 | 新基准（CN 企业框架）仓库级协议：SAL 候选 + DEP 验证链 | 余额门槛控制 |
| 消融对比 | 仓库级 vs 切片级定位率、SAL 候选压缩比、DEP 保真度 | 并入 S2 |

## 六、证据文件索引

- A0 静态差分：`hosls-eval/reports/dep-ablation0-report.{md,json}`
- A0 锚定分析：`hosls-eval/reports/sal-ablation0-report.{md,json}`
- 工具链体检：`hosls-eval/toolchain-check.md`
- 仓库级评测工具：`hosls-eval/audit_eval.py`
- 基线数据：`hosls-eval/reports/opt-hos-ls-vuln-50-results.json` / `opt-hos-ls-patched-50-results.json` / `vuln-static-results.json` / `patched-static-results.json`
