/**
 * Poller
 * - Retries pending actions for offline lamps/heaters every 15 seconds
 * - Comprehensive device refresh every 15 minutes (+ on startup)
 * - Fast-polls door sensors every 5 seconds (local API)
 * Note: History cleanup is handled by maintenance.ts scheduler
 */

import { getPendingHeaterActions, removePendingHeaterAction, incrementHeaterRetryCount } from './heater-pending-service';
import { applyPresetToHeater } from './heater-schedule-service';
import { getPendingActions, removePendingAction, incrementRetryCount } from './pending-service';
import { applyPresetToLamp } from './schedule-service';
import { getDb, recordSensorReading, recordContactChange, getLastContactState } from '../db/database';
import { getDeviceStatus, connectDevice } from '../tuya/tuya-local';
import { initOnlineStateCache, checkOnlineTransitions } from './online-trigger';
import { evaluateSensorTrigger, evaluateAqiTrigger } from '../automations/automation-triggers';
import { getPurifierStatus } from '../xiaomi/air-purifier';
import { getStatus as getRoborockStatus } from '../roborock/roborock';
import { broadcastTuyaStatus } from '../ws/device-broadcast';
import { broadcastHomeStatus, broadcastRefreshComplete } from '../ws/device-broadcast';
import { getErrorMessage } from '../utils/errors';
import { logger } from '../utils/logger';
import { config } from '../config';

let pollerInterval: Timer | null = null;
let _doorPollerInterval: Timer | null = null;
let _comprehensiveInterval: Timer | null = null;

// Track when devices were last polled
let lastComprehensiveRefreshAt: string | null = null;
let refreshRunning = false;
let lastRefreshTime = 0;
const REFRESH_DEBOUNCE_MS = 30_000;

// Gateway ID for local Zigbee device access
const GATEWAY_ID = config.tuya.gatewayId;

