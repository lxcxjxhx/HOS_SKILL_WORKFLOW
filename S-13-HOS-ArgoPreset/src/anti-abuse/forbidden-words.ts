/**
 * 禁词表与反滥用策略
 */

/** 主禁词表 — 不应在叙事中使用的词汇 */
export const MAIN_FORBIDDEN_WORDS: string[] = [
  '喉结',
  '纽扣',
  '弧度',
  '锁骨',
  '肩胛骨',
];

/** 用户厌恶的元素 */
export const HATED_ELEMENTS: string[] = [
  '喉结',
  '锁骨',
  '一丝/一闪/一种或类似的数次-量词结构短语',
  '石子落入湖面 或类似结构的比喻',
];

/** 反滥用策略：需要替换的高频喻体 */
export const ABUSE_METAPHORS: string[] = [
  '石子',
  '湖面',
  '涟漪',
  '弓弦',
];

/** 反滥用策略：需要替换的体貌描写 */
export const ABUSE_BODY_PARTS: string[] = [
  '指关节',
  '指尖',
  '睫毛',
  '喉结',
];

/** 生成禁词表 prompt */
export function renderForbiddenWords(words?: string[]): string {
  const list = words ?? MAIN_FORBIDDEN_WORDS;
  return `<禁词表>
无论如何，不应在叙事中使用以下词汇：
${list.map(w => `- ${w}`).join('\n')}
</禁词表>`;
}

/** 生成反滥用策略 prompt */
export function renderAntiAbuseStrategy(): string {
  return `<抗滥用策略>
# haruki，以下内容或元素极易被你在创作中滥用，请务用其他方式表达：
- 以石子、湖面、拉满的弓作为喻体的比喻：替换为其他的比喻形式。
- 指节发白：以角色的其他生理状态表现类似的情绪
- 睫毛：改为刻画角色的其他神态细节或面部表情
</抗滥用策略>`;
}

/** 生成用户厌恶元素 prompt */
export function renderHatedElements(elements?: string[]): string {
  const list = elements ?? HATED_ELEMENTS;
  return `<用户厌恶的元素>
## haruki，用户极度厌恶下列元素，不要使用：
${list.map(e => `- ${e}`).join('\n')}
</用户厌恶的元素>`;
}
