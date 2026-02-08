import { getGatewayConnectionStatus, reconnectGateway } from './tuya-local';
import { notifyError } from '../notifications/error-notification';
import { logger } from '../utils/logger';

const CHECK_INTERVAL_MS = 60_000; // 60 seconds
const MAX_FAILURES_BEFORE_ALERT = 3;

let watchdogInterval: Timer | null = null;
let consecutiveFailures = 0;

/**
 * Check gateway connection and attempt reconnect if needed
 */
async function checkGateway(): Promise<void> {
  const connected = getGatewayConnectionStatus();

  if (connected) {
    // Reset failure counter on successful connection
    if (consecutiveFailures > 0) {
      logger.info('Gateway connection restored', { component: 'gateway-watchdog' });
      consecutiveFailures = 0;
    }
    return;
  }

  consecutiveFailures++;
  logger.warn('Gateway disconnected', { component: 'gateway-watchdog', attempt: consecutiveFailures, maxAttempts: MAX_FAILURES_BEFORE_ALERT });

  // Attempt reconnect
  const success = await reconnectGateway();

  if (success) {
    logger.info('Gateway reconnected successfully', { component: 'gateway-watchdog' });
    consecutiveFailures = 0;
    return;
  }

  // Alert after max failures
  if (consecutiveFailures >= MAX_FAILURES_BEFORE_ALERT) {
    await notifyError({
      component: 'Gateway',
      error: `Connection lost, ${consecutiveFailures} reconnect attempts failed`,
      severity: 'critical',
    });
  }
}

/**
 * Start the gateway watchdog
 */
export function startGatewayWatchdog(): void {
  if (watchdogInterval) {
    logger.warn('Gateway watchdog already running', { component: 'gateway-watchdog' });
    return;
  }

  logger.info('Starting gateway watchdog', { component: 'gateway-watchdog', intervalMs: CHECK_INTERVAL_MS });
  watchdogInterval = setInterval(checkGateway, CHECK_INTERVAL_MS);
}

/**
 * Stop the gateway watchdog
 */
export function stopGatewayWatchdog(): void {
  if (watchdogInterval) {
    clearInterval(watchdogInterval);
    watchdogInterval = null;
    logger.info('Gateway watchdog stopped', { component: 'gateway-watchdog' });
  }
}
