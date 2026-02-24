import { describe, it, expect } from 'vitest';
import type {
  Lamp,
  LampStatus,
  RoborockStatus,
  TuyaDevice,
  YamahaStatus,
  WsMessage,
  AirPurifierStatus,
  HeaterPreset,
  Automation,
} from './types';

describe('types', () => {
  it('Lamp interface has required properties', () => {
    const lamp: Lamp = {
      id: 'lamp1',
      name: 'Test Lamp',
      ip: '192.168.1.1',
      model: 'yeelink.light.strip6',
      room: 'Living Room',
      online: 1,
      last_status: null,
    };
    expect(lamp.id).toBe('lamp1');
    expect(lamp.room).toBe('Living Room');
  });

  it('LampStatus has power and brightness', () => {
    const status: LampStatus = {
      power: true,
      brightness: 80,
      color_temp: 4000,
      color_mode: 2,
      rgb: 0,
    };
    expect(status.power).toBe(true);
    expect(status.brightness).toBe(80);
  });

  it('WsMessage discriminated union narrows correctly', () => {
    const msg: WsMessage = {
      type: 'lamp_status',
      deviceId: 'lamp1',
      status: { power: true, brightness: 100, color_temp: 4000, color_mode: 2, rgb: 0 },
    };

    if (msg.type === 'lamp_status') {
      expect(msg.deviceId).toBe('lamp1');
      expect(msg.status.power).toBe(true);
    }
  });

  it('YamahaStatus power is a union type', () => {
    const on: YamahaStatus = { power: 'on', volume: 50, mute: false, input: 'hdmi1', sound_program: 'movie' };
    const standby: YamahaStatus = { power: 'standby', volume: 0, mute: false, input: 'hdmi1', sound_program: 'stereo' };

    expect(on.power).toBe('on');
    expect(standby.power).toBe('standby');
  });

  it('AirPurifierStatus has required fields', () => {
    const status: AirPurifierStatus = {
      power: true,
      mode: 'auto',
      aqi: 15,
    };
    expect(status.power).toBe(true);
    expect(status.aqi).toBe(15);
  });
});
