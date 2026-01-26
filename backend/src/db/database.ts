import { Database } from 'bun:sqlite';
import { config } from '../config';
import path from 'path';
import { mkdirSync, existsSync } from 'fs';

let db: Database | null = null;

export function getDb(): Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export function initDatabase(): Database {
  const dbPath = path.resolve(__dirname, '../../', config.db.path);

  // Ensure directory exists (cross-platform)
  const dir = path.dirname(dbPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  db = new Database(dbPath);

  // Enable WAL mode for better concurrency
  db.run('PRAGMA journal_mode = WAL');

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      local_key TEXT,
      uuid TEXT,
      node_id TEXT,
      gateway_id TEXT,
      category TEXT,
      product_name TEXT,
      online INTEGER DEFAULT 0,
      ip TEXT,
      model TEXT,
      room TEXT,
      type TEXT,
      last_status TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS device_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT NOT NULL,
      status_json TEXT NOT NULL,
      recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (device_id) REFERENCES devices(id)
    )
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_history_device_time
    ON device_history(device_id, recorded_at DESC)
  `);

  // Xiaomi devices table
  db.run(`
    CREATE TABLE IF NOT EXISTS xiaomi_devices (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      ip TEXT,
      token TEXT,
      model TEXT,
      category TEXT,
      room TEXT,
      online INTEGER DEFAULT 0,
      last_status TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Yamaha devices table
  db.run(`
    CREATE TABLE IF NOT EXISTS yamaha_devices (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      ip TEXT NOT NULL,
      model TEXT,
      room TEXT,
      online INTEGER DEFAULT 0,
      last_status TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      icon TEXT,
      sort_order INTEGER DEFAULT 0
    )
  `);

  // Insert some default rooms if empty
  const roomCount = db.query('SELECT COUNT(*) as count FROM rooms').get() as { count: number };
  if (roomCount.count === 0) {
    const defaultRooms = ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Hallway', 'Office'];
    const insertRoom = db.prepare('INSERT INTO rooms (name, sort_order) VALUES (?, ?)');
    defaultRooms.forEach((room, i) => {
      insertRoom.run(room, i);
    });
  }

  // Lamp presets (configurable via UI)
  db.run(`
    CREATE TABLE IF NOT EXISTS lamp_presets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      brightness INTEGER NOT NULL,
      color_temp INTEGER NOT NULL,
      power INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert default lamp presets if empty
  const lampPresetCount = db.query('SELECT COUNT(*) as count FROM lamp_presets').get() as { count: number };
  if (lampPresetCount.count === 0) {
    const defaultPresets = [
      { id: 'day', name: 'Day Mode', brightness: 100, color_temp: 5000, power: 1 },
      { id: 'night', name: 'Night Mode', brightness: 30, color_temp: 2700, power: 1 },
      { id: 'moonlight', name: 'Moonlight', brightness: 10, color_temp: 2700, power: 1 },
      { id: 'off', name: 'All Off', brightness: 0, color_temp: 4000, power: 0 },
    ];
    const insertPreset = db.prepare('INSERT INTO lamp_presets (id, name, brightness, color_temp, power) VALUES (?, ?, ?, ?, ?)');
    for (const p of defaultPresets) {
      insertPreset.run(p.id, p.name, p.brightness, p.color_temp, p.power);
    }
  }

  // Lamp schedules (time-of-day based)
  db.run(`
    CREATE TABLE IF NOT EXISTS lamp_schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      preset TEXT NOT NULL,
      time TEXT NOT NULL,
      enabled INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert default schedules if empty
  const scheduleCount = db.query('SELECT COUNT(*) as count FROM lamp_schedules').get() as { count: number };
  if (scheduleCount.count === 0) {
    const defaultSchedules = [
      { name: 'Day mode', preset: 'day', time: '06:00' },
      { name: 'Night mode', preset: 'night', time: '18:00' },
      { name: 'Moonlight mode', preset: 'moonlight', time: '21:00' },
    ];
    const insertSchedule = db.prepare('INSERT INTO lamp_schedules (name, preset, time) VALUES (?, ?, ?)');
    for (const s of defaultSchedules) {
      insertSchedule.run(s.name, s.preset, s.time);
    }
  }

  // Pending lamp actions (for offline lamps)
  db.run(`
    CREATE TABLE IF NOT EXISTS pending_lamp_actions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT NOT NULL,
      preset TEXT NOT NULL,
      schedule_id INTEGER,
      retry_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (device_id) REFERENCES xiaomi_devices(id),
      FOREIGN KEY (schedule_id) REFERENCES lamp_schedules(id)
    )
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_pending_device
    ON pending_lamp_actions(device_id)
  `);

  // Heater presets (configurable via UI)
  db.run(`
    CREATE TABLE IF NOT EXISTS heater_presets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      target_temp REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert default heater presets if empty
  const heaterPresetCount = db.query('SELECT COUNT(*) as count FROM heater_presets').get() as { count: number };
  if (heaterPresetCount.count === 0) {
    const defaultPresets = [
      { id: 'comfort', name: 'Comfort', target_temp: 21 },
      { id: 'eco', name: 'Eco', target_temp: 18 },
      { id: 'night', name: 'Night', target_temp: 16 },
      { id: 'off', name: 'Off', target_temp: 5 },
    ];
    const insertPreset = db.prepare('INSERT INTO heater_presets (id, name, target_temp) VALUES (?, ?, ?)');
    for (const p of defaultPresets) {
      insertPreset.run(p.id, p.name, p.target_temp);
    }
  }

  // Per-device heater preset temperatures (overrides default preset temp)
  db.run(`
    CREATE TABLE IF NOT EXISTS heater_preset_devices (
      preset_id TEXT NOT NULL,
      device_id TEXT NOT NULL,
      target_temp REAL NOT NULL,
      PRIMARY KEY (preset_id, device_id),
      FOREIGN KEY (preset_id) REFERENCES heater_presets(id) ON DELETE CASCADE
    )
  `);

  // Heater schedules
  db.run(`
    CREATE TABLE IF NOT EXISTS heater_schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      preset_id TEXT NOT NULL,
      time TEXT NOT NULL,
      enabled INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (preset_id) REFERENCES heater_presets(id)
    )
  `);

  // Insert default heater schedules if empty
  const heaterScheduleCount = db.query('SELECT COUNT(*) as count FROM heater_schedules').get() as { count: number };
  if (heaterScheduleCount.count === 0) {
    const defaultSchedules = [
      { name: 'Morning Warmup', preset_id: 'comfort', time: '06:00' },
      { name: 'Night Mode', preset_id: 'night', time: '22:00' },
    ];
    const insertSchedule = db.prepare('INSERT INTO heater_schedules (name, preset_id, time) VALUES (?, ?, ?)');
    for (const s of defaultSchedules) {
      insertSchedule.run(s.name, s.preset_id, s.time);
    }
  }

  // Pending heater actions (for offline TRVs)
  db.run(`
    CREATE TABLE IF NOT EXISTS pending_heater_actions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT NOT NULL,
      preset_id TEXT NOT NULL,
      schedule_id INTEGER,
      retry_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (preset_id) REFERENCES heater_presets(id),
      FOREIGN KEY (schedule_id) REFERENCES heater_schedules(id)
    )
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_pending_heater_device
    ON pending_heater_actions(device_id)
  `);

  // Heater override (vacation/pause mode) - singleton table
  db.run(`
    CREATE TABLE IF NOT EXISTS heater_override (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      enabled INTEGER DEFAULT 0,
      mode TEXT DEFAULT 'pause',
      fixed_temp REAL DEFAULT 18,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert default override row if not exists
  const overrideCount = db.query('SELECT COUNT(*) as count FROM heater_override').get() as { count: number };
  if (overrideCount.count === 0) {
    db.run('INSERT INTO heater_override (id, enabled, mode, fixed_temp) VALUES (1, 0, \'pause\', 18)');
  }

  // Sensor history (temperature, humidity, battery)
  db.run(`
    CREATE TABLE IF NOT EXISTS sensor_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT NOT NULL,
      device_name TEXT,
      temperature REAL,
      humidity REAL,
      target_temp REAL,
      battery INTEGER,
      recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (device_id) REFERENCES devices(id)
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_sensor_history_device_time
          ON sensor_history(device_id, recorded_at DESC)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_sensor_history_time
          ON sensor_history(recorded_at DESC)`);

  // Contact history (door/window open/close events)
  db.run(`
    CREATE TABLE IF NOT EXISTS contact_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT NOT NULL,
      device_name TEXT,
      is_open INTEGER NOT NULL,
      recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (device_id) REFERENCES devices(id)
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_contact_history_device_time
          ON contact_history(device_id, recorded_at DESC)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_contact_history_time
          ON contact_history(recorded_at DESC)`);

  // Alarm system - singleton table for armed/disarmed state
  db.run(`
    CREATE TABLE IF NOT EXISTS alarm_config (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      armed INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert default alarm config if not exists
  const alarmCount = db.query('SELECT COUNT(*) as count FROM alarm_config').get() as { count: number };
  if (alarmCount.count === 0) {
    db.run('INSERT INTO alarm_config (id, armed) VALUES (1, 0)');
  }

  // Telegram notification config - singleton table
  db.run(`
    CREATE TABLE IF NOT EXISTS telegram_config (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      enabled INTEGER DEFAULT 0,
      bot_token TEXT,
      chat_id TEXT,
      flood_alerts INTEGER DEFAULT 1,
      door_alerts INTEGER DEFAULT 1,
      cooldown_minutes INTEGER DEFAULT 5,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert default Telegram config if not exists
  const telegramCount = db.query('SELECT COUNT(*) as count FROM telegram_config').get() as { count: number };
  if (telegramCount.count === 0) {
    db.run('INSERT INTO telegram_config (id, enabled, cooldown_minutes) VALUES (1, 0, 5)');
  }

  // Migration: Add error_alerts column to telegram_config
  const telegramCols = db.query("PRAGMA table_info(telegram_config)").all() as { name: string }[];
  if (!telegramCols.some(c => c.name === 'error_alerts')) {
    db.run('ALTER TABLE telegram_config ADD COLUMN error_alerts INTEGER DEFAULT 1');
  }

  // Telegram notification log
  db.run(`
    CREATE TABLE IF NOT EXISTS telegram_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT,
      device_name TEXT,
      alert_type TEXT NOT NULL,
      chat_id TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL,
      error_message TEXT,
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_telegram_log_time
          ON telegram_log(sent_at DESC)`);

  // Telegram bot polling offset - singleton table
  db.run(`
    CREATE TABLE IF NOT EXISTS telegram_updates_offset (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      offset INTEGER DEFAULT 0
    )
  `);

  // Active alarms - for persistent notifications until acknowledged
  db.run(`
    CREATE TABLE IF NOT EXISTS active_alarms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      alarm_type TEXT NOT NULL,
      device_id TEXT NOT NULL,
      device_name TEXT NOT NULL,
      triggered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      acknowledged_at DATETIME,
      acknowledged_by TEXT
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_active_alarms_unack
          ON active_alarms(acknowledged_at) WHERE acknowledged_at IS NULL`);

  // Home status - tracking current presets (singleton table)
  db.run(`
    CREATE TABLE IF NOT EXISTS home_status (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      lamp_preset TEXT,
      heater_preset TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert default home status if not exists
  const homeStatusCount = db.query('SELECT COUNT(*) as count FROM home_status').get() as { count: number };
  if (homeStatusCount.count === 0) {
    db.run('INSERT INTO home_status (id, lamp_preset, heater_preset) VALUES (1, NULL, NULL)');
  }

  // Automations (IF-THEN rules)
  db.run(`
    CREATE TABLE IF NOT EXISTS automations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      enabled INTEGER DEFAULT 1,
      trigger_type TEXT NOT NULL,
      trigger_device_id TEXT,
      trigger_condition TEXT NOT NULL,
      actions TEXT NOT NULL,
      telegram_prompt TEXT,
      telegram_action_yes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migration: Add quiet_windows column (replaces quiet_start/quiet_end)
  const automationsCols = db.query("PRAGMA table_info(automations)").all() as { name: string }[];
  const hasQuietWindows = automationsCols.some(c => c.name === 'quiet_windows');
  if (!hasQuietWindows) {
    db.run('ALTER TABLE automations ADD COLUMN quiet_windows TEXT');
    // Migrate existing quiet_start/quiet_end data
    const hasQuietStart = automationsCols.some(c => c.name === 'quiet_start');
    if (hasQuietStart) {
      db.run(`
        UPDATE automations
        SET quiet_windows = json_array(json_object('start', quiet_start, 'end', quiet_end))
        WHERE quiet_start IS NOT NULL AND quiet_end IS NOT NULL
      `);
    }
  }

  // Automation pending confirmations (Telegram prompts awaiting response)
  db.run(`
    CREATE TABLE IF NOT EXISTS automation_pending (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      automation_id INTEGER NOT NULL,
      trigger_device_name TEXT,
      room TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (automation_id) REFERENCES automations(id) ON DELETE CASCADE
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_automation_pending_status ON automation_pending(status)`);

  // Automation execution log
  db.run(`
    CREATE TABLE IF NOT EXISTS automation_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      automation_name TEXT,
      trigger_device_name TEXT,
      action_executed TEXT,
      result TEXT,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_automation_log_time ON automation_log(executed_at DESC)`);

  console.log(`📦 Database initialized: ${dbPath}`);
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

// Data retention: cleanup records older than specified days (default 180 = 6 months)
export function cleanupOldHistory(days: number = 180): number {
  const database = getDb();
  const deviceHistory = database.run(
    `DELETE FROM device_history WHERE recorded_at < datetime('now', '-' || ? || ' days')`,
    [days]
  );
  const sensorHistory = database.run(
    `DELETE FROM sensor_history WHERE recorded_at < datetime('now', '-' || ? || ' days')`,
    [days]
  );
  const contactHistory = database.run(
    `DELETE FROM contact_history WHERE recorded_at < datetime('now', '-' || ? || ' days')`,
    [days]
  );
  return deviceHistory.changes + sensorHistory.changes + contactHistory.changes;
}

// Record temperature/humidity reading from weather station or TRV
export function recordSensorReading(
  deviceId: string,
  deviceName: string,
  temperature: number | null,
  humidity: number | null,
  targetTemp: number | null,
  battery: number | null
): void {
  const database = getDb();
  database.run(
    `INSERT INTO sensor_history (device_id, device_name, temperature, humidity, target_temp, battery)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [deviceId, deviceName, temperature, humidity, targetTemp, battery]
  );
}

// Record door/window state change
export function recordContactChange(
  deviceId: string,
  deviceName: string,
  isOpen: boolean
): void {
  const database = getDb();
  database.run(
    `INSERT INTO contact_history (device_id, device_name, is_open)
     VALUES (?, ?, ?)`,
    [deviceId, deviceName, isOpen ? 1 : 0]
  );
}

// Get last known contact state for a device
export function getLastContactState(deviceId: string): boolean | null {
  const database = getDb();
  const result = database.query(
    `SELECT is_open FROM contact_history WHERE device_id = ? ORDER BY recorded_at DESC LIMIT 1`
  ).get(deviceId) as { is_open: number } | null;
  return result ? result.is_open === 1 : null;
}

// === ALARM SYSTEM ===

export interface AlarmConfig {
  armed: boolean;
  updated_at: string;
}

export function getAlarmConfig(): AlarmConfig {
  const database = getDb();
  const result = database.query('SELECT armed, updated_at FROM alarm_config WHERE id = 1').get() as { armed: number; updated_at: string };
  return {
    armed: result.armed === 1,
    updated_at: result.updated_at,
  };
}

export function setAlarmArmed(armed: boolean): AlarmConfig {
  const database = getDb();
  database.run('UPDATE alarm_config SET armed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1', [armed ? 1 : 0]);
  return getAlarmConfig();
}

// === TELEGRAM NOTIFICATIONS ===

export interface TelegramConfig {
  enabled: boolean;
  bot_token: string | null;
  chat_id: string | null;
  flood_alerts: boolean;
  door_alerts: boolean;
  error_alerts: boolean;
  cooldown_minutes: number;
  updated_at: string;
}

export function getTelegramConfig(): TelegramConfig {
  const database = getDb();
  const result = database.query('SELECT * FROM telegram_config WHERE id = 1').get() as any;
  return {
    enabled: result.enabled === 1,
    bot_token: result.bot_token,
    chat_id: result.chat_id,
    flood_alerts: result.flood_alerts === 1,
    door_alerts: result.door_alerts === 1,
    error_alerts: result.error_alerts !== 0, // default true
    cooldown_minutes: result.cooldown_minutes,
    updated_at: result.updated_at,
  };
}

export function updateTelegramConfig(config: Partial<Omit<TelegramConfig, 'updated_at'>>): TelegramConfig {
  const database = getDb();
  const updates: string[] = [];
  const values: any[] = [];

  if (config.enabled !== undefined) {
    updates.push('enabled = ?');
    values.push(config.enabled ? 1 : 0);
  }
  if (config.bot_token !== undefined) {
    updates.push('bot_token = ?');
    values.push(config.bot_token);
  }
  if (config.chat_id !== undefined) {
    updates.push('chat_id = ?');
    values.push(config.chat_id);
  }
  if (config.flood_alerts !== undefined) {
    updates.push('flood_alerts = ?');
    values.push(config.flood_alerts ? 1 : 0);
  }
  if (config.door_alerts !== undefined) {
    updates.push('door_alerts = ?');
    values.push(config.door_alerts ? 1 : 0);
  }
  if (config.error_alerts !== undefined) {
    updates.push('error_alerts = ?');
    values.push(config.error_alerts ? 1 : 0);
  }
  if (config.cooldown_minutes !== undefined) {
    updates.push('cooldown_minutes = ?');
    values.push(config.cooldown_minutes);
  }

  if (updates.length > 0) {
    updates.push('updated_at = CURRENT_TIMESTAMP');
    database.run(`UPDATE telegram_config SET ${updates.join(', ')} WHERE id = 1`, values);
  }

  return getTelegramConfig();
}

export interface TelegramLogEntry {
  id: number;
  device_id: string | null;
  device_name: string | null;
  alert_type: string;
  chat_id: string;
  message: string;
  status: string;
  error_message: string | null;
  sent_at: string;
}

export function logTelegram(
  alertType: string,
  chatId: string,
  message: string,
  status: 'sent' | 'failed',
  deviceId?: string,
  deviceName?: string,
  errorMessage?: string
): void {
  const database = getDb();
  database.run(
    `INSERT INTO telegram_log (device_id, device_name, alert_type, chat_id, message, status, error_message)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [deviceId || null, deviceName || null, alertType, chatId, message, status, errorMessage || null]
  );
}

export function getTelegramLog(limit: number = 50): TelegramLogEntry[] {
  const database = getDb();
  return database.query('SELECT * FROM telegram_log ORDER BY sent_at DESC LIMIT ?').all(limit) as TelegramLogEntry[];
}

export function getLastTelegramTime(alertType: string, deviceId?: string): Date | null {
  const database = getDb();
  let query = 'SELECT sent_at FROM telegram_log WHERE alert_type = ? AND status = \'sent\'';
  const params: any[] = [alertType];

  if (deviceId) {
    query += ' AND device_id = ?';
    params.push(deviceId);
  }

  query += ' ORDER BY sent_at DESC LIMIT 1';

  const result = database.query(query).get(...params) as { sent_at: string } | null;
  return result ? new Date(result.sent_at) : null;
}

// === TELEGRAM BOT POLLING OFFSET ===

export function getUpdateOffset(): number {
  const database = getDb();
  const result = database.query('SELECT offset FROM telegram_updates_offset WHERE id = 1').get() as { offset: number } | null;
  return result?.offset ?? 0;
}

export function setUpdateOffset(offset: number): void {
  const database = getDb();
  database.run('INSERT OR REPLACE INTO telegram_updates_offset (id, offset) VALUES (1, ?)', [offset]);
}

// === HOME STATUS ===

export interface HomeStatus {
  lamp_preset: string | null;
  heater_preset: string | null;
  updated_at: string;
}

export function getHomeStatus(): HomeStatus {
  const database = getDb();
  const result = database.query('SELECT lamp_preset, heater_preset, updated_at FROM home_status WHERE id = 1').get() as HomeStatus;
  return result;
}

export function setLampPreset(presetId: string | null): void {
  const database = getDb();
  database.run('UPDATE home_status SET lamp_preset = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1', [presetId]);
}

export function setHeaterPreset(presetId: string | null): void {
  const database = getDb();
  database.run('UPDATE home_status SET heater_preset = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1', [presetId]);
}

// === ACTIVE ALARMS (Persistent notifications) ===

export type AlarmType = 'flood' | 'door';

export interface ActiveAlarm {
  id: number;
  alarm_type: AlarmType;
  device_id: string;
  device_name: string;
  triggered_at: string;
  acknowledged_at: string | null;
  acknowledged_by: string | null;
}

export function createActiveAlarm(
  alarmType: AlarmType,
  deviceId: string,
  deviceName: string
): number {
  const database = getDb();
  const result = database.run(
    `INSERT INTO active_alarms (alarm_type, device_id, device_name) VALUES (?, ?, ?)`,
    [alarmType, deviceId, deviceName]
  );
  return Number(result.lastInsertRowid);
}

export function getActiveAlarms(): ActiveAlarm[] {
  const database = getDb();
  return database.query(
    `SELECT * FROM active_alarms WHERE acknowledged_at IS NULL ORDER BY triggered_at DESC`
  ).all() as ActiveAlarm[];
}

export function acknowledgeAlarm(alarmId: number, by: string = 'telegram'): void {
  const database = getDb();
  database.run(
    `UPDATE active_alarms SET acknowledged_at = CURRENT_TIMESTAMP, acknowledged_by = ? WHERE id = ?`,
    [by, alarmId]
  );
}

export function acknowledgeAllAlarms(alarmType?: AlarmType, by: string = 'telegram'): number {
  const database = getDb();
  let query = `UPDATE active_alarms SET acknowledged_at = CURRENT_TIMESTAMP, acknowledged_by = ? WHERE acknowledged_at IS NULL`;
  const params: any[] = [by];

  if (alarmType) {
    query += ` AND alarm_type = ?`;
    params.push(alarmType);
  }

  const result = database.run(query, params);
  return result.changes;
}

export function hasActiveAlarmForDevice(deviceId: string): boolean {
  const database = getDb();
  const result = database.query(
    `SELECT 1 FROM active_alarms WHERE device_id = ? AND acknowledged_at IS NULL LIMIT 1`
  ).get(deviceId);
  return result !== null;
}

// === AUTOMATIONS ===

export interface Automation {
  id: number;
  name: string;
  enabled: number;
  trigger_type: string;
  trigger_device_id: string | null;
  trigger_condition: string;
  actions: string; // JSON array
  telegram_prompt: string | null;
  telegram_action_yes: string | null;
  quiet_windows: string | null; // JSON array of {start: string, end: string}
  created_at: string;
}

export interface AutomationPending {
  id: number;
  automation_id: number;
  trigger_device_name: string | null;
  room: string | null;
  status: 'pending' | 'confirmed' | 'declined' | 'expired';
  created_at: string;
}

export interface AutomationLog {
  id: number;
  automation_name: string;
  trigger_device_name: string | null;
  action_executed: string;
  result: string;
  executed_at: string;
}

export function getAutomations(): Automation[] {
  const database = getDb();
  return database.query('SELECT * FROM automations ORDER BY name').all() as Automation[];
}

export function getAutomation(id: number): Automation | null {
  const database = getDb();
  return database.query('SELECT * FROM automations WHERE id = ?').get(id) as Automation | null;
}

export function createAutomation(automation: Omit<Automation, 'id' | 'created_at'>): Automation {
  const database = getDb();
  const result = database.run(
    `INSERT INTO automations (name, enabled, trigger_type, trigger_device_id, trigger_condition, actions, telegram_prompt, telegram_action_yes, quiet_windows)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      automation.name,
      automation.enabled ?? 1,
      automation.trigger_type,
      automation.trigger_device_id,
      automation.trigger_condition,
      automation.actions,
      automation.telegram_prompt,
      automation.telegram_action_yes,
      automation.quiet_windows,
    ]
  );
  return getAutomation(Number(result.lastInsertRowid))!;
}

export function updateAutomation(id: number, updates: Partial<Omit<Automation, 'id' | 'created_at'>>): Automation | null {
  const database = getDb();
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
  if (updates.enabled !== undefined) { fields.push('enabled = ?'); values.push(updates.enabled); }
  if (updates.trigger_type !== undefined) { fields.push('trigger_type = ?'); values.push(updates.trigger_type); }
  if (updates.trigger_device_id !== undefined) { fields.push('trigger_device_id = ?'); values.push(updates.trigger_device_id); }
  if (updates.trigger_condition !== undefined) { fields.push('trigger_condition = ?'); values.push(updates.trigger_condition); }
  if (updates.actions !== undefined) { fields.push('actions = ?'); values.push(updates.actions); }
  if (updates.telegram_prompt !== undefined) { fields.push('telegram_prompt = ?'); values.push(updates.telegram_prompt); }
  if (updates.telegram_action_yes !== undefined) { fields.push('telegram_action_yes = ?'); values.push(updates.telegram_action_yes); }
  if (updates.quiet_windows !== undefined) { fields.push('quiet_windows = ?'); values.push(updates.quiet_windows); }

  if (fields.length === 0) return getAutomation(id);

  values.push(id);
  database.run(`UPDATE automations SET ${fields.join(', ')} WHERE id = ?`, values);
  return getAutomation(id);
}

export function deleteAutomation(id: number): boolean {
  const database = getDb();
  const result = database.run('DELETE FROM automations WHERE id = ?', [id]);
  return result.changes > 0;
}

export function toggleAutomation(id: number): Automation | null {
  const database = getDb();
  database.run('UPDATE automations SET enabled = CASE WHEN enabled = 1 THEN 0 ELSE 1 END WHERE id = ?', [id]);
  return getAutomation(id);
}

export function getEnabledAutomationsForTrigger(triggerType: string, condition: string, deviceId?: string): Automation[] {
  const database = getDb();
  return database.query(`
    SELECT * FROM automations
    WHERE enabled = 1
    AND trigger_type = ?
    AND trigger_condition = ?
    AND (trigger_device_id IS NULL OR trigger_device_id = ?)
  `).all(triggerType, condition, deviceId || null) as Automation[];
}

// Automation pending confirmations
export function createAutomationPending(automationId: number, triggerDeviceName: string | null, room: string | null): number {
  const database = getDb();
  const result = database.run(
    `INSERT INTO automation_pending (automation_id, trigger_device_name, room) VALUES (?, ?, ?)`,
    [automationId, triggerDeviceName, room]
  );
  return Number(result.lastInsertRowid);
}

export function getAutomationPending(id: number): (AutomationPending & Automation) | null {
  const database = getDb();
  return database.query(`
    SELECT ap.*, a.name, a.actions, a.telegram_prompt, a.telegram_action_yes
    FROM automation_pending ap
    JOIN automations a ON ap.automation_id = a.id
    WHERE ap.id = ? AND ap.status = 'pending'
  `).get(id) as (AutomationPending & Automation) | null;
}

export function updateAutomationPendingStatus(id: number, status: 'confirmed' | 'declined' | 'expired'): void {
  const database = getDb();
  database.run('UPDATE automation_pending SET status = ? WHERE id = ?', [status, id]);
}

export function expireOldPendingAutomations(minutesOld: number = 5): number {
  const database = getDb();
  const result = database.run(
    `UPDATE automation_pending SET status = 'expired' WHERE status = 'pending' AND created_at < datetime('now', '-' || ? || ' minutes')`,
    [minutesOld]
  );
  return result.changes;
}

// Automation log
export function logAutomation(automationName: string, triggerDeviceName: string | null, actionExecuted: string, result: string): void {
  const database = getDb();
  database.run(
    `INSERT INTO automation_log (automation_name, trigger_device_name, action_executed, result) VALUES (?, ?, ?, ?)`,
    [automationName, triggerDeviceName, actionExecuted, result]
  );
}

export function getAutomationLog(limit: number = 50): AutomationLog[] {
  const database = getDb();
  return database.query('SELECT * FROM automation_log ORDER BY executed_at DESC LIMIT ?').all(limit) as AutomationLog[];
}
