/**
 * HOS-CRITIC-REVIEW CLI（M2 骨架）
 * 用法：
 *   node scripts/cli.ts fetch github <owner/repo> --out <dir>
 *   node scripts/cli.ts fetch paper <query> [--paper-id <id>] --out <dir>
 *   node scripts/cli.ts validate <review.json>
 *   node scripts/cli.ts render <review.json> [--mode quick|expert|academic] [--out <file>]
 *   node scripts/cli.ts store <review.json> [--dir database]
 *
 * 定位：辅助脚本层（拉数据/校验/渲染/持久化），智能环节（Critic/Judge/毒舌）由宿主执行。
 */
import { spawnSync } from 'node:child_process';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fetchRepo, metricFindings, saveGitHubData } from './analyzers/github.ts';
import { fetchPaper, paperFindings, savePaperData } from './analyzers/paper.ts';
import { detectLicense, licenseFindings, saveLicenseData } from './analyzers/license.ts';
import { detectDataset, datasetFindings, saveDatasetData } from './analyzers/dataset.ts';
import { scanCodeFile, saveCodeData } from './analyzers/code.ts';
import { chunkText } from './chunker.ts';
import { validateReport } from './core/validate.ts';
import { render } from './render.ts';
import { loadStore, recordReview, toStoreFinding } from './store.ts';
import { emitEvent, enableEvents } from './events.ts';
import { treeSitterDetector } from './detectors/tree-sitter.ts';
import type { ObjectProfile } from './core/types.ts';

const USAGE = `用法:
  node scripts/cli.ts fetch github <owner/repo> --out <dir>
  node scripts/cli.ts fetch paper <query> [--paper-id <id>] --out <dir>
  node scripts/cli.ts fetch license <file> --out <dir>
  node scripts/cli.ts fetch dataset <file> --out <dir>
  node scripts/cli.ts fetch code <file> --out <dir>
  node scripts/cli.ts chunk <file> --type article|paper|repo|proposal|license|dataset [--lang ts|py|...] [--out <dir>]
  node scripts/cli.ts run <type> <target> --until discovery|chunk|analyze [--lang ts|py|...] [--out <dir>]
  node scripts/cli.ts validate <review.json>
  node scripts/cli.ts render <review.json> [--mode quick|expert|academic] [--out <file>]
  node scripts/cli.ts store <review.json> [--dir database]`;

function parseArgs(argv: string[]): Record<string, string> {
  const opts: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      opts[key] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : 'true';
      i += opts[key] !== 'true' ? 1 : 0;
    }
  }
  return opts;
}

function hash6(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(16).padStart(6, '0').slice(0, 6);
}

/** 缓存命中检查：目标文件存在且 mtime 在 ttl 秒内（默认 3600 = 1h） */
async function cacheFresh(file: string, ttlMs = 3_600_000): Promise<boolean> {
  try {
    const s = await stat(file);
    return Date.now() - s.mtimeMs < ttlMs;
  } catch {
    return false;
  }
}

async function readJson<T>(p: string): Promise<T> {
  return JSON.parse(await readFile(p, 'utf8')) as T;
}

