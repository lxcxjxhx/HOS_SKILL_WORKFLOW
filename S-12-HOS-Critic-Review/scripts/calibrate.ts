/**
 * 基准集校准脚本（M4）：对 benchmark/manifest.json 中每个对象跑机械层（切片 + 分析器），
 * 校验是否满足阈值，报告与人工预评锚点的偏差。规则/代码变更后运行，监控回归。
 * 用法: node scripts/calibrate.ts [--online] [--json]
 */
import { readFileSync } from 'node:fs';
import { chunkText } from './chunker.ts';
import { detectLicense, licenseFindings } from './analyzers/license.ts';
import { detectDataset, datasetFindings } from './analyzers/dataset.ts';
import { regexScan } from './analyzers/code.ts';
import { fetchRepo, metricFindings } from './analyzers/github.ts';

interface BenchItem {
  id: string;
  file?: string;
  url?: string;
  type: string;
  gold: { score: number; grade: string; note?: string };
  mechanical: {
    chunk_min?: number;
    unknown_max_pct?: number;
    findings_min?: number;
    findings_max?: number;
    class?: string;
    abstract?: boolean;
    network?: boolean;
  };
}

interface MechResult {
  chunk: number;
  unknownPct: number;
  findings: Array<{ class: string; severity: string }>;
  abstract: boolean;
}

function chunkType(item: BenchItem): 'repo' | 'paper' | 'article' | 'dataset' | 'license' | 'proposal' {
  if (item.type === 'code' || item.type === 'github') return 'repo';
  if (item.type === 'paper-pdf') return 'paper';
  return item.type as never;
}

async function runMechanical(item: BenchItem, online: boolean): Promise<MechResult | null> {
  if (item.url) {
    if (!online) return null;
    const [o, r] = item.url.split('/');
    const d = await fetchRepo(o, r);
    return { chunk: 0, unknownPct: 0, findings: metricFindings(d).map(f => ({ class: f.class, severity: f.severity })), abstract: false };
  }
  let text = readFileSync(item.file!, 'utf8');
  if (item.type === 'paper-pdf') {
    // PDF 走 PyMuPDF 提取链（与 CLI fetch paper <file.pdf> 一致）
    const { spawnSync } = await import('node:child_process');
    const r = spawnSync('python', ['scripts/tools/pdf-extract.py', item.file], {
      encoding: 'utf8', timeout: 60_000,
      env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' },
      windowsHide: true,
    });
    if (r.status !== 0 || !r.stdout) throw new Error(`PDF 提取失败（需 python + pymupdf）: ${(r.stderr ?? '').slice(0, 120)}`);
    text = (JSON.parse(r.stdout) as { text: string }).text;
  }
  let findings: Array<{ class: string; severity: string }> = [];
  if (item.type === 'license') findings = licenseFindings(detectLicense(text)).map(f => ({ class: f.class, severity: f.severity }));
  if (item.type === 'dataset') findings = datasetFindings(detectDataset(text)).map(f => ({ class: f.class, severity: f.severity }));
  if (item.type === 'code') findings = regexScan(text).map(f => ({ class: f.class, severity: f.severity }));
  const r = await chunkText(text, { type: chunkType(item), source: item.file });
  const unknownPct = r.units.length ? r.units.filter(u => u.role === 'unknown').length / r.units.length : 0;
  return { chunk: r.units.length, unknownPct, findings, abstract: r.units.some(u => /abstract/i.test(u.title)) };
}

function check(item: BenchItem, m: MechResult): string[] {
  const problems: string[] = [];
  const mech = item.mechanical;
  if (mech.chunk_min !== undefined && m.chunk < mech.chunk_min) problems.push(`chunk ${m.chunk} < min ${mech.chunk_min}`);
  if (mech.unknown_max_pct !== undefined && m.unknownPct > mech.unknown_max_pct) problems.push(`unknown ${(m.unknownPct * 100).toFixed(0)}% > ${mech.unknown_max_pct * 100}%`);
  if (mech.findings_min !== undefined && m.findings.length < mech.findings_min) problems.push(`findings ${m.findings.length} < min ${mech.findings_min}`);
  if (mech.findings_max !== undefined && m.findings.length > mech.findings_max) problems.push(`findings ${m.findings.length} > max ${mech.findings_max}`);
  if (mech.class !== undefined && !m.findings.some(f => f.class === mech.class)) problems.push(`缺少 ${mech.class} 类 finding`);
  if (mech.abstract === true && !m.abstract) problems.push('缺少 Abstract 分区');
  return problems;
}

async function main(): Promise<void> {
  const online = process.argv.includes('--online');
  const asJson = process.argv.includes('--json');
  const manifest = JSON.parse(readFileSync('benchmark/manifest.json', 'utf8')) as { items: BenchItem[] };
  const rows: Array<Record<string, unknown>> = [];
  let fail = 0;
  let warn = 0;

  for (const item of manifest.items) {
    let m: MechResult | null = null;
    try {
      m = await runMechanical(item, online);
    } catch (e) {
      rows.push({ id: item.id, status: 'ERROR', detail: (e as Error).message.slice(0, 120) });
      fail++;
      continue;
    }
    if (m === null) {
      rows.push({ id: item.id, status: 'SKIP', detail: '需 --online' });
      continue;
    }
    const problems = check(item, m);
    const status = problems.length === 0 ? 'PASS' : 'FAIL';
    if (status === 'FAIL') fail++;
    rows.push({
      id: item.id, status, gold: `${item.gold.score}/${item.gold.grade}`,
      chunk: m.chunk, unknown: `${(m.unknownPct * 100).toFixed(0)}%`,
      findings: m.findings.length, classes: [...new Set(m.findings.map(f => f.class))].join('+') || '-',
      problems: problems.join('; ') || '-',
    });
  }

  if (asJson) {
    console.log(JSON.stringify({ rows, fail, warn, total: manifest.items.length }, null, 2));
  } else {
    console.log('=== HOS-CRITIC-REVIEW 基准集校准 ===');
    console.log('| id | status | gold | chunk | unknown | findings | classes | problems |');
    console.log('|----|--------|------|-------|---------|----------|---------|----------|');
    for (const r of rows) {
      console.log(`| ${r.id} | ${r.status} | ${r.gold} | ${r.chunk} | ${r.unknown} | ${r.findings} | ${r.classes} | ${r.problems} |`);
    }
    console.log(`\n结果: ${manifest.items.length - fail - warn} PASS / ${warn} WARN / ${fail} FAIL / ${rows.filter(r => r.status === 'SKIP').length} SKIP`);
  }
  process.exitCode = fail > 0 ? 1 : 0;
}

main().catch(e => { console.error(`E_CALIBRATE: ${e.message}`); process.exitCode = 2; });
