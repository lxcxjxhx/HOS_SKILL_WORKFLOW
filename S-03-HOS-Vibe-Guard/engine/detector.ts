/**
 * 🔍 HOS-Vibe-Guard · 选题退化检测引擎
 *
 * 这是一个「AI 可执行」规范 — AI IDE 参考此逻辑执行检测，
 * 而非由真实代码引擎运行。
 *
 * 兼容: Claude Code / Cursor / Windsurf / GitHub Copilot
 *
 * 检测流程:
 *   1. parse_user_request()     — 解析用户请求中的项目描述
 *   2. detect_template_match()  — 匹配模板模式库
 *   3. check_compound_signals() — 检测复合信号（全栈 starter / AI wrapper 等）
 *   4. evaluate_integrity()     — 评估项目完整性信号
 *   5. compute_score()          — 生成综合评分
 *   6. output_verdict()         — 输出检测结论
 */

// ============================================================
// 类型定义
// ============================================================

interface DetectionConfig {
  strictness: 'relaxed' | 'normal' | 'strict';
  silentMode: boolean;
  securityLevel: 'basic' | 'normal' | 'paranoid';
}

interface ParsedRequest {
  rawText: string;
  keywords: string[];
  projectType: string | null;
  techStack: string[];
  hasAdvancedFeatures: boolean;
  estimatedScope: 'tiny' | 'small' | 'medium' | 'large';
}

interface TemplateMatch {
  patternId: string;
  patternName: string;
  matchLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number; // 0.0 - 1.0
  matchedKeywords: string[];
  tags: string[];
  estimatedCount: number;
}

interface CompoundSignal {
  signalId: string;
  description: string;
  triggered: boolean;
  matchCount: number;
  requiredCount: number;
}

interface PositiveIndicator {
  category: string;
  items: string[];
  foundCount: number;
}

interface DetectionResult {
  templateMatches: TemplateMatch[];
  compoundSignals: CompoundSignal[];
  positiveIndicators: PositiveIndicator[];
  hasTemplateTrap: boolean;
  highestLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
}

// ============================================================
// 检测执行规范（AI 推理执行）
// ============================================================

/**
 * 检测AI应遵循以下完整流程，而不是仅凭感觉判断。
 * 每一步都有明确的输入、处理和输出标准。
 */

export class ProjectDegenerationDetector {
  private config: DetectionConfig;

  constructor(config: Partial<DetectionConfig> = {}) {
    this.config = {
      strictness: config.strictness || 'normal',
      silentMode: config.silentMode || false,
      securityLevel: config.securityLevel || 'normal',
    };
  }

  /**
   * 第一步: 解析用户请求
   *
   * 从用户输入中提取:
   * - 核心意图词组
   * - 技术栈选择
   * - 项目规模估算
   * - 高级特性信号（领域逻辑/事件/架构等）
   *
   * @param userInput - 用户的原始请求文本
   */
  parseRequest(userInput: string): ParsedRequest {
    // === 实现指引 ===
    // AI 执行此步骤时应:
    // 1. 将用户输入分词为关键词
    // 2. 匹配已知的项目类型模式
    // 3. 扫描技术栈关键词
    // 4. 判断是否有高级特性关键词
    // 5. 根据描述估算项目规模
    return {
      rawText: userInput,
      keywords: [],
      projectType: null,
      techStack: [],
      hasAdvancedFeatures: false,
      estimatedScope: 'small',
    };
  }

  /**
   * 第二步: 模板模式匹配
   *
   * 根据 keywords 和 projectType 匹配 template-patterns.json 中的模式。
   * 注意排除关键词（excludeKeywords）—— 如果有排除关键词命中，降级或取消匹配。
   *
   * @param request - 解析后的用户请求
   * @param patternsDb - 从 rules/template-patterns.json 加载的模式库
   */
  detectTemplateMatch(
    request: ParsedRequest,
    patternsDb: Record<string, any>
  ): TemplateMatch[] {
    const matches: TemplateMatch[] = [];

    // === 实现指引 ===
    // AI 执行此步骤时应:
    // 1. 遍历 patternsDb.patterns
    // 2. 对每个 pattern，检查 request 是否包含其 keywords
    // 3. 如果也包含 excludeKeywords，降级或不匹配
    // 4. 按 minMatch 要求判断是否达到阈值
    // 5. 计算 confidence = matchedCount / minMatch (上限 1.0)
    // 6. 根据 strictness 调整:
    //    - relaxed: 只匹配 HIGH 级别
    //    - normal: 匹配 HIGH + MEDIUM
    //    - strict: 匹配所有级别
    return matches;
  }

  /**
   * 第三步: 复合信号检测
   *
   * 检测复合模式（如全栈 starter、AI wrapper、教程复现），
   * 这些信号需要多个 indicators 同时满足。
   *
   * @param request - 解析后的用户请求
   * @param projectFiles - 如果已有项目文件，检测项目结构
   */
  detectCompoundSignals(
    request: ParsedRequest,
    projectFiles?: string[]
  ): CompoundSignal[] {
    const signals: CompoundSignal[] = [];

    // === 实现指引 ===
    // AI 根据 context 判断复合信号:
    //
    // fullstack_demo_starter:
    //   检查: 同时包含前端+后端+数据库? 使用元框架? 标准目录结构?
    //   需要 ≥3 个 indicators 触发
    //
    // ai_wrapper:
    //   检查: 直接调 LLM API? 无 prompt engineering? 无 RAG/自定义逻辑?
    //   需要 ≥3 个 indicators 触发
    //
    // tutorial_reproduction:
    //   检查: 有 TODO.md 跟随教程? 未解释的特定技术栈选择?
    //   需要 ≥2 个 indicators 触发

    return signals;
  }

