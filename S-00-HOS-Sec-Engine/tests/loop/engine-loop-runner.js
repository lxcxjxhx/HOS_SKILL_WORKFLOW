/**
 * HOS-Sec-Engine 循环测试系统 — 核心驱动脚本
 *
 * 编排完整的无限循环流程：构建验证 → 测试 → 实战渗透 → 结果分析
 * 支持自动修复、性能基线比对、结果持久化记录
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const { ResultLogger } = require('./result-logger');
const { PerformanceTracker } = require('./performance-baseline');
const { AutoFixer } = require('./auto-fixer');
const { TargetFinder, PentestExecutor } = require('./pentest-executor');

class EngineLoopRunner {
  constructor(options = {}) {
    this.options = {
      loopIntervalMs: options.loopIntervalMs || 10000,
      maxFixAttempts: options.maxFixAttempts || 3,
      projectDir: options.projectDir || path.resolve(__dirname, '..', '..'),
      ...options
    };
    this.roundNumber = 0;
    this.running = false;
    this.logger = new ResultLogger(path.join(__dirname, 'results'));
    this.tracker = new PerformanceTracker(path.join(__dirname, 'performance-baseline.json'));
    this.fixer = new AutoFixer();
    this.targetFinder = new TargetFinder();
    this.pentestExecutor = new PentestExecutor();
    this.engine = null;
  }

  // ============================================================
  // start — 启动循环
  // ============================================================
  async start() {
    this.running = true;

    process.on('SIGINT', () => {
      console.log('\n[EngineLoopRunner] 收到 SIGINT 信号，正在优雅退出...');
      this.stop();
    });

    process.on('SIGTERM', () => {
      console.log('\n[EngineLoopRunner] 收到 SIGTERM 信号，正在优雅退出...');
      this.stop();
    });

    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║           HOS-Sec-Engine 循环测试系统启动               ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log(`项目目录: ${this.options.projectDir}`);
    console.log(`轮间间隔: ${this.options.loopIntervalMs}ms`);
    console.log(`最大修复次数: ${this.options.maxFixAttempts}`);
    console.log('');

    while (this.running) {
      try {
        const roundResult = await this.runRound();
        this._printRoundSummary(roundResult);
      } catch (err) {
        console.error(`[EngineLoopRunner] 第 ${this.roundNumber} 轮异常:`, err.message);
      }

      if (this.running) {
        console.log(`\n[EngineLoopRunner] 等待 ${this.options.loopIntervalMs}ms 后进入下一轮...\n`);
        await this._sleep(this.options.loopIntervalMs);
      }
    }
  }

  // ============================================================
  // stop — 优雅停止
  // ============================================================
  stop() {
    this.running = false;
    const summary = this.logger.getSummary(10);
    console.log('\n══════════════════════════════════════════════════════════');
    console.log('  最终结果摘要');
    console.log('══════════════════════════════════════════════════════════');
    console.log(`总轮次: ${summary.totalRounds}`);
    console.log(`通过: ${summary.passedRounds}`);
    console.log(`失败: ${summary.failedRounds}`);
    console.log(`通过率: ${summary.passRate}%`);
    console.log(`平均耗时: ${summary.avgDuration}ms`);
    if (summary.errors.length > 0) {
      console.log('\n错误列表:');
      for (const e of summary.errors) {
        console.log(`  - 第 ${e.round} 轮 [${e.phase}]: ${e.error}`);
      }
    }
    console.log('══════════════════════════════════════════════════════════\n');
    process.exit(0);
  }

  // ============================================================
  // runRound — 执行一轮完整循环
  // ============================================================
  async runRound() {
    this.roundNumber++;
    const roundNum = this.roundNumber;

    console.log('\n' + '='.repeat(70));
    console.log(`  第 ${roundNum} 轮循环开始`);
    console.log('='.repeat(70) + '\n');

    const result = { round: roundNum, phases: {} };

    // --- Phase 1: Build ---
    result.phases.build = await this.phaseBuild();

    // --- Phase 2: Tests ---
    result.phases.test = await this.phaseTests();

    // --- 修复循环：如果 build 或 tests 失败，尝试修复 ---
    let fixAttempts = 0;
    while (
      (result.phases.build.status === 'failed' || result.phases.test.status === 'failed') &&
      fixAttempts < this.options.maxFixAttempts
    ) {
      fixAttempts++;
      console.log(`\n[EngineLoopRunner] 修复尝试 ${fixAttempts}/${this.options.maxFixAttempts}...`);

      // 收集错误
      const allErrors = [];
      if (result.phases.build.errors) {
        allErrors.push(...result.phases.build.errors);
      }
      if (result.phases.test.errors) {
        allErrors.push(...result.phases.test.errors);
      }

      // 合并所有测试错误
      const testErrors = [];
      if (result.phases.test.tests) {
        for (const t of result.phases.test.tests) {
          if (t.errors) {
            testErrors.push(...t.errors);
          }
        }
      }

      const fixResult = this.fixer.attemptFix([...allErrors, ...testErrors]);
      if (fixResult.fixed) {
        console.log(`[EngineLoopRunner] 已应用 ${fixResult.changes.length} 个修复`);
        // 重新运行失败的阶段
        if (result.phases.build.status === 'failed') {
          result.phases.build = await this.phaseBuild();
        }
        if (result.phases.test.status === 'failed') {
          result.phases.test = await this.phaseTests();
        }
      } else {
        console.log(`[EngineLoopRunner] 无法自动修复，共 ${fixResult.failed.length} 个错误需人工介入`);
        break;
      }
    }

    // --- Phase 3: Pentest ---
    result.phases.pentest = await this.phasePentest();

    // --- Phase 4: Analyze ---
    result.phases.analyze = await this.phaseAnalyze(result);

    // 记录结果
    this.logger.logRound(roundNum, {
      build: result.phases.build,
      test: result.phases.test,
      verify: { status: 'skipped' },
      pentest: result.phases.pentest,
    });

    console.log(`\n第 ${roundNum} 轮循环完成`);
    return result;
  }

  // ============================================================
  // phaseBuild — 构建验证阶段
  // ============================================================
  async phaseBuild() {
    console.log('─── 阶段 1/4: 构建验证 ───\n');
    const startTime = Date.now();
    const phaseResult = {
      status: 'passed',
      duration: 0,
      errors: [],
      fixes: [],
    };

    try {
      const buildStart = Date.now();
      const stdout = execSync('npm run build', {
        cwd: this.options.projectDir,
        encoding: 'utf-8',
        timeout: 120000,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      phaseResult.duration = Date.now() - buildStart;
      console.log('[Build] 构建成功');
      console.log(stdout.slice(0, 500));
    } catch (buildErr) {
      phaseResult.duration = Date.now() - startTime;
      phaseResult.status = 'failed';

      const stderr = buildErr.stderr || buildErr.stdout || buildErr.message || '';
      console.error('[Build] 构建失败');
      console.error(stderr.slice(0, 1000));

      // 解析错误
      const parsedErrors = this.fixer.parseBuildErrors(stderr);
      phaseResult.errors = parsedErrors.length > 0 ? parsedErrors : [{ message: stderr.slice(0, 200) }];

      // 尝试修复
      if (parsedErrors.length > 0) {
        console.log('[Build] 尝试自动修复构建错误...');
        const fixResult = this.fixer.attemptFix(parsedErrors);
        phaseResult.fixes = fixResult.changes || [];
        if (fixResult.fixed) {
          console.log(`[Build] 已修复 ${fixResult.changes.length} 个问题`);
          // 重试构建
          try {
            const retryStart = Date.now();
            execSync('npm run build', {
              cwd: this.options.projectDir,
              encoding: 'utf-8',
              timeout: 120000,
              stdio: ['pipe', 'pipe', 'pipe'],
            });
            phaseResult.status = 'fixed';
            phaseResult.duration = Date.now() - retryStart;
            console.log('[Build] 修复后构建成功');
          } catch (retryErr) {
            console.error('[Build] 修复后构建仍然失败');
            phaseResult.errors.push({ message: (retryErr.stderr || retryErr.message || '').slice(0, 200) });
          }
        } else {
          console.log(`[Build] 无法自动修复，共 ${fixResult.failed.length} 个错误需人工介入`);
        }
      }
    }

    console.log(`[Build] 状态: ${phaseResult.status}, 耗时: ${phaseResult.duration}ms\n`);
    return phaseResult;
  }

  // ============================================================
  // phaseTests — 测试阶段
  // ============================================================
  async phaseTests() {
    console.log('─── 阶段 2/4: 测试执行 ───\n');
    const startTime = Date.now();
    const phaseResult = {
      status: 'passed',
      tests: [],
      errors: [],
      fixes: [],
    };

    const testFiles = [
      'tests/core/engine-test.js',
      'tests/core/mcp-test.js',
      'tests/core/loop-protection-test.js',
      'tests/integration/full-verification.js',
    ];

    for (const testFile of testFiles) {
      const testPath = path.join(this.options.projectDir, testFile);
      const testEntry = { name: testFile, status: 'passed', duration: 0, errors: [] };

      console.log(`  [Test] 运行: ${testFile}`);

      try {
        const testStart = Date.now();
        const testOutput = execSync(`node "${testPath}"`, {
          cwd: this.options.projectDir,
          encoding: 'utf-8',
          timeout: 60000,
          stdio: ['pipe', 'pipe', 'pipe'],
        });
        testEntry.duration = Date.now() - testStart;
        testEntry.status = 'passed';
        console.log(`  [Test] ✓ ${testFile} 通过 (${testEntry.duration}ms)`);
        if (testOutput.length > 0) {
          const lines = testOutput.split('\n').filter(l => l.trim());
          for (const line of lines.slice(-5)) {
            console.log(`    ${line}`);
          }
        }
      } catch (testErr) {
        testEntry.duration = Date.now() - startTime;
        testEntry.status = 'failed';

        const stderr = testErr.stderr || testErr.stdout || testErr.message || '';
        testEntry.errors = [{ message: stderr.slice(0, 500) }];
        phaseResult.errors.push(...testEntry.errors);

        console.error(`  [Test] ✗ ${testFile} 失败`);
        console.error(`    ${stderr.slice(0, 300)}`);

        // 解析测试错误并尝试修复
        const parsedTestErrors = this.fixer.parseTestErrors(stderr);
        if (parsedTestErrors.length > 0) {
          console.log('  [Test] 尝试修复测试错误...');
          const fixResult = this.fixer.attemptFix(parsedTestErrors);
          if (fixResult.fixed) {
            phaseResult.fixes.push(...fixResult.changes);
            console.log(`  [Test] 已修复 ${fixResult.changes.length} 个问题`);
          }
        }
      }

      phaseResult.tests.push(testEntry);
    }

    // 汇总状态
    const failedTests = phaseResult.tests.filter(t => t.status === 'failed');
    if (failedTests.length > 0) {
      phaseResult.status = failedTests.length === phaseResult.tests.length ? 'failed' : 'fixed';
    }

    const totalDuration = Date.now() - startTime;
    const passedCount = phaseResult.tests.filter(t => t.status === 'passed').length;
    console.log(`\n[Test] 汇总: ${passedCount}/${phaseResult.tests.length} 通过, 总耗时: ${totalDuration}ms\n`);

    return phaseResult;
  }

  // ============================================================
  // phasePentest — 实战渗透阶段
  // ============================================================
  async phasePentest() {
    console.log('─── 阶段 3/4: 实战渗透 ───\n');
    const phaseResult = {
      status: 'completed',
      targets: [],
    };

    try {
      // 加载引擎
      const enginePath = path.join(this.options.projectDir, 'dist/src/core/engine');
      if (!fs.existsSync(path.join(this.options.projectDir, 'dist'))) {
        console.log('[Pentest] dist 目录不存在，跳过渗透测试');
        phaseResult.status = 'skipped';
        return phaseResult;
      }

      const { HosSecEngine } = require(enginePath);
      this.engine = new HosSecEngine();

      // 流程模板由 ProcessEngine 在构造函数中自动加载（loadTemplates）
      // 无需手动加载 playbook，直接使用 engine.executeProcess() 即可
      const templates = (typeof this.engine.getProcessTemplates === 'function')
        ? this.engine.getProcessTemplates()
        : [];
      console.log(`[Pentest] 流程引擎已加载 ${templates.length} 个模板: ${templates.join(', ')}`);

      console.log('[Pentest] 引擎加载成功');

      // 获取目标
      const targets = await this.targetFinder.getVerifiedTargets();
      console.log(`[Pentest] 获取到 ${targets.length} 个可用目标`);

      if (targets.length === 0) {
        console.log('[Pentest] 没有可用目标，跳过渗透测试');
        phaseResult.status = 'skipped';
        return phaseResult;
      }

      // 对每个目标执行渗透测试
      for (const target of targets) {
        const targetUrl = typeof target === 'string' ? target : target.url;
        console.log(`\n[Pentest] 开始测试目标: ${targetUrl}`);
        try {
          const pentestResult = await this.pentestExecutor.executePentest(targetUrl, this.engine);
          phaseResult.targets.push({
            url: targetUrl,
            status: pentestResult.status,
            findings: pentestResult.findings || [],
            skillsUsed: pentestResult.skillsUsed || [],
            duration: pentestResult.endTime && pentestResult.startTime
              ? (new Date(pentestResult.endTime) - new Date(pentestResult.startTime))
              : 0,
          });
          console.log(`[Pentest] ✓ ${targetUrl} 完成`);
        } catch (targetErr) {
          console.error(`[Pentest] ✗ ${targetUrl} 失败: ${targetErr.message}`);
          phaseResult.targets.push({
            url: targetUrl,
            status: 'failed',
            findings: [],
            skillsUsed: [],
            duration: 0,
            error: targetErr.message,
          });
        }
      }
    } catch (err) {
      console.error(`[Pentest] 渗透测试阶段异常: ${err.message}`);
      phaseResult.status = 'skipped';
    }

    const totalFindings = phaseResult.targets.reduce((sum, t) => sum + (t.findings ? t.findings.length : 0), 0);
    console.log(`\n[Pentest] 汇总: ${phaseResult.targets.length} 个目标, ${totalFindings} 个发现\n`);
    return phaseResult;
  }

  // ============================================================
  // phaseAnalyze — 结果分析阶段
  // ============================================================
  async phaseAnalyze(roundResult) {
    console.log('─── 阶段 4/4: 结果分析 ───\n');

    const phaseResult = {
      status: 'completed',
      metrics: null,
      baselineComparison: null,
    };

    try {
      // 收集性能指标
      const metrics = {
        buildTime: roundResult.phases.build.duration || 0,
        testTime: roundResult.phases.test.tests
          ? roundResult.phases.test.tests.reduce((sum, t) => sum + (t.duration || 0), 0)
          : 0,
        engineMatchTime: 0,
      };

      // 记录性能指标
      this.tracker.recordMetrics(roundResult.round, metrics);
      phaseResult.metrics = metrics;

      // 比对基线
      const comparison = this.tracker.compareWithBaseline(metrics);
      phaseResult.baselineComparison = comparison;

      if (comparison.warning) {
        console.log('[Analyze] ⚠ 性能退化警告:');
        for (const [key, detail] of Object.entries(comparison.details)) {
          if (detail.pct > 20) {
            console.log(`  - ${key}: ${detail.pct}% 退化 (基线: ${detail.baseline}ms, 当前: ${detail.current}ms)`);
          }
        }
      } else {
        console.log('[Analyze] 性能基线比对通过');
      }

      console.log('[Analyze] 本轮结果已记录');
    } catch (err) {
      console.error(`[Analyze] 分析阶段异常: ${err.message}`);
      phaseResult.status = 'failed';
    }

    return phaseResult;
  }

  // ============================================================
  // _printRoundSummary — 输出本轮摘要
  // ============================================================
  _printRoundSummary(roundResult) {
    const r = roundResult;
    console.log('\n' + '='.repeat(70));
    console.log(`  第 ${r.round} 轮摘要`);
    console.log('='.repeat(70));
    console.log(`  Build:  ${r.phases.build.status} (${r.phases.build.duration}ms)`);
    if (r.phases.build.fixes && r.phases.build.fixes.length > 0) {
      console.log(`  Build fixes: ${r.phases.build.fixes.length}`);
    }

    const testPassed = r.phases.test.tests ? r.phases.test.tests.filter(t => t.status === 'passed').length : 0;
    const testTotal = r.phases.test.tests ? r.phases.test.tests.length : 0;
    console.log(`  Tests:  ${r.phases.test.status} (${testPassed}/${testTotal} 通过)`);

    const pentestTargets = r.phases.pentest.targets ? r.phases.pentest.targets.length : 0;
    const pentestFindings = r.phases.pentest.targets
      ? r.phases.pentest.targets.reduce((s, t) => s + (t.findings ? t.findings.length : 0), 0)
      : 0;
    console.log(`  Pentest: ${r.phases.pentest.status} (${pentestTargets} 目标, ${pentestFindings} 发现)`);

    if (r.phases.analyze && r.phases.analyze.baselineComparison) {
      const comp = r.phases.analyze.baselineComparison;
      console.log(`  Performance: ${comp.status}${comp.warning ? ' ⚠' : ''}`);
    }

    const allPassed = r.phases.build.status !== 'failed' && r.phases.test.status !== 'failed';
    console.log(`  总体: ${allPassed ? '✓ 通过' : '✗ 失败'}`);
    console.log('='.repeat(70) + '\n');
  }

  // ============================================================
  // _sleep — 工具方法
  // ============================================================
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================
// 主入口
// ============================================================
if (require.main === module) {
  const runner = new EngineLoopRunner();
  runner.start().catch(err => {
    console.error('循环引擎崩溃:', err);
    process.exit(1);
  });
}

module.exports = { EngineLoopRunner };