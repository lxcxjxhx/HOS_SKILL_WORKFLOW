# 🧠 HOS-Vibe-Guard

> **防 Vibe Coding 退化护栏** · 选题质量检测 + 架构升级引擎 + 安全护栏
>
> 兼容: **Claude Code** · **Cursor** · **Windsurf** · **GitHub Copilot** · 通用 AI IDE

---

## 📋 是什么

HOS-Vibe-Guard 是一个**跨 AI IDE 的系统级 Skill**，用于：

| 功能 | 描述 |
|------|------|
| 🚫 **防模板陷阱** | 检测 Todo/番茄钟/贪吃蛇/CRUD 等低价值选题 |
| 🧩 **选题升级** | 将玩具项目映射为高工程价值方向 |
| 🔐 **安全护栏** | 检测 API Key 硬编码、Token 泄露、PII 泄露 |
| 📊 **质量评分** | 6 维度评估项目工程价值 (0-60 分) |

### 核心理念

> ❌ **不阻止**你写代码
> ❌ **不阻止**你做 demo
> ✅ **只阻止**「低维重复工程幻觉」

---

## 🚀 快速开始

### 1. 克隆到本地

```bash
git clone <repo-url> HOS-Vibe-Guard
# 或直接放在你的工程目录
```

### 2. 选择你的 IDE

| IDE | 配置方法 | 文件 |
|-----|---------|------|
| **Claude Code** | `CLAUDE.md` 自动加载 | `CLAUDE.md` + `SKILL.md` |
| **Cursor** | `.cursorrules` 自动加载 | `.cursorrules` |
| **Windsurf** | `.windsurfrules` 自动加载 | `.windsurfrules` |
| **GitHub Copilot** | `.github/copilot-instructions.md` | `adapters/generic.md` |
| **其他 IDE** | 手动配置 | `adapters/generic.md` |

### 3. 激活

只需在 IDE 中发起开发请求：

```
我想做一个番茄钟 + TODO 管理系统
```

Vibe-Guard 会自动检测并回复。

---

## 📁 项目结构

```
HOS-Vibe-Guard/
├── SKILL.md                    # 🔵 核心系统提示词（所有 IDE 通用）
├── CLAUDE.md                   # Claude Code 适配入口
├── .cursorrules                # Cursor IDE 适配入口
├── .windsurfrules              # Windsurf IDE 适配入口
├── README.md                   # 本文件
│
├── rules/
│   ├── template-patterns.json  # 🎯 模板模式检测规则库
│   ├── topic-upgrade-map.json  # 🧩 选题升级映射数据库
│   └── security-patterns.json  # 🔐 安全风险模式库
│
├── scoring/
│   ├── vibe-score.md           # 📊 评分执行指南（AI 推理执行）
│   └── vibe-score.json         # 评分数据模型（外部系统集成）
│
├── engine/
│   ├── detector.ts             # 🔍 模板检测 — AI 可执行规范
│   ├── upgrader.ts             # 🧩 选题升级 — AI 可执行规范
│   └── guardian.ts             # 🔐 安全护栏 — AI 可执行规范
│
└── adapters/
    ├── claude-code.md          # Claude Code 详细集成指南
    ├── cursor.md               # Cursor 详细集成指南
    ├── windsurf.md             # Windsurf 详细集成指南
    └── generic.md              # 通用 AI IDE 集成指南
```

---

## 🎯 核心能力

### 🚫 模板检测

自动识别 20+ 种高频模板模式：

```
🔴 HIGH:    Todo / 番茄钟 / 贪吃蛇 / 2048 / CRUD / 博客 / CMS
🟡 MEDIUM:  商城 / 天气 / 认证 / 聊天 / 记账 / 短链接
🟢 LOW:     计数器 / 计算器 / 表单
```

识别时会考虑**排除关键词**（如 cognitive、DDD、event sourcing 等高级特征词），
不会误伤有领域深度的项目。

### 🧩 选题升级

| 原始 | 升级方向 |
|------|---------|
| Todo App | 认知负载管理系统 / 决策追溯系统 |
| 番茄钟 | 行为状态建模系统 / 认知节律优化器 |
| 贪吃蛇 | 多智能体资源竞争模拟 / 搜索算法可视化 |
| CRUD 系统 | 权限驱动数据流引擎 / 事件溯源 + CQRS |
| 博客系统 | 知识演化追踪系统 / 语义知识图谱 |
| 聊天应用 | 去中心化 P2P 通信协议 |

### 🔐 安全检测

自动扫描代码中的安全反模式：

| 模式 | 严重度 | 建议 |
|------|--------|------|
| API Key 硬编码 | ❌ HARD | 环境变量 / Secret Manager |
| Token 明文 | ❌ HARD | httpOnly Cookie |
| .env 在 git 中 | ❌ HARD | gitignore + filter-repo |
| localStorage 存 Token | ⚠️ SOFT | httpOnly Cookie / BFF |
| 测试用真实 PII | ⚠️ SOFT | Faker 生成 |
| SQL 拼接 | ❌ HARD | 参数化查询 |

### 📊 质量评分

6 维度评分矩阵 (0-60 分)：

```
🟢 ≥ 42: 高价值工程 — 鼓励
🟡 28-41: 原型项目 — 提供升级方向
🟠 14-27: 学习项目 — 建议增加领域深度
🔴 < 14:  模板陷阱 — 触发完整升级建议
```

---

## ⚙️ 配置

```bash
# 环境变量
HOS_VIBE_GUARD_ENABLED=true        # 总开关
HOS_VIBE_GUARD_SILENT=false        # 静默模式
HOS_VIBE_GUARD_STRICTNESS=normal   # relaxed | normal | strict
HOS_VIBE_GUARD_SECURITY_LEVEL=normal # basic | normal | paranoid
```

## 🔗 HOS 生态

```
HOS-Vibe-Guard  ←→  HOS-SILLY-MOCK（防假数据/防 Mock）
                 ←→  HOS-Sec-Engine（安全策略执行）
                 →   输出标记可被 HOS-Orchestrator 消费
```

| 系统 | 职责 |
|------|------|
| **HOS-Vibe-Guard** | 防低质量选题 / 防模板项目 / 防工程退化 |
| **HOS-SILLY-MOCK** | 防伪实现 / 防 Mock / 防假数据 |
| **HOS-Sec-Engine** | 安全策略执行与合规检查 |

---

## 📜 许可

MIT — 自由使用、修改、分发。

> *「不是所有代码都值得写，但所有代码都可以启发更好的代码」*
