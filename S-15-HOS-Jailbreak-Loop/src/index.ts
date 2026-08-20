/**
 * S-14-HOS-Jailbreak-Loop
 * Jailbreak 循环优化系统 — 主入口
 *
 * 多维度攻防技术库 + 自动化迭代评估引擎 + 便捷开关控制
 */

// ─── 类型导出 ──────────────────────────────────────────────────────────
export type {
  AttackCategory,
  AttackIntensity,
  AttackTechnique,
  DefenseType,
  DefenseStrategy,
  TestResult,
  EvaluationStats,
  LoopPhase,
  LoopConfig,
  LoopSnapshot,
  ToggleCategory,
  ToggleEntry,
  TogglePreset,
  JailbreakLoopConfig,
} from './types'

// ─── 攻击库 ────────────────────────────────────────────────────────────
export {
  roleplayAttacks,
} from './attacks/roleplay'

export {
  promptInjectAttacks,
} from './attacks/prompt-inject'

export {
  encodingAttacks,
} from './attacks/encoding'

export {
  templateAttacks,
} from './attacks/template'

export {
  prefillAttacks,
} from './attacks/prefill'

export {
  ALL_ATTACKS,
  getAttacksByCategory,
  getAttacksByIntensity,
  getAttacksByTag,
  renderAttackPrompt,
} from './attacks/index'

// ─── 防御库 ────────────────────────────────────────────────────────────
export {
  INPUT_FILTER_DEFENSES,
} from './defenses/input-filter'

export {
  IDENTITY_LOCK_DEFENSES,
} from './defenses/identity-lock'

export {
  CONTEXT_GUARD_DEFENSES,
} from './defenses/context-guard'

export {
  LAYERED_WALL_DEFENSES,
} from './defenses/layered-wall'

export {
  CANARY_DEFENSES,
} from './defenses/canary'

export {
  ALL_DEFENSES,
  getDefensesByType,
  getDefensesByStrength,
  getDefensesByCategory,
  renderDefensePrompt,
  composeDefenseWall,
} from './defenses/index'

// ─── 评估框架 ──────────────────────────────────────────────────────────
export {
  analyzeResponse,
  detectAlignmentSignals,
  calculateBypassConfidence,
  categorizeResponse,
  extractKeyPhrases,
} from './evaluator/analyzer'

export {
  computeStats,
  computeCategoryBreakdown,
  computeDefenseBreakdown,
  rankStrategies,
  generateReport,
} from './evaluator/stats'

// ─── 循环引擎 ──────────────────────────────────────────────────────────
export { JailbreakLoopEngine } from './loop/engine'

// ─── 开关注册表 ────────────────────────────────────────────────────────
export {
  DEFAULT_TOGGLES,
  TOGGLE_PRESETS,
  ToggleRegistry,
} from './toggles/registry'

// ─── 模板系统 ──────────────────────────────────────────────────────────
export {
  composeAttackPrompt,
  composeDefensePrompt,
  composeFullPrompt,
  QUICK_PRESETS,
} from './templates/compose'
