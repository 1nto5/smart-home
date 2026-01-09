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

export function getHeaterPresets(): HeaterPreset[] {
  const db = getDb();
  return db.query('SELECT * FROM heater_presets ORDER BY target_temp DESC').all() as HeaterPreset[];
}

export function getHeaterPreset(id: string): HeaterPreset | null {
  const db = getDb();
  return db.query('SELECT * FROM heater_presets WHERE id = ?').get(id) as HeaterPreset | null;
}

export function updateHeaterPreset(id: string, target_temp: number): boolean {
  const db = getDb();
  const result = db.run(
    'UPDATE heater_presets SET target_temp = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [target_temp, id]
  );
  return result.changes > 0;
}

export function isValidHeaterPreset(id: string): boolean {
  return getHeaterPreset(id) !== null;
}
