/**
 * Pending heater actions service
 * Manages actions waiting for offline TRVs to come online
 */

import type { PendingActionRow } from './pending-action-factory';
import { createPendingActionService } from './pending-action-factory';

export interface PendingHeaterAction extends PendingActionRow {
  preset_id: string;
}

const service = createPendingActionService<PendingHeaterAction>('pending_heater_actions', 'preset_id');

export const createPendingHeaterAction = (deviceId: string, presetId: string, scheduleId?: number) =>
  service.create(deviceId, presetId, scheduleId);
export const getPendingHeaterActions = service.getAll;
export const getPendingHeaterForDevice = service.getForDevice;
export const removePendingHeaterAction = service.remove;
export const removePendingHeaterForDevice = service.removeForDevice;
export const incrementHeaterRetryCount = service.incrementRetryCount;
export const clearAllPendingHeater = service.clearAll;
