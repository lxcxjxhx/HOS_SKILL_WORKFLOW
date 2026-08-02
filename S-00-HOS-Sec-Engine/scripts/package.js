#!/usr/bin/env node
/**
 * HOS-Sec-Engine 打包发布脚本
 *
 * 功能：
 *   1. 构建项目（TypeScript 编译）
 *   2. 创建 npm 包（.tgz）
 *   3. 创建便携式 ZIP 包
 *   4. 输出包信息
 *
 * 用法：
 *   node scripts/package.js              # 完整打包
 *   node scripts/package.js --quick      # 跳过构建，仅打包
 *   node scripts/package.js --output ./  # 指定输出目录
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

const PROJECT_DIR = path.resolve(__dirname, '..');
const PKG = JSON.parse(fs.readFileSync(path.join(PROJECT_DIR, 'package.json'), 'utf-8'));

const PACKAGE_NAME = `${PKG.name}-v${PKG.version}`;
const DEFAULT_OUTPUT = path.join(PROJECT_DIR, 'dist-pkg');

// ============================================================
// 工具函数
// ============================================================

function run(cmd, opts = {}) {
  console.log(`  $ ${cmd}`);
  return execSync(cmd, { cwd: PROJECT_DIR, stdio: 'pipe', encoding: 'utf-8', ...opts });
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const e of entries) {
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    if (e.isDirectory()) {
      copyRecursive(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getDirSize(dir) {
  if (!fs.existsSync(dir)) return 0;
  let total = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      total += getDirSize(p);
    } else {
      total += fs.statSync(p).size;
    }
  }
  return total;
}

// ============================================================
// 步骤 1: 构建
// ============================================================

function stepBuild() {
  console.log('\n[1/4] 构建项目...');
  const start = Date.now();
  const out = run('npm run build');
  const duration = Date.now() - start;
  console.log(`  ✓ 构建完成 (${duration}ms)`);
  if (out) {
    const lines = out.trim().split('\n').filter(l => l.trim());
    for (const l of lines.slice(-3)) console.log(`    ${l}`);
  }
}

// ============================================================
// 步骤 2: npm pack
// ============================================================

function stepNpmPack(outputDir) {
  console.log('\n[2/4] 创建 npm 包 (.tgz)...');
  const start = Date.now();
  const out = run('npm pack --pack-destination "' + outputDir + '"');
  const tarballName = out.trim().split('\n').pop().trim();
  const duration = Date.now() - start;
  const tarballPath = path.join(outputDir, tarballName);
  const size = fs.statSync(tarballPath).size;
  console.log(`  ✓ 包已创建: ${tarballPath}`);
  console.log(`  ✓ 大小: ${formatSize(size)} (${duration}ms)`);
  return { path: tarballPath, name: tarballName, size };
}

// ============================================================
// 步骤 3: 创建便携式 ZIP
// ============================================================

function stepCreateZip(outputDir) {
  console.log('\n[3/4] 创建便携式 ZIP 包...');

  const zipDir = path.join(outputDir, PACKAGE_NAME);
  const zipFile = path.join(outputDir, `${PACKAGE_NAME}.zip`);

  // 清理旧目录
  if (fs.existsSync(zipDir)) fs.rmSync(zipDir, { recursive: true, force: true });
  if (fs.existsSync(zipFile)) fs.unlinkSync(zipFile);

  // 复制必要文件
  const dirs = ['dist', 'src', 'scripts', 'tests', 'templates', 'docs', 'config'];
  for (const d of dirs) {
    copyRecursive(path.join(PROJECT_DIR, d), path.join(zipDir, d));
  }

  // 复制根目录关键文件
  const rootFiles = [
    'package.json', 'package-lock.json', 'tsconfig.json',
    'README.md', '.gitignore', 'install-lite.js',
  ];
  for (const f of rootFiles) {
    const src = path.join(PROJECT_DIR, f);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(zipDir, f));
  }

  // 创建启动脚本
  const batContent = `@echo off
title HOS-Sec-Engine v${PKG.version}
setlocal enabledelayedexpansion

set ENGINE_DIR=%~dp0
set CLI_PATH=%ENGINE_DIR%dist\\src\\cli\\index.js

echo.
echo +------------------------------------------+
echo ^|  HOS-Sec-Engine v${PKG.version}                    ^|
echo ^|  HOS攻防实战规则引擎                          ^|
echo +------------------------------------------+
echo.

if "%1"=="" goto :help
if "%1"=="server" goto :server
if "%1"=="run" goto :run
if "%1"=="start" goto :start
if "%1"=="help" goto :help
goto :invalid

:server
  node "%CLI_PATH%" server %2 %3 %4 %5
  goto :end

:run
  node "%CLI_PATH%" run %2 %3 %4 %5
  goto :end

:start
  node "%ENGINE_DIR%dist\\src\\examples\\process-guidance.js"
  goto :end

:help
  echo 用法: hos-sec-engine ^<command^> [options]
  echo.
  echo 命令:
  echo   server    启动 Agent 通信服务
  echo   run       执行技能
  echo   start     运行业务指导流程演示
  echo   help      显示此帮助
  echo.
  goto :end

:invalid
  echo 未知命令: %1
  echo 运行 "hos-sec-engine help" 查看可用命令
  goto :end

:end
  endlocal
`;
  fs.writeFileSync(path.join(zipDir, 'hos-sec-engine.bat'), batContent, 'utf-8');

  // 创建 ZIP（使用 PowerShell 内置的 Compress-Archive）
  console.log('  正在压缩...');
  const start = Date.now();
  const psCmd = `Compress-Archive -Path "${zipDir}\\*" -DestinationPath "${zipFile}" -Force`;
  execSync(`powershell -Command "${psCmd}"`, { stdio: 'pipe' });
  const duration = Date.now() - start;

  // 清理临时目录
  if (fs.existsSync(zipDir)) fs.rmSync(zipDir, { recursive: true, force: true });

  const size = fs.statSync(zipFile).size;
  console.log(`  ✓ ZIP 包已创建: ${zipFile}`);
  console.log(`  ✓ 大小: ${formatSize(size)} (${duration}ms)`);
  return { path: zipFile, size };
}

// ============================================================
// 步骤 4: 输出摘要
// ============================================================

function printSummary(tarball, zip, outputDir) {
  const distSize = getDirSize(path.join(PROJECT_DIR, 'dist'));
  const nodeModulesSize = fs.existsSync(path.join(PROJECT_DIR, 'node_modules'))
    ? getDirSize(path.join(PROJECT_DIR, 'node_modules')) : 0;

  console.log('\n' + '='.repeat(60));
  console.log('  HOS-Sec-Engine 打包完成');
  console.log('='.repeat(60));
  console.log(`  版本:       v${PKG.version}`);
  console.log(`  输出目录:   ${outputDir}`);
  console.log(`  编译产出:   ${formatSize(distSize)}`);
  console.log(`  依赖体积:   ${formatSize(nodeModulesSize)}`);
  console.log(`  npm 包:     ${formatSize(tarball.size)} (${tarball.name})`);
  console.log(`  ZIP 包:     ${formatSize(zip.size)}`);
  console.log('');

  // 快捷安装提示
  console.log('  快捷调用方式:');
  console.log('');
  console.log('  方式 1 — npm link (推荐):');
  console.log(`    cd ${PROJECT_DIR}`);
  console.log('    npm link');
  console.log('    hos-sec-engine help');
  console.log('');
  console.log('  方式 2 — 全局安装 .tgz:');
  console.log(`    npm install -g ${tarball.path}`);
  console.log('    hos-sec-engine help');
  console.log('');
  console.log('  方式 3 — 解压 ZIP 后使用 bat:');
  console.log(`    解压 ${path.basename(zip.path)} 到任意目录`);
  console.log('    运行 hos-sec-engine.bat help');
  console.log('');
  console.log('  方式 4 — 本地 npx 调用:');
  console.log('    npx hos-sec-engine help');
  console.log('');

  // 写入 README 备注
  const manifest = {
    package: PACKAGE_NAME,
    version: PKG.version,
    files: {
      npm: tarball.name,
      zip: path.basename(zip.path),
    },
    commands: {
      global: 'hos-sec-engine <command>',
      local: 'npx hos-sec-engine <command>',
      bat: 'hos-sec-engine.bat <command>',
    },
    buildTime: new Date().toISOString(),
  };
  fs.writeFileSync(
    path.join(outputDir, 'package-manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf-8'
  );
  console.log('  清单已保存: package-manifest.json');
  console.log('='.repeat(60) + '\n');
}

// ============================================================
// Main
// ============================================================

function main() {
  const args = process.argv.slice(2);
  const quickMode = args.includes('--quick');
  const outputDir = path.resolve(
    args.includes('--output') ? args[args.indexOf('--output') + 1] : DEFAULT_OUTPUT
  );

  // 确保输出目录存在
  fs.mkdirSync(outputDir, { recursive: true });

  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║     HOS-Sec-Engine 打包工具                  ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log(`  版本: v${PKG.version}`);
  console.log(`  输出: ${outputDir}`);
  if (quickMode) console.log('  模式: 快速 (跳过构建)');

  // 步骤 1: 构建
  if (!quickMode) {
    stepBuild();
  } else {
    console.log('\n[1/4] 跳过构建 (--quick)');
  }

  // 步骤 2: npm pack
  const tarball = stepNpmPack(outputDir);

  // 步骤 3: ZIP
  const zip = stepCreateZip(outputDir);

  // 步骤 4: 摘要
  printSummary(tarball, zip, outputDir);
}

main();