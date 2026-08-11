// ============================================================
// HOS-Paper-RedTeam — 评分卡 HTML 渲染器（单文件，内联 CSS，零依赖）
// 输入 PaperReviewData（见 types.ts），输出美观单文件 HTML。
// 直接浏览器打开；与 render.ts 同数据源，只重组既有产物。
// 用法：node src/index.ts review.json --format html（默认）
// ============================================================

import type { PaperReviewData } from './types.ts';

function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** 维度进度条：按 score/max 比例填充 */
function dimBar(label: string, score: number, max: number): string {
  const pct = Math.max(0, Math.min(100, (score / max) * 100));
  return `
    <div class="dim">
      <div class="dim-head"><span class="dim-name">${esc(label)}</span><span class="dim-val">${score}/${max}</span></div>
      <div class="dim-track"><div class="dim-fill" style="width:${pct.toFixed(1)}%"></div></div>
    </div>`;
}

/** 评级 → 强调色（对齐 score-model.md 六档） */
function gradeColor(score: number): string {
  if (score >= 85) return '#137333';   // 🟢 硬核货
  if (score >= 70) return '#1a73e8';   // 🟢 方法论扎实
  if (score >= 55) return '#f9ab00';   // 🟡 有亮点有硬伤
  if (score >= 40) return '#e8710a';   // 🟠 画靶射箭型
  if (score >= 25) return '#d93025';   // 🔴 噱头大于实质
  return '#b31412';                    // 🔴 学术水货
}

export function renderHtml(d: PaperReviewData): string {
  const gc = gradeColor(d.score);
  const dimBars = d.dimensions.map(x => dimBar(x.label, x.score, x.max)).join('\n');

  const list = (items: string[]): string =>
    items.length ? items.map(i => `<li>${esc(i)}</li>`).join('') : '<li class="muted">无</li>';

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(d.title)} · HOS 论文评分卡</title>
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
  .score-grade { font-size:26px; font-weight:800; padding:4px 14px; border-radius:10px; color:${gc}; background:#fff; }
  .score-meta { flex:1; min-width:240px; }
  .one-liner { font-size:16px; font-weight:600; margin:2px 0 6px; }
  .chips { margin-top:12px; display:flex; gap:8px; flex-wrap:wrap; }
  .chips .chip { background:rgba(255,255,255,.14); border:1px solid rgba(255,255,255,.3); padding:4px 10px; border-radius:999px; font-size:13px; }
  .card { background:var(--card); border:1px solid var(--line); border-radius:12px; padding:16px 18px; margin:12px 0; box-shadow:0 1px 3px rgba(60,64,67,.08); }
  h2 { font-size:18px; margin:28px 0 6px; color:#1a237e; border-left:4px solid var(--accent); padding-left:10px; }
  h3 { font-size:15px; margin:20px 0 4px; color:#37474f; }
  .dims { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  @media (max-width:640px){ .dims { grid-template-columns:1fr; } }
  .dim-head { display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px; }
  .dim-val { font-weight:700; }
  .dim-track { height:10px; background:#eceff1; border-radius:999px; overflow:hidden; }
  .dim-fill { height:100%; background:linear-gradient(90deg,#1a73e8,#7c4dff); border-radius:999px; }
  .roast { white-space:pre-wrap; font-size:14px; background:#fafafa; border:1px dashed var(--line); border-radius:10px; padding:14px 16px; }
  .risk { color:#d93025; font-weight:700; }
  .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  @media (max-width:640px){ .grid2 { grid-template-columns:1fr; } }
  .muted { color:var(--sub); font-size:13px; }
  .footer { margin-top:32px; text-align:center; color:var(--sub); font-size:12px; }
  .badge { display:inline-block; font-size:11px; font-weight:700; padding:2px 8px; border-radius:999px; background:#eceff1; color:#3c4043; margin:0 4px 4px 0; }
  @media print {
    body { background:#fff; }
    .wrap { max-width:none; padding:0; }
    .hero { box-shadow:none; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .card, .dim-fill { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    h2 { page-break-after:avoid; }
    .card { page-break-inside:avoid; }
    @page { size: A4; margin: 14mm 12mm; }
  }
</style>
</head>
<body>
<div class="wrap">
  <div class="hero">
    <div class="kicker">HOS-PAPER-REDTEAM · 论文评分卡</div>
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

  <h2>维度评分</h2>
  <div class="card"><div class="dims">${dimBars}</div>
    ${d.riskFlags.length ? `<p class="muted" style="margin:12px 0 0"><span class="risk">风险标记</span>：${d.riskFlags.map(esc).join('；')}</p>` : ''}
  </div>

  ${d.highlights.length ? `<h2>🏆 亮点</h2><div class="card"><ul>${list(d.highlights)}</ul></div>` : ''}
  ${d.methods.length ? `<h2>🛠 关键方法</h2><div class="card"><ul>${list(d.methods)}</ul></div>` : ''}

  ${d.similarPapers.length ? `<h2>🧬 和 TA 最像的论文</h2><div class="card"><ul>${d.similarPapers.map(s => `<li><strong>${esc(s.title)}</strong> — ${s.score}/100${s.tag ? ` <span class="badge">${esc(s.tag)}</span>` : ''}</li>`).join('')}</ul></div>` : ''}

  <h2>🔥 毒舌点评</h2>
  <div class="card"><div class="roast">${esc(d.roastFull)}</div>
    <p style="margin:12px 0 0"><strong>一句话结论</strong>：${esc(d.oneLiner)}</p>
  </div>

  <h2>维度说明</h2>
  <div class="card"><ul>${d.dimensions.map(x => `<li><strong>${esc(x.label)} ${x.score}/${x.max}</strong> — ${esc(x.note ?? '-')}</li>`).join('')}</ul></div>

  ${d.suggestions.length ? `<h2>建议</h2><div class="card"><ol>${d.suggestions.map(s => `<li>${esc(s)}</li>`).join('')}</ol></div>` : ''}

  ${d.evidence.length ? `<h2>权威解读与佐证</h2><div class="card"><ul>${list(d.evidence)}</ul></div>` : ''}

  <div class="footer">HOS-Paper-RedTeam · 论文鞭尸局 · 评分模型见 references/score-model.md · 背书验证见 references/methodology.md</div>
</div>
</body>
</html>`;
}
