/**
 * HOS-Sec-Engine V2 - Process 流程类型定义
 * 渗透测试流程编排的核心数据结构
 */

/** 流程模板 - 描述一次完整的渗透测试流程 */
export interface ProcessTemplate {
  /** 唯一标识，如 "web-pentest-full" */
  id: string;
  /** 名称，如 "Web 渗透测试完整流程" */
  name: string;
  /** 描述 */
  description: string;
  /** 分类: web/api/cloud */
  category: string;
  /** 版本号 */
  version: string;
  /** 阶段列表 */
  phases: Phase[];
  /** 全局决策树 */
  decisionTree: DecisionNode[];
}

/** 阶段 - 流程中的一个执行阶段 */
export interface Phase {
  /** 阶段 ID，如 "reconnaissance" */
  id: string;
  /** 阶段名称，如 "信息收集" */
  name: string;
  /** 描述 */
  description: string;
  /** 该阶段包含的步骤 */
  steps: PhaseStep[];
  /** 执行条件（可选），如 "accessGained" 表示需要已获得访问权限 */
  condition?: string;
  /** 成功标准列表 */
  successCriteria: string[];
  /** 最大重试次数 */
  maxRetries: number;
  /** 超时时间（秒） */
  timeout: number;
}

/** 阶段步骤 - 单个可执行步骤 */
export interface PhaseStep {
  /** 步骤 ID */
  id: string;
  /** 步骤名称 */
  name: string;
  /** 步骤描述 */
  description: string;
  /** 调用的工具 */
  toolCall: ToolCall;
  /** 预期输出描述 */
  expectedOutput: string;
  /** 验证规则（可选） */
  validationRule?: string;
}

/** 工具调用 - 描述一次 MCP 工具调用 */
export interface ToolCall {
  /** 工具名称，如 "web_fetch", "search_google" */
  tool: string;
  /** 工具参数 */
  params: Record<string, any>;
  /** 输出转换规则（可选） */
  transform?: string;
}

/** 决策节点 - 根据阶段结果决定下一步 */
export interface DecisionNode {
  /** 决策节点 ID */
  id: string;
  /** 源阶段 ID，决策基于这个阶段的结果 */
  sourcePhase: string;
  /** 条件列表 */
  conditions: DecisionCondition[];
  /** 默认下一阶段（无匹配条件时） */
  defaultNext: string | null;
}

/** 决策条件 - 一个条件分支 */
export interface DecisionCondition {
  /** 判断规则，如 "result.hasVulnerability('sqli')" */
  rule: string;
  /** 条件满足时进入的下一阶段 */
  nextPhase: string;
  /** 条件描述 */
  description: string;
}

/** 阶段执行结果 */
export interface PhaseResult {
  phaseId: string;
  status: 'success' | 'failure' | 'partial' | 'skipped';
  findings: ProcessFinding[];
  toolResults: ToolResult[];
  /** 执行耗时（毫秒） */
  duration: number;
  error?: string;
}

/** 流程执行发现 */
export interface ProcessFinding {
  id: string;
  /** 漏洞类型，如 "sqli", "xss" */
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  description: string;
  evidence: string;
  /** 关联的 CVE */
  cveMatches: CveMatch[];
  timestamp: string;
}

/** CVE 匹配结果 */
export interface CveMatch {
  cveId: string;
  severity: string;
  description: string;
  affectedVersions: string[];
  pocLink?: string;
}

/** 工具调用结果 */
export interface ToolResult {
  tool: string;
  params: Record<string, any>;
  output: string;
  success: boolean;
  duration: number;
  error?: string;
}

/** 流程执行上下文 */
export interface ProcessContext {
  /** 目标 URL */
  target: string;
  /** 流程类型 */
  processType: string;
  currentPhase: string | null;
  completedPhases: string[];
  findings: ProcessFinding[];
  /** 自定义状态存储 */
  state: Record<string, any>;
  startTime: string;
}

/** 流程执行结果 */
export interface ProcessResult {
  templateId: string;
  context: ProcessContext;
  phaseResults: PhaseResult[];
  status: 'running' | 'completed' | 'failed' | 'stopped';
  summary: {
    totalFindings: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    cveReferences: number;
    duration: number;
  };
}