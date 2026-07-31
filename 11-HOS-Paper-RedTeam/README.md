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

在 Claude Code / Cursor / Codex / Trae 中引用本目录的 `SKILL.md`，或把整个 `11-HOS-Paper-RedTeam/` 放进你的 skills 目录。

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
11-HOS-Paper-RedTeam/
├── SKILL.md                  # Skill 主入口（必需）
├── README.md                 # 本文档
├── config/
│   └── config.yaml           # 全局配置
├── sources/                  # 论文源配置
│   ├── arxiv.yaml
│   ├── openreview.yaml
│   └── github.yaml
├── agents/                   # 10 个红队 Agent 定义
│   ├── 01-paper-hunter.md
│   ├── 02-hype-detector.md
│   ├── 03-claim-analyzer.md
│   ├── 04-experiment-auditor.md
│   ├── 05-security-auditor.md
│   ├── 06-reproduction-agent.md
│   ├── 07-reviewer-simulator.md
│   ├── 08-paper-autopsy.md
│   ├── 09-research-miner.md
│   └── 10-blogger-agent.md
├── templates/                # 输出模板
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
│   └── rve-catalog.md        # RVE 漏洞编号规范
└── workflows/                # 自动化节奏
    ├── daily-scan.yaml
    ├── weekly-report.yaml
    └── monthly-report.yaml
```

## 核心输出示例：《论文鞭尸局》

```markdown
# HOS论文鞭尸局 #001

**Target**: MultiVer (arXiv:2602.17875)
**辣度**: 3
**TL;DR**: 精确率只有 48.8%，一半以上告警是误报，靠误报堆出来的 82.7% 召回。

## 攻击面
- [RVE-EVAL-001] 选择性报告指标：F1 61.4 vs 微调基线 71.6，整体反而低 10 个点
- [RVE-DATA-002] 只在 202 个 Python 样本上测过，无真实项目验证

## Patch
1. 报告完整 P/R/F1 矩阵，禁止单项遮丑
2. 补充真实项目验证 + 多语言实验

## Next Paper Idea
动态 Agent 安全评估：在真实攻击环境里测 multi-agent 系统的防御能力
```

完整模板见 `templates/paper-autopsy.md`。

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
- **07-HOS-IP-Writing**：本技能产出的 Research Gap 可直接喂给论文写作管线
- **HOS-SKILL-WORKFLOW**：本技能即其一员，遵循仓库 SKILL.md 规范

## 免责声明

本技能用于公开论文的学术批判。输出禁止人身攻击、造谣；毒舌仅为表达效果，最终判断必须可辩护（有证据、有编号、有 patch）。
