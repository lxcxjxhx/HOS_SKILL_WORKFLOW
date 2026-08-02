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
import { EnforcementConfig, EnforcementResult } from './types';
/**
 * 分析单个文件
 * @param filePath 文件绝对路径
 * @param config 可选配置（默认使用 DEFAULT_CONFIG）
 */
export declare function enforce(filePath: string, config?: EnforcementConfig): EnforcementResult;
/**
 * 分析代码字符串
 * @param code 源代码字符串
 * @param filename 文件名（用于报告）
 * @param config 可选配置
 */
export declare function enforceCode(code: string, filename?: string, config?: EnforcementConfig): EnforcementResult;
/**
 * 分析已分割的行
 * @param lines 代码行数组
 * @param filename 文件名
 * @param config 可选配置
 */
export declare function enforceText(lines: string[], filename?: string, config?: EnforcementConfig): EnforcementResult;
//# sourceMappingURL=engine.d.ts.map