async function cmdFetchGithub(target: string, out: string): Promise<void> {
  const [owner, repo] = target.split('/');
  if (!owner || !repo) throw new Error('github 目标需为 owner/repo');
  emitEvent('review.started', { target });

  const dataFile = `${out}/data/github.json`;
  const data = await cacheFresh(dataFile)
    ? await readJson<typeof fetchRepo extends (...a: never[]) => Promise<infer T> ? T : never>(dataFile)
    : await fetchRepo(owner, repo);
  await saveGitHubData(data, dataFile);
  let findings: Array<Record<string, unknown>>;
  if (!(await cacheFresh(`${out}/data/findings-draft.json`))) {
    findings = metricFindings(data).map((f, i) => ({
      finding_id: `finding-${String(i + 1).padStart(3, '0')}`,
      class: f.class, severity: f.severity, title: f.title,
      claim: f.claim, evidence_draft: f.evidence_draft,
      unit_refs: ['unit-000'], analyzer: 'github-analyzer', confidence: 0.9,
    }));
    await mkdir(`${out}/data`, { recursive: true });
    await writeFile(`${out}/data/findings-draft.json`, JSON.stringify(findings, null, 2) + '\n', 'utf8');
  } else {
    findings = await readJson<Array<Record<string, unknown>>>(`${out}/data/findings-draft.json`);
  }
  const profile: ObjectProfile = {
    object_id: `obj-${hash6(target)}`,
    type: 'repo', domain: 'general', complexity: 'medium',
    size_estimate: { tokens: null },
    source: { kind: 'url', url: data.url },
    meta: { title: target, description: data.description, license: data.license },
    confidence: 0.95,
  };
  await writeFile(`${out}/object-profile.json`, JSON.stringify(profile, null, 2) + '\n', 'utf8');

  const m = data.metrics;
  emitEvent('discovery.done', { object_id: profile.object_id, type: 'repo', complexity: 'medium' });
  emitEvent('analyze.done', { findings: findings.length });
  console.log(`REPO=${target} STARS=${m.stars} PUSH_DAYS=${m.days_since_push} ARCHIVED=${m.archived} ISSUES_OPEN=${m.open_issues} PR_MEDIAN_H=${m.pr_merge_median_hours ?? 'n/a'} BUS_FACTOR=${m.bus_factor_pct ?? 'n/a'}% FINDINGS=${findings.length}`);
  console.log(`OUT=${resolve(out)}`);
  emitEvent('review.finished', { status: 'ok', degradations: 0 });
}

async function cmdFetchPaper(target: string, paperId: string | undefined, out: string): Promise<void> {
  if (target.toLowerCase().endsWith('.pdf')) return cmdFetchPaperPdf(target, out);
  const dataFile = `${out}/data/paper.json`;
  const data = await cacheFresh(dataFile)
    ? await readJson<typeof fetchPaper extends (...a: never[]) => Promise<infer T> ? T : never>(dataFile)
    : await fetchPaper(target, paperId);
  await savePaperData(data, dataFile);
  const findings = paperFindings(data).map((f, i) => ({
    finding_id: `finding-${String(i + 1).padStart(3, '0')}`,
    class: f.class, severity: f.severity, title: f.title,
    claim: f.claim, evidence_draft: f.evidence_draft,
    unit_refs: ['unit-000'], analyzer: 'paper-analyzer', confidence: 0.85,
  }));
  await writeFile(`${out}/data/findings-draft.json`, JSON.stringify(findings, null, 2) + '\n', 'utf8');

  const p = data.paper;
  const profile: ObjectProfile = {
    object_id: `obj-${hash6(target)}`,
    type: 'paper', domain: 'general', complexity: 'medium',
    source: { kind: 'query', url: null },
    meta: { title: p?.title ?? target, year: p?.year, venue: p?.venue },
    confidence: p ? 0.9 : 0.5,
  };
  await writeFile(`${out}/object-profile.json`, JSON.stringify(profile, null, 2) + '\n', 'utf8');

  console.log(`PAPER=${p ? p.title : 'NOT FOUND'} YEAR=${p?.year ?? 'n/a'} CITATIONS=${p?.citationCount ?? 'n/a'} VENUE=${p?.venue ?? 'n/a'} FINDINGS=${findings.length}`);
  console.log(`OUT=${resolve(out)}`);
}

