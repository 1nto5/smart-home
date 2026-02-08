/**
 * Xiaomi Mi Air Purifier 3C control
 * Uses MiOT protocol (get_properties/set_properties)
 */

import miio, { type MiioDevice } from 'miio';
import { getDb } from '../db/database';
import { getErrorMessage } from '../utils/errors';
import { broadcastPurifierStatus } from '../ws/device-broadcast';
import { findAndUpdateDeviceIp } from './xiaomi-discover';

interface MiioProperty {
  siid: number;
  piid: number;
  code: number;
  value: unknown;
}

let purifierConnection: MiioDevice | null = null;
const MIIO_TIMEOUT = 8000; // 8 second timeout for MiOT calls

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label}: timeout after ${ms}ms`));
    }, ms);
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); },
    );
  });
}

interface PurifierStatus {
  power: boolean;
  mode: string;
  aqi: number;
  filter_life: number;
  fan_speed?: number;
  led_brightness?: number; // 0-8 (0=off, 8=brightest)
}

// Module-level cached status for instant API responses
let cachedPurifierStatus: PurifierStatus | null = null;

export function getCachedPurifierStatus(): PurifierStatus | null {
  return cachedPurifierStatus;
}

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
  return db.query("SELECT id, ip, token FROM xiaomi_devices WHERE category = 'purifier'").get() as { id: string; ip: string; token: string } | null;
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
  } catch (error: unknown) {
    console.error('Failed to connect to Air Purifier:', getErrorMessage(error));
    // Trigger IP discovery async (don't wait)
    if (device?.id) {
      findAndUpdateDeviceIp(device.id).catch(() => {});
    }
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
    // siid 7 = screen/LED (mb4)
    // siid 9 = motor
    const result = await withTimeout(
      purifierConnection.call('get_properties', [
        { siid: 2, piid: 1 },  // power (bool)
        { siid: 2, piid: 4 },  // mode (0=auto, 1=silent, 2=favorite)
        { siid: 3, piid: 4 },  // pm2.5
        { siid: 4, piid: 3 },  // filter life % (piid 3 works for this device)
        { siid: 7, piid: 2 },  // LED brightness (0-8, 0=off, 8=brightest)
        { siid: 9, piid: 1 },  // motor_speed (current RPM)
        { siid: 9, piid: 3 },  // favorite_rpm (set RPM)
      ]),
      MIIO_TIMEOUT,
      'getPurifierStatus',
    ) as MiioProperty[];

    const getValue = (siid: number, piid: number) => {
      const prop = result.find((r: MiioProperty) => r.siid === siid && r.piid === piid);
      return prop?.code === 0 ? prop.value : undefined;
    };

    const modeValue = getValue(2, 4) as number | undefined;
    const favoriteRpm = getValue(9, 3) as number | undefined;
    const ledValue = getValue(7, 2) as number | undefined;

    const status: PurifierStatus = {
      power: (getValue(2, 1) as boolean | undefined) ?? false,
      mode: MODE_MAP[modeValue as number] ?? 'unknown',
      aqi: (getValue(3, 4) as number | undefined) ?? 0,
      filter_life: (getValue(4, 3) as number | undefined) ?? 0,
      fan_speed: favoriteRpm ?? 300,  // RPM value (300-2200)
      led_brightness: ledValue ?? 8,
    };
    cachedPurifierStatus = status;
    broadcastPurifierStatus(status);
    return status;
  } catch (error: unknown) {
    console.error('Failed to get purifier status:', getErrorMessage(error));
    // Disconnect stale connection so next call reconnects
    purifierConnection?.destroy();
    purifierConnection = null;
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
    await withTimeout(
      purifierConnection.call('set_properties', [{ siid: 2, piid: 1, value: on }]),
      MIIO_TIMEOUT, 'setPurifierPower',
    );
    console.log(`Air Purifier: Power ${on ? 'on' : 'off'}`);
    return true;
  } catch (error: unknown) {
    console.error('Failed to set purifier power:', getErrorMessage(error));
    purifierConnection?.destroy();
    purifierConnection = null;
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
    await withTimeout(
      purifierConnection.call('set_properties', [{ siid: 2, piid: 4, value: modeValue }]),
      MIIO_TIMEOUT, 'setPurifierMode',
    );
    console.log(`Air Purifier: Mode set to ${mode}`);
    return true;
  } catch (error: unknown) {
    console.error('Failed to set purifier mode:', getErrorMessage(error));
    purifierConnection?.destroy();
    purifierConnection = null;
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
    await withTimeout(
      purifierConnection.call('set_properties', [{ siid: 9, piid: 3, value: clampedRpm }]),
      MIIO_TIMEOUT, 'setPurifierFanSpeed',
    );
    console.log(`Air Purifier: Fan speed set to ${clampedRpm} RPM`);
    return true;
  } catch (error: unknown) {
    console.error('Failed to set purifier fan speed:', getErrorMessage(error));
    purifierConnection?.destroy();
    purifierConnection = null;
    return false;
  }
}

/**
 * Set LED brightness (0-8, 0=off, 8=brightest)
 */
export async function setLedBrightness(level: number): Promise<boolean> {
  if (!purifierConnection) {
    await connectPurifier();
  }
  if (!purifierConnection) return false;

  const clamped = Math.max(0, Math.min(8, Math.round(level)));

  try {
    await withTimeout(
      purifierConnection.call('set_properties', [{ siid: 7, piid: 2, value: clamped }]),
      MIIO_TIMEOUT, 'setLedBrightness',
    );
    console.log(`Air Purifier: LED brightness set to ${clamped}`);
    return true;
  } catch (error: unknown) {
    console.error('Failed to set LED brightness:', getErrorMessage(error));
    purifierConnection?.destroy();
    purifierConnection = null;
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
