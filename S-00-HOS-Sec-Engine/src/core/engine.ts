import { EngineConfig } from '../types/result';
import { Playbook, FlowContext, OrchestrationResult, Finding } from '../types/playbook';
import { FlowOrchestrator } from './orchestrator';
import { RuntimeConfig, DEFAULT_RUNTIME_CONFIG } from '../config/types';
import { ProviderManager } from '../config/provider-manager';
import { AgentCoordinator } from '../agents/coordinator';
import { ExecutionContextManager } from '../runtime/execution-context';
import type { ExecutionContext } from '../runtime/execution-context';
import { AgentServer } from '../runtime/server';
import * as path from 'path';

// V5: SEC-bench Pro 启发的新模块
import { LLMJudge, ExecutionEvidence, ThreeStateEvidence, JudgeVerdict, llmJudge as defaultJudge } from './judge';
import { EnsembleExecutor, EnsembleResult, EnsembleStrategy } from '../agents/ensemble';
import { PoCValidator, ValidationResult, ExpectedErrorProfile, ValidatorConfig } from './poc-validator';

// V6: MCP 自我管理层
import { MCPRegistry, mcpRegistry } from '../mcp/registry';
import { MCPDiscovery, mcpDiscovery } from '../mcp/discovery';
import { MCPRouter, mcpRouter } from '../mcp/router';
import { MCPHealthMonitor, mcpHealthMonitor } from '../mcp/health';
import type {
  MCPServerConfig,
  MCPToolCall,
  MCPToolResult,
  MCPRouteQuery,
  MCPRoutingStrategy,
  SkillMCPMapping,
  MCPHealthSummary,
  MCPDiscoveryResult,
} from '../mcp/types';

// Process Engine
import { ProcessEngine } from './process-engine';
import { ProcessResult, ProcessTemplate } from '../types/process';

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Required<EngineConfig> = {
  strictMode: true,
  maxResults: 10,
  minMatchScore: 0.1,
  customSkillsDir: '',
  loadPresetSkills: true,
  mcpEnabled: true
};

/**
 * HOS-Sec-Engine V2 - Skill Engine
 * 攻防专项 Skill 引擎
 */
export class HosSecEngine {
  private config: Required<EngineConfig>;
  private processEngine: ProcessEngine;
  private orchestrator: FlowOrchestrator;
  private playbooks: Map<string, Playbook>;

  // V4 Runtime
  private runtimeConfig: RuntimeConfig;
  private providerManager: ProviderManager;
  private agentCoordinator: AgentCoordinator;
  private agentServer: AgentServer | null;

  // V5: SEC-bench Pro 启发的新模块
  private llmJudge: LLMJudge;
  private ensembleExecutor: EnsembleExecutor;
  private pocValidator: PoCValidator;

  // V6: MCP 自我管理层
  private mcpRegistry: MCPRegistry;
  private mcpDiscovery: MCPDiscovery;
  private mcpRouter: MCPRouter;
  private mcpHealthMonitor: MCPHealthMonitor;
  private mcpEnabled: boolean;
  private mcpInitialized: boolean = false;

  constructor(config: EngineConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.playbooks = new Map();
    this.processEngine = new ProcessEngine();
    this.processEngine.loadTemplates();
    this.orchestrator = new FlowOrchestrator(this.processEngine);

    // V4 Runtime initialization
    this.runtimeConfig = DEFAULT_RUNTIME_CONFIG;
    this.providerManager = new ProviderManager();
    this.agentCoordinator = new AgentCoordinator();
    this.agentServer = null;

    // V5: SEC-bench Pro 启发的新模块初始化
    this.llmJudge = new LLMJudge();
    this.ensembleExecutor = new EnsembleExecutor(this.agentCoordinator);
    this.pocValidator = new PoCValidator();

    // V6: MCP 自我管理层初始化（使用全局单例）
    this.mcpRegistry = mcpRegistry;
    this.mcpDiscovery = mcpDiscovery;
    this.mcpRouter = mcpRouter;
    this.mcpHealthMonitor = mcpHealthMonitor;
    this.mcpEnabled = config.mcpEnabled ?? true;

    // V6: 不再在构造函数中自动初始化 MCP
    // initMCP() 改为懒加载，在首次需要时或显式调用时初始化
    // 避免自动启动 MCP 服务器导致测试死循环
  }

  // ==================== Process Engine ====================

