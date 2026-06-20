#!/usr/bin/env node
/**
 * HOS Skills Lite Installer - 零依赖一键安装器
 * 
 * 直接从 GitHub 下载并安装 skill 文件，无需 npm install
 * 
 * Usage:
 *   node install-lite.js                  # 交互模式
 *   node install-lite.js --target trae    # 安装到 Trae
 *   node install-lite.js --global         # 全局安装
 *   node install-lite.js --skill web-sqli-001  # 安装单个 skill
 *   node install-lite.js --all            # 安装全部
 * 
 * 支持直接从 GitHub 运行（无需 clone）:
 *   npx lxcxjxhx/HOS_SKILL_WORKFLOW/00-HOS-Sec-Engine/scripts/install-lite.js --target trae --all
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

// Enable UTF-8 on Windows
if (process.platform === 'win32') {
  process.stdout.setEncoding('utf8');
}

// ============================================================================
// Config
// ============================================================================

const GITHUB_OWNER = 'lxcxjxhx';
const GITHUB_REPO = 'HOS_SKILL_WORKFLOW';
const GITHUB_BRANCH = 'main';
const BASE_PATH = '00-HOS-Sec-Engine';

// ============================================================================
// Colors (no dependency)
// ============================================================================

const COLORS = {
  red: (t) => `\x1b[31m${t}\x1b[0m`,
  green: (t) => `\x1b[32m${t}\x1b[0m`,
  yellow: (t) => `\x1b[33m${t}\x1b[0m`,
  cyan: (t) => `\x1b[36m${t}\x1b[0m`,
  gray: (t) => `\x1b[90m${t}\x1b[0m`,
  bold: (t) => `\x1b[1m${t}\x1b[0m`,
};

const TITLE = `
+------------------------------------------+
|    HOS Skills Lite Installer             |
|    零依赖一键安装 - 支持 Trae/Claude/Cursor |
+------------------------------------------+
`;

// ============================================================================
// HTTP fetcher
// ============================================================================

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'HOS-Skills-Installer' } }, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        fetchUrl(res.headers.location).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode === 404) {
        reject(new Error(`Not found: ${url}`));
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${url}`));
        return;
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function fetchFile(relativePath, retries = 3) {
  const url = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${BASE_PATH}/${relativePath}`;
  for (let i = 0; i < retries; i++) {
    try {
      return await fetchUrl(url);
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 500 * (i + 1)));
    }
  }
}

// ============================================================================
// Target directories
// ============================================================================

function getTargetDir(target, isGlobal) {
  const home = process.env.USERPROFILE || process.env.HOME || os.homedir();
  if (isGlobal) {
    switch (target) {
      case 'trae': return path.join(home, '.trae-cn', 'skills');
      case 'cursor': return path.join(home, '.cursor', 'skills');
      case 'claude-code': return path.join(home, '.claude', 'skills');
      default: return path.join(home, '.trae-cn', 'skills');
    }
  }
  const cwd = process.cwd();
  switch (target) {
    case 'trae': return path.join(cwd, '.trae', 'skills');
    case 'cursor': return path.join(cwd, '.cursor', 'rules');
    case 'claude-code': return path.join(cwd, '.claude', 'skills');
    default: return path.join(cwd, '.trae', 'skills');
  }
}

// ============================================================================
// Install operations
// ============================================================================

function writeFile(destPath, content) {
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, content);
}

async function installSkillFile(skillName, fileName, targetDir, content) {
  const destPath = path.join(targetDir, skillName, fileName);
  writeFile(destPath, content);
  return destPath;
}

async function installSkillsFromRemote(targetDir, skillsList) {
  const installed = [];

  for (const skill of skillsList) {
    try {
      console.log(`  下载 ${skill.id}...`);
      const content = await fetchFile(`skills/${skill.id}/SKILL.md`);
      const dest = await installSkillFile(skill.id, 'SKILL.md', targetDir, content);
      installed.push(skill.id);
      console.log(`    ${COLORS.green('✓')} ${skill.id} → ${dest}`);
    } catch (e) {
      console.log(`    ${COLORS.yellow('!')} ${skill.id}: ${e.message}`);
    }
  }

  // 安装整合 skill
  try {
    console.log(`  下载整合 skill hos-sec-engine...`);
    const content = await fetchFile('skills/hos-sec-engine/SKILL.md');
    await installSkillFile('hos-sec-engine', 'SKILL.md', targetDir, content);

    // 下载子技能到整合 skill 目录
    const skillsDir = path.join(targetDir, 'hos-sec-engine', 'skills');
    for (const skill of skillsList) {
      try {
        const content = await fetchFile(`skills/hos-sec-engine/skills/${skill.id}.md`);
        writeFile(path.join(skillsDir, `${skill.id}.md`), content);
      } catch (e) {
        // ignore
      }
    }
    installed.push('hos-sec-engine');
    console.log(`    ${COLORS.green('✓')} hos-sec-engine`);
  } catch (e) {
    console.log(`    ${COLORS.yellow('!')} hos-sec-engine: ${e.message}`);
  }

  return installed;
}

// ============================================================================
// Skills list (embedded to avoid fetching index)
// ============================================================================

const SKILLS = [
  { id: 'web-sqli-001', category: 'web', desc: 'SQL 注入 WAF 绕过' },
  { id: 'web-xss-001', category: 'web', desc: 'XSS 过滤器绕过' },
  { id: 'web-ssrf-001', category: 'web', desc: 'SSRF 检测与利用' },
  { id: 'web-xxe-001', category: 'web', desc: 'XXE 注入攻击' },
  { id: 'web-rce-001', category: 'web', desc: '命令注入' },
  { id: 'web-upload-001', category: 'web', desc: '文件上传绕过' },
  { id: 'web-deser-001', category: 'web', desc: '反序列化漏洞' },
  { id: 'web-auth-bypass-0day', category: 'web', desc: '认证绕过 0day' },
  { id: 'web-deser-0day', category: 'web', desc: '反序列化 0day' },
  { id: 'web-waf-bypass-0day', category: 'web', desc: 'WAF 绕过 0day' },
  { id: 'web-xss-0day', category: 'web', desc: 'XSS 过滤 0day' },
  { id: 'api-jwt-001', category: 'api', desc: 'JWT 攻击与绕过' },
  { id: 'api-oauth-001', category: 'api', desc: 'OAuth 流程攻击' },
  { id: 'api-idor-001', category: 'api', desc: 'IDOR 越权检测' },
  { id: 'api-ratelimit-001', category: 'api', desc: '速率限制绕过' },
  { id: 'api-graphql-injection-001', category: 'api', desc: 'GraphQL 注入' },
  { id: 'cloud-iam-001', category: 'cloud', desc: 'IAM 权限提升' },
  { id: 'cloud-meta-001', category: 'cloud', desc: '云元数据 SSRF' },
  { id: 'cloud-s3-001', category: 'cloud', desc: 'S3 配置错误利用' },
  { id: 'linux-priv-esc-001', category: 'system', desc: 'Linux 提权' },
  { id: 'windows-priv-esc-001', category: 'system', desc: 'Windows 提权' },
  { id: 'ad-domain-enum-001', category: 'system', desc: 'AD 域信息收集' },
  { id: 'container-docker-escape-001', category: 'system', desc: 'Docker 容器逃逸' },
  { id: 'k8s-misconfig-001', category: 'other', desc: 'K8s 配置审计' },
  { id: 'code-review-java-deser-001', category: 'other', desc: 'Java 反序列化代码审计' },
  { id: 'mobile-android-apk-001', category: 'other', desc: 'Android APK 逆向' },
  { id: 'ai-prompt-injection-001', category: 'other', desc: 'Prompt 注入绕过' },
  { id: 'hos-sec-master', category: 'master', desc: '统一编排入口' },
];

// ============================================================================
// CLI
// ============================================================================

function parseArgs() {
  const args = process.argv.slice(2);
  const opt = { target: null, global: false, all: false, skill: null, help: false };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--target': opt.target = args[++i]; break;
      case '--global': case '-g': opt.global = true; break;
      case '--all': opt.all = true; break;
      case '--skill': opt.skill = args[++i].split(',').map(s => s.trim()); break;
      case '--help': case '-h': opt.help = true; break;
    }
  }
  return opt;
}

function printHelp() {
  console.log(`
${TITLE}
用法: 直接从 GitHub 下载安装，无需 clone 或 npm install

选项:
  --target <editor>     安装目标: trae / claude-code / cursor
  --global, -g          全局安装
  --all                 安装全部 skill
  --skill <id1,id2>     安装指定 skill
  --help, -h            显示帮助

示例:
  # 一步安装全部到 Trae（全局）
  node install-lite.js --target trae --global --all

  # 安装单个 skill
  node install-lite.js --skill web-sqli-001 --target trae

  # 交互模式
  node install-lite.js
`);
}

function ask(question, choices) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    console.log(COLORS.cyan(question));
    choices.forEach((c, i) => console.log(`  ${i + 1}. ${c}`));
    rl.question('选择 (输入数字): ', (answer) => {
      rl.close();
      const idx = parseInt(answer) - 1;
      resolve(idx >= 0 && idx < choices.length ? choices[idx] : choices[0]);
    });
  });
}

function askYesNo(question, defaultYes = true) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    const def = defaultYes ? 'Y/n' : 'y/N';
    rl.question(`${question} (${def}) `, (answer) => {
      rl.close();
      const a = answer.trim().toLowerCase();
      if (a === '') return resolve(defaultYes);
      resolve(a === 'y' || a === 'yes');
    });
  });
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const opt = parseArgs();

  if (opt.help) {
    printHelp();
    process.exit(0);
  }

  console.log(COLORS.cyan(TITLE));

  // Determine target
  let target = opt.target;
  if (!target) {
    target = await ask('选择安装目标：', ['trae', 'claude-code', 'cursor']);
  }

  // Determine global
  let isGlobal = opt.global;
  if (!isGlobal && !opt.target) {
    isGlobal = await askYesNo('是否全局安装？（所有项目可用）', true);
  }

  const targetDir = getTargetDir(target, isGlobal);
  fs.mkdirSync(targetDir, { recursive: true });

  console.log(`\n${COLORS.bold('安装目标:')} ${target}`);
  console.log(`${COLORS.bold('安装目录:')} ${targetDir}`);
  console.log(`${COLORS.bold('全局安装:')} ${isGlobal ? '是' : '否'}`);
  console.log('');

  // Determine which skills
  let skillsToInstall = [];
  if (opt.all) {
    skillsToInstall = SKILLS;
  } else if (opt.skill) {
    skillsToInstall = SKILLS.filter(s => opt.skill.includes(s.id));
  } else {
    // Interactive: show by category
    console.log('选择要安装的 Skill 分类：');
    const categories = ['all-整合包', 'all-全部独立', 'web-Web安全', 'api-API安全', 'cloud-云安全', 'system-系统安全', 'other-其他'];
    const categoryChoice = await ask('选择分类：', categories);
    const cat = categoryChoice.split('-')[0];

    if (cat === 'all') {
      if (categoryChoice.includes('整合包')) {
        skillsToInstall = [SKILLS.find(s => s.id === 'hos-sec-master')];
      } else {
        skillsToInstall = SKILLS;
      }
    } else {
      skillsToInstall = SKILLS.filter(s => s.category === cat);
    }
  }

  if (skillsToInstall.length === 0) {
    console.log(COLORS.red('没有可安装的 skill'));
    process.exit(1);
  }

  console.log(`\n开始从 GitHub 下载安装 ${skillsToInstall.length} 个 skill...\n`);

  const installed = await installSkillsFromRemote(targetDir, skillsToInstall);

  console.log(`\n${COLORS.green(COLORS.bold('=== 安装完成 ==='))}`);
  console.log(`已安装 ${installed.length} 个 skill 到 ${targetDir}`);
  console.log(COLORS.gray('在 IDE 对话中描述安全场景即可自动匹配对应技能'));

  if (installed.length === 0) {
    console.log(`\n${COLORS.yellow('提示:')} 安装失败可能是权限问题。`);
    console.log(`请尝试以管理员身份运行，或安装到局部目录:`);
    console.log(`  node install-lite.js --target trae --all`);
  }

  // Print next steps
  if (!isGlobal) {
    console.log(`\n${COLORS.yellow('提示:')} 本次为局部安装，仅对当前项目生效`);
    console.log(`如需全局安装，运行: node install-lite.js --target ${target} --global --all`);
  }
}

main().catch(err => {
  console.error(COLORS.red(`[错误] ${err.message}`));
  process.exit(1);
});
