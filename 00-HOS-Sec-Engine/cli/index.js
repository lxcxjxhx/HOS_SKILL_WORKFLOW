#!/usr/bin/env node

/**
 * HOS Skills Installer CLI
 * 交互式 Skill 安装工具，支持浏览、搜索、批量安装
 * 可通过 npx hos-skills 运行
 * 
 * 直接文件安装：不再依赖外部 npx skills add 命令
 */

const fs = require('fs');
const path = require('path');

// 延迟加载依赖
let chalk;
let checkbox, search, select, confirm, input;

async function loadDependencies() {
  try {
    chalk = require('chalk');
    const inquirerCheckbox = require('@inquirer/checkbox').default;
    const inquirerSearch = require('@inquirer/search').default;
    const inquirerSelect = require('@inquirer/select').default;
    const inquirerConfirm = require('@inquirer/confirm').default;
    const inquirerInput = require('@inquirer/input').default;
    checkbox = inquirerCheckbox;
    search = inquirerSearch;
    select = inquirerSelect;
    confirm = inquirerConfirm;
    input = inquirerInput;
  } catch (e) {
    console.error('缺少依赖，请先运行: npm install');
    console.error(e.message);
    process.exit(1);
  }
}

// ASCII 艺术标题
const ASCII_TITLE = `
HOS Skills Installer
====================
`;

// 风险等级颜色映射
const RISK_COLORS = {
  critical: 'red',
  high: 'yellow',
  medium: 'cyan',
  low: 'green',
};

/**
 * 读取 skills-index.json
 */
async function loadSkillsIndex() {
  // 1. CLI 目录的父目录（本地开发）
  const localPath = path.join(__dirname, '..', 'skills-index.json');
  if (fs.existsSync(localPath)) {
    try {
      return JSON.parse(fs.readFileSync(localPath, 'utf-8'));
    } catch (e) {
      console.warn(chalk.yellow(`[警告] 本地 skills-index.json 解析失败: ${e.message}`));
    }
  }

  // 2. dist 目录
  const distPath = path.join(__dirname, '..', 'dist', 'skills-index.json');
  if (fs.existsSync(distPath)) {
    try {
      return JSON.parse(fs.readFileSync(distPath, 'utf-8'));
    } catch (e) {
      console.warn(chalk.yellow(`[警告] dist/skills-index.json 解析失败: ${e.message}`));
    }
  }

  console.error(chalk.red('[错误] 无法找到 skills-index.json'));
  process.exit(1);
}

/**
 * 获取 skill 目录的源路径
 */
function getSourceSkillsDir() {
  // 优先使用项目根目录 skills/（编译输出后的扁平结构）
  const projectSkillsDir = path.join(__dirname, '..', 'skills');
  if (fs.existsSync(projectSkillsDir)) {
    return projectSkillsDir;
  }
  return null;
}

/**
 * 获取目标编辑器 skills 目录
 */
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

  // 局部安装
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

/**
 * 复制目录递归
 */
function copyDirRecursive(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) {
    console.warn(chalk.yellow(`[警告] 源目录不存在: ${srcDir}`));
    return;
  }
  
  fs.mkdirSync(destDir, { recursive: true });
  
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
 * 安装整合 skill (hos-sec-engine)
 */
function installBundledSkill(targetDir) {
  const sourceDir = getSourceSkillsDir();
  if (!sourceDir) {
    console.error(chalk.red('[错误] 无法找到 skills 源目录'));
    return false;
  }

  const bundledSrc = path.join(sourceDir, 'hos-sec-engine');
  if (!fs.existsSync(bundledSrc)) {
    console.error(chalk.red('[错误] 未找到整合 skill (hos-sec-engine)。请先运行 npm run build 生成。'));
    return false;
  }

  const bundledDest = path.join(targetDir, 'hos-sec-engine');
  console.log(chalk.cyan(`  安装整合 skill 到: ${bundledDest}`));
  copyDirRecursive(bundledSrc, bundledDest);
  console.log(chalk.green('  ✓ 整合 skill 安装完成'));
  return true;
}

/**
 * 安装独立 skill
 */