async function cmdFetchCode(file: string, out: string): Promise<void> {
  const data = scanCodeFile(file);
  await saveCodeData(data, `${out}/data/code-scan.json`);
  const findings = data.findings.map((f, i) => ({
    finding_id: `finding-${String(i + 1).padStart(3, '0')}`,
    class: f.class, severity: f.severity, title: f.title,
    claim: f.claim, evidence_draft: f.evidence_draft,
    unit_refs: [`unit-L${f.line ?? '000'}`], analyzer: f.tool === 'semgrep' ? 'code-analyzer(semgrep)' : 'code-analyzer(regex)', confidence: 0.9,
  }));
  await mkdir(`${out}/data`, { recursive: true });
  await writeFile(`${out}/data/findings-draft.json`, JSON.stringify(findings, null, 2) + '\n', 'utf8');
  const profile: ObjectProfile = {
    object_id: `obj-${hash6(file)}`,
    type: 'repo', domain: 'code', complexity: 'low',
    source: { kind: 'path', url: file },
    meta: { title: file },
    confidence: 0.9,
  };
  await writeFile(`${out}/object-profile.json`, JSON.stringify(profile, null, 2) + '\n', 'utf8');
  emitEvent('analyze.done', { findings: findings.length, tool: data.tool });
  console.log(`CODE=${file} TOOL=${data.tool} FINDINGS=${findings.length}${data.semgrep_error ? ` SEMGREP_ERR=${data.semgrep_error}` : ''}`);
  console.log(`OUT=${resolve(out)}`);
}

async function cmdFetchDataset(file: string, out: string): Promise<void> {
  const text = await readFile(file, 'utf8');
  const data = detectDataset(text);
  await saveDatasetData(data, `${out}/data/dataset.json`);
  const findings = datasetFindings(data).map((f, i) => ({
    finding_id: `finding-${String(i + 1).padStart(3, '0')}`,
    class: f.class, severity: f.severity, title: f.title,
    claim: f.claim, evidence_draft: f.evidence_draft,
    unit_refs: ['unit-000'], analyzer: 'dataset-analyzer', confidence: 0.85,
  }));
  await mkdir(`${out}/data`, { recursive: true });
  await writeFile(`${out}/data/findings-draft.json`, JSON.stringify(findings, null, 2) + '\n', 'utf8');
  const profile: ObjectProfile = {
    object_id: `obj-${hash6(file)}`,
    type: 'dataset', domain: 'data', complexity: 'low',
    source: { kind: 'path', url: file },
    meta: { title: file, size: data.size, license: data.license },
    confidence: 0.85,
  };
  await writeFile(`${out}/object-profile.json`, JSON.stringify(profile, null, 2) + '\n', 'utf8');
  emitEvent('analyze.done', { findings: findings.length, size: data.size, license: data.license });
  console.log(`DATASET=${file} SIZE=${data.size ?? 'n/a'} SOURCES=${data.sources.length} LICENSE=${data.license ?? 'none'} FINDINGS=${findings.length}`);
  console.log(`OUT=${resolve(out)}`);
}

async function cmdFetchLicense(file: string, out: string): Promise<void> {
  const text = await readFile(file, 'utf8');
  const data = detectLicense(text);
  await saveLicenseData(data, `${out}/data/license.json`);
  const findings = licenseFindings(data).map((f, i) => ({
    finding_id: `finding-${String(i + 1).padStart(3, '0')}`,
    class: f.class, severity: f.severity, title: f.title,
    claim: f.claim, evidence_draft: f.evidence_draft,
    unit_refs: ['unit-000'], analyzer: 'license-analyzer', confidence: 0.9,
  }));
  await mkdir(`${out}/data`, { recursive: true });
  await writeFile(`${out}/data/findings-draft.json`, JSON.stringify(findings, null, 2) + '\n', 'utf8');
  const profile: ObjectProfile = {
    object_id: `obj-${hash6(file)}`,
    type: 'license', domain: 'legal', complexity: 'low',
    source: { kind: 'path', url: file },
    meta: { title: file, spdx: data.spdx },
    confidence: 0.9,
  };
  await writeFile(`${out}/object-profile.json`, JSON.stringify(profile, null, 2) + '\n', 'utf8');
  emitEvent('analyze.done', { findings: findings.length, spdx: data.spdx });
  console.log(`LICENSE=${data.spdx ?? 'NONE'} MATCH=${data.matched_by} CLAUSES=${data.detected_clauses.length} FINDINGS=${findings.length}`);
  console.log(`OUT=${resolve(out)}`);
}

