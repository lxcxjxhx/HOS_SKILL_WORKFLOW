/**
 * HOS-Sec-Engine - MCP Registry
 *
 * MCP 服务器注册中心，负责：
 * 1. 注册/注销 MCP 服务器
 * 2. 管理 MCP 服务器生命周期（启动/停止）
 * 3. 维护服务器索引（按能力、标签、名称）
 * 4. 事件通知
 */

import * as fs from 'fs';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';
import {
  MCPServer,
  MCPServerConfig,
  MCPServerIdentity,
  MCPTool,
  MCPCapability,
  MCPRuntime,
  MCPStatus,
  MCPRegistryEvent,
  MCPEventHandler,
} from './types';

// ==================== Constants ====================

/** 默认 MCP 服务器配置（用于填充缺失字段） */
const DEFAULT_MCP_CONFIG: Partial<MCPServerConfig> = {
  autoStart: true,
  maxRestarts: 3,
  healthCheckIntervalMs: 30000,
  timeoutMs: 30000,
  tags: [],
};

/** 默认 MCP 运行时 */
const DEFAULT_RUNTIME: MCPRuntime = {
  status: 'stopped',
  restartCount: 0,
  latency: 0,
};

/** 最大注册服务器数量 */
const MAX_REGISTERED_SERVERS = 100;

// ==================== MCP Registry ====================

export class MCPRegistry {
  /** 所有注册的 MCP 服务器 */
  private servers: Map<string, MCPServer> = new Map();
  /** 索引: 工具名 → 服务器名列表 */
  private toolIndex: Map<string, string[]> = new Map();
  /** 索引: 能力名 → 服务器名列表 */
  private capabilityIndex: Map<string, string[]> = new Map();
  /** 索引: 标签 → 服务器名列表 */
  private tagIndex: Map<string, string[]> = new Map();
  /** 事件处理器 */
  private eventHandlers: Map<MCPRegistryEvent, Set<MCPEventHandler>> = new Map();
  /** 子进程引用 */
  private processes: Map<string, ChildProcess> = new Map();
  /** 健康检查定时器 */
  private healthTimers: Map<string, NodeJS.Timeout> = new Map();

  // ==================== 注册/注销 ====================

  /**
   * 注册 MCP 服务器
   * @param config 服务器配置
   * @returns 注册的服务器实例
   */
  registerServer(config: MCPServerConfig): MCPServer {
    if (this.servers.size >= MAX_REGISTERED_SERVERS) {
      throw new Error(`MCP 服务器数量超出上限 (${MAX_REGISTERED_SERVERS})`);
    }

    if (this.servers.has(config.name)) {
      throw new Error(`MCP 服务器 ${config.name} 已注册`);
    }

    const fullConfig: MCPServerConfig = {
      ...DEFAULT_MCP_CONFIG,
      ...config,
    };

    const server: MCPServer = {
      config: fullConfig,
      identity: {
        name: config.name,
        version: '0.0.0',
        protocolVersion: '2025-03-26',
      },
      runtime: { ...DEFAULT_RUNTIME },
      tools: [],
      capabilities: [],
      registered: true,
      enabled: true,
    };

    this.servers.set(config.name, server);
    this.indexServer(server);

    this.emitEvent('server:registered', { name: config.name, config: fullConfig });
    console.log(`[MCPRegistry] ✅ 服务器已注册: ${config.name}`);

    // 自动启动
    if (fullConfig.autoStart) {
      this.startServer(config.name).catch(err =>
        console.warn(`[MCPRegistry] 自动启动 ${config.name} 失败:`, err.message)
      );
    }

    return server;
  }

  /**
   * 批量注册 MCP 服务器
   */
  registerServers(configs: MCPServerConfig[]): MCPServer[] {
    const registered: MCPServer[] = [];
    for (const config of configs) {
      try {
        const server = this.registerServer(config);
        registered.push(server);
      } catch (err) {
        console.warn(`[MCPRegistry] 注册 ${config.name} 失败:`, err instanceof Error ? err.message : String(err));
      }
    }
    return registered;
  }

  /**
   * 注销 MCP 服务器
   */
  unregisterServer(name: string): boolean {
    const server = this.servers.get(name);
    if (!server) return false;

    // 停止服务器
    this.stopServer(name).catch(() => {});

    // 移除索引
    this.deindexServer(name);

    // 移除服务器
    this.servers.delete(name);

    this.emitEvent('server:unregistered', { name });
    console.log(`[MCPRegistry] ❌ 服务器已注销: ${name}`);
    return true;
  }

