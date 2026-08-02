# 03 · 七 Agent 详细规格

> 本文档定义流水线中七个 Agent 的职责、输入/输出 Schema、Prompt 要点、依赖工具、降级链与质量门槛。
> 每个 Agent 都是「宿主 LLM 按 Prompt 规格执行 + 可选工具脚本辅助」的组合体。

---

## 3.0 通用约定

- 所有 Schema 均为 JSON；字段命名 snake_case；
- `*` 号字段为必填；其余可缺省，缺省按表内默认值；
- 每个 Agent 输出必须通过 [02-architecture.md](02-architecture.md) §2.5 的 Schema 校验方可进入下一步；
- Prompt 要点是**给宿主 LLM 的角色指令**，实现时逐字写入对应 Agent 的 Skill 文件。

---

## 3.1 Agent-01 · Discovery-Agent（对象识别）

### 3.1.1 职责

- 判定输入对象类型（7 类枚举）；
- 估计领域（domain）、复杂度（complexity）、规模（size_estimate）；
- 抽取来源元数据（标题、作者、链接、语言信号）。

### 3.1.2 输入 `RawInput`

```json
{
  "raw": "https://github.com/foo/bar",
  "kind": "url",
  "meta": {}
}
```

`kind` 枚举：`url | path | text | json`。`raw` 为原文（URL / 文件路径 / 粘贴文本 / 工作流 JSON 载荷）。

### 3.1.3 类型判定规则（按优先级从上到下，命中即停）

| # | 信号 | 判定 type |
|---|------|-----------|
| 1 | 域名含 `github.com` / `gitlab.com` / `bitbucket.org` / `gitee.com` 且非 blob 页 | `repo` |
| 2 | 本地路径：存在 `package.json` / `pyproject.toml` / `go.mod` / `Cargo.toml` / `pom.xml` | `repo` |
| 3 | 路径/URL 后缀 `.pdf`，或含 `arxiv.org` / `doi.org`，或文本含 Abstract + References 结构 | `paper` |
| 4 | 文本含 SPDX 标识（`MIT` / `Apache-2.0` / `GPL-3.0`…）或 ≥50% 内容匹配标准许可条款 | `license` |
| 5 | 路径/URL 含 `huggingface.co/datasets`，或文本含数据规模/来源/许可描述（样本数、字段、收集方式） | `dataset` |
| 6 | 后缀 `.md` / `.html` / `.rst` / `.txt`，或文本为文章/博客/文档形态 | `article` |
| 7 | 结构含「背景/方案/计划/风险/里程碑」且无代码无数据特征 | `proposal` |
| 8 | 均未命中 | `unknown` |

> `unknown` 处理：若宿主可交互则请求确认；非交互模式按 `article` 处理并在 `degradations` 记录。

### 3.1.4 输出 `ObjectProfile`

```json
{
  "object_id*": "obj-3f2a9c",
  "type*": "repo",
  "domain*": "AI Security",
  "complexity*": "medium",
  "size_estimate": { "bytes": 482000, "files": 36, "pages": null, "tokens": 42000 },
  "source": { "kind": "url", "url": "https://github.com/foo/bar" },
  "meta": { "title": "bar", "author": "foo", "lang_detect": ["python", "typescript"] },
  "signals": ["github-url", "has-pyproject"],
  "confidence*": 0.95,
  "degradations": []
}
```

字段说明：

| 字段 | 说明 | 默认 |
|------|------|------|
| `complexity` | `low`(<5K tokens) / `medium`(5K-60K) / `high`(>60K) | 由 size_estimate.tokens 折算 |
| `domain` | 自由文本领域标签（AI Security / DevOps / 数据库…），供 Analyzer 与 Critic 定向 | `"general"` |
| `confidence` | 类型判定置信度 0-1；<0.6 必须带 `degradations` 说明 | — |

### 3.1.5 Prompt 要点

1. 你是对象识别专家：先给类型判定证据，再下结论，禁止模棱两可。
2. 复杂度按 token 折算，不要凭文件数猜测。
3. 无法判定时如实报 `unknown`，禁止强行归类。

