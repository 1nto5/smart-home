import { notifyError } from './notifications/error-notification';

// Global error handlers to prevent crashes from async errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err.message);
  notifyError({ component: 'Backend', error: err, severity: 'critical' });
});
process.on('unhandledRejection', (reason: unknown) => {
  const msg = reason instanceof Error ? reason.message : String(reason);
  console.error('Unhandled rejection:', msg);
  notifyError({ component: 'Backend', error: msg, severity: 'warning' });
});

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serveStatic, createBunWebSocket } from 'hono/bun';
import { addClient, removeClient } from './ws/broadcast';
import { config } from './config';
import { initDatabase, closeDatabase } from './db/database';
import { startTelegramBot, stopTelegramBot } from './telegram/telegram-bot';
import { startAlarmNotificationLoop, stopAlarmNotificationLoop } from './notifications/alarm-service';
import { getHealthStatus } from './health/health-service';
import { startGatewayWatchdog, stopGatewayWatchdog } from './tuya/gateway-watchdog';
import { startMaintenanceScheduler, stopMaintenanceScheduler } from './db/maintenance';
import { disconnectAll } from './tuya/tuya-local';
import { refreshLampPresetsCache, startScheduler, startPoller } from './scheduling';

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

// Middleware
app.use('*', logger());
app.use('*', cors());

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
  console.log(`${signal} received, shutting down...`);
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

// Health check (quick, not behind /api)
app.get('/api/health', async (c) => {
  const health = await getHealthStatus();
  const statusCode = health.status === 'unhealthy' ? 503 : 200;
  return c.json(health, statusCode);
});

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

// Legacy route aliases for backwards compatibility
app.get('/api/rooms', (c) => c.redirect('/api/devices/rooms/list'));
app.get('/api/schedules', (c) => c.redirect('/api/presets/schedules/list'));
app.get('/api/pending-actions', (c) => c.redirect('/api/presets/pending-actions'));
app.get('/api/home-status', (c) => c.redirect('/api/sensors/home-status'));
app.get('/api/contacts/history', (c) => c.redirect('/api/sensors/contacts/history'));
app.get('/api/heater-presets', (c) => c.redirect('/api/heater/presets'));
app.get('/api/heater-schedules', (c) => c.redirect('/api/heater/schedules'));
app.get('/api/heater-override', (c) => c.redirect('/api/heater/override'));

// WebSocket for real-time status updates
const { upgradeWebSocket, websocket } = createBunWebSocket();

app.get('/ws', upgradeWebSocket(() => ({
  onOpen(_event, ws) {
    addClient(ws.raw as WebSocket);
  },
  onClose(_event, ws) {
    removeClient(ws.raw as WebSocket);
  },
})));

// Serve static files (frontend) in production
app.use('/*', serveStatic({ root: '../frontend/dist' }));

// Start server
const port = config.server.port;
console.log(`🏠 Smart Home API running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
  websocket,
};
