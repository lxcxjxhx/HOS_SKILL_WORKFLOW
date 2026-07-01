/**
 * HOS-Sec-Engine - MCP Health Monitor
 *
 * MCP 服务器健康监控模块，负责：
 * 1. 定时全量/增量健康检查
 * 2. 自动恢复（重启失败的服务器）
 * 3. 健康状态变更通知
 * 4. 健康数据聚合和报告
 */

import { mcpRegistry } from './registry';
import { mcpDiscovery } from './discovery';
import { MCPHealthSummary, MCPHealthCheckResult } from './types';

// ==================== Constants ====================

/** 默认全量检查间隔 (ms) */
const DEFAULT_FULL_CHECK_INTERVAL = 60000;
/** 默认增量检查间隔 (ms) */
const DEFAULT_QUICK_CHECK_INTERVAL = 15000;
/** 自动恢复最大尝试次数（每服务器） */
const MAX_AUTO_RECOVERY_ATTEMPTS = 3;
/** 恢复冷却时间 (ms) */
const RECOVERY_COOLDOWN = 30000;
/** 全局最大恢复生命周期（总恢复次数，防止无限循环） */
const GLOBAL_MAX_RECOVERY_LIFETIME = 50;

// ==================== Health Monitor ====================

export class MCPHealthMonitor {
  private fullCheckTimer: NodeJS.Timeout | null = null;
  private quickCheckTimer: NodeJS.Timeout | null = null;
  private lastFullSummary: MCPHealthSummary | null = null;
  private recoveryAttempts: Map<string, number> = new Map();
  private lastRecoveryTime: Map<string, number> = new Map();
  private isRunning = false;
  private globalRecoveryCount = 0;

  /**
   * 启动健康监控
   */
  start(fullCheckInterval?: number, quickCheckInterval?: number): void {
    if (this.isRunning) return;
    this.isRunning = true;

    const fullInterval = fullCheckInterval || DEFAULT_FULL_CHECK_INTERVAL;
    const quickInterval = quickCheckInterval || DEFAULT_QUICK_CHECK_INTERVAL;

    console.log(`[MCPHealth] ▶️ 健康监控已启动 (full: ${fullInterval}ms, quick: ${quickInterval}ms)`);

    // 立即执行一次全量检查
    this.runFullCheck().catch(err =>
      console.warn('[MCPHealth] 初始健康检查失败:', err.message)
    );

    // 定时全量检查
    this.fullCheckTimer = setInterval(() => {
      this.runFullCheck().catch(err =>
        console.warn('[MCPHealth] 全量健康检查失败:', err.message)
      );
    }, fullInterval);

    // 定时增量检查（快速检查运行中服务器）
    this.quickCheckTimer = setInterval(() => {
      this.runQuickCheck().catch(err =>
        console.warn('[MCPHealth] 增量健康检查失败:', err.message)
      );
    }, quickInterval);
  }

  /**
   * 停止健康监控
   */
  stop(): void {
    this.isRunning = false;

    if (this.fullCheckTimer) {
      clearInterval(this.fullCheckTimer);
      this.fullCheckTimer = null;
    }

    if (this.quickCheckTimer) {
      clearInterval(this.quickCheckTimer);
      this.quickCheckTimer = null;
    }

    console.log('[MCPHealth] ⏹️ 健康监控已停止');
  }

  /**
   * 执行全量健康检查
   */
  async runFullCheck(): Promise<MCPHealthSummary> {
    const summary = await mcpDiscovery.healthCheckAll();
    this.lastFullSummary = summary;

    // 自动恢复
    await this.autoRecover(summary);

    // 记录摘要
    if (summary.unhealthyCount > 0) {
      console.log(`[MCPHealth] 📊 健康检查: ${summary.healthyCount}/${summary.totalServers} 健康, ${summary.unhealthyCount} 异常`);
    }

    return summary;
  }

