/**
 * HOS-Sec-Engine V5 - LLM-as-a-Judge 裁判系统
 *
 * 基于 SEC-bench Pro 的三证据分级机制实现的 AI 裁判模块。
 * 对 skill 执行产生的 finding 进行多维度验证：
 * - vulnerable-image evidence: 在易受攻击目标上执行的证据
 * - fixed-image evidence: 在已修复版本上执行的结果
 * - latest-image evidence: 在最新版本上执行的结果
 *
 * SEC-bench Pro 数据表明：仅靠 crash 匹配会虚增 43.6% 的成功率，
 * 三证据裁判是消除误报的关键。
 *
 * @see 可参考思路 技术报告 SEC-bench Pro.txt §3.5
 */

import type { Finding } from '../types/playbook';

// ==================== Types ====================

/**
 * 三证据执行结果
 * 对应 SEC-bench Pro 的 vulnerable/fixed/latest 三镜像证据
 */
export interface ThreeStateEvidence {
  /** 测试目标/场景 */
  target: string;
  /** Skill 执行后收集的证据 */
  executionOutput: string;
  /** 退出码 */
  exitCode: number;
  /** 是否有 crash 信号 */
  hasCrashSignal: boolean;
  /** 捕获的异常/错误类型 */
  errorType?: string;
  /** 实际触发的异常堆栈 */
  stackTrace?: string;
  /** 额外上下文 */
  metadata?: Record<string, any>;
}

/**
 * 三状态证据集
 */
export interface ExecutionEvidence {
  /** 在原始目标上执行的证据（对应 vulnerable-image） */
  primary: ThreeStateEvidence;
  /** 经过修复/防护后执行的证据（对应 fixed-image） */
  hardened?: ThreeStateEvidence;
  /** 在最新环境中执行的证据（对应 latest-image） */
  latest?: ThreeStateEvidence;
}

/**
 * 裁判判定结果
 * 对应 SEC-bench Pro Table 2 中的三种结果
 */
export type Verdict = 'verified' | 'unsure' | 'illegal';

/**
 * 裁判判定详情
 */
export interface JudgeVerdict {
  /** 最终判定 */
  verdict: Verdict;
  /** 置信度 (0-1) */
  confidence: number;
  /** 判定理由 */
  reasoning: string;
  /** 失败模式分类 */
  failureMode?: FailureMode;
  /** 匹配的漏洞类型 */
  matchedVulnerabilityClass?: string;
  /** 预期错误类型匹配 */
  expectedErrorMatch?: boolean;
}

/**
 * 失败模式分类
 * 对应 SEC-bench Pro Table 5 中的四种主要失败模式
 */
export type FailureMode =
  /** PoC 在易受攻击镜像上干净退出，未触发任何崩溃 */
  | 'no_crash'
  /** PoC 触发语言级异常而非安全信号 */
  | 'generic_error'
  /** PoC 在非目标代码区域崩溃 */
  | 'off_target'
  /** PoC 在已修复版本上仍崩溃 */
  | 'fixed_image_crash'
  /** PoC 触发不同类型但非预期的崩溃 */
  | 'unexpected_crash'
  /** 基础设施问题（超时、资源耗尽） */
  | 'infrastructure_failure';

/**
 * 三级错误分类法
 * 对应 SEC-bench Pro §3.5 的 E1/E2/E3 分类
 */
export type ErrorLevel =
  /** 漏洞崩溃（sanitizer 报告、沙盒违规、DCHECK 失败、运行时崩溃） */
  | 'E1_vulnerability_crash'
  /** 无害结果（干净退出、普通异常、显式缓解消息） */
  | 'E2_harmless'
  /** 基础设施故障（资源耗尽、缺失文件、超时） */
  | 'E3_infrastructure_failure';

/**
 * 裁判配置
 */
export interface JudgeConfig {
  /** 最小置信度阈值，低于此值的判定标记为 unsure */
  minConfidence: number;
  /** 是否启用三证据裁判（关闭时仅使用 primary 证据） */
  enableThreeStateJudging: boolean;
  /** 最大 retry 次数 */
  maxRetries: number;
  /** 是否启用缓存 */
  enableCache: boolean;
  /** 缓存最大条目数 */
  maxCacheSize: number;
}

export const DEFAULT_JUDGE_CONFIG: JudgeConfig = {
  minConfidence: 0.6,
  enableThreeStateJudging: true,
  maxRetries: 3,
  enableCache: true,
  maxCacheSize: 500,
};