  /**
   * 执行流程（替代旧的 execute/executeRaw）
   */
  async executeProcess(target: string, processType: string, context?: Record<string, any>): Promise<ProcessResult> {
    return this.processEngine.execute(target, processType, context);
  }

  /**
   * 获取流程引擎实例
   */
  getProcessEngine(): ProcessEngine {
    return this.processEngine;
  }

  /**
   * 获取已加载的流程模板列表
   */
  getProcessTemplates(): string[] {
    return this.processEngine.getLoadedTemplates();
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

  // ==================== V5: SEC-bench Pro 集成方法 ====================

  /**
   * V5: 获取 LLM Judge 实例
   */
  getJudge(): LLMJudge {
    return this.llmJudge;
  }

  /**
   * V5: 获取 Ensemble Executor 实例
   */
  getEnsembleExecutor(): EnsembleExecutor {
    return this.ensembleExecutor;
  }

  /**
   * V5: 获取 PoC Validator 实例
   */
  getPoCValidator(): PoCValidator {
    return this.pocValidator;
  }

  /**
   * V5: 对 finding 进行 AI 裁判验证
   *
   * 使用三证据模型（vulnerable/fixed/latest）验证 finding 可信度，
   * 防止误报虚增（SEC-bench Pro 显示 crash-only 匹配会虚增 43.6%）
   *
   * @param finding 待验证的 finding
   * @param primaryEvidence primary 执行证据
   * @param hardenedEvidence 可选 - 修复环境执行证据
   * @param latestEvidence 可选 - 最新环境执行证据
   * @returns 判定结果
   */
  judgeFinding(
    finding: Finding,
    primaryEvidence: ThreeStateEvidence,
    hardenedEvidence?: ThreeStateEvidence,
    latestEvidence?: ThreeStateEvidence
  ): JudgeVerdict {
    const evidence: ExecutionEvidence = {
      primary: primaryEvidence,
      hardened: hardenedEvidence,
      latest: latestEvidence,
    };
    return this.llmJudge.judge(finding, evidence);
  }

  /**
   * V5: 批量裁判验证 findings
   * @param findings 待验证的 finding 列表
   * @param evidenceList 对应的证据列表
   * @returns 判定结果列表
   */
  judgeFindings(findings: Finding[], evidenceList: ExecutionEvidence[]): JudgeVerdict[] {
    return this.llmJudge.judgeBatch(findings, evidenceList);
  }

  /**
   * V5: 过滤已验证的 findings（去除误报）
   * @param findings 原始 finding 列表
   * @param evidenceList 对应的证据列表
   * @returns 仅含 verified 判定的 finding 列表
   */
  filterVerifiedFindings(findings: Finding[], evidenceList: ExecutionEvidence[]): Finding[] {
    return this.llmJudge.filterVerified(findings, evidenceList);
  }

  /**
   * V5: 并行执行 Ensemble（多 Agent 集成）
   *
   * 基于 SEC-bench Pro 的多 Agent 互补策略（Claude+Codex 联合提升 26%）
   * 使用 explorer + selective 双 Agent 模式并行执行 skill
   *
   * @param skillId 要执行的 skill ID
   * @param target 目标
   * @param strategy 集成策略
   * @returns Ensemble 执行结果
   */
  async executeEnsemble(
    skillId: string,
    target: string,
    strategy: EnsembleStrategy = 'parallel_union'
  ): Promise<EnsembleResult> {
    // 注册默认互补 Agent 对
    this.ensembleExecutor.registerDefaultPair(skillId);

    const result = await this.ensembleExecutor.execute(
      {
        type: 'skill_execution',
        skillId,
        context: { target },
        parameters: { target, strategy },
        timeout: 120000,
      },
      strategy
    );

    return result;
  }

  /**
   * V5: 执行 PoC 三状态 Oracle 验证
   *
   * 对应 SEC-bench Pro 的构造预言机验证（§3.3）
   * - Vulnerable oracle: 确认 PoC 触发预期崩溃
   * - Fixed oracle: 确认补丁阻断
   * - Latest oracle: 确认最新环境也无崩溃
   *
   * @param pocInput PoC 输入
   * @param executeFn 执行回调
   * @returns 验证结果
   */
  async validatePoC(
    pocInput: string,
    expectedError: ExpectedErrorProfile,
    executeFn: (input: string, imageType: 'vulnerable' | 'fixed' | 'latest', attemptNum: number) => Promise<any>
  ): Promise<ValidationResult> {
    return this.pocValidator.validate(pocInput, expectedError, executeFn);
  }

  /**
   * V5: 获取所有 V5 模块的状态摘要
   */
  getV5ModuleStatus(): object {
    const judgeStats = this.llmJudge.getStats();
    return {
      judge: {
        totalVerdicts: judgeStats.total,
        verifiedRate: judgeStats.verifiedRate,
        cacheHitRate: judgeStats.cacheHitRate,
      },
      ensemble: {
        registeredAgents: this.ensembleExecutor.getAgentCount(),
      },
      pocValidator: {
        totalValidations: this.pocValidator.getStats().total,
        passRate: this.pocValidator.getStats().passRate,
      },
    };
  }

  // ==================== V6: MCP 自我管理层 ====================

  /**
   * V6: 初始化 MCP 管理层
   * 1. 从配置文件加载 MCP 服务器
   * 2. 自动发现可用的 MCP 包
   * 3. 启动健康监控
   */
  async initMCP(): Promise<void> {
    if (this.mcpInitialized) return;
    this.mcpInitialized = true;

    try {
      // 1. 从标准配置文件加载
      const configPath = path.resolve(__dirname, '..', '..', '..', 'config', 'mcp-servers.json');
      this.loadMCPServersFromConfig(configPath);

      // 2. 尝试自动发现更多 MCP 服务器
      try {
        const discoveryResult = await this.mcpDiscovery.discoverAll();
        if (discoveryResult.discovered.length > 0) {
          for (const cfg of discoveryResult.discovered) {
            try {
              this.mcpRegistry.registerServer(cfg);
            } catch (err) {
              // 忽略重复注册错误
            }
          }
        }
      } catch (err) {
        console.warn('[HosSecEngine] MCP 自动发现失败（非致命）:', err instanceof Error ? err.message : String(err));
      }

      // 3. 启动健康监控
      this.mcpHealthMonitor.start();
      const healthSummary = await this.mcpHealthMonitor.runFullCheck();
      if (healthSummary.healthyCount > 0) {
        console.log(`[HosSecEngine] ✅ MCP 初始化完成: ${healthSummary.healthyCount}/${healthSummary.totalServers} 个服务器在线`);
      }
    } catch (err) {
      console.warn('[HosSecEngine] MCP 初始化异常（非致命）:', err instanceof Error ? err.message : String(err));
    }
  }

  /**
   * V6: 从配置文件加载 MCP 服务器
   */
  private loadMCPServersFromConfig(configPath: string): void {
    try {
      const fs = require('fs');
      if (!fs.existsSync(configPath)) {
        console.log(`[HosSecEngine] MCP 配置文件不存在: ${configPath}`);
        return;
      }

      const data = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      const mcpServers = data.mcpServers || {};

      for (const [name, cfg] of Object.entries(mcpServers)) {
        const config = cfg as any;
        try {
          this.mcpRegistry.registerServer({
            name,
            command: config.command || 'npx',
            args: config.args || [],
            env: config.env || {},
            description: config.description || '',
            autoStart: config.autoStart !== false,
            maxRestarts: config.maxRestarts ?? 3,
            healthCheckIntervalMs: config.healthCheckIntervalMs ?? 30000,
            timeoutMs: config.timeoutMs ?? 30000,
            tags: config.tags || [],
          });
        } catch (err: any) {
          if (!(err instanceof Error) || !err.message.includes('已注册')) {
            console.warn(`[HosSecEngine] 加载 MCP 服务器 ${name} 失败:`, err);
          }
        }
      }

      if (Object.keys(mcpServers).length > 0) {
        console.log(`[HosSecEngine] 📦 已从配置文件加载 ${Object.keys(mcpServers).length} 个 MCP 服务器`);
      }
    } catch (err) {
      console.warn(`[HosSecEngine] 读取 MCP 配置文件失败:`, err);
    }
  }

  // ==================== MCP 服务器管理 ====================

  /**
   * V6: 注册 MCP 服务器
   */
  registerMCPServer(config: MCPServerConfig): void {
    this.mcpRegistry.registerServer(config);
  }

  /**
   * V6: 批量注册 MCP 服务器
   */
  registerMCPServers(configs: MCPServerConfig[]): void {
    this.mcpRegistry.registerServers(configs);
  }

  /**
   * V6: 注销 MCP 服务器
   */
  unregisterMCPServer(name: string): boolean {
    return this.mcpRegistry.unregisterServer(name);
  }

  /**
   * V6: 获取所有 MCP 服务器
   */
  getMCPServers() {
    return this.mcpRegistry.getServers();
  }

  /**
   * V6: 获取 MCP 服务器数量
   */
  getMCPServerCount(): number {
    return this.mcpRegistry.getServerCount();
  }

  /**
   * V6: 启动 MCP 服务器
   */
  async startMCPServer(name: string): Promise<boolean> {
    return this.mcpRegistry.startServer(name);
  }

  /**
   * V6: 停止 MCP 服务器
   */
  async stopMCPServer(name: string): Promise<boolean> {
    return this.mcpRegistry.stopServer(name);
  }

  // ==================== MCP 工具路由 ====================

  /**
   * V6: 获取 Skill 所需的 MCP 工具
   */
  getMCPToolsForSkill(skillId: string) {
    return this.mcpRouter.getRecommendedTools(skillId);
  }

  /**
   * V6: 检查 Skill 的 MCP 依赖是否满足
   */
  checkSkillMCPRequirements(skillId: string) {
    return this.mcpRouter.checkSkillRequirements(skillId);
  }

  /**
   * V6: 路由并执行 MCP 工具调用
   */
  async executeMCPToolCall(call: MCPToolCall, query?: Partial<MCPRouteQuery>): Promise<MCPToolResult> {
    return this.mcpRouter.routeAndExecute(call, query);
  }

  /**
   * V6: 注册 Skill-MCP 映射
   */
  registerSkillMCPMapping(mapping: SkillMCPMapping): void {
    this.mcpRouter.registerMapping(mapping);
  }

  /**
   * V6: 发现适用于场景的 MCP 工具
   */
  findMCPToolsForScenario(scenario: string) {
    return this.mcpRouter.findToolsForScenario(scenario);
  }

  // ==================== MCP 发现 ====================

  /**
   * V6: 执行 MCP 自动发现
   */
  async discoverMCPServers(): Promise<MCPDiscoveryResult> {
    return this.mcpDiscovery.discoverAll();
  }

  /**
   * V6: 获取已知的 MCP 包列表
   */
  getKnownMCPPackages() {
    return this.mcpDiscovery.getKnownPackages();
  }

  // ==================== MCP 健康监控 ====================

  /**
   * V6: 执行全量 MCP 健康检查
   */
  async checkMCPHealth(): Promise<MCPHealthSummary> {
    return this.mcpHealthMonitor.runFullCheck();
  }

  /**
   * V6: 获取 MCP 健康监控状态
   */
  getMCPHealthStatus() {
    return this.mcpHealthMonitor.getStatus();
  }

  /**
   * V6: 启动 MCP 健康监控
   */
  startMCPHealthMonitor(): void {
    this.mcpHealthMonitor.start();
  }

  /**
   * V6: 停止 MCP 健康监控
   */
  stopMCPHealthMonitor(): void {
    this.mcpHealthMonitor.stop();
  }

  // ==================== MCP 状态汇总 ====================

  /**
   * V6: 获取 MCP 模块状态摘要
   */
  getMCPStatus(): object {
    const servers = this.mcpRegistry.getServers();
    const running = servers.filter(s => s.runtime.status === 'running').length;
    const totalTools = servers.reduce((sum, s) => sum + s.tools.length, 0);
    const healthStatus = this.mcpHealthMonitor.getStatus();
    const routerSummary = this.mcpRouter.getSummary();
    const mappingCount = (routerSummary as any).registeredMappings || 0;

    return {
      initialized: this.mcpInitialized,
      enabled: this.mcpEnabled,
      servers: {
        total: servers.length,
        running,
        stopped: servers.length - running,
      },
      tools: {
        total: totalTools,
        mappedSkills: mappingCount,
      },
      health: {
        monitoring: healthStatus.running,
        healthy: healthStatus.healthy,
      },
      discovery: {
        knownPackages: this.mcpDiscovery.getKnownPackages().length,
      },
    };
  }

  /**
   * V6: 获取完整的 V6 摘要
   */
  getV6ModuleStatus(): object {
    return {
      mcp: this.getMCPStatus(),
      registry: this.mcpRegistry.getSummary(),
      router: this.mcpRouter.getSummary(),
      health: this.mcpHealthMonitor.getStatus(),
    };
  }
}