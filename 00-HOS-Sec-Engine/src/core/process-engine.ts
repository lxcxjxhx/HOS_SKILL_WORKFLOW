/**
 * HOS-Sec-Engine V2 - ProcessEngine 流程引擎核心模块
 *
 * 职责：
 * 1. 加载 YAML 流程模板
 * 2. 按阶段顺序驱动执行
 * 3. 每个阶段后调用决策树
 * 4. 集成 CVE 查询对发现进行富化
 * 5. 维护执行上下文和状态追踪
 */

import * as fs from 'fs';
import * as path from 'path';
import { ProcessTemplate, Phase, PhaseResult, ProcessContext, ProcessResult, ProcessFinding } from '../types/process';
import { PhaseExecutor } from './phase-executor';
import { DecisionTree } from './decision-tree';
import { cveIntegrator } from './cve-integration';
import { registerBuiltinTools } from './tool-registry';

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
      registerBuiltinTools();
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
   * 从单个文件加载模板
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
   * 解析 YAML 模板内容
   * 使用简单的逐行解析（不引入 YAML 依赖）
   */
  private parseYamlTemplate(content: string, fileName: string): ProcessTemplate | null {
    try {
      // 简单的 YAML 解析器，处理嵌套结构
      const lines = content.split('\n');
      const result: Record<string, any> = {};
      let currentSection: string[] = [];
      let phaseStack: any[] = [];
      let stepStack: any[] = [];
      let decisionStack: any[] = [];
      let conditionStack: any[] = [];
      let inPhases = false;
      let inSteps = false;
      let inDecisionTree = false;
      let inConditions = false;
      let inToolCall = false;
      let currentPhase: any = null;
      let currentStep: any = null;
      let currentDecision: any = null;
      let currentCondition: any = null;

      for (const line of lines) {
        const trimmed = line.trimEnd();
        if (!trimmed.trim() || trimmed.trim().startsWith('#')) continue;

        const indent = line.length - line.trimStart().length;
        const content = trimmed.trim();

        if (content === 'phases:') {
          inPhases = true;
          inDecisionTree = false;
          continue;
        }
        if (content === 'decisionTree:') {
          inDecisionTree = true;
          inPhases = false;
          continue;
        }

        if (inPhases) {
          // 步骤解析必须在前，因为步骤也以 "- id:" 开头
          if (inSteps && currentPhase) {
            // ==========================================
            // 检测是否离开了 steps 区域进入阶段级属性
            // 阶段级属性: condition: maxRetries: timeout: successCriteria: 和 - item
            // ==========================================
            if (content.startsWith('condition:') || content.startsWith('maxRetries:') ||
                content.startsWith('timeout:') || content.startsWith('successCriteria:')) {
              // 结束当前步骤，退出 steps 模式，让阶段级处理接管
              if (currentStep) {
                currentPhase.steps.push(currentStep);
                currentStep = null;
              }
              inSteps = false;
              inToolCall = false;
              // 不 continue，让外层处理这条线
            } else if (content.startsWith('- ') && !content.startsWith('- id:')) {
              // 成功标准条目（- item），退出 steps 模式
              if (currentStep) {
                currentPhase.steps.push(currentStep);
                currentStep = null;
              }
              inSteps = false;
              inToolCall = false;
              // 不 continue，让外层处理这条线
            } else {
              // 正常步骤处理
              if (content.startsWith('- id:')) {
                if (currentStep) {
                  currentPhase.steps.push(currentStep);
                }
                currentStep = { id: content.replace('- id:', '').trim(), toolCall: { tool: '', params: {} } };
                inToolCall = false;
                continue;
              }
              if (currentStep) {
                if (content.startsWith('name:')) {
                  currentStep.name = content.replace('name:', '').trim();
                  continue;
                }
                if (content.startsWith('description:')) {
                  currentStep.description = content.replace('description:', '').trim();
                  continue;
                }
                if (content.startsWith('expectedOutput:')) {
                  currentStep.expectedOutput = content.replace('expectedOutput:', '').trim();
                  continue;
                }
                if (content === 'toolCall:') {
                  inToolCall = true;
                  continue;
                }
                if (content.startsWith('tool:') && inToolCall) {
                  // 在 toolCall 块内处理 tool
                  continue;
                }
                if (content.startsWith('params:') && inToolCall) {
                  continue;
                }
                if (content.startsWith('url:') && inToolCall) {
                  currentStep.toolCall.params.url = content.replace('url:', '').trim();
                  continue;
                }
                if (content.startsWith('query:') && inToolCall) {
                  currentStep.toolCall.params.query = content.replace('query:', '').trim();
                  continue;
                }
                if (inToolCall && content.includes(':')) {
                  const colonIdx = content.indexOf(':');
                  const key = content.substring(0, colonIdx).trim();
                  const val = content.substring(colonIdx + 1).trim();
                  // 跳过 headers:（单独处理）
                  if (key !== 'headers') {
                    currentStep.toolCall.params[key] = val;
                  }
                  continue;
                }
                // 处理 headers 嵌套
                if (content.startsWith('headers:') && inToolCall) {
                  currentStep.toolCall.params.headers = {};
                  continue;
                }
                if (inToolCall && content.startsWith('Authorization:')) {
                  if (!currentStep.toolCall.params.headers) {
                    currentStep.toolCall.params.headers = {};
                  }
                  currentStep.toolCall.params.headers['Authorization'] = content.replace('Authorization:', '').trim();
                  continue;
                }
                // 通用 key: value 处理
                if (!inToolCall) {
                  // 处理非 toolCall 的 key: value
                  const colonIdx = content.indexOf(':');
                  if (colonIdx > 0 && content.endsWith(':') === false) {
                    const key = content.substring(0, colonIdx).trim();
                    const val = content.substring(colonIdx + 1).trim();
                    if (key === 'validationRule') {
                      currentStep.validationRule = val;
                    }
                  }
                }
                // 如果进入 toolCall 块但没有匹配，由外层处理
                continue;
              }
              continue; // 在 inSteps 模式中，跳过外层处理
            }
          }

          if (content.startsWith('- id:')) {
            if (currentPhase) {
              if (currentStep) {
                currentPhase.steps.push(currentStep);
                currentStep = null;
              }
              result.phases = result.phases || [];
              result.phases.push(currentPhase);
            }
            currentPhase = { id: content.replace('- id:', '').trim(), steps: [], successCriteria: [], maxRetries: 2, timeout: 120 };
            inSteps = false;
            inToolCall = false;
            continue;
          }
          if (currentPhase && content.startsWith('name:')) {
            currentPhase.name = content.replace('name:', '').trim();
            continue;
          }
          if (currentPhase && content.startsWith('description:')) {
            currentPhase.description = content.replace('description:', '').trim();
            continue;
          }
          if (currentPhase && content === 'steps:') {
            inSteps = true;
            continue;
          }
          if (currentPhase && content.startsWith('condition:')) {
            const val = content.replace('condition:', '').trim();
            currentPhase.condition = val === 'null' ? null : val;
            continue;
          }
          if (currentPhase && content.startsWith('maxRetries:')) {
            currentPhase.maxRetries = parseInt(content.replace('maxRetries:', '').trim()) || 2;
            continue;
          }
          if (currentPhase && content.startsWith('timeout:')) {
            currentPhase.timeout = parseInt(content.replace('timeout:', '').trim()) || 120;
            continue;
          }
          if (currentPhase && content.startsWith('- ')) {
            currentPhase.successCriteria = currentPhase.successCriteria || [];
            currentPhase.successCriteria.push(content.replace('- ', '').trim());
            continue;
          }

          }

        if (inDecisionTree) {
          if (content.startsWith('- id:')) {
            if (currentDecision) {
              result.decisionTree = result.decisionTree || [];
              result.decisionTree.push(currentDecision);
            }
            currentDecision = { id: content.replace('- id:', '').trim(), conditions: [] };
            inConditions = false;
            continue;
          }
          if (currentDecision && content.startsWith('sourcePhase:')) {
            currentDecision.sourcePhase = content.replace('sourcePhase:', '').trim();
            continue;
          }
          if (currentDecision && content.startsWith('defaultNext:')) {
            const val = content.replace('defaultNext:', '').trim();
            currentDecision.defaultNext = val === 'null' ? null : val;
            continue;
          }
          if (currentDecision && content.startsWith('conditions:')) {
            inConditions = true;
            continue;
          }
          if (inConditions && currentDecision && content.startsWith('- rule:')) {
            if (currentCondition) {
              currentDecision.conditions.push(currentCondition);
            }
            currentCondition = { rule: content.replace('- rule:', '').trim(), nextPhase: '', description: '' };
            continue;
          }
          if (currentCondition) {
            if (content.startsWith('nextPhase:')) {
              currentCondition.nextPhase = content.replace('nextPhase:', '').trim();
              continue;
            }
            if (content.startsWith('description:')) {
              currentCondition.description = content.replace('description:', '').trim();
              continue;
            }
          }
        }
      }

      // 收尾
      if (currentStep && currentPhase) {
        currentPhase.steps.push(currentStep);
      }
      if (currentPhase) {
        result.phases = result.phases || [];
        result.phases.push(currentPhase);
      }
      if (currentDecision) {
        result.decisionTree = result.decisionTree || [];
        result.decisionTree.push(currentDecision);
      }
      if (currentCondition) {
        (currentDecision?.conditions || []).push(currentCondition);
      }

      // 构建 ProcessTemplate
      return {
        id: result.id || fileName.replace(/\.(yaml|yml)$/, ''),
        name: result.name || '',
        description: result.description || '',
        category: result.category || 'web',
        version: result.version || '1.0.0',
        phases: result.phases || [],
        decisionTree: result.decisionTree || [],
      } as ProcessTemplate;
    } catch (error) {
      console.error(`[ProcessEngine] 解析模板失败 ${fileName}: ${error}`);
      return null;
    }
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
      default:
        return true;
    }
  }
}