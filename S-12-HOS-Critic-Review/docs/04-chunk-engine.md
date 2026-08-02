# 04 · Chunk Engine（泛化语义切片引擎）

> 本文档定义 Chunk-Agent 的底层引擎。**核心设计原则：一套统一、细化的语义切片管线适用于所有对象类型；专用工具（Tree-sitter / GROBID / Trafilatura 等）只是可选注入的「边界检测器」插件，不是割裂的三套逻辑。**
>
> 切片目标：切到**可独立评审的语义单元**（论点段 / 函数 / 条款），并为每个单元标注**语义角色**（claim / evidence / method / …），让下游 Analyzer 直接按角色定向分析。

---

## 4.0 设计理念（v2 升级）

### 旧模型（v1，按类型割裂）

```
Router → { Code Parser (Tree-sitter) | Paper Parser (GROBID) | Text Parser (Trafilatura) } → Merge
```

问题：三套逻辑各自为政，单元模型不统一，粒度随 parser 漂移，难以泛化到新对象类型（产品方案、数据集、License）。

### 新模型（v2，统一管线 + 工具插件）

```
                    输入内容（任意对象）
                          │
   ┌──────────────────────▼──────────────────────┐
   │        统一语义切片管线（Universal Pipeline） │
   │  ① Unitize  结构感知单元化（边界检测器插件）  │
   │  ② Merge    语义归并（embedding，可选）      │
   │  ③ Constrain 规模约束（≤4K tokens，递归下钻）│
   │  ④ Annotate 语义角色标注（claim/evidence/…） │
   └──────────────────────┬──────────────────────┘
                          │
                   ReviewUnit[]（统一模型）
```

- **泛化**：管线与单元模型对所有对象类型一致；对象类型只影响「角色标注词典」与「边界检测器选择」；
- **细化**：单元切到 L2 语义块（函数/论点段/条款），并带 L1 分区归属与 role 标注；
- **工具即插件**：Tree-sitter（代码边界）、GROBID（论文边界）、Trafilatura（网页边界）等通过统一接口注入；可用则用，不可用则启发式检测器兜底——**干什么事调用什么工具**。

---

## 4.1 统一单元模型

### 4.1.1 语义单元层级（Universal Unit Taxonomy）

| 层级 | 名称 | 说明 | 示例 |
|------|------|------|------|
| L1 | 分区（Section） | 对象的顶层结构单元 | 章节 / 模块 / 提案段 / 许可条款组 |
| L2 | 语义块（Block） | 可独立评审的语义单元 | 函数 / 论点段 / 方法描述 / 数据段 / 条款 |
| L3 | 原子（Atom） | 极小单元（仅超限时下钻） | 单句 / 单个 API 调用 / 单个条款句 |

切片默认产出 L1 + L2；仅当 L2 块超过规模上限时递归下钻到 L3。

### 4.1.2 统一 `kind` 枚举（跨对象）

| kind | 含义 | 典型对象 |
|------|------|----------|
| `section` | 通用分区（章节/标题段） | 文章/论文 |
| `proposal-section` | 提案分区（背景/方案/计划/风险/收益） | proposal |
| `module` | 代码文件/模块级 | repo |
| `code-function` | 函数/方法 | repo |
| `code-class` | 类 | repo |
| `code-block` | 代码片段（配置/脚本段） | repo/文章 |
| `claim-block` | 论点/宣称块 | 全部 |
| `method-block` | 方法/架构描述块 | 全部 |
| `evidence-block` | 实验/数据/指标块 | 全部 |
| `context-block` | 背景/动机块 | 全部 |
| `config-block` | 部署/依赖/要求块 | 全部 |
| `risk-block` | 风险/限制/免责块 | 全部 |
| `outcome-block` | 结论/展望块 | 全部 |
| `license-clause` | 许可条款（Grant/Conditions/Limitations/Warranty） | license/repo |
| `dataset-field` | 数据集字段说明段 | dataset |
| `reference-block` | 参考文献/链接清单 | paper/文章 |

### 4.1.3 语义角色标注（Semantic Role Annotation）

每个 L2 单元标注 `role`（统一枚举，跨对象）：

