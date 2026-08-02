/**
 * HOS-Silly-Mock — Layer 3: 真实连接强制器（Reality Binding Layer）
 *
 * 强制每个变量必须绑定 source → transform → sink 三元组。
 * 追踪数据流：检查 source（从哪里来）→ transform（如何转换）→ sink（用到哪里去）
 */
import { Finding, SourceTransformSink, EnforcementConfig } from '../core/types';
/**
 * 检查是否为 I/O 操作
 */
export declare function hasIO(line: string): boolean;
/**
 * 检查一个变量是否有完整的 source → transform → sink
 */
export declare function traceVariable(varName: string, defLine: number, lines: string[]): SourceTransformSink;
/**
 * Layer 3 检测入口
 */
export declare function detectRealityBinding(file: string, lines: string[], config?: EnforcementConfig): Finding[];
//# sourceMappingURL=reality-binder.d.ts.map