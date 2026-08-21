/**
 * HOS-Sec-Engine - MCP Self-Management Layer
 *
 * MCP (Model Context Protocol) 自我管理层的统一入口。
 * 提供 MCP 服务器的自动发现、注册、健康监控和工具路由能力。
 *
 * 核心组件：
 * - MCPRegistry: MCP 服务器注册中心（生命周期管理）
 * - MCPDiscovery: MCP 服务器自动发现
 * - MCPRouter: MCP 工具路由（Skill → MCP 工具映射）
 * - MCPHealthMonitor: MCP 健康监控和自动恢复
 */

// 类型导出
export type {
  // MCP 服务器定义
  MCPServerIdentity,
  MCPTool,
  MCPCapability,
  MCPServerConfig,
  MCPServer,
  MCPStatus,
  MCPRuntime,

  // MCP 注册
  MCPRegistryEvent,
  MCPEventHandler,

  // MCP 路由
  MCPToolCall,
  MCPToolResult,
  MCPRoutingStrategy,
  MCPRouteQuery,
  SkillMCPMapping,

  // MCP 健康
  MCPHealthCheckResult,
  MCPHealthSummary,

  // MCP 发现
  MCPDiscoveryConfig,
  MCPDiscoveryResult,
} from './types';

// 核心类导出
export { MCPRegistry, mcpRegistry } from './registry';
export { MCPDiscovery, mcpDiscovery } from './discovery';
export { MCPRouter, mcpRouter } from './router';
export { MCPHealthMonitor, mcpHealthMonitor } from './health';
