/**
 * 报告适配器 - 将 ProcessResult 转换为 OrchestrationResult
 * 用于兼容旧版报告生成器
 */

import type { ProcessResult, PhaseResult as ProcessPhaseResult, ProcessFinding } from '../types/process';
import type { OrchestrationResult, PhaseResult, Finding, FlowSummary } from '../types/playbook';

/**
 * 将 ProcessResult 转换为 OrchestrationResult
 */
export function adaptProcessResultToOrchestration(processResult: ProcessResult): OrchestrationResult {
  const now = new Date().toISOString();
  
  // 转换 findings
  const convertFindings = (findings: ProcessFinding[]): Finding[] => {
    return findings.map(f => ({
      skillId: f.type,
      severity: f.severity,
      description: f.description,
      evidence: f.evidence,
      timestamp: f.timestamp
    }));
  };

  // 转换 phaseResults
  const phaseResults: PhaseResult[] = processResult.phaseResults.map((pr: ProcessPhaseResult) => ({
    phaseId: pr.phaseId,
    phaseName: pr.phaseId, // 使用 phaseId 作为 phaseName
    findings: convertFindings(pr.findings),
    duration: `${pr.duration}ms`,
    status: pr.status === 'success' ? 'completed' : 
            pr.status === 'failure' ? 'failed' : 
            pr.status === 'skipped' ? 'skipped' : 'failed',
    skillsExecuted: [] // ProcessResult 中没有 skill 信息，设为空数组
  }));

  // 转换 summary
  const summary: FlowSummary = {
    totalSkillsExecuted: 0, // ProcessResult 中没有 skill 统计
    criticalFindings: processResult.summary.criticalCount,
    highFindings: processResult.summary.highCount,
    mediumFindings: processResult.summary.mediumCount,
    lowFindings: processResult.summary.lowCount,
    exploitedVulnerabilities: [],
    achievedAccessLevel: 'unknown'
  };

  // 映射 status
  const status = processResult.status === 'completed' ? 'completed' :
                 processResult.status === 'failed' ? 'failed' :
                 processResult.status === 'stopped' ? 'paused' : 'partial';

  return {
    playbookId: processResult.templateId,
    playbookName: processResult.templateId, // 使用 templateId 作为 playbookName
    target: processResult.context.target,
    startTime: processResult.context.startTime,
    endTime: now,
    status,
    phaseResults,
    summary,
    report: '',
    recommendations: []
  };
}
