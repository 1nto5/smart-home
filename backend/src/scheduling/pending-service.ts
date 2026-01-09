/**
 * Pending lamp actions service
 * Manages actions waiting for offline lamps to come online
 */

import { getDb } from '../db/database';
import type { PresetName } from './presets';

export interface PendingAction {
  id: number;
  device_id: string;
  preset: PresetName;
  schedule_id: number | null;
  retry_count: number;
  created_at: string;
}

// No max retries - keep trying until success or new schedule replaces it

/**
 * Create a pending action for an offline lamp
 */
export function createPendingAction(
  deviceId: string,
  preset: PresetName,
  scheduleId?: number
): void {
  const db = getDb();

  // Remove any existing pending action for this device
  db.run('DELETE FROM pending_lamp_actions WHERE device_id = ?', [deviceId]);

  // Create new pending action
  db.run(
    'INSERT INTO pending_lamp_actions (device_id, preset, schedule_id) VALUES (?, ?, ?)',
    [deviceId, preset, scheduleId ?? null]
  );
}

/**
 * Get all pending actions
 */
export function getPendingActions(): PendingAction[] {
  const db = getDb();
  return db.query('SELECT * FROM pending_lamp_actions ORDER BY created_at').all() as PendingAction[];
}

/**
 * Get pending actions for a specific device
 */
export function getPendingForDevice(deviceId: string): PendingAction | null {
  const db = getDb();
  return db.query('SELECT * FROM pending_lamp_actions WHERE device_id = ?').get(deviceId) as PendingAction | null;
}

/**
 * Remove a pending action
 */
export function removePendingAction(id: number): void {
  const db = getDb();
  db.run('DELETE FROM pending_lamp_actions WHERE id = ?', [id]);
}

/**
 * Remove all pending actions for a device
 */
export function removePendingForDevice(deviceId: string): void {
  const db = getDb();
  db.run('DELETE FROM pending_lamp_actions WHERE device_id = ?', [deviceId]);
}

/**
 * Increment retry count for a pending action (for tracking purposes)
 * Returns true if action exists, false if not found
 */
export function incrementRetryCount(id: number): boolean {
  const db = getDb();
  const action = db.query('SELECT id FROM pending_lamp_actions WHERE id = ?').get(id);

  if (!action) return false;

  db.run('UPDATE pending_lamp_actions SET retry_count = retry_count + 1 WHERE id = ?', [id]);
  return true;
}

/**
 * Clear all pending actions
 */
export function clearAllPending(): void {
  const db = getDb();
  db.run('DELETE FROM pending_lamp_actions');
}
