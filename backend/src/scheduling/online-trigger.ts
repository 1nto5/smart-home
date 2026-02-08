/**
 * Online trigger service
 * Detects lamp offline->online transitions and applies appropriate preset
 */

import { getDb } from '../db/database';
import { getLampStatus } from '../xiaomi/xiaomi-lamp';
import { applyPresetToLamp } from './schedule-service';
import { getCurrentTimeWindow, getPresetForTimeWindow } from './time-windows';
import { broadcast } from '../ws/broadcast';
import { createPendingAction, removePendingForDevice } from './pending-service';
import { getErrorMessage } from '../utils/errors';
import { logger } from '../utils/logger';

// In-memory cache of last known online state
const lastOnlineState = new Map<string, boolean>();
// Track last error to reduce log spam
const lastErrorLogged = new Map<string, number>();
const ERROR_LOG_INTERVAL = 300_000; // Log same error max once per 5 min

interface XiaomiDevice {
  id: string;
  name: string;
  online: number;
}

/**
 * Initialize online state cache (for reconnect detection)
 */
export function initOnlineStateCache(): void {
  const db = getDb();
  const lamps = db.query("SELECT id, name, online FROM xiaomi_devices WHERE category = 'lamp'").all() as XiaomiDevice[];

  for (const lamp of lamps) {
    lastOnlineState.set(lamp.id, lamp.online === 1);
  }

  logger.info('Initialized online state cache', { component: 'online-trigger', lampCount: lamps.length });
}

/**
 * Check all lamps for online state transitions
 * Called by poller every 30s
 */
export async function checkOnlineTransitions(): Promise<void> {
  const db = getDb();
  const lamps = db.query("SELECT id, name, online FROM xiaomi_devices WHERE category = 'lamp'").all() as XiaomiDevice[];

  // Check all lamps in parallel
  await Promise.all(lamps.map(async (lamp) => {
    try {
      const wasOnline = lastOnlineState.get(lamp.id) ?? lamp.online === 1;

      // Check current status
      const status = await getLampStatus(lamp.id);
      const isNowOnline = status !== null;

      // Update DB online field and last_status
      if (isNowOnline && status) {
        db.run(
          'UPDATE xiaomi_devices SET online = 1, last_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [JSON.stringify(status), lamp.id]
        );
      } else {
        db.run(
          'UPDATE xiaomi_devices SET online = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [lamp.id]
        );
      }

      // Detect offline -> online transition
      if (!wasOnline && isNowOnline) {
        logger.info('Lamp came online', { component: 'online-trigger', deviceId: lamp.id, deviceName: lamp.name });
        await handleLampCameOnline(lamp.id, lamp.name);
      }

      // Broadcast status change via WebSocket
      if (isNowOnline && status) {
        broadcast({ type: 'lamp_status', deviceId: lamp.id, status });
      } else if (wasOnline && !isNowOnline) {
        broadcast({ type: 'lamp_offline', deviceId: lamp.id });
      }

      // Update cache
      lastOnlineState.set(lamp.id, isNowOnline);
    } catch (e: unknown) {
      // Only log errors periodically to reduce spam
      const now = Date.now();
      const lastLog = lastErrorLogged.get(lamp.id) || 0;
      if (now - lastLog > ERROR_LOG_INTERVAL) {
        logger.error('Error checking lamp online state', { component: 'online-trigger', deviceId: lamp.id, deviceName: lamp.name, error: getErrorMessage(e) });
        lastErrorLogged.set(lamp.id, now);
      }
      // Mark as offline on error
      lastOnlineState.set(lamp.id, false);
    }
  }));
}

/**
 * Handle lamp coming online - apply preset based on current time window
 */
async function handleLampCameOnline(deviceId: string, name: string): Promise<void> {
  const timeWindow = getCurrentTimeWindow();
  const preset = getPresetForTimeWindow(timeWindow);

  logger.info('Applying preset to lamp after coming online', { component: 'online-trigger', deviceId, deviceName: name, preset, timeWindow });

  try {
    const success = await applyPresetToLamp(deviceId, preset);
    if (success) {
      removePendingForDevice(deviceId);
    } else {
      logger.error('Failed to apply preset after coming online', { component: 'online-trigger', deviceId, deviceName: name, preset });
      createPendingAction(deviceId, preset);
    }
  } catch (e: unknown) {
    logger.error('Error applying preset to lamp', { component: 'online-trigger', deviceId, deviceName: name, preset, error: getErrorMessage(e) });
    createPendingAction(deviceId, preset);
  }
}
