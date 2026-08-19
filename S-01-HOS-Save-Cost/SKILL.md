---
name: HOS-Save-Cost
version: 2.0.0
description: 轻量级 Token 管家 — 工作流层降本：任务拆分 + 交接文档 + Token 监控反馈。配套四层集成（原生 [[plugins]] 直连 MCP / caveman 精简输出 / RTK+CodeGraph 压缩输入 / 本 Skill 拆分上下文），与 skill-handler 配合按需加载、用完即卸载，避免 Skill 自身 description 常驻上下文
author: HOS Team
tags:
  - cost-optimization
  - token-efficiency
  - workflow-management
  - task-splitting
  - handoff
  - token-monitoring
  - context-management
compatibility:
  - reasonix
  - claude-code
  - cursor
  - windsurf
  - github-copilot
  - trae-cn
license: AGPLv3
metadata:
  category: productivity
  subCategory: cost-optimization
  risk-level: low
  confidence: 0.95
---

# 💰 HOS-Save-Cost

> **轻量级 Token 管家** — 在**工作流层面**降本：任务拆分 + 交接文档 + 监控反馈。
> 它不是"压缩工具"，而是"上下文管理器"，与工具层压缩互补、不重叠。

## 定位

本 Skill 的核心不是某个压缩技巧，而是一套**任务生命周期管理机制**，把大任务切成多个独立上下文的小任务，用交接文档传递状态，并用监控反馈控制 Token 消耗。

## 五个核心动作

| # | 动作 | 内容 |
|---|------|------|
| 1 | **需求识别** | 识别成本敏感场景：大任务、长上下文、重复性高、探索性任务 |
| 2 | **任务拆分** | 大任务 → 多个独立小任务，每个子任务**独立上下文**，避免上下文爆炸 |
| 3 | **Token 压缩** | 输入压缩 + 输出精简：去冗余、极简 diff、精简上下文 |
| 4 | **任务交接** | 子任务完成 → 输出交接文档 → 下一子任务只加载交接文档，不重复加载历史 |
| 5 | **监控反馈** | 监控 Token 消耗，超阈值时提醒切换模型或开启缓存 |

## 四层互补架构（与工具链不重叠）

| 层级 | 工具 / Skill | 作用 | 位置 |
|------|-------------|------|------|
| **MCP 层** | 原生 `[[plugins]]` 直连（可选网关代理） | 只启用需要的 MCP server，最小化工具 schema | [`integration/reasonix.toml`](./integration/reasonix.toml) |
| **输出精简层** | `caveman` | AI 回复只保留核心内容 | [`skills/style/caveman.skill`](./skills/style/caveman.skill) |
| **输入压缩层** | `RTK` / `CodeGraph` | 压缩终端输出与代码探索消耗 | — |
| **工作流管理层** | **本 Skill** | 大任务拆小 + 交接文档 + 监控反馈 | [`skills/workflow/*`](./skills/workflow/) |

## 方法层（按需加载，不常驻）

以下四~六技能是"具体怎么省 Token"的工程方法，**由 skill-handler 按需加载**，不占常驻上下文：

- `TFE` — Token First Engineering（每个任务）
- `ANPE` — AI Native Product Engineering（新项目/架构）
- `MRA` — Minimal Refactor Architecture（遗留系统重构）
- `CCE` — Context Compression Engineering（100K+ LOC 大项目）
- `ponytail` — Ponytail Restraint（代码生成克制，少写无用代码）
- `router` — Token Router（任务类型 → 最省工具/模型）

## 快速开始（skill-handler 工作流）

```text
1. 启动：只有 skill-handler 常驻（约 50 tokens）
2. 需要省钱的复杂任务：
   → /skill load hos        # 加载 HOS-Save-Cost
   → /hos                    # 激活省钱模式，自动拆分子任务
   → 每个子任务执行完输出交接文档
   → 完成后 /skill unload hos
3. 需要精简回复：
   → /skill load caveman → /caveman → 继续对话 → /skill unload caveman
4. MCP 层面无需操作：按 [`integration/reasonix.toml`](./integration/reasonix.toml) 原生直连所需 server（注：`mcp-compressor` 在 npm 不存在，勿使用）
```

## 文档索引

| 内容 | 文件 |
|------|------|
| 四层集成完整指南（reasonix.toml + 成本对比 + 使用流程） | [`integration/INTEGRATION-GUIDE.md`](./integration/INTEGRATION-GUIDE.md) |
| 任务拆分协议 | [`skills/workflow/task-split.skill`](./skills/workflow/task-split.skill) |
| 交接文档模板 | [`skills/workflow/handoff.skill`](./skills/workflow/handoff.skill) |
| Token 监控协议 | [`skills/workflow/token-monitor.skill`](./skills/workflow/token-monitor.skill) |
| Skill 加载/卸载管理（常驻入口） | [`skills/handlers/skill-handler.skill`](./skills/handlers/skill-handler.skill) |
| 输出精简层（穴居人模式） | [`skills/style/caveman.skill`](./skills/style/caveman.skill) |
| 代码生成克制（少写） | [`skills/ponytail-restraint.skill`](./skills/ponytail-restraint.skill) |
| 工具/模型路由（走最省路） | [`skills/token-router.skill`](./skills/token-router.skill) |
| 技能系统概览（含方法层技能详解） | [`skills/README.md`](./skills/README.md) |
| 方法层 v1 文档（已归档到 `skills/docs/`，按需阅读） | [`skills/docs/GETTING-STARTED.md`](./skills/docs/GETTING-STARTED.md) · [`skills/docs/OVERVIEW.md`](./skills/docs/OVERVIEW.md) · [`skills/docs/QUICK-REFERENCE.md`](./skills/docs/QUICK-REFERENCE.md) · [`skills/docs/IMPLEMENTATION-GUIDE.md`](./skills/docs/IMPLEMENTATION-GUIDE.md) · [`skills/docs/CCE-FIVE-RULES.md`](./skills/docs/CCE-FIVE-RULES.md) · [`skills/docs/CCE-REINFORCEMENT.md`](./skills/docs/CCE-REINFORCEMENT.md) · [`skills/docs/FINAL-UPDATE.md`](./skills/docs/FINAL-UPDATE.md) |

## 许可证

AGPLv3（GNU Affero General Public License v3.0）
