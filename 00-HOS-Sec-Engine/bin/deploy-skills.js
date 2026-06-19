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

const fs = require('fs');
const path = require('path');
const os = require('os');

// Set console output encoding for Chinese characters
if (process.platform === 'win32') {
  try {
    require('child_process').execSync('chcp 65001', { stdio: 'ignore' });
  } catch (e) {
    // Ignore errors
  }
}

// Get dist/skills directory
const distSkillsDir = path.resolve(__dirname, '../dist/skills');

// Check if dist/skills exists
if (!fs.existsSync(distSkillsDir)) {
  console.error('Error: dist/skills directory not found. Please run npm run build first.');
  process.exit(1);
}

// Parse command line arguments
const args = process.argv.slice(2);
const deployGlobal = args.includes('--global');
const deployClaude = !args.includes('--trae') || args.includes('--claude');
const deployTrae = !args.includes('--claude') || args.includes('--trae');

// Get target directories
function getTargetDirs() {
  const targets = [];
  
  if (deployGlobal) {
    // Global skills directories
    const homeDir = os.homedir();
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
    // Project-level skills directories
    const cwd = process.cwd();
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

// Recursively find all SKILL.md files
function findSkillFiles(dir) {
  const skills = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Check if this directory has a SKILL.md
      const skillMdPath = path.join(fullPath, 'SKILL.md');
      if (fs.existsSync(skillMdPath)) {
        // Use directory name as skill name (flat structure)
        skills.push({
          name: item,
          sourceMd: skillMdPath,
          sourceDir: fullPath
        });
      } else {
        // Recursively search subdirectories
        skills.push(...findSkillFiles(fullPath));
      }
    }
  }
  
  return skills;
}

// Deploy skills to target directory
function deploySkills(targetDir) {
  const skills = findSkillFiles(distSkillsDir);
  
  console.log(`\nFound ${skills.length} skills. Deploying to ${targetDir.path}...`);
  
  // Ensure target directory exists
  fs.mkdirSync(targetDir.path, { recursive: true });
  
  let deployedCount = 0;
  
  for (const skill of skills) {
    // Target path (flat structure)
    const targetSkillDir = path.join(targetDir.path, skill.name);
    const targetMdPath = path.join(targetSkillDir, 'SKILL.md');
    
    try {
      // Create skill directory
      fs.mkdirSync(targetSkillDir, { recursive: true });
      
      // Copy SKILL.md
      fs.copyFileSync(skill.sourceMd, targetMdPath);
      
      // Copy skill-specific references if they exist
      const skillRefsDir = path.join(skill.sourceDir, 'references');
      if (fs.existsSync(skillRefsDir)) {
        const targetRefsDir = path.join(targetSkillDir, 'references');
        copyDirSync(skillRefsDir, targetRefsDir);
      }
      
      console.log(`  [OK] ${skill.name}`);
      deployedCount++;
    } catch (err) {
      console.error(`  [FAIL] ${skill.name}: ${err.message}`);
    }
  }
  
  console.log(`\nDeployment complete: ${deployedCount}/${skills.length} skills deployed to ${targetDir.name}`);
  console.log(`Location: ${targetDir.path}`);
}

// Recursively copy directory
function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  
  fs.mkdirSync(dest, { recursive: true });
  
  const items = fs.readdirSync(src);
  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    const stat = fs.statSync(srcPath);
    
    if (stat.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Main function
function main() {
  console.log('HOS-Sec-Engine Skill Deployer');
  console.log('='.repeat(40));
  
  const targets = getTargetDirs();
  
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
