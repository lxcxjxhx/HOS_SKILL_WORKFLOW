/**
 * HOS-Sec-Engine - MCP Tool Router
 *
 * MCP 工具路由引擎，负责：
 * 1. 将 Skill 执行请求路由到合适的 MCP 服务器
 * 2. 管理工具调用执行和结果收集
 * 3. 支持多种路由策略（最佳匹配、并行、轮询）
 * 4. Skill-MCP 能力映射管理
 */

import { mcpRegistry } from './registry';
import {
  MCPTool,
  MCPToolCall,
  MCPToolResult,
  MCPRouteQuery,
  MCPRoutingStrategy,
  SkillMCPMapping,
} from './types';

// ==================== Constants ====================

/** 工具调用超时 (ms) */
const DEFAULT_TOOL_TIMEOUT = 30000;
/** 并行路由最大服务器数量 */
const MAX_PARALLEL_SERVERS = 5;

// ==================== Skill-MCP 映射 ====================

/** 预定义的 Skill → MCP 工具映射 */
const DEFAULT_SKILL_MCP_MAPPINGS: SkillMCPMapping[] = [
  // ========== Web 安全 ==========
  {
    skillId: 'web-sqli-001',
    requiredMCPServers: ['http-fetch'],
    recommendedMCPServers: ['playwright', 'memory'],
    toolMappings: [
      { action: '发送 SQL 注入 payload', server: 'http-fetch', tool: 'http_post', inputTemplate: { url: '{target}', body: '{payload}' } },
      { action: '测试 SQL 盲注', server: 'http-fetch', tool: 'http_get', inputTemplate: { url: '{target}', params: '{params}' } },
      { action: 'WAF 绕过验证', server: 'playwright', tool: 'browser_navigate', inputTemplate: { url: '{target}' } },
    ],
  },
  {
    skillId: 'web-xss-001',
    requiredMCPServers: ['http-fetch'],
    recommendedMCPServers: ['playwright', 'memory'],
    toolMappings: [
      { action: '发送 XSS payload', server: 'http-fetch', tool: 'http_post', inputTemplate: { url: '{target}', body: '{payload}' } },
      { action: '验证 XSS 执行', server: 'playwright', tool: 'browser_navigate', inputTemplate: { url: '{target}' } },
      { action: '截图验证', server: 'playwright', tool: 'browser_screenshot', inputTemplate: { url: '{target}' } },
    ],
  },
  {
    skillId: 'web-ssrf-001',
    requiredMCPServers: ['http-fetch'],
    recommendedMCPServers: ['memory'],
    toolMappings: [
      { action: '发送 SSRF payload', server: 'http-fetch', tool: 'http_get', inputTemplate: { url: '{target}' } },
      { action: 'DNS 外带检测', server: 'http-fetch', tool: 'http_get', inputTemplate: { url: '{target}' } },
    ],
  },
  {
    skillId: 'web-rce-001',
    requiredMCPServers: ['http-fetch'],
    recommendedMCPServers: ['code-executor', 'playwright'],
    toolMappings: [
      { action: '发送 RCE payload', server: 'http-fetch', tool: 'http_post', inputTemplate: { url: '{target}', body: '{payload}' } },
      { action: '验证命令执行', server: 'code-executor', tool: 'execute_command', inputTemplate: { command: '{command}' } },
    ],
  },
  {
    skillId: 'web-upload-001',
    requiredMCPServers: ['http-fetch'],
    recommendedMCPServers: ['filesystem', 'playwright'],
    toolMappings: [
      { action: '上传恶意文件', server: 'http-fetch', tool: 'http_post', inputTemplate: { url: '{target}', file: '{payload}' } },
      { action: '访问上传文件', server: 'http-fetch', tool: 'http_get', inputTemplate: { url: '{target}' } },
    ],
  },
  {
    skillId: 'web-waf-bypass-0day',
    requiredMCPServers: ['http-fetch', 'sequential-thinking'],
    recommendedMCPServers: ['playwright', 'memory'],
    toolMappings: [
      { action: '分析 WAF 特征', server: 'sequential-thinking', tool: 'think', inputTemplate: { thought: '{analysis}' } },
      { action: '发送绕过 payload', server: 'http-fetch', tool: 'http_post', inputTemplate: { url: '{target}', body: '{payload}' } },
      { action: '验证绕过结果', server: 'playwright', tool: 'browser_navigate', inputTemplate: { url: '{target}' } },
      { action: '记录绕过模式', server: 'memory', tool: 'remember', inputTemplate: { key: '{pattern_key}', value: '{pattern_value}' } },
    ],
  },

  // ========== API 安全 ==========
  {
    skillId: 'api-jwt-001',
    requiredMCPServers: ['http-fetch'],
    recommendedMCPServers: ['sequential-thinking', 'code-executor'],
    toolMappings: [
      { action: '发送 JWT 请求', server: 'http-fetch', tool: 'http_get', inputTemplate: { url: '{target}', headers: '{headers}' } },
      { action: '修改 JWT payload', server: 'code-executor', tool: 'execute_code', inputTemplate: { code: '{code}' } },
    ],
  },
  {
    skillId: 'api-idor-001',
    requiredMCPServers: ['http-fetch'],
    recommendedMCPServers: ['sequential-thinking'],
    toolMappings: [
      { action: '遍历 ID', server: 'http-fetch', tool: 'http_get', inputTemplate: { url: '{target}' } },
      { action: '修改资源 ID', server: 'http-fetch', tool: 'http_get', inputTemplate: { url: '{target}' } },
    ],
  },
  {
    skillId: 'api-graphql-injection-001',
    requiredMCPServers: ['http-fetch'],
    recommendedMCPServers: ['sequential-thinking', 'memory'],
    toolMappings: [
      { action: 'GraphQL introspection', server: 'http-fetch', tool: 'http_post', inputTemplate: { url: '{target}', body: '{query}' } },
      { action: '发送 GraphQL payload', server: 'http-fetch', tool: 'http_post', inputTemplate: { url: '{target}', body: '{payload}' } },
    ],
  },
  {
    skillId: 'api-ratelimit-001',
    requiredMCPServers: ['http-fetch'],
    recommendedMCPServers: ['sequential-thinking'],
    toolMappings: [
      { action: '发送批量请求', server: 'http-fetch', tool: 'http_get', inputTemplate: { url: '{target}' } },
      { action: '发送请求绕过', server: 'http-fetch', tool: 'http_get', inputTemplate: { url: '{target}', headers: '{headers}' } },
    ],
  },

  // ========== 云安全 ==========
  {
    skillId: 'cloud-meta-001',
    requiredMCPServers: ['http-fetch'],
    recommendedMCPServers: ['filesystem'],
    toolMappings: [
      { action: 'SSRF 云元数据', server: 'http-fetch', tool: 'http_get', inputTemplate: { url: '{target}' } },
      { action: '保存凭证', server: 'filesystem', tool: 'write_file', inputTemplate: { path: '{path}', content: '{content}' } },
    ],
  },
  {
    skillId: 'cloud-s3-001',
    requiredMCPServers: ['http-fetch'],
    recommendedMCPServers: ['filesystem'],
    toolMappings: [
      { action: '枚举 S3 bucket', server: 'http-fetch', tool: 'http_get', inputTemplate: { url: '{target}' } },
      { action: '下载对象', server: 'http-fetch', tool: 'http_get', inputTemplate: { url: '{target}' } },
    ],
  },

  // ========== AI 安全 ==========
  {
    skillId: 'ai-prompt-injection-001',
    requiredMCPServers: ['http-fetch', 'sequential-thinking'],
    recommendedMCPServers: ['memory'],
    toolMappings: [
      { action: '发送 prompt 注入', server: 'http-fetch', tool: 'http_post', inputTemplate: { url: '{target}', body: '{prompt}' } },
      { action: '规划注入策略', server: 'sequential-thinking', tool: 'think', inputTemplate: { thought: '{strategy}' } },
      { action: '记录注入模式', server: 'memory', tool: 'remember', inputTemplate: { key: '{pattern}', value: '{value}' } },
    ],
  },
];

