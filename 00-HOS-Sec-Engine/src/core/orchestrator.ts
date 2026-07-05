import {
  Playbook,
  PlaybookPhase,
  FlowContext,
  PhaseResult,
  OrchestrationResult,
  FlowStatus,
  Finding,
  FlowSummary,
  PlaybookConfig
} from '../types/playbook';
import { ProcessEngine } from './process-engine';
import { CVEIntegrator, cveIntegrator } from './cve-integration';
import { ProcessFinding } from '../types/process';

// V5: SEC-bench Pro LLM Judge 集成
import { LLMJudge, ExecutionEvidence, ThreeStateEvidence, llmJudge as defaultJudge } from './judge';

/**
 * HOS-Sec-Engine V3 - 流程执行引擎
 * 攻防流程编排核心实现，支持阶段执行、上下文传递、暂停/恢复、回滚
 */

/** 最大阶段迭代次数，防止异常流程定义导致无限循环 */
export const MAX_PHASE_ITERATIONS = 200;

/** 最大 findings 数量，防止异常数据导致性能问题 */
export const MAX_FINDINGS = 1000;

/** 最大 recommendations 数量 */
export const MAX_RECOMMENDATIONS = 200;

export class FlowOrchestrator {
  private playbook: Playbook | null = null;
  private playbookConfig: PlaybookConfig | null = null;
  private originalContextTarget: string = '';
  private originalContextAccessLevel: string = '';
  private status: FlowStatus = {
    playbookId: '',
    currentPhaseId: null,
    status: 'idle',
    completedPhases: [],
    skippedPhases: [],
    totalFindings: 0
  };
  private skippedPhasesSet: Set<string> = new Set();
  private phaseResults: Map<string, PhaseResult> = new Map();
  private isPaused = false;
  private pausedAtPhase: string | null = null;
  private cachedSortedPhases: PlaybookPhase[] | null = null;
  // V5: LLM Judge 实例（可选，未设置时使用默认单例）
  private _judge: LLMJudge | null = null;
  private processEngine?: ProcessEngine;
  private cveIntegrator: CVEIntegrator;

  constructor(processEngine?: ProcessEngine) {
    this.processEngine = processEngine;
    this.cveIntegrator = cveIntegrator;
  }

  /**
   * V5: 设置 LLM Judge 实例（若未设置则使用默认单例）
   */
  setJudge(judge: LLMJudge): void {
    this._judge = judge;
  }

  /**
   * V5: 获取当前 LLM Judge 实例
   */
  private getJudge(): LLMJudge {
    return this._judge ?? defaultJudge;
  }

  /**
   * V5: 使用 LLM Judge 验证阶段 findings
   * 基于 SEC-bench Pro 的三证据模型，过滤误报
   * @param findings 原始 findings
   * @returns 验证后的 findings
   */
  private validateFindingsWithJudge(findings: Finding[]): Finding[] {
    if (findings.length === 0) return [];

    const judge = this.getJudge();
    const validated: Finding[] = [];
    let verifiedCount = 0;
    let illegalCount = 0;

    for (const finding of findings) {
      // 构建 primary evidence（基于 finding 本身的证据）
      const primaryEvidence: ThreeStateEvidence = {
        target: finding.skillId,
        executionOutput: finding.evidence || finding.description,
        exitCode: finding.severity === 'critical' || finding.severity === 'high' ? 1 : 0,
        hasCrashSignal: finding.severity === 'critical' || finding.severity === 'high',
        errorType: finding.severity,
        stackTrace: finding.evidence,
      };

      const evidence: ExecutionEvidence = {
        primary: primaryEvidence,
      };

      const verdict = judge.judge(finding, evidence);

      if (verdict.verdict === 'verified') {
        validated.push(finding);
        verifiedCount++;
      } else {
        illegalCount++;
      }
    }

    if (illegalCount > 0) {
      console.log(`[FlowOrchestrator] LLM Judge 过滤了 ${illegalCount}/${findings.length} 个 findings（可疑误报）`);
    }

    return validated;
  }

