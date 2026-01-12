import { Database } from 'bun:sqlite';
import { config } from '../config';
import path from 'path';

let db: Database | null = null;

export function getDb(): Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export function initDatabase(): Database {
  const dbPath = path.resolve(__dirname, '../../', config.db.path);

  // Ensure directory exists
  const dir = path.dirname(dbPath);
  Bun.spawnSync(['mkdir', '-p', dir]);

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
    const defaultRooms = ['Salon', 'Sypialnia', 'Kuchnia', 'Łazienka', 'Korytarz', 'Biuro'];
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

  // SMS notification config - singleton table
  db.run(`
    CREATE TABLE IF NOT EXISTS sms_config (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      enabled INTEGER DEFAULT 0,
      phone_number TEXT,
      api_url TEXT,
      api_token TEXT,
      flood_alerts INTEGER DEFAULT 1,
      door_alerts INTEGER DEFAULT 1,
      cooldown_minutes INTEGER DEFAULT 5,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert default SMS config if not exists
  const smsCount = db.query('SELECT COUNT(*) as count FROM sms_config').get() as { count: number };
  if (smsCount.count === 0) {
    db.run('INSERT INTO sms_config (id, enabled, cooldown_minutes) VALUES (1, 0, 5)');
  }

  // SMS notification log
  db.run(`
    CREATE TABLE IF NOT EXISTS sms_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT,
      device_name TEXT,
      alert_type TEXT NOT NULL,
      phone_number TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL,
      error_message TEXT,
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_sms_log_time
          ON sms_log(sent_at DESC)`);

  // Voice call notification config (Twilio) - singleton table
  db.run(`
    CREATE TABLE IF NOT EXISTS voice_config (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      enabled INTEGER DEFAULT 0,
      twilio_account_sid TEXT,
      twilio_auth_token TEXT,
      twilio_from_number TEXT,
      to_number TEXT,
      flood_alerts INTEGER DEFAULT 1,
      door_alerts INTEGER DEFAULT 1,
      cooldown_minutes INTEGER DEFAULT 5,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert default voice config if not exists
  const voiceCount = db.query('SELECT COUNT(*) as count FROM voice_config').get() as { count: number };
  if (voiceCount.count === 0) {
    db.run('INSERT INTO voice_config (id, enabled, cooldown_minutes) VALUES (1, 0, 5)');
  }

  // Voice call log
  db.run(`
    CREATE TABLE IF NOT EXISTS voice_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT,
      device_name TEXT,
      alert_type TEXT NOT NULL,
      to_number TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL,
      call_sid TEXT,
      error_message TEXT,
      called_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_voice_log_time
          ON voice_log(called_at DESC)`);

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

// === SMS NOTIFICATIONS ===

export interface SmsConfig {
  enabled: boolean;
  phone_number: string | null;
  api_url: string | null;
  api_token: string | null;
  flood_alerts: boolean;
  door_alerts: boolean;
  cooldown_minutes: number;
  updated_at: string;
}

export function getSmsConfig(): SmsConfig {
  const database = getDb();
  const result = database.query('SELECT * FROM sms_config WHERE id = 1').get() as any;
  return {
    enabled: result.enabled === 1,
    phone_number: result.phone_number,
    api_url: result.api_url,
    api_token: result.api_token,
    flood_alerts: result.flood_alerts === 1,
    door_alerts: result.door_alerts === 1,
    cooldown_minutes: result.cooldown_minutes,
    updated_at: result.updated_at,
  };
}

export function updateSmsConfig(config: Partial<Omit<SmsConfig, 'updated_at'>>): SmsConfig {
  const database = getDb();
  const updates: string[] = [];
  const values: any[] = [];

  if (config.enabled !== undefined) {
    updates.push('enabled = ?');
    values.push(config.enabled ? 1 : 0);
  }
  if (config.phone_number !== undefined) {
    updates.push('phone_number = ?');
    values.push(config.phone_number);
  }
  if (config.api_url !== undefined) {
    updates.push('api_url = ?');
    values.push(config.api_url);
  }
  if (config.api_token !== undefined) {
    updates.push('api_token = ?');
    values.push(config.api_token);
  }
  if (config.flood_alerts !== undefined) {
    updates.push('flood_alerts = ?');
    values.push(config.flood_alerts ? 1 : 0);
  }
  if (config.door_alerts !== undefined) {
    updates.push('door_alerts = ?');
    values.push(config.door_alerts ? 1 : 0);
  }
  if (config.cooldown_minutes !== undefined) {
    updates.push('cooldown_minutes = ?');
    values.push(config.cooldown_minutes);
  }

  if (updates.length > 0) {
    updates.push('updated_at = CURRENT_TIMESTAMP');
    database.run(`UPDATE sms_config SET ${updates.join(', ')} WHERE id = 1`, values);
  }

  return getSmsConfig();
}

export interface SmsLogEntry {
  id: number;
  device_id: string | null;
  device_name: string | null;
  alert_type: string;
  phone_number: string;
  message: string;
  status: string;
  error_message: string | null;
  sent_at: string;
}

export function logSms(
  alertType: string,
  phoneNumber: string,
  message: string,
  status: 'sent' | 'failed',
  deviceId?: string,
  deviceName?: string,
  errorMessage?: string
): void {
  const database = getDb();
  database.run(
    `INSERT INTO sms_log (device_id, device_name, alert_type, phone_number, message, status, error_message)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [deviceId || null, deviceName || null, alertType, phoneNumber, message, status, errorMessage || null]
  );
}

export function getSmsLog(limit: number = 50): SmsLogEntry[] {
  const database = getDb();
  return database.query('SELECT * FROM sms_log ORDER BY sent_at DESC LIMIT ?').all(limit) as SmsLogEntry[];
}

export function getLastSmsTime(alertType: string, deviceId?: string): Date | null {
  const database = getDb();
  let query = 'SELECT sent_at FROM sms_log WHERE alert_type = ? AND status = \'sent\'';
  const params: any[] = [alertType];

  if (deviceId) {
    query += ' AND device_id = ?';
    params.push(deviceId);
  }

  query += ' ORDER BY sent_at DESC LIMIT 1';

  const result = database.query(query).get(...params) as { sent_at: string } | null;
  return result ? new Date(result.sent_at) : null;
}

// === VOICE CALL NOTIFICATIONS (Twilio) ===

export interface VoiceConfig {
  enabled: boolean;
  twilio_account_sid: string | null;
  twilio_auth_token: string | null;
  twilio_from_number: string | null;
  to_number: string | null;
  flood_alerts: boolean;
  door_alerts: boolean;
  cooldown_minutes: number;
  updated_at: string;
}

export function getVoiceConfig(): VoiceConfig {
  const database = getDb();
  const result = database.query('SELECT * FROM voice_config WHERE id = 1').get() as any;
  return {
    enabled: result.enabled === 1,
    twilio_account_sid: result.twilio_account_sid,
    twilio_auth_token: result.twilio_auth_token,
    twilio_from_number: result.twilio_from_number,
    to_number: result.to_number,
    flood_alerts: result.flood_alerts === 1,
    door_alerts: result.door_alerts === 1,
    cooldown_minutes: result.cooldown_minutes,
    updated_at: result.updated_at,
  };
}

export function updateVoiceConfig(config: Partial<Omit<VoiceConfig, 'updated_at'>>): VoiceConfig {
  const database = getDb();
  const updates: string[] = [];
  const values: any[] = [];

  if (config.enabled !== undefined) {
    updates.push('enabled = ?');
    values.push(config.enabled ? 1 : 0);
  }
  if (config.twilio_account_sid !== undefined) {
    updates.push('twilio_account_sid = ?');
    values.push(config.twilio_account_sid);
  }
  if (config.twilio_auth_token !== undefined) {
    updates.push('twilio_auth_token = ?');
    values.push(config.twilio_auth_token);
  }
  if (config.twilio_from_number !== undefined) {
    updates.push('twilio_from_number = ?');
    values.push(config.twilio_from_number);
  }
  if (config.to_number !== undefined) {
    updates.push('to_number = ?');
    values.push(config.to_number);
  }
  if (config.flood_alerts !== undefined) {
    updates.push('flood_alerts = ?');
    values.push(config.flood_alerts ? 1 : 0);
  }
  if (config.door_alerts !== undefined) {
    updates.push('door_alerts = ?');
    values.push(config.door_alerts ? 1 : 0);
  }
  if (config.cooldown_minutes !== undefined) {
    updates.push('cooldown_minutes = ?');
    values.push(config.cooldown_minutes);
  }

  if (updates.length > 0) {
    updates.push('updated_at = CURRENT_TIMESTAMP');
    database.run(`UPDATE voice_config SET ${updates.join(', ')} WHERE id = 1`, values);
  }

  return getVoiceConfig();
}

export interface VoiceLogEntry {
  id: number;
  device_id: string | null;
  device_name: string | null;
  alert_type: string;
  to_number: string;
  message: string;
  status: string;
  call_sid: string | null;
  error_message: string | null;
  called_at: string;
}

export function logVoiceCall(
  alertType: string,
  toNumber: string,
  message: string,
  status: 'initiated' | 'failed',
  deviceId?: string,
  deviceName?: string,
  callSid?: string,
  errorMessage?: string
): void {
  const database = getDb();
  database.run(
    `INSERT INTO voice_log (device_id, device_name, alert_type, to_number, message, status, call_sid, error_message)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [deviceId || null, deviceName || null, alertType, toNumber, message, status, callSid || null, errorMessage || null]
  );
}

export function getVoiceLog(limit: number = 50): VoiceLogEntry[] {
  const database = getDb();
  return database.query('SELECT * FROM voice_log ORDER BY called_at DESC LIMIT ?').all(limit) as VoiceLogEntry[];
}

export function getLastVoiceCallTime(alertType: string, deviceId?: string): Date | null {
  const database = getDb();
  let query = 'SELECT called_at FROM voice_log WHERE alert_type = ? AND status = \'initiated\'';
  const params: any[] = [alertType];

  if (deviceId) {
    query += ' AND device_id = ?';
    params.push(deviceId);
  }

  query += ' ORDER BY called_at DESC LIMIT 1';

  const result = database.query(query).get(...params) as { called_at: string } | null;
  return result ? new Date(result.called_at) : null;
}

// === TELEGRAM NOTIFICATIONS ===

export interface TelegramConfig {
  enabled: boolean;
  bot_token: string | null;
  chat_id: string | null;
  flood_alerts: boolean;
  door_alerts: boolean;
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