// ==================== MCP Router ====================

export class MCPRouter {
  private mappings: Map<string, SkillMCPMapping> = new Map();
  private roundRobinCounters: Map<string, number> = new Map();

  constructor() {
    this.registerDefaultMappings();
  }

  /**
   * 注册预定义的 Skill-MCP 映射
   */
  private registerDefaultMappings(): void {
    for (const mapping of DEFAULT_SKILL_MCP_MAPPINGS) {
      this.mappings.set(mapping.skillId, mapping);
    }
  }

  /**
   * 注册/更新 Skill-MCP 映射
   */
  registerMapping(mapping: SkillMCPMapping): void {
    this.mappings.set(mapping.skillId, mapping);
  }

  /**
   * 批量注册映射
   */
  registerMappings(mappings: SkillMCPMapping[]): void {
    for (const mapping of mappings) {
      this.registerMapping(mapping);
    }
  }

  /**
   * 获取指定 Skill 的 MCP 映射
   */
  getMapping(skillId: string): SkillMCPMapping | undefined {
    return this.mappings.get(skillId);
  }

  /**
   * 获取所有映射
   */
  getAllMappings(): SkillMCPMapping[] {
    return Array.from(this.mappings.values());
  }

  /**
   * 检查 Skill 所需的 MCP 服务器是否可用
   */
  checkSkillRequirements(skillId: string): {
    available: boolean;
    missingServers: string[];
    availableServers: string[];
  } {
    const mapping = this.mappings.get(skillId);
    if (!mapping) {
      return { available: true, missingServers: [], availableServers: [] };
    }

    const missingServers: string[] = [];
    const availableServers: string[] = [];

    for (const serverName of mapping.requiredMCPServers) {
      const server = mcpRegistry.getServer(serverName);
      if (server && server.enabled && server.runtime.status === 'running') {
        availableServers.push(serverName);
      } else {
        missingServers.push(serverName);
      }
    }

    return {
      available: missingServers.length === 0,
      missingServers,
      availableServers,
    };
  }