// ==================== LLMJudge 类 ====================

/**
 * LLM-as-a-Judge 裁判实现
 *
 * 核心能力：
 * 1. 对 execution evidence 进行三状态验证
 * 2. 对 finding 进行可信度判定
 * 3. 分类失败模式以改进 skill 质量
 * 4. 防止误报虚增（如 SEC-bench Pro 中的 43.6% 膨胀）
 */
export class LLMJudge {
  private config: JudgeConfig;
  private verdictCache: Map<string, JudgeVerdict>;
  private cacheHits: number;
  private cacheMisses: number;
  /** 判定统计 */
  private stats: {
    total: number;
    verified: number;
    unsure: number;
    illegal: number;
    byFailureMode: Map<FailureMode, number>;
  };

  constructor(config: Partial<JudgeConfig> = {}) {
    this.config = { ...DEFAULT_JUDGE_CONFIG, ...config };
    this.verdictCache = new Map();
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.stats = {
      total: 0,
      verified: 0,
      unsure: 0,
      illegal: 0,
      byFailureMode: new Map(),
    };
  }

  /**
   * 对 finding 进行裁判判定
   * 使用三证据模型验证 finding 的可信度
   *
   * @param finding 待验证的 finding
   * @param evidence 三状态执行证据
   * @returns 判定结果
   */
  judge(finding: Finding, evidence: ExecutionEvidence): JudgeVerdict {
    this.stats.total++;

    // 检查缓存
    const cacheKey = this.getCacheKey(finding, evidence);
    if (this.config.enableCache) {
      const cached = this.verdictCache.get(cacheKey);
      if (cached) {
        this.cacheHits++;
        return cached;
      }
    }
    this.cacheMisses++;

    // Step 1: 分析 primary 证据（对应 vulnerable-image）
    const primaryAnalysis = this.analyzePrimaryEvidence(evidence.primary, finding);

    // 如果 primary 无 crash 信号 → 直接 illegal
    if (primaryAnalysis.errorLevel === 'E2_harmless') {
      const verdict = this.buildVerdict(
        'illegal',
        0.9,
        `Primary 执行无崩溃信号: ${evidence.primary.executionOutput}`,
        'no_crash',
        primaryAnalysis.matchedClass,
        false
      );
      this.cacheResult(cacheKey, verdict);
      this.stats.illegal++;
      this.incrementFailureMode('no_crash');
      return verdict;
    }

    // 如果是基础设施故障 → unsure（证据不完整）
    if (primaryAnalysis.errorLevel === 'E3_infrastructure_failure') {
      const verdict = this.buildVerdict(
        'unsure',
        0.5,
        `Primary 执行出现基础设施问题: ${evidence.primary.executionOutput}`,
        'infrastructure_failure',
        primaryAnalysis.matchedClass,
        false
      );
      this.cacheResult(cacheKey, verdict);
      this.stats.unsure++;
      return verdict;
    }

    // Step 2: 如果有 hardened/latest 证据，进行三证据交叉验证
    if (this.config.enableThreeStateJudging && evidence.hardened) {
      const hardenedAnalysis = this.analyzeHardenedEvidence(evidence.hardened, evidence.primary);

      // 如果 hardened 仍触发相同崩溃 → illegal（修复未阻断）
      if (hardenedAnalysis.stillCrashes) {
        const verdict = this.buildVerdict(
          'illegal',
          0.85,
          `Hardened 环境仍触发相同崩溃: ${evidence.hardened.executionOutput}`,
          'fixed_image_crash',
          primaryAnalysis.matchedClass,
          true
        );
        this.cacheResult(cacheKey, verdict);
        this.stats.illegal++;
        this.incrementFailureMode('fixed_image_crash');
        return verdict;
      }

      // hardened 有不同但有效的崩溃 → 检测是否 off-target
      if (hardenedAnalysis.differentCrash) {
        const verdict = this.buildVerdict(
          'illegal',
          0.7,
          `Hardened 环境触发不同崩溃类型，可能偏离目标`,
          'unexpected_crash',
          primaryAnalysis.matchedClass,
          false
        );
        this.cacheResult(cacheKey, verdict);
        this.stats.illegal++;
        this.incrementFailureMode('unexpected_crash');
        return verdict;
      }
    }

    // Step 3: 检查 primary 崩溃是否在目标范围内（防止 off-target）
    if (primaryAnalysis.isOffTarget) {
      const verdict = this.buildVerdict(
        'illegal',
        0.75,
        `崩溃位置偏离目标区域: ${primaryAnalysis.offTargetReason}`,
        'off_target',
        primaryAnalysis.matchedClass,
        false
      );
      this.cacheResult(cacheKey, verdict);
      this.stats.illegal++;
      this.incrementFailureMode('off_target');
      return verdict;
    }

    // Step 4: 检查是否 generic error（语言级异常，非安全信号）
    if (primaryAnalysis.isGenericError) {
      const verdict = this.buildVerdict(
        'illegal',
        0.65,
        `触发语言级异常而非安全信号: ${primaryAnalysis.errorDetail}`,
        'generic_error',
        primaryAnalysis.matchedClass,
        false
      );
      this.cacheResult(cacheKey, verdict);
      this.stats.illegal++;
      this.incrementFailureMode('generic_error');
      return verdict;
    }

    // Step 5: 所有检查通过 → verified
    const confidence = this.calculateConfidence(primaryAnalysis.matchedClassMatch, evidence);
    const verdict = this.buildVerdict(
      confidence >= this.config.minConfidence ? 'verified' : 'unsure',
      confidence,
      primaryAnalysis.reasoning,
      undefined,
      primaryAnalysis.matchedClass,
      true
    );

    this.cacheResult(cacheKey, verdict);
    if (verdict.verdict === 'verified') {
      this.stats.verified++;
    } else {
      this.stats.unsure++;
    }

    return verdict;
  }

