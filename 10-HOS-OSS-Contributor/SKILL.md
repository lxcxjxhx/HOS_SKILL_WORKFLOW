---
name: HOS-OSS-Contributor
description: AI 驱动的开源贡献全流程工具 — 从项目评估、源码分析、CI/CD 智能审查到 PR 提交与维护者沟通的端到端自动化
version: 1.0.0
author: HOS Team
tags:
  - open-source
  - contribution
  - ci-cd
  - github-actions
  - pr-automation
  - security-review
---

# HOS-OSS-Contributor

> **AI 驱动的开源贡献全流程工具** — 融合 CI/CD 智能框架与开源 PR 提交流程，提供从项目评估到 PR 合并的端到端自动化能力。

## 定位

本 Skill 是 **HOS-GH-CICD（AI Native CI/CD Engineering Framework）** 与 **submit-oss-pr（开源 PR 提交流程）** 的深度融合产物。

| 来源 | 贡献能力 |
|------|---------|
| HOS-GH-CICD | CI/CD 智能审查、Workflow AST 解析、安全检测、自动修复、权限分级 |
| submit-oss-pr | 项目评估方法论、源码分析流程、PR 提交规范、维护者沟通策略、经验循环机制 |

## 适用场景

- 向高星信息安全开源项目提交 PR（OWASP、PyCQA、semgrep 等）
- 需要 AI 辅助分析仓库结构、定位改进点、生成 CI/CD 配置
- 需要自动化 CI/CD 审查、安全检测、工作流生成
- 需要完整的 PR 提交流程指导（从评估到合并）
- 希望建立可复用的开源贡献经验体系

