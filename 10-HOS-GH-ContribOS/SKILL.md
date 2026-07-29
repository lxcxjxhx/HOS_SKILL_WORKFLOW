---
name: HOS-GH-ContribOS
description: GitHub 贡献操作系统 — 统一框架覆盖项目全生命周期，内置 CI/CD 智能引擎和 PR 贡献引擎，支持维护者、贡献者、初次提交者等 6 种角色视图
version: 3.0.0
author: HOS Team
tags:
  - github
  - open-source
  - contribution-lifecycle
  - maintainer-tools
  - ci-cd-intelligence
  - pr-automation
  - security-review
  - experience-loop
---

# HOS-GH-ContribOS

> **GitHub 贡献操作系统** — 不是工具集合，是统一框架。两个核心引擎（CI/CD Intelligence + Contribution Intelligence），六个角色视图，一套经验循环。覆盖从项目创建到 PR 合并的完整生命周期。

## 架构总览

```
┌─────────────────────────────────────────────────────────────────────┐
│                    HOS-GH-ContribOS v3.0                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              Unified Contribution Engine (UCE)                │  │
│  │                                                               │  │
│  │  ┌─────────────────────┐     ┌─────────────────────────┐    │  │
│  │  │  CI/CD Intelligence │     │  Contribution           │    │  │
│  │  │  Engine             │     │  Intelligence Engine    │    │  │
│  │  │                     │     │                         │    │  │
│  │  │  · Workflow AST     │     │  · 项目评估（4维+权重） │    │  │
│  │  │  · 安全审查（7规则）│◄───►│  · 源码分析（3策略）   │    │  │
│  │  │  · CI 调试知识库    │     │  · PR 规范（10项检查） │    │  │
│  │  │  · 自动修复引擎     │     │  · 失败模式（6类）     │    │  │
│  │  │  · 权限分级（5级）  │     │  · 跟进策略（Day3-21） │    │  │
│  │  └─────────────────────┘     │  · 经验循环（持续优化）│    │  │
│  │                               └─────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↕                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              6 Role Views（角色视图层）                        │  │
│  │                                                               │  │
│  │  Project Owner │ Maintainer │ Contributor                    │  │
│  │  First-timer   │ Reviewer   │ Community Manager              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 引擎一：CI/CD Intelligence Engine

### 1.1 Workflow AST 解析

将 GitHub Actions workflow YAML 解析为可操作的抽象语法树，支持解析、修改、生成与 diff。

**输入**：`.github/workflows/*.yml`  
**输出**：结构化 Workflow 对象

```python
# 解析流程
yaml_content → PyYAML → raw_dict → WorkflowAST → Workflow Object

# 关键数据结构
Workflow(
  name="CI",
  trigger=TriggerConfig(
    push=PushTrigger(branches=["main"]),
    pull_request=PRTrigger(types=["opened", "synchronize"])
  ),
  permissions=PermissionConfig(default="read", jobs={...}),
  jobs={
    "build": Job(
      runs_on="ubuntu-latest",
      permissions=JobPermission(...),
      steps=[
        Step(name="Checkout", uses="actions/checkout@v4"),
        Step(name="Test", run="pytest --cov=src")
      ],
      env={"PYTHON_VERSION": "3.11"}
    )
  }
)
```

**已知陷阱与修复**：
- PyYAML 将 `on:` 键解析为布尔值 `True`，必须同时检查 `data.get("on")` 和 `data.get(True)`
- `permissions: write-all` 是高危配置，需标记为 CRITICAL
- `pull_request_target` 存在安全风险（可访问 secrets），需标记为 HIGH

### 1.2 安全审查规则（7 条）

| 规则 ID | 名称 | 级别 | 检测内容 | 修复建议 |
|---------|------|------|---------|---------|
| E001 | 废弃命令 | ERROR | `::set-env`、`::set-output` 等已废弃的 workflow command | 迁移到 `$GITHUB_ENV`、`$GITHUB_OUTPUT` |
| E002 | 硬编码密钥 | ERROR | token/password/api_key/secret 等硬编码值 | 使用 `${{ secrets.XXX }}` |
| W001 | 根权限缺失 | WARNING | workflow 级别缺少 `permissions` 配置 | 添加 `permissions: contents: read` |
| S001 | Step 命名缺失 | WARNING | step 缺少 `name` 字段 | 添加描述性 name |
| SEC001 | write-all 权限 | CRITICAL | `permissions: write-all` | 替换为最小权限 |
| SEC002 | pull_request_target | HIGH | 使用 `pull_request_target` 触发器 | 评估是否可替换为 `pull_request` |
| SEC003 | Action 版本未锁定 | MEDIUM | 第三方 Action 使用 `@main` | 锁定到具体版本标签 `@v4` |

### 1.3 CI 调试知识库

基于实战积累的 CI 失败模式 → 修复映射：

| 失败类型 | 根因 | 修复方法 | 预防手段 |
|---------|------|---------|---------|
| Lint 失败 | 代码格式不符合规范 | `pre-commit run --all-files` | 本地安装 pre-commit hooks |
| 测试失败 | 测试用例逻辑错误 | 检查断言和 mock 设置 | 本地先跑通 `pytest -v` |
| 构建失败 | 依赖冲突或版本不兼容 | 检查 requirements/setup 文件 | 使用 lock 文件锁定版本 |
| CLA 未签署 | 项目要求 CLA 但未签 | 签署 CLA（个人/企业） | 提交前检查项目 CLA 要求 |
| codecov 失败 | 覆盖率下降 | 补充测试用例 | 确保新代码有测试覆盖 |
| 首次贡献者 CI 阻塞 | 维护者需手动批准 | 等待维护者在线 | 选择有自动 CI 的项目 |
| Node 版本不兼容 | Action 要求更高 Node 版本 | 升级 runner 或 Action 版本 | 使用 `@v4` 以上版本 |

### 1.4 自动修复引擎

```
CI 失败日志
  ↓
错误模式匹配（正则 + 关键词）
  ↓
知识库查询 → 匹配修复方案
  ↓
生成修复 patch
  ↓
本地验证 → 通过 → 提交修复 commit
         → 失败 → 标记为需人工介入
```

### 1.5 权限分级系统

| 级别 | 名称 | 适用角色 | 能力边界 |
|------|------|----------|---------|
| Level 0 | 只读分析 | 所有人 | 分析仓库、生成报告、查看数据 |
| Level 1 | 建议模式 | 初次贡献者 | 生成 PR 草稿和 CI/CD 建议，需人工确认 |
| Level 2 | 半自动 | 贡献者 | 低风险操作自动执行，中高风险需审批 |
| Level 3 | 高度自动 | 维护者 | 中低风险自动操作，支持自动合并 |
| Level 4 | 完全自主 | Project Owner | 所有操作自动执行，仅 CRITICAL 需审批 |

---

## 引擎二：Contribution Intelligence Engine

### 2.1 项目评估体系（7 维度 + 加权评分）

基于 41 个 PR 实战提炼的评估标准：

| 维度 | 权重 | 评估方法 | 合格标准 |
|------|------|---------|---------|
| 技术栈匹配度 | 20% | 检查主要语言/框架/依赖/构建工具 | 日常使用的技术栈 |
| 社区活跃度 | 15% | `git log --since="3 months ago"` + 近期 commit/issue/PR | 近 3 月有持续提交 |
| 贡献友好度 | 15% | 检查 CONTRIBUTING.md / PR 模板 / good first issue | 有明确贡献指南 |
| 维护者响应 | 15% | 历史 PR 的平均首次回复时间 | < 1 周 |
| 文档完善度 | 10% | README + API 文档 + 架构说明 | 有完整开发文档 |
| 测试覆盖率 | 15% | 是否有 CI + 测试是否容易本地运行 | 有自动化测试 |
| 改动规模适配 | 10% | 是否有 small scope 的改进空间 | 有 good first issue 标签 |

**决策流程**：
- 加权总分 ≥ 4 → 强烈推荐，继续
- 3-4 分 → 推荐，需额外准备
- 2-3 分 → 谨慎考虑，评估替代项目
- < 2 分 → 放弃

**快速评估检查清单**（提交 PR 前逐项检查）：
- [ ] 技术栈匹配度 ≥ 3？
- [ ] 社区活跃度 ≥ 3？
- [ ] 维护者响应时间 < 1 周？
- [ ] 有 CONTRIBUTING.md？
- [ ] 有 good first issue 标签？
- [ ] 历史外部 PR 合并率 > 50%？

### 2.2 避坑指南（实战验证）

**必须避免的项目**：
- 代码量 > 50 万行（Kubernetes、TensorFlow 级别）
- 冷门技术栈（OCaml、Haskell 等，学习成本过高）
- 超 6 个月无提交的不活跃项目
- 明确拒绝小型贡献的项目（如 Juice Shop："Low-effort contributions are not welcome"）
- 需要签署 CLA 且流程复杂的项目（除非已提前签署）
- 首次贡献者 CI 需手动批准的项目（冷启动周期过长）

**优先选择的项目**：
- 代码量 5-20 万行，架构清晰
- 多个活跃维护者，近期有 commit
- 有 CONTRIBUTING.md + PR 模板 + 自动 CI
- 历史外部 PR 合并率 > 50%
- 有 "good first issue" 标签

### 2.3 源码分析 3 策略

**策略 1：从 issue 列表寻找**
```bash
gh issue list --label bug --state open          # 已知 bug
gh issue list --label "good first issue" --state open  # 新手友好
```

**策略 2：分析历史 PR**
```bash
gh pr list --state merged --limit 20             # 学习成功模式
gh pr list --state closed --search "is:unmerged" # 了解拒绝模式
```

**策略 3：代码审查发现**
```bash
grep -r "TODO\|FIXME\|XXX" --include="*.py" .   # 待修复项
grep -r "except:" --include="*.py" .             # 裸异常
grep -r "deprecated\|DEPRECATED" --include="*.py" . # 废弃代码
```

**验证问题真实性（必须）**：
- 问题在实际代码中存在（非假设性）
- 准备复现示例或测试用例
- 参考社区讨论确认问题价值
- 确保改动符合项目设计理念

### 2.4 PR 提交规范

**Git 操作流程**：
```bash
# 1. 创建 feature branch
git checkout -b fix/issue-description

# 2. Stage 改动（禁止 git add -A）
git add <specific-files>

# 3. Commit（conventional commit 格式）
git commit -m "fix(scope): description"

# 4. Push 到 fork
git push -u origin fix/issue-description
```

**PR 描述模板**：
```markdown
## Motivation
[问题背景和重要性，使用具体数据和示例]

## Changes
[改动内容，按文件/模块列出具体改动]

## Testing
[测试方法和结果，提供可复现的步骤]

## Checklist
- [ ] Code follows the project's coding standards
- [ ] Tests have been added/updated
- [ ] Documentation has been updated (if applicable)
- [ ] No new dependencies introduced (or justified)
- [ ] Changes are backward compatible
```

### 2.5 提交前强制检查（10 项）

基于 41 个 PR 复盘提炼的强制检查清单：

| # | 检查项 | 重要性 | 失败案例 |
|---|--------|--------|---------|
| 1 | 代码可以编译/运行 | 极高 | — |
| 2 | 所有测试通过 | 极高 | — |
| 3 | 代码覆盖率不降低 | 高 | mitmproxy #8314 |
| 4 | 代码格式符合规范（pre-commit） | 高 | — |
| 5 | commit message 清晰规范 | 中 | — |
| 6 | PR 描述完整，使用项目模板 | 高 | NetExec #1304 |
| 7 | 一个 PR 只做一个改动 | 极高 | seclab-taskflow-agent #285 |
| 8 | 已阅读 CONTRIBUTING.md | 高 | — |
| 9 | CLA 已签署（如需要） | 极高 | pytorch #189023, trivy #10930 |
| 10 | 技术细节全部准确 | 高 | garak #1913 |

### 2.6 失败模式库（6 类，来自 41 个 PR 复盘）

| 失败特征 | 典型案例 | 根因 | 避免方法 |
|---------|---------|------|---------|
| 混合无关改动 | seclab-taskflow-agent #285 | 一次改太多，被评"AI-generated" | 一个 PR 一个改动 |
| 方向不符 | LlamaFactory #10626 | 未提前沟通，维护者指出方向错误 | 先在 issue 沟通 |
| 未使用 PR 模板 | NetExec #1304 | 忽略 CONTRIBUTING.md | 仔细阅读贡献指南 |
| CLA 未签署 | pytorch #189023 | 提交前未检查 CLA 要求 | 提前签署 CLA |
| 技术细节错误 | garak #1913 | 假设性判断，未验证 | 确认所有技术细节准确 |
| 冷启动无响应 | 38/41 个 PR 无 review | 选择的项目维护者不活跃 | 选维护者活跃的项目 |

### 2.7 跟进策略（Day 3/7/14/21）

| 时间节点 | 行动 | 模板 |
|---------|------|------|
| Day 1-3 | 等待 | 正常等待，不要催促 |
| Day 3 | 检查 CI | 确认 CI 是否通过，失败则立即修复 |
| Day 7 | 礼貌提醒 | "Hi @maintainer, just a friendly reminder that this PR is ready for review." |
| Day 14 | 二次跟进 | "I'm following up on this PR. If it's not aligned with the project's direction, please let me know." |
| Day 21 | 评估关闭 | 如仍无响应，考虑主动关闭，转向其他项目 |

### 2.8 经验循环机制

```
每次 PR 后 →
  记录：PR URL、状态、审核周期、过审/被拒原因、维护者反馈
  ↓
  分析：哪些项目容易过审？哪些改动类型受欢迎？哪些沟通方式有效？
  ↓
  优化：调整项目选择策略、改进 PR 准备流程、优化沟通技巧
  ↓
  分享：更新经验文档、帮助新手避坑、建立最佳实践
```

**经验文档版本化管理**：
- 每次 PR 后更新 `tracking/pr-log.md`
- 关键经验提炼到 `reusable-experience.md`
- 流程调整记录到 `changelog.md`
- 采用语义化版本号 `MAJOR.MINOR`

**版本命名规范**：
| 版本变更 | 含义 | 示例 |
|---------|------|------|
| MAJOR（主版本） | 文档结构重大调整、核心流程变更 | v1.0 -> v2.0 |
| MINOR（次版本） | 新增经验条目、模板更新、流程优化 | v1.0 -> v1.1 |

**更新流程**：
1. 记录 PR 结果：在 `tracking/pr-log.md` 中添加本次 PR 记录
2. 提炼经验：将本次 PR 的关键经验（无论成功或失败）追加到对应文档
3. 更新版本：在 `changelog.md` 中记录本次变更
4. 检查模板：如果现有模板不再适用，更新模板内容

### 2.9 维护者沟通模板库

基于实战提炼的沟通模板，覆盖 PR 提交后的各种场景：

**跟进审核（等待一周后）**：
```
Hi @maintainer-username,

I wanted to follow up on this PR (#PR-number) which has been open for [X days/weeks]. 
I understand you're busy, but I'd appreciate it if you could take a look when you have a moment.

I've addressed all the items in the checklist and the CI checks are passing. 
Please let me know if there's anything else I need to do.

Thank you for your time!
```

**回应 review 意见（同意并修改）**：
```
Great catch! I've updated the code to [describe what you changed]. 

The key changes:
- [Change 1]
- [Change 2]

Please let me know if this looks good or if you'd like any further adjustments.
```

**礼貌地不同意**：
```
Thank you for the suggestion. I appreciate you taking the time to review this.

After considering it, I'd like to respectfully disagree with this particular point. 
Here's my reasoning:

1. [Reason 1 with evidence/data if possible]
2. [Reason 2]
3. [Reason 3]

I'm open to further discussion if you see it differently. What are your thoughts?
```

**完成修改后的提醒**：
```
Hi @reviewer-username,

I've addressed all the review comments from the last round:

- [x] Fixed [issue 1 description]
- [x] Updated [issue 2 description]
- [x] Added tests for [feature/fix description]

Could you please take another look when you have a chance? 
Let me know if there are any remaining issues.

Thanks!
```

### 2.10 环境准备与清理

在 skill 执行的每个关键阶段前，必须确保执行环境健康，避免僵尸进程干扰。

**自动清理触发点**：
1. 项目评估前 — 确保评估环境干净
2. 源码分析前 — 避免残留进程干扰分析
3. PR 提交前 — 确保 Git 操作环境干净
4. CI 应对阶段 — 每次修复 CI 问题后运行清理

**清理工具调用**（Windows PowerShell）：
```powershell
# 使用 JSON 输出模式，便于解析结果
$result = powershell -ExecutionPolicy Bypass -File "cleanup-zombie-processes.ps1" -JsonOutput -Silent | ConvertFrom-Json

# 检查退出码
#   0 = 清理成功，无残留
#   1 = 有残留进程未清理
#   2 = 执行失败
$exitCode = $LASTEXITCODE
```

**清理失败时的手动处理**：
```powershell
# 手动查看高CPU PowerShell进程
Get-Process powershell | Where-Object { $_.CPU -gt 100 } | Select-Object Id, CPU, WorkingSet64

# 手动终止指定进程
Stop-Process -Id <PID> -Force

# 手动查看无响应进程
Get-Process | Where-Object { $_.Responding -eq $false }
```

---

## 角色视图系统

两个引擎的能力通过 6 个角色视图暴露给不同用户：

### 1. Project Owner 视图

**职责**：创建项目、设定规范、配置 CI/CD、管理团队

| 能力 | 引擎来源 | 输出 |
|------|---------|------|
| Repository Setup Wizard | CI/CD Engine | 项目骨架（README/CONTRIBUTING/PR模板） |
| CI/CD Blueprint | CI/CD Engine | 最佳 CI/CD 配置（按语言/框架推荐） |
| Permission Matrix | CI/CD Engine | 权限策略 + 分支保护规则 |
| Community Health Dashboard | Contribution Engine | Issue 响应时间 / PR 合并率 / 活跃度 |

### 2. Maintainer 视图

**职责**：审核 PR、管理 Issue、维护代码质量

| 能力 | 引擎来源 | 输出 |
|------|---------|------|
| PR Triage System | 双引擎 | PR 自动分类 + 优先级标记 |
| Review Assistant | CI/CD Engine | 改动影响分析 + 风险点提示 |
| CI Debug Engine | CI/CD Engine | 失败日志分析 + 根因定位 + 修复建议 |
| Merge Strategy | Contribution Engine | 基于 PR 大小/测试/历史的合并决策 |
| Security Scanner | CI/CD Engine | 7 条安全规则自动扫描 |

### 3. Contributor 视图

**职责**：提交 PR、参与讨论、修复 Bug

| 能力 | 引擎来源 | 输出 |
|------|---------|------|
| Project Matcher | Contribution Engine | 4 维度加权评分 + 推荐列表 |
| Issue Finder | Contribution Engine | good first issue + help wanted 筛选 |
| PR Preparation Kit | Contribution Engine | 源码分析 + 改动验证 + 测试检查 |
| Submission Guide | Contribution Engine | 分步骤指导 + PR 模板 |
| Follow-up System | Contribution Engine | Day 3/7/14/21 自动提醒 |

### 4. First-time Contributor 视图

**职责**：首次参与开源，需要引导

| 能力 | 引擎来源 | 输出 |
|------|---------|------|
| Onboarding Tutorial | Contribution Engine | 交互式教程（fork → PR 全流程） |
| Confidence Builder | Contribution Engine | 从小改动开始（typo → docs → bug → feature） |
| Anxiety Reducer | Contribution Engine | 社区规范解释 + 失败模式预警 |
| Mentor Matching | Contribution Engine | 匹配经验丰富的贡献者 |

### 5. Reviewer 视图

**职责**：Code review、技术指导、质量保证

| 能力 | 引擎来源 | 输出 |
|------|---------|------|
| Review Checklist Generator | 双引擎 | 按改动类型生成检查清单 |
| Impact Analyzer | CI/CD Engine | 改动对下游依赖的影响分析 |
| Security Scanner | CI/CD Engine | 安全风险检测（7 条规则） |
| Feedback Template | Contribution Engine | 结构化 review 意见模板 |

### 6. Community Manager 视图

**职责**：社区运营、内容传播、品牌建设

| 能力 | 引擎来源 | 输出 |
|------|---------|------|
| Content Generator | Contribution Engine | Release Notes / Blog / Discussion / 社交线程 |
| Engagement Tracker | Contribution Engine | Star/Fork/Issue/PR 趋势监控 |
| Brand Guardian | Contribution Engine | 品牌一致性检查 |

---

## 双模式运行

### Skill Mode（人机协作）

适合学习、小规模项目、需要人工决策的场景。

| # | Skill | 输入 | 输出 |
|---|-------|------|------|
| 1 | Project Evaluation | 仓库 URL | 4 维度加权评分报告 |
| 2 | Repository Analysis | 仓库路径 | Project Profile（语言/框架/依赖/标签） |
| 3 | CI/CD Review | Workflow YAML | 安全审查报告（7 规则） |
| 4 | PR Preparation | Project Profile + Issue | PR 草稿 + 测试计划 |
| 5 | CI Debug | Actions log | Root Cause + Fix Suggestion |
| 6 | Experience Capture | PR 结果 | 经验更新 + 流程优化建议 |

### Autonomous Mode（自动执行）

适合规模化运营、重复性任务、CI/CD 自动化。

| Agent | 职责 | 权限要求 |
|-------|------|---------|
| Context Collector | 收集 GitHub 事件上下文 | Level 0 |
| Planner Agent | 评估风险，生成执行计划 | Level 1 |
| Workflow Engineer | 操作 Workflow AST，生成/修改 CI/CD | Level 2 |
| Validator Agent | 静态验证（YAML/权限/安全） | Level 1 |
| Repair Agent | 自动修复 CI 失败 | Level 2 |
| PR Agent | 创建 PR，根据策略自动合并 | Level 3 |

---

## 典型使用场景

### 场景 1：新手第一次贡献

**角色**：First-time Contributor → **模式**：Skill Mode

1. Project Matcher 匹配适合项目（评分 ≥ 4）
2. 选择 "good first issue"，在 Issue 中评论意图
3. 源码分析 3 策略定位改动点
4. 本地开发 + pre-commit 检查 + 测试
5. PR 模板生成 + 10 项强制检查
6. 提交后 Day 3/7/14/21 跟进
7. PR 合并 → 经验记录

### 场景 2：维护者日常运营

**角色**：Maintainer → **模式**：Autonomous Mode

1. Context Collector 监控新 PR/Issue
2. PR Triage 自动分类 + 风险标记
3. Security Scanner 扫描 7 条规则
4. CI Debug Engine 分析失败日志
5. Merge Strategy 决策自动合并
6. 生成 Release Notes + Discussion

### 场景 3：项目所有者配置 CI/CD

**角色**：Project Owner → **模式**：混合

1. Setup Wizard 生成项目骨架
2. CI/CD Blueprint 推荐配置
3. Workflow Engineer 生成 workflow YAML
4. Validator Agent 验证 + Security Scanner 审查
5. Permission Matrix 配置权限策略

---

## 关键优势

| 维度 | 旧模式 | ContribOS |
|------|--------|-----------|
| 架构 | 工具拼接 | 一个引擎，6 个视图 |
| CI/CD | 手动检查 | 7 条安全规则 + AST 解析 + 自动修复 |
| PR 提交 | 凭经验 | 4 维评估 + 3 策略分析 + 10 项检查 + 6 类失败模式 |
| 经验 | 每次从零开始 | 经验循环 + 41 个 PR 复盘 + 版本化管理 |
| 角色 | 各用各的工具 | 同一引擎，角色无缝切换 |
| 覆盖 | 只关注 PR | 项目创建 → 社区运营，完整闭环 |

---

## 注意事项

1. **角色切换**：同一人可在不同场景扮演不同角色
2. **权限控制**：根据角色分配权限，避免越权
3. **沟通优先**：自动化不等于无人化，关键决策需人工确认
4. **质量为本**：速度不能牺牲质量，所有改动必须通过质量门禁
5. **持续学习**：每次 PR 都是学习机会，记录经验，持续优化
6. **真实性**：改动必须基于真实源码分析，非假设性问题
7. **聚焦**：一个 PR 一个改动，不混合无关更改
