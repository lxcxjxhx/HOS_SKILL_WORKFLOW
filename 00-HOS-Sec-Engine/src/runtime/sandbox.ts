import { SandboxConfig } from './types';

export class Sandbox {
  private config: Required<SandboxConfig>;

  constructor(config: SandboxConfig = {}) {
    this.config = {
      allowedHosts: config.allowedHosts ?? [],
      networkEnabled: config.networkEnabled ?? false,
      fileSystemEnabled: config.fileSystemEnabled ?? false,
      maxMemoryMB: config.maxMemoryMB ?? 256,
      maxCpuPercent: config.maxCpuPercent ?? 80,
      timeoutMs: config.timeoutMs ?? 30000,
    };
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new TimeoutError('Sandbox execution timed out')), this.config.timeoutMs);
    });

    return Promise.race([fn(), timeout]);
  }

  isHostAllowed(host: string): boolean {
    if (!this.config.networkEnabled) {
      throw new SecurityError('Network access is disabled in sandbox');
    }

    if (this.config.allowedHosts.length === 0) {
      return true;
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
    if (!this.config.fileSystemEnabled) {
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
