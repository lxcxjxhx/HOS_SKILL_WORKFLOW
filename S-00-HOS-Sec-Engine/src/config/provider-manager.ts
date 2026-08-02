/**
 * HOS-Sec-Engine V4 - Provider 配置管理
 * 支持 AI Provider 配置加载、验证、加密存储
 *
 * 密钥管理策略：
 * - 生产环境：必须通过 HOS_SEC_ENCRYPTION_KEY 环境变量设置 32 字节密钥
 * - 开发环境：未设置时通过 PBKDF2 派生机器绑定密钥（非硬编码）
 * - 算法：AES-256-CBC + PBKDF2 密钥派生
 */

import { AIProviderConfig } from './types';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/** AES 加密常量 */
const KEY_BYTES = 32; // AES-256
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_DIGEST = 'sha512';
const SALT_BYTES = 16;
const IV_BYTES = 16;

/**
 * Provider 配置管理器
 */
export class ProviderManager {
  private providers: Map<string, AIProviderConfig>;
  private encryptionKey: Buffer;

  constructor(encryptionKey?: string) {
    this.providers = new Map();
    this.encryptionKey = this.deriveKey(encryptionKey);
  }

  /**
   * 派生 AES-256 密钥
   * - 若提供 key 参数或 HOS_SEC_ENCRYPTION_KEY 环境变量，直接 PBKDF2 派生
   * - 否则使用机器绑定信息生成开发密钥（仅限非生产环境）
   */
  private deriveKey(keyInput?: string): Buffer {
    const passphrase = keyInput || process.env.HOS_SEC_ENCRYPTION_KEY;
    if (passphrase) {
      // 显式密钥：使用固定盐派生，保证可重复性
      const salt = crypto.createHash('sha256').update('hos-sec-engine-v4').digest().slice(0, SALT_BYTES);
      return crypto.pbkdf2Sync(passphrase, salt, PBKDF2_ITERATIONS, KEY_BYTES, PBKDF2_DIGEST);
    }

    // 开发环境：使用机器标识生成可重复的派生密钥
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        '[Security Error] HOS_SEC_ENCRYPTION_KEY environment variable is required in production.'
      );
    }

    const machineSecret = [
      os.hostname(),
      os.platform(),
      os.arch(),
      'hos-sec-engine-dev',
    ].join('|');

    console.warn(
      '[Security Warning] No HOS_SEC_ENCRYPTION_KEY set. Using machine-derived key for development only.\n' +
      '  Set HOS_SEC_ENCRYPTION_KEY environment variable for production deployment.'
    );

    return crypto.pbkdf2Sync(
      machineSecret,
      crypto.createHash('sha256').update(os.hostname()).digest().slice(0, SALT_BYTES),
      PBKDF2_ITERATIONS,
      KEY_BYTES,
      PBKDF2_DIGEST
    );
  }

  /**
   * AES-256-CBC 加密
   */
  encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_BYTES);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * AES-256-CBC 解密
   */
  decrypt(encryptedText: string): string {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
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
   * 注册 Provider（自动加密 API Key）
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
   * 注册已加密的 Provider（从文件加载时使用，避免双重加密）
   */
  private registerEncryptedProvider(config: AIProviderConfig): void {
    const errors = this.validateProvider({ ...config, apiKey: 'placeholder' });
    if (errors.length > 0) {
      throw new Error(`Provider 配置验证失败: ${errors.join(', ')}`);
    }
    this.providers.set(config.id, config);
  }

  /**
   * 获取 Provider（自动解密 API Key）
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
      manager.registerEncryptedProvider(config);
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
