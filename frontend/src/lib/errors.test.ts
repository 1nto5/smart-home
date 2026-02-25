import { describe, it, expect, vi } from 'vitest';
import { ApiError, getErrorMessage, parseApiResponse, withRetry } from './errors';

describe('ApiError', () => {
  it('sets properties correctly', () => {
    const err = new ApiError('test error', 503, 'DEVICE_OFFLINE', { extra: true });
    expect(err.message).toBe('test error');
    expect(err.statusCode).toBe(503);
    expect(err.code).toBe('DEVICE_OFFLINE');
    expect(err.details).toEqual({ extra: true });
    expect(err.name).toBe('ApiError');
  });

  it('extends Error', () => {
    const err = new ApiError('msg', 500);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ApiError);
  });

  it('isNetworkError is true for status 0', () => {
    expect(new ApiError('net', 0).isNetworkError).toBe(true);
    expect(new ApiError('ok', 200).isNetworkError).toBe(false);
  });

  it('isDeviceOffline is true for DEVICE_OFFLINE code or 503', () => {
    expect(new ApiError('', 503).isDeviceOffline).toBe(true);
    expect(new ApiError('', 400, 'DEVICE_OFFLINE').isDeviceOffline).toBe(true);
    expect(new ApiError('', 200).isDeviceOffline).toBe(false);
  });

  it('isDeviceTimeout is true for DEVICE_TIMEOUT code or 504', () => {
    expect(new ApiError('', 504).isDeviceTimeout).toBe(true);
    expect(new ApiError('', 400, 'DEVICE_TIMEOUT').isDeviceTimeout).toBe(true);
    expect(new ApiError('', 200).isDeviceTimeout).toBe(false);
  });

  it('isValidationError is true for VALIDATION_ERROR code or 400', () => {
    expect(new ApiError('', 400).isValidationError).toBe(true);
    expect(new ApiError('', 200, 'VALIDATION_ERROR').isValidationError).toBe(true);
    expect(new ApiError('', 200).isValidationError).toBe(false);
  });
});

describe('getErrorMessage', () => {
  it('returns general message for known status codes', () => {
    expect(getErrorMessage(new ApiError('', 0))).toBe('Network error. Check your connection.');
    expect(getErrorMessage(new ApiError('', 400))).toBe('Invalid request');
    expect(getErrorMessage(new ApiError('', 404))).toBe('Not found');
    expect(getErrorMessage(new ApiError('', 429))).toBe('Too many requests. Please wait.');
    expect(getErrorMessage(new ApiError('', 500))).toBe('Server error');
    expect(getErrorMessage(new ApiError('', 502))).toBe('Server unavailable');
    expect(getErrorMessage(new ApiError('', 503))).toBe('Device is offline');
    expect(getErrorMessage(new ApiError('', 504))).toBe('Device did not respond');
  });

  it('returns error message for unknown status codes', () => {
    expect(getErrorMessage(new ApiError('custom msg', 418))).toBe('custom msg');
  });

  it('returns "Unknown error" when no message and unknown status', () => {
    expect(getErrorMessage(new ApiError('', 999))).toBe('Unknown error');
  });

  it('returns context-specific message for device context', () => {
    expect(getErrorMessage(new ApiError('', 503), 'device')).toBe('Device is offline. Will retry when available.');
    expect(getErrorMessage(new ApiError('', 504), 'device')).toBe('Device did not respond. Try again.');
    expect(getErrorMessage(new ApiError('', 500), 'device')).toBe('Device command failed');
  });

  it('returns context-specific message for lamp context', () => {
    expect(getErrorMessage(new ApiError('', 503), 'lamp')).toBe('Lamp is offline');
    expect(getErrorMessage(new ApiError('', 504), 'lamp')).toBe('Lamp did not respond');
  });

  it('returns context-specific message for heater context', () => {
    expect(getErrorMessage(new ApiError('', 503), 'heater')).toBe('Heater is offline');
    expect(getErrorMessage(new ApiError('', 504), 'heater')).toBe('Heater did not respond');
  });

  it('returns context-specific message for vacuum context', () => {
    expect(getErrorMessage(new ApiError('', 503), 'vacuum')).toBe('Vacuum is offline (check bridge)');
    expect(getErrorMessage(new ApiError('', 504), 'vacuum')).toBe('Vacuum did not respond');
  });

  it('falls back to general message if context has no entry for status', () => {
    expect(getErrorMessage(new ApiError('', 429), 'lamp')).toBe('Too many requests. Please wait.');
  });

  it('handles generic Error with fetch in message', () => {
    expect(getErrorMessage(new Error('Failed to fetch'))).toBe('Network error. Check your connection.');
  });

  it('handles generic Error with other message', () => {
    expect(getErrorMessage(new Error('Something broke'))).toBe('Something broke');
  });

  it('returns "Unknown error" for empty generic Error', () => {
    expect(getErrorMessage(new Error(''))).toBe('Unknown error');
  });
});

