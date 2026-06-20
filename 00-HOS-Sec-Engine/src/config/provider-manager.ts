/**
 * HOS-Sec-Engine V4 - Provider 配置管理
 * 支持 AI Provider 配置加载、验证、加密存储
 */

import { AIProviderConfig } from './types';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Provider 配置管理器
 */
export class ProviderManager {
  private providers: Map<string, AIProviderConfig>;
  private encryptionKey: string;

  constructor(encryptionKey?: string) {
    this.providers = new Map();
    this.encryptionKey = encryptionKey || this.generateDefaultKey();
  }

  /**
   * 生成默认加密密钥（基于环境变量或机器标识）
   */
  private generateDefaultKey(): string {
    const envKey = process.env.HOS_SEC_ENCRYPTION_KEY;
    if (envKey) {
      return envKey;
    }
    // 使用固定密钥用于本地开发（生产环境应使用环境变量）
    return 'hos-sec-engine-default-key-32bytes!!';
  }

  /**
   * AES-256 加密
   */
  encrypt(text: string): string {
    const key = Buffer.from(this.encryptionKey.padEnd(32).slice(0, 32));
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * AES-256 解密
   */
  decrypt(encryptedText: string): string {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const key = Buffer.from(this.encryptionKey.padEnd(32).slice(0, 32));
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * 验证 Provider 配置
   */
  validateProvider(config: AIProviderConfig): string[] {
    const errors: string[] = [];

    if (!config.id || config.id.trim() === '') {
      errors.push('Provider ID 不能为空');
    }
    if (!config.name || config.name.trim() === '') {
      errors.push('Provider 名称不能为空');
    }
    if (!config.baseUrl || config.baseUrl.trim() === '') {
      errors.push('Base URL 不能为空');
    }
    if (!config.apiKey || config.apiKey.trim() === '') {
      errors.push('API Key 不能为空');
    }
    if (!config.model || config.model.trim() === '') {
      errors.push('模型名称不能为空');
    }
    if (config.maxTokens <= 0) {
      errors.push('maxTokens 必须大于 0');
    }
    if (config.temperature < 0 || config.temperature > 2) {
      errors.push('temperature 必须在 0-2 之间');
    }
    if (config.timeout <= 0) {
      errors.push('timeout 必须大于 0');
    }

    return errors;
  }

  /**
   * 注册 Provider
   */
  registerProvider(config: AIProviderConfig): void {
    const errors = this.validateProvider(config);
    if (errors.length > 0) {
      throw new Error(`Provider 配置验证失败: ${errors.join(', ')}`);
    }

    // 加密 API Key
    const encryptedConfig = {
      ...config,
      apiKey: this.encrypt(config.apiKey),
    };

    this.providers.set(config.id, encryptedConfig);
  }

  /**
   * 获取 Provider（解密 API Key）
   */
  getProvider(id: string): AIProviderConfig | undefined {
    const config = this.providers.get(id);
    if (!config) {
      return undefined;
    }

    return {
      ...config,
      apiKey: this.decrypt(config.apiKey),
    };
  }

  /**
   * 获取所有 Provider IDs
   */
  getProviderIds(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * 获取活跃 Provider
   */
  getActiveProvider(activeId: string): AIProviderConfig | undefined {
    return this.getProvider(activeId);
  }

  /**
   * 加载配置文件
   */
  static loadFromFile(filePath: string, encryptionKey?: string): ProviderManager {
    const manager = new ProviderManager(encryptionKey);

    if (!fs.existsSync(filePath)) {
      return manager;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const configs: AIProviderConfig[] = JSON.parse(content);

    for (const config of configs) {
      manager.registerProvider(config);
    }

    return manager;
  }

  /**
   * 保存配置到文件
   */
  saveToFile(filePath: string): void {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 保存加密版本
    const configs = Array.from(this.providers.values());
    fs.writeFileSync(filePath, JSON.stringify(configs, null, 2));
  }

  /**
   * 从环境变量加载 Provider
   */
  loadFromEnv(): void {
    // OpenAI
    if (process.env.OPENAI_API_KEY) {
      this.registerProvider({
        id: 'openai',
        name: 'OpenAI',
        type: 'openai',
        baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL || 'gpt-4',
        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4096', 10),
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
        timeout: parseInt(process.env.OPENAI_TIMEOUT || '60000', 10),
      });
    }

    // Anthropic
    if (process.env.ANTHROPIC_API_KEY) {
      this.registerProvider({
        id: 'claude',
        name: 'Claude',
        type: 'anthropic',
        baseUrl: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com',
        apiKey: process.env.ANTHROPIC_API_KEY,
        model: process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229',
        maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || '4096', 10),
        temperature: parseFloat(process.env.ANTHROPIC_TEMPERATURE || '0.7'),
        timeout: parseInt(process.env.ANTHROPIC_TIMEOUT || '60000', 10),
      });
    }

    // Local model (Ollama, etc.)
    if (process.env.LOCAL_MODEL_BASE_URL) {
      this.registerProvider({
        id: 'local',
        name: 'Local Model',
        type: 'local',
        baseUrl: process.env.LOCAL_MODEL_BASE_URL,
        apiKey: process.env.LOCAL_MODEL_API_KEY || 'local',
        model: process.env.LOCAL_MODEL_NAME || 'llama3',
        maxTokens: parseInt(process.env.LOCAL_MODEL_MAX_TOKENS || '4096', 10),
        temperature: parseFloat(process.env.LOCAL_MODEL_TEMPERATURE || '0.7'),
        timeout: parseInt(process.env.LOCAL_MODEL_TIMEOUT || '60000', 10),
      });
    }
  }
}
