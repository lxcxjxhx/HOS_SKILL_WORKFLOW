# 06 · 六维评分模型与报告规格

> 本文档定义 Judge-Agent 的评分模型（维度、权重、公式、扣分规则、评级）与 Report-Agent 的报告模板、输出通道和 JSON Schema 集。

---

# Part A · 六维评分模型

## 6.1 六维定义

| 维度 | key | 满分 | 评价对象 | 高分特征 | 低分特征 |
|------|-----|------|----------|----------|----------|
| 技术质量 | `technical` | 10 | 架构设计、代码质量、方法正确性、理论完整度 | 架构清晰、实现稳健、方法可辩护 | 拼接物、设计缺陷、理论断裂 |
| 创新真实性 | `innovation` | 10 | 真创新 vs 工程组合 vs 概念包装 | 有实质新技术/新视角 | 旧瓶新酒、概念包装、A+B 拼接 |
| 工程落地 | `engineering` | 10 | 完整性、可部署性、文档、测试、生命周期 | 开箱可用、文档全、有测试 | 半成品、文档缺失、无测试 |
| 生态影响 | `ecosystem` | 10 | Star/贡献者/引用/后续工作 | 活跃社区、持续迭代、被引用 | 无人问津、无维护、孤例 |
| 风险暴露 | `risk` | 10 | 隐藏假设、安全、合规、商业风险 | 风险低且已披露 | 关键假设脆弱、安全/合规漏洞 |
| 战略价值 | `strategic` | 10 | 值得学习/贡献/投资/研究 | 高杠杆、可复用、方向正确 | 低杠杆、可替代、方向存疑 |

## 6.2 权重表（默认，可配置）

| 维度 | 默认权重 | 说明 |
|------|----------|------|
| technical | 0.20 | 技术是评审主线 |
| innovation | 0.20 | 创新真实性是第二主线 |
| engineering | 0.15 | — |
| ecosystem | 0.15 | — |
| risk | 0.15 | — |
| strategic | 0.15 | — |
| **合计** | **1.00** | — |

> 权重可按对象类型覆盖（如 `paper` 提高 innovation、`repo` 提高 engineering），覆盖配置存于 `config.yaml#weights`。

## 6.3 评分公式

```
维度分 D_i ∈ [0, 10]（Judge 依据证据给分）
总分 Score = Σ(D_i × w_i) × 10 ∈ [0, 100]
```

- 打分必须**证据先行**：每个 `D_i` 在 `rationale` 中引用 ≥1 个 finding/critique id；
- 允许 ±1 舍入（0.5 以上进位）；
- 空 Findings（无显著问题）时按基准分：technical 8 / innovation 7 / engineering 8 / ecosystem 7 / risk 7 / strategic 7（可配置 `baseline`），并在 `rationale` 注明「无发现模式」。

## 6.4 扣分参考（Judge 的起点，非机械公式）

Judge 从基准 7 分起步，按发现严重度与证据状态调整：

| 严重度 | 基准扣分 | 证据修正系数 |
|--------|----------|--------------|
| CRITICAL | -2.0 | verified ×1.0 / partial ×0.7 / low ×0.5 / refuted ×0 |
| HIGH | -1.5 | 同上 |
| MEDIUM | -1.0 | 同上 |
| LOW | -0.5 | 同上 |
| INFO | 0 | — |

**class → 维度映射**（一条 Finding 可能影响多维度，权重平分）：

| Finding.class | 影响维度 |
|---------------|----------|
| ARCH | technical(0.6), innovation(0.4) |
| EVAL | technical(0.5), innovation(0.5) |
| DATA | technical(0.5), risk(0.5) |
| SEC | risk(1.0) |
| REPRO | engineering(1.0) |
| LIC | risk(1.0) |
| ECO | ecosystem(1.0) |
| CLAIM | innovation(0.5), strategic(0.5) |

> 扣分是起点不是终点：Judge 可结合 Critic 的观点做 ±0.5 的定性微调，但必须在 `rationale` 写明理由。维度分下限 0。

## 6.5 评级

