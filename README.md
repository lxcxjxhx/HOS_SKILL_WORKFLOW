# HOS Skill Workflow

> **AI Agent Skill 工程化框架** — 标准化、可复用、企业级的 AI 技能体系

![GitHub stars](https://img.shields.io/github/stars/lxcxjxhx/HOS_SKILL_WORKFLOW?style=for-the-badge)
![License](https://img.shields.io/github/license/lxcxjxhx/HOS_SKILL_WORKFLOW?style=for-the-badge)

---

## 项目简介

HOS Skill Workflow 是一个面向 AI Agent、AI IDE、Claude Code、Codex、Cursor、Gemini CLI 的 Skill 工程化框架。

提供标准化的 Skill 开发、验证、部署和复用能力，覆盖安全测试、成本优化、质量控制、内容生产、知识产权写作等核心场景。

**核心特性：**

- ✅ **Skill 标准化** — 统一的 SKILL.md 规范和工作流定义
- ✅ **工程化部署** — 支持 TypeScript/Python/Shell 多语言实现
- ✅ **Multi-Agent 编排** — 内置协调器、决策树、执行引擎
- ✅ **MCP 集成** — 原生支持 Model Context Protocol
- ✅ **企业级复用** — 模块化设计，开箱即用

---

## Skill 模块

| 编号 | 模块 | 语言 | 描述 | 文档 |
|------|------|------|------|------|
| 00 | [HOS-Sec-Engine](00-HOS-Sec-Engine/) | TypeScript | AI 原生安全测试引擎，流程模板 + 决策树 + CVE 集成 + MCP 管理层 | [README](00-HOS-Sec-Engine/README.md) |
| 01 | [HOS-SAVE-COST](01-HOS-SAVE-COST/) | Markdown | AI 成本优化技能集：Token 优先工程、上下文压缩、最小重构架构 | [README](01-HOS-SAVE-COST/skills/README.md) |
| 02 | [HOS-LIFE-OKR](02-HOS-LIFE-OKR/) | Markdown | 生活 OKR 自动化学习引擎：OKR 驱动 + KPI 约束 + 时间切片 + 自动任务生成 | [SKILL.md](02-HOS-LIFE-OKR/SKILL.md) |
| 03 | [HOS-Vibe-Guard](03-HOS-Vibe-Guard/) | TypeScript | 防 Vibe Coding 退化护栏：选题质量检测 + 架构升级引擎 + 安全护栏 | [README](03-HOS-Vibe-Guard/README.md) |
| 04 | [HOS-Silly-Mock](04-HOS-Silly-Mock/) | TypeScript | 反假数据/反正则现实强制层：阻止 AI 伪造系统可运行性 | [README](04-HOS-Silly-Mock/README.md) |
| 05 | [HOS-XRG-Loop](05-HOS-XRG-Loop/) | Shell | 自稳定工程系统：目标动态调节 + 价值密度控制 + 现实反馈闭环 | [CLAUDE.md](05-HOS-XRG-Loop/CLAUDE.md) |
| 06 | [HOS-Fuck-Demo](06-HOS-Fuck-Demo/) | Markdown | AI 内容工业流水线：全自动输出内容包+PPT+音频+视频+项目注册 | [README](06-HOS-Fuck-Demo/README.md) |
| 07 | [HOS-IP-Writing](07-HOS-IP-Writing/) | Markdown | 知识产权写作系统：论文、专利、软著、书籍、博客、润色六大场景 | [README](07-HOS-IP-Writing/README.md) |
| 08 | [HOS-Micro-Biz](08-HOS-Micro-Biz/) | Markdown | 微商技术服务运营：服务设计 + 定价策略 + 获客文案 + 客户沟通 SOP + 订单管理 + 风控合规 | [README](08-HOS-Micro-Biz/README.md) |
| 09 | [HOS-Content-Engine](09-HOS-Content-Engine/) | Markdown | AI 安全实验室内容引擎：4D 内容模型（Discover→Dissect→Develop→Document）+ 六大内容支柱 + B站视频脚本生成 | [README](09-HOS-Content-Engine/README.md) |
| 09b | [HOS-Ops-Skills](09-HOS-Ops-Skills/) | Markdown | HOS 生态运营工具集：周报/日志/Release Notes/多平台适配/社区运营/品牌守护/微商运营 | [README](09-HOS-Ops-Skills/README.md) |
| 100 | [HOS-AUTO-WORKFLOW](100-HOS-AUTO-WORKFLOW/) | YAML | 自动化工作流配置：报告撰写工具 + 配置手册 | - |
| 101 | [HOS-AI Guardrail](101-HOS-AI%20Guardrail/) | Python | AI 安全检测插件：文本/文件/图片输入输出检测，FastAPI 实现 | - |
| 200 | [JSON结构化提示词](200-JSON%E7%BB%93%E6%9E%84%E5%8C%96%E6%8F%90%E7%A4%BA%E8%AF%8D/) | JSON | 开发模板集合：项目、安全、测试、运营、模型、考试等场景 | - |
| 300 | [HUMAN-PASS](300-HUMAN-PASS/) | Text | 人工验证通过记录 | - |

---

## 快速开始

### 克隆项目

```bash
git clone https://github.com/lxcxjxhx/HOS_SKILL_WORKFLOW.git
cd HOS_SKILL_WORKFLOW
```

### 使用 Skill

每个 Skill 模块都是独立的，可以直接在 AI IDE 中使用：

1. **浏览模块** — 查看上方 Skill 模块表格，找到需要的模块
2. **阅读文档** — 点击模块链接进入对应目录，查看 SKILL.md 或 README.md
3. **加载 Skill** — 在 AI IDE 中引用 SKILL.md 文件路径，或复制内容到项目

### 示例：使用 HOS-Sec-Engine

```bash
cd 00-HOS-Sec-Engine
npm install
npm run build
npm start
```

### 示例：使用 HOS-Silly-Mock

```bash
cd 04-HOS-Silly-Mock
npm install
npm test
```

---

## 兼容平台

| 平台 | 支持状态 |
|------|----------|
| Claude Code | ✅ 支持 |
| OpenAI Codex | ✅ 支持 |
| Cursor | ✅ 支持 |
| Gemini CLI | ✅ 支持 |
| VSCode AI IDE | ✅ 支持 |
| Trae | ✅ 支持 |

---

## 目录结构

```
HOS_SKILL_WORKFLOW/
├── 00-HOS-Sec-Engine/          # 安全测试引擎 (TypeScript)
├── 01-HOS-SAVE-COST/           # AI 成本优化技能集
├── 02-HOS-LIFE-OKR/            # 生活 OKR 学习引擎
├── 03-HOS-Vibe-Guard/          # Vibe Coding 护栏
├── 04-HOS-Silly-Mock/          # 反假数据检测器
├── 05-HOS-XRG-Loop/            # 自稳定工程系统 (Shell)
├── 06-HOS-Fuck-Demo/           # AI 内容工业流水线
├── 07-HOS-IP-Writing/          # 知识产权写作系统
├── 08-HOS-Micro-Biz/           # 微商技术服务运营
├── 09-HOS-Content-Engine/      # AI 安全实验室内容引擎 (4D 内容模型)
├── 09-HOS-Ops-Skills/          # HOS 生态运营工具集
├── 100-HOS-AUTO-WORKFLOW/      # 自动化工作流配置 (YAML)
├── 101-HOS-AI Guardrail/       # AI 安全检测插件 (Python)
├── 200-JSON结构化提示词/        # JSON 开发模板
├── 300-HUMAN-PASS/             # 人工验证记录
├── .github/workflows/ci.yml    # CI 配置
└── LICENSE.txt                 # MIT 许可证
```

---

## 开发规范

所有 Skill 模块遵循统一的 SKILL.md 规范：

```
skill-name/
├── SKILL.md              # Skill 定义（必需）
├── README.md             # 使用说明（推荐）
├── src/                  # 源代码（可选）
├── tests/                # 测试（可选）
├── templates/            # 模板文件（可选）
└── workflows/            # 工作流定义（可选）
```

---

## 许可证

MIT License — 详见 [LICENSE.txt](LICENSE.txt)
