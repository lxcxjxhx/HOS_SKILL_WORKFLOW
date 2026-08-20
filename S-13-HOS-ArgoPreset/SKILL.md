# S-13-HOS-ArgoPreset

> **ARGO × 天琴座 创意写作预设系统** — 基于「夏瑾 天琴座 Beta 2.8」与「ARGO 1.3」的 TypeScript 结构化创意写作预设组装器

## 触发关键词

`HOS` `天琴座` `ARGO` `夏瑾` `haruki` `创意写作` `预设` `prompt组合` `SillyTavern` `写作风格`

## 能力概述

将两个 SillyTavern JSON 预设（Haruki 天琴座 + ARGO 五层智能体）提炼为 TypeScript 结构化模块，提供：

- **13 种写作风格**：古龙、武侠、轻小说(3变体)、江南、NSFW、沉浸式、零度写作、男频、女频、西式、自定义
- **5 级 NSFW 控制**：off → gentle → standard → intensive → throttle
- **5 级思考链**：none / light / moderate / heavy / pseudo-dialogue
- **5 种情节推进**：保守 / 冒险 / 特别冒险 / 爆炸式 / 无限制
- **6 种视角控制**：第一人称 / 第二人称 / 第三人称 / 无用户 / 自由 / 集中AI
- **ARGO 五层链式推理**：主动推理 → 拓扑量子 → 液态神经 → 混合专家 → 神经符号
- **破限系统**：叙事等价性框架 + 预填充穿甲 + 角色扮演锚定
- **正则脚本**：八股抹除、格式清洗、ARGO UI 美化
- **GBNF 文法**：完整的输出格式规范

## 使用方式

```typescript
import { composeCasual, composeImmersive, composeWuxia, composePromptChain, HARUKI_PRESET } from './src/index';

// 快捷组合
const casual = composeCasual({ wordCount: 1500 });
const immersive = composeImmersive({ nsfw: 'standard' });
const wuxia = composeWuxia();

// 完全自定义
const chain = composePromptChain({
  style: 'gulong',
  plot: 'explosive',
  nsfw: 'intensive',
  cot: 'heavy',
  perspective: 'free-voice',
  wordCount: 3000,
  enableArgo: true,
  enableJailbreak: true,
});

// 导出为 SillyTavern JSON
import { renderToJson } from './src/output/render';
const json = renderToJson(chain);
```

## 构建

```bash
cd S-13-HOS-ArgoPreset
npm install
npm run build
```

## 源码结构

```
src/
├── index.ts              # 统一导出
├── types.ts              # 核心类型
├── preset.ts             # Haruki 预设数据
├── styles/               # 13 种写作风格
├── agents/               # ARGO 五层智能体
├── controls/             # NSFW/情节/思考链/视角/世界观
├── anti-abuse/           # 禁词表/反八股/情感守护
├── jailbreak/            # 破限系统（三路并发）
├── regex/                # 正则脚本（格式清洗/美化/反八股）
├── grammar/              # GBNF 文法
├── composer/             # Prompt Chain 组装器
└── output/               # 输出渲染
```