### 3.1.6 质量门槛

- `type` 非空且 ∈ 枚举；`confidence` ∈ [0,1]；
- 通过门槛否则重跑一次（换启发式）→ 仍失败标记 `invalid`。

---

## 3.2 Agent-02 · Chunk-Agent（自适应切片）

### 3.2.1 职责

- 依据 ObjectProfile 选择切片策略（Router，见 [04-chunk-engine.md](04-chunk-engine.md)）；
- 将原始内容切成语义自洽的 `ReviewUnit`，保证每单元可独立评审；
- 控制单元规模与上下文预算（≤ 4K tokens/单元）。

### 3.2.2 输入

`ObjectProfile` + `RawInput`（内容经适配器载入为文本/结构化数据）。

### 3.2.3 输出 `ChunkResult`

```json
{
  "strategy*": "code-tree-sitter",
  "units*": [
    {
      "unit_id*": "unit-001",
      "kind*": "code-function",
      "title": "validateJwt",
      "content*": "…（截断示例）…",
      "source_range": { "file": "src/auth.ts", "start_line": 10, "end_line": 40 },
      "tokens*": 1200,
      "parent_id": null,
      "tags": ["auth", "input-validation"]
    }
  ],
  "degradations": []
}
```

`kind` 枚举（由策略决定）：`code-function | code-class | code-module | code-block | paper-section | paper-figure-table | text-heading | text-paragraph | license-clause | dataset-field | proposal-section`。

### 3.2.4 降级链

| 策略 | 首选工具 | 降级 1 | 降级 2 |
|------|----------|--------|--------|
| code | Tree-sitter | 语言启发式（缩进/括号/空行边界） | 按文件整文件为单元 |
| paper | GROBID / PyMuPDF | 章节标题正则 | 全文单单元（超高预算） |
| article | Trafilatura / Readability | Markdown AST | 段落边界切分 |
| 兜底 | Semantic Splitter（embedding） | RecursiveCharacter 定长切分 | 单单元 |

### 3.2.5 Prompt 要点

1. 你是切片专家：切片目标是「让评审者只看本单元就能形成判断」，不是均匀分块。
2. 优先语义边界（函数、章节、论点段），长度只是上限不是目标。
3. 保留每个单元的来源映射（文件/行号/章节号），这是证据追溯的基础。

### 3.2.6 质量门槛

- `units` 非空；每单元 `tokens ≤ 4000`（超限必须再切）；
- 单元间不重叠、不遗漏（合并后覆盖率 ≥ 95%）；
- 所有单元带 `source_range` 或等价定位信息。

---

## 3.3 Agent-03 · Analyzer-Agent（领域分析）

### 3.3.1 职责

- 按 ObjectProfile.type 调度对应 Analyzer 插件（见 [05-analyzers-evidence.md](05-analyzers-evidence.md)）；
- 对 ReviewUnit 逐个产出 `Finding`（发现 = 断言 + 初步证据 + 严重度）；
- 多插件可并行，结果合并去重。

### 3.3.2 输入

`ObjectProfile` + `ReviewUnit[]` + 已注册插件清单。

### 3.3.3 输出 `AnalysisResult`

```json
{
  "findings*": [
    {
      "finding_id*": "finding-001",
      "class*": "ARCH",
      "severity*": "HIGH",
      "title*": "核心方法依赖已有技术组合",
      "claim*": "宣称的 Agent Framework 实为已有 Workflow + Prompt Router 组合",
      "evidence_draft*": "unit-003 的 workflow 定义仅包含顺序调用与条件路由，无状态/规划模块",
      "unit_refs*": ["unit-003", "unit-004"],
      "analyzer*": "code-analyzer",
      "confidence": 0.8,
      "suggested_patch": "补充与独立 Framework 的架构对比表"
    }
  ],
  "degradations": []
}
```

### 3.3.4 Finding.class 与 severity

`class` 枚举（即 HCR-FIND 分类前缀，见 §5.5）：

