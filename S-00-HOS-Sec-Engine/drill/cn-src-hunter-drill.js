#!/usr/bin/env node
/**
 * HOS-Sec-Engine 演练脚本: CN-SRC 漏洞赏金流程
 * 
 * 演示 cn-src-hunter.yaml 模板的完整执行流程：
 *   合规红线 → 情报采集 → 数据结构化 → 目标评分 → 攻击面分析 → 漏洞挖掘 → 报告提交
 * 
 * Usage: node drill/cn-src-hunter-drill.js [platform_name]
 * 演示平台: 使用通用 SRC 平台作为演练示例
 */

const path = require('path');
const fs = require('fs');

const ENGINE_DIR = path.resolve(__dirname, '..');
const REPORTS_DIR = path.join(ENGINE_DIR, 'reports');

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const DEFAULT_PLATFORM = 'demo-src-platform';
const PROCESS_TYPE = 'cn-src-hunter';

function printBanner() {
  const platform = process.argv[2] || DEFAULT_PLATFORM;
  const platformLen = platform.length;
  const padLen = Math.max(0, 52 - platformLen);
  const pad = ' '.repeat(padLen);

  console.log(`
${COLORS.cyan}${COLORS.bright}
╔══════════════════════════════════════════════════════════════════╗
║       HOS-Sec-Engine 演练: CN-SRC 漏洞赏金流程                   ║
║                                                                  ║
║  平台: ${platform}${pad}║
║  流程: cn-src-hunter.yaml (CN-SRC 漏洞赏金方法论)                 ║
║  阶段: 合规红线 → 情报采集 → 评分 → 攻击面 → 挖掘 → 提交         ║
╚══════════════════════════════════════════════════════════════════╝
${COLORS.reset}`);
}

function printPhaseFlow() {
  console.log(`${COLORS.magenta}${COLORS.bright}7 阶段流水线:${COLORS.reset}`);
  const phases = [
    { id: 'compliance-gate', name: '合规红线检查', desc: '身份授权、项目边界、行为准则确认' },
    { id: 'intel-gathering', name: '项目情报采集', desc: 'SRC 平台项目信息、奖励等级、范围描述' },
    { id: 'data-structuring', name: '数据结构化', desc: '字段映射、数据清洗、去重合并' },
    { id: 'target-scoring', name: '目标评分排序', desc: '7 维度评分模型、优先级排序、高价值识别' },
    { id: 'attack-surface-analysis', name: '攻击面分析', desc: '资产发现、技术栈识别、暴露面测绘' },
    { id: 'vulnerability-research', name: '漏洞挖掘与验证', desc: '漏洞研究、PoC 构造、AI 辅助验证' },
    { id: 'submission-tracking', name: '报告生成与提交', desc: '结构化报告、提交跟踪、赏金管理' },
  ];
  for (let i = 0; i < phases.length; i++) {
    const p = phases[i];
    const num = String(i + 1).padStart(2, '0');
    console.log(`  ${COLORS.dim}${num}.▸${COLORS.reset} ${COLORS.cyan}${p.name}${COLORS.reset} ${COLORS.dim}(${p.id})${COLORS.reset}`);
    console.log(`      ${COLORS.dim}${p.desc}${COLORS.reset}`);
  }
  console.log('');
}

function printPythonTools() {
  console.log(`${COLORS.magenta}${COLORS.bright}Python 工具链演示:${COLORS.reset}`);
  const tools = [
    ['fetch_intel.py', '项目情报采集', '采集 SRC 平台公开项目信息'],
    ['build_programs.py', '数据结构化', '原始情报清洗与标准化'],
    ['target_score.py', '目标评分', '7 维度评分模型 (赏金/等级/范围/活跃度/攻击面/技术栈/竞争度)'],
  ];
  for (const [script, name, desc] of tools) {
    console.log(`  ${COLORS.green}🛠${COLORS.reset} ${COLORS.cyan}${script}${COLORS.reset} ${COLORS.dim}— ${name}: ${desc}${COLORS.reset}`);
  }
  console.log('');
}

