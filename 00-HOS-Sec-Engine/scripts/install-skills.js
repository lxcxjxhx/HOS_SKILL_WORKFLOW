#!/usr/bin/env node

/**
 * HOS Skills Universal Installer
 * 支持三种安装方式：
 *   A: npm install + npx hos-skills (完整安装，含源码+编译)
 *   B: npx skills add 兼容 (纯 skill 文件分发)
 *   C: 自包含 skill 目录 (AI 直接使用和扩展)
 * 
 * Usage:
 *   npx hos-skills install                    # 方案 A: 完整安装
 *   npx hos-skills install --target trae      # 指定目标编辑器
 *   npx hos-skills install --global           # 全局安装
 *   npx hos-skills install --mode standalone  # 独立 skill 模式
 *   npx hos-skills install --mode bundled     # 整合 skill 模式 (默认)
 *   npx hos-skills install --skill web-sqli-001  # 安装单个 skill
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// 延迟加载依赖
let chalk;
let checkbox, select, confirm, input;

async function loadDependencies() {
  try {
    chalk = require('chalk');
    const inquirerCheckbox = require('@inquirer/checkbox').default;
    const inquirerSelect = require('@inquirer/select').default;
    const inquirerConfirm = require('@inquirer/confirm').default;
    const inquirerInput = require('@inquirer/input').default;
    checkbox = inquirerCheckbox;
    select = inquirerSelect;
    confirm = inquirerConfirm;
    input = inquirerInput;
  } catch (e) {
    console.error('缺少依赖，请先运行: npm install');
    console.error(e.message);
    process.exit(1);
  }
}

const ASCII_TITLE = `
╔══════════════════════════════════════╗
║     HOS Skills Universal Installer   ║
║     支持: npm / npx skills add / AI  ║
╚══════════════════════════════════════╝
`;

const RISK_COLORS = {
  critical: 'red',
  high: 'yellow',
  medium: 'cyan',
  low: 'green',
};

// ============================================================================
// Paths
// ============================================================================

function getProjectRoot() {
  // This script runs from:
  //   - Local development: <project-root>/scripts/install-skills.js
  //   - After npm install: node_modules/hos-sec-engine/scripts/install-skills.js
  const scriptDir = __dirname;
  
  // Check if running from node_modules
  const nodeModulesIndex = scriptDir.lastIndexOf(path.sep + 'node_modules' + path.sep);
  if (nodeModulesIndex !== -1) {
    // Running from installed package
    const pkgRoot = scriptDir.substring(0, nodeModulesIndex) + path.sep + 'node_modules' + path.sep + 'hos-sec-engine';
    if (fs.existsSync(path.join(pkgRoot, 'skills'))) {
      return pkgRoot;
    }
  }
  
  // Local development: scripts/ -> project root
  return path.resolve(scriptDir, '..');
}

function getSkillsSourceDir(projectRoot) {
  // Priority: skills/ (flat structure after build) > dist/skills/
  const flatSkills = path.join(projectRoot, 'skills');
  if (fs.existsSync(flatSkills)) {
    return flatSkills;
  }
  const distSkills = path.join(projectRoot, 'dist', 'skills');
  if (fs.existsSync(distSkills)) {
    return distSkills;
  }
  return null;
}

function getSkillsIndexPath(projectRoot) {
  // Priority: skills-index.json (root) > dist/skills-index.json
  const rootIndex = path.join(projectRoot, 'skills-index.json');
  if (fs.existsSync(rootIndex)) {
    return rootIndex;
  }
  const distIndex = path.join(projectRoot, 'dist', 'skills-index.json');
  if (fs.existsSync(distIndex)) {
    return distIndex;
  }
  return null;
}

// ============================================================================
// Target directories
// ============================================================================

function getTargetSkillsDir(target, isGlobal, cwd) {
  const home = process.env.USERPROFILE || process.env.HOME || '';
  
  if (isGlobal) {
    switch (target) {
      case 'trae':
        return path.join(home, '.trae-cn', 'skills');
      case 'cursor':
        return path.join(home, '.cursor', 'skills');
      case 'claude-code':
        return path.join(home, '.claude', 'skills');
      default:
        return path.join(home, '.trae-cn', 'skills');
    }
  }

  const projectDir = cwd || process.cwd();
  switch (target) {
    case 'trae':
      return path.join(projectDir, '.trae', 'skills');
    case 'cursor':
      return path.join(projectDir, '.cursor', 'rules');
    case 'claude-code':
      return path.join(projectDir, '.claude', 'skills');
    default:
      return path.join(projectDir, '.trae', 'skills');
  }
}

// ============================================================================
// Copy operations
// ============================================================================

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(chalk.yellow(`  [警告] 源目录不存在: ${src}`));
    return false;
  }
  
  fs.mkdirSync(dest, { recursive: true });
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
  return true;
}

function copyFile(src, dest) {
  if (!fs.existsSync(src)) return false;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  return true;
}

// ============================================================================
// Installation modes
// ============================================================================

/**
 * 方案 A: 完整安装 (npm install 后自动运行)
 * 安装全部：skill 文件 + 源码 + 编译产物 + CLI 工具
 */