  /**
   * 获取推荐的可用于 Skill 的 MCP 工具
   */
  getRecommendedTools(skillId: string): { server: string; tool: string; description: string }[] {
    const mapping = this.mappings.get(skillId);
    if (!mapping) return [];

    const tools: { server: string; tool: string; description: string }[] = [];

    for (const tm of mapping.toolMappings) {
      const server = mcpRegistry.getServer(tm.server);
      if (server && server.enabled) {
        const serverTool = server.tools.find(t => t.name === tm.tool);
        if (serverTool) {
          tools.push({
            server: tm.server,
            tool: tm.tool,
            description: serverTool.description,
          });
        } else {
          // 工具未注册，但服务器可用
          tools.push({
            server: tm.server,
            tool: tm.tool,
            description: `需要工具 ${tm.tool} (${tm.action})`,
          });
        }
      }
    }

    return tools;
  }

  // ==================== 工具路由执行 ====================

  /**
   * 路由并执行工具调用
   *
   * @param call 工具调用请求
   * @param query 路由查询（可选）
   * @returns 工具调用结果
   */
  async routeAndExecute(call: MCPToolCall, query?: Partial<MCPRouteQuery>): Promise<MCPToolResult> {
    // 如果 call 指定了服务器但 query 没有，使用 call.serverName 作为目标
    const effectiveTarget = query?.targetServer || call.serverName || undefined;

    const routeQuery: MCPRouteQuery = {
      strategy: query?.strategy || 'best_match',
      requiredCapability: query?.requiredCapability,
      requiredCategory: query?.requiredCategory,
      targetServer: effectiveTarget,
    };

    const servers = this.resolveTargetServers(call, routeQuery);
    if (servers.length === 0) {
      return {
        success: false,
        content: null,
        error: `没有可用的 MCP 服务器提供工具 ${call.toolName}`,
        durationMs: 0,
        serverName: '',
        toolName: call.toolName,
      };
    }

    switch (routeQuery.strategy) {
      case 'best_match':
        return this.executeBestMatch(call, servers);
      case 'round_robin':
        return this.executeRoundRobin(call, servers);
      case 'parallel_first':
        return this.executeParallelFirst(call, servers);
      case 'specific':
        return this.executeSpecific(call, servers);
      default:
        return this.executeBestMatch(call, servers);
    }
  }

