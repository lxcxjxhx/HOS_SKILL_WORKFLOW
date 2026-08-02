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
export declare function enforceAndReport(filePath: string): void;
/**
 * CLI 友好接口
 */
export declare function cli(args: string[]): void;
//# sourceMappingURL=index.d.ts.map