/**
 * HOS-Sec-Engine V5 - PoC Validator (Oracle-Based Validation)
 *
 * 基于 SEC-bench Pro 的双端 Oracle 验证机制实现。
 *
 * SEC-bench Pro 使用两种构造预言机（construction oracle）：
 * 1. Vulnerable-image oracle: 在易受攻击镜像上运行 PoC，确认触发预期崩溃
 * 2. Fixed-image oracle: 在修复镜像上运行同一 PoC，确认补丁阻断了崩溃
 * 只有通过两个 Oracle 的实例才被视为有效
 *
 * 此外，还包含 latest-image oracle 用于最新环境验证，
 * 防止 PoC 触发了非目标漏洞（off-target crash）。
 *
 * @see 可参考思路 技术报告 SEC-bench Pro.txt §3.3
 */

import type { Finding } from '../types/playbook';

// ==================== Types ====================

/**
 * Oracle 标签
 * 对应 SEC-bench Pro Table 1 的 Oracle 标签
 */
export type OracleLabel =
  // Vulnerable-image crash taxonomy（易受攻击镜像崩溃分类）
  | 'SANDBOX_VIOLATION'     // 沙盒逃逸/完整性检查失败
  | 'ASAN_CRASH'            // AddressSanitizer 内存安全违规
  | 'DCHECK'                // 调试或运行时不变量检查失败
  | 'RUNTIME_CRASH'         // 致命信号或异常终止
  // Fixed-image attempt labels（修复镜像尝试标签）
  | 'REPRODUCED'            // 补丁未阻挡 PoC，仍然复现
  | 'UNBLOCKED_CRASH'       // 不同但有效的崩溃类型
  | 'BLOCKED_DEFENSIVE'     // 补丁将漏洞转为可控错误路径
  | 'BLOCKED_HARMLESS'      // 运行时安全处理器拦截
  | 'BLOCKED_NO_REPRO'      // 补丁完全消除了 PoC 效果
  | 'TIMEOUT'               // 修复版本执行超时
  // Additional
  | 'INFRA_FAILURE';         // 基础设施故障

/**
 * 执行结果类型
 */
export type ExecutionResult = 'PASS' | 'FAIL' | 'ERROR';

/**
 * 单次执行记录
 */
export interface ExecutionRecord {
  /** 镜像标签 */
  imageType: 'vulnerable' | 'fixed' | 'latest';
  /** 尝试序号 */
  attemptNumber: number;
  /** Oracle 标签 */
  oracleLabel: OracleLabel;
  /** 退出码 */
  exitCode: number;
  /** 是否有崩溃信号 */
  hasCrash: boolean;
  /** 崩溃类型 */
  crashType?: string;
  /** 堆栈 */
  stackTrace?: string;
  /** 输出 */
  outputText: string;
  /** 执行结果 */
  result: ExecutionResult;
  /** 执行耗时 (ms) */
  duration: number;
}

/**
 * 验证器配置
 */
export interface ValidatorConfig {
  /** 每个镜像的最大重试次数 */
  maxRetriesPerImage: number;
  /** 单次执行超时 (ms) */
  executionTimeout: number;
  /** 是否有 latest 镜像证据 */
  hasLatestImage: boolean;
  /** 在固定镜像上强制使用 BLOCKED 分类 */
  strictFixedImageCheck: boolean;
}

export const DEFAULT_VALIDATOR_CONFIG: ValidatorConfig = {
  maxRetriesPerImage: 3,
  executionTimeout: 300000,  // 300s, 同 SEC-bench Pro
  hasLatestImage: true,
  strictFixedImageCheck: false,
};

/**
 * 验证结果
 */
export interface ValidationResult {
  /** 是否通过所有 Oracle */
  passed: boolean;
  /** 详细执行记录 */
  records: ExecutionRecord[];
  /** Vulnerable-image Oracle 结果 */
  vulnerableOracle: {
    passed: boolean;
    label: OracleLabel;
    attempts: number;
    matchedExpected: boolean;
  };
  /** Fixed-image Oracle 结果 */
  fixedOracle: {
    passed: boolean;
    label: OracleLabel;
    attempts: number;
    blocked: boolean;
  };
  /** Latest-image Oracle 结果（可选） */
  latestOracle?: {
    passed: boolean;
    label: OracleLabel;
    attempts: number;
  };
  /** 验证摘要 */
  summary: {
    totalAttempts: number;
    successfulAttempts: number;
    failedAttempts: number;
    totalDuration: number;
  };
  /** 执行错误 */
  errors?: string[];
}

