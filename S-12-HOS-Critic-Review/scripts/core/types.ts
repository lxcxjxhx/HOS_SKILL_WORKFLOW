/**
 * HOS-CRITIC-REVIEW 核心类型（对应 schemas/review-report.schema.json）
 * 注意：Node type-stripping 限制 —— 不使用 enum/namespace/参数属性等需转换的语法。
 */

export type ObjectType = 'repo' | 'paper' | 'article' | 'dataset' | 'license' | 'proposal' | 'unknown';
export type Complexity = 'low' | 'medium' | 'high';
export type FindingClass = 'ARCH' | 'DATA' | 'EVAL' | 'SEC' | 'REPRO' | 'LIC' | 'ECO' | 'CLAIM';
export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
export type EvidenceStatus = 'verified' | 'refuted' | 'partial' | 'unverifiable';
export type Confidence = 'high' | 'medium' | 'low';
export type Grade = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
export type OutputMode = 'quick' | 'expert' | 'academic';
export type AttackVector =
  | 'hidden-assumption' | 'counterexample' | 'hidden-cost' | 'overclaim'
  | 'missing-baseline' | 'scaling-doubt' | 'survivorship' | 'recognition';
export type CriticRole =
  | 'reviewer2' | 'experiment-auditor' | 'principal-engineer' | 'security-auditor'
  | 'product-mind' | 'legal-mind' | 'business-mind' | 'data-scientist'
  | 'skeptic' | 'domain-expert' | 'architect' | 'generalist';

export interface ObjectProfile {
  object_id: string;
  type: ObjectType;
  domain: string;
  complexity: Complexity;
  size_estimate?: { bytes?: number | null; files?: number | null; pages?: number | null; tokens?: number | null };
  source: { kind: string; url?: string | null };
  meta?: Record<string, unknown>;
  signals?: string[];
  confidence: number;
  degradations?: string[];
}

export interface SixDimScore {
  score: number;
  grade: Grade;
  grade_label: string;
  dimensions: { technical: number; innovation: number; engineering: number; ecosystem: number; risk: number; strategic: number };
  verdict: string;
  one_liner: string;
  decision: { learn: boolean; contribute: boolean; invest: boolean; research: boolean };
  rationale: string;
  risk_flags?: string[];
}

export interface Finding {
  finding_id: string;
  hcr_id?: string;
  class: FindingClass;
  severity: Severity;
  title: string;
  claim: string;
  evidence_draft: string;
  unit_refs: string[];
  analyzer?: string;
  confidence?: number;
  evidence_status?: EvidenceStatus;
  patch?: string;
}

export interface Critique {
  crit_id: string;
  role: CriticRole;
  attack_vector: AttackVector;
  thesis: string;
  reasoning: string;
  unit_refs?: string[];
  finding_refs?: string[];
  spiciness?: number;
}

export interface ReviewReport {
  schema_version: '1.0';
  report_id: string;
  target: ObjectProfile;
  score: SixDimScore;
  findings: Finding[];
  critiques: Critique[];
  degradations: string[];
  meta: {
    duration_seconds: number;
    toolchain: Record<string, unknown>;
    output_mode: OutputMode;
    store_status?: string;
  };
}

/** 六维 key 与默认权重（对应 config.yaml / references/score-model.md） */
export const DIM_KEYS = ['technical', 'innovation', 'engineering', 'ecosystem', 'risk', 'strategic'] as const;
export const DEFAULT_WEIGHTS: Record<(typeof DIM_KEYS)[number], number> = {
  technical: 0.2, innovation: 0.2, engineering: 0.15, ecosystem: 0.15, risk: 0.15, strategic: 0.15,
};

export const OBJECT_TYPES: readonly ObjectType[] = ['repo', 'paper', 'article', 'dataset', 'license', 'proposal', 'unknown'];
export const FINDING_CLASSES: readonly FindingClass[] = ['ARCH', 'DATA', 'EVAL', 'SEC', 'REPRO', 'LIC', 'ECO', 'CLAIM'];
export const SEVERITIES: readonly Severity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];
export const EVIDENCE_STATUSES: readonly EvidenceStatus[] = ['verified', 'refuted', 'partial', 'unverifiable'];
export const GRADES: readonly Grade[] = ['S', 'A', 'B', 'C', 'D', 'F'];
export const ATTACK_VECTORS: readonly AttackVector[] = [
  'hidden-assumption', 'counterexample', 'hidden-cost', 'overclaim',
  'missing-baseline', 'scaling-doubt', 'survivorship', 'recognition',
];
export const CRITIC_ROLES: readonly CriticRole[] = [
  'reviewer2', 'experiment-auditor', 'principal-engineer', 'security-auditor',
  'product-mind', 'legal-mind', 'business-mind', 'data-scientist',
  'skeptic', 'domain-expert', 'architect', 'generalist',
];

/** 按对象类型计算总分（对应 §6.3 公式） */
export function computeScore(dims: SixDimScore['dimensions'], weights: Record<string, number> = DEFAULT_WEIGHTS): number {
  let sum = 0;
  for (const k of DIM_KEYS) sum += (dims[k] ?? 0) * (weights[k] ?? 0);
  return Math.round(sum * 10);
}