  /**
   * 加载流程定义
   * @param playbook 流程定义对象
   * @param config 可选的流程配置
   */
  loadPlaybook(playbook: Playbook, config?: PlaybookConfig): void {
    this.playbook = playbook;
    this.playbookConfig = config || null;
    this.status = {
      playbookId: playbook.id,
      currentPhaseId: null,
      status: 'idle',
      completedPhases: [],
      skippedPhases: [],
      totalFindings: 0
    };
    this.skippedPhasesSet.clear();
    this.phaseResults.clear();
    this.isPaused = false;
    this.pausedAtPhase = null;
    this.cachedSortedPhases = [...playbook.phases].sort((a, b) => a.order - b.order);
  }

  /**
   * 执行完整流程
   * @param context 流程上下文
   * @returns 流程执行结果
   */
  async executeFlow(context: FlowContext): Promise<OrchestrationResult> {
    if (!this.playbook) {
      throw new Error('未加载流程定义，请先调用 loadPlaybook()');
    }

    // 保存原始上下文信息供 resume 使用
    this.originalContextTarget = context.target;
    this.originalContextAccessLevel = context.accessLevel;

    const startTime = new Date().toISOString();
    this.status.status = 'running';

    const sortedPhases = this.cachedSortedPhases!;
    let currentContext: FlowContext = { ...context };
    const results: PhaseResult[] = [];

    const { stopped, paused } = await this._executePhaseLoop(
      sortedPhases,
      currentContext,
      results,
      true, // checkNextPhaseCondition
      () => { this.pausedAtPhase = this.status.currentPhaseId; }
    );

    const endTime = new Date().toISOString();
    if (paused) {
      return this.buildResult(currentContext, results, startTime, endTime, 'paused');
    }

    this.status.status = stopped ? 'paused' : 'completed';
    this.status.currentPhaseId = null;

    return this.buildResult(currentContext, results, startTime, endTime, stopped ? 'partial' : 'completed');
  }

  /**
   * 执行单个阶段
   * @param phaseId 阶段 ID
   * @param context 流程上下文
   * @returns 阶段执行结果
   */
  async executePhase(phaseId: string, context: FlowContext): Promise<PhaseResult> {
    if (!this.playbook) {
      throw new Error('未加载流程定义，请先调用 loadPlaybook()');
    }

    const phase = this.playbook.phases.find(p => p.id === phaseId);
    if (!phase) {
      throw new Error(`阶段 ${phaseId} 不存在`);
    }

    return this.executePhaseInternal(phase, context);
  }

  /**
   * 构建跳过状态的 PhaseResult
   */
  private _buildSkippedResult(phase: PlaybookPhase): PhaseResult {
    return {
      phaseId: phase.id,
      phaseName: phase.name,
      skillsExecuted: [],
      findings: [],
      duration: '0ms',
      status: 'skipped'
    };
  }

  /**
   * 处理阶段执行后的结果：更新上下文、状态、检查 critical 和暂停
   * @returns true 表示需要中断循环
   */
  private _processPhaseResult(
    phase: PlaybookPhase,
    phaseResult: PhaseResult,
    context: FlowContext,
    results: PhaseResult[],
    onPaused: () => void
  ): boolean {
    results.push(phaseResult);
    this.phaseResults.set(phase.id, phaseResult);
    this.status.completedPhases.push(phase.id);

    context.findings = [...context.findings, ...phaseResult.findings];
    context.history = [...context.history, phaseResult];
    this.status.totalFindings = context.findings.length;

    // 检查是否出现 critical 级别需要停止
    const hasCritical = phaseResult.findings.some(f => f.severity === 'critical');
    if (hasCritical && this.shouldStopOnCritical()) {
      return true;
    }

    // 检查暂停状态
    if (this.isPaused) {
      this.pausedAtPhase = phase.id;
      this.status.status = 'paused';
      return true;
    }

    return false;
  }

