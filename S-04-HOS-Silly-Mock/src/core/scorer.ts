/**
 * HOS-Silly-Mock: Reality Score Calculator
 *
 * 综合多维度的检测结果，计算 Reality Score (0-100)
 * 和各项风险评估等级
 */

import { Finding, EnforcementResult, RiskLevel } from './types';

/** 各层权重 */
const LAYER_WEIGHTS = {
  'L1-MOCK': 0.35,
  'L2-REGEX': 0.20,
  'L3-BINDING': 0.25,
  'L4-SILENT': 0.20,
};

/** 每级严重程度的扣分 */
const SEVERITY_PENALTIES: Record<RiskLevel, number> = {
  critical: 25,
  high: 15,
  medium: 8,
  low: 3,
  info: 1,
};

/** 最大扣分上限（每层） */
const MAX_LAYER_PENALTY = 60;

/**
 * 从 findings 计算 Reality Score
 */
export function calculateRealityScore(findings: Finding[]): number {
  if (findings.length === 0) return 100;

  // 按层分组
  const byLayer = new Map<string, Finding[]>();
  for (const f of findings) {
    const layer = f.layer;
    if (!byLayer.has(layer)) byLayer.set(layer, []);
    byLayer.get(layer)!.push(f);
  }

  // 计算总得分
  let totalScore = 100;

  for (const [layer, layerFindings] of byLayer) {
    const weight = LAYER_WEIGHTS[layer as keyof typeof LAYER_WEIGHTS] || 0.15;
    let layerPenalty = 0;

    for (const f of layerFindings) {
      layerPenalty += SEVERITY_PENALTIES[f.severity] || 1;
    }

    // 应用层上限
    layerPenalty = Math.min(layerPenalty, MAX_LAYER_PENALTY);
    totalScore -= layerPenalty * weight;
  }

  return Math.max(0, Math.min(100, Math.round(totalScore)));
}

/**
 * 计算 Mock Leakage 风险等级
 */
export function calcMockLeakageRisk(score: number): RiskLevel {
  if (score <= 30) return 'critical';
  if (score <= 50) return 'high';
  if (score <= 70) return 'medium';
  if (score <= 85) return 'low';
  return 'info';
}

/**
 * 计算 Regex Abuse 风险等级
 */
export function calcRegexAbuseRisk(findings: Finding[]): RiskLevel {
  const regexFindings = findings.filter(f => f.layer === 'L2-REGEX');
  const criticalCount = regexFindings.filter(f => f.severity === 'critical').length;
  const highCount = regexFindings.filter(f => f.severity === 'high').length;

  if (criticalCount > 0) return 'critical';
  if (highCount > 0) return 'high';
  if (regexFindings.length >= 3) return 'medium';
  if (regexFindings.length > 0) return 'low';
  return 'info';
}

/**
 * 判断是否有 Silent Failure
 */
export function hasSilentFailure(findings: Finding[]): 'YES' | 'NO' {
  const silentFindings = findings.filter(f => f.layer === 'L4-SILENT');
  const hasCritical = silentFindings.some(f => f.severity === 'critical' || f.severity === 'high');
  return hasCritical ? 'YES' : 'NO';
}

/**
 * 判断 Reality Binding 是否通过
 */
export function bindingPassed(findings: Finding[]): 'PASS' | 'FAIL' {
  const bindingFindings = findings.filter(f => f.layer === 'L3-BINDING');
  const hasUnbound = bindingFindings.some(f => f.type === 'unbound-variable');
  return hasUnbound ? 'FAIL' : 'PASS';
}

/**
 * 计算统计摘要
 */
export function calcSummary(findings: Finding[]) {
  const errors = findings.filter(f => f.severity === 'critical' || f.severity === 'high').length;
  const warnings = findings.filter(f => f.severity === 'medium' || f.severity === 'low').length;
  const info = findings.filter(f => f.severity === 'info').length;

  return {
    totalFindings: findings.length,
    errors,
    warnings,
    info,
  };
}

/**
 * 从 findings 生成完整报告
 */
export function buildResult(findings: Finding[]): EnforcementResult {
  const score = calculateRealityScore(findings);

  return {
    passed: score >= 50,
    realityScore: score,
    dimensions: {
      dataAuthenticity: Math.max(0, 100 - findings.filter(f => f.layer === 'L1-MOCK').length * 12),
      mockLeakageRisk: calcMockLeakageRisk(score),
      regexAbuseRisk: calcRegexAbuseRisk(findings),
      silentFailureRisk: hasSilentFailure(findings),
      realityBinding: bindingPassed(findings),
    },
    findings,
    summary: calcSummary(findings),
  };
}
