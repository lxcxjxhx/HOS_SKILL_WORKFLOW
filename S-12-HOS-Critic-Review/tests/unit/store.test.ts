import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadStore, nextHcrId, recordReview, saveStore } from '../../scripts/store.ts';
import type { ReviewStore } from '../../scripts/store.ts';
import type { ReviewReport } from '../../scripts/core/types.ts';

const base: ReviewReport = {
  schema_version: '1.0', report_id: 'rr-20260802-test001',
  target: {
    object_id: 'obj-test', type: 'article', domain: 'test', complexity: 'low',
    source: { kind: 'path', url: null }, meta: { title: 'T' }, confidence: 0.9,
  },
  score: {
    score: 70, grade: 'B', grade_label: '良好',
    dimensions: { technical: 7, innovation: 7, engineering: 7, ecosystem: 7, risk: 7, strategic: 7 },
    verdict: 'v', one_liner: '测试结论',
    decision: { learn: true, contribute: true, invest: false, research: false },
    rationale: 'r', risk_flags: [],
  },
  findings: [], critiques: [], degradations: [], meta: { duration_seconds: 1, toolchain: {}, output_mode: 'quick' },
};

test('nextHcrId：同对象内按序号递增', async () => {
  const store: ReviewStore = { reviews: [], findings: [], objects: [] };
  const a = nextHcrId(store, 'EVAL', 'obj-x', 2026);
  assert.equal(a, 'HCR-EVAL-2026-0001');
  store.findings.push({ hcr_id: a, report_id: 'r', object_id: 'obj-x', class: 'EVAL', severity: 'HIGH', title: 't', claim: 'c', evidence_status: 'verified', evidence_sources: [], unit_refs: [], status: 'open', created: '' });
  const b = nextHcrId(store, 'EVAL', 'obj-x', 2026);
  assert.equal(b, 'HCR-EVAL-2026-0002');
  const c = nextHcrId(store, 'CLAIM', 'obj-x', 2026);
  assert.equal(c, 'HCR-CLAIM-2026-0001', '不同 class 独立计数');
  const d = nextHcrId(store, 'EVAL', 'obj-y', 2026);
  assert.equal(d, 'HCR-EVAL-2026-0001', '不同对象独立计数');
});

test('recordReview：幂等写入三个文件', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'hcr-store-'));
  try {
    const report: ReviewReport = { ...base, report_id: 'rr-20260802-a1b2c3' };
    const findings = [{
      hcr_id: 'HCR-EVAL-2026-0001', cls: 'EVAL', severity: 'HIGH', title: 't', claim: 'c',
      ev: 'verified', sources: [], units: ['unit-1'], patch: 'p', status: 'open' as const,
    }];
    await recordReview(report, findings, dir);
    await recordReview(report, findings, dir); // 二次写入应幂等

    const store = await loadStore(dir);
    assert.equal(store.reviews.length, 1, 'reviews 幂等');
    assert.equal(store.findings.length, 1, 'findings 幂等');
    assert.equal(store.objects.length, 1);
    assert.deepEqual(store.objects[0].findings, ['HCR-EVAL-2026-0001']);

    const raw = JSON.parse(await readFile(join(dir, 'reviews.json'), 'utf8'));
    assert.equal(raw.reviews.length, 1);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('saveStore/loadStore：空目录安全', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'hcr-store2-'));
  try {
    const empty = await loadStore(dir);
    assert.deepEqual(empty.findings, []);
    await saveStore({ reviews: [{ report_id: 'x', target: { type: 'repo', title: 't' }, score: 1, grade: 'F', created: '', object_id: 'o', findings_count: 0, output_mode: 'quick' }], findings: [], objects: [] }, dir);
    const again = await loadStore(dir);
    assert.equal(again.reviews.length, 1);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
