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
  RiskLevel
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

// 核心类导出
export { HosSecEngine } from './core/engine';
export { SkillValidator } from './core/validator';
export { SkillMatcher } from './core/matcher';
export { SkillScorer } from './core/scorer';
export { SkillFormatter } from './core/formatter';
export { SkillLoader } from './core/loader';
export { FlowOrchestrator } from './core/orchestrator';
export { ReportGenerator } from './core/report';

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
