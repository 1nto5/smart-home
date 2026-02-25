import { test, expect, describe } from 'bun:test';
import { z } from 'zod';
import { Hono } from 'hono';
import {
  createApiResponse,
  createErrorResponse,
  getErrorMessage,
  errorHandler,
  apiError,
  errors,
  type ApiResponse,
} from '../middleware/error-handler';

describe('createApiResponse', () => {
  test('wraps data in success response', () => {
    const result = createApiResponse({ id: 1 });
    expect(result).toEqual({ success: true, data: { id: 1 } });
  });

  test('wraps null data', () => {
    const result = createApiResponse(null);
    expect(result).toEqual({ success: true, data: null });
  });

  test('wraps string data', () => {
    const result = createApiResponse('ok');
    expect(result).toEqual({ success: true, data: 'ok' });
  });
});

describe('createErrorResponse', () => {
  test('creates error response with message', () => {
    const result = createErrorResponse('bad request');
    expect(result.success).toBe(false);
    expect(result.error).toBe('bad request');
  });

  test('includes code when provided', () => {
    const result = createErrorResponse('not found', 'NOT_FOUND');
    expect(result.code).toBe('NOT_FOUND');
  });

  test('excludes details in production', () => {
    const origEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const result = createErrorResponse('fail', 'ERR', { extra: true });
    expect(result.details).toBeUndefined();
    process.env.NODE_ENV = origEnv;
  });

  test('includes details in non-production', () => {
    const origEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const result = createErrorResponse('fail', 'ERR', { extra: true });
    expect(result.details).toEqual({ extra: true });
    process.env.NODE_ENV = origEnv;
  });
});

describe('getErrorMessage', () => {
  test('returns message for known error code', () => {
    expect(getErrorMessage('NOT_FOUND')).toBe('Resource not found');
  });

  test('returns message for VALIDATION_ERROR', () => {
    expect(getErrorMessage('VALIDATION_ERROR')).toBe('Invalid request data');
  });

  test('returns message for DEVICE_OFFLINE', () => {
    expect(getErrorMessage('DEVICE_OFFLINE')).toBe('Device is offline');
  });

  test('returns internal error for unknown code', () => {
    expect(getErrorMessage('UNKNOWN_CODE')).toBe('Internal server error');
  });

  test('returns internal error for undefined', () => {
    expect(getErrorMessage(undefined)).toBe('Internal server error');
  });
});

describe('apiError', () => {
  test('creates error with message and status', () => {
    const err = apiError('not found', 404);
    expect(err.message).toBe('not found');
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
  });

  test('defaults to status 500', () => {
    const err = apiError('oops');
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe('INTERNAL_ERROR');
  });

  test('allows explicit code override', () => {
    const err = apiError('custom', 500, 'CUSTOM_CODE');
    expect(err.code).toBe('CUSTOM_CODE');
  });

  test('is an Error instance', () => {
    const err = apiError('test');
    expect(err).toBeInstanceOf(Error);
  });
});

describe('errors factories', () => {
  test('notFound creates 404 error', () => {
    const err = errors.notFound('Device');
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.message).toBe('Device not found');
  });

  test('notFound uses default resource name', () => {
    const err = errors.notFound();
    expect(err.message).toBe('Resource not found');
  });

  test('badRequest creates 400 error', () => {
    const err = errors.badRequest('missing field');
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.message).toBe('missing field');
  });

  test('deviceOffline creates 503 error', () => {
    const err = errors.deviceOffline('Lamp');
    expect(err.statusCode).toBe(503);
    expect(err.code).toBe('DEVICE_OFFLINE');
    expect(err.message).toBe('Lamp is offline');
  });

  test('deviceOffline uses default message', () => {
    const err = errors.deviceOffline();
    expect(err.message).toBe('Device is offline');
  });

  test('deviceTimeout creates 504 error', () => {
    const err = errors.deviceTimeout('TRV');
    expect(err.statusCode).toBe(504);
    expect(err.code).toBe('DEVICE_TIMEOUT');
    expect(err.message).toBe('TRV did not respond');
  });

  test('deviceTimeout uses default message', () => {
    const err = errors.deviceTimeout();
    expect(err.message).toBe('Device did not respond');
  });

  test('commandFailed creates 500 error', () => {
    const err = errors.commandFailed('power failed');
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe('COMMAND_FAILED');
    expect(err.message).toBe('power failed');
  });

  test('commandFailed uses default message', () => {
    const err = errors.commandFailed();
    expect(err.message).toBe('Command failed to execute');
  });

  test('internal creates 500 error', () => {
    const err = errors.internal('db crash');
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe('INTERNAL_ERROR');
    expect(err.message).toBe('db crash');
  });

  test('internal uses default message', () => {
    const err = errors.internal();
    expect(err.message).toBe('Internal server error');
  });
});

describe('errorHandler middleware', () => {
  test('handles ZodError with 400 response', async () => {
    const app = new Hono();
    app.onError(errorHandler);
    app.get('/test', () => {
      const schema = z.object({ name: z.string() });
      schema.parse({ name: 123 });
      return new Response('ok');
    });

    const res = await app.request('/test');
    expect(res.status).toBe(400);
    const body = (await res.json()) as ApiResponse;
    expect(body.success).toBe(false);
    expect(body.code).toBe('VALIDATION_ERROR');
  });

  test('handles ApiError with custom status', async () => {
    const app = new Hono();
    app.onError(errorHandler);
    app.get('/test', () => {
      throw errors.notFound('Widget');
    });

    const res = await app.request('/test');
    expect(res.status).toBe(404);
    const body = (await res.json()) as ApiResponse;
    expect(body.success).toBe(false);
    expect(body.code).toBe('NOT_FOUND');
    expect(body.error).toBe('Widget not found');
  });

  test('handles plain Error as 500', async () => {
    const app = new Hono();
    app.onError(errorHandler);
    app.get('/test', () => {
      throw new Error('unexpected');
    });

    const res = await app.request('/test');
    expect(res.status).toBe(500);
    const body = (await res.json()) as ApiResponse;
    expect(body.success).toBe(false);
    expect(body.code).toBe('INTERNAL_ERROR');
  });
});
