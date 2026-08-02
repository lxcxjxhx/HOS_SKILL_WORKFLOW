# 场景记忆协议（Scenario Memory Protocol）

> **隐私警告**：场景记忆含维护者逐字反馈，属用户本地私有数据。本目录只存放**协议说明与索引模板**，实际的案例记录必须存放在用户本地路径（默认 `~/.claude/memory`），**严禁把含逐字反馈的记录提交到本公开仓库**。

## 为什么需要记忆

旧模式是"事后记录型"：只在被明确反馈/批评后才把教训写进文档，导致同类错误反复出现。本协议让 skill **从每个真实场景自动学习**——提交前自动检索相似案例，交互后自动回写——无需每次等用户转述维护者反馈。

## 存储结构（用户本地）

```
~/.claude/memory/
├── index.md                   # 案例索引表（提交前检索入口）
└── scenario-records/
    └── <日期>-<项目>-<主题>.md  # 单案例记录
```

## 案例记录格式

每条记录包含字段：日期 / 项目 / PR链接 / 状态 / 技术领域 / **发生了什么** / **维护者原话（verbatim，逐字，勿转述）** / **根因分析** / **应由哪道闸门拦截（G0–G8）** / **提炼规则（编号可复用）** / **检索关键词**。

## 协议流程

### 提交前（consult-before）

- 触发时机：① 进入源码分析阶段；② 进入审核者视角自检门。
- 触发词（命中任一强制检索）：
  - 语义类：`self-join`、`窗口函数`、`period-over-period`、`环比`、`指标计算`、`语义等价`、`构造转换`、`internal representation`、`LAG`。
  - 修复类：`resource leak`、`buffer overflow`、`stack overflow`、`VLA`、`类型断言`、`空指针`、`false positive`、`已解决`。
  - 功能类：`MCP`、`AI Agent`、`新功能`、`大功能`、`批量提交`、`同一功能多仓库`。
  - 重复类：`duplicate`、`已有PR`、`typo`、`微小改动`、`文档小修`。
- 动作：用项目名 + 技术术语 + 改动类型检索 `index.md`；命中 → 读取记录，将其"提炼规则"纳入本次提交依据。

### 提交后（write-after）

- 每次真实 PR 交互（成功、被拒、被批评、被要求修改）都要新增一条记录。
- 维护者反馈必须**逐字**记录（verbatim），这是最珍贵的信号。
- 根因要落到"应由哪道闸门拦截"，让自检门持续进化。
- 提炼出的规则回流到 `experience/failure-modes.md` 与 `experience/continuous-improvement.md`。

## 种子案例

Datus-agent #1236（构造混用）—— 中性化版本见 [experience/failure-modes.md](../experience/failure-modes.md)；完整逐字反馈记录在本 skill 的私有来源 `submit-oss-pr` 中。
