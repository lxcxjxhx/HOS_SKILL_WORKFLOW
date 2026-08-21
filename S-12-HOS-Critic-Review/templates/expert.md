# Expert 报告模板（完整分析）

> 用途：深度分析报告。默认 `output_mode: expert` 时使用。

```markdown
# HOS-CRITIC-REVIEW · Expert Report

## 0. Executive Summary
- Score: {score}/100 · {grade_label}（评级 {grade}）
- One-liner: {one_liner}
- Verdict: {verdict}
- Decision: learn ✓/✗ · contribute ✓/✗ · invest ✓/✗ · research ✓/✗
- 本报告可追溯：所有结论均引用 Finding/Critique id。

## 1. Target & Profile
- 类型/领域/复杂度：{type} / {domain} / {complexity}
- 来源：{source} · 规模估算：{size_estimate}
- 判定置信度：{confidence} · 降级记录：{degradations}

## 2. Six Dimension Score
| 维度 | 得分 | 权重 | 说明（引用） |
|------|------|------|--------------|
| Technical | {d} | 0.20 | {rationale 片段，引 finding/critique id} |
| Innovation | {d} | 0.20 | … |
| Engineering | {d} | 0.15 | … |
| Ecosystem | {d} | 0.15 | … |
| Risk | {d} | 0.15 | … |
| Strategic | {d} | 0.15 | … |

总分计算公式与扣分依据：{score 推导}

## 3. Findings（按 severity 排序）
### [CRITICAL] {hcr_id} · {title}
- Claim: {claim}
- Evidence: {evidence_draft}
- 证据状态: {verified|refuted|partial|unverifiable}（{confidence}）
- 来源: {sources}
- Patch 建议: {patch}

（HIGH / MEDIUM / LOW / INFO 同理）

## 4. Evidence 明细
| Finding | 状态 | 置信度 | 来源 | 备注 |
|---------|------|--------|------|------|
| {finding_id} | verified | high | {url} | {notes} |

## 5. Critical Critiques（按角色分组）
### Reviewer #2 / Principal Engineer / Security Auditor / …（按激活角色）
- {thesis} —— {reasoning}（引用 {unit/finding refs}，辣度 {spiciness}）
- …

### 认可点（recognition）
- {至少一条认可}

## 6. Degradations & Limits
- 工具缺失/降级记录：{degradations}
- 上下文裁剪说明：{sampled_out / skipped 单元}
- 本评审的已知局限：{limits}

## 7. Recommendation
- 行动建议（基于 decision 四问展开）
- 若 invest=false：给出条件（什么情况下值得重新考虑）

## 8. Appendix
- ReviewUnit 清单摘要（id / kind / title / tokens）
- API/校验调用记录（fetched_at / status）
- schema_version: {1.0}
```

## 渲染规则

1. 评分卡元素（分数/评级/一句话）必须出现在 §0 最顶部；
2. 每个维度分的「说明」列必须引用 finding/critique id，否则视为渲染缺陷；
3. Findings 为空时 §3 写「未发现显著问题（无发现模式）」并保留 §4 空表；
4. §6 必须如实：没有降级写「无」。
