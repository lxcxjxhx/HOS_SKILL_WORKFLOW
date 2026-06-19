import { HosSecEngine } from './engine';
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
import type { SkillResult } from '../types/result';

/**
 * HOS-Sec-Engine V3 - 流程执行引擎
 * 攻防流程编排核心实现，支持阶段执行、上下文传递、暂停/恢复、回滚
 */
export class FlowOrchestrator {
  private engine: HosSecEngine;
  private playbook: Playbook | null = null;
  private status: FlowStatus = {
    playbookId: '',
    currentPhaseId: null,
    status: 'idle',
    completedPhases: [],
    skippedPhases: [],
    totalFindings: 0
  };
  private phaseResults: Map<string, PhaseResult> = new Map();
  private isPaused = false;
  private pausedAtPhase: string | null = null;

  constructor(engine: HosSecEngine) {
    this.engine = engine;
  }

  /**
   * 加载流程定义
   * @param playbook 流程定义对象
   */
  loadPlaybook(playbook: Playbook): void {
    this.playbook = playbook;
    this.status = {
      playbookId: playbook.id,
      currentPhaseId: null,
      status: 'idle',
      completedPhases: [],
      skippedPhases: [],
      totalFindings: 0
    };
    this.phaseResults.clear();
    this.isPaused = false;
    this.pausedAtPhase = null;
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

    const startTime = new Date().toISOString();
    this.status.status = 'running';

    // 按 order 排序阶段
    const sortedPhases = [...this.playbook.phases].sort((a, b) => a.order - b.order);

    let currentContext: FlowContext = { ...context };
    const results: PhaseResult[] = [];
    let stopped = false;

    for (const phase of sortedPhases) {
      // 检查是否被跳过
      if (this.status.skippedPhases.includes(phase.id)) {
        results.push({
          phaseId: phase.id,
          phaseName: phase.name,
          skillsExecuted: [],
          findings: [],
          duration: '0ms',
          status: 'skipped'
        });
        continue;
      }

      // 检查条件
      if (phase.condition && !this.checkCondition(phase.condition, currentContext)) {
        results.push({
          phaseId: phase.id,
          phaseName: phase.name,
          skillsExecuted: [],
          findings: [],
          duration: '0ms',
          status: 'skipped'
        });
        continue;
      }

      // 检查下一阶段条件（前置检查）
      if (phase.nextPhaseCondition && !this.checkCondition(phase.nextPhaseCondition, currentContext)) {
        // 不满足条件，跳过当前及后续所有阶段
        results.push({
          phaseId: phase.id,
          phaseName: phase.name,
          skillsExecuted: [],
          findings: [],
          duration: '0ms',
          status: 'skipped'
        });
        break;
      }

      // 执行阶段
      this.status.currentPhaseId = phase.id;
      const phaseResult = await this.executePhaseInternal(phase, currentContext);
      results.push(phaseResult);
      this.phaseResults.set(phase.id, phaseResult);
      this.status.completedPhases.push(phase.id);

      // 合并发现结果到上下文
      currentContext.findings = [...currentContext.findings, ...phaseResult.findings];
      currentContext.history = [...currentContext.history, phaseResult];
      this.status.totalFindings = currentContext.findings.length;

      // 检查是否出现 critical 级别需要停止
      const hasCritical = phaseResult.findings.some(f => f.severity === 'critical');
      if (hasCritical && this.shouldStopOnCritical()) {
        stopped = true;
        break;
      }

      // 检查暂停状态
      if (this.isPaused) {
        this.pausedAtPhase = phase.id;
        this.status.status = 'paused';
        const endTime = new Date().toISOString();
        return this.buildResult(currentContext, results, startTime, endTime, stopped ? 'partial' : 'paused');
      }
    }

    const endTime = new Date().toISOString();
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
   * 内部方法：执行单个阶段的具体逻辑
   */
  private async executePhaseInternal(phase: PlaybookPhase, context: FlowContext): Promise<PhaseResult> {
    const phaseStart = Date.now();

    // 调用 engine.executeRaw 匹配相关 Skill
    const query = {
      scenario: `${context.target} ${phase.description} ${phase.name}`,
      categories: [],
      subCategories: [],
      riskLevels: [],
      tags: []
    };

    // 如果有指定的 skill IDs，按 ID 匹配；否则按场景匹配
    let skillResults: SkillResult[];
    if (phase.skills && phase.skills.length > 0) {
      skillResults = [];
      for (const skillId of phase.skills) {
        const skill = this.engine.getSkillById(skillId);
        if (skill) {
          skillResults.push({
            skill,
            matchScore: 1.0,
            matchDetails: {
              scenarioScore: 1.0,
              keywordScore: 1.0,
              aliasScore: 0,
              indicatorScore: 0,
              matchedKeywords: [],
              matchedAliases: [],
              matchedIndicators: []
            }
          });
        }
      }
    } else {
      skillResults = this.engine.executeRaw(query);
    }

    // 将 SkillResult 转换为 Finding
    const findings = this.convertToFindings(skillResults);

    const duration = `${Date.now() - phaseStart}ms`;

    return {
      phaseId: phase.id,
      phaseName: phase.name,
      skillsExecuted: skillResults,
      findings,
      duration,
      status: 'completed'
    };
  }

  /**
   * 将 SkillResult 转换为 Finding
   * 仅当 matchScore > 0.5 且 riskLevel 为 high/critical 时创建
   */
  private convertToFindings(results: SkillResult[]): Finding[] {
    const findings: Finding[] = [];

    for (const result of results) {
      const { skill, matchScore } = result;
      if (matchScore > 0.5 && (skill.metadata.riskLevel === 'high' || skill.metadata.riskLevel === 'critical')) {
        findings.push({
          skillId: skill.metadata.id,
          severity: skill.metadata.riskLevel,
          description: skill.knowledge.description,
          evidence: skill.knowledge.observations.join('; ') || skill.knowledge.description,
          timestamp: new Date().toISOString()
        });
      }
    }

    return findings;
  }

  /**
   * 条件检查：智能语义匹配
   * - 抽象关键词（如 "vulnerabilities"）：检查 context.findings 是否有内容
   * - "accessGained"：检查 accessLevel 不是 "anonymous"
   * - "highPrivilege"：检查 accessLevel 包含 admin/root/system
   * - 其他：使用字符串包含匹配
   */
  private checkCondition(condition: string, context: FlowContext): boolean {
    const cond = condition.toLowerCase();

    // 抽象关键词：检查是否有发现
    if (['vulnerabilities', 'vulns', 'findings', 'misconfigurations', 'issues'].includes(cond)) {
      return context.findings.length > 0;
    }

    // accessGained：检查不是匿名访问
    if (cond === 'accessgained') {
      return context.accessLevel.toLowerCase() !== 'anonymous';
    }

    // highPrivilege：检查是否包含高权限关键词
    if (cond === 'highprivilege') {
      const level = context.accessLevel.toLowerCase();
      return level.includes('admin') || level.includes('root') || level.includes('system');
    }

    // authFlaws / idorFindings / deserializationVulns / injectionPoints 等：检查是否有相关 findings
    if (cond.endsWith('flaws') || cond.endsWith('findings') || cond.endsWith('vulns') || cond.endsWith('vulnerabilities')) {
      return context.findings.length > 0;
    }

    // credentials / users / tokens 等：检查 findings 中是否有相关内容
    if (['credentials', 'users', 'tokens', 'hashes', 'dcaccess'].includes(cond)) {
      return context.findings.length > 0;
    }

    // 其他：使用字符串包含匹配
    const targetMatch = context.target.toLowerCase().includes(cond);
    if (targetMatch) return true;

    const accessMatch = context.accessLevel.toLowerCase().includes(cond);
    if (accessMatch) return true;

    const findingMatch = context.findings.some(f =>
      f.description.toLowerCase().includes(cond)
    );
    if (findingMatch) return true;

    return false;
  }

  /**
   * 检查是否配置了 stopOnCritical
   */
  private shouldStopOnCritical(): boolean {
    // 默认开启 stopOnCritical
    return true;
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

    // 找到暂停点之后的阶段继续执行
    const sortedPhases = [...this.playbook.phases].sort((a, b) => a.order - b.order);
    const startIndex = sortedPhases.findIndex(p => p.id === pausedPhaseId);
    const remainingPhases = sortedPhases.slice(startIndex + 1);

    // 构建已有结果
    const existingResults: PhaseResult[] = [];
    for (const phase of sortedPhases.slice(0, startIndex + 1)) {
      const result = this.phaseResults.get(phase.id);
      if (result) {
        existingResults.push(result);
      }
    }

    // 恢复上下文
    const resumedContext: FlowContext = {
      target: '',
      findings: [],
      accessLevel: '',
      history: [...existingResults],
      customData: {}
    };

    // 从已有结果恢复上下文
    for (const result of existingResults) {
      resumedContext.findings = [...resumedContext.findings, ...result.findings];
    }

    let currentContext: FlowContext = { ...resumedContext };
    const newResults: PhaseResult[] = [];

    for (const phase of remainingPhases) {
      if (this.status.skippedPhases.includes(phase.id)) {
        newResults.push({
          phaseId: phase.id,
          phaseName: phase.name,
          skillsExecuted: [],
          findings: [],
          duration: '0ms',
          status: 'skipped'
        });
        continue;
      }

      if (phase.condition && !this.checkCondition(phase.condition, currentContext)) {
        newResults.push({
          phaseId: phase.id,
          phaseName: phase.name,
          skillsExecuted: [],
          findings: [],
          duration: '0ms',
          status: 'skipped'
        });
        continue;
      }

      this.status.currentPhaseId = phase.id;
      const phaseResult = await this.executePhaseInternal(phase, currentContext);
      newResults.push(phaseResult);
      this.phaseResults.set(phase.id, phaseResult);
      this.status.completedPhases.push(phase.id);

      currentContext.findings = [...currentContext.findings, ...phaseResult.findings];
      currentContext.history = [...currentContext.history, phaseResult];
      this.status.totalFindings = currentContext.findings.length;

      const hasCritical = phaseResult.findings.some(f => f.severity === 'critical');
      if (hasCritical && this.shouldStopOnCritical()) {
        break;
      }
    }

    const allResults = [...existingResults, ...newResults];
    const startTime = existingResults[0]?.skillsExecuted[0]?.skill.metadata.updatedAt || new Date().toISOString();
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
    if (!this.status.skippedPhases.includes(phaseId)) {
      this.status.skippedPhases.push(phaseId);
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

    const sortedPhases = [...this.playbook.phases].sort((a, b) => a.order - b.order);
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

    // 构建回滚后的上下文和结果
    const keptResults: PhaseResult[] = [];
    const findings: Finding[] = [];

    for (const phase of sortedPhases.slice(0, targetIndex)) {
      const result = this.phaseResults.get(phase.id);
      if (result) {
        keptResults.push(result);
        findings.push(...result.findings);
      }
    }

    const context: FlowContext = {
      target: '',
      findings,
      accessLevel: '',
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

    const sortedPhases = [...this.playbook.phases].sort((a, b) => a.order - b.order);

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
      } else if (this.status.skippedPhases.includes(phase.id)) {
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
   * 构建流程摘要
   */
  private buildSummary(phaseResults: PhaseResult[], context: FlowContext): FlowSummary {
    let totalSkills = 0;
    let critical = 0;
    let high = 0;
    let medium = 0;
    let low = 0;
    const exploited: string[] = [];

    for (const result of phaseResults) {
      totalSkills += result.skillsExecuted.length;
      for (const finding of result.findings) {
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
    }

    return {
      totalSkillsExecuted: totalSkills,
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
    const lines: string[] = [];

    lines.push('=== HOS-Sec-Engine 审计报告 ===');
    lines.push('');
    lines.push(`流程 ID: ${this.playbook?.id ?? ''}`);
    lines.push(`流程名称: ${this.playbook?.name ?? ''}`);
    lines.push('');
    lines.push('--- 执行摘要 ---');
    lines.push(`总执行 Skill 数: ${summary.totalSkillsExecuted}`);
    lines.push(`Critical: ${summary.criticalFindings}`);
    lines.push(`High: ${summary.highFindings}`);
    lines.push(`Medium: ${summary.mediumFindings}`);
    lines.push(`Low: ${summary.lowFindings}`);
    lines.push(`达到的访问级别: ${summary.achievedAccessLevel}`);
    lines.push('');

    lines.push('--- 阶段详情 ---');
    for (const result of phaseResults) {
      lines.push(`\n[${result.status.toUpperCase()}] ${result.phaseName} (${result.phaseId})`);
      lines.push(`  持续时间: ${result.duration}`);
      lines.push(`  执行 Skill 数: ${result.skillsExecuted.length}`);

      if (result.findings.length > 0) {
        lines.push(`  发现 (${result.findings.length}):`);
        for (const finding of result.findings) {
          lines.push(`    - [${finding.severity.toUpperCase()}] ${finding.skillId}: ${finding.description.substring(0, 100)}...`);
        }
      }
    }

    return lines.join('\n');
  }

  /**
   * 构建修复建议
   */
  private buildRecommendations(phaseResults: PhaseResult[]): string[] {
    const recommendations: string[] = [];

    for (const result of phaseResults) {
      for (const skillResult of result.skillsExecuted) {
        const recs = skillResult.skill.defense?.recommendations ?? [];
        for (const rec of recs) {
          if (!recommendations.includes(rec)) {
            recommendations.push(rec);
          }
        }
      }
    }

    return recommendations;
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
    if (this.status.skippedPhases.includes(phaseId)) {
      return '[-]';
    }
    if (this.status.currentPhaseId === phaseId) {
      return '[>]';
    }
    return '[ ]';
  }
}
