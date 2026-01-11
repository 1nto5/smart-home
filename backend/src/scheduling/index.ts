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

// Heater scheduling
export {
  getHeaterPresets,
  getHeaterPreset,
  updateHeaterPreset,
  isValidHeaterPreset,
  createHeaterPreset,
  deleteHeaterPreset,
  type HeaterPreset,
} from './heater-presets';

export {
  getHeaterSchedules,
  getHeaterSchedulesByTime,
  createHeaterSchedule,
  deleteHeaterSchedule,
  toggleHeaterSchedule,
  applyPresetToHeater,
  applyPresetToAllHeaters,
  applyFixedTempToAllHeaters,
  type HeaterSchedule,
} from './heater-schedule-service';

export {
  getPendingHeaterActions,
  clearAllPendingHeater,
  type PendingHeaterAction,
} from './heater-pending-service';

export {
  getHeaterOverride,
  setHeaterOverride,
  isOverrideActive,
  type HeaterOverride,
} from './heater-override';
