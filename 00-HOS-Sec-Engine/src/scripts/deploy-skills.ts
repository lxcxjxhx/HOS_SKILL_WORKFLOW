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
 */
function deploySkills(targetDir: TargetDir): void {
  const skills: SkillFile[] = findSkillFiles(SKILLS_DIR);

  console.log(`\nFound ${skills.length} skills. Deploying to ${targetDir.path}...`);

  // Ensure target directory exists
  fs.mkdirSync(targetDir.path, { recursive: true });

  let deployedCount: number = 0;

  for (const skill of skills) {
    const targetSkillDir: string = path.join(targetDir.path, skill.name);
    const targetMdPath: string = path.join(targetSkillDir, 'SKILL.md');

    try {
      fs.mkdirSync(targetSkillDir, { recursive: true });
      fs.copyFileSync(skill.sourceMd, targetMdPath);

      const skillRefsDir: string = path.join(skill.sourceDir, 'references');
      if (fs.existsSync(skillRefsDir)) {
        const targetRefsDir: string = path.join(targetSkillDir, 'references');
        copyDirSync(skillRefsDir, targetRefsDir);
      }

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
 */
function getTargetDirs(): TargetDir[] {
  const args: string[] = process.argv.slice(2);
  const deployGlobal: boolean = args.includes('--global');
  const deployClaude: boolean = !args.includes('--trae') || args.includes('--claude');
  const deployTrae: boolean = !args.includes('--claude') || args.includes('--trae');

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
