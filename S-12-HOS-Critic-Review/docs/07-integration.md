# 07 · 接入契约（AI IDE / CLI / 工作流）

> 本文档定义 HOS-CRITIC-REVIEW 如何接入各类 AI IDE、如何被 CLI 调用、如何与其他工作流交换数据。
> 设计约束（来自项目定位）：**本质是 Agent Skill，依赖宿主 LLM；但必须能工程落地、能接入任意工作流**——因此所有交互都有稳定 JSON 契约。

---

## 7.1 三种接入形态

| 形态 | 使用者 | 说明 |
|------|--------|------|
| A · AI IDE Skill | Claude Code / Cursor / VS Code / 通用 CLI Agent 的用户 | 主形态：宿主 LLM 按 `SKILL.md` + agents 规格执行 |
| B · CLI 命令 | 脚本 / CI / 手动 | 可选辅助脚本 `hos-critic-review`，包装流水线并输出契约 JSON |
| C · 工作流 JSON | 上游系统（博客管线、周报、决策看板） | 纯数据接口：输入载荷 + 事件流 + 结果 JSON |

三种形态输出同一份 `ReviewReport` Schema（[06-scoring-report.md](06-scoring-report.md) §6.9），保证任意形态可互换。

---

## 7.2 形态 A · AI IDE Skill 接入

### 7.2.1 目录契约（安装即用）

```
HOS-CRITIC-REVIEW/
├── SKILL.md                  # 入口：定位、触发词、快速路径、文档指针
├── agents/                   # 每个 Agent 一个 md（宿主按 Prompt 规格扮演）
│   ├── 01-discovery.md
│   ├── 02-chunk.md
│   ├── 03-analyzer.md
│   ├── 04-evidence.md
│   ├── 05-critic.md
│   ├── 06-judge.md
│   └── 07-report.md
├── chunk-engine/             # 切片规则（对应 docs/04）
├── analyzers/
│   └── manifest.yaml         # 插件注册清单
├── templates/                # 报告模板（Quick/Expert/Academic）
├── references/               # 评分模型、编号体系、风格指南等
├── database/                 # Review Store（评审记录、编号登记）
└── scripts/                  # 可选辅助脚本（hcr CLI、渲染器等）
```

### 7.2.2 宿主接入点（各 IDE 的最小落地）

| 宿主 | 安装方式 | 入口 |
|------|----------|------|
| Claude Code | 复制到 `~/.claude/skills/HOS-CRITIC-REVIEW/` 或项目 `.reasonix/skills/` | `SKILL.md` frontmatter（name + description 触发） |
| Cursor | `.cursor/rules/` 引用 `SKILL.md`，或在 rules 中声明触发 | rules 文件 |
| VS Code 扩展 | 自定义 Command 加载 `SKILL.md` 到上下文 | command |
| 通用 CLI Agent（如 `claude -p`） | `claude -p "hos-critic-review paper x.pdf"` 等自然语言触发 | 触发词见 SKILL.md |

### 7.2.3 Skill 执行快速路径

- 触发后宿主先读 `SKILL.md`，按对象类型走「最小可用路径」（例如：单篇论文 → 从 Chunk 或 Analyzer 起步，跳过外部抓取类步骤）；
- 每次执行按 `docs/` 规格逐步产出临时 JSON，最后渲染报告并写 Review Store；
- **宿主无需安装任何运行时**即可完成全部智能环节；辅助脚本（`scripts/`）只做可选增强。

---

## 7.3 形态 B · CLI 命令

### 7.3.1 语法

```bash
hos-critic-review <type> <target> [options]
hos-critic-review github https://github.com/foo/bar --mode expert --json out.json
hos-critic-review paper paper.pdf --mode academic --until judge
hos-critic-review article article.md --quick
```

`<type>`：`github | paper | article | dataset | license | proposal | auto`（auto 交给 Discovery）。

### 7.3.2 选项