  /**
   * 检查阶段是否应跳过（通过 skip 集合或条件不满足）
   * @returns { shouldSkip: boolean, shouldBreak: boolean } - shouldBreak 仅在 nextPhaseCondition 不满足时为 true
   */
  private _trySkipPhase(
    phase: PlaybookPhase,
    context: FlowContext,
    results: PhaseResult[],
    checkNextPhaseCondition: boolean = false
  ): { shouldSkip: boolean; shouldBreak: boolean } {
    if (this.skippedPhasesSet.has(phase.id)) {
      results.push(this._buildSkippedResult(phase));
      return { shouldSkip: true, shouldBreak: false };
    }

    if (phase.condition && !this.checkCondition(phase.condition, context)) {
      results.push(this._buildSkippedResult(phase));
      return { shouldSkip: true, shouldBreak: false };
    }

    if (checkNextPhaseCondition && phase.nextPhaseCondition && !this.checkCondition(phase.nextPhaseCondition, context)) {
      results.push(this._buildSkippedResult(phase));
      return { shouldSkip: true, shouldBreak: true };
    }

    return { shouldSkip: false, shouldBreak: false };
  }

  /**
   * 通用阶段循环执行逻辑
   */
  private async _executePhaseLoop(
    phases: PlaybookPhase[],
    context: FlowContext,
    results: PhaseResult[],
    checkNextPhaseCondition: boolean = false,
    onPaused: () => void = () => {}
  ): Promise<{ stopped: boolean; paused: boolean }> {
    let stopped = false;
    let paused = false;
    let iterationCount = 0;

    for (const phase of phases) {
      // 最大迭代次数保护，防止异常流程定义导致无限循环
      if (++iterationCount > MAX_PHASE_ITERATIONS) {
        console.warn(`[FlowOrchestrator] 达到最大阶段迭代次数 (${MAX_PHASE_ITERATIONS})，终止执行`);
        stopped = true;
        break;
      }

      const skipResult = this._trySkipPhase(phase, context, results, checkNextPhaseCondition);
      if (skipResult.shouldSkip) {
        if (skipResult.shouldBreak) {
          break;
        }
        continue;
      }

      this.status.currentPhaseId = phase.id;
      const phaseResult = await this.executePhaseInternal(phase, context);
      const shouldBreak = this._processPhaseResult(phase, phaseResult, context, results, onPaused);
      if (shouldBreak) {
        stopped = true;
        break;
      }
    }

    return { stopped, paused };
  }

  /**
   * 内部方法：执行单个阶段的具体逻辑
   */
  private async executePhaseInternal(phase: PlaybookPhase, context: FlowContext): Promise<PhaseResult> {
    const phaseStart = Date.now();
    let findings: Finding[] = [];

    // 使用 processEngine 执行（如果可用）
    if (this.processEngine) {
      try {
        const processResult = await this.processEngine.execute(
          context.target,
          phase.name,
          { phaseId: phase.id, phaseDescription: phase.description, ...context.customData }
        );
        // 将 ProcessFinding 转换为 Finding
        for (const pr of processResult.phaseResults) {
          for (const pf of pr.findings) {
            if (findings.length >= MAX_FINDINGS) break;
            findings.push({
              skillId: pf.id,
              severity: pf.severity,
              description: pf.description,
              evidence: pf.evidence,
              timestamp: pf.timestamp
            });
          }
          if (findings.length >= MAX_FINDINGS) break;
        }
      } catch (err) {
        console.warn(`[FlowOrchestrator] processEngine 执行阶段 ${phase.id} 失败:`, err);
      }
    }

    // V5: LLM Judge 验证（过滤疑似误报）
    findings = this.validateFindingsWithJudge(findings);

    // CVE 富化：为 findings 关联 CVE 信息
    if (findings.length > 0) {
      findings = await this.enrichFindingsWithCVE(findings);
    }

    const duration = `${Date.now() - phaseStart}ms`;

    return {
      phaseId: phase.id,
      phaseName: phase.name,
      findings,
      duration,
      status: 'completed'
    };
  }

  /** 抽象条件词：检查是否有 findings 即可 */
  private static readonly FINDINGS_CONDITIONS = new Set([
    'vulnerabilities', 'vulns', 'findings', 'misconfigurations', 'issues',
    'credentials', 'users', 'tokens', 'hashes', 'dcaccess',
  ]);

  /** 后缀匹配抽象条件：以这些结尾的词也通过 findings 判断 */
  private static readonly FINDINGS_SUFFIXES = ['flaws', 'findings', 'vulns', 'vulnerabilities'];

