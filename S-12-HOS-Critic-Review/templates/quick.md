# Quick 报告模板（默认）

> 用途：评分卡置顶的快速可视化报告。结论先行，细节靠后。
> **注意**：模板定义报告**内容结构**；交付物默认渲染为单文件 HTML（`output_format: html`，`render-html.ts`），Markdown 形态仅作数据源/降级。

```text
================================================
 HOS-CRITIC-REVIEW · Quick
 Target: {title} ({type})
 Score: {score}/100  ·  {grade_label}

 Six Dimension:
   Technical   {d}  ████████░░
   Innovation  {d}  ██████░░░░
   Engineering {d}  █████████░
   Ecosystem   {d}  ████████░░
   Risk        {d}  ███████░░░
   Strategic   {d}  █████████░

 One-liner: {one_liner}
 Verdict: {verdict}

 Critical Findings (TOP 5):
   [HIGH]  {hcr_id}  {title}
   [MED]   {hcr_id}  {title}

 Decision: learn ✓/✗ · contribute ✓/✗ · invest ✓/✗ · research ✓/✗
 Degradations: {none | 列表}
================================================
```

## 渲染规则

1. 维度条宽度 10 格：`█` 数 = 维度分取整；
2. TOP 发现按 `severity` 排序，最多 5 条，附 `hcr_id`（已编号时）；
3. `Degradations` 无则写 `none`；有则逐条列出（降级不撒谎）；
4. 若对象为 `paper` 且模式 `academic`，改用 academic 模板，本模板不适用；
5. 评分卡之后可追加「一句话 TL;DR」与「TOP 问题」各一段（按需展开）。

## 数据来源

全部字段来自 `ReviewReport` JSON（[schemas/review-report.schema.json](../schemas/review-report.schema.json)）；渲染器**不得**新增或改写任何结论。