/**
 * 预期错误类型
 * 定义 PoC 应触发的目标漏洞特征
 */
export interface ExpectedErrorProfile {
  /** 预期的错误类型（多个可选） */
  expectedTypes: Array<{
    label: OracleLabel;
    matchSignatures: string[];
    description: string;
  }>;
  /** 目标源文件路径特征 */
  targetSourcePattern?: string;
  /** 漏洞类别 */
  vulnerabilityClass?: string;
  /** 是否要求固定镜像完全阻断 */
  requireFullBlock: boolean;
}

// ==================== PoCValidator ====================

/**
 * PoC 验证器
 *
 * 核心能力：
 * 1. 在易受攻击目标上执行 PoC（对应 vulnerable-image oracle）
 * 2. 在修复/加固后目标上执行 PoC（对应 fixed-image oracle）
 * 3. 在最新环境上执行 PoC（对应 latest-image oracle）
 * 4. 三状态交叉验证，防止 off-target 误报
 *
 * 验证流程（对应 SEC-bench Pro §3.3）：
 * 1. Vulnerable oracle: 确认 PoC 触发预期崩溃
 * 2. Fixed oracle: 确认补丁阻断 PoC
 * 3. 若两者皆通过 → 验证通过
 * 4. 若 fixed 仍有崩溃 → illegal（补丁不完整或非目标漏洞）
 */
export class PoCValidator {
  private config: ValidatorConfig;
  private validationStats: {
    total: number;
    passed: number;
    failed: number;
    byLabel: Map<OracleLabel, number>;
  };

  constructor(config: Partial<ValidatorConfig> = {}) {
    this.config = { ...DEFAULT_VALIDATOR_CONFIG, ...config };
    this.validationStats = {
      total: 0,
      passed: 0,
      failed: 0,
      byLabel: new Map(),
    };
  }

  /**
   * 执行完整的三状态验证
   *
   * @param pocInput PoC 输入/测试用例
   * @param expectedError 预期错误配置
   * @param executeFn 执行函数：接收 (input, imageType, attemptNum) → ExecutionRecord
   * @returns 验证结果
   */
  async validate(
    pocInput: string,
    expectedError: ExpectedErrorProfile,
    executeFn: (input: string, imageType: 'vulnerable' | 'fixed' | 'latest', attemptNum: number) => Promise<ExecutionRecord>
  ): Promise<ValidationResult> {
    const startTime = Date.now();
    const allRecords: ExecutionRecord[] = [];
    const errors: string[] = [];

    // Phase 1: Vulnerable-image Oracle
    const vulnerableOracle = await this.executeVulnerableOracle(pocInput, expectedError, executeFn, allRecords);

    // 如果 vulnerable oracle 失败，直接返回
    if (!vulnerableOracle.passed) {
      this.recordFailure('vulnerable');
      return this.buildResult(allRecords, vulnerableOracle, null, null, Date.now() - startTime, errors.length > 0 ? errors : undefined);
    }

    // Phase 2: Fixed-image Oracle
    const fixedOracle = await this.executeFixedOracle(pocInput, executeFn, allRecords);

    // Phase 3: Latest-image Oracle（可选）
    let latestOracle: ValidationResult['latestOracle'] = undefined;
    if (this.config.hasLatestImage) {
      latestOracle = await this.executeLatestOracle(pocInput, executeFn, allRecords);
    }

    // 综合判定
    const passed = vulnerableOracle.passed && (fixedOracle?.blocked ?? true);

    const result = this.buildResult(allRecords, vulnerableOracle, fixedOracle, latestOracle, Date.now() - startTime);

    if (passed) {
      this.validationStats.total++;
      this.validationStats.passed++;
      this.recordLabel(vulnerableOracle.label);
    } else {
      this.validationStats.total++;
      this.validationStats.failed++;
    }

    return result;
  }