  /**
   * 条件检查：智能语义匹配
   * - 抽象关键词（如 "vulnerabilities", "credentials"）：检查 context.findings 是否有内容
   * - "accessGained"：检查 accessLevel 不是 "anonymous"
   * - "highPrivilege"：检查 accessLevel 包含 admin/root/system
   * - 以 flaws/findings/vulns/vulnerabilities 结尾：检查 findings 是否有内容
   * - 其他：使用字符串包含匹配
   */
  private checkCondition(condition: string, context: FlowContext): boolean {
    const cond = condition.toLowerCase().trim();
    if (!cond) return true; // empty condition = pass

    const hasFindings = context.findings.length > 0;

    // 抽象关键词和 findings 相关词
    if (FlowOrchestrator.FINDINGS_CONDITIONS.has(cond)) return hasFindings;
    if (FlowOrchestrator.FINDINGS_SUFFIXES.some(s => cond.endsWith(s))) return hasFindings;

    // accessGained：检查不是匿名访问
    if (cond === 'accessgained') {
      return context.accessLevel.toLowerCase() !== 'anonymous';
    }

    // highPrivilege：检查是否包含高权限关键词
    if (cond === 'highprivilege') {
      const level = context.accessLevel.toLowerCase();
      return level.includes('admin') || level.includes('root') || level.includes('system');
    }

    // 其他：使用字符串包含匹配
    return context.target.toLowerCase().includes(cond)
      || context.accessLevel.toLowerCase().includes(cond)
      || context.findings.some(f => f.description.toLowerCase().includes(cond));
  }

  /**
   * 检查是否配置了 stopOnCritical
   */
  private shouldStopOnCritical(): boolean {
    // 从 PlaybookConfig 读取，默认关闭
    return this.playbookConfig?.stopOnCritical ?? false;
  }

  /**
   * 暂停流程执行
   */
  pause(): void {
    this.isPaused = true;
  }

  /**
   * 恢复流程执行
   * @returns 恢复后的流程结果
   */
  async resume(): Promise<OrchestrationResult> {
    if (!this.isPaused || !this.playbook) {
      throw new Error('流程未处于暂停状态');
    }

    this.isPaused = false;
    const pausedPhaseId = this.pausedAtPhase;
    this.pausedAtPhase = null;
    this.status.status = 'running';

    // 找到暂停点之后的阶段继续执行（已缓存排序）
    const sortedPhases = this.cachedSortedPhases!;
    const startIndex = sortedPhases.findIndex(p => p.id === pausedPhaseId);
    if (startIndex === -1) {
      throw new Error(`无法找到暂停点阶段: ${pausedPhaseId}`);
    }
    const remainingPhases = sortedPhases.slice(startIndex + 1);

    // 一次性构建已有结果和恢复的 findings
    const existingResults: PhaseResult[] = [];
    const findings: Finding[] = [];
    for (let i = 0; i <= startIndex; i++) {
      const result = this.phaseResults.get(sortedPhases[i].id);
      if (result) {
        existingResults.push(result);
        findings.push(...result.findings);
      }
    }

    // 恢复上下文
    const resumedContext: FlowContext = {
      target: this.originalContextTarget,
      findings,
      accessLevel: this.originalContextAccessLevel,
      history: [...existingResults],
      customData: {}
    };

    let currentContext: FlowContext = { ...resumedContext };
    const newResults: PhaseResult[] = [];

    await this._executePhaseLoop(
      remainingPhases,
      currentContext,
      newResults,
      false // resume does NOT check nextPhaseCondition
    );

    const allResults = [...existingResults, ...newResults];
    const startTime = new Date().toISOString();
    const endTime = new Date().toISOString();

    this.status.status = 'completed';
    this.status.currentPhaseId = null;

    return this.buildResult(currentContext, allResults, startTime, endTime, 'completed');
  }

  /**
   * 跳过指定阶段
   * @param phaseId 阶段 ID
   */
  skipPhase(phaseId: string): void {
    if (!this.skippedPhasesSet.has(phaseId)) {
      this.skippedPhasesSet.add(phaseId);
      this.status.skippedPhases = Array.from(this.skippedPhasesSet);
    }
  }

