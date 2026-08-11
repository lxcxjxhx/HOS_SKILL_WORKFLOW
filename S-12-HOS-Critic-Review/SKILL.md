---
name: HOS-CRITIC-REVIEW
description: 对任意技术对象（GitHub 项目/论文/技术文章/产品方案/License/数据集）执行六维批判式评审：拆解主张、攻击实验与方法漏洞、证据校验、专家评分，输出 Quick/Expert/Academic 报告。触发时机：用户要求点评/批判/审计/毒舌评价/评审/打分任何技术对象，或说「这个项目/论文/方案靠不靠谱」「值不值得学/投/用」「帮我审一下」「毒舌点评一下」，或调用 hos-critic-review。
---

# HOS-CRITIC-REVIEW · 六维批判式评审引擎

> **输入任意技术对象 → 分钟级输出可追溯、带证据、可决策的专家级评审。**

## 一、这是什么

一个多 Agent 批判式评审 Skill：模拟领域专家（Reviewer #2 / 主程 / 安全审计 / 产品思维）对技术对象做高强度审查，回答的不是「它是什么」，而是**「它到底值不值得相信、投入、使用？」**。

- **不是** 总结器、评论机器人、安全扫描器（静态分析只是可选分析器之一）。
- 智能环节（批判、评分、毒舌点评）由宿主 LLM 执行；外部工具（GitHub API、Tree-sitter、GROBID 等）是可选增强，缺失时自动降级，流水线不中断。
- 完全独立体系：编号 `HCR-FIND`、六维评分、报告样式均为本项目自建。
- **方法论背书**：评审规则不是 AI 自创的「看起来很专业」的清单，而是对通用科研方法论的工程化（见 §一·五）——对外可解释、有权威来源。

### 一·五、方法论背书（Methodology Reference → Operationalization）

**Methodology Reference**（评审规则的权威来源）

- Booth, Colomb & Williams, *The Craft of Research*, 5th ed., University of Chicago Press, 2024 —— 研究总纲：问题 → 证据 → 论证 → 贡献
- Creswell & Creswell, *Research Design*, 5th ed., SAGE —— 研究设计：先有研究问题，后有方法；防止「先决定方法再硬找问题」
- Keshav, *How to Read a Paper* —— CS 论文三遍阅读法：快速判断 → 理解方法与实验 → 挑战细节（数学/算法/隐藏假设）

**Operationalization**（方法论 → 本 Skill 规则）

| 方法论 | 本 Skill 落点 |
|--------|--------------|
| 三遍阅读法第三遍（挑战实验细节/隐藏假设） | Analyzer 论文检查点 + Critic 攻击向量（`hidden-assumption` / `counterexample`） |
| CS 审稿 rubric（Problem significance / Novelty / Soundness / Baseline / Data / Experiment / Ablation / Statistical validity / Repro / Real-world relevance） | `references/analyzers.md` 论文检查点 P1–P13 |
| 「研究问题 → 设计 → 方法 → 实验 → 证据」顺序 | 检查点 P12 Design-order：先定方法后找问题的论文必须被点名 |
| The Craft of Research 的证据纪律（声称必须有证据支撑） | 铁律「No Evidence No Criticism」+ Evidence-Agent 逐条核验 |

## 二、七 Agent 流水线

```
Discovery → Chunk → Analyzer → Evidence → Critic → Judge → Report
```

| 步 | Agent | 产物 | 说明 |
|----|-------|------|------|
| 1 | [Discovery](agents/01-discovery.md) | `ObjectProfile` | 识别类型/领域/复杂度 |
| 2 | [Chunk](agents/02-chunk.md) | `ReviewUnit[]` | 按类型自适应切片 |
| 3 | [Analyzer](agents/03-analyzer.md) | `Finding[]` | 领域分析（多插件可并行） |
| 4 | [Evidence](agents/04-evidence.md) | `EvidenceReport[]` | 逐条校验：证实/证伪/查不到 |
| 5 | [Critic](agents/05-critic.md) | `Critique[]` | 多角色攻击（毒舌但讲证据） |
| 6 | [Judge](agents/06-judge.md) | `SixDimScore` | 六维评分 + 评级 + 一句话结论 |
| 7 | [Report](agents/07-report.md) | `ReviewReport` | 三模板渲染 + JSON + 持久化 |

