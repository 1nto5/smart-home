import { Hono } from 'hono';
import {
  getAutomations,
  getAutomation,
  createAutomation,
  updateAutomation,
  deleteAutomation,
  toggleAutomation,
  getAutomationLog,
} from '../db/database';

const automations = new Hono();

// Get all automations
automations.get('/', (c) => {
  const list = getAutomations();
  return c.json(list);
});

// Get automation log
automations.get('/log', (c) => {
  const limit = parseInt(c.req.query('limit') || '50');
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
automations.post('/', async (c) => {
  const body = await c.req.json();
  const automation = createAutomation(body);
  console.log(`Created automation: ${automation.name}`);
  return c.json(automation, 201);
});

// Update automation
automations.patch('/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const automation = updateAutomation(id, body);
  if (!automation) {
    return c.json({ error: 'Automation not found' }, 404);
  }
  console.log(`Updated automation: ${automation.name}`);
  return c.json(automation);
});

// Delete automation
automations.delete('/:id', (c) => {
  const id = parseInt(c.req.param('id'));
  const deleted = deleteAutomation(id);
  if (!deleted) {
    return c.json({ error: 'Automation not found' }, 404);
  }
  console.log(`Deleted automation: ${id}`);
  return c.json({ success: true });
});

// Toggle automation
automations.patch('/:id/toggle', (c) => {
  const id = parseInt(c.req.param('id'));
  const automation = toggleAutomation(id);
  if (!automation) {
    return c.json({ error: 'Automation not found' }, 404);
  }
  console.log(`Toggled automation: ${automation.name} -> ${automation.enabled ? 'enabled' : 'disabled'}`);
  return c.json(automation);
});

export default automations;
