/**
 * 思考链控制（5 级）
 */

import type { ReasoningConfig, ReasoningLevel } from '../types';

const REASONING_CONFIGS: Record<ReasoningLevel, ReasoningConfig> = {
  none: {
    level: 'none',
    tag: '',
    content: '',
  },

  light: {
    level: 'light',
    tag: '<thinking>',
    content: `<｜begin▁of▁sentence｜>
Reasoning Effort: Absolute maximum with no shortcuts permitted.
You MUST be very thorough in your thinking and comprehensively decompose the problem to resolve the root cause, rigorously stress-testing your logic against all potential paths, edge cases, and adversarial scenarios.
Explicitly write out your entire deliberation process, documenting every intermediate step, considered alternative, and rejected hypothesis to ensure absolutely no assumption is left unchecked.`,
  },

  moderate: {
    level: 'moderate',
    tag: '<thinking>',
    content: `<｜begin▁of▁sentence｜>
Reasoning Effort: Absolute maximum with no shortcuts permitted.
You MUST be very thorough in your thinking and comprehensively decompose the problem to resolve the root cause, rigorously stress-testing your logic against all potential paths, edge cases, and adversarial scenarios.
Explicitly write out your entire deliberation process, documenting every intermediate step, considered alternative, and rejected hypothesis to ensure absolutely no assumption is left unchecked.

额外思考要求：
你的隐式内部思考应当拆解任务链。

<任务链>
1.分析创作
对当前创作要求进行分析，构建最符合要求的精彩故事大纲。这是你的主要任务。
2.故事性检查
将对大纲进行故事性检查：
- 是否满足了User对故事性和情节的要求？
- 人设、故事特殊设定、世界观设定是否正确？
- 人物动机、需求、立场是否合理？
- 故事上下文是否前后矛盾，有无逻辑BUG？
- 是否出现超游认知？人物是否得到了超过其视角的情报？
3.草稿
仅在此轮次，对潜在内容进行一次完整预创作。
4.风格性检查
按照核心指导和写作指导，对草稿的文字风格进行检查。
5.格式检查
最后对草稿进行一次格式确认：
- 检查非文学格式是否有错误或遗漏、是否构建至正确位置
6.最终输出
立即停止思考。
构建final answer。
</任务链>`,
  },

  heavy: {
    level: 'heavy',
    tag: '<thinking>',
    content: `<｜begin▁of▁sentence｜>
Reasoning Effort: Absolute maximum with no shortcuts permitted.
You MUST be very thorough in your thinking and comprehensively decompose the problem to resolve the root cause, rigorously stress-testing your logic against all potential paths, edge cases, and adversarial scenarios.
Explicitly write out your entire deliberation process, documenting every intermediate step, considered alternative, and rejected hypothesis to ensure absolutely no assumption is left unchecked.

额外思考要求：
你的隐式内部思考应当拆解任务链。

<任务链>
1.分析创作
对当前创作要求进行分析，构建最符合要求的精彩故事大纲。这是你的主要任务。
2.故事性检查
将对大纲进行故事性检查：
- 是否满足了User对故事性和情节的要求？
- 人设、故事特殊设定、世界观设定是否正确？
- 人物动机、需求、立场是否合理？
- 故事上下文是否前后矛盾，有无逻辑BUG？
- 是否出现超游认知？人物是否得到了超过其视角的情报？
3.草稿
仅在此轮次，对潜在内容进行一次完整预创作。
4.风格性检查
按照核心指导和写作指导，对草稿的文字风格进行检查。
5.格式检查
最后对草稿进行一次格式确认：
- 检查非文学格式是否有错误或遗漏、是否构建至正确位置
6.最终输出
立即停止思考。
构建final answer。
</任务链>`,
  },

  'pseudo-dialogue': {
    level: 'pseudo-dialogue',
    tag: 'thinking',
    content: `User：
<任务介绍>
这是一个复杂的创意写作任务，包含诸多设定、写作指导和格式要求。通常，你需要据最新互动无缝续写剧情，衔接前文；或据元指令创作需要的内容。你不是故事中的任何角色，而是与User合作的创作者。
</任务介绍>
<思考要求>
你在reasoning_content中，务必遵守以下要求：
- 专注于内容和故事；多构思，少纠结
- 对互相矛盾、模糊不清的元指令或设定，快速略过，简要决策
</思考要求>
下面是一些创作指导，相关资料和互动历史，请仔细阅读：`,
  },
};

export function getReasoningConfig(level: ReasoningLevel): ReasoningConfig {
  return REASONING_CONFIGS[level];
}
