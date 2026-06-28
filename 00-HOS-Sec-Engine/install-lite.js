#!/usr/bin/env node
/**
 * HOS Skills Bootstrap - 从 URL 直接运行
 * 
 * 用户只需一行命令即可下载安装全部 skill：
 * 
 * Windows PowerShell:
 *   irm https://raw.githubusercontent.com/lxcxjxhx/HOS_SKILL_WORKFLOW/main/00-HOS-Sec-Engine/scripts/install-lite.js -OutFile install.js; node install.js --target trae --global --all
 * 
 * Linux/macOS:
 *   curl -sL https://raw.githubusercontent.com/lxcxjxhx/HOS_SKILL_WORKFLOW/main/00-HOS-Sec-Engine/scripts/install-lite.js | node -s --target trae --global --all
 */

// This file is identical to install-lite.js
// It's placed at the repo root for easy direct execution
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

if (process.platform === 'win32') {
  process.stdout.setEncoding('utf8');
}

function detectPlatform() {
  switch (process.platform) {
    case 'win32': return { name: 'Windows', version: `NT ${os.release()}` };
    case 'darwin': return { name: 'macOS', version: os.release() };
    case 'linux': return { name: 'Linux', version: os.release() };
    default: return { name: process.platform, version: os.release() };
  }
}

const GITHUB_OWNER = 'lxcxjxhx';
const GITHUB_REPO = 'HOS_SKILL_WORKFLOW';
const GITHUB_BRANCH = 'main';
const BASE_PATH = '00-HOS-Sec-Engine';

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

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'HOS-Skills-Installer' } }, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        fetchUrl(res.headers.location).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode === 404) { reject(new Error(`Not found: ${url}`)); return; }
      if (res.statusCode !== 200) { reject(new Error(`HTTP ${res.statusCode}: ${url}`)); return; }
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
    try { return await fetchUrl(url); }
    catch (e) { if (i === retries - 1) throw e; await new Promise(r => setTimeout(r, 500 * (i + 1))); }
  }
}

function getHomeDir() {
  // Cross-platform home directory detection
  return process.env.USERPROFILE || process.env.HOME || os.homedir();
}

function getTargetDir(target, isGlobal) {
  const home = getHomeDir();
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
      console.log(`  Downloading ${skill.id}...`);
      const content = await fetchFile(`skills/${skill.id}/SKILL.md`);
      const dest = await installSkillFile(skill.id, 'SKILL.md', targetDir, content);
      installed.push(skill.id);
      console.log(`    ${COLORS.green('✓')} ${skill.id}`);
    } catch (e) {
      console.log(`    ${COLORS.yellow('!')} ${skill.id}: ${e.message}`);
    }
  }
  try {
    console.log(`  Downloading bundled skill hos-sec-engine...`);
    const content = await fetchFile('skills/hos-sec-engine/SKILL.md');
    await installSkillFile('hos-sec-engine', 'SKILL.md', targetDir, content);
    const skillsDir = path.join(targetDir, 'hos-sec-engine', 'skills');
    for (const skill of skillsList) {
      try {
        const content = await fetchFile(`skills/hos-sec-engine/skills/${skill.id}.md`);
        writeFile(path.join(skillsDir, `${skill.id}.md`), content);
      } catch (e) { /* ignore */ }
    }
    installed.push('hos-sec-engine');
    console.log(`    ${COLORS.green('✓')} hos-sec-engine`);
  } catch (e) {
    console.log(`    ${COLORS.yellow('!')} hos-sec-engine: ${e.message}`);
  }
  return installed;
}

const SKILLS = [
  { id: 'web-sqli-001', category: 'web', desc: 'SQL injection WAF bypass' },
  { id: 'web-xss-001', category: 'web', desc: 'XSS filter bypass' },
  { id: 'web-ssrf-001', category: 'web', desc: 'SSRF detection' },
  { id: 'web-xxe-001', category: 'web', desc: 'XXE injection' },
  { id: 'web-rce-001', category: 'web', desc: 'Command injection' },
  { id: 'web-upload-001', category: 'web', desc: 'File upload bypass' },
  { id: 'web-deser-001', category: 'web', desc: 'Deserialization vulnerability' },
  { id: 'web-auth-bypass-0day', category: 'web', desc: 'Auth bypass 0day' },
  { id: 'web-deser-0day', category: 'web', desc: 'Deserialization 0day' },
  { id: 'web-waf-bypass-0day', category: 'web', desc: 'WAF bypass 0day' },
  { id: 'web-xss-0day', category: 'web', desc: 'XSS filter 0day' },
  { id: 'api-jwt-001', category: 'api', desc: 'JWT attack' },
  { id: 'api-oauth-001', category: 'api', desc: 'OAuth attack' },
  { id: 'api-idor-001', category: 'api', desc: 'IDOR detection' },
  { id: 'api-ratelimit-001', category: 'api', desc: 'Rate limit bypass' },
  { id: 'api-graphql-injection-001', category: 'api', desc: 'GraphQL injection' },
  { id: 'cloud-iam-001', category: 'cloud', desc: 'IAM privilege escalation' },
  { id: 'cloud-meta-001', category: 'cloud', desc: 'Cloud metadata SSRF' },
  { id: 'cloud-s3-001', category: 'cloud', desc: 'S3 misconfiguration' },
  { id: 'linux-priv-esc-001', category: 'system', desc: 'Linux privilege escalation' },
  { id: 'windows-priv-esc-001', category: 'system', desc: 'Windows privilege escalation' },
  { id: 'ad-domain-enum-001', category: 'system', desc: 'AD domain enumeration' },
  { id: 'container-docker-escape-001', category: 'system', desc: 'Docker container escape' },
  { id: 'k8s-misconfig-001', category: 'other', desc: 'K8s misconfiguration audit' },
  { id: 'code-review-java-deser-001', category: 'other', desc: 'Java deserialization code review' },
  { id: 'mobile-android-apk-001', category: 'other', desc: 'Android APK reverse engineering' },
  { id: 'ai-prompt-injection-001', category: 'other', desc: 'Prompt injection bypass' },
  { id: 'hos-sec-engine', category: 'master', desc: 'Unified orchestration engine' },
];

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
Usage: Download and install skills directly from GitHub

