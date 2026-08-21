/**
 * HOS-Sec-Engine V5 - Token Efficiency Analyzer
 *
 * 基于 SEC-bench Pro 的 Token 效率分析实现。
 *
 * SEC-bench Pro §4.3.1 核心发现：
 * - 失败运行平均消耗 3x Token（V8 Claude Code: 55.6M vs 18.8M）
 * - 最高投入的运行几乎从不成功
 * - 长时间探索是失败信号，而非分析的深化
 * - 成功运行集中在低-中 Token 消耗区间
 *
 * 本模块通过追踪每次执行的 Token 消耗和成功率，
 * 提供效率分析和早停建议。
 *
 * @see 可参考思路 技术报告 SEC-bench Pro.txt §4.3.1
 */

// ==================== Types ====================

/**
 * Token 消耗记录
 */
export interface TokenRecord {
  /** 执行 ID */
  executionId: string;
  /** Skill ID */
  skillId: string;
  /** 输入 Token 数 */
  inputTokens: number;
  /** 输出 Token 数 */
  outputTokens: number;
  /** 总 Token 数 */
  totalTokens: number;
  /** 执行耗时 (ms) */
  duration: number;
  /** 执行结果 */
  outcome: 'success' | 'failure';
  /** 阶段标识 */
  phase?: string;
  /** 是否命中缓存 */
  cacheHit?: boolean;
  /** 时间戳 */
  timestamp: string;
}

/**
 * 效率分析结果
 */
export interface EfficiencyReport {
  /** Skill 汇总 */
  skillSummary: Array<{
    skillId: string;
    totalExecutions: number;
    successRate: number;
    avgTokens: number;
    avgDuration: number;
    efficiencyScore: number; // 0-1, 越高越高效
  }>;
  /** 总体统计 */
  overall: {
    totalTokens: number;
    totalExecutions: number;
    successRate: number;
    avgTokensPerExecution: number;
    avgTokensPerSuccess: number;
    avgTokensPerFailure: number;
    tokenWasteRatio: number; // failure_avg / success_avg
    totalDuration: number;
  };
  /** 早停建议 */
  earlyStopSignals: EarlyStopSignal[];
  /** 缓存效率 */
  cacheEfficiency: {
    hitRate: number;
    tokensSaved: number;
  };
}

/**
 * 早停信号
 * 对应 SEC-bench Pro "prolonged exploration = failure signal"
 */
export interface EarlyStopSignal {
  /** 信号类型 */
  type: 'token_threshold' | 'time_threshold' | 'diminishing_returns' | 'zero_crash_pattern';
  /** 严重程度 */
  severity: 'info' | 'warning' | 'critical';
  /** 描述 */
  message: string;
  /** 建议 */
  recommendation: string;
  /** 触发此信号的 execution ID */
  triggeredBy: string;
}

// ==================== TokenEfficiencyAnalyzer ====================

/**
 * Token 效率分析器
 *
 * 核心能力：
 * 1. 记录每次执行的 Token 消耗
 * 2. 按 Skill/Skill 类别统计效率
 * 3. 检测早停信号（如 Token 消耗超过成功平均值 2x）
 * 4. 生成效率报告
 * 5. 检测 "prolonged exploration = failure" 模式
 */
export class TokenEfficiencyAnalyzer {
  private records: TokenRecord[] = [];
  /** 技能成功平均 Token 缓存 */
  private skillSuccessAvg: Map<string, number> = new Map();
  /** 最大记录数 */
  private readonly MAX_RECORDS = 10000;

  /**
   * 记录一次执行
   */
  recordExecution(record: TokenRecord): void {
    this.records.push(record);
    if (this.records.length > this.MAX_RECORDS) {
      this.records.shift();
    }

    // 更新 skill 成功平均 Token 缓存
    if (record.outcome === 'success') {
      const skillRecords = this.records.filter(r => r.skillId === record.skillId && r.outcome === 'success');
      const avg = skillRecords.reduce((sum, r) => sum + r.totalTokens, 0) / skillRecords.length;
      this.skillSuccessAvg.set(record.skillId, avg);
    }
  }

  /**
   * 获取指定 Skill 的历史成功平均 Token 消耗
   */
  getSuccessAvgTokens(skillId: string): number | undefined {
    return this.skillSuccessAvg.get(skillId);
  }

