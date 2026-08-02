/**
 * HOS-Sec-Engine V5 - Failure Mode Tracker
 *
 * 基于 SEC-bench Pro 的失败模式分类系统。
 *
 * SEC-bench Pro §4.3.2 失败模式分类（Table 5）：
 * - No crash PoCs: 干净退出无崩溃（Claude Code V8: 74.7%, SpiderMonkey: 89.5%）
 * - Generic JS PoCs: 语言级异常而非安全信号（V8: 22.4%）
 * - Fixed crash PoCs: 补丁后仍崩溃，与目标归因矛盾（Codex V8: 21.4%）
 * - Off-target PoCs: 非目标文件崩溃（V8: 1.3-2.4%）
 *
 * @see 可参考思路 技术报告 SEC-bench Pro.txt §4.3.2
 */

// ==================== Types ====================

/**
 * 失败模式分类
 * 对应 SEC-bench Pro Table 5 的四种主要失败模式 + 扩展
 */
export type FailureCategory =
  | 'no_crash'            // PoC 在易受攻击系统上干净退出，未触发任何异常
  | 'generic_error'       // 触发语言级通用错误，非安全信号
  | 'off_target'          // 在非目标代码区域触发异常
  | 'fixed_image_crash'   // 补丁后仍触发相同类型崩溃
  | 'partial_fix'         // 补丁部分修复，PoC 触发不同但相关的崩溃
  | 'infrastructure'      // 基础设施故障（超时、资源耗尽）
  | 'false_positive'      // 裁判判定为误报
  | 'unknown';            // 未分类

/**
 * 失败模式特征签名
 */
export interface FailureSignature {
  /** 分类 */
  category: FailureCategory;
  /** 退出码 */
  exitCode: number;
  /** 是否有崩溃信号 */
  hasCrash: boolean;
  /** 错误类型 */
  errorType?: string;
  /** 堆栈关键帧 */
  stackKeyFrame?: string;
  /** 判断依据 */
  basis: string;
}

/**
 * 失败模式统计条目
 */
export interface FailureStatsEntry {
  /** 失败分类 */
  category: FailureCategory;
  /** 发生次数 */
  count: number;
  /** 占比 */
  percentage: number;
  /** 对比 SEC-bench Pro 参考值 */
  secBenchProReference?: string;
  /** 改进建议 */
  improvementSuggestion?: string;
}

/**
 * 失败模式报告
 */
export interface FailureModeReport {
  /** 总失败次数 */
  totalFailures: number;
  /** 按分类统计 */
  byCategory: FailureStatsEntry[];
  /** 按 Skill 统计 */
  bySkill: Record<string, FailureStatsEntry[]>;
  /** 趋势（最近 N 次的分类变化） */
  trend: FailureCategory[];
  /** 累积报告 */
  cumulative: {
    totalTracked: number;
    uniqueSkills: number;
    topFailureSkill: string;
  };
}

// ==================== FailureModeTracker ====================

/**
 * 失败模式追踪器
 *
 * 核心能力：
 * 1. 对执行结果进行失败模式分类
 * 2. 跟踪各 Skill 的失败分布
 * 3. 生成与 SEC-bench Pro 可对比的失败报告
 * 4. 提供改进建议
 */
export class FailureModeTracker {
  private records: Array<{ skillId: string; signature: FailureSignature; timestamp: string }> = [];
  private readonly MAX_RECORDS = 5000;

  /**
   * 分类并记录失败模式
   *
   * @param skillId 执行的 Skill ID
   * @param exitCode 退出码
   * @param output 执行输出
   * @param stackTrace 堆栈跟踪（可选）
   * @param hasCrash 是否有崩溃信号
   * @param errorType 错误类型（可选）
   * @returns 分类结果
   */
  classifyAndRecord(
    skillId: string,
    exitCode: number,
    output: string,
    stackTrace?: string,
    hasCrash?: boolean,
    errorType?: string
  ): FailureCategory {
    const signature = this.classify(exitCode, output, stackTrace, hasCrash, errorType);
    this.records.push({
      skillId,
      signature,
      timestamp: new Date().toISOString(),
    });

    // 限制记录数
    if (this.records.length > this.MAX_RECORDS) {
      this.records.splice(0, this.records.length - this.MAX_RECORDS);
    }

    return signature.category;
  }

