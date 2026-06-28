import { Trigger } from '../types/skill';
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
  /** 相似度计算缓存最大条目数 */
  private static readonly MAX_SIMILARITY_CACHE_SIZE = 500;
  /** 缓存: "sortedQueryTokens|scenario" -> 相似度结果 */
  private static similarityCache = new Map<string, number>();
  /** 预分词 Scenario 缓存: scenario文本 -> 分词后的 Set，避免反复 split */
  private static scenarioTokenCache = new Map<string, Set<string>>();
  /** 最大 Scenario Token 缓存数 */
  private static readonly MAX_SCENARIO_TOKEN_CACHE = 200;
  /** 缓存命中计数器 */
  private static cacheHits = 0;
  /** 缓存未命中计数器 */
  private static cacheMisses = 0;
  /** 最大 scenarios 遍历数量，防止恶意 trigger 数据导致性能问题 */
  private static readonly MAX_SCENARIOS = 100;

  /**
   * 计算综合匹配分数
   */
  static calculate(query: string, trigger: Trigger): { score: number; details: MatchDetail } {
    if (!query?.trim() || !trigger) {
      return { score: 0, details: this.createEmptyDetails() };
    }

    const queryLower = query.toLowerCase();
    const queryTokens = new Set(queryLower.split(/\s+/).filter(Boolean));

    const scenarioScore = this.calculateScenarioScore(queryTokens, trigger.scenarios);

    const { score: keywordScore, matched: matchedKeywords } = this.calculateKeywordScoreWithItems(queryLower, trigger.keywords);
    const { score: aliasScore, matched: matchedAliases } = this.calculateKeywordScoreWithItems(queryLower, trigger.aliases);
    const { score: indicatorScore, matched: matchedIndicators } = this.calculateKeywordScoreWithItems(queryLower, trigger.indicators);

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
  private static calculateScenarioScore(queryTokens: Set<string>, scenarios: string[]): number {
    if (!scenarios || scenarios.length === 0) return 0;

    let maxSimilarity = 0;
    const limit = Math.min(scenarios.length, this.MAX_SCENARIOS);

    for (let i = 0; i < limit; i++) {
      const scenario = scenarios[i];
      const similarity = this.calculateStringSimilarity(queryTokens, scenario.toLowerCase());
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
      }
    }

    if (scenarios.length > this.MAX_SCENARIOS) {
      console.warn(`[SkillScorer] Scenarios 数量超出上限 (${this.MAX_SCENARIOS})，仅处理前 ${this.MAX_SCENARIOS} 个`);
    }

    return maxSimilarity;
  }

  /**
   * 计算匹配分数并返回匹配项（单次遍历）
   */
  private static calculateKeywordScoreWithItems(queryLower: string, items: string[]): { score: number; matched: string[] } {
    if (!items || items.length === 0) return { score: 0, matched: [] };

    const matched: string[] = [];
    let matchedCount = 0;

    for (const item of items) {
      if (queryLower.includes(item.toLowerCase())) {
        matchedCount++;
        matched.push(item);
      }
    }

    return { score: matchedCount / items.length, matched };
  }

  /**
   * 计算缓存键：将 Set 排序后与 scenario 拼接
   */
  private static getSimilarityCacheKey(queryTokens: Set<string>, scenario: string): string {
    const sorted = [...queryTokens].sort().join(',');
    return `${sorted}|${scenario}`;
  }

  /**
   * 计算字符串相似度 (Jaccard 相似度)
   */
  private static calculateStringSimilarity(queryTokens: Set<string>, scenario: string): number {
    const key = this.getSimilarityCacheKey(queryTokens, scenario);

    const cached = this.similarityCache.get(key);
    if (cached !== undefined) {
      this.cacheHits++;
      return cached;
    }

    this.cacheMisses++;
    const result = this.computeStringSimilarity(queryTokens, scenario);
    this.similarityCache.set(key, result);

    // LRU-style eviction: remove the oldest entry when cache exceeds limit
    if (this.similarityCache.size > this.MAX_SIMILARITY_CACHE_SIZE) {
      const firstKey = this.similarityCache.keys().next().value;
      if (firstKey) {
        this.similarityCache.delete(firstKey);
      }
    }

    return result;
  }

  /**
   * 获取缓存统计信息
   */
  static getCacheStats(): { hits: number; misses: number; hitRate: number } {
    const total = this.cacheHits + this.cacheMisses;
    return {
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate: total === 0 ? 0 : this.cacheHits / total,
    };
  }

  /**
   * 重置缓存统计
   */
  static resetCacheStats(): void {
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  /**
   * 获取或预计算 scenario 的分词结果（缓存避免重复 split）
   */
  private static getScenarioTokens(scenario: string): Set<string> {
    const cached = this.scenarioTokenCache.get(scenario);
    if (cached) return cached;

    const tokens = new Set(scenario.split(/\s+/).filter(Boolean));
    if (this.scenarioTokenCache.size >= this.MAX_SCENARIO_TOKEN_CACHE) {
      const firstKey = this.scenarioTokenCache.keys().next().value;
      if (firstKey) this.scenarioTokenCache.delete(firstKey);
    }
    this.scenarioTokenCache.set(scenario, tokens);
    return tokens;
  }

  /**
   * 实际计算 Jaccard 相似度 (无缓存)
   */
  private static computeStringSimilarity(queryTokens: Set<string>, scenario: string): number {
    const set2 = this.getScenarioTokens(scenario);

    // 预分配大小优化：选择较小的 Set 作为迭代基准
    const [smaller, larger] = queryTokens.size <= set2.size
      ? [queryTokens, set2] : [set2, queryTokens];

    let intersectionSize = 0;
    for (const token of smaller) {
      if (larger.has(token)) intersectionSize++;
    }

    const unionSize = queryTokens.size + set2.size - intersectionSize;
    return unionSize === 0 ? 0 : intersectionSize / unionSize;
  }

  /**
   * 创建空的匹配详情
   */
  private static createEmptyDetails(): MatchDetail {
    return {
      scenarioScore: 0,
      keywordScore: 0,
      aliasScore: 0,
      indicatorScore: 0,
      matchedKeywords: [],
      matchedAliases: [],
      matchedIndicators: []
    };
  }
}