/** PDF 提取（python + pymupdf，可选工具）；不可用时由调用方降级 */
async function extractPdf(file: string): Promise<{ file: string; total_pages: number; text: string; pages: unknown[] }> {
  const r = spawnSync('python', ['scripts/tools/pdf-extract.py', file], {
    encoding: 'utf8', timeout: 60_000,
    env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' },
    windowsHide: true,
  });
  if (r.status !== 0 || !r.stdout) throw new Error(`PDF 提取失败（需 python + pymupdf）: ${(r.stderr ?? '').slice(0, 200)}`);
  return JSON.parse(r.stdout);
}

async function cmdFetchPaperPdf(file: string, out: string): Promise<void> {
  const pdf = await extractPdf(file);
  await mkdir(`${out}/data`, { recursive: true });
  await writeFile(`${out}/data/paper-pdf.json`, JSON.stringify(pdf, null, 2) + '\n', 'utf8');
  const chunk = await chunkText(pdf.text, { type: 'paper', source: file });
  await writeFile(`${out}/chunk-result.json`, JSON.stringify(chunk, null, 2) + '\n', 'utf8');
  await writeFile(`${out}/data/findings-draft.json`, JSON.stringify([], null, 2) + '\n', 'utf8');
  const profile: ObjectProfile = {
    object_id: `obj-${hash6(file)}`,
    type: 'paper', domain: 'general', complexity: 'medium',
    source: { kind: 'path', url: file },
    meta: { title: file },
    confidence: 0.85,
  };
  await writeFile(`${out}/object-profile.json`, JSON.stringify(profile, null, 2) + '\n', 'utf8');
  emitEvent('chunk.done', { units: chunk.units.length, strategy: chunk.strategy, pdf_pages: pdf.total_pages });
  emitEvent('analyze.done', { findings: 0, note: '论文检查点由宿主基于文本执行' });
  console.log(`PAPER-PDF=${file} PAGES=${pdf.total_pages} UNITS=${chunk.units.length} STRATEGY=${chunk.strategy}`);
  console.log(`OUT=${resolve(out)}`);
}

async function cmdChunk(file: string, type: string, lang: string | undefined, out: string | undefined, useTsDetector = true): Promise<void> {
  let text: string;
  let chunkType: string = type;
  if (file.toLowerCase().endsWith('.pdf')) {
    const pdf = await extractPdf(file);
    text = pdf.text;
    chunkType = 'paper';
    if (out) {
      await mkdir(`${out}/data`, { recursive: true });
      await writeFile(`${out}/data/paper-pdf.json`, JSON.stringify(pdf, null, 2) + '\n', 'utf8');
    }
  } else {
    text = await readFile(file, 'utf8');
  }
  const detectors = useTsDetector ? [treeSitterDetector] : [];
  const r = await chunkText(text, { type: chunkType as never, lang, source: file, detectors });
  const l1 = r.units.filter(u => u.level === 1).length;
  const l2 = r.units.filter(u => u.level === 2).length;
  const roles: Record<string, number> = {};
  for (const u of r.units) roles[u.role] = (roles[u.role] ?? 0) + 1;
  if (out) {
    await mkdir(out, { recursive: true });
    await writeFile(`${out}/chunk-result.json`, JSON.stringify(r, null, 2) + '\n', 'utf8');
  }
  emitEvent('chunk.done', { units: r.units.length, strategy: r.strategy, roles: Object.keys(roles).length });
  const totalTokens = r.units.reduce((s, u) => s + u.tokens, 0);
  const budget = 60_000; // config.yaml budget.max_pre_critic_tokens
  console.log(`CHUNK=${r.strategy} UNITS=${r.units.length} L1=${l1} L2=${l2} TOKENS=${totalTokens} BUDGET_USE=${(totalTokens / budget * 100).toFixed(0)}% ROLES=${JSON.stringify(roles)} DEGRAD=${r.degradations.length}`);
  console.log(`OUT=${resolve(out ?? '.')}`);
}

