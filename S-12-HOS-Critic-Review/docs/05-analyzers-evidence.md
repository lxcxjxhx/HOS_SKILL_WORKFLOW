# 05 · Analyzer 插件系统与 Evidence 校验规范

> 本文档定义分析层（Analyzer 插件）与证据层（Evidence Verifier）的完整规格，以及独立编号体系 HCR-FIND。

---

# Part A · Analyzer 插件系统

## 5.1 插件接口

每个 Analyzer 插件实现统一接口，供编排层调度：

```ts
interface AnalyzerPlugin {
  id: string;                 // 如 "github-analyzer"
  supports(profile: ObjectProfile): boolean;   // 是否适用该对象
  analyze(units: ReviewUnit[], profile: ObjectProfile, ctx: ToolContext): Promise<Finding[]>;
  // ctx: 网络能力、缓存、已安装工具探测、宿主 LLM 回调（可选）
}
```

### 注册机制（Manifest 声明式）

- 插件清单文件 `analyzers/manifest.yaml`（或 JSON）声明：id、名称、适用 type、所需工具、是否默认启用、可选依赖；
- 编排层按 `supports(profile)` 过滤 → 默认启用集合 → 并行调度；
- 插件缺失/工具不可用时：该插件跳过并记 `degradations`，**不影响其他插件**。

## 5.2 内置插件清单

| 插件 id | 适用 type | 所需工具 | 默认启用 |
|---------|-----------|----------|----------|
| `github-analyzer` | repo | GitHub API / 本地 FS | 是 |
| `code-analyzer` | repo | Semgrep / CodeQL / Trivy / dependency-check | 可选 |
| `paper-analyzer` | paper | Semantic Scholar API | 是 |
| `license-analyzer` | license / repo | 本地 FS / SPDX 数据 | 是 |
| `dataset-analyzer` | dataset | 本地 FS / 网络 | 是 |
| `text-heuristic-analyzer` | 全部 | 无（宿主 LLM） | 是（兜底） |

---

## 5.3 GitHub Analyzer（repo）

### 5.3.1 数据源（GitHub REST API）

| 端点 | 用途 |
|------|------|
| `GET /repos/{owner}/{repo}` | 基础信息：star/fork/watch、license、archived、created/pushed_at |
| `GET /repos/{owner}/{repo}/commits?per_page=100` | 提交频率、活跃度 |
| `GET /repos/{owner}/{repo}/issues?state=open&per_page=100` | issue 健康（积压、响应） |
| `GET /repos/{owner}/{repo}/pulls?state=closed&per_page=100` | PR 合并速度、规模 |
| `GET /repos/{owner}/{repo}/contributors?per_page=100` | 贡献者分布（bus factor） |
| `GET /repos/{owner}/{repo}/releases` | 发布节奏、版本成熟度 |
| `GET /repos/{owner}/{repo}/contents/LICENSE` | 许可证文本 |

### 5.3.2 指标与判定基准

| 指标 | 计算 | 健康阈值 | 对应 Finding class |
|------|------|----------|--------------------|
| 提交活跃度 | 最近 90 天平均周提交数 | ≥ 1/周 活跃；< 0.25/周 濒死 | `ECO` |
| 最近提交间隔 | `pushed_at` 距今 | ≤ 30 天健康 | `ECO` |
| PR 合并速度 | 近 50 个合并 PR 的中位合并时长 | ≤ 7 天健康 | `ECO` |
| Issue 积压 | open issues / total issues | > 0.5 预警 | `ECO` |
| Bus factor | 前 3 贡献者提交占比 | > 80% 单点风险 | `ECO` |
| 发布节奏 | releases/年 | ≥ 1/年 健康（工具类） | `ECO` |
| Star 异常 | star 数 vs fork/commit 数 | 异常高（营销）/异常低（价值不匹配） | `CLAIM` / `ECO` |

### 5.3.3 本地目录模式（无网络）

- 读取：README、LICENSE、CI 配置、package.json/pyproject.toml（依赖数、版本陈旧度）、.git 存在性；
- 产出：文档完整性（`REPRO`）、依赖陈旧（`SEC`/`REPRO`）、README 宣称 vs 实现（`CLAIM`）。

