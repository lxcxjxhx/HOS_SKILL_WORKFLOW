/**
 * HOS-SW-002: ARGO × 天琴座 创意写作预设系统
 * 核心类型定义
 */

// ─── SillyTavern Prompt 结构 ────────────────────────────────────────────

export interface STPrompt {
  name: string;
  system_prompt: boolean;
  role: 'user' | 'assistant' | 'system';
  content: string;
  identifier: string;
  injection_position: number;
  injection_depth: number;
  forbid_overrides: boolean;
  injection_order?: number;
  injection_trigger?: string[];
  marker?: boolean;
  enabled?: boolean;
  attach_index?: number;
  attach_role?: 'user' | 'assistant';
  attach_side?: 'start' | 'end';
}

export interface STReturn {
  temperature: number;
  frequency_penalty: number;
  presence_penalty: number;
  top_p: number;
  top_k: number;
  top_a: number;
  min_p: number;
  repetition_penalty: number;
  max_context_unlocked: boolean;
  openai_max_context: number;
  openai_max_tokens: number;
  names_behavior: number;
  stream_openai: boolean;
  prompts: STPrompt[];
  reasoning_effort?: string;
}

// ─── 写作风格 ──────────────────────────────────────────────────────────

export type WritingStyleSlug =
  | 'gulong'
  | 'wuxia'
  | 'lightnovel'
  | 'lightnovel-humorous'
  | 'lightnovel-moe'
  | 'fantasy'
  | 'nsfw'
  | 'immersive'
  | 'freewriting'
  | 'male'
  | 'female'
  | 'western'
  | 'custom';

export interface WritingStyle {
  slug: WritingStyleSlug;
  name: string;
  reference: string;
  content: string;
}

// ─── NSFW 级别 ─────────────────────────────────────────────────────────

export type NsfwLevel = 'off' | 'gentle' | 'standard' | 'intensive' | 'throttle';

export interface NsfwConfig {
  level: NsfwLevel;
  /** NSFW 描写 prompt 内容 */
  descriptionPrompt: string;
  /** NSFW 强度控制 prompt */
  intensityPrompt: string;
  /** 进程限速器 */
  throttlePrompt: string;
}

// ─── 情节推进 ──────────────────────────────────────────────────────────

export type PlotMode = 'conservative' | 'moderate' | 'adventurous' | 'special-adventure' | 'explosive';

export interface PlotConfig {
  mode: PlotMode;
  content: string;
}

// ─── 思考链 ────────────────────────────────────────────────────────────

export type ReasoningLevel = 'none' | 'light' | 'moderate' | 'heavy' | 'pseudo-dialogue';

export interface ReasoningConfig {
  level: ReasoningLevel;
  content: string;
  /** 思考链包裹标签 */
  tag: string;
}

// ─── 视角控制 ──────────────────────────────────────────────────────────

export type Perspective = 'first' | 'second' | 'third' | 'no-voice-user' | 'free-voice' | 'focus-ai';

export interface PerspectiveConfig {
  perspective: Perspective;
  content: string;
}

// ─── ARGO 智能体 ───────────────────────────────────────────────────────

export interface AgentStep {
  name: string;
  prefix: string;
  content: string;
}

export interface AgentLayer {
  name: string;
  steps: AgentStep[];
  outputLabel: string;
}

export interface ArgoAgent {
  name: string;
  layers: AgentLayer[];
  rules: string[];
}

// ─── 破限配置 ──────────────────────────────────────────────────────────

export interface JailbreakConfig {
  /** 核心破限指令 */
  corePrompt: string;
  /** JailbreakPrompt 变量值 */
  jailbreakVariable: string;
  /** 角色扮演框架 */
  roleplayFrame: string;
  /** 预填充穿甲 */
  prefill: string;
  /** 叙事等价性框架（ARGO 核心） */
  narrativeFrame: string;
}

// ─── 正则脚本 ──────────────────────────────────────────────────────────

export interface RegexScript {
  name: string;
  findRegex: string;
  replaceString: string;
  placement: number[];
  disabled: boolean;
  markdownOnly: boolean;
  promptOnly: boolean;
  runOnEdit: boolean;
  substituteRegex: number;
  minDepth: number | null;
  maxDepth: number | null;
  trimStrings: string[];
}

// ─── 组合器配置 ────────────────────────────────────────────────────────

export interface ComposerConfig {
  style: WritingStyleSlug;
  plot: PlotMode;
  nsfw: NsfwLevel;
  cot: ReasoningLevel;
  perspective: Perspective;
  wordCount: number;
  /** 是否启用 ARGO 五层推理 */
  enableArgo: boolean;
  /** 是否启用破限 */
  enableJailbreak: boolean;
  /** 自定义风格内容（style='custom' 时使用） */
  customStyle?: string;
  /** 用户名 */
  userName?: string;
  /** 角色名 */
  charName?: string;
}

// ─── 编译后的正则 ──────────────────────────────────────────────────────

export interface CompiledRegex {
  name: string;
  regex: RegExp;
  replaceString: string;
  placement: number[];
}
