export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  component?: string;
  deviceId?: string;
  deviceName?: string;
  action?: string;
  duration?: number;
  [key: string]: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LEVEL_ICONS: Record<LogLevel, string> = {
  debug: '🔍',
  info: 'ℹ️',
  warn: '⚠️',
  error: '❌',
};

let currentLevel: LogLevel = (Bun.env.LOG_LEVEL as LogLevel) || 'info';

export function setLogLevel(level: LogLevel): void {
  currentLevel = level;
}

export function getLogLevel(): LogLevel {
  return currentLevel;
}

function formatTimestamp(): string {
  return new Date().toISOString();
}

function formatContext(ctx: LogContext): string {
  const parts: string[] = [];
  if (ctx.component) parts.push(`[${ctx.component}]`);
  if (ctx.deviceName) parts.push(`device=${ctx.deviceName}`);
  else if (ctx.deviceId) parts.push(`device=${ctx.deviceId}`);
  if (ctx.action) parts.push(`action=${ctx.action}`);
  if (ctx.duration !== undefined) parts.push(`duration=${ctx.duration}ms`);

  // Add any extra context
  const extra = Object.entries(ctx)
    .filter(([k]) => !['component', 'deviceId', 'deviceName', 'action', 'duration'].includes(k))
    .map(([k, v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`);
  parts.push(...extra);

  return parts.join(' ');
}

function log(level: LogLevel, message: string, context?: LogContext): void {
  if (LOG_LEVELS[level] < LOG_LEVELS[currentLevel]) return;

  const timestamp = formatTimestamp();
  const icon = LEVEL_ICONS[level];
  const contextStr = context ? ` ${formatContext(context)}` : '';

  const output = `${timestamp} ${icon} ${message}${contextStr}`;

  switch (level) {
    case 'debug':
    case 'info':
      console.log(output);
      break;
    case 'warn':
      console.warn(output);
      break;
    case 'error':
      console.error(output);
      break;
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext) => log('error', message, context),
};

// Timer helper for measuring operation duration
export function createTimer(): () => number {
  const start = performance.now();
  return () => Math.round(performance.now() - start);
}

// Convenience function for logging with timing
export async function withTiming<T>(
  operation: string,
  fn: () => Promise<T>,
  context?: Omit<LogContext, 'duration'>
): Promise<T> {
  const timer = createTimer();
  try {
    const result = await fn();
    logger.debug(`${operation} completed`, { ...context, duration: timer() });
    return result;
  } catch (err) {
    logger.error(`${operation} failed`, { ...context, duration: timer(), error: String(err) });
    throw err;
  }
}
