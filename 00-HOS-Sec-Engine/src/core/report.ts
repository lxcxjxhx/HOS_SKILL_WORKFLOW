import { OrchestrationResult, Finding } from '../types/playbook';

/**
 * HOS-LS 风格暗色主题安全审计报告 HTML 模板
 * 包含完整 CSS 样式和 JavaScript 交互（Chart.js 图表、筛选、搜索）
 */
const HTML_TEMPLATE_HEAD = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>安全审计报告 - {{PLAYBOOK_NAME}}</title>
<script defer src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js"></script>
<style>
:root {
  --bg-primary: #0f1117;
  --bg-secondary: #161a22;
  --bg-card: #1c2128;
  --critical: #ff4d4f;
  --critical-bg: rgba(255,77,79,0.15);
  --high: #ff8c42;
  --high-bg: rgba(255,140,66,0.15);
  --medium: #ffd166;
  --medium-bg: rgba(255,209,102,0.15);
  --low: #3ddc97;
  --low-bg: rgba(61,220,151,0.15);
  --info: #8b949e;
  --info-bg: rgba(139,148,158,0.15);
  --text-primary: #e6edf3;
  --text-secondary: #8b949e;
  --text-muted: #6e7681;
  --border: rgba(255,255,255,0.08);
  --border-light: rgba(255,255,255,0.12);
  --primary: #6f42c1;
}
* { margin:0; padding:0; box-sizing:border-box; }
body {
  font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  background: var(--bg-primary); color: var(--text-primary); line-height:1.6; min-height:100vh;
}
.container { max-width:1200px; margin:0 auto; padding:24px; }
.ai-disclaimer {
  background:linear-gradient(135deg,rgba(255,209,102,0.15),rgba(255,140,66,0.15));
  border:1px solid rgba(255,209,102,0.3); border-radius:8px; padding:16px 20px;
  margin:20px auto; max-width:1200px; display:flex; align-items:flex-start; gap:12px;
}
.ai-disclaimer .disclaimer-icon { font-size:1.5rem; flex-shrink:0; }
.ai-disclaimer .disclaimer-content { flex:1; }
.ai-disclaimer .disclaimer-title { font-weight:600; color:#ffd166; margin-bottom:4px; }
.ai-disclaimer .disclaimer-text { color:var(--text-secondary); font-size:0.9rem; line-height:1.5; }
.report-header { text-align:center; margin-bottom:24px; }
.report-title {
  font-size:2rem; font-weight:700;
  background:linear-gradient(135deg,var(--primary),#4287f5);
  -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; margin-bottom:8px;
}
.report-meta { color:var(--text-secondary); font-size:0.9rem; }
.status-bar {
  background:var(--bg-secondary); border:1px solid var(--border); border-radius:12px;
  padding:20px 24px; margin-bottom:20px;
  display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px;
}
.status-badge {
  display:inline-flex; align-items:center; gap:8px; padding:8px 16px;
  border-radius:20px; font-weight:600; font-size:1.1rem;
}
.status-badge.safe,.status-badge.low { background:var(--low-bg); color:var(--low); border:1px solid var(--low); }
.status-badge.medium { background:var(--medium-bg); color:var(--medium); border:1px solid var(--medium); }
.status-badge.high { background:var(--high-bg); color:var(--high); border:1px solid var(--high); }
.status-badge.critical { background:var(--critical-bg); color:var(--critical); border:1px solid var(--critical); }
.scan-stats { display:flex; gap:24px; color:var(--text-secondary); font-size:0.9rem; }
.scan-stats span { color:var(--text-primary); font-weight:600; }
.filter-toolbar {
  background:var(--bg-secondary); border:1px solid var(--border); border-radius:10px;
  padding:16px 20px; margin-bottom:20px; display:flex; gap:16px; align-items:center; flex-wrap:wrap;
}
.filter-toolbar label { color:var(--text-secondary); font-size:0.9rem; white-space:nowrap; }
.filter-toolbar select,.filter-toolbar input {
  background:var(--bg-primary); border:1px solid var(--border-light);
  color:var(--text-primary); padding:8px 12px; border-radius:6px; font-size:0.9rem;
}
.filter-toolbar input { flex:1; min-width:200px; }
.summary-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:24px; }
@media (max-width:768px) { .summary-grid { grid-template-columns:1fr; } }
.summary-card { background:var(--bg-secondary); border:1px solid var(--border); border-radius:10px; padding:20px; }
.summary-card h3 { font-size:1rem; color:var(--text-primary); margin-bottom:16px; display:flex; align-items:center; gap:8px; }
.summary-stats { display:flex; flex-direction:column; gap:10px; }
.summary-stats .stat-row { display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--border); }
.summary-stats .stat-row:last-child { border-bottom:none; }
.summary-stats .stat-label { color:var(--text-secondary); font-size:0.9rem; }
.summary-stats .stat-value { font-weight:700; font-size:1.1rem; }
.stat-critical { color:var(--critical); } .stat-high { color:var(--high); } .stat-medium { color:var(--medium); }
.stat-low { color:var(--low); } .stat-info { color:var(--info); }
.chart-wrapper { height:200px; position:relative; }
.section-title { font-size:1.3rem; color:var(--text-primary); margin-bottom:16px; padding-bottom:12px; border-bottom:2px solid var(--primary); display:flex; align-items:center; gap:10px; }
.severity-clusters { margin-bottom:32px; }
.cluster { background:var(--bg-secondary); border:1px solid var(--border); border-radius:10px; margin-bottom:16px; overflow:hidden; }
.cluster-header {
  padding:14px 20px; display:flex; align-items:center; gap:12px;
  cursor:pointer; user-select:none; transition:background 0.2s;
}
.cluster-header:hover { background:rgba(255,255,255,0.02); }
.cluster-icon { font-size:1.2rem; }
.cluster-name { font-weight:600; font-size:1.1rem; text-transform:uppercase; letter-spacing:0.5px; }
.cluster-count { color:var(--text-secondary); font-size:0.9rem; margin-left:auto; }
.cluster-toggle { font-size:0.8rem; color:var(--text-muted); transition:transform 0.2s; }
.cluster[open] .cluster-toggle { transform:rotate(90deg); }
.cluster-critical .cluster-header { color:var(--critical); border-left:4px solid var(--critical); }
.cluster-high .cluster-header { color:var(--high); border-left:4px solid var(--high); }
.cluster-medium .cluster-header { color:var(--medium); border-left:4px solid var(--medium); }
.cluster-low .cluster-header { color:var(--low); border-left:4px solid var(--low); }
.cluster-info .cluster-header { color:var(--info); border-left:4px solid var(--info); }
.cluster-body { padding:16px 20px; border-top:1px solid var(--border); }
.petal-card {
  background:linear-gradient(135deg,var(--bg-card) 0%,var(--bg-secondary) 100%);
  border:1px solid var(--border); border-left:4px solid var(--severity-color,var(--primary));
  border-radius:8px; margin-bottom:12px; transition:all 0.2s ease; overflow:hidden;
}
.petal-card:last-child { margin-bottom:0; }
.petal-card:hover { transform:translateY(-2px); box-shadow:0 4px 16px rgba(0,0,0,0.4); border-color:var(--border-light); }
.petal-card[data-severity="critical"] { --severity-color:var(--critical); }
.petal-card[data-severity="high"] { --severity-color:var(--high); }
.petal-card[data-severity="medium"] { --severity-color:var(--medium); }
.petal-card[data-severity="low"] { --severity-color:var(--low); }
.petal-card.confirmed-finding { border-left:4px solid #22c55e; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(34,197,94,0.05) 100%); }
.petal-header {
  display:flex; align-items:center; padding:12px 16px; gap:12px;
  border-bottom:1px solid var(--border); background:rgba(0,0,0,0.2); flex-wrap:wrap;
}
.severity-badge { padding:4px 10px; border-radius:4px; font-size:0.7rem; font-weight:700; letter-spacing:0.5px; text-transform:uppercase; flex-shrink:0; }
.severity-critical { background:var(--critical-bg); color:var(--critical); }
.severity-high { background:var(--high-bg); color:var(--high); }
.severity-medium { background:var(--medium-bg); color:var(--medium); }
.severity-low { background:var(--low-bg); color:var(--low); }
.severity-info { background:var(--info-bg); color:var(--info); }
.source-badge { padding:2px 8px; border-radius:4px; font-size:0.65rem; font-weight:600; text-transform:uppercase; flex-shrink:0; }
.source-rule_match { background:rgba(255,193,7,0.2); color:#ffc107; border:1px solid rgba(255,193,7,0.3); }
.confidence-badge { padding:3px 10px; border-radius:4px; font-size:0.7rem; font-weight:700; letter-spacing:0.5px; text-transform:uppercase; flex-shrink:0; }
.confidence-high { background:rgba(61,220,151,0.2); color:var(--low); border:1px solid var(--low); }
.confidence-medium { background:rgba(255,209,102,0.2); color:var(--medium); border:1px solid var(--medium); }
.confidence-low { background:rgba(255,77,79,0.2); color:var(--critical); border:1px solid var(--critical); }
.vuln-title { flex:1; font-size:1rem; font-weight:600; color:var(--text-primary); min-width:0; }
.vuln-rule-id { font-size:0.75rem; color:var(--text-muted); font-family:"Consolas","Monaco",monospace; background:rgba(0,0,0,0.3); padding:2px 8px; border-radius:4px; flex-shrink:0; }
.petal-location { padding:8px 16px; background:rgba(0,0,0,0.2); font-family:"Consolas","Monaco",monospace; font-size:0.8rem; color:var(--text-secondary); display:flex; align-items:center; gap:8px; border-bottom:1px solid var(--border); }
.petal-location .icon { color:var(--primary); }
.petal-location .file-path { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.petal-location .line-num { color:var(--primary); font-weight:600; flex-shrink:0; }
.petal-body { display:flex; flex-direction:column; }
.field-row { display:grid; grid-template-columns:100px 1fr; }
@media (max-width:768px) { .field-row { grid-template-columns:1fr; } }
.field-label {
  padding:12px 16px; background:rgba(255,255,255,0.02); color:var(--text-muted);
  font-size:0.75rem; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;
  border-bottom:1px solid var(--border); display:flex; align-items:flex-start;
}
.field-content {
  padding:12px 16px; color:var(--text-primary); font-size:0.9rem; line-height:1.6;
  border-bottom:1px solid var(--border); word-break:break-word; overflow-wrap:break-word;
}
.field-content:last-child { border-bottom:none; }
.fix-block { background:rgba(61,220,151,0.05); border-left:3px solid var(--low); }
.evidence-list { list-style:none; padding:0; margin:0; }
.evidence-list li { padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.04); }
.evidence-list li:last-child { border-bottom:none; }
.evidence-reason { word-break:break-word; }
.debug-section {
  background:var(--bg-secondary); border:1px solid var(--border);
  border-radius:8px; margin-bottom:16px; overflow:hidden;
}
.debug-section summary { padding:12px 16px; cursor:pointer; font-weight:600; display:flex; justify-content:space-between; align-items:center; user-select:none; background:rgba(111,66,193,0.1); color:var(--primary); }
.debug-content { padding:12px 16px; max-height:300px; overflow-y:auto; font-family:"Consolas",monospace; font-size:0.8rem; background:rgba(0,0,0,0.3); }
.debug-line { padding:4px 0; border-bottom:1px solid rgba(255,255,255,0.03); }
.debug-line:last-child { border-bottom:none; }
.debug-prefix { color:var(--text-muted); }
.debug-level { color:var(--primary); }
.empty-state { background:var(--bg-secondary); border:1px solid var(--border); border-radius:10px; padding:40px; text-align:center; color:var(--text-secondary); font-size:1.1rem; }
.rec-section { margin-top:24px; }
.rec-section summary { padding:14px 20px; cursor:pointer; font-weight:600; display:flex; justify-content:space-between; align-items:center; user-select:none; background:rgba(61,220,151,0.1); color:var(--low); border-radius:8px; border:1px solid var(--border); }
.rec-content { background:var(--bg-secondary); border:1px solid var(--border); border-top:none; border-radius:0 0 8px 8px; padding:16px 20px; }
.rec-item { padding:8px 0; border-bottom:1px solid var(--border); color:var(--text-primary); }
.rec-item:last-child { border-bottom:none; }
.code-block { background:rgba(0,0,0,0.3); border-radius:4px; padding:8px 12px; font-family:"Consolas","Monaco",monospace; font-size:0.8rem; white-space:pre-wrap; word-break:break-all; margin:4px 0; border:1px solid var(--border); }
@media (max-width:768px) {
  .container { padding:16px; }
  .report-title { font-size:1.5rem; }
  .status-bar { flex-direction:column; align-items:flex-start; }
  .scan-stats { flex-wrap:wrap; gap:12px; }
}
</style>
</head>
<body>
<div class="ai-disclaimer">
  <div class="disclaimer-icon">⚠️</div>
  <div class="disclaimer-content">
    <div class="disclaimer-title">AI 安全扫描结果声明</div>
    <div class="disclaimer-text">
      本报告由 HOS-Sec-Engine 生成，结果基于攻防规则引擎和 AI 分析。
      建议结合人工审查确认关键风险点。所有测试应在授权范围内进行。
    </div>
  </div>
</div>
<div class="container">
  <header class="report-header">
    <h1 class="report-title">🛡️HOS 安全审计报告</h1>
    <p class="report-meta">{{PLAYBOOK_NAME}} — {{TARGET}}</p>
  </header>

  <div class="status-bar">
    <span class="status-badge {{STATUS_BADGE_CLASS}}">{{STATUS_TEXT}}</span>
    <div class="scan-stats">
      <div>执行 Skill: <span>{{TOTAL_SKILLS}}</span></div>
      <div>发现问题: <span>{{TOTAL_FINDINGS}}</span></div>
      <div>时间段: <span>{{START_TIME}} ~ {{END_TIME}}</span></div>
    </div>
  </div>

  <div class="filter-toolbar">
    <label for="severity-filter">按严重级别筛选</label>
    <select id="severity-filter">
      <option value="all">全部</option>
      <option value="critical">严重</option>
      <option value="high">高</option>
      <option value="medium">中</option>
      <option value="low">低</option>
    </select>
    <label for="main-search">🔍 搜索:</label>
    <input type="text" id="main-search" placeholder="搜索漏洞描述、来源...">
  </div>

  <div class="summary-grid">
    <div class="summary-card">
      <h3>📊 漏洞统计</h3>
      <div class="summary-stats">
        <div class="stat-row"><span class="stat-label">执行 Skill 数</span><span class="stat-value">{{TOTAL_SKILLS}}</span></div>
        <div class="stat-row"><span class="stat-label">发现问题数</span><span class="stat-value">{{TOTAL_FINDINGS}}</span></div>
        <div class="stat-row"><span class="stat-label stat-critical">严重 (CRITICAL)</span><span class="stat-value stat-critical">{{CRITICAL_COUNT}}</span></div>
        <div class="stat-row"><span class="stat-label stat-high">高 (HIGH)</span><span class="stat-value stat-high">{{HIGH_COUNT}}</span></div>
        <div class="stat-row"><span class="stat-label stat-medium">中 (MEDIUM)</span><span class="stat-value stat-medium">{{MEDIUM_COUNT}}</span></div>
        <div class="stat-row"><span class="stat-label stat-low">低 (LOW)</span><span class="stat-value stat-low">{{LOW_COUNT}}</span></div>
        <div class="stat-row"><span class="stat-label stat-info">信息 (INFO)</span><span class="stat-value stat-info">{{INFO_COUNT}}</span></div>
      </div>
    </div>
    <div class="summary-card">
      <h3>📈 漏洞分布</h3>
      <div class="chart-wrapper"><canvas id="severityChart"></canvas></div>
    </div>
  </div>

  <section class="severity-clusters">
    <h2 class="section-title">🐛 漏洞详情</h2>
    {{CLUSTERS}}
  </section>

  <details class="debug-section">
    <summary>⚙ 执行阶段详情 ({{TOTAL_SKILLS}} skills)</summary>
    <div class="debug-content">{{DEBUG_LINES}}</div>
  </details>

  <details class="rec-section">
    <summary>📋 修复建议 ({{REC_COUNT}})</summary>
    <div class="rec-content">{{REC_ITEMS}}</div>
  </details>
</div>

<script>
function initSeverityChart() {
  const ctx = document.getElementById('severityChart');
  if (!ctx) return;
  new Chart(ctx.getContext('2d'), {
    type:'bar', data:{
      labels:['严重','高','中','低','信息'],
      datasets:[{
        label:'漏洞数量',
        data:[{{CRITICAL_COUNT}},{{HIGH_COUNT}},{{MEDIUM_COUNT}},{{LOW_COUNT}},{{INFO_COUNT}}],
        backgroundColor:[
          'rgba(255,77,79,0.7)','rgba(255,140,66,0.7)',
          'rgba(255,209,102,0.7)','rgba(61,220,151,0.7)','rgba(139,148,158,0.7)'
        ],
        borderColor:[
          'rgba(255,77,79,1)','rgba(255,140,66,1)',
          'rgba(255,209,102,1)','rgba(61,220,151,1)','rgba(139,148,158,1)'
        ],
        borderWidth:1
      }]
    },
    options:{
      indexAxis:'y', responsive:true, maintainAspectRatio:false,
      plugins:{
        legend:{display:false},
        title:{display:true, text:'漏洞严重级别分布', color:'#e6edf3', font:{size:14}}
      },
      scales:{
        x:{beginAtZero:true, grid:{color:'rgba(255,255,255,0.1)'}, ticks:{color:'#8b949e'}},
        y:{grid:{display:false}, ticks:{color:'#e6edf3'}}
      }
    }
  });
}

function debounce(func, wait) { let t; return function() { clearTimeout(t); t=setTimeout(()=>func.apply(this,arguments), wait); }; }

function filterAll() {
  const severityFilter = document.getElementById('severity-filter').value;
  const searchQuery = document.getElementById('main-search').value.toLowerCase().trim();
  document.querySelectorAll('.petal-card').forEach(card => {
    const severity = card.dataset.severity;
    const text = card.textContent.toLowerCase();
    const matchSeverity = severityFilter === 'all' || severity === severityFilter;
    const matchSearch = searchQuery === '' || text.includes(searchQuery);
    card.style.display = (matchSeverity && matchSearch) ? 'block' : 'none';
  });
  document.querySelectorAll('.cluster').forEach(cluster => {
    const cls = cluster.className;
    const clusterSeverity = cls.replace('cluster cluster-','').split(' ')[0];
    const matchSeverity = severityFilter === 'all' || clusterSeverity === severityFilter;
    if (!matchSeverity) { cluster.style.display = 'none'; return; }
    const petalCards = cluster.querySelectorAll('.petal-card');
    let hasMatch = false;
    petalCards.forEach(card => {
      const cardText = card.textContent.toLowerCase();
      if (searchQuery === '' || cardText.includes(searchQuery)) hasMatch = true;
    });
    cluster.style.display = hasMatch ? 'block' : 'none';
  });
}

function initHighlight() {
  if (typeof hljs !== 'undefined') {
    document.querySelectorAll('.code-block').forEach(block => hljs.highlightElement(block));
  }
}

document.addEventListener('DOMContentLoaded', ()=>{
  filterAll();
  if (typeof Chart !== 'undefined') initSeverityChart(); else setTimeout(initSeverityChart, 500);
  setTimeout(initHighlight, 300);
});
document.getElementById('main-search').addEventListener('keyup', debounce(filterAll, 200));
document.getElementById('severity-filter').addEventListener('change', filterAll);
</script>
</body>
</html>`;

/**
 * 安全审计报告生成器
 * 将 OrchestrationResult 转换为 Markdown、HTML、JSON 和管理层摘要格式
 */
export class ReportGenerator {

  private static summaryData(result: OrchestrationResult): { totalFindings: number; allFindings: Finding[] } {
    const s = result.summary;
    const totalFindings = s.criticalFindings + s.highFindings + s.mediumFindings + s.lowFindings;
    return { totalFindings, allFindings: this.collectAllFindings(result) };
  }

  /**
   * 生成 Markdown 格式审计报告
   * @param result 流程执行结果
   * @returns Markdown 格式审计报告
   */
  static generateMarkdown(result: OrchestrationResult): string {
    const summary = result.summary;
    const { totalFindings, allFindings } = this.summaryData(result);

    const phaseSections = result.phaseResults.map(phase => {
      const statusIcon = phase.status === 'completed' ? '✅ 完成'
        : phase.status === 'skipped' ? '⏭ 跳过' : '❌ 失败';
      const findingsSection = phase.findings.length > 0
        ? `\n- **发现**:\n${phase.findings.map(f => `  - [${f.severity.toUpperCase()}] ${f.description}`).join('\n')}\n`
        : '';

      return `### Phase ${phase.phaseId}: ${phase.phaseName} [${statusIcon}]
- **执行 Skill 数**: ${phase.skillsExecuted.length}
- **持续时间**: ${phase.duration}
${findingsSection}`;
    }).join('\n');

    const findingsSection = allFindings.length > 0
      ? `\n## 详细发现\n\n${allFindings.map((f, i) => `### 发现 ${i + 1}
- **来源**: ${f.skillId}
- **严重程度**: ${f.severity}
- **描述**: ${f.description}
- **证据**: ${f.evidence}
- **时间**: ${f.timestamp}
`).join('\n')}`
      : '';

    const recommendationsSection = result.recommendations.length > 0
      ? `\n## 修复建议\n${result.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}\n`
      : '';

    return `# 安全审计报告

## 执行概况
- **流程名称**: ${result.playbookName}
- **目标**: ${result.target}
- **执行时间**: ${result.startTime} - ${result.endTime}
- **状态**: ${this.translateStatus(result.status)}

## 发现摘要
| 级别 | 数量 |
|------|------|
| Critical | ${summary.criticalFindings} |
| High | ${summary.highFindings} |
| Medium | ${summary.mediumFindings} |
| Low | ${summary.lowFindings} |
| **总计** | **${totalFindings}** |

## 阶段执行详情

${phaseSections}${findingsSection}${recommendationsSection}`;
  }

  /**
   * 生成 HTML 格式报告（HOS-LS 风格暗色主题）
   * @param result 流程执行结果
   * @returns HTML 格式报告
   */
  static generateHTML(result: OrchestrationResult): string {
    const summary = result.summary;
    const { totalFindings, allFindings } = this.summaryData(result);

    // --- Severity cluster sections ---
    const severityOrder = ['critical', 'high', 'medium', 'low', 'info'];
    const severityLabels: Record<string, string> = {
      critical: '严重', high: '高危', medium: '中危', low: '低危', info: '信息'
    };
    const severityIcons: Record<string, string> = {
      critical: '🔴', high: '🟠', medium: '🟡', low: '🟢', info: '🔵'
    };

    const clustersHTML = severityOrder.map(sev => {
      const findings = allFindings.filter(f => f.severity === sev);
      if (findings.length === 0) return '';

      const petalCards = findings.map((f, fi) => {
        const evidenceHTML = f.evidence
          ? `<div class="field-row">
              <div class="field-label">证据链</div>
              <div class="field-content">
                <ul class="evidence-list">
                  <li><span class="evidence-reason">${this.escapeHtml(f.evidence)}</span></li>
                </ul>
              </div>
            </div>`
          : '';

        return `<article class="petal-card confirmed-finding" data-severity="${sev}" data-category="pentest">
          <div class="petal-header">
            <span class="severity-badge severity-${sev}">${sev.toUpperCase()}</span>
            <span class="source-badge source-rule_match">playbook</span>
            <span class="confidence-badge confidence-high">${summary.achievedAccessLevel || 'N/A'}</span>
            <h3 class="vuln-title">${this.escapeHtml(f.description.length > 80 ? f.description.slice(0, 80) + '...' : f.description)}</h3>
            <span class="vuln-rule-id">${f.skillId}</span>
          </div>
          <div class="petal-location">
            <span class="icon">🕐</span>
            <span class="file-path">发现时间: ${f.timestamp}</span>
            <span class="line-num">阶段: ${this.findPhaseName(result, f.skillId)}</span>
          </div>
          <div class="petal-body">
            <div class="field-row">
              <div class="field-label">漏洞描述</div>
              <div class="field-content">${this.escapeHtml(f.description)}</div>
            </div>
            ${evidenceHTML}
            <div class="field-row">
              <div class="field-label">修复建议</div>
              <div class="field-content fix-block">${this.escapeHtml(this.findRecommendation(result, f.skillId))}</div>
            </div>
          </div>
        </article>`;
      }).join('\n');

      return `<details class="cluster cluster-${sev}" ${sev === 'critical' || sev === 'high' ? 'open' : ''}>
        <summary class="cluster-header">
          <span class="cluster-icon">${severityIcons[sev]}</span>
          <span class="cluster-name">${sev.toUpperCase()}</span>
          <span class="cluster-count">(${findings.length} 个漏洞)</span>
          <span class="cluster-toggle">▶</span>
        </summary>
        <div class="cluster-body">${petalCards}</div>
      </details>`;
    }).join('\n');

    // --- Phase results (as debug section) ---
    const debugLines = result.phaseResults.map(p => {
      const statusIcon = p.status === 'completed' ? '✅' : p.status === 'skipped' ? '⏭️' : '❌';
      return `<div class="debug-line">
        <span class="debug-prefix">[${statusIcon}]</span>
        <span class="debug-level">${p.phaseId}</span>
        <span>${p.phaseName} (${p.duration}, ${p.skillsExecuted.length} skills)</span>
      </div>`;
    }).join('\n');

    // --- Recommendations ---
    const recItems = result.recommendations.map((r, i) =>
      `<li>${this.escapeHtml(r)}</li>`
    ).join('\n');

    // --- Assemble ---
    const statusText = this.translateStatus(result.status);
    const statusBadgeClass = totalFindings > 0 ? (summary.criticalFindings > 0 ? 'critical' : 'high') : 'safe';

    return HTML_TEMPLATE_HEAD
      .replace('{{PLAYBOOK_NAME}}', this.escapeHtml(result.playbookName))
      .replace('{{TARGET}}', this.escapeHtml(result.target))
      .replace('{{STATUS_TEXT}}', statusText)
      .replace('{{STATUS_BADGE_CLASS}}', statusBadgeClass)
      .replace('{{TOTAL_FINDINGS}}', String(totalFindings))
      .replace('{{TOTAL_SKILLS}}', String(summary.totalSkillsExecuted))
      .replace('{{CRITICAL_COUNT}}', String(summary.criticalFindings))
      .replace('{{HIGH_COUNT}}', String(summary.highFindings))
      .replace('{{MEDIUM_COUNT}}', String(summary.mediumFindings))
      .replace('{{LOW_COUNT}}', String(summary.lowFindings))
      .replace('{{INFO_COUNT}}', '0')
      .replace('{{CLUSTERS}}', clustersHTML)
      .replace('{{DEBUG_LINES}}', debugLines)
      .replace('{{REC_ITEMS}}', recItems)
      .replace('{{REC_COUNT}}', String(result.recommendations.length))
      .replace('{{START_TIME}}', result.startTime || '')
      .replace('{{END_TIME}}', result.endTime || '');
  }

  /**
   * HTML 转义
   */
  private static escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * 查找 finding 对应的阶段名称
   */
  private static findPhaseName(result: OrchestrationResult, skillId: string): string {
    for (const phase of result.phaseResults) {
      if (phase.findings.some(f => f.skillId === skillId)) {
        return phase.phaseName;
      }
    }
    return 'unknown';
  }

  /**
   * 查找 finding 对应的修复建议
   */
  private static findRecommendation(result: OrchestrationResult, skillId: string): string {
    for (const phase of result.phaseResults) {
      for (const sr of phase.skillsExecuted) {
        if (sr.skill.metadata.id === skillId) {
          const recs = sr.skill.defense?.recommendations;
          if (recs && recs.length > 0) return recs[0];
        }
      }
    }
    // Fallback to global recommendations
    return result.recommendations.length > 0 ? result.recommendations[0] : '无建议';
  }

  /**
   * 生成 JSON 格式数据
   * @param result 流程执行结果
   * @returns JSON 格式数据
   */
  static generateJSON(result: OrchestrationResult): string {
    return JSON.stringify(result, null, 2);
  }

  /**
   * 生成管理层摘要（简短的执行概览）
   * @param result 流程执行结果
   * @returns 管理层摘要文本
   */
  static generateExecutiveSummary(result: OrchestrationResult): string {
    const summary = result.summary;
    const { totalFindings, allFindings } = this.summaryData(result);
    const severityOrder = ['Critical', 'High', 'Medium', 'Low'];

    // 第一段：执行概览
    let text = `本次「${result.playbookName}」安全审计于 ${result.startTime} 至 ${result.endTime} 执行，目标为 ${result.target}。`;
    text += ` 流程执行状态为「${this.translateStatus(result.status)}」，共执行 ${summary.totalSkillsExecuted} 项安全检查，`;
    text += `累计发现 ${totalFindings} 个安全问题。`;

    // 第二段：风险分布
    if (totalFindings > 0) {
      text += ` 在发现的安全问题中，`;
      text += `严重级别（Critical）${summary.criticalFindings} 项，`;
      text += `高级别（High）${summary.highFindings} 项，`;
      text += `中级别（Medium）${summary.mediumFindings} 项，`;
      text += `低级别（Low）${summary.lowFindings} 项。`;

      if (summary.criticalFindings > 0 || summary.highFindings > 0) {
        text += ` 建议立即优先处理严重和高级别漏洞。`;
      }
    } else {
      text += ` 本次审计未发现安全问题，系统安全状况良好。`;
    }

    // 第三段：核心发现和修复建议
    if (allFindings.length > 0) {
      const topFindings = allFindings
        .sort((a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity))
        .slice(0, 3);

      text += `\n\n**核心发现**：\n`;
      for (const f of topFindings) {
        text += `- [${f.severity}] ${f.description}\n`;
      }
    }

    if (result.recommendations.length > 0) {
      text += `\n**建议措施**：共提出 ${result.recommendations.length} 项修复建议，`;
      text += `建议按照严重程度优先顺序逐步实施。`;
    }

    return text;
  }

  /**
   * 收集所有阶段的发现结果
   * @param result 流程执行结果
   * @returns 所有发现列表
   */
  private static collectAllFindings(result: OrchestrationResult): Finding[] {
    const findings: Finding[] = [];
    for (const phase of result.phaseResults) {
      findings.push(...phase.findings);
    }
    return findings;
  }

  /**
   * 翻译执行状态为中文
   * @param status 执行状态
   * @returns 中文状态文本
   */
  private static translateStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'completed': '已完成',
      'paused': '已暂停',
      'failed': '失败',
      'partial': '部分完成',
    };
    return statusMap[status] || status;
  }

}