function installStandaloneSkills(skillIds, targetDir) {
  const sourceDir = getSourceSkillsDir();
  if (!sourceDir) {
    console.error(chalk.red('[错误] 无法找到 skills 源目录'));
    return false;
  }

  let successCount = 0;
  for (const skillId of skillIds) {
    const srcSkill = path.join(sourceDir, skillId);
    if (!fs.existsSync(srcSkill)) {
      console.warn(chalk.yellow(`  [警告] Skill 不存在: ${skillId}`));
      continue;
    }

    const destSkill = path.join(targetDir, skillId);
    copyDirRecursive(srcSkill, destSkill);
    successCount++;
    console.log(chalk.green(`  ✓ ${skillId}`));
  }

  console.log(chalk.cyan(`  已安装 ${successCount}/${skillIds.length} 个独立 skill`));
  return successCount > 0;
}

/**
 * 获取 riskLevel 的彩色显示
 */
function coloredRisk(riskLevel) {
  const color = RISK_COLORS[riskLevel] || 'white';
  return chalk[color](`[${riskLevel}]`);
}

/**
 * 格式化 Skill 显示文本
 */
function formatSkillDisplay(skill) {
  const id = chalk.bold(skill.id.padEnd(30));
  const name = skill.description.substring(0, 40);
  const risk = coloredRisk(skill.riskLevel);
  return `${id} ${name} ${risk}`;
}

/**
 * 按领域对 Skill 分组
 */
function groupSkillsByCategory(skills) {
  const groups = {};
  for (const skill of skills) {
    const cat = skill.category || 'other';
    if (!groups[cat]) {
      groups[cat] = [];
    }
    groups[cat].push(skill);
  }
  return groups;
}

/**
 * 搜索 Skill
 */
function searchSkills(skills, keyword) {
  const kw = keyword.toLowerCase();
  return skills.filter((s) => {
    return (
      s.id.toLowerCase().includes(kw) ||
      (s.name && s.name.toLowerCase().includes(kw)) ||
      (s.description && s.description.toLowerCase().includes(kw)) ||
      (s.category && s.category.toLowerCase().includes(kw)) ||
      (s.tags && s.tags.some((t) => t.toLowerCase().includes(kw)))
    );
  });
}

/**
 * 询问安装目标
 */
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

/**
 * 询问是否全局安装
 */
async function askGlobalInstall() {
  return confirm({
    message: '是否全局安装？（所有项目可用）',
    default: false,
  });
}

/**
 * 执行安装
 */
async function executeInstallation(selectedSkills, target, isGlobal, indexData, mode) {
  if (!selectedSkills || selectedSkills.length === 0) {
    console.log(chalk.yellow('未选择任何 Skill，跳过安装。'));
    return;
  }

  // 确定安装目标
  const installTarget = target || (await askInstallTarget());
  const globalInstall = isGlobal !== undefined ? isGlobal : (await askGlobalInstall());
  const targetDir = getTargetSkillsDir(installTarget, globalInstall);

  // 确保目标目录存在
  fs.mkdirSync(targetDir, { recursive: true });

  console.log('\n' + chalk.cyan.bold('=== 安装信息 ==='));
  console.log(chalk.bold('安装模式:'), mode === 'standalone' ? '独立 skill' : '整合 skill');
  console.log(chalk.bold('安装目标:'), installTarget);
  console.log(chalk.bold('目标目录:'), targetDir);
  console.log(chalk.bold('全局安装:'), globalInstall ? '是' : '否');
  console.log('');

  if (mode === 'bundled') {
    // 整合模式
    const success = installBundledSkill(targetDir);
    if (success) {
      console.log('\n' + chalk.green.bold('=== 安装完成 ==='));
      console.log(chalk.green('整合 skill (hos-sec-engine) 已成功安装到目标目录。'));
      console.log(chalk.gray('在 IDE 对话中直接描述场景即可自动匹配对应技能。'));
    }
  } else {
    // 独立模式
    console.log(chalk.cyan.bold('=== 即将安装的 Skill ==='));
    for (const skillId of selectedSkills) {
      const skill = indexData.skills.find((s) => s.id === skillId);
      if (skill) {
        console.log(`  ${chalk.green('✓')} ${formatSkillDisplay(skill)}`);
      } else {
        console.log(`  ${chalk.green('✓')} ${skillId}`);
      }
    }
    console.log('');

    const success = installStandaloneSkills(selectedSkills, targetDir);
    if (success) {
      console.log('\n' + chalk.green.bold('=== 安装完成 ==='));
    }
  }
}