  /**
   * 执行快速增量检查（只检查运行中的服务器）
   */
  async runQuickCheck(): Promise<MCPHealthSummary> {
    const servers = mcpRegistry.getServers();
    const runningServers = servers.filter(s => s.runtime.status === 'running');

    if (runningServers.length === 0) return this.getEmptySummary();

    const results: MCPHealthCheckResult[] = [];

    for (const server of runningServers) {
      const result = await mcpDiscovery.healthCheck(server.config.name);
      results.push(result);

      // 发现异常，尝试快速恢复
      if (!result.healthy) {
        await this.attemptRecovery(server.config.name);
      }
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
   * 自动恢复失败的服务器
   */
  private async autoRecover(summary: MCPHealthSummary): Promise<void> {
    for (const result of summary.results) {
      if (!result.healthy) {
        await this.attemptRecovery(result.serverName);
      }
    }
  }

  /**
   * 尝试恢复单个服务器
   */
  private async attemptRecovery(serverName: string): Promise<boolean> {
    // 检查全局恢复上限，防止无限循环
    if (this.globalRecoveryCount >= GLOBAL_MAX_RECOVERY_LIFETIME) {
      return false;
    }

    const server = mcpRegistry.getServer(serverName);
    if (!server || !server.enabled) return false;

    // 检查冷却时间
    const lastRecovery = this.lastRecoveryTime.get(serverName) || 0;
    if (Date.now() - lastRecovery < RECOVERY_COOLDOWN) {
      return false; // 冷却中
    }

    // 检查恢复次数
    const attempts = this.recoveryAttempts.get(serverName) || 0;
    if (attempts >= MAX_AUTO_RECOVERY_ATTEMPTS) {
      console.warn(`[MCPHealth] ⚠️ 服务器 ${serverName} 已达到最大恢复尝试次数 (${MAX_AUTO_RECOVERY_ATTEMPTS})`);
      return false;
    }

    this.recoveryAttempts.set(serverName, attempts + 1);
    this.lastRecoveryTime.set(serverName, Date.now());
    this.globalRecoveryCount++;

    console.log(`[MCPHealth] 🔄 自动恢复服务器: ${serverName} (尝试 ${attempts + 1}/${MAX_AUTO_RECOVERY_ATTEMPTS}, 全局: ${this.globalRecoveryCount}/${GLOBAL_MAX_RECOVERY_LIFETIME})`);

    try {
      const success = await mcpRegistry.restartServer(serverName);
      if (success) {
        console.log(`[MCPHealth] ✅ 服务器 ${serverName} 已成功恢复`);
        this.recoveryAttempts.delete(serverName);
      } else {
        console.warn(`[MCPHealth] ❌ 服务器 ${serverName} 恢复失败`);
      }
      return success;
    } catch (err) {
      console.warn(`[MCPHealth] ❌ 服务器 ${serverName} 恢复异常:`, err);
      return false;
    }
  }

  /**
   * 重置恢复计数（在手动重启后调用）
   */
  resetRecoveryCount(serverName: string): void {
    this.recoveryAttempts.delete(serverName);
    this.lastRecoveryTime.delete(serverName);
  }

  /**
   * 获取最后的全量检查摘要
   */
  getLastSummary(): MCPHealthSummary | null {
    return this.lastFullSummary;
  }

  /**
   * 获取监控运行状态
   */
  getStatus(): { running: boolean; servers: number; healthy: number } {
    const servers = mcpRegistry.getServers();
    const running = servers.filter(s => s.runtime.status === 'running').length;

    return {
      running: this.isRunning,
      servers: servers.length,
      healthy: running,
    };
  }

  /**
   * 获取空的健康摘要
   */
  private getEmptySummary(): MCPHealthSummary {
    return {
      totalServers: 0,
      healthyCount: 0,
      unhealthyCount: 0,
      healthRate: 0,
      results: [],
      lastUpdated: new Date().toISOString(),
    };
  }
}

/** 全局单例 */
export const mcpHealthMonitor = new MCPHealthMonitor();
