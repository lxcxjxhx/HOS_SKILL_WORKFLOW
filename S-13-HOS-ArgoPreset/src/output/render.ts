/**
 * 输出渲染与格式化
 */

import type { STReturn } from '../types';

/**
 * 将 STReturn 渲染为 SillyTavern 可导入的 JSON 格式
 */
export function renderToJson(preset: STReturn): string {
  return JSON.stringify(preset, null, 4);
}

/**
 * 渲染 prompt 列表为可读文本（调试用）
 */
export function renderPromptsSummary(preset: STReturn): string {
  const lines: string[] = [
    `=== ${preset.prompts.length} Prompts ===`,
    '',
  ];

  for (let i = 0; i < preset.prompts.length; i++) {
    const p = preset.prompts[i];
    const enabled = p.enabled !== false ? '✅' : '❌';
    const system = p.system_prompt ? '[SYS]' : '';
    const role = `[${p.role}]`;
    const name = p.name;
    const contentPreview = p.content
      ? p.content.substring(0, 80).replace(/\n/g, '\\n') + (p.content.length > 80 ? '...' : '')
      : '(empty)';

    lines.push(`${enabled} ${system} ${role} ${name}`);
    lines.push(`   ${contentPreview}`);
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * 验证 prompt chain 的完整性
 */
export function validatePromptChain(preset: STReturn): string[] {
  const issues: string[] = [];

  if (preset.prompts.length === 0) {
    issues.push('No prompts defined');
  }

  const ids = new Set<string>();
  for (const p of preset.prompts) {
    if (ids.has(p.identifier)) {
      issues.push(`Duplicate identifier: ${p.identifier}`);
    }
    ids.add(p.identifier);
  }

  if (!preset.prompts.some(p => p.name.includes('字数'))) {
    issues.push('Missing word count control prompt');
  }

  if (!preset.prompts.some(p => p.name.includes('创作准则'))) {
    issues.push('Missing core writing rules prompt');
  }

  return issues;
}
