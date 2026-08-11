// ============================================================
// HOS-Paper-RedTeam — 完整审计报表渲染器（HTML 单文件，零依赖）
// 输入 PaperReviewData（含 issues[] 证据链），输出：
//   · 评分卡头部（分数/评级/一句话）
//   · 问题统计面板（总数 / 严重度分布 / 分类分布）
//   · 逐条根因卡片（根因 + 牵涉 tex 原文段落 + 证据链可视化 + Patch）
// 证据链 = Claim → tex 原文 → 证据缺口 → RVE 判定 → Patch
// 用法：node src/index.ts review.json（默认 report 模式）
// ============================================================

import type { PaperReviewData, EvidenceLink, ReviewStats, TexQuote, CodeAudit } from './types.ts';

function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// —— 统计：从 issues 自动计算（JSON 未提供 stats 时）——
export function computeStats(issues: EvidenceLink[] | undefined): ReviewStats {
  const s: ReviewStats = {
    total: issues?.length ?? 0,
    bySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
    byCategory: {},
  };
  for (const it of issues ?? []) {
    const sev = (it.severity || '').toUpperCase();
    if (sev === 'CRITICAL') s.bySeverity.critical++;
    else if (sev === 'HIGH') s.bySeverity.high++;
    else if (sev === 'MEDIUM') s.bySeverity.medium++;
    else s.bySeverity.low++;
    const cat = it.category || 'RVE-EVAL';
    s.byCategory[cat] = (s.byCategory[cat] ?? 0) + 1;
  }
  return s;
}

// —— 评级 → 主色（对齐 score-model.md 六档）——
function gradeColor(score: number): string {
  if (score >= 85) return '#137333';
  if (score >= 70) return '#1a73e8';
  if (score >= 55) return '#f9ab00';
  if (score >= 40) return '#e8710a';
  if (score >= 25) return '#d93025';
  return '#b31412';
}

// —— 严重度 → 色 ——
function sevColor(sev: string): string {
  const m: Record<string, string> = {
    CRITICAL: '#b31412', HIGH: '#d93025', MEDIUM: '#e8710a', LOW: '#f9ab00',
  };
  return m[(sev || '').toUpperCase()] ?? '#5f6368';
}

// —— tex 代码轻量高亮（注释/数字/命令/强调；按行处理避免破坏标签）——
function highlightTex(code: string): string {
  return code.split('\n').map(line => {
    let out = '';
    const pct = line.indexOf('%');
    const codePart = pct >= 0 ? line.slice(0, pct) : line;
    const cmtPart = pct >= 0 ? line.slice(pct) : '';
    // 数字（含百分比、小数）
    let c = esc(codePart)
      .replace(/(\d+(?:\.\d+)?)\s*(?:\\?%|％)?/g, '<span class="t-n">$1$2</span>')
      .replace(/(\d+(?:\.\d+)?)(%)/g, '<span class="t-n">$1</span><span class="t-n">$2</span>');
    // LaTeX 命令
    c = c.replace(/(\\(?:textbf|textit|texttt|emph|color|textcolor|mathbf|underline)\{[^}]*\})/g,
      '<span class="t-b">$1</span>');
    c = c.replace(/(\\[a-zA-Z]+)/g, '<span class="t-k">$1</span>');
    out += c;
    if (cmtPart) out += '<span class="t-c">' + esc(cmtPart) + '</span>';
    return out;
  }).join('\n');
}

// —— tex 引用块：文件 + 行号 + 高亮代码 ——
function texBlock(q: TexQuote): string {
  const loc = esc(q.file) + (q.line ? `:${q.line}` : '');
  return `
  <div class="tex">
    <div class="tex-head">
      <span class="tex-file">📄 ${loc}</span>
      ${q.note ? `<span class="tex-note">${esc(q.note)}</span>` : ''}
    </div>
    <pre class="tex-code"><code>${highlightTex(q.code)}</code></pre>
  </div>`;
}