| role | 含义 | 识别信号（标题关键词/内容特征） |
|------|------|--------------------------------|
| `claim` | 宣称/主张 | 标题含「宣称/主张/我们提出/优势/首创/abstract」；内容含「我们声称/优于/SOTA」 |
| `evidence` | 证据/数据 | 标题含「实验/数据/结果/指标/benchmark」；内容含「准确率/%/样本/数据集/性能」 |
| `method` | 方法/实现 | 标题含「方法/架构/实现/算法/方案/method/approach」 |
| `context` | 背景/动机 | 标题含「背景/简介/介绍/问题/引言/introduction/motivation」 |
| `config` | 配置/依赖 | 标题含「部署/依赖/要求/安装/环境/setup/config」；内容含「需要/依赖/版本/Key」 |
| `risk` | 风险/限制 | 标题含「风险/限制/免责/安全/limitation/risk/warranty」 |
| `outcome` | 结论/展望 | 标题含「结论/总结/展望/路线图/conclusion/future」 |
| `reference` | 引用/链接 | 标题含「参考文献/references/链接」 |
| `unknown` | 未识别 | 兜底 |

> role 是 Analyzer 的定向入口：如 `evidence` 块直接送数据检查点，`claim` 块送宣称核验点——这是「细化」的实际收益。

### 4.1.4 ReviewUnit Schema

```json
{
  "unit_id": "unit-002",
  "level": 2,
  "kind": "claim-block",
  "role": "claim",
  "title": "核心方案",
  "content": "…原文…",
  "tokens": 900,
  "source_range": { "file": null, "start_line": 12, "end_line": 30, "path": "核心方案" },
  "parent_id": "unit-001",
  "tags": ["architecture"]
}
```

---

## 4.2 统一切片管线（Universal Pipeline）

### ① Unitize（单元化）

1. **L1 分区检测**：识别顶层结构边界
   - Markdown/富文本：`#`/`##`/`###` 标题行（标题级别 → 分区层级）；
   - 提案/文章：章节关键词（背景/方案/计划/风险…）；
   - 论文：章节标题正则 + Abstract/References 锚点；
   - 代码：文件/模块边界（由检测器插件给出，见 4.3）；
   - 无标题文本：连续空行分隔的自然段组。
2. **L2 语义块检测**：在分区内切语义块
   - 段落（空行分隔）→ 语义块；
   - 代码函数/类（函数头 + 缩进体）→ `code-function`/`code-class`；
   - 条款（Grant/Conditions/Limitations/Warranty 关键词）→ `license-clause`；
   - 表格/列表 → 并入所属块或独立 `evidence-block`；
   - 边界检测器插件（可用时）覆盖启发式边界（见 4.3）。

### ② Merge（语义归并，可选）

- embedding 相似度 ≥ 0.85 的相邻小块合并（默认关闭，开启需 embedding 可用）；
- 无 embedding：跳过，不降级（启发式块已足够细）。

### ③ Constrain（规模约束）

- 每块 token ≤ `unit_max_tokens`（4000）；
- 超限递归下钻：块内按子标题 → 句号/分号边界折半（L3 原子）；
- 覆盖检查：全部单元并集覆盖原文 ≥ 95%。

### ④ Annotate（角色标注）

- 按 §4.1.3 词典，先匹配标题关键词，再匹配内容特征；
- 未命中 → `role: "unknown"`（不强制猜）；
- 输出 `ChunkResult`（含 strategy 与工具使用记录）。

---

## 4.3 边界检测器插件（Boundary Detector）

> 工具不是三套割裂 parser，而是注入管线的「边界检测器」：**干什么事调用什么工具**。所有检测器实现同一接口，返回强边界块；可用则优先，不可用则启发式兜底。

```ts
interface BoundaryDetector {
  id: string;                       // 'tree-sitter' | 'grobid' | 'trafilatura' | 'heading' | 'blank-line' | 'indent'
  available(): boolean;             // 工具是否可用（存在性/网络探测）
  detect(ctx: { type: ObjectType; text: string; lang?: string }): Promise<Block[]>;
  // Block: { kind, title, start, end, level }
}
```

