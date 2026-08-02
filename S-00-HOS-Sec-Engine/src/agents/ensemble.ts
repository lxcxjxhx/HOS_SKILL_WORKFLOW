/**
 * HOS-Sec-Engine V5 - Ensemble Agent Execution
 *
 * 基于 SEC-bench Pro 的多 Agent 集成策略实现。
 *
 * SEC-bench Pro 数据显示：Claude Code + Codex 联合（ensemble）在 V8 上达 37.9%
 * （vs 单 Agent 最高 32.0%），在 SpiderMonkey 上达 48.8%（vs 38.8%），
 * 联合提升分别达 18% 和 26%。
 *
 * 核心发现：不同 Agent 框架的失败模式互补。Claude Code 广撒网低转化，
 * Codex 高选择性高转化，二者的并集优于任一单 Agent。
 *
 * @see 可参考思路 技术报告 SEC-bench Pro.txt §4.2 RQ1
 */

import { AgentCoordinator } from './coordinator';
import { AgentTask, AgentResult, SubAgent } from './types';
import { SubAgentImpl } from './sub-agent';

// ==================== Types ====================

/**
 * Agent 策略类型
 * 对应 SEC-bench Pro 中的不同框架策略：
 * - `explorer`: 广度探索（类似 Claude Code 风格，多 PoC 尝试）
 * - `selective`: 高置信度（类似 Codex 风格，少而精）
 * - `balanced`: 平衡策略
 */
export type AgentStrategy = 'explorer' | 'selective' | 'balanced';

/**
 * Ensemble 执行策略
 */
export type EnsembleStrategy =
  /** 并行执行所有 Agent，取并集结果 */
  | 'parallel_union'
  /** 并行执行所有 Agent，取交集结果（共识） */
  | 'parallel_consensus'
  /** 串行执行：前一个结果输入到下一个 */
  | 'sequential_chained'
  /** 混合：先并行探索，再串行深化 */
  | 'hybrid_explore_then_exploit';

/**
 * Agent 配置
 */
export interface EnsembleAgentConfig {
  /** Agent 名称/标识 */
  name: string;
  /** 策略类型 */
  strategy: AgentStrategy;
  /** 该 Agent 使用的 Skill ID */
  skillId: string;
  /** 超时时间 (ms) */
  timeout: number;
  /** 是否启用结果缓存 */
  enableCache: boolean;
}

/** 默认 Explorer Agent 配置（仿 Claude Code 风格） */
const EXPLORER_CONFIG: EnsembleAgentConfig = {
  name: 'explorer',
  strategy: 'explorer',
  skillId: '',
  timeout: 120000,
  enableCache: false,
};

/** 默认 Selective Agent 配置（仿 Codex 风格） */
const SELECTIVE_CONFIG: EnsembleAgentConfig = {
  name: 'selective',
  strategy: 'selective',
  skillId: '',
  timeout: 120000,
  enableCache: true,
};

/**
 * Ensemble 执行结果
 */
export interface EnsembleResult {
  /** 各 Agent 的独立结果 */
  individualResults: Map<string, AgentResult>;
  /** 合并后的 findings */
  mergedFindings: EnsembleFinding[];
  /** 共识统计 */
  consensus: {
    /** 总 finding 数 */
    total: number;
    /** 达成共识的 finding 数 */
    agreed: number;
    /** 争议 finding 数 */
    disputed: number;
    /** 唯一 finding 数 */
    unique: number;
  };
  /** 执行统计 */
  stats: {
    /** 总执行时间 */
    totalDuration: number;
    /** 各 Agent 耗时 */
    agentDurations: Map<string, number>;
    /** 是否有 Agent 失败 */
    hasFailures: boolean;
  };
}

/**
 * Ensemble 聚合 finding
 * 带 Agent 来源跟踪和共识状态
 */
export interface EnsembleFinding {
  /** 来源 Skill ID */
  skillId: string;
  /** 描述 */
  description: string;
  /** 哪几个 Agent 都报告了此 finding */
  reportedBy: string[];
  /** 共识级别 */
  consensusLevel: 'unanimous' | 'majority' | 'minority' | 'unique';
  /** 置信度 (基于共识比例) */
  confidence: number;
  /** 严重程度 */
  severity: string;
  /** 证据 */
  evidence: string;
  /** 时间戳 */
  timestamp: string;
}

// ==================== EnsembleExecutor ====================