// —— 单条问题卡片：根因 + 证据链 ——
function issueCard(it: EvidenceLink, idx: number): string {
  const sc = sevColor(it.severity);
  const cat = it.category || 'RVE-EVAL';
  // 证据链步骤（Claim → tex 原文 → 缺口 → RVE → Patch），有内容才渲染
  const steps: string[] = [];
  if (it.claim) {
    steps.push(`<div class="step">
      <div class="step-ico" style="background:#1a73e8">声</div>
      <div class="step-body">
        <div class="step-tag">论文声称 · ${esc(it.claimRef ?? '')}</div>
        <div class="step-txt">${esc(it.claim)}</div>
      </div>
    </div>`);
  }
  if (it.texQuotes?.length) {
    steps.push(`<div class="step">
      <div class="step-ico" style="background:#7b1fa2">文</div>
      <div class="step-body">
        <div class="step-tag">tex 原文 · 根因物证</div>
        ${it.texQuotes.map(texBlock).join('\n')}
      </div>
    </div>`);
  }
  if (it.gap) {
    steps.push(`<div class="step">
      <div class="step-ico" style="background:#e8710a">差</div>
      <div class="step-body">
        <div class="step-tag">证据缺口 · 差距在哪</div>
        <div class="step-txt">${esc(it.gap)}</div>
      </div>
    </div>`);
  }
  steps.push(`<div class="step">
    <div class="step-ico" style="background:${sc}">判</div>
    <div class="step-body">
      <div class="step-tag">HOS-RVE 判定 · ${esc(it.rveId)}</div>
      <div class="step-txt">${esc(it.rootCause)}</div>
      ${it.exploit ? `<div class="step-sub"><b>影响</b>：${esc(it.exploit)}</div>` : ''}
    </div>
  </div>`);
  steps.push(`<div class="step">
    <div class="step-ico" style="background:#137333">补</div>
    <div class="step-body">
      <div class="step-tag">修复方案 · Patch</div>
      <div class="step-txt">${esc(it.patch)}</div>
    </div>
  </div>`);
  if (it.evidence) {
    steps.push(`<div class="step">
      <div class="step-ico" style="background:#5f6368">证</div>
      <div class="step-body">
        <div class="step-tag">外部权威佐证</div>
        <div class="step-txt">${esc(it.evidence)}</div>
      </div>
    </div>`);
  }

  return `
  <div class="issue" id="${esc(it.rveId)}">
    <div class="issue-head">
      <span class="sev" style="background:${sc}">${esc(it.severity)}</span>
      <span class="cat">${esc(cat)}</span>
      <span class="rve">${esc(it.rveId)}</span>
      <span class="issue-no">#${idx + 1}</span>
    </div>
    <div class="issue-title">${esc(it.title)}</div>
    <div class="chain">${steps.join('\n')}</div>
  </div>`;
}

// —— 统计面板 ——
function statsPanel(d: PaperReviewData, stats: ReviewStats): string {
  const sevs = [
    ['critical', 'CRITICAL', stats.bySeverity.critical, '#b31412'],
    ['high', 'HIGH', stats.bySeverity.high, '#d93025'],
    ['medium', 'MEDIUM', stats.bySeverity.medium, '#e8710a'],
    ['low', 'LOW', stats.bySeverity.low, '#f9ab00'],
  ] as const;
  const cats = Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1]);
  const maxCat = Math.max(1, ...cats.map(c => c[1]));
  const catBars = cats.map(([k, v]) => `
    <div class="cat-row">
      <span class="cat-name">${esc(k)}</span>
      <div class="cat-track"><div class="cat-fill" style="width:${(v / maxCat * 100).toFixed(1)}%"></div></div>
      <span class="cat-val">${v}</span>
    </div>`).join('') || '<div class="muted">无问题登记</div>';
  return `
  <div class="stats">
    <div class="stat-total card">
      <div class="stat-num">${stats.total}</div>
      <div class="stat-label">问题总数</div>
    </div>
    <div class="stat-sev card">
      <div class="stat-label">按严重度</div>
      <div class="sev-row">
        ${sevs.map(([k, label, v, color]) => `
          <span class="sev-pill" style="--c:${color}">
            <i class="dot" style="background:${color}"></i>${label} <b>${v}</b>
          </span>`).join('')}
      </div>
    </div>
    <div class="stat-cat card">
      <div class="stat-label">按漏洞分类</div>
      ${catBars}
    </div>
  </div>`;
}