function installFull(projectRoot, targetDir, options) {
  const skillsSource = getSkillsSourceDir(projectRoot);
  if (!skillsSource) {
    console.error(chalk.red('[错误] 无法找到 skills 源目录'));
    return false;
  }

  console.log(chalk.cyan('\n=== 方案 A: 完整安装 (Full Install) ==='));
  console.log(chalk.gray('安装: SKILL.md + 子技能 + 源码 + CLI 工具'));
  
  let success = 0;
  
  if (options.mode === 'bundled' || !options.skill) {
    // 整合模式: 安装 hos-sec-engine 主 skill
    const bundledSrc = path.join(skillsSource, 'hos-sec-engine');
    if (fs.existsSync(bundledSrc)) {
      const dest = path.join(targetDir, 'hos-sec-engine');
      console.log(chalk.cyan(`  安装整合 skill → ${dest}`));
      copyDirSync(bundledSrc, dest);
      
      // 同时安装独立子 skill 到同一目录
      const subSkillsDir = path.join(skillsSource);
      const subSkills = fs.readdirSync(subSkillsDir, { withFileTypes: true })
        .filter(e => e.isDirectory() && e.name !== 'hos-sec-engine')
        .map(e => e.name);
      
      for (const skillId of subSkills) {
        const srcSkill = path.join(subSkillsDir, skillId);
        const destSkill = path.join(targetDir, skillId);
        if (fs.existsSync(srcSkill)) {
          copyDirSync(srcSkill, destSkill);
          console.log(chalk.green(`  ✓ ${skillId}`));
          success++;
        }
      }
      
      success++;
    }
  } else if (options.skill) {
    // 独立模式: 安装指定 skill
    const skillIds = Array.isArray(options.skill) ? options.skill : [options.skill];
    for (const skillId of skillIds) {
      const srcSkill = path.join(skillsSource, skillId);
      const destSkill = path.join(targetDir, skillId);
      if (fs.existsSync(srcSkill)) {
        copyDirSync(srcSkill, destSkill);
        console.log(chalk.green(`  ✓ ${skillId}`));
        success++;
      } else {
        console.warn(chalk.yellow(`  [跳过] ${skillId} 不存在`));
      }
    }
  }

  // 安装源码到项目本地 (方案 A 特有)
  if (options.installSource !== false) {
    const srcDir = path.join(projectRoot, 'src');
    const localSrcDir = path.join(path.dirname(targetDir), 'hos-sec-engine-src');
    if (fs.existsSync(srcDir)) {
      console.log(chalk.cyan(`  安装源码 → ${localSrcDir}`));
      copyDirSync(srcDir, localSrcDir);
      
      // 复制 package.json 和 tsconfig.json
      copyFile(path.join(projectRoot, 'package.json'), path.join(localSrcDir, 'package.json'));
      copyFile(path.join(projectRoot, 'tsconfig.json'), path.join(localSrcDir, 'tsconfig.json'));
      
      console.log(chalk.gray('  源码已安装，可运行: npm install && npm run build'));
    }
  }

  console.log(chalk.green(`\n  已安装 ${success} 个 skill`));
  return success > 0;
}

/**
 * 方案 B: npx skills add 兼容模式
 * 只安装 SKILL.md 文件，符合 Claude Code / Trae 标准
 */
function installSkillCompat(skillSourceDir, skillId, targetDir) {
  const srcSkill = path.join(skillSourceDir, skillId);
  if (!fs.existsSync(srcSkill)) {
    return false;
  }
  
  const destSkill = path.join(targetDir, skillId);
  copyDirSync(srcSkill, destSkill);
  return true;
}

/**
 * 方案 C: AI 自扩展模式
 * 在 skill 目录中嵌入编译脚本，AI 可直接使用
 */
