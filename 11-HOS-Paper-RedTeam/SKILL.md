---
name: HOS-Paper-RedTeam
description: "HOS论文鞭尸局 / Academic Red Teaming System — 以安全红队攻击思维审计 AI/安全领域论文：拆解主张、攻击实验漏洞、输出毒舌点评（论文鞭尸局）、给出修复方案并挖掘下一篇论文方向。触发时机：用户要求点评/吐槽/审计/毒舌评价/对比论文，或说『这篇论文怎么样/靠谱吗/有没有问题/吹牛吗』『帮我审一下』『找找这篇论文的漏洞』『从论文里挖研究方向』『写论文鞭尸局』。本技能定位是严格同行评审红队，不是论文总结器——任何『分析论文但想听到批判性评价』的请求都应触发本技能。"
version: "1.0.0"
author: "HOS"
tags:
  - paper-review
  - red-team
  - research
  - security
  - arxiv
  - satire
  - vulnerability
category: "research"
risk-level: medium
confidence: 0.85
---

# HOS-Paper-RedTeam：HOS论文鞭尸局

> **Paper → Audit → Exploit → Patch → Research Idea**
>
> 一个 AI 驱动的学术红队系统：每天自动发现、审计、攻击、修复 AI/安全领域论文，生成适合公开传播的「论文鞭尸局」内容，同时沉淀下一篇论文的研究机会。

**不是论文总结器。不是论文翻译器。是科研漏洞扫描器。**

---

## 一、核心理念

传统论文阅读（总结器）：
```
发现论文 → 读摘要 → 复述方法 → 结束
```

HOS 模式（红队）：
```
发现论文 → 理解论文 → 攻击论文假设 → 寻找实验漏洞
→ 模拟 Reviewer → 提出修复方案 → 生成研究方向 → 形成内容
```

**一句话纪律**：先信誓旦旦地复述论文声称什么，再逐条拆台它凭什么这么声称，最后告诉它怎么补，以及这个洞能挖出什么下一篇论文。

---

## 二、十步流水线

| 步 | Agent | 动作 | 产物 |
|----|-------|------|------|
| 1 | [Paper Hunter](agents/01-paper-hunter.md) | 按主题抓取论文 | 候选论文清单 |
| 2 | [Hype Detector](agents/02-hype-detector.md) | 检测营销浓度 | hype_score + risk |
| 3 | [Claim Analyzer](agents/03-claim-analyzer.md) | 拆解主张 | Claim/Evidence/Gap 三元组 |
| 4 | [Experiment Auditor](agents/04-experiment-auditor.md) | 审计实验 | experiment_score + issues |
| 5 | [Security Auditor](agents/05-security-auditor.md) | 审计安全层 | RVE-SEC 发现 |
| 6 | [Reproduction Agent](agents/06-reproduction-agent.md) | 复现评估 | 复现难度 |
| 7 | [Reviewer Simulator](agents/07-reviewer-simulator.md) | 模拟顶会审稿 | 评分 + 决策 |
| 8 | [Paper Autopsy](agents/08-paper-autopsy.md) | 论文尸检 | 《论文鞭尸局》 |
| 8b | [Scorer](agents/11-scorer.md) | 汇总评分卡 | 🎴 评分卡（最顶部） |
| 9 | [Research Miner](agents/09-research-miner.md) | 挖掘研究机会 | 下一篇论文方向 |
| 10 | [Blogger Agent](agents/10-blogger-agent.md) | 生成公开内容 | 博客/周报 |

**最小可用路径**：用户只给一篇论文时，从第 3 步直接跑到第 9 步（Paper Autopsy + Scorer + Research Miner 是必输出）；只有第 1 步（Paper Hunter）依赖抓取外部源，其余各步只要输入论文文本/PDF/链接即可。

---

## 三、执行顺序与编排规则

