# 引擎二：Contribution Intelligence Engine

> 本文件是 HOS-GH-ContribOS 引擎二的完整内容，由 `SKILL.md` 引用。覆盖项目评估、源码分析、PR 规范、强制检查、审核者自检门与跟进策略。

## 2.1 项目评估体系（7 维度 + 加权评分）

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

## 2.2 避坑指南（实战验证）

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

## 2.3 源码分析 3 策略

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

**⚠️ 提交前检索场景记忆（强制）**：进入源码分析时，用"项目名 + 技术术语 + 改动类型"检索记忆索引。命中相似案例 → 对照其"应由哪道门拦截"与"提炼规则"。触发词：`self-join`、`窗口函数`、`period-over-period`、`环比`、`指标计算`、`语义等价`、`构造转换`、`internal representation`、`LAG`。见 [experience/continuous-improvement.md](../experience/continuous-improvement.md) 的场景记忆协议。

## 2.4 PR 提交规范

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

**PR 描述模板**：见 [templates/pr-description-template.md](../templates/pr-description-template.md)。
> **AI Disclosure 强制**：每次 PR 描述末尾必须包含"skill 协助撰写 + 发出者人工逐条审核/测试/负责"声明，且与事实一致。诚实披露 + 展示理解 = 诚恳；隐瞒 + 机械改动 = 被判定"纯 AI PR"进黑名单。

## 2.5 提交前强制检查（13 项）

基于 41 个 PR 复盘 + 审核者视角提炼的强制检查清单：

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
| 11 | 能解释改动语义（非代码语言，见自检门 G1） | 极高 | Datus-agent #1236 |
| 12 | 改动动机来自真实使用/issue，非代码扫描 | 极高 | Datus-agent #1236 |
| 13 | 已披露 AI 使用 + 人工逐条审核声明 | 高 | 纯 AI PR 黑名单风险 |

## 2.6 审核者视角自检门（提交前强制闸门）⛔

> **在改动准备完成之后、PR 提交之前，必须逐门通过。任一红灯 → 强制返回源码分析，禁止提交。** 每门须产出书面内容（非是/否）。工作底稿：[templates/reviewer-perspective-gate.md](../templates/reviewer-perspective-gate.md)。

以严格维护者/审核者的视角，逐门自检：

| 门 | 核心问题 | 红灯信号 |
|----|---------|---------|
| **G1 语义理解** | 用非代码语言解释改动在算什么（输入→计算→输出→指标含义）；涉及构造（self-join/聚合/窗口函数）各自职责与差异；当前为何错（有反例）；边界情况 | 只能引用代码、无法独立复述 |
| **G2 动机真实性** | 动机来自真实使用/观察或 issue 链接，而非"最佳实践"套话 | grep/静态分析模式、无真实使用场景 |
| **G3 归属与范围** | 项目已承认的问题(issue/roadmap) or 个人假设？good-first-issue or 深域核心逻辑？ | 无归属 + 深域核心逻辑 |
| **G4 惊讶测试** | 陌生人读 diff 会"哦合理"还是"为什么要做这个"？ | 需解释才懂、自明性不足 |
| **G5 自反预审** | 预写 3 条最可能被 review 的反对意见并预先回应（写入 PR 描述） | 写不出或稻草人 |

**阻断执行**：① 位置阻断——未过闸门不得进入 PR 提交；② 产物阻断——每门须填书面底稿；③ 记忆阻断——提交前检索场景记忆；④ 红灯即停——任一红灯返回源码分析。

**抗合理化红旗表**（出现这些念头 = 想跳过闸门，立刻停止）：

| 合理化话术 | 想跳过 | 强制动作 |
|-----------|--------|---------|
| "改动很小，不用这么复杂" | G1/G4 | 越小越要过语义门 |
| "这是最佳实践/常见模式" | G2 | 必须给出真实使用场景 |
| "维护者会理解的" | G4/G5 | 做惊讶测试 + 写 3 条预审 |
| "先提交，被拒再改" | 全部 | 红灯即停，禁止提交 |
| "项目太复杂我理解不了" | G1 | 返回源码分析，别提交 |

**触发词**（命中任一 → 强制检索场景记忆并过 G1）：`self-join`、`窗口函数`、`period-over-period`、`环比`、`指标计算`、`语义等价`、`构造转换`、`internal representation`、`LAG`。

## 2.7 跟进策略（Day 3/7/14/21）

| 时间节点 | 行动 | 模板 |
|---------|------|------|
| Day 1-3 | 等待 | 正常等待，不要催促 |
| Day 3 | 检查 CI | 确认 CI 是否通过，失败则立即修复 |
| Day 7 | 礼貌提醒 | "Hi @maintainer, just a friendly reminder that this PR is ready for review." |
| Day 14 | 二次跟进 | "I'm following up on this PR. If it's not aligned with the project's direction, please let me know." |
| Day 21 | 评估关闭 | 如仍无响应，考虑主动关闭，转向其他项目 |

## 2.8 环境准备与清理

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

## 关联文件

| 内容 | 文件 |
|------|------|
| 失败模式库（7 类）与 Datus 案例 | [experience/failure-modes.md](../experience/failure-modes.md) |
| 经验循环 + 场景记忆协议 + 版本化管理 | [experience/continuous-improvement.md](../experience/continuous-improvement.md) |
| 维护者沟通模板库 | [templates/maintainer-communication-templates.md](../templates/maintainer-communication-templates.md) |
| PR 描述模板 + AI Disclosure | [templates/pr-description-template.md](../templates/pr-description-template.md) |
| 审核者视角自检门工作底稿 | [templates/reviewer-perspective-gate.md](../templates/reviewer-perspective-gate.md) |
| 场景记忆索引 | [memory/index.md](../memory/index.md) |
