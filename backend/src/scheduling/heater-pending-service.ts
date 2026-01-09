/**
 * Pending heater actions service
 * Manages actions waiting for offline TRVs to come online
 */

import { getDb } from '../db/database';

export interface PendingHeaterAction {
  id: number;
  device_id: string;
  preset_id: string;
  schedule_id: number | null;
  retry_count: number;
  created_at: string;
}

/**
 * Create a pending action for an offline TRV
 */
export function createPendingHeaterAction(
  deviceId: string,
  presetId: string,
  scheduleId?: number
): void {
  const db = getDb();

  // Remove any existing pending action for this device
  db.run('DELETE FROM pending_heater_actions WHERE device_id = ?', [deviceId]);

  // Create new pending action
  db.run(
    'INSERT INTO pending_heater_actions (device_id, preset_id, schedule_id) VALUES (?, ?, ?)',
    [deviceId, presetId, scheduleId ?? null]
  );
}

/**
 * Get all pending heater actions
 */
export function getPendingHeaterActions(): PendingHeaterAction[] {
  const db = getDb();
  return db.query('SELECT * FROM pending_heater_actions ORDER BY created_at').all() as PendingHeaterAction[];
}

/**
 * Get pending action for a specific device
 */
export function getPendingHeaterForDevice(deviceId: string): PendingHeaterAction | null {
  const db = getDb();
  return db.query('SELECT * FROM pending_heater_actions WHERE device_id = ?').get(deviceId) as PendingHeaterAction | null;
}

/**
 * Remove a pending heater action
 */
export function removePendingHeaterAction(id: number): void {
  const db = getDb();
  db.run('DELETE FROM pending_heater_actions WHERE id = ?', [id]);
}

/**
 * Remove all pending actions for a device
 */
export function removePendingHeaterForDevice(deviceId: string): void {
  const db = getDb();
  db.run('DELETE FROM pending_heater_actions WHERE device_id = ?', [deviceId]);
}

/**
 * Increment retry count for a pending action
 */
export function incrementHeaterRetryCount(id: number): boolean {
  const db = getDb();
  const action = db.query('SELECT id FROM pending_heater_actions WHERE id = ?').get(id);

  if (!action) return false;

  db.run('UPDATE pending_heater_actions SET retry_count = retry_count + 1 WHERE id = ?', [id]);
  return true;
}

/**
 * Clear all pending heater actions
 */
export function clearAllPendingHeater(): void {
  const db = getDb();
  db.run('DELETE FROM pending_heater_actions');
}
