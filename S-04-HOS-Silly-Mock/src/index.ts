/**
 * HOS-Silly-Mock: Anti-Fake Data & Anti-Regex Reality Enforcement Layer
 *
 * 主入口 - 4层防御引擎
 *
 * 用法:
 *   import { enforce } from './src/index';
 *   const result = enforce('/path/to/file.ts');
 *   console.log(result.realityScore);
 */

export { enforce, enforceCode, enforceText } from './core/engine';
export { EnforcementResult, EnforcementConfig, Finding, DEFAULT_CONFIG } from './core/types';
export { calculateRealityScore } from './core/scorer';
export { detectMockLeakage } from './detectors/mock-detector';
export { detectRegexAbuse } from './detectors/regex-detector';
export { detectRealityBinding } from './detectors/reality-binder';
export { detectSilentFailure } from './detectors/silent-failure';
export { printReport, printMarkdownReport } from './reporters/console';

/**
 * 快捷入口: 分析文件并打印报告
 */
export function enforceAndReport(filePath: string): void {
  const { printReport, enforce } = require('./core/engine');
  const result = enforce(filePath);
  printReport(result);
}

/**
 * CLI 友好接口
 */
export function cli(args: string[]): void {
  const { enforce } = require('./core/engine');
  const { printReport, printMarkdownReport } = require('./reporters/console');

  const files = args.filter(a => !a.startsWith('-'));
  const formatFlag = args.includes('--json') ? 'json' :
    args.includes('--markdown') ? 'markdown' : 'pretty';

  let overallPassed = true;

  for (const file of files) {
    console.log(`\nAnalyzing: ${file}`);
    const result = enforce(file);

    if (formatFlag === 'markdown') {
      printMarkdownReport(result);
    } else {
      printReport(result, formatFlag === 'json' ? 'json' : 'pretty');
    }

    if (!result.passed) overallPassed = false;
  }

  if (!overallPassed) {
    process.exit(1);
  }
}
