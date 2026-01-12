/**
 * Automation Triggers
 * Detects events and triggers matching automation rules
 */

import { getDb, type Automation } from '../db/database';
import { executeAutomationActions, type TriggerContext } from './automation-actions';

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

  // Execute each matching automation
  for (const automation of automations) {
    try {
      await executeAutomationActions(automation, context);
    } catch (error: any) {
      console.error(`Failed to execute automation "${automation.name}":`, error.message);
    }
  }
}

/**
 * Evaluate AQI threshold crossings and trigger matching automations
 * trigger_condition: 'above' or 'below'
 * trigger_device_id: threshold value (e.g., '50' for PM2.5)
 */
export async function evaluateAqiTrigger(
  previousAqi: number,
  currentAqi: number
): Promise<void> {
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
      // Trigger when crossing from below to above threshold
      shouldTrigger = previousAqi <= threshold && currentAqi > threshold;
    } else if (condition === 'below') {
      // Trigger when crossing from above to below (or equal) threshold
      shouldTrigger = previousAqi > threshold && currentAqi <= threshold;
    }

    if (shouldTrigger) {
      console.log(`AQI trigger: ${previousAqi} -> ${currentAqi} (threshold ${threshold}, condition ${condition})`);
      try {
        await executeAutomationActions(automation, context);
      } catch (error: any) {
        console.error(`Failed to execute AQI automation "${automation.name}":`, error.message);
      }
    }
  }
}
