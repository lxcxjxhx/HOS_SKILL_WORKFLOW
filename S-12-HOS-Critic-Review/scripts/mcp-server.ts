/**
 * MCP server 基础版（对应 docs/07 §7.6 展望）。
 * JSON-RPC 2.0 over stdio：expose `review` 工具（Input Payload → ReviewReport 摘要）。
 * 零依赖实现。用法: node scripts/mcp-server.ts
 *
 * 支持方法：initialize / notifications/initialized / tools/list / tools/call
 */
import { readFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { chunkText } from './chunker.ts';
import { detectLicense, licenseFindings } from './analyzers/license.ts';
import { detectDataset, datasetFindings } from './analyzers/dataset.ts';
import { scanCodeFile } from './analyzers/code.ts';
import { fetchRepo, metricFindings } from './analyzers/github.ts';
import { fetchPaper, paperFindings } from './analyzers/paper.ts';
import type { ObjectProfile } from './core/types.ts';

const VERSION = '0.3.0';

interface ReviewInput {
  type: string;
  target: string;
  lang?: string;
}

/** 轻量流水线：discovery + chunk + analyze（与 CLI run 对齐；critic/judge/report 由宿主执行） */
async function runReview(input: ReviewInput): Promise<Record<string, unknown>> {
  const { type, target } = input;
  const t: ObjectProfile['type'] = type === 'code' ? 'repo' : type === 'github' ? 'repo' : (type as never);
  const profile: ObjectProfile = {
    object_id: `obj-${hash6(target)}`,
    type: t, domain: 'general', complexity: 'low',
    source: { kind: type === 'github' ? 'url' : 'path', url: target },
    meta: { title: target }, confidence: 0.8,
  };

  let units = 0;
  let strategy = '';
  let findings: Array<Record<string, unknown>> = [];
  const mk = (f: { class: string; severity: string; title: string; claim: string; evidence_draft: string }, i: number) => ({
    finding_id: `finding-${String(i + 1).padStart(3, '0')}`,
    class: f.class, severity: f.severity, title: f.title, claim: f.claim, evidence_draft: f.evidence_draft,
    unit_refs: ['unit-000'], analyzer: `${type}-analyzer`, confidence: 0.85,
  });

  try {
    if (type === 'github') {
      const [o, r] = target.split('/');
      if (!o || !r) throw new Error('github 目标需为 owner/repo');
      const d = await fetchRepo(o, r);
      findings = metricFindings(d).map(mk);
    } else if (type === 'paper') {
      const data = await fetchPaper(target);
      findings = paperFindings(data).map(mk);
    } else {
      let text: string;
      if (target.toLowerCase().endsWith('.pdf')) {
        const { spawnSync } = await import('node:child_process');
        const rr = spawnSync('python', ['scripts/tools/pdf-extract.py', target], { encoding: 'utf8', timeout: 60_000, env: { ...process.env, PYTHONIOENCODING: 'utf-8' } });
        text = rr.status === 0 && rr.stdout ? (JSON.parse(rr.stdout) as { text: string }).text : '';
      } else {
        text = readFileSync(target, 'utf8');
      }
      const cr = await chunkText(text, { type: t, lang: input.lang, source: target });
      units = cr.units.length;
      strategy = cr.strategy;
      if (type === 'license') findings = licenseFindings(detectLicense(text)).map(mk);
      if (type === 'dataset') findings = datasetFindings(detectDataset(text)).map(mk);
      if (type === 'code') findings = scanCodeFile(target).findings.map((f, i) => mk(f, i));
    }
  } catch (e) {
    return { ok: false, error: (e as Error).message, profile };
  }
  return { ok: true, profile, units, strategy, findings };
}

function hash6(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(16).padStart(6, '0').slice(0, 6);
}

const TOOLS = [
  {
    name: 'review',
    description: '对技术对象执行 HOS-CRITIC-REVIEW 机械层评审（discovery+chunk+analyze）；critic/judge/report 由宿主 LLM 按 SKILL.md 继续',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['github', 'paper', 'license', 'dataset', 'code', 'article', 'proposal'], description: '对象类型' },
        target: { type: 'string', description: 'owner/repo、查询词或本地文件路径' },
        lang: { type: 'string', description: '代码语言（可选，如 ts/py）' },
      },
      required: ['type', 'target'],
    },
  },
];

function handle(msg: Record<string, unknown>): Record<string, unknown> | null {
  const id = msg.id as number;
  const method = msg.method as string;
  const params = (msg.params ?? {}) as Record<string, unknown>;

  if (method === 'initialize') {
    return { jsonrpc: '2.0', id, result: { protocolVersion: '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: 'hos-critic-review', version: VERSION } } };
  }
  if (method === 'notifications/initialized') return null; // 通知无响应
  if (method === 'ping') return { jsonrpc: '2.0', id, result: {} };
  if (method === 'tools/list') return { jsonrpc: '2.0', id, result: { tools: TOOLS } };
  if (method === 'tools/call') {
    const name = (params as { name?: string }).name;
    const args = ((params as { arguments?: Record<string, unknown> }).arguments ?? {}) as Record<string, unknown>;
    if (name !== 'review') return { jsonrpc: '2.0', id, error: { code: -32602, message: `未知工具 ${name}` } };
    const input = { type: String(args.type ?? ''), target: String(args.target ?? ''), lang: args.lang as string | undefined };
    runReview(input).then(result => {
      process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] } }) + '\n');
    }).catch(e => {
      process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, error: { code: -32603, message: String(e) } }) + '\n');
    });
    return undefined; // 异步，稍后输出
  }
  return { jsonrpc: '2.0', id, error: { code: -32601, message: `未知方法 ${method}` } };
}

const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });
rl.on('line', line => {
  if (!line.trim()) return;
  try {
    const msg = JSON.parse(line) as Record<string, unknown>;
    const resp = handle(msg);
    if (resp) process.stdout.write(JSON.stringify(resp) + '\n');
  } catch {
    // 忽略非法 JSON
  }
});
