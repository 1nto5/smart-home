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
