import { SubAgent, AgentTask, AgentResult, AgentStatus } from './types';

/**
 * HOS-Sec-Engine V4 - SubAgent
 * 管理单个智能体生命周期的实现类
 */
export class SubAgentImpl implements SubAgent {
  id: string;
  name: string;
  skillId: string;
  status: 'idle' | 'running' | 'completed' | 'failed' = 'idle';
  private _currentTaskId?: string;
  private _startTime: number;
  private _timeoutTimer?: NodeJS.Timeout;

  constructor(id: string, name: string, skillId: string) {
    this.id = id;
    this.name = name;
    this.skillId = skillId;
    this._startTime = Date.now();
  }

  async executeTask(input: AgentTask): Promise<AgentResult> {
    this.status = 'running';
    this._currentTaskId = input.id;
    const taskStart = Date.now();

    return new Promise<AgentResult>((resolve) => {
      // Timeout handling
      this._timeoutTimer = setTimeout(() => {
        this.status = 'failed';
        this._currentTaskId = undefined;
        resolve({
          taskId: input.id,
          status: 'timeout',
          output: `Task ${input.id} timed out after ${input.timeout}ms`,
          findings: [],
          evidence: [],
          duration: Date.now() - taskStart,
          error: 'Task execution timeout',
        });
      }, input.timeout);

      // Simulate task execution
      // In production, this would invoke the actual skill execution
      setTimeout(() => {
        if (this._timeoutTimer) {
          clearTimeout(this._timeoutTimer);
        }

        const duration = Date.now() - taskStart;
        this.status = 'completed';
        this._currentTaskId = undefined;

        resolve({
          taskId: input.id,
          status: 'success',
          output: `Agent [${this.name}] executed skill [${input.skillId}] successfully`,
          findings: [],
          evidence: [],
          duration,
        });
      }, Math.min(100, input.timeout));
    });
  }

  getStatus(): AgentStatus {
    return {
      agentId: this.id,
      status: this.status,
      currentTask: this._currentTaskId,
      uptime: Date.now() - this._startTime,
    };
  }

  terminate(): void {
    if (this._timeoutTimer) {
      clearTimeout(this._timeoutTimer);
      this._timeoutTimer = undefined;
    }
    this.status = 'failed';
    this._currentTaskId = undefined;
  }
}
