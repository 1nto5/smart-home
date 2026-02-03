/**
 * Heater Schedule Service
 * Manages heater schedules and applies presets to TRVs
 */

import { getDb, setHeaterPreset } from '../db/database';
import { getHeaterPreset, isValidHeaterPreset, getEffectiveTemp, type HeaterPreset } from './heater-presets';
import { createPendingHeaterAction } from './heater-pending-service';
import { sendDeviceCommand, getDeviceStatus } from '../tuya/tuya-local';
import { broadcastTuyaStatus } from '../ws/device-broadcast';

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

// Result of applying temp to a single heater
type HeaterApplyResult = 'success' | 'offline' | 'failed';

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
 * Update heater schedule
 */
export function updateHeaterSchedule(
  id: number,
  updates: { name?: string; preset_id?: string; time?: string }
): HeaterSchedule | null {
  const db = getDb();

  if (updates.preset_id && !isValidHeaterPreset(updates.preset_id)) {
    throw new Error(`Invalid preset: ${updates.preset_id}`);
  }

  if (updates.time && !/^\d{2}:\d{2}$/.test(updates.time)) {
    throw new Error('Time must be in HH:MM format');
  }

  const fields: string[] = [];
  const values: (string | number)[] = [];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.preset_id !== undefined) {
    fields.push('preset_id = ?');
    values.push(updates.preset_id);
  }
  if (updates.time !== undefined) {
    fields.push('time = ?');
    values.push(updates.time);
  }

  if (fields.length === 0) {
    return db.query('SELECT * FROM heater_schedules WHERE id = ?').get(id) as HeaterSchedule | null;
  }

  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  db.run(`UPDATE heater_schedules SET ${fields.join(', ')} WHERE id = ?`, values);
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
 * Apply a specific temperature to a single TRV
 * Returns: 'success' | 'offline' | 'failed'
 *
 * Includes retry logic to handle cold-start scenarios where the gateway
 * connection may not be established yet on first attempts.
 */
export async function applyTempToHeater(deviceId: string, targetTemp: number): Promise<HeaterApplyResult> {
  const MAX_RETRIES = 2;
  const RETRY_DELAY_MS = 2000;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const status = await getDeviceStatus(deviceId);
      if (!status) {
        if (attempt < MAX_RETRIES) {
          await Bun.sleep(RETRY_DELAY_MS);
          continue;
        }
        return 'offline'; // TRV is offline after all retries
      }

      const tempValue = Math.round(targetTemp * TRV_DPS.TEMP_SCALE);
      const success = await sendDeviceCommand(deviceId, TRV_DPS.TARGET_TEMP, tempValue);

      if (success) {
        console.log(`Set ${deviceId} to ${targetTemp}°C`);
        broadcastTuyaStatus(deviceId, 'wkf', { targetTemp });
        return 'success';
      }

      if (attempt < MAX_RETRIES) {
        await Bun.sleep(RETRY_DELAY_MS);
        continue;
      }
      return 'failed'; // command failed after all retries
    } catch (error: any) {
      if (attempt < MAX_RETRIES) {
        await Bun.sleep(RETRY_DELAY_MS);
        continue;
      }
      console.error(`Failed to apply ${targetTemp}°C to TRV ${deviceId}:`, error.message);
      return 'failed';
    }
  }
  return 'failed';
}

/**
 * Apply preset to a single TRV (uses per-device temp if set, otherwise preset default)
 */
export async function applyPresetToHeater(deviceId: string, presetId: string): Promise<HeaterApplyResult> {
  const preset = getHeaterPreset(presetId);
  if (!preset) {
    console.error(`Invalid heater preset: ${presetId}`);
    return 'failed';
  }

  // Get effective temp for this device (may be per-device or preset default)
  const targetTemp = getEffectiveTemp(presetId, deviceId);
  return applyTempToHeater(deviceId, targetTemp);
}

/**
 * Apply fixed temperature to all TRVs (for override mode)
 */
export async function applyFixedTempToAllHeaters(targetTemp: number): Promise<ApplyResult> {
  const trvIds = getAllTrvIds();
  const result: ApplyResult = {
    success: [],
    pending: [],
    failed: [],
  };

  // Process all TRVs in parallel
  const results = await Promise.all(
    trvIds.map(async (trvId) => {
      const status = await applyTempToHeater(trvId, targetTemp);
      return { trvId, status };
    })
  );

  for (const { trvId, status } of results) {
    if (status === 'success') {
      result.success.push(trvId);
    } else if (status === 'offline') {
      result.pending.push(trvId);
    } else {
      result.failed.push(trvId);
    }
  }

  console.log(`Applied fixed temp ${targetTemp}°C: ${result.success.length} ok, ${result.pending.length} offline, ${result.failed.length} failed`);
  return result;
}

/**
 * Apply preset to all TRVs (global schedule)
 * Returns results: which TRVs succeeded, which are pending (offline), which failed
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

  // Process all TRVs in parallel
  const results = await Promise.all(
    trvIds.map(async (trvId) => {
      const status = await applyPresetToHeater(trvId, presetId);
      return { trvId, status };
    })
  );

  for (const { trvId, status } of results) {
    if (status === 'success') {
      result.success.push(trvId);
    } else if (status === 'offline') {
      // TRV offline - create pending action for retry
      createPendingHeaterAction(trvId, presetId, scheduleId);
      result.pending.push(trvId);
    } else {
      // Command failed (timeout/error)
      result.failed.push(trvId);
    }
  }

  // Track current heater preset
  setHeaterPreset(presetId);

  console.log(`Applied heater preset "${preset.name}": ${result.success.length} ok, ${result.pending.length} pending, ${result.failed.length} failed`);
  return result;
}