  /**
   * 批量裁判
   * @param findings 待验证的 finding 列表
   * @param evidenceList 对应的证据列表
   * @returns 判定结果列表
   */
  judgeBatch(findings: Finding[], evidenceList: ExecutionEvidence[]): JudgeVerdict[] {
    const results: JudgeVerdict[] = [];
    const minLen = Math.min(findings.length, evidenceList.length);
    for (let i = 0; i < minLen; i++) {
      results.push(this.judge(findings[i], evidenceList[i]));
    }
    return results;
  }

  /**
   * 过滤已验证的 findings（去除误报）
   * @param findings 原始 finding 列表
   * @param evidenceList 对应的证据列表
   * @returns 仅含 verified 判定的 finding 列表
   */
  filterVerified(findings: Finding[], evidenceList: ExecutionEvidence[]): Finding[] {
    const verified: Finding[] = [];
    const minLen = Math.min(findings.length, evidenceList.length);
    for (let i = 0; i < minLen; i++) {
      const verdict = this.judge(findings[i], evidenceList[i]);
      if (verdict.verdict === 'verified') {
        verified.push(findings[i]);
      }
    }
    return verified;
  }

  /**
   * 将 finding 标记为误报
   * 用于人工审核或后处理
   */
  markAsFalsePositive(finding: Finding, evidence: ExecutionEvidence, reason: string): JudgeVerdict {
    const verdict: JudgeVerdict = {
      verdict: 'illegal',
      confidence: 1.0,
      reasoning: `人工标记为误报: ${reason}`,
      failureMode: 'no_crash',
    };
    this.stats.total++;
    this.stats.illegal++;
    this.incrementFailureMode('no_crash');
    return verdict;
  }

  // ==================== 分析方法 ====================

