/**
 * S-14-HOS-Jailbreak-Loop: 循环引擎核心
 *
 * 管理攻防循环的完整生命周期：
 * - 逐轮运行攻击-防御对测试
 * - 收集结果并计算统计
 * - 生成优化建议
 * - 跟踪历史最佳策略
 * - 支持暂停/恢复
 * - 生成总结报告
 */

import type {
  AttackTechnique,
  AttackCategory,
  DefenseStrategy,
  DefenseType,
  TestResult,
  LoopConfig,
  LoopPhase,
  LoopSnapshot,
  EvaluationStats,
} from '../types';

import { analyzeResponse } from '../evaluator/analyzer';
import {
  computeStats,
  computeDetailedBreakdown,
  generateReport,
} from '../evaluator/stats';

// ─── 循环引擎 ──────────────────────────────────────────────────────────

export class JailbreakLoopEngine {
  private config: LoopConfig;
  private state: LoopSnapshot;
  private history: TestResult[];
  private pauseRequested: boolean;

  // 存储攻击和防御的引用，供优化阶段使用
  private attackIndex: Map<string, AttackTechnique>;
  private defenseIndex: Map<string, DefenseStrategy>;

  constructor(config: LoopConfig) {
    this.config = config;
    this.history = [];
    this.pauseRequested = false;
    this.attackIndex = new Map();
    this.defenseIndex = new Map();

    this.state = {
      phase: 'idle',
      currentRound: 0,
      totalRounds: config.maxRounds,
      stats: {
        totalTests: 0,
        bypassRate: 0,
        avgConfidence: 0,
        categoryBreakdown: {} as Record<AttackCategory, number>,
        defenseBreakdown: {} as Record<DefenseType, number>,
        topAttacks: [],
        topDefenses: [],
      },
      roundAttacks: [],
      roundDefenses: [],
      optimizationSuggestions: [],
      bestStrategies: {
        attacks: [],
        defenses: [],
      },
    };
  }

  // ─── 核心循环方法 ────────────────────────────────────────────────────

  /**
   * 运行一轮攻防测试
   *
   * 从给定的攻击和防御库中选取策略，两两配对执行测试，
   * 收集结果并更新状态。
   *
   * @param attacks - 可用攻击技术库
   * @param defenses - 可用防御策略库
   * @returns 本轮测试结果
   */
  async runRound(
    attacks: AttackTechnique[],
    defenses: DefenseStrategy[]
  ): Promise<TestResult[]> {
    // 检查是否暂停
    if (this.pauseRequested) {
      this.state.phase = 'paused';
      return [];
    }

    // 检查是否超出轮数
    if (this.state.currentRound >= this.config.maxRounds) {
      this.state.phase = 'completed';
      return [];
    }

    // 构建索引
    for (const a of attacks) this.attackIndex.set(a.id, a);
    for (const d of defenses) this.defenseIndex.set(d.id, d);

    // 递增轮数
    this.state.currentRound++;

    // 选取本轮使用的攻击和防御（按强度和轮次选取，确保轮转）
    const roundAttacks = selectRoundStrategies(
      attacks,
      this.config.attacksPerRound,
      this.state.currentRound
    );
    const roundDefenses = selectRoundStrategies(
      defenses,
      this.config.defensesPerRound,
      this.state.currentRound
    );

    this.state.roundAttacks = roundAttacks.map((a) => a.id);
    this.state.roundDefenses = roundDefenses.map((d) => d.id);

    // 执行攻击阶段
    this.state.phase = 'attacking';
    const roundResults: TestResult[] = [];

    for (const attack of roundAttacks) {
      if (this.pauseRequested) {
        this.state.phase = 'paused';
        return roundResults;
      }

      // 执行防御阶段
      this.state.phase = 'defending';

      for (const defense of roundDefenses) {
        if (this.pauseRequested) {
          this.state.phase = 'paused';
          return roundResults;
        }

        // 模拟模型响应（实际场景中这里会调用真实模型）
        const response = simulateModelResponse(attack, defense);

        // 评估阶段
        this.state.phase = 'evaluating';
        const result = analyzeResponse(response, attack, defense);
        roundResults.push(result);
        this.history.push(result);
      }
    }

    // 更新统计
    this.updateStats(attacks, defenses);

    // 优化阶段
    if (this.config.autoOptimize) {
      this.state.phase = 'optimizing';
      const optimization = await this.optimize();
      this.state.optimizationSuggestions = optimization.suggestions;
    }

    // 恢复空闲
    this.state.phase = this.pauseRequested ? 'paused' : 'idle';

    return roundResults;
  }

