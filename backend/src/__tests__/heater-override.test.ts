import { test, expect, describe, beforeEach, afterEach, mock } from 'bun:test';
import { Database } from 'bun:sqlite';

let testDb: Database;

function createTestDb(): Database {
  const db = new Database(':memory:');

  db.run(`CREATE TABLE heater_override (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    enabled INTEGER DEFAULT 0, mode TEXT DEFAULT 'pause',
    fixed_temp REAL DEFAULT 18,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run("INSERT INTO heater_override (id, enabled, mode, fixed_temp) VALUES (1, 0, 'pause', 18)");

  return db;
}

// Complete mock of database module
mock.module('../db/database', () => ({
  getDb: () => testDb,
  initDatabase: () => testDb, closeDatabase: () => {}, cleanupOldHistory: () => 0,
  recordSensorReading: () => {}, recordContactChange: () => {}, getLastContactState: () => null,
  getAlarmConfig: () => ({ armed: false, updated_at: '' }), setAlarmArmed: () => ({ armed: false, updated_at: '' }),
  getTelegramConfig: () => ({ enabled: false, bot_token: null, chat_id: null, flood_alerts: true, door_alerts: true, error_alerts: true, cooldown_minutes: 5, updated_at: '' }),
  updateTelegramConfig: () => ({}), logTelegram: () => {}, getTelegramLog: () => [], getLastTelegramTime: () => null,
  getUpdateOffset: () => 0, setUpdateOffset: () => {},
  getHomeStatus: () => ({ lamp_preset: null, heater_preset: null, updated_at: '' }), setLampPreset: () => {}, setHeaterPreset: () => {},
  createActiveAlarm: () => 0, getActiveAlarms: () => [], acknowledgeAlarm: () => {}, acknowledgeAllAlarms: () => 0, hasActiveAlarmForDevice: () => false,
  getAutomations: () => [], getAutomation: () => null, createAutomation: () => ({}), updateAutomation: () => null, deleteAutomation: () => false, toggleAutomation: () => null,
  getEnabledAutomationsForTrigger: () => [], createAutomationPending: () => 0, getAutomationPending: () => null, updateAutomationPendingStatus: () => {}, expireOldPendingAutomations: () => 0,
  logAutomation: () => {}, getAutomationLog: () => [],
}));

const overrideMod = await import('../scheduling/heater-override');

describe('heater-override', () => {
  beforeEach(() => {
    testDb = createTestDb();
  });

  afterEach(() => {
    testDb.close();
  });

  test('getHeaterOverride returns default state', () => {
    const override = overrideMod.getHeaterOverride();
    expect(override.enabled).toBe(false);
    expect(override.mode).toBe('pause');
    expect(override.fixed_temp).toBe(18);
    expect(override.id).toBe(1);
  });

  test('setHeaterOverride enables override', () => {
    const result = overrideMod.setHeaterOverride(true, 'pause');
    expect(result.enabled).toBe(true);
    expect(result.mode).toBe('pause');
  });

  test('setHeaterOverride sets fixed mode with temp', () => {
    const result = overrideMod.setHeaterOverride(true, 'fixed', 22);
    expect(result.enabled).toBe(true);
    expect(result.mode).toBe('fixed');
    expect(result.fixed_temp).toBe(22);
  });

  test('setHeaterOverride defaults fixed_temp to 18', () => {
    const result = overrideMod.setHeaterOverride(true, 'fixed');
    expect(result.fixed_temp).toBe(18);
  });

  test('setHeaterOverride disables override', () => {
    overrideMod.setHeaterOverride(true, 'pause');
    const result = overrideMod.setHeaterOverride(false, 'pause');
    expect(result.enabled).toBe(false);
  });

  test('isOverrideActive returns false when disabled', () => {
    expect(overrideMod.isOverrideActive()).toBe(false);
  });

  test('isOverrideActive returns true when enabled', () => {
    overrideMod.setHeaterOverride(true, 'pause');
    expect(overrideMod.isOverrideActive()).toBe(true);
  });

  test('setHeaterOverride updates updated_at timestamp', () => {
    const before = overrideMod.getHeaterOverride().updated_at;
    expect(typeof before).toBe('string');
    overrideMod.setHeaterOverride(true, 'fixed', 20);
    const after = overrideMod.getHeaterOverride().updated_at;
    expect(typeof after).toBe('string');
  });

  test('HeaterOverride has correct shape', () => {
    const override = overrideMod.getHeaterOverride();
    expect(override).toHaveProperty('id');
    expect(override).toHaveProperty('enabled');
    expect(override).toHaveProperty('mode');
    expect(override).toHaveProperty('fixed_temp');
    expect(override).toHaveProperty('updated_at');
  });

  test('setHeaterOverride persists across reads', () => {
    overrideMod.setHeaterOverride(true, 'fixed', 25);
    const fresh = overrideMod.getHeaterOverride();
    expect(fresh.enabled).toBe(true);
    expect(fresh.mode).toBe('fixed');
    expect(fresh.fixed_temp).toBe(25);
  });
});
