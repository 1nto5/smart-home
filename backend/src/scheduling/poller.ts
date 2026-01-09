/**
 * Poller
 * - Retries pending actions for offline lamps every 30 seconds
 * - Refreshes sensor statuses every 5 minutes
 */

import { getPendingActions, removePendingAction, incrementRetryCount } from './pending-service';
import { applyPresetToLamp } from './schedule-service';
import type { PresetName } from './presets';
import { getDb } from '../db/database';
import { getDeviceStatus } from '../tuya/tuya-api';
import { initOnlineStateCache, checkOnlineTransitions } from './online-trigger';

let pollerInterval: Timer | null = null;
let sensorRefreshCounter = 0;

// Convert cloud API status to DPS format
function cloudStatusToDps(status: Array<{ code: string; value: any }>): Record<string, any> {
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

async function refreshSensorStatuses(): Promise<void> {
  const db = getDb();
  const sensors = db.query("SELECT id, name FROM devices WHERE category IN ('sj', 'mcs')").all() as { id: string; name: string }[];

  for (const sensor of sensors) {
    try {
      const status = await getDeviceStatus(sensor.id);
      if (status && status.length > 0) {
        const dps = cloudStatusToDps(status);
        db.run('UPDATE devices SET last_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [JSON.stringify(dps), sensor.id]);
      }
    } catch (e: any) {
      console.error(`Sensor refresh failed for ${sensor.name}:`, e.message);
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

  // Initialize online state cache and apply current preset to online lamps
  await initOnlineStateCache();

  console.log('Starting poller (checks pending every 30s)');

  pollerInterval = setInterval(async () => {
    // Check for lamp online transitions
    await checkOnlineTransitions().catch(e => console.error('Online check error:', e.message));

    // Refresh sensor statuses every 5 minutes (10 iterations)
    sensorRefreshCounter++;
    if (sensorRefreshCounter >= 10) {
      sensorRefreshCounter = 0;
      refreshSensorStatuses().catch(e => console.error('Sensor refresh error:', e.message));
    }

    const pending = getPendingActions();

    if (pending.length === 0) {
      return;
    }

    console.log(`Poller: checking ${pending.length} pending actions`);

    for (const action of pending) {
      try {
        const success = await applyPresetToLamp(action.device_id, action.preset as PresetName);

        if (success) {
          removePendingAction(action.id);
          console.log(`Applied pending ${action.preset} to ${action.device_id}`);
        } else {
          // Increment retry count, remove if max exceeded
          const stillValid = incrementRetryCount(action.id);
          if (!stillValid) {
            console.log(`Max retries for ${action.device_id}, giving up`);
          }
        }
      } catch (error: any) {
        console.error(`Poller error for ${action.device_id}:`, error.message);
        incrementRetryCount(action.id);
      }
    }
  }, 30_000); // Check every 30 seconds
}

/**
 * Stop the poller
 */
export function stopPoller(): void {
  if (pollerInterval) {
    clearInterval(pollerInterval);
    pollerInterval = null;
    console.log('Poller stopped');
  }
}

/**
 * Check if poller is running
 */
export function isPollerRunning(): boolean {
  return pollerInterval !== null;
}

/**
 * Force poll now (for testing)
 */
export async function pollNow(): Promise<void> {
  const pending = getPendingActions();

  for (const action of pending) {
    const success = await applyPresetToLamp(action.device_id, action.preset as PresetName);
    if (success) {
      removePendingAction(action.id);
      console.log(`Applied pending ${action.preset} to ${action.device_id}`);
    }
  }
}
