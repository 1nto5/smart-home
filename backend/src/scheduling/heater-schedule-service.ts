/**
 * Heater Schedule Service
 * Manages heater schedules and applies presets to TRVs
 */

import { getDb, setHeaterPreset } from '../db/database';
import { getHeaterPreset, isValidHeaterPreset, getEffectiveTemp } from './heater-presets';
import { createPendingHeaterAction } from './heater-pending-service';
import { sendDeviceCommand, getDeviceStatus } from '../tuya/tuya-local';
import { broadcastTuyaStatus, broadcastPendingHeaterActions, broadcastHomeStatus } from '../ws/device-broadcast';
import { logger } from '../utils/logger';
import { withRetry } from '../utils/retry';

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
  SWITCH: 1, // power on/off (boolean)
  TARGET_TEMP: 4,
  TEMP_SCALE: 10, // multiply by 10 when sending (21°C = 210)
};

// Special preset IDs
const OFF_PRESET_ID = 'off';

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
 * Auto-wakes device if it's turned off (DPS 1 = false).
 */
export async function applyTempToHeater(deviceId: string, targetTemp: number): Promise<HeaterApplyResult> {
  try {
    return await withRetry(async () => {
      const status = await getDeviceStatus(deviceId);
      if (!status) throw Object.assign(new Error('offline'), { _offline: true });

      const effectiveDps = { ...status.dps };

      // Auto-wake: if device is off, turn it on first
      const switchState = status?.dps?.[TRV_DPS.SWITCH];
      if (switchState === false) {
        logger.debug('TRV is off, turning on first', { component: 'heater-schedule', deviceId });
        const wakeSuccess = await sendDeviceCommand(deviceId, TRV_DPS.SWITCH, true);
        if (wakeSuccess) {
          effectiveDps[TRV_DPS.SWITCH] = true;
          await Bun.sleep(500); // Give device time to wake up
        }
      }

      const tempValue = Math.round(targetTemp * TRV_DPS.TEMP_SCALE);
      const success = await sendDeviceCommand(deviceId, TRV_DPS.TARGET_TEMP, tempValue);
      if (!success) throw new Error('command failed');

      effectiveDps[TRV_DPS.TARGET_TEMP] = tempValue;

      // Persist to DB so the status survives page reloads
      const db = getDb();
      db.run('UPDATE devices SET last_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [JSON.stringify(effectiveDps), deviceId]);

      logger.debug('Set TRV temperature', { component: 'heater-schedule', deviceId, targetTemp });
      broadcastTuyaStatus(deviceId, 'wkf', effectiveDps);
      return 'success' as HeaterApplyResult;
    }, { label: 'Failed to apply temperature to TRV' });
  } catch (error: unknown) {
    return (error as { _offline?: boolean })._offline ? 'offline' : 'failed';
  }
}

/**
 * Turn off a TRV (send DPS 1 = false)
 * Returns: 'success' | 'offline' | 'failed'
 */
export async function turnOffHeater(deviceId: string): Promise<HeaterApplyResult> {
  try {
    return await withRetry(async () => {
      const status = await getDeviceStatus(deviceId);
      if (!status) throw Object.assign(new Error('offline'), { _offline: true });

      const success = await sendDeviceCommand(deviceId, TRV_DPS.SWITCH, false);
      if (!success) throw new Error('command failed');

      // Also set target to 5C (50) as safety belt in case SWITCH = false is ignored
      await sendDeviceCommand(deviceId, TRV_DPS.TARGET_TEMP, 50);

      const effectiveDps = { ...status.dps, [TRV_DPS.SWITCH]: false, [TRV_DPS.TARGET_TEMP]: 50 };

      // Persist to DB so the status survives page reloads
      const db = getDb();
      db.run('UPDATE devices SET last_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [JSON.stringify(effectiveDps), deviceId]);

      logger.debug('Turned off TRV', { component: 'heater-schedule', deviceId });
      broadcastTuyaStatus(deviceId, 'wkf', effectiveDps);
      return 'success' as HeaterApplyResult;
    }, { label: 'Failed to turn off TRV' });
  } catch (error: unknown) {
    return (error as { _offline?: boolean })._offline ? 'offline' : 'failed';
  }
}

/**
 * Apply preset to a single TRV (uses per-device temp if set, otherwise preset default)
 * Special handling for 'off' preset: turns off the TRV instead of setting temperature
 */
export async function applyPresetToHeater(deviceId: string, presetId: string): Promise<HeaterApplyResult> {
  // Special handling for "off" preset - turn off the device
  if (presetId === OFF_PRESET_ID) {
    return turnOffHeater(deviceId);
  }

  const preset = getHeaterPreset(presetId);
  if (!preset) {
    logger.error('Invalid heater preset', { component: 'heater-schedule', presetId });
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

  logger.info('Applied fixed temp to all heaters', { component: 'heater-schedule', targetTemp, successCount: result.success.length, offlineCount: result.pending.length, failedCount: result.failed.length });
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
    logger.error('Invalid heater preset', { component: 'heater-schedule', presetId });
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
      // Command failed (timeout/error) - also create pending action for retry
      // This handles Zigbee communication issues where device responds to status
      // queries but command confirmations timeout
      createPendingHeaterAction(trvId, presetId, scheduleId);
      result.failed.push(trvId);
    }
  }

  // Track current heater preset
  setHeaterPreset(presetId);

  // Broadcast updated state
  broadcastPendingHeaterActions();
  broadcastHomeStatus();

  logger.info('Applied heater preset to all', { component: 'heater-schedule', presetName: preset.name, successCount: result.success.length, pendingCount: result.pending.length, failedCount: result.failed.length });
  return result;
}
