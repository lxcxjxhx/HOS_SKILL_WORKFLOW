import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateReport } from '../../scripts/core/validate.ts';

async function loadExample(): Promise<Record<string, unknown>> {
  return JSON.parse(await readFile('examples/example-review.json', 'utf8'));
}

test('validate：M1 示例报告通过全部约束', async () => {
  const r = await loadExample();
  const res = validateReport(r);
  assert.equal(res.ok, true, res.errors.join('; '));
});

test('validate：评分公式不可复核 → fail', async () => {
  const r = await loadExample() as { score: Record<string, unknown> };
  r.score.score = 99;
  const res = validateReport(r);
  assert.equal(res.ok, false);
  assert.ok(res.errors.some(e => e.includes('公式不可复核')));
});

test('validate：缺少 recognition 认可类 → fail', async () => {
  const r = await loadExample() as { critiques: Array<{ attack_vector: string }> };
  r.critiques = r.critiques.filter(c => c.attack_vector !== 'recognition');
  const res = validateReport(r);
  assert.equal(res.ok, false);
  assert.ok(res.errors.some(e => e.includes('recognition')));
});

test('validate：one_liner 超长 → fail', async () => {
  const r = await loadExample() as { score: Record<string, unknown> };
  r.score.one_liner = '这是一句故意写得特别特别长远远超过四十个字的超长一句话结论专门用来测试校验器能不能把它正确拦截下来的测试用例';
  const res = validateReport(r);
  assert.equal(res.ok, false);
  assert.ok(res.errors.some(e => e.includes('one_liner')));
});

test('validate：evidence 覆盖率不足 → fail', async () => {
  const r = await loadExample() as { findings: Array<Record<string, unknown>> };
  delete r.findings[0].evidence_status;
  const res = validateReport(r);
  assert.equal(res.ok, false);
  assert.ok(res.errors.some(e => e.includes('evidence 覆盖率')));
});

test('validate：grade 枚举非法 → fail', async () => {
  const r = await loadExample() as { score: Record<string, unknown> };
  r.score.grade = 'X';
  const res = validateReport(r);
  assert.equal(res.ok, false);
  assert.ok(res.errors.some(e => e.includes('grade')));
});
