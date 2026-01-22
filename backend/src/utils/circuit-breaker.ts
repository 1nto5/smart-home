import { logger } from './logger';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  name: string;
  failureThreshold?: number; // Number of failures before opening
  resetTimeout?: number; // Time in ms before trying again
  halfOpenMaxAttempts?: number; // Max attempts in half-open state
}

export interface CircuitBreakerStats {
  name: string;
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailure: Date | null;
  lastSuccess: Date | null;
}

const DEFAULT_OPTIONS = {
  failureThreshold: 3,
  resetTimeout: 60000, // 60 seconds
  halfOpenMaxAttempts: 1,
};

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failures = 0;
  private successes = 0;
  private halfOpenAttempts = 0;
  private lastFailure: Date | null = null;
  private lastSuccess: Date | null = null;
  private nextAttempt: Date | null = null;

  private readonly name: string;
  private readonly failureThreshold: number;
  private readonly resetTimeout: number;
  private readonly halfOpenMaxAttempts: number;

  constructor(options: CircuitBreakerOptions) {
    this.name = options.name;
    this.failureThreshold = options.failureThreshold ?? DEFAULT_OPTIONS.failureThreshold;
    this.resetTimeout = options.resetTimeout ?? DEFAULT_OPTIONS.resetTimeout;
    this.halfOpenMaxAttempts = options.halfOpenMaxAttempts ?? DEFAULT_OPTIONS.halfOpenMaxAttempts;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (!this.canExecute()) {
      throw new CircuitOpenError(this.name, this.nextAttempt);
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  private canExecute(): boolean {
    if (this.state === 'CLOSED') {
      return true;
    }

    if (this.state === 'OPEN') {
      // Check if we should transition to half-open
      if (this.nextAttempt && new Date() >= this.nextAttempt) {
        this.transitionTo('HALF_OPEN');
        return true;
      }
      return false;
    }

    // HALF_OPEN - allow limited attempts
    return this.halfOpenAttempts < this.halfOpenMaxAttempts;
  }

  private onSuccess(): void {
    this.successes++;
    this.lastSuccess = new Date();

    if (this.state === 'HALF_OPEN') {
      // Success in half-open state means we can close the circuit
      this.transitionTo('CLOSED');
    }

    this.failures = 0;
    this.halfOpenAttempts = 0;
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailure = new Date();

    if (this.state === 'HALF_OPEN') {
      this.halfOpenAttempts++;
      if (this.halfOpenAttempts >= this.halfOpenMaxAttempts) {
        // Failed in half-open, go back to open
        this.transitionTo('OPEN');
      }
      return;
    }

    if (this.state === 'CLOSED' && this.failures >= this.failureThreshold) {
      this.transitionTo('OPEN');
    }
  }

  private transitionTo(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;

    logger.info(`Circuit breaker state change`, {
      component: 'circuit-breaker',
      name: this.name,
      from: oldState,
      to: newState,
    });

    if (newState === 'OPEN') {
      this.nextAttempt = new Date(Date.now() + this.resetTimeout);
    } else if (newState === 'HALF_OPEN') {
      this.halfOpenAttempts = 0;
    } else if (newState === 'CLOSED') {
      this.failures = 0;
      this.nextAttempt = null;
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  getStats(): CircuitBreakerStats {
    return {
      name: this.name,
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailure: this.lastFailure,
      lastSuccess: this.lastSuccess,
    };
  }

  reset(): void {
    this.state = 'CLOSED';
    this.failures = 0;
    this.halfOpenAttempts = 0;
    this.nextAttempt = null;
    logger.info(`Circuit breaker reset`, { component: 'circuit-breaker', name: this.name });
  }
}

export class CircuitOpenError extends Error {
  constructor(
    public readonly circuitName: string,
    public readonly nextAttempt: Date | null
  ) {
    const retryIn = nextAttempt
      ? Math.ceil((nextAttempt.getTime() - Date.now()) / 1000)
      : 0;
    super(`Circuit "${circuitName}" is open. Retry in ${retryIn}s`);
    this.name = 'CircuitOpenError';
  }
}

// Registry of circuit breakers for different services
const circuits = new Map<string, CircuitBreaker>();

export function getCircuitBreaker(name: string, options?: Partial<CircuitBreakerOptions>): CircuitBreaker {
  if (!circuits.has(name)) {
    circuits.set(name, new CircuitBreaker({ name, ...options }));
  }
  return circuits.get(name)!;
}

export function getAllCircuitStats(): CircuitBreakerStats[] {
  return Array.from(circuits.values()).map((cb) => cb.getStats());
}

export function resetAllCircuits(): void {
  circuits.forEach((cb) => cb.reset());
}

// Pre-configured breakers for common services
export const deviceCircuits = {
  tuyaLocal: () => getCircuitBreaker('tuya-local', { failureThreshold: 3, resetTimeout: 30000 }),
  xiaomiLamp: () => getCircuitBreaker('xiaomi-lamp', { failureThreshold: 3, resetTimeout: 30000 }),
  yamaha: () => getCircuitBreaker('yamaha', { failureThreshold: 3, resetTimeout: 30000 }),
  roborock: () => getCircuitBreaker('roborock', { failureThreshold: 5, resetTimeout: 60000 }),
};
