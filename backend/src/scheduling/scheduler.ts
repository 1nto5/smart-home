/**
 * Scheduler
 * Checks every minute if any schedule matches current time
 */

import { getSchedulesByTime, applyPresetToAllLamps } from './schedule-service';

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

    // Check for schedules at this time
    const schedules = getSchedulesByTime(currentTime);
    if (schedules.length > 0) {
      lastTriggeredMinute = currentTime;

      for (const schedule of schedules) {
        console.log(`Triggering schedule "${schedule.name}" (${schedule.preset}) at ${currentTime}`);
        applyPresetToAllLamps(schedule.preset, schedule.id);
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
