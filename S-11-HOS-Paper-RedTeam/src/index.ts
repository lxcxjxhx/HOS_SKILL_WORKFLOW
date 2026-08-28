// ============================================================
// HOS-Paper-RedTeam — 评分卡渲染 CLI
// 用法：node src/index.ts <review.json> [--format md|html]
// 输入为 PaperReviewData 的 JSON。
// 默认输出单文件 HTML（浏览器直接打开）；--format md 输出 markdown。
// ============================================================

import { readFileSync } from 'node:fs';
import { renderCard } from './render.ts';
import { renderHtml } from './render-html.ts';
import type { PaperReviewData } from './types.ts';

const file = process.argv[2];
const formatArg = process.argv.find(a => a.startsWith('--format=')) ?? process.argv[process.argv.indexOf('--format') + 1];
const format: 'md' | 'html' = formatArg === 'md' ? 'md' : 'html';

if (!file) {
  console.error('用法: node src/index.ts <review.json> [--format md|html]');
  console.error('示例: node src/index.ts example-review.json          # HTML（默认）');
  console.error('      node src/index.ts example-review.json --format md');
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

process.stdout.write(format === 'html' ? renderHtml(data) : renderCard(data));
