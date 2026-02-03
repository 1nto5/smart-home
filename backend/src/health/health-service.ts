import { getDb, getTelegramConfig } from '../db/database';
import { getGatewayConnectionStatus } from '../tuya/tuya-local';
import { config } from '../config';

const startTime = Date.now();

interface HealthCheck {
  status: 'ok' | 'error';
  message?: string;
  responseTime?: number;
}

interface HealthResponse {
  status: 'ok' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: {
    database: HealthCheck;
    telegram: HealthCheck;
    gateway: HealthCheck;
    roborock: HealthCheck;
  };
}

/**
 * Check database connectivity
 */
function checkDatabase(): HealthCheck {
  try {
    const db = getDb();
    const result = db.query('SELECT 1 as ok').get() as { ok: number };
    if (result?.ok === 1) {
      return { status: 'ok' };
    }
    return { status: 'error', message: 'Query failed' };
  } catch (err: any) {
    return { status: 'error', message: err.message };
  }
}

/**
 * Check Telegram configuration status
 */
function checkTelegram(): HealthCheck {
  try {
    const config = getTelegramConfig();
    if (!config.enabled) {
      return { status: 'ok', message: 'Disabled' };
    }
    if (!config.bot_token || !config.chat_id) {
      return { status: 'error', message: 'Missing bot_token or chat_id' };
    }
    return { status: 'ok' };
  } catch (err: any) {
    return { status: 'error', message: err.message };
  }
}

/**
 * Check gateway connection status
 */
function checkGateway(): HealthCheck {
  try {
    const connected = getGatewayConnectionStatus();
    if (connected) {
      return { status: 'ok' };
    }
    return { status: 'error', message: 'Disconnected' };
  } catch (err: any) {
    return { status: 'error', message: err.message };
  }
}

/**
 * Check Roborock bridge reachability
 */
async function checkRoborock(): Promise<HealthCheck> {
  try {
    const start = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const baseUrl = config.roborock.bridgeUrl.replace(/\/$/, '');
    const response = await fetch(`${baseUrl}/status`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const responseTime = Date.now() - start;

    if (response.ok) {
      return { status: 'ok', responseTime };
    }
    return { status: 'error', message: `HTTP ${response.status}`, responseTime };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return { status: 'error', message: 'Timeout' };
    }
    return { status: 'error', message: err.message };
  }
}

/**
 * Perform full health check
 */
export async function getHealthStatus(): Promise<HealthResponse> {
  const database = checkDatabase();
  const telegram = checkTelegram();
  const gateway = checkGateway();
  const roborock = await checkRoborock();

  const checks = { database, telegram, gateway, roborock };

  // Determine overall status
  const criticalChecks = [database, gateway];
  const allChecks = Object.values(checks);

  let status: 'ok' | 'degraded' | 'unhealthy';
  if (criticalChecks.some(c => c.status === 'error')) {
    status = 'unhealthy';
  } else if (allChecks.some(c => c.status === 'error')) {
    status = 'degraded';
  } else {
    status = 'ok';
  }

  return {
    status,
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks,
  };
}
