/**
 * 泛化语义切片器（Generalized Semantic Chunker）
 * 对应 docs/04 v2：统一管线 Unitize → Constrain → Annotate，一套逻辑适用所有对象类型。
 * 边界检测器插件接口就位；内置 heading/blank-line/indent 检测器零依赖兜底。
 */
import type { ObjectType } from './core/types.ts';

/* ---------- 类型 ---------- */

export interface ChunkUnit {
  unit_id: string;
  level: 1 | 2 | 3;
  kind: string;
  role: string;
  title: string;
  content: string;
  tokens: number;
  source_range: { file?: string; start_line?: number; end_line?: number; path?: string };
  parent_id: string | null;
  tags: string[];
}

export interface ChunkResult {
  strategy: string;
  units: ChunkUnit[];
  degradations: string[];
}

/** 边界检测器插件接口（外部工具：tree-sitter/grobid/trafilatura 实现此接口后注入） */
export interface BoundaryDetector {
  id: string;
  available(): boolean;
  detect(ctx: { type: ObjectType; text: string; lang?: string }): Promise<Array<{ kind: string; title: string; startLine: number; endLine: number }>>;
}

interface RawBlock {
  kind: string;
  title: string;
  startLine: number;
  endLine: number;
  role: string;
}

/* ---------- 常量 ---------- */

const UNIT_MAX_TOKENS = 4000;
const TOKEN_EST = 2; // chars per token（估算，保守）

/** 章节关键词 → role（统一词典，跨对象） */
const SECTION_KEYWORDS: Array<{ role: string; keys: string[] }> = [
  { role: 'claim', keys: ['宣称', '主张', '摘要', 'abstract', '概述', 'overview', 'intro', '引言', '介绍'] },
  { role: 'evidence', keys: ['实验', '数据', '结果', '指标', '效果', 'performance', 'experiment', 'benchmark', 'results', 'evaluation'] },
  { role: 'method', keys: ['方法', '架构', '实现', '算法', '方案', '设计', 'method', 'approach', 'architecture', 'implementation', '核心'] },
  { role: 'context', keys: ['背景', '问题', '简介', 'motivation', 'background', 'related', '相关工作'] },
  { role: 'config', keys: ['部署', '依赖', '要求', '安装', '环境', '配置', 'setup', 'config', 'requirements', 'deployment'] },
  { role: 'risk', keys: ['风险', '限制', '免责', '安全', '威胁', 'limitation', 'risk', 'warranty', '伦理'] },
  { role: 'outcome', keys: ['结论', '总结', '展望', '路线图', 'conclusion', 'future', 'roadmap', '下一步', '版本对比'] },
  { role: 'reference', keys: ['参考文献', 'references', '链接', '引用'] },
];

/** 内容特征 → role（补充标题未命中时） */
const CONTENT_SIGNALS: Array<{ role: string; keys: string[] }> = [
  { role: 'claim', keys: ['我们提出', '我们声称', '宣称', '首创', '优于', '超越', 'sota', '业界首创', '全面超越'] },
  { role: 'evidence', keys: ['%', '准确率', '样本', '数据集', '测试', '评测', '延迟', '毫秒', 'f1', '召回', '提升'] },
  { role: 'config', keys: ['需要', '依赖', '要求', '自备', 'key', 'api key', '账号', '服务器', '安装'] },
  { role: 'risk', keys: ['风险', '警告', '注意', '不能', '无法', '免责', '以合同为准', '暂未公开'] },
];

const PROPOSAL_SECTIONS = ['背景', '简介', '核心方案', '方案', '架构', '技术选型', '部署', '实施计划', '计划', '风险', '成本', '预期收益', '收益', '版本对比', '路线图', '免责', '结论'];

/** 代码函数/类头（indent 检测器） */
const CODE_HEAD_RE = /^\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?(?:function|def|class|interface|type|func|pub\s+fn|public|private|protected)\b/i;
const CODE_ARROW_RE = /^\s*(?:export\s+)?const\s+[\w$]+\s*=\s*(?:\([^)]*\)|[\w$]+)\s*=>/;

/* ---------- 工具 ---------- */

function estTokens(s: string): number {
  return Math.max(1, Math.ceil(s.length / TOKEN_EST));
}

