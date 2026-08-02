/**
 * HOS-Sec-Engine V2 - ProcessEngine 流程引擎核心模块
 *
 * 职责：
 * 1. 加载 YAML 流程模板（使用 js-yaml 标准解析器）
 * 2. 按阶段顺序驱动执行（动态从模板加载）
 * 3. 每个阶段后调用决策树（支持 AI 动态决策）
 * 4. 集成 CVE 查询对发现进行富化
 * 5. 维护执行上下文和状态追踪
 * 6. 提供工具调用抽象层，支持动态工具发现
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { ProcessTemplate, Phase, PhaseResult, ProcessContext, ProcessResult, ProcessFinding } from '../types/process';
import { PhaseExecutor } from './phase-executor';
import { DecisionTree } from './decision-tree';
import { cveIntegrator } from './cve-integration';
import { toolRegistry } from './tool-registry';

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');
const TEMPLATES_DIR = path.join(PROJECT_ROOT, 'src', 'playbooks', 'process-templates');

/**
 * 流程引擎配置
 */
export interface ProcessEngineConfig {
  /** 是否启用 CVE 富化 */
  enableCveEnrichment: boolean;
  /** 是否在阶段失败时继续流程 */
  continueOnPhaseFailure: boolean;
  /** 是否自动注册内置工具 */
  autoRegisterTools: boolean;
}

const DEFAULT_CONFIG: ProcessEngineConfig = {
  enableCveEnrichment: true,
  continueOnPhaseFailure: true,
  autoRegisterTools: true,
};

/**
 * 流程引擎
 * 负责加载流程模板，驱动阶段执行，决策流转，发现富化
 */
export class ProcessEngine {
  private templates: Map<string, ProcessTemplate> = new Map();
  private config: ProcessEngineConfig;
  private phaseExecutor: PhaseExecutor;
  private decisionTree: DecisionTree;

  constructor(config?: Partial<ProcessEngineConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.phaseExecutor = new PhaseExecutor();
    this.decisionTree = new DecisionTree();

    // 自动注册内置工具
    if (this.config.autoRegisterTools) {
      this.registerBuiltinTools();
      console.log('[ProcessEngine] 内置工具已注册');
    }
  }

  /**
   * 加载流程模板
   * @param templatePath 模板文件路径（可选），不传则从默认目录加载所有模板
   */
  loadTemplates(templatePath?: string): void {
    if (templatePath) {
      this.loadTemplateFile(templatePath);
    } else {
      this.loadAllTemplates();
    }
    console.log(`[ProcessEngine] 已加载 ${this.templates.size} 个流程模板`);
  }

  /**
   * 获取已加载的模板列表
   */
  getLoadedTemplates(): string[] {
    return Array.from(this.templates.keys());
  }

