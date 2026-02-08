/**
 * Yeelight LAN control (no token required)
 * Uses TCP port 55443 with JSON commands
 * Requires "LAN Control" enabled in Yeelight app
 */

import net from 'net';
import { getDb } from '../db/database';
import { getErrorMessage } from '../utils/errors';

const YEELIGHT_PORT = 55443;
const COMMAND_TIMEOUT = 5000;

interface YeelightDevice {
  id: string;
  name: string;
  ip: string;
  model: string;
  category: string;
}

export interface LampStatus {
  power: boolean;
  brightness: number;
  color_temp: number;
  color_mode: number;
  rgb: number;
  moonlight_mode: boolean;
  moonlight_brightness: number;
}

type YeelightParam = string | number;

// Track last status for each device
const lastStatuses = new Map<string, LampStatus>();
// Track failed attempts for cooldown
const failedAttempts = new Map<string, number>();
const RETRY_COOLDOWN = 30_000;

/**
 * Get device from database
 */
function getDevice(deviceId: string): YeelightDevice | null {
  const db = getDb();
  return db.query('SELECT id, name, ip, model, category FROM xiaomi_devices WHERE id = ?').get(deviceId) as YeelightDevice | null;
}

/**
 * Send command to Yeelight lamp via TCP
 */
async function sendCommand(ip: string, method: string, params: YeelightParam[] = []): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    socket.setTimeout(COMMAND_TIMEOUT);

    const cmd = JSON.stringify({
      id: Date.now(),
      method,
      params,
    }) + '\r\n';

    let responseData = '';

    socket.connect(YEELIGHT_PORT, ip, () => {
      socket.write(cmd);
    });

    socket.on('data', (data) => {
      responseData += data.toString();
      // Yeelight sends responses line by line
      if (responseData.includes('\r\n')) {
        const lines = responseData.split('\r\n').filter(l => l.trim());
        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            // Check for result (success) or error
            if (json.result !== undefined || json.error !== undefined) {
              socket.destroy();
              if (json.error) {
                reject(new Error(json.error.message || 'Command failed'));
              } else {
                resolve(json.result);
              }
              return;
            }
            // Props notification (from toggle, etc)
            if (json.method === 'props') {
              socket.destroy();
              resolve(json.params);
              return;
            }
          } catch {
            // Not valid JSON, continue reading
          }
        }
      }
    });

    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error('Connection timeout'));
    });

    socket.on('error', (err) => {
      socket.destroy();
      reject(err);
    });

    socket.on('close', () => {
      // If we haven't resolved yet, reject
      if (responseData === '') {
        reject(new Error('Connection closed without response'));
      }
    });
  });
}

/**
 * Invalidate connection for device (call after IP change)
 */
export function invalidateConnection(deviceId: string): void {
  lastStatuses.delete(deviceId);
  failedAttempts.delete(deviceId);
}

/**
 * Check if device is in cooldown
 */
function isInCooldown(deviceId: string): boolean {
  const lastFail = failedAttempts.get(deviceId);
  if (lastFail && Date.now() - lastFail < RETRY_COOLDOWN) {
    return true;
  }
  return false;
}

/**
 * Get lamp status
 */
export async function getLampStatus(deviceId: string): Promise<LampStatus | null> {
  if (isInCooldown(deviceId)) {
    return lastStatuses.get(deviceId) || null;
  }

  const device = getDevice(deviceId);
  if (!device?.ip) {
    console.error(`Device ${deviceId} not found or missing IP`);
    return null;
  }

  try {
    const props = await sendCommand(device.ip, 'get_prop', [
      'power', 'bright', 'ct', 'color_mode', 'rgb', 'active_mode', 'nl_br'
    ]) as string[];

    const status: LampStatus = {
      power: props[0] === 'on',
      brightness: parseInt(props[1] ?? '') || 0,
      color_temp: parseInt(props[2] ?? '') || 0,
      color_mode: parseInt(props[3] ?? '') || 0,
      rgb: parseInt(props[4] ?? '') || 0,
      moonlight_mode: props[5] === '1',
      moonlight_brightness: parseInt(props[6] ?? '') || 0,
    };

    lastStatuses.set(deviceId, status);
    failedAttempts.delete(deviceId);
    return status;
  } catch (error: unknown) {
    console.error(`Failed to get status for ${device.name}:`, getErrorMessage(error));
    failedAttempts.set(deviceId, Date.now());
    return lastStatuses.get(deviceId) || null;
  }
}

/**
 * Set lamp power
 */
export async function setLampPower(deviceId: string, on: boolean): Promise<boolean> {
  if (isInCooldown(deviceId)) return false;

  const device = getDevice(deviceId);
  if (!device?.ip) return false;

  try {
    await sendCommand(device.ip, 'set_power', [on ? 'on' : 'off', 'smooth', 500]);
    console.log(`Set ${device.name} power: ${on}`);
    failedAttempts.delete(deviceId);
    return true;
  } catch (error: unknown) {
    console.error(`Failed to set power for ${device.name}:`, getErrorMessage(error));
    failedAttempts.set(deviceId, Date.now());
    return false;
  }
}

