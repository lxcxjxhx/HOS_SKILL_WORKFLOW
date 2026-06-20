import { AttackDefenseSkill } from '../types/skill';
import { SkillResult, ExecuteQuery, EngineConfig } from '../types/result';
import { Playbook, FlowContext, OrchestrationResult } from '../types/playbook';
import { SkillValidator } from './validator';
import { SkillMatcher } from './matcher';
import { SkillFormatter } from './formatter';
import { SkillLoader } from './loader';
import { FlowOrchestrator } from './orchestrator';
import { RuntimeConfig, DEFAULT_RUNTIME_CONFIG } from '../config/types';
import { ProviderManager } from '../config/provider-manager';
import { ConfigLoader } from '../config/config-loader';
import { AgentCoordination, AgentTask, AgentResult } from '../agents/types';
import { AgentCoordinator } from '../agents/coordinator';
import { ExecutionContextManager } from '../runtime/execution-context';
import type { ExecutionContext } from '../runtime/execution-context';
import { Sandbox } from '../runtime/sandbox';
import { AgentServer } from '../runtime/server';

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Required<EngineConfig> = {
  strictMode: true,
  maxResults: 10,
  minMatchScore: 0.1,
  customSkillsDir: '',
  loadPresetSkills: true
};

/**
 * HOS-Sec-Engine V2 - Skill Engine
 * 攻防专项 Skill 引擎
 */
export class HosSecEngine {
  private config: Required<EngineConfig>;
  private skills: Map<string, AttackDefenseSkill>;
  private matcher: SkillMatcher;
  private orchestrator: FlowOrchestrator;
  private playbooks: Map<string, Playbook>;

  // V4 Runtime
  private runtimeConfig: RuntimeConfig;
  private providerManager: ProviderManager;
  private agentCoordinator: AgentCoordinator;
  private contextManager: ExecutionContextManager | null = null;
  private agentServer: AgentServer | null;

  constructor(config: EngineConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.skills = new Map();
    this.playbooks = new Map();
    this.matcher = new SkillMatcher(this.config);
    this.orchestrator = new FlowOrchestrator(this);

    // V4 Runtime initialization
    this.runtimeConfig = DEFAULT_RUNTIME_CONFIG;
    this.providerManager = new ProviderManager();
    this.agentCoordinator = new AgentCoordinator();
    this.agentServer = null;

    if (this.config.loadPresetSkills) {
      this.loadPresetSkills();
    }

    if (this.config.customSkillsDir) {
      this.loadCustomSkills();
    }
  }

  /**
   * 加载预设 Skill
   * 从 skills/ 目录递归加载所有 Skill 文件
   * AI 维护：新增 Skill 只需在 skills/ 子目录下创建文件，无需修改此文件
   */
  private loadPresetSkills(): void {
    try {
      // __dirname = dist/src/core, need to go up to dist/src/skills
      const skillsDir = require('path').resolve(__dirname, '..', 'skills');
      const skills = SkillLoader.loadFromDirectory(skillsDir);
      this.registerSkills(skills);
    } catch (error) {
      // 预设 Skill 目录不存在时不报错
    }
  }

  /**
   * 加载自定义 Skill
   */
  private loadCustomSkills(): void {
    const skills = SkillLoader.loadFromDirectory(this.config.customSkillsDir);
    this.registerSkills(skills);
  }

  /**
   * 注册单个 Skill
   */
  registerSkill(skill: AttackDefenseSkill): void {
    const errors = SkillValidator.validate(skill);
    if (errors.length > 0) {
      if (this.config.strictMode) {
        throw new Error(`Skill 验证失败 [${skill.metadata.id}]: ${errors.join(', ')}`);
      }
      return;
    }

    if (this.skills.has(skill.metadata.id)) {
      if (this.config.strictMode) {
        throw new Error(`Skill ID 重复: ${skill.metadata.id}`);
      }
    }

    if (skill.enabled === undefined) {
      skill.enabled = true;
    }

    this.skills.set(skill.metadata.id, skill);
  }

  /**
   * 批量注册 Skill
   */
  registerSkills(skills: AttackDefenseSkill[]): void {
    const validationResults = SkillValidator.validateBatch(skills);
    if (validationResults.size > 0) {
      const errorMessages: string[] = [];
      for (const [id, errors] of validationResults) {
        errorMessages.push(`[${id}]: ${errors.join(', ')}`);
      }
      if (this.config.strictMode) {
        throw new Error(`Skill 验证失败:\n${errorMessages.join('\n')}`);
      }
    }

    for (const skill of skills) {
      if (validationResults.has(skill.metadata.id)) {
        continue;
      }
      this.registerSkill(skill);
    }
  }

  /**
   * 执行查询
   */
  execute(query: ExecuteQuery, format: 'text' | 'json' = 'text'): string {
    const allSkills = Array.from(this.skills.values());
    const results = this.matcher.match(query, allSkills);

    if (format === 'json') {
      return SkillFormatter.formatJson(results);
    }
    return SkillFormatter.formatText(results);
  }

  /**
   * 获取原始匹配结果
   */
  executeRaw(query: ExecuteQuery): SkillResult[] {
    const allSkills = Array.from(this.skills.values());
    return this.matcher.match(query, allSkills);
  }

  /**
   * 获取所有已加载的 Skill
   */
  getSkills(): AttackDefenseSkill[] {
    return Array.from(this.skills.values());
  }

  /**
   * 根据 ID 获取 Skill
   */
  getSkillById(id: string): AttackDefenseSkill | undefined {
    return this.skills.get(id);
  }

  /**
   * 获取 Skill 数量
   */
  getSkillCount(): number {
    return this.skills.size;
  }