| 总分 | 评级 | 标签 | 一句话含义 |
|------|------|------|-----------|
| 90-100 | S | 顶级 | 强烈推荐：可信、可投、可学 |
| 80-89 | A | 优秀 | 推荐：价值真实，有瑕疵 |
| 70-79 | B | 良好 | 可考虑：有亮点有硬伤 |
| 60-69 | C | 及格 | 谨慎：缺陷明显 |
| 40-59 | D | 风险 | 不建议投入，除非特定场景 |
| <40 | F | 不推荐 | 结论不可信 / 无落地价值 |

## 6.6 决策建议（decision 四问）

由评分与 risk_flags 推导（默认规则，可被 Judge 人工覆盖并在 rationale 注明）：

| 问题 | 默认规则 |
|------|----------|
| `learn` 值得学习 | Score ≥ 60 或 technical+innovation ≥ 14 |
| `contribute` 值得贡献 | ecosystem ≥ 7 且 engineering ≥ 7 且 Score ≥ 70 |
| `invest` 值得投资 | Score ≥ 80 且 risk ≥ 7 且 innovation ≥ 7 |
| `research` 值得研究 | Score ≥ 70 或 innovation ≥ 8 |

**一句话结论（one_liner）规则**：
1. ≤ 40 字；
2. 「结论 + 最关键证据」结构（例：「工程扎实，创新是旧瓶装新酒」）；
3. 由最低维度或最强 finding 决定语气，必须与评分一致。

---

# Part B · 报告规格

## 6.7 输出模式与模板

### 6.7.1 Quick（默认，快速可视化）

```
================================================
 HOS-CRITIC-REVIEW · Quick
 Target: {title} ({type})
 Score: {score}/100  ·  {grade_label}
 Verdict: {verdict}

 Six Dimension:
   Technical   {d}  ████████░░
   Innovation  {d}  ██████░░░░
   Engineering {d}  █████████░
   Ecosystem   {d}  ████████░░
   Risk        {d}  ███████░░░
   Strategic   {d}  █████████░

 One-liner: {one_liner}

 Critical Findings (TOP 5):
   [HIGH] HCR-EVAL-2026-0001  {title}
   [MED]  HCR-ECO-2026-0002   {title}

 Decision: learn ✓ / contribute ✗ / invest ✗ / research ✓
 Degradations: {list or "none"}
================================================
```

### 6.7.2 Expert（完整分析）

```
# HOS-CRITIC-REVIEW · Expert Report
## 0. Executive Summary      （分数 + 评级 + 一句话 + 决策）
## 1. Target & Profile        （ObjectProfile：类型/领域/复杂度/来源）
## 2. Six Dimension Score     （六维表：得分/权重/说明，含 rationale）
## 3. Findings                （按 severity 排序，每条含 HCR 编号/证据状态/来源/建议 patch）
## 4. Evidence                （每条 Finding 的证据链：verified/refuted/unverifiable + 来源）
## 5. Critical Critiques      （按角色分组：Reviewer #2 / Principal Engineer / Security / …）
## 6. Degradations & Limits   （工具缺失清单、抽样策略、上下文裁剪说明）
## 7. Recommendation          （learn/contribute/invest/research + 行动建议）
## 8. Appendix                （ReviewUnit 清单摘要、API 调用记录、schema_version）
```

### 6.7.3 Academic（论文场景决策）

```
# HOS-CRITIC-REVIEW · Academic Decision
Target: {paper title}（{venue}, {year}）
Decision: Weak Accept          ← Accept / Weak Accept / Weak Reject / Reject
Score: {score}/100  ·  {grade_label}

## Reviewer Summary（按 Critic 角色）
  Reviewer #2:  核心问题 {…}，建议 {…}
  Experiment:   {…}
  Security:     {…}
## Critical Blocking Issues（导致不升级的 TOP 问题）
## Strengths（至少 1 条）
## Suggested Revision（可复现清单）
## Decision Rationale
```

## 6.8 输出通道

| 通道 | 说明 |
|------|------|
| stdout（人类报告） | 默认，按 output_mode |
| JSON 文件 | `--json <path>`，ReviewReport 全量 |
| Review Store | 自动持久化（见 [08-engineering.md](08-engineering.md) §8.2） |
| 事件流 | 上游工作流经 [07-integration.md](07-integration.md) §7.4 事件订阅 |

---

# Part C · JSON Schema 集（附录）

> 以下为精简版核心 Schema；实现时以 `schemas/` 目录下的正式 JSON Schema 文件为准（字段以 §3.x 各 Agent 输出为准）。

