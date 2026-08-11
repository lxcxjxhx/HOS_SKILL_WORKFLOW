# HOS 方法论背书（Methodology Reference → Operationalization）

> 本 Skill 的评审规则不是 AI 自创的「看起来很专业」的清单，而是对通用科研方法论的工程化——对外可解释、有权威来源。背书结构对齐 S-12-HOS-Critic-Review：**权威方法论 → 可解释规则 → Skill → Workflow → AI 执行**。

## ⚠ 背书验证机制（防 AI 幻觉，先读这条）

**每本书的引用必须可核验**，遵守以下铁律：

1. **每条背书必须带锚点**：ISBN / DOI / 官方出版社 URL 三选一，禁止只写书名就声称「官方介绍明确说明……」。锚点需亲自访问核验（访问方式见 `references/authoritative-sources.md` §三）。
2. **区分「已核验」与「待核验」**：下表 `✅ 已核验（<日期>）` = 官方页面/DOI 已实际访问确认；任何未亲自核验的声明一律标注 `⚠ 待人工核验`，禁止假装查证过。
3. **禁止转述二手来源当背书**：别人（含 AI）对书的总结、书单推荐、二手书评不构成背书。背书只认出版社官方页面 / DOI 记录 / 作者原文。
4. **引用页码/章节必须真实**：引用的章节号必须来自官方目录（见下表「目录核实」列），引不到就写「章节号待核实」，禁止编造。
5. 发现背书错误（如 ISBN 不存在）→ 立即修正并更新 CHANGELOG，向用户说明。

## 一、背书书单（1 总纲 + 2 核心 + 2 专项 + 1 套审稿标准）

| 优先级 | 书/标准 | 定位 | 锚点（已验证） | 覆盖人群 |
|--------|---------|------|----------------|----------|
| ★★★★★ | **Booth, Colomb, Williams, Bizup & FitzGerald, *The Craft of Research*, 5th ed., University of Chicago Press, 2024** | 科研总纲 | ISBN 9780226826677 · ✅ 官方页已核验 2026-02-16 | 本/硕/博 |
| ★★★★★ | **Creswell & Creswell, *Research Design*, 5th ed., SAGE** | 研究设计 | ✅ SAGE 官方页已核验 2026-02-16（**注：SAGE 已出版第 6 版**） | 本/硕/博 |
| ★★★★★ | **S. Keshav, *How to Read a Paper*** | CS 论文三遍阅读法 | ✅ Stanford 官方 PDF 已核验 2026-02-16（2007 版） | 本/硕/博 |
| ★★★★☆ | **Paul J. Silvia, *How to Write a Lot: A Practical Guide to Productive Academic Writing*, 2nd ed., APA, 2019** | 科研写作生产力 | DOI 10.1037/0000109-000 · ✅ Crossref 已核验 2026-02-16 | 硕/博 |
| ★★★★☆ | **Adrian Wallwork, *English for Writing Research Papers*, 2nd ed., Springer, 2023** | 国际论文写作 | DOI 10.1007/978-3-031-31072-0 · ISBN 9783031310720 · ✅ Crossref 已核验 2026-02-16 | 硕/博 |
| ★★★★★ | **Conference/Journal Reviewer Rubric（CS 审稿标准）** | 同行评审判断标准 | 非书籍，为领域通行实践（见 §2.6 来源说明） | 审稿/投稿 |

> **2026-02-16 核验发现并修正**：原稿引用《English for Writing Research Papers》的 ISBN `9783032370884` **不存在**（AI 幻觉）。经 Crossref 与 Open Library 双重查证，真实 2023 版为 ISBN `9783031310713`（印刷）/ `9783031310720`（电子），DOI `10.1007/978-3-031-31072-0`。早期版本：2011 版 DOI `10.1007/978-1-4419-7922-3`、2016 版 DOI `10.1007/978-3-319-26094-5`。已全部修正。

## 二、核心方法论 → 本 Skill 落点（Operationalization）

### 2.1 The Craft of Research —— 研究总纲（⚠ 目录级背书，无全文）

研究不是「写论文」，是「什么才算研究」。**引用级别：官方目录 + 官方简介 + 权威书评**（付费书无合法全文，提炼见 `references/books/DIGEST.md` §②）。**官方目录核实**（UChicago Press 页面 2026-02-16）：Part I「Asking Questions, Seeking Answers」= Ch.1 From Topics to Questions → Ch.2 From Questions to a Problem；Part III「Making Your Argument」= Ch.6 Making Claims / Ch.7 Assembling Reasons and Evidence / Ch.8 Warrants；Part V Ch.17 The Ethics of Research；并含「Using Generative Artificial Intelligence」Quick Tip。官方简介原文确认销量超百万册、面向高中生到资深研究者；第 5 版新增 presentations 章、gen AI 指南、ethics 扩展。

