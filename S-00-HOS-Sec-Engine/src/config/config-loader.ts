/**
 * HOS-Sec-Engine V4 - 配置加载器
 * 支持 JSON 配置文件和环境变量覆盖
 */

import { RuntimeConfig, DEFAULT_RUNTIME_CONFIG } from './types';
import { ProviderManager } from './provider-manager';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 配置加载器
 */
export class ConfigLoader {
  /**
   * 加载运行时配置
   */
  static loadRuntimeConfig(configPath?: string): RuntimeConfig {
    const config = { ...DEFAULT_RUNTIME_CONFIG };

    // 从文件加载
    if (configPath && fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf8');
      const fileConfig = JSON.parse(content);
      Object.assign(config, fileConfig);
    }

    // 环境变量覆盖
    if (process.env.HOS_SEC_ACTIVE_PROVIDER) {
      config.activeProvider = process.env.HOS_SEC_ACTIVE_PROVIDER;
    }
    if (process.env.HOS_SEC_MAX_CONCURRENT_AGENTS) {
      config.maxConcurrentAgents = parseInt(process.env.HOS_SEC_MAX_CONCURRENT_AGENTS, 10);
    }
    if (process.env.HOS_SEC_AGENT_TIMEOUT) {
      config.agentTimeout = parseInt(process.env.HOS_SEC_AGENT_TIMEOUT, 10);
    }
    if (process.env.HOS_SEC_SANDBOX_ENABLED) {
      config.sandbox.enabled = process.env.HOS_SEC_SANDBOX_ENABLED === 'true';
    }
    if (process.env.HOS_SEC_SANDBOX_NETWORK) {
      config.sandbox.networkAccess = process.env.HOS_SEC_SANDBOX_NETWORK as 'full' | 'restricted' | 'none';
    }
    if (process.env.HOS_SEC_SANDBOX_TIMEOUT) {
      config.sandbox.timeout = parseInt(process.env.HOS_SEC_SANDBOX_TIMEOUT, 10);
    }

    return config;
  }

  /**
   * 加载 Provider 配置
   */
  static loadProviders(configDir?: string, encryptionKey?: string): ProviderManager {
    const manager = new ProviderManager(encryptionKey);

    // 尝试从文件加载
    const providerConfigPath = configDir
      ? path.join(configDir, 'providers.json')
      : path.join(process.cwd(), 'config', 'providers.json');

    if (fs.existsSync(providerConfigPath)) {
      return ProviderManager.loadFromFile(providerConfigPath, encryptionKey);
    }

    // 从环境变量加载
    manager.loadFromEnv();

    return manager;
  }

  /**
   * 获取配置目录
   */
  static getConfigDir(): string {
    return path.join(process.cwd(), 'config');
  }

  /**
   * 确保配置目录存在
   */
  static ensureConfigDir(): string {
    const dir = this.getConfigDir();
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }
}