async function cmdValidate(file: string): Promise<void> {
  const r = await readJson(file);
  const res = validateReport(r);
  if (res.ok) console.log(`VALIDATE=OK ${file}（findings=${(r as { findings?: unknown[] }).findings?.length ?? 0} critiques=${(r as { critiques?: unknown[] }).critiques?.length ?? 0} score=${(r as { score?: { score?: number } }).score?.score ?? 'n/a'}）`);
  else {
    console.error(`VALIDATE=FAIL ${file}`);
    for (const e of res.errors) console.error(`  - ${e}`);
    process.exitCode = 3;
  }
}

async function cmdRender(file: string, mode: string, out: string | undefined): Promise<void> {
  const r = await readJson(file);
  const md = render(r, mode);
  if (out) {
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, md + '\n', 'utf8');
    console.log(`RENDER=${mode} OK → ${resolve(out)}`);
  } else console.log(md);
}

async function cmdStore(file: string, dir: string): Promise<void> {
  const r = await readJson(file);
  const res = validateReport(r);
  if (!res.ok) throw new Error(`报告未通过校验，拒绝入库：${res.errors.join('; ')}`);
  const store = await loadStore(dir);
  const entries = r.findings.map(f => {
    const hcrId = f.hcr_id ?? `${f.class}-${new Date().getFullYear()}-${f.finding_id.slice(-4)}`;
    return toStoreFinding(f, hcrId, r.target.object_id, [], f.evidence_status === 'refuted' ? 'refuted' : 'open');
  });
  await recordReview(r, entries, dir);
  console.log(`STORE=OK report=${r.report_id} findings=${entries.length} → ${resolve(dir)}`);
}

const TYPE_MAP: Record<string, ObjectProfile['type']> = { github: 'repo', paper: 'paper', article: 'article', proposal: 'proposal', license: 'license', dataset: 'dataset', code: 'repo' };
const RUN_STAGES = ['discovery', 'chunk', 'analyze'];

function makeProfile(type: string, target: string): ObjectProfile {
  const t = TYPE_MAP[type] ?? 'unknown';
  const isFile = type !== 'github';
  return {
    object_id: `obj-${hash6(target)}`, type: t, domain: 'general', complexity: 'low',
    source: { kind: isFile ? 'path' : 'url', url: isFile ? target : `https://github.com/${target}` },
    meta: { title: target }, confidence: 0.8,
  };
}

/** run：流水线编排（discovery → chunk → analyze），--until 截断；critic/judge/report 由宿主执行 */
async function cmdRun(type: string, target: string, out: string, until: string, lang?: string): Promise<void> {
  if (!RUN_STAGES.includes(until)) throw new Error(`--until 必须为 ${RUN_STAGES.join('|')}（critic/judge/report 阶段由宿主执行）`);
  emitEvent('review.started', { target, type });
  await mkdir(out, { recursive: true });
  const profile = makeProfile(type, target);
  await writeFile(`${out}/object-profile.json`, JSON.stringify(profile, null, 2) + '\n', 'utf8');
  emitEvent('discovery.done', { object_id: profile.object_id, type: profile.type, complexity: profile.complexity });
  if (until === 'discovery') {
    emitEvent('review.finished', { status: 'truncated', stage: 'discovery' });
    console.log(`RUN=${type} ${target} UNTIL=discovery → ${resolve(out)}`);
    return;
  }

  let chunkUnits = 0;
  if (type !== 'github') {
    try {
      const text = await readFile(target, 'utf8');
      const r = await chunkText(text, { type: profile.type, lang, source: target, detectors: [treeSitterDetector] });
      await writeFile(`${out}/chunk-result.json`, JSON.stringify(r, null, 2) + '\n', 'utf8');
      chunkUnits = r.units.length;
      emitEvent('chunk.done', { units: chunkUnits, strategy: r.strategy });
    } catch {
      emitEvent('chunk.done', { units: 0, skipped: true });
    }
  } else {
    emitEvent('chunk.done', { units: 0, skipped: true, note: 'github 远程对象：fetch 后由宿主切片' });
  }
  if (until === 'chunk') {
    emitEvent('review.finished', { status: 'truncated', stage: 'chunk' });
    console.log(`RUN=${type} ${target} UNTIL=chunk UNITS=${chunkUnits} → ${resolve(out)}`);
    return;
  }

  const n = await analyzeForRun(type, target, out);
  emitEvent('analyze.done', { findings: n });
  emitEvent('review.finished', { status: 'ok', stage: 'analyze' });
  console.log(`RUN=${type} ${target} UNTIL=analyze UNITS=${chunkUnits} FINDINGS=${n} → ${resolve(out)}`);
}

