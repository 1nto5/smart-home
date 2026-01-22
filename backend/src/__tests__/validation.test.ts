import { test, expect, describe } from 'bun:test';
import {
  DeviceUpdateSchema,
  LampPresetSchema,
  LampPresetUpdateSchema,
  HeaterPresetSchema,
  HeaterOverrideSchema,
  LampScheduleSchema,
  RoborockCommandSchema,
} from '../validation/schemas';

describe('DeviceUpdateSchema', () => {
  test('accepts valid partial update', () => {
    const result = DeviceUpdateSchema.safeParse({ name: 'New Name' });
    expect(result.success).toBe(true);
  });

  test('accepts room update', () => {
    const result = DeviceUpdateSchema.safeParse({ room: 'Living Room' });
    expect(result.success).toBe(true);
  });

  test('accepts multiple fields', () => {
    const result = DeviceUpdateSchema.safeParse({
      name: 'Lamp',
      room: 'Bedroom',
      type: 'light',
    });
    expect(result.success).toBe(true);
  });

  test('rejects empty name', () => {
    const result = DeviceUpdateSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });
});

describe('LampPresetSchema', () => {
  test('accepts valid preset', () => {
    const result = LampPresetSchema.safeParse({
      id: 'day-mode',
      name: 'Day Mode',
      brightness: 100,
      color_temp: 5000,
    });
    expect(result.success).toBe(true);
  });

  test('rejects brightness out of range', () => {
    const result = LampPresetSchema.safeParse({
      id: 'test',
      name: 'Test',
      brightness: 150,
      color_temp: 5000,
    });
    expect(result.success).toBe(false);
  });

  test('rejects invalid color_temp', () => {
    const result = LampPresetSchema.safeParse({
      id: 'test',
      name: 'Test',
      brightness: 100,
      color_temp: 1000, // Too low
    });
    expect(result.success).toBe(false);
  });

  test('rejects invalid id characters', () => {
    const result = LampPresetSchema.safeParse({
      id: 'has spaces',
      name: 'Test',
      brightness: 100,
      color_temp: 5000,
    });
    expect(result.success).toBe(false);
  });
});

describe('LampPresetUpdateSchema', () => {
  test('requires brightness and color_temp', () => {
    const result = LampPresetUpdateSchema.safeParse({
      brightness: 80,
      color_temp: 4000,
    });
    expect(result.success).toBe(true);
  });

  test('allows optional power field', () => {
    const result = LampPresetUpdateSchema.safeParse({
      brightness: 80,
      color_temp: 4000,
      power: false,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.power).toBe(false);
    }
  });
});

describe('HeaterPresetSchema', () => {
  test('accepts valid preset', () => {
    const result = HeaterPresetSchema.safeParse({
      id: 'comfort',
      name: 'Comfort Mode',
      target_temp: 21,
    });
    expect(result.success).toBe(true);
  });

  test('rejects temperature too low', () => {
    const result = HeaterPresetSchema.safeParse({
      id: 'test',
      name: 'Test',
      target_temp: 3,
    });
    expect(result.success).toBe(false);
  });

  test('rejects temperature too high', () => {
    const result = HeaterPresetSchema.safeParse({
      id: 'test',
      name: 'Test',
      target_temp: 35,
    });
    expect(result.success).toBe(false);
  });

  test('accepts decimal temperature', () => {
    const result = HeaterPresetSchema.safeParse({
      id: 'test',
      name: 'Test',
      target_temp: 21.5,
    });
    expect(result.success).toBe(true);
  });
});

describe('HeaterOverrideSchema', () => {
  test('accepts enabled with pause mode', () => {
    const result = HeaterOverrideSchema.safeParse({
      enabled: true,
      mode: 'pause',
    });
    expect(result.success).toBe(true);
  });

  test('accepts enabled with fixed mode and temp', () => {
    const result = HeaterOverrideSchema.safeParse({
      enabled: true,
      mode: 'fixed',
      fixed_temp: 18,
    });
    expect(result.success).toBe(true);
  });

  test('rejects invalid mode', () => {
    const result = HeaterOverrideSchema.safeParse({
      enabled: true,
      mode: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  test('accepts just enabled field', () => {
    const result = HeaterOverrideSchema.safeParse({ enabled: false });
    expect(result.success).toBe(true);
  });
});

describe('LampScheduleSchema', () => {
  test('accepts valid schedule', () => {
    const result = LampScheduleSchema.safeParse({
      name: 'Morning',
      preset: 'day',
      time: '06:00',
    });
    expect(result.success).toBe(true);
  });

  test('rejects invalid time format', () => {
    const result = LampScheduleSchema.safeParse({
      name: 'Test',
      preset: 'day',
      time: '6:00', // Missing leading zero
    });
    expect(result.success).toBe(false);
  });

  test('rejects invalid time values', () => {
    const result = LampScheduleSchema.safeParse({
      name: 'Test',
      preset: 'day',
      time: '25:00',
    });
    expect(result.success).toBe(false);
  });

  test('accepts edge time values', () => {
    expect(LampScheduleSchema.safeParse({ name: 'Test', preset: 'day', time: '00:00' }).success).toBe(true);
    expect(LampScheduleSchema.safeParse({ name: 'Test', preset: 'day', time: '23:59' }).success).toBe(true);
  });
});

describe('RoborockCommandSchema', () => {
  test('accepts valid commands', () => {
    const commands = ['start', 'pause', 'stop', 'home', 'find'];
    for (const command of commands) {
      const result = RoborockCommandSchema.safeParse({ command });
      expect(result.success).toBe(true);
    }
  });

  test('rejects invalid command', () => {
    const result = RoborockCommandSchema.safeParse({ command: 'invalid' });
    expect(result.success).toBe(false);
  });
});
