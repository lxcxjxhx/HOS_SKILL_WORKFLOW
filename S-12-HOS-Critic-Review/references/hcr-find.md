# HCR-FIND 编号体系

> 发现编号体系，全系统独立自建。所有正式 Findings 必须登记编号后才能进入报告输出。

## 1. 编号格式

```
HCR-<CLASS>-YYYY-NNNN
例：HCR-EVAL-2026-0007
```

- `CLASS`：`ARCH | DATA | EVAL | SEC | REPRO | LIC | ECO | CLAIM`
- `YYYY`：发现年份
- `NNNN`：**对象内**按发现顺序递增（0001 起）

对象间唯一性由 `report_id + finding_id` 保证；编号用于人类可读追溯。

## 2. 分类定义

| class | 含义 | 典型 |
|-------|------|------|
| `ARCH` | 架构/方法问题 | 拼接物、无新技术迭代、设计缺陷 |
| `DATA` | 数据问题 | 样本量、来源、污染、硬编码 |
| `EVAL` | 实验/指标问题 | 无基线、选择性报告、画靶射箭 |
| `SEC` | 安全问题 | 注入、泄漏、越权、依赖漏洞 |
| `REPRO` | 复现/落地问题 | 闭源、缺参数、文档缺失 |
| `LIC` | 许可/合规问题 | 许可证冲突、商用风险 |
| `ECO` | 生态/活跃度问题 | 无维护、issue 积压、star 异常 |
| `CLAIM` | 主张夸大 | 营销浓度、概念包装 |

## 3. 严重度

`CRITICAL`（结论整体失效）> `HIGH`（显著削弱）> `MEDIUM`（部分受限）> `LOW`（影响有限）> `INFO`（事实备注）。

## 4. 分配规则

1. Analyzer 产出 Finding 时给临时 `finding_id`；Evidence 校验后由 Report-Agent 正式编号；
2. 同一对象按发现顺序递增，跨类混排；
3. 被 Evidence 证伪（`refuted`）的发现保留编号，标记 `status: "refuted"`；
4. 登记表持久化到 `database/findings.json`；同一对象二次评审沿用历史编号并追加新发现。

## 5. 登记表条目

```json
{
  "hcr_id": "HCR-EVAL-2026-0007",
  "report_id": "rr-20260801-a1b2c3",
  "object_id": "obj-3f2a9c",
  "class": "EVAL",
  "severity": "HIGH",
  "title": "无 SOTA 基线：仅与弱基线对比",
  "claim": "…",
  "evidence_status": "verified",
  "evidence_sources": ["…"],
  "unit_refs": ["unit-003"],
  "patch": "补充与 ≥2 个近年 SOTA 的对比表",
  "status": "open",
  "created": "2026-08-01"
}
```

## 6. 统计口径

`database/findings.json` 支持按 `class / severity / status` 聚合：分类分布、严重度占比、高频问题 TOP10、对象间横向对比。