**本 Skill 落点**：
- Claim Analyzer（Agent 03）的证据纪律：「声称必须有证据支撑」= Craft of Research Ch.6/Ch.7 的论证要求（Claim/Evidence/Gap 三元组即 Question→Evidence→Argument 的拆解版）。
- Research Miner（Agent 09）挖下一篇论文 = Ch.1/Ch.2 从「未被回答的 Question」出发找 Gap，禁止凭空拍方向。
- 铁律「No Evidence No Criticism」直接来自本书 Ch.7 的证据纪律。

### 2.2 Research Design —— 研究设计顺序（⚠ 目录级背书，无全文）

防止最常见病灶：**先决定方法，再硬找问题**。**引用级别：官方目录 + 简介**（付费书无合法全文，提炼见 `references/books/DIGEST.md` §③）。**官方目录核实**（SAGE 页面 2026-02-16）：Ch.1 The Selection of a Research Approach、Ch.7 Research Questions and Hypotheses、Ch.8 Quantitative Methods、Ch.9 Qualitative Methods、Ch.10 Mixed Methods Procedures；第五版新增 power analysis（统计功效确定样本量）、实验与调查设计覆盖。

```
正确：Research Question → Research Design → Method → Experiment → Evidence
错误：我会 LLM → 我做个 Agent → 找个 Benchmark → 写论文
```

**本 Skill 落点**：
- Experiment Auditor（Agent 04）新增检查点「Design-order」：论文先定方法后找问题（方法驱动而非问题驱动）必须点名（RVE-EVAL）。
- 审计「研究问题 → 设计 → 方法 → 实验 → 证据」顺序是否成立。

> ⚠ 已知更新：SAGE 已出版 **Research Design 第 6 版**（J. David Creswell 与新合著者）。本 Skill 引用第 5 版内容（已核验目录），若需第 6 版差异需另行核对官方页。

### 2.3 How to Read a Paper —— CS 论文三遍阅读法（✅ 全文级背书）

**全文已下载精读**：`references/books/how-to-read-a-paper-keshav.pdf`（Stanford 官方托管，2007，3 页全文），提炼见 `references/books/DIGEST.md` §①。以下为原文精确内容：

| 遍 | 时长（原文） | 动作（原文） | 产出 |
|----|------|------------|------|
| 第一遍 | 5-10 分钟 | 读 title/abstract/intro、只读章节标题、读结论、扫参考文献 | 回答 **five Cs**：Category（论文类型）/ Context（相关论文与理论）/ Correctness（假设是否成立）/ Contributions（主要贡献）/ Clarity（是否好写） |
| 第二遍 | 约 1 小时 | 仔细读图表、标注未读引用；审稿时评估「证据是否支撑主张」 | 能向他人复述论文主线 |
| 第三遍 | 新手 4-5 小时，熟手约 1 小时 | **virtual re-implementation（虚拟重实现）**：以作者假设重造工作，对比原论文 | 找出 innovations / hidden failings / assumptions；原文："identify and challenge every assumption in every statement" |

原文明确："To fully understand a paper, particularly if you are a reviewer, requires a third pass."——**审稿必须第三遍**，这正是本 Skill 的定位依据。第三遍产出（原文）：implicit assumptions（隐藏假设）、missing citations（缺失引用）、potential issues with experimental or analytical techniques（实验/分析方法问题）。

原文还给出**文献综述流程**（§3）：搜索引擎找 3-5 篇 → 各做第一遍 → 读 related work → 找共享引用与重复作者（关键论文/研究者）→ 追踪顶会。可映射 Research Miner 的文献调研。

**本 Skill 落点**：第一遍 = Paper Hunter（Agent 01）筛选标准（five Cs）；第二遍 = Claim Analyzer（Agent 03）复述；第三遍 = Experiment Auditor（Agent 04）+ Reviewer Simulator（Agent 07）的攻击动作——`hidden-assumption` 攻击向量有原文直接依据（"hidden failings and assumptions"）。

### 2.4 How to Write a Lot —— 写作生产力（⚠ 书评级背书，无全文）

APA 第 2 版（DOI 10.1037/0000109-000，2019）。**引用级别：Crossref 书目 + 权威学术书评**（付费书无合法全文，提炼见 `references/books/DIGEST.md` §④）。权威书评：Stephen K. Donovan, *Journal of Scholarly Publishing* 39(1): 351-355, 2007（DOI 10.1353/scp.2007.0030）。核心主张（书评级）：写作不是灵感驱动的活动，而是可管理、有计划的日常习惯。**本 Skill 落点**：Blogger Agent（Agent 10）+ workflows/ 三档节奏 = 该队列思想的工作流化（Research Queue → Reading Queue → Experiment Queue → Writing Queue → Submission Queue）；输出不是一次性灵感，是可排期的生产流程。

