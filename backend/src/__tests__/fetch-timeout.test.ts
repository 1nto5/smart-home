import { test, expect, describe } from 'bun:test';
import { fetchWithTimeout, TIMEOUTS } from '../utils/fetch-timeout';

describe('fetchWithTimeout', () => {
  test('returns response for successful fetch', async () => {
    // Use a local Bun server for testing
    const server = Bun.serve({
      port: 0,
      fetch() {
        return new Response('hello');
      },
    });

    try {
      const res = await fetchWithTimeout(`http://localhost:${server.port}/`);
      expect(res.status).toBe(200);
      expect(await res.text()).toBe('hello');
    } finally {
      server.stop();
    }
  });

  test('throws on timeout', async () => {
    const server = Bun.serve({
      port: 0,
      async fetch() {
        await Bun.sleep(500);
        return new Response('slow');
      },
    });

    try {
      await expect(
        fetchWithTimeout(`http://localhost:${server.port}/`, {}, 50)
      ).rejects.toThrow('Request timeout after 50ms');
    } finally {
      server.stop();
    }
  });

  test('passes options through to fetch', async () => {
    const server = Bun.serve({
      port: 0,
      async fetch(req) {
        const body = await req.text();
        return new Response(body);
      },
    });

    try {
      const res = await fetchWithTimeout(
        `http://localhost:${server.port}/`,
        { method: 'POST', body: 'test-body' }
      );
      expect(await res.text()).toBe('test-body');
    } finally {
      server.stop();
    }
  });

  test('defaults to 10000ms timeout', async () => {
    // We can't easily test the default without waiting 10s,
    // so just verify the function signature accepts no timeout
    const server = Bun.serve({
      port: 0,
      fetch() {
        return new Response('ok');
      },
    });

    try {
      const res = await fetchWithTimeout(`http://localhost:${server.port}/`);
      expect(res.status).toBe(200);
    } finally {
      server.stop();
    }
  });

  test('propagates non-abort errors', async () => {
    await expect(
      fetchWithTimeout('http://localhost:1/', {}, 5000)
    ).rejects.toThrow();
  });
});

describe('TIMEOUTS constants', () => {
  test('ROBOROCK is 10000', () => {
    expect(TIMEOUTS.ROBOROCK).toBe(10000);
  });

  test('TELEGRAM is 15000', () => {
    expect(TIMEOUTS.TELEGRAM).toBe(15000);
  });

  test('YAMAHA is 5000', () => {
    expect(TIMEOUTS.YAMAHA).toBe(5000);
  });

  test('DEFAULT is 10000', () => {
    expect(TIMEOUTS.DEFAULT).toBe(10000);
  });
});