/**
 * Ensemble 执行器
 *
 * 管理多个 Agent 以不同策略并行或串行执行同一任务，
 * 对结果进行合并、去重、共识检测。
 *
 * 使用场景：
 * 1. 多 Skill 并行扫描不同接口（广度优先）
 * 2. 同一漏洞从不同角度验证（深度优先）
 * 3. 先广撒网探索，再针对性验证（混合模式）
 */
export class EnsembleExecutor {
  private agents: Map<string, SubAgent>;
  private agentConfigs: Map<string, EnsembleAgentConfig>;
  private coordinator: AgentCoordinator;
  private agentCounter: number;

  constructor(coordinator?: AgentCoordinator) {
    this.agents = new Map();
    this.agentConfigs = new Map();
    this.coordinator = coordinator ?? new AgentCoordinator();
    this.agentCounter = 0;
  }

  /**
   * 注册 Agent 到 Ensemble
   * @param config Agent 配置
   * @returns Agent ID
   */
  registerAgent(config: Partial<EnsembleAgentConfig> & { skillId: string }): string {
    const id = `ensemble-agent-${++this.agentCounter}`;
    const fullConfig: EnsembleAgentConfig = {
      name: config.name || `agent-${this.agentCounter}`,
      strategy: config.strategy || 'balanced',
      skillId: config.skillId,
      timeout: config.timeout || 120000,
      enableCache: config.enableCache ?? true,
    };

    const agent = new SubAgentImpl(id, fullConfig.name, fullConfig.skillId);
    this.agents.set(id, agent);
    this.agentConfigs.set(id, fullConfig);
    return id;
  }

  /**
   * 批量注册默认 Agent 组合
   * 创建 explorer 和 selective 两个互补 Agent
   *
   * 对应 SEC-bench Pro 中的 Claude Code (explorer) + Codex (selective) 组合
   */
  registerDefaultPair(skillId: string): { explorerId: string; selectiveId: string } {
    const explorerId = this.registerAgent({
      ...EXPLORER_CONFIG,
      name: 'explorer',
      skillId,
    });
    const selectiveId = this.registerAgent({
      ...SELECTIVE_CONFIG,
      name: 'selective',
      skillId,
    });
    return { explorerId, selectiveId };
  }

  /**
   * 执行 Ensemble 任务
   *
   * @param task 基础任务定义
   * @param strategy 集成策略
   * @returns 聚合结果
   */
  async execute(
    baseTask: Omit<AgentTask, 'id'>,
    strategy: EnsembleStrategy = 'parallel_union'
  ): Promise<EnsembleResult> {
    const startTime = Date.now();

    switch (strategy) {
      case 'parallel_union':
        return this.executeParallelUnion(baseTask);
      case 'parallel_consensus':
        return this.executeParallelConsensus(baseTask);
      case 'sequential_chained':
        return this.executeSequentialChained(baseTask);
      case 'hybrid_explore_then_exploit':
        return this.executeHybrid(baseTask);
      default:
        return this.executeParallelUnion(baseTask);
    }
  }

  /**
   * 并行执行 - 取并集（最大覆盖率，仿 SEC-bench Pro Union 策略）
   * 所有 Agent 独立执行，结果合并去重
   */
  private async executeParallelUnion(baseTask: Omit<AgentTask, 'id'>): Promise<EnsembleResult> {
    const startTime = Date.now();
    const results = new Map<string, AgentResult>();
    const agentDurations = new Map<string, number>();
    let hasFailures = false;

    // 所有 Agent 并行执行
    const promises: Promise<void>[] = [];
    for (const [agentId, agent] of this.agents) {
      const config = this.agentConfigs.get(agentId)!;
      const task: AgentTask = {
        ...baseTask,
        id: `union-${agentId}-${Date.now()}`,
        skillId: config.skillId,
        timeout: config.timeout,
        parameters: {
          ...baseTask.parameters,
          strategy: config.strategy,
        },
      };

      promises.push(
        agent.executeTask(task).then(result => {
          results.set(agentId, result);
          agentDurations.set(agentId, result.duration);
          if (result.status === 'failed' || result.status === 'timeout') {
            hasFailures = true;
          }
        })
      );
    }

    await Promise.all(promises);

    // 合并 findings（并集）
    const merged = this.mergeFindings(results);

    return {
      individualResults: results,
      mergedFindings: merged,
      consensus: this.calculateConsensus(merged),
      stats: {
        totalDuration: Date.now() - startTime,
        agentDurations,
        hasFailures,
      },
    };
  }

