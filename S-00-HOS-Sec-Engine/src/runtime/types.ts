export interface ExecutionContext {
  runId: string;
  target: string;
  config: any;
  findings: Finding[];
  evidence: EvidenceItem[];
  metadata: Record<string, any>;
  logs: ExecutionLog[];
  /** V5: Token 使用统计（SEC-bench Pro 效率追踪） */
  tokenUsage?: TokenUsage;
  /** V5: 失败模式分类 */
  failureMode?: string;
}

/**
 * V5: Token 使用统计
 * 对应 SEC-bench Pro 的 token 效率分析（§4.3.1）
 */
export interface TokenUsage {
  /** 输入 token 数 */
  input: number;
  /** 输出 token 数 */
  output: number;
  /** 缓存命中 token 数 */
  cached: number;
  /** 总 token 数 */
  total: number;
  /** 各阶段 token 消耗 */
  byPhase?: Record<string, { input: number; output: number }>;
}

export interface Finding {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  evidence?: string;
  timestamp: string;
}

export interface EvidenceItem {
  id: string;
  type: string;
  data: unknown;
  timestamp: string;
}

export interface ExecutionLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source?: string;
}

export interface ServerConfig {
  port: number;
  host?: string;
}

// SandboxConfig is defined in ../config/types.ts with semantic types (networkAccess/fileSystemAccess).
// Re-export for convenience.
export type { SandboxConfig } from '../config/types';