### 2.5 English for Writing Research Papers —— 国际论文写作（⚠ 章节级背书，无全文）

Springer 2023 第 2 版（DOI 10.1007/978-3-031-31072-0，`English for Academic Research` 丛书）。**引用级别：Crossref 章节元数据**（付费书无合法全文，提炼见 `references/books/DIGEST.md` §⑤）。Crossref 章节记录证实：Titles / Abstracts: Particular types / Discussing your limitations / Clarifying and Highlighting / **Automatic translation**（含 AI 自动翻译内容，证实新版覆盖 AI 写作）。按论文结构逐章讲解。**本 Skill 落点**：Blogger Agent 公开内容与 research-idea.md 模板的写作检查清单；Research Miner 产出的下一篇论文方向需按此结构给出写作骨架。

### 2.6 CS Reviewer Rubric —— 同行评审标准（非书籍，领域通行）

真正的 Peer Review 判断的是：`Novelty / Correctness / Technical Quality / Significance / Experimental Quality / Clarity / Reproducibility / Limitations`。CS 学科细化（本 Skill 采用）：`Problem significance / Novelty / Technical soundness / Baseline quality / Dataset quality / Experimental design / Ablation / Statistical validity / Reproducibility / Code/data availability / Real-world relevance`。

**来源说明**：该清单是 CS 顶会（NeurIPS / ICML / ICLR / S&P / USENIX Security）通行审稿标准的凝练，非单一书籍。核验方式：对照顶会公开 reviewer 指南 / OpenReview 实际审稿意见（见 `references/authoritative-sources.md`），不可核验的部分标注待查。

**本 Skill 落点**：
- Reviewer Simulator（Agent 07）的评分维度（Novelty / Technical / Experiment / Clarity）与 decision 映射 = 该 Rubric 的工程化。
- Score Model（references/score-model.md）的六维/五维评分 = Rubric 的可计算版本，每个维度分必须引用 RVE 证据（`No Evidence No Scoring`）。
- 比「读懂论文」高一个层级：本 Skill 不是阅读器，是评审器。

## 三、Research Operating Framework（统一科研框架）

不重复造「大科研 Agent」，把上述方法论抽象为与 HOS 兼容的框架层：

```
                    RESEARCH
                       │
          ┌────────────┴────────────┐
          │                         │
       QUESTION                  EVIDENCE
          │                         │
   ┌──────┼──────┐           ┌──────┼──────┐
   │      │      │           │      │      │
 Problem Gap  Novelty      Data  Method  Experiment
   │      │      │           │      │      │
   └──────┼──────┘           └──────┼──────┘
          │                         │
          └──────────┬──────────────┘
                     ↓
                ARGUMENT
                     ↓
               CONTRIBUTION
                     ↓
                  PAPER
                     ↓
                 REVIEW
                     ↓
                REVISION
```

对应 HOS 生态分层：

```
HOS
├── Research Method Layer    ← 本 Skill（Question / Reading / Review / Gap / Design / Writing）
├── Knowledge Layer          ← database/（Papers / RVE 登记 / Research Gap）+ references/
└── Execution Layer          ← sources/（Search）+ workflows/（Read/Compare/Write/Submit）
```

**不绑定模型**：方法论层可人工执行，AI 只是执行器。

## 四、三级兼容（本科 → 硕士 → 博士）

底层方法不变，只改变深度：

| 阶段 | 使用方式 |
|------|----------|
| 本科 | 论文阅读、毕业论文、选题（看懂 → 总结 → 找问题） |
| 硕士 | 文献综述、Research Gap、实验设计、投稿（比较 → 找 Gap → 问题 → 实验） |
| 博士 | Research Question、Novelty、Theory、长期 Research Program（Landscape → Problem → Hypothesis → Theory/Method → Evidence → Contribution → Agenda） |

## 五、背书使用铁律

1. 任何一条评审规则若可追溯到上表书籍/Rubric，在输出中用 `[背书: Craft of Research §7 证据纪律]` 之类的标注，不写「根据我们的经验」。
2. 评分卡/审稿报告的维度定义默认以 2.6 的 CS Reviewer Rubric 为准，规则冲突时 Rubric 优先。
3. 权威解读的引用来源见 `references/authoritative-sources.md`，与本文档配套使用。
4. **背书声明必须能回答「你怎么知道的？」**——锚点（ISBN/DOI/URL）+ 核验日期 + 验证状态三要素缺一不可；答不上来就标「待核验」，宁可少背书不可假背书。
