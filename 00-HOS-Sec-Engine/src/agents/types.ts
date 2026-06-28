/**
 * HOS-Sec-Engine V4 - Agents Module Types
 * 多智能体协作框架核心数据结构
 */

export interface SubAgent {
  id: string;
  name: string;
  skillId: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  executeTask(input: AgentTask): Promise<AgentResult>;
  getStatus(): AgentStatus;
  terminate(): void;
  reset(): void;
}

export interface AgentTask {
  id: string;
  type: 'skill_execution' | 'research' | 'validation' | 'exploitation';
  skillId: string;
  context: Record<string, any>;
  parameters: Record<string, any>;
  timeout: number;
}

export interface AgentResult {
  taskId: string;
  status: 'success' | 'failed' | 'timeout';
  output: string;
  findings: any[];
  evidence: string[];
  duration: number;
  error?: string;
}

export interface AgentStatus {
  agentId: string;
  status: string;
  currentTask?: string;
  uptime: number;
}

export interface AgentCoordination {
  dispatchTask(task: AgentTask): string;
  collectResult(agentId: string): Promise<AgentResult>;
  executeParallel(tasks: AgentTask[]): Promise<AgentResult[]>;
  executeSequential(tasks: AgentTask[]): Promise<AgentResult[]>;
  broadcastQuery(query: string): Promise<AgentResult[]>;
}
