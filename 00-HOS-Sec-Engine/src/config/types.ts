/**
 * HOS-Sec-Engine V4 - 配置类型定义
 * AI Provider、运行时、沙箱配置
 */

/** AI Provider 类型 */
export type ProviderType = 'openai' | 'anthropic' | 'local' | 'custom';

/** AI Provider 配置 */
export interface AIProviderConfig {
  /** Provider ID，如 "openai", "claude", "local" */
  id: string;
  /** 显示名称 */
  name: string;
  /** Provider 类型 */
  type: ProviderType;
  /** API 基础 URL */
  baseUrl: string;
  /** API Key */
  apiKey: string;
  /** 模型名称 */
  model: string;
  /** 最大 Token 数 */
  maxTokens: number;
  /** 温度参数 */
  temperature: number;
  /** 请求超时（毫秒） */
  timeout: number;
}

/** 沙箱配置 */
export interface SandboxConfig {
  /** 是否启用沙箱 */
  enabled: boolean;
  /** 网络访问级别 */
  networkAccess: 'full' | 'restricted' | 'none';
  /** 允许访问的主机列表 */
  allowedHosts: string[];
  /** 文件系统访问级别 */
  fileSystemAccess: 'read' | 'write' | 'none';
  /** 最大内存限制 (MB) */
  maxMemoryMB: number;
  /** 最大 CPU 使用百分比 */
  maxCpuPercent: number;
  /** 执行超时（毫秒） */
  timeout: number;
}

/** 运行时配置 */
export interface RuntimeConfig {
  /** 当前使用的 Provider ID */
  activeProvider: string;
  /** 所有 Provider 配置 */
  providers: AIProviderConfig[];
  /** 备用 Provider 列表（故障切换） */
  fallbackProviders: string[];
  /** 最大并发子 Agent 数 */
  maxConcurrentAgents: number;
  /** 子 Agent 超时时间（毫秒） */
  agentTimeout: number;
  /** 沙箱配置 */
  sandbox: SandboxConfig;
}

/** 默认沙箱配置 */
export const DEFAULT_SANDBOX_CONFIG: SandboxConfig = {
  enabled: true,
  networkAccess: 'restricted',
  allowedHosts: [],
  fileSystemAccess: 'read',
  maxMemoryMB: 512,
  maxCpuPercent: 80,
  timeout: 300000, // 5 minutes
};

/** 默认运行时配置 */
export const DEFAULT_RUNTIME_CONFIG: RuntimeConfig = {
  activeProvider: '',
  providers: [],
  fallbackProviders: [],
  maxConcurrentAgents: 3,
  agentTimeout: 600000, // 10 minutes
  sandbox: DEFAULT_SANDBOX_CONFIG,
};

/** Skill 运行时配置 */
export interface SkillRuntime {
  /** 是否需要子 Agent 执行 */
  requiresAgent: boolean;
  /** 建议的子 Agent 数量 */
  agentCount: number;
  /** 是否支持并行执行 */
  parallelizable: boolean;
  /** 是否需要网络访问 */
  requiresNetwork: boolean;
  /** 是否需要沙箱隔离 */
  requiresSandbox: boolean;
  /** 依赖的其他 Skill IDs */
  dependencies: string[];
  /** 预估 Token 消耗 */
  estimatedTokens: number;
}

/** 默认 Skill 运行时配置 */
export const DEFAULT_SKILL_RUNTIME: SkillRuntime = {
  requiresAgent: false,
  agentCount: 1,
  parallelizable: true,
  requiresNetwork: false,
  requiresSandbox: false,
  dependencies: [],
  estimatedTokens: 2000,
};