  /**
   * 检测当前执行是否需要早停
   * 基于 SEC-bench Pro "failed runs consistently consume more tokens" 发现
   *
   * @param currentTokens 当前已消耗的 Token 数
   * @param skillId 当前执行的 Skill ID
   * @returns 早停信号列表（空 = 无需早停）
   */
  checkEarlyStop(currentTokens: number, skillId: string): EarlyStopSignal[] {
    const signals: EarlyStopSignal[] = [];
    const successAvg = this.skillSuccessAvg.get(skillId);

    if (successAvg !== undefined) {
      // Token 阈值检查：当前消耗超过成功平均值 2x → 警告
      if (currentTokens > successAvg * 2) {
        signals.push({
          type: 'token_threshold',
          severity: currentTokens > successAvg * 3 ? 'critical' : 'warning',
          message: `当前 Token 消耗 (${currentTokens.toLocaleString()}) 超过 ${skillId} 成功平均消耗 (${successAvg.toLocaleString()}) 的 ${(currentTokens / successAvg).toFixed(1)}x`,
          recommendation: '建议终止当前执行，重新评估策略。SEC-bench Pro 数据表明超过 2x 后成功概率急剧下降。',
          triggeredBy: skillId,
        });
      }
    }

    // 零崩溃模式检测
    const recentRecords = this.records
      .filter(r => r.skillId === skillId)
      .slice(-5);

    if (recentRecords.length >= 3 && recentRecords.every(r => r.outcome === 'failure')) {
      signals.push({
        type: 'zero_crash_pattern',
        severity: 'warning',
        message: `检测到 ${skillId} 连续 ${recentRecords.length} 次失败，可能存在策略问题`,
        recommendation: '建议切换执行策略或检查目标环境配置',
        triggeredBy: skillId,
      });
    }

    return signals;
  }

  /**
   * 生成效率报告
   */
  generateReport(): EfficiencyReport {
    // Skill 级别统计
    const skillMap = new Map<string, TokenRecord[]>();
    for (const record of this.records) {
      const list = skillMap.get(record.skillId) ?? [];
      list.push(record);
      skillMap.set(record.skillId, list);
    }

    const skillSummary = Array.from(skillMap.entries()).map(([skillId, records]) => {
      const successes = records.filter(r => r.outcome === 'success');
      const failures = records.filter(r => r.outcome === 'failure');
      const totalTokens = records.reduce((s, r) => s + r.totalTokens, 0);
      const totalDuration = records.reduce((s, r) => s + r.duration, 0);

      // 效率评分：基于成功率、Token 效率和耗时
      const successRate = records.length === 0 ? 0 : successes.length / records.length;
      const avgTokens = records.length === 0 ? 0 : totalTokens / records.length;
      const avgDuration = records.length === 0 ? 0 : totalDuration / records.length;
      const successAvgTokens = successes.length === 0 ? 0 :
        successes.reduce((s, r) => s + r.totalTokens, 0) / successes.length;
      const failureAvgTokens = failures.length === 0 ? 0 :
        failures.reduce((s, r) => s + r.totalTokens, 0) / failures.length;

      // 效率评分：成功率 * (1 - token_waste_ratio_normalized)
      const tokenWasteRatio = successAvgTokens === 0 ? 1 :
        Math.min(failureAvgTokens / successAvgTokens, 3) / 3;
      const efficiencyScore = successRate * (1 - tokenWasteRatio * 0.5);

      return {
        skillId,
        totalExecutions: records.length,
        successRate: Math.round(successRate * 1000) / 1000,
        avgTokens: Math.round(avgTokens),
        avgDuration: Math.round(avgDuration),
        efficiencyScore: Math.round(efficiencyScore * 1000) / 1000,
      };
    });

    // 总体统计
    const allSuccesses = this.records.filter(r => r.outcome === 'success');
    const allFailures = this.records.filter(r => r.outcome === 'failure');
    const totalTokens = this.records.reduce((s, r) => s + r.totalTokens, 0);
    const totalDuration = this.records.reduce((s, r) => s + r.duration, 0);

    const successAvgTokens = allSuccesses.length === 0 ? 0 :
      allSuccesses.reduce((s, r) => s + r.totalTokens, 0) / allSuccesses.length;
    const failureAvgTokens = allFailures.length === 0 ? 0 :
      allFailures.reduce((s, r) => s + r.totalTokens, 0) / allFailures.length;
    const tokenWasteRatio = successAvgTokens === 0 ? 1 :
      failureAvgTokens / successAvgTokens;

    // 早停信号
    const earlyStopSignals: EarlyStopSignal[] = [];
    for (const [skillId] of skillMap) {
      const lastRecord = this.records.filter(r => r.skillId === skillId).pop();
      if (lastRecord) {
        const signals = this.checkEarlyStop(lastRecord.totalTokens, skillId);
        earlyStopSignals.push(...signals);
      }
    }

    // 缓存效率
    const cacheRecords = this.records.filter(r => r.cacheHit !== undefined);
    const cacheHits = cacheRecords.filter(r => r.cacheHit).length;
    const tokensSaved = cacheRecords
      .filter(r => r.cacheHit)
      .reduce((s, r) => s + r.inputTokens, 0);

    return {
      skillSummary: skillSummary.sort((a, b) => a.efficiencyScore - b.efficiencyScore),
      overall: {
        totalTokens,
        totalExecutions: this.records.length,
        successRate: this.records.length === 0 ? 0 : allSuccesses.length / this.records.length,
        avgTokensPerExecution: this.records.length === 0 ? 0 : Math.round(totalTokens / this.records.length),
        avgTokensPerSuccess: Math.round(successAvgTokens),
        avgTokensPerFailure: Math.round(failureAvgTokens),
        tokenWasteRatio: Math.round(tokenWasteRatio * 100) / 100,
        totalDuration,
      },
      earlyStopSignals,
      cacheEfficiency: {
        hitRate: cacheRecords.length === 0 ? 0 : cacheHits / cacheRecords.length,
        tokensSaved,
      },
    };
  }

