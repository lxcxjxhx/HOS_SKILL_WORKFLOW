/**
 * HOS-Silly-Mock — Layer 4: 沉默失败检测器（Silent Failure Detector）
 *
 * 检测"完整但不真实"的系统：完整逻辑链但无真实 I/O、无错误处理、无 throw。
 * 这是最关键的一层 — 检测 AI 制造的 silent demo system。
 */
import { Finding, EnforcementConfig } from '../core/types';
/**
 * 检查 catch 块是否为空（沉默失败）
 */
export declare function isEmptyCatch(lines: string[], catchLineIdx: number): boolean;
/**
 * 检查函数是否缺乏错误路径
 */
export declare function hasErrorPath(lines: string[], funcStartIdx: number): boolean;
/**
 * 检查是否为"无 I/O 的完整系统"
 */
export declare function isNoIOSystem(lines: string[]): boolean;
/**
 * 检查函数/模块是否"太过完美"（完整但无真实意义）
 */
export declare function isTooPerfect(funcLines: string[], hasRealIO: boolean): boolean;
/**
 * Layer 4 检测入口
 */
export declare function detectSilentFailure(file: string, lines: string[], config?: EnforcementConfig): Finding[];
//# sourceMappingURL=silent-failure.d.ts.map