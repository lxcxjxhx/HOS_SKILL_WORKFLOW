# 02 · 总体架构与数据流

> 本文档定义 HOS-CRITIC-REVIEW 的分层架构、七 Agent 流水线、产物链、编排状态机与错误处理。

---

## 2.1 分层架构

```
┌─────────────────────────────────────────────────────────────────┐
│  接入层  Input Adapters                                        │
│  CLI 命令 · AI IDE Skill 目录 · 文件/URL/文本 · 上游工作流 JSON │
├─────────────────────────────────────────────────────────────────┤
│  编排层  Orchestrator（宿主 LLM 执行）                         │
│  七 Agent 状态机 · 上下文预算管理 · 降级路由                    │
├─────────────────────────────────────────────────────────────────┤
│  分析层  Chunk Engine + Analyzer 插件                          │
│  Router / Code / Paper / Text Parser · GitHub / Paper /        │
│  License / Code Analyzer · Semantic Splitter                   │
├─────────────────────────────────────────────────────────────────┤
│  证据层  Evidence Verifier                                     │
│  证据链构建 · 置信度分级 · 来源校验 · 反例修正                  │
├─────────────────────────────────────────────────────────────────┤
│  批判层  Critic（多角色并行）                                  │
│  Reviewer #2 · Principal Engineer · Security Auditor ·         │
│  Product/Business Mind（按对象类型选角色集）                    │
├─────────────────────────────────────────────────────────────────┤
│  判定层  Judge                                                 │
│  六维评分 · 评级 · 一句话结论 · 决策建议                        │
├─────────────────────────────────────────────────────────────────┤
│  输出层  Report                                                │
│  Quick / Expert / Academic 模板 · JSON 渲染 · 持久化            │
└─────────────────────────────────────────────────────────────────┘
```

**分层边界规则**：

- 编排层（Agent 状态机）只做路由与调度，不产生领域判断；领域判断全部下沉到各 Agent 的 Prompt 规格与工具插件。
- 分析层只产出结构化 `Finding`，不评分；评分是判定层的唯一职责。
- 证据层只做「证实 / 证伪 / 查不到」三类判定，不做价值判断。
- 输出层不新增内容，只按模板渲染已有产物；渲染结果必须能在产物链上逐条回溯。

---

## 2.2 七 Agent 流水线

```
  Input
    │
    ▼
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│ Discovery      │────▶│ Chunk          │────▶│ Analyzer       │
│ 对象识别       │     │ 自适应切片     │     │ 领域分析       │
└────────────────┘     └────────────────┘     └────────────────┘
                                                      │
                                                      ▼
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│ Evidence       │◀────│ Critic         │◀────│ (Findings)     │
│ 证据校验       │     │ 多角色攻击     │     │                │
└────────────────┘     └────────────────┘     └────────────────┘
        │                     │
        ▼                     ▼
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│ Judge          │────▶│ Report         │────▶│  输出/持久化    │
│ 六维评分       │     │ 模板渲染       │     │                │
└────────────────┘     └────────────────┘     └────────────────┘
```

### 每步产物链（Pipeline Artifacts）

| 步骤 | 产物 | 说明 |
|------|------|------|
| 输入 | `RawInput` | 原始输入（路径 / URL / 文本 / JSON） |
| Discovery | `ObjectProfile` | 类型、领域、复杂度、来源、元数据 |
| Chunk | `ReviewUnit[]` | 语义单元列表（含位置、类型、来源映射） |
| Analyzer | `Finding[]` | 带严重度与初步证据的发现 |
| Evidence | `EvidenceReport[]` | 每条 Finding 的证据链与置信度判定 |
| Critic | `Critique[]` | 攻击性观点（反例 / 隐藏成本 / 夸大识别） |
| Judge | `SixDimScore` | 六维分 + 总分 + 评级 + 一句话结论 + 决策建议 |
| Report | `ReviewReport` | 人类报告 + 机器 JSON + 持久化记录 |

**产物唯一性约束**：每个产物带 `artifact_id`（`obj-<hash>`、`unit-<seq>`、`finding-<seq>`、`ev-<seq>`、`crit-<seq>`），下游引用上游 ID，保证整条链可追溯。

---

## 2.3 编排状态机

```
                    ┌──────────┐
   ┌───────────────▶│  FAILED  │◀──────────────┐
   │                └──────────┘               │
   │                    ▲                      │
   │                    │ (不可降级错误)         │
INIT ─▶ DISCOVERY ─▶ CHUNK ─▶ ANALYZE ─▶ EVIDENCE ─▶ CRITIC ─▶ JUDGE ─▶ REPORT ─▶ DONE
          │            │         │            │          │         │
          │            ▼         ▼            ▼          ▼         ▼
          └──(可降级错误)───────────────────────────────────────┐
                          (任何一步失败 → 降级重试 或 带降级标记继续) │
                                                                    ▼
                                                         DONE_WITH_DEGRADATION
```

状态定义：

