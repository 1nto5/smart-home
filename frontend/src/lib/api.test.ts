import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock config before importing api
vi.mock('./config', () => ({
  AUTH_TOKEN: 'test-token-123',
}));

import {
  getLamps,
  getLampStatus,
  controlLamp,
  discoverLampIp,
  getRoborockStatus,
  sendRoborockCommand,
  getPresets,
  applyPreset,
  getTuyaDevices,
  controlTuyaDevice,
  getYamahaDevices,
  controlYamaha,
  getAirPurifierStatus,
  controlAirPurifier,
  getHeaterPresets,
  getAutomations,
  getHomeStatus,
} from './api';

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

function mockJsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve(data),
  } as Response;
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe('fetcher (via API functions)', () => {
  it('includes Authorization header when AUTH_TOKEN is set', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse([]));
    await getLamps();

    expect(mockFetch).toHaveBeenCalledOnce();
    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers['Authorization']).toBe('Bearer test-token-123');
  });

  it('includes Content-Type header', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse([]));
    await getLamps();

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers['Content-Type']).toBe('application/json');
  });

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse(null, 500));
    await expect(getLamps()).rejects.toThrow('HTTP 500');
  });
});

describe('Lamp API', () => {
  it('getLamps calls GET /api/xiaomi', async () => {
    const lamps = [{ id: '1', name: 'Lamp' }];
    mockFetch.mockResolvedValue(mockJsonResponse(lamps));

    const result = await getLamps();
    expect(result).toEqual(lamps);
    expect(mockFetch.mock.calls[0][0]).toBe('/api/xiaomi');
  });

  it('getLampStatus calls GET /api/xiaomi/:id/status', async () => {
    const status = { device_id: 'abc', status: { power: true } };
    mockFetch.mockResolvedValue(mockJsonResponse(status));

    const result = await getLampStatus('abc');
    expect(result).toEqual(status);
    expect(mockFetch.mock.calls[0][0]).toBe('/api/xiaomi/abc/status');
  });

  it('controlLamp calls POST /api/xiaomi/:id/control', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse({ success: true }));

    await controlLamp('abc', { power: true, brightness: 80 });
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('/api/xiaomi/abc/control');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ power: true, brightness: 80 });
  });

  it('discoverLampIp calls POST /api/xiaomi/discover', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse({ success: true, discovered: 1 }));

    await discoverLampIp('device1');
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('/api/xiaomi/discover');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ device_id: 'device1' });
  });

  it('discoverLampIp sends empty body when no deviceId', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse({ success: true }));

    await discoverLampIp();
    const [, options] = mockFetch.mock.calls[0];
    expect(JSON.parse(options.body)).toEqual({});
  });
});

describe('Roborock API', () => {
  it('getRoborockStatus calls GET /api/roborock/status', async () => {
    const status = { state: 8, battery: 100 };
    mockFetch.mockResolvedValue(mockJsonResponse(status));

    const result = await getRoborockStatus();
    expect(result).toEqual(status);
    expect(mockFetch.mock.calls[0][0]).toBe('/api/roborock/status');
  });

  it('sendRoborockCommand calls POST /api/roborock/command', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse({ success: true }));

    await sendRoborockCommand('start');
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('/api/roborock/command');
    expect(JSON.parse(options.body)).toEqual({ cmd: 'start' });
  });
});

describe('Presets API', () => {
  it('getPresets calls GET /api/presets', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse({}));
    await getPresets();
    expect(mockFetch.mock.calls[0][0]).toBe('/api/presets');
  });

  it('applyPreset calls POST /api/presets/:name/apply', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse({ success: [] }));
    await applyPreset('evening');
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('/api/presets/evening/apply');
    expect(options.method).toBe('POST');
  });
});

describe('Tuya API', () => {
  it('getTuyaDevices calls GET /api/devices', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse([]));
    await getTuyaDevices();
    expect(mockFetch.mock.calls[0][0]).toBe('/api/devices');
  });

  it('controlTuyaDevice calls POST with dps and value', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse({ success: true }));
    await controlTuyaDevice('dev1', 1, true);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('/api/devices/dev1/control');
    expect(JSON.parse(options.body)).toEqual({ dps: 1, value: true });
  });
});

describe('Yamaha API', () => {
  it('getYamahaDevices calls GET /api/yamaha', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse([]));
    await getYamahaDevices();
    expect(mockFetch.mock.calls[0][0]).toBe('/api/yamaha');
  });

  it('controlYamaha sends correct payload', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse({ success: true }));
    await controlYamaha('ym1', { power: true, volume: 50 });
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('/api/yamaha/ym1/control');
    expect(JSON.parse(options.body)).toEqual({ power: true, volume: 50 });
  });
});

describe('Air Purifier API', () => {
  it('getAirPurifierStatus calls GET /api/purifier/status', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse({ power: true, aqi: 5 }));
    const result = await getAirPurifierStatus();
    expect(result).toEqual({ power: true, aqi: 5 });
    expect(mockFetch.mock.calls[0][0]).toBe('/api/purifier/status');
  });

  it('controlAirPurifier calls POST /api/purifier/control', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse({ success: true }));
    await controlAirPurifier({ power: true, mode: 'auto' });
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('/api/purifier/control');
    expect(JSON.parse(options.body)).toEqual({ power: true, mode: 'auto' });
  });
});

describe('Heater API', () => {
  it('getHeaterPresets calls GET /api/heater/presets', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse([]));
    await getHeaterPresets();
    expect(mockFetch.mock.calls[0][0]).toBe('/api/heater/presets');
  });
});

describe('Automations API', () => {
  it('getAutomations calls GET /api/automations', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse([]));
    await getAutomations();
    expect(mockFetch.mock.calls[0][0]).toBe('/api/automations');
  });
});

describe('Home Status API', () => {
  it('getHomeStatus calls GET /api/sensors/home-status', async () => {
    mockFetch.mockResolvedValue(mockJsonResponse({ weather: null }));
    await getHomeStatus();
    expect(mockFetch.mock.calls[0][0]).toBe('/api/sensors/home-status');
  });
});
