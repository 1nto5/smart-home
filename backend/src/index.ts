import { notifyError } from './notifications/error-notification';
import { logger as startupLogger } from './utils/logger';

// Global error handlers to prevent crashes from async errors
process.on('uncaughtException', (err) => {
  startupLogger.error(`Uncaught exception: ${err.message}`, { component: 'process' });
  notifyError({ component: 'Backend', error: err, severity: 'critical' });
});
process.on('unhandledRejection', (reason: unknown) => {
  const msg = reason instanceof Error ? reason.message : String(reason);
  startupLogger.error(`Unhandled rejection: ${msg}`, { component: 'process' });
  notifyError({ component: 'Backend', error: msg, severity: 'warning' });
});

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { logger as structuredLogger } from './utils/logger';
import { serveStatic, createBunWebSocket } from 'hono/bun';
import type { ServerWebSocket } from 'bun';
import { addClient, removeClient } from './ws/broadcast';
import { buildStateSnapshot } from './ws/snapshot';
import { WsMessageSchema } from './validation/schemas';
import { config } from './config';
import { errorHandler } from './middleware/error-handler';
import { authMiddleware } from './middleware/auth';
import { rateLimiter } from './middleware/rate-limit';
import { initDatabase, closeDatabase } from './db/database';
import { startTelegramBot, stopTelegramBot } from './telegram/telegram-bot';
import { startAlarmNotificationLoop, stopAlarmNotificationLoop } from './notifications/alarm-service';
import { getHealthStatus } from './health/health-service';
import { startGatewayWatchdog, stopGatewayWatchdog } from './tuya/gateway-watchdog';
import { startMaintenanceScheduler, stopMaintenanceScheduler } from './db/maintenance';
import { disconnectAll } from './tuya/tuya-local';
import { refreshLampPresetsCache, startScheduler, startPoller, triggerComprehensiveRefresh } from './scheduling';

// Import route modules
import {
  devicesRoutes,
  xiaomiRoutes,
  yamahaRoutes,
  roborockRoutes,
  presetsRoutes,
  heaterRoutes,
  sensorsRoutes,
  automationsRoutes,
  alarmRoutes,
  telegramRoutes,
  adminRoutes,
  purifierRoutes,
} from './routes';

const app = new Hono();

// Global error handler
app.onError(errorHandler);

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: [
    'http://10.10.10.10',
    'http://localhost:5173',
    'http://localhost:3001',
  ],
}));
app.use('/api/*', rateLimiter(100, 60_000));

// Initialize database
initDatabase();

// Initialize lamp presets cache from DB
refreshLampPresetsCache();

// Start scheduler and poller
startScheduler();
startPoller();

// Start Telegram bot
startTelegramBot();

// Start alarm notification loop
startAlarmNotificationLoop();

// Start gateway watchdog
startGatewayWatchdog();

// Start database maintenance scheduler
startMaintenanceScheduler();

// Graceful shutdown handler
async function shutdown(signal: string) {
  structuredLogger.info(`${signal} received, shutting down`, { component: 'server' });
  stopTelegramBot();
  stopAlarmNotificationLoop();
  stopGatewayWatchdog();
  stopMaintenanceScheduler();
  disconnectAll();
  closeDatabase();
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// === ROUTE MOUNTING ===

// Health check — basic status is public, full details require auth
app.get('/api/health', async (c) => {
  const health = await getHealthStatus();
  const statusCode = health.status === 'unhealthy' ? 503 : 200;

  // Check if request has valid auth token for full details
  const authHeader = c.req.header('Authorization');
  const isAuthenticated = config.auth.token &&
    authHeader?.startsWith('Bearer ') &&
    authHeader.slice(7) === config.auth.token;

  if (!isAuthenticated) {
    return c.json({ status: health.status, timestamp: health.timestamp }, statusCode);
  }

  return c.json(health, statusCode);
});

// Apply auth middleware to all /api/* routes (except health which is already defined above)
if (config.auth.token) {
  app.use('/api/*', authMiddleware);
}

// Mount route modules
app.route('/api/devices', devicesRoutes);
app.route('/api/xiaomi', xiaomiRoutes);
app.route('/api/yamaha', yamahaRoutes);
app.route('/api/roborock', roborockRoutes);
app.route('/api/presets', presetsRoutes);
app.route('/api/heater', heaterRoutes);
app.route('/api/sensors', sensorsRoutes);
app.route('/api/automations', automationsRoutes);
app.route('/api/alarm', alarmRoutes);
app.route('/api/telegram', telegramRoutes);
app.route('/api/admin', adminRoutes);
app.route('/api/purifier', purifierRoutes);

// WebSocket for real-time status updates
const { upgradeWebSocket, websocket } = createBunWebSocket();

app.get('/ws', upgradeWebSocket((c) => {
  // Verify token from query param if auth is enabled
  if (config.auth.token) {
    const token = c.req.query('token');
    if (token !== config.auth.token) {
      // Return empty handlers - connection will be rejected
      return {
        onOpen(_event, ws) {
          ws.close(1008, 'Unauthorized');
        },
      };
    }
  }

  return {
    onOpen(_event, ws) {
      addClient(ws.raw as ServerWebSocket<unknown>);
      // Send full state snapshot immediately on connect
      try {
        ws.send(JSON.stringify(buildStateSnapshot()));
      } catch (e) {
        structuredLogger.error('Failed to send snapshot', { component: 'server', error: (e as Error).message });
      }
    },
    onMessage(event, ws) {
      try {
        const raw = JSON.parse(String(event.data));
        const result = WsMessageSchema.safeParse(raw);
        if (!result.success) return;

        if (result.data.type === 'request_snapshot') {
          ws.send(JSON.stringify(buildStateSnapshot()));
        } else if (result.data.type === 'request_refresh') {
          triggerComprehensiveRefresh().then(result => {
            if (!result.triggered) {
              ws.send(JSON.stringify({ type: 'refresh_skipped', nextAvailableIn: result.nextAvailableIn }));
            }
          });
        }
      } catch { /* ignore malformed JSON */ }
    },
    onClose(_event, ws) {
      removeClient(ws.raw as ServerWebSocket<unknown>);
    },
  };
}));

// Serve static files (frontend) in production
app.use('/*', serveStatic({ root: '../frontend/dist' }));

// Start server
const port = config.server.port;
structuredLogger.info(`Smart Home API running on http://localhost:${port}`, { component: 'server' });

export default {
  port,
  fetch: app.fetch,
  websocket,
  // Heater preset operations can take 30+ seconds with retries
  idleTimeout: 60,
};
