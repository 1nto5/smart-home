/**
 * Build a full state snapshot for new WebSocket connections
 * Aggregates all cached data so the frontend can hydrate instantly
 */

import { getDb } from '../db/database';
import { computeHomeStatus } from '../db/home-status';
import { getCachedRoborockStatus } from '../roborock/roborock';
import { getCachedPurifierStatus } from '../xiaomi/air-purifier';
import { getSchedules } from '../scheduling/schedule-service';
import { getPendingActions } from '../scheduling/pending-service';
import { getHeaterPresets } from '../scheduling/heater-presets';
import { getHeaterSchedules } from '../scheduling/heater-schedule-service';
import { getPendingHeaterActions } from '../scheduling/heater-pending-service';
import { getHeaterOverride } from '../scheduling/heater-override';
import { translateName } from '../utils/translations';

export function buildStateSnapshot(): object {
  const db = getDb();

  // Lamps (xiaomi_devices)
  const lamps = db.query('SELECT * FROM xiaomi_devices ORDER BY room, name').all();

  // Tuya devices
  const tuyaDeviceList = db.query('SELECT * FROM devices ORDER BY room, name').all() as Record<string, unknown>[];
  const tuyaDevices = tuyaDeviceList.map(d => ({ ...d, name: translateName(d.name as string) }));

  // Yamaha devices
  const yamahaDevices = db.query('SELECT * FROM yamaha_devices ORDER BY room, name').all();

  return {
    type: 'full_state_snapshot',
    lamps,
    tuyaDevices,
    yamahaDevices,
    roborock: getCachedRoborockStatus(),
    airPurifier: getCachedPurifierStatus(),
    schedules: getSchedules(),
    pendingActions: getPendingActions(),
    heaterPresets: getHeaterPresets(),
    heaterSchedules: getHeaterSchedules(),
    pendingHeaterActions: getPendingHeaterActions(),
    heaterOverride: getHeaterOverride(),
    homeStatus: computeHomeStatus(),
  };
}