  /**
   * 获取所有注册的服务器
   */
  getServers(): MCPServer[] {
    return Array.from(this.servers.values());
  }

  /**
   * 获取指定服务器
   */
  getServer(name: string): MCPServer | undefined {
    return this.servers.get(name);
  }

  /**
   * 获取服务器数量
   */
  getServerCount(): number {
    return this.servers.size;
  }

  /**
   * 获取所有启用的服务器
   */
  getEnabledServers(): MCPServer[] {
    return Array.from(this.servers.values()).filter(s => s.enabled);
  }

  // ==================== 生命周期管理 ====================

  /**
   * 启动 MCP 服务器
   */
  async startServer(name: string): Promise<boolean> {
    const server = this.servers.get(name);
    if (!server) {
      console.warn(`[MCPRegistry] 服务器 ${name} 未注册`);
      return false;
    }

    if (server.runtime.status === 'running') {
      return true; // 已在运行
    }

    server.runtime.status = 'starting';
    this.emitEvent('server:started', { name, status: 'starting' });

    try {
      const { command, args, env: envConfig, timeoutMs } = server.config;

      const env: Record<string, string | undefined> = {
        ...process.env as Record<string, string>,
      };

      // 替换环境变量引用 ${VAR_NAME}
      for (const [key, value] of Object.entries(envConfig)) {
        const resolved = value.replace(/\$\{(\w+)\}/g, (_, varName) => process.env[varName] || '');
        env[key] = resolved;
      }

      // 启动子进程
      const child = spawn(command, args, {
        env: env as { [key: string]: string },
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: process.platform === 'win32',
      });

      this.processes.set(name, child);

      // 收集 stdout/stderr
      let stderrBuffer = '';
      child.stdout?.on('data', (data: Buffer) => {
        const text = data.toString();
        // 尝试从 stdout 解析 server identity
        if (!server.identity.version || server.identity.version === '0.0.0') {
          this.tryParseIdentity(text, server);
        }
      });

      child.stderr?.on('data', (data: Buffer) => {
        stderrBuffer += data.toString();
      });

      // 等待启动完成
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error(`启动超时 (${timeoutMs}ms)`));
        }, timeoutMs);

        child.on('error', (err) => {
          clearTimeout(timeout);
          reject(err);
        });

        child.on('spawn', () => {
          clearTimeout(timeout);
          resolve();
        });
      });

      // 更新状态
      server.runtime.status = 'running';
      server.runtime.startedAt = new Date().toISOString();
      server.runtime.pid = child.pid;
      server.runtime.lastError = undefined;

      // 设置健康检查
      this.scheduleHealthCheck(name);

      console.log(`[MCPRegistry] ▶️ 服务器已启动: ${name} (pid: ${child.pid})`);
      this.emitEvent('server:started', { name, status: 'running', pid: child.pid });

      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      server.runtime.status = 'error';
      server.runtime.lastError = errorMsg;
      server.runtime.restartCount++;

      console.error(`[MCPRegistry] ❌ 启动服务器 ${name} 失败: ${errorMsg}`);
      this.emitEvent('server:error', { name, error: errorMsg });

      // 自动重启
      if (server.runtime.restartCount < server.config.maxRestarts) {
        console.log(`[MCPRegistry] 🔄 重启 ${name} (${server.runtime.restartCount}/${server.config.maxRestarts})`);
        return this.startServer(name);
      }

      return false;
    }
  }

  /**
   * 停止 MCP 服务器
   */
  async stopServer(name: string): Promise<boolean> {
    const server = this.servers.get(name);
    if (!server) return false;

    // 清除健康检查
    const timer = this.healthTimers.get(name);
    if (timer) {
      clearInterval(timer);
      this.healthTimers.delete(name);
    }

    // 终止进程
    const child = this.processes.get(name);
    if (child) {
      try {
        child.kill('SIGTERM');
        // 等待退出
        await new Promise<void>((resolve) => {
          const timeout = setTimeout(() => {
            child.kill('SIGKILL');
            resolve();
          }, 5000);
          child.on('exit', () => {
            clearTimeout(timeout);
            resolve();
          });
        });
      } catch (err) {
        console.warn(`[MCPRegistry] 终止进程 ${name} 异常:`, err);
      }
      this.processes.delete(name);
    }

    server.runtime.status = 'stopped';
    this.emitEvent('server:stopped', { name });
    console.log(`[MCPRegistry] ⏹️ 服务器已停止: ${name}`);
    return true;
  }

  /**
   * 重启 MCP 服务器
   */
  async restartServer(name: string): Promise<boolean> {
    await this.stopServer(name);
    return this.startServer(name);
  }

  // ==================== 工具和能力管理 ====================

  /**
   * 注册服务器提供的工具
   */
  registerTools(serverName: string, tools: MCPTool[]): void {
    const server = this.servers.get(serverName);
    if (!server) throw new Error(`服务器 ${serverName} 未注册`);

    server.tools = tools;

    // 更新工具索引
    for (const tool of tools) {
      const existing = this.toolIndex.get(tool.name) || [];
      if (!existing.includes(serverName)) {
        existing.push(serverName);
        this.toolIndex.set(tool.name, existing);
      }
    }

    this.emitEvent('tool:discovered', { server: serverName, toolCount: tools.length });
  }

  /**
   * 注册服务器能力声明
   */
  registerCapabilities(serverName: string, capabilities: MCPCapability[]): void {
    const server = this.servers.get(serverName);
    if (!server) throw new Error(`服务器 ${serverName} 未注册`);

    server.capabilities = capabilities;

    // 更新能力索引
    for (const cap of capabilities) {
      const existing = this.capabilityIndex.get(cap.name) || [];
      if (!existing.includes(serverName)) {
        existing.push(serverName);
        this.capabilityIndex.set(cap.name, existing);
      }
    }
  }

  /**
   * 更新服务器 identity（从能力声明中提取）
   */
  updateIdentity(serverName: string, identity: Partial<MCPServerIdentity>): void {
    const server = this.servers.get(serverName);
    if (!server) return;

    server.identity = { ...server.identity, ...identity };
  }

  // ==================== 查询方法 ====================

  /**
   * 按工具名查找提供该工具的服务器
   */
  findServersByTool(toolName: string): MCPServer[] {
    const names = this.toolIndex.get(toolName) || [];
    return names.map(n => this.servers.get(n)).filter(Boolean) as MCPServer[];
  }

  /**
   * 按能力名查找提供该能力的服务器
   */
  findServersByCapability(capability: string): MCPServer[] {
    const names = this.capabilityIndex.get(capability) || [];
    return names.map(n => this.servers.get(n)).filter(Boolean) as MCPServer[];
  }

  /**
   * 按标签查找服务器
   */
  findServersByTag(tag: string): MCPServer[] {
    const names = this.tagIndex.get(tag) || [];
    return names.map(n => this.servers.get(n)).filter(Boolean) as MCPServer[];
  }

  /**
   * 按分类查找工具
   */
  findToolsByCategory(category: MCPTool['category']): { server: string; tool: MCPTool }[] {
    const results: { server: string; tool: MCPTool }[] = [];
    for (const [name, server] of this.servers) {
      for (const tool of server.tools) {
        if (tool.category === category) {
          results.push({ server: name, tool });
        }
      }
    }
    return results;
  }

  /**
   * 获取所有已注册的工具
   */
  getAllTools(): { server: string; tool: MCPTool }[] {
    const results: { server: string; tool: MCPTool }[] = [];
    for (const [name, server] of this.servers) {
      for (const tool of server.tools) {
        results.push({ server: name, tool });
      }
    }
    return results;
  }

  /**
   * 获取所有注册的能力
   */
  getAllCapabilities(): { server: string; capability: MCPCapability }[] {
    const results: { server: string; capability: MCPCapability }[] = [];
    for (const [name, server] of this.servers) {
      for (const cap of server.capabilities) {
        results.push({ server: name, capability: cap });
      }
    }
    return results;
  }

  // ==================== 事件系统 ====================

  /**
   * 注册事件监听
   */
  on(event: MCPRegistryEvent, handler: MCPEventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  /**
   * 移除事件监听
   */
  off(event: MCPRegistryEvent, handler: MCPEventHandler): void {
    this.eventHandlers.get(event)?.delete(handler);
  }

  /**
   * 触发事件
   */
  private emitEvent(event: MCPRegistryEvent, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(event, data);
        } catch (err) {
          console.warn(`[MCPRegistry] 事件处理器异常 [${event}]:`, err);
        }
      }
    }
  }

  // ==================== 健康检查 ====================

  /**
   * 定时健康检查
   */
  private scheduleHealthCheck(name: string): void {
    const server = this.servers.get(name);
    if (!server) return;

    const interval = server.config.healthCheckIntervalMs;

    const timer = setInterval(async () => {
      try {
        const start = Date.now();
        const child = this.processes.get(name);

        if (!child || !child.pid) {
          server.runtime.status = 'error';
          server.runtime.lastError = '进程不存在';
          this.emitEvent('health:changed', { name, status: 'error' });
          return;
        }

        // 检查进程是否存活
        try {
          const killResult = child.kill(0); // signal 0 = 仅检查存在性
          if (!killResult) {
            throw new Error('进程不存在');
          }
        } catch {
          server.runtime.status = 'error';
          server.runtime.lastError = '健康检查失败: 进程不存在';
          this.emitEvent('health:changed', { name, status: 'error' });
          return;
        }

        const latency = Date.now() - start;
        server.runtime.latency = latency;
        server.runtime.lastHeartbeat = new Date().toISOString();

        if (server.runtime.status !== 'running') {
          server.runtime.status = 'running';
          this.emitEvent('health:changed', { name, status: 'running' });
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        server.runtime.lastError = errorMsg;
        this.emitEvent('server:error', { name, error: errorMsg });
      }
    }, interval);

    this.healthTimers.set(name, timer);
  }

  // ==================== 内部方法 ====================

  /**
   * 建立服务器索引
   */
  private indexServer(server: MCPServer): void {
    // 标签索引
    for (const tag of server.config.tags) {
      const existing = this.tagIndex.get(tag) || [];
      existing.push(server.config.name);
      this.tagIndex.set(tag, existing);
    }
  }

  /**
   * 移除服务器索引
   */
  private deindexServer(name: string): void {
    // 从工具索引移除
    for (const [, servers] of this.toolIndex) {
      const idx = servers.indexOf(name);
      if (idx !== -1) servers.splice(idx, 1);
    }

    // 从能力索引移除
    for (const [, servers] of this.capabilityIndex) {
      const idx = servers.indexOf(name);
      if (idx !== -1) servers.splice(idx, 1);
    }

    // 从标签索引移除
    for (const [, servers] of this.tagIndex) {
      const idx = servers.indexOf(name);
      if (idx !== -1) servers.splice(idx, 1);
    }
  }

  /**
   * 尝试从 stdout 解析服务器 identity
   */
  private tryParseIdentity(output: string, server: MCPServer): void {
    // 尝试匹配协议版本行
    const protocolMatch = output.match(/protocol\s*version[:\s]+([\d.]+)/i);
    if (protocolMatch) {
      server.identity.protocolVersion = protocolMatch[1];
    }

    // 尝试匹配服务器版本
    const versionMatch = output.match(/version[:\s]+([\d.]+)/i);
    if (versionMatch) {
      server.identity.version = versionMatch[1];
    }
  }

  // ==================== 持久化 ====================

  /**
   * 将注册状态持久化到文件
   */
  persist(configPath: string): void {
    const servers = Array.from(this.servers.values()).map(s => ({
      config: s.config,
      enabled: s.enabled,
      runtime: {
        status: s.runtime.status,
        restartCount: s.runtime.restartCount,
        lastError: s.runtime.lastError,
      },
    }));

    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(configPath, JSON.stringify({ servers, registeredAt: new Date().toISOString() }, null, 2), 'utf-8');
  }

  /**
   * 从文件加载注册状态
   */
  load(configPath: string): void {
    try {
      if (!fs.existsSync(configPath)) return;
      const data = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (Array.isArray(data.servers)) {
        for (const entry of data.servers) {
          try {
            const server = this.registerServer(entry.config);
            server.enabled = entry.enabled ?? true;
            if (entry.runtime) {
              server.runtime.restartCount = entry.runtime.restartCount ?? 0;
              server.runtime.lastError = entry.runtime.lastError;
            }
          } catch {
            // 忽略重复注册
          }
        }
      }
    } catch {
      // 忽略加载错误
    }
  }

  // ==================== 清理 ====================

  /**
   * 停止所有服务器并清理
   */
  async clear(): Promise<void> {
    const names = Array.from(this.servers.keys());
    for (const name of names) {
      await this.stopServer(name);
    }
    this.servers.clear();
    this.toolIndex.clear();
    this.capabilityIndex.clear();
    this.tagIndex.clear();
    this.eventHandlers.clear();
    this.emitEvent('registry:cleared', {});
  }

  /**
   * 获取注册状态摘要
   */
  getSummary(): object {
    const running = Array.from(this.servers.values()).filter(s => s.runtime.status === 'running').length;
    const totalTools = Array.from(this.servers.values()).reduce((sum, s) => sum + s.tools.length, 0);

    return {
      totalServers: this.servers.size,
      running,
      stopped: this.servers.size - running,
      totalTools,
      totalCapabilities: Array.from(this.servers.values()).reduce((sum, s) => sum + s.capabilities.length, 0),
    };
  }
}

/** 全局单例 */
export const mcpRegistry = new MCPRegistry();
