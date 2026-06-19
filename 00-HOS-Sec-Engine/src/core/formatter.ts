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

    const output: string[] = [];
    output.push('='.repeat(60));
    output.push('  HOS-Sec-Engine V2 - Skill 匹配结果');
    output.push(`  共找到 ${results.length} 条匹配 Skill`);
    output.push('='.repeat(60));

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const skill = result.skill;
      const meta = skill.metadata;

      output.push('');
      output.push(`[${i + 1}] ${meta.name}`);
      output.push('-'.repeat(40));
      output.push(`  ID: ${meta.id}`);
      output.push(`  分类: ${meta.category}/${meta.subCategory}`);
      output.push(`  风险等级: ${this.formatRiskLevel(meta.riskLevel)}`);
      output.push(`  匹配分数: ${(result.matchScore * 100).toFixed(1)}%`);
      output.push(`  置信度: ${(meta.confidence * 100).toFixed(0)}%`);

      if (result.matchDetails.matchedKeywords.length > 0) {
        output.push(`  匹配关键词: ${result.matchDetails.matchedKeywords.join(', ')}`);
      }

      // Knowledge 层
      output.push('');
      output.push(`  知识:`);
      output.push(`    ${skill.knowledge.description}`);
      if (skill.knowledge.symptoms.length > 0) {
        output.push(`    症状: ${skill.knowledge.symptoms.join(', ')}`);
      }
      if (skill.knowledge.rootCauses.length > 0) {
        output.push(`    根因: ${skill.knowledge.rootCauses.join(', ')}`);
      }
      if (skill.knowledge.commonMistakes.length > 0) {
        output.push(`    常见错误: ${skill.knowledge.commonMistakes.join(', ')}`);
      }

      // Action 层
      output.push('');
      output.push(`  操作清单:`);
      for (const item of skill.action.checklist) {
        output.push(`    - [ ] ${item}`);
      }

      output.push('');
      output.push(`  技术手段:`);
      for (const technique of skill.action.techniques) {
        output.push(`    - ${technique}`);
      }

      if (skill.action.examples.length > 0) {
        output.push('');
        output.push(`  示例:`);
        for (const example of skill.action.examples) {
          output.push(`    - [${example.name}] ${example.content}`);
          if (example.description) {
            output.push(`      说明: ${example.description}`);
          }
        }
      }

      // Validation 层
      if (skill.validation.successSigns.length > 0) {
        output.push('');
        output.push(`  成功标志: ${skill.validation.successSigns.join(', ')}`);
      }
      if (skill.validation.falsePositiveSigns.length > 0) {
        output.push(`  误报标志: ${skill.validation.falsePositiveSigns.join(', ')}`);
      }

      // Defense 层
      if (skill.defense.recommendations.length > 0) {
        output.push('');
        output.push(`  防御建议:`);
        for (const rec of skill.defense.recommendations) {
          output.push(`    - ${rec}`);
        }
      }

      if (skill.defense.references.length > 0) {
        output.push('');
        output.push(`  参考链接:`);
        for (const ref of skill.defense.references) {
          output.push(`    - ${ref}`);
        }
      }

      // 质量信息
      if (skill.quality) {
        output.push('');
        output.push(`  质量: confidence=${skill.quality.confidence}, reviewed=${skill.quality.reviewed}, tested=${skill.quality.tested}`);
      }

      output.push('');
      output.push('='.repeat(60));
    }

    return output.join('\n');
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
      validation: r.skill.validation,
      defense: r.skill.defense,
      quality: r.skill.quality
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
