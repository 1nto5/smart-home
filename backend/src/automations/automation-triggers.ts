/**
 * Automation Triggers
 * Detects events and triggers matching automation rules
 */

import { getDb, type Automation } from '../db/database';
import { executeAutomationActions, type TriggerContext } from './automation-actions';
import { getErrorMessage } from '../utils/errors';
import { logger } from '../utils/logger';

interface QuietWindow {
  start: string;
  end: string;
}

/**
 * Check if current time is within any quiet window (automation should be suppressed)
 * Handles midnight crossing (e.g., 22:00-06:00)
 */
function isInQuietWindow(quietWindowsJson: string | null): { inQuiet: boolean; window?: QuietWindow } {
  if (!quietWindowsJson) return { inQuiet: false };

  let windows: QuietWindow[];
  try {
    windows = JSON.parse(quietWindowsJson);
  } catch {
    return { inQuiet: false };
  }

  if (!Array.isArray(windows) || windows.length === 0) return { inQuiet: false };

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const window of windows) {
    if (!window.start || !window.end) continue;

    const [startH = 0, startM = 0] = window.start.split(':').map(Number);
    const [endH = 0, endM = 0] = window.end.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    let isInWindow = false;
    if (startMinutes <= endMinutes) {
      // Normal range (e.g., 06:00-08:00)
      isInWindow = currentMinutes >= startMinutes && currentMinutes < endMinutes;
    } else {
      // Crosses midnight (e.g., 22:00-06:00)
      isInWindow = currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }

    if (isInWindow) {
      return { inQuiet: true, window };
    }
  }

  return { inQuiet: false };
}

/**
 * Get enabled automations for a specific trigger type
 */
function getEnabledAutomationsForTrigger(triggerType: string, condition: string, deviceId?: string): Automation[] {
  const db = getDb();
  return db.query(`
    SELECT * FROM automations
    WHERE enabled = 1
    AND trigger_type = ?
    AND trigger_condition = ?
    AND (trigger_device_id IS NULL OR trigger_device_id = ?)
  `).all(triggerType, condition, deviceId || null) as Automation[];
}

/**
 * Get enabled AQI threshold automations
 */
function getEnabledAqiAutomations(): Automation[] {
  const db = getDb();
  return db.query(`
    SELECT * FROM automations
    WHERE enabled = 1
    AND trigger_type = 'aqi_threshold'
  `).all() as Automation[];
}

/**
 * Evaluate sensor state change and trigger matching automations
 */
export async function evaluateSensorTrigger(
  deviceId: string,
  deviceName: string,
  condition: 'open' | 'closed' | 'leak'
): Promise<void> {
  // Get device room
  const db = getDb();
  const device = db.query('SELECT room FROM devices WHERE id = ?').get(deviceId) as { room: string | null } | null;

  const context: TriggerContext = {
    deviceId,
    deviceName,
    room: device?.room || null,
    condition,
  };

  // Find matching automations
  const automations = getEnabledAutomationsForTrigger('sensor_state', condition, deviceId);

  if (automations.length === 0) {
    return;
  }

  logger.info('Automation trigger matched', { component: 'automation-triggers', deviceName, condition, matchCount: automations.length });

  // Execute each matching automation (skip if in quiet window)
  for (const automation of automations) {
    const quietCheck = isInQuietWindow(automation.quiet_windows);
    if (quietCheck.inQuiet) {
      logger.info('Automation skipped - in quiet window', { component: 'automation-triggers', automationName: automation.name, quietStart: quietCheck.window?.start, quietEnd: quietCheck.window?.end });
      continue;
    }
    try {
      await executeAutomationActions(automation, context);
    } catch (error: unknown) {
      logger.error('Failed to execute automation', { component: 'automation-triggers', automationName: automation.name, error: getErrorMessage(error) });
    }
  }
}

/**
 * Evaluate AQI state and trigger matching automations
 * trigger_condition: 'above' or 'below'
 * trigger_device_id: threshold value (e.g., '50' for PM2.5)
 */
export async function evaluateAqiTrigger(currentAqi: number): Promise<void> {
  const automations = getEnabledAqiAutomations();

  if (automations.length === 0) return;

  const context: TriggerContext = {
    deviceId: 'air_purifier',
    deviceName: 'Air Purifier',
    room: null,
    condition: `aqi:${currentAqi}`,
  };

  for (const automation of automations) {
    const threshold = parseInt(automation.trigger_device_id || '0', 10);
    const condition = automation.trigger_condition;

    let shouldTrigger = false;

    if (condition === 'above') {
      shouldTrigger = currentAqi > threshold;
    } else if (condition === 'below') {
      shouldTrigger = currentAqi <= threshold;
    }

    if (shouldTrigger) {
      const quietCheck = isInQuietWindow(automation.quiet_windows);
      if (quietCheck.inQuiet) {
        logger.info('AQI automation skipped - in quiet window', { component: 'automation-triggers', automationName: automation.name, quietStart: quietCheck.window?.start, quietEnd: quietCheck.window?.end });
        continue;
      }
      logger.info('AQI trigger fired', { component: 'automation-triggers', currentAqi, condition, threshold });
      try {
        await executeAutomationActions(automation, context);
      } catch (error: unknown) {
        logger.error('Failed to execute AQI automation', { component: 'automation-triggers', automationName: automation.name, error: getErrorMessage(error) });
      }
    }
  }
}
