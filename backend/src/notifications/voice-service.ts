import {
  getVoiceConfig,
  logVoiceCall,
  getLastVoiceCallTime,
  getAlarmConfig,
} from '../db/database';

export type AlertType = 'flood' | 'door_open';

interface CallResult {
  success: boolean;
  callSid?: string;
  error?: string;
}

/**
 * Make voice call via Twilio API
 * Uses TwiML to speak the message in Polish
 */
async function makeVoiceCall(
  toNumber: string,
  message: string,
  accountSid: string,
  authToken: string,
  fromNumber: string
): Promise<CallResult> {
  try {
    // TwiML instruction to speak the message in Polish
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="pl-PL" voice="Polly.Ewa">${escapeXml(message)}</Say>
  <Pause length="1"/>
  <Say language="pl-PL" voice="Polly.Ewa">${escapeXml(message)}</Say>
</Response>`;

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`;

    const body = new URLSearchParams({
      To: toNumber,
      From: fromNumber,
      Twiml: twiml,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const data = await response.json() as any;

    if (response.ok && data.sid) {
      return { success: true, callSid: data.sid };
    }

    return {
      success: false,
      error: data.message || `HTTP ${response.status}`
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Check if we're within cooldown period for this alert type
 */
function isInCooldown(alertType: AlertType, deviceId: string, cooldownMinutes: number): boolean {
  const lastCallTime = getLastVoiceCallTime(alertType, deviceId);
  if (!lastCallTime) return false;

  const cooldownMs = cooldownMinutes * 60 * 1000;
  const timeSinceLastCall = Date.now() - lastCallTime.getTime();

  return timeSinceLastCall < cooldownMs;
}

/**
 * Make flood alert call
 */
export async function callFloodAlert(deviceId: string, deviceName: string): Promise<boolean> {
  const config = getVoiceConfig();

  // Check if voice notifications are enabled
  if (!config.enabled) {
    console.log('Voice notifications disabled, skipping flood alert call');
    return false;
  }

  // Check if flood alerts are enabled
  if (!config.flood_alerts) {
    console.log('Flood alerts disabled, skipping');
    return false;
  }

  // Check required config
  if (!config.to_number || !config.twilio_account_sid || !config.twilio_auth_token || !config.twilio_from_number) {
    console.log('Voice config incomplete (missing Twilio credentials or phone numbers)');
    return false;
  }

  // Check cooldown
  if (isInCooldown('flood', deviceId, config.cooldown_minutes)) {
    console.log(`Flood alert for ${deviceName} in cooldown, skipping call`);
    return false;
  }

  const message = `Uwaga! Wykryto zalanie! Czujnik: ${deviceName}. Powtarzam: Wykryto zalanie, czujnik ${deviceName}.`;

  console.log(`Making flood alert call to ${config.to_number}`);

  const result = await makeVoiceCall(
    config.to_number,
    message,
    config.twilio_account_sid,
    config.twilio_auth_token,
    config.twilio_from_number
  );

  // Log the call attempt
  logVoiceCall(
    'flood',
    config.to_number,
    message,
    result.success ? 'initiated' : 'failed',
    deviceId,
    deviceName,
    result.callSid,
    result.error
  );

  if (result.success) {
    console.log(`Flood alert call initiated, SID: ${result.callSid}`);
  } else {
    console.error(`Failed to make flood alert call: ${result.error}`);
  }

  return result.success;
}

/**
 * Make door open alert call (only when alarm is armed)
 */
export async function callDoorOpenAlert(deviceId: string, deviceName: string): Promise<boolean> {
  const config = getVoiceConfig();
  const alarmConfig = getAlarmConfig();

  // Check if alarm is armed
  if (!alarmConfig.armed) {
    console.log('Alarm not armed, skipping door alert call');
    return false;
  }

  // Check if voice notifications are enabled
  if (!config.enabled) {
    console.log('Voice notifications disabled, skipping door alert call');
    return false;
  }

  // Check if door alerts are enabled
  if (!config.door_alerts) {
    console.log('Door alerts disabled, skipping');
    return false;
  }

  // Check required config
  if (!config.to_number || !config.twilio_account_sid || !config.twilio_auth_token || !config.twilio_from_number) {
    console.log('Voice config incomplete (missing Twilio credentials or phone numbers)');
    return false;
  }

  // Check cooldown
  if (isInCooldown('door_open', deviceId, config.cooldown_minutes)) {
    console.log(`Door alert for ${deviceName} in cooldown, skipping call`);
    return false;
  }

  const message = `Uwaga! Alarm! Otwarto drzwi przy uzbrojonym systemie! Czujnik: ${deviceName}. Powtarzam: Otwarto drzwi, czujnik ${deviceName}.`;

  console.log(`Making door alert call to ${config.to_number}`);

  const result = await makeVoiceCall(
    config.to_number,
    message,
    config.twilio_account_sid,
    config.twilio_auth_token,
    config.twilio_from_number
  );

  // Log the call attempt
  logVoiceCall(
    'door_open',
    config.to_number,
    message,
    result.success ? 'initiated' : 'failed',
    deviceId,
    deviceName,
    result.callSid,
    result.error
  );

  if (result.success) {
    console.log(`Door alert call initiated, SID: ${result.callSid}`);
  } else {
    console.error(`Failed to make door alert call: ${result.error}`);
  }

  return result.success;
}

/**
 * Make test call
 */
export async function makeTestCall(): Promise<{ success: boolean; callSid?: string; error?: string }> {
  const config = getVoiceConfig();

  if (!config.to_number || !config.twilio_account_sid || !config.twilio_auth_token || !config.twilio_from_number) {
    return { success: false, error: 'Voice config incomplete' };
  }

  const message = 'To jest testowe połączenie z systemu Smart Home. Konfiguracja działa poprawnie.';

  const result = await makeVoiceCall(
    config.to_number,
    message,
    config.twilio_account_sid,
    config.twilio_auth_token,
    config.twilio_from_number
  );

  // Log the test call
  logVoiceCall(
    'test',
    config.to_number,
    message,
    result.success ? 'initiated' : 'failed',
    undefined,
    undefined,
    result.callSid,
    result.error
  );

  return result;
}
