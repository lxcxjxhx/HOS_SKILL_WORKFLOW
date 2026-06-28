/**
 * HOS-Sec-Engine - skills-index.json Generator
 * 
 * Scans all SKILL.md files and generates a searchable index for the CLI installer.
 * 
 * Output:
 *   - skills-index.json (at project root, for npx skills add to read)
 *   - dist/skills-index.json (for distribution)
 */

import * as fs from 'fs';
import * as path from 'path';
import { allSkills } from '../skills';
import type { AttackDefenseSkill } from '../types/skill';
import { CATEGORY_NAMES, CATEGORY_DESCRIPTIONS } from '../config/skill-categories';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Project root: go up 3 levels from dist/src/scripts/ */
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

/** Output path for skills-index.json */
const OUTPUT_PATH = path.join(PROJECT_ROOT, 'skills-index.json');
const DIST_OUTPUT_PATH = path.join(PROJECT_ROOT, 'dist', 'skills-index.json');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract a short description from a skill.
 */
function extractDescription(skill: AttackDefenseSkill): string {
  const desc = skill.knowledge.description;
  const firstSentence = desc.split(/[.。]/)[0]?.trim();
  if (firstSentence && firstSentence.length <= 200) {
    return firstSentence;
  }
  return (firstSentence || '').slice(0, 200) + '...';
}

/**
 * Build the skills-index.json structure.
 */
function buildIndex(skills: AttackDefenseSkill[]): any {
  const skillEntries = skills.map(skill => ({
    id: skill.metadata.id,
    name: skill.metadata.name,
    category: skill.metadata.category,
    subCategory: skill.metadata.subCategory,
    tags: skill.metadata.tags,
    riskLevel: skill.metadata.riskLevel,
    confidence: skill.metadata.confidence,
    description: extractDescription(skill),
    updatedAt: skill.metadata.updatedAt,
    author: skill.metadata.author || 'HOS-Sec-Engine',
  }));

  // Auto-generate bundles by category
  const bundles: Record<string, any> = {};
  const byCategory = new Map<string, typeof skills>();

  for (const skill of skills) {
    const cat = skill.metadata.category;
    if (!byCategory.has(cat)) {
      byCategory.set(cat, []);
    }
    byCategory.get(cat)!.push(skill);
  }

  // Category name mapping for display (imported from shared config)

  for (const [category, catSkills] of byCategory) {
    const bundleKey = `${category}-bundle`;
    bundles[bundleKey] = {
      name: CATEGORY_NAMES[category] || category,
      description: CATEGORY_DESCRIPTIONS[category] || `${category} 相关 Skill`,
      skills: catSkills.map(s => s.metadata.id),
    };
  }

  // Also add "all" bundle
  bundles['all-bundle'] = {
    name: '全部 Skill',
    description: `所有 ${skills.length} 个攻防实战 Skill`,
    skills: skills.map(s => s.metadata.id),
  };

  return {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    totalSkills: skills.length,
    skills: skillEntries,
    bundles,
  };
}

// ---------------------------------------------------------------------------
// Main Entry
// ---------------------------------------------------------------------------

/**
 * Generate skills-index.json files.
 */
export function generateSkillsIndex(skills?: AttackDefenseSkill[]): string {
  const targetSkills = skills || allSkills.filter(s => s.enabled !== false);

  if (targetSkills.length === 0) {
    console.warn('No skills available. Cannot generate index.');
    return '';
  }

  const index = buildIndex(targetSkills);
  const content = JSON.stringify(index, null, 2);

  // Write to project root
  fs.writeFileSync(OUTPUT_PATH, content, 'utf-8');
  console.log(`Generated: ${OUTPUT_PATH}`);

  // Write to dist/
  try {
    fs.mkdirSync(path.dirname(DIST_OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(DIST_OUTPUT_PATH, content, 'utf-8');
    console.log(`Generated: ${DIST_OUTPUT_PATH}`);
  } catch {
    // dist/ may not exist yet if running before tsc
  }

  return OUTPUT_PATH;
}

// ---------------------------------------------------------------------------
// CLI Entry Point
// ---------------------------------------------------------------------------

if (require.main === module) {
  try {
    generateSkillsIndex();
    console.log(`Done. skills-index.json generated for ${allSkills.filter(s => s.enabled !== false).length} skill(s).`);
  } catch (error) {
    console.error('skills-index.json generation failed:', error);
    process.exit(1);
  }
}
