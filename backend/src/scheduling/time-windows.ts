/**
 * Time window logic for automatic preset selection
 */

import type { PresetName } from './presets';

export type TimeWindow = 'day' | 'night' | 'moonlight';

/**
 * Get current time window based on hour
 * - 06:00-17:59 = day
 * - 18:00-20:59 = night
 * - 21:00-05:59 = moonlight
 */
export function getCurrentTimeWindow(): TimeWindow {
  const hour = new Date().getHours();

  if (hour >= 21 || hour < 6) return 'moonlight';
  if (hour >= 6 && hour < 18) return 'day';
  return 'night';
}

/**
 * Map time window to preset name
 */
export function getPresetForTimeWindow(window: TimeWindow): PresetName {
  const map: Record<TimeWindow, PresetName> = {
    day: 'day',
    night: 'night',
    moonlight: 'moonlight',
  };
  return map[window];
}