function installSelfContained(skillSourceDir, skillId, targetDir, projectRoot) {
  const srcSkill = path.join(skillSourceDir, skillId);
  if (!fs.existsSync(srcSkill)) {
    return false;
  }
  
  const destSkill = path.join(targetDir, skillId);
  copyDirSync(srcSkill, destSkill);
  
  // 创建 build-new-skill.js 脚本供 AI 使用
  const buildScript = path.join(targetDir, '_tools', 'build-new-skill.js');
  const buildScriptContent = `#!/usr/bin/env node
/**
 * AI Skill Builder - 新增子 skill 工具
 * 
 * Usage:
 *   node build-new-skill.js <skill-name> "<description>" [category]
 * 
 * Example:
 *   node build-new-skill.js web-csrf-001 "CSRF Token Bypass Techniques" web
 * 
 * 此脚本会自动创建:
 *   1. SKILL.md 文件
 *   2. 注册到 skills-index.json
 *   3. 更新主 skill 的引用
 */

const fs = require('fs');
const path = require('path');

function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('Usage: node build-new-skill.js <skill-id> "<description>" [category]');
    console.log('Example: node build-new-skill.js web-csrf-001 "CSRF Token Bypass" web');
    process.exit(1);
  }
  
  const [skillId, description, category = 'web'] = args;
  const skillsDir = path.dirname(__dirname);
  
  // 创建 skill 目录
  const skillDir = path.join(skillsDir, skillId);
  fs.mkdirSync(skillDir, { recursive: true });
  
  // 创建 SKILL.md
  const skillMd = \`---
name: \${skillId}
description: \${description}
license: MIT
metadata:
  author: AI Generated
  version: "1.0.0"
  category: \${category}
  risk-level: high
  confidence: 0.85
  tags:
    - \${category}
    - security
---

# \${description}

## 适用场景
TODO: 填写具体触发场景

## 攻击步骤
1. 信息收集
2. 漏洞探测
3. 漏洞利用
4. 验证

## Payload 示例
\`;
  
  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), skillMd);
  console.log(\`✓ Created \${skillId} in \${skillDir}\`);
}

main();
`;
  fs.mkdirSync(path.dirname(buildScript), { recursive: true });
  fs.writeFileSync(buildScript, buildScriptContent);
  
  return true;
}

// ============================================================================
// CLI
// ============================================================================

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    mode: 'bundled',
    target: null,
    global: false,
    skill: null,
    installSource: true,
    help: false,
    install: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case 'install':
        options.install = true;
        break;
      case '--mode':
        options.mode = args[++i];
        break;
      case '--target':
        options.target = args[++i];
        break;
      case '--global':
      case '-g':
        options.global = true;
        break;
      case '--skill':
        options.skill = args[++i].split(',').map(s => s.trim());
        break;
      case '--no-source':
        options.installSource = false;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
    }
  }

  return options;
}

function printHelp() {
  console.log(`
${ASCII_TITLE}

用法:
  npx hos-skills install [options]

选项:
  --mode <mode>         安装模式: bundled (默认) / standalone
  --target <target>     安装目标: trae / claude-code / cursor
  --global, -g          全局安装
  --skill <id1,id2>     安装指定 skill (逗号分隔)
  --no-source           不安装源码 (仅 skill 文件)
  --help, -h            显示帮助

示例:
  npx hos-skills install                           # 整合安装到当前项目
  npx hos-skills install --target trae             # 安装到 TRAE
  npx hos-skills install --global --target claude-code  # 全局安装到 Claude
  npx hos-skills install --skill web-sqli-001,web-xss-001  # 安装指定 skill
  npx hos-skills install --mode standalone         # 独立 skill 模式
`);
}

async function askInstallTarget() {
  return select({
    message: '选择安装目标：',
    choices: [
      { name: 'trae', value: 'trae', description: 'TRAE IDE' },
      { name: 'claude-code', value: 'claude-code', description: 'Claude Code AI' },
      { name: 'cursor', value: 'cursor', description: 'Cursor Editor' },
    ],
  });
}

