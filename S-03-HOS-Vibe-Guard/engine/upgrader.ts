/**
 * 🧩 HOS-Vibe-Guard · 选题升级引擎
 *
 * 将低维模板项目升级为高工程价值方向的转换规范。
 * AI 参考此逻辑执行升级建议输出。
 *
 * 兼容: Claude Code / Cursor / Windsurf / GitHub Copilot
 */

// ============================================================
// 类型定义
// ============================================================

interface UpgradeMapping {
  fromPattern: string;
  upgrades: UpgradeOption[];
}

interface UpgradeOption {
  title: string;
  description: string;
  conceptMap: Record<string, string>;
  architecture: {
    core: string[];
    optional?: string[];
  };
  difficulty: 'EASY' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  tags: string[];
}

interface UpgradedConcept {
  original: string;
  upgraded: string;
  explanation: string;
}

interface UpgradePath {
  current: string;
  target: string;
  steps: string[];
  difficulty: string;
  estimatedEffort: string;
}

interface UpgradeSuggestion {
  originalTopic: string;
  detectedPattern: string;
  templateLevel: string;
  suggestions: UpgradeOption[];
  conceptEvolution: UpgradedConcept[];
  migrationPaths: UpgradePath[];
  codeExample?: string;
}

// ============================================================
// 升级执行规范
// ============================================================

export class ProjectUpgrader {
  /**
   * 查找匹配的升级建议
   *
   * @param detectedPattern - 检测到的模板模式 ID
   * @param upgradeDb - 从 rules/topic-upgrade-map.json 加载的升级数据库
   */
  findUpgrades(
    detectedPattern: string,
    upgradeDb: { mappings: UpgradeMapping[] }
  ): UpgradeOption[] {
    // === 实现指引 ===
    // AI 执行此步骤时应:
    // 1. 在 upgradeDb.mappings 中查找 fromPattern 匹配的项
    // 2. 如果精确匹配，返回所有 upgrades
    // 3. 如果没有精确匹配，使用标签匹配（tags overlap）
    // 4. 如果仍无匹配，使用回退策略链

    const mapping = upgradeDb.mappings.find(
      m => m.fromPattern === detectedPattern
    );

    if (mapping) {
      return mapping.upgrades;
    }

    // 标签匹配: 在 topic-upgrade-map.json 中按标签空间搜索相近条目
    return [];
  }

  /**
   * 构建概念演化路线图
   *
   * 将原始项目的概念逐一映射为升级后的工程概念，
   * 让用户看到「同一个功能」在工程版本中如何重新设计。
   *
   * @param originalTopic - 原始项目主题
   * @param upgrade - 选定的升级方向
   */
  buildConceptEvolution(
    originalTopic: string,
    upgrade: UpgradeOption
  ): UpgradedConcept[] {
    // === 实现指引 ===
    // 将 upgrade.conceptMap 转换为概念演化列表:
    // 对每个 mapping entry, 构建:
    // { original: 'Task', upgraded: 'CognitiveLoadUnit', explanation: '...' }
    //
    // 添加额外的从原始项目中推导的概念映射:
    // 分析用户原始提案中的隐含概念, 补充映射

    return Object.entries(upgrade.conceptMap).map(([key, value]) => {
      const [original, upgraded] = key.split(' → ').map(s => s.trim());
      return {
        original: original || key,
        upgraded: upgraded || value,
        explanation: typeof value === 'string' ? value : '',
      };
    });
  }

  /**
   * 生成渐进式迁移路径
   *
   * 不要求用户「推翻重来」—— 给出增量演进步骤。
   * 每一步都是可独立交付的增量改进。
   *
   * @param originalTopic - 原始项目
   * @param upgrade - 升级方向
   */
  generateMigrationPath(
    originalTopic: string,
    upgrade: UpgradeOption
  ): UpgradePath[] {
    // === 实现指引 ===
    // 根据难度和架构组件，生成渐进步骤:
    //
    // EASY: 概念重命名 + 简单重构 (1-2 步，几小时)
    // MEDIUM: 引入新架构层 + 核心替换 (3-4 步，1-3 天)
    // HIGH: 引入事件/领域层 + 测试重构 (5-7 步，1-2 周)
    // VERY_HIGH: 完整架构迁移 (8+ 步，2 周以上)
    //
    // 第一步永远是最小改动:
    // 「不改任何功能，只重命名和重组」

    return [];
  }

  /**
   * 生成代码级升级示例
   *
   * 展示从原始方式到升级方式的代码变化。
   * 关键: 最小改动，可理解，可直接应用。
   *
   * @param originalCode - 原始代码风格
   * @param upgradedConcept - 升级后的概念定义
   * @param language - 编程语言
   */
  generateCodeExample(
    originalCode: string,
    upgradedConcept: UpgradedConcept[],
    language: string
  ): string {
    // === 实现指引 ===
    // 生成对比代码:
    // // ❌ 原始方式: Task 作为简单对象
    // let todos: any[] = [];
    //
    // // ✅ 升级方式: CognitiveLoadUnit 作为领域模型
    // interface CognitiveLoadUnit { ... }
    //
    // 保证:
    // - 代码是语法正确的
    // - 使用用户当前项目的语言
    // - 从最小改动开始
    // - 有类型定义（如果语言支持）

    return '';
  }

