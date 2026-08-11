# HOS 方法论背书（Methodology Reference → Operationalization）

> 本 Skill 的评审规则不是 AI 自创的「看起来很专业」的清单，而是对通用科研方法论的工程化——对外可解释、有权威来源。背书结构对齐 S-12-HOS-Critic-Review：**权威方法论 → 可解释规则 → Skill → Workflow → AI 执行**。

## 一、背书书单（1 总纲 + 2 核心 + 2 专项 + 1 套审稿标准）

| 优先级 | 书/标准 | 定位 | 覆盖人群 |
|--------|---------|------|----------|
| ★★★★★ | **Booth, Colomb & Williams, *The Craft of Research*, 5th ed., University of Chicago Press, 2024** | 科研总纲 | 本/硕/博 |
| ★★★★★ | **Creswell & Creswell, *Research Design*, 5th ed., SAGE** | 研究设计 | 本/硕/博 |
| ★★★★★ | **S. Keshav, *How to Read a Paper*** | CS 论文三遍阅读法 | 本/硕/博 |
| ★★★★☆ | **Paul J. Silvia, *How to Write a Lot*** | 科研写作生产力 | 硕/博 |
| ★★★★☆ | **Adrian Wallwork, *English for Writing Research Papers*** (Springer) | 国际论文写作 | 硕/博 |
| ★★★★★ | **Conference/Journal Reviewer Rubric（CS 审稿标准）** | 同行评审判断标准 | 审稿/投稿 |

**官方来源**：
- The Craft of Research 5th — University of Chicago Press（官方定位：本科生到高级研究生/研究人员通用，已售百万册，第五版含生成式 AI 与研究伦理章节）：https://press.uchicago.edu/ucp/books/book/chicago/C/bo215874008
- Research Design 5th — SAGE（qualitative / quantitative / mixed methods 比较研究设计的经典教材，第五版含实验设计、统计功效、数据分析软件）：https://collegepublishing.sagepub.com/products/research-design-5-255675
- English for Writing Research Papers — Springer（最新版含 AI 辅助科研写作、AI 模拟同行评审、AI 局限性）：https://link.springer.com/book/9783032370884

## 二、核心方法论 → 本 Skill 落点（Operationalization）

### 2.1 The Craft of Research —— 研究总纲

研究不是「写论文」，是「什么才算研究」。总纲链路：

```
Topic → Problem → Question → Evidence → Argument → Contribution → Research Output
```

**本 Skill 落点**：
- Claim Analyzer（Agent 03）的证据纪律：「声称必须有证据支撑」= Craft of Research 的论证要求（Claim/Evidence/Gap 三元组即 Question→Evidence→Argument 的拆解版）。
- Research Miner（Agent 09）挖下一篇论文 = 从「未被回答的 Question」出发找 Gap，禁止凭空拍方向。
- 铁律「No Evidence No Criticism」直接来自本书的证据纪律。

### 2.2 Research Design —— 研究设计顺序

防止最常见病灶：**先决定方法，再硬找问题**。

```
正确：Research Question → Research Design → Method → Experiment → Evidence
错误：我会 LLM → 我做个 Agent → 找个 Benchmark → 写论文
```

**本 Skill 落点**：
- Experiment Auditor（Agent 04）新增检查点「Design-order」：论文先定方法后找问题（方法驱动而非问题驱动）必须点名（RVE-EVAL）。
- 审计「研究问题 → 设计 → 方法 → 实验 → 证据」顺序是否成立。

### 2.3 How to Read a Paper —— CS 论文三遍阅读法

| 遍 | 目的 | 看什么 |
|----|------|--------|
| 第一遍 | 值不值得读 | Title / Abstract / Intro / Section 标题 / Figures / Conclusion / References |
| 第二遍 | 作者怎么做 | Method / Experiment / Baseline / Evaluation |
| 第三遍 | **挑战它** | 数学 / 算法 / Implementation / Appendix / 实验细节 / **Hidden assumptions** |

**本 Skill 落点**：Paper Autopsy（Agent 08）与 Reviewer Simulator（Agent 07）的攻击向量 = 第三遍阅读法的工程化——`hidden-assumption` / `counterexample` 即「隐藏假设」「反例」攻击。读者 → Reviewer / Researcher 的转变正是本 Skill 的定位。

### 2.4 How to Write a Lot —— 写作生产力

写作是固定生产流程，不是「有灵感时写」。对应本 Skill 的 Blog/周报管线：

```
Research Queue → Reading Queue → Experiment Queue → Writing Queue → Submission Queue
```

**本 Skill 落点**：Blogger Agent（Agent 10）+ workflows/ 三档节奏 = 该队列思想的工作流化；输出不是一次性灵感，是可排期的生产流程。

### 2.5 English for Writing Research Papers —— 国际论文写作

按 Title / Abstract / Introduction / Methodology / Results / Discussion / Conclusion 结构写作。**本 Skill 落点**：Blogger Agent 公开内容与 research-idea.md 模板的写作检查清单；Research Miner 产出的下一篇论文方向需按此结构给出写作骨架。

### 2.6 CS Reviewer Rubric —— 同行评审标准

真正的 Peer Review 判断的是：

```
Novelty / Correctness / Technical Quality / Significance
/ Experimental Quality / Clarity / Reproducibility / Limitations
```

CS 学科细化（本 Skill 采用）：

```
Problem significance / Novelty / Technical soundness / Baseline quality
/ Dataset quality / Experimental design / Ablation / Statistical validity
/ Reproducibility / Code/data availability / Real-world relevance
```

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

1. 任何一条评审规则若可追溯到上表书籍/Rubric，在输出中用 `[背书: Craft of Research §证据纪律]` 之类的标注，不写「根据我们的经验」。
2. 评分卡/审稿报告的维度定义默认以 2.6 的 CS Reviewer Rubric 为准，规则冲突时 Rubric 优先。
3. 权威解读的引用来源见 `references/authoritative-sources.md`，与本文档配套使用。
