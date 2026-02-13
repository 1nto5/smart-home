import { test, expect, describe } from 'bun:test';
import {
  DeviceUpdateSchema,
  DeviceControlSchema,
  LampPresetSchema,
  LampPresetUpdateSchema,
  LampControlSchema,
  HeaterPresetSchema,
  HeaterOverrideSchema,
  LampScheduleSchema,
  RoborockCommandSchema,
  YamahaControlSchema,
  AutomationSchema,
  TelegramConfigSchema,
  AirPurifierControlSchema,
  WsMessageSchema,
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
    for (const cmd of commands) {
      const result = RoborockCommandSchema.safeParse({ cmd });
      expect(result.success).toBe(true);
    }
  });

  test('rejects invalid command', () => {
    const result = RoborockCommandSchema.safeParse({ cmd: 'invalid' });
    expect(result.success).toBe(false);
  });
});

describe('DeviceControlSchema', () => {
  test('accepts DPS control', () => {
    const result = DeviceControlSchema.safeParse({ dps: 1, value: true });
    expect(result.success).toBe(true);
  });

  test('accepts string value', () => {
    const result = DeviceControlSchema.safeParse({ dps: 4, value: 'color' });
    expect(result.success).toBe(true);
  });

  test('accepts numeric value', () => {
    const result = DeviceControlSchema.safeParse({ dps: 4, value: 210 });
    expect(result.success).toBe(true);
  });

  test('accepts cloud command control', () => {
    const result = DeviceControlSchema.safeParse({
      commands: [{ code: 'switch_led', value: true }],
    });
    expect(result.success).toBe(true);
  });

  test('rejects empty commands array', () => {
    const result = DeviceControlSchema.safeParse({ commands: [] });
    expect(result.success).toBe(false);
  });

  test('rejects missing dps and commands', () => {
    const result = DeviceControlSchema.safeParse({ value: true });
    expect(result.success).toBe(false);
  });
});

describe('LampControlSchema', () => {
  test('accepts power only', () => {
    expect(LampControlSchema.safeParse({ power: true }).success).toBe(true);
  });

  test('accepts brightness only', () => {
    expect(LampControlSchema.safeParse({ brightness: 50 }).success).toBe(true);
  });

  test('accepts colorTemp only', () => {
    expect(LampControlSchema.safeParse({ colorTemp: 4000 }).success).toBe(true);
  });

  test('rejects brightness out of range', () => {
    expect(LampControlSchema.safeParse({ brightness: 0 }).success).toBe(false);
    expect(LampControlSchema.safeParse({ brightness: 101 }).success).toBe(false);
  });

  test('rejects colorTemp out of range', () => {
    expect(LampControlSchema.safeParse({ colorTemp: 1000 }).success).toBe(false);
    expect(LampControlSchema.safeParse({ colorTemp: 7000 }).success).toBe(false);
  });
});

describe('YamahaControlSchema', () => {
  test('accepts power control', () => {
    expect(YamahaControlSchema.safeParse({ power: true }).success).toBe(true);
  });

  test('accepts volume control', () => {
    expect(YamahaControlSchema.safeParse({ volume: 50 }).success).toBe(true);
  });

  test('accepts mute control', () => {
    expect(YamahaControlSchema.safeParse({ mute: true }).success).toBe(true);
  });

  test('accepts multiple controls', () => {
    const result = YamahaControlSchema.safeParse({
      power: true,
      volume: 30,
      input: 'tv',
    });
    expect(result.success).toBe(true);
  });

  test('rejects volume out of range', () => {
    expect(YamahaControlSchema.safeParse({ volume: -1 }).success).toBe(false);
    expect(YamahaControlSchema.safeParse({ volume: 101 }).success).toBe(false);
  });
});

