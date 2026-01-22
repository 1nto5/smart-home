import { getGatewayConnectionStatus, reconnectGateway } from './tuya-local';
import { notifyError } from '../notifications/error-notification';

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
      console.log('🔌 Gateway connection restored');
      consecutiveFailures = 0;
    }
    return;
  }

  consecutiveFailures++;
  console.log(`🔌 Gateway disconnected (attempt ${consecutiveFailures}/${MAX_FAILURES_BEFORE_ALERT})`);

  // Attempt reconnect
  const success = await reconnectGateway();

  if (success) {
    console.log('🔌 Gateway reconnected successfully');
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
    console.log('⚠️ Gateway watchdog already running');
    return;
  }

  console.log(`🐕 Starting gateway watchdog (every ${CHECK_INTERVAL_MS / 1000}s)`);
  watchdogInterval = setInterval(checkGateway, CHECK_INTERVAL_MS);
}

/**
 * Stop the gateway watchdog
 */
export function stopGatewayWatchdog(): void {
  if (watchdogInterval) {
    clearInterval(watchdogInterval);
    watchdogInterval = null;
    console.log('🐕 Gateway watchdog stopped');
  }
}
