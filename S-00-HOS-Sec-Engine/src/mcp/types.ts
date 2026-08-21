/**
 * HOS-Sec-Engine - MCP Self-Management Layer Types
 *
 * MCP (Model Context Protocol) 自我管理层的核心类型定义。
 * 支持 MCP 服务器的自动发现、注册、健康检查和工具路由。
 */

// ==================== MCP Server 定义 ====================

/** MCP 服务器身份标识 */
export interface MCPServerIdentity {
  /** 唯一名称，如 "playwright" */
  name: string;
  /** 语义化版本号 */
  version: string;
  /** 协议版本 */
  protocolVersion: string;
}

/** MCP 工具定义 */
export interface MCPTool {
  /** 工具名称 */
  name: string;
  /** 工具描述 */
  description: string;
  /** 输入 schema */
  inputSchema: Record<string, any>;
  /** 工具分类 */
  category?: 'network' | 'browser' | 'filesystem' | 'code' | 'reasoning' | 'memory' | 'integration' | 'security';
}

/** MCP 能力声明 */
export interface MCPCapability {
  /** 能力名称 */
  name: string;
  /** 能力描述 */
  description: string;
  /** 关联的工具列表 */
  tools: string[];
  /** 能力等级 */
  level: 'core' | 'extended' | 'experimental';
}

/** MCP 服务器配置 */
export interface MCPServerConfig {
  /** 服务器名称 */
  name: string;
  /** 启动命令 */
  command: string;
  /** 命令参数 */
  args: string[];
  /** 环境变量 */
  env: Record<string, string>;
  /** 描述 */
  description: string;
  /** 是否自动启动 */
  autoStart: boolean;
  /** 最大重启次数 */
  maxRestarts: number;
  /** 健康检查间隔 (ms) */
  healthCheckIntervalMs: number;
  /** 超时时间 (ms) */
  timeoutMs: number;
  /** 标签 */
  tags: string[];
}

/** MCP 服务器状态 */
export type MCPStatus = 'stopped' | 'starting' | 'running' | 'error' | 'degraded';

/** MCP 服务器运行时信息 */
export interface MCPRuntime {
  /** 当前状态 */
  status: MCPStatus;
  /** 进程 ID (本地) */
  pid?: number;
  /** 启动时间 */
  startedAt?: string;
  /** 最后活跃时间 */
  lastHeartbeat?: string;
  /** 重启计数 */
  restartCount: number;
  /** 错误消息 */
  lastError?: string;
  /** 延迟 (ms) */
  latency: number;
}

/** 完整的 MCP 服务器信息 */
export interface MCPServer {
  /** 服务器配置 */
  config: MCPServerConfig;
  /** 身份标识 (从 capabilities 获取) */
  identity: MCPServerIdentity;
  /** 运行时状态 */
  runtime: MCPRuntime;
  /** 可用工具列表 */
  tools: MCPTool[];
  /** 能力声明 */
  capabilities: MCPCapability[];
  /** 是否已注册到引擎 */
  registered: boolean;
  /** 是否启用 */
  enabled: boolean;
}

// ==================== MCP Registry ====================

/** MCP 注册事件 */
export type MCPRegistryEvent =
  | 'server:registered'
  | 'server:unregistered'
  | 'server:started'
  | 'server:stopped'
  | 'server:error'
  | 'server:heartbeat'
  | 'tool:discovered'
  | 'health:changed'
  | 'registry:cleared';

/** MCP 注册事件处理器 */
export type MCPEventHandler = (event: MCPRegistryEvent, data: any) => void;

// ==================== MCP 路由 ====================

/** MCP 工具调用请求 */
export interface MCPToolCall {
  /** 目标服务器 */
  serverName: string;
  /** 工具名称 */
  toolName: string;
  /** 输入参数 */
  arguments: Record<string, any>;
  /** 超时 (ms) */
  timeout?: number;
}

/** MCP 工具调用结果 */
export interface MCPToolResult {
  /** 是否成功 */
  success: boolean;
  /** 输出内容 */
  content: any;
  /** 错误信息 */
  error?: string;
  /** 耗时 (ms) */
  durationMs: number;
  /** 调用的服务器 */
  serverName: string;
  /** 调用的工具 */
  toolName: string;
}

/** MCP 路由策略 */
export type MCPRoutingStrategy =
  /** 最佳匹配：按能力评分选最优服务器 */
  | 'best_match'
  /** 负载均衡：轮询可用服务器 */
  | 'round_robin'
  /** 并行执行：所有匹配服务器并行执行，取第一个成功结果 */
  | 'parallel_first'
  /** 指定服务器：强制使用指定服务器 */
  | 'specific';

/** 路由查询 */
export interface MCPRouteQuery {
  /** 所需能力 */
  requiredCapability?: string;
  /** 所需工具分类 */
  requiredCategory?: MCPTool['category'];
  /** 目标服务器 (specific 策略时需要) */
  targetServer?: string;
  /** 路由策略 */
  strategy: MCPRoutingStrategy;
}

// ==================== MCP 健康 ====================

/** 健康检查结果 */
export interface MCPHealthCheckResult {
  /** 服务器名称 */
  serverName: string;
  /** 是否健康 */
  healthy: boolean;
  /** 延迟 (ms) */
  latency: number;
  /** 时间戳 */
  timestamp: string;
  /** 详细错误 */
  error?: string;
  /** 工具数量 */
  toolCount: number;
}

/** 健康状态汇总 */
export interface MCPHealthSummary {
  /** 总服务器数 */
  totalServers: number;
  /** 健康服务器数 */
  healthyCount: number;
  /** 异常服务器数 */
  unhealthyCount: number;
  /** 健康率 */
  healthRate: number;
  /** 详细结果 */
  results: MCPHealthCheckResult[];
  /** 最后更新时间 */
  lastUpdated: string;
}

// ==================== 自动发现 ====================

/** 自动发现配置 */
export interface MCPDiscoveryConfig {
  /** 搜索路径 (文件系统自动发现) */
  searchPaths: string[];
  /** 已知 MCP 包名列表 */
  knownPackages: string[];
  /** 是否检查 npm 全局安装 */
  checkNpmGlobal: boolean;
  /** 是否检查本地 node_modules */
  checkNodeModules: boolean;
  /** 发现间隔 (ms) */
  discoveryIntervalMs: number;
}

/** 发现结果 */
export interface MCPDiscoveryResult {
  /** 新发现的服务器 */
  discovered: MCPServerConfig[];
  /** 已存在的服务器 */
  existing: string[];
  /** 失败的检查 */
  failed: { name: string; reason: string }[];
  /** 发现时间 */
  timestamp: string;
}

// ==================== 能力映射 ====================

/** Skill → MCP 能力映射 */
export interface SkillMCPMapping {
  /** Skill ID */
  skillId: string;
  /** 所需的 MCP 服务器名称列表 */
  requiredMCPServers: string[];
  /** 推荐的 MCP 服务器名称列表 */
  recommendedMCPServers: string[];
  /** 工具映射: Skill 动作 → MCP 工具 */
  toolMappings: {
    /** Skill 动作/技术 */
    action: string;
    /** MCP 服务器 */
    server: string;
    /** MCP 工具 */
    tool: string;
    /** 输入模板 */
    inputTemplate: Record<string, string>;
  }[];
}
