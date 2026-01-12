import {
  getTelegramConfig,
  logTelegram,
  getLastTelegramTime,
  getAlarmConfig,
} from '../db/database';
import { translateDeviceName } from '../utils/translations';

export type AlertType = 'flood' | 'door_open';

interface SendResult {
  success: boolean;
  error?: string;
}

/**
 * Send message via Telegram Bot API
 */
async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  message: string
): Promise<SendResult> {
  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json() as any;

    if (response.ok && data.ok) {
      return { success: true };
    }

    return {
      success: false,
      error: data.description || `HTTP ${response.status}`
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Check if we're within cooldown period for this alert type
 */
function isInCooldown(alertType: AlertType, deviceId: string, cooldownMinutes: number): boolean {
  const lastTime = getLastTelegramTime(alertType, deviceId);
  if (!lastTime) return false;

  const cooldownMs = cooldownMinutes * 60 * 1000;
  const timeSinceLast = Date.now() - lastTime.getTime();

  return timeSinceLast < cooldownMs;
}

/**
 * Send flood alert via Telegram
 */
export async function telegramFloodAlert(deviceId: string, deviceName: string): Promise<boolean> {
  const config = getTelegramConfig();

  // Check if Telegram notifications are enabled
  if (!config.enabled) {
    console.log('Telegram notifications disabled, skipping flood alert');
    return false;
  }

  // Check if flood alerts are enabled
  if (!config.flood_alerts) {
    console.log('Flood alerts disabled, skipping');
    return false;
  }

  // Check required config
  if (!config.bot_token || !config.chat_id) {
    console.log('Telegram config incomplete (missing bot_token or chat_id)');
    return false;
  }

  // Check cooldown
  if (isInCooldown('flood', deviceId, config.cooldown_minutes)) {
    console.log(`Flood alert for ${deviceName} in cooldown, skipping`);
    return false;
  }

  const translatedName = translateDeviceName(deviceName);
  const message = `🚨 <b>ALARM: FLOOD DETECTED!</b>

Water detected!
Sensor: <b>${translatedName}</b>
Time: ${new Date().toLocaleString('en-GB')}

Check immediately!`;

  console.log(`Sending flood alert to Telegram chat ${config.chat_id}`);

  const result = await sendTelegramMessage(
    config.bot_token,
    config.chat_id,
    message
  );

  // Log the attempt
  logTelegram(
    'flood',
    config.chat_id,
    message,
    result.success ? 'sent' : 'failed',
    deviceId,
    deviceName,
    result.error
  );

  if (result.success) {
    console.log(`Flood alert sent to Telegram`);
  } else {
    console.error(`Failed to send flood alert to Telegram: ${result.error}`);
  }

  return result.success;
}

/**
 * Send door open alert via Telegram (only when alarm is armed)
 */
export async function telegramDoorOpenAlert(deviceId: string, deviceName: string): Promise<boolean> {
  const config = getTelegramConfig();
  const alarmConfig = getAlarmConfig();

  // Check if alarm is armed
  if (!alarmConfig.armed) {
    console.log('Alarm not armed, skipping door alert');
    return false;
  }

  // Check if Telegram notifications are enabled
  if (!config.enabled) {
    console.log('Telegram notifications disabled, skipping door alert');
    return false;
  }

  // Check if door alerts are enabled
  if (!config.door_alerts) {
    console.log('Door alerts disabled, skipping');
    return false;
  }

  // Check required config
  if (!config.bot_token || !config.chat_id) {
    console.log('Telegram config incomplete (missing bot_token or chat_id)');
    return false;
  }

  // Check cooldown
  if (isInCooldown('door_open', deviceId, config.cooldown_minutes)) {
    console.log(`Door alert for ${deviceName} in cooldown, skipping`);
    return false;
  }

  const translatedName = translateDeviceName(deviceName);
  const message = `🚪 <b>ALARM: DOOR OPENED!</b>

Alarm is ARMED!
Sensor: <b>${translatedName}</b>
Time: ${new Date().toLocaleString('en-GB')}

Possible intrusion!`;

  console.log(`Sending door alert to Telegram chat ${config.chat_id}`);

  const result = await sendTelegramMessage(
    config.bot_token,
    config.chat_id,
    message
  );

  // Log the attempt
  logTelegram(
    'door_open',
    config.chat_id,
    message,
    result.success ? 'sent' : 'failed',
    deviceId,
    deviceName,
    result.error
  );

  if (result.success) {
    console.log(`Door alert sent to Telegram`);
  } else {
    console.error(`Failed to send door alert to Telegram: ${result.error}`);
  }

  return result.success;
}

/**
 * Send schedule executed notification
 */
export async function telegramScheduleNotification(
  scheduleType: 'lamp' | 'heater',
  scheduleName: string,
  presetName: string
): Promise<boolean> {
  const config = getTelegramConfig();

  // Check if Telegram notifications are enabled
  if (!config.enabled) {
    return false;
  }

  // Check required config
  if (!config.bot_token || !config.chat_id) {
    return false;
  }

  const icon = scheduleType === 'lamp' ? '💡' : '🔥';
  const typeLabel = scheduleType === 'lamp' ? 'Lampy' : 'Grzejniki';

  const message = `${icon} <b>${typeLabel}: ${scheduleName}</b>

Preset: <b>${presetName}</b>
Czas: ${new Date().toLocaleString('pl-PL')}`;

  const result = await sendTelegramMessage(
    config.bot_token,
    config.chat_id,
    message
  );

  // Log the notification
  logTelegram(
    `schedule_${scheduleType}`,
    config.chat_id,
    message,
    result.success ? 'sent' : 'failed',
    undefined,
    scheduleName,
    result.error
  );

  return result.success;
}

/**
 * Send test message
 */
export async function sendTestTelegram(): Promise<{ success: boolean; error?: string }> {
  const config = getTelegramConfig();

  if (!config.bot_token || !config.chat_id) {
    return { success: false, error: 'Telegram config incomplete' };
  }

  const message = `✅ <b>Test Smart Home</b>

Telegram configuration working correctly.
Time: ${new Date().toLocaleString('en-GB')}`;

  const result = await sendTelegramMessage(
    config.bot_token,
    config.chat_id,
    message
  );

  // Log the test
  logTelegram(
    'test',
    config.chat_id,
    message,
    result.success ? 'sent' : 'failed',
    undefined,
    undefined,
    result.error
  );

  return result;
}