function roleFrom(title: string, content: string): string {
  for (const { role, keys } of SECTION_KEYWORDS) {
    if (keys.some(k => title.toLowerCase().includes(k))) return role;
  }
  for (const { role, keys } of CONTENT_SIGNALS) {
    if (keys.some(k => content.toLowerCase().includes(k))) return role;
  }
  return 'unknown';
}

/** 依据 role + 结构 → 统一 kind */
function kindOf(role: string, type: ObjectType, level: 1 | 2, codeKind?: 'function' | 'class' | 'block' | null): string {
  if (level === 1) {
    if (type === 'proposal') return 'proposal-section';
    if (type === 'repo') return 'module';
    if (type === 'license') return 'license-clause';
    if (type === 'dataset') return 'dataset-field';
    return 'section';
  }
  if (codeKind === 'function') return 'code-function';
  if (codeKind === 'class') return 'code-class';
  if (codeKind === 'block') return 'code-block';
  if (type === 'license') return 'license-clause';
  if (type === 'dataset' && role === 'evidence') return 'dataset-field';
  if (role === 'unknown') return 'text-paragraph';
  return `${role}-block`;
}

/** 代码头 kind → 统一 kind */
function codeKindName(k: string): string {
  return k === 'class' ? 'code-class' : 'code-function';
}

/* ---------- ① 标题行检测（heading 检测器，内置） ---------- */

