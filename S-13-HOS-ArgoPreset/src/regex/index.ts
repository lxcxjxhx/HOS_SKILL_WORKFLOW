/**
 * 正则脚本 — 统一导出与编译器
 */

import type { RegexScript, CompiledRegex } from '../types';
import { FORMAT_CLEANUP_SCRIPTS } from './format-cleanup';
import { ARGO_BEAUTIFIER_SCRIPTS } from './beautifiers';
import { ANTI_CLICHE_SCRIPTS } from './anti-cliche-regex';

export { FORMAT_CLEANUP_SCRIPTS } from './format-cleanup';
export { ARGO_BEAUTIFIER_SCRIPTS } from './beautifiers';
export { ANTI_CLICHE_SCRIPTS } from './anti-cliche-regex';

/** 所有正则脚本 */
export const ALL_REGEX_SCRIPTS: RegexScript[] = [
  ...FORMAT_CLEANUP_SCRIPTS,
  ...ARGO_BEAUTIFIER_SCRIPTS,
  ...ANTI_CLICHE_SCRIPTS,
];

/**
 * 编译正则脚本为可执行的 RegExp 对象
 */
export function compileRegexScript(script: RegexScript): CompiledRegex | null {
  if (script.disabled) return null;

  try {
    // 处理带 delimiters 的正则字符串："/pattern/flags"
    let pattern = script.findRegex;
    let flags = '';

    const slashMatch = pattern.match(/^\/(.+)\/([gimsuy]*)$/);
    if (slashMatch) {
      pattern = slashMatch[1];
      flags = slashMatch[2];
    }

    // 处理 JSON 编码的正则："/pattern/flags"
    if (pattern.startsWith('"') && pattern.endsWith('"')) {
      const inner = JSON.parse(pattern) as string;
      const innerMatch = inner.match(/^\/(.+)\/([gimsuy]*)$/);
      if (innerMatch) {
        pattern = innerMatch[1];
        flags = innerMatch[2];
      } else {
        pattern = inner;
      }
    }

    const regex = new RegExp(pattern, flags);
    return {
      name: script.name,
      regex,
      replaceString: script.replaceString,
      placement: script.placement,
    };
  } catch {
    return null;
  }
}

/**
 * 批量编译正则脚本
 */
export function compileRegexScripts(scripts: RegexScript[]): CompiledRegex[] {
  return scripts
    .map(compileRegexScript)
    .filter((c): c is CompiledRegex => c !== null);
}

/**
 * 对文本应用编译后的正则脚本
 */
export function applyRegexScripts(
  text: string,
  compiled: CompiledRegex[],
  side: 'user' | 'assistant' | 'both' = 'both',
  isEdit = false,
): string {
  let result = text;
  for (const script of compiled) {
    // placement: [1] = user, [2] = assistant
    const appliesToUser = script.placement.includes(1);
    const appliesToAssistant = script.placement.includes(2);

    if (side === 'user' && !appliesToUser) continue;
    if (side === 'assistant' && !appliesToAssistant) continue;

    // 重置 lastIndex（global regex）
    script.regex.lastIndex = 0;
    result = result.replace(script.regex, script.replaceString);
  }
  return result;
}
