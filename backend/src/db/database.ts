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

  console.log(`📦 Database initialized: ${dbPath}`);
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