function detectTitleLines(lines: string[]): Array<{ title: string; line: number }> {
  const out: Array<{ title: string; line: number }> = [];
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    const md = t.match(/^(#{1,3})\s+(.+)$/);
    if (md) { out.push({ title: md[2].trim(), line: i }); continue; }
    // 提案/文章章节关键词（短行视为标题）
    const kw = PROPOSAL_SECTIONS.find(k => t === k || t.startsWith(`${k} `) || t.startsWith(`${k}：`) || t.startsWith(`${k}:`));
    if (kw && t.length <= 40) { out.push({ title: t, line: i }); continue; }
    // 论文常见章节（支持编号前缀：1 Introduction / 3.2 Experiments）
    if (/^(\d+(\.\d+)*\s+)?(abstract|introduction|related work|background|method|methodology|experiments?|results|conclusion|references)$/i.test(t)) {
      out.push({ title: t, line: i });
    }
  }
  return out;
}

/* ---------- ② 代码函数头（indent 检测器，内置） ---------- */

function detectCodeHeads(lines: string[]): Array<{ title: string; line: number; kind: 'function' | 'class' }> {
  const out: Array<{ title: string; line: number; kind: 'function' | 'class' }> = [];
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i];
    if (CODE_HEAD_RE.test(t) || CODE_ARROW_RE.test(t)) {
      const isClass = /\b(class|interface)\b/.test(t);
      const m = t.match(/[\w$]+(?=\s*[(:={])/);
      out.push({ title: m ? m[0] : t.trim().slice(0, 40), line: i, kind: isClass ? 'class' : 'function' });
    }
  }
  return out;
}

/* ---------- ③ 条款关键词（license） ---------- */

const CLAUSE_RE = /^\s*(permission is hereby granted|conditions|limitations|warranty|disclaimer|grant of|附加条款|商标|免责|授权|限制|条件)/i;

/* ---------- 主管线 ---------- */

export interface ChunkOptions {
  type: ObjectType;
  lang?: string;
  source?: string;
  detectors?: BoundaryDetector[]; // 外部检测器插件（可选注入）
  maxTokens?: number;
}

export async function chunkText(text: string, opts: ChunkOptions): Promise<ChunkResult> {
  const maxTokens = opts.maxTokens ?? UNIT_MAX_TOKENS;
  const lines = text.split('\n');
  const degradations: string[] = [];
  const usedDetectors: string[] = ['heading', 'blank-line', 'indent'];
  const raw: RawBlock[] = [];
  const isCodeish = opts.type === 'repo' || (opts.lang !== undefined && ['ts', 'js', 'py', 'go', 'rs', 'java', 'c', 'cpp', 'tsx', 'jsx'].includes(opts.lang));

  // 外部检测器（可用时）优先提供 L1/L2 边界（工具即插件；干什么事调用什么工具）
  const externalBlocks: RawBlock[] = [];
  for (const d of opts.detectors ?? []) {
    if (d.available()) {
      try {
        const blocks = await d.detect({ type: opts.type, text, lang: opts.lang });
        if (blocks.length > 0) {
          usedDetectors.push(d.id);
          for (const b of blocks) {
            const rb: RawBlock = { kind: b.kind, title: b.title, startLine: b.startLine, endLine: b.endLine, role: roleFrom(b.title, '') };
            externalBlocks.push(rb);
            raw.push(rb);
          }
        }
      } catch {
        degradations.push(`边界检测器 ${d.id} 执行失败，忽略`);
      }
    }
  }

  // 内置检测器
  const titles = detectTitleLines(lines);
  if (externalBlocks.length > 0 && isCodeish) {
    // 外部检测器（如 tree-sitter）接管代码边界：补充文件头与尾部，跳过内置 indent
    externalBlocks.sort((a, b) => a.startLine - b.startLine);
    const first = externalBlocks[0];
    const last = externalBlocks[externalBlocks.length - 1];
    if (first.startLine > 0) {
      raw.push({ kind: 'module', title: opts.source ?? 'file-head', startLine: 0, endLine: first.startLine - 1, role: roleFrom('module', lines.slice(0, first.startLine).join('\n')) });
    }
    if (last.endLine < lines.length - 1) {
      raw.push({ kind: 'code-block', title: '（尾部代码）', startLine: last.endLine + 1, endLine: lines.length - 1, role: 'unknown' });
    }
  } else if (titles.length === 0 && isCodeish) {
    // 代码：文件头 + 函数/类块（每个函数体延伸到下一个函数头前）
    const heads = detectCodeHeads(lines);
    if (heads.length > 0) {
      for (let i = 0; i < heads.length; i++) {
        const h = heads[i];
        const hEnd = i + 1 < heads.length ? heads[i + 1].line - 1 : lines.length - 1;
        if (i === 0 && h.line > 0) {
          raw.push({ kind: 'module', title: opts.source ?? 'file-head', startLine: 0, endLine: h.line - 1, role: roleFrom('module', lines.slice(0, h.line).join('\n')) });
        }
        raw.push({ kind: codeKindName(h.kind), title: h.title, startLine: h.line, endLine: hEnd, role: roleFrom(h.title, lines.slice(h.line, hEnd + 1).join('\n')) });
      }
    } else {
      raw.push({ kind: 'module', title: opts.source ?? 'file', startLine: 0, endLine: lines.length - 1, role: 'unknown' });
      degradations.push('未检出函数边界，整文件单模块块');
    }
  } else if (titles.length > 0) {
    // 标题分区（L1，kind 按类型）→ 分区内段落/代码块（L2）
    const sectionKind = opts.type === 'proposal' ? 'proposal-section' : opts.type === 'repo' ? 'module' : 'section';
    for (let i = 0; i < titles.length; i++) {
      const t = titles[i];
      const start = t.line;
      const end = i + 1 < titles.length ? titles[i + 1].line - 1 : lines.length - 1;
      const role = roleFrom(t.title, lines.slice(start, end + 1).join('\n'));
      raw.push({ kind: sectionKind, title: t.title, startLine: start, endLine: end, role });
      // 分区内细分：段落或代码函数头（body[k] 对应 lines[start+1+k]）
      const body = lines.slice(start + 1, end + 1);
      const heads = isCodeish ? detectCodeHeads(body) : [];
      if (heads.length > 0) {
        for (let j = 0; j < heads.length; j++) {
          const h = heads[j];
          const hEnd = j + 1 < heads.length ? heads[j + 1].line - 1 : body.length - 1;
          if (j === 0 && h.line > 0) {
            raw.push({ kind: 'code-block', title: '（前置代码）', startLine: start + 1, endLine: start + 1 + h.line - 1, role: 'unknown' });
          }
          raw.push({ kind: codeKindName(h.kind), title: h.title, startLine: start + 1 + h.line, endLine: start + 1 + hEnd, role: roleFrom(h.title, body.slice(h.line, hEnd + 1).join('\n')) });
        }
      } else {
        splitParagraphs(body, start + 1, raw);
      }
    }
  } else {
    // 无标题：段落切分；license 条款识别
    if (opts.type === 'license') {
      let prev = 0;
      for (let i = 0; i < lines.length; i++) {
        if (CLAUSE_RE.test(lines[i])) {
          if (i > prev) raw.push({ kind: 'license-clause', title: lines[prev].trim().slice(0, 30), startLine: prev, endLine: i - 1, role: 'unknown' });
          prev = i;
        }
      }
      raw.push({ kind: 'license-clause', title: lines[prev].trim().slice(0, 30), startLine: prev, endLine: lines.length - 1, role: 'unknown' });
    } else {
      splitParagraphs(lines, 0, raw);
      degradations.push('无标题结构，按段落切分');
    }
  }

  // 去重与排序（外部检测器可能与内置重叠）
  const seen = new Set<string>();
  const blocks = raw
    .filter(b => !seen.has(`${b.startLine}-${b.endLine}`) && (seen.add(`${b.startLine}-${b.endLine}`), b.endLine >= b.startLine))
    .sort((a, b) => a.startLine - b.startLine);

  // ③ Constrain：超限下钻（按句子边界折半）
  const units: ChunkUnit[] = [];
  let seq = 0;
  for (const b of blocks) {
    const content = lines.slice(b.startLine, b.endLine + 1).join('\n');
    if (estTokens(content) <= maxTokens) {
      units.push(toUnit(b, content, lines, null, ++seq));
    } else {
      // 递归下钻 L3
      const subs = splitBySentences(content, b.startLine, maxTokens);
      for (const s of subs) {
        units.push(toUnit({ ...b, kind: b.kind === 'code-function' ? 'code-block' : b.kind, title: `${b.title} · 片段` }, s.text, lines, null, ++seq, s.startLine));
      }
      degradations.push(`块「${b.title}」超限，下钻为 ${subs.length} 个片段`);
    }
  }

  const strategy = `generalized-pipeline[${usedDetectors.join('+')}]`;
  return { strategy, units, degradations };
}

function splitParagraphs(lines: string[], base: number, raw: RawBlock[]): void {
  let start = 0;
  for (let i = 0; i <= lines.length; i++) {
    if (i === lines.length || lines[i].trim() === '') {
      if (i > start) {
        const content = lines.slice(start, i).join('\n');
        raw.push({ kind: 'text-paragraph', title: content.slice(0, 24), startLine: base + start, endLine: base + i - 1, role: roleFrom('', content) });
      }
      start = i + 1;
    }
  }
}

function splitBySentences(text: string, baseLine: number, maxTokens: number): Array<{ text: string; startLine: number }> {
  const parts = text.split(/(?<=[。！？!?.])\s*/).filter(Boolean);
  const out: Array<{ text: string; startLine: number }> = [];
  let cur = '';
  let curStart = baseLine;
  for (const p of parts) {
    if (estTokens(cur + p) > maxTokens && cur) {
      out.push({ text: cur.trim(), startLine: curStart });
      cur = p; curStart = baseLine;
    } else cur += p;
  }
  if (cur.trim()) out.push({ text: cur.trim(), startLine: curStart });
  return out.length ? out : [{ text, startLine: baseLine }];
}

function toUnit(b: RawBlock, content: string, lines: string[], parentId: string | null, seq: number, startOverride?: number): ChunkUnit {
  const kind = b.kind;
  const codeKind = kind === 'code-function' ? 'function' : kind === 'code-class' ? 'class' : kind === 'code-block' ? 'block' : null;
  const lvl: 1 | 2 | 3 = kind === 'section' || kind === 'module' || kind === 'proposal-section' ? 1 : estTokens(content) > UNIT_MAX_TOKENS ? 3 : 2;
  const role = b.role === 'unknown' ? roleFrom(b.title, content) : b.role;
  return {
    unit_id: `unit-${String(seq).padStart(3, '0')}`,
    level: lvl,
    kind,
    role,
    title: b.title,
    content,
    tokens: estTokens(content),
    source_range: { start_line: (startOverride ?? b.startLine) + 1, end_line: b.endLine + 1 },
    parent_id: parentId,
    tags: [],
  };
}
