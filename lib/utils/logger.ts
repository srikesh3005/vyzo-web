/**
 * Vyzo — Structured Logger
 * Logs structured JSON entries. Never logs sensitive data.
 *
 * NEVER log: passwords, API keys, tokens, refresh tokens, affiliate secrets.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  request_id?: string;
  user_id?: string;
  endpoint?: string;
  status?: number;
  duration_ms?: number;
  error?: string;
  [key: string]: unknown;
}

const LOG_LEVEL = (process.env.LOG_LEVEL || 'info') as LogLevel;
const LEVELS: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

function shouldLog(level: LogLevel): boolean {
  return LEVELS[level] >= LEVELS[LOG_LEVEL];
}

function log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  if (!shouldLog(level)) return;

  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };

  const output = JSON.stringify(entry);

  if (level === 'error') {
    console.error(output);
  } else if (level === 'warn') {
    console.warn(output);
  } else {
    console.log(output);
  }
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => log('debug', message, meta),
  info:  (message: string, meta?: Record<string, unknown>) => log('info',  message, meta),
  warn:  (message: string, meta?: Record<string, unknown>) => log('warn',  message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log('error', message, meta),

  /** Log an API request */
  request: (meta: {
    request_id: string;
    user_id?: string;
    endpoint: string;
    method: string;
    status: number;
    duration_ms: number;
    error?: string;
  }) => log('info', 'API Request', meta),
};

/** Generate a short request ID for log correlation */
export function generateRequestId(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}
