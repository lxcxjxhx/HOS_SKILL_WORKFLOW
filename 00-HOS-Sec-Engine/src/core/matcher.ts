import { AttackDefenseSkill } from '../types/skill';
import { SkillResult, ExecuteQuery, EngineConfig } from '../types/result';
import { SkillScorer } from './scorer';

const DEFAULT_CONFIG: Required<EngineConfig> = {
  strictMode: true,
  maxResults: 10,
  minMatchScore: 0.1,
  customSkillsDir: '',
  loadPresetSkills: true
};

/**
 * 多维度 Skill 匹配器
 */
export class SkillMatcher {
  private config: Required<EngineConfig>;

  constructor(config: EngineConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 执行匹配
   */
  match(query: ExecuteQuery, skills: AttackDefenseSkill[]): SkillResult[] {
    // 过滤
    let filteredSkills = this.filterSkills(query, skills);

    // 计算匹配分数
    const results: SkillResult[] = [];

    for (const skill of filteredSkills) {
      const { score, details } = SkillScorer.calculate(query.scenario, skill.trigger);
      if (score >= this.config.minMatchScore) {
        results.push({
          skill,
          matchScore: score,
          matchDetails: details
        });
      }
    }

    // 按分数降序排序
    results.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      // 分数相同按置信度排序
      return (b.skill.metadata.confidence || 0) - (a.skill.metadata.confidence || 0);
    });

    // 限制结果数量
    return results.slice(0, this.config.maxResults);
  }

  /**
   * 过滤 Skill
   */
  private filterSkills(query: ExecuteQuery, skills: AttackDefenseSkill[]): AttackDefenseSkill[] {
    return skills.filter(skill => {
      // 只匹配启用的 Skill
      if (skill.enabled === false) return false;

      // 按分类过滤
      if (query.categories && query.categories.length > 0) {
        if (!query.categories.includes(skill.metadata.category)) return false;
      }

      // 按子分类过滤
      if (query.subCategories && query.subCategories.length > 0) {
        if (!query.subCategories.includes(skill.metadata.subCategory)) return false;
      }

      // 按风险等级过滤
      if (query.riskLevels && query.riskLevels.length > 0) {
        if (!query.riskLevels.includes(skill.metadata.riskLevel)) return false;
      }

      // 按标签过滤
      if (query.tags && query.tags.length > 0) {
        if (!skill.metadata.tags || !query.tags.some(tag => skill.metadata.tags?.includes(tag))) return false;
      }

      return true;
    });
  }
}
