/**
 * Scheduling module exports
 */

export { LAMP_PRESETS, isValidPreset, type PresetName } from './presets';

export {
  getSchedules,
  getSchedulesByTime,
  createSchedule,
  deleteSchedule,
  toggleSchedule,
  applyPresetToLamp,
  applyPresetToAllLamps,
  type Schedule,
  type ApplyResult,
} from './schedule-service';

export {
  createPendingAction,
  getPendingActions,
  getPendingForDevice,
  removePendingAction,
  removePendingForDevice,
  clearAllPending,
  type PendingAction,
} from './pending-service';

export { startScheduler, stopScheduler, isSchedulerRunning } from './scheduler';
export { startPoller, stopPoller, isPollerRunning, pollNow } from './poller';

export { getCurrentTimeWindow, getPresetForTimeWindow, type TimeWindow } from './time-windows';
export { initOnlineStateCache, checkOnlineTransitions } from './online-trigger';
