/**
 * Generator Orchestrator - Anthropic Skills + Legacy Format
 * 
 * Generates:
 * 1. skills/ directory with SKILL.md files (Anthropic Skills compatible)
 * 2. Legacy dist/*.md files (backward compatibility)
 * 
 * Run via: ts-node src/generators/index.ts
 * Or: npm run generate:all
 */

import * as fs from 'fs';
import * as path from 'path';
import { buildGenericSkill, buildAllSkills } from './build-skill';
import { buildClaudeSkill } from './build-claude';
import { buildCursorRule } from './build-cursor';
import { buildOpenHandsRule } from './build-openhands';
import { buildOpenCodeRule } from './build-opencode';
import { buildDiagnosticsSkill } from './build-diagnostics';

interface OutputFile {
  filename: string;
  content: string;
  description: string;
}

function wrapWithFrontmatter(name: string, description: string, content: string): string {
  return `---
name: ${name}
description: >
  ${description}
  Use when reviewing code for security vulnerabilities, performing penetration testing,
  or diagnosing security defects in web applications.
---

${content}`;
}

/**
 * Generate skills/ directory with Anthropic Skills format
 */
function generateSkillsDir(): void {
  const projectRoot = path.resolve(__dirname, '..', '..', '..');
  const skillsDir = path.join(projectRoot, 'skills');

  if (!fs.existsSync(skillsDir)) {
    fs.mkdirSync(skillsDir, { recursive: true });
  }

  const skillOutputs = buildAllSkills();

  for (const output of skillOutputs) {
    const skillSubDir = path.join(skillsDir, output.dirName);
    fs.mkdirSync(skillSubDir, { recursive: true });

    // Use the last segment as skill name for frontmatter
    const skillName = output.dirName.split('/').pop()!;
    const frontmatter = wrapWithFrontmatter(
      skillName,
      output.description,
      output.content
    );
    const filePath = path.join(skillSubDir, output.filename);
    fs.writeFileSync(filePath, `${frontmatter}\n${output.content}`, 'utf-8');
    const sizeKB = (Buffer.byteLength(output.content, 'utf-8') / 1024).toFixed(1);
    console.log(`\u2705 skills/${output.dirName}/${output.filename} - ${sizeKB}KB (${output.description})`);
  }

  // Generate README.md for the skills directory
  const readmeContent = `# HOS-Sec-Engine

> AI Code Audit & Penetration Testing Skill Engine

Anthropic Skills compatible format. Install via \`npx skills add <owner>/<repo>\`

## Available Skills

| Skill | Description |
|-------|-------------|
| [HOS-Sec-Engine](./HOS-Sec-Engine/SKILL.md) | Main engine - Full code audit + penetration testing dual engine |
| [audit](./HOS-Sec-Engine/audit/SKILL.md) | White-box code audit rules only |
| [pentest](./HOS-Sec-Engine/pentest/SKILL.md) | Black-box penetration testing rules only |
| [diagnostics](./HOS-Sec-Engine/diagnostics/SKILL.md) | Problem diagnostics and remediation |

## Installation

\`\`\`bash
npx skills add <github-owner>/hos-audit-core
\`\`\`

## Usage

After installation, each skill will be automatically loaded by Claude when relevant security tasks are detected.
`;
  fs.writeFileSync(path.join(skillsDir, 'README.md'), readmeContent, 'utf-8');
  console.log(`\u2705 skills/README.md - Skills index file`);
}

/**
 * Generate legacy dist/ files for backward compatibility
 */
export function generateAll(mode: 'audit' | 'pentest' | 'combined' = 'combined'): void {
  const distDir = path.resolve(__dirname, '..', '..', 'dist');

  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
    console.log(`\u2705 Created dist/ directory: ${distDir}`);
  }

  // Generate skills/ directory first
  generateSkillsDir();

  // Legacy output files
  const outputs: OutputFile[] = [];

  outputs.push(
    { filename: 'skill.md', content: buildGenericSkill(mode), description: 'Combined skill (audit + pentest)' },
    { filename: 'skill-audit.md', content: buildGenericSkill('audit'), description: 'Audit-only skill' },
    { filename: 'skill-pentest.md', content: buildGenericSkill('pentest'), description: 'Pentest-only skill' },
    { filename: 'skill-diagnostics.md', content: buildDiagnosticsSkill(), description: 'Problems & Diagnostics rules' },
    { filename: 'claude-skill.md', content: buildClaudeSkill(), description: 'Claude specific format' },
    { filename: 'cursor-rule.md', content: buildCursorRule(), description: 'Cursor IDE format' },
    { filename: 'openhands-rule.md', content: buildOpenHandsRule(), description: 'OpenHands format' },
    { filename: 'opencode-rule.md', content: buildOpenCodeRule(), description: 'OpenCode format' }
  );

  console.log(`\n\ud83d\ude80 HOS-Audit-Core Generator (Mode: ${mode})\n`);
  console.log(`Output directory: ${distDir}\n`);

  for (const output of outputs) {
    const filePath = path.join(distDir, output.filename);
    fs.writeFileSync(filePath, output.content, 'utf-8');
    const sizeKB = (Buffer.byteLength(output.content, 'utf-8') / 1024).toFixed(1);
    console.log(`\u2705 ${output.filename} - ${sizeKB}KB (${output.description})`);
  }

  console.log(`\n\u2728 Generated ${outputs.length} dist/ files + skills/ directory.\n`);
}

// Run when executed directly
generateAll('combined');
