/**
 * 三模板渲染器：ReviewReport JSON → 人类可读 Markdown。
 * 与 templates/*.md 结构一致；只重组既有产物，不新增内容。
 */
import type { Critique, Finding, ReviewReport } from './core/types.ts';

export function dimBar(v: number): string {
  const n = Math.max(0, Math.min(10, Math.round(v)));
  return '█'.repeat(n) + '░'.repeat(10 - n);
}

function targetTitle(r: ReviewReport): string {
  return (r.target.meta?.title as string | undefined) ?? r.target.source.url ?? r.target.type;
}

function topFindings(r: ReviewReport, n = 5): Finding[] {
  const order: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4 };
  return [...r.findings].sort((a, b) => (order[a.severity] ?? 9) - (order[b.severity] ?? 9)).slice(0, n);
}

const check = (v: boolean) => (v ? '✓' : '✗');

export function renderQuick(r: ReviewReport): string {
  const d = r.score.dimensions;
  const lines: string[] = [];
  lines.push('```text');
  lines.push('================================================');
  lines.push(' HOS-CRITIC-REVIEW · Quick');
  lines.push(` Target: ${targetTitle(r)} (${r.target.type})`);
  lines.push(` Score: ${r.score.score}/100  ·  ${r.score.grade_label}`);
  lines.push('');
  lines.push(' Six Dimension:');
  lines.push(`   Technical   ${d.technical}  ${dimBar(d.technical)}`);
  lines.push(`   Innovation  ${d.innovation}  ${dimBar(d.innovation)}`);
  lines.push(`   Engineering ${d.engineering}  ${dimBar(d.engineering)}`);
  lines.push(`   Ecosystem   ${d.ecosystem}  ${dimBar(d.ecosystem)}`);
  lines.push(`   Risk        ${d.risk}  ${dimBar(d.risk)}`);
  lines.push(`   Strategic   ${d.strategic}  ${dimBar(d.strategic)}`);
  lines.push('');
  lines.push(` One-liner: ${r.score.one_liner}`);
  lines.push(` Verdict: ${r.score.verdict}`);
  lines.push('');
  lines.push(' Critical Findings (TOP 5):');
  for (const f of topFindings(r)) {
    lines.push(`   [${f.severity}] ${f.hcr_id ?? f.finding_id}  ${f.title}`);
  }
  lines.push('');
  lines.push(` Decision: learn ${check(r.score.decision.learn)} · contribute ${check(r.score.decision.contribute)} · invest ${check(r.score.decision.invest)} · research ${check(r.score.decision.research)}`);
  lines.push(` Degradations: ${r.degradations.length ? r.degradations.join('; ') : 'none'}`);
  lines.push('================================================');
  lines.push('```');
  return lines.join('\n');
}

export function renderExpert(r: ReviewReport): string {
  const d = r.score.dimensions;
  const out: string[] = [];
  out.push(`# HOS-CRITIC-REVIEW · Expert Report`);
  out.push('');
  out.push(`## 0. Executive Summary`);
  out.push(`- Score: ${r.score.score}/100 · ${r.score.grade_label}（评级 ${r.score.grade}）`);
  out.push(`- One-liner: ${r.score.one_liner}`);
  out.push(`- Verdict: ${r.score.verdict}`);
  out.push(`- Decision: learn ${check(r.score.decision.learn)} · contribute ${check(r.score.decision.contribute)} · invest ${check(r.score.decision.invest)} · research ${check(r.score.decision.research)}`);
  out.push('');
  out.push(`## 1. Target & Profile`);
  out.push(`- 类型/领域/复杂度：${r.target.type} / ${r.target.domain} / ${r.target.complexity}`);
  out.push(`- 来源：${r.target.source.kind}${r.target.source.url ? ` · ${r.target.source.url}` : ''}`);
  out.push(`- 判定置信度：${r.target.confidence}`);
  out.push('');
  out.push(`## 2. Six Dimension Score`);
  out.push(`| 维度 | 得分 | 说明 |`);
  out.push(`|------|------|------|`);
  const note: Record<string, string> = {
    technical: '技术质量', innovation: '创新真实性', engineering: '工程落地', ecosystem: '生态影响', risk: '风险暴露', strategic: '战略价值',
  };
  for (const k of Object.keys(note)) out.push(`| ${note[k]} | ${d[k as keyof typeof d]} | ${k} |`);
  out.push('');
  out.push(`- Rationale: ${r.score.rationale}`);
  if (r.score.risk_flags?.length) out.push(`- Risk Flags: ${r.score.risk_flags.join('；')}`);
  out.push('');
  out.push(`## 3. Findings`);
  if (r.findings.length === 0) {
    out.push('未发现显著问题（无发现模式）。');
  } else {
    const order: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4 };
    for (const f of [...r.findings].sort((a, b) => (order[a.severity] ?? 9) - (order[b.severity] ?? 9))) {
      out.push(`### [${f.severity}] ${f.hcr_id ?? f.finding_id} · ${f.title}`);
      out.push(`- Claim: ${f.claim}`);
      out.push(`- Evidence: ${f.evidence_draft}`);
      out.push(`- 证据状态: ${f.evidence_status ?? 'unverifiable'}${f.confidence !== undefined ? `（conf ${f.confidence}）` : ''}`);
      if (f.patch) out.push(`- Patch: ${f.patch}`);
      out.push('');
    }
  }
  out.push(`## 4. Critical Critiques`);
  for (const c of r.critiques) {
    out.push(`- **${c.role}** · ${c.attack_vector}：${c.thesis}`);
    out.push(`  - ${c.reasoning}`);
  }
  out.push('');
  out.push(`## 5. Degradations & Limits`);
  out.push(r.degradations.length ? r.degradations.map(x => `- ${x}`).join('\n') : '- 无');
  out.push('');
  out.push(`## 6. Recommendation`);
  out.push(`- 值得学习：${check(r.score.decision.learn)} · 值得贡献：${check(r.score.decision.contribute)} · 值得投资：${check(r.score.decision.invest)} · 值得研究：${check(r.score.decision.research)}`);
  out.push('');
  out.push(`## 7. Appendix`);
  out.push(`- schema_version: ${r.schema_version} · report_id: ${r.report_id}`);
  out.push(`- 耗时 ${r.meta.duration_seconds}s · 工具链 ${JSON.stringify(r.meta.toolchain)}`);
  return out.join('\n');
}