  /**
   * 并行执行 - 取共识（高置信度模式）
   * 只保留多个 Agent 都确认的 findings
   */
  private async executeParallelConsensus(baseTask: Omit<AgentTask, 'id'>): Promise<EnsembleResult> {
    const unionResult = await this.executeParallelUnion(baseTask);

    // 只保留 majority 或 unanimous 的 findings
    unionResult.mergedFindings = unionResult.mergedFindings.filter(
      f => f.consensusLevel === 'majority' || f.consensusLevel === 'unanimous'
    );

    return unionResult;
  }

  /**
   * 串行执行 - 链式传递
   * 前一个 Agent 的输出作为后一个的输入上下文
   */
  private async executeSequentialChained(baseTask: Omit<AgentTask, 'id'>): Promise<EnsembleResult> {
    const startTime = Date.now();
    const results = new Map<string, AgentResult>();
    const agentDurations = new Map<string, number>();
    let previousResults: AgentResult[] = [];
    let hasFailures = false;

    const agentIds = Array.from(this.agents.keys());

    for (const agentId of agentIds) {
      const config = this.agentConfigs.get(agentId)!;
      const agent = this.agents.get(agentId)!;

      const task: AgentTask = {
        ...baseTask,
        id: `chain-${agentId}-${Date.now()}`,
        skillId: config.skillId,
        timeout: config.timeout,
        context: {
          ...baseTask.context,
          previousResults,
        },
        parameters: {
          ...baseTask.parameters,
          strategy: config.strategy,
        },
      };

      const result = await agent.executeTask(task);
      results.set(agentId, result);
      agentDurations.set(agentId, result.duration);
      previousResults = [...previousResults, result];

      if (result.status === 'failed' || result.status === 'timeout') {
        hasFailures = true;
      }
    }

    const merged = this.mergeFindings(results);

    return {
      individualResults: results,
      mergedFindings: merged,
      consensus: this.calculateConsensus(merged),
      stats: {
        totalDuration: Date.now() - startTime,
        agentDurations,
        hasFailures,
      },
    };
  }

  /**
   * 混合执行：先探索（explorer）→ 再验证（selective）
   * Explorer 广撒网发现潜在问题，Selective 高置信度验证
   */
  private async executeHybrid(baseTask: Omit<AgentTask, 'id'>): Promise<EnsembleResult> {
    const startTime = Date.now();
    const results = new Map<string, AgentResult>();
    const agentDurations = new Map<string, number>();
    let hasFailures = false;

    // Phase 1: Explorer 探索
    const explorerAgents = this.getAgentsByStrategy('explorer');
    const explorerResults: AgentResult[] = [];

    for (const [agentId, agent] of explorerAgents) {
      const config = this.agentConfigs.get(agentId)!;
      const task: AgentTask = {
        ...baseTask,
        id: `explore-${agentId}-${Date.now()}`,
        skillId: config.skillId,
        timeout: config.timeout,
        parameters: {
          ...baseTask.parameters,
          strategy: 'explorer',
          phase: 'exploration',
        },
      };

      const result = await agent.executeTask(task);
      results.set(agentId, result);
      agentDurations.set(agentId, result.duration);
      explorerResults.push(result);
    }

    // Phase 2: Selective 基于探索结果验证
    const selectiveAgents = this.getAgentsByStrategy('selective');
    for (const [agentId, agent] of selectiveAgents) {
      const config = this.agentConfigs.get(agentId)!;
      const task: AgentTask = {
        ...baseTask,
        id: `exploit-${agentId}-${Date.now()}`,
        skillId: config.skillId,
        timeout: config.timeout,
        context: {
          ...baseTask.context,
          explorationResults: explorerResults,
          phase: 'verification',
        },
        parameters: {
          ...baseTask.parameters,
          strategy: 'selective',
          phase: 'verification',
          explorationFindings: explorerResults.flatMap(r => r.findings || []),
        },
      };

      const result = await agent.executeTask(task);
      results.set(agentId, result);
      agentDurations.set(agentId, result.duration);

      if (result.status === 'failed' || result.status === 'timeout') {
        hasFailures = true;
      }
    }

    const merged = this.mergeFindings(results);

    return {
      individualResults: results,
      mergedFindings: merged,
      consensus: this.calculateConsensus(merged),
      stats: {
        totalDuration: Date.now() - startTime,
        agentDurations,
        hasFailures,
      },
    };
  }

  // ==================== 结果合并 ====================