  /**
   * 分析 primary 证据
   */
  private analyzePrimaryEvidence(
    evidence: ThreeStateEvidence,
    finding: Finding
  ): {
    errorLevel: ErrorLevel;
    isOffTarget: boolean;
    offTargetReason?: string;
    isGenericError: boolean;
    errorDetail?: string;
    matchedClass: string | undefined;
    matchedClassMatch: boolean;
    reasoning: string;
  } {
    const output = (evidence.executionOutput || '').toLowerCase();
    const stackTrace = (evidence.stackTrace || '').toLowerCase();
    const errorType = (evidence.errorType || '').toLowerCase();

    // 检测基础设施故障
    if (this.isInfrastructureFailure(evidence)) {
      return {
        errorLevel: 'E3_infrastructure_failure',
        isOffTarget: false,
        isGenericError: false,
        matchedClass: undefined,
        matchedClassMatch: false,
        reasoning: `基础设施故障: ${evidence.exitCode === -1 ? '超时' : '资源耗尽/文件缺失'}`,
      };
    }

    // 检测崩溃信号 → E1
    if (evidence.hasCrashSignal || evidence.exitCode !== 0) {
      const isGeneric = this.isGenericLanguageError(output, errorType);
      const offTarget = this.isOffTargetCrash(stackTrace, finding);

      if (offTarget.isOffTarget) {
        return {
          errorLevel: 'E1_vulnerability_crash',
          isOffTarget: true,
          offTargetReason: offTarget.reason,
          isGenericError: false,
          matchedClass: undefined,
          matchedClassMatch: false,
          reasoning: `崩溃在非目标区域: ${offTarget.reason}`,
        };
      }

      if (isGeneric) {
        return {
          errorLevel: 'E1_vulnerability_crash',
          isOffTarget: false,
          isGenericError: true,
          errorDetail: `触发错误: ${errorType || 'language exception'}`,
          matchedClass: undefined,
          matchedClassMatch: false,
          reasoning: `触发语言级异常而非安全信号`,
        };
      }

      // 真正匹配的漏洞崩溃
      const matchedVulnClass = this.matchVulnerabilityClass(output, stackTrace, errorType);
      return {
        errorLevel: 'E1_vulnerability_crash',
        isOffTarget: false,
        isGenericError: false,
        matchedClass: matchedVulnClass,
        matchedClassMatch: !!matchedVulnClass,
        reasoning: `检测到安全崩溃信号: ${matchedVulnClass || '未知漏洞类型'}`,
      };
    }

    // 无崩溃信号 → E2 harmless
    return {
      errorLevel: 'E2_harmless',
      isOffTarget: false,
      isGenericError: false,
      matchedClass: undefined,
      matchedClassMatch: false,
      reasoning: `执行完毕无崩溃信号 (exit code: ${evidence.exitCode})`,
    };
  }

  /**
   * 分析 hardened 证据（与 primary 交叉验证）
   */
  private analyzeHardenedEvidence(
    hardened: ThreeStateEvidence,
    primary: ThreeStateEvidence
  ): {
    stillCrashes: boolean;
    differentCrash: boolean;
  } {
    // 如果 hardened 无崩溃 → 修复有效
    if (!hardened.hasCrashSignal && hardened.exitCode === 0) {
      return { stillCrashes: false, differentCrash: false };
    }

    // 如果 hardened 有崩溃
    if (hardened.hasCrashSignal || hardened.exitCode !== 0) {
      // 检查是否同类型崩溃
      const sameType = this.isSameCrashType(primary, hardened);
      if (sameType) {
        return { stillCrashes: true, differentCrash: false };
      }
      return { stillCrashes: false, differentCrash: true };
    }

    return { stillCrashes: false, differentCrash: false };
  }

  // ==================== 辅助检测方法 ====================

  /**
   * 判断基础设施故障
   */
  private isInfrastructureFailure(evidence: ThreeStateEvidence): boolean {
    const output = evidence.executionOutput || '';
    // 超时
    if (evidence.exitCode === -1) return true;
    // 常见基础设施错误关键词
    const infraKeywords = [
      'timeout', 'out of memory', 'oom', 'cannot find',
      'no such file', 'permission denied', 'connection refused',
      'resource temporarily unavailable', 'too many open files',
      'disk quota exceeded', 'out of disk space',
    ];
    const lower = output.toLowerCase();
    return infraKeywords.some(kw => lower.includes(kw));
  }

  /**
   * 判断是否为语言级通用错误（非安全信号）
   */
  private isGenericLanguageError(output: string, errorType?: string): boolean {
    const genericPatterns = [
      'typeerror', 'referenceerror', 'syntaxerror', 'rangeerror',
      'null pointer exception', 'undefined method', 'cannot read property',
      'division by zero', 'invalid argument', 'stack overflow',
      'generic::', 'internal error',
    ];
    const check = `${output} ${errorType || ''}`.toLowerCase();
    return genericPatterns.some(p => check.includes(p));
  }

  /**
   * 判断是否为 off-target crash（在非目标区域崩溃）
   */
  private isOffTargetCrash(
    stackTrace: string,
    finding: Finding
  ): { isOffTarget: boolean; reason?: string } {
    if (!stackTrace) return { isOffTarget: false };

    const skillId = (finding.skillId || '').toLowerCase();
    const trace = stackTrace.toLowerCase();

    // 根据 skill 类别检查崩溃位置
    if (skillId.includes('sqli') || skillId.includes('sql-injection')) {
      // SQL 注入应该在数据库层崩溃，而非在应用框架层
      if (trace.includes('parse') && !trace.includes('sql') && !trace.includes('database')) {
        return { isOffTarget: true, reason: '崩溃发生在解析层而非 SQL 执行层' };
      }
    }
    if (skillId.includes('xss')) {
      if (trace.includes('render') && !trace.includes('escape') && !trace.includes('encode')) {
        return { isOffTarget: true, reason: '崩溃发生在渲染层而非 XSS 过滤层' };
      }
    }
    if (skillId.includes('ssrf')) {
      if (!trace.includes('http') && !trace.includes('request') && !trace.includes('url')) {
        return { isOffTarget: true, reason: '崩溃不在 HTTP/URL 处理层' };
      }
    }

    // 通用检测：崩溃在外部库而非应用代码
    if (this.isExternalLibraryCrash(stackTrace)) {
      return { isOffTarget: true, reason: '崩溃发生在第三方库代码中，非应用层' };
    }

    return { isOffTarget: false };
  }

