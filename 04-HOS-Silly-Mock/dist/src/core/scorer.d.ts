/**
 * HOS-Silly-Mock: Reality Score Calculator
 *
 * 综合多维度的检测结果，计算 Reality Score (0-100)
 * 和各项风险评估等级
 */
import { Finding, EnforcementResult, RiskLevel } from './types';
/**
 * 从 findings 计算 Reality Score
 */
export declare function calculateRealityScore(findings: Finding[]): number;
/**
 * 计算 Mock Leakage 风险等级
 */
export declare function calcMockLeakageRisk(score: number): RiskLevel;
/**
 * 计算 Regex Abuse 风险等级
 */
export declare function calcRegexAbuseRisk(findings: Finding[]): RiskLevel;
/**
 * 判断是否有 Silent Failure
 */
export declare function hasSilentFailure(findings: Finding[]): 'YES' | 'NO';
/**
 * 判断 Reality Binding 是否通过
 */
export declare function bindingPassed(findings: Finding[]): 'PASS' | 'FAIL';
/**
 * 计算统计摘要
 */
export declare function calcSummary(findings: Finding[]): {
    totalFindings: number;
    errors: number;
    warnings: number;
    info: number;
};
/**
 * 从 findings 生成完整报告
 */
export declare function buildResult(findings: Finding[]): EnforcementResult;
//# sourceMappingURL=scorer.d.ts.map