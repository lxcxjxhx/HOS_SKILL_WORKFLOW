# Academic 报告模板（论文审稿决策）

> 用途：`paper` 对象的审稿决策报告（Accept / Weak Accept / Weak Reject / Reject）。

```markdown
# HOS-CRITIC-REVIEW · Academic Decision

Target: {title}（{venue}, {year}）
Decision: {Weak Accept | Accept | Weak Reject | Reject}
Score: {score}/100 · {grade_label}

## 0. 评分卡（置顶）
- One-liner: {one_liner}
- Six Dimension: Technical {d} · Innovation {d} · Engineering {d} · Ecosystem {d} · Risk {d} · Strategic {d}

## 1. Reviewer Summary（按 Critic 角色）
### Reviewer #2
- 核心问题：{…}
- 建议：{…}
### Experiment Auditor
- 实验与基线问题：{…}
### Security Auditor（如激活）
- 安全问题：{…}

## 2. Critical Blocking Issues（导致不升级的 TOP 问题）
1. [CRITICAL/HIGH] {hcr_id} · {title} —— {一句话证据}
2. …

## 3. Strengths（至少 1 条）
- {认可点}

## 4. Suggested Revision（可复现修改清单）
- [ ] {针对每条 blocking issue 的 patch 建议}
- [ ] {实验补全建议：基线/消融/统计}

## 5. Decision Rationale
- 评分推导：{score 依据}
- 决策边界：什么条件下会升级/降级（如「补 SOTA 对比后可 Weak Accept」）
```

## 渲染规则

1. 决策四档：`Accept` / `Weak Accept` / `Weak Reject` / `Reject`，由 Score 与 blocking issues 综合：
   - Score ≥ 85 且无 CRITICAL verified → Accept
   - Score 70-84 且无 CRITICAL verified → Weak Accept
   - Score 60-69 或存在 1 条 CRITICAL verified → Weak Reject
   - 其余 → Reject
2. §3 Strengths 不可为空（毒舌文档不能纯喷）；
3. §4 修改清单逐条对应 blocking issue 的 patch。
