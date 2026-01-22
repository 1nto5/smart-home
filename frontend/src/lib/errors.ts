// Typed API errors with user-friendly messages

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code?: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isNetworkError(): boolean {
    return this.statusCode === 0;
  }

  get isDeviceOffline(): boolean {
    return this.code === 'DEVICE_OFFLINE' || this.statusCode === 503;
  }

  get isDeviceTimeout(): boolean {
    return this.code === 'DEVICE_TIMEOUT' || this.statusCode === 504;
  }

  get isValidationError(): boolean {
    return this.code === 'VALIDATION_ERROR' || this.statusCode === 400;
  }
}

// User-friendly error messages by status code and context
const ERROR_MESSAGES: Record<number, string> = {
  0: 'Network error. Check your connection.',
  400: 'Invalid request',
  404: 'Not found',
  429: 'Too many requests. Please wait.',
  500: 'Server error',
  502: 'Server unavailable',
  503: 'Device is offline',
  504: 'Device did not respond',
};

// Context-specific error messages
const CONTEXT_MESSAGES: Record<string, Record<number, string>> = {
  device: {
    503: 'Device is offline. Will retry when available.',
    504: 'Device did not respond. Try again.',
    500: 'Device command failed',
  },
  lamp: {
    503: 'Lamp is offline',
    504: 'Lamp did not respond',
  },
  heater: {
    503: 'Heater is offline',
    504: 'Heater did not respond',
  },
  vacuum: {
    503: 'Vacuum is offline (check bridge)',
    504: 'Vacuum did not respond',
  },
};

export function getErrorMessage(
  error: ApiError | Error,
  context?: keyof typeof CONTEXT_MESSAGES
): string {
  if (error instanceof ApiError) {
    // Try context-specific message first
    if (context && CONTEXT_MESSAGES[context]?.[error.statusCode]) {
      return CONTEXT_MESSAGES[context][error.statusCode];
    }
    // Fall back to general message
    return ERROR_MESSAGES[error.statusCode] || error.message || 'Unknown error';
  }

  // For generic errors
  if (error.message.includes('fetch')) {
    return 'Network error. Check your connection.';
  }
  return error.message || 'Unknown error';
}

// Parse API response and throw typed error if needed
export async function parseApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: ApiErrorResponse | null = null;
    try {
      errorData = await response.json();
    } catch {
      // Response is not JSON
    }

    throw new ApiError(
      errorData?.error || response.statusText,
      response.status,
      errorData?.code,
      errorData?.details
    );
  }

  return response.json();
}

// Retry logic with exponential backoff
export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: Error) => boolean;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 5000,
  shouldRetry: (error) => {
    if (error instanceof ApiError) {
      // Retry on network errors and server errors, but not client errors
      return error.isNetworkError || error.statusCode >= 500;
    }
    return true;
  },
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === opts.maxAttempts || !opts.shouldRetry(lastError)) {
        throw lastError;
      }

      // Exponential backoff with jitter
      const delay = Math.min(
        opts.baseDelay * Math.pow(2, attempt - 1) + Math.random() * 100,
        opts.maxDelay
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