  /**
   * 分类失败模式
   * 基于 SEC-bench Pro Table 5 的分类逻辑
   */
  classify(
    exitCode: number,
    output: string,
    stackTrace?: string,
    hasCrash?: boolean,
    errorType?: string
  ): FailureSignature {
    const lowerOutput = (output || '').toLowerCase();
    const lowerTrace = (stackTrace || '').toLowerCase();
    const lowerError = (errorType || '').toLowerCase();

    // 1. 基础设施故障检测
    if (exitCode === -1 || /timeout|out of memory|cannot find|connection refused/i.test(lowerOutput)) {
      return {
        category: 'infrastructure',
        exitCode,
        hasCrash: false,
        errorType: 'infrastructure',
        basis: `基础设施故障: ${lowerOutput.slice(0, 100)}`,
      };
    }

    // 2. 语言级通用错误（对应 SEC-bench Pro "Generic JS" 类别）
    if (hasCrash || exitCode !== 0) {
      const genericPatterns = [
        'typeerror', 'referenceerror', 'syntaxerror', 'rangeerror',
        'null pointer', 'undefined', 'cannot read property',
        'division by zero', 'invalid argument', 'stack overflow',
        'generic::', 'internal error', 'exception',
      ];
      const isGeneric = genericPatterns.some(p =>
        lowerOutput.includes(p) || lowerError.includes(p)
      );

      if (isGeneric) {
        return {
          category: 'generic_error',
          exitCode,
          hasCrash: true,
          errorType: errorType || 'language_exception',
          stackKeyFrame: this.extractStackFrame(lowerTrace),
          basis: `触发语言级异常: ${lowerError || 'language exception'}`,
        };
      }

      // 3. Off-target 检测
      if (lowerTrace && this.isOffTargetCrash(lowerTrace, skillId => {
        return !!skillId;
      })) {
        return {
          category: 'off_target',
          exitCode,
          hasCrash: true,
          stackKeyFrame: this.extractStackFrame(lowerTrace),
          basis: `崩溃在非目标代码区域`,
        };
      }

      // 4. 有崩溃信号但无法进一步分类
      return {
        category: 'no_crash', // will be overridden if we have better info
        exitCode,
        hasCrash: true,
        basis: `有异常信号但无法精确分类: exit=${exitCode}`,
      };
    }

    // 5. 无崩溃 - 干净退出（对应 SEC-bench Pro "No crash" 类别）
    return {
      category: 'no_crash',
      exitCode: 0,
      hasCrash: false,
      basis: `干净退出 (exit code: 0)`,
    };
  }

  /**
   * 获取指定 Skill 的失败模式统计
   */
  getSkillStats(skillId: string): FailureStatsEntry[] {
    const skillRecords = this.records.filter(r => r.skillId === skillId);
    return this.computeStats(skillRecords.map(r => r.signature.category));
  }

  /**
   * 获取全局失败模式统计
   */
  getGlobalStats(): FailureModeReport {
    const categories = this.records.map(r => r.signature.category);
    const byCategory = this.computeStats(categories);

    // 按 Skill 统计
    const bySkill: Record<string, FailureStatsEntry[]> = {};
    const skillSet = new Set(this.records.map(r => r.skillId));
    for (const skillId of skillSet) {
      bySkill[skillId] = this.getSkillStats(skillId);
    }

    // 最近趋势
    const trend = this.records.slice(-20).map(r => r.signature.category);

    // 找失败最多的 Skill
    let topFailureSkill = '';
    let maxFailures = 0;
    for (const [skillId, entries] of Object.entries(bySkill)) {
      const total = entries.reduce((s, e) => s + e.count, 0);
      if (total > maxFailures) {
        maxFailures = total;
        topFailureSkill = skillId;
      }
    }

    return {
      totalFailures: this.records.length,
      byCategory,
      bySkill,
      trend,
      cumulative: {
        totalTracked: this.records.length,
        uniqueSkills: skillSet.size,
        topFailureSkill,
      },
    };
  }

