import { AttackDefenseSkill, Trigger } from '../types/skill';
import { MatchDetail } from '../types/result';

/**
 * 多维度评分计算
 * 基于 Trigger 层的四个维度综合计算匹配分数
 */
export class SkillScorer {
  /** 场景描述权重 */
  private static readonly SCENARIO_WEIGHT = 0.4;
  /** 关键词权重 */
  private static readonly KEYWORD_WEIGHT = 0.3;
  /** 别名权重 */
  private static readonly ALIAS_WEIGHT = 0.15;
  /** 指标权重 */
  private static readonly INDICATOR_WEIGHT = 0.15;

  /**
   * 计算综合匹配分数
   */
  static calculate(query: string, trigger: Trigger): { score: number; details: MatchDetail } {
    const scenarioScore = this.calculateScenarioScore(query, trigger.scenarios);
    const keywordScore = this.calculateKeywordScore(query, trigger.keywords);
    const aliasScore = this.calculateAliasScore(query, trigger.aliases);
    const indicatorScore = this.calculateIndicatorScore(query, trigger.indicators);

    const matchedKeywords = this.getMatchedItems(query, trigger.keywords);
    const matchedAliases = this.getMatchedItems(query, trigger.aliases);
    const matchedIndicators = this.getMatchedItems(query, trigger.indicators);

    const weightedScore =
      scenarioScore * this.SCENARIO_WEIGHT +
      keywordScore * this.KEYWORD_WEIGHT +
      aliasScore * this.ALIAS_WEIGHT +
      indicatorScore * this.INDICATOR_WEIGHT;

    return {
      score: Math.min(weightedScore, 1),
      details: {
        scenarioScore,
        keywordScore,
        aliasScore,
        indicatorScore,
        matchedKeywords,
        matchedAliases,
        matchedIndicators
      }
    };
  }

  /**
   * 计算场景描述匹配分数
   * 使用 Jaccard 相似度计算输入与每个场景描述的匹配度，取最高值
   */
  private static calculateScenarioScore(query: string, scenarios: string[]): number {
    if (!scenarios || scenarios.length === 0) return 0;

    const queryLower = query.toLowerCase();
    let maxSimilarity = 0;

    for (const scenario of scenarios) {
      const similarity = this.calculateStringSimilarity(queryLower, scenario.toLowerCase());
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
      }
    }

    return maxSimilarity;
  }

  /**
   * 计算关键词匹配分数
   * 匹配到的关键词占总关键词的比例
   */
  private static calculateKeywordScore(query: string, keywords: string[]): number {
    if (!keywords || keywords.length === 0) return 0;

    const queryLower = query.toLowerCase();
    let matchedCount = 0;

    for (const keyword of keywords) {
      if (queryLower.includes(keyword.toLowerCase())) {
        matchedCount++;
      }
    }

    return matchedCount / keywords.length;
  }

  /**
   * 计算别名匹配分数
   */
  private static calculateAliasScore(query: string, aliases: string[]): number {
    if (!aliases || aliases.length === 0) return 0;
    return this.calculateKeywordScore(query, aliases);
  }

  /**
   * 计算指标匹配分数
   */
  private static calculateIndicatorScore(query: string, indicators: string[]): number {
    if (!indicators || indicators.length === 0) return 0;
    return this.calculateKeywordScore(query, indicators);
  }

  /**
   * 获取匹配到的项目
   */
  private static getMatchedItems(query: string, items: string[]): string[] {
    if (!items) return [];
    const queryLower = query.toLowerCase();
    return items.filter(item => queryLower.includes(item.toLowerCase()));
  }

  /**
   * 计算字符串相似度 (Jaccard 相似度)
   */
  private static calculateStringSimilarity(str1: string, str2: string): number {
    const set1 = new Set(str1.split(/\s+/).filter(Boolean));
    const set2 = new Set(str2.split(/\s+/).filter(Boolean));

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return union.size === 0 ? 0 : intersection.size / union.size;
  }
}
