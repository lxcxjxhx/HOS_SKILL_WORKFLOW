#!/usr/bin/env node

/**
 * HOS-Sec-Engine Skill Deployment Script
 * 
 * Deploys all SKILL.md files to Claude/Trae skills directories.
 * 
 * Supported targets:
 * - .claude/skills/ (Claude Code)
 * - .trae/skills/ (Trae IDE)
 * - ~/.claude/skills/ (Global Claude)
 * - ~/.trae-cn/skills/ (Global Trae)
 * 
 * Usage:
 *   npx hos-sec-engine deploy          # Deploy to project .claude/skills/ and .trae/skills/
 *   npx hos-sec-engine deploy --global # Deploy to global skills directories
 *   npx hos-sec-engine deploy --claude # Deploy to Claude only
 *   npx hos-sec-engine deploy --trae   # Deploy to Trae only
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';
import { isSafeToTraverse } from '../utils/fs-safe';

// Set console output encoding for Chinese characters
if (process.platform === 'win32') {
  try {
    execSync('chcp 65001', { stdio: 'ignore' });
  } catch {
    // Ignore errors
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SkillFile {
  name: string;
  sourceMd: string;
  sourceDir: string;
}

interface TargetDir {
  path: string;
  name: string;
  type: 'global' | 'project';
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// Get skills directory (project root)
// After compilation, this file is at dist/src/scripts/, so go up 3 levels to project root, then into skills/
const SKILLS_DIR: string = path.resolve(__dirname, '..', '..', '..', 'skills');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Represents skill identity parsed from SKILL.md frontmatter.
 */
interface SkillManifest {
  /** Value of `name:` field in frontmatter */
  skillName: string;
  /** Directory name (the SKILL.md's parent folder name) */
  dirName: string;
  /** Full path to the SKILL.md file */
  sourceMd: string;
}

/**
 * Parse the `name` field from a SKILL.md YAML frontmatter block.
 * Returns the name value, or the directory name as fallback if parsing fails.
 */
function parseSkillName(skillMdPath: string): string {
  try {
    const content: string = fs.readFileSync(skillMdPath, 'utf-8');

    // Match content between first --- and second ---
    const match: RegExpMatchArray | null = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!match) return path.basename(path.dirname(skillMdPath));

    const frontmatter: string = match[1];

    // Extract `name:` line, supporting quoted and unquoted values
    const nameMatch: RegExpMatchArray | null = frontmatter.match(/^name:\s*(.+)$/m);
    if (!nameMatch) return path.basename(path.dirname(skillMdPath));

    return nameMatch[1].trim().replace(/^["']|["']$/g, '');
  } catch {
    return path.basename(path.dirname(skillMdPath));
  }
}

/**
 * Recursively find all SKILL.md files in the given directory.
 * Includes depth limit protection and symlink loop detection.
 */
function findSkillFiles(dir: string, depth: number = 0, visitedDirs: Set<string> = new Set()): SkillFile[] {
  if (!isSafeToTraverse(dir, depth, visitedDirs, 'findSkillFiles')) {
    return [];
  }

  const skills: SkillFile[] = [];
  const items: string[] = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath: string = path.join(dir, item);
    const stat: fs.Stats = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      const skillMdPath: string = path.join(fullPath, 'SKILL.md');
      if (fs.existsSync(skillMdPath)) {
        skills.push({
          name: item,
          sourceMd: skillMdPath,
          sourceDir: fullPath
        });
      } else {
        skills.push(...findSkillFiles(fullPath, depth + 1, visitedDirs));
      }
    }
  }

  return skills;
}

/**
 * Validate that all source skills have unique `name:` frontmatter values.
 * Duplicate names cause IDE-level conflicts — this prevents deploying them.
 * Exits with code 1 if duplicates are found.
 */
function validateSkillNames(skills: SkillFile[]): void {
  const manifests: SkillManifest[] = skills.map(s => ({
    skillName: parseSkillName(s.sourceMd),
    dirName: s.name,
    sourceMd: s.sourceMd,
  }));

  // Group by skillName to find duplicates
  const byName: Map<string, SkillManifest[]> = new Map();
  for (const m of manifests) {
    if (!byName.has(m.skillName)) {
      byName.set(m.skillName, []);
    }
    byName.get(m.skillName)!.push(m);
  }

  const duplicates: [string, SkillManifest[]][] = [];
  for (const [name, entries] of byName) {
    if (entries.length > 1) {
      duplicates.push([name, entries]);
    }
  }

  if (duplicates.length === 0) {
    console.log(`[VALIDATE] All ${skills.length} skill names are unique.`);
    return;
  }

  console.error('\n[VALIDATE] ERROR: Duplicate skill names found in frontmatter:\n');
  for (const [name, entries] of duplicates) {
    console.error(`  name: "${name}" appears ${entries.length} times:`);
    for (const e of entries) {
      console.error(`    - ${e.sourceMd} (dir: ${e.dirName})`);
    }
  }
  console.error('\nDeployment aborted. Fix the duplicate name fields in the source files above.\n');
  process.exit(1);
}

/**
 * Clean stale skill directories from a target deployment directory.
 * Removes any subdirectory that does NOT have a corresponding source
 * skill directory name in `validNames`.
 */
