/**
 * HOS-Sec-Engine - PLAYBOOK.md Generator
 *
 * Converts Playbook objects to standardized PLAYBOOK.md markdown format.
 *
 * Usage:
 *   npx ts-node src/scripts/generate-playbooks-md.ts
 *   # or after build:
 *   node dist/src/scripts/generate-playbooks-md.js
 *
 * Output:
 *   dist/playbooks/{category}/{playbook-id}/PLAYBOOK.md
 */

import * as fs from 'fs';
import * as path from 'path';
import { allPlaybooks } from '../playbooks';
import type { Playbook } from '../types/playbook';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Output directory for playbook markdown files */
const DEFAULT_OUTPUT_DIR = path.resolve(__dirname, '..', '..', '..', 'dist', 'playbooks');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
 * Generate YAML frontmatter for a playbook.
 */
function generateFrontmatter(playbook: Playbook): string {
  const { id, description, category, metadata } = playbook;
  const version = metadata.version;
  const difficulty = metadata.difficulty;
  const estimatedTime = metadata.estimatedTime || 'N/A';

  return `---
name: ${id}
description: ${yamlEscape(description)}
category: ${category}
version: ${version}
difficulty: ${difficulty}
estimatedTime: ${yamlEscape(estimatedTime)}
---`;
}

/**
 * Generate the metadata section.
 */
function generateMetadata(playbook: Playbook): string {
  const { metadata } = playbook;
  const lines: string[] = ['## 元数据', ''];
  const difficultyLabels: Record<string, string> = {
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级'
  };
  lines.push(`- **难度**: ${difficultyLabels[metadata.difficulty] || metadata.difficulty}`);
  lines.push(`- **预估时间**: ${metadata.estimatedTime || 'N/A'}`);

  if (metadata.prerequisites && metadata.prerequisites.length > 0) {
    lines.push(`- **前置条件**:`);
    for (const p of metadata.prerequisites) {
      lines.push(`  - ${p}`);
    }
  } else {
    lines.push(`- **前置条件**: 无`);
  }

  if (metadata.targetEnvironment && metadata.targetEnvironment.length > 0) {
    lines.push(`- **适用环境**:`);
    for (const e of metadata.targetEnvironment) {
      lines.push(`  - ${e}`);
    }
  } else {
    lines.push(`- **适用环境**: 无限制`);
  }

  lines.push('');
  return lines.join('\n');
}

/**
 * Generate the phases section.
 */
function generatePhases(playbook: Playbook): string {
  const lines: string[] = ['## 流程阶段', ''];

  for (const phase of playbook.phases) {
    lines.push(`### Phase ${phase.order}: ${phase.name}`, '');
    lines.push(phase.description, '');
    lines.push(`**涉及 Skill**: ${phase.skills.join(', ')}`);
    lines.push(`**执行条件**: ${phase.condition || '无'}`);
    lines.push('');
    lines.push('---', '');
  }

  return lines.join('\n');
}

/**
 * Generate the full execution flow visualization.
 */
function generateExecutionFlow(playbook: Playbook): string {
  const phases = [...playbook.phases].sort((a, b) => a.order - b.order);
  const flow = phases.map(p => p.name).join(' → ');

  const lines: string[] = [
    '## 完整执行流程',
    '',
    flow,
    ''
  ];

  return lines.join('\n');
}

/**
 * Generate the usage section.
 */
function generateUsage(playbook: Playbook): string {
  return `## 使用方式

\`\`\`typescript
import { HosSecEngine } from 'hos-sec-engine';
import { getPlaybookById } from 'hos-sec-engine/playbooks';

const engine = new HosSecEngine();
const playbook = getPlaybookById('${playbook.id}');
engine.loadPlaybook(playbook);
const result = await engine.executeFlow({
  target: 'https://example.com',
  findings: [],
  accessLevel: 'anonymous',
  history: [],
  customData: {}
});
\`\`\``;
}

/**
 * Assemble the complete PLAYBOOK.md content for a single playbook.
 */
function generatePlaybookMd(playbook: Playbook): string {
  const sections = [
    generateFrontmatter(playbook),
    '',
    `# ${playbook.name}`,
    '',
    '## 流程概述',
    playbook.description,
    '',
    generateMetadata(playbook),
    generatePhases(playbook),
    generateExecutionFlow(playbook),
    generateUsage(playbook),
  ];

  return sections.filter(Boolean).join('\n');
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
 * @param outputDir Base output directory (defaults to dist/playbooks)
 * @returns Array of generated file paths
 */
export function generatePlaybooksMdFiles(
  outputDir?: string
): string[] {
  const outDir = outputDir ?? DEFAULT_OUTPUT_DIR;
  const playbooks = allPlaybooks;

  if (playbooks.length === 0) {
    console.warn('No playbooks loaded. Nothing to generate.');
    return [];
  }

  const generated: string[] = [];

  console.log(`Generating PLAYBOOK.md files for ${playbooks.length} playbook(s)...`);

  // Group by category
  const byCategory = new Map<string, Playbook[]>();
  for (const pb of playbooks) {
    const cat = pb.category;
    if (!byCategory.has(cat)) {
      byCategory.set(cat, []);
    }
    byCategory.get(cat)!.push(pb);
  }

  for (const [category, catPlaybooks] of byCategory) {
    for (const playbook of catPlaybooks) {
      const content = generatePlaybookMd(playbook);
      const playbookDir = path.join(outDir, category, playbook.id);
      const playbookMdPath = path.join(playbookDir, 'PLAYBOOK.md');
      writeOutput(playbookMdPath, content);
      generated.push(playbookMdPath);
      console.log(`  ${playbookMdPath}`);
    }
  }

  console.log(`\nDone. Generated ${generated.length} file(s) in ${outDir}`);
  return generated;
}

// ---------------------------------------------------------------------------
// CLI Entry Point
// ---------------------------------------------------------------------------

if (require.main === module) {
  try {
    generatePlaybooksMdFiles();
  } catch (error) {
    console.error('PLAYBOOK.md generation failed:', error);
    process.exit(1);
  }
}
