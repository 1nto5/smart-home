import { getTelegramConfig, logTelegram } from '../db/database';
import { getErrorMessage } from '../utils/errors';
import { logger } from '../utils/logger';

type Severity = 'critical' | 'warning';

interface ErrorNotification {
  component: string;
  error: Error | string;
  severity: Severity;
}

// Cooldown map: component -> last notification timestamp
const cooldownMap = new Map<string, number>();
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

// Transient errors that should be suppressed (they recover automatically)
const SUPPRESSED_ERRORS = [
  'handshake needed',
  'handshake timeout',
  'Call to device timed out',
];

/**
 * Send error notification via Telegram
 */
export async function notifyError({ component, error, severity }: ErrorNotification): Promise<boolean> {
  const config = getTelegramConfig();

  // Check if Telegram is configured and error alerts enabled
  if (!config.enabled || !config.bot_token || !config.chat_id) {
    return false;
  }

  // Check error_alerts setting
  if (!config.error_alerts) {
    return false;
  }

  // Filter out transient errors that recover automatically
  const errorMessage = error instanceof Error ? error.message : String(error);
  if (SUPPRESSED_ERRORS.some(pattern => errorMessage.includes(pattern))) {
    return false;
  }

  // Check cooldown
  const lastNotify = cooldownMap.get(component);
  if (lastNotify && Date.now() - lastNotify < COOLDOWN_MS) {
    logger.debug('Error alert in cooldown, skipping', { component: 'error-notification', alertComponent: component });
    return false;
  }

  const emoji = severity === 'critical' ? '🔴' : '🟡';
  const timestamp = new Date().toLocaleString('en-GB', { timeZone: 'Europe/Warsaw' });

  const message = `${emoji} <b>${component} Error</b>

${errorMessage}

Time: ${timestamp}`;

  try {
    const url = `https://api.telegram.org/bot${config.bot_token}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.chat_id,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json() as { ok: boolean; description?: string };

    // Update cooldown
    cooldownMap.set(component, Date.now());

    // Log the notification
    logTelegram(
      `error_${severity}`,
      config.chat_id,
      message,
      data.ok ? 'sent' : 'failed',
      undefined,
      component,
      data.ok ? undefined : data.description
    );

    if (data.ok) {
      logger.info('Error alert sent', { component: 'error-notification', alertComponent: component, severity });
    } else {
      logger.error('Failed to send error alert', { component: 'error-notification', alertComponent: component, error: data.description });
    }

    return data.ok;
  } catch (err: unknown) {
    logger.error('Error sending notification', { component: 'error-notification', error: getErrorMessage(err) });
    return false;
  }
}
