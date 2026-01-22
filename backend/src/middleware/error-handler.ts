import type { Context, Next } from 'hono';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  details?: unknown;
}

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

// Error codes mapped to user-friendly messages
const ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: 'Invalid request data',
  NOT_FOUND: 'Resource not found',
  DEVICE_OFFLINE: 'Device is offline',
  DEVICE_TIMEOUT: 'Device did not respond',
  DEVICE_ERROR: 'Device communication error',
  COMMAND_FAILED: 'Command failed to execute',
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Access denied',
  RATE_LIMITED: 'Too many requests',
  INTERNAL_ERROR: 'Internal server error',
};

// Map HTTP status codes to error codes
const STATUS_TO_CODE: Record<number, string> = {
  400: 'VALIDATION_ERROR',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  429: 'RATE_LIMITED',
  500: 'INTERNAL_ERROR',
  503: 'DEVICE_OFFLINE',
  504: 'DEVICE_TIMEOUT',
};

export function createApiResponse<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

export function createErrorResponse(
  message: string,
  code?: string,
  details?: unknown
): ApiResponse {
  return {
    success: false,
    error: message,
    code,
    ...(details && process.env.NODE_ENV !== 'production' ? { details } : {}),
  };
}

export function getErrorMessage(code: string): string {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES.INTERNAL_ERROR;
}

// Global error handler middleware
export async function errorHandler(c: Context, next: Next): Promise<Response> {
  try {
    await next();
  } catch (err) {
    // Handle Zod validation errors
    if (err instanceof ZodError) {
      const details = err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      }));
      logger.warn('Validation error', { component: 'api', details });
      return c.json(
        createErrorResponse('Validation error', 'VALIDATION_ERROR', details),
        400
      );
    }

    // Handle custom API errors
    const apiError = err as ApiError;
    const statusCode = apiError.statusCode || 500;
    const code = apiError.code || STATUS_TO_CODE[statusCode] || 'INTERNAL_ERROR';
    const message = apiError.message || getErrorMessage(code);

    // Don't expose internal error details in production
    const sanitizedMessage =
      statusCode >= 500 && process.env.NODE_ENV === 'production'
        ? getErrorMessage(code)
        : message;

    logger.error('Request error', {
      component: 'api',
      statusCode,
      code,
      error: message,
    });

    return c.json(createErrorResponse(sanitizedMessage, code), statusCode);
  }

  return c.res;
}

// Helper to create typed API errors
export function apiError(
  message: string,
  statusCode: number = 500,
  code?: string
): ApiError {
  const err = new Error(message) as ApiError;
  err.statusCode = statusCode;
  err.code = code || STATUS_TO_CODE[statusCode];
  return err;
}

// Common error factories
export const errors = {
  notFound: (resource: string = 'Resource') =>
    apiError(`${resource} not found`, 404, 'NOT_FOUND'),

  badRequest: (message: string) =>
    apiError(message, 400, 'VALIDATION_ERROR'),

  deviceOffline: (deviceName?: string) =>
    apiError(
      deviceName ? `${deviceName} is offline` : 'Device is offline',
      503,
      'DEVICE_OFFLINE'
    ),

  deviceTimeout: (deviceName?: string) =>
    apiError(
      deviceName ? `${deviceName} did not respond` : 'Device did not respond',
      504,
      'DEVICE_TIMEOUT'
    ),

  commandFailed: (reason?: string) =>
    apiError(reason || 'Command failed to execute', 500, 'COMMAND_FAILED'),

  internal: (message: string = 'Internal server error') =>
    apiError(message, 500, 'INTERNAL_ERROR'),
};
