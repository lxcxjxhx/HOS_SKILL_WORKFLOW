import { SandboxConfig } from '../config/types';

export class Sandbox {
  private config: Required<SandboxConfig>;

  constructor(config: SandboxConfig = {} as SandboxConfig) {
    // Validate numeric fields, falling back to safe defaults
    const validMemory = (typeof config.maxMemoryMB === 'number' && config.maxMemoryMB >= 1) ? config.maxMemoryMB : undefined;
    if (config.maxMemoryMB !== undefined && validMemory === undefined) {
      console.warn(`[Sandbox] Invalid maxMemoryMB: ${config.maxMemoryMB}, using default 256`);
    }
    const validCpu = (typeof config.maxCpuPercent === 'number' && config.maxCpuPercent >= 1 && config.maxCpuPercent <= 100) ? config.maxCpuPercent : undefined;
    if (config.maxCpuPercent !== undefined && validCpu === undefined) {
      console.warn(`[Sandbox] Invalid maxCpuPercent: ${config.maxCpuPercent}, using default 80`);
    }
    const validTimeout = (typeof config.timeout === 'number' && config.timeout >= 100) ? config.timeout : undefined;
    if (config.timeout !== undefined && validTimeout === undefined) {
      console.warn(`[Sandbox] Invalid timeout: ${config.timeout}, using default 30000`);
    }

    this.config = {
      enabled: config.enabled ?? true,
      networkAccess: config.networkAccess ?? 'none',
      allowedHosts: config.allowedHosts ?? [],
      fileSystemAccess: config.fileSystemAccess ?? 'none',
      maxMemoryMB: validMemory ?? 256,
      maxCpuPercent: validCpu ?? 80,
      timeout: validTimeout ?? 30000,
    };
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (!this.config.enabled) {
      return fn();
    }
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new TimeoutError('Sandbox execution timed out')), this.config.timeout);
    });
    try {
      return await Promise.race([fn(), timeout]);
    } finally {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    }
  }

  isHostAllowed(host: string): boolean {
    if (this.config.networkAccess === 'none') {
      throw new SecurityError('Network access is disabled in sandbox');
    }

    if (this.config.networkAccess === 'full') {
      return true;
    }

    // 'restricted': check allowed hosts list
    if (this.config.allowedHosts.length === 0) {
      return true; // no restrictions means allow all
    }

    const allowed = this.config.allowedHosts.some(
      (allowedHost) => host === allowedHost || host.endsWith(`.${allowedHost}`)
    );

    if (!allowed) {
      throw new SecurityError(`Host "${host}" is not in the allowed hosts list`);
    }

    return true;
  }

  checkFileSystemAccess(): void {
    if (this.config.fileSystemAccess === 'none') {
      throw new SecurityError('File system access is disabled in sandbox');
    }
  }

  getConfig(): Readonly<SandboxConfig> {
    return { ...this.config };
  }
}

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class SecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SecurityError';
  }
}
