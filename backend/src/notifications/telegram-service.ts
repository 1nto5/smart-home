import {
  getTelegramConfig,
  logTelegram,
  getLastTelegramTime,
  getAlarmConfig,
} from '../db/database';
import { translateDeviceName } from '../utils/translations';
import { getErrorMessage } from '../utils/errors';
import { logger } from '../utils/logger';

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

    const data = await response.json() as { ok: boolean; description?: string };

    if (response.ok && data.ok) {
      return { success: true };
    }

    return {
      success: false,
      error: data.description || `HTTP ${response.status}`
    };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
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
    logger.debug('Telegram notifications disabled, skipping flood alert', { component: 'telegram-service' });
    return false;
  }

  // Check if flood alerts are enabled
  if (!config.flood_alerts) {
    logger.debug('Flood alerts disabled, skipping', { component: 'telegram-service' });
    return false;
  }

  // Check required config
  if (!config.bot_token || !config.chat_id) {
    logger.debug('Telegram config incomplete (missing bot_token or chat_id)', { component: 'telegram-service' });
    return false;
  }

  // Check cooldown
  if (isInCooldown('flood', deviceId, config.cooldown_minutes)) {
    logger.debug('Flood alert in cooldown, skipping', { component: 'telegram-service', deviceId, deviceName });
    return false;
  }

  const translatedName = translateDeviceName(deviceName);
  const message = `🚨 <b>ALARM: FLOOD DETECTED!</b>

Water detected!
Sensor: <b>${translatedName}</b>
Time: ${new Date().toLocaleString('en-GB')}

Check immediately!`;

  logger.info('Sending flood alert to Telegram', { component: 'telegram-service', chatId: config.chat_id, deviceId, deviceName });

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
    logger.info('Flood alert sent to Telegram', { component: 'telegram-service', deviceId, deviceName });
  } else {
    logger.error('Failed to send flood alert to Telegram', { component: 'telegram-service', deviceId, deviceName, error: result.error });
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
    logger.debug('Alarm not armed, skipping door alert', { component: 'telegram-service' });
    return false;
  }

  // Check if Telegram notifications are enabled
  if (!config.enabled) {
    logger.debug('Telegram notifications disabled, skipping door alert', { component: 'telegram-service' });
    return false;
  }

  // Check if door alerts are enabled
  if (!config.door_alerts) {
    logger.debug('Door alerts disabled, skipping', { component: 'telegram-service' });
    return false;
  }

  // Check required config
  if (!config.bot_token || !config.chat_id) {
    logger.debug('Telegram config incomplete (missing bot_token or chat_id)', { component: 'telegram-service' });
    return false;
  }

  // Check cooldown
  if (isInCooldown('door_open', deviceId, config.cooldown_minutes)) {
    logger.debug('Door alert in cooldown, skipping', { component: 'telegram-service', deviceId, deviceName });
    return false;
  }

  const translatedName = translateDeviceName(deviceName);
  const message = `🚪 <b>ALARM: DOOR OPENED!</b>

Alarm is ARMED!
Sensor: <b>${translatedName}</b>
Time: ${new Date().toLocaleString('en-GB')}

Possible intrusion!`;

  logger.info('Sending door alert to Telegram', { component: 'telegram-service', chatId: config.chat_id, deviceId, deviceName });

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
    logger.info('Door alert sent to Telegram', { component: 'telegram-service', deviceId, deviceName });
  } else {
    logger.error('Failed to send door alert to Telegram', { component: 'telegram-service', deviceId, deviceName, error: result.error });
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
  const typeLabel = scheduleType === 'lamp' ? 'Lights' : 'Radiators';

  const message = `${icon} <b>${typeLabel}: ${scheduleName}</b>

Preset: <b>${presetName}</b>
Time: ${new Date().toLocaleString('en-GB')}`;

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
export async function sendTestTelegram(customMessage?: string): Promise<{ success: boolean; error?: string }> {
  const config = getTelegramConfig();

  if (!config.bot_token || !config.chat_id) {
    return { success: false, error: 'Telegram config incomplete' };
  }

  const message = customMessage || `✅ <b>Test Smart Home</b>

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
