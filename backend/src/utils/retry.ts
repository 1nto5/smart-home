/**
 * Generic retry utility with configurable attempts and delay.
 * Used for device communication where cold-start or transient failures are common.
 */

import { getErrorMessage } from './errors';
import { logger } from './logger';

export interface RetryOptions {
  maxRetries?: number;
  delayMs?: number;
  label?: string;
}

/**
 * Retries `fn` up to `maxRetries` times on failure, sleeping `delayMs` between attempts.
 * Returns the result of `fn` on the first successful attempt, or the fallback value
 * from the last attempt if all retries are exhausted.
 */
export async function withRetry<T>(
  fn: (attempt: number) => Promise<T>,
  opts: RetryOptions = {}
): Promise<T> {
  const { maxRetries = 2, delayMs = 2000, label } = opts;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn(attempt);
    } catch (error: unknown) {
      if (attempt < maxRetries) {
        await Bun.sleep(delayMs);
        continue;
      }
      if (label) {
        logger.error(label, { error: getErrorMessage(error) });
      }
      throw error;
    }
  }
  // Unreachable, but TypeScript needs it
  throw new Error('withRetry exhausted');
}
