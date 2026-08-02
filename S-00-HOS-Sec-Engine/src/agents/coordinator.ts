import {
  AgentCoordination,
  AgentTask,
  AgentResult,
  SubAgent,
} from './types';
import { SubAgentImpl } from './sub-agent';

/**
 * HOS-Sec-Engine V4 - AgentCoordinator
 * 智能体协调器，负责任务分发、结果收集和并行/串行执行
 */
export class AgentCoordinator implements AgentCoordination {
  private agents: Map<string, SubAgent> = new Map();
  private results: Map<string, AgentResult> = new Map();
  private pendingResolvers = new Map<string, (result: AgentResult) => void>();
  private agentCounter: number = 0;

  private createAgentForTask(task: AgentTask): SubAgent {
    const id = `agent-${++this.agentCounter}`;
    const agent = new SubAgentImpl(id, `Agent-${id}`, task.skillId);
    this.agents.set(id, agent);
    return agent;
  }

  dispatchTask(task: AgentTask): string {
    const agent = this.createAgentForTask(task);
    // Start execution asynchronously
    agent.executeTask(task).then((result) => {
      const resolver = this.pendingResolvers.get(agent.id);
      if (resolver) {
        this.pendingResolvers.delete(agent.id);
        resolver(result);
      } else {
        this.results.set(agent.id, result);
      }
    }).catch((error) => {
      const errorResult: AgentResult = {
        taskId: task.id,
        status: 'failed',
        output: '',
        findings: [],
        evidence: [],
        duration: 0,
        error: error.message,
      };
      const resolver = this.pendingResolvers.get(agent.id);
      if (resolver) {
        this.pendingResolvers.delete(agent.id);
        resolver(errorResult);
      } else {
        this.results.set(agent.id, errorResult);
      }
    });
    return agent.id;
  }

  async collectResult(agentId: string): Promise<AgentResult> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    // If result is already available, return it immediately
    if (this.results.has(agentId)) {
      const r = this.results.get(agentId)!;
      this.results.delete(agentId);
      return r;
    }

    // Otherwise, create a promise and store its resolver for when the result arrives
    return new Promise<AgentResult>((resolve) => {
      this.pendingResolvers.set(agentId, resolve);
    });
  }

  async executeParallel(tasks: AgentTask[]): Promise<AgentResult[]> {
    const promises = tasks.map(async (task) => {
      const agent = this.createAgentForTask(task);
      return agent.executeTask(task);
    });
    return Promise.all(promises);
  }

  async executeSequential(tasks: AgentTask[]): Promise<AgentResult[]> {
    const results: AgentResult[] = [];
    let previousResults: AgentResult[] = [];

    for (const task of tasks) {
      const agent = this.createAgentForTask(task);
      // Pass previous results into context for chaining
      task.context.previousResults = previousResults;
      const result = await agent.executeTask(task);
      results.push(result);
      previousResults = [...results];
    }

    return results;
  }

  async broadcastQuery(query: string): Promise<AgentResult[]> {
    const results: Promise<AgentResult>[] = [];

    for (const [agentId, agent] of this.agents) {
      const task: AgentTask = {
        id: `broadcast-${agentId}-${Date.now()}`,
        type: 'research',
        skillId: agent.skillId,
        context: { query },
        parameters: { query },
        timeout: 30000,
      };
      results.push(agent.executeTask(task));
    }

    return Promise.all(results);
  }
}