export function renderAcademic(r: ReviewReport): string {
  const s = r.score;
  const decision = s.score >= 85 && !r.findings.some(f => f.severity === 'CRITICAL' && f.evidence_status === 'verified')
    ? 'Accept'
    : s.score >= 70 && !r.findings.some(f => f.severity === 'CRITICAL' && f.evidence_status === 'verified')
      ? 'Weak Accept'
      : s.score >= 60 || r.findings.some(f => f.severity === 'CRITICAL' && f.evidence_status === 'verified')
        ? 'Weak Reject'
        : 'Reject';
  const out: string[] = [];
  out.push(`# HOS-CRITIC-REVIEW · Academic Decision`);
  out.push('');
  out.push(`Target: ${targetTitle(r)}`);
  out.push(`Decision: **${decision}**`);
  out.push(`Score: ${s.score}/100 · ${s.grade_label}`);
  out.push('');
  out.push(`## 0. 评分卡`);
  out.push(`- One-liner: ${s.one_liner}`);
  out.push(`- Six Dimension: Technical ${s.dimensions.technical} · Innovation ${s.dimensions.innovation} · Engineering ${s.dimensions.engineering} · Ecosystem ${s.dimensions.ecosystem} · Risk ${s.dimensions.risk} · Strategic ${s.dimensions.strategic}`);
  out.push('');
  out.push(`## 1. Reviewer Summary`);
  const byRole = new Map<string, Critique[]>();
  for (const c of r.critiques) {
    if (!byRole.has(c.role)) byRole.set(c.role, []);
    byRole.get(c.role)!.push(c);
  }
  for (const [role, list] of byRole) {
    out.push(`### ${role}`);
    for (const c of list) out.push(`- ${c.thesis} —— ${c.reasoning}`);
  }
  out.push('');
  out.push(`## 2. Critical Blocking Issues`);
  const blockers = r.findings.filter(f => f.severity === 'CRITICAL' || f.severity === 'HIGH');
  if (blockers.length === 0) out.push('- 无阻塞问题');
  for (const f of blockers) out.push(`- [${f.severity}] ${f.hcr_id ?? f.finding_id} · ${f.title} —— ${f.claim}`);
  out.push('');
  out.push(`## 3. Strengths`);
  const recogs = r.critiques.filter(c => c.attack_vector === 'recognition');
  if (recogs.length) for (const c of recogs) out.push(`- ${c.thesis} —— ${c.reasoning}`);
  else out.push('- （无认可类 Critique，见 §1 各角色正面意见）');
  out.push('');
  out.push(`## 4. Suggested Revision`);
  for (const f of r.findings.filter(f => f.patch)) out.push(`- [ ] ${f.patch}（${f.hcr_id ?? f.finding_id}）`);
  out.push('');
  out.push(`## 5. Decision Rationale`);
  out.push(`- Score: ${s.score}/100 · Rationale: ${s.rationale}`);
  return out.join('\n');
}

export function render(r: ReviewReport, mode: string): string {
  switch (mode) {
    case 'expert': return renderExpert(r);
    case 'academic': return renderAcademic(r);
    default: return renderQuick(r);
  }
}