function printScoringModel() {
  console.log(`${COLORS.magenta}${COLORS.bright}7 维度评分模型 (100 分制):${COLORS.reset}`);
  const dims = [
    ['现金赏金 (cash)', 20, '项目赏金金额等级'],
    ['漏洞等级 (level)', 15, '漏洞评级体系完善度'],
    ['范围广度 (scope)', 15, '允许测试的资产范围'],
    ['项目活跃度 (activity)', 15, '项目更新频率和响应速度'],
    ['攻击面丰富度 (attack)', 15, '可用攻击面数量和类型'],
    ['技术栈复杂度 (tech)', 10, '涉及技术栈的复杂性'],
    ['竞争度 (competition)', 10, '研究者数量和竞争程度'],
  ];
  let total = 0;
  for (const [name, weight, desc] of dims) {
    total += weight;
    const bar = '█'.repeat(Math.round(weight / 2));
    console.log(`  ${COLORS.dim}${bar}${COLORS.reset} ${COLORS.cyan}${name}${COLORS.reset} ${COLORS.yellow}${weight}分${COLORS.reset} ${COLORS.dim}— ${desc}${COLORS.reset}`);
  }
  console.log(`  ${COLORS.dim}─────────────────────────────────────────────────────${COLORS.reset}`);
  console.log(`  ${COLORS.bright}总分: ${total} 分${COLORS.reset}`);
  console.log('');
}

async function loadAndVerifyEngine() {
  console.log(`${COLORS.yellow}[*]${COLORS.reset} 加载 HOS-Sec-Engine...`);

  const enginePath = path.join(ENGINE_DIR, 'dist', 'src', 'core', 'engine');
  let HosSecEngine;
  try {
    ({ HosSecEngine } = require(enginePath));
  } catch (e) {
    console.log(`${COLORS.red}[✗]${COLORS.reset} 引擎加载失败: ${e.message}`);
    console.log(`${COLORS.yellow}[!]${COLORS.reset} 请先执行: npm run build`);
    return null;
  }

  const engine = new HosSecEngine();
  const templates = engine.getProcessTemplates();
  console.log(`${COLORS.green}[✓]${COLORS.reset} 引擎已加载，可用模板: ${templates.join(', ')}`);

  if (!templates.includes(PROCESS_TYPE)) {
    console.log(`${COLORS.red}[✗]${COLORS.reset} 模板 ${PROCESS_TYPE} 未加载`);
    return null;
  }

  console.log(`${COLORS.green}[✓]${COLORS.reset} 模板 ${PROCESS_TYPE} 已就绪`);
  return engine;
}

async function runDrill(engine, platform) {
  const startTime = Date.now();
  const target = `SRC平台: ${platform}`;

  console.log(`\n${COLORS.cyan}${COLORS.bright}${'='.repeat(70)}${COLORS.reset}`);
  console.log(`${COLORS.bright}开始 CN-SRC 漏洞赏金流程演练${COLORS.reset}`);
  console.log(`${COLORS.dim}目标: ${target}${COLORS.reset}`);
  console.log(`${COLORS.dim}流程: ${PROCESS_TYPE}${COLORS.reset}`);
  console.log(`${COLORS.dim}时间: ${new Date().toISOString()}${COLORS.reset}`);
  console.log(`${COLORS.cyan}${COLORS.bright}${'='.repeat(70)}${COLORS.reset}\n`);

  let result;
  try {
    result = await engine.executeProcess(target, PROCESS_TYPE);
  } catch (error) {
    console.log(`${COLORS.red}[✗]${COLORS.reset} 流程执行异常: ${error.message}`);
    return { error, duration: Date.now() - startTime };
  }

  const duration = Date.now() - startTime;
  console.log(`\n${COLORS.green}${COLORS.bright}✓ 赏金流程演练完成${COLORS.reset}`);
  console.log(`${COLORS.dim}总耗时: ${duration}ms${COLORS.reset}`);

  return { result, duration };
}

