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
 *   dist/skills/{category}/{id}/SKILL.md (nested, for TypeScript Engine)
 *   skills/{id}/SKILL.md (flat, for npx skills CLI installation)
 *   dist/skills/references/REFERENCE.md
 *   skills/references/REFERENCE.md
 */

import * as fs from 'fs';
import * as path from 'path';
import { HosSecEngine } from '../core/engine';
import { AttackDefenseSkill } from '../types/skill';
import { allSkills } from '../skills';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Nested output directory for TypeScript Engine (dist/skills/) */
const DEFAULT_OUTPUT_DIR = path.resolve(__dirname, '..', '..', '..', 'dist', 'skills');

/** Flat output directory for npx skills CLI (00-HOS-Sec-Engine/skills/) */
// __dirname = dist/src/scripts/, so go up 3 levels to 00-hos-sec-engine/, then into skills/
const FLAT_OUTPUT_DIR = path.resolve(__dirname, '..', '..', '..', 'skills');

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
 */
function yamlEscape(value: string): string {
  if (value.includes('\n') || value.includes('"') || value.includes("'") || value.includes(':') || value.includes('#')) {
    return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
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
  const firstSentence = desc.split(/[.。]/)[0].trim();
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
    lines.push(`---`, '');
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
 * Copy directory recursively (files only, no sub-directory nesting beyond one level).
 */
function copyDirRecursive(srcDir: string, destDir: string): void {
  if (!fs.existsSync(srcDir)) return;
  ensureDir(destDir);

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Main generator function.
 * 
 * @param engine HosSecEngine instance with skills loaded (or undefined to use allSkills directly)
 * @param outputDir Base output directory (defaults to dist/skills)
 * @returns Array of generated file paths
 */
export function generateSkillsMdFiles(
  engine?: HosSecEngine,
  outputDir?: string
): string[] {
  // If no engine provided, use allSkills directly from the index chain
  // This bypasses SkillLoader and avoids issues with missing skill files
  const skills = engine
    ? engine.getSkills().filter(s => s.enabled !== false)
    : allSkills.filter(s => s.enabled !== false);

  const nestedDir = outputDir ?? DEFAULT_OUTPUT_DIR;
  const flatDir = FLAT_OUTPUT_DIR;

  if (skills.length === 0) {
    console.warn('No skills loaded. Nothing to generate.');
    return [];
  }

  const generated: string[] = [];

  console.log(`Generating SKILL.md files for ${skills.length} skill(s)...`);

  for (const skill of skills) {
    const id = skill.metadata.id;
    const content = generateSkillMd(skill);
    
    // 1. Generate nested structure for TypeScript Engine (dist/skills/{category}/{id}/SKILL.md)
    const nestedDirForSkill = path.join(nestedDir, skill.metadata.category, id);
    const nestedSkillMdPath = path.join(nestedDirForSkill, 'SKILL.md');
    writeOutput(nestedSkillMdPath, content);
    generated.push(nestedSkillMdPath);
    console.log(`  [NESTED] ${nestedSkillMdPath}`);
    
    // 2. Generate flat structure for npx skills CLI (skills/{id}/SKILL.md)
    const flatDirForSkill = path.join(flatDir, id);
    const flatSkillMdPath = path.join(flatDirForSkill, 'SKILL.md');
    writeOutput(flatSkillMdPath, content);
    generated.push(flatSkillMdPath);
    console.log(`  [FLAT]   ${flatSkillMdPath}`);
  }

  // Generate consolidated reference for both structures
  const refContent = generateReferenceMd(skills);
  
  // Nested reference
  const nestedRefDir = path.join(nestedDir, 'references');
  const nestedRefPath = path.join(nestedRefDir, 'REFERENCE.md');
  writeOutput(nestedRefPath, refContent);
  generated.push(nestedRefPath);
  console.log(`  [NESTED] ${nestedRefPath}`);
  
  // Flat reference
  const flatRefDir = path.join(flatDir, 'references');
  const flatRefPath = path.join(flatRefDir, 'REFERENCE.md');
  writeOutput(flatRefPath, refContent);
  generated.push(flatRefPath);
  console.log(`  [FLAT]   ${flatRefPath}`);

  // Copy the hos-sec-master skill (unified entry point)
  // When running from dist/src/scripts/, go up 3 levels to project root, then src/skills/
  const projectRoot = path.resolve(__dirname, '..', '..', '..');
  const repoRoot = path.resolve(projectRoot, '..');  // HOS-SEC-SKILL/ (repo root for npx skills add)
  const masterSkillPath = path.join(projectRoot, 'src', 'skills', 'hos-sec-master', 'SKILL.md');
  if (fs.existsSync(masterSkillPath)) {
    const nestedMasterDir = path.join(nestedDir, 'master', 'hos-sec-master');
    const nestedMasterPath = path.join(nestedMasterDir, 'SKILL.md');
    writeOutput(nestedMasterPath, fs.readFileSync(masterSkillPath, 'utf-8'));
    generated.push(nestedMasterPath);
    console.log(`  [MASTER] ${nestedMasterPath}`);

    const flatMasterDir = path.join(flatDir, 'hos-sec-master');
    const flatMasterPath = path.join(flatMasterDir, 'SKILL.md');
    writeOutput(flatMasterPath, fs.readFileSync(masterSkillPath, 'utf-8'));
    generated.push(flatMasterPath);
    console.log(`  [MASTER] ${flatMasterPath}`);

    // Sync 0day-skills directory
    const master0daySrc = path.join(projectRoot, 'src', 'skills', 'hos-sec-master', '0day-skills');
    if (fs.existsSync(master0daySrc)) {
      // Copy nested 0day-skills
      const nested0dayDest = path.join(nestedDir, 'master', 'hos-sec-master', '0day-skills');
      copyDirRecursive(master0daySrc, nested0dayDest);
      generated.push(nested0dayDest);
      console.log(`  [MASTER-0DAY] ${nested0dayDest}`);

      // Copy flat 0day-skills
      const flat0dayDest = path.join(flatDir, 'hos-sec-master', '0day-skills');
      copyDirRecursive(master0daySrc, flat0dayDest);
      generated.push(flat0dayDest);
      console.log(`  [MASTER-0DAY] ${flat0dayDest}`);

      // Copy to repo root
      const repo0dayDest = path.join(repoRoot, 'skills', 'hos-sec-master', '0day-skills');
      copyDirRecursive(master0daySrc, repo0dayDest);
      generated.push(repo0dayDest);
      console.log(`  [MASTER-0DAY-ROOT] ${repo0dayDest}`);
    }
  } else {
    console.warn(`  [WARN] Master skill not found at ${masterSkillPath}`);
  }

  // Sync all flat skills + master to repo root skills/ directory
  // This is CRITICAL: npx skills add looks for skills/ at the REPO ROOT, not in a subdirectory
  const repoRootSkillsDir = path.join(repoRoot, 'skills');
  for (const skill of skills) {
    const srcFlatPath = path.join(flatDir, skill.metadata.id, 'SKILL.md');
    if (fs.existsSync(srcFlatPath)) {
      const destDir = path.join(repoRootSkillsDir, skill.metadata.id);
      const destPath = path.join(destDir, 'SKILL.md');
      writeOutput(destPath, fs.readFileSync(srcFlatPath, 'utf-8'));
      generated.push(destPath);
    }
  }
  // Also sync master skill to repo root
  if (fs.existsSync(masterSkillPath)) {
    const repoMasterDir = path.join(repoRootSkillsDir, 'hos-sec-master');
    const repoMasterPath = path.join(repoMasterDir, 'SKILL.md');
    writeOutput(repoMasterPath, fs.readFileSync(masterSkillPath, 'utf-8'));
    generated.push(repoMasterPath);
    console.log(`  [ROOT]   ${repoMasterPath}`);
  }
  // Also sync references to repo root
  const srcRefPath = path.join(flatDir, 'references', 'REFERENCE.md');
  if (fs.existsSync(srcRefPath)) {
    const destRefDir = path.join(repoRootSkillsDir, 'references');
    const destRefPath = path.join(destRefDir, 'REFERENCE.md');
    writeOutput(destRefPath, fs.readFileSync(srcRefPath, 'utf-8'));
    generated.push(destRefPath);
    console.log(`  [ROOT]   ${destRefPath}`);
  }

  console.log(`\nDone. Generated ${generated.length} file(s) in ${nestedDir} and ${flatDir}`);
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
