# Paper Chunker · 论文切片规则

> 适用对象：`paper`（PDF / Markdown / 文本）。
> 执行者：宿主 LLM 按本规则切片（M1 无工具模式，直接处理文本）；M3 起可接 GROBID/PyMuPDF 解析链。

## 1. 核心原则

- 按论文**逻辑结构**切：章节是天然语义边界；
- Abstract 是 claim 密度最高的区域，**必须独立成单元**；
- 每单元保留页码/章节定位，供 Evidence 回溯。

## 2. 切片流程

### 2.1 有标题结构（Markdown/LaTeX/转写文本）

1. 识别章节标题：`#`/`##` 标题，或正则 `^(\d+(\.\d+)*)\s+[A-Z][\w\s]{2,60}$`、`^(Abstract|Introduction|Conclusion|References)$`；
2. 每章节一个单元（`kind: paper-section`），标题 = 章节名；
3. Abstract 独立成单元；
4. Figures/Tables 章节并入所在节（表格数据量大时独立为 `paper-figure-table` 单元）；
5. References 默认合为一个单元（需逐条核验时再拆）。

### 2.2 无标题结构（纯文本/扫描转写）

1. 按段落（空行分隔）切片（`kind: text-paragraph`）；
2. 段落 > 1000 tokens 按句号边界折半；
3. 连续小段落合并至 ≤ 2000 tokens。

## 3. 单元命名与 tags

| 章节 | 单元标题 | tags |
|------|----------|------|
| Abstract | Abstract | `claim-dense` |
| Introduction | 引言 | `motivation` |
| Related Work | 相关工作 | `baseline` |
| Method/Proposed | 方法 | `method` |
| Experiments | 实验 | `experiment` |
| Conclusion | 结论 | `conclusion` |
| References | 参考文献 | `reference` |

## 4. 参数默认值

| 参数 | 默认 |
|------|------|
| `unit_max_tokens` | 4000 |
| 段落折半阈值 | 1000 tokens |
| 章节标题正则 | `^(\d+(\.\d+)*)\s+[A-Z][\w\s]{2,60}$` + 常见英文章节名 |

## 5. 质量门槛

- Abstract 必须存在（缺失时记录为潜在 Finding：结构不完整）；
- 单元并集覆盖 ≥ 95%（扫描 PDF 转写损失须在 `degradations` 注明）；
- 全部单元带章节路径或页码范围。

## 6. 降级链

```
标题正则切片 → 段落切片 → 定长切分（1500/150）→ 整篇单单元
```

M3 起：PDF → GROBID → Section Tree → 本规则语义合并。
