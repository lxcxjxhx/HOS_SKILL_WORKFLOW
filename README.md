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

> **前缀约定**：`W-` = Workflow / 老版单文件强约束格式（Dify 工作流、Python 应用、JSON 模板、占位记录）；`S-` = Standard 标准多文件结构 skill（`SKILL.md` + `src/` / `templates/` / `workflows/` 子目录）

| 编号 | 模块 | 语言 | 描述 | 文档 |
|------|------|------|------|------|
| W-00 | [HOS-Auto-Workflow](W-00-HOS-Auto-Workflow/) | YAML | 自动化工作流配置：报告撰写工具 + 配置手册 | - |
| W-01 | [HOS-AI-Guardrail](W-01-HOS-AI-Guardrail/) | Python | AI 安全检测插件：文本/文件/图片输入输出检测，FastAPI 实现 | - |
| W-02 | [HOS-JSON-Prompts](W-02-HOS-JSON-Prompts/) | JSON | 开发模板集合：项目、安全、测试、运营、模型、考试等场景 | - |
| W-03 | [HOS-Human-Pass](W-03-HOS-Human-Pass/) | Text | 人工验证通过记录 | - |
| S-00 | [HOS-Sec-Engine](S-00-HOS-Sec-Engine/) | TypeScript | AI 原生安全测试引擎，流程模板 + 决策树 + CVE 集成 + MCP 管理层 | [README](S-00-HOS-Sec-Engine/README.md) |
| S-01 | [HOS-Save-Cost](S-01-HOS-Save-Cost/) | Markdown | AI 成本优化技能集：Token 优先工程、上下文压缩、最小重构架构 | [README](S-01-HOS-Save-Cost/skills/README.md) |
| S-02 | [HOS-LIFE-OKR](S-02-HOS-LIFE-OKR/) | Markdown | 生活 OKR 自动化学习引擎：OKR 驱动 + KPI 约束 + 时间切片 + 自动任务生成 | [SKILL.md](S-02-HOS-LIFE-OKR/SKILL.md) |
| S-03 | [HOS-Vibe-Guard](S-03-HOS-Vibe-Guard/) | TypeScript | 防 Vibe Coding 退化护栏：选题质量检测 + 架构升级引擎 + 安全护栏 | [README](S-03-HOS-Vibe-Guard/README.md) |
| S-04 | [HOS-Silly-Mock](S-04-HOS-Silly-Mock/) | TypeScript | 反假数据/反正则现实强制层：阻止 AI 伪造系统可运行性 | [README](S-04-HOS-Silly-Mock/README.md) |
| S-05 | [HOS-XRG-Loop](S-05-HOS-XRG-Loop/) | Shell | 自稳定工程系统：目标动态调节 + 价值密度控制 + 现实反馈闭环 | [CLAUDE.md](S-05-HOS-XRG-Loop/CLAUDE.md) |
| S-06 | [HOS-Fuck-Demo](S-06-HOS-Fuck-Demo/) | Markdown | AI 内容工业流水线：全自动输出内容包+PPT+音频+视频+项目注册 | [README](S-06-HOS-Fuck-Demo/README.md) |
| S-07 | [HOS-IP-Writing](S-07-HOS-IP-Writing/) | Markdown | 知识产权写作系统：论文、专利、软著、书籍、博客、润色六大场景 | [README](S-07-HOS-IP-Writing/README.md) |
| S-08 | [HOS-Micro-Biz](S-08-HOS-Micro-Biz/) | Markdown | 微商技术服务运营：服务设计 + 定价策略 + 获客文案 + 客户沟通 SOP + 订单管理 + 风控合规 | [README](S-08-HOS-Micro-Biz/README.md) |
| S-09 | [HOS-Ops-Skills](S-09-HOS-Ops-Skills/) | Markdown | HOS 生态运营工具集：周报/日志/Release Notes/多平台适配/社区运营/品牌守护/微商运营 | [README](S-09-HOS-Ops-Skills/README.md) |
| S-10 | [HOS-GH-ContribOS](S-10-HOS-GH-ContribOS/) | Markdown | GitHub 贡献操作系统：从项目创建到 PR 合并的完整开源贡献生命周期，双引擎 + 六角色视图 + 经验循环 | [README](S-10-HOS-GH-ContribOS/README.md) |
| S-11 | [HOS-Paper-RedTeam](S-11-HOS-Paper-RedTeam/) | Markdown | 论文红队系统（HOS论文鞭尸局）：发现→审计→攻击→修复→研究机会，毒舌点评 + RVE 漏洞编号 | [README](S-11-HOS-Paper-RedTeam/README.md) |

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
cd S-00-HOS-Sec-Engine
npm install
npm run build
npm start
```

### 示例：使用 HOS-Silly-Mock

```bash
cd S-04-HOS-Silly-Mock
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
├── W-00-HOS-Auto-Workflow/       # 自动化工作流配置 (YAML)
├── W-01-HOS-AI-Guardrail/        # AI 安全检测插件 (Python)
├── W-02-HOS-JSON-Prompts/        # JSON 开发模板
├── W-03-HOS-Human-Pass/          # 人工验证记录
├── S-00-HOS-Sec-Engine/          # 安全测试引擎 (TypeScript)
├── S-01-HOS-Save-Cost/           # AI 成本优化技能集
├── S-02-HOS-LIFE-OKR/            # 生活 OKR 学习引擎
├── S-03-HOS-Vibe-Guard/          # Vibe Coding 护栏
├── S-04-HOS-Silly-Mock/          # 反假数据检测器
├── S-05-HOS-XRG-Loop/            # 自稳定工程系统 (Shell)
├── S-06-HOS-Fuck-Demo/           # AI 内容工业流水线
├── S-07-HOS-IP-Writing/          # 知识产权写作系统
├── S-08-HOS-Micro-Biz/           # 微商技术服务运营
├── S-09-HOS-Ops-Skills/          # HOS 生态运营工具集
├── S-10-HOS-GH-ContribOS/        # GitHub 贡献操作系统
├── S-11-HOS-Paper-RedTeam/       # 论文红队系统（HOS论文鞭尸局）
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
