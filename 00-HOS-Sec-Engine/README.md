<p align="center">
  <img src="https://img.shields.io/badge/Version-3.0.0-blue?style=for-the-badge" alt="Version 3.0.0"/>
  <img src="https://img.shields.io/badge/Methodology-Engine-brightgreen?style=for-the-badge" alt="Methodology Engine"/>
  <img src="https://img.shields.io/badge/MCP-Enabled-purple?style=for-the-badge" alt="MCP Enabled"/>
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="MIT License"/>
</p>

<h1 align="center">🔥 HOS-Sec-Engine</h1>
<p align="center"><b>方法论驱动的 AI 原生安全测试引擎</b></p>
<p align="center">
  流程模板 · 决策树驱动 · CVE 实时集成 · MCP 管理层
</p>

<p align="center">
  <i>方法论驱动的安全测试引擎 — 引导怎么做，而非告诉你做什么</i>
</p>

---

## 📋 目录

- [🚀 一分钟开始](#-一分钟开始)
- [🎯 能力全景](#-能力全景)
- [📦 安装指南](#-安装指南)
- [🔌 MCP 管理层](#-mcp-管理层)
- [🧭 使用指南](#-使用指南)
- [📋 流程模板](#-流程模板)
- [🧪 测试与维护](#-测试与维护)
- [🏗 项目架构](#-项目架构)
- [📊 测试结果](#-测试结果)
- [🔄 循环安全保护](#-循环安全保护)
- [📖 学术引用](#-学术引用)

---

## 🚀 一分钟开始

```bash
git clone https://github.com/lxcxjxhx/HOS_SKILL_WORKFLOW.git
cd 00-HOS-Sec-Engine
npm install
npm run build
```

构建完成后，通过示例入口启动 Process Engine：

```bash
node dist/src/examples/process-guidance.js
```

引擎会自动加载流程模板，根据用户描述的安全场景驱动决策树，编排各阶段执行安全测试任务。

---

## 🎯 能力全景

### 引擎核心能力

| 能力 | 说明 |
|------|------|
| **Process Engine 流程引擎** | 核心运行时，解析 YAML 流程模板并驱动阶段执行 |
| **决策树引擎** | 根据上下文条件和阶段结果动态决定流程分支走向 |
| **阶段执行器** | 按顺序或并行执行流程中的每个阶段步骤 |
| **CVE 实时集成** | 通过公开 API 实时查询 CVE 漏洞数据，替代静态漏洞库 |
| **工具注册中心** | 统一管理和路由 MCP 工具调用 |
| **报告生成器** | 自动汇总测试结果、发现和建议，输出结构化报告 |
| **循环保护** | 可配置的安全阈值，防止无限循环 |

### 流程模板

```
Web 渗透测试     ──  src/playbooks/process-templates/web-pentest.yaml
API 安全审计     ──  src/playbooks/process-templates/api-security-audit.yaml
云配置审计       ──  src/playbooks/process-templates/cloud-config-audit.yaml
```

每个模板包含阶段定义、决策规则、CVE 关联和工具映射，可在运行时动态加载和执行。

### 引擎设计原则

- **框架而非数据**：引擎提供可扩展的流程框架，而非硬编码的固定能力
- **无硬编码技能**：所有测试逻辑由流程模板 + 决策树驱动，无需预定义技能包
- **失败容忍**：`continueOnPhaseFailure` 和 `continueOnStepFailure` 默认为 true，单步失败不影响整体流程
- **实时数据**：通过 CVE API 获取最新漏洞情报，而非依赖静态数据库
- **配置驱动**：安全阈值、流程模板均可配置，无需修改代码

---

## 📦 安装指南

```bash
git clone https://github.com/lxcxjxhx/HOS_SKILL_WORKFLOW.git
cd 00-HOS-Sec-Engine
npm install
npm run build
```

---

## 🔌 MCP 管理层

> 引擎内置 MCP (Model Context Protocol) 管理层，支持 MCP 服务器的注册、健康监控和工具路由。

### 架构

```
initMCP()  [首次使用时懒加载]
  ├─ loadMCPServersFromConfig()    ← config/mcp-servers.json
  ├─ mcpDiscovery.discoverAll()    ← 自动扫描已安装的 MCP 包
  ├─ mcpRegistry.registerServer()  ← 注册中心管理生命周期
  ├─ mcpHealthMonitor.start()      ← 健康监控 + 自动恢复
  └─ buildToolMappings()           ← 工具映射到流程步骤
```

### 组件

| 组件 | 文件 | 职责 |
|------|------|------|
| **MCPRegistry** | `src/mcp/registry.ts` | MCP 服务器注册中心，管理生命周期（注册/启动/停止/注销） |
| **MCPDiscovery** | `src/mcp/discovery.ts` | 自动发现：扫描已知包、npm 全局/本地安装、配置文件 |
| **MCPRouter** | `src/mcp/router.ts` | 工具路由：多种策略、工具映射 |
| **MCPHealthMonitor** | `src/mcp/health.ts` | 健康监控：定时全量/增量检查、自动恢复 |

---

## 🧭 使用指南

安装构建完成后，执行流程示例入口：

```bash
node dist/src/examples/process-guidance.js
```

引擎将根据用户输入的安全测试需求，自动选择匹配的流程模板，通过决策树驱动各阶段执行。

流程执行示例：

```
用户描述场景 → Process Engine 加载模板 → 决策树匹配阶段
  ├─ 阶段 1：信息收集（工具调用 + CVE 查询）
  ├─ 阶段 2：漏洞检测（决策树分支选择）
  ├─ 阶段 3：利用验证（工具执行 + 结果分析）
  └─ 报告生成（结构化输出）
```

---

## 📋 流程模板

系统内置 YAML 流程模板，存放于 `src/playbooks/process-templates/`，支持动态加载和扩展：

### Web 渗透测试

**文件：** `src/playbooks/process-templates/web-pentest.yaml`

涵盖信息收集、漏洞扫描、利用验证等完整 Web 渗透测试阶段，支持 SQL 注入、XSS、SSRF、文件上传等常见漏洞的检测流程。

### API 安全审计

**文件：** `src/playbooks/process-templates/api-security-audit.yaml`

覆盖 JWT 认证测试、OAuth 流程审计、IDOR 越权检测、速率限制测试、GraphQL 安全评估等 API 安全场景。

### 云配置审计

**文件：** `src/playbooks/process-templates/cloud-config-audit.yaml`

覆盖 IAM 权限分析、云元数据安全、S3/OSS 配置错误检测等云安全场景。

> 流程模板为 YAML 格式，可直接编辑以扩展或修改测试阶段。引擎启动时动态加载，无需重新编译。

---

## 🧪 测试与维护

```bash
npm run build                  # 完整构建流程
npm run test                   # 核心引擎测试
npm run test:core              # 核心引擎测试
npm run test:integration       # 全量集成验证
npm run test:loop              # 循环保护测试
npm run dev                    # 监听模式编译
npm run clean                  # 清理 dist 目录
```

---

## 🏗 项目架构

```
00-HOS-Sec-Engine/
├── src/
│   ├── core/                       # 引擎核心
│   │   ├── engine.ts               # 主引擎入口
│   │   ├── process-engine.ts       # Process Engine 流程引擎
│   │   ├── phase-executor.ts       # 阶段执行器
│   │   ├── decision-tree.ts        # 决策树引擎
│   │   ├── cve-integration.ts      # CVE 实时集成
│   │   ├── tool-registry.ts        # 工具注册中心
│   │   ├── orchestrator.ts         # 流程编排器
│   │   ├── report.ts               # 报告生成器
│   │   ├── formatter.ts            # 格式化工具
│   │   └── types.ts                # 类型定义
│   ├── mcp/                        # MCP 管理层
│   │   ├── types.ts                # MCP 类型系统
│   │   ├── registry.ts             # MCP 注册中心
│   │   ├── discovery.ts            # MCP 自动发现
│   │   ├── router.ts               # MCP 工具路由
│   │   └── health.ts               # MCP 健康监控
│   ├── playbooks/                  # 流程模板
│   │   └── process-templates/
│   │       ├── web-pentest.yaml        # Web 渗透测试
│   │       ├── api-security-audit.yaml # API 安全审计
│   │       └── cloud-config-audit.yaml # 云配置审计
│   ├── agents/                     # Agent 系统
│   │   ├── coordinator.ts          # Agent 协调器
│   │   ├── ensemble.ts             # 多 Agent 集成
│   │   └── sub-agent.ts            # 子 Agent 实现
│   └── examples/                   # 示例入口
├── config/                         # 配置文件
│   └── mcp-servers.json            # MCP 服务器配置
├── tests/                          # 测试套件
│   ├── core/
│   │   └── engine-test.js          # 核心引擎测试
│   ├── integration/
│   │   └── full-verification.js    # 完整集成验证
│   └── loop/
│       └── engine-loop-runner.js   # 循环保护测试
└── package.json
```

---

## 📊 测试结果

| 测试套件 | 验证方式 | 状态 |
|---------|---------|:----:|
| 核心引擎测试 | 持续集成 | ✅ |
| MCP 管理测试 | 自动化验证 | ✅ |
| 循环保护测试 | 持续集成 | ✅ |
| 全量集成验证 | 自动化验证 | ✅ |

---

## 🔄 循环安全保护

| 配置项 | 用途 |
|--------|------|
| MAX_PHASE_ITERATIONS | 防止流程无限循环 |
| MAX_FINDINGS | 防止发现项溢出 |
| MAX_RECOMMENDATIONS | 防止建议溢出 |
| MAX_SCAN_DEPTH | 防止目录递归溢出 |
| GLOBAL_MAX_RECOVERY_LIFETIME | MCP 全局恢复上限 |

> 所有阈值均可配置，无需修改代码。

引擎支持以下失败容忍配置：

| 配置项 | 默认值 | 说明 |
|--------|:------:|------|
| `continueOnPhaseFailure` | true | 阶段失败时继续执行后续阶段 |
| `continueOnStepFailure` | true | 步骤失败时继续执行后续步骤 |

---

## 📖 学术引用

```bibtex
@article{lee2026secbenchpro,
  title={SEC-bench Pro: Can Language Models Solve Long-Horizon Software Security Tasks?},
  author={Lee, Hwiwon and Liu, Jiawei and Kim, Dongjun and Zhang, Ziqi and
          Xia, Chunqiu Steven and Zhang, Lingming},
  journal={arXiv preprint arXiv:2605.26548},
  year={2026}
}
```

| 引用来源 | 应用模块 |
|----------|----------|
| SEC-bench Pro §3.5 三证据裁判 | `src/core/process-engine.ts` |
| SEC-bench Pro §4.2 RQ1 多 Agent 集成 | `src/agents/ensemble.ts` |
| SEC-bench Pro §3.3 Oracle 验证 | `src/core/phase-executor.ts` |
| SEC-bench Pro §4.3 Token 效率 | `src/core/decision-tree.ts` |
| SEC-bench Pro §4.3.2 失败模式追踪 | `src/core/report.ts` |

---

## License

MIT © HOS Team