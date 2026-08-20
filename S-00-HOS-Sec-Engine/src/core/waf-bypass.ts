/**
 * WAF 绕过知识模块 - 方法论指导模式
 *
 * 职责：
 * 1. 提供 WAF 检测的数据收集框架（实际识别由外部工具或 AI 完成）
 * 2. 提供绕过策略生成的框架（实际策略由 AI 动态生成）
 * 3. 关联外部工具（如 wafw00f）进行 WAF 指纹识别
 *
 * 设计原则：
 * - 不硬编码 WAF 指纹库、绕过工具列表、绕过策略
 * - 所有数据通过外部工具调用或 AI 动态生成
 * - 引擎只提供框架和决策点
 */

/**
 * WAF 检测结果
 */
export interface WafDetectionResult {
  /** 是否检测到 WAF（null 表示需要 AI 分析） */
  hasWaf: boolean | null;
  /** 检测到的 WAF 列表 */
  detectedWafs: string[];
  /** 原始响应头快照 */
  responseHeaders: Record<string, string>;
  /** 响应状态码 */
  statusCode: number;
  /** 响应体片段（供 AI 分析） */
  bodySnippet?: string;
  /** 是否需要 AI 分析 */
  requiresAiAnalysis: boolean;
}

/**
 * WAF 绕过建议
 */
export interface BypassRecommendation {
  /** 检测到的 WAF 类型 */
  wafType: string;
  /** 绕过策略（由 AI 动态生成） */
  strategies: string[];
  /** 推荐工具（由 AI 动态发现） */
  recommendedTools: string[];
  /** 关联 CVE 关键词 */
  cveKeywords: string[];
  /** 重要性等级 */
  priority: 'high' | 'medium' | 'low';
}

/**
 * WAF 绕过知识模块
 * 提供 WAF 检测框架、策略生成框架、外部工具关联能力
 */
export class WafBypassModule {

  /**
   * 收集 WAF 检测数据
   * 引擎只负责收集响应头、状态码、响应体片段
   * 实际 WAF 识别由 AI 分析或调用外部工具（如 wafw00f）完成
   * 
   * @param headers 响应头字典
   * @param statusCode HTTP 状态码
   * @param body 响应体（可选）
   * @returns WAF 检测结果（需要 AI 进一步分析）
   */
  collectWafData(
    headers: Record<string, string>,
    statusCode: number,
    body?: string
  ): WafDetectionResult {
    return {
      hasWaf: null, // 需要 AI 分析
      detectedWafs: [],
      responseHeaders: headers,
      statusCode,
      bodySnippet: body ? body.substring(0, 1000) : undefined,
      requiresAiAnalysis: true,
    };
  }

  /**
   * 生成 WAF 绕过建议框架
   * 引擎只提供框架，实际策略和工具由 AI 根据 WAF 类型动态生成
   * 
   * @param wafType WAF 类型（由 AI 识别后传入）
   * @returns 绕过建议框架（待 AI 填充）
   */
  generateBypassFramework(wafType: string): BypassRecommendation {
    return {
      wafType,
      strategies: [], // AI 根据 WAF 类型动态生成
      recommendedTools: [], // AI 根据上下文动态发现
      cveKeywords: [`${wafType.toLowerCase()} waf bypass`], // 基础关键词
      priority: 'medium',
    };
  }

  /**
   * 将 WAF 检测结果转换为 ProcessFinding 格式
   * 
   * @param detectionResult WAF 检测结果
   * @returns ProcessFinding 数组
   */
  detectionToFindings(detectionResult: WafDetectionResult): Array<{
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    description: string;
    evidence: string;
  }> {
    const findings: Array<{
      type: string;
      severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
      description: string;
      evidence: string;
    }> = [];

    if (detectionResult.requiresAiAnalysis) {
      // 需要 AI 分析
      findings.push({
        type: 'waf-analysis-required',
        severity: 'info',
        description: '需要 AI 分析响应头以识别 WAF 类型',
        evidence: JSON.stringify({
          statusCode: detectionResult.statusCode,
          headers: detectionResult.responseHeaders,
          bodySnippet: detectionResult.bodySnippet,
        }),
      });
    } else if (detectionResult.hasWaf && detectionResult.detectedWafs.length > 0) {
      // WAF 已识别
      findings.push({
        type: 'waf-detected',
        severity: 'info',
        description: `检测到 WAF 保护: ${detectionResult.detectedWafs.join(', ')}`,
        evidence: JSON.stringify({
          detectedWafs: detectionResult.detectedWafs,
          statusCode: detectionResult.statusCode,
        }),
      });
    } else {
      // 未检测到 WAF
      findings.push({
        type: 'waf-not-detected',
        severity: 'info',
        description: '未检测到 WAF 保护',
        evidence: '响应头分析完成，未发现已知 WAF 特征',
      });
    }

    return findings;
  }

  /**
   * 获取外部 WAF 检测工具建议
   * 引擎只提供通用工具名称，实际调用由 AI 根据上下文决策
   * 
   * @returns 外部工具名称列表
   */
  getExternalToolSuggestions(): string[] {
    return ['wafw00f']; // 通用建议，AI 可根据上下文决定是否调用
  }

  /**
   * 构建 WAF 分析提示词
   * 为 AI 提供分析 WAF 类型所需的上下文信息
   * 
   * @param detectionResult WAF 检测结果
   * @returns 供 AI 分析的提示词/上下文
   */
  buildWafAnalysisPrompt(detectionResult: WafDetectionResult): string {
    const prompt = `
请分析以下 HTTP 响应信息，识别是否存在 WAF（Web Application Firewall）保护，并判断 WAF 类型：

状态码: ${detectionResult.statusCode}
响应头:
${JSON.stringify(detectionResult.responseHeaders, null, 2)}
${detectionResult.bodySnippet ? `\n响应体片段:\n${detectionResult.bodySnippet}` : ''}

请提供：
1. 是否检测到 WAF？
2. 如果检测到，WAF 类型/厂商是什么？
3. 识别依据是什么（哪些响应头或特征）？
`;
    return prompt.trim();
  }

  /**
   * 构建绕过策略生成提示词
   * 为 AI 提供生成绕过策略所需的上下文信息
   * 
   * @param wafType WAF 类型
   * @param context 额外上下文（如目标应用类型、已尝试的方法等）
   * @returns 供 AI 生成策略的提示词
   */
  buildBypassStrategyPrompt(wafType: string, context?: Record<string, any>): string {
    const prompt = `
请针对 ${wafType} WAF 生成绕过策略：

目标 WAF: ${wafType}
${context ? `额外上下文: ${JSON.stringify(context)}` : ''}

请提供：
1. 推荐的绕过维度（如编码、混淆、HTTP 协议差异等）
2. 推荐使用的工具或技术
3. 相关的 CVE 查询关键词
`;
    return prompt.trim();
  }
}

/** 全局单例 */
export const wafBypassModule = new WafBypassModule();
