# Changelog

## [1.1.0] - 2026-02-16

### Added
- **方法论背书（Methodology Reference → Operationalization）**：新增 `references/methodology.md`，将五本权威科研方法论（The Craft of Research 5th / Research Design 5th / How to Read a Paper / How to Write a Lot / English for Writing Research Papers）+ CS Reviewer Rubric 工程化为本 Skill 的评审规则，SKILL.md 增加「一·五 方法论背书」章节与 Operationalization 映射表。
- **权威书评/解读来源库**：新增 `references/authoritative-sources.md`，定义论文权威解读来源（arXiv / OpenReview / Papers with Code / Semantic Scholar / 官方仓库）与背书书籍的权威书评来源，统一引用格式 `[权威佐证: <来源> <url> — <结论>]`。
- **权威佐证铁律**：SKILL.md 执行规则增加「每条发现尽量挂权威佐证」；config.yaml 新增 `methodology` 与 `evidence_network` 配置段（联网核验为默认动作，对齐 S-12 Evidence-Agent）。
- **输出模板**：paper-audit / paper-autopsy / reviewer-report / blog-article 四模板增加「权威解读与佐证」区块。
- **文档体系**：新增 `docs/01-overview.md`，与 SKILL.md / README.md 构成三层文档（对齐 S-12 docs/ 结构）。

### Changed
- SKILL.md 输出模板章节说明所有模板（除 score-card 外）均含权威解读区块。

## [1.0.0] - 初始版本
- HOS-Paper-RedTeam 十步流水线、11 个 Agent、RVE 漏洞编号系统、毒舌风格控制、评分卡渲染、数据沉淀、自动化工作流。
