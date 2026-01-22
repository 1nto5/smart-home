import { test, expect, describe, beforeEach } from 'bun:test';
import { CircuitBreaker, CircuitOpenError } from '../utils/circuit-breaker';

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker({
      name: 'test-breaker',
      failureThreshold: 3,
      resetTimeout: 100, // 100ms for faster tests
    });
  });

  test('starts in CLOSED state', () => {
    expect(breaker.getState()).toBe('CLOSED');
  });

  test('allows execution in CLOSED state', async () => {
    const result = await breaker.execute(async () => 'success');
    expect(result).toBe('success');
    expect(breaker.getState()).toBe('CLOSED');
  });

  test('tracks successes', async () => {
    await breaker.execute(async () => 'success');
    const stats = breaker.getStats();
    expect(stats.successes).toBe(1);
    expect(stats.failures).toBe(0);
  });

  test('tracks failures', async () => {
    try {
      await breaker.execute(async () => {
        throw new Error('fail');
      });
    } catch {
      // Expected
    }
    const stats = breaker.getStats();
    expect(stats.failures).toBe(1);
  });

  test('opens after failure threshold', async () => {
    // Fail 3 times
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(async () => {
          throw new Error('fail');
        });
      } catch {
        // Expected
      }
    }
    expect(breaker.getState()).toBe('OPEN');
  });

  test('rejects execution in OPEN state', async () => {
    // Open the breaker
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(async () => {
          throw new Error('fail');
        });
      } catch {
        // Expected
      }
    }

    // Now it should reject
    try {
      await breaker.execute(async () => 'success');
      expect(true).toBe(false); // Should not reach
    } catch (e) {
      expect(e).toBeInstanceOf(CircuitOpenError);
    }
  });

  test('transitions to HALF_OPEN after timeout', async () => {
    // Open the breaker
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(async () => {
          throw new Error('fail');
        });
      } catch {
        // Expected
      }
    }
    expect(breaker.getState()).toBe('OPEN');

    // Wait for reset timeout
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Next execution should be allowed (HALF_OPEN)
    const result = await breaker.execute(async () => 'success');
    expect(result).toBe('success');
  });

  test('closes after success in HALF_OPEN state', async () => {
    // Open the breaker
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(async () => {
          throw new Error('fail');
        });
      } catch {
        // Expected
      }
    }

    // Wait for reset timeout
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Success in HALF_OPEN should close it
    await breaker.execute(async () => 'success');
    expect(breaker.getState()).toBe('CLOSED');
  });

  test('reset() restores CLOSED state', async () => {
    // Open the breaker
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(async () => {
          throw new Error('fail');
        });
      } catch {
        // Expected
      }
    }
    expect(breaker.getState()).toBe('OPEN');

    breaker.reset();
    expect(breaker.getState()).toBe('CLOSED');
  });

  test('getStats returns correct data', async () => {
    await breaker.execute(async () => 'success');
    try {
      await breaker.execute(async () => {
        throw new Error('fail');
      });
    } catch {
      // Expected
    }

    const stats = breaker.getStats();
    expect(stats.name).toBe('test-breaker');
    expect(stats.state).toBe('CLOSED');
    expect(stats.successes).toBe(1);
    expect(stats.failures).toBe(1);
    expect(stats.lastSuccess).toBeInstanceOf(Date);
    expect(stats.lastFailure).toBeInstanceOf(Date);
  });
});
