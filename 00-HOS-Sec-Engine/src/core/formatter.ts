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
      const skill = result.skill;
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

      const checklistLines = (skill.action?.checklist ?? [])
        .map(item => `    - [ ] ${item}`)
        .join('\n');

      const techniquesLines = (skill.action?.techniques ?? [])
        .map(technique => `    - ${technique}`)
        .join('\n');

      const examplesLines = (skill.action.examples ?? [])
        .map(example => `    - [${example.name}] ${example.content}${example.description ? `\n      说明: ${example.description}` : ''}`)
        .join('\n');

      const successSignsLine = skill.validation?.successSigns?.length
        ? `  成功标志: ${skill.validation.successSigns.join(', ')}`
        : '';
      const falsePositiveLine = skill.validation?.falsePositiveSigns?.length
        ? `  误报标志: ${skill.validation.falsePositiveSigns.join(', ')}`
        : '';

      const recommendationsLines = (skill.defense?.recommendations ?? [])
        .map(rec => `    - ${rec}`)
        .join('\n');
      const referencesLines = (skill.defense?.references ?? [])
        .map(ref => `    - ${ref}`)
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
      metadata: r.skill.metadata,
      matchScore: r.matchScore,
      matchDetails: r.matchDetails,
      knowledge: r.skill.knowledge,
      action: r.skill.action,
      validation: r.skill.validation || null,
      defense: r.skill.defense || null,
      quality: r.skill.quality || null
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