  /**
   * 获取指定模板
   */
  getTemplate(id: string): ProcessTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * 执行流程
   * @param target 目标 URL
   * @param processType 流程类型 ID
   * @param context 额外上下文
   * @returns 流程执行结果
   */
  async execute(
    target: string,
    processType: string,
    context?: Record<string, any>
  ): Promise<ProcessResult> {
    const template = this.templates.get(processType);
    if (!template) {
      throw new Error(`流程模板未找到: ${processType}`);
    }

    console.log(`[ProcessEngine] 开始执行流程: ${template.name}`);
    console.log(`[ProcessEngine] 目标: ${target}`);

    // 初始化执行上下文
    const processContext: ProcessContext = {
      target,
      processType,
      currentPhase: null,
      completedPhases: [],
      findings: [],
      state: { ...context },
      startTime: new Date().toISOString(),
    };

    // 启动时检查 CVE 数据库
    if (this.config.enableCveEnrichment) {
      await cveIntegrator.autoUpdateIfNeeded();
    }

    // 注册决策树
    this.decisionTree.registerNodes(template.decisionTree);

    // 执行阶段
    const phaseResults: PhaseResult[] = [];
    let currentPhaseIndex = 0;
    let iterations = 0;
    const MAX_PHASE_ITERATIONS = 200; // 防止无限循环

    while (currentPhaseIndex < template.phases.length) {
      if (++iterations > MAX_PHASE_ITERATIONS) {
        console.error(`[ProcessEngine] 循环保护触发: 超过最大迭代次数 ${MAX_PHASE_ITERATIONS}`);
        break;
      }
      const phase = template.phases[currentPhaseIndex];

      // 检查阶段执行条件
      if (phase.condition) {
        const conditionMet = this.evaluatePhaseCondition(phase.condition, processContext, phaseResults);
        if (!conditionMet) {
          console.log(`[ProcessEngine] 阶段 ${phase.name} 条件不满足，跳过`);
          phaseResults.push({
            phaseId: phase.id,
            status: 'skipped',
            findings: [],
            toolResults: [],
            duration: 0,
            error: `条件不满足: ${phase.condition}`,
          });
          currentPhaseIndex++;
          continue;
        }
      }

      // 更新当前阶段
      processContext.currentPhase = phase.id;

      // 输出阶段业务指导信息
      console.log(`\n${'='.repeat(70)}`);
      console.log(`[ProcessEngine] 🔴 阶段 [${currentPhaseIndex + 1}/${template.phases.length}]: ${phase.name}`);
      console.log(`[ProcessEngine] ${'─'.repeat(70)}`);
      console.log(`[ProcessEngine] 📋 业务目标: ${phase.description}`);
      if (phase.successCriteria.length > 0) {
        console.log(`[ProcessEngine] ✅ 成功标准:`);
        for (const sc of phase.successCriteria) {
          console.log(`[ProcessEngine]    • ${sc}`);
        }
      }
      console.log(`[ProcessEngine] ${'─'.repeat(70)}`);

      // 构建执行上下文（包含目标等信息）
      const execContext: Record<string, any> = {
        target: processContext.target,
        target_host: new URL(processContext.target).hostname,
        ...processContext.state,
      };

      // 从已完成阶段的发现中提取 detected_waf 供模板变量使用
      const wafFinding = processContext.findings.find(f => f.type === 'waf-detected');
      if (wafFinding) {
        execContext.detected_waf = wafFinding.description.replace('检测到 WAF 保护: ', '').trim();
      }
      // 提取已检测到的 WAF 名称数组供决策使用
      const wafNames = processContext.findings
        .filter(f => f.type === 'waf-detected')
        .flatMap(f => f.description.replace('检测到 WAF 保护: ', '').split(',').map(s => s.trim()));
      if (wafNames.length > 0) {
        execContext.detected_wafs = wafNames.join(',');
      }

      // 执行阶段
      const phaseResult = await this.phaseExecutor.execute(phase, execContext);
      phaseResults.push(phaseResult);

      // CVE 富化
      if (this.config.enableCveEnrichment && phaseResult.findings.length > 0) {
        const enrichedFindings = await cveIntegrator.enrichFindingsWithCVE(phaseResult.findings);
        phaseResult.findings = enrichedFindings;
        processContext.findings.push(...enrichedFindings);

        // 记录 CVE 引用
        const cveCount = enrichedFindings.reduce((sum, f) => sum + f.cveMatches.length, 0);
        if (cveCount > 0) {
          console.log(`[ProcessEngine] 阶段 ${phase.name} 关联了 ${cveCount} 个 CVE`);
        }
      } else {
        processContext.findings.push(...phaseResult.findings);
      }

      // 标记阶段完成
      processContext.completedPhases.push(phase.id);

      // 决策树：决定下一阶段
      const decision = this.decisionTree.evaluate(phase.id, phaseResult);
      if (decision.nextPhase) {
        // 查找下一阶段的索引（无论是否匹配条件，都使用 nextPhase）
        const nextIndex = template.phases.findIndex(p => p.id === decision.nextPhase);
        if (nextIndex >= 0) {
          currentPhaseIndex = nextIndex;
          console.log(`[ProcessEngine] 决策: ${decision.matchDescription}`);
          continue;
        }
      }

      // 未指定下一阶段，流程结束
      console.log(`[ProcessEngine] ${decision.matchDescription}`);
      break;
    }

    // 构建结果
    const duration = phaseResults.reduce((sum, r) => sum + r.duration, 0);
    const criticalCount = processContext.findings.filter(f => f.severity === 'critical').length;
    const highCount = processContext.findings.filter(f => f.severity === 'high').length;
    const mediumCount = processContext.findings.filter(f => f.severity === 'medium').length;
    const lowCount = processContext.findings.filter(f => f.severity === 'low').length;
    const cveReferences = processContext.findings.reduce((sum, f) => sum + f.cveMatches.length, 0);

    const result: ProcessResult = {
      templateId: template.id,
      context: processContext,
      phaseResults,
      status: 'completed',
      summary: {
        totalFindings: processContext.findings.length,
        criticalCount,
        highCount,
        mediumCount,
        lowCount,
        cveReferences,
        duration,
      },
    };

    console.log(`[ProcessEngine] 流程执行完成`);
    console.log(`[ProcessEngine] 发现: ${result.summary.totalFindings} (C:${criticalCount} H:${highCount} M:${mediumCount} L:${lowCount}), CVE 引用: ${cveReferences}`);

    return result;
  }

