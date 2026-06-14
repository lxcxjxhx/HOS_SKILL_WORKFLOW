# HOS Skill Workflow

<p align="center">
  <img src="./assets/logo.png" width="180">
</p>

<h1 align="center">
HOS Skill Workflow
</h1>

<p align="center">
Enterprise AI Skill Engineering Framework
</p>

<p align="center">

![GitHub stars](https://img.shields.io/github/stars/lxcxjxhx/HOS_SKILL_WORKFLOW?style=for-the-badge)
![GitHub forks](https://img.shields.io/github/forks/lxcxjxhx/HOS_SKILL_WORKFLOW?style=for-the-badge)
![GitHub issues](https://img.shields.io/github/issues/lxcxjxhx/HOS_SKILL_WORKFLOW?style=for-the-badge)
![License](https://img.shields.io/github/license/lxcxjxhx/HOS_SKILL_WORKFLOW?style=for-the-badge)

</p>

<p align="center">

[📖 Documentation](./docs)
•
[🚀 Quick Start](#quick-start)
•
[🧩 Skills](./skills)
•
[🔄 Workflows](./workflows)
•
[🛣 Roadmap](#roadmap)

</p>

---

## Overview

HOS Skill Workflow 是一个面向 AI Agent、AI IDE、Claude Code、Codex、Cursor、Gemini CLI 的 Skill 工程化框架。

核心目标：

✅ Skill 标准化

✅ Workflow 工程化

✅ Multi-Agent 编排

✅ Context 压缩

✅ Token 优化

✅ 企业级复用

---

## Architecture

```mermaid
flowchart TD

U[User Request]

I[Intent Analysis]

R[Workflow Router]

A[Architect Agent]
D[Developer Agent]
S[Security Agent]
T[Tester Agent]
RV[Reviewer Agent]

SK[Skill Engine]

V[Validation Layer]

O[Final Output]

U --> I
I --> R

R --> A
R --> D
R --> S
R --> T
R --> RV

A --> SK
D --> SK
S --> SK
T --> SK
RV --> SK

SK --> V
V --> O
```

---

## Skill Lifecycle

```mermaid
flowchart LR

Idea
--> Design
--> Create
--> Validate
--> Test
--> Publish
--> Monitor
--> Optimize
--> Upgrade
```

---

## Workflow Types

### Sequential Workflow

```mermaid
flowchart LR

A[Research]
--> B[Analysis]
--> C[Generation]
--> D[Validation]
```

### Parallel Workflow

```mermaid
flowchart TB

Input

Input --> A[Agent A]
Input --> B[Agent B]
Input --> C[Agent C]
Input --> D[Agent D]

A --> M[Merge]
B --> M
C --> M
D --> M
```

### Review Workflow

```mermaid
flowchart LR

Create
--> Review
--> Fix
--> Verify
--> Release
```

---

## Repository Structure

```text
HOS_SKILL_WORKFLOW

├── skills/
├── workflows/
├── templates/
├── standards/
├── docs/
├── examples/
├── assets/
└── README.md
```

---

## Core Components

| Module      | Description |
| ----------- | ----------- |
| Skills      | 可复用能力单元     |
| Workflows   | 工作流定义       |
| Templates   | Skill 模板    |
| Standards   | 开发规范        |
| Registry    | Skill 索引    |
| Validation  | 质量验证        |
| Marketplace | Skill 分发    |

---

## Skill Execution Model

```mermaid
sequenceDiagram

participant User
participant Router
participant Workflow
participant Skill
participant Validator

User->>Router: Request

Router->>Workflow: Route

Workflow->>Skill: Execute

Skill-->>Workflow: Result

Workflow->>Validator: Verify

Validator-->>Workflow: Approved

Workflow-->>User: Final Output
```

---

## Compatibility Matrix

| Platform      | Support |
| ------------- | ------- |
| Claude Code   | ✅       |
| OpenAI Codex  | ✅       |
| Cursor        | ✅       |
| Gemini CLI    | ✅       |
| VSCode AI IDE | ✅       |
| Continue.dev  | ✅       |
| Cline         | ✅       |
| Roo Code      | ✅       |
| OpenHands     | 🚧      |

---

## Example Ecosystem

```mermaid
graph TD

HSW[HOS Skill Workflow]

HSW --> HOSLS[HOS-LS]

HSW --> BOSFS[BOS-FS]

HSW --> ORRERY[Orrery]

HSW --> MCP[MCP Server]

HSW --> IDE[AI IDE]

HSW --> AGENT[Agent Runtime]
```

---

## Quick Start

### Clone

```bash
git clone https://github.com/lxcxjxhx/HOS_SKILL_WORKFLOW.git
```

### Skill Development

```bash
skills/
└── my_skill
    ├── SKILL.md
    ├── metadata.yaml
    ├── examples.md
    └── changelog.md
```

### Run Workflow

```bash
workflow run code-review
```

---

## Roadmap

### v1

* Skill Standard
* Workflow Standard
* Validation Framework

### v2

* Skill Registry
* Skill Marketplace
* Workflow Builder

### v3

* Auto Skill Generation
* Auto Workflow Generation
* Multi-Agent Runtime

### v4

* Autonomous Evolution
* Enterprise Platform
* Skill Cloud

---

## Contributing

Pull Requests are welcome.

Please read:

* CONTRIBUTING.md
* CODE_OF_CONDUCT.md

before submitting changes.

---


## License

MIT License

---

<p align="center">

Building the Future of Skill Engineering

</p>

