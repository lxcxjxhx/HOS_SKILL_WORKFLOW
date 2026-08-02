/**
 * HOS-Silly-Mock — Layer 4: 沉默失败检测器（Silent Failure Detector）
 *
 * 检测"完整但不真实"的系统：完整逻辑链但无真实 I/O、无错误处理、无 throw。
 * 这是最关键的一层 — 检测 AI 制造的 silent demo system。
 */

import { Finding, EnforcementConfig } from '../core/types';
import { DEFAULT_CONFIG } from '../core/types';
import { hasIO } from './reality-binder';

/** 错误处理关键词 */
const ERROR_HANDLING_KEYWORDS = [
  'try', 'catch', 'throw', 'reject',
  'error', 'Error', 'err',
  'finally',
  '.catch(', '.then(',
  'onerror', 'onError',
  'recovery', 'retry', 'fallback',
  'warn', 'warning',
  'rejectWith', 'fail',
  'status !==', 'statusCode !==', 'code !==',
  'ok !==', 'ok ===',
];

/** "太过完美"的代码模式 — 完整但无错误处理 */
const TOO_PERFECT_PATTERNS = [
  // 完整 async 函数但无 try/catch
  /async\s+function\s+\w+/,
  /\(\s*\)\s*:\s*Promise</,
  /→\s*\{[^}]*await[^}]*\}/s,
];

/**
 * 检查 catch 块是否为空（沉默失败）
 */
export function isEmptyCatch(lines: string[], catchLineIdx: number): boolean {
  // 检查 catch (e) { } 或 catch { } 或 } catch (e) {
  for (let i = catchLineIdx; i < Math.min(catchLineIdx + 5, lines.length); i++) {
    const trimmed = lines[i].trim();
    // catch { } 在一行 (支持 } catch (e) { 或 catch (e) { 或 catch {)
    if (trimmed.match(/^\}?\s*catch\s*(?:\([^)]*\))?\s*\{\s*\}$/)) return true;
    // catch 后直接是 } (空catch)
    if (trimmed.match(/^\}\s*$/) && i === catchLineIdx + 1) return true;
    // 跳过 catch 行本身的 { 和闭 catch 的 }
    if (trimmed === '{' || trimmed === '}') continue;
    if (trimmed.match(/^\}?\s*catch\s*(?:\([^)]*\))?\s*\{?\s*$/)) continue;
    // catch 块内只有注释或 console.log
    if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('*') && !trimmed.includes('console.')) {
      if (trimmed === '{' || trimmed === '}') continue;
      if (trimmed.match(/^\s*$/)) continue;
      return false; // 有实际代码
    }
  }
  return true; // 没有找到实际代码
}

/**
 * 检查函数是否缺乏错误路径
 */
export function hasErrorPath(lines: string[], funcStartIdx: number): boolean {
  const endBrace = findMatchingBrace(lines, funcStartIdx);
  if (endBrace === -1) return false;

  for (let i = funcStartIdx; i <= endBrace; i++) {
    const line = lines[i];
    if (ERROR_HANDLING_KEYWORDS.some(kw => line.includes(kw))) {
      return true;
    }
  }

  return false;
}

/**
 * 查找匹配的闭合大括号
 */
function findMatchingBrace(lines: string[], startIdx: number): number {
  let braceCount = 0;
  let started = false;

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    for (const ch of line) {
      if (ch === '{') {
        braceCount++;
        started = true;
      } else if (ch === '}') {
        braceCount--;
      }
    }
    if (started && braceCount === 0) return i;
  }

  return -1;
}

/**
 * 检查是否为"无 I/O 的完整系统"
 */
export function isNoIOSystem(lines: string[]): boolean {
  const ioLines = lines.filter(l => hasIO(l));
  return ioLines.length === 0;
}

/**
 * 检查函数/模块是否"太过完美"（完整但无真实意义）
 */
export function isTooPerfect(funcLines: string[], hasRealIO: boolean): boolean {
  if (hasRealIO) return false;

  // 检查是否有错误处理
  const hasErrorHandling = funcLines.some(l =>
    ERROR_HANDLING_KEYWORDS.some(kw => l.includes(kw))
  );

  // 如果完整但无 I/O 且无错误处理 → 怀疑是 silence demo
  if (!hasErrorHandling) return true;

  // 检查是否只有 catch 但没有实际恢复
  const hasCatch = funcLines.some(l => l.includes('catch'));
  const hasActualIO = funcLines.some(l => hasIO(l));

  return hasCatch && !hasActualIO;
}

