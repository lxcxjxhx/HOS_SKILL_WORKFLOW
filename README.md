# HOS Skill Workflow

> **面向 AI Agent 与 AI IDE 的工程化 Skill 开发框架** —— 标准化 Skill 的开发、校验、部署与复用流程。

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![DCO](https://img.shields.io/badge/Contributions-DCO-green.svg)](https://developercertificate.org/)

HOS Skill Workflow 是一套专为 Claude Code、Codex、Cursor、Gemini CLI 等 AI 编程助手设计的 Skill 工程化框架。它通过标准化的 Skill 定义、跨技能管线、共享上下文机制，将专业领域的“行规”固化为可执行、可复用的 Skill 系统，让 AI Agent 从“建议式回答”转向“强制流程执行”。


## ✨ 核心特性

- **标准化 Skill 定义**：每个 Skill 遵循统一的 `SKILL.md` 规范，包含 frontmatter 元数据、触发条件、执行流程与质量门禁，确保 Skill 行为可预期、可审计。
- **跨技能管线（Pipeline）**：仓库预定义多条跨技能管线，覆盖学术全流程、技术影响力、知识产权保护、内容工厂等高频场景，实现多 Skill 串联的自动化工作流。
- **共享上下文机制**：所有子技能共享统一的 `project / author / output` 上下文数据结构。写专利时填过的技术栈、创新点，写论文时无需重复填写，信息在管线中无缝传递。
- **质量门禁与循环保护**：每个 Skill 内置质量检查点和可配置的安全阈值，防止 AI 无限循环或输出退化内容。
- **多 IDE / Agent 兼容**：支持 Claude Code、Codex、Cursor、Gemini CLI 等主流 AI 编程环境，即插即用。


## 📦 Skill 矩阵

仓库包含完整的 Skill 矩阵，按功能前缀分类：

| 前缀 | 模块系列 | 说明 |
|------|---------|------|
| **W-xx** | Workflow 类 | 工程工作流治理与编排 |
| **S-00** | HOS-Sec-Engine | 方法论驱动的 AI 原生安全测试引擎 |
| **S-01** | HOS-Save-Cost | Token 消耗优化与上下文管理 |
| **S-06** | HOS-Fuck-Demo | AI 内容工业流水线（PPT / Demo 批量生成） |
| **S-07** | HOS-IP-Writing | 知识产权写作（论文、专利、软著、书籍、博客、润色） |
| **S-11** | HOS-Paper-RedTeam | 论文红队审查 |
| **S-12** | HOS-Vibe-Guard | Vibe Coding 质量护栏 |
| **X-xx** | 扩展工具类 | 辅助与集成模块 |

### 重点模块速览

**S-00 HOS-Sec-Engine** — 流程模板 · 决策树驱动 · CVE 实时集成 · MCP 管理层

核心能力包括：Process Engine 流程引擎（解析 YAML 模板并驱动阶段执行）、决策树引擎（动态决定流程分支）、阶段执行器（顺序/并行执行步骤）、CVE 实时集成（公开 API 查询替代静态漏洞库）、工具注册中心（统一路由 MCP 调用）、循环保护（可配置安全阈值）。

**S-07 HOS-IP-Writing** — 覆盖论文、专利、软著、书籍、博客、润色六大场景的 AI 知识产权写作体系

通过“共享上下文 + 跨技能管线”，将同一研究成果一次性沉淀为多种知识资产。每个写作模式都配有“质量门禁”，四条跨技能管线覆盖“学术全流程”“技术影响力”“知识产权保护”“内容工厂”四大高频场景。


## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装与构建

以 S-00 HOS-Sec-Engine 模块为例：

```bash
git clone https://github.com/lxcxjxhx/HOS_SKILL_WORKFLOW.git
cd HOS_SKILL_WORKFLOW/S-00-HOS-Sec-Engine
npm install
npm run build
```

构建完成后，通过示例入口启动 Process Engine：

```bash
node dist/src/examples/process-guidance.js
```

引擎会自动加载流程模板，根据用户描述的安全场景驱动决策树，编排各阶段执行安全测试任务。


## 📖 使用指南

### 在 AI IDE 中加载 Skill

1. 将目标 Skill 目录（如 `S-07-HOS-IP-Writing`）复制到你的 AI IDE 技能目录中
2. 在对话中触发 Skill（如：“帮我写一份发明专利交底书”）
3. Skill 会按照 `SKILL.md` 中定义的流程引导 AI 执行

### 使用跨技能管线

仓库预定义的管线支持多 Skill 串联。例如“学术全流程”管线：论文写作 → 润色 → 投稿适配 → 软著申请材料生成。在管线中，前一步骤的上下文自动传递给下一步骤，无需重复输入信息。

### 常用命令

```bash
# 构建
npm run build

# 测试
npm test

# 启动示例流程
node dist/src/examples/process-guidance.js
```


## 🤝 贡献指南

感谢你对本项目的关注与贡献！

### 许可证

本项目采用 **GNU Affero General Public License v3.0 (AGPLv3)**（OSI 认证的强互惠许可证）。任何对项目的使用、修改与分发都必须遵守 AGPLv3 的条款。特别地，如果你将本项目（或基于它的修改版）通过计算机网络对外提供服务（SaaS / 云服务），你必须向所有用户公开完整的服务端源代码。

### 开发者原产地证书（DCO）

本项目采用 **Developer Certificate of Origin (DCO)** 机制（而非 CLA）。在提交代码之前，请确认你同意 [Developer Certificate of Origin](https://developercertificate.org/) 的条款。

每个提交信息中必须包含 `Signed-off-by` 行，格式为：

```
Signed-off-by: 你的名字 <你的邮箱>
```

最简单的方式是提交时加上 `-s` 参数：

```bash
git commit -s
```

Git 会自动追加 `Signed-off-by` 行。CI 会检查每个 PR 的所有提交是否都包含签名，未签名的 PR 将无法合并。请使用与你的 GitHub 账号关联的邮箱进行签名。


## 📄 许可证

本项目基于 **AGPLv3** 开源。商业使用或希望获得 AGPLv3 之外的授权，请联系项目维护者。


## 🔗 相关链接

- [GitHub 仓库](https://github.com/lxcxjxhx/HOS_SKILL_WORKFLOW)
- [S-00 HOS-Sec-Engine 模块](https://github.com/lxcxjxhx/HOS_SKILL_WORKFLOW/tree/main/S-00-HOS-Sec-Engine)
- [S-01 HOS-Save-Cost 模块](https://github.com/lxcxjxhx/HOS_SKILL_WORKFLOW/tree/main/S-01-HOS-Save-Cost)
- [S-07 HOS-IP-Writing 模块](https://github.com/lxcxjxhx/HOS_SKILL_WORKFLOW/tree/main/S-07-HOS-IP-Writing)
- [项目作者博客（安全风信子）](https://cloud.tencent.cn/developer/article/2726018)
