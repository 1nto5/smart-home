/**
 * Poller
 * - Retries pending actions for offline lamps every 30 seconds
 * - Refreshes sensor and TRV statuses every 5 minutes (local API)
 * - Fast-polls door sensors every 5 seconds (local API)
 * - Cleans up old history records daily
 */

import { getPendingActions, removePendingAction, incrementRetryCount } from './pending-service';
import { applyPresetToLamp } from './schedule-service';
import type { PresetName } from './presets';
import { getPendingHeaterActions, removePendingHeaterAction, incrementHeaterRetryCount } from './heater-pending-service';
import { applyPresetToHeater } from './heater-schedule-service';
import { getDb, cleanupOldHistory, recordSensorReading, recordContactChange, getLastContactState } from '../db/database';
import { getDeviceStatus, connectDevice } from '../tuya/tuya-local';
import { initOnlineStateCache, checkOnlineTransitions } from './online-trigger';
import { evaluateSensorTrigger, evaluateAqiTrigger } from '../automations/automation-triggers';
import { getPurifierStatus } from '../xiaomi/air-purifier';
import { broadcastTuyaStatus } from '../ws/device-broadcast';

let pollerInterval: Timer | null = null;
let doorPollerInterval: Timer | null = null;
let sensorRefreshCounter = 0;
let cleanupCounter = 0;

// Gateway ID for local Zigbee device access
const GATEWAY_ID = 'bf889f95067d327853rwzw';

// Convert cloud API status to DPS format for sensors
function sensorStatusToDps(status: Array<{ code: string; value: any }>): Record<string, any> {
  const dps: Record<string, any> = {};
  for (const item of status) {
    switch (item.code) {
      case 'watersensor_state':
        dps['1'] = item.value === 'normal' ? '2' : '1';
        break;
      case 'battery_percentage':
        dps['4'] = item.value;
        break;
      case 'doorcontact_state':
        dps['101'] = item.value;
        break;
      case 'battery_value':
        dps['103'] = item.value;
        break;
    }
  }
  return dps;
}

// Convert cloud API status to DPS format for TRVs
function trvStatusToDps(status: Array<{ code: string; value: any }>): Record<string, any> {
  const dps: Record<string, any> = {};
  for (const item of status) {
    switch (item.code) {
      case 'mode':
        dps['2'] = item.value;
        break;
      case 'work_state':
        dps['3'] = item.value;
        break;
      case 'temp_set':
        dps['4'] = item.value;
        break;
      case 'temp_current':
        dps['5'] = item.value;
        break;
      case 'child_lock':
        dps['6'] = item.value;
        break;
      case 'battery_percentage':
        dps['7'] = item.value;
        break;
    }
  }
  return dps;
}

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
        const temp = dps['103'] !== undefined ? dps['103'] / 100 : null;
        const humidity = dps['101'] !== undefined ? dps['101'] / 100 : null;
        const battery = dps['102'] !== undefined ? dps['102'] : null;
        if (temp !== null || humidity !== null) {
          recordSensorReading(station.id, station.name, temp, humidity, null, battery);
          broadcastTuyaStatus(station.id, 'wsdcg', { temp, humidity, battery });
        }
      }
    } catch (e: any) {
      console.error(`Weather station refresh failed for ${station.name}:`, e.message);
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
            if (isLeaking) console.log(`🚨 WATER LEAK: ${sensor.name}`);
          }
        }
      }
    } catch (e: any) {
      console.error(`Sensor refresh failed for ${sensor.name}:`, e.message);
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
        const currentTemp = dps['5'] !== undefined ? dps['5'] / 10 : null;
        const targetTemp = dps['4'] !== undefined ? dps['4'] / 10 : null;
        const battery = dps['35'] !== undefined ? dps['35'] : null;
        if (currentTemp !== null) {
          recordSensorReading(trv.id, trv.name, currentTemp, null, targetTemp, battery);
          broadcastTuyaStatus(trv.id, 'wkf', { currentTemp, targetTemp, battery });
        }
      }
    } catch (e: any) {
      console.error(`TRV refresh failed for ${trv.name}:`, e.message);
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
  } catch (e: any) {
    console.error('AQI poll error:', e.message);
  }
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
            console.log(`🚪 ${door.name}: ${isOpen ? 'OPENED' : 'CLOSED'}`);
            // Trigger automations
            evaluateSensorTrigger(door.id, door.name, isOpen ? 'open' : 'closed');
          }
        }
      }
    } catch (e: any) {
      // Suppress frequent errors for door polling
    }
  }
}

