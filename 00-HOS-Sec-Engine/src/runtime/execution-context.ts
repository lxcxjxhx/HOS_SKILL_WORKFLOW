import { ExecutionContext, ExecutionLog, Finding, EvidenceItem } from './types';

let _currentContext: ExecutionContext | null = null;

export class ExecutionContextManager {
  private context: ExecutionContext;

  constructor(target: string, config: any) {
    this.context = {
      runId: crypto.randomUUID(),
      target,
      config,
      findings: [],
      evidence: [],
      metadata: {},
      logs: [],
    };
  }

  static create(target: string, config: any = {}): ExecutionContext {
    const manager = new ExecutionContextManager(target, config);
    _currentContext = manager.context;
    return manager.context;
  }

  static getCurrent(): ExecutionContext | null {
    return _currentContext;
  }

  addFinding(finding: Finding): void {
    this.context.findings.push(finding);
  }

  addEvidence(evidence: EvidenceItem): void {
    this.context.evidence.push(evidence);
  }

  log(message: string, level: ExecutionLog['level'] = 'info', source?: string): void {
    this.context.logs.push({
      timestamp: new Date().toISOString(),
      level,
      message,
      source,
    });
  }

  get(): ExecutionContext {
    return this.context;
  }
}

export { ExecutionContext };
