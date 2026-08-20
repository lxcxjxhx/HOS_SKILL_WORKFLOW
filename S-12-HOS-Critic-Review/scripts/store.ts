/**
 * Review Store 读写（database/）：reviews.json / findings.json / objects.json
 * 零依赖实现。
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { Finding, ObjectProfile, ReviewReport } from './core/types.ts';

export interface StoreReviewEntry {
  report_id: string;
  target: { type: string; title: string; url?: string | null };
  score: number;
  grade: string;
  created: string;
  object_id: string;
  findings_count: number;
  output_mode: string;
}

export interface StoreFindingEntry {
  hcr_id: string;
  report_id: string;
  object_id: string;
  class: string;
  severity: string;
  title: string;
  claim: string;
  evidence_status: string;
  evidence_sources: string[];
  unit_refs: string[];
  patch?: string;
  status: 'open' | 'refuted' | 'rejected';
  created: string;
}

export interface StoreObjectEntry {
  object_id: string;
  type: string;
  source: string;
  reviews: string[];
  findings: string[];
}

export interface ReviewStore {
  reviews: StoreReviewEntry[];
  findings: StoreFindingEntry[];
  objects: StoreObjectEntry[];
}

const DEFAULTS: ReviewStore = { reviews: [], findings: [], objects: [] };

export async function loadStore(dir = 'database'): Promise<ReviewStore> {
  const store: ReviewStore = { ...DEFAULTS, reviews: [], findings: [], objects: [] };
  for (const key of ['reviews', 'findings', 'objects'] as const) {
    try {
      const raw = await readFile(`${dir}/${key}.json`, 'utf8');
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      store[key] = Array.isArray(parsed[key]) ? parsed[key] as never[] : [];
    } catch {
      store[key] = [] as never[];
    }
  }
  return store;
}

export async function saveStore(store: ReviewStore, dir = 'database'): Promise<void> {
  await mkdir(dir, { recursive: true });
  for (const key of ['reviews', 'findings', 'objects'] as const) {
    await writeFile(`${dir}/${key}.json`, JSON.stringify({ [key]: store[key] }, null, 2) + '\n', 'utf8');
  }
}

/** 编号分配：同对象内按 class 前缀 + 年份 + 对象内递增序号 */
export function nextHcrId(store: ReviewStore, cls: string, objectId: string, year: number): string {
  const prefix = `HCR-${cls}-${year}-`;
  const existing = store.findings.filter(f => f.object_id === objectId && f.hcr_id.startsWith(prefix));
  const maxSeq = existing.reduce((m, f) => Math.max(m, Number(f.hcr_id.slice(prefix.length)) || 0), 0);
  return `${prefix}${String(maxSeq + 1).padStart(4, '0')}`;
}

/** 一次评审写入：更新三个文件（幂等：按 report_id 去重） */
export async function recordReview(
  report: ReviewReport,
  findings: Array<{ hcr_id: string; cls: string; severity: string; title: string; claim: string; ev: string; sources: string[]; units: string[]; patch?: string; status: 'open' | 'refuted' }>,
  dir = 'database',
): Promise<ReviewStore> {
  const store = await loadStore(dir);
  const created = new Date().toISOString();
  const objectId = report.target.object_id;
  const title = report.target.meta?.title as string | undefined ?? report.target.source.url ?? report.target.type;

  // reviews（幂等）
  if (!store.reviews.some(r => r.report_id === report.report_id)) {
    store.reviews.push({
      report_id: report.report_id,
      target: { type: report.target.type, title, url: report.target.source.url ?? null },
      score: report.score.score,
      grade: report.score.grade,
      created,
      object_id: objectId,
      findings_count: findings.length,
      output_mode: report.meta.output_mode,
    });
  }

  // findings（幂等：按 hcr_id 去重）
  for (const f of findings) {
    if (!store.findings.some(x => x.hcr_id === f.hcr_id)) {
      store.findings.push({
        hcr_id: f.hcr_id, report_id: report.report_id, object_id: objectId,
        class: f.cls, severity: f.severity, title: f.title, claim: f.claim,
        evidence_status: f.ev, evidence_sources: f.sources, unit_refs: f.units,
        patch: f.patch, status: f.status, created,
      });
    }
  }

  // objects
  const obj = store.objects.find(o => o.object_id === objectId);
  if (obj) {
    if (!obj.reviews.includes(report.report_id)) obj.reviews.push(report.report_id);
    for (const f of findings) if (!obj.findings.includes(f.hcr_id)) obj.findings.push(f.hcr_id);
  } else {
    store.objects.push({
      object_id: objectId, type: report.target.type,
      source: report.target.source.url ?? report.target.source.kind,
      reviews: [report.report_id], findings: findings.map(f => f.hcr_id),
    });
  }

  await saveStore(store, dir);
  return store;
}

export function toStoreFinding(f: Finding, hcrId: string, objectId: string, sourceUrls: string[], status: 'open' | 'refuted'): {
  hcr_id: string; cls: string; severity: string; title: string; claim: string; ev: string; sources: string[]; units: string[]; patch?: string; status: 'open' | 'refuted';
} {
  return {
    hcr_id: hcrId, cls: f.class, severity: f.severity, title: f.title, claim: f.claim,
    ev: f.evidence_status ?? 'unverifiable', sources: sourceUrls, units: f.unit_refs,
    patch: f.patch, status,
  };
}

/** 供测试/调试用：清空 store 目录下的数据文件 */
export function storePath(dir = 'database'): string { return dirname(`${dir}/x`); }
