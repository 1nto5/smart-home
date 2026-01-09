/**
 * Yamaha Soundbar control module
 * High-level API for YAS-306 and similar MusicCast soundbars
 */

import { getDb } from '../db/database';
import { YamahaClient } from './yamaha-client';
import type { YamahaDevice, YamahaSoundbarStatus } from './yamaha-types';

// Connection cache
const clients = new Map<string, YamahaClient>();

/**
 * Get Yamaha device from database
 */
function getDevice(deviceId: string): YamahaDevice | null {
  const db = getDb();
  return db.query('SELECT * FROM yamaha_devices WHERE id = ?').get(deviceId) as YamahaDevice | null;
}

/**
 * Get or create client for device
 */
function getClient(deviceId: string): YamahaClient | null {
  let client = clients.get(deviceId);
  if (client) return client;

  const device = getDevice(deviceId);
  if (!device?.ip) {
    console.error(`Yamaha device ${deviceId} not found or missing IP`);
    return null;
  }

  client = new YamahaClient(device.ip);
  clients.set(deviceId, client);
  return client;
}

/**
 * Update device status in database
 */
function updateDeviceStatus(deviceId: string, status: YamahaSoundbarStatus, online = true): void {
  const db = getDb();
  db.run(
    'UPDATE yamaha_devices SET last_status = ?, online = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [JSON.stringify(status), online ? 1 : 0, deviceId]
  );
}

/**
 * Get soundbar status
 */
export async function getSoundbarStatus(deviceId: string): Promise<YamahaSoundbarStatus | null> {
  const client = getClient(deviceId);
  if (!client) return null;

  const raw = await client.getStatus();
  if (!raw) {
    updateDeviceStatus(deviceId, {} as YamahaSoundbarStatus, false);
    return null;
  }

  const status: YamahaSoundbarStatus = {
    power: raw.power,
    volume: raw.volume,
    mute: raw.mute,
    input: raw.input,
    sound_program: raw.sound_program || 'stereo',
    clear_voice: raw.clear_voice,
    bass_extension: raw.bass_extension,
    subwoofer_volume: raw.subwoofer_volume,
  };

  updateDeviceStatus(deviceId, status, true);
  return status;
}

/**
 * Set soundbar power
 */
export async function setSoundbarPower(deviceId: string, on: boolean): Promise<boolean> {
  const client = getClient(deviceId);
  if (!client) return false;

  const result = on ? await client.powerOn() : await client.powerOff();
  if (result) {
    console.log(`Yamaha ${deviceId} power: ${on ? 'on' : 'standby'}`);
  }
  return result;
}

/**
 * Set soundbar volume (0-100)
 */
export async function setSoundbarVolume(deviceId: string, volume: number): Promise<boolean> {
  const client = getClient(deviceId);
  if (!client) return false;

  const result = await client.setVolume(volume);
  if (result) {
    console.log(`Yamaha ${deviceId} volume: ${volume}`);
  }
  return result;
}

/**
 * Set soundbar mute
 */
export async function setSoundbarMute(deviceId: string, mute: boolean): Promise<boolean> {
  const client = getClient(deviceId);
  if (!client) return false;

  const result = await client.setMute(mute);
  if (result) {
    console.log(`Yamaha ${deviceId} mute: ${mute}`);
  }
  return result;
}

/**
 * Set soundbar input
 */
export async function setSoundbarInput(deviceId: string, input: string): Promise<boolean> {
  const client = getClient(deviceId);
  if (!client) return false;

  const result = await client.setInput(input);
  if (result) {
    console.log(`Yamaha ${deviceId} input: ${input}`);
  }
  return result;
}

/**
 * Set soundbar sound program
 */
export async function setSoundbarSoundProgram(deviceId: string, program: string): Promise<boolean> {
  const client = getClient(deviceId);
  if (!client) return false;

  const result = await client.setSoundProgram(program);
  if (result) {
    console.log(`Yamaha ${deviceId} sound program: ${program}`);
  }
  return result;
}

/**
 * Set clear voice mode
 */
export async function setSoundbarClearVoice(deviceId: string, enable: boolean): Promise<boolean> {
  const client = getClient(deviceId);
  if (!client) return false;

  const result = await client.setClearVoice(enable);
  if (result) {
    console.log(`Yamaha ${deviceId} clear voice: ${enable}`);
  }
  return result;
}

/**
 * Set bass extension mode
 */
export async function setSoundbarBassExtension(deviceId: string, enable: boolean): Promise<boolean> {
  const client = getClient(deviceId);
  if (!client) return false;

  const result = await client.setBassExtension(enable);
  if (result) {
    console.log(`Yamaha ${deviceId} bass extension: ${enable}`);
  }
  return result;
}

/**
 * Set subwoofer volume (-6 to +6)
 */
export async function setSoundbarSubwooferVolume(deviceId: string, volume: number): Promise<boolean> {
  const client = getClient(deviceId);
  if (!client) return false;

  const result = await client.setSubwooferVolume(volume);
  if (result) {
    console.log(`Yamaha ${deviceId} subwoofer volume: ${volume}`);
  }
  return result;
}

/**
 * Get device info (model, firmware, etc.)
 */
export async function getSoundbarInfo(deviceId: string) {
  const client = getClient(deviceId);
  if (!client) return null;

  return client.getDeviceInfo();
}

/**
 * Clear client cache for device (force reconnect)
 */
export function clearClientCache(deviceId: string): void {
  clients.delete(deviceId);
}

/**
 * Clear all client caches
 */
export function clearAllClientCaches(): void {
  clients.clear();
}
