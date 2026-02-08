/**
 * Scheduler
 * Checks every minute if any schedule matches current time
 */

import { getSchedulesByTime, applyPresetToAllLamps } from './schedule-service';
import { getHeaterSchedulesByTime, applyPresetToAllHeaters } from './heater-schedule-service';
import { isOverrideActive } from './heater-override';
import { logger } from '../utils/logger';

let schedulerInterval: Timer | null = null;
let lastTriggeredMinute: string = '';

/**
 * Start the scheduler (checks every minute)
 */
export function startScheduler(): void {
  if (schedulerInterval) {
    logger.info('Scheduler already running', { component: 'scheduler' });
    return;
  }

  logger.info('Starting scheduler (checks every 1 min)', { component: 'scheduler' });

  schedulerInterval = setInterval(() => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Avoid triggering multiple times in the same minute
    if (currentTime === lastTriggeredMinute) {
      return;
    }

    // Check for lamp schedules at this time
    const lampSchedules = getSchedulesByTime(currentTime);
    if (lampSchedules.length > 0) {
      lastTriggeredMinute = currentTime;

      for (const schedule of lampSchedules) {
        logger.info('Triggering lamp schedule', { component: 'scheduler', scheduleName: schedule.name, preset: schedule.preset, time: currentTime });
        applyPresetToAllLamps(schedule.preset, schedule.id);
      }
    }

    // Check for heater schedules at this time (skip if override is active)
    if (!isOverrideActive()) {
      const heaterSchedules = getHeaterSchedulesByTime(currentTime);
      if (heaterSchedules.length > 0) {
        lastTriggeredMinute = currentTime;

        for (const schedule of heaterSchedules) {
          logger.info('Triggering heater schedule', { component: 'scheduler', scheduleName: schedule.name, presetId: schedule.preset_id, time: currentTime });
          applyPresetToAllHeaters(schedule.preset_id, schedule.id);
        }
      }
    }
  }, 60_000); // Check every minute
}
