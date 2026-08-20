/**
 * HOS-Silly-Mock — Layer 3: 真实连接强制器（Reality Binding Layer）
 *
 * 强制每个变量必须绑定 source → transform → sink 三元组。
 * 追踪数据流：检查 source（从哪里来）→ transform（如何转换）→ sink（用到哪里去）
 */

import { Finding, SourceTransformSink, EnforcementConfig } from '../core/types';
import { DEFAULT_CONFIG } from '../core/types';

/** 常见 source 关键词（数据的真实来源） */
const SOURCE_KEYWORDS = [
  'fetch', 'axios', 'request', 'get', 'post', 'put', 'delete',
  'query', 'find', 'findOne', 'findMany', 'findAll',
  'readFile', 'readdir', 'readFileSync',
  'from', 'fromAsync', 'of',
  'getItem', 'getJSON', 'getString',
  'select', 'selectAll', 'selectFrom',
  'listen', 'on', 'subscribe',
  'connect', 'pool', 'client',
  'import', 'require', 'load',
  'map.get', 'cache.get', 'store.get',
  'input', 'args', 'params', 'query',
  'req.', 'request.', 'event.', 'message.',
];

/** 常见 sink 关键词（数据的最终用途） */
const SINK_KEYWORDS = [
  'render', 'display', 'show', 'print', 'log',
  'writeFile', 'writeFileSync', 'appendFile',
  'send', 'response', 'res.', 'reply',
  'save', 'store', 'set', 'update', 'upsert',
  'emit', 'publish', 'broadcast',
  'return ', 'yield ',
  'setItem', 'setState',
  'insert', 'insertOne', 'insertMany',
  'create', 'createOne', 'createMany',
  'appendChild', 'innerHTML', 'textContent',
  'table.insert', 'map.set', 'cache.set',
  'output', 'export', 'console.',
];

/** 常见 transform 关键词 */
const TRANSFORM_KEYWORDS = [
  'map', 'filter', 'reduce', 'flat', 'flatMap',
  'sort', 'reverse', 'slice', 'splice',
  'concat', 'join', 'split',
  'trim', 'toLowerCase', 'toUpperCase',
  'replace', 'replaceAll',
  'parse', 'stringify',
  'encode', 'decode',
  'format', 'normalize',
  'transform', 'convert',
  'validate', 'sanitize', 'clean',
];

/** I/O 相关关键词（检查无 I/O 系统） */
const IO_KEYWORDS = [
  'fetch', 'axios', 'request',
  'readFile', 'writeFile', 'readdir', 'access',
  'connect', 'query', 'execute',
  'listen', 'createServer',
  'open', 'close',
  'stream', 'pipe',
  'import', 'require', 'load',
  'console.', 'process.',
  'socket', 'websocket', 'ws.',
];

/**
 * 提取赋值语句的左侧变量名
 */
function extractAssignedVar(line: string): string | null {
  // const x = ..., let x = ..., var x = ...
  const declMatch = line.match(/^(?:const|let|var)\s+(\w+)\s*=/);
  if (declMatch) return declMatch[1];

  // x = ... (已声明)
  const assignMatch = line.match(/^(\w+)\s*=\s*(?!>)/);
  if (assignMatch) return assignMatch[1];

  return null;
}

/**
 * 检查赋值语句的右侧是否有 source 来源
 */
function hasSource(line: string): boolean {
  const rhs = line.replace(/^(?:const|let|var)\s+\w+\s*=\s*/, '');
  return SOURCE_KEYWORDS.some(keyword => rhs.includes(keyword));
}

/**
 * 检查函数/块内是否有 sink 用途
 */
function hasSink(line: string): boolean {
  return SINK_KEYWORDS.some(keyword => line.includes(keyword));
}

/**
 * 检查是否为 I/O 操作
 */
export function hasIO(line: string): boolean {
  return IO_KEYWORDS.some(keyword => line.includes(keyword));
}

/**
 * 检查一个变量是否有完整的 source → transform → sink
 */
export function traceVariable(
  varName: string,
  defLine: number,
  lines: string[]
): SourceTransformSink {
  const result: SourceTransformSink = {
    name: varName,
    complete: false,
  };

  // 检查定义行是否有 source
  const defLineContent = lines[defLine] || '';
  result.source = hasSource(defLineContent) ? defLineContent.trim() : undefined;

  // 检查后续行是否有 transform
  const transforms: string[] = [];
  const sinkLines: string[] = [];

  for (let i = defLine + 1; i < Math.min(defLine + 20, lines.length); i++) {
    const line = lines[i];
    if (!line || line.trim().startsWith('//')) continue;

    // 检查 transform
    const isTransform = TRANSFORM_KEYWORDS.some(kw => {
      const pattern = new RegExp(`\\.${kw}\\s*\\(`);
      return pattern.test(line);
    });

    if (isTransform && line.includes(varName)) {
      transforms.push(line.trim());
    }

    // 检查 sink
    if (line.includes(varName) && hasSink(line)) {
      sinkLines.push(line.trim());
    }

    // 如果遇到新变量声明则停止搜索
    if (/^(?:const|let|var)\s+\w+\s*=/.test(line.trim()) && line !== defLineContent) {
      break;
    }
  }

  result.transform = transforms.length > 0 ? transforms : undefined;
  result.sink = sinkLines.length > 0 ? sinkLines[0] : undefined;
  result.complete = !!result.source && !!result.sink;

  return result;
}

/**
 * Layer 3 检测入口
 */
export function detectRealityBinding(
  file: string,
  lines: string[],
  config: EnforcementConfig = DEFAULT_CONFIG
): Finding[] {
  const findings: Finding[] = [];
  const options = config.binding;

  if (!options.checkSource && !options.checkSink) return findings;

  const tracedVars = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // 跳过注释和空行
    if (trimmed.startsWith('//') || trimmed === '' || trimmed.startsWith('*')) continue;

    const varName = extractAssignedVar(trimmed);
    if (!varName || tracedVars.has(varName)) continue;

    // 跳过简单的值类型赋值（number, string, boolean）
    const simpleValue = /^(?:const|let|var)\s+\w+\s*=\s*(?:true|false|null|undefined|\d+|'[^']*'|"[^"]*")\s*;?$/;
    if (simpleValue.test(trimmed)) continue;

    // 跳过函数声明
    if (trimmed.match(/^(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?\(/)) continue;
    if (trimmed.match(/^(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?function/)) continue;

    const trace = traceVariable(varName, i, lines);
    tracedVars.add(varName);

    if (!trace.complete) {
      if (!trace.source && options.checkSource) {
        findings.push({
          layer: 'L3-BINDING',
          type: 'unbound-variable',
          severity: 'medium',
          file,
          line: i + 1,
          message: `Variable "${varName}" has no identifiable data source (no source binding)`,
          snippet: trimmed.length > 100 ? trimmed.slice(0, 100) + '...' : trimmed,
          suggestion: `Ensure "${varName}" gets its value from an API call, I/O operation, or function parameter`,
        });
      } else if (!trace.sink && options.checkSink) {
        findings.push({
          layer: 'L3-BINDING',
          type: 'unbound-variable',
          severity: 'low',
          file,
          line: i + 1,
          message: `Variable "${varName}" has a source but no identifiable sink (unused data)`,
          snippet: trimmed.length > 100 ? trimmed.slice(0, 100) + '...' : trimmed,
          suggestion: `Either use "${varName}" in a render/response/save operation, or verify it's intentionally unused`,
        });
      }
    }
  }

  return findings;
}