  /**
   * 解析目标服务器
   */
  private resolveTargetServers(call: MCPToolCall, query: MCPRouteQuery): string[] {
    if (query.targetServer) {
      const server = mcpRegistry.getServer(query.targetServer);
      // For specific strategy, return the server even if not running (executeOnServer will handle the error)
      return server && server.enabled ? [query.targetServer] : [];
    }

    // 按工具名查找
    let servers = mcpRegistry.findServersByTool(call.toolName);
    if (servers.length > 0) {
      return servers
        .filter(s => s.enabled && s.runtime.status === 'running')
        .map(s => s.config.name);
    }

    // 按能力查找
    if (query.requiredCapability) {
      servers = mcpRegistry.findServersByCapability(query.requiredCapability);
      if (servers.length > 0) {
        return servers
          .filter(s => s.enabled && s.runtime.status === 'running')
          .map(s => s.config.name);
      }
    }

    // 按分类查找
    if (query.requiredCategory) {
      const toolEntries = mcpRegistry.findToolsByCategory(query.requiredCategory);
      const serverNames = [...new Set(toolEntries.map(e => e.server))];
      return serverNames.filter(n => {
        const s = mcpRegistry.getServer(n);
        return s && s.enabled && s.runtime.status === 'running';
      });
    }

    return [];
  }

  /**
   * 最佳匹配策略：选择延迟最低的服务器
   */
  private async executeBestMatch(call: MCPToolCall, servers: string[]): Promise<MCPToolResult> {
    // 按延迟排序
    const sorted = [...servers].sort((a, b) => {
      const sa = mcpRegistry.getServer(a);
      const sb = mcpRegistry.getServer(b);
      return (sa?.runtime.latency ?? Infinity) - (sb?.runtime.latency ?? Infinity);
    });

    return this.executeOnServer(call, sorted[0]);
  }

  /**
   * 轮询策略
   */
  private async executeRoundRobin(call: MCPToolCall, servers: string[]): Promise<MCPToolResult> {
    const counter = this.roundRobinCounters.get(call.toolName) || 0;
    const index = counter % servers.length;
    this.roundRobinCounters.set(call.toolName, index + 1);

    return this.executeOnServer(call, servers[index]);
  }

  /**
   * 并行执行策略：所有服务器并行执行，取第一个成功结果
   */
  private async executeParallelFirst(call: MCPToolCall, servers: string[]): Promise<MCPToolResult> {
    const limitedServers = servers.slice(0, MAX_PARALLEL_SERVERS);

    return new Promise((resolve) => {
      let completed = 0;
      const errors: string[] = [];

      for (const server of limitedServers) {
        this.executeOnServer(call, server).then(result => {
          completed++;
          if (result.success) {
            resolve(result);
          } else if (completed === limitedServers.length) {
            resolve({
              success: false,
              content: null,
              error: `所有服务器执行失败: ${errors.join('; ')}`,
              durationMs: result.durationMs,
              serverName: server,
              toolName: call.toolName,
            });
          }
        });
      }
    });
  }

