/**
 * HOS-Sec-Engine V4 - Agents Module
 * 多智能体协作框架
 */

export {
  SubAgent,
  AgentTask,
  AgentResult,
  AgentStatus,
  AgentCoordination,
} from './types';

export { SubAgentImpl } from './sub-agent';
export { AgentCoordinator } from './coordinator';
export { AgentPool } from './agent-pool';
// V5: Ensemble 多 Agent 集成
export { EnsembleExecutor } from './ensemble';
export type {
  EnsembleResult, EnsembleFinding, EnsembleStrategy,
  AgentStrategy, EnsembleAgentConfig
} from './ensemble';
