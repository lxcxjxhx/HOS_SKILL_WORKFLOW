import { ToolCall, ToolResult } from '../types/process';

/**
 * 工具注册信息
 */
export interface ToolRegistration {
  /** 工具名称 */
  name: string;
  /** 工具描述 */
  description: string;
  /** 调用处理器 */
  handler: (params: Record<string, any>) => Promise<ToolResult>;
  /** 默认超时（毫秒） */
  timeout?: number;
}

/**
 * 工具注册表
 * 提供统一的 MCP 工具调用接口
 */
export class ToolRegistry {
  private tools: Map<string, ToolRegistration> = new Map();
  private stats: { calls: number; failures: number; avgDuration: number } =
    { calls: 0, failures: 0, avgDuration: 0 };

  /**
   * 注册工具
   * @param registration 工具注册信息
   */
  register(registration: ToolRegistration): void {
    if (this.tools.has(registration.name)) {
      console.warn(`[ToolRegistry] 工具 ${registration.name} 已注册，将被覆盖`);
    }
    this.tools.set(registration.name, registration);
  }

  /**
   * 批量注册工具
   * @param registrations 工具注册信息列表
   */
  registerAll(registrations: ToolRegistration[]): void {
    for (const reg of registrations) {
      this.register(reg);
    }
  }

  /**
   * 调用工具
   * @param toolName 工具名称
   * @param params 工具参数
   * @returns 工具调用结果
   */
  async callTool(toolName: string, params: Record<string, any>): Promise<ToolResult> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return {
        tool: toolName,
        params,
        output: '',
        success: false,
        duration: 0,
        error: `工具 ${toolName} 未注册`,
      };
    }

    const startTime = Date.now();
    this.stats.calls++;

    try {
      const result = await tool.handler(params);
      const duration = Date.now() - startTime;
      this.stats.avgDuration =
        (this.stats.avgDuration * (this.stats.calls - 1) + duration) / this.stats.calls;

      return {
        tool: toolName,
        params,
        output: result.output,
        success: result.success,
        duration,
        error: result.error,
      };
    } catch (error) {
      this.stats.failures++;
      return {
        tool: toolName,
        params,
        output: '',
        success: false,
        duration: Date.now() - startTime,
        error: `工具调用异常: ${error}`,
      };
    }
  }

  /**
   * 检查工具是否已注册
   * @param toolName 工具名称
   * @returns 是否已注册
   */
  hasTool(toolName: string): boolean {
    return this.tools.has(toolName);
  }

  /**
   * 获取已注册的工具列表
   * @returns 工具名称数组
   */
  getRegisteredTools(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * 获取工具统计信息
   * @returns 统计信息副本
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * 清除所有注册
   */
  clear(): void {
    this.tools.clear();
    this.stats = { calls: 0, failures: 0, avgDuration: 0 };
  }
}

/** 全局单例 */
export const toolRegistry = new ToolRegistry();

/**
 * 注册内置工具
 */
export function registerBuiltinTools(): void {
  // Web Fetch 工具
  toolRegistry.register({
    name: 'web_fetch',
    description: '获取网页内容',
    handler: async (params) => {
      try {
        const url = params.url as string;
        // 使用 fetch API
        const response = await fetch(url);
        const text = await response.text();
        return {
          tool: 'web_fetch',
          params,
          output: text,
          success: true,
          duration: 0,
        };
      } catch (error) {
        return {
          tool: 'web_fetch',
          params,
          output: '',
          success: false,
          duration: 0,
          error: `web_fetch 失败: ${error}`,
        };
      }
    },
    timeout: 30000,
  });

  // 搜索工具
  toolRegistry.register({
    name: 'search_google',
    description: 'Google 搜索',
    handler: async (params) => {
      // 搜索由 MCP 层处理，这里返回占位
      return {
        tool: 'search_google',
        params,
        output: JSON.stringify({ message: '搜索由 MCP 层执行', query: params.query }),
        success: true,
        duration: 0,
      };
    },
  });

  // CVE 查询工具
  toolRegistry.register({
    name: 'cve_query',
    description: '查询 CVE 漏洞信息',
    handler: async (params) => {
      // 具体实现由 CVEIntegrator 管理
      return {
        tool: 'cve_query',
        params,
        output: '',
        success: false,
        duration: 0,
        error: '请使用 CVEIntegrator 执行 CVE 查询',
      };
    },
  });
}