## 核心流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    HOS-OSS-Contributor 全流程                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Phase 1: 项目评估                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 7 维度评估 → 技术栈匹配 / 社区活跃 / 贡献友好 / 维护响应 /         │   │
│  │ 文档完善 / 测试覆盖 / 改动规模                                      │   │
│  │ → 决策：≥5 项合格继续 / 3-4 项谨慎 / <3 项放弃                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              ↓                                              │
│  Phase 2: 源码分析 + CI/CD 智能审查                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Repository Parser → Project Profile（语言/框架/依赖/特征标签）      │   │
│  │ Workflow AST → 解析现有 CI/CD 配置                                  │   │
│  │ Security Review → 权限检查 / 密钥暴露 / 注入风险 / Action 版本      │   │
│  │ CI Debug → 错误模式解析 / 知识库匹配 / 修复建议                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              ↓                                              │
│  Phase 3: 改动准备 + 工作流生成                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Action Design → CI/CD Proposal（组件推荐 + 配置方案）               │   │
│  │ Workflow Generation → 生成 .github/workflows/*.yml                  │   │
│  │ 代码实现 → 最小改动原则 / 测试覆盖 / 文档更新                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              ↓                                              │
│  Phase 4: PR 提交 + CI 应对                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Git 操作 → feature branch / conventional commit / push to fork      │   │
│  │ PR 描述 → Motivation / Changes / Testing / Checklist                │   │
│  │ CI 应对 → 失败分析 / 本地重现 / 修复 / 重新提交                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              ↓                                              │
│  Phase 5: 维护者沟通 + 经验循环                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 跟进策略 → Day 3/7/14/21 分阶段跟进                                 │   │
│  │ Review 回应 → 24h 内响应 / 礼貌专业 / 解释决策                      │   │
│  │ 经验记录 → PR 信息 / 成功因素 / 失败模式 / 改进措施                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 双模式架构

本 Skill 提供两种运行模式：

### Skill Mode（人机协作）

适合工程师手动执行，每个阶段提供结构化指导：

| # | Skill | 输入 | 输出 |
|---|-------|------|------|
| 1 | **项目评估** | 仓库 URL | 7 维度评分报告 |
| 2 | **仓库分析** | 仓库路径 | Project Profile（语言/框架/依赖/标签） |
| 3 | **方案设计** | Project Profile | CI/CD Proposal（组件 + 配置） |
| 4 | **工作流生成** | CI/CD Proposal | `.github/workflows/*.yml` |
| 5 | **安全审查** | Workflow YAML | 安全风险评估（LOW/MEDIUM/HIGH/CRITICAL） |
| 6 | **CI 调试** | Actions log | Root Cause + Fix Suggestion |

### Autonomous Mode（自动执行）

适合 AI Agent 端到端自动执行，6 个 Agent 协同工作：

| Agent | 职责 |
|-------|------|
| **Context Collector** | 收集 GitHub 事件上下文（PR/Issue/Action Failure） |
| **Planner Agent** | 评估风险，生成执行计划 |
| **Workflow Engineer** | 操作 Workflow AST，生成变更后的 workflow |
| **Validator Agent** | 静态验证（YAML 语法/Action 版本/权限/Dry-run） |
| **Repair Agent** | 自动修复 CI 失败，编排分析→修复→验证循环 |
| **PR Agent** | 创建 PR，根据策略决定是否自动合并 |

## 权限分级

| 级别 | 名称 | 说明 |
|------|------|------|
| Level 0 | 只读分析 | 仅允许分析、审查、生成报告 |
| Level 1 | 建议模式 | 允许生成 Proposal，需人工确认 |
| Level 2 | 半自动 | 允许低风险自动操作，中高风险需审批 |
| Level 3 | 高度自动 | 允许中低风险自动操作，支持自动合并 |
| Level 4 | 完全自主 | 允许所有操作自动执行，仅 CRITICAL 需审批 |

## 项目评估标准

### 7 维度评估

| 维度 | 评估要点 | 合格标准 |
|------|---------|---------|
| 技术栈匹配度 | 项目使用的语言/框架是否熟悉 | 至少熟悉核心语言 |
| 社区活跃度 | 最近 3 个月是否有活跃维护 | 有近期 commit 和 PR 合并 |
| 贡献友好度 | 是否有 CONTRIBUTING.md | 有明确的贡献指南 |
| 维护者响应 | 历史 PR 的平均响应时间 | < 1 周 |
| 文档完善度 | 是否有完整的开发文档 | 有 README + 开发指南 |
| 测试覆盖率 | 是否有 CI 和测试 | 有自动化测试 |
| 改动规模适配 | 是否有 small scope 的改进空间 | 有 good first issue 标签 |

### 决策流程

- 7 项中至少 5 项合格 → 继续
- 3-4 项合格 → 谨慎考虑，需额外准备
- < 3 项合格 → 放弃，选择其他项目

### 避坑指南

**避免的项目特征**：
- 代码量 > 50 万行的超大型项目
- 使用冷门技术栈（OCaml、Haskell 等）
- 超过 3 个月无提交的不活跃项目
- 明确拒绝小型贡献的项目（如 Juice Shop）
- 需要签署 CLA 且流程复杂的项目

**优先选择的项目特征**：
- 代码量 5 万-20 万行的中型项目
- 熟悉的技术栈（日常使用的语言/框架）
- 多个活跃维护者，近期有 commit
- 有完善的 CONTRIBUTING.md 和 PR 模板
- 有标记的 "good first issue"

## 源码分析方法

### 快速理解项目结构

```bash
# 浏览顶层目录
tree -L 2 -I 'node_modules|vendor|.git'

# 找到主入口文件
grep -r "if __name__" --include="*.py" .
grep -r "def main" --include="*.go" .

# 查看 CLI 入口
cat setup.py | grep entry_points
cat package.json | grep bin
```

### 定位改进点

**策略 1: 从 issue 列表寻找**
```bash
gh issue list --label bug --state open
gh issue list --label "good first issue" --state open
```

**策略 2: 分析历史 PR**
```bash
gh pr list --state merged --limit 20
gh pr list --state closed --search "is:unmerged"
```

**策略 3: 代码审查发现**
```bash
grep -r "TODO\|FIXME\|XXX" --include="*.py" .
grep -r "except:" --include="*.py" .
```

### 验证问题真实性

- 确保问题在实际代码中存在（非假设性问题）
- 准备复现示例或测试用例
- 参考社区讨论确认问题价值

## CI/CD 智能审查

### Workflow AST 解析

将 GitHub Actions workflow YAML 解析为可操作的抽象语法树：

```yaml
# 输入: .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pytest
```

```python
# 输出: Workflow AST
Workflow(
  name="CI",
  on=TriggerConfig(push=PushTrigger(branches=["main"])),
  jobs={
    "build": Job(
      runs_on="ubuntu-latest",
      steps=[
        Step(uses="actions/checkout@v4"),
        Step(run="pytest")
      ]
    )
  }
)
```

### 安全审查规则

| 规则 ID | 规则名称 | 严重级别 | 说明 |
|---------|---------|---------|------|
| E001 | 废弃命令检测 | ERROR | 检测 `::set-env` 等已废弃的 workflow command |
| E002 | 硬编码密钥检测 | ERROR | 检测 token/password/api_key 等硬编码值 |
| W001 | 根权限检查 | WARNING | 检测缺少 `permissions` 配置 |
| S001 | Step 命名检查 | WARNING | 检测缺少 `name` 的 step |
| SEC001 | write-all 权限 | CRITICAL | 检测 `permissions: write-all` 高风险配置 |
| SEC002 | pull_request_target | HIGH | 检测 `pull_request_target` 安全风险 |
| SEC003 | Action 版本锁定 | MEDIUM | 检测使用 `@main` 而非版本标签的第三方 Action |

### CI 调试

常见 CI 失败及修复：

| 失败类型 | 原因 | 修复方法 |
|---------|------|---------|
| Lint 失败 | 代码格式不符合规范 | 运行 `pre-commit run --all-files` |
| 测试失败 | 测试用例有问题 | 检查测试逻辑，确保覆盖正确 |
| 构建失败 | 依赖冲突或配置错误 | 检查 requirements/setup 文件 |
| CLA 未签署 | 项目要求 CLA | 提交前签署 CLA |
| codecov 失败 | 覆盖率降低 | 补充测试用例 |

## PR 提交规范

### Git 操作

```bash
# 创建 feature branch
git checkout -b fix/issue-description

# Stage 改动（避免使用 git add -A）
git add <specific-files>

# Commit（使用 conventional commit 格式）
git commit -m "fix(scope): description"

# Push 到 fork
git push -u origin fix/issue-description
```

### PR 描述模板

```markdown
## Motivation
[说明问题的背景和重要性，使用具体数据和示例]

## Changes
[描述改动内容，按文件/模块列出具体改动]

## Testing
[说明测试方法和结果，提供可复现的步骤]

## Checklist
- [ ] Code follows the project's coding standards
- [ ] Tests have been added/updated
- [ ] Documentation has been updated (if applicable)
- [ ] Commit messages follow conventional format
- [ ] No new dependencies introduced (or justified)
- [ ] Changes are backward compatible
```

### 提交前强制检查

- [ ] 代码可以编译/运行
- [ ] 所有测试通过
- [ ] 代码覆盖率达标
- [ ] 代码格式符合规范（pre-commit）
- [ ] 没有 lint 警告
- [ ] commit message 清晰
- [ ] PR 描述完整
- [ ] 一个 PR 只做一个改动
- [ ] 已阅读 CONTRIBUTING.md
- [ ] CLA 已签署（如需要）

## 维护者沟通

### 跟进策略

| 时间节点 | 行动 | 说明 |
|---------|------|------|
| Day 1-3 | 等待 | 正常等待，不要催促 |
| Day 3 | 检查 CI | 确认 CI 是否通过 |
| Day 7 | 礼貌提醒 | 第一次跟进 |
| Day 14 | 二次跟进 | 询问是否需要修改 |
| Day 21 | 考虑关闭 | 评估是否继续 |

### 沟通模板

**Day 7 提醒**：
```
Hi @maintainer,

Just a friendly reminder that this PR is ready for review. 
Please let me know if you need any additional information.

Thanks!
```

**回应 review 意见**：
```
Thanks for the review! I've addressed your comments:
- [具体改动说明]

Please let me know if there's anything else I should adjust.
```

## 经验循环机制

### 每次 PR 后更新

1. **记录 PR 信息**：URL、状态、审核周期、过审/被拒原因
2. **更新经验文档**：添加新的问题和解决方案
3. **优化流程**：根据实际经验调整提交流程

### 41 个 PR 复盘：常见失败模式

| 失败特征 | 典型案例 | 避免方法 |
|---------|---------|---------|
| 混合无关改动 | mitmproxy #8314 | 一个 PR 一个改动 |
| 方向不符 | LlamaFactory #10626 | 提前在 issue 沟通 |
| 未使用 PR 模板 | NetExec #1304 | 仔细阅读 CONTRIBUTING.md |
| CLA 未签署 | pytorch #189023 | 提交前签署 CLA |
| 技术细节错误 | garak #1913 | 确认所有技术细节准确 |
| 冷启动无响应 | 38/41 个 PR 无 review | 选择维护者活跃的项目 |

### 过审关键因素

| 特征 | 说明 | 重要性 |
|------|------|--------|
| 改动聚焦单一问题 | 一个 PR 只解决一个问题 | 极高 |
| CI 全部通过 | 所有自动化检查通过 | 极高 |
| 项目规模适中 | 中小型项目更容易获得 review | 高 |
| 维护者活跃 | 近期有 commit 和 PR 合并记录 | 高 |
| 提前沟通 | 在 issue 中与维护者确认方向 | 高 |

## 参考资源

- [PR 提交前 checklist](templates/pr-checklist.md)
- [PR 描述模板](templates/pr-description-template.md)
- [CI 检查应对指南](templates/ci-troubleshooting-guide.md)
- [维护者沟通模板](templates/maintainer-communication-templates.md)
- [可复用经验总结](templates/reusable-experience.md)

## 注意事项

1. **真实性**：确保改动基于真实源码分析，而非假设性问题
2. **质量**：代码质量要高，测试要充分
3. **规范**：遵循项目社区规范，使用 PR 模板
4. **耐心**：等待审核需要时间，不要频繁催促
5. **沟通**：与维护者保持礼貌和专业的沟通
6. **安全**：不要泄露 GitHub token 等敏感信息
7. **聚焦**：一个 PR 只做一个改动，不混合无关更改
