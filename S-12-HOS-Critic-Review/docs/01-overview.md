# 01 · 项目定位与设计原则

> 本文档定义 HOS-CRITIC-REVIEW 是什么、不是什么，以及所有后续规格必须遵守的设计原则。

---

## 1.1 核心定义

HOS-CRITIC-REVIEW 是一个**以 Agent Skill 形态交付的多 Agent 批判式评审引擎**：

- **形态**：Agent Skill（Markdown 编排 + 可选辅助脚本），由宿主环境（AI IDE / CLI 中的 LLM）执行智能环节；
- **定位**：模拟领域专家在有限时间内对任意技术对象进行高强度审查，输出可追溯、带证据、可决策的评审；
- **回答的问题**：不是「它是什么？」，而是「它到底值不值得相信、投入、使用？」

### 是 / 不是 边界

| 是 | 不是 |
|----|------|
| Agent Skill（依赖 AI IDE / CLI 宿主 LLM） | 独立 CLI 工具（不内置 LLM 客户端、不要求 API Key） |
| 多 Agent 流水线 + 自适应切片 + 证据驱动 | 安全扫描器（静态分析只是可选分析器之一） |
| 可接入其他工作流的可编程评审引擎 | 普通总结工具 / 评论机器人 / ChatGPT Wrapper |
| 结构化输出（JSON 契约 + 事件钩子） | 玩具级 Demo（必须能工程落地、可测试、可发布） |
| 对象自适应的通用评审框架 | 只针对论文的专用工具 |

---

## 1.2 设计原则

以下原则是全部规格的约束条件，任何设计决策不得违反：

1. **宿主驱动（Host-Driven）**：Skill 不内嵌 LLM，所有「智能环节」（批判、判定、毒舌点评）由宿主 LLM 按 Prompt 规格执行；Skill 只负责编排、结构化、工具调用与渲染。
2. **证据优先（Evidence First）**：`No Evidence No Criticism`。每条结论必须挂证据链（Claim → Evidence → Confidence → Decision）；查不到 = 证据缺口，如实记录，禁止编造。
3. **对象自适应（Adaptive）**：先识别对象类型，再选择切片策略与分析器；固定参数只作兜底，不作核心。
4. **六维统一（Six-Dimension）**：所有对象类型进入同一评分模型，保证跨对象可比（论文 vs 项目 vs 文章可以比）。
5. **可编程输出（Programmable Output）**：人类可读报告与机器可读 JSON 双通道并行；JSON 是工作流集成的稳定契约。
6. **优雅降级（Graceful Degradation）**：外部工具缺失时逐级降级（Tree-sitter → 启发式；GitHub API → 缓存/文本分析），流水线不中断，且降级事实写入报告。
7. **模块化与可插拔（Modular & Pluggable）**：Agent、Chunk Parser、Analyzer、Report 均为可替换单元，通过清单（Manifest）声明式注册。
8. **独立体系（Standalone Conventions）**：编号体系、评分模型、报告样式完全自建，不依赖任何既有项目的内部约定（可参考行业规范，但不复用其内部 ID/样式/注册机制）。

---

## 1.3 目标与度量

### 目标

- 分钟级（≤ 5 分钟典型对象）生成接近高级工程师 / 研究员 / 架构师 / Reviewer 水平的评审；
- 每条发现可追溯到证据，评审结论可辩护；
- 评审结果可被其他工作流（博客管线、周报、决策看板）直接消费。

### 度量（验收标准，M4 里程碑生效）

| 指标 | 目标 |
|------|------|
| 端到端耗时（典型 GitHub 仓库 / 论文） | ≤ 5 分钟 |
| 发现可追溯率（每条 Finding 挂 Evidence） | 100% |
| 证据可核验率（Evidence 有来源） | ≥ 90% |
| 报告结构合法率（通过 JSON Schema 校验） | 100% |
| 无工具环境完成率（全降级模式仍出报告） | 100% |
| 评审一致性（同一对象两次评审结论相关性） | 人工抽检可辩护 |

---

## 1.4 支持的对象类型（Object Type 枚举）

`type` 枚举由 Discovery-Agent 输出，全链路唯一：

| type | 典型输入 | 特征信号 |
|------|----------|----------|
| `repo` | GitHub 仓库 URL / 本地项目目录 | 域名含 github.com/gitlab 等；本地含 package.json / pyproject.toml / go.mod 等 |
| `paper` | PDF / arXiv 链接 / 论文 Markdown | `.pdf` 后缀；arXiv/DOI 链接；含 Abstract/References 结构 |
| `article` | Markdown / HTML / 纯文本文章 | `.md` / `.html`；博客/文档形态 |
| `dataset` | 数据集说明 / HuggingFace 链接 / 数据目录 | 含数据规模/来源/许可描述；HF 域名 |
| `license` | LICENSE 文本 / 仓库许可证 | 含 SPDX 标识（MIT/Apache-2.0 等）或标准许可文本 |
| `proposal` | 产品方案 / 技术方案 / 需求文档 | 结构为背景-方案-计划；无代码与数据特征 |
| `unknown` | 无法判定 | 兜底类型，进入人工确认或按 `article` 处理 |

判定规则细节与优先级见 [03-agents.md](03-agents.md) §3.1.3。

---

## 1.5 术语表

| 术语 | 定义 |
|------|------|
| **Agent** | 流水线中的一个执行单元，有明确职责、输入、输出与质量门槛 |
| **ObjectProfile** | Discovery 产物：对象类型、领域、复杂度、来源、元数据 |
| **ReviewUnit** | Chunk 产物：一个可独立评审的语义单元（函数 / 章节 / 段落） |
| **Finding** | Analyzer 产物：一条带严重度与证据的发现 |
| **Evidence Point** | 一条可核验的证据（来源、时间戳、置信度） |
| **Critique** | Critic 产物：一条攻击性观点（含反例 / 隐藏成本 / 夸大识别） |
| **SixDimScore** | Judge 产物：六维评分 + 总分 + 评级 + 一句话结论 |
| **HCR-FIND 编号** | 发现编号体系，格式 `HCR-<CLASS>-YYYY-NNNN`，见 [05-analyzers-evidence.md](05-analyzers-evidence.md) §5.12 |
| **降级链** | 某能力在工具缺失时的回退序列（如 `Tree-sitter → 启发式切分`） |

---

## 1.6 本文档集的使用方式

- 本文档集（`docs/`）是**可执行的技术规格**：实现里程碑 M1-M4 时按文档模块直接落地；
- 每篇文档自含 Schema 与参数，实现不得偏离；如需变更，先改规格再改实现；
- 文档间交叉引用保持稳定，改一处须同步检查引用（见 [08-engineering.md](08-engineering.md) §8.6 规格变更流程）。
