import { AttackDefenseSkill, RiskLevel } from '../types/skill';

const VALID_RISK_LEVELS: RiskLevel[] = ['critical', 'high', 'medium', 'low', 'info'];

/**
 * Skill 验证器
 */
export class SkillValidator {
  /**
   * 验证单个 Skill 的完整性
   */
  static validate(skill: AttackDefenseSkill): string[] {
    const errors: string[] = [];

    // 验证 metadata - 缺失时直接返回，避免产生大量噪音错误
    if (!skill.metadata) {
      errors.push('metadata 不能为空');
      return errors;
    }

    const skillId = skill.metadata.id || 'unknown';

    if (!skill.metadata.id || skill.metadata.id.trim() === '') {
      errors.push(`Skill [${skillId}] metadata.id 不能为空`);
    }
    if (!skill.metadata.name || skill.metadata.name.trim() === '') {
      errors.push(`Skill [${skillId}] metadata.name 不能为空`);
    }
    if (!skill.metadata.category || skill.metadata.category.trim() === '') {
      errors.push(`Skill [${skillId}] metadata.category 不能为空`);
    }
    if (!skill.metadata.subCategory || skill.metadata.subCategory.trim() === '') {
      errors.push(`Skill [${skillId}] metadata.subCategory 不能为空`);
    }
    if (!skill.metadata.riskLevel || !VALID_RISK_LEVELS.includes(skill.metadata.riskLevel)) {
      errors.push(`Skill [${skillId}] metadata.riskLevel 无效`);
    }
    if (skill.metadata.confidence === undefined || skill.metadata.confidence < 0 || skill.metadata.confidence > 1) {
      errors.push(`Skill [${skillId}] metadata.confidence 必须在 0-1 之间`);
    }
    if (!skill.metadata.updatedAt || skill.metadata.updatedAt.trim() === '') {
      errors.push(`Skill [${skillId}] metadata.updatedAt 不能为空`);
    }
    if (!skill.metadata.tags || !Array.isArray(skill.metadata.tags)) {
      errors.push(`Skill [${skillId}] metadata.tags 必须为数组`);
    }

    // 验证 trigger
    if (!skill.trigger) {
      errors.push(`Skill [${skillId}] trigger 不能为空`);
    } else {
      if (!skill.trigger.scenarios || skill.trigger.scenarios.length === 0) {
        errors.push(`Skill [${skillId}] trigger.scenarios 不能为空`);
      }
      if (!skill.trigger.keywords || skill.trigger.keywords.length === 0) {
        errors.push(`Skill [${skillId}] trigger.keywords 不能为空`);
      }
    }

    // 验证 knowledge
    if (!skill.knowledge) {
      errors.push(`Skill [${skillId}] knowledge 不能为空`);
    } else {
      if (!skill.knowledge.description || skill.knowledge.description.trim() === '') {
        errors.push(`Skill [${skillId}] knowledge.description 不能为空`);
      }
    }

    // 验证 action
    if (!skill.action) {
      errors.push(`Skill [${skillId}] action 不能为空`);
    } else {
      if (!skill.action.checklist || skill.action.checklist.length === 0) {
        errors.push(`Skill [${skillId}] action.checklist 不能为空`);
      }
      if (!skill.action.techniques || skill.action.techniques.length === 0) {
        errors.push(`Skill [${skillId}] action.techniques 不能为空`);
      }
    }

    // 验证 validation
    if (!skill.validation) {
      errors.push(`Skill [${skillId}] validation 不能为空`);
    }

    // 验证 defense
    if (!skill.defense) {
      errors.push(`Skill [${skillId}] defense 不能为空`);
    }

    return errors;
  }

  /**
   * 批量验证 Skill
   */
  static validateBatch(skills: AttackDefenseSkill[]): Map<string, string[]> {
    const results = new Map<string, string[]>();

    if (skills.length === 0) {
      return results;
    }

    for (let i = 0; i < skills.length; i++) {
      const skill = skills[i];
      const errors = this.validate(skill);
      if (errors.length > 0) {
        const skillId = skill?.metadata?.id || `skill[${i}]`;
        results.set(skillId, errors);
      }
    }

    return results;
  }
}
