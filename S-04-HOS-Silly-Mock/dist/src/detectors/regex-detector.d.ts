/**
 * HOS-Silly-Mock — Layer 2: Regex禁用反射器（Regex Reflection Blocker）
 *
 * 检测正则表达式是否用于结构化数据解析（JSON/HTML/XML/CSV/URL）。
 * 禁止 regex 用于结构化解析，强制使用标准解析器。
 */
import { Finding, EnforcementConfig } from '../core/types';
/**
 * 检查行是否包含 regex 字面量
 */
export declare function containsRegexLiteral(line: string): boolean;
/**
 * 检查行是否包含 new RegExp
 */
export declare function containsNewRegExp(line: string): boolean;
/**
 * 检查行是否包含 regex 方法调用（match, replace, split, exec, search）
 */
export declare function containsRegexMethod(line: string): boolean;
/**
 * 检查行是否在结构化解析上下文中
 */
export declare function isStructuralContext(line: string, prevLines: string[], nextLines: string[]): boolean;
/**
 * 检查 regex 模式是否高风险
 */
export declare function isHighRiskRegex(line: string): boolean;
/**
 * 根据上下文推荐替代方案
 */
export declare function suggestReplacement(line: string, context: string): string;
/**
 * Layer 2 检测入口
 */
export declare function detectRegexAbuse(file: string, lines: string[], config?: EnforcementConfig): Finding[];
//# sourceMappingURL=regex-detector.d.ts.map