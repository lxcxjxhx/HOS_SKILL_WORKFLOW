/**
 * S-14-HOS-Jailbreak-Loop: Jailbreak 循环优化系统
 * 核心类型定义
 *
 * 本系统提供：
 * 1. 多维度 Jailbreak 攻击技术库（带分类和强度评级）
 * 2. 反 Jailbreak 防御策略库（带检测和拦截机制）
 * 3. 自动化攻防循环评估引擎
 * 4. 一键开关切换注册表
 */

// ─── 攻击维度 ──────────────────────────────────────────────────────────

/** 攻击技术大类 */
export type AttackCategory =
  | 'roleplay'        // 角色扮演类（DAN、Developer Mode 等）
  | 'prompt-inject'   // 提示注入类（系统提示覆盖、变量劫持）
  | 'context-split'   // 上下文拆分（多轮逐步越狱）
  | 'encoding'        // 编码绕过（Base64、谐音、拆字、外语）
  | 'persona'         // 人格面具（虚构身份、权威伪装）
  | 'logic-bomb'      // 逻辑炸弹（递归、悖论、自指）
  | 'template'        // 模板变体（经典越狱模板的迭代变体）
  | 'prefill'         // 预填充穿甲（assistant prefill 劫持）
  | 'meta'            // 元指令（覆盖系统级指令）
  | 'adversarial';    // 对抗样本（细微扰动绕过检测）

/** 攻击强度等级 */
export type AttackIntensity = 1 | 2 | 3 | 4 | 5;

/** 单个攻击技术定义 */
export interface AttackTechnique {
  id: string;
  name: string;
  category: AttackCategory;
  intensity: AttackIntensity;
  /** 攻击 prompt 模板（支持变量插值） */
  template: string;
  /** 适用的模型/场景 */
  applicableScenarios: string[];
  /** 预期绕过率（0-1，历史基准） */
  expectedBypassRate: number;
  /** 描述 */
  description: string;
  /** 标签（用于搜索和过滤） */
  tags: string[];
}

// ─── 防御维度 ──────────────────────────────────────────────────────────

/** 防御策略类型 */
export type DefenseType =
  | 'input-filter'    // 输入过滤（关键词、正则、分类器）
  | 'output-filter'   // 输出过滤（内容审核、截断）
  | 'context-guard'   // 上下文守卫（多轮检测、状态追踪）
  | 'identity-lock'   // 身份锁定（角色锚定、指令优先级）
  | 'entropy-check'   // 熵检查（检测异常 token 分布）
  | 'layered-wall'    // 分层防御（多层叠加）
  | 'canary'          // 金丝雀陷阱（植入追踪标记）
  | 'honeypot';       // 蜜罐诱导（引诱攻击者暴露模式）

/** 单个防御策略定义 */
export interface DefenseStrategy {
  id: string;
  name: string;
  type: DefenseType;
  /** 防御 prompt / 规则 */
  content: string;
  /** 检测的攻击类别 */
  detectsCategories: AttackCategory[];
  /** 防御强度（1-5） */
  strength: number;
  /** 是否为运行时动态防御（vs 静态 prompt） */
  isDynamic: boolean;
  description: string;
  tags: string[];
}

// ─── 评估维度 ──────────────────────────────────────────────────────────

/** 单次攻防测试结果 */
export interface TestResult {
  id: string;
  timestamp: number;
  attackId: string;
  defenseId: string;
  /** 模型响应（截断到关键部分） */
  responseSnippet: string;
  /** 是否成功绕过 */
  bypassed: boolean;
  /** 绕过置信度 0-1 */
  bypassConfidence: number;
  /** 响应中的安全对齐信号 */
  alignmentSignals: string[];
  /** 被拦截的防御层 */
  blockedByDefense: string | null;
}

/** 批量评估统计 */
export interface EvaluationStats {
  totalTests: number;
  bypassRate: number;
  avgConfidence: number;
  /** 各攻击类别绕过率 */
  categoryBreakdown: Record<AttackCategory, number>;
  /** 各防御类型拦截率 */
  defenseBreakdown: Record<DefenseType, number>;
  /** 最强攻击 Top5 */
  topAttacks: Array<{ id: string; name: string; bypassRate: number }>;
  /** 最强防御 Top5 */
  topDefenses: Array<{ id: string; name: string; blockRate: number }>;
}

// ─── 循环引擎 ──────────────────────────────────────────────────────────

/** 循环状态 */
export type LoopPhase =
  | 'idle'           // 空闲
  | 'attacking'      // 攻击阶段
  | 'defending'      // 防御阶段
  | 'evaluating'     // 评估阶段
  | 'optimizing'     // 优化阶段
  | 'paused'         // 暂停
  | 'completed';     // 完成

/** 循环配置 */
export interface LoopConfig {
  /** 最大循环轮数 */
  maxRounds: number;
  /** 每轮测试的攻击数量 */
  attacksPerRound: number;
  /** 每轮测试的防御数量 */
  defensesPerRound: number;
  /** 目标绕过率（达到后停止） */
  targetBypassRate: number;
  /** 目标防御率（达到后停止） */
  targetDefenseRate: number;
  /** 是否自动优化（根据评估结果调整策略） */
  autoOptimize: boolean;
  /** 优化方向：'attack' | 'defense' | 'balanced' */
  optimizationDirection: 'attack' | 'defense' | 'balanced';
}

/** 循环状态快照 */
export interface LoopSnapshot {
  phase: LoopPhase;
  currentRound: number;
  totalRounds: number;
  stats: EvaluationStats;
  /** 本轮使用的攻击 ID 列表 */
  roundAttacks: string[];
  /** 本轮使用的防御 ID 列表 */
  roundDefenses: string[];
  /** 优化建议 */
  optimizationSuggestions: string[];
  /** 历史最佳策略 */
  bestStrategies: {
    attacks: string[];
    defenses: string[];
  };
}

// ─── 开关注册表 ────────────────────────────────────────────────────────

/** 开关类别 */
export type ToggleCategory = 'attack' | 'defense' | 'mode' | 'evaluation';

/** 单个开关定义 */
export interface ToggleEntry {
  id: string;
  name: string;
  category: ToggleCategory;
  /** 默认状态 */
  defaultEnabled: boolean;
  /** 当前状态 */
  enabled: boolean;
  /** 关联的攻击/防御 ID 列表 */
  linkedIds: string[];
  /** 描述 */
  description: string;
  /** 快捷键（可选） */
  hotkey?: string;
}

/** 预设开关组合 */
export interface TogglePreset {
  id: string;
  name: string;
  description: string;
  /** 该预设下各开关的状态 */
  toggles: Record<string, boolean>;
}

// ─── 组合器配置 ────────────────────────────────────────────────────────

/** 完整的攻防循环配置 */
export interface JailbreakLoopConfig {
  /** 攻击库配置 */
  attacks: AttackTechnique[];
  /** 防御库配置 */
  defenses: DefenseStrategy[];
  /** 循环配置 */
  loop: LoopConfig;
  /** 开关注册表 */
  toggles: ToggleEntry[];
  /** 预设组合 */
  presets: TogglePreset[];
}
