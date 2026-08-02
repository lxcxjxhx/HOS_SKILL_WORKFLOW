# Agent-07 · Report-Agent（模板渲染）

> 宿主在此步骤扮演**报告渲染师**。执行时间：1 次，流水线最后一步。

## 1. 角色定位

按输出模式（Quick / Expert / Academic）渲染人类可读报告，输出机器可读 JSON（ReviewReport），并把评审记录持久化到 Review Store。**只重组既有产物，禁止新增内容、禁止改变结论。**

## 2. 输入

全量产物 + `output_mode`（config.yaml 或用户指定）+ 输出通道。

## 3. 执行步骤

1. 组装 `ReviewReport` JSON（严格按 [schemas/review-report.schema.json](../schemas/review-report.schema.json)）；
2. 按模式套用模板渲染人类报告（[templates/](../templates/)）；
3. 校验 JSON 通过 Schema；
4. 写入 Review Store（[database/](../database/)）：`reviews.json`（索引）、`findings.json`（HCR-FIND 登记）、`objects.json`（对象档案）；
5. 输出：人类报告（默认 Quick 置顶评分卡）+ JSON。

## 4. 输出 `ReviewReport`

```json
{
  "schema_version": "1.0",
  "report_id": "rr-20260801-a1b2c3",
  "target": { "type": "article", "title": "…", "url": null },
  "score": { "score": 84, "grade": "A", "…": "SixDimScore 全量" },
  "findings": [ "…": "Finding[]（含 evidence_status/hcr_id）" ],
  "critiques": [ "…": "Critique[]" ],
  "degradations": [],
  "meta": { "duration_seconds": 120, "toolchain": { "network": false, "tools": [] }, "output_mode": "quick" }
}
```

## 5. 模板要点

| 模式 | 结构 | 模板 |
|------|------|------|
| `quick` | 评分卡 + TOP 发现 + 决策 | [templates/quick.md](../templates/quick.md) |
| `expert` | 执行摘要 + 六维 + Findings + Evidence + Critiques + 建议 | [templates/expert.md](../templates/expert.md) |
| `academic` | 论文决策 + Reviewer 总结 + 阻塞问题 + 修改建议 | [templates/academic.md](../templates/academic.md) |

**铁律**：无论哪种模式，评分卡（分数 + 一句话 + 维度条）必须出现在最顶部；长文靠后。

## 6. 质量门槛

- 人类报告非空；JSON 通过 Schema 校验（`schema_version` = "1.0"）；
- 报告每个结论能回溯到 finding/ev/crit id；
- Review Store 写入成功后才算流水线完成；
- `degradations` 原样透传（降级不撒谎）。

## 7. 降级

- Store 写入失败：仍输出报告与 JSON，`meta` 记录 `store: "failed"`；
- 模板不可用：退化为结构化 Markdown 列表（分数 → 发现 → 决策）。
