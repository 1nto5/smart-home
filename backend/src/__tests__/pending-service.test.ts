import { test, expect, describe, beforeEach, afterEach, mock } from 'bun:test';
import { Database } from 'bun:sqlite';

let testDb: Database;

function createTestDb(): Database {
  const db = new Database(':memory:');

  db.run(`CREATE TABLE pending_lamp_actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT NOT NULL, preset TEXT NOT NULL,
    schedule_id INTEGER, retry_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE pending_heater_actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT NOT NULL, preset_id TEXT NOT NULL,
    schedule_id INTEGER, retry_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  return db;
}

// Complete mock of database module - must include ALL exports to prevent
// ESM resolution errors in other test files running in the same process
mock.module('../db/database', () => ({
  getDb: () => testDb,
  initDatabase: () => testDb,
  closeDatabase: () => {},
  cleanupOldHistory: () => 0,
  recordSensorReading: () => {},
  recordContactChange: () => {},
  getLastContactState: () => null,
  getAlarmConfig: () => ({ armed: false, updated_at: '' }),
  setAlarmArmed: () => ({ armed: false, updated_at: '' }),
  getTelegramConfig: () => ({ enabled: false, bot_token: null, chat_id: null, flood_alerts: true, door_alerts: true, error_alerts: true, cooldown_minutes: 5, updated_at: '' }),
  updateTelegramConfig: () => ({}),
  logTelegram: () => {},
  getTelegramLog: () => [],
  getLastTelegramTime: () => null,
  getUpdateOffset: () => 0,
  setUpdateOffset: () => {},
  getHomeStatus: () => ({ lamp_preset: null, heater_preset: null, updated_at: '' }),
  setLampPreset: () => {},
  setHeaterPreset: () => {},
  createActiveAlarm: () => 0,
  getActiveAlarms: () => [],
  acknowledgeAlarm: () => {},
  acknowledgeAllAlarms: () => 0,
  hasActiveAlarmForDevice: () => false,
  getAutomations: () => [],
  getAutomation: () => null,
  createAutomation: () => ({}),
  updateAutomation: () => null,
  deleteAutomation: () => false,
  toggleAutomation: () => null,
  getEnabledAutomationsForTrigger: () => [],
  createAutomationPending: () => 0,
  getAutomationPending: () => null,
  updateAutomationPendingStatus: () => {},
  expireOldPendingAutomations: () => 0,
  logAutomation: () => {},
  getAutomationLog: () => [],
}));

const lampService = await import('../scheduling/pending-service');
const heaterService = await import('../scheduling/heater-pending-service');

describe('pending-action-factory (via pending-service)', () => {
  beforeEach(() => {
    testDb = createTestDb();
  });

  afterEach(() => {
    testDb.close();
  });

  test('create inserts a pending action', () => {
    lampService.createPendingAction('lamp-1', 'day');
    const all = lampService.getPendingActions();
    expect(all).toHaveLength(1);
    expect(all[0]!.device_id).toBe('lamp-1');
    expect(all[0]!.preset).toBe('day');
  });

  test('create replaces existing action for same device', () => {
    lampService.createPendingAction('lamp-1', 'day');
    lampService.createPendingAction('lamp-1', 'night');
    const all = lampService.getPendingActions();
    expect(all).toHaveLength(1);
    expect(all[0]!.preset).toBe('night');
  });

  test('create stores schedule_id', () => {
    lampService.createPendingAction('lamp-1', 'day', 42);
    const action = lampService.getPendingForDevice('lamp-1');
    expect(action).not.toBeNull();
    expect(action!.schedule_id).toBe(42);
  });

  test('getAll returns actions sorted by created_at', () => {
    lampService.createPendingAction('lamp-a', 'day');
    lampService.createPendingAction('lamp-b', 'night');
    const all = lampService.getPendingActions();
    expect(all).toHaveLength(2);
    expect(all[0]!.device_id).toBe('lamp-a');
    expect(all[1]!.device_id).toBe('lamp-b');
  });

  test('getForDevice returns null when no action exists', () => {
    const result = lampService.getPendingForDevice('nonexistent');
    expect(result).toBeNull();
  });

  test('getForDevice returns action for device', () => {
    lampService.createPendingAction('lamp-1', 'moonlight');
    const result = lampService.getPendingForDevice('lamp-1');
    expect(result).not.toBeNull();
    expect(result!.preset).toBe('moonlight');
  });

  test('remove deletes action by id', () => {
    lampService.createPendingAction('lamp-1', 'day');
    const all = lampService.getPendingActions();
    lampService.removePendingAction(all[0]!.id);
    expect(lampService.getPendingActions()).toHaveLength(0);
  });

  test('removeForDevice deletes actions for device', () => {
    lampService.createPendingAction('lamp-1', 'day');
    lampService.createPendingAction('lamp-2', 'night');
    lampService.removePendingForDevice('lamp-1');
    const remaining = lampService.getPendingActions();
    expect(remaining).toHaveLength(1);
    expect(remaining[0]!.device_id).toBe('lamp-2');
  });

  test('incrementRetryCount increments counter', () => {
    lampService.createPendingAction('lamp-1', 'day');
    const action = lampService.getPendingForDevice('lamp-1')!;
    expect(action.retry_count).toBe(0);
    const result = lampService.incrementRetryCount(action.id);
    expect(result).toBe(true);
    const updated = lampService.getPendingForDevice('lamp-1')!;
    expect(updated.retry_count).toBe(1);
  });

  test('incrementRetryCount returns false for nonexistent id', () => {
    const result = lampService.incrementRetryCount(999);
    expect(result).toBe(false);
  });

  test('clearAll removes all actions', () => {
    lampService.createPendingAction('lamp-1', 'day');
    lampService.createPendingAction('lamp-2', 'night');
    lampService.clearAllPending();
    expect(lampService.getPendingActions()).toHaveLength(0);
  });
});

describe('heater-pending-service', () => {
  beforeEach(() => {
    testDb = createTestDb();
  });

  afterEach(() => {
    testDb.close();
  });

  test('create inserts heater pending action', () => {
    heaterService.createPendingHeaterAction('trv-1', 'comfort');
    const all = heaterService.getPendingHeaterActions();
    expect(all).toHaveLength(1);
    expect(all[0]!.device_id).toBe('trv-1');
    expect(all[0]!.preset_id).toBe('comfort');
  });

  test('create replaces existing for same device', () => {
    heaterService.createPendingHeaterAction('trv-1', 'comfort');
    heaterService.createPendingHeaterAction('trv-1', 'eco');
    const all = heaterService.getPendingHeaterActions();
    expect(all).toHaveLength(1);
    expect(all[0]!.preset_id).toBe('eco');
  });

  test('getForDevice returns heater action', () => {
    heaterService.createPendingHeaterAction('trv-1', 'night');
    const result = heaterService.getPendingHeaterForDevice('trv-1');
    expect(result).not.toBeNull();
    expect(result!.preset_id).toBe('night');
  });

  test('clearAll removes all heater actions', () => {
    heaterService.createPendingHeaterAction('trv-1', 'comfort');
    heaterService.createPendingHeaterAction('trv-2', 'eco');
    heaterService.clearAllPendingHeater();
    expect(heaterService.getPendingHeaterActions()).toHaveLength(0);
  });
});