/**
 * Start the poller (checks every 30 seconds)
 */
export async function startPoller(): Promise<void> {
  if (pollerInterval) {
    console.log('Poller already running');
    return;
  }

  // Connect to gateway for local Zigbee device access
  console.log('Connecting to gateway for local device access...');
  await connectDevice(GATEWAY_ID).catch(e => console.error('Gateway connection error:', e.message));

  // Initialize online state cache (for reconnect detection)
  initOnlineStateCache();

  console.log('Starting poller (sensors every 5min, doors every 5s)');

  // Main poller: every 30 seconds
  pollerInterval = setInterval(async () => {
    // Check for lamp online transitions
    await checkOnlineTransitions().catch(e => console.error('Online check error:', e.message));

    // Refresh sensor and TRV statuses every 5 minutes (10 iterations)
    sensorRefreshCounter++;
    if (sensorRefreshCounter >= 10) {
      sensorRefreshCounter = 0;
      refreshWeatherStationStatuses().catch(e => console.error('Weather station error:', e.message));
      refreshSensorStatuses().catch(e => console.error('Sensor refresh error:', e.message));
      refreshTrvStatuses().catch(e => console.error('TRV refresh error:', e.message));
      pollAqi().catch(e => console.error('AQI poll error:', e.message));
    }

    // Daily cleanup (every 24 hours = 2880 iterations of 30s)
    cleanupCounter++;
    if (cleanupCounter >= 2880) {
      cleanupCounter = 0;
      const deleted = cleanupOldHistory(180); // 6 months retention
      if (deleted > 0) {
        console.log(`🧹 Cleaned up ${deleted} old history records`);
      }
    }

    // Process pending lamp actions
    const pendingLamps = getPendingActions();
    if (pendingLamps.length > 0) {
      console.log(`Poller: checking ${pendingLamps.length} pending lamp actions`);

      for (const action of pendingLamps) {
        try {
          const success = await applyPresetToLamp(action.device_id, action.preset as PresetName);

          if (success) {
            removePendingAction(action.id);
            console.log(`Applied pending ${action.preset} to lamp ${action.device_id}`);
          } else {
            incrementRetryCount(action.id);
          }
        } catch (error: any) {
          console.error(`Poller error for lamp ${action.device_id}:`, error.message);
          incrementRetryCount(action.id);
        }
      }
    }

    // Process pending heater actions
    const pendingHeaters = getPendingHeaterActions();
    if (pendingHeaters.length > 0) {
      console.log(`Poller: checking ${pendingHeaters.length} pending heater actions`);

      for (const action of pendingHeaters) {
        try {
          const success = await applyPresetToHeater(action.device_id, action.preset_id);

          if (success) {
            removePendingHeaterAction(action.id);
            console.log(`Applied pending ${action.preset_id} to heater ${action.device_id}`);
          } else {
            incrementHeaterRetryCount(action.id);
          }
        } catch (error: any) {
          console.error(`Poller error for heater ${action.device_id}:`, error.message);
          incrementHeaterRetryCount(action.id);
        }
      }
    }
  }, 30_000); // Check every 30 seconds

  // Door fast-poller: every 5 seconds
  doorPollerInterval = setInterval(async () => {
    await pollDoorSensors().catch(() => {});
  }, 5_000);
}
