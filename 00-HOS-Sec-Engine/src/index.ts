/**
 * HOS-Sec-Engine V2
 * 攻防专项 Skill Engine - 将攻防专家经验转化为标准化 Skill
 */

// 类型导出
export type {
  AttackDefenseSkill,
  Metadata,
  Trigger,
  Knowledge,
  Action,
  Validation,
  Defense,
  Quality,
  Example,
  RiskLevel,
  SkillRuntime
} from './types/skill';

export type {
  SkillResult,
  MatchDetail,
  EngineConfig,
  ExecuteQuery
} from './types/result';

export type {
  Playbook,
  PlaybookMetadata,
  PlaybookPhase,
  Finding,
  FlowContext,
  PhaseResult,
  FlowSummary,
  OrchestrationResult,
  FlowStatus,
  PlaybookConfig
} from './types/playbook';

// V4 Runtime types
export type {
  AIProviderConfig,
  RuntimeConfig,
  SandboxConfig,
  SkillRuntime as SkillRuntimeConfig,
  ProviderType
} from './config/types';

export type {
  SubAgent,
  AgentTask,
  AgentResult,
  AgentStatus,
  AgentCoordination
} from './agents/types';

export type {
  ExecutionContext as RuntimeExecutionContext,
  ExecutionLog,
  ServerConfig
} from './runtime/types';

// 核心类导出
export { HosSecEngine } from './core/engine';
export { SkillValidator } from './core/validator';
export { SkillMatcher } from './core/matcher';
export { SkillScorer } from './core/scorer';
export { SkillFormatter } from './core/formatter';
export { SkillLoader } from './core/loader';
export { FlowOrchestrator } from './core/orchestrator';
export { ReportGenerator } from './core/report';

// V4 Runtime 类导出
export { ProviderManager } from './config/provider-manager';
export { ConfigLoader } from './config/config-loader';
export { AgentCoordinator } from './agents/coordinator';
export { AgentPool } from './agents/agent-pool';
export { SubAgentImpl } from './agents/sub-agent';
export { ExecutionContextManager } from './runtime/execution-context';
export { Sandbox, TimeoutError, SecurityError } from './runtime/sandbox';
export { AgentServer } from './runtime/server';

// 预设 Skill 导出（自动发现）
export {
  allSkills,
  webSkills,
  apiSkills,
  cloudSkills,
  windowsSkills,
  linuxSkills,
  aiSecuritySkills,
  adSkills,
  mobileSkills,
  containerSkills,
  kubernetesSkills,
  codeReviewSkills,
} from './skills';

// 预定义流程导出
export {
  allPlaybooks,
  getPlaybooksByCategory,
  getPlaybookById,
  webPentestFull,
  apiSecurityReview,
  domainPentest,
  cloudConfigAudit,
  codeReviewJava,
} from './playbooks';