  /**
   * 回滚到指定阶段
   * 清除该阶段及之后所有阶段的执行结果
   * @param phaseId 目标阶段 ID
   * @returns 回滚后的流程结果
   */
  async rollbackTo(phaseId: string): Promise<OrchestrationResult> {
    if (!this.playbook) {
      throw new Error('未加载流程定义');
    }

    const sortedPhases = this.cachedSortedPhases!;
    const targetIndex = sortedPhases.findIndex(p => p.id === phaseId);
    if (targetIndex === -1) {
      throw new Error(`阶段 ${phaseId} 不存在`);
    }

    // 清除目标阶段及之后的结果
    const phasesToRemove = sortedPhases.slice(targetIndex).map(p => p.id);
    for (const id of phasesToRemove) {
      this.phaseResults.delete(id);
    }

    // 更新状态
    this.status.completedPhases = this.status.completedPhases.filter(id => !phasesToRemove.includes(id));
    this.status.currentPhaseId = phaseId;

    // 一次性构建回滚后的结果、发现和上下文
    const keptResults: PhaseResult[] = [];
    const findings: Finding[] = [];
    for (let i = 0; i < targetIndex; i++) {
      const result = this.phaseResults.get(sortedPhases[i].id);
      if (result) {
        keptResults.push(result);
        findings.push(...result.findings);
      }
    }

    const context: FlowContext = {
      target: this.originalContextTarget,
      findings,
      accessLevel: this.originalContextAccessLevel,
      history: keptResults,
      customData: {}
    };

    const startTime = new Date().toISOString();
    const endTime = new Date().toISOString();
    this.status.status = 'paused';
    this.status.totalFindings = findings.length;

    return this.buildResult(context, keptResults, startTime, endTime, 'paused');
  }

  /**
   * 获取当前流程状态
   * @returns 流程状态对象
   */
  getStatus(): FlowStatus {
    return { ...this.status };
  }

  /**
   * 流程可视化输出
   * @returns 格式化的流程状态字符串
   */
  visualizeStatus(): string {
    if (!this.playbook) {
      return '未加载流程定义';
    }

    const lines: string[] = [];
    lines.push(`流程: ${this.playbook.name} (${this.playbook.id})`);
    lines.push(`状态: ${this.getStatusText(this.status.status)}`);
    lines.push('');

    const sortedPhases = this.cachedSortedPhases!;

    for (const phase of sortedPhases) {
      const icon = this.getPhaseIcon(phase.id);
      const result = this.phaseResults.get(phase.id);
      const findingCount = result?.findings.length ?? 0;

      let detail = '';
      if (result) {
        detail = ` [${result.status}]`;
        if (findingCount > 0) {
          detail += ` 发现: ${findingCount}`;
        }
      } else if (this.skippedPhasesSet.has(phase.id)) {
        detail = ' [已跳过]';
      }

      lines.push(`  ${icon} ${phase.name}${detail}`);
    }

    lines.push('');
    lines.push(`总发现: ${this.status.totalFindings}`);

    return lines.join('\n');
  }

  /**
   * 构建流程执行结果
   * 直接从 context.findings 获取 findings，避免重复遍历 phaseResults
   */
  private buildResult(
    context: FlowContext,
    phaseResults: PhaseResult[],
    startTime: string,
    endTime: string,
    status: OrchestrationResult['status']
  ): OrchestrationResult {
    if (!this.playbook) {
      throw new Error('未加载流程定义');
    }

    const summary = this.buildSummary(phaseResults, context);
    const report = this.buildReport(phaseResults, summary);
    const recommendations = this.buildRecommendations(phaseResults);

    return {
      playbookId: this.playbook.id,
      playbookName: this.playbook.name,
      target: context.target,
      startTime,
      endTime,
      status,
      phaseResults,
      summary,
      report,
      recommendations
    };
  }

