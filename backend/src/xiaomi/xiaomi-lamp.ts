/**
 * Xiaomi Mi Smart LED Lamp control
 * Uses miio protocol for local WiFi control
 */

import miio from 'miio';
import { getDb } from '../db/database';

interface LampConnection {
  device: any;
  connected: boolean;
  lastStatus: Record<string, any>;
}

// Store active connections
const connections = new Map<string, LampConnection>();
// Track failed connection attempts to reduce retry spam
const failedAttempts = new Map<string, number>();
const RETRY_COOLDOWN = 60_000; // Wait 60s before retrying failed connection

interface XiaomiDevice {
  id: string;
  name: string;
  ip: string;
  token: string;
  model: string;
  category: string;
}

/**
 * Get Xiaomi device from database
 */
function getDevice(deviceId: string): XiaomiDevice | null {
  const db = getDb();
  return db.query('SELECT * FROM xiaomi_devices WHERE id = ?').get(deviceId) as XiaomiDevice | null;
}

/**
 * Connect to Xiaomi lamp
 */
export async function connectLamp(deviceId: string): Promise<LampConnection | null> {
  // Check existing connection
  const existing = connections.get(deviceId);
  if (existing?.connected) {
    return existing;
  }

  // Check if we recently failed to connect (cooldown)
  const lastFail = failedAttempts.get(deviceId);
  if (lastFail && Date.now() - lastFail < RETRY_COOLDOWN) {
    return null; // Skip retry, still in cooldown
  }

  const dbDevice = getDevice(deviceId);
  if (!dbDevice || !dbDevice.token || !dbDevice.ip) {
    console.error(`Device ${deviceId} not found or missing token/ip`);
    return null;
  }

  try {
    const device = await miio.device({
      address: dbDevice.ip,
      token: dbDevice.token,
    });

    const connection: LampConnection = {
      device,
      connected: true,
      lastStatus: {},
    };

    connections.set(deviceId, connection);
    failedAttempts.delete(deviceId); // Clear cooldown on success
    console.log(`Connected to ${dbDevice.name} (${deviceId})`);

    return connection;
  } catch (error: any) {
    failedAttempts.set(deviceId, Date.now()); // Set cooldown
    console.error(`Failed to connect to ${deviceId}:`, error.message);
    return null;
  }
}

/**
 * Get lamp status (using raw miio calls)
 */
export async function getLampStatus(deviceId: string): Promise<Record<string, any> | null> {
  let conn = connections.get(deviceId);
  if (!conn?.connected) {
    conn = await connectLamp(deviceId);
  }
  if (!conn) return null;

  try {
    // Yeelight uses get_prop with property names
    // Include active_mode (0=day, 1=moonlight) and nl_br (night light brightness) for ceiling lights
    const props = await conn.device.call('get_prop', ['power', 'bright', 'ct', 'color_mode', 'rgb', 'active_mode', 'nl_br']);

    const status = {
      power: props[0] === 'on',
      brightness: parseInt(props[1]) || 0,
      color_temp: parseInt(props[2]) || 0,
      color_mode: parseInt(props[3]) || 0, // 1=rgb, 2=ct, 3=hsv
      rgb: parseInt(props[4]) || 0,
      moonlight_mode: props[5] === '1' || props[5] === 1,
      moonlight_brightness: parseInt(props[6]) || 0,
    };

    conn.lastStatus = status;
    return status;
  } catch (error: any) {
    console.error(`Failed to get status for ${deviceId}:`, error.message);
    return conn.lastStatus || null;
  }
}

/**
 * Set lamp power
 */
export async function setLampPower(deviceId: string, on: boolean): Promise<boolean> {
  let conn = connections.get(deviceId);
  if (!conn?.connected) {
    conn = await connectLamp(deviceId);
  }
  if (!conn) return false;

  try {
    await conn.device.call('set_power', [on ? 'on' : 'off', 'smooth', 500]);
    console.log(`Set ${deviceId} power: ${on}`);
    return true;
  } catch (error: any) {
    console.error(`Failed to set power for ${deviceId}:`, error.message);
    return false;
  }
}

/**
 * Toggle lamp power
 */
