// ============================================================
// HOS-Paper-RedTeam — 评分卡渲染 CLI
// 用法：node src/index.ts <review.json>
// 输入为 PaperReviewData 的 JSON，输出 ghfind 式评分卡 markdown。
// ============================================================

import { readFileSync } from 'node:fs';
import { renderCard } from './render.ts';
import type { PaperReviewData } from './types.ts';

const file = process.argv[2];

if (!file) {
  console.error('用法: node src/index.ts <review.json>');
  console.error('示例: node src/index.ts example-review.json');
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

process.stdout.write(renderCard(data));
