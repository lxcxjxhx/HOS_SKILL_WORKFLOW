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
export { SkillFormatter } from './core/formatter';
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

// V4 自维护能力导出

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

// V5: SEC-bench Pro 启发的新模块导出
export { LLMJudge, llmJudge } from './core/judge';
export type {
  JudgeVerdict, Verdict, FailureMode, ErrorLevel,
  ThreeStateEvidence, ExecutionEvidence, JudgeConfig
} from './core/judge';
export { EnsembleExecutor } from './agents/ensemble';
export type {
  EnsembleResult, EnsembleFinding, EnsembleStrategy,
  AgentStrategy, EnsembleAgentConfig
} from './agents/ensemble';
export { PoCValidator } from './core/poc-validator';
export type {
  ValidationResult, ExpectedErrorProfile, OracleLabel,
  ExecutionRecord, ValidatorConfig
} from './core/poc-validator';
export { TokenEfficiencyAnalyzer, tokenAnalyzer } from './utils/token-efficiency';
export type { TokenRecord, EfficiencyReport, EarlyStopSignal } from './utils/token-efficiency';
export { FailureModeTracker, failureTracker } from './utils/failure-tracker';
export type { FailureCategory, FailureSignature, FailureStatsEntry, FailureModeReport } from './utils/failure-tracker';

// V6: MCP 自我管理层导出
export {
  // MCP 注册中心
  MCPRegistry, mcpRegistry,
  // MCP 自动发现
  MCPDiscovery, mcpDiscovery,
  // MCP 工具路由
  MCPRouter, mcpRouter,
  // MCP 健康监控
  MCPHealthMonitor, mcpHealthMonitor,
} from './mcp';

export type {
  // MCP 服务器类型
  MCPServer, MCPServerConfig, MCPServerIdentity,
  MCPStatus, MCPRuntime,
  // MCP 工具和能力
  MCPTool, MCPCapability,
  // MCP 注册
  MCPRegistryEvent, MCPEventHandler,
  // MCP 路由
  MCPToolCall, MCPToolResult,
  MCPRouteQuery, MCPRoutingStrategy,
  SkillMCPMapping,
  // MCP 健康
  MCPHealthCheckResult, MCPHealthSummary,
  // MCP 发现
  MCPDiscoveryConfig, MCPDiscoveryResult,
} from './mcp';