export async function toggleLamp(deviceId: string): Promise<boolean> {
  let conn = connections.get(deviceId);
  if (!conn?.connected) {
    conn = await connectLamp(deviceId);
  }
  if (!conn) return false;

  try {
    await conn.device.call('toggle', []);
    console.log(`Toggled ${deviceId}`);
    return true;
  } catch (error: any) {
    console.error(`Failed to toggle ${deviceId}:`, error.message);
    return false;
  }
}

/**
 * Set lamp brightness (1-100)
 */
export async function setLampBrightness(deviceId: string, brightness: number): Promise<boolean> {
  let conn = connections.get(deviceId);
  if (!conn?.connected) {
    conn = await connectLamp(deviceId);
  }
  if (!conn) return false;

  try {
    const level = Math.max(1, Math.min(100, brightness));
    await conn.device.call('set_bright', [level, 'smooth', 500]);
    console.log(`Set ${deviceId} brightness: ${level}%`);
    return true;
  } catch (error: any) {
    console.error(`Failed to set brightness for ${deviceId}:`, error.message);
    return false;
  }
}

/**
 * Set lamp color temperature (1700-6500K typically)
 */
export async function setLampColorTemp(deviceId: string, kelvin: number): Promise<boolean> {
  let conn = connections.get(deviceId);
  if (!conn?.connected) {
    conn = await connectLamp(deviceId);
  }
  if (!conn) return false;

  try {
    await conn.device.call('set_ct_abx', [kelvin, 'smooth', 500]);
    console.log(`Set ${deviceId} color temp: ${kelvin}K`);
    return true;
  } catch (error: any) {
    console.error(`Failed to set color temp for ${deviceId}:`, error.message);
    return false;
  }
}

/**
 * Set lamp RGB color
 */
export async function setLampColor(deviceId: string, r: number, g: number, b: number): Promise<boolean> {
  let conn = connections.get(deviceId);
  if (!conn?.connected) {
    conn = await connectLamp(deviceId);
  }
  if (!conn) return false;

  try {
    if (conn.device.setColor) {
      await conn.device.setColor({ red: r, green: g, blue: b });
      console.log(`Set ${deviceId} color: rgb(${r},${g},${b})`);
      return true;
    }
    return false;
  } catch (error: any) {
    console.error(`Failed to set color for ${deviceId}:`, error.message);
    return false;
  }
}

/**
 * Enable moonlight (night light) mode - ceiling lights only
 * Mode 5 activates the hardware night light mode which reaches lower brightness
 */
export async function setLampMoonlight(deviceId: string, brightness?: number): Promise<boolean> {
  let conn = connections.get(deviceId);
  if (!conn?.connected) {
    conn = await connectLamp(deviceId);
  }
  if (!conn) return false;

  try {
    // set_power with mode=5 enables moonlight mode
    await conn.device.call('set_power', ['on', 'smooth', 500, 5]);
    console.log(`Set ${deviceId} to moonlight mode`);

    // Optionally set moonlight brightness using set_scene
    if (brightness !== undefined) {
      const level = Math.max(1, Math.min(100, brightness));
      await conn.device.call('set_scene', ['nightlight', level]);
      console.log(`Set ${deviceId} moonlight brightness: ${level}%`);
    }
    return true;
  } catch (error: any) {
    console.error(`Failed to set moonlight mode for ${deviceId}:`, error.message);
    return false;
  }
}

/**
 * Enable normal daylight mode - ceiling lights only
 * Mode 1 activates normal daylight mode
 */
export async function setLampDaylightMode(deviceId: string): Promise<boolean> {
  let conn = connections.get(deviceId);
  if (!conn?.connected) {
    conn = await connectLamp(deviceId);
  }
  if (!conn) return false;

  try {
    // set_power with mode=1 enables normal mode
    await conn.device.call('set_power', ['on', 'smooth', 500, 1]);
    console.log(`Set ${deviceId} to daylight mode`);
    return true;
  } catch (error: any) {
    console.error(`Failed to set daylight mode for ${deviceId}:`, error.message);
    return false;
  }
}

/**
 * Disconnect lamp
 */
export function disconnectLamp(deviceId: string): void {
  const conn = connections.get(deviceId);
  if (conn) {
    conn.device.destroy();
    connections.delete(deviceId);
    console.log(`Disconnected from ${deviceId}`);
  }
}

/**
 * Disconnect all lamps
 */
export function disconnectAllLamps(): void {
  for (const [id] of connections) {
    disconnectLamp(id);
  }
}