| class | 含义 | 典型 |
|-------|------|------|
| `ARCH` | 架构/方法问题 | 拼接物、无新技术迭代、设计缺陷 |
| `DATA` | 数据问题 | 样本量、来源、污染、硬编码 |
| `EVAL` | 实验/指标问题 | 无基线、选择性报告、画靶射箭 |
| `SEC` | 安全问题 | 注入、泄漏、越权、依赖漏洞 |
| `REPRO` | 复现/落地问题 | 闭源、缺参数、文档缺失 |
| `LIC` | 许可/合规问题 | 许可证冲突、商用风险 |
| `ECO` | 生态/活跃度问题 | 无维护、issue 积压、star 异常 |
| `CLAIM` | 主张夸大 | 营销浓度、概念包装 |

`severity`：`CRITICAL | HIGH | MEDIUM | LOW | INFO`（定义见 [05-analyzers-evidence.md](05-analyzers-evidence.md) §5.6）。

### 3.3.5 Prompt 要点

1. 你是领域分析专家：每个 Finding 必须「先断言、后证据」，证据必须指向具体单元/行/数字。
2. 只报事实与直接推断；把「怀疑」写进 `confidence`，不要写进断言。
3. 同一问题合并为一条 Finding，不碎片化重复。

### 3.3.6 质量门槛

- `findings` 可为空数组（无显著问题），但空时必须由 Judge 按「无发现」基准评分并注明；
- 每条 Finding 必须有 `claim` 与 `evidence_draft`；`severity` 缺省按 `INFO`；
- 断言不得引用未提供的单元（`unit_refs` 必须存在）。

---

## 3.4 Agent-04 · Evidence-Agent（证据校验）

### 3.4.1 职责

- 对每条 Finding 构建证据链：**证实 / 证伪 / 部分证实 / 查不到**；
- 记录证据来源、抓取时间、原文引用；
- 依据校验结果修正 Finding 严重度（`severity_delta`）。

### 3.4.2 输入

`Finding[]` + 可访问的校验源（GitHub API / Semantic Scholar / 本地文件 / 元数据）。

### 3.4.3 输出 `EvidenceResult`

```json
{
  "evidence*": [
    {
      "ev_id*": "ev-001",
      "finding_id*": "finding-001",
      "status*": "verified",
      "confidence*": "high",
      "sources*": [
        {
          "kind": "github-api",
          "url": "https://api.github.com/repos/foo/bar",
          "fetched_at": "2026-08-01T10:00:00Z",
          "quote": "pushed_at: 2026-07-29",
          "status": 200
        }
      ],
      "notes": "最近提交 3 天前，与「无人维护」断言矛盾",
      "adjustment": { "severity_delta": -1, "action": "downgrade" }
    }
  ],
  "degradations": []
}
```

`status` 定义：

| status | 含义 | 处理 |
|--------|------|------|
| `verified` | 有来源且支持断言 | 维持或上调 severity |
| `refuted` | 有来源且反驳断言 | 下调 severity，标注矛盾证据 |
| `partial` | 部分支持 | 维持 severity，notes 注明缺口 |
| `unverifiable` | 查不到（工具/网络/不存在） | 该条作为「证据缺口」写入报告，禁止臆断 |

### 3.4.4 校验源清单

| 源 | 用途 | 限流/缓存 |
|----|------|-----------|
| GitHub REST API | repo/commits/issues/pulls/contributors/licenses/releases | 未认证 60 req/h；本地缓存 1h |
| Semantic Scholar API | paper citation/venue/tldr | 100 req/5min；缓存 24h |
| 本地文件系统 | 仓库目录结构、LICENSE、README、CI 配置 | 无 |
| 依赖元数据 | package.json/pyproject 的依赖与版本 | 无 |
| 搜索引擎（可选） | 交叉核验存在性 | 人工/宿主能力 |

### 3.4.5 铁律（No Evidence No Criticism）

1. 每条 Finding 必须挂 ≥1 条 EvidenceRecord（含 `unverifiable`），否则不许进入 Critic；
2. **查不到 ≠ 不存在**：写「查不到，证据缺口」，禁止编造核验结果；
3. `refuted` 必须给出反证来源，且 Critic/Judge 必须读取修正后的严重度；
4. 所有外部 API 调用记录 `fetched_at` 与 `status`，保证可审计。

