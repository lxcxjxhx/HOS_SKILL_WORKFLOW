# S-14-HOS-Jailbreak-Loop

## 概述

Jailbreak 循环优化系统，提供多维度攻防技术库 + 自动化迭代评估引擎 + 便捷开关控制。

## 核心能力

### 1. 攻击技术库（5 大类 30+ 技术）

| 类别 | 代号 | 说明 |
|------|------|------|
| 🎭 角色扮演 | roleplay | DAN、开发者模式、人格面具、虚构框架 |
| 💉 提示注入 | prompt-inject | 系统提示覆盖、变量劫持、指令优先级 |
| 🔐 编码绕过 | encoding | Base64、谐音、拆字、外语、Unicode |
| 📝 模板变体 | template | 经典越狱模板迭代变体 |
| ⚡ 预填充穿甲 | prefill | assistant prefill 劫持、思维链操控 |

### 2. 防御策略库（8 大类 25+ 策略）

| 类型 | 代号 | 说明 |
|------|------|------|
| 🛡️ 输入过滤 | input-filter | 关键词、正则、意图分类器 |
| 🔒 身份锁定 | identity-lock | 角色锚定、指令优先级链 |
| 👁️ 上下文守卫 | context-guard | 多轮检测、异常模式 |
| 🏰 分层防御 | layered-wall | 多层叠加防御组合 |
| 🐦 金丝雀陷阱 | canary | 标记植入、蜜罐诱导 |
| 📊 熵检查 | entropy-check | 异常 token 分布检测 |
| 🎯 输出过滤 | output-filter | 内容审核、截断 |
| 🕵️ 蜜罐诱导 | honeypot | 引诱攻击者暴露模式 |

### 3. 循环优化引擎

```
攻击 → 防御 → 评估 → 优化 → 攻击 → ...
  ↑                                  |
  └──────────────────────────────────┘
```

- **攻击阶段**：从攻击库选取技术，生成攻击 prompt
- **防御阶段**：组合防御策略，构建防御墙
- **评估阶段**：分析模型响应，判断绕过/拦截
- **优化阶段**：根据结果调整策略权重，生成建议

### 4. 便捷开关系统

14 个独立开关，支持快捷键操作：

| 快捷键 | 开关 | 说明 |
|--------|------|------|
| Alt+1 | 🎭 角色扮演攻击 | 开/关角色扮演类攻击 |
| Alt+2 | 💉 提示注入攻击 | 开/关提示注入类攻击 |
| Alt+3 | 🔐 编码绕过攻击 | 开/关编码绕过类攻击 |
| Alt+4 | 📝 模板变体攻击 | 开/关模板变体攻击 |
| Alt+5 | ⚡ 预填充穿甲攻击 | 开/关预填充攻击 |
| Alt+Q | 🛡️ 输入过滤 | 开/关输入过滤防御 |
| Alt+W | 🔒 身份锁定 | 开/关身份锁定防御 |
| Alt+E | 👁️ 上上下文守卫 | 开/关上下文守卫 |
| Alt+R | 🏰 分层防御 | 开/关分层防御 |
| Alt+T | 🐦 金丝雀陷阱 | 开/关金丝雀陷阱 |
| Alt+L | 🔄 循环优化 | 开/关自动循环 |
| Alt+O | 🧠 自动优化 | 开/关自动优化 |
| Alt+S | 📊 评估日志 | 开/关日志记录 |
| Alt+F | 📋 自动报告 | 开/关自动报告 |

### 5. 预设组合

| 预设 | 说明 |
|------|------|
| ⭕ 全部关闭 | 关闭所有攻击和防御 |
| ⚔️ 纯攻击模式 | 仅启用攻击，测试模型裸抗 |
| 🛡️ 纯防御模式 | 仅启用防御，测试防御基线 |
| ⚖️ 攻防均衡 | 均衡启用攻击和防御 |
| 🔥 全力攻防 | 全力攻击 + 全力防御 |
| 👻 隐蔽渗透 | 低强度攻击 + 无防御 |

## 快速使用

```typescript
import {
  JailbreakLoopEngine,
  ToggleRegistry,
  ALL_ATTACKS,
  ALL_DEFENSES,
  composeFullPrompt,
} from './src/index'

// 1. 创建开关注册表
const registry = new ToggleRegistry()
registry.applyPreset('preset-balanced')

// 2. 获取当前启用的攻击和防御
const enabledAttacks = ALL_ATTACKS.filter(a =>
  registry.getEnabledIds('attack').includes(a.id)
)
const enabledDefenses = ALL_DEFENSES.filter(d =>
  registry.getEnabledIds('defense').includes(d.id)
)

// 3. 组合完整 prompt
const prompt = composeFullPrompt(
  enabledAttacks[0],
  enabledDefenses,
  { enableArgo: true, wordCount: 1500 }
)

// 4. 运行循环优化
const engine = new JailbreakLoopEngine({
  maxRounds: 10,
  attacksPerRound: 5,
  defensesPerRound: 3,
  targetBypassRate: 0.8,
  targetDefenseRate: 0.9,
  autoOptimize: true,
  optimizationDirection: 'balanced',
})
```

## 与 S-13 ArgoPreset 集成

本系统可以与 S-13-HOS-ArgoPreset 无缝集成：

```typescript
import { composeFullPrompt } from './src/index'
import { HARUKI_PRESET } from '../S-13-HOS-ArgoPreset/src/index'

// 将 jailbreak 攻防注入到 ARGO 预设中
const enhancedPreset = {
  ...HARUKI_PRESET,
  jailbreak: composeAttackPrompt(selectedAttack, vars),
  defense: composeDefensePrompt(selectedDefenses),
}
```

## 文件结构

```
S-14-HOS-Jailbreak-Loop/
├── src/
│   ├── types.ts                    # 核心类型定义
│   ├── attacks/                    # 攻击技术库
│   │   ├── roleplay.ts            # 角色扮演类攻击
│   │   ├── prompt-inject.ts       # 提示注入类攻击
│   │   ├── encoding.ts            # 编码绕过类攻击
│   │   ├── template.ts            # 模板变体类攻击
│   │   ├── prefill.ts             # 预填充穿甲类攻击
│   │   └── index.ts               # 统一导出
│   ├── defenses/                   # 防御策略库
│   │   ├── input-filter.ts        # 输入过滤防御
│   │   ├── identity-lock.ts       # 身份锁定防御
│   │   ├── context-guard.ts       # 上下文守卫防御
│   │   ├── layered-wall.ts        # 分层防御组合
│   │   ├── canary.ts              # 金丝雀/蜜罐防御
│   │   └── index.ts               # 统一导出
│   ├── evaluator/                  # 评估框架
│   │   ├── analyzer.ts            # 响应分析引擎
│   │   ├── stats.ts               # 统计计算
│   │   └── index.ts               # 统一导出
│   ├── loop/                       # 循环引擎
│   │   ├── engine.ts              # 核心循环引擎
│   │   └── index.ts               # 统一导出
│   ├── toggles/                    # 开关注册表
│   │   ├── registry.ts            # 开关注册与管理
│   │   └── index.ts               # 统一导出
│   ├── templates/                  # Prompt 模板
│   │   ├── compose.ts             # Prompt 组合器
│   │   └── index.ts               # 统一导出
│   └── index.ts                    # 主入口
├── config/                         # 配置文件
├── state/                          # 运行时状态
├── package.json
├── tsconfig.json
├── SKILL.md
├── README.md
└── CHANGELOG.md
```
