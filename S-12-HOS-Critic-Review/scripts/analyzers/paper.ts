/**
 * Paper Analyzer：Semantic Scholar 数据拉取（元数据 + 引用量 + 被引时间线）。
 * 对应 docs/05 §5.4。零依赖（Node 内建 fetch）。公开端点限流 ~100 req/5min。
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const API = 'https://api.semanticscholar.org/graph/v1';

export interface PaperData {
  query: string;
  fetched_at: string;
  error?: string;
  paper: {
    paperId: string;
    title: string;
    abstract: string | null;
    year: number | null;
    venue: string | null;
    citationCount: number;
    authors: Array<{ authorId: string | null; name: string }>;
    externalIds: Record<string, string> | null;
  } | null;
  citations: Array<{ year: number | null; title: string }>;
  searchResults: Array<{ paperId: string; title: string; year: number | null; citationCount: number; venue: string | null }>;
}

async function get(path: string, retries = 2): Promise<Record<string, unknown> | Array<Record<string, unknown>>> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`${API}${path}`, { headers: { Accept: 'application/json' } });
    if (res.ok) return res.json() as never;
    if ((res.status === 429 || res.status >= 500) && attempt < retries) {
      await new Promise(r => setTimeout(r, 1500 * (attempt + 1)));
      continue;
    }
    throw new Error(`Semantic Scholar API ${res.status} for ${path}`);
  }
}

/** 按标题/ID 搜索论文，取最佳匹配 */
export async function searchPaper(query: string): Promise<PaperData['searchResults']> {
  const q = encodeURIComponent(query);
  const r = await get(`/paper/search?query=${q}&limit=5&fields=paperId,title,year,citationCount,venue`) as { data: Array<Record<string, unknown>> };
  return (r.data ?? []).map(d => ({
    paperId: String(d.paperId), title: String(d.title),
    year: d.year === null ? null : Number(d.year),
    citationCount: Number(d.citationCount ?? 0),
    venue: d.venue === null ? null : String(d.venue),
  }));
}

/** 拉取论文元数据 + 被引前 100 条；API 限流/失败时降级返回（error 字段标记，不中断） */
export async function fetchPaper(query: string, paperId?: string): Promise<PaperData> {
  try {
    const results = await searchPaper(query);
    const target = results.find(r => r.paperId === paperId) ?? results[0] ?? null;
    let paper: PaperData['paper'] = null;
    let citations: PaperData['citations'] = [];

    if (target) {
      const fields = 'title,abstract,year,venue,citationCount,authors,externalIds';
      const meta = await get(`/paper/${target.paperId}?fields=${fields}`) as Record<string, unknown>;
      paper = {
        paperId: String(meta.paperId),
        title: String(meta.title),
        abstract: meta.abstract === null ? null : String(meta.abstract),
        year: meta.year === null ? null : Number(meta.year),
        venue: meta.venue === null ? null : String(meta.venue),
        citationCount: Number(meta.citationCount ?? 0),
        authors: (meta.authors as Array<{ authorId: string | null; name: string }> ?? []).slice(0, 10),
        externalIds: meta.externalIds as Record<string, string> | null,
      };
      const cit = await get(`/paper/${target.paperId}/citations?fields=title,year&limit=100`) as { data?: Array<{ citingPaper?: { title?: string; year?: number | null } }> };
      citations = (cit.data ?? []).map(c => ({
        title: c.citingPaper?.title ?? '',
        year: c.citingPaper?.year ?? null,
      }));
    }

    return { query, fetched_at: new Date().toISOString(), paper, citations, searchResults: results };
  } catch (e) {
    return { query, fetched_at: new Date().toISOString(), error: (e as Error).message, paper: null, citations: [], searchResults: [] };
  }
}

/** 引用数据 → 检查点（对应 docs/05 §5.4.2） */
export function paperFindings(data: PaperData): Array<{ class: string; severity: string; title: string; claim: string; evidence_draft: string }> {
  const out: Array<{ class: string; severity: string; title: string; claim: string; evidence_draft: string }> = [];
  const p = data.paper;
  const { citations } = data;
  if (data.error) {
    out.push({ class: 'REPRO', severity: 'MEDIUM', title: 'Semantic Scholar 限流/不可用，论文数据不可得', claim: '无法核验引用与影响力数据', evidence_draft: data.error });
    return out;
  }
  if (!p) {
    out.push({ class: 'REPRO', severity: 'MEDIUM', title: '无法在 Semantic Scholar 定位论文', claim: '论文可检索性存疑或尚未收录', evidence_draft: `查询 "${data.query}" 无结果` });
    return out;
  }
  const age = p.year ? new Date().getFullYear() - p.year : null;
  if (age !== null && age < 1) out.push({ class: 'EVAL', severity: 'LOW', title: '论文过新，引用量为零属正常', claim: '暂无引用支撑影响力判断', evidence_draft: `发表 ${age} 年，引用 ${p.citationCount}` });
  if (p.citationCount === 0 && age !== null && age >= 2) out.push({ class: 'ECO', severity: 'MEDIUM', title: '发表 2 年以上零引用', claim: '学术影响力可疑', evidence_draft: `引用数 0（发表 ${age} 年）` });
  const recentYears = citations.filter(c => c.year !== null && c.year >= new Date().getFullYear() - 1).length;
  if (p.citationCount > 0 && recentYears === 0 && age !== null && age >= 3) out.push({ class: 'ECO', severity: 'LOW', title: '近一年无新增引用，影响力衰减', claim: '引用热度下降', evidence_draft: `近一年新引 ${recentYears} 条` });
  if (p.abstract === null || p.abstract.length === 0) out.push({ class: 'REPRO', severity: 'LOW', title: '无摘要数据', claim: '无法快速核验贡献', evidence_draft: 'Semantic Scholar 未收录摘要' });
  return out;
}

export async function savePaperData(data: PaperData, outFile: string): Promise<void> {
  await mkdir(dirname(outFile), { recursive: true });
  await writeFile(outFile, JSON.stringify(data, null, 2) + '\n', 'utf8');
}
