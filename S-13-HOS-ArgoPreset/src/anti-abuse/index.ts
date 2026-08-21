/**
 * 反滥用系统 — 统一导出
 */

export {
  MAIN_FORBIDDEN_WORDS,
  HATED_ELEMENTS,
  ABUSE_METAPHORS,
  ABUSE_BODY_PARTS,
  renderForbiddenWords,
  renderAntiAbuseStrategy,
  renderHatedElements,
} from './forbidden-words';

export {
  WRITING_NORMS,
  ANTI_CLICHE_INJECT,
  LIVING_DIALOGUE_INJECT,
  UNIVERSAL_WRITING_NORMS,
} from './anti-cliche';

export {
  EMOTION_GUARD_BASIC,
  EMOTION_GUARD_STRONG,
  EMOTION_GUARD_ANTI_DOMINEERING,
  ANTI_SUBLIMATION,
  ANTI_ROBOT,
} from './emotion-guard';
