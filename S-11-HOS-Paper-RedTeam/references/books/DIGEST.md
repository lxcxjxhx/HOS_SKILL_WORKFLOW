# 背书书籍提炼总结（Books Digest）

> 本文件是 `methodology.md` 背书书单的**真实内容提炼**。每本书标注「提炼依据」——`全文`（已下载精读）/ `官方目录+简介`（出版社页）/ `权威书评`（学术期刊）——杜绝把 AI 转述当背书。核验日期：2026-02-16。

## ① How to Read a Paper（S. Keshav）—— ✅ 全文已下载精读

**提炼依据**：`references/books/how-to-read-a-paper-keshav.pdf`（Stanford 官方托管，2007，3 页全文），文本版同目录 `.txt`。

**作者背景**（原文）：S. Keshav，David R. Cheriton School of Computer Science, University of Waterloo。

**核心主张（原文引述）**：
- 摘要原文："Researchers spend a great deal of time reading research papers. However, this skill is rarely taught, leading to much wasted effort. This article outlines a practical and efficient three-pass method for reading research papers."
- 三遍法原文定义："The first pass gives you a general idea about the paper. The second pass lets you grasp the paper's content, but not its details. The third pass helps you understand the paper in depth."

**第一遍（原文，5-10 分钟）**：
1. Carefully read the title, abstract, and introduction
2. Read the section and sub-section headings, but ignore everything else
3. Read the conclusions
4. Glance over the references, mentally ticking off the ones you've already read
- 结束时回答 **five Cs**：Category（什么类型论文？）/ Context（与哪些论文相关？）/ Correctness（假设是否成立？）/ Contributions（主要贡献？）/ Clarity（写得好吗？）

**第二遍（原文，约 1 小时）**：仔细看图/图表（轴标对吗？有 error bars 吗——统计显著性）、标记未读参考文献；审稿时评估"证据是否支撑主张"。结束时应能向他人复述论文主线（"summarize the main thrust of the paper, with supporting evidence"）。原文提醒："Common mistakes like these will separate rushed, shoddy work from the truly excellent."

**第三遍（原文，新手 4-5 小时，熟手约 1 小时）**：
- **核心是 virtual re-implementation（虚拟重实现）**："making the same assumptions as the authors, re-create the work. By comparing this re-creation with the actual paper, you can easily identify not only a paper's innovations, but also its hidden failings and assumptions."
- "identify and challenge every assumption in every statement"——挑战每个假设
- 结束时"should be able to pinpoint implicit assumptions, missing citations to relevant work, and potential issues with experimental or analytical techniques"——找出隐藏假设、缺失引用、实验/分析技术问题
- 原文明确："To fully understand a paper, particularly if you are a reviewer, requires a third pass."

**文献综述用法（原文 §3）**：Google Scholar/CiteSeer 找 3-5 篇近期论文 → 各做第一遍 → 读 related work → 找共享引用与重复作者（关键论文/关键研究者）→ 追踪顶会 → 两遍法读候选。

**关联文献（原文 References）**：T. Roscoe《Writing Reviews for Systems Conferences》；H. Schulzrinne《Writing Technical Articles》；G.M. Whitesides《Whitesides' Group: Writing a Paper》；S. Peyton Jones《Research Skills》。

**→ 本 Skill 落点（修正后）**：三遍法对应流水线——第一遍=Paper Hunter 筛选（five Cs 即候选判断标准）；第二遍=Claim Analyzer 复述；第三遍=Experiment Auditor + Reviewer Simulator 的攻击动作（virtual re-implementation 即"复现推演找隐藏假设"）。`hidden-assumption` 攻击向量有原文直接依据（"hidden failings and assumptions"）。

## ② The Craft of Research, 5th ed.（Booth, Colomb, Williams, Bizup & FitzGerald）—— ⚠ 付费书，提炼自官方目录+简介+权威书评

**提炼依据**：UChicago Press 官方页（ISBN 9780226826677，已核验 2026-02-16）+ Booklist 书评 + 完整目录。**无全文**（版权）。

**官方定位（原文引述）**："With more than a million copies sold since its first publication, The Craft of Research has helped generations of researchers at every level—from high-school students and first-year undergraduates to advanced graduate students to researchers in business and government... explains how to choose significant topics, pose genuine and productive questions, find and evaluate sources, build sound and compelling arguments, and convey those arguments effectively to others."
- 第 5 版新增：presentations 新章、gen AI 使用指南、扩展的 ethics 章

**目录核验（官方目录原文）**：
- Part I Asking Questions, Seeking Answers：Ch.1 From Topics to Questions → Ch.2 From Questions to a Problem
- Part II Sources and Resources：Ch.3 Finding and Evaluating Sources、Ch.4 Engaging Sources
- Part III Making Your Argument：Ch.5 Making Good Arguments、Ch.6 Making Claims、Ch.7 Assembling Reasons and Evidence、Ch.8 Warrants、Ch.9 Acknowledgments and Responses
- Part IV Delivering Your Argument：Ch.10-16（Planning and Drafting / Revising / Incorporating Sources / Communicating Evidence Visually / Introductions and Conclusions / Revising Style / Research Presentations）
- Part V：Ch.17 The Ethics of Research、Ch.18 Advice for Teachers

