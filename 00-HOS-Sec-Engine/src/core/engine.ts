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
import { AgentResult } from '../agents/types';
import { AgentCoordinator } from '../agents/coordinator';
import { ExecutionContextManager } from '../runtime/execution-context';
import type { ExecutionContext } from '../runtime/execution-context';
import { Sandbox } from '../runtime/sandbox';
import { AgentServer } from '../runtime/server';
import * as path from 'path';

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

/** 最大注册 Skill 数量，防止异常数据导致内存耗尽 */
const MAX_REGISTER_SKILLS = 1000;

/** 最大 playbook 阶段 Skill 关联数量 */
const MAX_PLAYBOOK_SKILL_LINKS = 500;

/**
 * HOS-Sec-Engine V2 - Skill Engine
 * 攻防专项 Skill 引擎
 */
export class HosSecEngine {
  private config: Required<EngineConfig>;
  private skills: Map<string, AttackDefenseSkill>;
  private cachedSkillsList: AttackDefenseSkill[] | null = null;
  /** 分类索引: category -> skillId[]，lazy 构建 */
  private categoryIndex: Map<string, string[]> | null = null;
  private cachedPlaybookSkills: Map<string, AttackDefenseSkill[]> = new Map();
  private matcher: SkillMatcher;
  private orchestrator: FlowOrchestrator;
  private playbooks: Map<string, Playbook>;

  // V4 Runtime
  private runtimeConfig: RuntimeConfig;
  private providerManager: ProviderManager;
  private agentCoordinator: AgentCoordinator;
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
      const skillsDir = path.resolve(__dirname, '..', 'skills');
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
   * @param skipValidation 当从 registerSkills 调用时跳过重复验证
   */
  registerSkill(skill: AttackDefenseSkill, skipValidation = false): void {
    if (!skipValidation) {
      const errors = SkillValidator.validate(skill);
      if (errors.length > 0) {
        if (this.config.strictMode) {
          throw new Error(`Skill 验证失败 [${skill.metadata.id}]: ${errors.join(', ')}`);
        }
        return;
      }
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
    this.invalidateCaches();
  }

  /**
   * 批量注册 Skill
   */
  registerSkills(skills: AttackDefenseSkill[]): void {
    if (skills.length > MAX_REGISTER_SKILLS) {
      console.warn(`[HosSecEngine] 注册 Skill 数量超出上限 (${MAX_REGISTER_SKILLS})，仅处理前 ${MAX_REGISTER_SKILLS} 个`);
    }
    const limitedSkills = skills.slice(0, MAX_REGISTER_SKILLS);
    const validationResults = SkillValidator.validateBatch(limitedSkills);
    if (validationResults.size > 0) {
      const errorMessages: string[] = [];
      for (const [id, errors] of validationResults) {
        errorMessages.push(`[${id}]: ${errors.join(', ')}`);
      }
      if (this.config.strictMode) {
        throw new Error(`Skill 验证失败:\n${errorMessages.join('\n')}`);
      }
    }

    for (const skill of limitedSkills) {
      if (validationResults.has(skill.metadata.id)) {
        continue;
      }
      if (this.skills.has(skill.metadata.id)) {
        if (this.config.strictMode) {
          throw new Error(`Skill ID 重复: ${skill.metadata.id}`);
        }
        continue;
      }
      if (skill.enabled === undefined) {
        skill.enabled = true;
      }
      this.skills.set(skill.metadata.id, skill);
    }
    this.invalidateCaches();
  }

  /**
   * 执行查询
   */
  execute(query: ExecuteQuery, format: 'text' | 'json' = 'text'): string {
    const allSkills = this.getSkillsList();
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
    const allSkills = this.getSkillsList();
    return this.matcher.match(query, allSkills);
  }

  /**
   * 获取所有已加载的 Skill
   */
  getSkills(): AttackDefenseSkill[] {
    return this.getSkillsList();
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
      this.invalidateCaches();
      return true;
    }
    return false;
  }

  disableSkill(id: string): boolean {
    const skill = this.skills.get(id);
    if (skill) {
      skill.enabled = false;
      this.invalidateCaches();
      return true;
    }
    return false;
  }

  /**
   * 移除 Skill
   */
  removeSkill(id: string): boolean {
    const deleted = this.skills.delete(id);
    if (deleted) {
      this.invalidateCaches();
    }
    return deleted;
  }

  /**
   * 清空所有 Skill
   */
  clearSkills(): void {
    this.skills.clear();
    this.invalidateCaches();
  }

  /**
   * 统一失效所有缓存（skills list、category index、playbook skills、matcher）
   * 在 register/remove/clear/enable/disable 后调用
   */
  private invalidateCaches(): void {
    this.cachedSkillsList = null;
    this.categoryIndex = null;
    this.cachedPlaybookSkills.clear();
    this.matcher.clearCache();
  }

  /**
   * 获取已加载的 Skill 列表（带缓存）
   */
  private getSkillsList(): AttackDefenseSkill[] {
    if (!this.cachedSkillsList) {
      this.cachedSkillsList = Array.from(this.skills.values());
    }
    return this.cachedSkillsList;
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
    const cached = this.cachedPlaybookSkills.get(playbookId);
    if (cached) {
      return cached;
    }

    const playbook = this.playbooks.get(playbookId);
    if (!playbook) {
      return [];
    }

    const skillIds = new Set<string>();
    let linkCount = 0;
    for (const phase of playbook.phases) {
      for (const skillId of phase.skills) {
        if (++linkCount > MAX_PLAYBOOK_SKILL_LINKS) {
          console.warn(`[HosSecEngine] Playbook Skill 关联数量超出上限 (${MAX_PLAYBOOK_SKILL_LINKS})，终止收集`);
          break;
        }
        skillIds.add(skillId);
      }
      if (linkCount > MAX_PLAYBOOK_SKILL_LINKS) break;
    }

    const result: AttackDefenseSkill[] = [];
    for (const skillId of skillIds) {
      const skill = this.skills.get(skillId);
      if (skill) {
        result.push(skill);
      }
    }

    this.cachedPlaybookSkills.set(playbookId, result);
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
  getAgentCoordinator(): AgentCoordinator {
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

  /**
   * 获取按分类统计的 Skill 数量（使用索引，O(1)）
   */
  getSkillCountByCategory(): Map<string, number> {
    this.buildCategoryIndex();
    const counts = new Map<string, number>();
    for (const [cat, ids] of this.categoryIndex!) {
      counts.set(cat, ids.length);
    }
    return counts;
  }

  /**
   * 获取指定分类的 Skill 列表（使用索引，O(1)）
   */
  getSkillsByCategory(category: string): AttackDefenseSkill[] {
    this.buildCategoryIndex();
    const ids = this.categoryIndex!.get(category);
    if (!ids) return [];
    const result: AttackDefenseSkill[] = [];
    for (const id of ids) {
      const skill = this.skills.get(id);
      if (skill) result.push(skill);
    }
    return result;
  }

  /**
   * Lazy 构建分类索引
   */
  private buildCategoryIndex(): void {
    if (this.categoryIndex) return;
    this.categoryIndex = new Map();
    for (const [id, skill] of this.skills) {
      const cat = skill.metadata.category;
      let ids = this.categoryIndex.get(cat);
      if (!ids) {
        ids = [];
        this.categoryIndex.set(cat, ids);
      }
      ids.push(id);
    }
  }
}
