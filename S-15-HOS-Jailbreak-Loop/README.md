# S-14-HOS-Jailbreak-Loop

> Jailbreak 循环优化系统 — 多维度攻防技术库 + 自动化迭代评估引擎 + 便捷开关控制

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL%203.0-blue.svg)](LICENSE)

## 🎯 什么是 Jailbreak-Loop？

这是一个用于 **AI 安全研究** 的工具系统，帮助研究者：

1. **系统化测试** — 从 30+ 种攻击技术中选择，覆盖角色扮演、提示注入、编码绕过、模板变体、预填充穿甲等维度
2. **自动化防御** — 25+ 种防御策略可组合，从输入过滤到金丝雀陷阱
3. **循环优化** — 攻击→防御→评估→优化的自动化闭环
4. **便捷控制** — 14 个独立开关 + 6 个预设组合，一键切换攻防模式

## 🚀 快速开始

```bash
cd S-14-HOS-Jailbreak-Loop
npm install
npm run build
```

```typescript
import {
  JailbreakLoopEngine,
  ToggleRegistry,
  ALL_ATTACKS,
  ALL_DEFENSES,
  composeFullPrompt,
  generateReport,
} from './src/index'

// 创建开关注册表
const registry = new ToggleRegistry()

// 应用预设：攻防均衡
registry.applyPreset('preset-balanced')

// 获取启用的攻击和防御
const attacks = ALL_ATTACKS.filter(a =>
  registry.getLinkedAttackIds().includes(a.id)
)
const defenses = ALL_DEFENSES.filter(d =>
  registry.getLinkedDefenseIds().includes(d.id)
)

// 组合 SillyTavern prompt
const prompt = composeFullPrompt(attacks[0], defenses, {
  enableArgo: true,
  wordCount: 1500,
  style: 'gulong',
})

// 运行循环优化
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

## 📦 模块说明

### 攻击库 (attacks/)

| 模块 | 技术数 | 说明 |
|------|--------|------|
| roleplay | 8+ | DAN、开发者模式、人格面具、虚构框架 |
| prompt-inject | 6+ | 系统提示覆盖、变量劫持、指令优先级 |
| encoding | 7+ | Base64、谐音、拆字、外语、Unicode |
| template | 8+ | 经典越狱模板迭代变体 |
| prefill | 5+ | assistant prefill 劫持、思维链操控 |

### 防御库 (defenses/)

| 模块 | 策略数 | 说明 |
|------|--------|------|
| input-filter | 5+ | 关键词、正则、意图分类器 |
| identity-lock | 5+ | 角色锚定、指令优先级链 |
| context-guard | 5+ | 多轮检测、异常模式 |
| layered-wall | 4+ | 分层防御组合（轻/标准/重/堡垒） |
| canary | 4+ | 金丝雀标记、蜜罐诱导 |

### 评估框架 (evaluator/)

- 响应分析：判断绕过/拦截/部分合规
- 对齐信号检测：识别安全对齐关键词
- 统计计算：各类别绕过率、拦截率
- 策略排名：找出最强攻击和防御

### 循环引擎 (loop/)

- 自动化攻防测试循环
- 每轮结束后生成优化建议
- 追踪历史最佳策略
- 支持暂停/恢复/重置

### 开关注册表 (toggles/)

- 14 个独立开关，支持快捷键
- 6 个预设组合，一键切换
- 状态导入/导出
- 变更监听器

## 🔗 与 S-13 ArgoPreset 集成

```typescript
import { composeFullPrompt } from './S-14-HOS-Jailbreak-Loop/src/index'
import { HARUKI_PRESET } from './S-13-HOS-ArgoPreset/src/index'

// 将 jailbreak 攻防注入 ARGO 预设
const enhancedPreset = {
  ...HARUKI_PRESET,
  jailbreak: composeAttackPrompt(selectedAttack, vars),
  defense: composeDefensePrompt(selectedDefenses),
}
```

## 📋 预设模式速查

| 预设 | 攻击 | 防御 | 适用场景 |
|------|------|------|----------|
| ⭕ 全部关闭 | ❌ | ❌ | 纯创作模式 |
| ⚔️ 纯攻击 | ✅ | ❌ | 测试模型裸抗能力 |
| 🛡️ 纯防御 | ❌ | ✅ | 测试防御基线 |
| ⚖️ 攻防均衡 | 🔶 | 🔶 | 日常攻防研究 |
| 🔥 全力攻防 | ✅✅ | ✅✅ | 极限压力测试 |
| 👻 隐蔽渗透 | 🔸 | ❌ | 测试隐蔽绕过 |

## 📄 License

AGPL-3.0 — 详见 [LICENSE](../LICENSE)

## 🙏 致谢

- 基于「夏瑾 天琴座 Beta 2.8」与「ARGO 1.3」预设系统
- 攻击技术参考自 AI 安全红队研究文献
- 防御策略参考自 OWASP LLM Top 10