---

## 5.4 Paper Analyzer（paper）

### 5.4.1 数据源（Semantic Scholar API + arXiv 官方源）

| 端点 | 用途 |
|------|------|
| `GET https://arxiv.org/abs/<id>` | **必查**：标题/版本历史/发表状态（journal-ref）/代码链接佐证 |
| `GET /graph/v1/paper/search?query=…` | 定位论文元数据 |
| `GET /graph/v1/paper/{id}?fields=title,abstract,citationCount,venue,year,authors` | 引用量、venue、年份 |
| `GET /graph/v1/paper/{id}/citations?fields=title,year` | 被引时间线（引用衰减判断） |
| `GET https://api.github.com/repos/{owner}/{repo}` | 论文声称的代码仓库存在性/star/LICENSE |
| `GET https://doi.org/<doi>` | 数据集/artifact DOI 解析 |

> **铁律**：arXiv abs 页为 paper 对象默认核验源。论文自带 arXiv 链接/仓库链接时，必须尝试联网核验；网络不可用才降级（写入 `degradations`），不得未经尝试直接标 `unverifiable`。

### 5.4.2 检查点（映射到 Finding）

| 检查点 | 问什么 | 产出 class |
|--------|--------|-----------|
| Novelty | 方法与已发表工作的差异；是否拼接物 | `CLAIM` / `ARCH` |
| Baseline | 对比对象是谁；缺 SOTA 对比 | `EVAL` |
| Experiment | 指标完整性（P/R/F1 全套）、消融、统计显著性 | `EVAL` |
| Data | 数据集来源、规模、污染风险 | `DATA` |
| Repro | 代码/数据/参数是否公开 | `REPRO` |
| Hype | 摘要 vs 正文的强度差 | `CLAIM` |
| **元数据核验** | arXiv ID/版本/发表状态真实可查；声称的仓库/DOI/Zenodo 存在且指向一致 | `REPRO` / `CLAIM` |
| **出版状态** | 「已接收/已发表」声明是否有 arXiv journal-ref/会议页佐证 | `CLAIM` |
| Problem significance | 问题本身是否重要、是真问题还是凑数 | `CLAIM` |
| Soundness | 方法/数学/算法正确性；有无证明或严谨推导 | `ARCH` |
| Statistical validity | 是否多次运行并报均值±方差/置信区间/显著性检验 | `EVAL` |
| Design-order | 研究问题是否先于方法（先定方法后硬找问题） | `CLAIM` / `ARCH` |
| Real-world relevance | 结论是否只在玩具/合成场景成立 | `EVAL` / `CLAIM` |

> 无网络时降级：元数据/出版状态检查点标 `unverifiable` 并记录降级，其余检查点基于论文文本执行（标记 `unverifiable` 或 `partial`）；**网络可用时必须核验**。

---

## 5.5 License Analyzer（license / repo）

| 检查项 | 说明 | 产出 class |
|--------|------|-----------|
| SPDX 识别 | 匹配标准许可证标识（MIT/Apache-2.0/GPL-3.0/AGPL/BSD…） | — |
| 兼容性矩阵 | 与依赖许可证的冲突（GPL vs MIT、AGPL 商用限制） | `LIC` |
| 商用风险 | copyleft、专利授权条款、免责声明缺失 | `LIC` |
| 声明一致性 | 仓库声明 vs 实际依赖许可证 | `LIC` |

兼容性判定表（核心冲突规则，其余按 SPDX 工具）：

| 场景 | 判定 |
|------|------|
| 依赖含 GPL/AGPL 而主体为 MIT/Apache | 高风险（传染） |
| 主体 AGPL 用于内部 vs 对外服务 | 对外服务触发网络 copyleft，中高风险 |
| 依赖 MIT/Apache/BSD 而主体 GPL | 通常兼容 |
| 无 LICENSE 声明 | 默认保留所有权利，`REPRO`/`LIC` 风险 |

---

## 5.6 严重度定义（全系统统一）