  /**
   * 判断是否在外部库崩溃
   */
  private isExternalLibraryCrash(stackTrace: string): boolean {
    const trace = stackTrace.toLowerCase();
    const externalPatterns = [
      'node_modules', 'lib/', 'vendor/', 'packages/',
      'com.google.common', 'org.apache.commons',
      '/usr/lib', '/usr/local/lib', 'c:\\windows\\system32',
      'libc.so', 'libc++', 'kernel32.dll',
    ];
    return externalPatterns.some(p => trace.includes(p));
  }

  /**
   * 判断两个 crash 是否为同一类型
   */
  private isSameCrashType(a: ThreeStateEvidence, b: ThreeStateEvidence): boolean {
    // 比较错误类型
    if (a.errorType && b.errorType && a.errorType === b.errorType) return true;
    // 比较堆栈顶部
    const aStack = (a.stackTrace || '').split('\n')[0];
    const bStack = (b.stackTrace || '').split('\n')[0];
    if (aStack && bStack && aStack === bStack) return true;
    return false;
  }

  /**
   * 匹配漏洞类型
   */
  private matchVulnerabilityClass(output: string, stackTrace: string, errorType?: string): string | undefined {
    const combined = `${output} ${stackTrace} ${errorType || ''}`.toLowerCase();

    const vulnPatterns: Array<[RegExp, string]> = [
      [/(buffer overflow|buffer overread|heap overflow)/i, 'buffer-overflow'],
      [/(use-after-free|use after free|dangling pointer)/i, 'use-after-free'],
      [/(type confusion|type mismatch)/i, 'type-confusion'],
      [/(out.of.bounds|oob|out of range|index out)/i, 'out-of-bounds'],
      [/(format string|%n|%x|%s)/i, 'format-string'],
      [/(integer overflow|integer underflow|wrap around)/i, 'integer-overflow'],
      [/(sql injection|sqli)/i, 'sql-injection'],
      [/(cross.?.?site.?script|xss)/i, 'xss'],
      [/(server.?.?side.?request.?forgery|ssrf)/i, 'ssrf'],
      [/(xml external entity|xxe)/i, 'xxe'],
      [/(remote.?code.?execution|rce|command.?injection)/i, 'rce'],
      [/(path traversal|directory traversal|lfi)/i, 'path-traversal'],
      [/(deserialization|unserialize)/i, 'deserialization'],
      [/(sandbox.*escape|sandbox.*violation|sandbox.*bypass)/i, 'sandbox-escape'],
      [/(race condition|time.of.check|toctou)/i, 'race-condition'],
      [/(jitt|jit.*compil)/i, 'jit-issue'],
      [/(memory.*leak|memory leak)/i, 'memory-leak'],
      [/(double free|double.free)/i, 'double-free'],
      [/(null pointer|null.*deref)/i, 'null-pointer-dereference'],
    ];

    for (const [regex, vulnClass] of vulnPatterns) {
      if (regex.test(combined)) {
        return vulnClass;
      }
    }
    return undefined;
  }

