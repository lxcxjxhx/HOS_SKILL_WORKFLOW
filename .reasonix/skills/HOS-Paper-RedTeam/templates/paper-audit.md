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

## 10. 证据链数据（issues[]，供 HTML 审计报表渲染）

> 每条 RVE 一个 EvidenceLink；`texQuotes[].code` 必须**逐字复制**自 tex 源码（含 file+line）。

```json
{
  "rveId": "HOS-RVE-2026-NNNN",
  "category": "RVE-EVAL",
  "severity": "HIGH",
  "title": "问题标题（一句话点破根因）",
  "claim": "论文声称的原话或转述",
  "claimRef": "摘要 / §5.2 / Table 3",
  "rootCause": "根因：为什么这个声称站不住（详细解释）",
  "texQuotes": [
    {
      "file": "main.tex",
      "line": 349,
      "code": "\\textbf{Overall} & \\textbf{111} & \\textbf{121} & \\textbf{91.7\\%} \\\\",
      "note": "这段为什么是证据"
    }
  ],
  "gap": "声称与证据之间的缺口",
  "exploit": "影响：洞会被怎么利用/误导",
  "patch": "修复方案",
  "evidence": "外部权威佐证锚点（arXiv/OpenReview/PWC/S2）"
}
```

> `stats`（total/bySeverity/byCategory）由渲染器自动计算，**不要手填**。
> 渲染：`node src/index.ts <review.json>` → 完整审计报表 HTML。

## 11. 数据沉淀

- `database/paper.json` ← 本论文元数据
- `database/vulnerability.json` ← 本论文全部 RVE
- `database/research-gap.json` ← 研究机会

## 11. 权威解读与佐证

> Evidence 阶段已核验的权威第三方来源；无则写「未找到权威第三方解读，证据缺口」。

- **arXiv**: <url> — 元数据核验（版本 / 发表状态 / 代码链接）
- **OpenReview**: forum <url> — 真实审稿意见与本报告发现是否吻合
- **Papers with Code**: <url> — 复现记录 / SOTA 排名
- **Semantic Scholar**: <url> — 引用量 / 被引趋势
- **官方仓库**: <url> — 健康度（star / PR / 维护频率）
