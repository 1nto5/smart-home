/**
 * Fetch with timeout using AbortController.
 * Throws an error if the request takes longer than the specified timeout.
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Default timeout values for different services
 */
export const TIMEOUTS = {
  ROBOROCK: 10000,    // 10s - vacuum commands can be slow
  TELEGRAM: 15000,    // 15s - Telegram long polling
  YAMAHA: 5000,       // 5s - local network should be fast
  DEFAULT: 10000,     // 10s default
} as const;
