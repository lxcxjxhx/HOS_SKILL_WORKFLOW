#!/usr/bin/env node

/**
 * HOS Skills Installer CLI
 * 交互式 Skill 安装工具，支持浏览、搜索、批量安装
 * 可通过 npx hos-skills 运行
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 延迟加载依赖（安装后使用）
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
██╗  ██╗███████╗████████╗
██║  ██║██╔════╝╚══██╔══╝
███████║█████╗     ██║   
██╔══██║██╔══╝     ██║   
██║  ██║███████╗   ██║   
╚═╝  ╚═╝╚══════╝   ╚═╝   
    HOS Skills Installer
`;

// skills-index.json 远程地址（npx 运行时使用）
const REMOTE_INDEX_URL = 'https://raw.githubusercontent.com/your-org/HOS-Sec-Engine/main/00-HOS-Sec-Engine/skills-index.json';

// 风险等级颜色映射
const RISK_COLORS = {
  critical: 'red',
  high: 'yellow',
  medium: 'cyan',
  low: 'green',
};

/**
 * 读取 skills-index.json
 * 优先本地读取，失败后尝试远程下载
 */
async function loadSkillsIndex() {
  // 1. 尝试从 CLI 目录的父目录读取（本地开发）
  const localPath = path.join(__dirname, '..', 'skills-index.json');
  if (fs.existsSync(localPath)) {
    try {
      const content = fs.readFileSync(localPath, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.warn(chalk.yellow(`[警告] 本地 skills-index.json 解析失败: ${e.message}`));
    }
  }

  // 2. 尝试从项目根目录的 dist 目录读取
  const distPath = path.join(__dirname, '..', 'dist', 'skills-index.json');
  if (fs.existsSync(distPath)) {
    try {
      const content = fs.readFileSync(distPath, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.warn(chalk.yellow(`[警告] dist/skills-index.json 解析失败: ${e.message}`));
    }
  }

  // 3. 从远程下载
  console.log(chalk.cyan('[信息] 从远程仓库加载 skills-index.json...'));
  try {
    const https = require('https');
    const data = await new Promise((resolve, reject) => {
      https.get(REMOTE_INDEX_URL, (res) => {
        if (res.statusCode === 302 || res.statusCode === 301) {
          // 处理重定向
          https.get(res.headers.location, (res2) => {
            let body = '';
            res2.on('data', (chunk) => (body += chunk));
            res2.on('end', () => resolve(body));
          }).on('error', reject);
        } else {
          let body = '';
          res.on('data', (chunk) => (body += chunk));
          res.on('end', () => resolve(body));
        }
      }).on('error', reject);
    });
    return JSON.parse(data);
  } catch (e) {
    console.error(chalk.red(`[错误] 无法加载 skills-index.json: ${e.message}`));
    process.exit(1);
  }
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
 * 搜索 Skill（模糊匹配 id, name, description, tags, category）
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
 * 检查系统是否安装了 npx skills 命令
 */
function hasSkillsCLI() {
  try {
    execSync('npx skills --version', { stdio: 'ignore', timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * 询问安装目标
 */
async function askInstallTarget() {
  return select({
    message: '选择安装目标：',
    choices: [
      { name: 'claude-code', value: 'claude-code', description: 'Claude Code AI' },
      { name: 'trae', value: 'trae', description: 'TRAE IDE' },
      { name: 'cursor', value: 'cursor', description: 'Cursor Editor' },
      { name: 'all', value: 'all', description: '全部目标' },
    ],
  });
}

/**
 * 询问仓库地址
 */
async function askRepoUrl() {
  return input({
    message: '输入 Skill 仓库地址 (GitHub URL)：',
    default: '',
    validate: (val) => {
      if (!val || val.length === 0) {
        return '仓库地址不能为空';
      }
      return true;
    },
  });
}

/**
 * 生成并执行/显示安装命令
 */
async function executeInstallation(selectedSkills, target, indexData) {
  if (selectedSkills.length === 0) {
    console.log(chalk.yellow('未选择任何 Skill，跳过安装。'));
    return;
  }

  // 显示选择的 Skill 列表
  console.log('\n' + chalk.cyan.bold('=== 即将安装的 Skill ==='));
  for (const skillId of selectedSkills) {
    const skill = indexData.skills.find((s) => s.id === skillId);
    if (skill) {
      console.log(`  ${chalk.green('✓')} ${formatSkillDisplay(skill)}`);
    } else {
      console.log(`  ${chalk.green('✓')} ${skillId}`);
    }
  }
  console.log('');

  // 询问安装目标（如果未指定）
  const installTarget = target || (await askInstallTarget());

  // 询问仓库地址
  const repoUrl = await askRepoUrl();

  // 确定实际安装的目标列表
  const targets = installTarget === 'all' ? ['claude-code', 'trae', 'cursor'] : [installTarget];

  console.log('\n' + chalk.cyan.bold('=== 安装命令 ==='));

  const hasCLI = hasSkillsCLI();

  for (const skillId of selectedSkills) {
    for (const tgt of targets) {
      const cmd = `npx skills add ${repoUrl} -s ${skillId} -a ${tgt}`;
      console.log(`  ${chalk.gray('$')} ${cmd}`);

      // 如果系统已安装 npx skills，自动执行
      if (hasCLI) {
        try {
          console.log(chalk.gray('  正在执行...'));
          execSync(cmd, { stdio: 'inherit', timeout: 60000 });
          console.log(chalk.green('  ✓ 安装成功'));
        } catch (e) {
          console.log(chalk.red(`  ✗ 安装失败: ${e.message}`));
        }
      }
    }
  }

  if (!hasCLI) {
    console.log('\n' + chalk.yellow.bold('=== 提示 ==='));
    console.log(chalk.yellow('系统未安装 npx skills 命令，请手动执行上述命令。'));
    console.log(chalk.yellow('或使用 Claude Code 内置的 /skills 命令安装。'));
  }
}

/**
 * 主菜单
 */
async function showMainMenu(indexData) {
  const choice = await select({
    message: '选择安装方式：',
    choices: [
      { name: '1. 浏览所有 Skill（分类选择）', value: 'browse' },
      { name: '2. 搜索 Skill（关键词搜索）', value: 'search' },
      { name: '3. 按领域一键安装', value: 'bundle' },
      { name: '4. 安装全部 Skill', value: 'all' },
      { name: '5. 查看 Skill 详情', value: 'detail' },
      { name: '6. 退出', value: 'exit' },
    ],
  });

  return choice;
}

/**
 * 浏览模式 - 分类多选
 */
async function browseMode(indexData) {
  const groups = groupSkillsByCategory(indexData.skills);

  console.log(chalk.cyan.bold('\n=== 所有可用 Skill ===\n'));

  // 构建 checkbox 选项
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
    await executeInstallation(selected, null, indexData);
  } else {
    console.log(chalk.yellow('未选择任何 Skill。'));
  }
}

/**
 * 搜索模式 - 关键词搜索
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
    await executeInstallation(selected, null, indexData);
  }
}

/**
 * 领域一键包模式
 */
async function bundleMode(indexData) {
  console.log(chalk.cyan.bold('\n=== 按领域安装 ===\n'));

  const bundles = indexData.bundles;

  // 排除 all-bundle（单独选项）
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

    await executeInstallation(bundle.skills, null, indexData);
  }
}

/**
 * 安装全部 Skill
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
    await executeInstallation(allBundle.skills, null, indexData);
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
 * 解析命令行参数（非交互模式）
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    skills: null,
    bundle: null,
    all: false,
    target: null,
    repo: null,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--skills' && i + 1 < args.length) {
      options.skills = args[++i].split(',').map((s) => s.trim());
    } else if (arg === '--bundle' && i + 1 < args.length) {
      options.bundle = args[++i];
    } else if (arg === '--all') {
      options.all = true;
    } else if (arg === '--target' && i + 1 < args.length) {
      options.target = args[++i];
    } else if (arg === '--repo' && i + 1 < args.length) {
      options.repo = args[++i];
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
  --skills <id1,id2,...>            指定要安装的 Skill ID（逗号分隔）
  --bundle <bundle-name>            安装指定领域包（如 web-bundle）
  --all                             安装全部 Skill
  --target <target>                 安装目标（claude-code / trae / cursor / all）
  --repo <url>                      Skill 仓库地址

示例:
  hos-skills --skills web-sqli-001,web-xss-001 --target claude-code --repo https://github.com/xxx
  hos-skills --bundle web-bundle --target trae --repo https://github.com/xxx
  hos-skills --all --target claude-code --repo https://github.com/xxx
`);
}

/**
 * 非交互模式 - 直接执行安装
 */
async function nonInteractiveMode(options, indexData) {
  let selectedSkills = [];

  if (options.skills) {
    // 验证 skill ID 是否存在
    selectedSkills = options.skills.filter((id) => {
      const exists = indexData.skills.some((s) => s.id === id);
      if (!exists) {
        console.warn(chalk.yellow(`[警告] Skill 不存在: ${id}`));
      }
      return exists;
    });
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

  if (selectedSkills.length === 0) {
    console.error(chalk.red('[错误] 未指定要安装的 Skill'));
    process.exit(1);
  }

  if (!options.repo) {
    console.error(chalk.red('[错误] 非交互模式必须指定 --repo 参数'));
    printHelp();
    process.exit(1);
  }

  // 直接执行安装（跳过询问）
  console.log('\n' + chalk.cyan.bold('=== 即将安装的 Skill ==='));
  for (const skillId of selectedSkills) {
    const skill = indexData.skills.find((s) => s.id === skillId);
    if (skill) {
      console.log(`  ${chalk.green('✓')} ${formatSkillDisplay(skill)}`);
    }
  }

  const targets =
    options.target === 'all'
      ? ['claude-code', 'trae', 'cursor']
      : [options.target || 'claude-code'];

  console.log(`\n${chalk.cyan.bold('安装目标:')}: ${targets.join(', ')}`);
  console.log(`${chalk.cyan.bold('仓库地址:')}: ${options.repo}\n`);

  const hasCLI = hasSkillsCLI();

  for (const skillId of selectedSkills) {
    for (const tgt of targets) {
      const cmd = `npx skills add ${options.repo} -s ${skillId} -a ${tgt}`;
      console.log(`${chalk.gray('$')} ${cmd}`);

      if (hasCLI) {
        try {
          console.log(chalk.gray('  正在执行...'));
          execSync(cmd, { stdio: 'inherit', timeout: 60000 });
          console.log(chalk.green('  ✓ 安装成功'));
        } catch (e) {
          console.log(chalk.red(`  ✗ 安装失败: ${e.message}`));
        }
      }
    }
  }

  if (!hasCLI) {
    console.log('\n' + chalk.yellow.bold('=== 提示 ==='));
    console.log(chalk.yellow('系统未安装 npx skills 命令，请手动执行上述命令。'));
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

  // 判断是否为非交互模式
  const isNonInteractive = options.skills || options.bundle || options.all;

  if (isNonInteractive) {
    // 非交互模式
    await nonInteractiveMode(options, indexData);
    return;
  }

  // 交互模式 - 主循环
  while (true) {
    try {
      const choice = await showMainMenu(indexData);

      switch (choice) {
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
      // 用户按 Ctrl+C
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
