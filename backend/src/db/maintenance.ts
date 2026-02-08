import { getDb } from './database';
import { config } from '../config';
import { getErrorMessage } from '../utils/errors';
import { logger } from '../utils/logger';

export interface RetentionConfig {
  sensorHistoryDays: number;
  deviceHistoryDays: number;
  contactHistoryDays: number;
  telegramLogDays: number;
  automationLogDays: number;
}

export interface CleanupResult {
  sensorHistory: number;
  deviceHistory: number;
  contactHistory: number;
  telegramLog: number;
  automationLog: number;
  totalDeleted: number;
  duration: number;
}

export function cleanupOldData(retention: RetentionConfig = config.retention): CleanupResult {
  const start = Date.now();
  const db = getDb();

  // Get size before cleanup
  const sizeBefore = (db.query("SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()").get() as { size: number }).size;

  const sensorHistory = db.run(
    `DELETE FROM sensor_history WHERE recorded_at < datetime('now', '-' || ? || ' days')`,
    [retention.sensorHistoryDays]
  ).changes;
  if (sensorHistory > 0) logger.info('sensor_history cleanup', { component: 'maintenance', deletedRows: sensorHistory, retentionDays: retention.sensorHistoryDays });

  const deviceHistory = db.run(
    `DELETE FROM device_history WHERE recorded_at < datetime('now', '-' || ? || ' days')`,
    [retention.deviceHistoryDays]
  ).changes;
  if (deviceHistory > 0) logger.info('device_history cleanup', { component: 'maintenance', deletedRows: deviceHistory, retentionDays: retention.deviceHistoryDays });

  const contactHistory = db.run(
    `DELETE FROM contact_history WHERE recorded_at < datetime('now', '-' || ? || ' days')`,
    [retention.contactHistoryDays]
  ).changes;
  if (contactHistory > 0) logger.info('contact_history cleanup', { component: 'maintenance', deletedRows: contactHistory, retentionDays: retention.contactHistoryDays });

  const telegramLog = db.run(
    `DELETE FROM telegram_log WHERE sent_at < datetime('now', '-' || ? || ' days')`,
    [retention.telegramLogDays]
  ).changes;
  if (telegramLog > 0) logger.info('telegram_log cleanup', { component: 'maintenance', deletedRows: telegramLog, retentionDays: retention.telegramLogDays });

  const automationLog = db.run(
    `DELETE FROM automation_log WHERE executed_at < datetime('now', '-' || ? || ' days')`,
    [retention.automationLogDays]
  ).changes;
  if (automationLog > 0) logger.info('automation_log cleanup', { component: 'maintenance', deletedRows: automationLog, retentionDays: retention.automationLogDays });

  const totalDeleted = sensorHistory + deviceHistory + contactHistory + telegramLog + automationLog;

  // Always VACUUM to reclaim space
  db.run('VACUUM');
  const sizeAfter = (db.query("SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()").get() as { size: number }).size;
  const savedMB = (sizeBefore - sizeAfter) / (1024 * 1024);
  if (savedMB > 0.1) logger.info('VACUUM reclaimed space', { component: 'maintenance', reclaimedMB: parseFloat(savedMB.toFixed(2)) });

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

// Scheduled maintenance - runs on startup + every 24h
let maintenanceInterval: ReturnType<typeof setInterval> | null = null;

function runMaintenance(): void {
  logger.info('Running scheduled cleanup', { component: 'maintenance' });
  try {
    const result = cleanupOldData();
    logger.info('Cleanup complete', { component: 'maintenance', totalDeleted: result.totalDeleted, duration: result.duration });
  } catch (error: unknown) {
    logger.error('Cleanup failed', { component: 'maintenance', error: getErrorMessage(error) });
  }
}

export function startMaintenanceScheduler(): void {
  if (maintenanceInterval) return;

  // Run immediately on startup
  runMaintenance();

  // Then run every 24 hours
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  maintenanceInterval = setInterval(runMaintenance, TWENTY_FOUR_HOURS);
  logger.info('Scheduler started (runs every 24h)', { component: 'maintenance' });
}

export function stopMaintenanceScheduler(): void {
  if (maintenanceInterval) {
    clearInterval(maintenanceInterval);
    maintenanceInterval = null;
    logger.info('Scheduler stopped', { component: 'maintenance' });
  }
}
