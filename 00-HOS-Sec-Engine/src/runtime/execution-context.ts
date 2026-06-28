import { AsyncLocalStorage } from 'async_hooks';
import * as crypto from 'crypto';
import { ExecutionContext, ExecutionLog, Finding, EvidenceItem } from './types';

const MAX_FINDINGS = 1000;
const MAX_EVIDENCE = 500;
const MAX_LOGS = 2000;

const asyncLocalStorage = new AsyncLocalStorage<ExecutionContext>();

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
    asyncLocalStorage.enterWith(manager.context);
    return manager.context;
  }

  static getCurrent(): ExecutionContext | null {
    return asyncLocalStorage.getStore() ?? null;
  }

  static run<T>(context: ExecutionContext, fn: () => T): T {
    return asyncLocalStorage.run(context, fn);
  }

  addFinding(finding: Finding): void {
    if (this.context.findings.length >= MAX_FINDINGS) return;
    this.context.findings.push(finding);
  }

  addEvidence(evidence: EvidenceItem): void {
    if (this.context.evidence.length >= MAX_EVIDENCE) return;
    this.context.evidence.push(evidence);
  }

  log(message: string, level: ExecutionLog['level'] = 'info', source?: string): void {
    if (this.context.logs.length >= MAX_LOGS) {
      this.context.logs.shift();
    }
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
