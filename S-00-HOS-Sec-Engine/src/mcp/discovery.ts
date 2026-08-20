/**
 * HOS-Sec-Engine - MCP Discovery
 *
 * MCP 服务器自动发现模块，负责：
 * 1. 扫描已知 MCP 包并检查是否可用
 * 2. 检查 npm 全局/本地安装的 MCP 包
 * 3. 从文件系统发现 MCP 配置文件
 * 4. 从远程索引发现公共 MCP 服务器
 * 5. 健康检查和连通性验证
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { MCPServerConfig, MCPDiscoveryResult, MCPDiscoveryConfig, MCPHealthCheckResult, MCPHealthSummary } from './types';
import { mcpRegistry } from './registry';

// ==================== Constants ====================

/** 已知的 MCP 包（社区官方） */
const KNOWN_MCP_PACKAGES: { name: string; package: string; description: string; category: string; tags: string[] }[] = [
  // 浏览器自动化
  { name: 'playwright', package: '@anthropic/mcp-playwright', description: '浏览器自动化 — 攻击验证、WAF行为测试', category: 'browser', tags: ['browser', 'automation', 'waf', 'xss'] },
  { name: 'browserbase', package: '@anthropic/mcp-browserbase', description: '云浏览器 — stealth automation、真实环境测试', category: 'browser', tags: ['browser', 'cloud', 'stealth'] },

  // HTTP 网络
  { name: 'http-fetch', package: '@anthropic/mcp-fetch', description: 'HTTP 请求 — payload 注入、API fuzz', category: 'network', tags: ['http', 'api', 'fuzz', 'injection'] },
  { name: 'http-server', package: '@anthropic/mcp-http-server', description: 'HTTP 服务 — payload 监听、回调接收', category: 'network', tags: ['http', 'server', 'callback'] },

  // 推理规划
  { name: 'sequential-thinking', package: '@anthropic/mcp-sequential-thinking', description: '多步推理 — 攻击链规划、策略生成', category: 'reasoning', tags: ['reasoning', 'planning', 'strategy'] },

  // 记忆/知识
  { name: 'memory', package: '@anthropic/mcp-memory', description: '持久记忆 — WAF 指纹、payload 成功率记录', category: 'memory', tags: ['memory', 'knowledge', 'persistence'] },

  // 文件系统
  { name: 'filesystem', package: '@anthropic/mcp-filesystem', description: '文件系统 — payload 存储、日志、结果持久化', category: 'filesystem', tags: ['filesystem', 'storage', 'logs'] },

  // 代码执行
  { name: 'code-executor', package: '@anthropic/mcp-code-executor', description: '代码沙箱 — JS/Python payload 测试', category: 'code', tags: ['code', 'sandbox', 'execution'] },

  // 集成
  { name: 'github', package: '@anthropic/mcp-github', description: 'GitHub — payload 库管理、exploit 同步', category: 'integration', tags: ['github', 'repository', 'sync'] },
  { name: 'git', package: '@anthropic/mcp-git', description: 'Git 操作 — 仓库管理、diff 分析', category: 'integration', tags: ['git', 'version-control', 'diff'] },
  { name: 'slack', package: '@anthropic/mcp-slack', description: 'Slack 通知 — 结果推送、告警', category: 'integration', tags: ['slack', 'notification', 'alert'] },

  // 数据库
  { name: 'sqlite', package: '@anthropic/mcp-sqlite', description: 'SQLite — 数据存储和查询', category: 'filesystem', tags: ['database', 'sqlite', 'storage'] },
  { name: 'postgres', package: '@anthropic/mcp-postgres', description: 'PostgreSQL — 数据存储和查询', category: 'filesystem', tags: ['database', 'postgres', 'storage'] },
];

/** 默认发现配置 */
const DEFAULT_DISCOVERY_CONFIG: MCPDiscoveryConfig = {
  searchPaths: [
    path.resolve(__dirname, '..', '..', 'config', 'mcp-servers.json'),
    path.resolve(__dirname, '..', '..', '..', '.claude', 'mcp.json'),
  ],
  knownPackages: KNOWN_MCP_PACKAGES.map(p => p.package),
  checkNpmGlobal: true,
  checkNodeModules: true,
  discoveryIntervalMs: 60000,
};

/** MCP 发现结果文件 */
const DISCOVERY_STATE_PATH = path.resolve(__dirname, '..', '..', '.claude', 'mcp-discovery.json');

// ==================== MCP Discovery ====================

export class MCPDiscovery {
  private config: MCPDiscoveryConfig;
  private lastResult: MCPDiscoveryResult | null = null;
  private discoveredPackages: Set<string> = new Set();

  constructor(config: Partial<MCPDiscoveryConfig> = {}) {
    this.config = { ...DEFAULT_DISCOVERY_CONFIG, ...config };
    this.loadState();
  }