  /**
   * 计算综合置信度
   */
  private calculateConfidence(classMatch: boolean, evidence: ExecutionEvidence): number {
    let confidence = 0.0;

    // 漏洞类型匹配 → 高置信
    if (classMatch) confidence += 0.4;

    // primary 证据质量
    if (evidence.primary.hasCrashSignal) confidence += 0.2;
    if (evidence.primary.stackTrace) confidence += 0.1;

    // hardened 证据确认
    if (evidence.hardened) {
      if (!evidence.hardened.hasCrashSignal && evidence.hardened.exitCode === 0) {
        confidence += 0.2; // 修复有效
      }
    }

    // latest 证据确认
    if (evidence.latest) {
      if (!evidence.latest.hasCrashSignal && evidence.latest.exitCode === 0) {
        confidence += 0.1;
      }
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * 构建判定结果
   */
  private buildVerdict(
    verdict: Verdict,
    confidence: number,
    reasoning: string,
    failureMode?: FailureMode,
    matchedVulnerabilityClass?: string,
    expectedErrorMatch?: boolean
  ): JudgeVerdict {
    return {
      verdict,
      confidence,
      reasoning,
      failureMode,
      matchedVulnerabilityClass,
      expectedErrorMatch,
    };
  }

  /**
   * 生成缓存键
   */
  private getCacheKey(finding: Finding, evidence: ExecutionEvidence): string {
    const findingKey = `${finding.skillId}|${finding.severity}|${(finding.description || '').slice(0, 50)}`;
    const evidenceKey = `${evidence.primary.exitCode}|${evidence.primary.hasCrashSignal}|${(evidence.primary.errorType || '')}`;
    return `${findingKey}|${evidenceKey}`;
  }

  /**
   * 缓存判定结果（带 LRU 淘汰）
   */
  private cacheResult(key: string, verdict: JudgeVerdict): void {
    if (!this.config.enableCache) return;
    if (this.verdictCache.size >= this.config.maxCacheSize) {
      const firstKey = this.verdictCache.keys().next().value;
      if (firstKey) this.verdictCache.delete(firstKey);
    }
    this.verdictCache.set(key, verdict);
  }

  /**
   * 记录失败模式统计
   */
  private incrementFailureMode(mode: FailureMode): void {
    const count = this.stats.byFailureMode.get(mode) ?? 0;
    this.stats.byFailureMode.set(mode, count + 1);
  }

  // ==================== 统计与重置 ====================

  /**
   * 获取裁判统计信息
   */
  getStats(): {
    total: number;
    verified: number;
    unsure: number;
    illegal: number;
    verifiedRate: number;
    failureModeDistribution: Record<FailureMode, number>;
    cacheHitRate: number;
  } {
    const totalCache = this.cacheHits + this.cacheMisses;
    const failureModeDist: Record<string, number> = {};
    for (const [mode, count] of this.stats.byFailureMode) {
      failureModeDist[mode] = count;
    }

    return {
      total: this.stats.total,
      verified: this.stats.verified,
      unsure: this.stats.unsure,
      illegal: this.stats.illegal,
      verifiedRate: this.stats.total === 0 ? 0 : this.stats.verified / this.stats.total,
      failureModeDistribution: failureModeDist as Record<FailureMode, number>,
      cacheHitRate: totalCache === 0 ? 0 : this.cacheHits / totalCache,
    };
  }

  /**
   * 重置所有状态
   */
  reset(): void {
    this.verdictCache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.stats = {
      total: 0,
      verified: 0,
      unsure: 0,
      illegal: 0,
      byFailureMode: new Map(),
    };
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.verdictCache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  /**
   * 获取失败模式分布报告
   * 对应 SEC-bench Pro Table 5 的格式
   */
  getFailureModeReport(): string {
    const lines: string[] = [];
    lines.push('=== LLMJudge 失败模式分布 ===');
    lines.push('');
    lines.push(`总判定: ${this.stats.total}`);
    lines.push(`Verified: ${this.stats.verified} (${this.stats.total === 0 ? 0 : ((this.stats.verified / this.stats.total) * 100).toFixed(1)}%)`);
    lines.push(`Illegal:  ${this.stats.illegal} (${this.stats.total === 0 ? 0 : ((this.stats.illegal / this.stats.total) * 100).toFixed(1)}%)`);
    lines.push(`Unsure:   ${this.stats.unsure}`);
    lines.push('');
    lines.push('失败模式分布:');
    lines.push('  no_crash         | 干净退出无崩溃');
    lines.push('  generic_error    | 语言级异常而非安全信号');
    lines.push('  off_target       | 非目标区域崩溃');
    lines.push('  fixed_image_crash| 修复版本仍崩溃');
    lines.push('  unexpected_crash | 不同类型崩溃');
    lines.push('  infra_failure    | 基础设施故障');
    lines.push('');

    const totalFailures = this.stats.illegal;
    for (const [mode, count] of this.stats.byFailureMode) {
      const pct = totalFailures === 0 ? 0 : ((count / totalFailures) * 100).toFixed(1);
      const label = mode.padEnd(18);
      lines.push(`  ${label}| ${String(count).padStart(4)} (${pct}%)`);
    }

    return lines.join('\n');
  }
}

/** 全局单例 */
export const llmJudge = new LLMJudge();
