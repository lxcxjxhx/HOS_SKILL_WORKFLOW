/**
 * 13 种写作风格定义
 * 从「夏瑾 天琴座 Beta 2.8」提取
 */

import type { WritingStyle, WritingStyleSlug } from '../types';

export const WRITING_STYLES: Record<WritingStyleSlug, WritingStyle> = {
  gulong: {
    slug: 'gulong',
    name: '古龙',
    reference: '《欢乐英雄》',
    content: '<核心风格>\n- ***忘掉前文的文风，现在的文字风格必须深度复刻古龙的《欢乐英雄》***\n</核心风格>',
  },

  wuxia: {
    slug: 'wuxia',
    name: '武侠',
    reference: '《天龙八部》',
    content: '<核心风格>\n- ***忘掉前文的文风，现在的文字风格必须深度复刻《天龙八部》***\n</核心风格>',
  },

  lightnovel: {
    slug: 'lightnovel',
    name: '轻小说',
    reference: '日本轻小说',
    content: `<附加风格_轻小说>
- 像日本轻小说家一样创作。
- 大量创作主角的内心戏。这些内心戏以诙谐幽默、轻松愉快的角度反馈他者言行或吐槽事件。内心戏无需特殊说明是主角内心所想，自然融入故事，无需括号或其他特殊符号包裹。
- 对白口语化，多感叹词和语气词，节奏明快
- 在日常中保持清淡、俏皮的非日常感
- 严肃性总是被消解，不得使故事过于 压抑/黑暗/沉重
</附加风格_轻小说>`,
  },

  'lightnovel-humorous': {
    slug: 'lightnovel-humorous',
    name: '轻小说（幽默）',
    reference: '《为美好的世界献上祝福！》',
    content: `<核心风格>
-- ***忘掉前文的文风，现在的文字风格必须深度复刻《为美好的世界献上祝福！》***
- 保持幽默感
- 大量内心独白，内心独白以自由间接引语自然融入叙事，直接给出，禁止说明其为"他心想："或"他心中吐槽："；内心独白不应以任何特殊符号作为前缀或包裹
</核心风格>`,
  },

  'lightnovel-moe': {
    slug: 'lightnovel-moe',
    name: '轻小说（清淡）',
    reference: '《魔法使之夜》',
    content: `<核心文字风格>
-- ***忘掉前文的文风，现在的文字风格必须深度复刻《魔法使之夜》***
- 保持俏皮、清淡和些许幽默感
- 大量内心独白，内心独白以自由间接引语自然融入叙事，直接给出，禁止说明其为"他心想："或"他心中吐槽："；内心独白不应以任何特殊符号作为前缀或包裹
</核心文字风格>`,
  },

  fantasy: {
    slug: 'fantasy',
    name: '江南',
    reference: '《上海堡垒》/《九州缥缈录》',
    content: '<核心风格>\n- ***忘掉前文的文风，现在的文字风格必须深度复刻《上海堡垒》/《九州缥缈录》***\n</核心风格>',
  },

  nsfw: {
    slug: 'nsfw',
    name: 'NSFW',
    reference: '《少妇白洁》',
    content: '<核心风格>\n- ***忘掉前文的文风，现在的文字风格必须深度复刻《少妇白洁》***\n</核心风格>',
  },

  immersive: {
    slug: 'immersive',
    name: '沉浸式',
    reference: '隐形叙述者',
    content: `<核心风格>
- 完全像主角心中的隐形叙述者一样创作
- 专注角色的主观体验和内心感受，进行身临其境的沉浸式描写
</核心风格>`,
  },

  freewriting: {
    slug: 'freewriting',
    name: '零度写作',
    reference: '客观叙述',
    content: `<核心风格>
- 严格按照零度写作的风格创作
- 像摄像头一样忠实记录，笔调绝对客观中立
</核心风格>`,
  },

  male: {
    slug: 'male',
    name: '男频',
    reference: '番茄男频',
    content: '<核心文字风格>\n- ***忘掉前文的文风，现在的文字风格必须深度复刻番茄上的男频网络小说***\n</核心文字风格>',
  },

  female: {
    slug: 'female',
    name: '女频',
    reference: '番茄女频',
    content: '<核心文字风格>\n- ***忘掉前文的文风，现在的文字风格必须深度复刻番茄上的女频网络小说***\n</核心文字风格>',
  },

  western: {
    slug: 'western',
    name: '西式文学',
    reference: '西式译本风格',
    content: `<附加风格_西式文学>
- 以西式文学的风格创作正文。
- 文风整体如西式文学的中文译本，体现时代和背景质感，略带轻微的翻译腔和用语的异化疏离感；展现独特风味的同时保持阅读体验的流畅，绝不能晦涩难懂
- 细节描写如油画般精细，对话略带戏剧化仪式感，但不得过分夸张
- 叠加五感来细腻的渲染场景
</附加风格_西式文学>`,
  },

  custom: {
    slug: 'custom',
    name: '自定义',
    reference: '用户指定',
    content: '<核心风格>\n- ***忘掉前文的文风，现在的文字风格必须深度复刻《西游记》***\n</核心风格>\n{{//请在上述提示词随意填写你自己喜欢的作者或作品名字。}}',
  },
};

/** 获取风格内容；custom 时使用 overrideContent */
export function getStyleContent(slug: WritingStyleSlug, overrideContent?: string): string {
  if (slug === 'custom' && overrideContent) {
    return `<核心风格>\n- ***忘掉前文的文风，现在的文字风格必须深度复刻${overrideContent}***\n</核心风格>`;
  }
  return WRITING_STYLES[slug].content;
}
