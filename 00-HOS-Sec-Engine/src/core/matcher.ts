import { AttackDefenseSkill } from '../types/skill';
import { SkillResult, ExecuteQuery } from '../types/result';
import { SkillScorer } from './scorer';

/**
 * 多维度 Skill 匹配器
 * 管理 Skill 过滤缓存和评分计算。
 * 每个实例拥有独立的 filterCache 和 scorer，避免全局状态共享。
 */
export class SkillMatcher {
  private maxResults: number;
  private minMatchScore: number;
  private filterCache = new Map<string, AttackDefenseSkill[]>();
  private static readonly MAX_FILTER_CACHE_SIZE = 200;
  private filterCacheHits = 0;
  private filterCacheMisses = 0;
  /** 最大评分 Skill 数量，防止恶意大量 Skill 数据导致性能问题 */
  private static readonly MAX_SCORE_SKILLS = 500;
  /** 实例化的评分器，每个匹配器拥有独立的缓存 */
  private scorer: SkillScorer;

  constructor(config: { maxResults?: number; minMatchScore?: number } = {}) {
    this.maxResults = config.maxResults ?? 10;
    this.minMatchScore = config.minMatchScore ?? 0.1;
    this.scorer = new SkillScorer();
  }

  /**
   * 执行匹配
   */
  match(query: ExecuteQuery, skills: AttackDefenseSkill[]): SkillResult[] {
    const cacheKey = this.getFilterCacheKey(query);
    let filteredSkills = this.filterCache.get(cacheKey);

    if (filteredSkills === undefined) {
      this.filterCacheMisses++;
      filteredSkills = this.filterSkills(query, skills);
      this.filterCache.set(cacheKey, filteredSkills);

      // LRU-style eviction
      if (this.filterCache.size > SkillMatcher.MAX_FILTER_CACHE_SIZE) {
        const firstKey = this.filterCache.keys().next().value;
        if (firstKey) {
          this.filterCache.delete(firstKey);
        }
      }
    } else {
      this.filterCacheHits++;
    }

    // 计算匹配分数
    const results: SkillResult[] = [];
    const limit = Math.min(filteredSkills.length, SkillMatcher.MAX_SCORE_SKILLS);
    for (let i = 0; i < limit; i++) {
      const skill = filteredSkills[i];
      const { score, details } = this.scorer.calculate(query.scenario, skill.trigger);
      if (score >= this.minMatchScore) {
        results.push({
          skill,
          matchScore: score,
          matchDetails: details
        });
      }
    }

    if (filteredSkills.length > SkillMatcher.MAX_SCORE_SKILLS) {
      console.warn(`[SkillMatcher] 评分 Skill 数量超出上限 (${SkillMatcher.MAX_SCORE_SKILLS})，仅处理前 ${SkillMatcher.MAX_SCORE_SKILLS} 个`);
    }

    // 按分数降序排序
    results.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      // 分数相同按置信度排序
      return (b.skill.metadata.confidence ?? 0) - (a.skill.metadata.confidence ?? 0);
    });

    // 限制结果数量
    return results.slice(0, this.maxResults);
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
        if (!skill.metadata.tags || !skill.metadata.tags.some(tag => query.tags!.includes(tag))) return false;
      }

      return true;
    });
  }

  /**
   * 生成过滤缓存键
   * 注意: 不包含 scenario 文本，因为过滤仅依赖分类/标签等静态维度，
   * scenario 文本每次查询不同，若包含会导致缓存命中率极低。
   * 文本匹配由 SkillScorer 在评分阶段独立处理。
   */
  private getFilterCacheKey(query: ExecuteQuery): string {
    return JSON.stringify({
      categories: query.categories?.sort(),
      subCategories: query.subCategories?.sort(),
      riskLevels: query.riskLevels?.sort(),
      tags: query.tags?.sort(),
    });
  }

  /**
   * 清除所有缓存（filter + scorer）
   * 当技能列表变更时调用，确保下次匹配使用最新数据
   */
  clearCache(): void {
    this.filterCache.clear();
    this.filterCacheHits = 0;
    this.filterCacheMisses = 0;
    this.scorer.clearCache();
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): { hits: number; misses: number; hitRate: number; scorerStats: object } {
    const total = this.filterCacheHits + this.filterCacheMisses;
    return {
      hits: this.filterCacheHits,
      misses: this.filterCacheMisses,
      hitRate: total === 0 ? 0 : this.filterCacheHits / total,
      scorerStats: this.scorer.getCacheStats(),
    };
  }
}