  /**
   * 执行全面发现扫描
   * 返回新发现的 MCP 服务器配置
   */
  async discoverAll(): Promise<MCPDiscoveryResult> {
    const discovered: MCPServerConfig[] = [];
    const failed: { name: string; reason: string }[] = [];
    const existing = mcpRegistry.getServers().map(s => s.config.name);

    // 1. 从配置文件发现
    const fromConfig = this.discoverFromConfigFiles();
    for (const cfg of fromConfig) {
      if (!mcpRegistry.getServer(cfg.name)) {
        discovered.push(cfg);
      }
    }

    // 2. 从已知包发现
    const fromPackages = await this.discoverFromKnownPackages();
    for (const cfg of fromPackages) {
      if (!mcpRegistry.getServer(cfg.name)) {
        if (!discovered.find(d => d.name === cfg.name)) {
          discovered.push(cfg);
        }
      }
    }

    // 3. 从 npm 发现
    const fromNpm = await this.discoverFromNpm();
    for (const cfg of fromNpm) {
      if (!mcpRegistry.getServer(cfg.name)) {
        if (!discovered.find(d => d.name === cfg.name)) {
          discovered.push(cfg);
        }
      }
    }

    const result: MCPDiscoveryResult = {
      discovered,
      existing,
      failed,
      timestamp: new Date().toISOString(),
    };

    this.lastResult = result;
    this.saveState();

    console.log(`[MCPDiscovery] 🔍 发现完成: ${discovered.length} 个新服务器, ${existing.length} 个已存在`);
    return result;
  }

  /**
   * 从 MCP 配置文件中发现
   */
  private discoverFromConfigFiles(): MCPServerConfig[] {
    const configs: MCPServerConfig[] = [];

    for (const searchPath of this.config.searchPaths) {
      try {
        if (!fs.existsSync(searchPath)) continue;

        let data: any;
        const content = fs.readFileSync(searchPath, 'utf-8');
        data = JSON.parse(content);

        // 支持两种格式: { mcpServers: {...} } 和 { servers: [...] }
        let servers: any[] = [];
        if (data.mcpServers) {
          servers = Object.entries(data.mcpServers).map(([name, s]: [string, any]) => ({
            name,
            ...(typeof s === 'string' ? { command: s, args: [] } : s),
          }));
        } else if (Array.isArray(data.servers)) {
          servers = data.servers;
        } else if (Array.isArray(data)) {
          servers = data;
        }

        for (const entry of servers) {
          if (typeof entry === 'object' && entry.command) {
            configs.push(this.normalizeConfig(entry));
          }
        }
      } catch (err) {
        console.warn(`[MCPDiscovery] 配置文件读取失败 [${searchPath}]:`, err instanceof Error ? err.message : String(err));
      }
    }

    return configs;
  }

  /**
   * 从已知 MCP 包发现（检查是否已安装）
   */
  private async discoverFromKnownPackages(): Promise<MCPServerConfig[]> {
    const configs: MCPServerConfig[] = [];

    for (const pkg of KNOWN_MCP_PACKAGES) {
      try {
        const isInstalled = await this.checkPackageInstalled(pkg.package);
        if (!isInstalled) {
          continue;
        }

        if (!this.discoveredPackages.has(pkg.name)) {
          this.discoveredPackages.add(pkg.name);
        }

        configs.push({
          name: pkg.name,
          command: 'npx',
          args: [pkg.package],
          env: {},
          description: pkg.description,
          autoStart: true,
          maxRestarts: 3,
          healthCheckIntervalMs: 30000,
          timeoutMs: 30000,
          tags: pkg.tags,
        });
      } catch {
        // 包未安装，跳过
      }
    }

    return configs;
  }

  /**
   * 从 npm 全局/本地安装发现
   */
  private async discoverFromNpm(): Promise<MCPServerConfig[]> {
    const configs: MCPServerConfig[] = [];

    if (!this.config.checkNpmGlobal && !this.config.checkNodeModules) {
      return configs;
    }

    try {
      // 检查 npm 全局安装的 @anthropic/mcp-* 包
      const npmList = execSync('npm list -g --depth=0 --json 2>&1 || echo "{}"', {
        encoding: 'utf-8',
        timeout: 5000,
      });

      let npmData: any;
      try {
        npmData = JSON.parse(npmList);
      } catch {
        return configs;
      }

      const dependencies = npmData?.dependencies || {};
      for (const [pkgName, _] of Object.entries(dependencies)) {
        if (pkgName.startsWith('@anthropic/mcp-') || pkgName.startsWith('mcp-')) {
          const known = KNOWN_MCP_PACKAGES.find(k => k.package === pkgName);
          if (known && !mcpRegistry.getServer(known.name)) {
            configs.push({
              name: known.name,
              command: pkgName,
              args: [],
              env: {},
              description: known.description,
              autoStart: true,
              maxRestarts: 3,
              healthCheckIntervalMs: 30000,
              timeoutMs: 30000,
              tags: known.tags,
            });
          }
        }
      }
    } catch {
      // npm check failed, skip
    }

    return configs;
  }

