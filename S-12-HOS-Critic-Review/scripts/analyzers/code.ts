/**
 * Code Analyzer：静态代码扫描。
 * 首选真实工具 semgrep（探测可用则用，Windows 下需 PYTHONIOENCODING=utf-8 规避 GBK 崩溃）；
 * 不可用时降级内置正则扫描（硬编码密钥/eval/innerHTML/TODO）。
 * 对应 docs/05 code-analyzer 插件。零 npm 依赖（node:child_process）。
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export interface CodeFinding {
  class: string;
  severity: string;
  title: string;
  claim: string;
  evidence_draft: string;
  line: number | null;
  tool: 'semgrep' | 'regex';
}

export interface CodeScanData {
  tool: 'semgrep' | 'regex' | 'none';
  semgrep_error?: string;
  findings: CodeFinding[];
}

interface SemgrepResult {
  check_id: string;
  path: string;
  start: { line: number };
  end?: { line: number };
  extra?: { message?: string; severity?: string; metadata?: Record<string, unknown> };
}

const SEV_MAP: Record<string, string> = { ERROR: 'HIGH', WARNING: 'MEDIUM', INFO: 'LOW' };

function semgrepSeverity(s: string | undefined): string {
  return SEV_MAP[s ?? ''] ?? 'LOW';
}

function semgrepClass(message: string, checkId: string): string {
  const m = `${message} ${checkId}`.toLowerCase();
  if (/(hardcod|password|secret|token|credential|api[_-]?key)/.test(m)) return 'SEC';
  if (/(eval|exec|command injection|injection|deserialization)/.test(m)) return 'SEC';
  if (/(xss|innerhtml|sanitize)/.test(m)) return 'SEC';
  if (/(todo|fixme|dead|unused)/.test(m)) return 'REPRO';
  return 'SEC';
}

function runSemgrep(file: string): { ok: boolean; results: SemgrepResult[]; error?: string } {
  try {
    const config = existsSync('.semgrep/rules') ? '.semgrep/rules' : 'p/default';
    const r = spawnSync('semgrep', ['scan', '--json', '--quiet', '--config', config, file], {
      encoding: 'utf8',
      timeout: 120_000,
      env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' },
      windowsHide: true,
    });
    if (r.status !== 0 && r.status !== 1 && r.status !== 2) return { ok: false, results: [], error: (r.stderr ?? '').slice(0, 200) };
    if (!r.stdout) return { ok: false, results: [], error: (r.stderr ?? '').slice(0, 200) };
    const j = JSON.parse(r.stdout) as { results?: SemgrepResult[] };
    return { ok: true, results: j.results ?? [] };
  } catch (e) {
    return { ok: false, results: [], error: String(e).slice(0, 200) };
  }
}

/** 内置正则扫描（无 semgrep 时兜底，确定性输出） */
export function regexScan(text: string): CodeFinding[] {
  const lines = text.split('\n');
  const out: CodeFinding[] = [];
  const push = (re: RegExp, cls: string, sev: string, title: string, claim: string) => {
    for (let i = 0; i < lines.length; i++) {
      if (re.test(lines[i])) {
        out.push({ class: cls, severity: sev, title, claim, evidence_draft: `第 ${i + 1} 行: ${lines[i].trim().slice(0, 80)}`, line: i + 1, tool: 'regex' });
      }
    }
  };
  push(/(api[_-]?key|secret|passwd|password|token)\s*[:=]\s*["'][A-Za-z0-9_\-]{12,}["']/i, 'SEC', 'HIGH', '疑似硬编码密钥/口令', '凭据硬编码在源码中，存在泄露风险');
  push(/\b(eval|exec|execSync|child_process\.exec|new Function)\s*\(/, 'SEC', 'MEDIUM', '危险动态执行调用', '动态执行用户可控输入存在代码注入风险');
  push(/\binnerHTML\s*=/, 'SEC', 'MEDIUM', 'innerHTML 直接赋值', '未净化内容直接注入 DOM 存在 XSS 风险');
  push(/\b(TODO|FIXME)\b/, 'REPRO', 'LOW', '遗留 TODO/FIXME', '存在未完成实现标记');
  return out;
}

/** semgrep JSON results → 统一 Finding（纯函数，可单测） */
export function mapSemgrepResults(results: SemgrepResult[]): CodeFinding[] {
  return results.map(r => ({
    class: semgrepClass(r.extra?.message ?? '', r.check_id),
    severity: semgrepSeverity(r.extra?.severity),
    title: r.check_id.split('.').pop() ?? r.check_id,
    claim: (r.extra?.message ?? '').slice(0, 120) || `semgrep 规则命中: ${r.check_id}`,
    evidence_draft: `${r.path}:${r.start.line}`,
    line: r.start.line,
    tool: 'semgrep' as const,
  }));
}

/** 扫描入口：semgrep 优先 + 正则互补（去重 by line+title），均不可用则空 */
export function scanCodeFile(file: string): CodeScanData {
  let text: string | null = null;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    /* 文件不可读，交由下方处理 */
  }
  const sem = runSemgrep(file);
  const semFindings = sem.ok ? mapSemgrepResults(sem.results) : [];
  const regexFindings = text !== null ? regexScan(text) : [];
  // 合并去重（同一行+同一标题只留一条，semgrep 优先）
  const seen = new Set<string>();
  const merged = [...semFindings, ...regexFindings].filter(f => {
    const k = `${f.line}:${f.title}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  const tool = sem.ok ? (regexFindings.length ? 'semgrep+regex' : 'semgrep') : text !== null ? 'regex' : 'none';
  return { tool, semgrep_error: sem.ok ? undefined : sem.error, findings: merged };
}

export async function saveCodeData(data: CodeScanData, outFile: string): Promise<void> {
  await mkdir(dirname(outFile), { recursive: true });
  await writeFile(outFile, JSON.stringify(data, null, 2) + '\n', 'utf8');
}
