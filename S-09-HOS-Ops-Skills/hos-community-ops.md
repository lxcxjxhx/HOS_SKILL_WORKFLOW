---
name: HOS-Community-Ops
description: "HOS GitHub 社区运营助手 — Discussions / Issues / Contributing Guide 管理与运营"
license: MIT
metadata:
  author: HOS Team
  version: "1.0.0"
  tags: [community, GitHub-Discussions, good-first-issue, contributing]
  category: community
  risk-level: low
---

# hos-community-ops

## Description
HOS GitHub 社区运营助手。管理 Discussions、Issues、Contributing Guide 等社区基础设施，将 Issues 当内容运营，通过 `good first issue` 降低贡献门槛，建立活跃的社区生态。

## Trigger
当用户提到以下关键词时激活：
- "Discussion"、"讨论"、"社区运营"
- "good first issue"、"贡献指南"
- "Issue 运营"、"feature voting"、"roadmap 讨论"
- "contributing"、"社区"

## Context

### HOS 社区运营理念
1. **Issues 是内容**：每个 Issue 都可以成为技术讨论的入口
2. **Discussions 是社区**：Roadmap、Feature Voting、Q&A 都在这里
3. **好贡献是设计出来的**：通过 `good first issue` 降低门槛
4. **持续活跃 > 一次性爆发**：每周保持更新节奏

### 仓库路径
- HOS-Forge: `c:\1AAA-PROJECT\HOS\HOS-Forge`
- HOS-LS: `c:\1AAA-PROJECT\HOS\HOS-LS`
- HOS_SKILL_WORKFLOW: `c:\1AAA-PROJECT\WORKFLOW`

## Capabilities

### 1. Discussion 模板生成

#### Roadmap Discussion
```markdown
---
title: "Roadmap 2026 H2 — Your Input Wanted"
labels: ["roadmap"]
---

# HOS Roadmap — Second Half 2026

We're planning the next 6 months and want your input.

## HOS-Forge (AI Security IDE)
- [ ] Agent Verification Loop
- [ ] Security Personality System
- [ ] CLI interface for headless environments
- [ ] Plugin marketplace

## HOS-LS (AI Analysis Engine)
- [ ] Rust language support
- [ ] C# language support
- [ ] AI Review mode (PR security review)
- [ ] Custom rule DSL

## HOS_SKILL_WORKFLOW
- [ ] MCP integration templates
- [ ] Multi-agent collaboration workflows
- [ ] Security audit automation pack

## How to Contribute
- Vote on existing items (👍 reaction)
- Suggest new features in comments
- Pick up `good first issue` tagged items

---
*Last updated: <date>*
```

#### Feature Voting
```markdown
---
title: "Feature Voting: What Should We Build Next?"
labels: ["feature-voting"]
---

# Feature Voting

Vote with 👍 reactions. Top 3 will be prioritized next sprint.

## Candidates

### 1. Dark Mode for HOS-Forge
Current IDE theme is light-only. Many contributors requested dark mode.

### 2. YAML Rule Format for HOS-LS
Current rules are Python-based. YAML would lower the barrier for rule contribution.

### 3. VS Code Extension
Package HOS-Forge analysis as a VS Code extension for wider reach.

### 4. Multi-language Report
Generate security reports in Chinese, English, Japanese.

---
*Voting closes: <date + 7 days>*
```

#### Weekly Question
```markdown
---
title: "Weekly Question: How do you handle false positives in AI security scanning?"
labels: ["weekly-question"]
---

# Weekly Question

This week: **How do you handle false positives in AI-based security scanning?**

Share your approach:
- Confidence thresholds?
- Manual review workflow?
- Suppression rules?
- Something else?

Best answers will be featured in next week's dev log.
```

### 2. Issue 模板设计

#### Feature Request（内容运营型）
```markdown
---
name: Feature Request
about: Suggest a feature for HOS ecosystem
title: "[FEATURE] "
labels: ["enhancement"]
---

## Problem Statement
What problem does this solve?

## Proposed Solution
How should it work?

## Alternatives Considered
What other approaches did you think about?

## Additional Context
Links, references, mockups.
```

