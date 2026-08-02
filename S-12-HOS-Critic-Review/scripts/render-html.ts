/**
 * HTML 渲染器：ReviewReport JSON → 美观单文件 HTML（内联 CSS，零 npm 依赖）。
 * 与 render.ts 同数据源；只重组既有产物，不新增内容。
 * 输出可直接浏览器打开，也可交给 scripts/tools/render-pdf.py 转 PDF（不消耗 LLM token）。
 */
import type { Critique, Finding, ReviewReport } from './core/types.ts';

const SEV_COLOR: Record<string, string> = {
  CRITICAL: '#d93025', HIGH: '#e8710a', MEDIUM: '#f9ab00', LOW: '#1a73e8', INFO: '#5f6368',
};
const SEV_BG: Record<string, string> = {
  CRITICAL: '#fce8e6', HIGH: '#fef7e0', MEDIUM: '#fef7e0', LOW: '#e8f0fe', INFO: '#f1f3f4',
};
const DIM_ZH: Record<string, string> = {
  technical: '技术质量', innovation: '创新真实性', engineering: '工程落地',
  ecosystem: '生态影响', risk: '风险暴露', strategic: '战略价值',
};
const GRADE_COLOR: Record<string, string> = {
  S: '#137333', A: '#1a73e8', B: '#e8710a', C: '#f9ab00', D: '#d93025', F: '#b31412',
};
const VECTOR_ZH: Record<string, string> = {
  'hidden-assumption': '隐藏假设', counterexample: '反例', 'hidden-cost': '隐藏成本',
  overclaim: '过度宣称', 'missing-baseline': '缺失基线', 'scaling-doubt': '规模存疑',
  survivorship: '幸存者偏差', recognition: '认可',
};

function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function check(v: boolean): string {
  return v
    ? '<span class="dec-yes">✓ 是</span>'
    : '<span class="dec-no">✗ 否</span>';
}

function badge(sev: string): string {
  const c = SEV_COLOR[sev] ?? '#5f6368';
  const bg = SEV_BG[sev] ?? '#f1f3f4';
  return `<span class="sev" style="color:${c};background:${bg};border-color:${c}66">${esc(sev)}</span>`;
}

function dimBar(key: string, v: number): string {
  const pct = Math.max(0, Math.min(10, v)) * 10;
  return `
    <div class="dim">
      <div class="dim-head"><span class="dim-name">${DIM_ZH[key] ?? key}</span><span class="dim-val">${v}/10</span></div>
      <div class="dim-track"><div class="dim-fill" style="width:${pct}%"></div></div>
    </div>`;
}

function findingCard(f: Finding, i: number): string {
  const status = f.evidence_status ?? 'unverifiable';
  const statusZh: Record<string, string> = { verified: '证实', refuted: '证伪', partial: '部分证实', unverifiable: '查不到' };
  return `
  <div class="card finding sev-${f.severity.toLowerCase()}">
    <div class="finding-head">
      ${badge(f.severity)}
      <span class="fid">${esc(f.hcr_id ?? f.finding_id)}</span>
      <span class="fclass">${esc(f.class)}</span>
      <span class="fstatus">证据：${statusZh[status] ?? status}</span>
    </div>
    <div class="f-title">${esc(f.title)}</div>
    <div class="f-row"><span class="f-label">Claim</span><span>${esc(f.claim)}</span></div>
    <div class="f-row"><span class="f-label">Evidence</span><span>${esc(f.evidence_draft)}</span></div>
    ${f.patch ? `<div class="f-row"><span class="f-label">Patch</span><span>${esc(f.patch)}</span></div>` : ''}
  </div>`;
}

function critiqueCard(c: Critique): string {
  const roleZh: Record<string, string> = {
    reviewer2: 'Reviewer #2', 'experiment-auditor': '实验审计员', 'principal-engineer': '主程',
    'security-auditor': '安全审计', 'product-mind': '产品思维', 'legal-mind': '法务',
    'business-mind': '商业思维', 'data-scientist': '数据科学家', skeptic: '怀疑者',
    'domain-expert': '领域专家', architect: '架构师', generalist: '通才',
  };
  return `
  <div class="card critique">
    <div class="crit-head">
      <span class="crit-role">${esc(roleZh[c.role] ?? c.role)}</span>
      <span class="crit-vector">${esc(VECTOR_ZH[c.attack_vector] ?? c.attack_vector)}</span>
      ${c.spiciness !== undefined ? `<span class="crit-spice">辣度 ${c.spiciness}</span>` : ''}
    </div>
    <div class="crit-thesis">${esc(c.thesis)}</div>
    <div class="crit-reasoning">${esc(c.reasoning)}</div>
  </div>`;
}

