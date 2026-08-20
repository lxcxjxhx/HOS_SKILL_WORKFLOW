/**
 * ReviewReport 校验器：对应 schemas/review-report.schema.json 的关键约束。
 * 零依赖实现（node:util）。
 */
import {
  ATTACK_VECTORS, CRITIC_ROLES, DEFAULT_WEIGHTS, DIM_KEYS, EVIDENCE_STATUSES,
  FINDING_CLASSES, GRADES, OBJECT_TYPES, SEVERITIES,
} from './types.ts';
import type { ReviewReport } from './types.ts';

export interface ValidationResult { ok: boolean; errors: string[]; }

const HCR_RE = /^HCR-(ARCH|DATA|EVAL|SEC|REPRO|LIC|ECO|CLAIM)-[0-9]{4}-[0-9]{4}$/;
const REPORT_ID_RE = /^rr-[0-9]{8}-[a-z0-9]{6}$/;
const FINDING_ID_RE = /^finding-[0-9]{3}$/;
const CRIT_ID_RE = /^crit-[0-9]{3}$/;

export function validateReport(r: unknown): ValidationResult {
  const errors: string[] = [];
  const err = (m: string) => errors.push(m);
  const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);

  if (!isObj(r)) return { ok: false, errors: ['顶层必须是对象'] };
  const rep = r as unknown as ReviewReport;

  if (rep.schema_version !== '1.0') err('schema_version 必须为 "1.0"');
  if (typeof rep.report_id !== 'string' || !REPORT_ID_RE.test(rep.report_id)) err(`report_id 格式错误: ${rep.report_id}`);
  if (!rep.meta || !['quick', 'expert', 'academic'].includes(rep.meta.output_mode)) err('meta.output_mode 枚举错误');

  // target
  if (!isObj(rep.target)) err('target 缺失');
  else {
    if (!OBJECT_TYPES.includes(rep.target.type)) err(`target.type 枚举错误: ${rep.target.type}`);
    if (typeof rep.target.confidence !== 'number' || rep.target.confidence < 0 || rep.target.confidence > 1) err('target.confidence 范围错误');
    if (!['low', 'medium', 'high'].includes(rep.target.complexity)) err('target.complexity 枚举错误');
  }

  // score
  if (!isObj(rep.score)) err('score 缺失');
  else {
    const d = rep.score.dimensions;
    if (!isObj(d)) err('score.dimensions 缺失');
    else for (const k of DIM_KEYS) {
      if (typeof d[k] !== 'number' || d[k] < 0 || d[k] > 10) err(`dimensions.${k} 范围错误: ${d[k]}`);
    }
    if (!GRADES.includes(rep.score.grade)) err(`score.grade 枚举错误: ${rep.score.grade}`);
    if (typeof rep.score.one_liner !== 'string' || rep.score.one_liner.length > 40) err(`score.one_liner 超长或缺失（${rep.score.one_liner?.length ?? 0} 字）`);
    if (typeof rep.score.score !== 'number') err('score.score 缺失');
    else {
      const d = rep.score.dimensions;
      if (isObj(d)) {
        const calc = DIM_KEYS.reduce((s, k) => s + (d[k] ?? 0) * DEFAULT_WEIGHTS[k], 0) * 10;
        if (Math.abs(calc - rep.score.score) > 1) err(`score 公式不可复核: 计算 ${calc.toFixed(1)} vs 报告 ${rep.score.score}`);
      }
    }
    const dec = rep.score.decision;
    if (!isObj(dec)) err('score.decision 缺失');
    else for (const k of ['learn', 'contribute', 'invest', 'research']) {
      if (typeof dec[k] !== 'boolean') err(`score.decision.${k} 缺失`);
    }
    if (typeof rep.score.verdict !== 'string' || rep.score.verdict.length === 0) err('score.verdict 缺失');
  }

  // findings
  if (!Array.isArray(rep.findings)) err('findings 缺失');
  else for (const f of rep.findings) {
    if (!isObj(f)) { err('finding 非对象'); continue; }
    if (typeof f.finding_id !== 'string' || !FINDING_ID_RE.test(f.finding_id)) err(`finding_id 格式错误: ${f.finding_id}`);
    if (f.hcr_id !== undefined && (typeof f.hcr_id !== 'string' || !HCR_RE.test(f.hcr_id))) err(`hcr_id 格式错误: ${f.hcr_id}`);
    if (!FINDING_CLASSES.includes(f.class as never)) err(`finding.class 枚举错误: ${f.class}`);
    if (!SEVERITIES.includes(f.severity as never)) err(`finding.severity 枚举错误: ${f.severity}`);
    if (typeof f.claim !== 'string' || f.claim.length === 0) err(`finding.claim 缺失: ${f.finding_id}`);
    if (typeof f.evidence_draft !== 'string' || f.evidence_draft.length === 0) err(`finding.evidence_draft 缺失: ${f.finding_id}`);
    if (!Array.isArray(f.unit_refs) || f.unit_refs.length === 0) err(`finding.unit_refs 为空: ${f.finding_id}`);
    if (f.evidence_status !== undefined && !EVIDENCE_STATUSES.includes(f.evidence_status as never)) err(`finding.evidence_status 枚举错误: ${f.evidence_status}`);
  }

  // critiques
  if (!Array.isArray(rep.critiques)) err('critiques 缺失');
  else {
    for (const c of rep.critiques) {
      if (!isObj(c)) { err('critique 非对象'); continue; }
      if (typeof c.crit_id !== 'string' || !CRIT_ID_RE.test(c.crit_id)) err(`crit_id 格式错误: ${c.crit_id}`);
      if (!CRITIC_ROLES.includes(c.role as never)) err(`critique.role 枚举错误: ${c.role}`);
      if (!ATTACK_VECTORS.includes(c.attack_vector as never)) err(`critique.attack_vector 枚举错误: ${c.attack_vector}`);
      if (typeof c.thesis !== 'string' || c.thesis.length === 0) err(`critique.thesis 缺失: ${c.crit_id}`);
      if (typeof c.reasoning !== 'string' || c.reasoning.length === 0) err(`critique.reasoning 缺失: ${c.crit_id}`);
    }
    if (!rep.critiques.some(c => isObj(c) && c.attack_vector === 'recognition')) err('缺少至少一条 recognition 认可类 Critique');
  }

  // degradations
  if (!Array.isArray(rep.degradations)) err('degradations 缺失');
  // evidence 覆盖率：每条 finding 有 evidence_status（unverifiable 也算）
  const noEv = rep.findings?.filter(f => isObj(f) && !f.evidence_status).map(f => f.finding_id);
  if (noEv?.length) err(`evidence 覆盖率 <100%: ${noEv.join(', ')} 无 evidence_status`);

  return { ok: errors.length === 0, errors };
}
