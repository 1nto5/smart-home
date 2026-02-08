import { Hono } from 'hono';
import { getDbStats, cleanupOldData } from '../db/maintenance';
import { getAllCircuitStats, resetAllCircuits } from '../utils/circuit-breaker';
import { getHealthStatus } from '../health/health-service';
import { logger } from '../utils/logger';

const admin = new Hono();

// Database stats
admin.get('/db-stats', (c) => {
  const stats = getDbStats();
  return c.json(stats);
});

// Manual cleanup
admin.post('/cleanup', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const result = cleanupOldData(body);
  logger.info('Manual cleanup', { component: 'admin-route', totalDeleted: result.totalDeleted });
  return c.json(result);
});

// Circuit breaker stats
admin.get('/circuits', (c) => {
  const stats = getAllCircuitStats();
  return c.json(stats);
});

// Reset all circuit breakers
admin.post('/circuits/reset', (c) => {
  resetAllCircuits();
  return c.json({ success: true, message: 'All circuits reset' });
});

// Health check (detailed)
admin.get('/health', async (c) => {
  const health = await getHealthStatus();
  return c.json(health);
});

export default admin;
