import { sendMessage } from '../telegram/telegram-bot';
import {
  getTelegramConfig,
  getActiveAlarms,
  createActiveAlarm,
  hasActiveAlarmForDevice,
  getAlarmConfig,
} from '../db/database';
import { translateDeviceName } from '../utils/translations';
import type { ActiveAlarm, AlarmType } from '../db/database';

const NOTIFICATION_INTERVAL_MS = 30_000; // 30 seconds

let notificationInterval: Timer | null = null;

/**
 * Acknowledge keyboard for alarm notifications
 */
function acknowledgeKeyboard(alarmId: number) {
  return {
    inline_keyboard: [
      [{ text: '🛑 ACKNOWLEDGE', callback_data: `alarm_ack:${alarmId}` }],
      [{ text: '🛑 ACK ALL', callback_data: 'alarm_ack_all' }],
      [{ text: '🔓 DISARM + ACK', callback_data: 'alarm_disarm_ack' }],
    ],
  };
}

/**
 * Format timestamp for display
 */
function formatTime(timestamp: string): string {
  const date = new Date(timestamp + 'Z'); // UTC
  return date.toLocaleString('en-GB', {
    timeZone: 'Europe/Warsaw',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Send notification for a single active alarm
 */
async function sendAlarmNotification(alarm: ActiveAlarm): Promise<boolean> {
  const config = getTelegramConfig();
  if (!config.enabled || !config.bot_token || !config.chat_id) {
    return false;
  }

  const isFlood = alarm.alarm_type === 'flood';
  const emoji = isFlood ? '🚨🚨🚨' : '🚪🚨🚨';
  const title = isFlood ? 'FLOOD ALARM ACTIVE!' : 'DOOR ALARM ACTIVE!';

  const message = `${emoji} <b>${title}</b>

Sensor: <b>${translateDeviceName(alarm.device_name)}</b>
Triggered: ${formatTime(alarm.triggered_at)}

⚠️ <b>RESPOND TO STOP NOTIFICATIONS</b>`;

  const success = await sendMessage(config.chat_id, message, acknowledgeKeyboard(alarm.id));
  if (success) {
    console.log(`🔔 Alarm notification sent: ${alarm.alarm_type} - ${alarm.device_name}`);
  }
  return success;
}

/**
 * Check for active alarms and send notifications
 */
async function checkAndNotify(): Promise<void> {
  const activeAlarms = getActiveAlarms();

  if (activeAlarms.length === 0) {
    return;
  }

  console.log(`🚨 ${activeAlarms.length} active alarm(s) - sending notifications`);

  for (const alarm of activeAlarms) {
    await sendAlarmNotification(alarm);
  }
}

/**
 * Start the alarm notification loop
 */
export function startAlarmNotificationLoop(): void {
  if (notificationInterval) {
    console.log('⚠️ Alarm notification loop already running');
    return;
  }

  console.log(`🚨 Starting alarm notification loop (every ${NOTIFICATION_INTERVAL_MS / 1000}s)`);

  notificationInterval = setInterval(checkAndNotify, NOTIFICATION_INTERVAL_MS);
}

/**
 * Stop the alarm notification loop
 */
export function stopAlarmNotificationLoop(): void {
  if (notificationInterval) {
    clearInterval(notificationInterval);
    notificationInterval = null;
    console.log('🚨 Alarm notification loop stopped');
  }
}

/**
 * Trigger a new alarm (called from sensor event handlers)
 * Returns the alarm ID if created, null if already exists or not applicable
 */
export async function triggerAlarm(
  alarmType: AlarmType,
  deviceId: string,
  deviceName: string
): Promise<number | null> {
  // Check if there's already an active alarm for this device
  if (hasActiveAlarmForDevice(deviceId)) {
    console.log(`⚠️ Active alarm already exists for ${deviceName}`);
    return null;
  }

  // For door alarms, check if alarm system is armed
  if (alarmType === 'door') {
    const alarmConfig = getAlarmConfig();
    if (!alarmConfig.armed) {
      return null;
    }
  }

  // Create the alarm record
  const alarmId = createActiveAlarm(alarmType, deviceId, deviceName);
  console.log(`🚨 New ${alarmType} alarm created (ID: ${alarmId}) - ${deviceName}`);

  // Get the alarm we just created for notification
  const activeAlarms = getActiveAlarms();
  const alarm = activeAlarms.find((a) => a.id === alarmId);

  if (alarm) {
    // Send immediate first notification
    await sendAlarmNotification(alarm);
  }

  return alarmId;
}