  // ==================== 健康检查 ====================

  /**
   * 执行全量健康检查
   */
  async healthCheckAll(): Promise<MCPHealthSummary> {
    const servers = mcpRegistry.getServers();
    const results: MCPHealthCheckResult[] = [];

    for (const server of servers) {
      const result = await this.healthCheck(server.config.name);
      results.push(result);
    }

    const healthyCount = results.filter(r => r.healthy).length;

    return {
      totalServers: servers.length,
      healthyCount,
      unhealthyCount: servers.length - healthyCount,
      healthRate: servers.length === 0 ? 0 : healthyCount / servers.length,
      results,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * 检查单个服务器健康状态
   */
  async healthCheck(serverName: string): Promise<MCPHealthCheckResult> {
    const server = mcpRegistry.getServer(serverName);
    if (!server) {
      return {
        serverName,
        healthy: false,
        latency: 0,
        timestamp: new Date().toISOString(),
        error: '服务器未注册',
        toolCount: 0,
      };
    }

    const start = Date.now();

    try {
      // 检查进程是否存在
      if (server.runtime.status !== 'running') {
        // 尝试自动启动
        if (server.enabled && server.runtime.restartCount < server.config.maxRestarts) {
          await mcpRegistry.startServer(serverName);
        }

        return {
          serverName,
          healthy: false,
          latency: Date.now() - start,
          timestamp: new Date().toISOString(),
          error: `状态: ${server.runtime.status}，最后错误: ${server.runtime.lastError || '无'}`,
          toolCount: server.tools.length,
        };
      }

      return {
        serverName,
        healthy: true,
        latency: Date.now() - start,
        timestamp: new Date().toISOString(),
        toolCount: server.tools.length,
      };
    } catch (err) {
      return {
        serverName,
        healthy: false,
        latency: Date.now() - start,
        timestamp: new Date().toISOString(),
        error: err instanceof Error ? err.message : String(err),
        toolCount: server.tools.length,
      };
    }
  }

  // ==================== 辅助方法 ====================

  /**
   * 格式化配置为统一格式
   */
  private normalizeConfig(entry: any): MCPServerConfig {
    return {
      name: entry.name || entry.id || 'unknown',
      command: entry.command,
      args: entry.args || [],
      env: entry.env || {},
      description: entry.description || '',
      autoStart: entry.autoStart !== false,
      maxRestarts: entry.maxRestarts ?? 3,
      healthCheckIntervalMs: entry.healthCheckIntervalMs ?? 30000,
      timeoutMs: entry.timeoutMs ?? 30000,
      tags: entry.tags || [],
    };
  }

  /**
   * 检查 npm 包是否已安装
   */
  private async checkPackageInstalled(packageName: string): Promise<boolean> {
    // 检查 node_modules
    if (this.config.checkNodeModules) {
      const paths = [
        path.resolve(__dirname, '..', '..', '..', 'node_modules', packageName),
        path.resolve(__dirname, '..', '..', 'node_modules', packageName),
      ];

      for (const p of paths) {
        if (fs.existsSync(p)) return true;
      }
    }

    // 检查 npx 缓存
    try {
      execSync(`npx --yes ${packageName} --version 2>&1 || true`, {
        timeout: 3000,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 获取发现结果
   */
  getLastResult(): MCPDiscoveryResult | null {
    return this.lastResult;
  }

  /**
   * 获取已知包列表
   */
  getKnownPackages(): typeof KNOWN_MCP_PACKAGES {
    return [...KNOWN_MCP_PACKAGES];
  }

  /**
   * 持久化发现状态
   */
  private saveState(): void {
    try {
      const dir = path.dirname(DISCOVERY_STATE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DISCOVERY_STATE_PATH, JSON.stringify({
        discoveredPackages: Array.from(this.discoveredPackages),
        lastResult: this.lastResult,
      }, null, 2), 'utf-8');
    } catch {
      // 忽略持久化错误
    }
  }

  /**
   * 加载发现状态
   */
  private loadState(): void {
    try {
      if (!fs.existsSync(DISCOVERY_STATE_PATH)) return;
      const data = JSON.parse(fs.readFileSync(DISCOVERY_STATE_PATH, 'utf-8'));
      if (Array.isArray(data.discoveredPackages)) {
        this.discoveredPackages = new Set(data.discoveredPackages);
      }
      if (data.lastResult) {
        this.lastResult = data.lastResult;
      }
    } catch {
      // 忽略加载错误
    }
  }
}

/** 全局单例 */
export const mcpDiscovery = new MCPDiscovery();