/**
 * Toggle lamp power
 */
export async function toggleLamp(deviceId: string): Promise<boolean> {
  if (isInCooldown(deviceId)) return false;

  const device = getDevice(deviceId);
  if (!device?.ip) return false;

  try {
    await sendCommand(device.ip, 'toggle', []);
    console.log(`Toggled ${device.name}`);
    failedAttempts.delete(deviceId);
    return true;
  } catch (error: unknown) {
    console.error(`Failed to toggle ${device.name}:`, getErrorMessage(error));
    failedAttempts.set(deviceId, Date.now());
    return false;
  }
}

/**
 * Set lamp brightness (1-100)
 */
export async function setLampBrightness(deviceId: string, brightness: number): Promise<boolean> {
  if (isInCooldown(deviceId)) return false;

  const device = getDevice(deviceId);
  if (!device?.ip) return false;

  const level = Math.max(1, Math.min(100, brightness));

  try {
    await sendCommand(device.ip, 'set_bright', [level, 'smooth', 500]);
    console.log(`Set ${device.name} brightness: ${level}%`);
    failedAttempts.delete(deviceId);
    return true;
  } catch (error: unknown) {
    console.error(`Failed to set brightness for ${device.name}:`, getErrorMessage(error));
    failedAttempts.set(deviceId, Date.now());
    return false;
  }
}

/**
 * Set lamp color temperature (1700-6500K)
 */
export async function setLampColorTemp(deviceId: string, kelvin: number): Promise<boolean> {
  if (isInCooldown(deviceId)) return false;

  const device = getDevice(deviceId);
  if (!device?.ip) return false;

  try {
    await sendCommand(device.ip, 'set_ct_abx', [kelvin, 'smooth', 500]);
    console.log(`Set ${device.name} color temp: ${kelvin}K`);
    failedAttempts.delete(deviceId);
    return true;
  } catch (error: unknown) {
    console.error(`Failed to set color temp for ${device.name}:`, getErrorMessage(error));
    failedAttempts.set(deviceId, Date.now());
    return false;
  }
}

/**
 * Set lamp RGB color
 */
export async function setLampColor(deviceId: string, r: number, g: number, b: number): Promise<boolean> {
  if (isInCooldown(deviceId)) return false;

  const device = getDevice(deviceId);
  if (!device?.ip) return false;

  const rgb = (r << 16) | (g << 8) | b;

  try {
    await sendCommand(device.ip, 'set_rgb', [rgb, 'smooth', 500]);
    console.log(`Set ${device.name} color: rgb(${r},${g},${b})`);
    failedAttempts.delete(deviceId);
    return true;
  } catch (error: unknown) {
    console.error(`Failed to set color for ${device.name}:`, getErrorMessage(error));
    failedAttempts.set(deviceId, Date.now());
    return false;
  }
}

/**
 * Enable moonlight mode (ceiling lights)
 */
export async function setLampMoonlight(deviceId: string, brightness?: number): Promise<boolean> {
  if (isInCooldown(deviceId)) return false;

  const device = getDevice(deviceId);
  if (!device?.ip) return false;

  try {
    // Mode 5 = moonlight/night mode
    await sendCommand(device.ip, 'set_power', ['on', 'smooth', 500, 5]);

    if (brightness !== undefined) {
      const level = Math.max(1, Math.min(100, brightness));
      await sendCommand(device.ip, 'set_scene', ['nightlight', level]);
    }

    console.log(`Set ${device.name} to moonlight mode${brightness !== undefined ? ` (${brightness}%)` : ''}`);
    failedAttempts.delete(deviceId);
    return true;
  } catch (error: unknown) {
    console.error(`Failed to set moonlight for ${device.name}:`, getErrorMessage(error));
    failedAttempts.set(deviceId, Date.now());
    return false;
  }
}

/**
 * Enable daylight mode (ceiling lights)
 */
export async function setLampDaylightMode(deviceId: string): Promise<boolean> {
  if (isInCooldown(deviceId)) return false;

  const device = getDevice(deviceId);
  if (!device?.ip) return false;

  try {
    // Mode 1 = daylight/normal mode
    await sendCommand(device.ip, 'set_power', ['on', 'smooth', 500, 1]);
    console.log(`Set ${device.name} to daylight mode`);
    failedAttempts.delete(deviceId);
    return true;
  } catch (error: unknown) {
    console.error(`Failed to set daylight for ${device.name}:`, getErrorMessage(error));
    failedAttempts.set(deviceId, Date.now());
    return false;
  }
}

/**
 * Disconnect lamp (no-op for stateless TCP)
 */
export function disconnectLamp(_deviceId: string): void {
  // Yeelight LAN is stateless, no persistent connection
}

/**
 * Disconnect all lamps (no-op for stateless TCP)
 */
export function disconnectAllLamps(): void {
  // Yeelight LAN is stateless, no persistent connections
}

// Legacy compatibility - not used with Yeelight LAN
export async function connectLamp(_deviceId: string): Promise<null> {
  return null;
}
