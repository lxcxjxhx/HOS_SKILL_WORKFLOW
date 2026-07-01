/**
 * HOS-Sec-Engine - SKILL.md Generator
 *
 * Converts AttackDefenseSkill objects to agentskills.io standard SKILL.md format.
 *
 * Usage:
 *   npx ts-node src/scripts/generate-skills-md.ts
 *   # or after build:
 *   node dist/scripts/generate-skills-md.js
 *
 * Output:
 *   skills/{id}/SKILL.md (flat, for npx skills CLI installation)
 *   skills/references/REFERENCE.md
 *
 * Source of Truth: TypeScript skill definitions in src/skills/
 */

import * as fs from 'fs';
import * as path from 'path';
import { HosSecEngine } from '../core/engine';
import { AttackDefenseSkill } from '../types/skill';
import { allSkills } from '../skills';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Output directory for generated SKILL.md files (project root skills/) */
// __dirname = dist/src/scripts/, so go up 3 levels to project root, then into skills/
const OUTPUT_DIR = path.resolve(__dirname, '..', '..', '..', 'skills');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert skill id or name to a kebab-case slug suitable for agentskills.io name field.
 * Lowercase, hyphens only, max 64 chars.
 */
function toSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

/**
 * Escape a string for safe inclusion in YAML frontmatter.
 * Handles special characters, quotes, and multi-line content.
 * Reference: yaml.org/spec/1.2/spec.html#id2760844
 */