| 状态 | 含义 |
|------|------|
| `INIT` | 解析 RawInput，校验输入格式 |
| `DISCOVERY` | 运行 Discovery-Agent，产出 ObjectProfile |
| `CHUNK` | 运行 Chunk-Agent（依赖 Chunk Engine） |
| `ANALYZE` | 运行 Analyzer-Agent，可能并行多个分析器插件 |
| `EVIDENCE` | 运行 Evidence-Agent，逐条校验 |
| `CRITIC` | 运行 Critic-Agent，多角色并行产出 Critique |
| `JUDGE` | 运行 Judge-Agent，产出 SixDimScore |
| `REPORT` | 运行 Report-Agent，渲染输出 |
| `DONE` / `DONE_WITH_DEGRADATION` | 成功结束（后者带 `degradation[]` 清单） |
| `FAILED` | 不可降级错误（输入非法 / 编排契约破坏），输出失败 JSON |

**状态转移规则**：

1. 每步产物先写临时文件 / 内存对象，通过校验（Schema 校验，见 2.5）才允许进入下一步；
2. 任何一步抛出的「可降级错误」（工具缺失、网络失败、解析失败）→ 走该能力的降级链，并在 `degradation[]` 追加记录后继续；
3. `FAILED` 只允许由输入非法或产物 Schema 违规触发——前者返回错误 JSON，后者视为编排 Bug（应被测试覆盖，见 [08-engineering.md](08-engineering.md) §8.4）。

---

## 2.4 并行性与上下文预算

### 可并行单元

| 阶段 | 并行方式 | 并行上限（默认） |
|------|----------|------------------|
| Chunk | 大对象按 ReviewUnit 分组分片 | 4 片 |
| Analyze | 多 Analyzer 插件并行；同插件内按 unit 分片 | 3 个插件 / 4 片 |
| Evidence | 按 Finding 独立校验 | 5 条/批 |
| Critic | 多角色并行（Reviewer / Engineer / Security / Product） | 4 角色 |

> 并行仅适用于**工具型 / 检索型**任务（API 调用、静态分析、文本处理）。**需要宿主 LLM 判断的任务**（Critic 观点生成、Judge 打分）默认串行，避免上下文碎片化导致质量下降。

### 上下文预算（Host Context Budget）

宿主 LLM 上下文有限，编排层必须做预算管理：

| 预算项 | 默认值 | 说明 |
|--------|--------|------|
| 原始输入最大 Token | 200K（超长走「抽取摘要 + 分片」模式） | 论文/大仓库限制 |
| 进入 Critic 前的累积产物上限 | 60K Token | Findings + Evidence 汇总 |
| ReviewUnit 单条最大 Token | 4K | 超出则再切分 |
| 每角色 Critic 输入上限 | 15K Token | 角色视角抽样传入 |
| Judge 输入上限 | 25K Token | 汇总摘要 + 全量发现清单 |

超预算策略：**先粗筛后深挖** —— 按严重度/相关性排序，把预算优先给 HIGH/CRITICAL 发现；被裁掉的单元在报告中标注 `depth: "skipped"`。

---

## 2.5 产物 Schema 校验

- 每个产物类型对应一个 JSON Schema（汇总见 [06-scoring-report.md](06-scoring-report.md) §6.9 Schema 集）；
- 编排层在每步出口执行校验；校验失败视为可降级错误（尝试修复一次：补默认值 / 重跑一次；仍失败 → 该步产物标记 `invalid: true` 并跳过该单元，不中断全链）；
- Schema 文件是工作流集成的稳定契约，版本号随报告 JSON 输出（`schema_version`）。

---

## 2.6 错误处理总表

| 错误类别 | 示例 | 处理策略 |
|----------|------|----------|
| 输入非法 | 空输入 / 无法解析的 URL | `FAILED`，返回错误 JSON（`code: "E_INPUT"`） |
| 工具缺失 | 未安装 tree-sitter / 无网络 | 走降级链，记 `degradation[]` |
| API 限流 | GitHub API 403 | 指数退避重试 ×2 → 使用缓存 → 标记证据 `unverifiable` |
| 解析失败 | PDF 损坏 / HTML 乱码 | 换备用解析器 → 原文直传 → 记降级 |
| 对象过大 | 10 万文件仓库 | 抽样（按目录/星标文件）+ 分片，报告标注抽样策略 |
| 产物 Schema 违规 | 某 Finding 缺 severity | 补默认值重试 → 跳过该条并告警 |

---

## 2.7 与外部工作流的边界

- 本架构的编排层**不负责**调度宿主 LLM 的并发（那是宿主能力）；Skill 只定义串行/并行建议；
- 输出层通过 [07-integration.md](07-integration.md) 的 JSON 契约暴露 `event` 序列（`discovery.done` / `chunk.done` / ... / `report.done`），供上游工作流订阅；
- 评审中间态（如仅需 Findings 不要报告）可通过 `--until <stage>` 契约截断，见 [07-integration.md](07-integration.md) §7.4。
