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
  } catch (err) {
    return { status: 'error', message: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Check Telegram configuration status
 */
function checkTelegram(): HealthCheck {
  try {
    const telegramConfig = getTelegramConfig();
    if (!telegramConfig.enabled) {
      return { status: 'ok', message: 'Disabled' };
    }
    if (!telegramConfig.bot_token || !telegramConfig.chat_id) {
      return { status: 'error', message: 'Missing bot_token or chat_id' };
    }
    return { status: 'ok' };
  } catch (err) {
    return { status: 'error', message: err instanceof Error ? err.message : String(err) };
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
  } catch (err) {
    return { status: 'error', message: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Check Roborock bridge reachability (cached with 30s TTL)
 */
const ROBOROCK_CACHE_TTL = 30_000;
let roborockCache: { result: HealthCheck; expiresAt: number } | null = null;

async function checkRoborock(): Promise<HealthCheck> {
  if (roborockCache && Date.now() < roborockCache.expiresAt) {
    return roborockCache.result;
  }

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

    const result: HealthCheck = response.ok
      ? { status: 'ok', responseTime }
      : { status: 'error', message: `HTTP ${response.status}`, responseTime };
    roborockCache = { result, expiresAt: Date.now() + ROBOROCK_CACHE_TTL };
    return result;
  } catch (err) {
    const message = err instanceof Error
      ? (err.name === 'AbortError' ? 'Timeout' : err.message)
      : String(err);
    const result: HealthCheck = { status: 'error', message };
    roborockCache = { result, expiresAt: Date.now() + ROBOROCK_CACHE_TTL };
    return result;
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
