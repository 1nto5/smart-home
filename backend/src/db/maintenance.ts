import { getDb } from './database';

export interface RetentionConfig {
  sensorHistoryDays: number;
  deviceHistoryDays: number;
  contactHistoryDays: number;
  telegramLogDays: number;
  automationLogDays: number;
}

const DEFAULT_RETENTION: RetentionConfig = {
  sensorHistoryDays: 90,
  deviceHistoryDays: 30,
  contactHistoryDays: 180,
  telegramLogDays: 30,
  automationLogDays: 30,
};

export interface CleanupResult {
  sensorHistory: number;
  deviceHistory: number;
  contactHistory: number;
  telegramLog: number;
  automationLog: number;
  totalDeleted: number;
  duration: number;
}

export function cleanupOldData(config: RetentionConfig = DEFAULT_RETENTION): CleanupResult {
  const start = Date.now();
  const db = getDb();

  const sensorHistory = db.run(
    `DELETE FROM sensor_history WHERE recorded_at < datetime('now', '-' || ? || ' days')`,
    [config.sensorHistoryDays]
  ).changes;

  const deviceHistory = db.run(
    `DELETE FROM device_history WHERE recorded_at < datetime('now', '-' || ? || ' days')`,
    [config.deviceHistoryDays]
  ).changes;

  const contactHistory = db.run(
    `DELETE FROM contact_history WHERE recorded_at < datetime('now', '-' || ? || ' days')`,
    [config.contactHistoryDays]
  ).changes;

  const telegramLog = db.run(
    `DELETE FROM telegram_log WHERE sent_at < datetime('now', '-' || ? || ' days')`,
    [config.telegramLogDays]
  ).changes;

  const automationLog = db.run(
    `DELETE FROM automation_log WHERE executed_at < datetime('now', '-' || ? || ' days')`,
    [config.automationLogDays]
  ).changes;

  // Vacuum to reclaim space after large deletions
  const totalDeleted = sensorHistory + deviceHistory + contactHistory + telegramLog + automationLog;
  if (totalDeleted > 1000) {
    db.run('VACUUM');
  }

  return {
    sensorHistory,
    deviceHistory,
    contactHistory,
    telegramLog,
    automationLog,
    totalDeleted,
    duration: Date.now() - start,
  };
}

export interface DbStats {
  sensorHistory: { count: number; oldestRecord: string | null; newestRecord: string | null };
  deviceHistory: { count: number; oldestRecord: string | null; newestRecord: string | null };
  contactHistory: { count: number; oldestRecord: string | null; newestRecord: string | null };
  telegramLog: { count: number; oldestRecord: string | null; newestRecord: string | null };
  automationLog: { count: number; oldestRecord: string | null; newestRecord: string | null };
  devices: { total: number; online: number };
  xiaomiDevices: { total: number; online: number };
  yamahaDevices: { total: number; online: number };
  activeAlarms: number;
  pendingAutomations: number;
  dbSizeBytes: number;
}

export function getDbStats(): DbStats {
  const db = getDb();

  const getTableStats = (table: string, timeColumn: string) => {
    const count = (db.query(`SELECT COUNT(*) as c FROM ${table}`).get() as { c: number }).c;
    const oldest = db.query(`SELECT ${timeColumn} as t FROM ${table} ORDER BY ${timeColumn} ASC LIMIT 1`).get() as { t: string } | null;
    const newest = db.query(`SELECT ${timeColumn} as t FROM ${table} ORDER BY ${timeColumn} DESC LIMIT 1`).get() as { t: string } | null;
    return { count, oldestRecord: oldest?.t ?? null, newestRecord: newest?.t ?? null };
  };

  const getDeviceStats = (table: string) => {
    const total = (db.query(`SELECT COUNT(*) as c FROM ${table}`).get() as { c: number }).c;
    const online = (db.query(`SELECT COUNT(*) as c FROM ${table} WHERE online = 1`).get() as { c: number }).c;
    return { total, online };
  };

  const dbSize = (db.query("SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()").get() as { size: number }).size;

  return {
    sensorHistory: getTableStats('sensor_history', 'recorded_at'),
    deviceHistory: getTableStats('device_history', 'recorded_at'),
    contactHistory: getTableStats('contact_history', 'recorded_at'),
    telegramLog: getTableStats('telegram_log', 'sent_at'),
    automationLog: getTableStats('automation_log', 'executed_at'),
    devices: getDeviceStats('devices'),
    xiaomiDevices: getDeviceStats('xiaomi_devices'),
    yamahaDevices: getDeviceStats('yamaha_devices'),
    activeAlarms: (db.query('SELECT COUNT(*) as c FROM active_alarms WHERE acknowledged_at IS NULL').get() as { c: number }).c,
    pendingAutomations: (db.query("SELECT COUNT(*) as c FROM automation_pending WHERE status = 'pending'").get() as { c: number }).c,
    dbSizeBytes: dbSize,
  };
}

// Scheduled maintenance - call this from a timer
let maintenanceInterval: ReturnType<typeof setInterval> | null = null;

export function startMaintenanceScheduler(): void {
  if (maintenanceInterval) return;

  const runMaintenance = () => {
    const now = new Date();
    // Run at 3 AM
    if (now.getHours() === 3 && now.getMinutes() === 0) {
      console.log('[maintenance] Running scheduled cleanup...');
      const result = cleanupOldData();
      console.log(`[maintenance] Cleanup complete: ${result.totalDeleted} records deleted in ${result.duration}ms`);
    }
  };

  // Check every minute
  maintenanceInterval = setInterval(runMaintenance, 60 * 1000);
  console.log('[maintenance] Scheduler started (runs daily at 3:00 AM)');
}

export function stopMaintenanceScheduler(): void {
  if (maintenanceInterval) {
    clearInterval(maintenanceInterval);
    maintenanceInterval = null;
    console.log('[maintenance] Scheduler stopped');
  }
}
