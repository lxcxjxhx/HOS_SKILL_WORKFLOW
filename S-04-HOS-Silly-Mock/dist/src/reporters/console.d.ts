/**
 * HOS-Silly-Mock: Console Reporter
 *
 * 格式化输出检测报告到控制台。
 * 支持 ANSI 颜色、结构化表格、JSON 输出。
 */
import { EnforcementResult } from '../core/types';
/**
 * 控制台报告
 */
export declare function printReport(result: EnforcementResult, format?: 'pretty' | 'json'): void;
/**
 * Markdown 报告
 */
export declare function printMarkdownReport(result: EnforcementResult): void;
//# sourceMappingURL=console.d.ts.map