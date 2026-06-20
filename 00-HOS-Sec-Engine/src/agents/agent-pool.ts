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
   */
  releaseAgent(agentId: string): void {
    const agent = this.activeAgents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found in active agents`);
    }

    agent.terminate();
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
