/**
 * HOS-Sec-Engine 完整集成验证脚本
 * V6: 新增 MCP 自我管理层验证
 * 四步验证：构建 → 安装 → 引擎运行 → MCP 管理层
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
  mcp: { passed: false, details: '' },
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
  // Check MCP layer built files
  const mcpFiles = [
    path.join(DIST_DIR, 'src', 'mcp', 'index.js'),
    path.join(DIST_DIR, 'src', 'mcp', 'registry.js'),
    path.join(DIST_DIR, 'src', 'mcp', 'discovery.js'),
    path.join(DIST_DIR, 'src', 'mcp', 'router.js'),
    path.join(DIST_DIR, 'src', 'mcp', 'health.js'),
    path.join(DIST_DIR, 'src', 'mcp', 'types.js'),
  ];
  const mcpAllExist = mcpFiles.every(f => fs.existsSync(f));

  // 新架构核心模块文件检查
  const coreModules = [
    path.join(DIST_DIR, 'src', 'core', 'process-engine.js'),
    path.join(DIST_DIR, 'src', 'core', 'phase-executor.js'),
    path.join(DIST_DIR, 'src', 'core', 'decision-tree.js'),
    path.join(DIST_DIR, 'src', 'core', 'tool-registry.js'),
    path.join(DIST_DIR, 'src', 'core', 'cve-integration.js'),
  ];
  const coreModulesAllExist = coreModules.every(f => fs.existsSync(f));

  const buildDetails = {
    zeroErrors: true,
    mcpLayerBuilt: mcpAllExist,
    coreModulesBuilt: coreModulesAllExist,
    mcpFiles: mcpFiles.map(f => path.relative(DIST_DIR, f)),
    coreModules: coreModules.map(f => path.relative(DIST_DIR, f)),
  };

  results.build.passed = mcpAllExist && coreModulesAllExist;
  results.build.details = buildDetails;
  console.log(`  ✅ MCP 管理层: ${mcpAllExist ? '✅ 全部构建成功' : '❌ 部分缺失'}`);
  console.log(`  ✅ 核心模块: ${coreModulesAllExist ? '✅ 全部构建成功' : '❌ 部分缺失'}`);
} else {
  results.build.passed = false;
  results.build.details = buildResult.error;
  console.log(`  ❌ 构建失败: ${buildResult.error}`);
}

// ========== STEP 2: Process Templates Verification ==========
log('STEP 2: 流程模板验证', '验证 YAML 流程模板文件存在性...');

if (results.build.passed) {
  const templateDir = path.join(PROJECT_DIR, 'src', 'playbooks', 'process-templates');
  const templateFiles = ['web-pentest.yaml', 'api-security-audit.yaml', 'cloud-config-audit.yaml'];
  const allTemplatesExist = templateFiles.every(f => fs.existsSync(path.join(templateDir, f)));

  results.install.passed = allTemplatesExist;
  results.install.details = { templateFiles: templateFiles.filter(f => fs.existsSync(path.join(templateDir, f))) };
  console.log(`  ✅ 流程模板: ${allTemplatesExist ? '✅ 全部存在' : '❌ 部分缺失'}`);
  console.log(`  📋 模板文件: ${templateDir}`);
  for (const f of templateFiles) {
    const exists = fs.existsSync(path.join(templateDir, f));
    console.log(`     ${exists ? '✅' : '❌'} ${f}`);
  }
} else {
  console.log('  ⏭️ 跳过模板验证（构建未通过）');
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

// ========== STEP 4: MCP 管理层验证 ==========
log('STEP 4: MCP 自我管理层验证', '验证 MCP 注册、发现、路由、健康监控...');

if (results.build.passed) {
  const mcpTestPath = path.join(TESTS_DIR, 'core', 'mcp-test.js');
  if (fs.existsSync(mcpTestPath)) {
    const mcpResult = runCommand(`node "${mcpTestPath}"`);
    if (mcpResult.success) {
      results.mcp.passed = true;
      results.mcp.details = mcpResult.output;
      console.log(`  ✅ MCP 验证通过`);
      console.log(mcpResult.output);
    } else {
      results.mcp.passed = false;
      results.mcp.details = mcpResult.error;
      console.log(`  ❌ MCP 验证失败: ${mcpResult.error}`);
    }
  } else {
    // 如果 MCP 测试文件不存在，尝试直接 require 验证
    console.log('  ℹ️ MCP 独立测试文件不存在，执行模块加载验证...');
    try {
      const testCode = `
        const { MCPRegistry, mcpRegistry } = require('${path.join(DIST_DIR, 'src/mcp/registry').replace(/\\/g, '/')}');
        const { MCPRouter, mcpRouter } = require('${path.join(DIST_DIR, 'src/mcp/router').replace(/\\/g, '/')}');
        const { MCPHealthMonitor, mcpHealthMonitor } = require('${path.join(DIST_DIR, 'src/mcp/health').replace(/\\/g, '/')}');

        let pass = 0, fail = 0;
        function assert(cond, msg) { if(cond) pass++; else { fail++; console.log('  ❌', msg); } }

        // Test 1: Registry singleton
        assert(typeof mcpRegistry.registerServer === 'function', 'MCPRegistry.registerServer exists');
        assert(typeof mcpRegistry.getServers === 'function', 'MCPRegistry.getServers exists');

        // Test 2: Register a test server
        mcpRegistry.registerServer({
          name: 'test-server',
          command: 'echo',
          args: ['hello'],
          env: {},
          description: 'Test server',
          autoStart: false,
          maxRestarts: 1,
          healthCheckIntervalMs: 60000,
          timeoutMs: 5000,
          tags: ['test']
        });
        const servers = mcpRegistry.getServers();
        assert(servers.some(s => s.config.name === 'test-server'), 'Server registered successfully');
        assert(servers.length >= 1, 'At least 1 server registered');

        // Test 3: Router initialization
        assert(typeof mcpRouter.routeAndExecute === 'function', 'MCPRouter.routeAndExecute exists');
        assert(typeof mcpRouter.findToolsForScenario === 'function', 'MCPRouter.findToolsForScenario exists');

        // Test 4: Health monitor
        assert(typeof mcpHealthMonitor.runFullCheck === 'function', 'MCPHealthMonitor.runFullCheck exists');
        assert(typeof mcpHealthMonitor.getStatus === 'function', 'MCPHealthMonitor.getStatus exists');

        // Test 5: Cleanup
        mcpRegistry.unregisterServer('test-server');
        assert(!mcpRegistry.getServer('test-server'), 'Server unregistered');

        console.log(\`\\n📊 MCP 测试结果: 通过 \${pass}, 失败 \${fail}, 总计 \${pass+fail}\`);
        process.exit(fail > 0 ? 1 : 0);
      `;
      const verifyResult = runCommand(`node -e "${testCode.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`);
      if (verifyResult.success) {
        results.mcp.passed = true;
        results.mcp.details = verifyResult.output;
        console.log(`  ✅ MCP 模块加载验证通过`);
        console.log(verifyResult.output);
      } else {
        results.mcp.passed = false;
        results.mcp.details = verifyResult.error;
        console.log(`  ❌ MCP 模块加载验证失败: ${verifyResult.error}`);
      }
    } catch (err) {
      results.mcp.passed = false;
      results.mcp.details = err.message;
      console.log(`  ❌ MCP 模块加载异常: ${err.message}`);
    }
  }
} else {
  console.log('  ⏭️ 跳过 MCP 验证（构建未通过）');
}

// ========== OVERALL ==========
results.overall = results.build.passed && results.install.passed && results.runtime.passed && results.mcp.passed;

// Save report
fs.mkdirSync(path.dirname(REPORT_FILE), { recursive: true });
fs.writeFileSync(REPORT_FILE, JSON.stringify(results, null, 2));

log('验证结果', `
  构建: ${results.build.passed ? '✅ 通过' : '❌ 失败'}
  ${results.build.passed ? `    - MCP 管理层: ${results.build.details.mcpLayerBuilt ? '✅ 构建' : '❌ 缺失'}` : ''}
  ${results.build.passed ? `    - 核心模块: ${results.build.details.coreModulesBuilt ? '✅ 构建' : '❌ 缺失'}` : ''}
  模板: ${results.install.passed ? '✅ 通过' : '❌ 失败'}
  运行: ${results.runtime.passed ? '✅ 通过' : '❌ 失败'}
  MCP: ${results.mcp.passed ? '✅ 通过' : '❌ 失败'}
  总体: ${results.overall ? '✅ 全部通过' : '❌ 存在失败'}

  报告已保存: ${REPORT_FILE}
`);

process.exit(results.overall ? 0 : 1);
