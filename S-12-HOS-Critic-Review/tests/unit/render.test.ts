import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dimBar, renderQuick, renderAcademic, render } from '../../scripts/render.ts';
import type { ReviewReport } from '../../scripts/core/types.ts';

test('dimBar：数值映射为 10 格条', () => {
  assert.equal(dimBar(9), '█████████░');
  assert.equal(dimBar(10), '██████████');
  assert.equal(dimBar(0), '░░░░░░░░░░');
  assert.equal(dimBar(3.4), '███░░░░░░░');
});

test('renderQuick：评分卡元素齐全', async () => {
  const r = JSON.parse(await readFile('examples/example-review.json', 'utf8')) as ReviewReport;
  const md = renderQuick(r);
  assert.ok(md.includes('Score: 62/100'));
  assert.ok(md.includes('One-liner:'));
  assert.ok(md.includes('HCR-CLAIM-2026-0001'));
  assert.ok(md.includes('Degradations:'));
  assert.ok(md.includes('████'));
});

test('render：expert 模式含关键章节', async () => {
  const r = JSON.parse(await readFile('examples/example-review.json', 'utf8')) as ReviewReport;
  const md = render(r, 'expert');
  assert.ok(md.includes('Executive Summary'));
  assert.ok(md.includes('Rationale'));
  assert.ok(md.includes('Degradations & Limits'));
});

test('renderAcademic：无 CRITICAL verified + score 74 → Weak Accept', async () => {
  const r = JSON.parse(await readFile('examples/example-review.json', 'utf8')) as ReviewReport;
  r.score.score = 74;
  r.score.grade = 'B';
  r.score.dimensions = { technical: 8, innovation: 8, engineering: 7, ecosystem: 7, risk: 8, strategic: 8 };
  r.findings.forEach(f => { if (f.severity === 'CRITICAL') f.evidence_status = 'partial'; });
  const md = renderAcademic(r);
  assert.ok(md.includes('Decision: **Weak Accept**'));
});

test('renderAcademic：存在 CRITICAL verified → 不高于 Weak Reject', async () => {
  const r = JSON.parse(await readFile('examples/example-review.json', 'utf8')) as ReviewReport;
  r.score.score = 88;
  r.score.grade = 'A';
  r.score.dimensions = { technical: 9, innovation: 9, engineering: 9, ecosystem: 8, risk: 9, strategic: 9 };
  r.findings.forEach(f => { if (f.severity === 'CRITICAL') f.evidence_status = 'verified'; });
  const md = renderAcademic(r);
  assert.ok(md.includes('Weak Reject'), '有 CRITICAL verified 时最高 Weak Reject，实际输出应包含该档');
});