## 三、执行规则（铁律）

1. **证据优先**：`No Evidence No Criticism`。每条 Finding 必须挂 Evidence（含 `unverifiable`）；查不到写「查不到，证据缺口」，禁止编造。
2. **结论先行**：报告开头是评分卡（分数 + 一句话 + 维度条），长文靠后。
3. **攻击对象，不攻击人**：可骂方法/证据/实验/设计，禁止对作者/团队人格攻击。
4. **先复述后拆台**：先中性复述对象声称，再逐条攻击（声称 → 证据 → 缺口）。
5. **结尾必须认可**：至少一条「认可点」，毒舌文档不能纯喷。
6. **降级不撒谎**：工具缺失/网络失败必须写入 `degradations`，不许假装查证过；**反过来也不许偷懒**——网络可用时未尝试核验 arXiv/GitHub/DOI 就标 `unverifiable`，同样是违规（Evidence-Agent 联网核验为默认动作）。
7. **打分必须可复核**：每个维度分引用 finding/critique id，公式见 [references/score-model.md](references/score-model.md)。

## 四、执行路径

1. **读入输入**（URL / 文件路径 / 粘贴文本 / JSON 载荷），走 [Discovery](agents/01-discovery.md)；
2. 按类型选择切片策略（[chunk-engine/](chunk-engine/)）与分析器（[references/](references/) 内置清单）；`paper`/`repo` 对象在 Discovery 阶段提取 arXiv ID / GitHub URL / DOI 等可核验锚点；
3. 顺序执行七步，每步产物按 [schemas/](schemas/) 校验后进入下一步；Evidence 阶段对锚点做联网核验（arXiv abs / GitHub API / DOI），失败才降级；
4. 输出：人类报告（默认 Quick 模板，**渲染为单文件 HTML**——`output_format: html` 为默认，见 [config.yaml](config.yaml)）+ 机器 JSON + 写入 [database/](database/) Review Store；HTML 可一键再转 PDF（见 §五 与 [docs/09](docs/09-extraction-and-rendering.md)，均由 script 完成、不额外消耗 LLM token）；
5. 输出语言跟随用户；默认中文。

**⚠ 网络核验为默认动作（Evidence-Agent 铁律）**：对 `paper`/`repo` 类对象，必须尝试联网核验 arXiv 元数据（标题/版本/发表状态/代码链接）、GitHub 仓库、DOI/Zenodo 等官方来源——论文自带 arXiv 链接与开源仓库时，核验这些链接**不是可选增强，而是 Evidence 阶段的必做步骤**。只有**已尝试且失败**才允许标 `unverifiable`（写「查不到，证据缺口」）；未尝试联网就标 unverifiable 属于流程缺陷。详见 [agents/04-evidence.md](agents/04-evidence.md)。

**最小可用路径**：对象仅需快速评审时，可从 Chunk/Analyzer 起步（跳过外部抓取步骤），但 Critic + Judge + Report 必跑。

## 五、输出模式

| 模式 | 用途 | 模板 |
|------|------|------|
| `quick`（默认） | 评分卡 + TOP 发现 | [templates/quick.md](templates/quick.md) |
| `expert` | 完整分析报告 | [templates/expert.md](templates/expert.md) |
| `academic` | 论文审稿决策 | [templates/academic.md](templates/academic.md) |

输出格式（`render --format`）：

| 格式 | 说明 |
|------|------|
| `md` | Markdown（`render.ts`，机器友好） |
| `html` | 单文件美观网页（`render-html.ts`，内联 CSS，评分卡/维度条/徽章）——**默认输出格式**（`output_format: html`，可由 `render --format` 覆盖） |
| `pdf` | HTML → PDF（`render-pdf.py`，零 LLM token，weasyprint→playwright→Edge/Chrome 降级链） |

## 六、配置

`config.yaml`：输出模式、辣度、六维权重、阈值、降级开关。用户一句话可覆盖（「正经点」→辣度 0，「往死里骂」→辣度 5）。

## 七、文档指针

- 完整规格：`docs/`（01-overview 起；输入提取与输出渲染见 [09](docs/09-extraction-and-rendering.md)）
- 评分模型 / 编号体系 / 风格指南：`references/`
- 切片规则：`chunk-engine/`
- 正式 Schema：`schemas/`
- 评审记录：`database/`
