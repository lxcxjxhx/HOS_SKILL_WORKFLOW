/**
 * HOS-Sec-Engine 循环测试结果记录模块
 * 结构化记录每轮循环结果，支持日志轮转与摘要生成
 */
const fs = require('fs');
const path = require('path');

const MAX_RESULT_FILES = 50;

class ResultLogger {
  /**
   * @param {string} [resultsDir] - 结果文件保存目录，默认 tests/loop/results/
   */
  constructor(resultsDir) {
    this.resultsDir = resultsDir || path.join(__dirname, 'results');
    if (!fs.existsSync(this.resultsDir)) {
      fs.mkdirSync(this.resultsDir, { recursive: true });
    }
  }

  /**
   * 记录一轮循环结果
   * @param {number} roundNumber - 轮次号
   * @param {Object} phases - 各阶段状态 { build, test, verify, pentest }
   * @param {Object} [phases.build] - 构建阶段
   * @param {string} phases.build.status - 状态: passed / failed / skipped
   * @param {string} [phases.build.error] - 错误详情
   * @param {number} [phases.build.duration] - 耗时(ms)
   * @param {Object} [phases.test] - 测试阶段
   * @param {Object} [phases.verify] - 验证阶段
   * @param {Object} [phases.pentest] - 渗透测试阶段
   * @returns {string} 保存的文件名
   */
  logRound(roundNumber, phases) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const record = {
      roundNumber,
      timestamp: new Date().toISOString(),
      phases: {
        build: phases.build || { status: 'skipped' },
        test: phases.test || { status: 'skipped' },
        verify: phases.verify || { status: 'skipped' },
        pentest: phases.pentest || { status: 'skipped' },
      },
    };

    const filename = `round-${roundNumber}-${timestamp}.json`;
    const filepath = path.join(this.resultsDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(record, null, 2), 'utf-8');
    this._rotate();

    return filename;
  }

  /**
   * 获取最近 N 轮结果摘要
   * @param {number} [n=10] - 要获取的轮次数
   * @returns {Object} 摘要信息
   */
  getSummary(n) {
    if (typeof n !== 'number' || n < 1) {
      n = 10;
    }

    const files = this._getResultFiles();
    const recent = files.slice(-n);

    const rounds = recent.map((f) => this._loadRound(f)).filter(Boolean);

    const totalRounds = rounds.length;
    let passedRounds = 0;
    let failedRounds = 0;
    const phaseStats = {
      build: { passed: 0, failed: 0, skipped: 0 },
      test: { passed: 0, failed: 0, skipped: 0 },
      verify: { passed: 0, failed: 0, skipped: 0 },
      pentest: { passed: 0, failed: 0, skipped: 0 },
    };
    const errors = [];
    let totalDuration = 0;
    let durationCount = 0;

    for (const round of rounds) {
      let roundFailed = false;

      for (const [phaseName, phase] of Object.entries(round.phases)) {
        if (phaseStats[phaseName]) {
          phaseStats[phaseName][phase.status] = (phaseStats[phaseName][phase.status] || 0) + 1;
        }

        if (phase.status === 'failed') {
          roundFailed = true;
          errors.push({
            round: round.roundNumber,
            phase: phaseName,
            error: phase.error || '未知错误',
          });
        }

        if (typeof phase.duration === 'number') {
          totalDuration += phase.duration;
          durationCount++;
        }
      }

      if (roundFailed) {
        failedRounds++;
      } else {
        passedRounds++;
      }
    }

    const avgDuration = durationCount > 0 ? Math.round(totalDuration / durationCount) : 0;

    return {
      totalRounds,
      passedRounds,
      failedRounds,
      passRate: totalRounds > 0 ? Math.round((passedRounds / totalRounds) * 100) : 0,
      phaseStats,
      errors,
      avgDuration,
      firstRound: rounds.length > 0 ? rounds[0].roundNumber : null,
      lastRound: rounds.length > 0 ? rounds[rounds.length - 1].roundNumber : null,
      firstTimestamp: rounds.length > 0 ? rounds[0].timestamp : null,
      lastTimestamp: rounds.length > 0 ? rounds[rounds.length - 1].timestamp : null,
    };
  }

  /**
   * 获取结果目录下的所有 .json 文件，按修改时间排序
   * @returns {string[]} 文件名数组，按修改时间升序
   */
  _getResultFiles() {
    if (!fs.existsSync(this.resultsDir)) {
      return [];
    }

    const files = fs.readdirSync(this.resultsDir)
      .filter((f) => f.endsWith('.json') && f.startsWith('round-'))
      .map((f) => ({
        name: f,
        mtime: fs.statSync(path.join(this.resultsDir, f)).mtimeMs,
      }))
      .sort((a, b) => a.mtime - b.mtime);

    return files.map((f) => f.name);
  }

  /**
   * 加载单个轮次结果文件
   * @param {string} filename
   * @returns {Object|null}
   */
  _loadRound(filename) {
    try {
      const filepath = path.join(this.resultsDir, filename);
      const raw = fs.readFileSync(filepath, 'utf-8');
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  /**
   * 日志轮转：只保留最近 MAX_RESULT_FILES 个结果文件，自动清理旧文件
   */
  _rotate() {
    const files = this._getResultFiles();
    if (files.length <= MAX_RESULT_FILES) {
      return;
    }

    const toDelete = files.slice(0, files.length - MAX_RESULT_FILES);
    for (const f of toDelete) {
      try {
        fs.unlinkSync(path.join(this.resultsDir, f));
      } catch {
        // 忽略删除失败
      }
    }
  }
}

module.exports = { ResultLogger };