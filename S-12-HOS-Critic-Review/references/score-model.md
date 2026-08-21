# 评分模型（Judge-Agent 执行规则）

> 宿主在 Judge 阶段必须按本模型打分。**先列证据后给分，打分可复核。**

## 1. 六维定义

| 维度 | key | 满分 | 评价对象 |
|------|-----|------|----------|
| 技术质量 | `technical` | 10 | 架构设计、代码质量、方法正确性、理论完整度 |
| 创新真实性 | `innovation` | 10 | 真创新 vs 工程组合 vs 概念包装 |
| 工程落地 | `engineering` | 10 | 完整性、可部署性、文档、测试、生命周期 |
| 生态影响 | `ecosystem` | 10 | Star/贡献者/引用/后续工作 |
| 风险暴露 | `risk` | 10 | 隐藏假设、安全、合规、商业风险 |
| 战略价值 | `strategic` | 10 | 值得学习/贡献/投资/研究 |

## 2. 权重与公式

默认权重：technical 0.20 / innovation 0.20 / engineering 0.15 / ecosystem 0.15 / risk 0.15 / strategic 0.15（合计 1.00；可按对象类型覆盖）。

```
Score = Σ(D_i × w_i) × 10 ∈ [0, 100]
```

## 3. 评分流程

1. 基准 7 分起步；
2. 按 Finding 严重度扣分：CRITICAL -2.0 / HIGH -1.5 / MEDIUM -1.0 / LOW -0.5 / INFO 0；
3. 乘证据修正系数：verified ×1.0 / partial ×0.7 / low-conf ×0.5 / refuted ×0；
4. class→维度映射（一条 Finding 影响多维度时权重平分）：

| class | 影响维度 |
|-------|----------|
| ARCH | technical 0.6, innovation 0.4 |
| EVAL | technical 0.5, innovation 0.5 |
| DATA | technical 0.5, risk 0.5 |
| SEC | risk 1.0 |
| REPRO | engineering 1.0 |
| LIC | risk 1.0 |
| ECO | ecosystem 1.0 |
| CLAIM | innovation 0.5, strategic 0.5 |

5. 结合 Critic 观点做 ±0.5 定性微调（须在 rationale 写明）；
6. 维度分下限 0；
7. 无发现模式：基准分 8/7/8/7/7/7 并注明「无发现模式」。

## 4. 评级

| 总分 | 评级 | 标签 |
|------|------|------|
| 90-100 | S | 顶级 |
| 80-89 | A | 优秀 |
| 70-79 | B | 良好 |
| 60-69 | C | 及格 |
| 40-59 | D | 风险 |
| <40 | F | 不推荐 |

## 5. 决策四问（默认规则）

| 问题 | 规则 |
|------|------|
| learn | Score ≥ 60 或 technical+innovation ≥ 14 |
| contribute | ecosystem ≥ 7 且 engineering ≥ 7 且 Score ≥ 70 |
| invest | Score ≥ 80 且 risk ≥ 7 且 innovation ≥ 7 |
| research | Score ≥ 70 或 innovation ≥ 8 |

## 6. 一句话结论（one_liner）

1. ≤ 40 字；
2. 「结论 + 最关键证据」结构；
3. 由最低维度或最强 finding 定语气；必须与评分一致（高分不配毒舌低评）。

## 7. 输出示例

```json
{
  "score": 84, "grade": "A", "grade_label": "优秀",
  "dimensions": { "technical": 9, "innovation": 6, "engineering": 9, "ecosystem": 8, "risk": 7, "strategic": 9 },
  "verdict": "优秀工程项目，但创新价值被高估。",
  "one_liner": "工程扎实，创新是旧瓶装新酒。",
  "decision": { "learn": true, "contribute": false, "invest": false, "research": true },
  "rationale": "technical 9：架构清晰（crit-002）；innovation 6：方法为既有组件组合（finding-001 verified）…",
  "risk_flags": ["创新依赖既有技术组合"]
}
```