function yamlEscape(value: string): string {
  if (value.length === 0) return '""';
  // Multi-line → literal block scalar
  if (value.includes('\n')) {
    return `|\n${value.split('\n').map(l => `  ${l}`).join('\n')}`;
  }
  // Quotes, colons, hashes, leading/trailing whitespace, special chars → double-quoted
  if (/["':#\[\]{}!@&*?\\|>%~`]/.test(value) || /^[-\s]/.test(value) || /[\s]$/.test(value)) {
    return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
  }
  return value;
}

/**
 * Generate YAML frontmatter block following agentskills.io specification.
 */
function generateFrontmatter(skill: AttackDefenseSkill): string {
  const { metadata } = skill;
  const name = toSlug(metadata.id);
  const description = generateDescription(skill);
  const tags = metadata.tags.map(t => `  - ${t}`).join('\n');
  const author = metadata.author || 'HOS-Sec-Engine';
  const version = metadata.updatedAt || '2026-06';

  return `---
name: ${name}
description: ${yamlEscape(description)}
license: MIT
metadata:
  author: ${yamlEscape(author)}
  version: ${yamlEscape(version)}
  tags:
${tags}
  category: ${metadata.category}
  risk-level: ${metadata.riskLevel}
  confidence: ${metadata.confidence}
---`;
}

/**
 * Generate a concise description from trigger scenarios (max 1024 chars).
 * Combines "what it does" + "when to use".
 */
function generateDescription(skill: AttackDefenseSkill): string {
  const parts: string[] = [];

  // What it does - from knowledge description (first sentence or first 200 chars)
  const desc = skill.knowledge.description;
  const firstSentence = desc.split(/[.。]/)[0]?.trim();
  if (firstSentence) {
    parts.push(firstSentence);
  }

  // When to use - from trigger scenarios
  if (skill.trigger.scenarios.length > 0) {
    const scenarios = skill.trigger.scenarios.slice(0, 3).join('; ');
    parts.push(`适用于: ${scenarios}`);
  }

  const full = parts.join(' ');
  return full.length > 1024 ? full.slice(0, 1021) + '...' : full;
}

/**
 * Generate "何时使用" (When to Use) section from trigger data.
 */
function generateWhenToUse(skill: AttackDefenseSkill): string {
  const lines: string[] = ['## 何时使用', ''];

  if (skill.trigger.scenarios.length > 0) {
    lines.push('### 触发场景', '');
    for (const s of skill.trigger.scenarios) {
      lines.push(`- ${s}`);
    }
    lines.push('');
  }

  if (skill.trigger.keywords.length > 0) {
    lines.push('### 关键词', '');
    lines.push(skill.trigger.keywords.map(k => `\`${k}\``).join(', '));
    lines.push('');
  }

  if (skill.trigger.indicators.length > 0) {
    lines.push('### 识别指标', '');
    for (const ind of skill.trigger.indicators) {
      lines.push(`- ${ind}`);
    }
    lines.push('');
  }

  if (skill.trigger.aliases.length > 0) {
    lines.push('### 别名', '');
    lines.push(skill.trigger.aliases.map(a => `\`${a}\``).join(', '));
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Generate "操作检查清单" (Action Checklist) section.
 */
function generateChecklist(skill: AttackDefenseSkill): string {
  if (skill.action.checklist.length === 0) {
    return '';
  }

  const lines: string[] = ['## 操作检查清单', ''];
  for (let i = 0; i < skill.action.checklist.length; i++) {
    lines.push(`${i + 1}. ${skill.action.checklist[i]}`);
  }
  lines.push('');
  return lines.join('\n');
}

/**
 * Generate "技术手段" (Techniques) section.
 */
function generateTechniques(skill: AttackDefenseSkill): string {
  if (skill.action.techniques.length === 0) {
    return '';
  }

  const lines: string[] = ['## 技术手段', ''];
  for (const t of skill.action.techniques) {
    lines.push(`- ${t}`);
  }
  lines.push('');
  return lines.join('\n');
}

/**
 * Generate "实战经验" (Field Experience) section with symptoms, root causes,
 * observations, and common mistakes.
 */
function generateFieldExperience(skill: AttackDefenseSkill): string {
  const sections: string[] = ['## 实战经验', ''];

  // Symptoms
  if (skill.knowledge.symptoms.length > 0) {
    sections.push('### 症状', '');
    for (const s of skill.knowledge.symptoms) {
      sections.push(`- ${s}`);
    }
    sections.push('');
  }

  // Root Causes
  if (skill.knowledge.rootCauses.length > 0) {
    sections.push('### 根因分析', '');
    for (const r of skill.knowledge.rootCauses) {
      sections.push(`- ${r}`);
    }
    sections.push('');
  }

  // Observations
  if (skill.knowledge.observations.length > 0) {
    sections.push('### 实战观察', '');
    for (const o of skill.knowledge.observations) {
      sections.push(`- ${o}`);
    }
    sections.push('');
  }

  // Common Mistakes
  if (skill.knowledge.commonMistakes.length > 0) {
    sections.push('### 常见错误', '');
    for (const m of skill.knowledge.commonMistakes) {
      sections.push(`- ${m}`);
    }
    sections.push('');
  }

  // Notes
  if (skill.knowledge.notes.length > 0) {
    sections.push('### 补充说明', '');
    for (const n of skill.knowledge.notes) {
      sections.push(`- ${n}`);
    }
    sections.push('');
  }

  return sections.join('\n');
}

/**
 * Generate "示例" (Examples) section with code blocks.
 */
function generateExamples(skill: AttackDefenseSkill): string {
  if (skill.action.examples.length === 0) {
    return '';
  }

  const lines: string[] = ['## 示例', ''];

  for (const ex of skill.action.examples) {
    lines.push(`### ${ex.name}`, '');
    if (ex.description) {
      lines.push(`${ex.description}`, '');
    }
    lines.push('```', ex.content, '```', '');
    if (ex.applicableScenarios && ex.applicableScenarios.length > 0) {
      lines.push('**适用场景:**');
      for (const s of ex.applicableScenarios) {
        lines.push(`- ${s}`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

/**
 * Generate "验证标准" (Validation) section.
 */
function generateValidation(skill: AttackDefenseSkill): string {
  const sections: string[] = ['## 验证标准', ''];

  if (skill.validation.indicators.length > 0) {
    sections.push('### 验证指标', '');
    for (const ind of skill.validation.indicators) {
      sections.push(`- ${ind}`);
    }
    sections.push('');
  }

  if (skill.validation.successSigns.length > 0) {
    sections.push('### 成功标志', '');
    for (const s of skill.validation.successSigns) {
      sections.push(`- ${s}`);
    }
    sections.push('');
  }

  if (skill.validation.falsePositiveSigns.length > 0) {
    sections.push('### 误报标志', '');
    for (const f of skill.validation.falsePositiveSigns) {
      sections.push(`- ${f}`);
    }
    sections.push('');
  }

  return sections.join('\n');
}

/**
 * Generate "防御建议" (Defense) section.
 */
function generateDefense(skill: AttackDefenseSkill): string {
  const sections: string[] = ['## 防御建议', ''];

  if (skill.defense.recommendations.length > 0) {
    sections.push('### 推荐做法', '');
    for (const r of skill.defense.recommendations) {
      sections.push(`- ${r}`);
    }
    sections.push('');
  }

  if (skill.defense.mitigations.length > 0) {
    sections.push('### 缓解措施', '');
    for (const m of skill.defense.mitigations) {
      sections.push(`- ${m}`);
    }
    sections.push('');
  }

  return sections.join('\n');
}

/**
 * Generate "参考链接" (References) section.
 */
function generateReferences(skill: AttackDefenseSkill): string {
  if (skill.defense.references.length === 0) {
    return '';
  }

  const lines: string[] = ['## 参考链接', ''];
  for (const ref of skill.defense.references) {
    lines.push(`- ${ref}`);
  }
  lines.push('');
  return lines.join('\n');
}

/**
 * Assemble the complete SKILL.md content for a single skill.
 */
function generateSkillMd(skill: AttackDefenseSkill): string {
  const sections = [
    generateFrontmatter(skill),
    '',
    `# ${skill.metadata.name}`,
    '',
    skill.knowledge.description,
    '',
    generateWhenToUse(skill),
    generateChecklist(skill),
    generateTechniques(skill),
    generateFieldExperience(skill),
    generateExamples(skill),
    generateValidation(skill),
    generateDefense(skill),
    generateReferences(skill),
  ];

  return sections.filter(Boolean).join('\n');
}

/**
 * Generate a consolidated REFERENCE.md with full technical details for all skills.
 */
function generateReferenceMd(skills: AttackDefenseSkill[]): string {
  const lines: string[] = [
    '# HOS-Sec-Engine Skill References',
    '',
    '> Complete technical reference for all loaded skills.',
    '>',
    `> Generated on ${new Date().toISOString().split('T')[0]}`,
    `> Total skills: ${skills.length}`,
    '',
    '## Table of Contents',
    '',
  ];

  // Group by category
  const byCategory = new Map<string, AttackDefenseSkill[]>();
  for (const skill of skills) {
    const cat = skill.metadata.category;
    if (!byCategory.has(cat)) {
      byCategory.set(cat, []);
    }
    byCategory.get(cat)!.push(skill);
  }

  // TOC
  for (const [category, catSkills] of byCategory) {
    const catSlug = toSlug(category);
    lines.push(`- [${category}](#${catSlug})`);
    for (const skill of catSkills) {
      const skillSlug = toSlug(skill.metadata.id);
      lines.push(`  - [${skill.metadata.name}](#${skillSlug})`);
    }
  }

  lines.push('');

  // Details per category
  for (const [category, catSkills] of byCategory) {
    if (lines.length > 2) lines.push(`---`, '');
    lines.push(`## ${category}`, '');
    lines.push(`**Skills:** ${catSkills.length}`, '');

    for (const skill of catSkills) {
      lines.push(`### ${skill.metadata.name}`, '');
      lines.push(`| Property | Value |`);
      lines.push(`|----------|-------|`);
      lines.push(`| ID | \`${skill.metadata.id}\` |`);
      lines.push(`| Category | ${skill.metadata.category} |`);
      lines.push(`| Sub-Category | ${skill.metadata.subCategory} |`);
      lines.push(`| Risk Level | ${skill.metadata.riskLevel} |`);
      lines.push(`| Confidence | ${skill.metadata.confidence} |`);
      lines.push(`| Author | ${skill.metadata.author || 'N/A'} |`);
      lines.push(`| Updated | ${skill.metadata.updatedAt} |`);
      lines.push(`| Tags | ${skill.metadata.tags.join(', ')} |`);
      lines.push('');

      // Triggers
      lines.push('**Triggers:**', '');
      for (const s of skill.trigger.scenarios) {
        lines.push(`- ${s}`);
      }
      lines.push('');

      // Techniques
      if (skill.action.techniques.length > 0) {
        lines.push('**Techniques:**', '');
        for (const t of skill.action.techniques) {
          lines.push(`- ${t}`);
        }
        lines.push('');
      }

      // Root Causes
      if (skill.knowledge.rootCauses.length > 0) {
        lines.push('**Root Causes:**', '');
        for (const r of skill.knowledge.rootCauses) {
          lines.push(`- ${r}`);
        }
        lines.push('');
      }

      // Quality
      if (skill.quality) {
        lines.push('**Quality:**', '');
        lines.push(`- Reviewed: ${skill.quality.reviewed ? 'Yes' : 'No'}`);
        lines.push(`- Tested: ${skill.quality.tested ? 'Yes' : 'No'}`);
        lines.push(`- Last Verified: ${skill.quality.lastVerified}`);
        lines.push('');
      }

      lines.push('---', '');
    }
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main Entry
// ---------------------------------------------------------------------------

/**
 * Ensure directory exists recursively.
 */
function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Write content to file, creating parent directories as needed.
 */
function writeOutput(filePath: string, content: string): void {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * Main generator function.
 *
 * @param engine HosSecEngine instance with skills loaded (or undefined to use allSkills directly)
 * @returns Array of generated file paths
 */
export function generateSkillsMdFiles(
  engine?: HosSecEngine,
): string[] {
  // If no engine provided, use allSkills directly from the index chain
  // This bypasses SkillLoader and avoids issues with missing skill files
  const skills = engine
    ? engine.getSkills().filter(s => s.enabled !== false)
    : allSkills.filter(s => s.enabled !== false);

  const flatDir = OUTPUT_DIR;

  if (skills.length === 0) {
    console.warn('No skills loaded. Nothing to generate.');
    return [];
  }

  const generated: string[] = [];

  console.log(`Generating SKILL.md files for ${skills.length} skill(s)...`);

  for (const skill of skills) {
    const id = skill.metadata.id;
    const content = generateSkillMd(skill);

    // Generate flat structure for npx skills CLI (skills/{id}/SKILL.md)
    const flatDirForSkill = path.join(flatDir, id);
    const flatSkillMdPath = path.join(flatDirForSkill, 'SKILL.md');
    writeOutput(flatSkillMdPath, content);
    generated.push(flatSkillMdPath);
    console.log(`  [FLAT]   ${flatSkillMdPath}`);
  }

  // Generate consolidated reference
  const refContent = generateReferenceMd(skills);
  const flatRefDir = path.join(flatDir, 'references');
  const flatRefPath = path.join(flatRefDir, 'REFERENCE.md');
  writeOutput(flatRefPath, refContent);
  generated.push(flatRefPath);
  console.log(`  [REF]    ${flatRefPath}`);

  console.log(`\nDone. Generated ${generated.length} file(s) in ${flatDir}`);
  return generated;
}

// ---------------------------------------------------------------------------
// CLI Entry Point
// ---------------------------------------------------------------------------

if (require.main === module) {
  try {
    generateSkillsMdFiles();
  } catch (error) {
    console.error('SKILL.md generation failed:', error);
    process.exit(1);
  }
}