  /**
   * 主入口: 生成完整升级建议
   */
  generateSuggestion(
    originalTopic: string,
    detectedPattern: string,
    templateLevel: string
  ): UpgradeSuggestion | null {
    // 实际执行时从 topic-upgrade-map.json 加载
    const upgradeDb = { mappings: [] as UpgradeMapping[] };
    const upgrades = this.findUpgrades(detectedPattern, upgradeDb);

    if (upgrades.length === 0) {
      // 使用动态升级策略链
      return this.generateFallbackSuggestion(originalTopic, detectedPattern);
    }

    // 选择第一个升级方向（AI 应选择与用户需求最匹配的）
    const primaryUpgrade = upgrades[0];
    const evolution = this.buildConceptEvolution(originalTopic, primaryUpgrade);
    const paths = this.generateMigrationPath(originalTopic, primaryUpgrade);

    return {
      originalTopic,
      detectedPattern,
      templateLevel,
      suggestions: upgrades,
      conceptEvolution: evolution,
      migrationPaths: paths,
    };
  }

  /**
   * 当无精确匹配时的回退策略
   *
   * 使用 topic-upgrade-map.json 中的 dynamicUpgradeStrategies 链:
   * add_domain → add_dimension → add_intelligence → add_collaboration → add_observability
   */
  private generateFallbackSuggestion(
    originalTopic: string,
    detectedPattern: string
  ): UpgradeSuggestion | null {
    // === 实现指引 ===
    // 逐层检查哪个策略适用于当前项目:
    //
    // 1. add_domain: 识别项目潜在的领域逻辑
    //    「你的项目可以加上什么真实业务逻辑？」
    //    例: 记账系统 → 支出分类 + 预算规则 + 异常检测
    //
    // 2. add_dimension: 识别缺少的非功能维度
    //    「你的项目需要什么维度？」
    //    例: 单用户 → 权限 + 审计 + 版本
    //
    // 3. add_intelligence: 识别可智能化的决策点
    //    「哪里有确定的规则可以被智能模型替代？」
    //
    // 4. add_collaboration: 识别协作机会
    //    「哪些环节可以多用户/多 Agent 协作？」
    //
    // 5. add_observability: 添加测量和可视化
    //    「哪里有数据可以收集和展示？」
    //
    // 应用第一个适用的策略

    return null;
  }

  /**
   * 构建概念升维映射表
   *
   * 将玩具概念统一映射为工程概念（从 SKILL.md 中的映射表输出）。
   * 用于生成「Vibe → Real Engineering」转换器输出。
   */
  getVibeToEngineeringMap(): Record<string, string> {
    return {
      'Task / Todo': 'Work Item / Cognitive Load Unit',
      '优先级排序': 'Attention Weighting / Impact Scoring',
      '完成/未完成': 'State Machine (todo→doing→done→verified)',
      '分类/标签': 'Taxonomy + Faceted Classification',
      '计时器': 'Time Series Event Stream',
      '分数/得分': 'Telemetry Metrics',
      '用户输入': 'Command Event / Domain Event',
      '保存/加载': 'Persistence Layer (Snapshot + Event Log)',
      '撤销/重做': 'Command Sourcing + Reversal',
      '设置/配置': 'Policy Engine / Feature Toggles',
      '通知': 'Event-Driven Messaging',
      '搜索': 'Query Service + Index',
      '登录/注册': 'Identity Provider + MFA',
      'API 调用': 'API Gateway + Rate Limiting + Auth',
      '数据库 CRUD': 'Repository + Unit of Work + Event Store',
      'UI 路由': 'Application Layer + Use Case Orchestrator',
    };
  }
}

// ============================================================
// 升级建议输出模板
// ============================================================

/**
 * [🧠 选题升级建议]
 *
 * 原主题: {originalTopic}
 * 检测模式: {detectedPattern}
 *
 * ── 升级方向 ──
 *
 * 🚀 {upgradeTitle}
 *    {description}
 *
 * 概念演化:
 *   {original} → {upgraded}
 *     {explanation}
 *   {original2} → {upgraded2}
 *     {explanation2}
 *
 * 架构组件:
 *   核心: {coreComponents}
 *   可选: {optionalComponents}
 *
 * ── 渐进式迁移路径 ──
 *
 * 第 1 步: {step1} (最小改动)
 * 第 2 步: {step2}
 * ...
 *
 * ── 代码示例 ──
 *
 * // Before
 * {beforeCode}
 *
 * // After
 * {afterCode}
 *
 * ── 难度评估 ──
 * {difficulty} · 预计投入: {estimatedEffort}
 */

// ============================================================
// 使用示例
// ============================================================

/**
 * 示例: TODO App → 认知负载管理系统
 *
 * 升级建议内容:
 *
 * [🧠 选题升级建议]
 *
 * 原主题: TODO App
 * 检测模式: todo_app (HIGH)
 *
 * 🚀 认知负载管理系统
 *    将 Task 概念升级为认知负载单元，引入精力预算调度
 *
 * 概念演化:
 *   Task → CognitiveLoadUnit (包含预估消耗、上下文关联、依赖图)
 *   Priority → AttentionWeight (基于精力模型而非简单数字)
 *   Status → StateMachine (todo→doing→blocked→review→done)
 *   DueDate → EnergyBudget (根据个人精力曲线智能分配)
 *
 * 架构组件:
 *   核心: EventStore, EnergyBudgetScheduler, CognitiveLoadModel
 *   可选: FocusAnalyzer, InterruptionManager
 *
 * ── 渐进式迁移 ──
 * 1. 重命名: Task → TaskItem（不动逻辑，只改名字）
 * 2. 加状态: 引入状态机替代 Boolean done
 * 3. 加上下文: 每个 Task 关联 project context
 * 4. 加事件: 操作写入 EventStore
 *
 * ── 代码示例 ──
 *
 * // Before
 * let todos = [{ id: 1, title: '...', done: false }];
 *
 * // After (Step 1)
 * interface CognitiveLoadUnit {
 *   id: string;
 *   title: string;
 *   context: { project: string; goal: string; };
 *   state: 'backlog' | 'active' | 'blocked' | 'review' | 'done';
 *   load: { estimatedEnergy: number; };
 * }
 */
