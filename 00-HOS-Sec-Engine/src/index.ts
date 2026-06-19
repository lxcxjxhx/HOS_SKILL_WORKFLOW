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

// 核心类导出
export { HosSecEngine } from './core/engine';
export { SkillValidator } from './core/validator';
export { SkillMatcher } from './core/matcher';
export { SkillScorer } from './core/scorer';
export { SkillFormatter } from './core/formatter';
export { SkillLoader } from './core/loader';

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