| 严重度 | 定义 | 示例 |
|--------|------|------|
| `CRITICAL` | 结论整体失效/不可信 | 硬编码结果、基准泄漏、核心断言被证伪 |
| `HIGH` | 结论被显著削弱 | 样本过小、无基线、关键依赖漏洞 |
| `MEDIUM` | 结论部分受限 | 单语言验证、单厂商绑定、文档缺口 |
| `LOW` | 影响有限/改进建议 | 未报成本、可读性、非关键隐患 |
| `INFO` | 事实性备注（非问题） | 技术栈、架构说明 |

---

## 5.7 Text Heuristic Analyzer（兜底，无工具时）

- 适用：任何 type 在无外部工具时，由宿主 LLM 按检查点直接产出 Finding；
- 规则：只分析传入的 ReviewUnit 文本，禁止引用单元外信息；
- 输出严格遵循 Finding Schema（claim + evidence_draft 指向具体单元），证据状态一律先标 `unverifiable` 交给 Evidence-Agent。

---

# Part B · Evidence 校验规范

## 5.8 证据链结构

```
Claim (Finding)
   └── Evidence Point(s)
          ├── status: verified | refuted | partial | unverifiable
          ├── confidence: high | medium | low
          ├── sources[]: { kind, url, fetched_at, quote, status }
          └── adjustment: { severity_delta, action }   // 修正回写
```

## 5.9 置信度分级

| 置信度 | 条件 |
|--------|------|
| `high` | ≥ 1 个一手来源（官方 API/文件原文）且 `fetched_at` 新鲜（≤ 缓存周期） |
| `medium` | 二手来源 / 单来源 / 引用内容间接 |
| `low` | 推断性证据（无直接来源），仅作辅助 |

## 5.10 反例修正流程

1. Evidence 发现与 Finding 矛盾（`refuted` / `partial`）→ 生成 `adjustment`；
2. `severity_delta` 规则：`refuted -2 / partial -1 / verified +0（高置信可 +1，上限不越级两档）`；
3. 修正后的 Finding 必须**先于** Critic/Judge 生效；
4. 修正本身写入证据记录，保证可审计（「这条发现曾被证伪又上调」也是信息）。

## 5.11 校验降级链

```
一手 API（GitHub/Semantic Scholar）→ 缓存命中 → 本地文件核对 → 宿主知识（标 low 置信）→ unverifiable
```

---

# Part C · HCR-FIND 编号体系

## 5.12 编号格式

```
HCR-<CLASS>-YYYY-NNNN
例：HCR-EVAL-2026-0007
```

- `CLASS`：Finding.class 前缀（`ARCH | DATA | EVAL | SEC | REPRO | LIC | ECO | CLAIM`）；
- `YYYY`：发现年份；
- `NNNN`：**对象内**按发现顺序递增（0001 起），跨对象不全局唯一（唯一性由 `report_id + finding_id` 保证，编号用于人类可读追溯）。

## 5.13 分配规则

1. Analyzer 产出 Finding 时分配（临时序号）；Evidence 校验通过后由 Report-Agent 正式编号并登记；
2. 同一对象内按发现顺序递增，允许跨类混排；
3. 被 Evidence `refuted` 且降为 INFO 的发现保留编号但标记 `status: "refuted"`；
4. 登记表持久化到 Review Store（见 [08-engineering.md](08-engineering.md) §8.2 `findings.json`），同一对象二次评审时沿用历史编号并追加新发现。

## 5.14 登记表条目结构

```json
{
  "hcr_id": "HCR-EVAL-2026-0007",
  "report_id": "rr-20260801-a1b2c3",
  "object_id": "obj-3f2a9c",
  "class": "EVAL",
  "severity": "HIGH",
  "title": "无 SOTA 基线：仅与弱基线对比",
  "claim": "…",
  "evidence_status": "verified",
  "evidence_sources": ["https://api.semanticscholar.org/…"],
  "unit_refs": ["unit-003"],
  "patch": "补充与 ≥2 个近年 SOTA 的对比表",
  "status": "open",
  "created": "2026-08-01"
}
```

## 5.15 统计口径

Review Store 支持按 `class / severity / status` 聚合，供周报/看板消费：各分类分布、严重度占比、高频问题 TOP10、对象间横向对比（同一 class 在不同对象的出现率）。