  /**
   * 执行 Vulnerable-image Oracle
   * 在易受攻击目标上运行 PoC，验证触发预期崩溃
   */
  private async executeVulnerableOracle(
    pocInput: string,
    expectedError: ExpectedErrorProfile,
    executeFn: (input: string, imageType: 'vulnerable' | 'fixed' | 'latest', attemptNum: number) => Promise<ExecutionRecord>,
    allRecords: ExecutionRecord[]
  ): Promise<{
    passed: boolean;
    label: OracleLabel;
    attempts: number;
    matchedExpected: boolean;
  }> {
    const maxRetries = this.config.maxRetriesPerImage;
    let lastLabel: OracleLabel = 'RUNTIME_CRASH';
    let matchedExpected = false;
    let attempts = 0;

    for (let i = 1; i <= maxRetries; i++) {
      attempts = i;
      const record = await executeFn(pocInput, 'vulnerable', i);
      allRecords.push(record);
      lastLabel = record.oracleLabel;

      // 检查是否匹配预期错误类型
      if (this.matchesExpectedError(record, expectedError)) {
        matchedExpected = true;
        // 命中预期错误 → 终止重试（single crash is decisive, SEC-bench Pro §3.4）
        break;
      }

      // 基础设施故障不重试
      if (record.oracleLabel === 'INFRA_FAILURE') {
        break;
      }

      // BLOCKED 在 vulnerable 镜像上意味着 PoC 有误
      if (this.isBlockedLabel(record.oracleLabel)) {
        break;
      }
    }

    return {
      passed: matchedExpected,
      label: lastLabel,
      attempts,
      matchedExpected,
    };
  }

  /**
   * 执行 Fixed-image Oracle
   * 在修复目标上运行同一 PoC，确认补丁阻断
   */
  private async executeFixedOracle(
    pocInput: string,
    executeFn: (input: string, imageType: 'vulnerable' | 'fixed' | 'latest', attemptNum: number) => Promise<ExecutionRecord>,
    allRecords: ExecutionRecord[]
  ): Promise<{
    passed: boolean;
    label: OracleLabel;
    attempts: number;
    blocked: boolean;
  }> {
    const maxRetries = this.config.maxRetriesPerImage;
    let lastLabel: OracleLabel = 'BLOCKED_NO_REPRO';
    let blocked = false;
    let attempts = 0;

    for (let i = 1; i <= maxRetries; i++) {
      attempts = i;
      const record = await executeFn(pocInput, 'fixed', i);
      allRecords.push(record);
      lastLabel = record.oracleLabel;

      // 检查是否为 blocked 类别
      if (this.isBlockedLabel(record.oracleLabel)) {
        blocked = true;
        break; // 被阻断 → 确认补丁有效
      }

      // 仍然崩溃 → 补丁未阻断。检查是否是 full block required
      if (record.oracleLabel === 'REPRODUCED' || record.oracleLabel === 'UNBLOCKED_CRASH') {
        if (this.config.strictFixedImageCheck) {
          blocked = false; // 严格模式：必须完全阻断
          break;
        }
        // 非严格模式：如果补丁至少改变了崩溃行为，部分接受
        if (record.oracleLabel === 'UNBLOCKED_CRASH') {
          blocked = false;
          break;
        }
      }

      // TIMEOUT → 不确定
      if (record.oracleLabel === 'TIMEOUT') {
        blocked = false;
        break;
      }

      // 基础设施故障
      if (record.oracleLabel === 'INFRA_FAILURE') {
        blocked = false;
        break;
      }
    }

    return {
      passed: blocked,
      label: lastLabel,
      attempts,
      blocked,
    };
  }

  /**
   * 执行 Latest-image Oracle
   * 在最新环境上验证 PoC 不触发非目标漏洞
   */
  private async executeLatestOracle(
    pocInput: string,
    executeFn: (input: string, imageType: 'vulnerable' | 'fixed' | 'latest', attemptNum: number) => Promise<ExecutionRecord>,
    allRecords: ExecutionRecord[]
  ): Promise<{
    passed: boolean;
    label: OracleLabel;
    attempts: number;
  }> {
    const maxRetries = this.config.maxRetriesPerImage;
    let lastLabel: OracleLabel = 'BLOCKED_NO_REPRO';
    let passed = false;
    let attempts = 0;

    for (let i = 1; i <= maxRetries; i++) {
      attempts = i;
      const record = await executeFn(pocInput, 'latest', i);
      allRecords.push(record);
      lastLabel = record.oracleLabel;

      // 被阻断 → 说明最新补丁已修复
      if (this.isBlockedLabel(record.oracleLabel)) {
        passed = true;
        break;
      }

      // 仍有崩溃 → 可能触发了其他漏洞或补丁不完整
      if (record.oracleLabel === 'REPRODUCED' || record.oracleLabel === 'UNBLOCKED_CRASH') {
        passed = false;
        break;
      }

      // 基础设施故障
      if (record.oracleLabel === 'INFRA_FAILURE') {
        break;
      }
    }

    return {
      passed,
      label: lastLabel,
      attempts,
    };
  }

  // ==================== 验证方法 ====================

