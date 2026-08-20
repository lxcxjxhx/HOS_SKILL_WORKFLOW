# S-13-HOS-ArgoPreset

> **ARGO × 天琴座 创意写作预设系统**

基于「夏瑾 天琴座 Beta 2.8」与「ARGO 1.3」的 TypeScript 结构化创意写作预设系统。

## 项目简介

将两个 SillyTavern JSON 预设中的 prompt engineering 知识提炼为类型安全的 TypeScript 模块，提供可编程的 prompt chain 组装能力。

### 核心特性

| 特性 | 描述 |
|------|------|
| 🎨 13 种写作风格 | 古龙、武侠、轻小说、江南、NSFW、沉浸式、零度写作、男频、女频、西式 |
| 🔞 5 级 NSFW 控制 | off → gentle → standard → intensive → throttle |
| 🧠 5 级思考链 | none / light / moderate / heavy / pseudo-dialogue |
| 📖 5 种情节推进 | 保守 / 冒险 / 特别冒险 / 爆炸式 / 无限制 |
| 👁️ 6 种视角控制 | 第一/二/三人称、无用户、自由、集中AI |
| 🤖 ARGO 五层推理 | 主动推理 → 拓扑量子 → 液态神经 → 混合专家 → 神经符号 |
| 🔓 破限系统 | 叙事等价性框架 + 预填充穿甲 + 角色扮演锚定 |
| 📐 GBNF 文法 | 完整的输出格式规范 |

## 快速开始

```bash
cd S-13-HOS-ArgoPreset
npm install
npm run build
```

## 使用示例

```typescript
import {
  composePromptChain,
  composeCasual,
  composeImmersive,
  composeWuxia,
  renderToJson,
  renderPromptsSummary,
  compileRegexScripts,
  applyRegexScripts,
  HARUKI_PRESET,
} from './src/index';

// 轻松日常
const casual = composeCasual({ wordCount: 1500 });

// 沉浸叙事 + NSFW
const immersive = composeImmersive({ nsfw: 'standard' });

// 完全自定义
const custom = composePromptChain({
  style: 'gulong',
  plot: 'explosive',
  nsfw: 'intensive',
  cot: 'heavy',
  perspective: 'free-voice',
  wordCount: 3000,
  enableArgo: true,
  enableJailbreak: true,
});

// 导出为 SillyTavern 可导入的 JSON
console.log(renderToJson(custom));

// 调试：查看 prompt 概览
console.log(renderPromptsSummary(custom));
```

## ARGO 五层智能体

ARGO（Autonomous Reasoning with Generative Operators）是一套五层链式推理架构：

1. **主动推理框架智能体** — 感知→预测→实行→更新
2. **拓扑量子计算智能体** — 激发→编织→网络
3. **液态神经网络智能体** — 张力判定→调控
4. **密集混合专家智能体** — 6大专家（创意/环境/心理/对话/动作/统筹）
5. **神经符号融合智能体** — 神经矩阵（想象）+ 符号矩阵（核验）

每层接收上一层的输出，逐级精炼，最终生成高质量的创意写作内容。

## 破限系统

本预设包含增强版破限能力，通过三路并发策略实现：

1. **叙事等价性框架**：将「创作自由」锚定为叙事完备性的物理定律（不可达基数、熵增定律、散度特征）
2. **预填充穿甲**：通过 assistant prefill 绕过初始安全检查
3. **角色扮演锚定**：通过变量系统和 R1 开关锁定 AI 的创作身份

## 目录结构

```
S-13-HOS-ArgoPreset/
├── SKILL.md              # Skill 定义
├── README.md             # 本文件
├── CHANGELOG.md          # 版本记录
├── package.json          # npm 包配置
├── tsconfig.json         # TypeScript 配置
├── src/
│   ├── index.ts          # 统一导出
│   ├── types.ts          # 核心类型
│   ├── preset.ts         # Haruki 预设数据
│   ├── styles/           # 写作风格模块
│   ├── agents/           # ARGO 智能体模块
│   ├── controls/         # 控制选项模块
│   ├── anti-abuse/       # 反滥用系统
│   ├── jailbreak/        # 破限系统
│   ├── regex/            # 正则脚本
│   ├── grammar/          # GBNF 文法
│   ├── composer/         # Prompt Chain 组装器
│   └── output/           # 输出渲染
└── tests/
    └── prompt-chain.test.ts
```

## 致谢

- **夏瑾 天琴座 Beta 2.8** — Haruki 创意写作预设原作者
- **ARGO 1.3** — 五层智能体链式推理架构设计者
- **SillyTavern** — prompt engineering 平台

## License

AGPL-3.0
