---
name: HOS-Sec-Engine
version: 3.0.0
description: 方法论驱动的 AI 原生安全测试引擎
author: HOS Team
tags:
  - security
  - pentest
  - audit
  - mcp
  - cve
  - automation
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

> 方法论驱动的 AI 原生安全测试引擎

## 核心特性

- **流程模板驱动** — 预定义安全测试流程（Web/Cloud/API/Intranet）
- **决策树引擎** — 智能决策路径，引导测试方向
- **CVE 实时集成** — 自动查询和验证 CVE 漏洞
- **MCP 管理层** — Model Context Protocol 支持，多 Agent 协作
- **方法论优先** — 引导怎么做，而非告诉你做什么

## 使用场景

- Web 应用渗透测试
- API 安全审计
- 云配置安全检查
- 内网渗透测试
- 代码安全审计
- CVE 漏洞验证

## 快速开始

```bash
# 安装依赖
npm install

# 启动引擎
npm start

# 运行 Web 渗透测试
npm run pentest:web

# 启动 MCP 服务器
npm run mcp:server
```

## 架构

```
src/
├── agents/          # Agent 池和协调器
├── cli/             # CLI 入口
├── config/          # 配置加载器
├── core/            # 核心引擎（决策树、编排器、报告）
├── mcp/             # MCP 集成层
├── playbooks/       # 流程模板库
├── runtime/         # 运行时沙箱
└── types/           # 类型定义
```

## 流程模板

- `web/api-security-review.ts` — API 安全审计
- `web/web-pentest-full.ts` — Web 完整渗透测试
- `cloud/cloud-config-audit.ts` — 云配置审计
- `intranet/domain-pentest.ts` — 域渗透测试
- `audit/code-review-java.ts` — Java 代码审计

## 文档

详细文档请参考 [`README.md`](./README.md) 和 [`docs/`](./docs/) 目录。

## 许可证

MIT License
