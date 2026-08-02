import { Phase, PhaseStep, PhaseResult, ProcessFinding, ToolResult, ToolCall } from '../types/process';
import { toolRegistry, ToolRegistry } from './tool-registry';

/**
 * 阶段执行器配置
 */
export interface PhaseExecutorConfig {
  /** 最大步骤执行时间（毫秒），默认 60000 */
  stepTimeout: number;
  /** 是否在步骤失败时继续执行后续步骤 */
  continueOnStepFailure: boolean;
  /** 是否启用自适应模式（根据回显动态调整） */
  adaptiveMode: boolean;
  /** 自适应模式下的最大迭代次数 */
  maxAdaptiveIterations: number;
}

const DEFAULT_CONFIG: PhaseExecutorConfig = {
  stepTimeout: 60000,
  continueOnStepFailure: true,
  adaptiveMode: true,
  maxAdaptiveIterations: 10,
};

/**
 * 阶段执行器 - 方法论指导模式
 * 
 * 职责：
 * 1. 提供阶段目标和成功标准给 AI
 * 2. 执行工具调用并收集结果
 * 3. 将工具输出交给 AI 分析（不硬编码漏洞检测正则）
 * 4. 根据 AI 反馈动态调整策略
 */
export class PhaseExecutor {
  private config: PhaseExecutorConfig;
  private registry: ToolRegistry;

