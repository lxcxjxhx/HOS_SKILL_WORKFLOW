/**
 * HOS-Sec-Engine V3 - 流程编排类型定义
 * 攻防流程编排（Orchestration Layer）核心数据结构
 */

import type { SkillResult } from './result';

/** 流程元数据 */
export interface PlaybookMetadata {
  /** 作者 */
  author?: string;
  /** 版本号 */
  version: string;
  /** 预估时间，如 "2-4小时" */
  estimatedTime?: string;
  /** 难度等级 */
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  /** 前置条件 */
  prerequisites: string[];
  /** 适用环境 */
  targetEnvironment: string[];
}

/** 流程阶段 */
export interface PlaybookPhase {
  /** 阶段 ID，如 "recon" */
  id: string;
  /** 阶段名称 */
  name: string;
  /** 执行顺序 */
  order: number;
  /** 阶段描述 */
  description: string;
  /** 该阶段涉及的 Skill IDs */
  skills: string[];
  /** 执行条件（可选） */
  condition?: string;
  /** 期望输出字段 */
  outputSchema?: string[];
  /** 进入下一阶段的条件 */
  nextPhaseCondition?: string;
}

/** 攻防流程定义 */
export interface Playbook {
  /** 唯一标识，如 "web-app-pentest" */
  id: string;
  /** 流程名称 */
  name: string;
  /** 流程描述 */
  description: string;
  /** 业务场景分类 */
  category: string;
  /** 阶段列表 */
  phases: PlaybookPhase[];
  /** 元数据 */
  metadata: PlaybookMetadata;
}

/** 发现结果 */
export interface Finding {
  /** 来源 Skill ID */
  skillId: string;
  /** 严重程度 */
  severity: string;
  /** 描述 */
  description: string;
  /** 证据 */
  evidence: string;
  /** 时间戳 */
  timestamp: string;
}

/** 流程上下文 */
export interface FlowContext {
  /** 目标地址 */
  target: string;
  /** 发现的漏洞/线索 */
  findings: Finding[];
  /** 获取的凭据 */
  credentials?: string[];
  /** 当前访问级别 */
  accessLevel: string;
  /** 历史执行记录 */
  history: PhaseResult[];
  /** 自定义数据 */
  customData: Record<string, any>;
}

/** 阶段执行结果 */
export interface PhaseResult {
  /** 阶段 ID */
  phaseId: string;
  /** 阶段名称 */
  phaseName: string;
  /** 已执行的 Skill 结果 */
  skillsExecuted: SkillResult[];
  /** 发现结果 */
  findings: Finding[];
  /** 持续时间 */
  duration: string;
  /** 执行状态 */
  status: 'completed' | 'skipped' | 'failed';
}

/** 流程摘要 */
export interface FlowSummary {
  /** 总执行 Skill 数 */
  totalSkillsExecuted: number;
  /** 严重级别发现数 */
  criticalFindings: number;
  /** 高级别发现数 */
  highFindings: number;
  /** 中级别发现数 */
  mediumFindings: number;
  /** 低级别发现数 */
  lowFindings: number;
  /** 已利用的漏洞 */
  exploitedVulnerabilities: string[];
  /** 达到的访问级别 */
  achievedAccessLevel: string;
}

/** 流程执行结果 */
export interface OrchestrationResult {
  /** 流程 ID */
  playbookId: string;
  /** 流程名称 */
  playbookName: string;
  /** 目标地址 */
  target: string;
  /** 开始时间 */
  startTime: string;
  /** 结束时间 */
  endTime: string;
  /** 执行状态 */
  status: 'completed' | 'paused' | 'failed' | 'partial';
  /** 各阶段执行结果 */
  phaseResults: PhaseResult[];
  /** 流程摘要 */
  summary: FlowSummary;
  /** 格式化的审计报告 */
  report: string;
  /** 修复建议 */
  recommendations: string[];
}

/** 流程状态 */
export interface FlowStatus {
  /** 当前流程 ID */
  playbookId: string;
  /** 当前阶段 ID */
  currentPhaseId: string | null;
  /** 执行状态 */
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
  /** 已完成的阶段 */
  completedPhases: string[];
  /** 已跳过的阶段 */
  skippedPhases: string[];
  /** 当前发现的 Finding 数量 */
  totalFindings: number;
}

/** 流程配置 */
export interface PlaybookConfig {
  /** 包含的阶段 */
  includePhases?: string[];
  /** 跳过的阶段 */
  excludePhases?: string[];
  /** 替换特定阶段的 Skill */
  skillOverrides?: Record<string, string[]>;
  /** 最大执行时间（毫秒） */
  maxExecutionTime?: number;
  /** 发现严重漏洞时停止 */
  stopOnCritical?: boolean;
}
