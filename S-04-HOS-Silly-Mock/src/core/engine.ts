/**
 * HOS-Silly-Mock: 4-Layer Enforcement Engine
 *
 * 主引擎 — 协调 4 层检测器，汇总结果，生成 Reality Score。
 *
 * 支持:
 *   - enforce(filePath)     — 分析文件
 *   - enforceCode(code)     — 分析代码字符串
 *   - enforceText(lines)    — 分析已分割的行数组
 */

import * as fs from 'fs';
import { EnforcementConfig, EnforcementResult, Finding, DEFAULT_CONFIG } from './types';
import { buildResult } from './scorer';
import { detectMockLeakage } from '../detectors/mock-detector';
import { detectRegexAbuse } from '../detectors/regex-detector';
import { detectRealityBinding } from '../detectors/reality-binder';
import { detectSilentFailure } from '../detectors/silent-failure';

/**
 * 分析单个文件
 * @param filePath 文件绝对路径
 * @param config 可选配置（默认使用 DEFAULT_CONFIG）
 */
export function enforce(filePath: string, config: EnforcementConfig = DEFAULT_CONFIG): EnforcementResult {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  return analyzeLines(filePath, lines, config);
}

/**
 * 分析代码字符串
 * @param code 源代码字符串
 * @param filename 文件名（用于报告）
 * @param config 可选配置
 */
export function enforceCode(code: string, filename: string = '<anonymous>', config: EnforcementConfig = DEFAULT_CONFIG): EnforcementResult {
  const lines = code.split('\n');
  return analyzeLines(filename, lines, config);
}

/**
 * 分析已分割的行
 * @param lines 代码行数组
 * @param filename 文件名
 * @param config 可选配置
 */
export function enforceText(lines: string[], filename: string = '<anonymous>', config: EnforcementConfig = DEFAULT_CONFIG): EnforcementResult {
  return analyzeLines(filename, lines, config);
}

/**
 * 核心分析逻辑
 */
function analyzeLines(
  file: string,
  lines: string[],
  config: EnforcementConfig
): EnforcementResult {
  const allFindings: Finding[] = [];

  // Layer 1: MOCK 显性化检测
  const mockFindings = detectMockLeakage(file, lines, config);
  allFindings.push(...mockFindings);

  // Layer 2: Regex 滥用检测
  const regexFindings = detectRegexAbuse(file, lines, config);
  allFindings.push(...regexFindings);

  // Layer 3: Reality Binding 检测
  const bindingFindings = detectRealityBinding(file, lines, config);
  allFindings.push(...bindingFindings);

  // Layer 4: Silent Failure 检测
  const silentFindings = detectSilentFailure(file, lines, config);
  allFindings.push(...silentFindings);

  // 构建并返回结果
  return buildResult(allFindings);
}