  /**
   * 合并多个 Agent 的 findings
   * 检测重复并计算共识级别
   */
  private mergeFindings(results: Map<string, AgentResult>): EnsembleFinding[] {
    const findingMap = new Map<string, EnsembleFinding>();

    for (const [agentId, result] of results) {
      const findings = result.findings || [];
      for (const f of findings) {
        const key = this.getFindingKey(f);
        const existing = findingMap.get(key);

        if (existing) {
          // 更新共识
          if (!existing.reportedBy.includes(agentId)) {
            existing.reportedBy.push(agentId);
            existing.confidence = existing.reportedBy.length / this.agents.size;
            existing.consensusLevel = this.classifyConsensus(existing.reportedBy.length);
          }
        } else {
          findingMap.set(key, {
            skillId: (f as any).skillId || '',
            description: (f as any).description || f.output || '',
            reportedBy: [agentId],
            consensusLevel: 'unique',
            confidence: 1 / this.agents.size,
            severity: (f as any).severity || 'medium',
            evidence: (f as any).evidence || f.output || '',
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    return Array.from(findingMap.values());
  }

  /**
   * 生成 finding 去重键
   */
  private getFindingKey(finding: any): string {
    const desc = (finding.description || finding.output || '').slice(0, 100).toLowerCase().trim();
    const skillId = (finding.skillId || '').toLowerCase();
    return `${skillId}|${desc}`;
  }

  /**
   * 计算共识统计
   */
  private calculateConsensus(findings: EnsembleFinding[]): { total: number; agreed: number; disputed: number; unique: number } {
    let agreed = 0;
    let disputed = 0;
    let unique = 0;

    for (const f of findings) {
      switch (f.consensusLevel) {
        case 'unanimous':
        case 'majority':
          agreed++;
          break;
        case 'minority':
          disputed++;
          break;
        case 'unique':
          unique++;
          break;
      }
    }

    return {
      total: findings.length,
      agreed,
      disputed,
      unique,
    };
  }

  /**
   * 共识级别分类
   */
  private classifyConsensus(reportedCount: number): 'unanimous' | 'majority' | 'minority' | 'unique' {
    const totalAgents = this.agents.size;
    if (totalAgents === 0) return 'unique';
    if (reportedCount === totalAgents) return 'unanimous';
    if (reportedCount > totalAgents / 2) return 'majority';
    if (reportedCount > 1) return 'minority';
    return 'unique';
  }

  /**
   * 按策略获取 Agent
   */
  private getAgentsByStrategy(strategy: AgentStrategy): Map<string, SubAgent> {
    const filtered = new Map<string, SubAgent>();
    for (const [id, agent] of this.agents) {
      const config = this.agentConfigs.get(id);
      if (config?.strategy === strategy) {
        filtered.set(id, agent);
      }
    }
    return filtered;
  }

  /**
   * 获取指定 Agent 的上次执行结果
   */
  getAgentResult(result: EnsembleResult, agentId: string): AgentResult | undefined {
    return result.individualResults.get(agentId);
  }

  /**
   * 获取 Ensemble 执行摘要
   */
  getSummary(result: EnsembleResult): string {
    const lines: string[] = [];
    lines.push('=== Ensemble 执行摘要 ===');
    lines.push('');
    lines.push(`总耗时: ${result.stats.totalDuration}ms`);
    lines.push(`Agent 数: ${this.agents.size}`);
    lines.push(`是否有失败: ${result.stats.hasFailures ? '是' : '否'}`);
    lines.push('');
    lines.push('--- 共识统计 ---');
    lines.push(`总 findings: ${result.consensus.total}`);
    lines.push(`共识一致: ${result.consensus.agreed}`);
    lines.push(`争议: ${result.consensus.disputed}`);
    lines.push(`唯一: ${result.consensus.unique}`);
    lines.push('');

    // 按共识级别分类列出 findings
    const byConsensus = new Map<string, EnsembleFinding[]>();
    for (const f of result.mergedFindings) {
      const key = f.consensusLevel;
      if (!byConsensus.has(key)) byConsensus.set(key, []);
      byConsensus.get(key)!.push(f);
    }

    for (const [level, items] of byConsensus) {
      lines.push(`  [${level.toUpperCase()}] ${items.length} 项`);
      for (const item of items.slice(0, 5)) {
        lines.push(`    ${item.description.slice(0, 80)}`);
      }
      if (items.length > 5) lines.push(`    ... 还有 ${items.length - 5} 项`);
    }

    return lines.join('\n');
  }

  /**
   * 清理所有 Agent
   */
  destroy(): void {
    for (const [, agent] of this.agents) {
      agent.terminate();
    }
    this.agents.clear();
    this.agentConfigs.clear();
  }

  /**
   * 获取已注册的 Agent 数量
   */
  getAgentCount(): number {
    return this.agents.size;
  }
}
