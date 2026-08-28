# Changelog

## [1.3.2] - 2026-02-16

### Changed
- **背书原则收敛为「无全文 → 仅方向性垫背」**：methodology.md 背书验证机制重写——未读全文的书（除 How to Read a Paper 外全部）只允许方向性引用（书的方向/定位真实存在），禁止引用正文页码、论证细节、措辞。缺全文宁可少背书，不可假背书。
- 书单表 EWRP 版本补正为 3rd ed.（1.3.1 修正遗漏表格行）。

## [1.3.1] - 2026-02-16

### Added
- **官方 Front Matter 下载**：Springer 官方免费前言 PDF（`references/books/ewrp-frontmatter-springer.pdf` + 提取文本）——合法免费获取路径，非盗版。
- **English for Writing Research Papers 升级为「前言级」背书**：methodology.md §2.5 重写，官方前言原文引述（Part I Writing Skills 1-13 章 / Part II Writing a Paper 14-20 章 / 新增 ChatGPT 两章 / Ch.20 投稿 checklist）。

### Fixed
- **版本修正**：English for Writing Research Papers 官方前言版权页 "© 2011, 2016, 2023" 证实为**第三版**，此前误标 2nd ed. 已修正。
- EWRP 的 AI 内容描述从 Crossref 章节推断升级为官方前言原文（Ch.9-10 为 ChatGPT/机器翻译新章）。

## [1.3.0] - 2026-02-16

### Added
- **背书书籍提炼库**：新增 `references/books/`——`how-to-read-a-paper-keshav.pdf/.txt`（Stanford 官方全文，已精读）+ `DIGEST.md`（五本书真实内容提炼）。
- **How to Read a Paper 升级为全文级背书**：methodology.md §2.3 重写为原文精确内容（five Cs、virtual re-implementation、三遍时长、文献综述流程、关联文献），隐藏假设攻击向量获得原文直接依据。
- **引用级别标注**：methodology.md 各书章节标注 `✅全文级 / ⚠目录级 / ⚠书评级 / ⚠章节级`——付费书（Craft of Research / Research Design / How to Write a Lot / English for Writing）无合法全文，只允许目录/书评级引用，禁止编造页码。
- **权威书评**：How to Write a Lot 挂 *Journal of Scholarly Publishing* 39(1): 351-355, 2007（DOI 10.1353/scp.2007.0030，Stephen K. Donovan）——此前「APA 写作生产力经典」为无来源表述，现获学术书评背书。

### Fixed
- **修正无来源断言**：How to Write a Lot「写作是固定生产流程」原为自述，现标注书评级并挂书评；English for Writing Research Papers 的「新版含 AI 辅助写作」改为 Crossref 章节证据（Automatic translation 章节）。
- 版本更正：How to Write a Lot 明确为 2nd ed. 2019（原误写 2022）。

## [1.2.0] - 2026-02-16

### Added
- **HTML 渲染器**：新增 `src/render-html.ts`——单文件 HTML 评分卡（内联 CSS、评分 hero 区、维度进度条、毒舌点评、维度说明、建议、权威解读与佐证区，打印友好）。`src/index.ts` 支持 `--format md|html`，默认 html（对齐 S-12 的 output_format 默认值）。
- **背书验证机制**：`references/methodology.md` 重写——每本书带可核验锚点（ISBN/DOI/官方 URL）+ 核验日期 + 验证状态（✅已核验/⚠待核验），新增「背书验证铁律」（锚点三选一、区分核验状态、禁止二手转述、页码章节必须真实）。
- **背书核验方法**：`references/authoritative-sources.md` 新增 §三——出版社官方页 / Crossref API / Open Library API 三级核验流程，ISBN 查不到即视为幻觉禁止引用。

### Fixed
- **修正 AI 幻觉 ISBN**：原引用的《English for Writing Research Papers》ISBN `9783032370884`（link.springer.com/book/9783032370884）经 Crossref / Open Library 双重查证**不存在**，替换为真实 ISBN `9783031310713`（印刷）/ `9783031310720`（电子），DOI `10.1007/978-3-031-31072-0`（2023 第 2 版）。
- Research Design 注明 SAGE 已出版第 6 版（本 Skill 引用第 5 版，目录已核验）。

## [1.1.1] - 2026-02-16

### Added
- **Agent 级方法论落点**：11 个 Agent 定义文件（01–11）头部均增加「方法论落点」引用行，将 methodology.md 的映射直接落到每个 Agent——如 Experiment Auditor 挂 Research Design Design-order 检查点、Reviewer Simulator 挂 CS Reviewer Rubric 四维、Research Miner 挂 Craft of Research Topic→Problem→Question。至此方法论背书贯通 SKILL.md → references → agents 三层。

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