  constructor(registry?: ToolRegistry, config?: Partial<PhaseExecutorConfig>) {
    this.registry = registry || toolRegistry;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 执行单个阶段的所有步骤
   * @param phase 阶段定义
   * @param context 执行上下文（包含目标等信息）
   * @returns 阶段执行结果
   */
  async execute(phase: Phase, context: Record<string, any>): Promise<PhaseResult> {
    const startTime = Date.now();
    const findings: ProcessFinding[] = [];
    const toolResults: ToolResult[] = [];
    let hasError = false;

    console.log(`[PhaseExecutor] 开始执行阶段: ${phase.name} (${phase.id})`);
    console.log(`[PhaseExecutor] 📋 阶段业务目标: ${phase.description.split('\n')[0].trim()}`);

    // 自适应模式：根据回显动态调整策略
    if (this.config.adaptiveMode) {
      return await this.executeAdaptive(phase, context, startTime);
    }

    // 传统模式：按顺序执行固定步骤
    for (const step of phase.steps) {
      console.log(`\n[PhaseExecutor]   ⚡ 步骤: ${step.name}`);
      console.log(`[PhaseExecutor]   📖 操作说明: ${step.description}`);
      console.log(`[PhaseExecutor]   🎯 预期输出: ${step.expectedOutput}`);

      // 解析步骤参数中的模板变量
      const resolvedParams = this.resolveTemplateVariables(step.toolCall.params, context);

      // 调用工具
      const toolResult = await this.executeToolCall(step.toolCall.tool, resolvedParams, step.id);
      toolResults.push(toolResult);

      if (toolResult.success) {
        // 工具输出交给 AI 分析（引擎不提供硬编码检测逻辑）
        // findings 由 AI 在工具调用后根据输出动态生成
        console.log(`[PhaseExecutor]   📊 工具输出已收集，等待 AI 分析`);
      } else {
        hasError = true;
        if (!this.config.continueOnStepFailure) {
          break;
        }
      }
    }

    // 判断阶段状态
    const status = this.determineStatus(toolResults, hasError);

    const duration = Date.now() - startTime;
    console.log(`[PhaseExecutor] 阶段完成: ${phase.name}, 状态: ${status}, 耗时: ${duration}ms`);

    return {
      phaseId: phase.id,
      status,
      findings,
      toolResults,
      duration,
      error: hasError ? '部分步骤执行失败' : undefined,
    };
  }

  /**
   * 自适应执行模式：根据回显动态调整策略
   * 核心思想：观察 → 分析 → 决策 → 执行 → 循环
   * 
   * 引擎只提供框架和决策点，AI 负责：
   * - 分析工具输出
   * - 识别漏洞迹象
   * - 动态调整策略
   */
  private async executeAdaptive(
    phase: Phase,
    context: Record<string, any>,
    startTime: number
  ): Promise<PhaseResult> {
    const findings: ProcessFinding[] = [];
    const toolResults: ToolResult[] = [];
    const observationHistory: Array<{ step: string; response: any; analysis: string }> = [];
    let iteration = 0;
    let hasError = false;

    console.log(`[PhaseExecutor] 🔄 进入自适应模式，最大迭代: ${this.config.maxAdaptiveIterations}`);
    console.log(`[PhaseExecutor] 📋 阶段目标: ${phase.description}`);
    console.log(`[PhaseExecutor] ✅ 成功标准: ${phase.successCriteria.join(', ')}`);

    while (iteration < this.config.maxAdaptiveIterations) {
      iteration++;
      console.log(`\n[PhaseExecutor] 📍 迭代 ${iteration}/${this.config.maxAdaptiveIterations}`);

      // 选择当前步骤（如果有自适应步骤，使用它；否则使用下一个固定步骤）
      const adaptiveStep = phase.steps.find(s => s.id.includes('adaptive')) || phase.steps[iteration - 1];
      if (!adaptiveStep) break;

      console.log(`[PhaseExecutor]   ⚡ 步骤: ${adaptiveStep.name}`);
      console.log(`[PhaseExecutor]   📖 操作说明: ${adaptiveStep.description}`);

      // 解析步骤参数中的模板变量
      const resolvedParams = this.resolveTemplateVariables(adaptiveStep.toolCall.params, context);

      // 如果是自适应步骤，根据历史观察动态调整参数
      if (adaptiveStep.id.includes('adaptive')) {
        const adjustedParams = this.adaptParameters(adaptiveStep.toolCall.params, observationHistory, context);
        Object.assign(resolvedParams, adjustedParams);
      }

      // 调用工具
      const toolResult = await this.executeToolCall(adaptiveStep.toolCall.tool, resolvedParams, adaptiveStep.id);
      toolResults.push(toolResult);

      // 观察回显（引擎只提供观察框架，AI 负责分析）
      const observation = this.analyzeResponse(toolResult, adaptiveStep);
      observationHistory.push({
        step: adaptiveStep.name,
        response: toolResult,
        analysis: observation,
      });

      console.log(`[PhaseExecutor]   🔍 观察: ${observation}`);

      // 提取发现（由 AI 完成，引擎只提供结构）
      if (toolResult.success) {
        console.log(`[PhaseExecutor]   📊 工具输出已收集，等待 AI 分析`);
        
        // 分析是否需要调整策略
        const strategyAdjustment = this.analyzeStrategy(observationHistory, phase);
        if (strategyAdjustment.shouldStop) {
          console.log(`[PhaseExecutor]   ✅ 策略分析: ${strategyAdjustment.reason}`);
          break;
        }
        if (strategyAdjustment.adjustment) {
          console.log(`[PhaseExecutor]   🔄 策略调整: ${strategyAdjustment.adjustment}`);
        }
      } else {
        hasError = true;
        if (!this.config.continueOnStepFailure) {
          break;
        }
      }

      // 检查是否达到成功标准
      if (this.checkSuccessCriteria(phase, findings, observationHistory)) {
        console.log(`[PhaseExecutor]   ✅ 达到成功标准，结束阶段`);
        break;
      }
    }

    // 判断阶段状态
    const status = this.determineStatus(toolResults, hasError);
    const duration = Date.now() - startTime;

    console.log(`[PhaseExecutor] 阶段完成: ${phase.name}, 状态: ${status}, 迭代: ${iteration}, 耗时: ${duration}ms`);

    return {
      phaseId: phase.id,
      status,
      findings,
      toolResults,
      duration,
      error: hasError ? '部分步骤执行失败' : undefined,
    };
  }

  /**
   * 根据历史观察动态调整参数
   * 引擎只提供调整框架，AI 根据上下文决定具体调整策略
   */
  private adaptParameters(
    originalParams: Record<string, any>,
    history: Array<{ step: string; response: any; analysis: string }>,
    context: Record<string, any>
  ): Record<string, any> {
    const adjusted = { ...originalParams };

    if (history.length === 0) return adjusted;

    const lastObservation = history[history.length - 1];
    const lastAnalysis = lastObservation.analysis.toLowerCase();

    // 引擎只提供调整点，AI 根据上下文决定具体策略
    console.log(`[PhaseExecutor]   🔄 根据历史观察调整参数`);

    return adjusted;
  }

  /**
   * 分析响应内容
   * 移除硬编码漏洞检测正则，只提供观察框架
   * AI 负责根据阶段目标分析响应内容
   */
  private analyzeResponse(toolResult: ToolResult, step: PhaseStep): string {
    if (!toolResult.success) {
      return `步骤失败: ${toolResult.error}`;
    }

    // 引擎只提供观察框架，不硬编码检测逻辑
    // AI 根据阶段目标和成功标准分析响应
    return '工具输出已收集，等待 AI 分析';
  }

  /**
   * 分析策略是否需要调整
   * 引擎只提供决策点，AI 根据上下文决定具体策略
   */
  private analyzeStrategy(
    history: Array<{ step: string; response: any; analysis: string }>,
    phase: Phase
  ): { shouldStop: boolean; reason?: string; adjustment?: string } {
    if (history.length === 0) return { shouldStop: false };

    // 引擎只提供决策框架
    // AI 根据历史观察和阶段目标决定是否需要调整策略
    
    return { shouldStop: false };
  }

  /**
   * 检查是否达到成功标准
   * 引擎只提供成功标准，AI 根据上下文判断是否达到
   */
  private checkSuccessCriteria(
    phase: Phase,
    findings: ProcessFinding[],
    history: Array<{ step: string; response: any; analysis: string }>
  ): boolean {
    // 引擎只提供成功标准框架
    // AI 根据阶段目标和成功标准判断是否达到
    
    // 如果迭代次数达到一半且没有发现，也可以停止
    if (history.length >= this.config.maxAdaptiveIterations / 2 && findings.length === 0) {
      return true;
    }

    return false;
  }

  /**
   * 解析模板变量
   * 将 {{target}} 等模板变量替换为上下文中的实际值
   */
  private resolveTemplateVariables(
    params: Record<string, any>,
    context: Record<string, any>
  ): Record<string, any> {
    const resolved: Record<string, any> = {};
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string') {
        resolved[key] = value.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
          return context[varName] !== undefined ? String(context[varName]) : match;
        });
      } else if (typeof value === 'object' && value !== null) {
        resolved[key] = this.resolveTemplateVariables(value, context);
      } else {
        resolved[key] = value;
      }
    }
    return resolved;
  }

  /**
   * 执行工具调用
   */
  private async executeToolCall(
    toolName: string,
    params: Record<string, any>,
    stepId: string
  ): Promise<ToolResult> {
    try {
      const result = await this.registry.callTool(toolName, params);
      return result;
    } catch (error) {
      return {
        tool: toolName,
        params,
        output: '',
        success: false,
        duration: 0,
        error: `步骤 ${stepId} 工具调用异常: ${error}`,
      };
    }
  }

  /**
   * 确定阶段执行状态
   */
  private determineStatus(toolResults: ToolResult[], hasError: boolean): 'success' | 'failure' | 'partial' | 'skipped' {
    if (toolResults.length === 0) {
      return 'skipped';
    }
    if (hasError) {
      if (toolResults.some(r => r.success)) {
        return 'partial';
      }
      return 'failure';
    }
    return 'success';
  }
}
