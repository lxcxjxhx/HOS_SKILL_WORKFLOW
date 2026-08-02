# HOS-Paper-RedTeam（HOS论文鞭尸局）

> **Academic Red Teaming System** — 以安全红队的攻击思维审 AI/安全领域论文。

```
Paper → Audit → Exploit → Patch → Research Idea
```

## 这是什么

一个 AI 驱动的**学术红队系统**。每天自动发现、审计、攻击、修复 AI/安全领域论文，生成适合公开传播的「论文鞭尸局」内容，同时沉淀下一篇论文的研究机会。

**它不是**论文总结器 / 翻译器。**它是**科研漏洞扫描器——把每篇论文当靶子，拆它的主张、打它的实验、找它的数据漏洞，最后给出补丁和下一篇论文方向。

## 快速开始

### 1. 加载 Skill

在 Claude Code / Cursor / Codex / Trae 中引用本目录的 `SKILL.md`，或把整个 `S-11-HOS-Paper-RedTeam/` 放进你的 skills 目录。

### 2. 三句话上手

```text
# 点评一篇论文
点评 arxiv.org/abs/2510.02389，往死里骂

# 从一堆论文里挖研究方向
对比这 8 篇论文，找出共同漏洞，给我下一篇论文选题

# 写鞭尸局内容
把这篇论文写成一篇"论文鞭尸局"博客，辣度 4
```

### 3. 配置

默认配置在 `config/config.yaml`。常用开关：

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `spiciness` | `3` | 毒舌辣度 0–5 |
| `target_topics` | 安全/LLM | 抓取主题 |
| `output_language` | `zh` | 输出语言 |
| `rve_auto_assign` | `true` | 自动分配 RVE 编号 |

## 目录结构

```
S-11-HOS-Paper-RedTeam/
├── SKILL.md                  # Skill 主入口（必需）
├── README.md                 # 本文档
├── config/
│   └── config.yaml           # 全局配置
├── sources/                  # 论文源配置
│   ├── arxiv.yaml
│   ├── openreview.yaml
│   └── github.yaml
├── agents/                   # 11 个红队 Agent 定义
│   ├── 01-paper-hunter.md
│   ├── 02-hype-detector.md
│   ├── 03-claim-analyzer.md
│   ├── 04-experiment-auditor.md
│   ├── 05-security-auditor.md
│   ├── 06-reproduction-agent.md
│   ├── 07-reviewer-simulator.md
│   ├── 08-paper-autopsy.md
│   ├── 09-research-miner.md
│   ├── 10-blogger-agent.md
│   └── 11-scorer.md           # 评分官：汇总评分卡
├── templates/                # 输出模板
│   ├── score-card.md          # 🎴 评分卡（置顶必输出）
│   ├── paper-audit.md
│   ├── paper-autopsy.md
│   ├── reviewer-report.md
│   ├── blog-article.md
│   └── research-idea.md
├── database/                 # 长期数据沉淀
│   ├── paper.json
│   ├── vulnerability.json    # RVE 登记表
│   └── research-gap.json     # 研究机会池
├── references/
│   ├── style-guide.md        # 毒舌风格指南
│   ├── rve-catalog.md        # RVE 漏洞编号规范
│   ├── score-model.md        # 评分模型（ghfind 式评分卡）
│   └── ghfind-card.md        # ghfind 评分卡结构内嵌参考（免抓取）
├── src/                      # TS 评分卡渲染器（Node 24+ 直接跑）
│   ├── types.ts              # PaperReviewData 接口 + 通用六维
│   ├── render.ts             # renderCard() 渲染逻辑
│   ├── index.ts              # CLI 入口
│   └── example-review.json   # 示例数据
├── package.json / tsconfig.json
└── workflows/                # 自动化节奏
    ├── daily-scan.yaml
    ├── weekly-report.yaml
    └── monthly-report.yaml
```

## 核心输出示例：🎴 评分卡优先（3 秒可读）

> 仿 ghfind.com 的"毒舌评分"——**先给结论，长文靠后**。默认 `output_mode: scorecard`，只出评分卡，长文按需展开。

```markdown
# 🎴 HOS 论文评分卡

**评分**: **37.1 / 100**   🔴 噱头大于实质 · 复现劝退   击败 18% 已审论文
**一句话点评**: 433 个告警自称全面工业实证，样本连泛化都不配提。

| 维度 | 分数 | 可视化 |
|------|------|--------|
| 实验 EVAL | 3.2 | ███░░░░░░░ |
| 数据 DATA | 4.0 | ████░░░░░░ |
| 复现 REPRO | 1.5 | █░░░░░░░░░ |
| 新颖 NOV | 6.0 | ██████░░░░ |
| 安全 SEC | 5.0 | █████░░░░░ |

**倾向**: 低分主因 = 复现层（闭源+零参数细节）
**RVE 摘要**: 6 条  CRITICAL×1 HIGH×3 MEDIUM×2
```

需要深度分析时用 `output_mode: full`，评分卡后跟完整鞭尸局长文（`templates/paper-autopsy.md`）。

### 🎴 TS 渲染器（模板化，通用于所有论文类型）

> 卡片结构参考 ghfind.com 并**内嵌**在 `references/ghfind-card.md`（无需抓站）。渲染器只认 `PaperReviewData` 数据形状，维度数据驱动，喂什么领域的数据出什么卡。

```bash
# Node 24+ 直接跑 TS
node src/index.ts src/example-review.json      # 跑示例
node src/index.ts review.json                  # 渲染你自己的评审 JSON
```

评分卡数据由 Scorer 组装（`agents/11-scorer.md`），结构定义见 `src/types.ts`。

## 毒舌但讲证据

本技能的风格是**毒舌**（辣度可调 0–5），但三条铁律不可破：

1. 攻击论文，不攻击作者
2. 每条吐槽都有可核验的证据，并挂 RVE 编号
3. 每条漏洞都有 Patch，结尾必有认可

详细风格规范见 `references/style-guide.md`。

## 自动化

- **Daily**：`workflows/daily-scan.yaml` — 每日抓 100 篇 → 筛 10 → 深度分析 3 → 发布 1 篇
- **Weekly**：`workflows/weekly-report.yaml` — 《本周论文漏洞 TOP10》
- **Monthly**：`workflows/monthly-report.yaml` — 《HOS AI 研究漏洞月报》

## 与 HOS 生态协同

- **HOS-LS**：代码漏洞扫描（工程侧）→ 本技能：科研漏洞扫描（学术侧）
- **S-07-HOS-IP-Writing**：本技能产出的 Research Gap 可直接喂给论文写作管线
- **HOS-SKILL-WORKFLOW**：本技能即其一员，遵循仓库 SKILL.md 规范

## 免责声明

本技能用于公开论文的学术批判。输出禁止人身攻击、造谣；毒舌仅为表达效果，最终判断必须可辩护（有证据、有编号、有 patch）。
