import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { renderHtml } from '../../scripts/render-html.ts';
import type { ReviewReport } from '../../scripts/core/types.ts';

async function load(): Promise<ReviewReport> {
  return JSON.parse(await readFile('examples/example-review.json', 'utf8')) as ReviewReport;
}

test('renderHtml：完整文档结构 + 评分卡置顶', async () => {
  const r = await load();
  const html = renderHtml(r, 'expert');
  assert.ok(html.startsWith('<!DOCTYPE html>'));
  assert.ok(html.includes('</html>'));
  assert.ok(html.includes('score-num'));
  assert.ok(html.includes(r.score.score.toString()));
  assert.ok(html.includes(r.score.one_liner));
  assert.ok(html.includes('六维评分'));
  assert.ok(html.includes('dim-fill'));
  assert.ok(html.includes('Findings'));
  assert.ok(html.includes('Critical Critiques'));
  assert.ok(html.includes('Degradations'));
  assert.ok(html.includes('Recommendation'));
});

test('renderHtml：decision 四问渲染为 chip', async () => {
  const r = await load();
  const html = renderHtml(r, 'quick');
  assert.ok(html.includes('learn'));
  assert.ok(html.includes('contribute'));
  assert.ok(html.includes('invest'));
  assert.ok(html.includes('research'));
  assert.ok(html.includes('dec-yes') || html.includes('dec-no'));
});

test('renderHtml：quick 模式不渲染全部 findings 卡片', async () => {
  const r = await load();
  const quick = renderHtml(r, 'quick');
  const expert = renderHtml(r, 'expert');
  assert.ok(quick.includes('Top Findings'));
  assert.ok(!quick.includes('Findings（'));
  assert.ok(expert.includes('Findings（'));
});

test('renderHtml：HTML 特殊字符被转义（防注入）', async () => {
  const r = await load();
  r.findings[0].claim = '<script>alert("xss")</script> & <b>bold</b>';
  const html = renderHtml(r, 'expert');
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(!html.includes('<script>alert'), '原始 script 标签不得原样出现');
  assert.ok(html.includes('&amp;'));
});

test('renderHtml：severity 徽章与证据状态齐全', async () => {
  const r = await load();
  const html = renderHtml(r, 'expert');
  assert.ok(html.includes('CRITICAL'));
  assert.ok(html.includes('证据：'));
  assert.ok(html.includes('HCR-'));
});
