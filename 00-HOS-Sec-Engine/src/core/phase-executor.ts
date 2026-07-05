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
}

const DEFAULT_CONFIG: PhaseExecutorConfig = {
  stepTimeout: 60000,
  continueOnStepFailure: true,
};

/**
 * 阶段执行器
 * 负责执行单个阶段中的所有步骤，调用工具并收集结果
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
        // 从工具输出中提取发现
        const stepFindings = this.extractFindings(step, toolResult);
        findings.push(...stepFindings);
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
   * 从工具输出中提取发现
   */
  private extractFindings(step: PhaseStep, toolResult: ToolResult): ProcessFinding[] {
    const findings: ProcessFinding[] = [];

    // 检查输出中是否包含疑似漏洞的特征
    const output = toolResult.output.toLowerCase();
    const vulnerabilityPatterns: Array<{ type: string; patterns: string[]; severity: 'critical' | 'high' | 'medium' | 'low' }> = [
      {
        type: 'sqli',
        patterns: ['sql syntax error', 'mysql_fetch', 'unclosed quotation mark', 'odbc driver', 'sqlstate'],
        severity: 'high',
      },
      {
        type: 'xss',
        patterns: ['<script>alert', 'onerror=', 'onload='],
        severity: 'high',
      },
      {
        type: 'ssrf',
        patterns: ['169.254.169.254', 'meta-data', 'instance-id', 'iam/'],
        severity: 'high',
      },
      {
        type: 'path-traversal',
        patterns: ['root:x:', 'etc/passwd', 'boot.ini', 'windows\\system32'],
        severity: 'high',
      },
      {
        type: 'info-disclosure',
        patterns: ['stack trace', 'debug output', 'internal server error', 'server version'],
        severity: 'medium',
      },
    ];

    for (const vp of vulnerabilityPatterns) {
      const matchedPattern = vp.patterns.find(p => output.includes(p));
      if (matchedPattern) {
        findings.push({
          id: `${step.id}-${vp.type}-${Date.now()}`,
          type: vp.type,
          severity: vp.severity,
          description: `在步骤 "${step.name}" 中发现疑似 ${vp.type} 漏洞`,
          evidence: toolResult.output.slice(0, 500),
          cveMatches: [],
          timestamp: new Date().toISOString(),
        });
      }
    }

    return findings;
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