import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { AutomationSchema, AutomationUpdateSchema } from '../validation/schemas';
import {
  getAutomations,
  getAutomation,
  createAutomation,
  updateAutomation,
  deleteAutomation,
  toggleAutomation,
  getAutomationLog,
} from '../db/database';
import { logger } from '../utils/logger';

const automations = new Hono();

// Get all automations
automations.get('/', (c) => {
  const list = getAutomations();
  return c.json(list);
});

// Get automation log
automations.get('/log', (c) => {
  const limit = Math.min(parseInt(c.req.query('limit') || '50'), 1000);
  const log = getAutomationLog(limit);
  return c.json(log);
});

// Get single automation
automations.get('/:id', (c) => {
  const id = parseInt(c.req.param('id'));
  const automation = getAutomation(id);
  if (!automation) {
    return c.json({ error: 'Automation not found' }, 404);
  }
  return c.json(automation);
});

// Create automation
automations.post('/', zValidator('json', AutomationSchema), async (c) => {
  const body = c.req.valid('json');
  const automation = createAutomation(body);
  logger.info('Created automation', { component: 'automations-route', automationName: automation.name });
  return c.json(automation, 201);
});

// Update automation
automations.patch('/:id', zValidator('json', AutomationUpdateSchema), async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = c.req.valid('json');
  const automation = updateAutomation(id, body);
  if (!automation) {
    return c.json({ error: 'Automation not found' }, 404);
  }
  logger.info('Updated automation', { component: 'automations-route', automationName: automation.name });
  return c.json(automation);
});

// Delete automation
automations.delete('/:id', (c) => {
  const id = parseInt(c.req.param('id'));
  const deleted = deleteAutomation(id);
  if (!deleted) {
    return c.json({ error: 'Automation not found' }, 404);
  }
  logger.info('Deleted automation', { component: 'automations-route', automationId: id });
  return c.json({ success: true });
});

// Toggle automation
automations.patch('/:id/toggle', (c) => {
  const id = parseInt(c.req.param('id'));
  const automation = toggleAutomation(id);
  if (!automation) {
    return c.json({ error: 'Automation not found' }, 404);
  }
  logger.info('Toggled automation', { component: 'automations-route', automationName: automation.name, enabled: !!automation.enabled });
  return c.json(automation);
});

export default automations;
