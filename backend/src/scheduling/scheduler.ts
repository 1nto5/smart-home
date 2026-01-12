/**
 * Scheduler
 * Checks every minute if any schedule matches current time
 */

import { getSchedulesByTime, applyPresetToAllLamps } from './schedule-service';
import { getHeaterSchedulesByTime, applyPresetToAllHeaters } from './heater-schedule-service';
import { isOverrideActive } from './heater-override';
import { telegramScheduleNotification } from '../notifications/telegram-service';

let schedulerInterval: Timer | null = null;
let lastTriggeredMinute: string = '';

/**
 * Start the scheduler (checks every minute)
 */
export function startScheduler(): void {
  if (schedulerInterval) {
    console.log('Scheduler already running');
    return;
  }

  console.log('Starting scheduler (checks every 1 min)');

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
        console.log(`Triggering lamp schedule "${schedule.name}" (${schedule.preset}) at ${currentTime}`);
        applyPresetToAllLamps(schedule.preset, schedule.id);
        // Send Telegram notification
        telegramScheduleNotification('lamp', schedule.name, schedule.preset).catch(() => {});
      }
    }

    // Check for heater schedules at this time (skip if override is active)
    if (!isOverrideActive()) {
      const heaterSchedules = getHeaterSchedulesByTime(currentTime);
      if (heaterSchedules.length > 0) {
        lastTriggeredMinute = currentTime;

        for (const schedule of heaterSchedules) {
          console.log(`Triggering heater schedule "${schedule.name}" (${schedule.preset_id}) at ${currentTime}`);
          applyPresetToAllHeaters(schedule.preset_id, schedule.id);
          // Send Telegram notification
          telegramScheduleNotification('heater', schedule.name, schedule.preset_id).catch(() => {});
        }
      }
    }
  }, 60_000); // Check every minute
}

/**
 * Stop the scheduler
 */
export function stopScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('Scheduler stopped');
  }
}

/**
 * Check if scheduler is running
 */
export function isSchedulerRunning(): boolean {
  return schedulerInterval !== null;
}