  /**
   * 启用/禁用 Skill
   */
  enableSkill(id: string): boolean {
    const skill = this.skills.get(id);
    if (skill) {
      skill.enabled = true;
      return true;
    }
    return false;
  }

  disableSkill(id: string): boolean {
    const skill = this.skills.get(id);
    if (skill) {
      skill.enabled = false;
      return true;
    }
    return false;
  }

  /**
   * 移除 Skill
   */
  removeSkill(id: string): boolean {
    return this.skills.delete(id);
  }

  /**
   * 清空所有 Skill
   */
  clearSkills(): void {
    this.skills.clear();
  }

  // ==================== 流程编排能力 ====================

  /**
   * 加载流程定义
   * @param playbook 流程定义对象
   */
  loadPlaybook(playbook: Playbook): void {
    this.playbooks.set(playbook.id, playbook);
    this.orchestrator.loadPlaybook(playbook);
  }

  /**
   * 获取所有已加载的流程
   * @returns 流程列表
   */
  getPlaybooks(): Playbook[] {
    return Array.from(this.playbooks.values());
  }

  /**
   * 根据 ID 获取已加载的流程
   * @param id 流程 ID
   * @returns 流程定义或 undefined
   */
  getPlaybookById(id: string): Playbook | undefined {
    return this.playbooks.get(id);
  }

  /**
   * 获取流程关联的 Skill 列表
   * @param playbookId 流程 ID
   * @returns 关联的 Skill 列表
   */
  getSkillsByPlaybook(playbookId: string): AttackDefenseSkill[] {
    const playbook = this.playbooks.get(playbookId);
    if (!playbook) {
      return [];
    }

    const skillIds = new Set<string>();
    for (const phase of playbook.phases) {
      for (const skillId of phase.skills) {
        skillIds.add(skillId);
      }
    }

    const result: AttackDefenseSkill[] = [];
    for (const skillId of skillIds) {
      const skill = this.skills.get(skillId);
      if (skill) {
        result.push(skill);
      }
    }

    return result;
  }

  /**
   * 执行流程
   * @param context 流程上下文
   * @returns 流程执行结果
   */
  async executeFlow(context: FlowContext): Promise<OrchestrationResult> {
    return this.orchestrator.executeFlow(context);
  }

  /**
   * 获取流程编排器实例
   * @returns FlowOrchestrator 实例
   */
  getOrchestrator(): FlowOrchestrator {
    return this.orchestrator;
  }

  // ==================== V4 独立运行时能力 ====================

  /**
   * 初始化运行时配置
   */
  async initializeRuntime(config: RuntimeConfig): Promise<void> {
    this.runtimeConfig = config;

    // 加载 Provider 配置
    for (const provider of config.providers) {
      try {
        this.providerManager.registerProvider(provider);
      } catch (error) {
        console.warn(`Provider [${provider.id}] 注册失败: ${error}`);
      }
    }

    // 尝试从环境变量加载额外 Provider
    this.providerManager.loadFromEnv();

    // 如果没有活跃 Provider，使用第一个可用的
    if (!this.runtimeConfig.activeProvider) {
      const ids = this.providerManager.getProviderIds();
      if (ids.length > 0) {
        this.runtimeConfig.activeProvider = ids[0];
      }
    }
  }

  /**
   * 获取 Agent 协调器实例
   */
  getAgentCoordinator(): AgentCoordination {
    return this.agentCoordinator;
  }

  /**
   * 在沙箱中执行 Skill
   */
  async executeSkillInSandbox(
    skill: AttackDefenseSkill,
    context: ExecutionContext
  ): Promise<AgentResult> {
    const startTime = Date.now();
    const runtime = skill.runtime;
    const sandboxConfig = {
      ...this.runtimeConfig.sandbox,
      enabled: runtime?.requiresSandbox ?? this.runtimeConfig.sandbox.enabled,
    };

    const sandbox = new Sandbox(sandboxConfig);

    try {
      const result = await sandbox.execute(async () => {
        // 模拟 Skill 执行
        context.logs.push({
          timestamp: new Date().toISOString(),
          level: 'info',
          message: `执行 Skill: ${skill.metadata.id}`,
          source: 'engine',
        });

        // 检查网络访问需求
        if (runtime?.requiresNetwork && sandboxConfig.networkAccess === 'none') {
          throw new Error(`Skill ${skill.metadata.id} 需要网络访问，但沙箱已禁用网络`);
        }

        // 返回模拟结果
        return {
          taskId: context.runId,
          status: 'success' as const,
          output: `Skill ${skill.metadata.id} 执行完成`,
          findings: [],
          evidence: [],
          duration: Date.now() - startTime,
        };
      });

      return result;
    } catch (error) {
      return {
        taskId: context.runId,
        status: 'failed',
        output: '',
        findings: [],
        evidence: [],
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * 启动 Agent 通信服务器
   */
  async startServer(port: number): Promise<void> {
    if (this.agentServer) {
      await this.agentServer.stop();
    }

    this.agentServer = new AgentServer({ port });
    await this.agentServer.start();
    console.log(`Agent 服务器已启动，端口: ${port}`);
  }

  /**
   * 停止 Agent 通信服务器
   */
  async stopServer(): Promise<void> {
    if (this.agentServer) {
      await this.agentServer.stop();
      this.agentServer = null;
    }
  }

  /**
   * 获取 Provider 管理器
   */
  getProviderManager(): ProviderManager {
    return this.providerManager;
  }

  /**
   * 获取当前运行时配置
   */
  getRuntimeConfig(): RuntimeConfig {
    return this.runtimeConfig;
  }

  /**
   * 创建执行上下文
   */
  createExecutionContext(target: string): ExecutionContext {
    return ExecutionContextManager.create(target, this.runtimeConfig);
  }
}
