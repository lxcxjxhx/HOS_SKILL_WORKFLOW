/**
 * Dataset Analyzer：从数据集说明文本提取规模/来源/许可/字段信息，产出数据健康检查点。
 * 对应 docs/05 内置插件清单 dataset-analyzer。零依赖。
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export interface DatasetData {
  size: number | null;            // 样本量（提取到的最大数字）
  size_mentioned: boolean;
  sources: string[];              // 来源描述
  license: string | null;
  has_fields: boolean;            // 是否描述字段/列
  has_collection_method: boolean; // 是否说明收集方式
  years: number[];                // 提及的年份
  snippet: string;
}

const SIZE_RE = /(\d[\d,]*)\s*(?:万|k|K|m|M)?\s*(?:条|个|样本|samples?|records?|rows?|instances?|examples?)/g;
const YEAR_RE = /(19|20)\d{2}/g;
const LICENSE_RE = /(license|许可|spdx)\s*[:：]?\s*([\w.\- ]{2,40})/i;

export function detectDataset(text: string): DatasetData {
  const sizes = [...text.matchAll(SIZE_RE)].map(m => parseFloat(m[1].replace(/,/g, '')));
  const years = [...text.matchAll(YEAR_RE)].map(m => Number(m[0])).filter(y => y >= 2000 && y <= new Date().getFullYear());
  const lic = text.match(LICENSE_RE);
  const lower = text.toLowerCase();
  return {
    size: sizes.length ? Math.max(...sizes) : null,
    size_mentioned: sizes.length > 0,
    sources: extractSources(lower),
    license: lic ? lic[2].trim() : null,
    has_fields: /字段|列|columns?|fields?|attributes?|特征|feature/.test(lower),
    has_collection_method: /收集|采集|爬取|crawl|scrap|抓取|抽样|问卷|survey|sampling|监测|日志记录/.test(lower),
    years: [...new Set(years)].sort(),
    snippet: text.slice(0, 300),
  };
}

function extractSources(lower: string): string[] {
  const out: string[] = [];
  const patterns = [
    /来源[：:]\s*([^\n。；;]{2,60})/,
    /(?:来自|采集自|源自)\s*([^\n。；;]{2,60})/,
    /(?:scraped from|collected from|sourced from)\s*([^\n.]{2,80})/i,
  ];
  for (const p of patterns) {
    const m = lower.match(p);
    if (m && !out.includes(m[1].trim())) out.push(m[1].trim());
  }
  return out;
}

/** 数据集检查点 → Finding（对应 docs/05 严重度定义） */
export function datasetFindings(data: DatasetData): Array<{ class: string; severity: string; title: string; claim: string; evidence_draft: string }> {
  const out: Array<{ class: string; severity: string; title: string; claim: string; evidence_draft: string }> = [];
  if (data.sources.length === 0) {
    out.push({ class: 'DATA', severity: 'MEDIUM', title: '数据来源未说明', claim: '无法评估数据代表性、时效与污染风险', evidence_draft: '文本未提及来源/收集方式' });
  }
  if (data.sources.length === 1) {
    out.push({ class: 'DATA', severity: 'LOW', title: '单一数据来源', claim: '单来源数据泛化能力存疑', evidence_draft: `来源：${data.sources[0]}` });
  }
  if (!data.size_mentioned) {
    out.push({ class: 'DATA', severity: 'MEDIUM', title: '样本量未说明', claim: '样本规模不明，无法判断统计可信度', evidence_draft: '未提取到样本量描述' });
  } else if (data.size !== null && data.size < 1000) {
    out.push({ class: 'DATA', severity: 'MEDIUM', title: `样本量偏小（${data.size}）`, claim: '小样本支撑的结论泛化性受限', evidence_draft: `提取样本量 ${data.size}` });
  }
  if (!data.has_collection_method) {
    out.push({ class: 'DATA', severity: 'LOW', title: '收集方式未说明', claim: '存在采集偏差/污染风险，无法核验', evidence_draft: '未提及收集/爬取方式' });
  }
  if (data.license === null) {
    out.push({ class: 'LIC', severity: 'MEDIUM', title: '数据集许可未声明', claim: '使用与再分发存在合规风险', evidence_draft: '未提取到许可信息' });
  }
  if (data.years.length > 0 && Math.max(...data.years) < new Date().getFullYear() - 3) {
    out.push({ class: 'DATA', severity: 'LOW', title: '数据时效偏旧', claim: '最新提及年份较早，时效性存疑', evidence_draft: `提及年份 ${data.years.join(',')}` });
  }
  return out;
}

export async function saveDatasetData(data: DatasetData, outFile: string): Promise<void> {
  await mkdir(dirname(outFile), { recursive: true });
  await writeFile(outFile, JSON.stringify(data, null, 2) + '\n', 'utf8');
}