  /**
   * 获取 Token 效率分析摘要（文本格式）
   */
  getSummary(): string {
    const report = this.generateReport();
    const lines: string[] = [];

    lines.push('=== Token 效率分析 ===');
    lines.push('');
    lines.push(`总执行次数: ${report.overall.totalExecutions}`);
    lines.push(`成功率: ${(report.overall.successRate * 100).toFixed(1)}%`);
    lines.push(`总 Token 消耗: ${report.overall.totalTokens.toLocaleString()}`);
    lines.push(`平均每执行 Token: ${report.overall.avgTokensPerExecution.toLocaleString()}`);
    lines.push(`成功平均 Token: ${report.overall.avgTokensPerSuccess.toLocaleString()}`);
    lines.push(`失败平均 Token: ${report.overall.avgTokensPerFailure.toLocaleString()}`);
    lines.push(`Token 浪费比 (失败/成功): ${report.overall.tokenWasteRatio.toFixed(2)}x`);
    lines.push(`总耗时: ${(report.overall.totalDuration / 1000 / 60).toFixed(1)} 分钟`);
    lines.push('');

    if (report.earlyStopSignals.length > 0) {
      lines.push('--- 早停信号 ---');
      for (const signal of report.earlyStopSignals) {
        const icon = signal.severity === 'critical' ? '🔴' : signal.severity === 'warning' ? '🟡' : '🔵';
        lines.push(`  ${icon} [${signal.type}] ${signal.message}`);
        lines.push(`    建议: ${signal.recommendation}`);
      }
      lines.push('');
    }

    lines.push('--- Skill 效率评分 (效率最低的 5 个) ---');
    for (const s of report.skillSummary.slice(0, 5)) {
      lines.push(`  ${s.skillId.padEnd(25)} score=${s.efficiencyScore.toFixed(3)} rate=${(s.successRate * 100).toFixed(0)}% avg=${s.avgTokens.toLocaleString()} tok`);
    }

    lines.push('');
    lines.push(`缓存命中率: ${(report.cacheEfficiency.hitRate * 100).toFixed(1)}%`);
    lines.push(`缓存节省 Token: ${report.cacheEfficiency.tokensSaved.toLocaleString()}`);

    return lines.join('\n');
  }

  /**
   * 重置所有记录
   */
  reset(): void {
    this.records = [];
    this.skillSuccessAvg.clear();
  }
}

/** 全局单例 */
export const tokenAnalyzer = new TokenEfficiencyAnalyzer();