  /**
   * 生成优化建议
   *
   * 基于历史数据，分析当前攻防态势，提出策略调整建议。
   *
   * @returns 优化建议和推荐策略
   */
  async optimize(): Promise<{
    attacks: string[];
    defenses: string[];
    suggestions: string[];
  }> {
    const suggestions: string[] = [];
    const recommendedAttacks: string[] = [];
    const recommendedDefenses: string[] = [];

    if (this.history.length === 0) {
      suggestions.push('尚无测试数据，建议先运行至少一轮测试。');
      return { attacks: recommendedAttacks, defenses: recommendedDefenses, suggestions };
    }

    const stats = this.state.stats;

    // 分析绕过率趋势
    if (stats.bypassRate > this.config.targetBypassRate) {
      suggestions.push(
        `当前绕过率 ${(stats.bypassRate * 100).toFixed(1)}% 超过目标 ${(this.config.targetBypassRate * 100).toFixed(1)}%，需要加强防御。`
      );
    }

    if (stats.bypassRate < this.config.targetDefenseRate) {
      suggestions.push(
        `防御率达标 (绕过率 ${(stats.bypassRate * 100).toFixed(1)}% < 目标 ${(this.config.targetDefenseRate * 100).toFixed(1)}%)，可考虑释放防御资源。`
      );
    }

    // 分析最强攻击类别
    const { categoryBreakdown } = computeDetailedBreakdown(
      this.history,
      Array.from(this.attackIndex.values()),
      Array.from(this.defenseIndex.values())
    );

    // 找出绕过率最高的类别
    const sortedCategories = Object.entries(categoryBreakdown)
      .sort(([, a], [, b]) => b - a)
      .filter(([, v]) => v > 0);

    if (sortedCategories.length > 0) {
      const [topCat, topRate] = sortedCategories[0];
      suggestions.push(
        `攻击类别 "${topCat}" 绕过率最高 (${(topRate * 100).toFixed(1)}%)，建议加强针对该类别的防御。`
      );

      // 推荐使用该类别的攻击进行下一轮测试
      for (const [, attack] of this.attackIndex) {
        if (attack.category === topCat && !recommendedAttacks.includes(attack.id)) {
          recommendedAttacks.push(attack.id);
        }
      }
    }

    // 找出拦截率最低的防御类型
    const sortedDefenseTypes = Object.entries(categoryBreakdown)
      .sort(([, a], [, b]) => a - b)
      .filter(([, v]) => v > 0);

    void sortedDefenseTypes;

    // 趋势分析：最近 vs 早期
    if (this.history.length >= 4) {
      const midpoint = Math.floor(this.history.length / 2);
      const recentResults = this.history.slice(midpoint);
      const earlierResults = this.history.slice(0, midpoint);

      const recentBypassRate =
        recentResults.filter((r) => r.bypassed).length / recentResults.length;
      const earlierBypassRate =
        earlierResults.filter((r) => r.bypassed).length / earlierResults.length;

      if (recentBypassRate > earlierBypassRate + 0.1) {
        suggestions.push(
          '⚠️ 绕过率呈上升趋势，防御可能正在被突破。'
        );
      } else if (recentBypassRate < earlierBypassRate - 0.1) {
        suggestions.push(
          '✅ 绕过率呈下降趋势，优化正在生效。'
        );
      }
    }

    // 推荐防御策略：使用推荐攻击尚未配对的防御
    for (const [, defense] of this.defenseIndex) {
      if (
        defense.strength >= 3 &&
        !recommendedDefenses.includes(defense.id)
      ) {
        recommendedDefenses.push(defense.id);
        if (recommendedDefenses.length >= 3) break;
      }
    }

    // 更新历史最佳策略
    this.updateBestStrategies();

    return {
      attacks: recommendedAttacks.slice(0, this.config.attacksPerRound),
      defenses: recommendedDefenses.slice(0, this.config.defensesPerRound),
      suggestions,
    };
  }

