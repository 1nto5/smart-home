/**
 * Pending lamp actions service
 * Manages actions waiting for offline lamps to come online
 */

import type { PendingActionRow } from './pending-action-factory';
import { createPendingActionService } from './pending-action-factory';
import type { PresetName } from './presets';

export interface PendingAction extends PendingActionRow {
  preset: PresetName;
}

const service = createPendingActionService<PendingAction>('pending_lamp_actions', 'preset');

export const createPendingAction = (deviceId: string, preset: PresetName, scheduleId?: number) =>
  service.create(deviceId, preset, scheduleId);
export const getPendingActions = service.getAll;
export const getPendingForDevice = service.getForDevice;
export const removePendingAction = service.remove;
export const removePendingForDevice = service.removeForDevice;
export const incrementRetryCount = service.incrementRetryCount;
export const clearAllPending = service.clearAll;
