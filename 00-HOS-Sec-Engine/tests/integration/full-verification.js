/**
 * HOS-Sec-Engine 完整集成验证脚本
 * 三步验证：构建 → 安装 → 运行
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_DIR = path.resolve(__dirname, '../..');
const DIST_DIR = path.join(PROJECT_DIR, 'dist');
const SKILLS_DIR = path.join(PROJECT_DIR, 'skills');
const TESTS_DIR = path.join(PROJECT_DIR, 'tests');
const REPORT_FILE = path.join(TESTS_DIR, 'verification-report.json');

let results = {
  timestamp: new Date().toISOString(),
  build: { passed: false, details: '' },
  install: { passed: false, details: '' },
  runtime: { passed: false, details: '' },
  overall: false,
};

function log(section, message) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${section}`);
  console.log(`${'='.repeat(60)}`);
  console.log(message);
}

function runCommand(cmd, cwd) {
  try {
    const output = execSync(cmd, { cwd: cwd || PROJECT_DIR, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    return { success: true, output };
  } catch (error) {
    return { success: false, output: error.stdout || '', error: error.stderr || error.message };
  }
}

function countFiles(dir, pattern) {
  try {
    if (!fs.existsSync(dir)) return 0;
    let count = 0;
    function walk(currentDir) {
      const entries = fs.readdirSync(currentDir);
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          walk(fullPath);
        } else if (entry.includes(pattern)) {
          count++;
        }
      }
    }
    walk(dir);
    return count;
  } catch {
    return 0;
  }
}

// ========== STEP 1: BUILD VERIFICATION ==========
log('STEP 1: 构建验证', '执行 npm run build...');

const buildResult = runCommand('npm run build');
if (buildResult.success) {
  // Count generated files
  const skillMdCount = countFiles(path.join(DIST_DIR, 'skills'), 'SKILL.md');
  const playbookMdCount = countFiles(path.join(DIST_DIR, 'playbooks'), 'PLAYBOOK.md');
  const skillsIndexExists = fs.existsSync(path.join(PROJECT_DIR, 'skills-index.json'));
  const bundledSkillExists = fs.existsSync(path.join(SKILLS_DIR, 'hos-sec-engine', 'SKILL.md'));

  const buildDetails = {
    zeroErrors: true,
    skillMdGenerated: skillMdCount,
    playbookMdGenerated: playbookMdCount,
    skillsIndexGenerated: skillsIndexExists,
    bundledSkillGenerated: bundledSkillExists,
  };

  results.build.passed = skillMdCount >= 28 && playbookMdCount >= 5 && skillsIndexExists && bundledSkillExists;
  results.build.details = buildDetails;
  console.log(`  ✅ 构建成功`);
  console.log(`  ✅ SKILL.md: ${skillMdCount} 个`);
  console.log(`  ✅ PLAYBOOK.md: ${playbookMdCount} 个`);
  console.log(`  ✅ skills-index.json: ${skillsIndexExists ? '已生成' : '缺失'}`);
  console.log(`  ✅ Bundled skill: ${bundledSkillExists ? '已生成' : '缺失'}`);
} else {
  results.build.passed = false;
  results.build.details = buildResult.error;
  console.log(`  ❌ 构建失败: ${buildResult.error}`);
}

// ========== STEP 2: INSTALL VERIFICATION ==========
log('STEP 2: 安装验证', '执行 npx hos-sec-engine deploy --trae...');

if (results.build.passed) {
  // Clean old skills first - deploy to project .trae/skills directory
  const targetDir = path.join(PROJECT_DIR, '.trae', 'skills');
  if (fs.existsSync(targetDir)) {
    try { fs.rmSync(targetDir, { recursive: true, force: true }); } catch {}
  }
  fs.mkdirSync(targetDir, { recursive: true });

  const deployResult = runCommand('node dist/src/scripts/deploy-skills.js --trae');
  if (deployResult.success) {
    // Count installed skills
    let installedCount = 0;
    try {
      const entries = fs.readdirSync(targetDir);
      installedCount = entries.filter(e => {
        const skillPath = path.join(targetDir, e);
        return fs.statSync(skillPath).isDirectory() && fs.existsSync(path.join(skillPath, 'SKILL.md'));
      }).length;
    } catch {}

    results.install.passed = installedCount >= 28;
    results.install.details = { installedCount, output: deployResult.output.slice(-500) };
    console.log(`  ✅ 安装成功: ${installedCount} 个 skills 已部署`);
  } else {
    results.install.passed = false;
    results.install.details = deployResult.error;
    console.log(`  ❌ 安装失败: ${deployResult.error}`);
  }
} else {
  console.log('  ⏭️ 跳过安装（构建未通过）');
}

// ========== STEP 3: RUNTIME VERIFICATION ==========
log('STEP 3: 运行验证', '加载引擎并执行匹配测试...');

if (results.build.passed) {
  const runtimeTestPath = path.join(TESTS_DIR, 'core', 'engine-test.js');
  if (fs.existsSync(runtimeTestPath)) {
    const runtimeResult = runCommand(`node "${runtimeTestPath}"`);
    if (runtimeResult.success) {
      results.runtime.passed = true;
      results.runtime.details = runtimeResult.output;
      console.log(`  ✅ 运行验证通过`);
      console.log(runtimeResult.output);
    } else {
      results.runtime.passed = false;
      results.runtime.details = runtimeResult.error;
      console.log(`  ❌ 运行验证失败: ${runtimeResult.error}`);
    }
  } else {
    console.log('  ⏭️ 跳过运行验证（测试文件不存在）');
  }
} else {
  console.log('  ⏭️ 跳过运行验证（构建未通过）');
}

// ========== OVERALL ==========
results.overall = results.build.passed && results.install.passed && results.runtime.passed;

// Save report
fs.mkdirSync(path.dirname(REPORT_FILE), { recursive: true });
fs.writeFileSync(REPORT_FILE, JSON.stringify(results, null, 2));

log('验证结果', `
  构建: ${results.build.passed ? '✅ 通过' : '❌ 失败'}
  安装: ${results.install.passed ? '✅ 通过' : '❌ 失败'}
  运行: ${results.runtime.passed ? '✅ 通过' : '❌ 失败'}
  总体: ${results.overall ? '✅ 全部通过' : '❌ 存在失败'}
  
  报告已保存: ${REPORT_FILE}
`);

process.exit(results.overall ? 0 : 1);