describe('AutomationSchema', () => {
  test('accepts valid automation', () => {
    const result = AutomationSchema.safeParse({
      name: 'Turn on lights',
      trigger_type: 'device_state',
      trigger_device_id: 'abc123',
      trigger_condition: 'open',
      actions: '[]',
    });
    expect(result.success).toBe(true);
  });

  test('accepts schedule trigger', () => {
    const result = AutomationSchema.safeParse({
      name: 'Morning routine',
      trigger_type: 'schedule',
      trigger_condition: '06:00',
      actions: '[{"type":"lamp"}]',
    });
    expect(result.success).toBe(true);
  });

  test('accepts sunrise/sunset triggers', () => {
    expect(AutomationSchema.safeParse({
      name: 'Sunset lights',
      trigger_type: 'sunset',
      trigger_condition: '+30',
      actions: '[]',
    }).success).toBe(true);
  });

  test('rejects invalid trigger type', () => {
    expect(AutomationSchema.safeParse({
      name: 'Test',
      trigger_type: 'invalid',
      trigger_condition: 'test',
      actions: '[]',
    }).success).toBe(false);
  });

  test('rejects empty name', () => {
    expect(AutomationSchema.safeParse({
      name: '',
      trigger_type: 'schedule',
      trigger_condition: '06:00',
      actions: '[]',
    }).success).toBe(false);
  });
});

describe('TelegramConfigSchema', () => {
  test('accepts partial config', () => {
    expect(TelegramConfigSchema.safeParse({ enabled: true }).success).toBe(true);
  });

  test('accepts full config', () => {
    expect(TelegramConfigSchema.safeParse({
      enabled: true,
      flood_alerts: true,
      door_alerts: false,
      error_alerts: true,
      cooldown_minutes: 5,
    }).success).toBe(true);
  });

  test('rejects cooldown out of range', () => {
    expect(TelegramConfigSchema.safeParse({ cooldown_minutes: 0 }).success).toBe(false);
    expect(TelegramConfigSchema.safeParse({ cooldown_minutes: 61 }).success).toBe(false);
  });
});

describe('AirPurifierControlSchema', () => {
  test('accepts power control', () => {
    expect(AirPurifierControlSchema.safeParse({ power: true }).success).toBe(true);
  });

  test('accepts mode control', () => {
    expect(AirPurifierControlSchema.safeParse({ mode: 'auto' }).success).toBe(true);
    expect(AirPurifierControlSchema.safeParse({ mode: 'silent' }).success).toBe(true);
    expect(AirPurifierControlSchema.safeParse({ mode: 'favorite' }).success).toBe(true);
  });

  test('rejects invalid mode', () => {
    expect(AirPurifierControlSchema.safeParse({ mode: 'turbo' }).success).toBe(false);
  });

  test('accepts fan_speed in range', () => {
    expect(AirPurifierControlSchema.safeParse({ fan_speed: 300 }).success).toBe(true);
    expect(AirPurifierControlSchema.safeParse({ fan_speed: 2200 }).success).toBe(true);
  });

  test('rejects fan_speed out of range', () => {
    expect(AirPurifierControlSchema.safeParse({ fan_speed: 299 }).success).toBe(false);
    expect(AirPurifierControlSchema.safeParse({ fan_speed: 2201 }).success).toBe(false);
  });
});

describe('WsMessageSchema', () => {
  test('accepts request_snapshot', () => {
    const result = WsMessageSchema.safeParse({ type: 'request_snapshot' });
    expect(result.success).toBe(true);
  });

  test('rejects unknown message type', () => {
    const result = WsMessageSchema.safeParse({ type: 'unknown' });
    expect(result.success).toBe(false);
  });

  test('rejects empty object', () => {
    const result = WsMessageSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  test('rejects non-object', () => {
    expect(WsMessageSchema.safeParse('request_snapshot').success).toBe(false);
    expect(WsMessageSchema.safeParse(123).success).toBe(false);
    expect(WsMessageSchema.safeParse(null).success).toBe(false);
  });
});
