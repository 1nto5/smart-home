/**
 * Heater Schedule Service
 * Manages heater schedules and applies presets to TRVs
 */

import { getDb } from '../db/database';
import { getHeaterPreset, isValidHeaterPreset, type HeaterPreset } from './heater-presets';
import { createPendingHeaterAction } from './heater-pending-service';
import { sendDeviceCommand, getDeviceStatus } from '../tuya/tuya-local';

export interface HeaterSchedule {
  id: number;
  name: string;
  preset_id: string;
  time: string; // HH:MM format
  enabled: number;
  created_at: string;
  updated_at: string;
}

export interface ApplyResult {
  success: string[];
  pending: string[];
  failed: string[];
}

// TRV DPS mapping
const TRV_DPS = {
  TARGET_TEMP: 4,
  TEMP_SCALE: 10, // multiply by 10 when sending (21°C = 210)
};

/**
 * Get all heater schedules
 */
export function getHeaterSchedules(): HeaterSchedule[] {
  const db = getDb();
  return db.query('SELECT * FROM heater_schedules ORDER BY time').all() as HeaterSchedule[];
}

/**
 * Get schedules for a specific time (HH:MM)
 */
export function getHeaterSchedulesByTime(time: string): HeaterSchedule[] {
  const db = getDb();
  return db.query('SELECT * FROM heater_schedules WHERE time = ? AND enabled = 1').all(time) as HeaterSchedule[];
}

/**
 * Create a new heater schedule
 */
export function createHeaterSchedule(name: string, preset_id: string, time: string): HeaterSchedule {
  const db = getDb();

  if (!isValidHeaterPreset(preset_id)) {
    throw new Error(`Invalid preset: ${preset_id}`);
  }

  // Validate time format (HH:MM)
  if (!/^\d{2}:\d{2}$/.test(time)) {
    throw new Error('Time must be in HH:MM format');
  }

  db.run(
    'INSERT INTO heater_schedules (name, preset_id, time) VALUES (?, ?, ?)',
    [name, preset_id, time]
  );

  const lastId = db.query('SELECT last_insert_rowid() as id').get() as { id: number };
  return db.query('SELECT * FROM heater_schedules WHERE id = ?').get(lastId.id) as HeaterSchedule;
}

/**
 * Delete a heater schedule
 */
export function deleteHeaterSchedule(id: number): boolean {
  const db = getDb();
  const result = db.run('DELETE FROM heater_schedules WHERE id = ?', [id]);
  return result.changes > 0;
}

/**
 * Toggle schedule enabled state
 */
export function toggleHeaterSchedule(id: number): HeaterSchedule | null {
  const db = getDb();
  db.run('UPDATE heater_schedules SET enabled = NOT enabled, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
  return db.query('SELECT * FROM heater_schedules WHERE id = ?').get(id) as HeaterSchedule | null;
}

/**
 * Get all TRV device IDs
 */
function getAllTrvIds(): string[] {
  const db = getDb();
  const trvs = db.query("SELECT id FROM devices WHERE category = 'wkf'").all() as { id: string }[];
  return trvs.map((t) => t.id);
}

/**
 * Apply preset to a single TRV
 */
export async function applyPresetToHeater(deviceId: string, presetId: string): Promise<boolean> {
  const preset = getHeaterPreset(presetId);
  if (!preset) {
    console.error(`Invalid heater preset: ${presetId}`);
    return false;
  }

  try {
    // Check if TRV is reachable
    const status = await getDeviceStatus(deviceId);
    if (!status) {
      return false; // TRV is offline
    }

    // Set target temperature (multiply by 10 for DPS format)
    const tempValue = Math.round(preset.target_temp * TRV_DPS.TEMP_SCALE);
    const success = await sendDeviceCommand(deviceId, TRV_DPS.TARGET_TEMP, tempValue);

    if (success) {
      console.log(`Set ${deviceId} to ${preset.target_temp}°C (${preset.name})`);
    }

    return success;
  } catch (error: any) {
    console.error(`Failed to apply ${presetId} to TRV ${deviceId}:`, error.message);
    return false;
  }
}

/**
 * Apply preset to all TRVs (global schedule)
 * Returns results: which TRVs succeeded, which are pending (offline)
 */
export async function applyPresetToAllHeaters(
  presetId: string,
  scheduleId?: number
): Promise<ApplyResult> {
  const trvIds = getAllTrvIds();
  const result: ApplyResult = {
    success: [],
    pending: [],
    failed: [],
  };

  const preset = getHeaterPreset(presetId);
  if (!preset) {
    console.error(`Invalid heater preset: ${presetId}`);
    return result;
  }

  for (const trvId of trvIds) {
    const success = await applyPresetToHeater(trvId, presetId);

    if (success) {
      result.success.push(trvId);
    } else {
      // TRV offline - create pending action
      createPendingHeaterAction(trvId, presetId, scheduleId);
      result.pending.push(trvId);
    }
  }

  console.log(`Applied heater preset "${preset.name}": ${result.success.length} ok, ${result.pending.length} pending`);
  return result;
}
