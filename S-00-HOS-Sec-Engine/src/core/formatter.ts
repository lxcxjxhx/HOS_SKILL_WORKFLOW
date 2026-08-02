import { SkillResult } from '../types/result';
import { RiskLevel } from '../types/skill';

/**
 * Skill 结果格式化器
 */
export class SkillFormatter {
  /**
   * 格式化为可读文本
   */
  static formatText(results: SkillResult[]): string {
    if (results.length === 0) {
      return '未找到匹配的 Skill。';
    }

    const skillBlocks = results.map((result, i) => {
      const skill: any = result.skill;
      const meta = skill.metadata;
      const md = result.matchDetails;

      const matchedKeywordsLine = md.matchedKeywords.length > 0
        ? `  匹配关键词: ${md.matchedKeywords.join(', ')}`
        : '';

      const symptomsLine = skill.knowledge?.symptoms?.length
        ? `    症状: ${skill.knowledge.symptoms.join(', ')}`
        : '';
      const rootCausesLine = skill.knowledge?.rootCauses?.length
        ? `    根因: ${skill.knowledge.rootCauses.join(', ')}`
        : '';
      const commonMistakesLine = skill.knowledge?.commonMistakes?.length
        ? `    常见错误: ${skill.knowledge.commonMistakes.join(', ')}`
        : '';

      const checklistLines = ((skill.action?.checklist ?? []) as string[])
        .map((item: string) => `    - [ ] ${item}`)
        .join('\n');

      const techniquesLines = ((skill.action?.techniques ?? []) as string[])
        .map((technique: string) => `    - ${technique}`)
        .join('\n');

      const examplesLines = ((skill.action.examples ?? []) as any[])
        .map((example: any) => `    - [${example.name}] ${example.content}${example.description ? `\n      说明: ${example.description}` : ''}`)
        .join('\n');

      const successSignsLine = skill.validation?.successSigns?.length
        ? `  成功标志: ${skill.validation.successSigns.join(', ')}`
        : '';
      const falsePositiveLine = skill.validation?.falsePositiveSigns?.length
        ? `  误报标志: ${skill.validation.falsePositiveSigns.join(', ')}`
        : '';

      const recommendationsLines = ((skill.defense?.recommendations ?? []) as string[])
        .map((rec: string) => `    - ${rec}`)
        .join('\n');
      const referencesLines = ((skill.defense?.references ?? []) as string[])
        .map((ref: string) => `    - ${ref}`)
        .join('\n');

      const qualityLine = skill.quality
        ? `  质量: confidence=${skill.quality.confidence}, reviewed=${skill.quality.reviewed}, tested=${skill.quality.tested}`
        : '';

      return `
[${i + 1}] ${meta.name}
${'-'.repeat(40)}
  ID: ${meta.id}
  分类: ${meta.category}/${meta.subCategory}
  风险等级: ${this.formatRiskLevel(meta.riskLevel)}
  匹配分数: ${(result.matchScore * 100).toFixed(1)}%
  置信度: ${(meta.confidence * 100).toFixed(0)}%
${matchedKeywordsLine ? matchedKeywordsLine + '\n' : ''}
  知识:
    ${skill.knowledge?.description ?? '无描述'}
${symptomsLine ? symptomsLine + '\n' : ''}${rootCausesLine ? rootCausesLine + '\n' : ''}${commonMistakesLine ? commonMistakesLine + '\n' : ''}
  操作清单:
${checklistLines}

  技术手段:
${techniquesLines}
${examplesLines ? '\n  示例:\n' + examplesLines + '\n' : ''}${successSignsLine ? '\n  ' + successSignsLine + '\n' : ''}${falsePositiveLine ? '  ' + falsePositiveLine + '\n' : ''}${recommendationsLines ? '\n  防御建议:\n' + recommendationsLines : ''}${referencesLines ? '\n  参考链接:\n' + referencesLines : ''}${qualityLine ? '\n\n' + qualityLine : ''}`;
    });

    const header = `${'='.repeat(60)}
  HOS-Sec-Engine V2 - Skill 匹配结果
  共找到 ${results.length} 条匹配 Skill
${'='.repeat(60)}`;

    const footer = '='.repeat(60);

    return header + skillBlocks.join('\n' + '='.repeat(60)) + '\n' + footer;
  }