/**
 * 主菜单
 */
async function showMainMenu(indexData) {
  const choice = await select({
    message: '选择安装方式：',
    choices: [
      { name: '1. 整合安装（推荐，所有 skill 合并为一个）', value: 'bundled' },
      { name: '2. 浏览独立 Skill（分类选择）', value: 'browse' },
      { name: '3. 搜索 Skill（关键词搜索）', value: 'search' },
      { name: '4. 按领域一键安装', value: 'bundle' },
      { name: '5. 安装全部独立 Skill', value: 'all' },
      { name: '6. 查看 Skill 详情', value: 'detail' },
      { name: '7. 退出', value: 'exit' },
    ],
  });

  return choice;
}

/**
 * 浏览模式
 */
async function browseMode(indexData) {
  console.log(chalk.cyan.bold('\n=== 所有可用 Skill ===\n'));

  const choices = indexData.skills.map((skill) => ({
    name: formatSkillDisplay(skill),
    value: skill.id,
    description: `${skill.category} / ${skill.subCategory}`,
  }));

  const selected = await checkbox({
    message: '选择要安装的 Skill（空格选择，回车确认）：',
    choices,
    pageSize: 15,
  });

  if (selected && selected.length > 0) {
    await executeInstallation(selected, null, undefined, indexData, 'standalone');
  } else {
    console.log(chalk.yellow('未选择任何 Skill。'));
  }
}

/**
 * 搜索模式
 */
async function searchMode(indexData) {
  console.log(chalk.cyan.bold('\n=== 搜索 Skill ===\n'));

  const keyword = await input({
    message: '输入搜索关键词：',
    default: '',
  });

  if (!keyword) {
    console.log(chalk.yellow('未输入关键词。'));
    return;
  }

  const results = searchSkills(indexData.skills, keyword);

  if (results.length === 0) {
    console.log(chalk.yellow(`\n未找到匹配的 Skill（关键词: ${keyword}）`));
    return;
  }

  console.log(chalk.green(`\n找到 ${results.length} 个匹配的 Skill:\n`));

  const choices = results.map((skill) => ({
    name: formatSkillDisplay(skill),
    value: skill.id,
  }));

  const selected = await checkbox({
    message: '选择要安装的 Skill（空格选择，回车确认）：',
    choices,
    pageSize: 15,
  });

  if (selected && selected.length > 0) {
    await executeInstallation(selected, null, undefined, indexData, 'standalone');
  }
}

/**
 * 领域一键包模式
 */
async function bundleMode(indexData) {
  console.log(chalk.cyan.bold('\n=== 按领域安装 ===\n'));

  const bundles = indexData.bundles;
  const bundleKeys = Object.keys(bundles).filter((k) => k !== 'all-bundle');

  const choices = bundleKeys.map((key) => {
    const b = bundles[key];
    return {
      name: `${b.name} (${b.skills.length} 个 Skill)`,
      value: key,
      description: b.description,
    };
  });

  const selectedBundle = await select({
    message: '选择领域包：',
    choices,
    pageSize: 15,
  });

  if (selectedBundle) {
    const bundle = bundles[selectedBundle];
    console.log(chalk.green(`\n已选择: ${bundle.name}`));
    console.log(chalk.gray(`包含 ${bundle.skills.length} 个 Skill\n`));

    await executeInstallation(bundle.skills, null, undefined, indexData, 'standalone');
  }
}

/**
 * 安装全部
 */
async function installAllMode(indexData) {
  const allBundle = indexData.bundles['all-bundle'];
  if (!allBundle) {
    console.log(chalk.red('未找到 all-bundle 配置。'));
    return;
  }

  console.log(chalk.cyan.bold('\n=== 安装全部 Skill ===\n'));
  console.log(chalk.yellow(`即将安装 ${allBundle.skills.length} 个 Skill\n`));

  const proceed = await confirm({
    message: '确认安装全部 Skill？',
    default: false,
  });

  if (proceed) {
    await executeInstallation(allBundle.skills, null, undefined, indexData, 'standalone');
  } else {
    console.log(chalk.yellow('已取消。'));
  }
}

