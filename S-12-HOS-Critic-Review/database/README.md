# Review Store

评审记录持久化目录（Report-Agent 每次完成评审后写入）。由宿主按以下结构维护；文件不存在时创建，存在时追加/更新。

## 文件结构

| 文件 | 内容 | 用途 |
|------|------|------|
| `reviews.json` | 评审记录索引（report_id → 摘要） | 去重、追溯、历史查询 |
| `findings.json` | HCR-FIND 登记表 | 编号分配、统计、二次评审沿用 |
| `objects.json` | 对象档案（含历次评审历史） | 同一对象再次评审时沿用编号并对比趋势 |

## reviews.json 条目

```json
{
  "report_id": "rr-20260801-a1b2c3",
  "target": { "type": "article", "title": "…", "url": null },
  "score": 84,
  "grade": "A",
  "created": "2026-08-01T10:00:00Z",
  "object_id": "obj-3f2a9c",
  "findings_count": 3,
  "output_mode": "quick"
}
```

## findings.json 条目（详见 [references/hcr-find.md](../references/hcr-find.md)）

```json
{
  "hcr_id": "HCR-EVAL-2026-0007",
  "report_id": "rr-20260801-a1b2c3",
  "object_id": "obj-3f2a9c",
  "class": "EVAL",
  "severity": "HIGH",
  "title": "…",
  "evidence_status": "verified",
  "status": "open",
  "created": "2026-08-01"
}
```

## objects.json 条目

```json
{
  "object_id": "obj-3f2a9c",
  "type": "article",
  "source": "…",
  "reviews": ["rr-20260801-a1b2c3"],
  "findings": ["HCR-EVAL-2026-0007"]
}
```

## 规则

1. 每条评审必须写入 `reviews.json`；Findings 写入 `findings.json`；对象信息写入 `objects.json`；
2. 同一对象二次评审：沿用历史 HCR 编号，新发现追加（序号继续递增）；
3. 不存储 API Token、私钥或用户敏感信息（[docs/08-engineering.md](../docs/08-engineering.md) §8.8.3）；
4. 写入失败不阻断报告输出，`meta.store_status: "failed"` 记录。

## 当前状态

本目录为占位：M1 验收示例评审后将首次写入（见 `examples/`）。
