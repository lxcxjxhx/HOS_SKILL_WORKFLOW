/**
 * HOS-Silly-Mock — Layer 1: MOCK显性化强制器（Mock Exposure Layer）
 *
 * 检测所有未经显式标注的 mock 数据。
 * 任何 mock 必须标注 ⚠ MOCK_MODE: TRUE + reason 才被认为是合法的。
 */
import { Finding, EnforcementConfig } from '../core/types';
/**
 * 检测单行是否包含 MOCK_MODE 标注
 */
export declare function hasMockAnnotation(line: string): boolean;
/**
 * 检测变量名是否暗示 mock
 */
export declare function hasMockName(variableName: string): boolean;
/**
 * 检查 catch → fallback 模式是否产生 mock
 */
export declare function isCatchToMock(line: string): boolean;
/**
 * 是否为大型静态数据（多行数组/对象）
 */
export declare function isLargeStaticData(lines: string[], startIdx: number, threshold: number): boolean;
/**
 * Layer 1 检测入口
 */
export declare function detectMockLeakage(file: string, lines: string[], config?: EnforcementConfig): Finding[];
//# sourceMappingURL=mock-detector.d.ts.map