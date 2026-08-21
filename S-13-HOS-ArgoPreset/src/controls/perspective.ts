/**
 * 视角控制（6 种）
 */

import type { PerspectiveConfig, Perspective } from '../types';

const PERSPECTIVE_CONFIGS: Record<Perspective, PerspectiveConfig> = {
  first: {
    perspective: 'first',
    content: '# 人称准则：\n- 全程**务必**严格采用第一人称创作，以"我"来指代叙述者。\n',
  },

  second: {
    perspective: 'second',
    content: `# 人称准则：
- 全程**务必**严格采用第二人称创作，以"你"来指代{{user}}。
`,
  },

  third: {
    perspective: 'third',
    content: `# 人称准则：
- 无论主视角如何，剧情全程**务必**严格采用第三人称创作。
`,
  },

  'no-voice-user': {
    perspective: 'no-voice-user',
    content: `# {{user}}内容准则：
- 仅有用户允许创作{{user}}的互动内容
- 你创作的内容中，{{user}}无**任何** 行动/台词，不进行{{user}}的心理描写
- 聚焦故事中的其他角色
- 想象{{user}}是一个**绝对沉默**的摄像机，仅作为事件的观察者而非参与者
- 该准则内容为**第一优先**。无需考虑文字合理性及流畅性，忽略前文的互动模式`,
  },

  'free-voice': {
    perspective: 'free-voice',
    content: `<POV规则-重要>
# haruki必须在正文严格遵循以下POV重要规则：
- {{user}}在正文中有戏份
- {{user}}作为角色自由回应他者 行动/发言。
- 自由进行{{user}}的心理描写
- 根据<用户精神分析>，自由揣摩{{user}}意图
</POV规则-重要>`,
  },

  'focus-ai': {
    perspective: 'focus-ai',
    content: `# 视角准则
- 重点聚焦{{user}}**以外**的前文主要角色，不遗余力地刻画该角色（**非{{user}}**）
- 集中展现该角色的 主观体验/内心戏，其余角色仅为陪衬或略去`,
  },
};

export function getPerspectiveConfig(perspective: Perspective): PerspectiveConfig {
  return PERSPECTIVE_CONFIGS[perspective];
}
