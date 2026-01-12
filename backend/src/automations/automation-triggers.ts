/**
 * Automation Triggers
 * Detects events and triggers matching automation rules
 */

import { getDb, getEnabledAutomationsForTrigger, type Automation } from '../db/database';
import { executeAutomationActions, type TriggerContext } from './automation-actions';

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
