---
name: HOS-Sec-Engine
version: 3.0.0
description: 方法论驱动的 AI 原生安全测试引擎 — 把安全测试方法论固化成可执行引擎
author: HOS Team
tags:
  - security
  - pentest
  - audit
  - mcp
  - cve
  - automation
  - bug-bounty
compatibility:
  - claude-code
  - cursor
  - windsurf
  - github-copilot
  - trae-cn
license: MIT
metadata:
  category: security
  subCategory: penetration-testing
  risk-level: high
  confidence: 0.95
---

# 🔥 HOS-Sec-Engine

> **方法论驱动的 AI 原生安全测试引擎**
>
> 把"安全测试方法论"固化成可执行引擎：**输入目标 → 自动按流程模板编排测试阶段 → 输出结构化报告**。

---

## 🎯 这个包是什么

**AI 原生安全测试引擎** — 把安全测试方法论从"靠经验、靠记忆"的手工模式，转化为"可执行、可复现、可扩展"的引擎模式。

- **输入目标** — URL、API 端点、云资源、SRC 平台
- **自动编排** — 决策树引擎根据目标类型和上下文，自动选择匹配的流程模板
- **阶段执行** — 按模板定义的阶段顺序执行，支持动态分支和自适应调整
- **结构化输出** — HTML/Markdown 双格式报告，包含发现、风险评级、修复建议

### 核心能力一览

| 能力模块 | 说明 |
|----------|------|
| **流程模板驱动** | YAML 定义测试流程，无需修改代码即可扩展 |
| **决策树自动编排** | 根据阶段执行结果动态决定流程分支走向 |
| **实时 CVE 集成** | 通过公开 API 实时查询最新漏洞情报 |
| **MCP 工具管理** | Model Context Protocol 支持，工具自动发现与路由 |
| **结构化报告** | HTML/Markdown 双格式输出，支持一键生成 |

---

## 📋 内置流程模板

### 1. Web 应用测试流程

**文件：** `web-pentest.yaml`

覆盖完整 Web 渗透测试生命周期：
- 信息收集 → WAF 绕过 → 漏洞扫描（SQLi/XSS/SSRF/上传/RCE）→ 利用验证 → 后渗透 → 报告生成

### 2. API 接口审计流程

**文件：** `api-security-audit.yaml`

覆盖 API 安全核心维度：
- 认证机制测试（JWT/OAuth/Session）→ 授权控制测试（水平/垂直越权、IDOR）→ 输入验证 → 速率限制 → 敏感信息检测

### 3. 云配置审计流程

**文件：** `cloud-config-audit.yaml`

覆盖云基础设施安全：
- 云资产发现 → IAM 权限分析 → 存储配置检测 → 云元数据安全 → 网络安全组审计

### 4. CN-SRC 漏洞赏金流程

**文件：** `cn-src-hunter.yaml`

覆盖国内 SRC 全流程：
- 合规红线 → 情报采集 → 数据结构化 → 目标评分（7 维度 100 分制）→ 攻击面分析 → 漏洞挖掘 → 报告提交

---

## 🏗️ 引擎架构

```
输入目标 (URL / API / 云资源 / SRC)
        │
        ▼
┌─────────────────────────┐
│   决策树引擎            │ ← 根据目标类型选择流程模板
│   decision-tree.ts      │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│   流程引擎              │ ← 加载 YAML 模板，编排阶段执行
│   process-engine.ts     │
└──────────┬──────────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
┌────────┐  ┌────────┐
│ CVE    │  │ MCP    │  ← 实时漏洞查询 + 工具路由
│ 集成   │  │ 管理层 │
└───┬────┘  └───┬────┘
    │           │
    ▼           ▼
┌─────────────────────────┐
│   阶段执行器            │ ← 按阶段顺序执行，支持动态分支
│   phase-executor.ts     │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│   报告生成器            │ ← 输出 HTML/Markdown 结构化报告
│   report.ts             │
└─────────────────────────┘
```

### MCP 管理层组件

| 组件 | 文件 | 职责 |
|------|------|------|
| MCPRegistry | `src/mcp/registry.ts` | MCP 服务器注册中心，管理生命周期 |
| MCPDiscovery | `src/mcp/discovery.ts` | 自动发现：扫描已安装的 MCP 包 |
| MCPRouter | `src/mcp/router.ts` | 工具路由：多种策略、工具映射 |
| MCPHealthMonitor | `src/mcp/health.ts` | 健康监控 + 自动恢复 |

---

## 📦 包含内容

