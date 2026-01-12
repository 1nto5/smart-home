/**
 * Xiaomi Mi Air Purifier 3C control
 * Uses MiOT protocol (get_properties/set_properties)
 */

import miio from 'miio';
import { getDb } from '../db/database';

let purifierConnection: any = null;

interface PurifierStatus {
  power: boolean;
  mode: string;
  aqi: number;
  filter_life: number;
  fan_speed?: number;
  led_brightness?: 'bright' | 'dim' | 'off';
}

// LED brightness mapping (siid 6, piid 1)
const LED_MAP: Record<number, 'bright' | 'dim' | 'off'> = {
  0: 'bright',
  1: 'dim',
  2: 'off',
};

const LED_TO_VALUE: Record<string, number> = {
  bright: 0,
  dim: 1,
  off: 2,
};

// MiOT mode mapping
const MODE_MAP: Record<number, string> = {
  0: 'auto',
  1: 'silent',
  2: 'favorite',
};

const MODE_TO_VALUE: Record<string, number> = {
  auto: 0,
  silent: 1,
  favorite: 2,
};

/**
 * Get Air Purifier device from database
 */
function getPurifier(): { id: string; ip: string; token: string } | null {
  const db = getDb();
  return db.query("SELECT id, ip, token FROM xiaomi_devices WHERE category = 'purifier'").get() as any;
}

/**
 * Connect to Air Purifier
 */
export async function connectPurifier(): Promise<boolean> {
  if (purifierConnection) return true;

  const device = getPurifier();
  if (!device || !device.token || !device.ip) {
    console.error('Air Purifier not configured or missing token/ip');
    return false;
  }

  try {
    purifierConnection = await miio.device({
      address: device.ip,
      token: device.token,
    });

    console.log(`Connected to Air Purifier 3C (${device.id})`);
    return true;
  } catch (error: any) {
    console.error('Failed to connect to Air Purifier:', error.message);
    return false;
  }
}

/**
 * Get purifier status using MiOT protocol
 */
export async function getPurifierStatus(): Promise<PurifierStatus | null> {
  if (!purifierConnection) {
    await connectPurifier();
  }
  if (!purifierConnection) return null;

  try {
    // MiOT properties for Air Purifier 3C (zhimi.airpurifier.mb4)
    // siid 2 = air purifier service
    // siid 3 = environment
    // siid 4 = filter
    // siid 6 = screen/LED
    // siid 9 = motor
    const result = await purifierConnection.call('get_properties', [
      { siid: 2, piid: 1 },  // power (bool)
      { siid: 2, piid: 4 },  // mode (0=auto, 1=silent, 2=favorite)
      { siid: 3, piid: 4 },  // pm2.5
      { siid: 4, piid: 3 },  // filter life % (piid 3 works for this device)
      { siid: 6, piid: 1 },  // LED brightness (0=bright, 1=dim, 2=off)
      { siid: 9, piid: 1 },  // motor_speed (current RPM)
      { siid: 9, piid: 3 },  // favorite_rpm (set RPM)
    ]);

    const getValue = (siid: number, piid: number) => {
      const prop = result.find((r: any) => r.siid === siid && r.piid === piid);
      return prop?.code === 0 ? prop.value : undefined;
    };

    const modeValue = getValue(2, 4);
    const favoriteRpm = getValue(9, 3);
    const ledValue = getValue(6, 1);

    return {
      power: getValue(2, 1) ?? false,
      mode: MODE_MAP[modeValue] ?? 'unknown',
      aqi: getValue(3, 4) ?? 0,
      filter_life: getValue(4, 3) ?? 0,
      fan_speed: favoriteRpm ?? 300,  // RPM value (300-2200)
      motor_rpm: getValue(9, 1),  // actual current RPM
      led_brightness: LED_MAP[ledValue] ?? 'bright',
    };
  } catch (error: any) {
    console.error('Failed to get purifier status:', error.message);
    return null;
  }
}

/**
 * Set power on/off
 */
export async function setPurifierPower(on: boolean): Promise<boolean> {
  if (!purifierConnection) {
    await connectPurifier();
  }
  if (!purifierConnection) return false;

  try {
    await purifierConnection.call('set_properties', [
      { siid: 2, piid: 1, value: on }
    ]);
    console.log(`Air Purifier: Power ${on ? 'on' : 'off'}`);
    return true;
  } catch (error: any) {
    console.error('Failed to set purifier power:', error.message);
    return false;
  }
}

/**
 * Set mode (auto, silent, favorite)
 */
export async function setPurifierMode(mode: 'auto' | 'silent' | 'favorite'): Promise<boolean> {
  if (!purifierConnection) {
    await connectPurifier();
  }
  if (!purifierConnection) return false;

  const modeValue = MODE_TO_VALUE[mode];
  if (modeValue === undefined) return false;

  try {
    await purifierConnection.call('set_properties', [
      { siid: 2, piid: 4, value: modeValue }
    ]);
    console.log(`Air Purifier: Mode set to ${mode}`);
    return true;
  } catch (error: any) {
    console.error('Failed to set purifier mode:', error.message);
    return false;
  }
}

/**
 * Set fan speed via favorite_rpm (siid=9, piid=3) for mb4 model
 * Accepts RPM value directly (range: 300-2200)
 */
export async function setPurifierFanSpeed(rpm: number): Promise<boolean> {
  if (!purifierConnection) {
    await connectPurifier();
  }
  if (!purifierConnection) return false;

  // Clamp to valid range
  const clampedRpm = Math.max(300, Math.min(2200, Math.round(rpm)));

  try {
    await purifierConnection.call('set_properties', [
      { siid: 9, piid: 3, value: clampedRpm }
    ]);
    console.log(`Air Purifier: Fan speed set to ${clampedRpm} RPM`);
    return true;
  } catch (error: any) {
    console.error('Failed to set purifier fan speed:', error.message);
    return false;
  }
}

/**
 * Set LED brightness (bright, dim, off)
 */
export async function setLedBrightness(level: 'bright' | 'dim' | 'off'): Promise<boolean> {
  if (!purifierConnection) {
    await connectPurifier();
  }
  if (!purifierConnection) return false;

  const ledValue = LED_TO_VALUE[level];
  if (ledValue === undefined) return false;

  try {
    await purifierConnection.call('set_properties', [
      { siid: 6, piid: 1, value: ledValue }
    ]);
    console.log(`Air Purifier: LED brightness set to ${level}`);
    return true;
  } catch (error: any) {
    console.error('Failed to set LED brightness:', error.message);
    return false;
  }
}

/**
 * Disconnect purifier
 */
export function disconnectPurifier(): void {
  if (purifierConnection) {
    purifierConnection.destroy();
    purifierConnection = null;
    console.log('Disconnected from Air Purifier');
  }
}
