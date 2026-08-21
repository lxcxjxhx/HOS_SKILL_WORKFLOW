import { SubAgent } from './types';
import { SubAgentImpl } from './sub-agent';

/**
 * HOS-Sec-Engine V4 - AgentPool
 * 智能体连接池，管理可复用的 SubAgent 实例
 */
export class AgentPool {
  private pool: SubAgent[] = [];
  private activeAgents: Map<string, SubAgent> = new Map();
  private maxPoolSize: number;
  private agentCounter: number = 0;

  constructor(maxPoolSize: number = 10) {
    this.maxPoolSize = maxPoolSize;
  }

  /**
   * 创建一个新的 SubAgent 并放入池中（如果未达到上限）
   * 创建后的 agent 状态为 idle，可通过 getAgent() 获取
   */
  createAgent(name: string, skillId: string): SubAgent {
    if (this.pool.length + this.activeAgents.size >= this.maxPoolSize) {
      throw new Error(
        `Agent pool is full (max size: ${this.maxPoolSize}). Release some agents before creating new ones.`
      );
    }

    const id = `pool-agent-${++this.agentCounter}`;
    const agent = new SubAgentImpl(id, name, skillId);
    this.pool.push(agent);
    return agent;
  }

  /**
   * 从池中获取一个空闲的 Agent
   */
  getAgent(): SubAgent | null {
    if (this.pool.length === 0) {
      return null;
    }
    const agent = this.pool.pop()!;
    this.activeAgents.set(agent.id, agent);
    return agent;
  }

  /**
   * 释放一个 Agent 回池中以便复用
   * 会终止当前任务并重置状态为 idle
   */
  releaseAgent(agentId: string): void {
    const agent = this.activeAgents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found in active agents`);
    }

    // 重置状态为 idle 以便复用
    agent.reset();
    
    this.activeAgents.delete(agentId);

    if (this.pool.length < this.maxPoolSize) {
      this.pool.push(agent);
    }
  }

  /**
   * 获取当前活跃 Agent 数量
   */
  getActiveCount(): number {
    return this.activeAgents.size;
  }

  /**
   * 获取池中空闲 Agent 数量
   */
  getIdleCount(): number {
    return this.pool.length;
  }

  /**
   * 获取池总大小（空闲 + 活跃）
   */
  getTotalCount(): number {
    return this.pool.length + this.activeAgents.size;
  }

  /**
   * 根据 ID 获取 Agent（不论其在池中还是活跃状态）
   * 返回 null 如果不存在
   */
  getAgentById(agentId: string): SubAgent | null {
    return this.activeAgents.get(agentId) ?? this.pool.find(a => a.id === agentId) ?? null;
  }

  /**
   * 获取 Agent 的当前状态
   * 返回 'idle' | 'active' | 'unknown'
   */
  getAgentState(agentId: string): 'idle' | 'active' | 'unknown' {
    if (this.activeAgents.has(agentId)) {
      return 'active';
    }
    if (this.pool.some(a => a.id === agentId)) {
      return 'idle';
    }
    return 'unknown';
  }

  /**
   * 清理所有 Agent
   */
  destroy(): void {
    for (const agent of this.pool) {
      agent.terminate();
    }
    this.pool = [];

    for (const [, agent] of this.activeAgents) {
      agent.terminate();
    }
    this.activeAgents.clear();
  }
}