```
HOS-Sec-Engine/
├── SKILL.md                          ← 技能描述（本文件）
├── README.md                         ← 完整说明文档
├── src/
│   ├── core/                         ← 引擎核心
│   │   ├── engine.ts                 ← 主引擎入口
│   │   ├── process-engine.ts         ← 流程引擎（YAML 模板解析 + 阶段调度）
│   │   ├── phase-executor.ts         ← 阶段执行器
│   │   ├── decision-tree.ts          ← 决策树引擎
│   │   ├── cve-integration.ts        ← CVE 实时集成
│   │   └── report.ts                 ← 报告生成器
│   ├── mcp/                          ← MCP 管理层
│   │   ├── registry.ts               ← 注册中心
│   │   ├── discovery.ts              ← 自动发现
│   │   ├── router.ts                 ← 工具路由
│   │   └── health.ts                 ← 健康监控
│   ├── playbooks/process-templates/  ← 4 个 YAML 流程模板
│   └── agents/                       ← Agent 系统
├── scripts/
│   └── cn-src-hunter/                ← CN-SRC-Hunter Python 工具链
│       ├── target_score.py           ← 7 维度目标评分
│       ├── fetch_intel.py            ← SRC 平台情报采集
│       ├── build_programs.py         ← 数据结构化
│       └── templates/                ← CSV 数据模型
├── dist/                             ← TypeScript 预构建产物
├── dist-pkg/                         ← 可分发安装包
│   ├── hos-sec-engine-0.5.1.tgz      ← npm 包
│   ├── hos-sec-engine-v0.5.1.zip     ← 完整压缩包
│   ├── package-manifest.json         ← 构建清单
│   └── README.md                     ← 安装说明
├── drill/                            ← 演练脚本
│   ├── web-pentest-drill.js          ← Web 渗透测试演练
│   ├── api-audit-drill.js            ← API 安全审计演练
│   └── cn-src-hunter-drill.js        ← CN-SRC 赏金流程演练
├── docs/                             ← 集成文档
│   ├── cn-src-hunter-integration.md  ← CN-SRC-Hunter 集成指南
│   └── mcp-integration.md            ← MCP 集成说明
├── tests/                            ← 测试套件
│   ├── core/engine-test.js           ← 核心引擎测试
│   ├── integration/full-verification.js ← 全量集成验证
│   └── verification-report.json      ← 自动化验证报告
├── config/                           ← 配置文件
│   ├── mcp-servers.json              ← MCP 服务器配置
│   └── providers.json.example        ← Provider 示例
└── package.json
```

### 文件清单汇总

| 类别 | 文件 | 数量 |
|------|------|------|
| 技能描述 | SKILL.md + README.md | 2 |
| 引擎源码 | src/core/ + src/mcp/ + src/agents/ | ~30 |
| 流程模板 | 4 个 YAML 模板 | 4 |
| Python 工具 | target_score.py + fetch_intel.py + build_programs.py | 3 |
| 演练脚本 | drill/ 下 3 个 JS 脚本 | 3 |
| 预构建包 | .tgz + .zip + manifest | 3 |
| 集成文档 | docs/ + scripts/cn-src-hunter/README.md | 3 |
| 测试套件 | tests/ 下测试脚本 + 报告 | 4 |

---

## 🚀 快速开始

### 环境要求

- **Node.js ≥ 18**
- **Python ≥ 3.8**（CN-SRC-Hunter 工具链）
- npm 9+ 或 yarn 1.22+

### 安装方式

#### 方式一：使用预构建包（推荐）

```bash
# npm 直接安装 tgz 包
npm install hos-sec-engine-0.5.1.tgz

# 或解压 zip 后本地安装
unzip hos-sec-engine-v0.5.1.zip
cd S-00-HOS-Sec-Engine
npm install
npm run build
```

#### 方式二：从源码构建

```bash
cd S-00-HOS-Sec-Engine
npm install
npm run build

# 验证构建
node dist/src/examples/process-guidance.js
# 预期: 加载 3+ 个流程模板
```

### 运行演练

```bash
# 演练：Web 渗透测试流程（默认目标 DVWA）
npm run drill:web

# 演练：API 安全审计流程（公共 API 示例）
npm run drill:api

# 演练：CN-SRC 漏洞赏金流程（演示平台）
npm run drill:src

# 一键运行所有演练
npm run drill:all
```

### CLI 命令

```bash
# 启动交互式引擎
npm start

# 运行完整测试套件
npm run test

# 全量集成验证
npm run test:integration
```

---

## 🧭 使用场景

| 场景 | 推荐模板 | 输出示例 |
|------|----------|----------|
| 授权 Web 应用渗透测试 | `web-pentest.yaml` | HTML 渗透测试报告 |
| API 接口安全审计 | `api-security-audit.yaml` | HTML API 安全报告 |
| 云基础设施配置检查 | `cloud-config-audit.yaml` | 云审计报告 |
| 国内 SRC 漏洞赏金 | `cn-src-hunter.yaml` | 赏金流程报告 + CSV 数据 |
| 代码审计 / CVE 验证 | CVE 集成 + `code-review-java.ts` | CVE 验证结果 |

---

## 👥 适合谁

- **安全工程师** — 需要系统化、方法论驱动的渗透测试流程，减少重复劳动
- **代码审计人员** — 需要可复现、可扩展的审计框架，提高审计一致性
- **合规测试团队** — 在有书面授权的前提下进行合规安全测试，满足审计要求
- **安全学习者** — 想系统学习安全测试方法论，从模板化流程入手，理解"为什么这么测"

---

## ⚠️ 使用声明