**权威书评（Booklist，官方页引述）**："While the underlying principles of research have changed little, its related sources, processes, and applications have changed significantly... What has not changed is the authors' overall approach to research: as a conceptual framework with generic practical advice."

**→ 本 Skill 落点（与目录对应）**：Topic→Problem→Question 链路 = Ch.1-2 的目录级对应（"From Topics to Questions / From Questions to a Problem"）；证据纪律 = Ch.7 Assembling Reasons and Evidence + Ch.8 Warrants；伦理 = Ch.17。⚠ 章节内容细节未读全文，仅目录级对应，引用时写「Ch.7（目录级）」不可写具体页码。

## ③ Research Design, 5th ed.（Creswell & Creswell）—— ⚠ 付费书，提炼自官方目录+简介+书评

**提炼依据**：SAGE 官方页（已核验 2026-02-16）。**无全文**。⚠ 注意 SAGE 已出版第 6 版。

**官方定位（原文引述）**："This best-selling text pioneered the comparison of qualitative, quantitative, and mixed methods research design." 第 5 版新增：power analysis（统计功效定样本量）、experimental and survey designs、质性与量化数据分析软件。

**目录核验（官方目录原文）**：
- Ch.1 The Selection of a Research Approach（Worldviews, Designs, and Methods 三组件）
- Ch.2 Review of the Literature
- Ch.3 The Use of Theory
- Ch.4 Writing Strategies and Ethical Consideration
- Ch.5 The Introduction / Ch.6 The Purpose Statement / **Ch.7 Research Questions and Hypotheses**（质/量/混合研究问题）
- Ch.8 Quantitative Methods（Surveys and Experiments）/ Ch.9 Qualitative Methods / Ch.10 Mixed Methods Procedures

**→ 本 Skill 落点（与目录对应）**：Research Question → Design → Method → Experiment 顺序 = Ch.1（方法选择）+ Ch.7（研究问题）的目录级对应；Experiment Auditor 的 Design-order 检查点（先定方法后找问题）对应 Ch.1 的"研究方法是研究问题之后的选择"。⚠ 仅目录级，未读全文。

## ④ How to Write a Lot（Paul J. Silvia, 2nd ed., APA）—— ⚠ 付费书，提炼自 Crossref + 权威学术书评

**提炼依据**：Crossref 书目记录（DOI 10.1037/0000109-000，2019 第 2 版）+ *Journal of Scholarly Publishing* 书评（DOI 10.1353/scp.2007.0030）。**无全文**。

**权威书评（Stephen K. Donovan, *Journal of Scholarly Publishing* 39(1): 351-355, 2007）**：该书作为 APA 的学术写作生产力指南出版，核心主张为「写作不是灵感驱动的活动，而是可管理的、有计划的日常习惯」——把写作从"等灵感"改为"固定日程"。

**→ 本 Skill 落点**：Blogger Agent + workflows/ 的队列化生产（Research/Reading/Experiment/Writing/Submission Queue）与该书"写作是流程而非灵感"主张一致。⚠ 书评级提炼，未读全文。

## ⑤ English for Writing Research Papers, 2nd ed.（Adrian Wallwork）—— ⚠ 付费书，提炼自 Crossref 章节元数据

**提炼依据**：Crossref 章节级记录（ISBN 9783031310720，2023，`English for Academic Research` 丛书）。**无全文**。

**章节核验（Crossref 章节元数据，节选）**：Titles；Abstracts: Particular types；Discussing your limitations；Clarifying and Highlighting；Automatic translation。该系列按论文结构（Title/Abstract/…/Discussion）逐章讲解，且新版含 AI/自动翻译相关内容（章节 "Automatic translation" 证实）。

**→ 本 Skill 落点**：Blogger Agent 与 research-idea.md 的写作骨架按论文结构组织。⚠ 章节级提炼，未读全文。

---

## 提炼结论（对 methodology.md 的修正要求）

1. **How to Read a Paper 升级为「全文级」背书**：新增精确原文（five Cs、virtual re-implementation、三遍时长、文献综述流程），并补充关联文献（Roscoe / Whitesides / Schulzrinne / Peyton Jones）作为拓展阅读。
2. **其余 4 本明确标注「目录级/书评级」**：任何输出引用不得写具体页码，只能写「Ch.7（目录级）」或「书评级主张」，违反即视为幻觉。
3. **Craft of Research 的第 5 版新增内容（presentations 章 / gen AI 指南 / ethics 扩展）已有官方页原文引述**，可作为版本差异背书。
4. 第 5 本（Wallwork）章节 "Automatic translation" 证实新版含 AI 写作内容，替换之前「AI 辅助写作」的未证实表述。
