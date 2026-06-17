/**
 * Templates Index
 * 
 * 统一导出所有模板模块
 */

export { generateFindingMarkdown, generateFindingJSON, FindingTemplateGuide } from './finding';
export { generateAuditReportMarkdown } from './report';
export { generateReviewOpinionMarkdown } from './review';
export type { ReviewOpinion } from './review';
export { generatePentestReport } from './pentest-report';
export type { PentestReport } from './pentest-report';
export { createPoC } from './poc';
export type { PoCTemplate } from './poc';
export { generateDiagnosticReport, generateDiagnosticReportJSON } from './diagnostic-report';
export type { DiagnosticReportInput } from './diagnostic-report';