> **本工具仅限在你有权测试的系统上使用。**

### 合规红线

1. **合法合规** — 仅在自己的系统或有书面授权的目标上使用本工具。对未授权系统进行测试违反《中华人民共和国网络安全法》《刑法》第 285/286 条等相关法律法规，后果自负。

2. **授权确认** — 在开始任何测试前，必须确认：
   - 已获得目标系统所有者的书面授权
   - 已明确测试范围（允许的 IP、域名、时间窗口）
   - 已了解禁止测试的资产和行为

3. **人工复核** — 所有测试结果需经人工复核，AI 输出仅供参考。不要将 AI 自动生成的结果直接作为漏洞报告或修复依据。

4. **数据保密** — 通过本工具获取的测试数据和漏洞信息应严格保密，不得向第三方泄露。

5. **合理使用** — 避免对目标系统造成破坏性影响，遵循最小必要原则。

---

## 📖 文档

| 文档 | 路径 | 说明 |
|------|------|------|
| 项目文档 | [README.md](./README.md) | 完整架构说明、安装指南、API 文档 |
| CN-SRC 集成 | [docs/cn-src-hunter-integration.md](./docs/cn-src-hunter-integration.md) | CN-SRC-Hunter 完整集成指南 |
| MCP 集成 | [docs/mcp-integration.md](./docs/mcp-integration.md) | MCP 管理层使用说明 |
| Python 工具 | [scripts/cn-src-hunter/README.md](./scripts/cn-src-hunter/README.md) | CN-SRC-Hunter Python 工具链使用说明 |
| 评分维度 | [scripts/cn-src-hunter/templates/scoring-dimensions.md](./scripts/cn-src-hunter/templates/scoring-dimensions.md) | 7 维度评分模型详解 |
| 预构建包 | [dist-pkg/README.md](./dist-pkg/README.md) | 安装包使用说明 |

---

## 🔧 技术架构

```
S-00-HOS-Sec-Engine/
├── src/
│   ├── core/
│   │   ├── engine.ts               # 主引擎入口
│   │   ├── process-engine.ts       # 流程引擎（YAML 模板解析 + 阶段调度）
│   │   ├── phase-executor.ts       # 阶段执行器（支持顺序/并行/动态分支）
│   │   ├── decision-tree.ts        # 决策树引擎（条件判断 + 路径选择）
│   │   ├── cve-integration.ts      # CVE 实时集成（公开 API 查询）
│   │   ├── orchestrator.ts         # 流程编排器
│   │   ├── report.ts               # 报告生成器（HTML/Markdown）
│   │   ├── formatter.ts            # 格式化工具
│   │   └── tool-registry.ts        # 工具注册中心
│   ├── mcp/
│   │   ├── types.ts                # MCP 类型系统
│   │   ├── registry.ts             # MCP 注册中心
│   │   ├── discovery.ts            # 自动发现机制
│   │   ├── router.ts               # 工具路由（多策略）
│   │   └── health.ts               # 健康监控 + 自动恢复
│   ├── playbooks/
│   │   └── process-templates/      # YAML 流程模板
│   │       ├── web-pentest.yaml
│   │       ├── api-security-audit.yaml
│   │       ├── cloud-config-audit.yaml
│   │       └── cn-src-hunter.yaml
│   ├── agents/
│   │   ├── coordinator.ts          # Agent 协调器
│   │   ├── ensemble.ts             # 多 Agent 集成
│   │   └── sub-agent.ts            # 子 Agent 实现
│   ├── cli/                        # CLI 入口
│   ├── config/                     # 配置加载
│   ├── runtime/                    # 运行时沙箱
│   └── types/                      # 类型定义
├── scripts/
│   └── cn-src-hunter/              # CN-SRC-Hunter Python 工具链
├── drill/                          # 演练脚本
├── dist-pkg/                       # 可分发安装包
└── tests/                          # 测试套件
```

### 依赖

| 依赖 | 版本 | 用途 |
|------|------|------|
| TypeScript | ^5.3.0 | 引擎开发语言 |
| js-yaml | ^5.2.1 | YAML 流程模板解析 |
| chalk | ^4.1.2 | 终端彩色输出 |
| @inquirer/prompts | ^5.0.0 | 交互式命令行 |

---

## 🛟 售后支持

### 7 天答疑保障

- **安装指导** — Windows / macOS / Linux 三平台安装说明
- **环境配置** — Node.js 版本、依赖安装、构建报错排查
- **使用指导** — 流程模板选择、参数配置、输出解读
- **问题反馈** — 工具异常、运行报错、功能咨询

### 发货说明

- **虚拟商品** — 拍下后 24 小时内发网盘链接
- **环境要求** — 需 Node ≥ 18（附安装说明）
- **售后政策** — 数字产品不支持退换，有问题先留言

---

## 📄 许可证

MIT License © HOS Team

---

## 🏷️ 标签

`#安全测试` `#渗透测试` `#API审计` `#云安全` `#SRC赏金` `#MCP` `#CVE` `#自动化` `#AI安全`
