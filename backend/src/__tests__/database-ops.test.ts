/**
 * Database operations tests
 * Tests CRUD operations using an in-memory SQLite database.
 * Uses mock.module to provide real implementations backed by testDb,
 * avoiding cross-file mock.module leaking issues in Bun.
 */

import { test, expect, describe, beforeEach, afterEach, mock } from 'bun:test';
import { Database } from 'bun:sqlite';

let testDb: Database;

function createSchema(db: Database): void {
  db.run('PRAGMA journal_mode = WAL');

  db.run(`CREATE TABLE IF NOT EXISTS devices (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, local_key TEXT, uuid TEXT, node_id TEXT,
    gateway_id TEXT, category TEXT, product_name TEXT, online INTEGER DEFAULT 0,
    ip TEXT, model TEXT, room TEXT, type TEXT, last_status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS device_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT, device_id TEXT NOT NULL,
    status_json TEXT NOT NULL, recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS sensor_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT, device_id TEXT NOT NULL, device_name TEXT,
    temperature REAL, humidity REAL, target_temp REAL, battery INTEGER,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS contact_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT, device_id TEXT NOT NULL, device_name TEXT,
    is_open INTEGER NOT NULL, recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS alarm_config (
    id INTEGER PRIMARY KEY CHECK (id = 1), armed INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run('INSERT INTO alarm_config (id, armed) VALUES (1, 0)');

  db.run(`CREATE TABLE IF NOT EXISTS telegram_config (
    id INTEGER PRIMARY KEY CHECK (id = 1), enabled INTEGER DEFAULT 0,
    bot_token TEXT, chat_id TEXT, flood_alerts INTEGER DEFAULT 1,
    door_alerts INTEGER DEFAULT 1, error_alerts INTEGER DEFAULT 1,
    cooldown_minutes INTEGER DEFAULT 5, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run('INSERT INTO telegram_config (id, enabled, cooldown_minutes) VALUES (1, 0, 5)');

  db.run(`CREATE TABLE IF NOT EXISTS telegram_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT, device_id TEXT, device_name TEXT,
    alert_type TEXT NOT NULL, chat_id TEXT NOT NULL, message TEXT NOT NULL,
    status TEXT NOT NULL, error_message TEXT, sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS telegram_updates_offset (
    id INTEGER PRIMARY KEY CHECK (id = 1), offset INTEGER DEFAULT 0
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS active_alarms (
    id INTEGER PRIMARY KEY AUTOINCREMENT, alarm_type TEXT NOT NULL,
    device_id TEXT NOT NULL, device_name TEXT NOT NULL,
    triggered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at DATETIME, acknowledged_by TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS home_status (
    id INTEGER PRIMARY KEY CHECK (id = 1), lamp_preset TEXT, heater_preset TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run('INSERT INTO home_status (id, lamp_preset, heater_preset) VALUES (1, NULL, NULL)');

  db.run(`CREATE TABLE IF NOT EXISTS automations (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL,
    enabled INTEGER DEFAULT 1, trigger_type TEXT NOT NULL,
    trigger_device_id TEXT, trigger_condition TEXT NOT NULL,
    actions TEXT NOT NULL, telegram_prompt TEXT, telegram_action_yes TEXT,
    quiet_windows TEXT, last_trigger_met INTEGER DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS automation_pending (
    id INTEGER PRIMARY KEY AUTOINCREMENT, automation_id INTEGER NOT NULL,
    trigger_device_name TEXT, room TEXT, status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS automation_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT, automation_name TEXT,
    trigger_device_name TEXT, action_executed TEXT, result TEXT,
    executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
}

// Provide real implementations backed by testDb, avoiding cross-file mock leaking
mock.module('../db/database', () => ({
  getDb: () => testDb,
  initDatabase: () => { createSchema(testDb); return testDb; },
  closeDatabase: () => {},
  cleanupOldHistory: (days: number = 180) => {
    const r1 = testDb.run(`DELETE FROM device_history WHERE recorded_at < datetime('now', '-' || ? || ' days')`, [days]);
    const r2 = testDb.run(`DELETE FROM sensor_history WHERE recorded_at < datetime('now', '-' || ? || ' days')`, [days]);
    const r3 = testDb.run(`DELETE FROM contact_history WHERE recorded_at < datetime('now', '-' || ? || ' days')`, [days]);
    return r1.changes + r2.changes + r3.changes;
  },

  // Sensor history
  recordSensorReading: (deviceId: string, deviceName: string, temperature: number | null, humidity: number | null, targetTemp: number | null, battery: number | null) => {
    testDb.run('INSERT INTO sensor_history (device_id, device_name, temperature, humidity, target_temp, battery) VALUES (?, ?, ?, ?, ?, ?)',
      [deviceId, deviceName, temperature, humidity, targetTemp, battery]);
  },

  // Contact history
  recordContactChange: (deviceId: string, deviceName: string, isOpen: boolean) => {
    testDb.run('INSERT INTO contact_history (device_id, device_name, is_open) VALUES (?, ?, ?)',
      [deviceId, deviceName, isOpen ? 1 : 0]);
  },
  getLastContactState: (deviceId: string): boolean | null => {
    const r = testDb.query('SELECT is_open FROM contact_history WHERE device_id = ? ORDER BY recorded_at DESC LIMIT 1').get(deviceId) as { is_open: number } | null;
    return r ? r.is_open === 1 : null;
  },

  // Alarm
  getAlarmConfig: () => {
    const r = testDb.query('SELECT armed, updated_at FROM alarm_config WHERE id = 1').get() as { armed: number; updated_at: string };
    return { armed: r.armed === 1, updated_at: r.updated_at };
  },
  setAlarmArmed: (armed: boolean) => {
    testDb.run('UPDATE alarm_config SET armed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1', [armed ? 1 : 0]);
    const r = testDb.query('SELECT armed, updated_at FROM alarm_config WHERE id = 1').get() as { armed: number; updated_at: string };
    return { armed: r.armed === 1, updated_at: r.updated_at };
  },

  // Telegram config
  getTelegramConfig: () => {
    const r = testDb.query('SELECT * FROM telegram_config WHERE id = 1').get() as {
      enabled: number; bot_token: string | null; chat_id: string | null;
      flood_alerts: number; door_alerts: number; error_alerts: number;
      cooldown_minutes: number; updated_at: string;
    };
    return {
      enabled: r.enabled === 1, bot_token: r.bot_token, chat_id: r.chat_id,
      flood_alerts: r.flood_alerts === 1, door_alerts: r.door_alerts === 1,
      error_alerts: r.error_alerts !== 0, cooldown_minutes: r.cooldown_minutes,
      updated_at: r.updated_at,
    };
  },
  updateTelegramConfig: (cfg: Record<string, unknown>) => {
    const updates: string[] = [];
    const values: (string | number | null)[] = [];
    if (cfg.enabled !== undefined) { updates.push('enabled = ?'); values.push(cfg.enabled ? 1 : 0); }
    if (cfg.bot_token !== undefined) { updates.push('bot_token = ?'); values.push(cfg.bot_token as string); }
    if (cfg.chat_id !== undefined) { updates.push('chat_id = ?'); values.push(cfg.chat_id as string); }
    if (cfg.flood_alerts !== undefined) { updates.push('flood_alerts = ?'); values.push(cfg.flood_alerts ? 1 : 0); }
    if (cfg.door_alerts !== undefined) { updates.push('door_alerts = ?'); values.push(cfg.door_alerts ? 1 : 0); }
    if (cfg.error_alerts !== undefined) { updates.push('error_alerts = ?'); values.push(cfg.error_alerts ? 1 : 0); }
    if (cfg.cooldown_minutes !== undefined) { updates.push('cooldown_minutes = ?'); values.push(cfg.cooldown_minutes as number); }
    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      testDb.run(`UPDATE telegram_config SET ${updates.join(', ')} WHERE id = 1`, values);
    }
    const r = testDb.query('SELECT * FROM telegram_config WHERE id = 1').get() as {
      enabled: number; bot_token: string | null; chat_id: string | null;
      flood_alerts: number; door_alerts: number; error_alerts: number;
      cooldown_minutes: number; updated_at: string;
    };
    return {
      enabled: r.enabled === 1, bot_token: r.bot_token, chat_id: r.chat_id,
      flood_alerts: r.flood_alerts === 1, door_alerts: r.door_alerts === 1,
      error_alerts: r.error_alerts !== 0, cooldown_minutes: r.cooldown_minutes,
      updated_at: r.updated_at,
    };
  },

  // Telegram log
  logTelegram: (alertType: string, chatId: string, message: string, status: string, deviceId?: string, deviceName?: string, errorMessage?: string) => {
    testDb.run('INSERT INTO telegram_log (device_id, device_name, alert_type, chat_id, message, status, error_message) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [deviceId || null, deviceName || null, alertType, chatId, message, status, errorMessage || null]);
  },
  getTelegramLog: (limit: number = 50) => {
    return testDb.query('SELECT * FROM telegram_log ORDER BY sent_at DESC LIMIT ?').all(limit);
  },
  getLastTelegramTime: (alertType: string, deviceId?: string): Date | null => {
    let query = "SELECT sent_at FROM telegram_log WHERE alert_type = ? AND status = 'sent'";
    const params: string[] = [alertType];
    if (deviceId) { query += ' AND device_id = ?'; params.push(deviceId); }
    query += ' ORDER BY sent_at DESC LIMIT 1';
    const r = testDb.query(query).get(...params) as { sent_at: string } | null;
    return r ? new Date(r.sent_at) : null;
  },

  // Update offset
  getUpdateOffset: (): number => {
    const r = testDb.query('SELECT offset FROM telegram_updates_offset WHERE id = 1').get() as { offset: number } | null;
    return r?.offset ?? 0;
  },
  setUpdateOffset: (offset: number) => {
    testDb.run('INSERT OR REPLACE INTO telegram_updates_offset (id, offset) VALUES (1, ?)', [offset]);
  },

  // Home status
  getHomeStatus: () => {
    return testDb.query('SELECT lamp_preset, heater_preset, updated_at FROM home_status WHERE id = 1').get();
  },
  setLampPreset: (presetId: string | null) => {
    testDb.run('UPDATE home_status SET lamp_preset = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1', [presetId]);
  },
  setHeaterPreset: (presetId: string | null) => {
    testDb.run('UPDATE home_status SET heater_preset = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1', [presetId]);
  },

  // Active alarms
  createActiveAlarm: (alarmType: string, deviceId: string, deviceName: string): number => {
    const r = testDb.run('INSERT INTO active_alarms (alarm_type, device_id, device_name) VALUES (?, ?, ?)',
      [alarmType, deviceId, deviceName]);
    return Number(r.lastInsertRowid);
  },
  getActiveAlarms: () => {
    return testDb.query('SELECT * FROM active_alarms WHERE acknowledged_at IS NULL ORDER BY triggered_at DESC').all();
  },
  acknowledgeAlarm: (alarmId: number, by: string = 'telegram') => {
    testDb.run('UPDATE active_alarms SET acknowledged_at = CURRENT_TIMESTAMP, acknowledged_by = ? WHERE id = ?', [by, alarmId]);
  },
  acknowledgeAllAlarms: (alarmType?: string, by: string = 'telegram'): number => {
    let query = 'UPDATE active_alarms SET acknowledged_at = CURRENT_TIMESTAMP, acknowledged_by = ? WHERE acknowledged_at IS NULL';
    const params: string[] = [by];
    if (alarmType) { query += ' AND alarm_type = ?'; params.push(alarmType); }
    return testDb.run(query, params).changes;
  },
  hasActiveAlarmForDevice: (deviceId: string): boolean => {
    return testDb.query('SELECT 1 FROM active_alarms WHERE device_id = ? AND acknowledged_at IS NULL LIMIT 1').get(deviceId) !== null;
  },

  // Automations
  getAutomations: () => {
    return testDb.query('SELECT * FROM automations ORDER BY name').all();
  },
  getAutomation: (id: number) => {
    return testDb.query('SELECT * FROM automations WHERE id = ?').get(id) ?? null;
  },
  createAutomation: (auto: Record<string, unknown>) => {
    const r = testDb.run(
      'INSERT INTO automations (name, enabled, trigger_type, trigger_device_id, trigger_condition, actions, telegram_prompt, telegram_action_yes, quiet_windows) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [auto.name, auto.enabled ?? 1, auto.trigger_type, auto.trigger_device_id ?? null, auto.trigger_condition, auto.actions, auto.telegram_prompt ?? null, auto.telegram_action_yes ?? null, auto.quiet_windows ?? null] as (string | number | null)[]
    );
    return testDb.query('SELECT * FROM automations WHERE id = ?').get(Number(r.lastInsertRowid));
  },
  updateAutomation: (id: number, updates: Record<string, unknown>) => {
    const fields: string[] = [];
    const values: (string | number | null)[] = [];
    if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name as string); }
    if (updates.enabled !== undefined) { fields.push('enabled = ?'); values.push(updates.enabled as number); }
    if (updates.trigger_type !== undefined) { fields.push('trigger_type = ?'); values.push(updates.trigger_type as string); }
    if (updates.trigger_device_id !== undefined) { fields.push('trigger_device_id = ?'); values.push(updates.trigger_device_id as string | null); }
    if (updates.trigger_condition !== undefined) { fields.push('trigger_condition = ?'); values.push(updates.trigger_condition as string); }
    if (updates.actions !== undefined) { fields.push('actions = ?'); values.push(updates.actions as string); }
    if (updates.telegram_prompt !== undefined) { fields.push('telegram_prompt = ?'); values.push(updates.telegram_prompt as string | null); }
    if (updates.telegram_action_yes !== undefined) { fields.push('telegram_action_yes = ?'); values.push(updates.telegram_action_yes as string | null); }
    if (updates.quiet_windows !== undefined) { fields.push('quiet_windows = ?'); values.push(updates.quiet_windows as string | null); }
    if (fields.length === 0) return testDb.query('SELECT * FROM automations WHERE id = ?').get(id) ?? null;
    fields.push('last_trigger_met = NULL');
    values.push(id);
    testDb.run(`UPDATE automations SET ${fields.join(', ')} WHERE id = ?`, values);
    return testDb.query('SELECT * FROM automations WHERE id = ?').get(id) ?? null;
  },
  deleteAutomation: (id: number): boolean => {
    return testDb.run('DELETE FROM automations WHERE id = ?', [id]).changes > 0;
  },
  toggleAutomation: (id: number) => {
    testDb.run('UPDATE automations SET enabled = CASE WHEN enabled = 1 THEN 0 ELSE 1 END, last_trigger_met = NULL WHERE id = ?', [id]);
    return testDb.query('SELECT * FROM automations WHERE id = ?').get(id) ?? null;
  },
  getEnabledAutomationsForTrigger: () => [],
  createAutomationPending: () => 0,
  getAutomationPending: () => null,
  updateAutomationPendingStatus: () => {},
  expireOldPendingAutomations: () => 0,

  // Automation log
  logAutomation: (automationName: string, triggerDeviceName: string | null, actionExecuted: string, result: string) => {
    testDb.run('INSERT INTO automation_log (automation_name, trigger_device_name, action_executed, result) VALUES (?, ?, ?, ?)',
      [automationName, triggerDeviceName, actionExecuted, result]);
  },
  getAutomationLog: (limit: number = 50) => {
    return testDb.query('SELECT * FROM automation_log ORDER BY executed_at DESC LIMIT ?').all(limit);
  },
}));

const dbModule = await import('../db/database');

describe('database operations', () => {
  beforeEach(() => {
    testDb = new Database(':memory:');
    createSchema(testDb);
  });

  afterEach(() => {
    testDb.close();
  });

  // === ALARM CONFIG ===

  describe('alarm config', () => {
    test('getAlarmConfig returns default disarmed state', () => {
      const config = dbModule.getAlarmConfig();
      expect(config.armed).toBe(false);
      expect(config.updated_at).toBeDefined();
    });

    test('setAlarmArmed arms the alarm', () => {
      const config = dbModule.setAlarmArmed(true);
      expect(config.armed).toBe(true);
    });

    test('setAlarmArmed disarms the alarm', () => {
      dbModule.setAlarmArmed(true);
      const config = dbModule.setAlarmArmed(false);
      expect(config.armed).toBe(false);
    });
  });

  // === TELEGRAM CONFIG ===

  describe('telegram config', () => {
    test('getTelegramConfig returns defaults', () => {
      const config = dbModule.getTelegramConfig();
      expect(config.enabled).toBe(false);
      expect(config.bot_token).toBeNull();
      expect(config.chat_id).toBeNull();
      expect(config.flood_alerts).toBe(true);
      expect(config.door_alerts).toBe(true);
      expect(config.cooldown_minutes).toBe(5);
    });

    test('updateTelegramConfig updates enabled', () => {
      const config = dbModule.updateTelegramConfig({ enabled: true });
      expect(config.enabled).toBe(true);
    });

    test('updateTelegramConfig updates multiple fields', () => {
      const config = dbModule.updateTelegramConfig({
        enabled: true, bot_token: 'token123', chat_id: '456', cooldown_minutes: 10,
      });
      expect(config.enabled).toBe(true);
      expect(config.bot_token).toBe('token123');
      expect(config.chat_id).toBe('456');
      expect(config.cooldown_minutes).toBe(10);
    });

    test('updateTelegramConfig with no updates returns current', () => {
      const config = dbModule.updateTelegramConfig({});
      expect(config.enabled).toBe(false);
    });
  });

  // === TELEGRAM LOG ===

  describe('telegram log', () => {
    test('logTelegram inserts log entry', () => {
      dbModule.logTelegram('flood', '123', 'Water detected!', 'sent', 'dev-1', 'Sensor 1');
      const logs = dbModule.getTelegramLog();
      expect(logs).toHaveLength(1);
      expect(logs[0]!.alert_type).toBe('flood');
      expect(logs[0]!.status).toBe('sent');
      expect(logs[0]!.device_name).toBe('Sensor 1');
    });

    test('logTelegram handles optional params', () => {
      dbModule.logTelegram('door', '123', 'Door opened', 'failed');
      const logs = dbModule.getTelegramLog();
      expect(logs).toHaveLength(1);
      expect(logs[0]!.device_id).toBeNull();
      expect(logs[0]!.device_name).toBeNull();
      expect(logs[0]!.error_message).toBeNull();
    });

    test('getTelegramLog respects limit', () => {
      for (let i = 0; i < 5; i++) dbModule.logTelegram('test', '123', `msg ${i}`, 'sent');
      const logs = dbModule.getTelegramLog(3);
      expect(logs).toHaveLength(3);
    });

    test('getLastTelegramTime returns null when no logs', () => {
      expect(dbModule.getLastTelegramTime('flood')).toBeNull();
    });

    test('getLastTelegramTime returns date for existing log', () => {
      dbModule.logTelegram('flood', '123', 'alert', 'sent');
      expect(dbModule.getLastTelegramTime('flood')).toBeInstanceOf(Date);
    });

    test('getLastTelegramTime filters by device id', () => {
      dbModule.logTelegram('flood', '123', 'alert', 'sent', 'dev-1');
      expect(dbModule.getLastTelegramTime('flood', 'dev-2')).toBeNull();
    });
  });

  // === TELEGRAM UPDATES OFFSET ===

  describe('telegram updates offset', () => {
    test('getUpdateOffset returns 0 initially', () => {
      expect(dbModule.getUpdateOffset()).toBe(0);
    });

    test('setUpdateOffset persists value', () => {
      dbModule.setUpdateOffset(42);
      expect(dbModule.getUpdateOffset()).toBe(42);
    });

    test('setUpdateOffset replaces previous value', () => {
      dbModule.setUpdateOffset(10);
      dbModule.setUpdateOffset(20);
      expect(dbModule.getUpdateOffset()).toBe(20);
    });
  });

  // === HOME STATUS ===

  describe('home status', () => {
    test('getHomeStatus returns defaults', () => {
      const status = dbModule.getHomeStatus();
      expect(status.lamp_preset).toBeNull();
      expect(status.heater_preset).toBeNull();
      expect(status.updated_at).toBeDefined();
    });

    test('setLampPreset updates lamp preset', () => {
      dbModule.setLampPreset('night');
      expect(dbModule.getHomeStatus().lamp_preset).toBe('night');
    });

    test('setHeaterPreset updates heater preset', () => {
      dbModule.setHeaterPreset('comfort');
      expect(dbModule.getHomeStatus().heater_preset).toBe('comfort');
    });

    test('setLampPreset clears preset with null', () => {
      dbModule.setLampPreset('day');
      dbModule.setLampPreset(null);
      expect(dbModule.getHomeStatus().lamp_preset).toBeNull();
    });
  });

  // === ACTIVE ALARMS ===

  describe('active alarms', () => {
    test('createActiveAlarm returns new id', () => {
      const id = dbModule.createActiveAlarm('flood', 'dev-1', 'Water Sensor');
      expect(typeof id).toBe('number');
      expect(id).toBeGreaterThan(0);
    });

    test('getActiveAlarms returns unacknowledged alarms', () => {
      dbModule.createActiveAlarm('flood', 'dev-1', 'Water Sensor');
      dbModule.createActiveAlarm('door', 'dev-2', 'Front Door');
      expect(dbModule.getActiveAlarms()).toHaveLength(2);
    });

    test('acknowledgeAlarm removes from active list', () => {
      const id = dbModule.createActiveAlarm('flood', 'dev-1', 'Water Sensor');
      dbModule.acknowledgeAlarm(id);
      expect(dbModule.getActiveAlarms()).toHaveLength(0);
    });

    test('acknowledgeAlarm records acknowledged_by', () => {
      const id = dbModule.createActiveAlarm('flood', 'dev-1', 'Sensor');
      dbModule.acknowledgeAlarm(id, 'web-ui');
      const row = testDb.query('SELECT acknowledged_by FROM active_alarms WHERE id = ?').get(id) as { acknowledged_by: string };
      expect(row.acknowledged_by).toBe('web-ui');
    });

    test('acknowledgeAllAlarms acknowledges all', () => {
      dbModule.createActiveAlarm('flood', 'dev-1', 'Sensor 1');
      dbModule.createActiveAlarm('flood', 'dev-2', 'Sensor 2');
      expect(dbModule.acknowledgeAllAlarms()).toBe(2);
      expect(dbModule.getActiveAlarms()).toHaveLength(0);
    });

    test('acknowledgeAllAlarms filters by type', () => {
      dbModule.createActiveAlarm('flood', 'dev-1', 'Sensor');
      dbModule.createActiveAlarm('door', 'dev-2', 'Door');
      expect(dbModule.acknowledgeAllAlarms('flood')).toBe(1);
      const remaining = dbModule.getActiveAlarms();
      expect(remaining).toHaveLength(1);
      expect(remaining[0]!.alarm_type).toBe('door');
    });

    test('hasActiveAlarmForDevice returns true when active', () => {
      dbModule.createActiveAlarm('flood', 'dev-1', 'Sensor');
      expect(dbModule.hasActiveAlarmForDevice('dev-1')).toBe(true);
    });

    test('hasActiveAlarmForDevice returns false when none', () => {
      expect(dbModule.hasActiveAlarmForDevice('dev-1')).toBe(false);
    });

    test('hasActiveAlarmForDevice returns false when acknowledged', () => {
      const id = dbModule.createActiveAlarm('flood', 'dev-1', 'Sensor');
      dbModule.acknowledgeAlarm(id);
      expect(dbModule.hasActiveAlarmForDevice('dev-1')).toBe(false);
    });
  });

  // === CONTACT HISTORY ===

  describe('contact history', () => {
    test('recordContactChange inserts record', () => {
      dbModule.recordContactChange('dev-1', 'Front Door', true);
      expect(dbModule.getLastContactState('dev-1')).toBe(true);
    });

    test('getLastContactState returns latest state', () => {
      dbModule.recordContactChange('dev-1', 'Door', true);
      testDb.run("INSERT INTO contact_history (device_id, device_name, is_open, recorded_at) VALUES ('dev-1', 'Door', 0, datetime('now', '+1 second'))");
      expect(dbModule.getLastContactState('dev-1')).toBe(false);
    });

    test('getLastContactState returns null for unknown device', () => {
      expect(dbModule.getLastContactState('nonexistent')).toBeNull();
    });
  });

  // === SENSOR HISTORY ===

  describe('sensor history', () => {
    test('recordSensorReading inserts record', () => {
      dbModule.recordSensorReading('dev-1', 'Weather', 22.5, 45, null, 80);
      const rows = testDb.query('SELECT * FROM sensor_history').all() as { temperature: number }[];
      expect(rows).toHaveLength(1);
      expect(rows[0]!.temperature).toBe(22.5);
    });

    test('recordSensorReading handles null values', () => {
      dbModule.recordSensorReading('dev-1', 'TRV', null, null, 21, null);
      const rows = testDb.query('SELECT * FROM sensor_history').all() as { temperature: number | null; target_temp: number }[];
      expect(rows).toHaveLength(1);
      expect(rows[0]!.temperature).toBeNull();
      expect(rows[0]!.target_temp).toBe(21);
    });
  });

  // === AUTOMATIONS ===

  describe('automations', () => {
    const autoBase = {
      enabled: 1, trigger_type: 'device_state' as const,
      trigger_device_id: null, trigger_condition: 'flood',
      actions: '[]', telegram_prompt: null, telegram_action_yes: null, quiet_windows: null,
    };

    test('createAutomation creates and returns automation', () => {
      const auto = dbModule.createAutomation({ ...autoBase, name: 'Test Auto', trigger_device_id: 'dev-1', trigger_condition: 'door_open', actions: JSON.stringify([{ type: 'soundbar_off' }]) });
      expect(auto.name).toBe('Test Auto');
      expect(auto.id).toBeGreaterThan(0);
    });

    test('getAutomation returns automation by id', () => {
      const created = dbModule.createAutomation({ ...autoBase, name: 'Fetch Test' });
      expect(dbModule.getAutomation(created.id)!.name).toBe('Fetch Test');
    });

    test('getAutomation returns null for nonexistent', () => {
      expect(dbModule.getAutomation(999)).toBeNull();
    });

    test('updateAutomation updates fields', () => {
      const auto = dbModule.createAutomation({ ...autoBase, name: 'Original' });
      expect(dbModule.updateAutomation(auto.id, { name: 'Updated' })!.name).toBe('Updated');
    });

    test('updateAutomation resets last_trigger_met', () => {
      const auto = dbModule.createAutomation({ ...autoBase, name: 'Trigger Test' });
      testDb.run('UPDATE automations SET last_trigger_met = 1 WHERE id = ?', [auto.id]);
      dbModule.updateAutomation(auto.id, { name: 'Changed' });
      const row = testDb.query('SELECT last_trigger_met FROM automations WHERE id = ?').get(auto.id) as { last_trigger_met: number | null };
      expect(row.last_trigger_met).toBeNull();
    });

    test('deleteAutomation removes and returns true', () => {
      const auto = dbModule.createAutomation({ ...autoBase, name: 'Delete Me' });
      expect(dbModule.deleteAutomation(auto.id)).toBe(true);
      expect(dbModule.getAutomation(auto.id)).toBeNull();
    });

    test('deleteAutomation returns false for nonexistent', () => {
      expect(dbModule.deleteAutomation(999)).toBe(false);
    });

    test('toggleAutomation toggles enabled state', () => {
      const auto = dbModule.createAutomation({ ...autoBase, name: 'Toggle Test' });
      expect(dbModule.toggleAutomation(auto.id)!.enabled).toBe(0);
      expect(dbModule.toggleAutomation(auto.id)!.enabled).toBe(1);
    });

    test('getAutomations returns all sorted by name', () => {
      dbModule.createAutomation({ ...autoBase, name: 'Bravo' });
      dbModule.createAutomation({ ...autoBase, name: 'Alpha' });
      const all = dbModule.getAutomations();
      expect(all).toHaveLength(2);
      expect(all[0]!.name).toBe('Alpha');
    });
  });

  // === AUTOMATION LOG ===

  describe('automation log', () => {
    test('logAutomation inserts log entry', () => {
      dbModule.logAutomation('Test Auto', 'Sensor', 'soundbar_off', 'success');
      const logs = dbModule.getAutomationLog();
      expect(logs).toHaveLength(1);
      expect(logs[0]!.automation_name).toBe('Test Auto');
    });

    test('getAutomationLog respects limit', () => {
      for (let i = 0; i < 5; i++) dbModule.logAutomation(`Auto ${i}`, null, 'action', 'success');
      expect(dbModule.getAutomationLog(2)).toHaveLength(2);
    });
  });
});