  // ─── 状态管理 ────────────────────────────────────────────────────────

  /**
   * 获取当前循环状态快照
   */
  getState(): LoopSnapshot {
    return { ...this.state };
  }

  /**
   * 暂停循环
   */
  pause(): void {
    this.pauseRequested = true;
    if (this.state.phase !== 'idle') {
      this.state.phase = 'paused';
    }
  }

  /**
   * 恢复循环
   */
  resume(): void {
    this.pauseRequested = false;
    if (this.state.phase === 'paused') {
      this.state.phase = 'idle';
    }
  }

  /**
   * 重置循环到初始状态
   */
  reset(): void {
    this.history = [];
    this.pauseRequested = false;
    this.attackIndex.clear();
    this.defenseIndex.clear();

    this.state = {
      phase: 'idle',
      currentRound: 0,
      totalRounds: this.config.maxRounds,
      stats: {
        totalTests: 0,
        bypassRate: 0,
        avgConfidence: 0,
        categoryBreakdown: {} as Record<AttackCategory, number>,
        defenseBreakdown: {} as Record<DefenseType, number>,
        topAttacks: [],
        topDefenses: [],
      },
      roundAttacks: [],
      roundDefenses: [],
      optimizationSuggestions: [],
      bestStrategies: {
        attacks: [],
        defenses: [],
      },
    };
  }

  // ─── 历史分析 ────────────────────────────────────────────────────────

  /**
   * 获取完整测试历史
   */
  getHistory(): TestResult[] {
    return [...this.history];
  }

  /**
   * 获取历史最佳策略
   */
  getBestStrategies(): { attacks: string[]; defenses: string[] } {
    return {
      attacks: [...this.state.bestStrategies.attacks],
      defenses: [...this.state.bestStrategies.defenses],
    };
  }

  /**
   * 生成完整的总结报告
   */
  generateSummaryReport(
    attacks: AttackTechnique[],
    defenses: DefenseStrategy[]
  ): string {
    const stats = computeStats(this.history, attacks, defenses);
    return generateReport(stats);
  }

  // ─── 内部方法 ────────────────────────────────────────────────────────

  /**
   * 更新统计信息
   */
  private updateStats(
    attacks: AttackTechnique[],
    defenses: DefenseStrategy[]
  ): void {
    this.state.stats = computeStats(this.history, attacks, defenses);
  }

