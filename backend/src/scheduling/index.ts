/**
 * Scheduling module exports
 */

export {
  LAMP_PRESETS,
  isValidPreset,
  getLampPresets,
  getLampPreset,
  updateLampPreset,
  createLampPreset,
  deleteLampPreset,
  refreshLampPresetsCache,
  type LampPreset,
  type PresetName,
} from './presets';

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

export { startScheduler } from './scheduler';
export { startPoller } from './poller';

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
  getPresetDeviceTemps,
  setPresetDeviceTemp,
  deletePresetDeviceTemp,
  getEffectiveTemp,
  type HeaterPreset,
  type HeaterPresetDevice,
} from './heater-presets';

export {
  getHeaterSchedules,
  getHeaterSchedulesByTime,
  createHeaterSchedule,
  updateHeaterSchedule,
  deleteHeaterSchedule,
  toggleHeaterSchedule,
  applyPresetToHeater,
  applyPresetToAllHeaters,
  applyFixedTempToAllHeaters,
  applyTempToHeater,
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
