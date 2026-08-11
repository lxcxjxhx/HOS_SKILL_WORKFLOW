// ============================================================
// HOS-Paper-RedTeam — 审计报表渲染 CLI
// 用法：
//   node src/index.ts <review.json>              # 默认：完整审计报表 HTML（根因+tex证据链+统计）
//   node src/index.ts <review.json> --card       # 纯评分卡 HTML
//   node src/index.ts <review.json> --format md  # markdown 评分卡
// 输入为 PaperReviewData 的 JSON（含可选 issues[] 证据链）。
// ============================================================

import { readFileSync } from 'node:fs';
import { renderCard } from './render.ts';
import { renderHtml } from './render-html.ts';
import { renderReport } from './report.ts';
import type { PaperReviewData } from './types.ts';

const file = process.argv[2];
const mode = process.argv.includes('--card') ? 'card' : 'report';
const formatArg = process.argv.find(a => a.startsWith('--format=')) ?? process.argv[process.argv.indexOf('--format') + 1];
const format: 'md' | 'html' = formatArg === 'md' ? 'md' : 'html';

if (!file) {
  console.error('用法: node src/index.ts <review.json> [--card|--format md|html]');
  console.error('示例:');
  console.error('  node src/index.ts review.json            # 完整审计报表 HTML（默认）');
  console.error('  node src/index.ts review.json --card     # 纯评分卡 HTML');
  console.error('  node src/index.ts review.json --format md');
  process.exit(1);
}

let data: PaperReviewData;
try {
  data = JSON.parse(readFileSync(file, 'utf-8')) as PaperReviewData;
} catch (err) {
  console.error(`无法读取或解析 JSON: ${file}`);
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}

// 基本校验：综合评分应为 0-100
if (typeof data.score !== 'number' || data.score < 0 || data.score > 100) {
  console.error('评分卡数据校验失败：score 必须在 0-100 之间');
  process.exit(1);
}

if (format === 'md') {
  process.stdout.write(renderCard(data));
} else if (mode === 'card') {
  process.stdout.write(renderHtml(data));
} else {
  process.stdout.write(renderReport(data));
}