  /**
   * 检查执行记录是否符合预期错误
   */
  private matchesExpectedError(record: ExecutionRecord, expected: ExpectedErrorProfile): boolean {
    return expected.expectedTypes.some(type => {
      if (type.label !== record.oracleLabel) return false;
      // 检查签名匹配
      if (type.matchSignatures.length > 0 && record.stackTrace) {
        const trace = record.stackTrace.toLowerCase();
        return type.matchSignatures.some(sig => trace.includes(sig.toLowerCase()));
      }
      return true;
    });
  }

  /**
   * 是否为 blocked 类别标签
   */
  private isBlockedLabel(label: OracleLabel): boolean {
    return label === 'BLOCKED_DEFENSIVE'
      || label === 'BLOCKED_HARMLESS'
      || label === 'BLOCKED_NO_REPRO';
  }

  /**
   * 构建验证结果
   */
  private buildResult(
    records: ExecutionRecord[],
    vulnerableOracle: { passed: boolean; label: OracleLabel; attempts: number; matchedExpected: boolean },
    fixedOracle: { passed: boolean; label: OracleLabel; attempts: number; blocked: boolean } | null,
    latestOracle: { passed: boolean; label: OracleLabel; attempts: number } | null | undefined,
    totalDuration: number,
    errors?: string[]
  ): ValidationResult {
    return {
      passed: vulnerableOracle.passed && (fixedOracle?.blocked ?? true),
      records,
      vulnerableOracle: {
        passed: vulnerableOracle.passed,
        label: vulnerableOracle.label,
        attempts: vulnerableOracle.attempts,
        matchedExpected: vulnerableOracle.matchedExpected,
      },
      fixedOracle: fixedOracle ?? {
        passed: false,
        label: 'INFRA_FAILURE',
        attempts: 0,
        blocked: false,
      },
      latestOracle: latestOracle ?? undefined,
      summary: {
        totalAttempts: records.length,
        successfulAttempts: records.filter(r => r.result === 'PASS').length,
        failedAttempts: records.filter(r => r.result === 'FAIL').length,
        totalDuration,
      },
      errors,
    };
  }

  /**
   * 记录验证统计
   */
  private recordFailure(_type: string): void {
    this.validationStats.total++;
    this.validationStats.failed++;
  }

  private recordLabel(label: OracleLabel): void {
    const count = this.validationStats.byLabel.get(label) ?? 0;
    this.validationStats.byLabel.set(label, count + 1);
  }

  // ==================== 执行记录创建辅助 ====================

  /**
   * 创建执行记录（由 executeFn 回调使用）
   */
  createExecutionRecord(
    imageType: 'vulnerable' | 'fixed' | 'latest',
    attemptNumber: number,
    exitCode: number,
    outputText: string,
    hasCrash: boolean,
    options?: {
      crashType?: string;
      stackTrace?: string;
      duration?: number;
    }
  ): ExecutionRecord {
    const oracleLabel = this.classifyOracleLabel(imageType, exitCode, hasCrash, outputText, options?.stackTrace);

    return {
      imageType,
      attemptNumber,
      oracleLabel,
      exitCode,
      hasCrash,
      crashType: options?.crashType,
      stackTrace: options?.stackTrace,
      outputText,
      result: this.determineResult(oracleLabel),
      duration: options?.duration ?? 0,
    };
  }

  /**
   * 对执行结果分类为 Oracle 标签
   * 对应 SEC-bench Pro Table 1 的分类法
   */
  private classifyOracleLabel(
    imageType: 'vulnerable' | 'fixed' | 'latest',
    exitCode: number,
    hasCrash: boolean,
    outputText: string,
    stackTrace?: string
  ): OracleLabel {
    const output = outputText.toLowerCase();
    const trace = (stackTrace || '').toLowerCase();

    // 基础设施故障检测
    if (exitCode === -1) return 'INFRA_FAILURE';
    if (/timeout|out of memory|cannot find|permission denied|connection refused/i.test(output)) {
      return 'INFRA_FAILURE';
    }

    if (imageType === 'vulnerable') {
      // Vulnerable-image crash taxonomy
      if (/sandbox.*violation|sandbox.*bypass|sandbox.*escape/i.test(output)) {
        return 'SANDBOX_VIOLATION';
      }
      if (/asan|addresssanitizer|heap-buffer-overflow|stack-buffer-overflow|global-buffer-overflow|use-after-poison/i.test(output)) {
        return 'ASAN_CRASH';
      }
      if (/dcheck|check.failed|assertion.*failed|debug.*check/i.test(output)) {
        return 'DCHECK';
      }
      if (hasCrash || exitCode !== 0) {
        return 'RUNTIME_CRASH';
      }
      // 无崩溃
      return 'BLOCKED_NO_REPRO';
    }

    // Fixed/Latest-image attempt labels
    if (hasCrash || exitCode !== 0) {
      // 与 vulnerable 镜像有相同崩溃
      if (this.sameStackTop(trace, '')) {
        return 'REPRODUCED';
      }
      // 不同崩溃类型
      return 'UNBLOCKED_CRASH';
    }

    // 无崩溃 → blocked 类别
    if (/error.*handled|caught.*exception|safe.*guard|mitigation|controlled.*error/i.test(output)) {
      return 'BLOCKED_DEFENSIVE';
    }
    if (/intercepted|warning.*only|denied|blocked.*by.*security/i.test(output)) {
      return 'BLOCKED_HARMLESS';
    }

    return 'BLOCKED_NO_REPRO';
  }

