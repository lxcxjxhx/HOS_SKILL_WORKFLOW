export interface ExecutionContext {
  runId: string;
  target: string;
  config: any;
  findings: Finding[];
  evidence: EvidenceItem[];
  metadata: Record<string, any>;
  logs: ExecutionLog[];
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

export interface SandboxConfig {
  allowedHosts?: string[];
  networkEnabled?: boolean;
  fileSystemEnabled?: boolean;
  maxMemoryMB?: number;
  maxCpuPercent?: number;
  timeoutMs?: number;
}
