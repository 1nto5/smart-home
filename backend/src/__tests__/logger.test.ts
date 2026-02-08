import { test, expect, describe, beforeEach, afterEach, mock } from 'bun:test';
import { logger, setLogLevel, getLogLevel, createTimer, withTiming } from '../utils/logger';

describe('logger', () => {
  let logSpy: ReturnType<typeof mock>;
  let warnSpy: ReturnType<typeof mock>;
  let errorSpy: ReturnType<typeof mock>;

  beforeEach(() => {
    logSpy = mock(() => {});
    warnSpy = mock(() => {});
    errorSpy = mock(() => {});
    console.log = logSpy;
    console.warn = warnSpy;
    console.error = errorSpy;
    setLogLevel('debug');
  });

  afterEach(() => {
    setLogLevel('info');
  });

  test('logs info messages to console.log', () => {
    logger.info('test message');
    expect(logSpy).toHaveBeenCalledTimes(1);
    const output = logSpy.mock.calls[0]![0] as string;
    expect(output).toContain('test message');
  });

  test('logs debug messages to console.log', () => {
    logger.debug('debug message');
    expect(logSpy).toHaveBeenCalledTimes(1);
    const output = logSpy.mock.calls[0]![0] as string;
    expect(output).toContain('debug message');
  });

  test('logs warn messages to console.warn', () => {
    logger.warn('warning message');
    expect(warnSpy).toHaveBeenCalledTimes(1);
    const output = warnSpy.mock.calls[0]![0] as string;
    expect(output).toContain('warning message');
  });

  test('logs error messages to console.error', () => {
    logger.error('error message');
    expect(errorSpy).toHaveBeenCalledTimes(1);
    const output = errorSpy.mock.calls[0]![0] as string;
    expect(output).toContain('error message');
  });

  test('includes context in output', () => {
    logger.info('device action', { component: 'test', deviceId: '123' });
    const output = logSpy.mock.calls[0]![0] as string;
    expect(output).toContain('[test]');
    expect(output).toContain('device=123');
  });

  test('includes deviceName when provided', () => {
    logger.info('status', { component: 'test', deviceName: 'Lamp 1' });
    const output = logSpy.mock.calls[0]![0] as string;
    expect(output).toContain('device=Lamp 1');
  });

  test('prefers deviceName over deviceId', () => {
    logger.info('status', { component: 'test', deviceId: '123', deviceName: 'Lamp 1' });
    const output = logSpy.mock.calls[0]![0] as string;
    expect(output).toContain('device=Lamp 1');
    expect(output).not.toContain('device=123');
  });

  test('includes duration when provided', () => {
    logger.info('done', { component: 'test', duration: 150 });
    const output = logSpy.mock.calls[0]![0] as string;
    expect(output).toContain('duration=150ms');
  });

  test('includes extra context fields', () => {
    logger.info('event', { component: 'test', preset: 'day', temp: 21 });
    const output = logSpy.mock.calls[0]![0] as string;
    expect(output).toContain('preset=day');
    expect(output).toContain('temp=21');
  });

  test('includes timestamp in ISO format', () => {
    logger.info('test');
    const output = logSpy.mock.calls[0]![0] as string;
    // Should start with ISO-like timestamp: YYYY-MM-DD
    expect(output).toMatch(/^\d{4}-\d{2}-\d{2}/);
  });
});

describe('log level filtering', () => {
  let logSpy: ReturnType<typeof mock>;
  let warnSpy: ReturnType<typeof mock>;
  let errorSpy: ReturnType<typeof mock>;

  beforeEach(() => {
    logSpy = mock(() => {});
    warnSpy = mock(() => {});
    errorSpy = mock(() => {});
    console.log = logSpy;
    console.warn = warnSpy;
    console.error = errorSpy;
  });

  afterEach(() => {
    setLogLevel('info');
  });

  test('filters debug when level is info', () => {
    setLogLevel('info');
    logger.debug('should be hidden');
    expect(logSpy).not.toHaveBeenCalled();
  });

  test('shows info when level is info', () => {
    setLogLevel('info');
    logger.info('should be visible');
    expect(logSpy).toHaveBeenCalledTimes(1);
  });

  test('filters info when level is warn', () => {
    setLogLevel('warn');
    logger.info('should be hidden');
    expect(logSpy).not.toHaveBeenCalled();
  });

  test('shows error when level is warn', () => {
    setLogLevel('warn');
    logger.error('should be visible');
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });

  test('getLogLevel returns current level', () => {
    setLogLevel('error');
    expect(getLogLevel()).toBe('error');
    setLogLevel('debug');
    expect(getLogLevel()).toBe('debug');
  });
});

describe('createTimer', () => {
  test('returns a function', () => {
    const elapsed = createTimer();
    expect(typeof elapsed).toBe('function');
  });

  test('returns elapsed time in ms', async () => {
    const elapsed = createTimer();
    await new Promise(r => setTimeout(r, 50));
    const ms = elapsed();
    expect(ms).toBeGreaterThanOrEqual(40);
    expect(ms).toBeLessThan(200);
  });

  test('returns integer', () => {
    const elapsed = createTimer();
    const ms = elapsed();
    expect(Number.isInteger(ms)).toBe(true);
  });
});

describe('withTiming', () => {
  let logSpy: ReturnType<typeof mock>;

  beforeEach(() => {
    logSpy = mock(() => {});
    console.log = logSpy;
    setLogLevel('debug');
  });

  afterEach(() => {
    setLogLevel('info');
  });

  test('returns the result of the function', async () => {
    const result = await withTiming('test op', async () => 42);
    expect(result).toBe(42);
  });

  test('logs duration on success', async () => {
    await withTiming('test op', async () => 'done');
    expect(logSpy).toHaveBeenCalled();
    const output = logSpy.mock.calls[0]![0] as string;
    expect(output).toContain('test op completed');
    expect(output).toContain('duration=');
  });

  test('logs and rethrows on error', async () => {
    const errorSpy = mock(() => {});
    console.error = errorSpy;

    try {
      await withTiming('failing op', async () => {
        throw new Error('oops');
      });
      expect(true).toBe(false); // Should not reach
    } catch (e) {
      expect((e as Error).message).toBe('oops');
    }

    expect(errorSpy).toHaveBeenCalled();
    const calls = errorSpy.mock.calls as unknown as string[][];
    expect(calls[0]![0]).toContain('failing op failed');
  });
});
