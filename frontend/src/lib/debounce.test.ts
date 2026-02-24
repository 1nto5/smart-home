import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from './debounce';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns a tuple of [debouncedFn, cancel]', () => {
    const [debounced, cancel] = debounce(() => {}, 100);
    expect(typeof debounced).toBe('function');
    expect(typeof cancel).toBe('function');
  });

  it('delays function execution by the specified wait time', () => {
    const fn = vi.fn();
    const [debounced] = debounce(fn, 200);

    debounced();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(199);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledOnce();
  });

  it('resets the timer on subsequent calls', () => {
    const fn = vi.fn();
    const [debounced] = debounce(fn, 100);

    debounced();
    vi.advanceTimersByTime(80);
    debounced(); // reset
    vi.advanceTimersByTime(80);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(20);
    expect(fn).toHaveBeenCalledOnce();
  });

  it('forwards arguments to the original function', () => {
    const fn = vi.fn();
    const [debounced] = debounce(fn, 50);

    debounced('a', 42);
    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledWith('a', 42);
  });

  it('uses the latest arguments when called multiple times', () => {
    const fn = vi.fn();
    const [debounced] = debounce(fn, 50);

    debounced('first');
    debounced('second');
    debounced('third');
    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith('third');
  });

  it('cancel prevents execution', () => {
    const fn = vi.fn();
    const [debounced, cancel] = debounce(fn, 100);

    debounced();
    cancel();
    vi.advanceTimersByTime(200);
    expect(fn).not.toHaveBeenCalled();
  });

  it('cancel is safe to call when no timer is pending', () => {
    const fn = vi.fn();
    const [, cancel] = debounce(fn, 100);
    expect(() => cancel()).not.toThrow();
  });

  it('can be called again after cancel', () => {
    const fn = vi.fn();
    const [debounced, cancel] = debounce(fn, 100);

    debounced();
    cancel();
    debounced();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledOnce();
  });
});