describe('parseApiResponse', () => {
  it('returns parsed JSON for ok response', async () => {
    const response = new Response(JSON.stringify({ data: 42 }), { status: 200 });
    const result = await parseApiResponse<{ data: number }>(response);
    expect(result).toEqual({ data: 42 });
  });

  it('throws ApiError with error data for non-ok JSON response', async () => {
    const body = { success: false, error: 'Device offline', code: 'DEVICE_OFFLINE', details: { id: '1' } };
    const response = new Response(JSON.stringify(body), { status: 503, statusText: 'Service Unavailable' });

    await expect(parseApiResponse(response)).rejects.toThrow(ApiError);
    try {
      await parseApiResponse(response.clone ? new Response(JSON.stringify(body), { status: 503, statusText: 'Service Unavailable' }) : response);
    } catch (e) {
      const err = e as ApiError;
      expect(err.message).toBe('Device offline');
      expect(err.statusCode).toBe(503);
      expect(err.code).toBe('DEVICE_OFFLINE');
      expect(err.details).toEqual({ id: '1' });
    }
  });

  it('throws ApiError with statusText for non-ok non-JSON response', async () => {
    const response = new Response('Not Found', { status: 404, statusText: 'Not Found' });

    try {
      await parseApiResponse(response);
      expect.fail('should have thrown');
    } catch (e) {
      const err = e as ApiError;
      expect(err.message).toBe('Not Found');
      expect(err.statusCode).toBe(404);
      expect(err.code).toBeUndefined();
    }
  });
});

describe('withRetry', () => {
  it('returns result on first success', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    const result = await withRetry(fn);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledOnce();
  });

  it('retries on failure and succeeds', async () => {
    let callCount = 0;
    const fn = vi.fn(async () => {
      callCount++;
      if (callCount === 1) throw new ApiError('fail', 500);
      return 'recovered';
    });

    const result = await withRetry(fn, { baseDelay: 1, maxDelay: 5 });
    expect(result).toBe('recovered');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throws after maxAttempts exhausted', async () => {
    const fn = vi.fn(async () => {
      throw new ApiError('fail', 500);
    });

    await expect(
      withRetry(fn, { maxAttempts: 2, baseDelay: 1, maxDelay: 5 })
    ).rejects.toThrow('fail');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('does not retry if shouldRetry returns false', async () => {
    const fn = vi.fn(async () => {
      throw new ApiError('bad request', 400);
    });

    // Default shouldRetry won't retry 400 (client error)
    await expect(
      withRetry(fn, { maxAttempts: 3, baseDelay: 1 })
    ).rejects.toThrow('bad request');
    expect(fn).toHaveBeenCalledOnce();
  });

  it('retries on network errors by default', async () => {
    let callCount = 0;
    const fn = vi.fn(async () => {
      callCount++;
      if (callCount === 1) throw new ApiError('network', 0);
      return 'ok';
    });

    const result = await withRetry(fn, { baseDelay: 1, maxDelay: 5 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('respects custom shouldRetry', async () => {
    const fn = vi.fn(async () => {
      throw new Error('custom');
    });

    await expect(
      withRetry(fn, {
        maxAttempts: 3,
        baseDelay: 1,
        shouldRetry: () => false,
      })
    ).rejects.toThrow('custom');
    expect(fn).toHaveBeenCalledOnce();
  });
});