function printPhaseResults(result) {
  const phaseResults = result.phaseResults || [];
  const summary = result.summary || {};

  console.log(`\n${COLORS.cyan}${COLORS.bright}${'='.repeat(70)}${COLORS.reset}`);
  console.log(`${COLORS.bright}各阶段执行结果${COLORS.reset}`);
  console.log(`${COLORS.cyan}${COLORS.bright}${'='.repeat(70)}${COLORS.reset}\n`);

  for (const phase of phaseResults) {
    const icon = phase.status === 'success' ? `${COLORS.green}✓${COLORS.reset}`
      : phase.status === 'failure' ? `${COLORS.red}✗${COLORS.reset}`
      : phase.status === 'skipped' ? `${COLORS.yellow}⊘${COLORS.reset}`
      : `${COLORS.yellow}~${COLORS.reset}`;

    console.log(`  ${icon} ${COLORS.bright}${phase.phaseId}${COLORS.reset}: ${phase.status} ${COLORS.dim}(${phase.duration}ms)${COLORS.reset}`);

    if (phase.findings && phase.findings.length > 0) {
      for (const f of phase.findings) {
        const color = f.severity === 'critical' ? COLORS.red
          : f.severity === 'high' ? COLORS.yellow
          : f.severity === 'medium' ? COLORS.cyan
          : COLORS.green;
        console.log(`     ${color}• [${f.severity}]${COLORS.reset} ${COLORS.dim}${f.description || '(无描述)'}${COLORS.reset}`);
      }
    }
  }

  console.log(`\n${COLORS.cyan}${COLORS.bright}${'='.repeat(70)}${COLORS.reset}`);
  console.log(`${COLORS.bright}赏金流程摘要${COLORS.reset}`);
  console.log(`${COLORS.cyan}${COLORS.bright}${'='.repeat(70)}${COLORS.reset}`);
  console.log(`  目标项目数:   ${summary.totalFindings || 0}`);
  console.log(`  ${COLORS.red}严重漏洞:     ${summary.criticalCount || 0}${COLORS.reset}`);
  console.log(`  ${COLORS.yellow}高危漏洞:     ${summary.highCount || 0}${COLORS.reset}`);
  console.log(`  ${COLORS.cyan}中危漏洞:     ${summary.mediumCount || 0}${COLORS.reset}`);
  console.log(`  ${COLORS.green}低危漏洞:     ${summary.lowCount || 0}${COLORS.reset}`);
  console.log(`  CVE 关联数:   ${summary.cveReferences || 0}`);
  console.log(`  已执行阶段:   ${phaseResults.length}`);
  console.log('');
}