  /**
   * 从单个文件加载模板（使用 js-yaml 标准解析器）
   */
  private loadTemplateFile(filePath: string): void {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const template = this.parseYamlTemplate(content, path.basename(filePath));
      if (template) {
        this.templates.set(template.id, template);
        console.log(`[ProcessEngine] 加载模板: ${template.id} (${filePath})`);
      }
    } catch (error) {
      console.error(`[ProcessEngine] 加载模板失败: ${filePath}, ${error}`);
    }
  }

  /**
   * 从默认目录加载所有模板
   */
  private loadAllTemplates(): void {
    if (!fs.existsSync(TEMPLATES_DIR)) {
      console.warn(`[ProcessEngine] 模板目录不存在: ${TEMPLATES_DIR}`);
      return;
    }

    const files = fs.readdirSync(TEMPLATES_DIR);
    for (const file of files) {
      if (file.endsWith('.yaml') || file.endsWith('.yml')) {
        this.loadTemplateFile(path.join(TEMPLATES_DIR, file));
      }
    }
  }

  /**
   * 解析 YAML 模板内容（使用 js-yaml 标准解析器）
   * 移除 300 行自定义解析器，使用标准库
   */
  private parseYamlTemplate(content: string, fileName: string): ProcessTemplate | null {
    try {
      // 使用 js-yaml 标准解析器
      const parsed = yaml.load(content) as any;
      
      if (!parsed) {
        console.error(`[ProcessEngine] 模板解析为空: ${fileName}`);
        return null;
      }

      // 构建 ProcessTemplate
      return {
        id: parsed.id || fileName.replace(/\.(yaml|yml)$/, ''),
        name: parsed.name || '',
        description: parsed.description || '',
        category: parsed.category || 'web',
        version: parsed.version || '1.0.0',
        phases: this.normalizePhases(parsed.phases || []),
        decisionTree: this.normalizeDecisionTree(parsed.decisionTree || []),
      } as ProcessTemplate;
    } catch (error) {
      console.error(`[ProcessEngine] 解析模板失败 ${fileName}: ${error}`);
      return null;
    }
  }

  /**
   * 规范化阶段数据（确保类型安全）
   */
  private normalizePhases(phases: any[]): Phase[] {
    return phases.map((phase: any) => ({
      id: phase.id || '',
      name: phase.name || '',
      description: phase.description || '',
      steps: this.normalizeSteps(phase.steps || []),
      condition: phase.condition,
      successCriteria: Array.isArray(phase.successCriteria) ? phase.successCriteria : [],
      maxRetries: phase.maxRetries || 2,
      timeout: phase.timeout || 120,
    }));
  }

  /**
   * 规范化步骤数据
   */
  private normalizeSteps(steps: any[]): any[] {
    return steps.map((step: any) => ({
      id: step.id || '',
      name: step.name || '',
      description: step.description || '',
      toolCall: {
        tool: step.toolCall?.tool || '',
        params: step.toolCall?.params || {},
        transform: step.toolCall?.transform,
      },
      expectedOutput: step.expectedOutput || '',
      validationRule: step.validationRule,
    }));
  }

  /**
   * 规范化决策树数据
   */
  private normalizeDecisionTree(decisionTree: any[]): any[] {
    return decisionTree.map((node: any) => ({
      id: node.id || '',
      sourcePhase: node.sourcePhase || '',
      conditions: Array.isArray(node.conditions) ? node.conditions.map((cond: any) => ({
        rule: cond.rule || '',
        nextPhase: cond.nextPhase || '',
        description: cond.description || '',
      })) : [],
      defaultNext: node.defaultNext || null,
    }));
  }

  /**
   * 评估阶段执行条件
   */
  private evaluatePhaseCondition(
    condition: string,
    context: ProcessContext,
    phaseResults: PhaseResult[]
  ): boolean {
    switch (condition) {
      case 'vulnerabilitiesFound':
        return context.findings.length > 0;
      case 'accessGained':
        return phaseResults.some(r =>
          r.findings.some(f => f.type === 'rce' || f.type === 'auth-bypass')
        );
      case 'highPrivilege':
        return phaseResults.some(r => r.status === 'success');
      case 'ssrfAccessible':
        return context.findings.some(f => f.type === 'ssrf');
      case 'wafDetected':
        return context.findings.some(f => f.type === 'waf-detected');
      default:
        return true;
    }
  }

  /**
   * 注册内置工具（工具调用抽象层）
   */
  private registerBuiltinTools(): void {
    // Web Fetch 工具
    toolRegistry.register({
      name: 'web_fetch',
      description: '获取网页内容',
      handler: async (params) => {
        try {
          const url = params.url as string;
          const headers: Record<string, string> = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          };
          const response = await fetch(url, { headers });
          const respHeaders: Record<string, string> = {};
          response.headers.forEach((v: string, k: string) => { respHeaders[k] = v; });
          const text = await response.text();
          const output = JSON.stringify({
            status: response.status,
            statusText: response.statusText,
            headers: respHeaders,
            body: text.substring(0, 5000),
          });
          return {
            tool: 'web_fetch',
            params,
            output,
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
}