## 6.9 ReviewReport（顶层）

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["schema_version", "report_id", "target", "score", "findings", "critiques", "meta"],
  "properties": {
    "schema_version": { "type": "string", "const": "1.0" },
    "report_id": { "type": "string", "pattern": "^rr-[0-9]{8}-[a-z0-9]{6}$" },
    "target": { "$ref": "#/$defs/ObjectProfile" },
    "score": { "$ref": "#/$defs/SixDimScore" },
    "findings": { "type": "array", "items": { "$ref": "#/$defs/Finding" } },
    "critiques": { "type": "array", "items": { "$ref": "#/$defs/Critique" } },
    "degradations": { "type": "array", "items": { "type": "string" } },
    "meta": {
      "type": "object",
      "properties": {
        "duration_seconds": { "type": "number" },
        "toolchain": { "type": "object" },
        "output_mode": { "enum": ["quick", "expert", "academic"] }
      }
    }
  },
  "$defs": {
    "SixDimScore": {
      "type": "object",
      "required": ["score", "grade", "grade_label", "dimensions", "verdict", "one_liner", "decision"],
      "properties": {
        "score": { "type": "number", "minimum": 0, "maximum": 100 },
        "grade": { "enum": ["S", "A", "B", "C", "D", "F"] },
        "grade_label": { "type": "string" },
        "dimensions": {
          "type": "object",
          "required": ["technical", "innovation", "engineering", "ecosystem", "risk", "strategic"],
          "additionalProperties": { "type": "number", "minimum": 0, "maximum": 10 }
        },
        "verdict": { "type": "string" },
        "one_liner": { "type": "string", "maxLength": 40 },
        "decision": {
          "type": "object",
          "required": ["learn", "contribute", "invest", "research"],
          "additionalProperties": { "type": "boolean" }
        },
        "rationale": { "type": "string" },
        "risk_flags": { "type": "array", "items": { "type": "string" } }
      }
    },
    "Finding": {
      "type": "object",
      "required": ["finding_id", "class", "severity", "title", "claim", "evidence_draft", "unit_refs"],
      "properties": {
        "finding_id": { "type": "string" },
        "hcr_id": { "type": "string" },
        "class": { "enum": ["ARCH", "DATA", "EVAL", "SEC", "REPRO", "LIC", "ECO", "CLAIM"] },
        "severity": { "enum": ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"] },
        "title": { "type": "string" },
        "claim": { "type": "string" },
        "evidence_draft": { "type": "string" },
        "unit_refs": { "type": "array", "items": { "type": "string" } },
        "analyzer": { "type": "string" },
        "confidence": { "type": "number", "minimum": 0, "maximum": 1 },
        "evidence_status": { "enum": ["verified", "refuted", "partial", "unverifiable"] },
        "patch": { "type": "string" }
      }
    },
    "Critique": {
      "type": "object",
      "required": ["crit_id", "role", "attack_vector", "thesis", "reasoning"],
      "properties": {
        "crit_id": { "type": "string" },
        "role": { "enum": ["reviewer2", "experiment-auditor", "principal-engineer", "security-auditor", "product-mind", "legal-mind", "business-mind", "data-scientist", "skeptic", "domain-expert", "architect", "generalist"] },
        "attack_vector": { "enum": ["hidden-assumption", "counterexample", "hidden-cost", "overclaim", "missing-baseline", "scaling-doubt", "survivorship", "recognition"] },
        "thesis": { "type": "string" },
        "reasoning": { "type": "string" },
        "unit_refs": { "type": "array", "items": { "type": "string" } },
        "finding_refs": { "type": "array", "items": { "type": "string" } },
        "spiciness": { "type": "number", "minimum": 0, "maximum": 5 }
      }
    },
    "ObjectProfile": {
      "type": "object",
      "required": ["object_id", "type", "domain", "complexity", "confidence"],
      "properties": {
        "object_id": { "type": "string" },
        "type": { "enum": ["repo", "paper", "article", "dataset", "license", "proposal", "unknown"] },
        "domain": { "type": "string" },
        "complexity": { "enum": ["low", "medium", "high"] },
        "size_estimate": { "type": "object" },
        "source": { "type": "object" },
        "meta": { "type": "object" },
        "confidence": { "type": "number", "minimum": 0, "maximum": 1 }
      }
    }
  }
}
```