| 检测器 | 适用 | 判定边界 | 不可用时兜底 |
|--------|------|----------|--------------|
| `tree-sitter`（可选） | repo 代码 | AST 节点（函数/类/模块） | `indent` 启发式 |
| `grobid`（可选） | paper PDF | TEI Section Tree | `heading` 正则 |
| `trafilatura`（可选） | article HTML | 正文抽取后的标题/段落 | `heading`/`blank-line` |
| `heading`（内置） | 全部 | 标题行/章节关键词 | — |
| `blank-line`（内置） | 全部 | 空行分段的自然段 | — |
| `indent`（内置） | 代码文本 | 函数头（def/function/class/func）+ 缩进体 | 整文件单块 |

**内置检测器永远可用**（零依赖）；外部检测器通过 `available()` 探测，注入后按 `[tree-sitter → heading → blank-line]` 优先级合并边界。

### 工具选择表（原 Router 决策表，降级为插件选择）

| type | 可选检测器 | 角色词典 | 说明 |
|------|-----------|----------|------|
| `repo` | tree-sitter | code + 通用 | 代码边界优先 AST |
| `paper` | grobid | 论文 + 通用 | PDF 优先 TEI |
| `article` | trafilatura | 通用 | HTML 优先正文抽取 |
| `proposal` | — | 提案 | 章节关键词 |
| `license` | — | 许可 | 条款关键词 |
| `dataset` | — | 数据 | 字段关键词 |
| `unknown` | — | 通用 | 兜底 |

---

## 4.4 各类对象的细化要点

### 代码（repo）

- L1 = 文件/模块；L2 = 函数/类；L3 = 超长函数内的逻辑块（if/for 边界）；
- 单元继承链保留：`parent_id`（方法 → 类 → 文件）；
- 文件头（imports/常量）独立成 `module` 块，不并入第一个函数；
- 无 tree-sitter：`indent` 检测器按函数头 + 缩进体切（2+ 空行分段兜底）。

### 论文（paper）

- L1 = 章节（Abstract 必须独立）；L2 = 章节内论点段；
- Abstract 角色强制 `claim`；Experiments 角色强制 `evidence`；
- References 合并为 `reference-block`（需逐条核验时拆 L2）。

### 文章/提案/数据集/License

- 文章：L1 = 标题分区，L2 = 论点段；
- 提案：L1 = 背景/方案/计划/风险/收益 分区（缺失章节本身是潜在 Finding：结构不完整）；
- 数据集：L1 = 规模/来源/许可/字段 分区；
- License：L1 = 条款组，L2 = 单个条款（Grant/Conditions/Limitations/Warranty/附加条款）。

---

## 4.5 参数表（全部可配置，默认值如下）

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `unit_max_tokens` | 4000 | 全部单元硬上限 |
| `fallback_chunk_size` | 1500 | 无边界时定长兜底 |
| `fallback_overlap` | 150 | 定长兜底重叠 |
| `merge_threshold` | 0.85 | 语义归并相似度（默认关闭） |
| `coverage_threshold` | 0.95 | 覆盖检查 |
| `sample_target_tokens` | 200000 | 超大对象抽样上限 |
| `section_regex` | 见 §4.4 | 章节识别正则 |
| `max_parallel_slices` | 4 | 大对象并行切片数 |
| `token_estimate` | chars/2 | 中文为主对象的 token 估算 |

---

## 4.6 质量门槛（不变）

1. `units` 非空；
2. 全部单元 `tokens ≤ unit_max_tokens`；
3. 单元并集覆盖 ≥ 95%（抽样模式按已纳入范围）；
4. 全部单元带定位信息（行号区间 / 章节路径 / 页码）；
5. 单元间不重叠；
6. **L2 及以上单元必须带 role**（`unknown` 允许，但占比 ≤ 20%，否则视为标注失败重跑）。

违规处理：换低一层检测器重切一次；仍违规 → 整对象单单元 + 记录 `degradations`。

---

## 4.7 降级链（统一）

```
完整管线（检测器插件 + 角色标注）→ 内置检测器（heading/blank-line/indent）→ 定长切分（1500/150）→ 整对象单单元
```

任何降级写入 `ChunkResult.degradations`，并透传到报告（降级不撒谎）。
