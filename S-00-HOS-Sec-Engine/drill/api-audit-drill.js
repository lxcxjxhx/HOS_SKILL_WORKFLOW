#!/usr/bin/env node
/**
 * HOS-Sec-Engine 演练脚本: API 安全审计流程
 * 
 * 演示 api-security-audit.yaml 模板的完整执行流程：
 *   认证机制评估 → 授权控制测试 → 输入验证 → 速率限制 → 敏感信息检测 → 报告生成
 * 
 * Usage: node drill/api-audit-drill.js [api_base_url]
 * 演示 API: 使用公共测试 API (jsonplaceholder.typicode.com) 作为演练目标
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

const DEFAULT_TARGET = 'https://jsonplaceholder.typicode.com';
const PROCESS_TYPE = 'api-security-audit';

function printBanner() {
  const target = process.argv[2] || DEFAULT_TARGET;
  const targetLen = target.length;
  const padLen = Math.max(0, 58 - targetLen);
  const pad = ' '.repeat(padLen);

  console.log(`
${COLORS.cyan}${COLORS.bright}
╔══════════════════════════════════════════════════════════════════╗
║          HOS-Sec-Engine 演练: API 安全审计流程                   ║
║                                                                  ║
║  目标: ${target}${pad}║
║  流程: api-security-audit.yaml (API 接口审计方法论)               ║
║  阶段: 认证 → 授权 → 输入验证 → 速率限制 → 敏感信息 → 报告       ║
╚══════════════════════════════════════════════════════════════════╝
${COLORS.reset}`);
}

function printPhaseFlow() {
  console.log(`${COLORS.magenta}${COLORS.bright}审计阶段:${COLORS.reset}`);
  const phases = [
    { id: 'auth-mechanism-testing', name: '认证机制安全评估', desc: 'JWT/OAuth/Session 认证测试、算法混淆、令牌爆破' },
    { id: 'authorization-testing', name: '授权控制有效性评估', desc: '水平/垂直越权、IDOR 漏洞、权限模型分析' },
    { id: 'input-validation-testing', name: '输入验证与注入测试', desc: 'SQL 注入、命令注入、SSRF、路径遍历检测' },
    { id: 'rate-limiting-testing', name: '速率限制与滥用检测', desc: '暴力破解、DDoS、资源耗尽风险评估' },
    { id: 'sensitive-data-detection', name: '敏感信息与数据泄露检测', desc: 'API 响应数据泄露、错误信息分析、调试信息暴露' },
    { id: 'report-generation', name: '报告生成与修复建议', desc: 'API 安全评分、风险分级、修复方案推荐' },
  ];
  for (const p of phases) {
    console.log(`  ${COLORS.dim}▸${COLORS.reset} ${COLORS.cyan}${p.name}${COLORS.reset} ${COLORS.dim}(${p.id})${COLORS.reset}`);
    console.log(`    ${COLORS.dim}${p.desc}${COLORS.reset}`);
  }
  console.log('');
}

function printApiCoverage() {
  console.log(`${COLORS.magenta}${COLORS.bright}API 安全测试覆盖:${COLORS.reset}`);
  const items = [
    ['JWT 安全', '算法混淆 (none/RS256→HS256)、弱密钥、令牌泄露'],
    ['OAuth 流程', 'redirect_uri 绕过、CSRF、scope 越权'],
    ['GraphQL 安全', '内省查询、批量查询 DoS、字段建议'],
    ['IDOR 测试', '对象直接引用、水平/垂直越权、批量越权'],
    ['速率限制', '暴力破解、撞库、资源耗尽'],
    ['CORS 配置', 'Origin 校验、凭证泄露、跨域策略'],
  ];
  for (const [name, desc] of items) {
    console.log(`  ${COLORS.green}✓${COLORS.reset} ${COLORS.cyan}${name}${COLORS.reset}`);
    console.log(`    ${COLORS.dim}${desc}${COLORS.reset}`);
  }
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

async function runDrill(engine, target) {
  const startTime = Date.now();
  console.log(`\n${COLORS.cyan}${COLORS.bright}${'='.repeat(70)}${COLORS.reset}`);
  console.log(`${COLORS.bright}开始 API 安全审计演练${COLORS.reset}`);
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
  console.log(`\n${COLORS.green}${COLORS.bright}✓ 审计完成${COLORS.reset}`);
  console.log(`${COLORS.dim}总耗时: ${duration}ms${COLORS.reset}`);

  return { result, duration };
}

function printPhaseResults(result) {
  const phaseResults = result.phaseResults || [];
  const summary = result.summary || {};

  console.log(`\n${COLORS.cyan}${COLORS.bright}${'='.repeat(70)}${COLORS.reset}`);
  console.log(`${COLORS.bright}审计结果摘要${COLORS.reset}`);
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
  console.log(`${COLORS.bright}API 安全评分${COLORS.reset}`);
  console.log(`${COLORS.cyan}${COLORS.bright}${'='.repeat(70)}${COLORS.reset}`);
  console.log(`  总发现数:     ${summary.totalFindings || 0}`);
  console.log(`  ${COLORS.red}严重:         ${summary.criticalCount || 0}${COLORS.reset}`);
  console.log(`  ${COLORS.yellow}高危:         ${summary.highCount || 0}${COLORS.reset}`);
  console.log(`  ${COLORS.cyan}中危:         ${summary.mediumCount || 0}${COLORS.reset}`);
  console.log(`  ${COLORS.green}低危:         ${summary.lowCount || 0}${COLORS.reset}`);
  console.log(`  CVE 引用:     ${summary.cveReferences || 0}`);
  console.log(`  已执行阶段:   ${phaseResults.length}`);
  console.log('');
}

function generateHtmlReport(result, duration, target) {
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

  const htmlPath = path.join(REPORTS_DIR, `api-audit-drill-${Date.now()}.html`);
  const now = new Date().toISOString();

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>HOS-Sec-Engine API 安全审计演练报告</title>
<style>
  :root { --bg:#0f1117; --card:#161b22; --border:#30363d; --text:#e6edf3; --muted:#8b949e; --accent:#bc8cff; --critical:#ff4d4f; --high:#ff8c42; --medium:#ffd166; --low:#3ddc97; }
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
  .recs { background:var(--card); border-left:4px solid var(--accent); padding:16px 20px; border-radius:4px; margin:16px 0; }
  .recs li { margin:8px 0; }
  .footer { margin-top:40px; padding-top:20px; border-top:1px solid var(--border); color:var(--muted); font-size:12px; text-align:center; }
  .tags { display:flex; gap:8px; flex-wrap:wrap; margin:8px 0; }
  .tag { background:var(--card); padding:4px 10px; border-radius:12px; font-size:12px; border:1px solid var(--border); }
</style>
</head>
<body>
<h1>🔐 HOS-Sec-Engine — API 安全审计演练报告</h1>
<div class="meta">
  <div class="meta-item">🎯 目标 API: <strong>${target}</strong></div>
  <div class="meta-item">📋 流程: <strong>${PROCESS_TYPE}</strong></div>
  <div class="meta-item">⏱️ 耗时: <strong>${duration}ms</strong></div>
  <div class="meta-item">🕐 时间: <strong>${now}</strong></div>
</div>

<h2>🔍 审计范围</h2>
<div class="tags">
  <span class="tag">JWT/OAuth 测试</span>
  <span class="tag">IDOR 越权检测</span>
  <span class="tag">GraphQL 安全</span>
  <span class="tag">速率限制</span>
  <span class="tag">CORS 配置</span>
  <span class="tag">注入测试</span>
</div>

<h2>📊 审计摘要</h2>
<div class="stats">
  <div class="stat"><div class="value">${summary.totalFindings || 0}</div><div class="label">总发现数</div></div>
  <div class="stat"><div class="value critical">${summary.criticalCount || 0}</div><div class="label">严重</div></div>
  <div class="stat"><div class="value high">${summary.highCount || 0}</div><div class="label">高危</div></div>
  <div class="stat"><div class="value medium">${summary.mediumCount || 0}</div><div class="label">中危</div></div>
  <div class="stat"><div class="value low">${summary.lowCount || 0}</div><div class="label">低危</div></div>
  <div class="stat"><div class="value" style="color:var(--accent)">${phaseResults.length}</div><div class="label">已执行阶段</div></div>
</div>

<h2>📋 阶段审计详情</h2>
<table>
  <thead><tr><th>审计阶段</th><th>状态</th><th>耗时</th><th>发现</th></tr></thead>
  <tbody>${phaseRows}</tbody>
</table>

<h2>💡 API 安全加固建议</h2>
<div class="recs">
  <ul>
    <li><strong>认证加固</strong>：JWT 使用 RS256/ES256 非对称算法，密钥长度 ≥ 256 位；OAuth 严格校验 redirect_uri，禁止通配符</li>
    <li><strong>授权控制</strong>：每个 API 端点实施明确的 RBAC/ABAC 权限检查；对 IDOR 场景使用基于资源归属的授权验证</li>
    <li><strong>输入验证</strong>：统一的输入验证层，白名单校验；所有拼接 SQL 使用参数化查询</li>
    <li><strong>速率限制</strong>：基于 IP + 用户双维度限流；对登录、短信、支付等敏感接口采用更严格的阈值</li>
    <li><strong>错误处理</strong>：生产环境不暴露堆栈跟踪、调试信息；使用通用错误码，详细信息记录到服务端日志</li>
  </ul>
</div>

<div class="footer">
  本报告由 HOS-Sec-Engine v0.5.1 自动生成 · ${now}<br>
  API 安全测试结果仅供参考 · 需人工复核 · 仅限授权测试
</div>
</body>
</html>`;

  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log(`${COLORS.green}[+]${COLORS.reset} HTML 报告已保存: ${htmlPath}`);
  return htmlPath;
}

async function main() {
  const target = process.argv[2] || DEFAULT_TARGET;
  printBanner();
  printPhaseFlow();
  printApiCoverage();

  const engine = await loadAndVerifyEngine();
  if (!engine) {
    console.log(`\n${COLORS.dim}提示: 运行演练前需要先构建引擎${COLORS.reset}`);
    console.log(`${COLORS.dim}  cd S-00-HOS-Sec-Engine${COLORS.reset}`);
    console.log(`${COLORS.dim}  npm install && npm run build${COLORS.reset}`);
    process.exit(1);
  }

  const { result, duration, error } = await runDrill(engine, target);

  if (error) {
    console.log(`\n${COLORS.red}审计失败: ${error.message}${COLORS.reset}`);
    process.exit(1);
  }

  printPhaseResults(result);

  const reportPath = generateHtmlReport(result, duration, target);

  console.log(`${COLORS.cyan}${COLORS.bright}${'='.repeat(70)}${COLORS.reset}`);
  console.log(`${COLORS.bright}API 安全审计演练完成!${COLORS.reset}`);
  console.log(`${COLORS.cyan}${COLORS.bright}${'='.repeat(70)}${COLORS.reset}`);
  console.log(`  ${COLORS.dim}报告文件: ${reportPath}${COLORS.reset}`);
  console.log(`  ${COLORS.dim}下一步: 打开 HTML 报告查看审计详情${COLORS.reset}`);
  console.log('');
}

main().catch(err => {
  console.error(`${COLORS.red}[ERROR]${COLORS.reset} ${err.message}`);
  process.exit(1);
});
