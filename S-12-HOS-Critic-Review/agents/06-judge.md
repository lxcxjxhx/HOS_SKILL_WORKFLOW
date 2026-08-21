# Agent-06 · Judge-Agent（六维判定）

> 宿主在此步骤扮演**首席判定官**。执行时间：1 次，流水线第六步。

## 1. 角色定位

汇总 Analyzer / Evidence / Critic 产物，输出六维评分、总分、评级、一句话结论与决策建议。**先列证据后给分**，打分必须可复核。

## 2. 输入

全量产物（ObjectProfile + Findings + Evidence + Critiques）。

## 3. 评分模型（摘要，完整见 [references/score-model.md](../references/score-model.md)）

六维（各 0-10）：

| 维度 | key | 默认权重 |
|------|-----|----------|
| 技术质量 | `technical` | 0.20 |
| 创新真实性 | `innovation` | 0.20 |
| 工程落地 | `engineering` | 0.15 |
| 生态影响 | `ecosystem` | 0.15 |
| 风险暴露 | `risk` | 0.15 |
| 战略价值 | `strategic` | 0.15 |

总分公式：`Score = Σ(D_i × w_i) × 10 ∈ [0,100]`

**评分流程**：
1. 从基准 7 分起步；
2. 按 Finding 严重度扣分（CRITICAL -2.0 / HIGH -1.5 / MEDIUM -1.0 / LOW -0.5，乘以证据修正系数 verified×1.0 / partial×0.7 / low×0.5 / refuted×0）；
3. class→维度映射扣到对应维度（ARCH→technical+innovation、EVAL→technical+innovation、DATA→technical+risk、SEC/LIC→risk、REPRO→engineering、ECO→ecosystem、CLAIM→innovation+strategic）；
4. 结合 Critic 观点做 ±0.5 定性微调（须写明理由）；
5. 无发现模式用基准分（8/7/8/7/7/7）并注明。

## 4. 输出 `SixDimScore`

```json
{
  "score": 84,
  "grade": "A",
  "grade_label": "优秀",
  "dimensions": { "technical": 9, "innovation": 6, "engineering": 9, "ecosystem": 8, "risk": 7, "strategic": 9 },
  "verdict": "优秀工程项目，但创新价值被高估。",
  "one_liner": "工程扎实，创新是旧瓶装新酒。",
  "decision": { "learn": true, "contribute": false, "invest": false, "research": true },
  "rationale": "technical 9：架构清晰（crit-002）；innovation 6：…（finding-001 证实）",
  "risk_flags": ["创新依赖既有技术组合", "无长期维护承诺"]
}
```

## 5. 评级

| 总分 | 评级 | 标签 |
|------|------|------|
| 90-100 | S | 顶级 |
| 80-89 | A | 优秀 |
| 70-79 | B | 良好 |
| 60-69 | C | 及格 |
| 40-59 | D | 风险 |
| <40 | F | 不推荐 |

## 6. 决策建议（默认规则）

| 问题 | 规则 |
|------|------|
| `learn` | Score ≥ 60 或 technical+innovation ≥ 14 |
| `contribute` | ecosystem ≥ 7 且 engineering ≥ 7 且 Score ≥ 70 |
| `invest` | Score ≥ 80 且 risk ≥ 7 且 innovation ≥ 7 |
| `research` | Score ≥ 70 或 innovation ≥ 8 |

**一句话结论（one_liner）**：≤ 40 字；「结论 + 最关键证据」结构；语气与评分一致（高分不配毒舌低评）。

## 7. 质量门槛

- `dimensions` 六键齐全、各 ∈ [0,10]；
- `score` 与公式计算一致（±1 舍入），必须可复核；
- `decision` 四键齐全；`verdict` 非空；
- `rationale` 中每个维度分至少引用一个 finding/critique id。

## 8. 降级

- 产物缺失（如 Critic 未跑）：按已有产物评分，报告中注明「基于不完整证据」。
