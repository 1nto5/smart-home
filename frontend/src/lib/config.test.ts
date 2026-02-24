import { describe, it, expect, vi } from 'vitest';

describe('config', () => {
  it('exports AUTH_TOKEN from import.meta.env', async () => {
    // The default value should be empty string when VITE_AUTH_TOKEN is not set
    const { AUTH_TOKEN } = await import('./config');
    expect(typeof AUTH_TOKEN).toBe('string');
  });

  it('AUTH_TOKEN defaults to empty string when env var is not set', async () => {
    // In test environment, VITE_AUTH_TOKEN is not set, so it should be empty
    vi.resetModules();
    const { AUTH_TOKEN } = await import('./config');
    expect(AUTH_TOKEN).toBe('');
  });

  it('AUTH_TOKEN is a string type', async () => {
    const { AUTH_TOKEN } = await import('./config');
    expect(AUTH_TOKEN).toEqual(expect.any(String));
  });
});