  /**
   * 格式化为 JSON
   */
  static formatJson(results: SkillResult[]): string {
    const output = results.map(r => ({
      metadata: (r.skill as any).metadata,
      matchScore: r.matchScore,
      matchDetails: r.matchDetails,
      knowledge: (r.skill as any).knowledge,
      action: (r.skill as any).action,
      validation: (r.skill as any).validation || null,
      defense: (r.skill as any).defense || null,
      quality: (r.skill as any).quality || null
    }));

    return JSON.stringify(output, null, 2);
  }

  /**
   * 格式化风险等级
   */
  private static formatRiskLevel(level: RiskLevel): string {
    const map: Record<RiskLevel, string> = {
      'critical': '严重 (Critical)',
      'high': '高危 (High)',
      'medium': '中危 (Medium)',
      'low': '低危 (Low)',
      'info': '信息 (Info)'
    };
    return map[level] || level;
  }
}

import { ProcessResult, PhaseResult, PhaseStep } from '../types/process';

/**
 * 将流程执行结果格式化为可执行的步骤列表
 * @param result 流程执行结果
 * @returns 格式化的步骤报告
 */
export function formatProcessSteps(result: ProcessResult): string {
  const lines: string[] = [];
  
  lines.push(`# 流程执行步骤报告`);
  lines.push(`目标: ${result.context.target}`);
  lines.push(`模板: ${result.templateId}`);
  lines.push('');

  for (const phaseResult of result.phaseResults) {
    const phase = findPhaseById(result.templateId, phaseResult.phaseId);
    if (!phase) continue;

    const statusIcon = phaseResult.status === 'success' ? '[✓]' : phaseResult.status === 'partial' ? '[~]' : '[✗]';
    lines.push(`## ${statusIcon} ${phase.name} (${phaseResult.phaseId})`);
    lines.push(`   状态: ${phaseResult.status} | 耗时: ${phaseResult.duration}ms`);
    lines.push('');

    // 步骤列表
    if (phase.steps) {
      for (const step of phase.steps) {
        const stepResult = phaseResult.toolResults.find(r => r.tool === step.toolCall.tool);
        const stepIcon = stepResult?.success ? '[✓]' : stepResult ? '[✗]' : '[ ]';
        lines.push(`  ${stepIcon} ${step.name}`);
        lines.push(`    工具: ${step.toolCall.tool}`);
        lines.push(`    预期: ${step.expectedOutput}`);
        if (stepResult?.error) {
          lines.push(`    错误: ${stepResult.error}`);
        }
        lines.push('');
      }
    }

    // 该阶段的发现
    if (phaseResult.findings.length > 0) {
      lines.push(`  **发现 (${phaseResult.findings.length}):**`);
      for (const f of phaseResult.findings) {
        lines.push(`    - [${f.severity.toUpperCase()}] ${f.type}: ${f.description}`);
        if (f.cveMatches.length > 0) {
          for (const cve of f.cveMatches) {
            lines.push(`      CVE: ${cve.cveId} (${cve.severity})`);
          }
        }
      }
      lines.push('');
    }
  }

  // 汇总
  lines.push('---');
  lines.push(`**汇总**: ${result.summary.totalFindings} 个发现 (C:${result.summary.criticalCount} H:${result.summary.highCount} M:${result.summary.mediumCount} L:${result.summary.lowCount})`);
  lines.push(`**CVE 引用**: ${result.summary.cveReferences}`);
  lines.push(`**总耗时**: ${result.summary.duration}ms`);

  return lines.join('\n');
}

/**
 * 根据模板 ID 查找阶段定义
 * @param templateId 模板 ID
 * @param phaseId 阶段 ID
 * @returns 阶段定义，未找到时返回 null
 */
function findPhaseById(templateId: string, phaseId: string): { name: string; steps: PhaseStep[] } | null {
  // 从已加载的模板中查找
  // 由于无法直接访问 ProcessEngine，这里返回 null 作为 fallback
  // 实际使用时外部应提供 phase 信息
  return null;
}