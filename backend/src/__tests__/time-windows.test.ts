import { test, expect, describe, beforeEach, afterEach, mock } from 'bun:test';
import { Database } from 'bun:sqlite';

let testDb: Database;

function createTestDb(): Database {
  const db = new Database(':memory:');

  db.run(`CREATE TABLE lamp_presets (
    id TEXT PRIMARY KEY, name TEXT NOT NULL,
    brightness INTEGER NOT NULL, color_temp INTEGER NOT NULL,
    power INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run("INSERT INTO lamp_presets VALUES ('day', 'Day', 100, 5000, 1, datetime('now'), datetime('now'))");
  db.run("INSERT INTO lamp_presets VALUES ('night', 'Night', 30, 2700, 1, datetime('now'), datetime('now'))");
  db.run("INSERT INTO lamp_presets VALUES ('moonlight', 'Moonlight', 10, 2700, 1, datetime('now'), datetime('now'))");

  db.run(`CREATE TABLE lamp_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL, preset TEXT NOT NULL,
    time TEXT NOT NULL, enabled INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE home_status (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    lamp_preset TEXT, heater_preset TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run('INSERT INTO home_status (id) VALUES (1)');

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
  getHomeStatus: () => ({ lamp_preset: null, heater_preset: null, updated_at: '' }),
  setLampPreset: (preset: string | null) => { try { testDb.run('UPDATE home_status SET lamp_preset = ? WHERE id = 1', [preset]); } catch {} },
  setHeaterPreset: () => {},
  createActiveAlarm: () => 0, getActiveAlarms: () => [], acknowledgeAlarm: () => {}, acknowledgeAllAlarms: () => 0, hasActiveAlarmForDevice: () => false,
  getAutomations: () => [], getAutomation: () => null, createAutomation: () => ({}), updateAutomation: () => null, deleteAutomation: () => false, toggleAutomation: () => null,
  getEnabledAutomationsForTrigger: () => [], createAutomationPending: () => 0, getAutomationPending: () => null, updateAutomationPendingStatus: () => {}, expireOldPendingAutomations: () => 0,
  logAutomation: () => {}, getAutomationLog: () => [],
}));

// Mock modules imported by schedule-service that we don't need
mock.module('../xiaomi/xiaomi-lamp', () => ({
  setLampPower: async () => true, setLampBrightness: async () => true,
  setLampColorTemp: async () => true, getLampStatus: async () => null,
  setLampMoonlight: async () => true, setLampDaylightMode: async () => true,
}));

mock.module('../ws/device-broadcast', () => ({
  broadcastPendingActions: () => {}, broadcastHomeStatus: () => {},
}));

mock.module('../utils/errors', () => ({
  getErrorMessage: (e: unknown) => e instanceof Error ? e.message : String(e),
  hasErrorCode: () => false,
}));

mock.module('../utils/logger', () => ({
  logger: { info: () => {}, warn: () => {}, error: () => {}, debug: () => {} },
  setLogLevel: () => {}, getLogLevel: () => 1, createTimer: () => ({ elapsed: () => 0 }), withTiming: () => {},
}));

const timeWindows = await import('../scheduling/time-windows');

describe('time-windows', () => {
  beforeEach(() => {
    testDb = createTestDb();
  });

  afterEach(() => {
    testDb.close();
  });

  test('getCurrentPresetFromSchedules returns day fallback with no schedules', () => {
    const result = timeWindows.getCurrentPresetFromSchedules();
    expect(result).toBe('day');
  });

  test('getCurrentPresetFromSchedules returns last schedule when before all times', () => {
    testDb.run("INSERT INTO lamp_schedules (name, preset, time, enabled) VALUES ('late', 'moonlight', '23:55', 1)");
    testDb.run("INSERT INTO lamp_schedules (name, preset, time, enabled) VALUES ('later', 'night', '23:59', 1)");

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    if (currentMinutes < 23 * 60 + 55) {
      const result = timeWindows.getCurrentPresetFromSchedules();
      expect(result).toBe('night');
    }
  });

  test('getCurrentPresetFromSchedules picks most recent past schedule', () => {
    testDb.run("INSERT INTO lamp_schedules (name, preset, time, enabled) VALUES ('morning', 'day', '00:01', 1)");
    testDb.run("INSERT INTO lamp_schedules (name, preset, time, enabled) VALUES ('evening', 'night', '23:58', 1)");
    testDb.run("INSERT INTO lamp_schedules (name, preset, time, enabled) VALUES ('late', 'moonlight', '23:59', 1)");

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    if (currentMinutes >= 1 && currentMinutes < 23 * 60 + 58) {
      const result = timeWindows.getCurrentPresetFromSchedules();
      expect(result).toBe('day');
    }
  });

  test('getCurrentPresetFromSchedules ignores disabled schedules', () => {
    testDb.run("INSERT INTO lamp_schedules (name, preset, time, enabled) VALUES ('morning', 'day', '00:01', 1)");
    testDb.run("INSERT INTO lamp_schedules (name, preset, time, enabled) VALUES ('disabled', 'night', '00:02', 0)");

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    if (currentMinutes >= 2) {
      const result = timeWindows.getCurrentPresetFromSchedules();
      expect(result).toBe('day');
    }
  });

  test('getCurrentTimeWindow returns string value', () => {
    testDb.run("INSERT INTO lamp_schedules (name, preset, time, enabled) VALUES ('morning', 'day', '00:01', 1)");
    const result = timeWindows.getCurrentTimeWindow();
    expect(typeof result).toBe('string');
  });

  test('getPresetForTimeWindow returns identity mapping', () => {
    expect(timeWindows.getPresetForTimeWindow('day')).toBe('day');
    expect(timeWindows.getPresetForTimeWindow('night')).toBe('night');
    expect(timeWindows.getPresetForTimeWindow('moonlight')).toBe('moonlight');
  });

  test('getCurrentPresetFromSchedules handles single schedule', () => {
    testDb.run("INSERT INTO lamp_schedules (name, preset, time, enabled) VALUES ('only', 'night', '00:01', 1)");
    const result = timeWindows.getCurrentPresetFromSchedules();
    expect(result).toBe('night');
  });

  test('schedules are processed in time order', () => {
    testDb.run("INSERT INTO lamp_schedules (name, preset, time, enabled) VALUES ('late', 'moonlight', '23:00', 1)");
    testDb.run("INSERT INTO lamp_schedules (name, preset, time, enabled) VALUES ('early', 'day', '00:01', 1)");
    testDb.run("INSERT INTO lamp_schedules (name, preset, time, enabled) VALUES ('mid', 'night', '12:00', 1)");

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const result = timeWindows.getCurrentPresetFromSchedules();
    expect(['day', 'night', 'moonlight']).toContain(result);

    if (currentMinutes >= 1 && currentMinutes < 12 * 60) {
      expect(result).toBe('day');
    } else if (currentMinutes >= 12 * 60 && currentMinutes < 23 * 60) {
      expect(result).toBe('night');
    } else if (currentMinutes >= 23 * 60) {
      expect(result).toBe('moonlight');
    }
  });
});
