# AI Cost Optimization Skill System（技能索引）

> **v2.0 多文件结构**：本目录只保留**可加载的 skill 文件**，所有详解文档已归档到 [`docs/`](./docs/)。读取原则：**只加载需要的文件，不整目录读取**（整目录约 130KB，按需仅 2-8KB）。

## 四层互补架构（v2.0）

| 层级 | 工具/Skill | 作用 | 文件 |
|------|-----------|------|------|
| **MCP 层** | 原生 `[[plugins]]` 直连（可选网关代理） | 只启用需要的 MCP server | [`../integration/reasonix.toml`](../integration/reasonix.toml) |
| **输出精简层** | `caveman` | AI 回复极简 | [`style/caveman.skill`](style/caveman.skill) |
| **输入压缩层** | `RTK` / `CodeGraph` | 压缩终端输出与代码探索 | — |
| **工作流管理层** | HOS-Save-Cost | 任务拆分 + 交接 + 监控 | [`workflow/*.skill`](workflow/) |
| **Skill 管理** | `skill-handler` | 唯一常驻，按需加载/卸载 | [`handlers/skill-handler.skill`](handlers/skill-handler.skill) |

## 文件索引（按需加载）

### 工作流层（2-4KB each）
| 文件 | 用途 | 何时读 |
|------|------|--------|
| [`workflow/task-split.skill`](workflow/task-split.skill) | 大任务拆分为独立上下文子任务 | 遇到大任务时 |
| [`workflow/handoff.skill`](workflow/handoff.skill) | 子任务间交接文档（≤500 tokens） | 子任务完成时 |
| [`workflow/token-monitor.skill`](workflow/token-monitor.skill) | Token 消耗监控与阈值提醒 | 全程随行 |

### 配套 Skill（1-2KB each）
| 文件 | 用途 | 何时读 |
|------|------|--------|
| [`handlers/skill-handler.skill`](handlers/skill-handler.skill) | 唯一常驻入口，`/skill load\|unload\|list\|status` | 常驻（~50 tokens） |
| [`style/caveman.skill`](style/caveman.skill) | 输出精简层 | `/caveman` 触发时 |

### 方法层四技能（按需加载，不用不读）
| 文件 | 用途 | 大小 |
|------|------|------|
| [`tfe-token-first-engineering.skill`](tfe-token-first-engineering.skill) | Token First Engineering（每个任务） | ~6KB |
| [`anpe-ai-native-product-engineering.skill`](anpe-ai-native-product-engineering.skill) | AI Native Product Engineering（新项目） | ~12KB |
| [`mra-minimal-refactor-architecture.skill`](mra-minimal-refactor-architecture.skill) | Minimal Refactor Architecture（遗留系统） | ~14KB |
| [`cce-context-compression-engineering.skill`](cce-context-compression-engineering.skill) | Context Compression Engineering（100K+ LOC） | ~20KB 核心 |

> **CCE 提示**：三张地图完整模板已外置到 [`docs/cce-map-templates.md`](docs/cce-map-templates.md)（~12KB），仅在创建/维护地图时加载。

### 文档（已归档，仅人工阅读时打开）
| 文件 | 内容 |
|------|------|
| [`docs/GETTING-STARTED.md`](docs/GETTING-STARTED.md) | 5 分钟入门 |
| [`docs/OVERVIEW.md`](docs/OVERVIEW.md) | 体系概览 |
| [`docs/QUICK-REFERENCE.md`](docs/QUICK-REFERENCE.md) | 速查表 |
| [`docs/IMPLEMENTATION-GUIDE.md`](docs/IMPLEMENTATION-GUIDE.md) | 实战案例 |
| [`docs/INDEX.md`](docs/INDEX.md) | v1 导航 |
| [`docs/CCE-FIVE-RULES.md`](docs/CCE-FIVE-RULES.md) / [`docs/CCE-REINFORCEMENT.md`](docs/CCE-REINFORCEMENT.md) / [`docs/FINAL-UPDATE.md`](docs/FINAL-UPDATE.md) | CCE 强化文档 |

## 加载顺序建议

```text
1. skill-handler（常驻，~50 tokens）→ 需要时才 /skill load <name>
2. 大任务 → /skill load hos（读 SKILL.md + workflow/task-split）
3. 子任务执行 → /skill load tfe（读 tfe-*.skill）
4. 完成 → /skill unload 已加载项
```

## 关联文档

- 入口：[`../SKILL.md`](../SKILL.md)
- 四层集成指南：[`../integration/INTEGRATION-GUIDE.md`](../integration/INTEGRATION-GUIDE.md)
- MCP 压缩配置：[`../integration/reasonix.toml`](../integration/reasonix.toml)