// Refresh weather station (wsdcg) - temperature/humidity via local API
async function refreshWeatherStationStatuses(): Promise<void> {
  const db = getDb();
  const stations = db.query("SELECT id, name FROM devices WHERE category = 'wsdcg'").all() as { id: string; name: string }[];

  for (const station of stations) {
    try {
      const status = await getDeviceStatus(station.id);
      if (status?.dps) {
        const dps = status.dps;
        db.run('UPDATE devices SET last_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [JSON.stringify(dps), station.id]);

        // Record to sensor history
        const temp = dps['103'] !== undefined ? Number(dps['103']) / 100 : null;
        const humidity = dps['101'] !== undefined ? Number(dps['101']) / 100 : null;
        const battery = dps['102'] !== undefined ? Number(dps['102']) : null;
        if (temp !== null || humidity !== null) {
          recordSensorReading(station.id, station.name, temp, humidity, null, battery);
          broadcastTuyaStatus(station.id, 'wsdcg', { temp, humidity, battery });
        }
      }
    } catch (e: unknown) {
      logger.error('Weather station refresh failed', { component: 'poller', deviceName: station.name, error: getErrorMessage(e) });
    }
  }
}

// Refresh water/window sensors via local API (store state changes only)
async function refreshSensorStatuses(): Promise<void> {
  const db = getDb();
  // Only refresh window sensors here (doors have fast polling)
  const sensors = db.query(`
    SELECT id, name, category FROM devices
    WHERE category IN ('sj', 'mcs')
    AND LOWER(name) NOT LIKE '%door%' AND LOWER(name) NOT LIKE '%drzwi%'
  `).all() as { id: string; name: string; category: string }[];

  for (const sensor of sensors) {
    try {
      const status = await getDeviceStatus(sensor.id);
      if (status?.dps) {
        const dps = status.dps;
        db.run('UPDATE devices SET last_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [JSON.stringify(dps), sensor.id]);

        // Record contact state change for window/water sensors
        if (sensor.category === 'mcs' && dps['101'] !== undefined) {
          const isOpen = dps['101'] === true || dps['101'] === 'true';
          const lastState = getLastContactState(sensor.id);
          if (lastState === null || lastState !== isOpen) {
            recordContactChange(sensor.id, sensor.name, isOpen);
            broadcastTuyaStatus(sensor.id, 'mcs', { '101': isOpen });
          }
        }
        if (sensor.category === 'sj' && dps['1'] !== undefined) {
          const isLeaking = dps['1'] === '1' || dps['1'] === 1;
          const lastState = getLastContactState(sensor.id);
          if (lastState === null || lastState !== isLeaking) {
            recordContactChange(sensor.id, sensor.name, isLeaking);
            broadcastTuyaStatus(sensor.id, 'sj', { '1': isLeaking ? 1 : 0 });
            if (isLeaking) logger.warn('Water leak detected', { component: 'poller', deviceId: sensor.id, deviceName: sensor.name });
          }
        }
      }
    } catch (e: unknown) {
      logger.error('Sensor refresh failed', { component: 'poller', deviceName: sensor.name, error: getErrorMessage(e) });
    }
  }
}

// Refresh TRV statuses via local API
async function refreshTrvStatuses(): Promise<void> {
  const db = getDb();
  const trvs = db.query("SELECT id, name FROM devices WHERE category = 'wkf'").all() as { id: string; name: string }[];

  for (const trv of trvs) {
    try {
      const status = await getDeviceStatus(trv.id);
      if (status?.dps) {
        const dps = status.dps;
        db.run('UPDATE devices SET last_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [JSON.stringify(dps), trv.id]);

        // Record to sensor history
        const currentTemp = dps['5'] !== undefined ? Number(dps['5']) / 10 : null;
        const targetTemp = dps['4'] !== undefined ? Number(dps['4']) / 10 : null;
        const battery = dps['35'] !== undefined ? Number(dps['35']) : null;
        if (currentTemp !== null) {
          recordSensorReading(trv.id, trv.name, currentTemp, null, targetTemp, battery);
          broadcastTuyaStatus(trv.id, 'wkf', { currentTemp, targetTemp, battery });
        }
      }
    } catch (e: unknown) {
      logger.error('TRV refresh failed', { component: 'poller', deviceName: trv.name, error: getErrorMessage(e) });
    }
  }
}

// Poll AQI from air purifier and trigger automations
async function pollAqi(): Promise<void> {
  try {
    const status = await getPurifierStatus();
    if (!status) return;

    // broadcast is called inside getPurifierStatus
    evaluateAqiTrigger(status.aqi);
  } catch (e: unknown) {
    logger.error('AQI poll error', { component: 'poller', error: getErrorMessage(e) });
  }
}

// Refresh Roborock vacuum status
async function refreshRoborockStatus(): Promise<void> {
  try {
    await getRoborockStatus(); // caches + broadcasts internally
  } catch (e: unknown) {
    logger.error('Roborock refresh error', { component: 'poller', error: getErrorMessage(e) });
  }
}

// Refresh lamp statuses (check online transitions + fetch statuses)
async function refreshLampStatuses(): Promise<void> {
  try {
    await checkOnlineTransitions();
  } catch (e: unknown) {
    logger.error('Lamp refresh error', { component: 'poller', error: getErrorMessage(e) });
  }
}

/**
 * Comprehensive refresh of ALL device types
 * Runs on startup and every 15 minutes
 */
async function comprehensiveRefresh(): Promise<void> {
  logger.info('Starting comprehensive device refresh', { component: 'poller' });
  const start = Date.now();

  await Promise.all([
    refreshWeatherStationStatuses().catch(e => logger.error('Weather station error', { component: 'poller', error: e.message })),
    refreshSensorStatuses().catch(e => logger.error('Sensor refresh error', { component: 'poller', error: e.message })),
    refreshTrvStatuses().catch(e => logger.error('TRV refresh error', { component: 'poller', error: e.message })),
    pollAqi().catch(e => logger.error('AQI poll error', { component: 'poller', error: e.message })),
    refreshRoborockStatus().catch(e => logger.error('Roborock refresh error', { component: 'poller', error: e.message })),
    refreshLampStatuses().catch(e => logger.error('Lamp refresh error', { component: 'poller', error: e.message })),
  ]);

  // Broadcast updated home status after all refreshes
  broadcastHomeStatus();

  lastComprehensiveRefreshAt = new Date().toISOString();

  const elapsed = Date.now() - start;
  logger.info('Comprehensive refresh complete', { component: 'poller', duration: elapsed });
}

// Fast poll door/window sensors (every 5 seconds) - local API
async function pollDoorSensors(): Promise<void> {
  const db = getDb();
  // Poll all contact sensors (doors and windows)
  const doors = db.query(`
    SELECT id, name, room FROM devices
    WHERE category = 'mcs'
  `).all() as { id: string; name: string; room: string | null }[];

  for (const door of doors) {
    try {
      const status = await getDeviceStatus(door.id);
      if (status?.dps) {
        const dps = status.dps;
        db.run('UPDATE devices SET last_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [JSON.stringify(dps), door.id]);

        // Record state change only
        if (dps['101'] !== undefined) {
          const isOpen = dps['101'] === true || dps['101'] === 'true';
          const lastState = getLastContactState(door.id);
          if (lastState === null || lastState !== isOpen) {
            recordContactChange(door.id, door.name, isOpen);
            broadcastTuyaStatus(door.id, 'mcs', { '101': isOpen });
            logger.info('Contact sensor state changed', { component: 'poller', deviceId: door.id, deviceName: door.name, state: isOpen ? 'opened' : 'closed' });
            // Trigger automations
            evaluateSensorTrigger(door.id, door.name, isOpen ? 'open' : 'closed');
          }
        }
      }
    } catch {
      // Suppress frequent errors for door polling
    }
  }
}

/** Get the timestamp of the last comprehensive device refresh */
export function getLastDeviceFetch(): string | null {
  return lastComprehensiveRefreshAt;
}

/** Trigger a comprehensive refresh (debounced, 30s min interval) */
export async function triggerComprehensiveRefresh(): Promise<void> {
  if (refreshRunning) return;
  const now = Date.now();
  if (now - lastRefreshTime < REFRESH_DEBOUNCE_MS) return;

  refreshRunning = true;
  lastRefreshTime = now;
  try {
    await comprehensiveRefresh();
    broadcastRefreshComplete(lastComprehensiveRefreshAt!);
  } finally {
    refreshRunning = false;
  }
}

/**
 * Start the poller
 */
export async function startPoller(): Promise<void> {
  if (pollerInterval) {
    logger.info('Poller already running', { component: 'poller' });
    return;
  }

  // Connect to gateway for local Zigbee device access
  logger.info('Connecting to gateway for local device access', { component: 'poller' });
  await connectDevice(GATEWAY_ID).catch(e => logger.error('Gateway connection error', { component: 'poller', error: e.message }));

  // Initialize online state cache (for reconnect detection)
  initOnlineStateCache();

  // Run comprehensive refresh once on startup to pre-cache all data
  await comprehensiveRefresh();

  logger.info('Starting poller (pending retries every 15s, online checks every 15s, doors every 5s, comprehensive every 15min)', { component: 'poller' });

  // Main poller: every 15 seconds - pending action retries + online transition checks
  pollerInterval = setInterval(async () => {
    // Check for lamp online transitions
    await checkOnlineTransitions().catch(e => logger.error('Online check error', { component: 'poller', error: e.message }));

    // Process pending heater actions
    const pendingHeaters = getPendingHeaterActions();
    if (pendingHeaters.length > 0) {
      logger.debug('Checking pending heater actions', { component: 'poller', count: pendingHeaters.length });

      for (const action of pendingHeaters) {
        try {
          const success = await applyPresetToHeater(action.device_id, action.preset_id);

          if (success) {
            removePendingHeaterAction(action.id);
            logger.info('Applied pending heater action', { component: 'poller', deviceId: action.device_id, presetId: action.preset_id });
          } else {
            incrementHeaterRetryCount(action.id);
          }
        } catch (error: unknown) {
          logger.error('Poller heater error', { component: 'poller', deviceId: action.device_id, error: getErrorMessage(error) });
          incrementHeaterRetryCount(action.id);
        }
      }
    }

    // Process pending lamp actions
    const pendingLamps = getPendingActions();
    if (pendingLamps.length > 0) {
      logger.debug('Checking pending lamp actions', { component: 'poller', count: pendingLamps.length });

      for (const action of pendingLamps) {
        try {
          const success = await applyPresetToLamp(action.device_id, action.preset);

          if (success) {
            removePendingAction(action.id);
            logger.info('Applied pending lamp action', { component: 'poller', deviceId: action.device_id, preset: action.preset });
          } else {
            incrementRetryCount(action.id);
          }
        } catch (error: unknown) {
          logger.error('Poller lamp error', { component: 'poller', deviceId: action.device_id, error: getErrorMessage(error) });
          incrementRetryCount(action.id);
        }
      }
    }
  }, 15_000);

  // Door fast-poller: every 5 seconds
  _doorPollerInterval = setInterval(async () => {
    await pollDoorSensors().catch(() => {});
  }, 5_000);

  // Comprehensive refresh: every 15 minutes
  _comprehensiveInterval = setInterval(async () => {
    await comprehensiveRefresh();
  }, 900_000);
}