async function askGlobalInstall() {
  return confirm({
    message: '是否全局安装？（所有项目可用）',
    default: false,
  });
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  await loadDependencies();
  
  const options = parseArgs();
  
  if (options.help) {
    printHelp();
    process.exit(0);
  }
  
  const projectRoot = getProjectRoot();
  const skillsSource = getSkillsSourceDir(projectRoot);
  
  if (!skillsSource) {
    console.error(chalk.red('[错误] 无法找到 skills 源目录。请确保项目已编译 (npm run build)'));
    process.exit(1);
  }
  
  console.log(chalk.cyan(ASCII_TITLE));
  
  // 确定安装目标
  const target = options.target || await askInstallTarget();
  const isGlobal = options.global || await askGlobalInstall();
  const targetDir = getTargetSkillsDir(target, isGlobal);
  
  fs.mkdirSync(targetDir, { recursive: true });
  
  console.log(chalk.cyan('\n=== 安装信息 ==='));
  console.log(chalk.bold('安装模式:'), options.mode);
  console.log(chalk.bold('安装目标:'), target);
  console.log(chalk.bold('目标目录:'), targetDir);
  console.log(chalk.bold('全局安装:'), isGlobal ? '是' : '否');
  console.log(chalk.bold('安装源码:'), options.installSource ? '是' : '否');
  console.log('');
  
  // 交互模式: 显示菜单
  if (!options.install && !options.skill && options.mode === 'bundled') {
    const { default: select } = require('@inquirer/select').default ? {} : require('@inquirer/select');
    const menuChoice = await select({
      message: '选择安装方式：',
      choices: [
        { name: '📦 整合安装 (hos-sec-engine + 全部子技能)', value: 'bundled', description: '推荐：一次性安装所有技能' },
        { name: '📂 浏览安装（按分类选择）', value: 'browse', description: '按分类浏览并选择要安装的技能' },
        { name: '🔍 搜索安装（关键词搜索）', value: 'search', description: '通过关键词搜索技能' },
        { name: '📋 安装全部独立 Skill', value: 'all', description: '安装所有独立 skill（不含整合包）' },
      ],
    });

    if (menuChoice === 'bundled') {
      options.mode = 'bundled';
    } else if (menuChoice === 'all') {
      options.mode = 'standalone';
      const skillsDir = getSkillsSourceDir(projectRoot);
      if (skillsDir) {
        options.skill = fs.readdirSync(skillsDir, { withFileTypes: true })
          .filter(e => e.isDirectory() && e.name !== 'hos-sec-engine' && e.name !== 'references')
          .map(e => e.name);
      }
    } else if (menuChoice === 'browse' || menuChoice === 'search') {
      const skillsIndex = getSkillsIndexPath(projectRoot);
      if (!skillsIndex) {
        console.error(chalk.red('[错误] 无法找到 skills-index.json'));
        process.exit(1);
      }
      const indexData = JSON.parse(fs.readFileSync(skillsIndex, 'utf-8'));

      let skillsList = indexData.skills || [];
      if (menuChoice === 'search') {
        const { default: input } = require('@inquirer/input');
        const keyword = await input({ message: '输入搜索关键词：' });
        const kw = keyword.toLowerCase();
        skillsList = skillsList.filter(s =>
          s.id.toLowerCase().includes(kw) ||
          (s.description || '').toLowerCase().includes(kw) ||
          (s.tags || []).some(t => t.toLowerCase().includes(kw))
        );
        console.log(chalk.gray(`找到 ${skillsList.length} 个匹配的 skill`));
      }

      const { default: checkbox } = require('@inquirer/checkbox');
      const choices = skillsList.map(s => ({
        name: `${(s.id || '').padEnd(30)} ${(s.description || '').substring(0, 50)}`,
        value: s.id,
      }));
      const selected = await checkbox({
        message: menuChoice === 'browse' ? '选择要安装的 Skill：' : '选择要安装的 Skill（搜索结果）：',
        choices,
        pageSize: 15,
      });

      if (!selected || selected.length === 0) {
        console.log(chalk.yellow('未选择任何 Skill。'));
        process.exit(0);
      }
      options.skill = selected;
    }
  }

  if (options.mode === 'bundled' || options.skill) {
    const success = installFull(projectRoot, targetDir, options);
    if (success) {
      console.log(chalk.green.bold('\n=== 安装完成 ==='));
      console.log(chalk.gray('在 IDE 对话中描述场景即可自动匹配对应技能。'));
    }
  } else {
    // 交互模式: 显示 skill 列表
    const skillsIndex = getSkillsIndexPath(projectRoot);
    if (!skillsIndex) {
      console.error(chalk.red('[错误] 无法找到 skills-index.json'));
      process.exit(1);
    }
    
    const indexData = JSON.parse(fs.readFileSync(skillsIndex, 'utf-8'));
    
    const choices = indexData.skills.map(skill => ({
      name: `${skill.id.padEnd(30)} ${skill.description.substring(0, 50)}`,
      value: skill.id,
    }));
    
    const selected = await checkbox({
      message: '选择要安装的 Skill（空格选择，回车确认）：',
      choices,
      pageSize: 15,
    });
    
    if (selected && selected.length > 0) {
      options.skill = selected;
      const success = installFull(projectRoot, targetDir, options);
      if (success) {
        console.log(chalk.green.bold('\n=== 安装完成 ==='));
      }
    } else {
      console.log(chalk.yellow('未选择任何 Skill。'));
    }
  }
}

main().catch(err => {
  console.error(chalk.red(`[错误] ${err.message}`));
  process.exit(1);
});
