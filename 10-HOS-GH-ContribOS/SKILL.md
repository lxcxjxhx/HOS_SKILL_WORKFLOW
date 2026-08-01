---
name: HOS-GH-ContribOS
description: GitHub 贡献操作系统 — 统一框架覆盖项目全生命周期，内置 CI/CD 智能引擎、贡献智能引擎（含审核者视角自检门 G0–G8 与场景记忆）、6 种角色视图
version: 3.2.0
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

> **GitHub 贡献操作系统** — 不是工具集合，是统一框架。两个核心引擎（CI/CD Intelligence + Contribution Intelligence），六个角色视图，一套经验循环 + 场景记忆。覆盖从项目创建到 PR 合并的完整生命周期。

## 架构总览

```
┌─────────────────────────────────────────────────────────────────────┐
│                    HOS-GH-ContribOS v3.1                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              Unified Contribution Engine (UCE)                │  │
│  │                                                               │  │
│  │  ┌─────────────────────┐     ┌─────────────────────────┐    │  │
│  │  │  CI/CD Intelligence │     │  Contribution           │    │  │
│  │  │  Engine             │     │  Intelligence Engine    │    │  │
│  │  │                     │     │                         │    │  │
│  │  │  · Workflow AST     │     │  · 项目评估（8维+权重） │    │  │
│  │  │  · 安全审查（7规则）│◄───►│  · 源码分析（3策略）   │    │  │
│  │  │  · CI 调试知识库    │     │  · PR 规范（13项检查） │    │  │
│  │  │  · 自动修复引擎     │     │  · 失败模式（13类）     │    │  │
│  │  │  · 权限分级（5级）  │     │  · 跟进策略（Day3-21） │    │  │
│  │  └─────────────────────┘     │  · 经验循环（持续优化）│    │  │
│  │                               │  · 审核者自检门（9闸门） │    │  │
│  │                               │  · 场景记忆（Memory）   │    │  │
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

## 文件结构

```
10-HOS-GH-ContribOS/
├── SKILL.md                              # 本文件：主入口（架构/角色/模式/场景）
├── engines/
│   ├── ci-cd-intelligence.md             # 引擎一：CI/CD Intelligence
│   └── contribution-intelligence.md      # 引擎二：Contribution Intelligence
├── templates/
│   ├── reviewer-perspective-gate.md      # 审核者视角自检门工作底稿
│   ├── pr-description-template.md        # PR 描述模板 + AI Disclosure
│   └── maintainer-communication-templates.md  # 维护者沟通模板库
├── experience/
│   ├── continuous-improvement.md         # 经验循环 + 场景记忆协议
│   └── failure-modes.md                  # 失败模式库（7 类）+ Datus 案例
└── memory/
    ├── README.md                         # 记忆协议（实际记录存用户本地）
    └── index.md                          # 场景记忆索引
```

## 引擎一：CI/CD Intelligence Engine

Workflow AST 解析 → 7 条安全审查规则 → CI 调试知识库 → 自动修复引擎 → 权限分级（5 级）。**完整内容见 [engines/ci-cd-intelligence.md](engines/ci-cd-intelligence.md)。**

## 引擎二：Contribution Intelligence Engine

项目评估（8 维，含**合并速度**）→ 避坑指南 → 源码分析 3 策略 → PR 规范 → 13 项强制检查 → **审核者视角自检门（G0–G8，9 闸门）** → 跟进策略 → 环境清理。**完整内容见 [engines/contribution-intelligence.md](engines/contribution-intelligence.md)。**

> **审核者视角自检门（提交前强制）**：G0 问题真实性（修复类）/ G1 语义理解 / G2 动机真实性 / G3 归属与范围 / G4 惊讶测试 / G5 自反预审 / G6 重复与方向（大功能）/ G7 项目规则（微小改动）/ G8 批量节流（多 PR）。任一红灯 → 返回源码分析，禁止提交。工作底稿见 [templates/reviewer-perspective-gate.md](templates/reviewer-perspective-gate.md)。
>
> **批量节流（强制）**：1 天 ≤3 仓库；同一功能模板禁止复制到多仓库；同仓库同模式累计 ≥3 暂停。经验数据：第三方 PR 合并率仅约 9%，批量提交不会提高过审率。
>
> **AI 披露（强制）**：每次 PR 描述必须包含"skill 协助撰写 + 发出者人工逐条审核/测试/负责"声明，且与事实一致——诚实披露 + 展示理解 = 诚恳，避免被判定"纯 AI PR"进黑名单。

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
| Project Matcher | Contribution Engine | 8 维度加权评分（含合并速度）+ 推荐列表 |
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
| Reviewer's Perspective Gate | Contribution Engine | 提交前 9 闸门自检（G0–G8） |
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
| 1 | Project Evaluation | 仓库 URL | 8 维度加权评分报告 |
| 2 | Repository Analysis | 仓库路径 | Project Profile（语言/框架/依赖/标签） |
| 3 | CI/CD Review | Workflow YAML | 安全审查报告（7 规则） |
| 4 | PR Preparation | Project Profile + Issue | PR 草稿 + 测试计划 + 强制过 9 闸门 |
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
| PR Agent | 创建 PR（须先过审核者自检门，红灯禁止自动提交），根据策略自动合并 | Level 3 |

---

## 典型使用场景

### 场景 1：新手第一次贡献

**角色**：First-time Contributor → **模式**：Skill Mode

1. Project Matcher 匹配适合项目（评分 ≥ 4）
2. 选择 "good first issue"，在 Issue 中评论意图
3. 源码分析 3 策略定位改动点
4. 本地开发 + pre-commit 检查 + 测试
5. PR 模板生成 + 13 项强制检查 + 9 闸门自检（审核者视角 G0–G8）
6. 提交后 Day 3/7/14/21 跟进
7. PR 合并 → 场景记忆记录

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
| PR 提交 | 凭经验 | 8 维评估 + 3 策略分析 + 13 项检查 + 9 闸门自检 + 13 类失败模式 |
| 经验 | 每次从零开始 | 场景记忆 + 经验循环 + 41 个 PR 复盘 + 版本化管理 |
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
8. **闸门**：提交前必须通过审核者视角自检门（见 engines/contribution-intelligence.md §2.6）5/5，任何红灯即返回源码分析，禁止带病提交
9. **记忆**：提交前检索场景记忆，交互后回写；记忆库含逐字反馈，严禁提交到公开仓库
10. **披露**：每次 PR 必须如实披露"skill 协助撰写 + 发出者人工逐条审核/测试/负责"；披露须真实，禁止虚称人工审核