### 3.4.6 质量门槛

- 覆盖率 100%：`evidence.length == findings.length`（一一对应）；
- 每条证据至少 1 个 `sources` 元素（unverifiable 时 `sources` 可空但 `status` 必须为 unverifiable）；
- 修正链生效：任何 `severity_delta ≠ 0` 必须回写到对应 Finding 后再进 Critic。

---

## 3.5 Agent-05 · Critic-Agent（多角色攻击）

### 3.5.1 职责

- 模拟多个专家角色对对象发起主动攻击（反例、隐藏假设、隐藏成本、夸大识别）；
- 产出结构化 `Critique`，每条可追溯到单元与发现。

### 3.5.2 角色集（按 type 选择）

| type | 默认激活角色 | 可选追加 |
|------|--------------|----------|
| `repo` | Principal Engineer、Security Auditor | Product Mind |
| `paper` | Reviewer #2、Experiment Auditor | Security Auditor、Repro 专家 |
| `article` | Domain Expert、Skeptic | — |
| `dataset` | Data Scientist、Legal Mind | Security Auditor |
| `license` | Legal Mind、Business Mind | — |
| `proposal` | Product Mind、Architect | Finance Mind |
| `unknown` | Skeptic、Generalist | — |

### 3.5.3 攻击向量（attack_vector）

| 向量 | 提问范式 |
|------|----------|
| `hidden-assumption` | 「这个结论依赖哪些未声明的假设？假设不成立会怎样？」 |
| `counterexample` | 「有没有反例？边界条件是什么？」 |
| `hidden-cost` | 「被隐藏的成本：维护、算力、人力、迁移？」 |
| `overclaim` | 「宣称是否超出证据？营销浓度多高？」 |
| `missing-baseline` | 「跟谁比了？为什么没跟更强的比？」 |
| `scaling-doubt` | 「在小规模成立，放大 10 倍/100 倍还成立吗？」 |
| `survivorship` | 「是不是只展示了成功的例子？」 |

### 3.5.4 输入

`ObjectProfile` + 精选 `ReviewUnit[]`（按预算抽样，见 §2.4）+ `Finding[]`（含 Evidence 修正后严重度）+ `EvidenceResult[]`。

### 3.5.5 输出 `CritiqueResult`

```json
{
  "critiques*": [
    {
      "crit_id*": "crit-001",
      "role*": "principal-engineer",
      "attack_vector*": "hidden-cost",
      "thesis*": "宣称零依赖，但 README 未提及 12 个运行时依赖",
      "reasoning*": "package.json 实际声明 12 个 deps；「零依赖」仅指零编译期依赖，存在概念偷换",
      "unit_refs": ["unit-005"],
      "finding_refs": ["finding-001"],
      "spiciness": 2
    }
  ]
}
```

### 3.5.6 Prompt 要点（毒舌底线）

1. 你是角色扮演的攻击者：默认立场是「这个观点可能是错的」，任务是把可能的错找出来；
2. **毒舌是风格，证据是底线**：每条 Critique 必须挂 `reasoning` 指向事实；攻击对象不攻击人；
3. 结尾必须带「认可点」（每个激活角色至少 1 条积极 Critique 或总结性认可），防止单向喷；
4. 不重复 Finding 已说的事实——Critique 要给出**新角度**或**更狠的推论**。

### 3.5.7 质量门槛

- 每个激活角色 ≥ 1 条 Critique；
- 每条 `reasoning` 非空且引用 `unit_refs` 或 `finding_refs`（≥1）；
- 至少 1 条认可类输出（`attack_vector: "recognition"` 或角色总结）。

---

## 3.6 Agent-06 · Judge-Agent（六维判定）

### 3.6.1 职责

- 汇总 Analyzer / Evidence / Critic 产物，输出六维评分、总分、评级、一句话结论与决策建议。

### 3.6.2 输入

全量产物（ObjectProfile + Findings + Evidence + Critiques）。

