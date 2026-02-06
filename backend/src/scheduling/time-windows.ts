/**
 * Time window logic for automatic preset selection
 * Now dynamically derived from lamp_schedules table
 */

import { getEnabledSchedulesSorted } from './schedule-service';
import type { PresetName } from './presets';

export type TimeWindow = 'day' | 'night' | 'moonlight';

/**
 * Get the currently active preset based on lamp_schedules table.
 * Finds the most recent schedule that should have triggered.
 *
 * Example: schedules at 06:00(day), 16:00(night), 21:00(moonlight)
 * - At 17:30 -> returns 'night' (16:00 was most recent)
 * - At 05:00 -> returns 'moonlight' (21:00 from yesterday)
 */
export function getCurrentPresetFromSchedules(): PresetName {
  const schedules = getEnabledSchedulesSorted();

  if (schedules.length === 0) {
    return 'day'; // fallback if no schedules
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Default to last schedule (wraps from yesterday)
  let activePreset: PresetName = schedules[schedules.length - 1]!.preset as PresetName;

  for (const schedule of schedules) {
    const [h = 0, m = 0] = schedule.time.split(':').map(Number);
    const scheduleMinutes = h * 60 + m;

    if (scheduleMinutes <= currentMinutes) {
      activePreset = schedule.preset as PresetName;
    }
  }

  return activePreset;
}

/**
 * Get current time window (now derived from DB schedules)
 */
export function getCurrentTimeWindow(): TimeWindow {
  return getCurrentPresetFromSchedules() as TimeWindow;
}

/**
 * Map time window to preset name (identity function for compatibility)
 */
export function getPresetForTimeWindow(window: TimeWindow): PresetName {
  return window as PresetName;
}
