/**
 * Generic factory for pending action services.
 * Both lamp and heater pending services share identical CRUD logic
 * differing only in table name and preset column name.
 */

import { getDb } from '../db/database';

export interface PendingActionRow {
  id: number;
  device_id: string;
  schedule_id: number | null;
  retry_count: number;
  created_at: string;
}

export function createPendingActionService<T extends PendingActionRow>(
  table: string,
  presetColumn: string
) {
  return {
    create(deviceId: string, preset: string, scheduleId?: number): void {
      const db = getDb();
      db.run(`DELETE FROM ${table} WHERE device_id = ?`, [deviceId]);
      db.run(
        `INSERT INTO ${table} (device_id, ${presetColumn}, schedule_id) VALUES (?, ?, ?)`,
        [deviceId, preset, scheduleId ?? null]
      );
    },

    getAll(): T[] {
      const db = getDb();
      return db.query(`SELECT * FROM ${table} ORDER BY created_at`).all() as T[];
    },

    getForDevice(deviceId: string): T | null {
      const db = getDb();
      return db.query(`SELECT * FROM ${table} WHERE device_id = ?`).get(deviceId) as T | null;
    },

    remove(id: number): void {
      const db = getDb();
      db.run(`DELETE FROM ${table} WHERE id = ?`, [id]);
    },

    removeForDevice(deviceId: string): void {
      const db = getDb();
      db.run(`DELETE FROM ${table} WHERE device_id = ?`, [deviceId]);
    },

    incrementRetryCount(id: number): boolean {
      const db = getDb();
      const action = db.query(`SELECT id FROM ${table} WHERE id = ?`).get(id);
      if (!action) return false;
      db.run(`UPDATE ${table} SET retry_count = retry_count + 1 WHERE id = ?`, [id]);
      return true;
    },

    clearAll(): void {
      const db = getDb();
      db.run(`DELETE FROM ${table}`);
    },
  };
}
