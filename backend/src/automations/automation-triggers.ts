/**
 * Automation Triggers
 * Detects events and triggers matching automation rules
 */

import { getDb, type Automation } from '../db/database';
import { executeAutomationActions, type TriggerContext } from './automation-actions';

/**
 * Check if current time is within the quiet window (automation should be suppressed)
 * Handles midnight crossing (e.g., 22:00-06:00)
 */
function isInQuietWindow(quietStart: string | null, quietEnd: string | null): boolean {
  if (!quietStart || !quietEnd) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = quietStart.split(':').map(Number);
  const [endH, endM] = quietEnd.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (startMinutes <= endMinutes) {
    // Normal range (e.g., 06:00-08:00)
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  } else {
    // Crosses midnight (e.g., 22:00-06:00)
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
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

  console.log(`Automation trigger: ${deviceName} -> ${condition}, found ${automations.length} matching rule(s)`);

  // Execute each matching automation (skip if in quiet window)
  for (const automation of automations) {
    if (isInQuietWindow(automation.quiet_start, automation.quiet_end)) {
      console.log(`Automation "${automation.name}" skipped - in quiet window (${automation.quiet_start}-${automation.quiet_end})`);
      continue;
    }
    try {
      await executeAutomationActions(automation, context);
    } catch (error: any) {
      console.error(`Failed to execute automation "${automation.name}":`, error.message);
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
      if (isInQuietWindow(automation.quiet_start, automation.quiet_end)) {
        console.log(`AQI automation "${automation.name}" skipped - in quiet window (${automation.quiet_start}-${automation.quiet_end})`);
        continue;
      }
      console.log(`AQI trigger: ${currentAqi} ${condition} ${threshold}`);
      try {
        await executeAutomationActions(automation, context);
      } catch (error: any) {
        console.error(`Failed to execute AQI automation "${automation.name}":`, error.message);
      }
    }
  }
}