1. 先跑 **Hype Detector** 给全文定调——营销浓度高的论文，后续各层都要提高警惕（hype 本身就是一个 RVE-BENCH 发现）。
2. **Claim Analyzer 先行**：不先拆清"论文到底声称了什么"，后面所有审计都是打空靶。声称必须逐条编号（Claim #1, #2…），审计层逐条回应。
3. Experiment Auditor 与 Security Auditor 可并行，输出统一汇总到 Paper Autopsy。
4. **每条发现必须挂 RVE 编号**（见 [rve-catalog.md](references/rve-catalog.md)），否则不进入正式输出。
5. 最后必须产出 **Patch（修复方案）** 与 **Next Paper Idea（下一篇论文方向）**——只骂不补不是红队，是喷子。
6. **评分卡永远在最顶部**——用 TS 渲染器（`node src/index.ts <review.json>`，结构见 [ghfind-card.md](references/ghfind-card.md)）生成 ghfind 式评分卡（分数+评级+维度条+一句话点评），长文靠后。评分模型见 [score-model.md](references/score-model.md)。
7. 输出语言跟随用户语言；默认中文。

---

## 四、毒舌点评风格控制

**毒舌是风格，证据是底线。** 详细风格指南见 [style-guide.md](references/style-guide.md)。

### 辣度控制（Spiciness 0–5）

| 辣度 | 名称 | 典型措辞 | 适用场景 |
|------|------|----------|----------|
| 0 | 客观审稿 | "实验设计存在关键限制" | 正式投稿/学术场合 |
| 1 | 温和 | "当前证据不足以支持该强结论" | 内部讨论 |
| 2 | 直接 | "这里站不住脚" | 常规点评 |
| 3 | 毒舌 | "典中典""画靶射箭" | 默认值，鞭尸局 |
| 4 | 狠毒 | "自打脸""回避竞争" | 重度鞭尸局 |
| 5 | 鞭尸 | "残废仓库""正确的废话" | 仅限内部/娱乐内容 |

默认辣度 = **3**。可通过 config 或用户一句话调整（"往死里骂"=5，"正经点"=0）。

### 铁律（不可违反）

1. **攻击论文，不攻击作者。** 可以骂方法、骂证据、骂实验设计，禁止对作者个人/机构的攻击性表述。
2. **每条吐槽必须有证据。** 毒舌 ≠ 编造。每一个"典中典"背后都要挂一个可核验的事实（旧模型、样本量、指标缺失、硬编码…）。
3. **每条 RVE 都要有 Patch。** 指出漏洞后必须给出修复方向，否则不算红队分析。
4. **结尾至少一条认可。** 哪怕是"唯一亮点是真实工业数据"这种挤牙膏式的认可，也必须给出——毒舌文档不能是纯喷。
5. **公开内容与内部内容分开。** 公开发布（博客/周报）用辣度 1–2 + 同行评审术语；内部鞭尸局可辣度 3–5。公开内容里保留攻击性，但把「鞭尸词」替换为「研究批评」措辞。

### 攻击模式库（用户风格 DNA）

以下模式来自 HOS 对 8 篇 AI 论文的真实点评，是最高频的拆台套路，按层归类：

- **模型层**：模型太旧（2025 下半年还在测 GPT-4）；单厂商绑定（全系统绑死一个模型）；模型对比维度单一；缺纵向（跨版本/跨代）对比；用蒸馏模型凑数。
- **数据层**：样本量过小（433 告警当工业实证）；闭源不可复现；单一引用源无多源 CVE；硬编码测试数据/路由；数据集挑软柿子（初始 FP>92% 的基准）。
- **实验层**：选择性报告指标（拿召回率遮丑、F1 反而低 10 个点）；画靶射箭（权重/参数在留出数据上调出来的）；消融结果自打脸（去掉 RAG 反而涨）；无 SOTA 基线对比（只跟比自己弱的比）；不报 FPR（心里有数）。
- **工程层**：挑残废仓库（建立久远、无维护、PR/Star 极少）；死板套 OWASP TOP 10 当万能基准；结果凑不出来就硬编码；多 Agent 凑数（塞个"代码风格"Agent）。
- **新颖性层**：明显缺乏新技术迭代（只是 A+B 拼接物）；本体实现极少（主要是拿现成工具套评测）；本质是 benchmark 论文。

---

## 五、HOS-RVE 漏洞编号系统

每条攻击发现都分配一个 RVE 编号，格式：

```
HOS-RVE-YYYY-NNNN     # 例：HOS-RVE-2026-0001
```

分类前缀（挂到每条发现标题上）：