| 选项 | 说明 | 默认 |
|------|------|------|
| `--mode <quick|expert|academic>` | 报告模式 | quick |
| `--json <path>` | 额外输出 ReviewReport JSON | 无 |
| `--until <stage>` | 截断执行到某阶段（discovery/chunk/analyze/evidence/critic/judge/report） | report |
| `--config <path>` | 配置文件（权重、阈值、降级开关） | 内置默认 |
| `--input-json <path>` | 从文件读工作流 JSON 载荷（跳过 `<type> <target>`） | 无 |
| `--no-network` | 禁用一切外部 API | 自动探测 |
| `--verbose` | 打印每阶段产物摘要与耗时 | 关 |

### 7.3.3 退出码约定（工作流集成用）

| 码 | 含义 |
|----|------|
| `0` | 成功（含降级完成） |
| `1` | 输入/参数错误（E_INPUT） |
| `2` | 流水线失败（FAILED，见错误码 JSON） |
| `3` | 产物未通过质量门槛但已尽力输出（附 `degradations`） |

### 7.3.4 stdout 约定

- 人类报告默认输出到 stdout；
- `--json` 时 stdout 仅输出一行摘要（`REPORT_ID=rr-… SCORE=84 MODE=quick`），JSON 写入文件，避免混流；
- 机器可读错误统一为 `{"code":"E_*","message":"…","stage":"…"}`。

---

## 7.4 形态 C · 工作流 JSON 契约

### 7.4.1 输入载荷（Input Payload）

```json
{
  "request_id": "req-123",
  "target": { "kind": "url", "raw": "https://github.com/foo/bar" },
  "options": { "mode": "expert", "until": "report", "no_network": false },
  "context": { "tags": ["weekly-review"], "callback": "https://…/webhook" }
}
```

`target.kind`：`url | path | text | json`。工作流可通过 `context` 传递业务上下文（标签、回调）。

### 7.4.2 事件流（Event Stream）

每完成一个阶段，向 stdout（`--events`）或回调发送事件：

```
{"event":"review.started","request_id":"req-123","ts":"…"}
{"event":"discovery.done","artifact_id":"obj-…","type":"repo","complexity":"medium"}
{"event":"chunk.done","units":42,"strategy":"code-tree-sitter"}
{"event":"analyze.done","findings":7,"critical":1,"high":2}
{"event":"evidence.done","verified":5,"unverifiable":2}
{"event":"critic.done","critiques":9,"roles":["principal-engineer","security-auditor"]}
{"event":"judge.done","score":84,"grade":"A"}
{"event":"report.done","report_id":"rr-…","schema_version":"1.0"}
{"event":"review.finished","request_id":"req-123","status":"ok","degradations":[]}
```

### 7.4.3 事件订阅规则

- 订阅者按 `event` 前缀过滤；`*.done` 事件携带该阶段产物摘要（不携带全量，全量走 ReviewReport）；
- 事件序列固定且单调；`review.finished` 是终止事件；
- `--until <stage>` 模式下，终止事件为 `<stage>.done`（且 `review.finished` 标记 `truncated: true`）。

### 7.4.4 钩子（Hook）

| 钩子 | 时机 | 用途 |
|------|------|------|
| `pre_review` | 流水线启动前 | 校验载荷、注入配置 |
| `post_report` | 报告完成后 | 推送、归档、触发下游 |

实现为 `context.hooks` 中的 URL 或本地脚本路径；失败不阻断主流程（记 `degradations`）。

---

## 7.5 集成示例

### 示例 1：周报管线

```
数据源 → 批量 Input Payload → hos-critic-review --input-json a.json --events
      → 收集 review.finished → 按 score/class 聚合 → 周报渲染
```

### 示例 2：决策看板

```
PR 评审请求 → 事件 discovery.done/analyze.done → 实时进度
           → judge.done 分数 → 看板卡片（Quick 模板）
```

### 示例 3：上游 CI 门禁（可选的评审质量门）

```
pr: 触发 → review --until evidence --json out.json
     → 脚本检查 critical findings 是否被 Evidence 证实
     → 任一 CRITICAL verified → 阻断合并并回贴报告
```

---

## 7.6 MCP 展望（远期，不阻塞 M1-M3）

- 可选：提供 MCP server（`scripts/mcp-server.ts`）暴露 `review` 工具，供支持 MCP 的 IDE（Claude Desktop / VS Code）直接调用；
- 契约：工具入参 = Input Payload，出参 = ReviewReport JSON；
- 状态：列为 M4 之后的增强项，M1-M3 不依赖。
