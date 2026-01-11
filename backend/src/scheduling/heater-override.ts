/**
 * Heater override (vacation/pause mode)
 * Singleton table - only one row with id=1
 */

import { getDb } from '../db/database';

export interface HeaterOverride {
  id: number;
  enabled: boolean;
  mode: 'pause' | 'fixed';
  fixed_temp: number;
  updated_at: string;
}

interface DbHeaterOverride {
  id: number;
  enabled: number;
  mode: string;
  fixed_temp: number;
  updated_at: string;
}

function mapDbToOverride(row: DbHeaterOverride): HeaterOverride {
  return {
    id: row.id,
    enabled: row.enabled === 1,
    mode: row.mode as 'pause' | 'fixed',
    fixed_temp: row.fixed_temp,
    updated_at: row.updated_at,
  };
}

export function getHeaterOverride(): HeaterOverride {
  const db = getDb();
  const row = db.query('SELECT * FROM heater_override WHERE id = 1').get() as DbHeaterOverride;
  return mapDbToOverride(row);
}

export function setHeaterOverride(
  enabled: boolean,
  mode: 'pause' | 'fixed',
  fixed_temp: number = 18
): HeaterOverride {
  const db = getDb();
  db.run(
    `UPDATE heater_override
     SET enabled = ?, mode = ?, fixed_temp = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = 1`,
    [enabled ? 1 : 0, mode, fixed_temp]
  );
  return getHeaterOverride();
}

export function isOverrideActive(): boolean {
  return getHeaterOverride().enabled;
}
