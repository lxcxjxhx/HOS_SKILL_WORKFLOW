/**
 * License Analyzer：SPDX 识别 + 兼容性 + 商用风险。
 * 对应 docs/05 §5.5。零依赖。
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export interface LicenseData {
  spdx: string | null;
  matched_by: 'identifier' | 'text' | 'none';
  detected_clauses: string[];
  text_snippet: string;
}

const SPDX_RE = /(MIT|Apache[- ]?2\.0|GPL[- ]?3\.0|GPL[- ]?2\.0|AGPL[- ]?3\.0|LGPL[- ]?2\.1|LGPL[- ]?3\.0|BSD[- ][23]-?Clause|MPL[- ]?2\.0|ISC|Unlicense|CC0[- ]?1\.0)/i;

/** 文本片段 → SPDX 判定（先标识符，后条款特征） */
export function detectLicense(text: string): LicenseData {
  const snippet = text.slice(0, 400);
  const m = text.match(SPDX_RE);
  if (m) {
    return { spdx: normalizeSpdx(m[1]), matched_by: 'identifier', detected_clauses: detectClauses(text), text_snippet: snippet };
  }
  // 特征文本匹配
  const t = text.toLowerCase();
  if (t.includes('permission is hereby granted, free of charge')) return { spdx: 'MIT', matched_by: 'text', detected_clauses: detectClauses(text), text_snippet: snippet };
  if (t.includes('apache license') && t.includes('version 2.0')) return { spdx: 'Apache-2.0', matched_by: 'text', detected_clauses: detectClauses(text), text_snippet: snippet };
  if (t.includes('gnu general public license') && t.includes('version 3')) return { spdx: 'GPL-3.0', matched_by: 'text', detected_clauses: detectClauses(text), text_snippet: snippet };
  if (t.includes('gnu affero general public license')) return { spdx: 'AGPL-3.0', matched_by: 'text', detected_clauses: detectClauses(text), text_snippet: snippet };
  return { spdx: null, matched_by: 'none', detected_clauses: detectClauses(text), text_snippet: snippet };
}

function normalizeSpdx(raw: string): string {
  const s = raw.replace(/\s+/g, '').toUpperCase().replace('APACHE2.0', 'Apache-2.0');
  if (s === 'MIT' || s === 'ISC' || s === 'UNLICENSE') return s;
  if (s.startsWith('APACHE')) return 'Apache-2.0';
  if (s.startsWith('GPL')) return s.includes('3') ? 'GPL-3.0' : 'GPL-2.0';
  if (s.startsWith('AGPL')) return 'AGPL-3.0';
  if (s.startsWith('LGPL')) return s.includes('3') ? 'LGPL-3.0' : 'LGPL-2.1';
  if (s.startsWith('BSD')) return s.includes('3') ? 'BSD-3-Clause' : 'BSD-2-Clause';
  if (s.startsWith('MPL')) return 'MPL-2.0';
  if (s.startsWith('CC0')) return 'CC0-1.0';
  return raw.trim();
}

function detectClauses(text: string): string[] {
  const t = text.toLowerCase();
  const out: string[] = [];
  if (t.includes('without warranty')) out.push('Warranty-Disclaimer');
  if (t.includes('permission is hereby granted')) out.push('Grant');
  if (t.includes('substantial portions')) out.push('Grant-Text');
  if (t.includes('no warranty')) out.push('Warranty-Disclaimer');
  if (t.includes('commercial') || t.includes('commercially')) out.push('Commercial-Mention');
  if (t.includes('patent')) out.push('Patent-Clause');
  if (t.includes('attribution')) out.push('Attribution-Clause');
  return out;
}

/** 许可证 → Finding（对应 docs/05 §5.5 兼容性判定） */
export function licenseFindings(data: LicenseData): Array<{ class: string; severity: string; title: string; claim: string; evidence_draft: string }> {
  const out: Array<{ class: string; severity: string; title: string; claim: string; evidence_draft: string }> = [];
  if (data.spdx === null) {
    out.push({ class: 'LIC', severity: 'MEDIUM', title: '无许可证声明（或无法识别）', claim: '默认保留所有权利，商业使用存在法律风险', evidence_draft: '未匹配到 SPDX 标识与已知许可文本' });
  } else {
    const copyleft = data.spdx.startsWith('GPL') || data.spdx.startsWith('AGPL') || data.spdx.startsWith('LGPL');
    if (copyleft) {
      const agpl = data.spdx.startsWith('AGPL');
      out.push({
        class: 'LIC', severity: agpl ? 'HIGH' : 'MEDIUM',
        title: `Copyleft 传染风险（${data.spdx}）`,
        claim: agpl
          ? 'AGPL 对外提供服务即触发网络 copyleft，闭源商用场景高风险'
          : 'GPL/LGPL 组件可能传染到衍生作品，闭源分发场景需评估',
        evidence_draft: `识别的 SPDX：${data.spdx}`,
      });
    }
    if (!data.detected_clauses.includes('Warranty-Disclaimer')) {
      out.push({ class: 'LIC', severity: 'LOW', title: '免责声明缺失', claim: '缺少标准免责条款，风险敞口未关闭', evidence_draft: '文本未含 WITHOUT WARRANTY 类条款' });
    }
  }
  return out;
}

export async function saveLicenseData(data: LicenseData, outFile: string): Promise<void> {
  await mkdir(dirname(outFile), { recursive: true });
  await writeFile(outFile, JSON.stringify(data, null, 2) + '\n', 'utf8');
}
