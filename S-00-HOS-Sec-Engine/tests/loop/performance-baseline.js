/**
 * HOS-Sec-Engine 循环测试 — 性能基线模块
 * 采集性能指标、与基线比对、持久化存储基线数据
 */
const fs = require('fs');
const path = require('path');

const BASELINE_FILE = path.resolve(__dirname, 'performance-baseline.json');

class PerformanceTracker {
  constructor(baselinePath) {
    this._baselinePath = baselinePath || BASELINE_FILE;
    this._baseline = null;
    this._loadBaseline();
  }

  /**
   * 从磁盘加载基线数据
   */
  _loadBaseline() {
    try {
      if (fs.existsSync(this._baselinePath)) {
        const raw = fs.readFileSync(this._baselinePath, 'utf-8');
        this._baseline = JSON.parse(raw);
      }
    } catch (err) {
      console.warn(`[PerformanceTracker] 基线文件读取失败: ${err.message}`);
      this._baseline = null;
    }
  }

  /**
   * 将基线数据持久化到磁盘
   */
  _saveBaseline() {
    try {
      const dir = path.dirname(this._baselinePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this._baselinePath, JSON.stringify(this._baseline, null, 2), 'utf-8');
    } catch (err) {
      console.warn(`[PerformanceTracker] 基线文件写入失败: ${err.message}`);
    }
  }

  /**
   * 记录本轮性能指标，并更新基线
   * @param {number} roundNum   - 轮次编号
   * @param {object} metrics    - 性能指标
   * @param {number} metrics.buildTime       - 构建耗时（ms）
   * @param {number} metrics.testTime        - 测试耗时（ms）
   * @param {number} metrics.engineMatchTime - 引擎100次匹配耗时（ms）
   */
  recordMetrics(roundNum, metrics) {
    const entry = {
      round: roundNum,
      timestamp: new Date().toISOString(),
      metrics: {
        buildTime: metrics.buildTime,
        testTime: metrics.testTime,
        engineMatchTime: metrics.engineMatchTime,
      },
    };

    // 更新基线为最新一轮数据
    this._baseline = entry;
    this._saveBaseline();
  }

  /**
   * 将当前指标与基线比对
   * @param {object} metrics - 待比对的性能指标（字段同 recordMetrics）
   * @returns {{ status: string, warning: boolean, details: object }}
   *   status: 'unchanged' | 'improved' | 'degraded'
   *   warning: true 当任意指标退化超过 20%
   *   details: 各指标的退化/提升百分比
   */
  compareWithBaseline(metrics) {
    if (!this._baseline) {
      return {
        status: 'unchanged',
        warning: false,
        details: { message: '无基线数据，跳过比对' },
      };
    }

    const baseline = this._baseline.metrics;
    const details = {};
    let hasDegraded = false;
    let hasImproved = false;

    const keys = ['buildTime', 'testTime', 'engineMatchTime'];
    for (const key of keys) {
      if (metrics[key] == null || baseline[key] == null) {
        details[key] = { message: '缺少数据，无法比对' };
        continue;
      }
      const diff = metrics[key] - baseline[key];
      const pct = baseline[key] > 0 ? (diff / baseline[key]) * 100 : 0;
      details[key] = {
        baseline: baseline[key],
        current: metrics[key],
        diff: Math.round(diff * 100) / 100,
        pct: Math.round(pct * 100) / 100,
      };
      if (pct > 20) {
        hasDegraded = true;
      }
      if (pct < -5) {
        hasImproved = true;
      }
    }

    let status;
    if (hasDegraded) {
      status = 'degraded';
    } else if (hasImproved) {
      status = 'improved';
    } else {
      status = 'unchanged';
    }

    return {
      status,
      warning: hasDegraded,
      details,
    };
  }

  /**
   * 获取当前基线数据
   * @returns {object|null} 基线对象，无基线时返回 null
   */
  getBaseline() {
    return this._baseline ? { ...this._baseline } : null;
  }
}

module.exports = { PerformanceTracker };