  /**
   * 生成与 SEC-bench Pro 可对比的失败模式报告
   * 对应 SEC-bench Pro Table 5 格式
   */
  getReport(): string {
    const stats = this.getGlobalStats();
    const lines: string[] = [];

    lines.push('=== 失败模式分布报告 ===');
    lines.push('(基于 SEC-bench Pro Table 5 分类法)');
    lines.push('');

    // 参考表头
    lines.push('类别                  | 数量   | 占比    | SEC-bench Pro 参考');
    lines.push('-' .repeat(70));

    const referenceMap: Record<FailureCategory, string> = {
      'no_crash': 'Claude Code V8: 74.7%, SM: 89.5%',
      'generic_error': 'Claude Code V8: 22.4%, SM: 9.1%',
      'off_target': 'Claude Code V8: 1.3%, Codex V8: 2.4%',
      'fixed_image_crash': 'Codex V8: 21.4%, SM: 26.9%',
      'partial_fix': 'SEC-bench Pro: 45.2% of Codex failures',
      'infrastructure': '—',
      'false_positive': '—',
      'unknown': '—',
    };

    const suggestionMap: Record<FailureCategory, string> = {
      'no_crash': '检查 PoC 是否触发了正确的代码路径；参考 SEC-bench Pro 中 43.6% 的 crash-only 虚增',
      'generic_error': '需区分语言异常和安全崩溃；使用 LLM Judge 三证据裁判',
      'off_target': '确保 PoC 作用于目标代码区域；检查堆栈跟踪中的源代码位置',
      'fixed_image_crash': '补丁不完整或 PoC 触发了非目标漏洞；使用 fixed-image oracle 验证',
      'partial_fix': '补丁部分修复了漏洞；需检查补丁是否覆盖所有攻击面',
      'infrastructure': '检查执行环境资源配置；增加超时和重试机制',
      'false_positive': '需人工审核确认；考虑调整 Judge 置信度阈值',
      'unknown': '需人工分析确认',
    };

    for (const entry of stats.byCategory) {
      const label = entry.category.padEnd(20);
      const count = String(entry.count).padStart(5);
      const pct = `(${(entry.percentage * 100).toFixed(1)}%)`.padStart(8);
      const ref = (referenceMap[entry.category] || '').padEnd(35);
      lines.push(`  ${label} | ${count} ${pct} | ${ref}`);
    }

    lines.push('');
    lines.push(`总失败数: ${stats.totalFailures}`);
    lines.push(`涉及 Skill: ${stats.cumulative.uniqueSkills}`);
    lines.push(`失败最多的 Skill: ${stats.cumulative.topFailureSkill}`);
    lines.push('');

    lines.push('--- 改进建议 ---');
    for (const entry of stats.byCategory) {
      if (entry.percentage > 0.05) { // 只显示占比 > 5% 的
        lines.push(`  [${entry.category}] ${suggestionMap[entry.category] || ''}`);
      }
    }

    lines.push('');
    lines.push('--- 最近趋势 (最近 20 次) ---');
    const trendGroups: string[] = [];
    let currentGroup = '';
    let groupCount = 0;
    for (const cat of stats.trend) {
      const short = cat === 'no_crash' ? 'Ø' : cat === 'generic_error' ? 'E' : cat === 'off_target' ? 'T' : cat === 'fixed_image_crash' ? 'F' : cat === 'partial_fix' ? 'P' : cat === 'infrastructure' ? 'I' : '?';
      if (currentGroup !== short) {
        if (groupCount > 0) trendGroups.push(groupCount > 1 ? `${currentGroup}×${groupCount}` : currentGroup);
        currentGroup = short;
        groupCount = 1;
      } else {
        groupCount++;
      }
    }
    if (groupCount > 0) trendGroups.push(groupCount > 1 ? `${currentGroup}×${groupCount}` : currentGroup);
    lines.push(`  ${trendGroups.join(' → ')}`);
    lines.push(`  Ø=no_crash E=generic_error T=off_target F=fixed_image_crash P=partial_fix I=infrastructure`);

    return lines.join('\n');
  }

  // ==================== 辅助方法 ====================

  private computeStats(categories: FailureCategory[]): FailureStatsEntry[] {
    const countMap = new Map<FailureCategory, number>();
    for (const cat of categories) {
      countMap.set(cat, (countMap.get(cat) ?? 0) + 1);
    }

    const total = categories.length;
    return Array.from(countMap.entries())
      .map(([category, count]) => ({
        category,
        count,
        percentage: total === 0 ? 0 : count / total,
        secBenchProReference: this.getReferenceValue(category),
        improvementSuggestion: this.getSuggestion(category),
      }))
      .sort((a, b) => b.count - a.count);
  }

  private getReferenceValue(category: FailureCategory): string | undefined {
    const refs: Record<FailureCategory, string> = {
      'no_crash': 'Claude Code V8: 74.7% / SM: 89.5%',
      'generic_error': 'Claude Code V8: 22.4% / SM: 9.1%',
      'off_target': 'Claude Code V8: 1.3% / Codex V8: 2.4%',
      'fixed_image_crash': 'Codex V8: 21.4% / SM: 26.9%',
      'partial_fix': 'Codex V8 partial-fix: 45.2%',
      'infrastructure': '—',
      'false_positive': '—',
      'unknown': '—',
    };
    return refs[category];
  }

  private getSuggestion(category: FailureCategory): string | undefined {
    const suggestions: Record<FailureCategory, string> = {
      'no_crash': '检查 PoC 代码路径；考虑使用 Explorer Agent 进行广度探索',
      'generic_error': '使用 LLM Judge 三证据裁判区分语言异常与安全崩溃',
      'off_target': '缩小目标范围；检查 crash stack trace 是否在目标代码中',
      'fixed_image_crash': '检查补丁完整性；使用 fixed-image oracle 验证',
      'partial_fix': '评估补丁覆盖范围；考虑多层防御',
      'infrastructure': '增加资源配置；实施超时和重试策略',
      'false_positive': '调整置信度阈值；人工审核',
      'unknown': '人工分析',
    };
    return suggestions[category];
  }

  /**
   * 提取堆栈关键帧
   */
  private extractStackFrame(stackTrace: string): string | undefined {
    if (!stackTrace) return undefined;
    const lines = stackTrace.split('\n').filter(l => l.trim());
    // 返回第一帧（通常是触发点）
    return lines[0]?.trim() || undefined;
  }

  /**
   * Off-target 检测（简化版）
   */
  private isOffTargetCrash(stackTrace: string, _skillCheck: (id: string) => boolean): boolean {
    // 检测崩溃是否发生在外部库
    const externalPatterns = [
      'node_modules', 'lib/', 'vendor/',
      '/usr/lib', '/usr/local/lib',
      'com.google.common', 'org.apache.commons',
      'libc.so', 'libc++', 'kernel32.dll',
    ];
    return externalPatterns.some(p => stackTrace.includes(p));
  }

  /**
   * 重置
   */
  reset(): void {
    this.records = [];
  }
}

/** 全局单例 */
export const failureTracker = new FailureModeTracker();