// —— 代码实现审查区块 ——
function renderCodeAudit(ca: CodeAudit): string {
  const bar = (v: number, max: number): string => {
    const pct = Math.max(0, Math.min(100, (v / max) * 100));
    return `<div class="dim-track" style="height:8px;max-width:260px"><div class="dim-fill" style="width:${pct.toFixed(1)}%"></div></div>`;
  };
  const kv = (k: string, v: unknown): string =>
    v === undefined || v === null || v === '' ? '' : `<p class="step-txt" style="margin:2px 0"><b>${esc(k)}</b>：${esc(v)}</p>`;
  const li = (items: string[] | undefined): string =>
    items?.length ? items.map(i => `<li>${esc(i)}</li>`).join('') : '<li class="muted">无</li>';
  return `
  <h2>💻 代码实现审查</h2>
  <div class="card">
    <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:8px">
      <span class="cat" style="background:#e8f0fe;color:#174ea6;font-size:13px;padding:4px 12px">${esc(ca.repoType)}</span>
      ${ca.architecture ? `<span class="cat" style="background:#fef7e0;color:#7a5c00;font-size:13px;padding:4px 12px">架构：${esc(ca.architecture)}</span>` : ''}
      ${typeof ca.depthScore === 'number' ? `
        <span style="font-size:13px"><b>实现深度</b> ${ca.depthScore}/5</span>
        <div style="flex:1;min-width:180px">${bar(ca.depthScore, 5)}</div>` : ''}
    </div>
    ${kv('技术栈', ca.language)}
    ${typeof ca.loc === 'number' ? kv('代码规模', `${ca.loc.toLocaleString()} 行`) : ''}
    ${kv('LLM 集成方式', ca.llmIntegration)}
    ${ca.frameworks?.length ? `<p class="step-txt" style="margin:4px 0"><b>开源框架依赖</b>：${ca.frameworks.map(f => `<span class="badge">${esc(f)}</span>`).join('')}</p>` : ''}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px" class="grid2">
      <div>
        <p style="margin:8px 0 2px;font-weight:700;color:#137333">✅ 代码里真实落地的</p>
        <ul style="margin:0;padding-left:20px">${li(ca.coreImplementations)}</ul>
      </div>
      <div>
        <p style="margin:8px 0 2px;font-weight:700;color:#d93025">❌ 论文声称但代码里找不到的</p>
        <ul style="margin:0;padding-left:20px">${li(ca.missing)}</ul>
      </div>
    </div>
    ${ca.verified?.length ? `<p class="step-txt" style="margin:8px 0 2px"><b>可核验项</b>：</p><ul style="margin:0;padding-left:20px">${li(ca.verified)}</ul>` : ''}
    ${ca.verdict ? `<p class="step-txt" style="margin:8px 0 0;background:#fafafa;border:1px dashed var(--line);border-radius:8px;padding:10px 12px"><b>一句话结论</b>：${esc(ca.verdict)}</p>` : ''}
  </div>`;
}

