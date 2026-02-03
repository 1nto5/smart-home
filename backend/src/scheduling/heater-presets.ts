/**
 * Heater presets - configurable via database
 */

import { getDb } from '../db/database';

export interface HeaterPreset {
  id: string;
  name: string;
  target_temp: number;
  created_at?: string;
  updated_at?: string;
}

export interface HeaterPresetDevice {
  preset_id: string;
  device_id: string;
  target_temp: number;
}

export function getHeaterPresets(): HeaterPreset[] {
  const db = getDb();
  return db.query('SELECT * FROM heater_presets ORDER BY target_temp DESC').all() as HeaterPreset[];
}

export function getHeaterPreset(id: string): HeaterPreset | null {
  const db = getDb();
  return db.query('SELECT * FROM heater_presets WHERE id = ?').get(id) as HeaterPreset | null;
}

export function updateHeaterPreset(id: string, target_temp: number, name?: string): boolean {
  const db = getDb();
  if (name !== undefined) {
    const result = db.run(
      'UPDATE heater_presets SET target_temp = ?, name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [target_temp, name, id]
    );
    return result.changes > 0;
  }
  const result = db.run(
    'UPDATE heater_presets SET target_temp = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [target_temp, id]
  );
  return result.changes > 0;
}

export function isValidHeaterPreset(id: string): boolean {
  return getHeaterPreset(id) !== null;
}

export function createHeaterPreset(id: string, name: string, target_temp: number): HeaterPreset {
  const db = getDb();

  // Validate id (alphanumeric, lowercase, dashes allowed)
  if (!/^[a-z0-9-]+$/.test(id)) {
    throw new Error('Invalid preset id: use lowercase letters, numbers, and dashes only');
  }

  // Check if already exists
  if (getHeaterPreset(id)) {
    throw new Error(`Preset with id "${id}" already exists`);
  }

  // Validate temperature range
  if (target_temp < 5 || target_temp > 30) {
    throw new Error('Temperature must be between 5 and 30');
  }

  db.run(
    'INSERT INTO heater_presets (id, name, target_temp) VALUES (?, ?, ?)',
    [id, name, target_temp]
  );

  return getHeaterPreset(id)!;
}

export function deleteHeaterPreset(id: string): boolean {
  const db = getDb();

  // Check if preset exists
  if (!getHeaterPreset(id)) {
    return false;
  }

  // Delete any schedules using this preset first
  db.run('DELETE FROM heater_schedules WHERE preset_id = ?', [id]);

  // Delete per-device temps (CASCADE should handle this, but be explicit)
  db.run('DELETE FROM heater_preset_devices WHERE preset_id = ?', [id]);

  // Delete the preset
  const result = db.run('DELETE FROM heater_presets WHERE id = ?', [id]);
  return result.changes > 0;
}

// Per-device temperature overrides

export function getPresetDeviceTemps(presetId: string): HeaterPresetDevice[] {
  const db = getDb();
  return db.query(
    'SELECT * FROM heater_preset_devices WHERE preset_id = ?'
  ).all(presetId) as HeaterPresetDevice[];
}

export function setPresetDeviceTemp(presetId: string, deviceId: string, targetTemp: number): HeaterPresetDevice {
  const db = getDb();

  // Validate temperature range
  if (targetTemp < 5 || targetTemp > 30) {
    throw new Error('Temperature must be between 5 and 30');
  }

  // Upsert: insert or replace
  db.run(
    'INSERT OR REPLACE INTO heater_preset_devices (preset_id, device_id, target_temp) VALUES (?, ?, ?)',
    [presetId, deviceId, targetTemp]
  );

  return { preset_id: presetId, device_id: deviceId, target_temp: targetTemp };
}

export function deletePresetDeviceTemp(presetId: string, deviceId: string): boolean {
  const db = getDb();
  const result = db.run(
    'DELETE FROM heater_preset_devices WHERE preset_id = ? AND device_id = ?',
    [presetId, deviceId]
  );
  return result.changes > 0;
}

export function getEffectiveTemp(presetId: string, deviceId: string): number {
  const db = getDb();

  // First check for device-specific temp
  const deviceTemp = db.query(
    'SELECT target_temp FROM heater_preset_devices WHERE preset_id = ? AND device_id = ?'
  ).get(presetId, deviceId) as { target_temp: number } | null;

  if (deviceTemp) {
    return deviceTemp.target_temp;
  }

  // Fall back to preset default temp
  const preset = getHeaterPreset(presetId);
  return preset?.target_temp ?? 18;
}