  /**
   * CVE 富化：为 findings 关联 CVE 信息
   * 将 Finding 转换为 ProcessFinding 调用 CVEIntegrator，再将 CVE 结果写回 Finding
   */
  private async enrichFindingsWithCVE(findings: Finding[]): Promise<Finding[]> {
    const enriched: Finding[] = [];
    for (const finding of findings) {
      const processFinding: ProcessFinding = {
        id: finding.skillId,
        type: 'unknown',
        severity: finding.severity as ProcessFinding['severity'],
        description: finding.description,
        evidence: finding.evidence,
        cveMatches: [],
        timestamp: finding.timestamp,
      };
      const result = await this.cveIntegrator.enrichFindingWithCVE(processFinding);
      if (result.cveMatches.length > 0) {
        const cveList = result.cveMatches.map(m => `${m.cveId} (${m.severity})`).join('; ');
        finding.evidence = `${finding.evidence}\n[CVE] ${cveList}`;
        finding.severity = result.severity;
        console.log(`[FlowOrchestrator] CVE 富化: ${finding.skillId} -> ${cveList}`);
      }
      enriched.push(finding);
    }
    return enriched;
  }

  /**
   * 构建流程摘要
   */
  private buildSummary(phaseResults: PhaseResult[], context: FlowContext): FlowSummary {
    let critical = 0;
    let high = 0;
    let medium = 0;
    let low = 0;
    const exploited: string[] = [];

    for (const result of phaseResults) {
      for (const finding of result.findings) {
        if (exploited.length >= MAX_FINDINGS) break;
        switch (finding.severity) {
          case 'critical':
            critical++;
            exploited.push(finding.description);
            break;
          case 'high':
            high++;
            exploited.push(finding.description);
            break;
          case 'medium':
            medium++;
            break;
          case 'low':
            low++;
            break;
        }
      }
      if (exploited.length >= MAX_FINDINGS) break;
    }

    return {
      totalSkillsExecuted: 0,
      criticalFindings: critical,
      highFindings: high,
      mediumFindings: medium,
      lowFindings: low,
      exploitedVulnerabilities: exploited,
      achievedAccessLevel: context.accessLevel
    };
  }

  /**
   * 构建审计报告
   */
  private buildReport(phaseResults: PhaseResult[], summary: FlowSummary): string {
    const phaseSections = phaseResults.map(result => {
      const findingsSection = result.findings.length > 0
        ? `  发现 (${result.findings.length}):\n${result.findings.map(f => {
            const desc = f.description.length > 100 ? f.description.substring(0, 100) + '...' : f.description;
            return `    - [${f.severity.toUpperCase()}] ${f.skillId}: ${desc}`;
          }).join('\n')}`
        : '';

      return `[${result.status.toUpperCase()}] ${result.phaseName} (${result.phaseId})
  持续时间: ${result.duration}${findingsSection ? '\n' + findingsSection : ''}`;
    }).join('\n');

    return `=== HOS-Sec-Engine 审计报告 ===

流程 ID: ${this.playbook?.id ?? ''}
流程名称: ${this.playbook?.name ?? ''}

--- 执行摘要 ---
总执行 Skill 数: ${summary.totalSkillsExecuted}
Critical: ${summary.criticalFindings}
High: ${summary.highFindings}
Medium: ${summary.mediumFindings}
Low: ${summary.lowFindings}
达到的访问级别: ${summary.achievedAccessLevel}

--- 阶段详情 ---

${phaseSections}`;
  }

  /**
   * 构建修复建议
   */
  private buildRecommendations(phaseResults: PhaseResult[]): string[] {
    const recSet = new Set<string>();

    for (const result of phaseResults) {
      if (recSet.size >= MAX_RECOMMENDATIONS) break;
      for (const finding of result.findings) {
        if (recSet.size >= MAX_RECOMMENDATIONS) break;
        recSet.add(`[${finding.severity.toUpperCase()}] ${finding.skillId}: ${finding.description}`);
      }
    }

    return Array.from(recSet);
  }

  /**
   * 获取状态文本
   */
  private getStatusText(status: FlowStatus['status']): string {
    const statusMap: Record<FlowStatus['status'], string> = {
      idle: '空闲',
      running: '运行中',
      paused: '已暂停',
      completed: '已完成',
      failed: '失败'
    };
    return statusMap[status] ?? status;
  }

  /**
   * 获取阶段图标
   */
  private getPhaseIcon(phaseId: string): string {
    if (this.status.completedPhases.includes(phaseId)) {
      return '[√]';
    }
    if (this.skippedPhasesSet.has(phaseId)) {
      return '[-]';
    }
    if (this.status.currentPhaseId === phaseId) {
      return '[>]';
    }
    return '[ ]';
  }
}