Options:
  --target <editor>     Target editor: trae / claude-code / cursor
  --global, -g          Global install (all projects)
  --all                 Install all skills
  --skill <id1,id2>     Install specific skills
  --help, -h            Show help

One-line install commands (copy and run):

  Windows PowerShell:
    irm https://raw.githubusercontent.com/lxcxjxhx/HOS_SKILL_WORKFLOW/main/00-HOS-Sec-Engine/install-lite.js -OutFile install.js; node install.js --target trae --global --all

  Linux:
    curl -sL https://raw.githubusercontent.com/lxcxjxhx/HOS_SKILL_WORKFLOW/main/00-HOS-Sec-Engine/install-lite.js | node -s --target trae --global --all

  macOS:
    curl -sL https://raw.githubusercontent.com/lxcxjxhx/HOS_SKILL_WORKFLOW/main/00-HOS-Sec-Engine/install-lite.js | node -s --target trae --global --all

Examples:
  # Install all skills to Trae IDE (global)
  node install-lite.js --target trae --global --all

  # Install specific skill
  node install-lite.js --skill web-sqli-001 --target trae

  # Interactive mode
  node install-lite.js
`);
}

function ask(question, choices) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    console.log(COLORS.cyan(question));
    choices.forEach((c, i) => console.log(`  ${i + 1}. ${c}`));
    rl.question('Select (enter number): ', (answer) => {
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

async function main() {
  const opt = parseArgs();
  if (opt.help) { printHelp(); process.exit(0); }

  console.log(COLORS.cyan(TITLE));

  const platform = detectPlatform();
  const nodeVersion = process.version;
  console.log(`${COLORS.gray(`Platform: ${platform.name} (${platform.version})`)} `);
  console.log(`${COLORS.gray(`Node.js: ${nodeVersion}`)}`);
  console.log('');

  let target = opt.target;
  if (!target) { target = await ask('Select target editor:', ['trae', 'claude-code', 'cursor']); }

  let isGlobal = opt.global;
  if (!isGlobal && !opt.target) { isGlobal = await askYesNo('Install globally? (available in all projects)', true); }

  const targetDir = getTargetDir(target, isGlobal);
  fs.mkdirSync(targetDir, { recursive: true });

  console.log(`\n${COLORS.bold('Target:')} ${target}`);
  console.log(`${COLORS.bold('Directory:')} ${targetDir}`);
  console.log(`${COLORS.bold('Global:')} ${isGlobal ? 'Yes' : 'No'}`);
  console.log('');

  let skillsToInstall = [];
  if (opt.all) {
    skillsToInstall = SKILLS;
  } else if (opt.skill) {
    skillsToInstall = SKILLS.filter(s => opt.skill.includes(s.id));
  } else {
    console.log('Select skill category:');
    const categories = ['all-Bundled', 'all-All Individual', 'web-Web Security', 'api-API Security', 'cloud-Cloud Security', 'system-System Security', 'other-Other'];
    const categoryChoice = await ask('Category:', categories);
    const cat = categoryChoice.split('-')[0];
    if (cat === 'all') {
      skillsToInstall = categoryChoice.includes('Bundled') ? [SKILLS.find(s => s.id === 'hos-sec-master')] : SKILLS;
    } else {
      skillsToInstall = SKILLS.filter(s => s.category === cat);
    }
  }

  if (skillsToInstall.length === 0) { console.log(COLORS.red('No skills to install')); process.exit(1); }

  console.log(`\nDownloading and installing ${skillsToInstall.length} skills from GitHub...\n`);

  const installed = await installSkillsFromRemote(targetDir, skillsToInstall);

  console.log(`\n${COLORS.green(COLORS.bold('=== Installation Complete ==='))}`);
  console.log(`Installed ${installed.length} skills to ${targetDir}`);
  console.log(COLORS.gray('Describe security scenarios in your IDE to auto-match skills'));

  if (installed.length === 0) {
    console.log(`\n${COLORS.yellow('Note:')} Installation failed, possibly due to permissions.`);
    if (process.platform === 'win32') {
      console.log(`Try running PowerShell as Administrator, or install locally:`);
    } else {
      console.log(`Try running with sudo, or install locally:`);
    }
    console.log(`  node install-lite.js --target trae --all`);
  }

  if (!isGlobal) {
    console.log(`\n${COLORS.yellow('Note:')} Local install. Only affects current project.`);
    console.log(`For global install: node install-lite.js --target ${target} --global --all`);
  }
}

main().catch(err => {
  console.error(COLORS.red(`[Error] ${err.message}`));
  process.exit(1);
});