async function analyzeForRun(type: string, target: string, out: string): Promise<number> {
  const mk = (f: { class: string; severity: string; title: string; claim: string; evidence_draft: string }, i: number) => ({
    finding_id: `finding-${String(i + 1).padStart(3, '0')}`,
    class: f.class, severity: f.severity, title: f.title, claim: f.claim, evidence_draft: f.evidence_draft,
    unit_refs: ['unit-000'], analyzer: `${type}-analyzer`, confidence: 0.85,
  });
  await mkdir(`${out}/data`, { recursive: true });
  let findings: Array<Record<string, unknown>> = [];
  try {
    if (type === 'github') {
      const [o, r] = target.split('/');
      if (!o || !r) throw new Error('github 目标需为 owner/repo');
      const d = await fetchRepo(o, r);
      await saveGitHubData(d, `${out}/data/github.json`);
      findings = metricFindings(d).map(mk);
    } else if (type === 'paper') {
      const data = await fetchPaper(target);
      await savePaperData(data, `${out}/data/paper.json`);
      findings = paperFindings(data).map(mk);
    } else if (type === 'license') {
      const d = detectLicense(await readFile(target, 'utf8'));
      await saveLicenseData(d, `${out}/data/license.json`);
      findings = licenseFindings(d).map(mk);
    } else if (type === 'dataset') {
      const d = detectDataset(await readFile(target, 'utf8'));
      await saveDatasetData(d, `${out}/data/dataset.json`);
      findings = datasetFindings(d).map(mk);
    } else if (type === 'code') {
      const d = scanCodeFile(target);
      await saveCodeData(d, `${out}/data/code-scan.json`);
      findings = d.findings.map((f, i) => mk(f, i));
    }
    // article/proposal：文本启发式由宿主执行，CLI 产出空 findings
  } catch (e) {
    emitEvent('analyze.done', { skipped: true, error: (e as Error).message });
  }
  await writeFile(`${out}/data/findings-draft.json`, JSON.stringify(findings, null, 2) + '\n', 'utf8');
  return findings.length;
}

async function main(): Promise<void> {
  const [cmd, sub, target] = process.argv.slice(2);
  const opts = parseArgs(process.argv.slice(4));
  if (opts.events === 'true') enableEvents();
  if (!cmd || cmd === '--help' || cmd === '-h') { console.log(USAGE); return; }
  switch (cmd) {
    case 'fetch':
      if (sub === 'github') await cmdFetchGithub(target, opts.out ?? '.');
      else if (sub === 'paper') await cmdFetchPaper(target, opts['paper-id'], opts.out ?? '.');
      else if (sub === 'license') await cmdFetchLicense(target, opts.out ?? '.');
      else if (sub === 'dataset') await cmdFetchDataset(target, opts.out ?? '.');
      else if (sub === 'code') await cmdFetchCode(target, opts.out ?? '.');
      else throw new Error('fetch 子命令: github | paper | license | dataset | code');
      break;
    case 'chunk': await cmdChunk(sub, opts.type ?? 'article', opts.lang, opts.out, opts['no-tree-sitter'] !== 'true'); break;
    case 'run': await cmdRun(sub, target, opts.out ?? '.', opts.until ?? 'analyze', opts.lang); break;
    case 'validate': await cmdValidate(sub); break;
    case 'render': await cmdRender(sub, opts.mode ?? 'quick', opts.out); break;
    case 'store': await cmdStore(sub, opts.dir ?? 'database'); break;
    default: throw new Error(`未知命令 ${cmd}\n${USAGE}`);
  }
}

main().catch(e => { console.error(`E_CLI: ${e.message}`); process.exitCode = 2; });
