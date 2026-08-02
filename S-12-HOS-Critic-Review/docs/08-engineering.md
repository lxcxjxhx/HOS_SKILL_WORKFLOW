# 08 · 工程落地、路线图与伦理

> 本文档定义实现形态、目录结构、技术选型、测试策略、CI、发布、实施路线图、规格变更流程，以及必须遵守的风险与伦理红线。

---

## 8.1 实现形态

**Skill 为主，脚本为辅**（呼应项目定位「Agent Skill，非独立工具」）：

| 部分 | 内容 | 运行时 |
|------|------|--------|
| 核心（必须） | `SKILL.md` + `agents/*.md` + `templates/` + `references/` + `database/` | 无（宿主 LLM 直接执行） |
| 辅助脚本（可选增强） | `scripts/`：CLI 包装、切片器、分析器、渲染器 | Node（TypeScript）为主 + Python（GROBID/Trafilatura 生态） |

**能力分层**：

```
L0 宿主能力    —— 永远可用：识别、切片兜底、批判、评分、报告（全部智能环节）
L1 纯 JS 脚本 —— 可选：Markdown AST 切片、CLI、JSON 渲染、Review Store
L2 外部工具   —— 可选增强：Tree-sitter、GROBID/PyMuPDF、Trafilatura、GitHub/Semantic Scholar API、Semgrep 等
```

> 工程落地要求：L0 单独成立（离线可跑出完整报告）；L1/L2 缺失全部如实记录 `degradations`，绝不假装拥有。

---

## 8.2 完整目录结构

```
HOS-CRITIC-REVIEW/
├── README.md
├── SKILL.md                     # Skill 入口（frontmatter：name/description 触发词）
├── docs/                        # 本规格集（本文档）
│   ├── 01-overview.md … 08-engineering.md
├── agents/                      # 七 Agent Prompt 规格（宿主按此扮演）
│   ├── 01-discovery.md … 07-report.md
├── chunk-engine/                # 切片规则 + 参数默认值（对应 docs/04）
├── analyzers/
│   ├── manifest.yaml            # 插件注册清单
│   └── *.md                     # 各分析器检查点说明（对应 docs/05）
├── templates/                   # 报告模板（Quick/Expert/Academic）
├── references/                  # 评分模型、HCR-FIND 编号、风格指南
├── database/                    # Review Store（自动生成）
│   ├── reviews.json             # 评审记录索引
│   ├── findings.json            # HCR-FIND 登记表
│   └── objects.json             # 对象档案（含二次评审历史）
├── config.yaml                  # 权重/阈值/降级开关/输出模式
├── schemas/                     # 正式 JSON Schema（对应 docs/06 §6.9）
├── scripts/                     # 可选辅助脚本（见 §8.3）
├── tests/                       # fixtures + 快照 + mock（见 §8.4）
└── .github/workflows/ci.yml     # CI（见 §8.5）
```

---

## 8.3 技术选型与依赖清单

### 8.3.1 脚本层（scripts/，均为**可选**依赖）

| 能力 | 首选 | 备用 | 必需性 |
|------|------|------|--------|
| Markdown/文本切片 | TypeScript + remark/unified | 正则 | 可选 |
| 代码 AST 切片 | tree-sitter（node 绑定） | 语言启发式 | 可选 |
| PDF 论文解析 | Python + GROBID 客户端 / PyMuPDF | 标题正则 | 可选 |
| 网页正文抽取 | Python + Trafilatura | Readability | 可选 |
| CLI / 渲染 / Store | TypeScript + zod（Schema 校验） | — | 可选 |
| 静态分析 | Semgrep / CodeQL / Trivy（外部 CLI） | — | 可选 |

> **零依赖可运行**：任何脚本都不装时，Skill 依然完整（L0）。脚本只提升质量与自动化。

### 8.3.2 工具探测与降级开关

- 启动时探测：`tree-sitter`、`python`、`grobid`、`trafilatura`、网络可用性；
- `config.yaml#degradation` 控制哪些能力允许降级（默认全部允许）与强制降级（`--no-network`）；
- 探测结果写入报告 `meta.toolchain`（当前已记录，见 §3.7）。

---

## 8.4 测试策略

| 层级 | 内容 | 工具 |
|------|------|------|
| Schema 测试 | 产物通过 §6.9 Schema；六维齐全；score 公式可复核 | zod / JSON Schema 校验器 |
| 单元测试 | 切片器（fixture 覆盖率 ≥ 95%）、编号分配、扣分计算 | Vitest / pytest |
| 快照测试 | 报告模板输出与基准快照一致（内容不漂移） | 快照比对 |
| Mock 测试 | GitHub / Semantic Scholar API 用 mock 响应（限流/缓存/错误路径） | MSW / respx |
| 降级测试 | 无工具模式跑通全链（L0 完成率 100%） | CI job |
| 一致性测试 | 同一 fixture 两次评审，评分差异 ≤ 3 分（抽样人工复核） | 脚本 |

fixtures 目录：`tests/fixtures/`（迷你仓库快照、样例论文 md/pdf、样例 LICENSE、样例方案 md、数据集说明）。

### 基准集（M4）

- 建立「评审基准集」：10 个覆盖 7 类对象的已知对象（人工预评，作为校准锚点）；
- 每次模型/规则变更后跑基准集，监控：评分漂移、评级翻转率、关键 finding 召回。

---

## 8.5 CI / 发布

### CI（.github/workflows/ci.yml）