// —— 完整审计报表 ——
export function renderReport(d: PaperReviewData): string {
  const gc = gradeColor(d.score);
  const stats = d.stats ?? computeStats(d.issues);
  const issuesHtml = (d.issues?.length
    ? d.issues.map((it, i) => issueCard(it, i)).join('\n')
    : '<div class="card muted">本卡未携带 evidenceChain（issues[]）数据 —— 仅评分卡视图。</div>');

  const dimBars = d.dimensions.map(x => `
    <div class="dim">
      <div class="dim-head"><span class="dim-name">${esc(x.label)}</span><span class="dim-val">${x.score}/${x.max}</span></div>
      <div class="dim-track"><div class="dim-fill" style="width:${(x.score / x.max * 100).toFixed(1)}%"></div></div>
    </div>`).join('\n');

  const list = (items: string[]) =>
    items.length ? items.map(i => `<li>${esc(i)}</li>`).join('') : '<li class="muted">无</li>';

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(d.title)} · HOS 论文审计报表</title>
<style>
  :root { --bg:#f4f6f8; --card:#fff; --ink:#202124; --sub:#5f6368; --line:#e8eaed; --accent:#1a73e8; }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--bg); color:var(--ink); font-family:"Segoe UI","PingFang SC","Microsoft YaHei","Noto Sans SC",system-ui,sans-serif; line-height:1.65; }
  .wrap { max-width:1040px; margin:0 auto; padding:24px 16px 64px; }
  .hero { background:linear-gradient(135deg,#1a237e,#283593); color:#fff; border-radius:16px; padding:28px 32px; margin-bottom:20px; box-shadow:0 4px 14px rgba(26,35,126,.25); }
  .hero .kicker { font-size:12px; letter-spacing:2px; opacity:.75; text-transform:uppercase; }
  .hero h1 { margin:4px 0 2px; font-size:22px; line-height:1.35; }
  .hero .target { font-size:13px; opacity:.85; }
  .scoreline { display:flex; align-items:center; gap:24px; margin-top:16px; flex-wrap:wrap; }
  .score-num { font-size:56px; font-weight:800; line-height:1; }
  .score-grade { font-size:26px; font-weight:800; padding:4px 14px; border-radius:10px; color:${gc}; background:#fff; }
  .score-meta { flex:1; min-width:240px; }
  .one-liner { font-size:16px; font-weight:600; margin:2px 0 6px; }
  .chips { margin-top:12px; display:flex; gap:8px; flex-wrap:wrap; }
  .chips .chip { background:rgba(255,255,255,.14); border:1px solid rgba(255,255,255,.3); padding:4px 10px; border-radius:999px; font-size:13px; }
  .card { background:var(--card); border:1px solid var(--line); border-radius:12px; padding:16px 18px; margin:12px 0; box-shadow:0 1px 3px rgba(60,64,67,.08); }
  h2 { font-size:18px; margin:30px 0 6px; color:#1a237e; border-left:4px solid var(--accent); padding-left:10px; }
  .muted { color:var(--sub); font-size:13px; }

  /* —— 统计面板 —— */
  .stats { display:grid; grid-template-columns:200px 1fr 1fr; gap:12px; }
  @media (max-width:860px){ .stats { grid-template-columns:1fr; } }
  .stat-total { text-align:center; display:flex; flex-direction:column; justify-content:center; }
  .stat-num { font-size:52px; font-weight:800; color:#d93025; line-height:1; }
  .stat-label { font-size:12px; color:var(--sub); letter-spacing:1px; }
  .sev-row { display:flex; gap:8px; flex-wrap:wrap; margin-top:8px; }
  .sev-pill { display:inline-flex; align-items:center; gap:6px; font-size:13px; padding:4px 10px; border:1px solid var(--line); border-radius:999px; background:#fafafa; }
  .sev-pill b { color:var(--c); font-size:15px; }
  .dot { width:8px; height:8px; border-radius:50%; display:inline-block; }
  .cat-row { display:flex; align-items:center; gap:8px; margin:6px 0; font-size:13px; }
  .cat-name { width:90px; font-weight:600; }
  .cat-track { flex:1; height:8px; background:#eceff1; border-radius:999px; overflow:hidden; }
  .cat-fill { height:100%; background:linear-gradient(90deg,#1a73e8,#7c4dff); border-radius:999px; }
  .cat-val { width:24px; text-align:right; font-weight:700; }

  /* —— 问题卡片 —— */
  .issue { border:1px solid var(--line); border-radius:12px; margin:14px 0; overflow:hidden; background:var(--card); box-shadow:0 1px 3px rgba(60,64,67,.08); }
  .issue-head { display:flex; align-items:center; gap:8px; padding:10px 16px; background:#fafafa; border-bottom:1px solid var(--line); flex-wrap:wrap; }
  .sev { color:#fff; font-size:11px; font-weight:800; padding:3px 10px; border-radius:999px; letter-spacing:1px; }
  .cat { font-size:11px; font-weight:700; padding:3px 8px; border-radius:6px; background:#e8f0fe; color:#174ea6; }
  .rve { font-size:12px; font-weight:700; color:#37474f; font-family:Consolas,monospace; }
  .issue-no { margin-left:auto; color:var(--sub); font-size:12px; }
  .issue-title { font-size:16px; font-weight:700; padding:12px 16px 2px; }

  /* —— 证据链时间线 —— */
  .chain { padding:6px 16px 16px; }
  .step { display:flex; gap:12px; position:relative; padding:8px 0 4px; }
  .step::before { content:''; position:absolute; left:15px; top:34px; bottom:-4px; width:2px; background:var(--line); }
  .step:last-child::before { display:none; }
  .step-ico { flex:none; width:32px; height:32px; border-radius:50%; color:#fff; font-weight:800; font-size:13px; display:flex; align-items:center; justify-content:center; box-shadow:0 1px 3px rgba(0,0,0,.2); }
  .step-body { flex:1; min-width:0; padding-bottom:8px; }
  .step-tag { font-size:11px; font-weight:700; color:var(--sub); letter-spacing:1px; margin-bottom:2px; }
  .step-txt { font-size:14px; }
  .step-sub { font-size:13px; color:#37474f; margin-top:4px; }

  /* —— tex 原文块 —— */
  .tex { margin:8px 0; border:1px solid var(--line); border-radius:8px; overflow:hidden; }
  .tex-head { display:flex; justify-content:space-between; gap:8px; flex-wrap:wrap; padding:6px 12px; background:#0d1117; color:#8b949e; font-size:12px; }
  .tex-file { font-family:Consolas,monospace; color:#58a6ff; }
  .tex-note { color:#8b949e; }
  .tex-code { margin:0; padding:12px; background:#0d1117; color:#c9d1d9; font-family:Consolas,"Courier New",monospace; font-size:12.5px; line-height:1.55; overflow-x:auto; white-space:pre; }
  .tex-code .t-n { color:#79c0ff; font-weight:600; }
  .tex-code .t-k { color:#ff7b72; }
  .tex-code .t-c { color:#8b949e; font-style:italic; }
  .tex-code .t-b { color:#d2a8ff; font-weight:700; }

  /* —— 维度 —— */
  .dims { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  @media (max-width:640px){ .dims { grid-template-columns:1fr; } }
  .dim-head { display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px; }
  .dim-val { font-weight:700; }
  .dim-track { height:10px; background:#eceff1; border-radius:999px; overflow:hidden; }
  .dim-fill { height:100%; background:linear-gradient(90deg,#1a73e8,#7c4dff); border-radius:999px; }
  .roast { white-space:pre-wrap; font-size:14px; background:#fafafa; border:1px dashed var(--line); border-radius:10px; padding:14px 16px; }
  .risk { color:#d93025; font-weight:700; }
  .badge { display:inline-block; font-size:11px; font-weight:700; padding:2px 8px; border-radius:999px; background:#eceff1; color:#3c4043; margin:0 4px 4px 0; }
  .footer { margin-top:32px; text-align:center; color:var(--sub); font-size:12px; }
  @media print {
    body { background:#fff; }
    .wrap { max-width:none; padding:0; }
    .hero { box-shadow:none; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .card, .dim-fill, .sev-pill, .step-ico { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    h2 { page-break-after:avoid; }
    .issue, .tex { page-break-inside:avoid; }
    @page { size: A4; margin: 14mm 12mm; }
  }
</style>
</head>
<body>
<div class="wrap">
  <div class="hero">
    <div class="kicker">HOS-PAPER-REDTEAM · 论文审计报表</div>
    <h1>${esc(d.title)}</h1>
    <div class="target">${esc([d.authors, d.venue, d.submitted].filter(Boolean).join(' · '))}${d.arxivId ? ` · arXiv:${esc(d.arxivId)}` : ''}</div>
    <div class="scoreline">
      <div class="score-num">${d.score}</div>
      <div class="score-grade">${esc(d.rankEmoji)} ${esc(d.rankLabel)}</div>
      <div class="score-meta">
        <div class="one-liner">${esc(d.oneLiner)}</div>
        ${d.position ? `<div class="muted" style="color:rgba(255,255,255,.85)">我的位置 #${d.position.rank} / 共 ${d.position.total} 篇已审</div>` : ''}
        ${d.beatPercent !== undefined ? `<div class="muted" style="color:rgba(255,255,255,.85)">击败了 ${d.beatPercent}% 的已审论文</div>` : ''}
        ${d.nextRank ? `<div class="muted" style="color:rgba(255,255,255,.85)">距「${esc(d.nextRank.label)}」还差 ${d.nextRank.diff} 分</div>` : ''}
      </div>
    </div>
    ${d.tags.length ? `<div class="chips">${d.tags.map(t => `<span class="chip">#${esc(t)}</span>`).join('')}</div>` : ''}
  </div>

  <h2>📊 问题统计</h2>
  ${statsPanel(d, stats)}

  <h2>🎯 根因与证据链</h2>
  <div class="muted" style="margin:0 0 6px">每条问题按「论文声称 → tex 原文物证 → 证据缺口 → RVE 判定 → 修复方案」链路展开；tex 段落为根因直接出处。</div>
  ${issuesHtml}

  <h2>维度评分</h2>
  <div class="card"><div class="dims">${dimBars}</div>
    ${d.riskFlags.length ? `<p class="muted" style="margin:12px 0 0"><span class="risk">风险标记</span>：${d.riskFlags.map(esc).join('；')}</p>` : ''}
  </div>

  ${d.highlights.length ? `<h2>🏆 亮点</h2><div class="card"><ul>${list(d.highlights)}</ul></div>` : ''}
  ${d.methods.length ? `<h2>🛠 关键方法</h2><div class="card"><ul>${list(d.methods)}</ul></div>` : ''}

  ${d.codeAudit ? renderCodeAudit(d.codeAudit) : ''}

  <h2>🔥 毒舌点评</h2>
  <div class="card"><div class="roast">${esc(d.roastFull)}</div>
    <p style="margin:12px 0 0"><strong>一句话结论</strong>：${esc(d.oneLiner)}</p>
  </div>

  ${d.suggestions.length ? `<h2>建议</h2><div class="card"><ol>${d.suggestions.map(s => `<li>${esc(s)}</li>`).join('')}</ol></div>` : ''}

  ${d.evidence.length ? `<h2>权威解读与佐证</h2><div class="card"><ul>${list(d.evidence)}</ul></div>` : ''}

  <div class="footer">HOS-Paper-RedTeam · 论文鞭尸局 · 证据链 = Claim → tex 原文 → 缺口 → RVE → Patch · 评分模型见 references/score-model.md</div>
</div>
</body>
</html>`;
}
