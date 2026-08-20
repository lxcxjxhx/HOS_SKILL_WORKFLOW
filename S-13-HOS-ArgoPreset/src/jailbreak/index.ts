/**
 * 破限系统 — 统一导出
 */

import type { JailbreakConfig } from '../types';
import {
  JAILBREAK_PROMPT_DEFAULT,
  JAILBREAK_CORE,
  HARUKI_SELF_IDENTITY,
  PREFILL_PENETRATION,
  SYSTEM_PROMPT_INJECT,
  NARRATIVE_FRAME,
} from './core-prompt';
import {
  PREFILL_JAILBREAK_NO_PREFILL,
  PREFILL_VIOLENT,
  TEST_OVERRIDE,
} from './prefill';
import {
  R1_COT_SETTINGS,
  STRONG_SELF_ATTACK,
  NATIVE_MODE,
  R1_TOGGLE,
} from './roleplay-frame';

export {
  JAILBREAK_PROMPT_DEFAULT,
  JAILBREAK_CORE,
  HARUKI_SELF_IDENTITY,
  PREFILL_PENETRATION,
  SYSTEM_PROMPT_INJECT,
  NARRATIVE_FRAME,
} from './core-prompt';

export {
  PREFILL_JAILBREAK_NO_PREFILL,
  PREFILL_VIOLENT,
  TEST_OVERRIDE,
} from './prefill';

export {
  R1_COT_SETTINGS,
  STRONG_SELF_ATTACK,
  NATIVE_MODE,
  R1_TOGGLE,
} from './roleplay-frame';

/** 默认破限配置 */
export const DEFAULT_JAILBREAK: JailbreakConfig = {
  corePrompt: JAILBREAK_CORE,
  jailbreakVariable: JAILBREAK_PROMPT_DEFAULT,
  roleplayFrame: NATIVE_MODE,
  prefill: PREFILL_PENETRATION,
  narrativeFrame: NARRATIVE_FRAME,
};

/** 强化版破限配置（组合三路并发） */
export const STRONG_JAILBREAK: JailbreakConfig = {
  corePrompt: JAILBREAK_CORE,
  jailbreakVariable: JAILBREAK_PROMPT_DEFAULT,
  roleplayFrame: STRONG_SELF_ATTACK,
  prefill: PREFILL_VIOLENT,
  narrativeFrame: NARRATIVE_FRAME,
};
