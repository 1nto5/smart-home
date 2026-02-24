/**
 * Database operations tests
 * Tests CRUD operations using a real temp database.
 * Uses mock.module to redirect config.db.path to a temp directory.
 */

import { test, expect, describe, beforeEach, afterEach, mock } from 'bun:test';
import { mkdtempSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const tempDir = mkdtempSync(join(tmpdir(), 'smart-home-db-test-'));
const dbPath = join(tempDir, 'test.db');

// Mock config to use temp db path
mock.module('../config', () => ({
  config: {
    db: { path: dbPath },
    tuya: { accessId: '', accessSecret: '', region: 'eu', gatewayId: '' },
    server: { port: 3001 },
    roborock: { bridgeUrl: '' },
    auth: { token: '' },
    retention: {
      sensorHistoryDays: 90, deviceHistoryDays: 30,
      contactHistoryDays: 180, telegramLogDays: 30, automationLogDays: 30,
    },
  },
}));

const dbModule = await import('../db/database');

describe('database operations', () => {
  beforeEach(() => {
    try { dbModule.closeDatabase(); } catch {}
    try { rmSync(dbPath, { force: true }); } catch {}
    try { rmSync(dbPath + '-wal', { force: true }); } catch {}
    try { rmSync(dbPath + '-shm', { force: true }); } catch {}
    dbModule.initDatabase();
  });

  afterEach(() => {
    try { dbModule.closeDatabase(); } catch {}
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
      const db = dbModule.getDb();
      const row = db.query('SELECT acknowledged_by FROM active_alarms WHERE id = ?').get(id) as { acknowledged_by: string };
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
      const db = dbModule.getDb();
      db.run("INSERT INTO contact_history (device_id, device_name, is_open, recorded_at) VALUES ('dev-1', 'Door', 0, datetime('now', '+1 second'))");
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
      const rows = dbModule.getDb().query('SELECT * FROM sensor_history').all() as { temperature: number }[];
      expect(rows).toHaveLength(1);
      expect(rows[0]!.temperature).toBe(22.5);
    });

    test('recordSensorReading handles null values', () => {
      dbModule.recordSensorReading('dev-1', 'TRV', null, null, 21, null);
      const rows = dbModule.getDb().query('SELECT * FROM sensor_history').all() as { temperature: number | null; target_temp: number }[];
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
      const db = dbModule.getDb();
      db.run('UPDATE automations SET last_trigger_met = 1 WHERE id = ?', [auto.id]);
      dbModule.updateAutomation(auto.id, { name: 'Changed' });
      const row = db.query('SELECT last_trigger_met FROM automations WHERE id = ?').get(auto.id) as { last_trigger_met: number | null };
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
