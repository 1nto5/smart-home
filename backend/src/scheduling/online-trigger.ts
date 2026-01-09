/**
 * Online trigger service
 * Detects lamp offline->online transitions and applies appropriate preset
 */

import { getDb } from '../db/database';
import { getLampStatus } from '../xiaomi/xiaomi-lamp';
import { applyPresetToLamp } from './schedule-service';
import { getCurrentTimeWindow, getPresetForTimeWindow } from './time-windows';
import { broadcast } from '../ws/broadcast';

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
 * Initialize online state cache and apply current time window preset to all online lamps
 */
export async function initOnlineStateCache(): Promise<void> {
  const db = getDb();
  const lamps = db.query("SELECT id, name, online FROM xiaomi_devices WHERE category = 'lamp'").all() as XiaomiDevice[];

  const timeWindow = getCurrentTimeWindow();
  const preset = getPresetForTimeWindow(timeWindow);
  console.log(`Current time window: ${timeWindow} (preset: ${preset})`);

  // Initialize cache first
  for (const lamp of lamps) {
    lastOnlineState.set(lamp.id, lamp.online === 1);
  }

  // Apply presets in parallel
  await Promise.all(lamps.filter(l => l.online === 1).map(async (lamp) => {
    try {
      console.log(`Applying ${preset} to ${lamp.name} (startup)`);
      await applyPresetToLamp(lamp.id, preset);
    } catch (e: any) {
      console.error(`Failed to apply ${preset} to ${lamp.name}:`, e.message);
    }
  }));

  console.log(`Initialized online state cache for ${lamps.length} lamps`);
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
        console.log(`Lamp ${lamp.name} came online`);
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
    } catch (e: any) {
      // Only log errors periodically to reduce spam
      const now = Date.now();
      const lastLog = lastErrorLogged.get(lamp.id) || 0;
      if (now - lastLog > ERROR_LOG_INTERVAL) {
        console.error(`Error checking ${lamp.name}:`, e.message);
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

  console.log(`Applying ${preset} to ${name} (time window: ${timeWindow})`);

  try {
    const success = await applyPresetToLamp(deviceId, preset);
    if (!success) {
      console.error(`Failed to apply ${preset} to ${name} after coming online`);
    }
  } catch (e: any) {
    console.error(`Error applying ${preset} to ${name}:`, e.message);
  }
}