1. lint + typecheck（TS + Python）；
2. 单元测试 + Schema 测试；
3. 快照测试 + 降级测试（L0 无工具 job）；
4. 基准集回归（M4 起）。

### 发布

- 形态：Git 仓库 + release 打包（`hos-critic-review-<ver>.zip`：SKILL.md + agents + templates + docs + scripts + schemas）；
- 版本号语义化；`schema_version` 与脚本版本解耦（规格变更走 §8.6 流程）；
- 分发渠道：GitHub Release；后续可自建 marketplace（不沿用既有项目注册机制，独立实现）。

---

## 8.6 规格变更流程

1. 任何影响产物 Schema / 评分公式 / 编号规则 / 事件契约的变更，先改本文档集对应章节；
2. 标注 `schema_version` 变更（主版本：破坏性；次版本：增量）；
3. 同步更新：`schemas/`、`agents/*.md` Prompt 要点、`references/`；
4. 跑基准集确认漂移可解释；变更记录写入 `CHANGELOG.md`。

---

## 8.7 实施路线图

### M1 · 骨架（目标：L0 全链可跑） ✅ v0.1.0

- [x] SKILL.md + 七 Agent md（按 docs/03 Prompt 要点落稿）
- [x] templates/ 三模板 + references/ 评分模型与编号
- [x] 文本/文章/方案切片规则（docs/04 的 text 部分）落地为规则文件
- [x] 文本启发式 Analyzer + 空工具全链跑通（Quick 报告）
- **验收**：`paper/article/proposal` 三类对象零依赖出报告；Schema 校验通过

### M2 · 插件与证据（目标：repo/paper 真数据） ✅ v0.2.0

- [x] scripts/ 骨架：CLI + JSON 渲染 + Review Store
- [x] GitHub Analyzer + Paper Analyzer（含 mock 测试）
- [x] Evidence 校验（API 接入、缓存、置信度、反例修正）
- [x] Expert 报告模板完整化
- **验收**：`github/paper` 两类对象真网络跑通；证据覆盖率 100%（允许 unverifiable）

### M3 · 工具增强（目标：质量提升） ✅ v0.3.0

- [x] 切片引擎泛化改造（docs/04 v2：统一管线 + 语义角色标注 + 边界检测器插件）
- [x] Code Analyzer（semgrep + 正则兜底）+ Dataset Analyzer + License Analyzer
- [x] tree-sitter 边界检测器 + PyMuPDF 论文 PDF 解析链
- [x] 事件流（`--events`）+ `run` 命令 + `--until` 截断
- **验收**：7 类对象全覆盖；CI 门禁示例跑通

### M4 · 打磨与发布（目标：可信、可发布） 🔶 v0.3.0（主体完成）

- [x] 基准集 + 校准（`benchmark/manifest.json` + `scripts/calibrate.ts`，评分漂移监控）
- [~] 性能优化（缓存、并行、上下文预算实测）—— 部分完成（文件缓存已实现；预算表待实测）
- [x] 降级/异常路径全面测试；文档审计
- [x] 首个 Release 就绪（版本 0.3.0、CHANGELOG、CI workflow、.gitignore）
- **验收**：[01-overview.md](01-overview.md) §1.3 度量表逐项核对（基准集/CI 已具备，剩余打磨项见 README）

---

## 8.8 风险与伦理红线

### 8.8.1 毒舌边界

1. **攻击对象，不攻击人/团队/机构**：可骂方法、证据、实验、设计；禁止对作者/维护者的人格攻击；
2. 毒舌是表达效果，最终判断必须可辩护（每条 Critique 有 reasoning 指向事实）；
3. 默认辣度 3（0-5 可配置）；公开渠道输出自动降辣（保留攻击性，收敛用词）。

### 8.8.2 证据底线

1. **No Evidence No Criticism**：查不到必须写「查不到，证据缺口」，禁止编造核验结果；
2. 未公开代码/数据只能基于可见文本推断，推断须标注 `confidence: low`；
3. 外部 API 返回异常/限流时如实记录，禁止用猜测填充。

### 8.8.3 数据合规

1. GitHub / Semantic Scholar API 遵守限流与 ToS；本地缓存避免打爆配额；
2. Review Store 只存评审产物与元数据，**不存** API Token、私钥、用户敏感信息；
3. 涉及未公开仓库/付费内容时，仅基于可合法访问的信息评审。

### 8.8.4 已知风险表

| 风险 | 影响 | 缓解 |
|------|------|------|
| LLM 打分漂移（同一对象不同模型评分差） | 评级不可复现 | 基准集 + 扣分规则机械化 + 一致性测试 |
| 外部 API 不可用 | Evidence 变 unverifiable | 降级链 + 缓存 + 报告标注 |
| 超大对象预算失控 | 上下文溢出 | 抽样策略 + 上下文预算表（§2.4） |
| 切片破坏语义 | 分析误判 | 覆盖率/规模门槛 + 语义合并 |
| 毒舌越界 | 声誉/合规风险 | 红线清单 + 辣度控制 + 公开转化规则 |
| 规格与实现漂移 | 契约失效 | §8.6 变更流程 + CI 校验 |

---

## 8.9 最终验收清单（对应 §1.3）

- [ ] 端到端 ≤ 5 分钟（典型对象，L1/L2 可用时）
- [ ] 发现可追溯率 100%（finding → evidence → source）
- [ ] 证据可核验率 ≥ 90%（非 unverifiable 占比）
- [ ] 报告 Schema 合法率 100%
- [ ] 零工具环境全链完成率 100%
- [ ] 毒舌红线零违规（人工抽检）