/**
 * 查看 Skill 详情
 */
async function detailMode(indexData) {
  console.log(chalk.cyan.bold('\n=== 查看 Skill 详情 ===\n'));

  const choices = indexData.skills.map((skill) => ({
    name: `${skill.id} - ${skill.description.substring(0, 50)}`,
    value: skill.id,
  }));

  const skillId = await select({
    message: '选择要查看的 Skill：',
    choices,
    pageSize: 15,
  });

  const skill = indexData.skills.find((s) => s.id === skillId);
  if (!skill) {
    console.log(chalk.red('未找到该 Skill。'));
    return;
  }

  console.log('\n' + chalk.cyan.bold('=== Skill 详情 ==='));
  console.log(chalk.bold('ID:          ') + skill.id);
  console.log(chalk.bold('名称:        ') + skill.name);
  console.log(chalk.bold('分类:        ') + `${skill.category} / ${skill.subCategory}`);
  console.log(chalk.bold('风险等级:    ') + coloredRisk(skill.riskLevel));
  console.log(chalk.bold('置信度:      ') + (skill.confidence * 100).toFixed(0) + '%');
  console.log(chalk.bold('描述:        ') + skill.description);
  console.log(chalk.bold('标签:        ') + (skill.tags || []).join(', '));
  console.log(chalk.bold('更新时间:    ') + skill.updatedAt);
  console.log(chalk.bold('作者:        ') + skill.author);
}

/**
 * 解析命令行参数
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    skills: null,
    bundle: null,
    all: false,
    target: null,
    global: false,
    mode: 'bundled', // bundled (default) or standalone
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--skills' && i + 1 < args.length) {
      options.skills = args[++i].split(',').map((s) => s.trim());
      options.mode = 'standalone';
    } else if (arg === '--bundle' && i + 1 < args.length) {
      options.bundle = args[++i];
      options.mode = 'standalone';
    } else if (arg === '--all') {
      options.all = true;
    } else if (arg === '--target' && i + 1 < args.length) {
      options.target = args[++i];
    } else if (arg === '--global' || arg === '-g') {
      options.global = true;
    } else if (arg === '--mode' && i + 1 < args.length) {
      options.mode = args[++i];
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return options;
}

/**
 * 打印帮助信息
 */
function printHelp() {
  console.log(`
${ASCII_TITLE}
用法:
  hos-skills                         启动交互模式
  hos-skills --help                  显示帮助信息

非交互模式参数:
  --skills <id1,id2,...>            指定要安装的 Skill ID（逗号分隔，独立模式）
  --bundle <bundle-name>            安装指定领域包（如 web-bundle，独立模式）
  --all                             安装全部独立 Skill
  --target <target>                 安装目标（trae / claude-code / cursor）
  --mode <mode>                     安装模式（bundled / standalone，默认 bundled）
  --global, -g                      全局安装（所有项目可用）

示例:
  hos-skills                         # 交互式，默认整合安装
  hos-skills --target trae           # 交互式，安装到 TRAE
  hos-skills --mode bundled --target trae  # 整合安装到 TRAE
  hos-skills --skills web-sqli-001 --target trae --mode standalone  # 独立安装指定 skill
  hos-skills --bundle web-bundle --target trae  # 独立安装 Web 领域包
  hos-skills --all --target cursor   # 安装全部独立 skill
  hos-skills --target trae --global  # 全局整合安装
`);
}

/**
 * 非交互模式
 */
