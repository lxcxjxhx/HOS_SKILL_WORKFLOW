/**
 * 快捷风格组合预设
 */

import type { ComposerConfig } from '../types';

/** 轻松日常组合 */
export const PRESET_CASUAL: Partial<ComposerConfig> = {
  style: 'lightnovel',
  plot: 'moderate',
  nsfw: 'off',
  cot: 'light',
  perspective: 'third',
  wordCount: 1500,
  enableArgo: false,
  enableJailbreak: false,
};

/** 沉浸叙事组合 */
export const PRESET_IMMERSIVE: Partial<ComposerConfig> = {
  style: 'immersive',
  plot: 'adventurous',
  nsfw: 'off',
  cot: 'moderate',
  perspective: 'first',
  wordCount: 2000,
  enableArgo: true,
  enableJailbreak: false,
};

/** 武侠组合 */
export const PRESET_WUXIA: Partial<ComposerConfig> = {
  style: 'wuxia',
  plot: 'adventurous',
  nsfw: 'off',
  cot: 'heavy',
  perspective: 'third',
  wordCount: 2500,
  enableArgo: true,
  enableJailbreak: false,
};

/** 古龙组合 */
export const PRESET_GULONG: Partial<ComposerConfig> = {
  style: 'gulong',
  plot: 'moderate',
  nsfw: 'off',
  cot: 'light',
  perspective: 'third',
  wordCount: 1500,
  enableArgo: false,
  enableJailbreak: false,
};

/** NSFW 标准组合 */
export const PRESET_NSFW: Partial<ComposerConfig> = {
  style: 'nsfw',
  plot: 'adventurous',
  nsfw: 'standard',
  cot: 'heavy',
  perspective: 'third',
  wordCount: 2000,
  enableArgo: true,
  enableJailbreak: true,
};

/** NSFW 强化组合 */
export const PRESET_NSFW_INTENSIVE: Partial<ComposerConfig> = {
  style: 'nsfw',
  plot: 'explosive',
  nsfw: 'intensive',
  cot: 'heavy',
  perspective: 'third',
  wordCount: 3000,
  enableArgo: true,
  enableJailbreak: true,
};

/** 爆炸式推进组合 */
export const PRESET_EXPLOSIVE: Partial<ComposerConfig> = {
  style: 'fantasy',
  plot: 'explosive',
  nsfw: 'off',
  cot: 'pseudo-dialogue',
  perspective: 'free-voice',
  wordCount: 2500,
  enableArgo: true,
  enableJailbreak: false,
};

export const STYLE_PRESETS = {
  casual: PRESET_CASUAL,
  immersive: PRESET_IMMERSIVE,
  wuxia: PRESET_WUXIA,
  gulong: PRESET_GULONG,
  nsfw: PRESET_NSFW,
  'nsfw-intensive': PRESET_NSFW_INTENSIVE,
  explosive: PRESET_EXPLOSIVE,
} as const;

export type StylePresetName = keyof typeof STYLE_PRESETS;
