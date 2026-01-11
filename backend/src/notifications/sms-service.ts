import {
  getSmsConfig,
  logSms,
  getLastSmsTime,
  getAlarmConfig,
} from '../db/database';

export type AlertType = 'flood' | 'door_open';

interface SendSmsResult {
  success: boolean;
  error?: string;
}

/**
 * Send SMS via configured API
 * Supports common SMS gateway APIs (SMSAPI.pl, Twilio-compatible, etc.)
 */
async function sendSmsViaApi(
  phoneNumber: string,
  message: string,
  apiUrl: string,
  apiToken: string
): Promise<SendSmsResult> {
  try {
    // Default format compatible with most SMS APIs
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        to: phoneNumber,
        message: message,
      }),
    });

    if (response.ok) {
      return { success: true };
    }

    const errorText = await response.text();
    return { success: false, error: `HTTP ${response.status}: ${errorText}` };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Check if we're within cooldown period for this alert type
 */
function isInCooldown(alertType: AlertType, deviceId: string, cooldownMinutes: number): boolean {
  const lastSmsTime = getLastSmsTime(alertType, deviceId);
  if (!lastSmsTime) return false;

  const cooldownMs = cooldownMinutes * 60 * 1000;
  const timeSinceLastSms = Date.now() - lastSmsTime.getTime();

  return timeSinceLastSms < cooldownMs;
}

/**
 * Send flood alert SMS
 */
export async function sendFloodAlert(deviceId: string, deviceName: string): Promise<boolean> {
  const config = getSmsConfig();

  // Check if SMS notifications are enabled
  if (!config.enabled) {
    console.log('SMS notifications disabled, skipping flood alert');
    return false;
  }

  // Check if flood alerts are enabled
  if (!config.flood_alerts) {
    console.log('Flood alerts disabled, skipping');
    return false;
  }

  // Check required config
  if (!config.phone_number || !config.api_url || !config.api_token) {
    console.log('SMS config incomplete (missing phone, api_url, or api_token)');
    return false;
  }

  // Check cooldown
  if (isInCooldown('flood', deviceId, config.cooldown_minutes)) {
    console.log(`Flood alert for ${deviceName} in cooldown, skipping`);
    return false;
  }

  const message = `ALARM: Wykryto zalanie! Czujnik: ${deviceName}`;

  console.log(`Sending flood alert SMS to ${config.phone_number}: ${message}`);

  const result = await sendSmsViaApi(
    config.phone_number,
    message,
    config.api_url,
    config.api_token
  );

  // Log the SMS attempt
  logSms(
    'flood',
    config.phone_number,
    message,
    result.success ? 'sent' : 'failed',
    deviceId,
    deviceName,
    result.error
  );

  if (result.success) {
    console.log(`Flood alert SMS sent successfully`);
  } else {
    console.error(`Failed to send flood alert SMS: ${result.error}`);
  }

  return result.success;
}

/**
 * Send door open alert SMS (only when alarm is armed)
 */
export async function sendDoorOpenAlert(deviceId: string, deviceName: string): Promise<boolean> {
  const config = getSmsConfig();
  const alarmConfig = getAlarmConfig();

  // Check if alarm is armed
  if (!alarmConfig.armed) {
    console.log('Alarm not armed, skipping door alert');
    return false;
  }

  // Check if SMS notifications are enabled
  if (!config.enabled) {
    console.log('SMS notifications disabled, skipping door alert');
    return false;
  }

  // Check if door alerts are enabled
  if (!config.door_alerts) {
    console.log('Door alerts disabled, skipping');
    return false;
  }

  // Check required config
  if (!config.phone_number || !config.api_url || !config.api_token) {
    console.log('SMS config incomplete (missing phone, api_url, or api_token)');
    return false;
  }

  // Check cooldown
  if (isInCooldown('door_open', deviceId, config.cooldown_minutes)) {
    console.log(`Door alert for ${deviceName} in cooldown, skipping`);
    return false;
  }

  const message = `ALARM: Otwarcie drzwi przy uzbrojonym alarmie! Czujnik: ${deviceName}`;

  console.log(`Sending door alert SMS to ${config.phone_number}: ${message}`);

  const result = await sendSmsViaApi(
    config.phone_number,
    message,
    config.api_url,
    config.api_token
  );

  // Log the SMS attempt
  logSms(
    'door_open',
    config.phone_number,
    message,
    result.success ? 'sent' : 'failed',
    deviceId,
    deviceName,
    result.error
  );

  if (result.success) {
    console.log(`Door alert SMS sent successfully`);
  } else {
    console.error(`Failed to send door alert SMS: ${result.error}`);
  }

  return result.success;
}

/**
 * Send test SMS
 */
export async function sendTestSms(): Promise<{ success: boolean; error?: string }> {
  const config = getSmsConfig();

  if (!config.phone_number || !config.api_url || !config.api_token) {
    return { success: false, error: 'SMS config incomplete' };
  }

  const message = 'Smart Home: Testowa wiadomosc SMS';

  const result = await sendSmsViaApi(
    config.phone_number,
    message,
    config.api_url,
    config.api_token
  );

  // Log the test SMS
  logSms(
    'test',
    config.phone_number,
    message,
    result.success ? 'sent' : 'failed',
    undefined,
    undefined,
    result.error
  );

  return result;
}