function generateHtmlReport(result, duration, platform) {
  const phaseResults = result.phaseResults || [];
  const summary = result.summary || {};

  fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const phaseRows = phaseResults.map(phase => {
    const icon = phase.status === 'success' ? '✅'
      : phase.status === 'failure' ? '❌'
      : phase.status === 'skipped' ? '⏭️'
      : '⚠️';

    const findingsList = (phase.findings || []).map(f =>
      `<li><strong class="sev-${f.severity}">[${f.severity}]</strong> ${f.description || '(无描述)'}</li>`
    ).join('');

    return `<tr>
      <td>${icon} ${phase.phaseId}</td>
      <td>${phase.status}</td>
      <td>${phase.duration}ms</td>
      <td>${findingsList ? `<ul>${findingsList}</ul>` : '<span class="muted">无</span>'}</td>
    </tr>`;
  }).join('\n');

  const htmlPath = path.join(REPORTS_DIR, `cn-src-hunter-drill-${Date.now()}.html`);
  const now = new Date().toISOString();

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>HOS-Sec-Engine CN-SRC 漏洞赏金演练报告</title>
<style>
  :root { --bg:#0f1117; --card:#161b22; --border:#30363d; --text:#e6edf3; --muted:#8b949e; --accent:#3ddc97; --critical:#ff4d4f; --high:#ff8c42; --medium:#ffd166; --low:#58a6ff; }
  body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC',sans-serif; background:var(--bg); color:var(--text); padding:24px; max-width:1200px; margin:0 auto; }
  h1 { color:var(--accent); border-bottom:2px solid var(--border); padding-bottom:12px; }
  h2 { color:var(--muted); margin-top:32px; }
  .meta { display:flex; gap:16px; flex-wrap:wrap; margin:16px 0; }
  .meta-item { background:var(--card); padding:8px 16px; border-radius:6px; font-size:13px; }
  .stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:12px; margin:24px 0; }
  .stat { background:var(--card); padding:20px; border-radius:8px; text-align:center; border:1px solid var(--border); }
  .stat .value { font-size:32px; font-weight:700; }
  .stat .label { color:var(--muted); font-size:12px; text-transform:uppercase; }
  .critical { color:var(--critical); } .high { color:var(--high); } .medium { color:var(--medium); } .low { color:var(--low); }
  table { width:100%; border-collapse:collapse; margin:16px 0; background:var(--card); border-radius:8px; overflow:hidden; }
  th, td { padding:12px 16px; text-align:left; border-bottom:1px solid var(--border); }
  th { background:#0d1117; color:var(--muted); font-weight:600; text-transform:uppercase; font-size:12px; }
  .sev-critical { color:var(--critical); font-weight:600; }
  .sev-high { color:var(--high); font-weight:600; }
  .sev-medium { color:var(--medium); font-weight:600; }
  .sev-low { color:var(--low); font-weight:600; }
  ul { margin:0; padding-left:20px; }
  .muted { color:var(--muted); }
  .pipeline { display:flex; gap:4px; flex-wrap:wrap; margin:16px 0; }
  .pipe-step { background:var(--card); padding:8px 12px; border-radius:16px; font-size:12px; border:1px solid var(--border); }
  .pipe-step.active { background:var(--accent); color:var(--bg); border-color:var(--accent); font-weight:600; }
  .recs { background:var(--card); border-left:4px solid var(--accent); padding:16px 20px; border-radius:4px; margin:16px 0; }
  .recs li { margin:8px 0; }
  .footer { margin-top:40px; padding-top:20px; border-top:1px solid var(--border); color:var(--muted); font-size:12px; text-align:center; }
  .warning { background:rgba(255,77,79,0.1); border:1px solid rgba(255,77,79,0.3); padding:12px 16px; border-radius:8px; margin:16px 0; color:var(--critical); font-size:13px; }
</style>
</head>
<body>
<h1>🏆 HOS-Sec-Engine — CN-SRC 漏洞赏金演练报告</h1>

<div class="warning">
  ⚠️ <strong>合规声明</strong>：本工具仅限在获得书面授权的 SRC 项目范围内使用。未经授权的测试行为可能违反《中华人民共和国网络安全法》等法律法规，请确保已在授权范围内开展测试。
</div>

<div class="meta">
  <div class="meta-item">🏢 SRC 平台: <strong>${platform}</strong></div>
  <div class="meta-item">📋 流程: <strong>${PROCESS_TYPE}</strong></div>
  <div class="meta-item">⏱️ 耗时: <strong>${duration}ms</strong></div>
  <div class="meta-item">🕐 时间: <strong>${now}</strong></div>
</div>

<h2>🔄 7 阶段流水线</h2>
<div class="pipeline">
  <span class="pipe-step active">① 合规红线</span>
  <span class="pipe-step active">② 情报采集</span>
  <span class="pipe-step active">③ 数据结构化</span>
  <span class="pipe-step active">④ 目标评分</span>
  <span class="pipe-step active">⑤ 攻击面分析</span>
  <span class="pipe-step">⑥ 漏洞挖掘</span>
  <span class="pipe-step">⑦ 报告提交</span>
</div>

<h2>📊 赏金流程摘要</h2>
<div class="stats">
  <div class="stat"><div class="value">${summary.totalFindings || 0}</div><div class="label">发现总数</div></div>
  <div class="stat"><div class="value critical">${summary.criticalCount || 0}</div><div class="label">严重</div></div>
  <div class="stat"><div class="value high">${summary.highCount || 0}</div><div class="label">高危</div></div>
  <div class="stat"><div class="value medium">${summary.mediumCount || 0}</div><div class="label">中危</div></div>
  <div class="stat"><div class="value low">${summary.lowCount || 0}</div><div class="label">低危</div></div>
  <div class="stat"><div class="value" style="color:var(--accent)">${phaseResults.length}</div><div class="label">完成阶段</div></div>
</div>

<h2>📋 各阶段执行详情</h2>
<table>
  <thead><tr><th>阶段</th><th>状态</th><th>耗时</th><th>发现</th></tr></thead>
  <tbody>${phaseRows}</tbody>
</table>

<h2>💡 SRC 赏金策略建议</h2>
<div class="recs">
  <ul>
    <li><strong>目标选择</strong>：优先选择评分 ≥ 70 分的项目，高赏金 + 活跃响应的项目 ROI 更高</li>
    <li><strong>攻击面分析</strong>：重点关注业务逻辑复杂、资产范围广、技术栈新的项目</li>
    <li><strong>漏洞挖掘</strong>：从 OWASP Top 10 出发，结合业务场景寻找逻辑漏洞和越权场景</li>
    <li><strong>报告撰写</strong>：清晰描述漏洞原理、影响范围、复现步骤和修复建议，提高通过率</li>
    <li><strong>时间管理</strong>：在 SRC 平台的活跃响应时间段内提交报告，加快处理速度</li>
  </ul>
</div>

<h2>🛠 Python 工具链</h2>
<p class="muted">位于 <code>scripts/cn-src-hunter/</code> 目录：</p>
<ul>
  <li><code>fetch_intel.py</code> — 情报采集</li>
  <li><code>build_programs.py</code> — 数据结构化</li>
  <li><code>target_score.py</code> — 目标评分</li>
</ul>

<div class="footer">
  本报告由 HOS-Sec-Engine v0.5.1 自动生成 · ${now}<br>
  CN-SRC 漏洞赏金流程 · 仅限授权测试 · 测试结果需人工复核
</div>
</body>
</html>`;

  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log(`${COLORS.green}[+]${COLORS.reset} HTML 报告已保存: ${htmlPath}`);
  return htmlPath;
}

async function main() {
  const platform = process.argv[2] || DEFAULT_PLATFORM;
  printBanner();
  printPhaseFlow();
  printPythonTools();
  printScoringModel();

  const engine = await loadAndVerifyEngine();
  if (!engine) {
    console.log(`\n${COLORS.dim}提示: 运行演练前需要先构建引擎${COLORS.reset}`);
    console.log(`${COLORS.dim}  cd S-00-HOS-Sec-Engine${COLORS.reset}`);
    console.log(`${COLORS.dim}  npm install && npm run build${COLORS.reset}`);
    process.exit(1);
  }

  const { result, duration, error } = await runDrill(engine, platform);

  if (error) {
    console.log(`\n${COLORS.red}演练失败: ${error.message}${COLORS.reset}`);
    process.exit(1);
  }

  printPhaseResults(result);

  const reportPath = generateHtmlReport(result, duration, platform);

  console.log(`${COLORS.cyan}${COLORS.bright}${'='.repeat(70)}${COLORS.reset}`);
  console.log(`${COLORS.bright}CN-SRC 漏洞赏金演练完成!${COLORS.reset}`);
  console.log(`${COLORS.cyan}${COLORS.bright}${'='.repeat(70)}${COLORS.reset}`);
  console.log(`  ${COLORS.dim}报告文件: ${reportPath}${COLORS.reset}`);
  console.log(`  ${COLORS.dim}下一步: 打开 HTML 报告查看详情或接入 Python 工具链${COLORS.reset}`);
  console.log('');
  console.log(`${COLORS.yellow}${COLORS.bright}合规提示:${COLORS.reset}`);
  console.log(`${COLORS.dim}  • 仅限在书面授权的 SRC 项目范围内使用本工具${COLORS.reset}`);
  console.log(`${COLORS.dim}  • 未经授权的测试行为可能违反相关法律法规${COLORS.reset}`);
  console.log(`${COLORS.dim}  • 测试结果需经人工复核后提交${COLORS.reset}`);
  console.log('');
}

main().catch(err => {
  console.error(`${COLORS.red}[ERROR]${COLORS.reset} ${err.message}`);
  process.exit(1);
});
