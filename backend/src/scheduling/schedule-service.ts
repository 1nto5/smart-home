/**
 * Schedule service
 * Manages lamp schedules and applies presets
 */

import { getDb, setLampPreset } from '../db/database';
import { LAMP_PRESETS, isValidPreset, type PresetName } from './presets';
import { setLampPower, setLampBrightness, setLampColorTemp, getLampStatus, setLampMoonlight, setLampDaylightMode } from '../xiaomi/xiaomi-lamp';
import { createPendingAction, clearAllPending } from './pending-service';
import { broadcastPendingActions, broadcastHomeStatus } from '../ws/device-broadcast';
import { getErrorMessage } from '../utils/errors';

export interface Schedule {
  id: number;
  name: string;
  preset: PresetName;
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

/**
 * Get all schedules
 */
export function getSchedules(): Schedule[] {
  const db = getDb();
  return db.query('SELECT * FROM lamp_schedules ORDER BY time').all() as Schedule[];
}

/**
 * Get schedules for a specific time (HH:MM)
 */
export function getSchedulesByTime(time: string): Schedule[] {
  const db = getDb();
  return db.query('SELECT * FROM lamp_schedules WHERE time = ? AND enabled = 1').all(time) as Schedule[];
}

/**
 * Get all enabled schedules sorted by time (for time window calculation)
 */
export function getEnabledSchedulesSorted(): Schedule[] {
  const db = getDb();
  return db.query('SELECT * FROM lamp_schedules WHERE enabled = 1 ORDER BY time').all() as Schedule[];
}

/**
 * Create a new schedule
 */
export function createSchedule(name: string, preset: PresetName, time: string): Schedule {
  const db = getDb();

  if (!isValidPreset(preset)) {
    throw new Error(`Invalid preset: ${preset}`);
  }

  // Validate time format (HH:MM)
  if (!/^\d{2}:\d{2}$/.test(time)) {
    throw new Error('Time must be in HH:MM format');
  }

  db.run(
    'INSERT INTO lamp_schedules (name, preset, time) VALUES (?, ?, ?)',
    [name, preset, time]
  );

  const lastId = db.query('SELECT last_insert_rowid() as id').get() as { id: number };
  return db.query('SELECT * FROM lamp_schedules WHERE id = ?').get(lastId.id) as Schedule;
}

/**
 * Delete a schedule
 */
export function deleteSchedule(id: number): boolean {
  const db = getDb();
  const result = db.run('DELETE FROM lamp_schedules WHERE id = ?', [id]);
  return result.changes > 0;
}

/**
 * Toggle schedule enabled state
 */
export function toggleSchedule(id: number): Schedule | null {
  const db = getDb();
  db.run('UPDATE lamp_schedules SET enabled = NOT enabled, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
  return db.query('SELECT * FROM lamp_schedules WHERE id = ?').get(id) as Schedule | null;
}

/**
 * Update schedule
 */
export function updateSchedule(
  id: number,
  updates: { name?: string; preset?: PresetName; time?: string }
): Schedule | null {
  const db = getDb();

  if (updates.preset && !isValidPreset(updates.preset)) {
    throw new Error(`Invalid preset: ${updates.preset}`);
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
  if (updates.preset !== undefined) {
    fields.push('preset = ?');
    values.push(updates.preset);
  }
  if (updates.time !== undefined) {
    fields.push('time = ?');
    values.push(updates.time);
  }

  if (fields.length === 0) {
    return db.query('SELECT * FROM lamp_schedules WHERE id = ?').get(id) as Schedule | null;
  }

  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  db.run(`UPDATE lamp_schedules SET ${fields.join(', ')} WHERE id = ?`, values);
  return db.query('SELECT * FROM lamp_schedules WHERE id = ?').get(id) as Schedule | null;
}

/**
 * Get all lamp device IDs
 */
function getAllLampIds(): string[] {
  const db = getDb();
  const lamps = db.query("SELECT id FROM xiaomi_devices WHERE category = 'lamp'").all() as { id: string }[];
  return lamps.map((l) => l.id);
}

interface LampStatus {
  power: boolean;
  brightness: number;
  color_temp: number;
  moonlight_mode: boolean;
  moonlight_brightness: number;
}

/**
 * Check if lamp already has the target preset settings
 */
function lampHasPreset(status: LampStatus, preset: typeof LAMP_PRESETS[string]): boolean {
  if (!preset.power) {
    return status.power === false;
  }

  if (preset.moonlight) {
    return status.moonlight_mode === true && status.moonlight_brightness === preset.brightness;
  }

  return (
    status.power === true &&
    status.brightness === preset.brightness &&
    status.color_temp === preset.colorTemp &&
    status.moonlight_mode === false
  );
}

/**
 * Apply preset to a single lamp
 */
export async function applyPresetToLamp(deviceId: string, presetName: PresetName): Promise<boolean> {
  const preset = LAMP_PRESETS[presetName];
  if (!preset) {
    console.error(`Preset ${presetName} not found`);
    return false;
  }

  try {
    // Check if lamp is reachable
    const status = await getLampStatus(deviceId);
    if (!status) {
      return false; // Lamp is offline
    }

    // Skip if lamp already has correct settings
    if (lampHasPreset(status as LampStatus, preset)) {
      return true; // Already correct, count as success
    }

    // Apply power state
    if (preset.power) {
      // Check if moonlight mode is requested
      if (preset.moonlight) {
        const moonlightOk = await setLampMoonlight(deviceId, preset.brightness);
        if (!moonlightOk) return false;
      } else {
        // Exit moonlight mode if currently in it
        if (status.moonlight_mode) {
          const daylightOk = await setLampDaylightMode(deviceId);
          if (!daylightOk) return false;
        } else {
          const powerOk = await setLampPower(deviceId, true);
          if (!powerOk) return false;
        }

        // Set brightness
        const brightOk = await setLampBrightness(deviceId, preset.brightness);
        if (!brightOk) return false;

        // Set color temperature
        const tempOk = await setLampColorTemp(deviceId, preset.colorTemp);
        if (!tempOk) return false;
      }
    } else {
      // Just turn off
      const powerOk = await setLampPower(deviceId, false);
      if (!powerOk) return false;
    }

    return true;
  } catch (error: unknown) {
    console.error(`Failed to apply ${presetName} to ${deviceId}:`, getErrorMessage(error));
    return false;
  }
}

/**
 * Apply preset to all lamps (global schedule)
 * Returns results: which lamps succeeded, which are pending (offline)
 */
export async function applyPresetToAllLamps(
  presetName: PresetName,
  scheduleId?: number
): Promise<ApplyResult> {
  clearAllPending();
  const lampIds = getAllLampIds();
  const result: ApplyResult = {
    success: [],
    pending: [],
    failed: [],
  };

  for (const lampId of lampIds) {
    const success = await applyPresetToLamp(lampId, presetName);

    if (success) {
      result.success.push(lampId);
    } else {
      // Lamp offline or failed - create pending action for retry
      createPendingAction(lampId, presetName, scheduleId);
      result.pending.push(lampId);
    }
  }

  // Track current lamp preset
  setLampPreset(presetName);

  // Broadcast updated state
  broadcastPendingActions();
  broadcastHomeStatus();

  console.log(`Applied ${presetName}: ${result.success.length} ok, ${result.pending.length} pending`);
  return result;
}
