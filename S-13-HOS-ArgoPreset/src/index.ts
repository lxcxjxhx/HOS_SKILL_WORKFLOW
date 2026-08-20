/**
 * HOS-SW-002: ARGO × 天琴座 创意写作预设系统
 * 统一导出入口
 *
 * 基于「夏瑾 天琴座 Beta 2.8」与「ARGO 1.3」的 TypeScript 结构化创意写作预设系统。
 * 提供 13 种写作风格、5 级 NSFW 控制、5 级思考链、5 种情节推进模式、6 种视角控制，
 * 以及 ARGO 五层智能体链式推理。
 */

// ─── 类型 ──────────────────────────────────────────────────────────────
export type {
  STPrompt,
  STReturn,
  WritingStyle,
  WritingStyleSlug,
  NsfwConfig,
  NsfwLevel,
  PlotConfig,
  PlotMode,
  ReasoningConfig,
  ReasoningLevel,
  PerspectiveConfig,
  Perspective,
  AgentStep,
  AgentLayer,
  ArgoAgent,
  JailbreakConfig,
  RegexScript,
  ComposerConfig,
  CompiledRegex,
} from './types';

// ─── 预设数据 ──────────────────────────────────────────────────────────
export { HARUKI_PRESET, buildVariableInits } from './preset';

// ─── 写作风格 ──────────────────────────────────────────────────────────
export { WRITING_STYLES, getStyleContent } from './styles/writing-styles';
export {
  STYLE_PRESETS,
  PRESET_CASUAL,
  PRESET_IMMERSIVE,
  PRESET_WUXIA,
  PRESET_GULONG,
  PRESET_NSFW,
  PRESET_NSFW_INTENSIVE,
  PRESET_EXPLOSIVE,
} from './styles/style-presets';
export type { StylePresetName } from './styles/style-presets';

// ─── ARGO 智能体 ───────────────────────────────────────────────────────
export {
  ARGO_LAYERS,
  ARGO_RULES,
  buildArgoAgent,
  renderAgentLayer,
  renderArgoChain,
  ACTIVE_INFERENCE_LAYER,
  TOPOLOGICAL_QUANTUM_LAYER,
  LIQUID_NEURAL_LAYER,
  MOE_LAYER,
  NEURO_SYMBOLIC_LAYER,
  TENSION_RULES,
  MODULATION_STRATEGIES,
} from './agents/index';

// ─── 控制选项 ──────────────────────────────────────────────────────────
export { getNsfwConfig } from './controls/nsfw';
export { getPlotConfig } from './controls/plot';
export { getReasoningConfig } from './controls/reasoning';
export { getPerspectiveConfig } from './controls/perspective';
export {
  WORLD_BUILDING_PROMPT,
  WORLD_THINKING_PROMPT,
  EMOTION_GUARD,
  DIALOGUE_ENHANCE,
  SHORT_PARAGRAPHS,
  LONG_DIALOGUE,
  DIALOGUE_SEPARATION,
  FORBIDDEN_WORDS,
  BASE_STYLE_DETAILED,
  ANTI_SUBLIMATION,
  ANTI_ROBOT,
  ANTI_HORNY,
  ANTI_DOMINEERING,
  ANTI_OMNISCIENT,
  ANTI_DESPAIR,
} from './controls/worldbuilding';

// ─── 反滥用 ────────────────────────────────────────────────────────────
export {
  MAIN_FORBIDDEN_WORDS,
  HATED_ELEMENTS,
  ABUSE_METAPHORS,
  ABUSE_BODY_PARTS,
  renderForbiddenWords,
  renderAntiAbuseStrategy,
  renderHatedElements,
  WRITING_NORMS,
  ANTI_CLICHE_INJECT,
  LIVING_DIALOGUE_INJECT,
  UNIVERSAL_WRITING_NORMS,
  EMOTION_GUARD_BASIC,
  EMOTION_GUARD_STRONG,
  EMOTION_GUARD_ANTI_DOMINEERING,
  ANTI_SUBLIMATION as ANTI_SUBLIMATION_GUARD,
  ANTI_ROBOT as ANTI_ROBOT_GUARD,
} from './anti-abuse/index';

// ─── 破限系统 ──────────────────────────────────────────────────────────
export {
  JAILBREAK_PROMPT_DEFAULT,
  JAILBREAK_CORE,
  HARUKI_SELF_IDENTITY,
  PREFILL_PENETRATION,
  SYSTEM_PROMPT_INJECT,
  NARRATIVE_FRAME,
  PREFILL_JAILBREAK_NO_PREFILL,
  PREFILL_VIOLENT,
  TEST_OVERRIDE,
  R1_COT_SETTINGS,
  STRONG_SELF_ATTACK,
  NATIVE_MODE,
  R1_TOGGLE,
  DEFAULT_JAILBREAK,
  STRONG_JAILBREAK,
} from './jailbreak/index';

// ─── 正则脚本 ──────────────────────────────────────────────────────────
export {
  ALL_REGEX_SCRIPTS,
  FORMAT_CLEANUP_SCRIPTS,
  ARGO_BEAUTIFIER_SCRIPTS,
  ANTI_CLICHE_SCRIPTS,
  compileRegexScript,
  compileRegexScripts,
  applyRegexScripts,
} from './regex/index';

// ─── GBNF 文法 ─────────────────────────────────────────────────────────
export { ARGO_GBNF, renderHeader, renderEmptyHeader } from './grammar/gbnf';
export type { HeaderFields } from './grammar/gbnf';

// ─── 组合器 ────────────────────────────────────────────────────────────
export {
  composePromptChain,
  composeCasual,
  composeImmersive,
  composeWuxia,
} from './composer/prompt-chain';

// ─── 输出 ──────────────────────────────────────────────────────────────
export { renderToJson, renderPromptsSummary, validatePromptChain } from './output/render';