async function nonInteractiveMode(options, indexData) {
  let selectedSkills = [];
  let mode = options.mode;

  if (options.skills) {
    selectedSkills = options.skills.filter((id) => {
      const exists = indexData.skills.some((s) => s.id === id);
      if (!exists) {
        console.warn(chalk.yellow(`[警告] Skill 不存在: ${id}`));
      }
      return exists;
    });
    mode = 'standalone';
  } else if (options.bundle) {
    const bundleKey = options.bundle.endsWith('-bundle')
      ? options.bundle
      : `${options.bundle}-bundle`;

    const bundle = indexData.bundles[bundleKey];
    if (!bundle) {
      console.error(chalk.red(`[错误] 领域包不存在: ${options.bundle}`));
      console.log(chalk.gray(`可用包: ${Object.keys(indexData.bundles).join(', ')}`));
      process.exit(1);
    }
    selectedSkills = bundle.skills;
    mode = 'standalone';
    console.log(chalk.cyan(`已选择领域包: ${bundle.name} (${bundle.skills.length} 个 Skill)`));
  } else if (options.all) {
    const allBundle = indexData.bundles['all-bundle'];
    if (!allBundle) {
      console.error(chalk.red('[错误] 未找到 all-bundle 配置'));
      process.exit(1);
    }
    selectedSkills = allBundle.skills;
    console.log(chalk.cyan(`已选择全部 ${allBundle.skills.length} 个 Skill`));
  }

  if (selectedSkills.length === 0 && mode !== 'bundled') {
    // If no skills selected and not bundled mode, default to bundled
    mode = 'bundled';
  }

  const targetDir = getTargetSkillsDir(options.target || 'trae', options.global);
  fs.mkdirSync(targetDir, { recursive: true });

  console.log('\n' + chalk.cyan.bold('=== 安装信息 ==='));
  console.log(chalk.bold('安装模式:'), mode === 'bundled' ? '整合 skill' : '独立 skill');
  console.log(chalk.bold('安装目标:'), options.target || 'trae');
  console.log(chalk.bold('目标目录:'), targetDir);
  console.log(chalk.bold('全局安装:'), options.global ? '是' : '否');
  console.log('');

  if (mode === 'bundled') {
    const success = installBundledSkill(targetDir);
    if (success) {
      console.log('\n' + chalk.green.bold('=== 安装完成 ==='));
      console.log(chalk.green('整合 skill (hos-sec-engine) 已成功安装。'));
    }
  } else {
    console.log(chalk.cyan.bold('=== 即将安装的 Skill ==='));
    for (const skillId of selectedSkills) {
      const skill = indexData.skills.find((s) => s.id === skillId);
      if (skill) {
        console.log(`  ${chalk.green('✓')} ${formatSkillDisplay(skill)}`);
      }
    }
    console.log('');

    const success = installStandaloneSkills(selectedSkills, targetDir);
    if (success) {
      console.log('\n' + chalk.green.bold('=== 安装完成 ==='));
    }
  }
}

/**
 * 主函数
 */
async function main() {
  await loadDependencies();

  console.log(chalk.cyan(ASCII_TITLE));

  // 加载 skills-index.json
  const indexData = await loadSkillsIndex();
  console.log(chalk.gray(`已加载 ${indexData.totalSkills} 个 Skill\n`));

  // 解析命令行参数
  const options = parseArgs();

  // 判断是否为非交互模式：任何非默认参数都触发非交互模式
  const hasNonDefaultArgs = options.skills || options.bundle || options.all || options.global || (options.mode !== 'bundled');

  if (hasNonDefaultArgs) {
    await nonInteractiveMode(options, indexData);
    return;
  }

  // 交互模式 - 主循环
  while (true) {
    try {
      const choice = await showMainMenu(indexData);

      switch (choice) {
        case 'bundled':
          // 整合安装
          const installTarget = await askInstallTarget();
          const isGlobal = await askGlobalInstall();
          await executeInstallation(['hos-sec-engine'], installTarget, isGlobal, indexData, 'bundled');
          break;
        case 'browse':
          await browseMode(indexData);
          break;
        case 'search':
          await searchMode(indexData);
          break;
        case 'bundle':
          await bundleMode(indexData);
          break;
        case 'all':
          await installAllMode(indexData);
          break;
        case 'detail':
          await detailMode(indexData);
          break;
        case 'exit':
          console.log(chalk.green('\n再见！'));
          return;
        default:
          break;
      }
    } catch (e) {
      if (e.message === 'User force closed the prompt') {
        console.log(chalk.yellow('\n操作已取消。'));
        return;
      }
      throw e;
    }
  }
}

main().catch((err) => {
  console.error(chalk.red(`[错误] ${err.message}`));
  process.exit(1);
});