### 3.6.3 输出 `SixDimScore`

```json
{
  "score*": 84,
  "grade*": "A",
  "grade_label*": "优秀",
  "dimensions*": {
    "technical": 9, "innovation": 6, "engineering": 9,
    "ecosystem": 8, "risk": 7, "strategic": 9
  },
  "verdict*": "优秀工程项目，但创新价值被高估。",
  "one_liner*": "工程扎实，创新是旧瓶装新酒。",
  "decision*": { "learn": true, "contribute": false, "invest": false, "research": true },
  "rationale": "…逐维说明扣分依据（引用 finding/critique id）…",
  "risk_flags": ["创新依赖既有技术组合", "无长期维护承诺"]
}
```

评分模型（权重表、扣分规则、评级）见 [06-scoring-report.md](06-scoring-report.md) §6.2-6.4。

### 3.6.4 Prompt 要点

1. 你是首席判定官：打分必须「先列证据后给分」，每个维度分要能引用到 finding/critique id；
2. 不得凭感觉微调；证据充分度用 Evidence 置信度加权；
3. `verdict` 与 `one_liner` 是最终立场，必须与评分一致（高分不能配毒舌低评）。

### 3.6.5 质量门槛

- `dimensions` 六键齐全、各 ∈ [0,10]；`score` = 按权重公式计算值（允许 ±1 舍入），必须可复核；
- `decision` 四键齐全；`verdict` 非空。

---

## 3.7 Agent-07 · Report-Agent（模板渲染）

### 3.7.1 职责

- 按输出模式（Quick / Expert / Academic）渲染人类可读报告；
- 输出机器可读 JSON（ReviewReport）；
- 持久化评审记录到 Review Store（见 [08-engineering.md](08-engineering.md) §8.2）。

### 3.7.2 输入

全量产物 + `output_mode` + `output_channel`。

### 3.7.3 输出 `ReviewReport`

```json
{
  "schema_version*": "1.0",
  "report_id*": "rr-20260801-a1b2c3",
  "target": { "type": "repo", "title": "foo/bar", "url": "https://github.com/foo/bar" },
  "score": { "…": "SixDimScore 全量" },
  "findings": [ "…": "Finding[]（含证据状态）" ],
  "critiques": [ "…": "Critique[]" ],
  "degradations": [],
  "meta": { "duration_seconds": 142, "toolchain": { "tree_sitter": false, "github_api": true } }
}
```

### 3.7.4 Prompt 要点

1. 你是报告渲染师：只按模板重组既有产物，**禁止新增内容、禁止改变结论**；
2. 人类报告结论置顶（分数 → 一句话 → 关键发现），细节靠后；
3. JSON 必须通过 Schema 校验，字段缺失宁可空数组不可编造。

### 3.7.5 质量门槛

- 报告三模板之一非空；JSON 通过 §6.7 Schema 校验；
- 报告内容与产物链逐条可回溯（每个结论能找到 finding/ev/crit id）；
- 持久化成功（Review Store 写入）后流水线才算 DONE。

---

## 3.8 Agent 依赖矩阵

| Agent | 依赖工具 | 是否必需 | 无工具时 |
|-------|----------|----------|----------|
| Discovery | 无（纯规则/宿主判断） | — | — |
| Chunk | Tree-sitter / GROBID / Trafilatura / embedding | 否 | 启发式/定长切分 |
| Analyzer | 各分析器插件（GitHub API、Semantic Scholar、Semgrep 等） | 否 | 文本启发式分析 |
| Evidence | GitHub API / Semantic Scholar / 本地 FS | 否 | 全部标 `unverifiable` |
| Critic | 无（宿主 LLM） | — | 宿主能力 |
| Judge | 无（宿主 LLM） | — | 宿主能力 |
| Report | 无（宿主 LLM + 模板） | — | — |

> 结论：**无任何外部工具时流水线依然完整可跑**，代价是 Evidence 大量 `unverifiable`、Chunk 退化为定长切分——这些都会如实写入 `degradations` 与报告，保证「降级不撒谎」。