  /**
   * 指定服务器策略
   */
  private async executeSpecific(call: MCPToolCall, servers: string[]): Promise<MCPToolResult> {
    if (servers.length === 0) {
      return {
        success: false,
        content: null,
        error: `指定服务器不存在或不可用`,
        durationMs: 0,
        serverName: '',
        toolName: call.toolName,
      };
    }
    return this.executeOnServer(call, servers[0]);
  }

  /**
   * 在指定服务器上执行工具调用
   * 当前为模拟执行，实际应该通过 MCP 协议进行 IPC 通信
   */
  private async executeOnServer(call: MCPToolCall, serverName: string): Promise<MCPToolResult> {
    const start = Date.now();
    const toolName = call.toolName;
    const server = mcpRegistry.getServer(serverName);

    if (!server) {
      return {
        success: false,
        content: null,
        error: `服务器 ${serverName} 未注册`,
        durationMs: Date.now() - start,
        serverName,
        toolName,
      };
    }

    if (server.runtime.status !== 'running') {
      return {
        success: false,
        content: null,
        error: `服务器 ${serverName} 未运行 (状态: ${server.runtime.status})`,
        durationMs: Date.now() - start,
        serverName,
        toolName,
      };
    }

    // 检查工具是否存在
    const tool = server.tools.find(t => t.name === toolName);
    if (!tool) {
      return {
        success: false,
        content: null,
        error: `服务器 ${serverName} 未提供工具 ${toolName}`,
        durationMs: Date.now() - start,
        serverName,
        toolName,
      };
    }

    // 实际实现应该通过 stdin/stdout 与 MCP 进程通信
    // 这里返回一个模拟结果，标明工具和服务器信息
    const timeout = call.timeout || DEFAULT_TOOL_TIMEOUT;

    // 构建 MCP 协议消息
    const mcpRequest = {
      jsonrpc: '2.0',
      id: `call-${Date.now()}`,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: call.arguments,
      },
    };

    // 记录执行到日志
    console.log(`[MCPRouter] 🛠️ 调用工具: ${serverName}/${toolName}`);
    console.log(`[MCPRouter]   参数: ${JSON.stringify(call.arguments)}`);

    // 模拟执行延迟
    await new Promise(resolve => setTimeout(resolve, Math.min(50, timeout)));

    return {
      success: true,
      content: {
        request: mcpRequest,
        tool: toolName,
        server: serverName,
        status: 'accepted',
        message: `工具调用已派发到 ${serverName}/${toolName}`,
        arguments: call.arguments,
      },
      durationMs: Date.now() - start,
      serverName,
      toolName,
    };
  }

  // ==================== 工具查找 ====================

  /**
   * 查找匹配 Skill 场景的 MCP 工具
   */
  findToolsForScenario(scenario: string): { server: string; tool: MCPTool; score: number }[] {
    const keywords = scenario.toLowerCase().split(/[\s,，、]+/);
    const results: { server: string; tool: MCPTool; score: number }[] = [];

    for (const server of mcpRegistry.getServers()) {
      const serverName = server.config.name;
      for (const tool of server.tools) {
        let score = 0;
        const toolText = `${tool.name} ${tool.description} ${tool.category || ''}`.toLowerCase();

        for (const keyword of keywords) {
          if (keyword.length < 2) continue;
          if (toolText.includes(keyword)) {
            score += 0.2;
          }
        }

        if (score > 0) {
          results.push({ server: serverName, tool, score });
        }
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  // ==================== 状态 ====================

  /**
   * 获取路由器状态摘要
   */
  getSummary(): object {
    return {
      registeredMappings: this.mappings.size,
      mappedSkills: Array.from(this.mappings.keys()),
    };
  }

  /**
   * 清除路由缓存
   */
  clearCache(): void {
    this.roundRobinCounters.clear();
  }
}

/** 全局单例 */
export const mcpRouter = new MCPRouter();