/**
 * Layer 4 检测入口
 */
export function detectSilentFailure(
  file: string,
  lines: string[],
  config: EnforcementConfig = DEFAULT_CONFIG
): Finding[] {
  const findings: Finding[] = [];
  const options = config.silent;

  if (!options.checkEmptyCatch && !options.checkMissingErrorPath && !options.checkNoIOSystem) {
    return findings;
  }

  // 检查空 catch 块
  if (options.checkEmptyCatch) {
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      // Match "catch (...)", "} catch (...)", "} catch (...){", etc.
      const isCatchLine = trimmed.startsWith('catch') || /^\}?\s*catch\s*\(/.test(trimmed);
      if (isCatchLine) {
        if (isEmptyCatch(lines, i)) {
          // 检查是否有 MOCK_MODE 豁免
          const prevLines = lines.slice(Math.max(0, i - 3), i);
          const hasExemption = prevLines.some(l => l.includes('MOCK_MODE') || l.includes('@silly-mock'));
          if (!hasExemption) {
            findings.push({
              layer: 'L4-SILENT',
              type: 'missing-error-handling',
              severity: 'high',
              file,
              line: i + 1,
              message: 'Empty catch block — error is silently swallowed',
              snippet: lines[i].trim(),
              suggestion: 'Add error handling: log the error, throw a meaningful exception, or implement recovery logic',
            });
          }
        }
      }
    }
  }

  // 检查缺失 error path 的函数
  if (options.checkMissingErrorPath) {
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      const isAsyncFunc = /^(?:async\s+)?function\s+\w+\s*\(/.test(trimmed) ||
        /^(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?function\s*\(/.test(trimmed) ||
        /^(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>\s*\{/.test(trimmed);

      if (!isAsyncFunc) continue;

      // 检查是否是简单的 getter/setter
      if (trimmed.match(/function\s+(get|set)\w+/)) continue;

      const endIdx = findMatchingBrace(lines, i);
      if (endIdx === -1) continue;

      const funcLines = lines.slice(i, endIdx + 1);
      const hasRealIO = funcLines.some(l => hasIO(l));

      // 只有复杂函数（> 5 行）才需要检查
      if (funcLines.length < 5) continue;
      if (!hasRealIO) continue; // 无 I/O 的纯函数不需要 error path

      if (!hasErrorPath(lines, i)) {
        findings.push({
          layer: 'L4-SILENT',
          type: 'silent-failure',
          severity: 'high',
          file,
          line: i + 1,
          message: 'Function performs I/O but has no error handling path',
          snippet: trimmed.length > 100 ? trimmed.slice(0, 100) + '...' : trimmed,
          suggestion: 'Add try-catch, error logging, and explicit error recovery or re-throw',
        });
      }
    }
  }

  // 检查"无 I/O 的完整系统" — 最危险模式
  if (options.checkNoIOSystem && lines.length >= 20) {
    const hasAnyIO = lines.some(l => hasIO(l));
    const hasErrorHandling = lines.some(l =>
      ERROR_HANDLING_KEYWORDS.some(kw => l.includes(kw))
    );

    if (!hasAnyIO && hasErrorHandling) {
      // 有错误处理但无 I/O → 可能是不完整的系统
      // 只在有多个函数/模块时报警
      const funcCount = lines.filter(l => /function\s+\w+\s*\(/.test(l) ||
        /^(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?\(/.test(l)).length;

      if (funcCount >= 2) {
        findings.push({
          layer: 'L4-SILENT',
          type: 'silent-failure',
          severity: 'critical',
          file,
          line: 1,
          message: 'Potential silent fake system: complete logic chain with no I/O operations',
          snippet: `File has ${funcCount} function(s), error handling present, but 0 I/O operations`,
          suggestion: 'Add real data sources (API calls, file reads, database queries) or halt generation and request system boundary clarification',
        });
      }
    }

    if (!hasAnyIO && !hasErrorHandling && lines.length >= 30) {
      findings.push({
        layer: 'L4-SILENT',
        type: 'silent-failure',
        severity: 'critical',
        file,
        line: 1,
        message: '⚠ SILENT MOCK SYSTEM DETECTED: no I/O, no error handling, but complete logic',
        snippet: 'Complete system with no external dependencies and no error paths',
        suggestion: 'HALT: This system has no connection to reality. Request real system boundaries before proceeding.',
      });
    }
  }

  return findings;
}
