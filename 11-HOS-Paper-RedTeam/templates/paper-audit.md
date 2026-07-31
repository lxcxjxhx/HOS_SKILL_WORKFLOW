# 论文审计报告（完整十步）

> 适用：全流程审计。逐字段填写，不许自由发挥结构。

```yaml
rve_series: HOS-RVE-2026-NNNN      # 本报告分配到的首个编号
arxiv_id: ""
title: ""
authors: ""
venue: ""
submitted: ""
spiciness: 3
```

## 1. 元信息

| 字段 | 值 |
|------|----|
| arXiv ID | |
| 标题 | |
| 作者 / 机构 | |
| 会议 / 期刊 | |
| 提交日期 | |
| 声称开源 | 是 / 否 / 查不到 |

## 2. 营销浓度

```json
{ "hype_score": 0, "risk": "LOW/MEDIUM/HIGH", "hype_terms": [] }
```

## 3. 主张拆解

### Claim #1
- **声称**:
- **证据**:（哪个基准/表/实验）
- **范围限定**:
- **Gap**:

### Claim #2
...

## 4. 实验审计

```json
{ "experiment_score": 0, "issues": [], "score_note": "" }
```

## 5. 安全审计

```json
{ "security_issues": [] }
```

## 6. 复现评估

| 维度 | 结论 |
|------|------|
| 代码 | |
| 数据 | |
| 硬件/API 门槛 | |
| 参数 | |
| 复现难度 | ★★☆☆☆ |
| RVE | HOS-RVE-2026-NNNN (RVE-REPRO) |

## 7. 审稿模拟

```yaml
review:
  venue: ""
  novelty: 0
  technical: 0
  experiment: 0
  clarity: 0
  overall: 0
  decision: "Reject / Weak Reject / Weak Accept / Accept"
  key_concerns: []
  strengths: []
```

## 8. 论文尸检（鞭尸局正文）

> 引用 `templates/paper-autopsy.md`，以本报告 3-7 节为素材。

## 9. 研究机会

> 引用 `templates/research-idea.md`，由 Research Miner 产出。

## 10. 数据沉淀

- `database/paper.json` ← 本论文元数据
- `database/vulnerability.json` ← 本论文全部 RVE
- `database/research-gap.json` ← 研究机会
