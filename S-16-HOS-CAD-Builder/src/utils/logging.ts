/**
 * Structured logging for HOS-CAD-Builder
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

const LEVEL_LABELS: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: "DEBUG",
  [LogLevel.INFO]: "INFO",
  [LogLevel.WARN]: "WARN",
  [LogLevel.ERROR]: "ERROR",
};

let currentLevel: LogLevel = LogLevel.INFO;

export function setLogLevel(level: LogLevel): void {
  currentLevel = level;
}

function log(level: LogLevel, module: string, message: string, data?: unknown): void {
  if (level < currentLevel) return;
  const ts = new Date().toISOString();
  const prefix = `[${ts}] [${LEVEL_LABELS[level]}] [${module}]`;
  const line = data !== undefined ? `${prefix} ${message} ${JSON.stringify(data, null, 2)}` : `${prefix} ${message}`;

  if (level >= LogLevel.ERROR) {
    process.stderr.write(line + "\n");
  } else {
    process.stdout.write(line + "\n");
  }
}

export const logger = {
  debug: (mod: string, msg: string, data?: unknown) => log(LogLevel.DEBUG, mod, msg, data),
  info: (mod: string, msg: string, data?: unknown) => log(LogLevel.INFO, mod, msg, data),
  warn: (mod: string, msg: string, data?: unknown) => log(LogLevel.WARN, mod, msg, data),
  error: (mod: string, msg: string, data?: unknown) => log(LogLevel.ERROR, mod, msg, data),
};