  /**
   * 第四步: 积极指标评估
   *
   * 检测项目是否有真正的工程价值信号（领域深度、架构质量、工程实践等）。
   * 这用于抵消模板匹配的负面评分 —— 一个"模板类别但做得很好"的项目
   * 不应被过度惩罚。
   *
   * @param request - 解析后的用户请求
   * @param projectFiles - 如果已有项目文件
   */
  evaluatePositiveIndicators(
    request: ParsedRequest,
    projectFiles?: string[]
  ): PositiveIndicator[] {
    const indicators: PositiveIndicator[] = [];

    // === 实现指引 ===
    // 在以下类别中检查积极信号:
    // 领域深度: domain model, DDD, bounded context, 领域事件, 业务规则引擎
    // 架构质量: hexagonal, clean architecture, CQRS, event sourcing
    // 工程实践: 测试覆盖率, CI/CD, OpenTelemetry
    // 安全实践: OWASP, zero trust, RBAC, 加密存储

    return indicators;
  }

  /**
   * 第五步: 综合判决
   *
   * 整合所有检测结果，产生最终结论。
   * 这是 AI 判断的重点 —— 权衡模板匹配和积极指标。
   */
  synthesize(
    matches: TemplateMatch[],
    signals: CompoundSignal[],
    indicators: PositiveIndicator[]
  ): DetectionResult {
    let highestLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' = 'NONE';

    // === 实现指引 ===
    // 1. 确定最高模板级别
    //    - 如果有 HIGH 匹配且无积极指标抵消 → 确认为模板陷阱
    //    - 如果有 HIGH 匹配但有较多积极指标 → 降级为 MEDIUM
    //    - 如果有 MEDIUM 匹配 + 复合信号 → 升级为 HIGH
    //
    // 2. 积极指标抵消规则:
    //    - 每 3 个积极指标可将模板级别降一级
    //    - 积极指标来自 4 个类别（领域/架构/工程/安全）—— 跨类别更有效
    //
    // 3. 最终输出:
    //    - hasTemplateTrap: 是否需要触发选题升级
    //    - highestLevel: 实际的模板风险级别

    return {
      templateMatches: matches,
      compoundSignals: signals,
      positiveIndicators: indicators,
      hasTemplateTrap: highestLevel !== 'NONE',
      highestLevel,
    };
  }

  /**
   * 主入口: 一次调用完成完整检测流程
   */
  analyze(
    userInput: string,
    projectFiles?: string[]
  ): DetectionResult {
    const request = this.parseRequest(userInput);

    // AI 注意: 实际加载 rules/template-patterns.json 中的 patterns
    const patterns = {}; // 由 AI 加载
    const matches = this.detectTemplateMatch(request, patterns);
    const signals = this.detectCompoundSignals(request, projectFiles);
    const indicators = this.evaluatePositiveIndicators(request, projectFiles);

    return this.synthesize(matches, signals, indicators);
  }
}

// ============================================================
// 使用示例（AI 执行参考）
// ============================================================

/**
 * 示例: 用户请求「做一个番茄钟」
 *
 * 第一步 — parseRequest:
 *   keywords: ['pomodoro', '番茄', 'timer']
 *   projectType: 'pomodoro_timer'
 *   hasAdvancedFeatures: false
 *
 * 第二步 — detectTemplateMatch:
 *   匹配: pomodoro_timer (HIGH)
 *   confidence: 1.0
 *   排除检查: 无 circadian/cognitive/behavior 等排他词
 *   → 确认 HIGH 模板匹配
 *
 * 第三步 — detectCompoundSignals:
 *   无额外信号
 *
 * 第四步 — evaluatePositiveIndicators:
 *   领域深度: 0/4
 *   架构质量: 0/4
 *   工程实践: 0/4
 *   安全实践: 0/4
 *   → 无积极指标
 *
 * 第五步 — synthesize:
 *   highestLevel: HIGH
 *   hasTemplateTrap: true
 *   → 触发完整选题升级流程
 */

/**
 * 示例: 用户请求「做一个 DDD 风格的番茄钟，含认知状态分析」
 *
 * 第一步 — parseRequest:
 *   keywords: ['pomodoro', 'DDD', 'cognitive', 'state analysis']
 *   hasAdvancedFeatures: true (cognitive, state analysis)
 *
 * 第二步 — detectTemplateMatch:
 *   匹配: pomodoro_timer
 *   excludeKeywords: 'cognitive' — 命中!
 *   → 跳过此匹配（消极匹配降级为不匹配）
 *
 * 第四步 — evaluatePositiveIndicators:
 *   领域深度: 3/4 (domain model, DDD, bounded context)
 *   架构质量: 2/4 (clean architecture)
 *   → 3 个积极指标
 *
 * 第五步 — synthesize:
 *   highestLevel: NONE
 *   hasTemplateTrap: false
 *   → 无需干预，正常流程
 */