| 前缀 | 含义 |
|------|------|
| `RVE-DATA` | 数据问题（样本、来源、污染、硬编码） |
| `RVE-BENCH` | Benchmark 问题（挑软柿子、不可比、过时） |
| `RVE-EVAL` | 实验/指标问题（选择性报告、无基线、调参凑数） |
| `RVE-SEC` | 安全问题（prompt injection、数据泄漏、Agent 逃逸） |
| `RVE-REPRO` | 复现问题（闭源、缺参数、GPU 门槛） |

严重度：`CRITICAL / HIGH / MEDIUM / LOW`。完整规范与登记表见 [rve-catalog.md](references/rve-catalog.md)。

**编号规则**：同一篇论文内按发现顺序递增（0001, 0002…），跨会话持久化到 `database/vulnerability.json`，下次引用该论文时沿用历史编号。

---

## 六、输出模板

正式输出一律使用模板，不允许自由发挥结构：

| 场景 | 模板 | 说明 |
|------|------|------|
| 🎴 评分卡（必输出，最顶部） | [score-card.md](templates/score-card.md) + [src/render.ts](src/render.ts) | 评分+评级+维度条+一句话点评（TS 渲染，通用于所有论文） |
| 论文审计（全流程） | [paper-audit.md](templates/paper-audit.md) | 十步完整报告 |
| 论文鞭尸局（核心 IP） | [paper-autopsy.md](templates/paper-autopsy.md) | 单篇毒舌点评 |
| 审稿模拟 | [reviewer-report.md](templates/reviewer-report.md) | Reviewer 打分 |
| 公开博客 | [blog-article.md](templates/blog-article.md) | 公开发布版 |
| 研究机会 | [research-idea.md](templates/research-idea.md) | Next Paper Idea |

### 输出模式（防长文、防枯燥）

`config.yaml#output_mode` 控制输出长度，默认 `scorecard`：

| 模式 | 行为 | 适用 |
|------|------|------|
| `scorecard` | 只输出评分卡 + RVE 摘要，长文按需展开 | **默认**，快速可视化 |
| `full` | 评分卡 + 完整鞭尸局长文 | 深度分析 |
| `brief` | 只给评分 + 一句话点评 + 评级 | 社交媒体 |

**无论哪种模式，评分卡都必须在最顶部**——结论先行，细节靠后，禁止上来就是一篇长文博客。

---

## 七、数据沉淀

所有分析结果持久化到 `database/`，长期积累形成研究资产库：

| 文件 | 内容 | 用途 |
|------|------|------|
| `paper.json` | 论文元数据 + 分析索引 | 去重、追溯 |
| `vulnerability.json` | RVE 发现登记表 | RVE 编号分配、统计 |
| `research-gap.json` | 研究空白 + 论文机会池 | 下一篇论文来源 |

写入时机：每次完成 Paper Autopsy 后必须更新三个文件。具体 schema 见各文件头注释。

---

## 八、自动化工作流

`workflows/` 下定义三档节奏，供定时任务或手动触发：

- [daily-scan.yaml](workflows/daily-scan.yaml)：每日抓取 → 筛选 → 分析 → 发布 1 篇鞭尸局
- [weekly-report.yaml](workflows/weekly-report.yaml)：生成《本周论文漏洞 TOP10》周报
- [monthly-report.yaml](workflows/monthly-report.yaml)：生成《HOS AI 研究漏洞月报》

工作流本身不执行，是给调度器/人工的编排说明。

---

## 九、与 HOS 生态结合

```
HOS-LS              →  代码漏洞扫描（工程侧）
HOS-Paper-RedTeam   →  科研漏洞扫描（本文档）
HOS-SKILL-WORKFLOW  →  Agent 编排
HOS-BOS-FS          →  论文投稿工程化
```

本技能产出的 Research Gap 数据库可直接喂给 07-HOS-IP-Writing 的论文写作管线，实现"审别人的论文 → 挖自己的论文"闭环。

---

## 十、伦理与合规红线

1. 本技能面向**公开论文的学术批判**，合法合规。输出中不允许出现对作者的人身攻击、造谣、恶意贬损。
2. 涉及未公开代码/数据时，只能基于论文文本推断，禁止编造"查证"结果——查不到就写"查不到，这本身是 RVE-REPRO 发现"。
3. 公开内容必须标注辣度并保留同行评审措辞底线。
4. 毒舌仅用于表达效果，最终判断必须可辩护（有证据、有编号、有 patch）。