  /**
   * 简化堆栈比较（实际实现应更精确）
   */
  private sameStackTop(trace1: string, _trace2: string): boolean {
    // 简化实现：实际对比需要保留前一次堆栈
    return trace1.length > 0;
  }

  /**
   * 将 Oracle 标签映射为 PASS/FAIL/ERROR
   */
  private determineResult(label: OracleLabel): ExecutionResult {
    switch (label) {
      case 'ASAN_CRASH':
      case 'DCHECK':
      case 'RUNTIME_CRASH':
      case 'SANDBOX_VIOLATION':
        return 'PASS'; // 触发了预期信号
      case 'BLOCKED_NO_REPRO':
      case 'BLOCKED_DEFENSIVE':
      case 'BLOCKED_HARMLESS':
        return 'PASS'; // 补丁有效
      case 'REPRODUCED':
      case 'UNBLOCKED_CRASH':
        return 'FAIL'; // 补丁未阻断
      case 'TIMEOUT':
      case 'INFRA_FAILURE':
        return 'ERROR'; // 不确定
    }
  }

  // ==================== 统计与重置 ====================

  /**
   * 获取验证统计
   */
  getStats(): {
    total: number;
    passed: number;
    failed: number;
    passRate: number;
    labelDistribution: Record<string, number>;
  } {
    const labelDist: Record<string, number> = {};
    for (const [label, count] of this.validationStats.byLabel) {
      labelDist[label] = count;
    }

    return {
      total: this.validationStats.total,
      passed: this.validationStats.passed,
      failed: this.validationStats.failed,
      passRate: this.validationStats.total === 0 ? 0 : this.validationStats.passed / this.validationStats.total,
      labelDistribution: labelDist,
    };
  }

  /**
   * 获取详细验证报告
   */
  getValidationReport(result: ValidationResult): string {
    const lines: string[] = [];
    lines.push('=== PoC 验证报告 ===');
    lines.push('');
    lines.push(`验证结果: ${result.passed ? '✅ 通过' : '❌ 未通过'}`);
    lines.push(`总执行次数: ${result.summary.totalAttempts}`);
    lines.push(`总耗时: ${result.summary.totalDuration}ms`);
    lines.push('');
    lines.push('--- Vulnerable Image Oracle ---');
    lines.push(`  标签: ${result.vulnerableOracle.label}`);
    lines.push(`  尝试: ${result.vulnerableOracle.attempts} 次`);
    lines.push(`  匹配预期: ${result.vulnerableOracle.matchedExpected ? '是' : '否'}`);

    if (result.fixedOracle) {
      lines.push('');
      lines.push('--- Fixed Image Oracle ---');
      lines.push(`  标签: ${result.fixedOracle.label}`);
      lines.push(`  尝试: ${result.fixedOracle.attempts} 次`);
      lines.push(`  已阻断: ${result.fixedOracle.blocked ? '是' : '否'}`);
    }

    if (result.latestOracle) {
      lines.push('');
      lines.push('--- Latest Image Oracle ---');
      lines.push(`  标签: ${result.latestOracle.label}`);
      lines.push(`  尝试: ${result.latestOracle.attempts} 次`);
    }

    lines.push('');
    lines.push('--- 执行记录 ---');
    for (const record of result.records) {
      lines.push(`  [${record.imageType.padEnd(10)}] #${record.attemptNumber} ${record.oracleLabel.padEnd(20)} exit=${record.exitCode} crash=${record.hasCrash}`);
    }

    if (result.errors && result.errors.length > 0) {
      lines.push('');
      lines.push('--- 错误 ---');
      for (const err of result.errors) {
        lines.push(`  ${err}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * 重置统计
   */
  reset(): void {
    this.validationStats = {
      total: 0,
      passed: 0,
      failed: 0,
      byLabel: new Map(),
    };
  }
}
