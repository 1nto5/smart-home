/**
 * Lamp presets - configurable via database
 */

import { getDb } from '../db/database';

export interface LampPreset {
  id: string;
  name: string;
  brightness: number;
  color_temp: number;
  power: boolean;
  created_at?: string;
  updated_at?: string;
}

interface LampPresetRow {
  id: string;
  name: string;
  brightness: number;
  color_temp: number;
  power: number;
  created_at?: string;
  updated_at?: string;
}

function rowToPreset(row: LampPresetRow): LampPreset {
  return {
    ...row,
    power: row.power === 1,
  };
}

export function getLampPresets(): LampPreset[] {
  const db = getDb();
  const rows = db.query('SELECT * FROM lamp_presets ORDER BY name').all() as LampPresetRow[];
  return rows.map(rowToPreset);
}

export function getLampPreset(id: string): LampPreset | null {
  const db = getDb();
  const row = db.query('SELECT * FROM lamp_presets WHERE id = ?').get(id) as LampPresetRow | null;
  return row ? rowToPreset(row) : null;
}

export function updateLampPreset(
  id: string,
  brightness: number,
  color_temp: number,
  power: boolean
): boolean {
  const db = getDb();
  const result = db.run(
    'UPDATE lamp_presets SET brightness = ?, color_temp = ?, power = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [brightness, color_temp, power ? 1 : 0, id]
  );
  return result.changes > 0;
}

export function isValidPreset(id: string): boolean {
  return getLampPreset(id) !== null;
}

export function createLampPreset(
  id: string,
  name: string,
  brightness: number,
  color_temp: number,
  power: boolean
): LampPreset {
  const db = getDb();

  // Validate id (alphanumeric, lowercase, dashes allowed)
  if (!/^[a-z0-9-]+$/.test(id)) {
    throw new Error('Invalid preset id: use lowercase letters, numbers, and dashes only');
  }

  // Check if already exists
  if (getLampPreset(id)) {
    throw new Error(`Preset with id "${id}" already exists`);
  }

  // Validate brightness range
  if (brightness < 0 || brightness > 100) {
    throw new Error('Brightness must be between 0 and 100');
  }

  // Validate color temp range
  if (color_temp < 2700 || color_temp > 6500) {
    throw new Error('Color temperature must be between 2700K and 6500K');
  }

  db.run(
    'INSERT INTO lamp_presets (id, name, brightness, color_temp, power) VALUES (?, ?, ?, ?, ?)',
    [id, name, brightness, color_temp, power ? 1 : 0]
  );

  return getLampPreset(id)!;
}

export function deleteLampPreset(id: string): boolean {
  const db = getDb();

  // Check if preset exists
  if (!getLampPreset(id)) {
    return false;
  }

  // Delete any schedules using this preset first
  db.run('DELETE FROM lamp_schedules WHERE preset = ?', [id]);

  // Delete pending actions using this preset
  db.run('DELETE FROM pending_lamp_actions WHERE preset = ?', [id]);

  // Delete the preset
  const result = db.run('DELETE FROM lamp_presets WHERE id = ?', [id]);
  return result.changes > 0;
}

// Legacy export for compatibility with existing code
export type PresetName = string;

// For backward compatibility with schedule-service.ts
export const LAMP_PRESETS: Record<string, { name: string; brightness: number; colorTemp: number; power: boolean; moonlight: boolean }> = {};

// Initialize LAMP_PRESETS from database (call after db init)
export function refreshLampPresetsCache(): void {
  const presets = getLampPresets();
  // Clear existing
  for (const key of Object.keys(LAMP_PRESETS)) {
    delete LAMP_PRESETS[key];
  }
  // Populate from DB
  for (const p of presets) {
    LAMP_PRESETS[p.id] = {
      name: p.name,
      brightness: p.brightness,
      colorTemp: p.color_temp,
      power: p.power,
      moonlight: p.id === 'moonlight', // moonlight mode detection
    };
  }
}