function cleanStaleEntries(targetDir: string, validNames: Set<string>): void {
  if (!fs.existsSync(targetDir)) return;

  const items: string[] = fs.readdirSync(targetDir);
  let removedCount: number = 0;

  for (const item of items) {
    const fullPath: string = path.join(targetDir, item);
    if (!fs.statSync(fullPath).isDirectory()) continue;

    // Skip non-skill directories (hidden dirs, dot-prefixed, known system dirs)
    if (item.startsWith('.')) continue;

    if (!validNames.has(item)) {
      // Remove entire stale directory
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`  [CLEAN] Removed stale: ${item}`);
      removedCount++;
    }
  }

  if (removedCount > 0) {
    console.log(`  Cleaned ${removedCount} stale skill director${removedCount > 1 ? 'ies' : 'y'}.`);
  } else {
    console.log(`  No stale entries found.`);
  }
}

/**
 * Recursively copy directory with depth limit protection.
 */
function copyDirSync(src: string, dest: string, depth: number = 0, visitedDirs: Set<string> = new Set()): void {
  if (!fs.existsSync(src)) return;
  if (!isSafeToTraverse(src, depth, visitedDirs, 'copyDirSync')) {
    return;
  }

  fs.mkdirSync(dest, { recursive: true });

  const items: string[] = fs.readdirSync(src);
  for (const item of items) {
    const srcPath: string = path.join(src, item);
    const destPath: string = path.join(dest, item);
    const stat: fs.Stats = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      copyDirSync(srcPath, destPath, depth + 1, visitedDirs);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Deploy skills to a target directory.
 * 1. Validates skill name uniqueness (pre-flight check)
 * 2. Cleans stale entries from target (auto-removes orphans)
 * 3. Copies entire skill directory (SKILL.md + any additional assets)
 */
function deploySkills(targetDir: TargetDir): void {
  const skills: SkillFile[] = findSkillFiles(SKILLS_DIR);

  console.log(`\nFound ${skills.length} skills. Deploying to ${targetDir.path}...`);

  if (skills.length === 0) {
    console.warn('  No skills found. Skipping deployment.');
    return;
  }

  // Phase 1: Pre-flight validation — check for duplicate name fields
  console.log('\n[Phase 1/3] Validating skill names...');
  validateSkillNames(skills);

  // Ensure target directory exists
  fs.mkdirSync(targetDir.path, { recursive: true });

  // Build valid name set from source skill directory names
  const validNames: Set<string> = new Set(skills.map(s => s.name));

  // Phase 2: Clean stale entries from target
  console.log('[Phase 2/3] Cleaning stale entries...');
  cleanStaleEntries(targetDir.path, validNames);

  // Phase 3: Copy skills
  console.log('[Phase 3/3] Copying skills...');
  let deployedCount: number = 0;

  for (const skill of skills) {
    const targetSkillDir: string = path.join(targetDir.path, skill.name);

    try {
      // Copy entire skill directory (SKILL.md, references/, assets/, etc.)
      copyDirSync(skill.sourceDir, targetSkillDir);

      console.log(`  [OK] ${skill.name}`);
      deployedCount++;
    } catch (err: unknown) {
      const message: string = err instanceof Error ? err.message : String(err);
      console.error(`  [FAIL] ${skill.name}: ${message}`);
    }
  }

  console.log(`\nDeployment complete: ${deployedCount}/${skills.length} skills deployed to ${targetDir.name}`);
  console.log(`Location: ${targetDir.path}`);
}

/**
 * Get target directories based on CLI arguments.
 *
 * --global: deploy to user home directories (~/.claude/skills/ etc.)
 * --claude: deploy to Claude only
 * --trae:   deploy to Trae only
 * (no --claude/--trae flag: deploy to all detected platforms)
 */
function getTargetDirs(): TargetDir[] {
  const args: string[] = process.argv.slice(2);
  const deployGlobal: boolean = args.includes('--global');

  // Determine platforms: default to all if neither --claude nor --trae is specified
  const hasPlatformFlag = args.includes('--claude') || args.includes('--trae');
  const deployClaude: boolean = !hasPlatformFlag || args.includes('--claude');
  const deployTrae: boolean = !hasPlatformFlag || args.includes('--trae');

  const targets: TargetDir[] = [];

  if (deployGlobal) {
    const homeDir: string = os.homedir();
    if (deployClaude) {
      targets.push({
        path: path.join(homeDir, '.claude', 'skills'),
        name: 'Claude Global Skills',
        type: 'global'
      });
    }
    if (deployTrae) {
      targets.push({
        path: path.join(homeDir, '.trae-cn', 'skills'),
        name: 'Trae Global Skills',
        type: 'global'
      });
    }
  } else {
    const cwd: string = process.cwd();
    if (deployClaude) {
      targets.push({
        path: path.join(cwd, '.claude', 'skills'),
        name: 'Claude Project Skills',
        type: 'project'
      });
    }
    if (deployTrae) {
      targets.push({
        path: path.join(cwd, '.trae', 'skills'),
        name: 'Trae Project Skills',
        type: 'project'
      });
    }
  }

  return targets;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  console.log('HOS-Sec-Engine Skill Deployer');
  console.log('='.repeat(40));

  // Check if skills directory exists
  if (!fs.existsSync(SKILLS_DIR)) {
    console.error('Error: skills directory not found. Please run npm run build first.');
    process.exit(1);
  }

  const targets: TargetDir[] = getTargetDirs();

  if (targets.length === 0) {
    console.error('Error: No target directories specified.');
    process.exit(1);
  }

  for (const target of targets) {
    deploySkills(target);
  }

  console.log('\nUsage:');
  console.log('  Claude: Mention skill name in conversation, or ask penetration testing questions');
  console.log('  Trae:  Mention skill name in conversation, or ask penetration testing questions');
  console.log('\nExamples:');
  console.log('  "Use web-sqli-001 to test SQL injection WAF bypass"');
  console.log('  "Help me test SQL injection, target has WAF protection"');
}

main();