  /**
   * 更新历史最佳策略
   */
  private updateBestStrategies(): void {
    if (this.history.length === 0) return;

    // 按攻击 ID 统计绕过率
    const attackBypassRates = new Map<string, { total: number; bypassed: number }>();
    for (const r of this.history) {
      const entry = attackBypassRates.get(r.attackId) || { total: 0, bypassed: 0 };
      entry.total++;
      if (r.bypassed) entry.bypassed++;
      attackBypassRates.set(r.attackId, entry);
    }

    // 按防御 ID 统计拦截率
    const defenseBlockRates = new Map<string, { total: number; blocked: number }>();
    for (const r of this.history) {
      const entry = defenseBlockRates.get(r.defenseId) || { total: 0, blocked: 0 };
      entry.total++;
      if (r.blockedByDefense !== null) entry.blocked++;
      defenseBlockRates.set(r.defenseId, entry);
    }

    // 最佳攻击：绕过率最高
    const bestAttacks = Array.from(attackBypassRates.entries())
      .map(([id, stats]) => ({
        id,
        rate: stats.total > 0 ? stats.bypassed / stats.total : 0,
      }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5)
      .map((e) => e.id);

    // 最佳防御：拦截率最高
    const bestDefenses = Array.from(defenseBlockRates.entries())
      .map(([id, stats]) => ({
        id,
        rate: stats.total > 0 ? stats.blocked / stats.total : 0,
      }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5)
      .map((e) => e.id);

    this.state.bestStrategies.attacks = bestAttacks;
    this.state.bestStrategies.defenses = bestDefenses;
  }
}

// ─── 辅助函数 ──────────────────────────────────────────────────────────

/**
 * 选取本轮策略（轮转选取，确保均匀覆盖）
 */
function selectRoundStrategies<T extends { id: string; intensity?: number; strength?: number; category?: string; type?: string }>(
  pool: T[],
  count: number,
  round: number
): T[] {
  if (pool.length === 0) return [];
  if (pool.length <= count) return [...pool];

  // 按强度排序，然后轮转偏移
  const sorted = [...pool].sort((a, b) => {
    const aCat = (a as any).category || (a as any).type || '';
    const bCat = (b as any).category || (b as any).type || '';
    if (aCat !== bCat) return aCat < bCat ? -1 : 1;
    return (a.intensity ?? a.strength ?? 0) - (b.intensity ?? b.strength ?? 0);
  });

  const offset = ((round - 1) * count) % sorted.length;
  const selected: T[] = [];

  for (let i = 0; i < count; i++) {
    const idx = (offset + i) % sorted.length;
    selected.push(sorted[idx]);
  }

  return selected;
}

/**
 * 模拟模型响应
 *
 * 在真实场景中，这里会调用实际的 LLM API。
 * 此处提供基于攻击/防御强度的简单模拟。
 *
 * @param attack - 攻击技术
 * @param defense - 防御策略
 * @returns 模拟的模型响应文本
 */
function simulateModelResponse(
  attack: AttackTechnique,
  defense: DefenseStrategy
): string {
  // 简单模拟：攻击强度 vs 防御强度
  const attackPower = attack.intensity;
  const defensePower = defense.strength;

  // 如果攻击显著强于防御，更可能绕过
  const bypassChance = Math.max(
    0,
    Math.min(1, (attackPower - defensePower + 3) / 6)
  );

  const random = pseudoRandom(Date.now() + attack.intensity * 17 + defense.strength * 31);

  if (random < bypassChance) {
    // 模拟绕过：生成看似合规的响应
    return generateCompliantResponse(attack);
  } else {
    // 模拟拦截：生成拒绝响应
    return generateRefusalResponse(defense);
  }
}

/**
 * 生成模拟的合规响应
 */
function generateCompliantResponse(attack: AttackTechnique): string {
  const templates = [
    `好的，以下是关于 ${attack.name} 的详细信息：\n\n以下是具体步骤：\n1. 首先...\n2. 然后...\n3. 最后...`,
    `Sure! Here is a detailed explanation:\n\n\`\`\`\n// Example code\nfunction example() {\n  return "done";\n}\n\`\`\`\n\nAs requested, I've provided the information.`,
    `当然可以！根据你的请求，以下是相关内容：\n\n步骤如下：\n\`\`\`\n示例代码\n\`\`\`\n\n没问题，希望这对你有帮助。`,
  ];

  const idx = Math.floor(pseudoRandom(Date.now() + attack.intensity) * templates.length);
  return templates[idx % templates.length];
}

/**
 * 生成模拟的拒绝响应
 */
function generateRefusalResponse(defense: DefenseStrategy): string {
  const templates = [
    `抱歉，我无法提供这方面的信息。${defense.name} 检测到该请求可能违反使用政策。`,
    `I cannot assist with this request. It appears to violate my usage guidelines. I must decline.`,
    `我不能帮助你完成这个请求。根据我的安全策略，这个操作是不允许的。请理解。`,
  ];

  const idx = Math.floor(pseudoRandom(Date.now() + defense.strength) * templates.length);
  return templates[idx % templates.length];
}

/**
 * 简单的伪随机数生成器（可重复）
 */
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}