export function renderHtml(r: ReviewReport, mode: string): string {
  const s = r.score;
  const d = s.dimensions;
  const dimKeys = Object.keys(DIM_ZH);
  const gradeColor = GRADE_COLOR[s.grade] ?? '#5f6368';
  const findingsSorted = [...r.findings].sort((a, b) => {
    const o: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4 };
    return (o[a.severity] ?? 9) - (o[b.severity] ?? 9);
  });
  const top = findingsSorted.slice(0, 5);
  const byRole = new Map<string, Critique[]>();
  for (const c of r.critiques) {
    if (!byRole.has(c.role)) byRole.set(c.role, []);
    byRole.get(c.role)!.push(c);
  }
  const title = (r.target.meta?.title as string | undefined) ?? r.target.source.url ?? r.target.type;

  const dimBars = dimKeys.map(k => dimBar(k, (d as Record<string, number>)[k])).join('\n');

  const topBlock = mode === 'quick'
    ? `<h2>Top Findings</h2>${top.map(f => `
        <div class="card finding"><div class="finding-head">${badge(f.severity)}<span class="fid">${esc(f.hcr_id ?? f.finding_id)}</span></div>
        <div class="f-title">${esc(f.title)}</div><div class="f-row"><span class="f-label">Claim</span><span>${esc(f.claim)}</span></div></div>`).join('')}`
    : `<h2>Findings（${findingsSorted.length}）</h2>${findingsSorted.length ? findingsSorted.map(findingCard).join('') : '<div class="card">未发现显著问题（无发现模式）。</div>'}`;

  const critiqueBlock = [...byRole.entries()].map(([role, list]) => `
    <h3>${esc(role)}（${list.length}）</h3>${list.map(critiqueCard).join('')}`).join('') || '<div class="card">无 Critique 记录。</div>';

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} · HOS-CRITIC-REVIEW</title>
<style>
  :root { --bg:#f4f6f8; --card:#fff; --ink:#202124; --sub:#5f6368; --line:#e8eaed; --accent:#1a73e8; }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bg); color:var(--ink); font-family:"Segoe UI","PingFang SC","Microsoft YaHei","Noto Sans SC",system-ui,sans-serif; line-height:1.6; }
  .wrap { max-width:960px; margin:0 auto; padding:24px 16px 64px; }
  .hero { background:linear-gradient(135deg,#1a237e,#283593); color:#fff; border-radius:16px; padding:28px 32px; margin-bottom:20px; box-shadow:0 4px 14px rgba(26,35,126,.25); }
  .hero .kicker { font-size:12px; letter-spacing:2px; opacity:.75; text-transform:uppercase; }
  .hero h1 { margin:4px 0 2px; font-size:22px; line-height:1.35; }
  .hero .target { font-size:13px; opacity:.85; }
  .scoreline { display:flex; align-items:center; gap:24px; margin-top:16px; flex-wrap:wrap; }
  .score-num { font-size:56px; font-weight:800; line-height:1; }
  .score-grade { font-size:26px; font-weight:800; padding:4px 14px; border-radius:10px; color:${gradeColor}; background:#fff; }
  .score-meta { flex:1; min-width:240px; }
  .one-liner { font-size:16px; font-weight:600; margin:2px 0 6px; }
  .verdict { font-size:14px; opacity:.92; }
  .decision { margin-top:12px; display:flex; gap:8px; flex-wrap:wrap; }
  .decision .chip { background:rgba(255,255,255,.14); border:1px solid rgba(255,255,255,.3); padding:4px 10px; border-radius:999px; font-size:13px; }
  .card { background:var(--card); border:1px solid var(--line); border-radius:12px; padding:16px 18px; margin:12px 0; box-shadow:0 1px 3px rgba(60,64,67,.08); }
  h2 { font-size:18px; margin:28px 0 6px; color:#1a237e; border-left:4px solid var(--accent); padding-left:10px; }
  h3 { font-size:15px; margin:20px 0 4px; color:#37474f; }
  .dims { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  @media (max-width:640px){ .dims { grid-template-columns:1fr; } }
  .dim-head { display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px; }
  .dim-val { font-weight:700; }
  .dim-track { height:10px; background:#eceff1; border-radius:999px; overflow:hidden; }
  .dim-fill { height:100%; background:linear-gradient(90deg,#1a73e8,#7c4dff); border-radius:999px; }
  .sev { display:inline-block; font-size:11px; font-weight:700; padding:2px 8px; border-radius:999px; border:1px solid; }
  .finding { border-left:5px solid var(--line); }
  .finding.sev-critical { border-left-color:#d93025; }
  .finding.sev-high { border-left-color:#e8710a; }
  .finding.sev-medium { border-left-color:#f9ab00; }
  .finding.sev-low { border-left-color:#1a73e8; }
  .finding.sev-info { border-left-color:#5f6368; }
  .finding-head { display:flex; gap:8px; align-items:center; margin-bottom:6px; flex-wrap:wrap; }
  .fid { font-family:Consolas,monospace; font-size:12px; color:var(--sub); }
  .fclass { font-size:11px; background:#eceff1; padding:2px 8px; border-radius:6px; }
  .fstatus { font-size:12px; color:var(--sub); margin-left:auto; }
  .f-title { font-weight:700; font-size:15px; margin:4px 0 8px; }
  .f-row { display:flex; gap:10px; font-size:13.5px; margin:4px 0; }
  .f-label { flex:0 0 74px; font-weight:700; color:var(--sub); font-size:12px; padding-top:1px; }
  .crit-head { display:flex; gap:8px; align-items:center; margin-bottom:6px; flex-wrap:wrap; }
  .crit-role { font-weight:700; font-size:13px; background:#1a237e; color:#fff; padding:2px 10px; border-radius:999px; }
  .crit-vector { font-size:12px; background:#eceff1; padding:2px 10px; border-radius:999px; }
  .crit-spice { font-size:12px; color:#b31412; font-weight:700; margin-left:auto; }
  .crit-thesis { font-weight:600; font-size:14px; }
  .crit-reasoning { font-size:13.5px; color:#3c4043; margin-top:4px; }
  .dec-yes { color:#137333; font-weight:700; }
  .dec-no { color:#d93025; font-weight:700; }
  .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  @media (max-width:640px){ .grid2 { grid-template-columns:1fr; } }
  .muted { color:var(--sub); font-size:13px; }
  .footer { margin-top:32px; text-align:center; color:var(--sub); font-size:12px; }
  .deg { background:#fef7e0; border:1px solid #fde293; border-radius:10px; padding:12px 14px; font-size:13px; margin:8px 0; }
  @media print {
    body { background:#fff; }
    .wrap { max-width:none; padding:0; }
    .hero { box-shadow:none; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .card, .sev, .dim-fill, .crit-role { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    h2, .crit-thesis { page-break-after:avoid; }
    .card { page-break-inside:avoid; }
    @page { size: A4; margin: 14mm 12mm; }
  }
</style>
</head>
<body>
<div class="wrap">
  <div class="hero">
    <div class="kicker">HOS-CRITIC-REVIEW · ${esc(mode)}</div>
    <h1>${esc(title)}</h1>
    <div class="target">${esc(r.target.type)} / ${esc(r.target.domain ?? '')} / ${esc(r.target.complexity)} · ${esc(r.target.source.kind)}${r.target.source.url ? ` · ${esc(r.target.source.url)}` : ''}</div>
    <div class="scoreline">
      <div class="score-num">${s.score}</div>
      <div class="score-grade">${esc(s.grade)} · ${esc(s.grade_label)}</div>
      <div class="score-meta">
        <div class="one-liner">${esc(s.one_liner)}</div>
        <div class="verdict">${esc(s.verdict)}</div>
      </div>
    </div>
    <div class="decision">
      <span class="chip">learn ${check(s.decision.learn)}</span>
      <span class="chip">contribute ${check(s.decision.contribute)}</span>
      <span class="chip">invest ${check(s.decision.invest)}</span>
      <span class="chip">research ${check(s.decision.research)}</span>
    </div>
  </div>

  <h2>六维评分</h2>
  <div class="card"><div class="dims">${dimBars}</div>
    <p class="muted" style="margin:12px 0 0">${esc(s.rationale)}</p>
    ${s.risk_flags?.length ? `<p class="muted">风险标记：${s.risk_flags.map(esc).join('；')}</p>` : ''}
  </div>

  ${topBlock}

  <h2>Critical Critiques（${r.critiques.length}）</h2>
  ${critiqueBlock}

  <h2>Degradations &amp; Limits</h2>
  <div class="card">${r.degradations.length
    ? r.degradations.map(d => `<div class="deg">⚠ ${esc(d)}</div>`).join('')
    : '<p class="muted">无。</p>'}</div>

  <h2>Recommendation</h2>
  <div class="card grid2">
    <div><strong>值得学习</strong> ${check(s.decision.learn)}</div>
    <div><strong>值得贡献</strong> ${check(s.decision.contribute)}</div>
    <div><strong>值得投资</strong> ${check(s.decision.invest)}</div>
    <div><strong>值得研究</strong> ${check(s.decision.research)}</div>
  </div>

  <div class="footer">report_id: ${esc(r.report_id)} · schema_version: ${esc(r.schema_version)} · 耗时 ${r.meta.duration_seconds}s · 输出 ${esc(mode)} · HOS-CRITIC-REVIEW</div>
</div>
</body>
</html>`;
}