#### Good First Issue 模板
```markdown
---
title: "[GOOD FIRST] Add <language> parser scaffold"
labels: ["good first issue", "help wanted"]
---

## What
Add a basic parser scaffold for `<language>` in HOS-LS.

## Why
We need `<language>` support and this is a well-scoped starting point.

## Scope
- [ ] Create `src/parsers/<language>.py`
- [ ] Implement `parse_file()` returning AST nodes
- [ ] Add 3 test cases in `tests/parsers/test_<language>.py`
- [ ] Update `docs/supported-languages.md`

## Resources
- Existing parser example: `src/parsers/python.py`
- Parser interface: `src/core/parser_base.py`
- Contributing guide: `CONTRIBUTING.md`

## Difficulty
⭐⭐ (Medium) — requires basic understanding of AST

## Estimated Time
2-4 hours
```

### 3. Contributing Guide 生成

```markdown
# Contributing to HOS

## Quick Start
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make changes and add tests
4. Run tests: `pytest`
5. Commit with conventional commit message
6. Push and open a PR

## What Can I Contribute?

### Easy (good first issue)
- Add a new detection rule
- Add a new language parser scaffold
- Improve documentation
- Add test cases
- Fix typos

### Medium
- Implement a new workflow template
- Add MCP integration
- Performance optimization

### Advanced
- Core architecture changes
- New language full support
- Security research integration

## Code Style
- Python: PEP 8, flake8, mypy
- Commits: Conventional Commits (English)
- PRs: Must reference an issue

## PR Process
1. Open an issue first (if not exists)
2. Reference the issue in your PR
3. All CI checks must pass
4. One maintainer review required
```

### 4. Issue 运营策略

当用户要求运营 Issues 时，执行以下策略：

| 策略 | 操作 | 频率 |
|------|------|------|
| **内容型 Issue** | 创建 "Need Rust Support" 等需求收集 Issue | 每月 2-3 个 |
| **Good First Issue** | 从 Roadmap 中拆出小任务，标记 `good first issue` | 每月 3-5 个 |
| **Bug Triage** | 分类现有 Issues，添加优先级标签 | 每周 |
| **Stale Cleanup** | 关闭超过 90 天无活动的 Issues（先评论提醒） | 每月 |
| **Cross-reference** | 在相关 Issue 间建立链接 | 持续 |

## Workflow

### Step 1: 确定运营目标
用户指定：
- 要运营哪个仓库？
- 要做什么类型的运营？（Discussion / Issue / Contributing）
- 目标受众？（现有用户 / 新贡献者 / 安全社区）

### Step 2: 分析当前状态
```powershell
# 查看现有 Discussions
gh api repos/<owner/repo>/discussions

# 查看现有 Issues 状态
gh issue list --repo <owner/repo> --state all --limit 50

# 查看标签
gh label list --repo <owner/repo>
```

### Step 3: 生成内容
根据运营目标和当前状态，使用上述模板生成内容。

### Step 4: 输出运营计划
```markdown
## 本周社区运营计划

### Discussions
- [ ] 发布 Weekly Question
- [ ] 更新 Roadmap Discussion（添加新进展）

### Issues
- [ ] 创建 2 个 good first issue
- [ ] 分类 5 个未标记的 issue
- [ ] 关闭 1 个 stale issue（先评论提醒）

### Contributing
- [ ] 更新 CONTRIBUTING.md（添加新模块说明）
```

## Rules
1. Discussion 和 Issue 内容默认英文
2. Good First Issue 必须包含完整的上下文和参考链接
3. 每个 Good First Issue 必须标注预估时间和难度
4. Feature Voting 必须设置明确的截止时间
5. Weekly Question 必须与最近开发进展相关
6. 输出保存到 `c:\1AAA-PROJECT\BOS\BOS-OPER\hos-skills\output\community\` 目录
