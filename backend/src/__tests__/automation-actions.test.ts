import { test, expect, describe, beforeEach, afterEach, mock } from 'bun:test';
import { Database } from 'bun:sqlite';
import type { Automation } from '../db/database';
import type { TriggerContext, AutomationAction } from '../automations/automation-actions';

let testDb: Database;

function createTestDb(): Database {
  const db = new Database(':memory:');

  db.run(`CREATE TABLE yamaha_devices (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, ip TEXT NOT NULL,
    model TEXT, room TEXT, online INTEGER DEFAULT 0, last_status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE devices (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT, room TEXT, online INTEGER DEFAULT 0, last_status TEXT
  )`);
  db.run(`CREATE TABLE automation_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    automation_name TEXT, trigger_device_name TEXT, action_executed TEXT, result TEXT,
    executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE automation_pending (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    automation_id INTEGER NOT NULL, trigger_device_name TEXT, room TEXT,
    status TEXT DEFAULT 'pending', created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE telegram_config (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    enabled INTEGER DEFAULT 0, bot_token TEXT, chat_id TEXT,
    flood_alerts INTEGER DEFAULT 1, door_alerts INTEGER DEFAULT 1,
    error_alerts INTEGER DEFAULT 1, cooldown_minutes INTEGER DEFAULT 5,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run('INSERT INTO telegram_config (id, enabled) VALUES (1, 0)');

  return db;
}

// Complete mock of database module with functional stubs for automation-actions
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
  getEnabledAutomationsForTrigger: () => [], getAutomationPending: () => null, updateAutomationPendingStatus: () => {}, expireOldPendingAutomations: () => 0,
  getAutomationLog: () => [],
  logAutomation: (name: string, device: string | null, action: string, result: string) => {
    try { testDb.run('INSERT INTO automation_log (automation_name, trigger_device_name, action_executed, result) VALUES (?, ?, ?, ?)', [name, device, action, result]); } catch {}
  },
  createAutomationPending: (automationId: number, triggerDeviceName: string | null, room: string | null): number => {
    try {
      const r = testDb.run('INSERT INTO automation_pending (automation_id, trigger_device_name, room) VALUES (?, ?, ?)', [automationId, triggerDeviceName, room]);
      return Number(r.lastInsertRowid);
    } catch { return 0; }
  },
}));

// Mock external device modules
mock.module('../scheduling/heater-schedule-service', () => ({
  applyPresetToAllHeaters: async () => ({ success: [], pending: [], failed: [] }),
  applyTempToHeater: async () => 'success',
}));
mock.module('../xiaomi/air-purifier', () => ({
  setPurifierPower: async () => true, setPurifierMode: async () => true,
}));
mock.module('../yamaha/yamaha-soundbar', () => ({
  setSoundbarPower: async () => true,
}));
mock.module('../telegram/telegram-bot', () => ({
  sendMessage: async () => {},
}));
mock.module('../utils/errors', () => ({
  getErrorMessage: (e: unknown) => e instanceof Error ? e.message : String(e),
  hasErrorCode: () => false,
}));
mock.module('../utils/logger', () => ({
  logger: { info: () => {}, warn: () => {}, error: () => {}, debug: () => {} },
  setLogLevel: () => {}, getLogLevel: () => 1, createTimer: () => ({ elapsed: () => 0 }), withTiming: () => {},
}));

const actionsMod = await import('../automations/automation-actions');

describe('automation-actions', () => {
  beforeEach(() => {
    testDb = createTestDb();
  });

  afterEach(() => {
    testDb.close();
  });

  const mockContext: TriggerContext = {
    deviceId: 'dev-1',
    deviceName: 'Test Sensor',
    room: 'Living Room',
    condition: 'door_open',
  };

  function makeAutomation(actionsJson: string): Automation {
    return {
      id: 1,
      name: 'Test Automation',
      enabled: 1,
      trigger_type: 'device_state',
      trigger_device_id: 'dev-1',
      trigger_condition: 'door_open',
      actions: actionsJson,
      telegram_prompt: null,
      telegram_action_yes: null,
      quiet_windows: null,
      created_at: new Date().toISOString(),
    };
  }

  test('executeAutomationActions handles empty actions gracefully', async () => {
    const auto = makeAutomation('[]');
    await actionsMod.executeAutomationActions(auto, mockContext);
  });

  test('executeAutomationActions handles invalid JSON', async () => {
    const auto = makeAutomation('not-json');
    await actionsMod.executeAutomationActions(auto, mockContext);
  });

  test('executeAutomationActions handles non-array JSON', async () => {
    const auto = makeAutomation('{"type":"test"}');
    await actionsMod.executeAutomationActions(auto, mockContext);
  });

  test('executeSingleAction returns false for unknown action type', async () => {
    const action: AutomationAction = { type: 'unknown_action' };
    const result = await actionsMod.executeSingleAction(action, mockContext, 'Test');
    expect(result).toBe(false);
  });

  test('executeConfirmedActions handles empty actions', async () => {
    const results = await actionsMod.executeConfirmedActions('[]', mockContext, 'Test');
    expect(results).toEqual([]);
  });

  test('executeConfirmedActions handles invalid JSON', async () => {
    const results = await actionsMod.executeConfirmedActions('{bad}', mockContext, 'Test');
    expect(results).toEqual([]);
  });

  test('executeConfirmedActions processes actions and returns results', async () => {
    const actionsJson = JSON.stringify([{ type: 'nonexistent_action' }]);
    const results = await actionsMod.executeConfirmedActions(actionsJson, mockContext, 'Test');
    expect(results).toHaveLength(1);
    expect(results[0]).toContain('nonexistent_action');
  });

  test('executeSingleAction handles soundbar_off with no devices', async () => {
    const action: AutomationAction = { type: 'soundbar_off' };
    const result = await actionsMod.executeSingleAction(action, mockContext, 'Test');
    expect(result).toBe(false);
  });

  test('executeSingleAction handles set_heater_temp with room target', async () => {
    const action: AutomationAction = { type: 'set_heater_temp', target: 'room', value: '21' };
    const result = await actionsMod.executeSingleAction(action, mockContext, 'Test');
    expect(result).toBe(true);
  });

  test('actions are filtered to only valid objects with type string', async () => {
    const actionsJson = JSON.stringify([
      { type: 'nonexistent' },
      null,
      { noType: true },
      42,
    ]);
    const results = await actionsMod.executeConfirmedActions(actionsJson, mockContext, 'Test');
    expect(results).toHaveLength(1);
  });
});
