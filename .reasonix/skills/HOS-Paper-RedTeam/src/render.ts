// ============================================================
// HOS-Paper-RedTeam — ghfind 式评分卡渲染器
// 输入 PaperReviewData（见 types.ts），输出 ghfind 风格的
// 结构统一评分卡 markdown。通用于所有论文类型。
// ============================================================

import type { PaperReviewData } from './types.ts';

const BAR_LEN = 20; // 维度可视化条长度（与 ghfind 的条宽度一致）

/** 渲染维度进度条：█ 实心 / ░ 空心 */
export function renderBar(score: number, max: number): string {
  const filled = Math.max(0, Math.min(BAR_LEN, Math.round((score / max) * BAR_LEN)));
  return '█'.repeat(filled) + '░'.repeat(BAR_LEN - filled);
}

/** 数字对齐两位小数 */
function fmt(n: number): string {
  return (Math.round(n * 100) / 100).toFixed(2);
}

/** 渲染完整评分卡 */
export function renderCard(d: PaperReviewData): string {
  const lines: string[] = [];

  // —— 头部 ——
  lines.push(`# 🎴 论文评分卡 — ${d.title}`);
  lines.push('');
  lines.push(`**${fmt(d.score)}/100**  ${d.rankEmoji} ${d.rankLabel}${d.venue ? ` · ${d.venue}` : ''}`);
  if (d.tags.length) lines.push(`#${d.tags.join(' #')}`);
  lines.push('');

  // —— 排名行 ——
  if (d.position) lines.push(`**我的位置**: #${d.position.rank} / 共 ${d.position.total} 篇已审`);
  if (d.beatPercent !== undefined) lines.push(`**击败了 ${fmt(d.beatPercent)}% 的已审论文**`);
  if (d.nextRank) lines.push(`**距「${d.nextRank.label}」还差 ${fmt(d.nextRank.diff)} 分**`);
  if (d.position || d.beatPercent !== undefined || d.nextRank) lines.push('');

  // —— 维度评分 ——
  lines.push(`## 维度评分`);
  lines.push('');
  lines.push(`| 维度 | 得分 | 可视化 |`);
  lines.push(`|------|------|--------|`);
  for (const dim of d.dimensions) {
    lines.push(`| ${dim.label} | ${fmt(dim.score)}/${dim.max} | ${renderBar(dim.score, dim.max)} |`);
  }
  lines.push('');

  // —— 🏆 亮点 ——
  if (d.highlights.length) {
    lines.push(`## 🏆 亮点`);
    lines.push('');
    for (const h of d.highlights) lines.push(`- ${h}`);
    lines.push('');
  }

  // —— 🛠 关键方法 ——
  if (d.methods.length) {
    lines.push(`## 🛠 关键方法`);
    lines.push('');
    for (const m of d.methods) lines.push(`- ${m}`);
    lines.push('');
  }

  // —— 🧬 最像的论文 ——
  if (d.similarPapers.length) {
    lines.push(`## 🧬 和 TA 最像的论文`);
    lines.push('');
    lines.push(`| 论文 | 评分 | 标签 |`);
    lines.push(`|------|------|------|`);
    for (const s of d.similarPapers) {
      lines.push(`| ${s.title} | ${fmt(s.score)}/100 | ${s.tag ?? '-'} |`);
    }
    lines.push('');
  }

  // —— 🔥 毒舌点评全文 ——
  lines.push(`## 🔥 毒舌点评全文`);
  lines.push('');
  lines.push(d.roastFull);
  lines.push('');
  lines.push(`**一句话结论**: ${d.oneLiner}`);
  lines.push('');

  // —— 维度说明表 ——
  lines.push(`| 维度 | 得分 | 说明 |`);
  lines.push(`|------|------|------|`);
  for (const dim of d.dimensions) {
    lines.push(`| ${dim.label} | ${fmt(dim.score)}/${dim.max} | ${dim.note ?? '-'} |`);
  }
  lines.push('');

  // —— 风险标记 ——
  if (d.riskFlags.length) {
    lines.push(`**风险标记**: ${d.riskFlags.join(' · ')}`);
    lines.push('');
  }

  // —— 建议 ——
  if (d.suggestions.length) {
    lines.push(`**建议**:`);
    d.suggestions.forEach((s, i) => lines.push(`${i + 1}. ${s}`));
    lines.push('');
  }

  // —— 补充证据 ——
  if (d.evidence.length) {
    lines.push(`**补充证据**:`);
    for (const e of d.evidence) lines.push(`- ${e}`);
  }

  return lines.join('\n');
}
