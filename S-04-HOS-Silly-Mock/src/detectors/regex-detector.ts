/**
 * HOS-Silly-Mock — Layer 2: Regex禁用反射器（Regex Reflection Blocker）
 *
 * 检测正则表达式是否用于结构化数据解析（JSON/HTML/XML/CSV/URL）。
 * 禁止 regex 用于结构化解析，强制使用标准解析器。
 */

import { Finding, EnforcementConfig } from '../core/types';
import { DEFAULT_CONFIG } from '../core/types';

/** 结构化上下文的提示词（检测 regex 所在行的上下文中是否涉及结构化数据） */
const STRUCTURED_CONTEXT_INDICATORS = [
  // JSON
  'json', 'JSON', 'parse', 'serialize',
  // HTML
  'html', 'HTML', 'div', 'span', 'tag', '<', '>', 'element',
  // XML
  'xml', 'XML', 'soap', 'xsd',
  // CSV
  'csv', 'CSV', 'tsv', 'comma separated',
  // URL
  'url', 'URL', 'querystring', 'query string', 'params', 'endpoint',
  // Log
  'log', 'Log', 'LOG', 'log entry',
  // 中文
  'json数据', 'html解析', 'xml解析', '日志解析',
];

/** 高风险的 regex 模式（用于结构化解析） */
const HIGH_RISK_REGEX_PATTERNS = [
  // JSON 字段提取
  /["']\w+["']\s*:\s*["'][^"']*["']/,
  /"name"\s*:/, /"id"\s*:/, /"data"\s*:/,
  // HTML tag 提取
  /<[^>]*>/g,
  /<div/, /<span/, /<a /, /<img/,
  /<\/\w+>/,
  // 通用结构化模式
  /\{.*[}:].*[,:]/,        // 类 JSON 对象
  /class=["'][^"']*["']/,   // HTML class 属性
  /id=["'][^"']*["']/,      // HTML id 属性
  // URL 解析
  /https?:\/\//,
  /\/api\//,
  /\?\w+=/,
  /&?\w+=\w+/,
];

/**
 * 检查行是否包含 regex 字面量
 */
export function containsRegexLiteral(line: string): boolean {
  // 匹配 /pattern/flags 格式的 regex 字面量
  // 但不能是注释、除法、或 URL 中的 /
  const regexLiteralPattern = /(?<![=\/\w])[\/](?!\/)(?!\*)[^\n\/]*[\/][gimsuyd]*/;
  return regexLiteralPattern.test(line);
}

/**
 * 检查行是否包含 new RegExp
 */
export function containsNewRegExp(line: string): boolean {
  return /new\s+RegExp\s*\(/.test(line);
}

/**
 * 检查行是否包含 regex 方法调用（match, replace, split, exec, search）
 */
export function containsRegexMethod(line: string): boolean {
  const regexMethods = /\.(match|replace|split|exec|search)\s*\(/;
  return regexMethods.test(line);
}

/**
 * 检查行是否在结构化解析上下文中
 */
export function isStructuralContext(line: string, prevLines: string[], nextLines: string[]): boolean {
  const context = [
    line.toLowerCase(),
    ...prevLines.slice(-3).map(l => l.toLowerCase()),
    ...nextLines.slice(0, 2).map(l => l.toLowerCase()),
  ].join(' ');

  return STRUCTURED_CONTEXT_INDICATORS.some(indicator =>
    context.includes(indicator.toLowerCase())
  );
}

/**
 * 检查 regex 模式是否高风险
 */
export function isHighRiskRegex(line: string): boolean {
  return HIGH_RISK_REGEX_PATTERNS.some(pattern => pattern.test(line));
}

/**
 * 根据上下文推荐替代方案
 */
export function suggestReplacement(line: string, context: string): string {
  if (context.includes('json') || context.includes('JSON')) {
    return 'Use JSON.parse() + schema validation (e.g., Zod, io-ts) instead of regex';
  }
  if (context.includes('html') || context.includes('HTML') || line.includes('<')) {
    return 'Use DOMParser / cheerio / jsdom instead of regex for HTML parsing';
  }
  if (context.includes('xml') || context.includes('XML')) {
    return 'Use xml2js / fast-xml-parser instead of regex for XML parsing';
  }
  if (context.includes('csv') || context.includes('CSV')) {
    return 'Use a CSV parser (e.g., papaparse, csv-parse) instead of regex';
  }
  if (context.includes('url') || context.includes('URL')) {
    return 'Use URL constructor / URLSearchParams / qs library instead of regex';
  }
  if (context.includes('log')) {
    return 'Use a structured tokenizer / log parser instead of regex';
  }
  return 'Use a standard parser library specific to this data format instead of regex';
}

/**
 * Layer 2 检测入口
 */
export function detectRegexAbuse(
  file: string,
  lines: string[],
  config: EnforcementConfig = DEFAULT_CONFIG
): Finding[] {
  const findings: Finding[] = [];
  const inStringStack: string[] = [];
  const options = config.regex;
  // 检查是否有任何 regex 相关配置启用
  const anyEnabled = options.checkJsonParsing || options.checkHtmlParsing ||
    options.checkXmlParsing || options.checkUrlParsing;

  if (!anyEnabled) return findings;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // 跳过注释行
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
      continue;
    }

    const hasRegex = containsRegexLiteral(line) || containsNewRegExp(line) || containsRegexMethod(line);
    if (!hasRegex) continue;

    // 获取上下文
    const prevLines = lines.slice(Math.max(0, i - 3), i);
    const nextLines = lines.slice(i + 1, Math.min(lines.length, i + 3));
    const context = [line, ...prevLines, ...nextLines].join(' ');

    // 判断是否为结构化上下文
    const isStructural = isStructuralContext(line, prevLines, nextLines);
    if (!isStructural) continue;

    // 判断配置中启用了哪些检查
    const isJson = context.includes('json') || context.includes('JSON');
    const isHtml = context.includes('html') || context.includes('HTML') || line.includes('<');
    const isXml = context.includes('xml') || context.includes('XML');
    const isUrl = context.includes('url') || context.includes('URL');

    if (isJson && !options.checkJsonParsing) continue;
    if (isHtml && !options.checkHtmlParsing) continue;
    if (isXml && !options.checkXmlParsing) continue;
    if (isUrl && !options.checkUrlParsing) continue;

    // 评估严重程度
    const isHighRisk = isHighRiskRegex(line);
    const severity = isHighRisk ? 'high' : 'medium';
    const suggestion = suggestReplacement(line, context);

    findings.push({
      layer: 'L2-REGEX',
      type: 'regex-abuse',
      severity,
      file,
      line: i + 1,
      message: `Regex used for ${isJson ? 'JSON' : isHtml ? 'HTML' : isXml ? 'XML' : isUrl ? 'URL' : 'structured data'} parsing`,
      snippet: line.length > 100 ? line.slice(0, 100) + '...' : line,
      suggestion,
    });
  }

  return findings;
}
