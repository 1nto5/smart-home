import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import {
  LampPresetSchema,
  LampPresetUpdateSchema,
  LampScheduleSchema,
  LampScheduleUpdateSchema,
} from '../validation/schemas';
import {
  isValidPreset,
  getLampPresets,
  updateLampPreset,
  createLampPreset,
  deleteLampPreset,
  refreshLampPresetsCache,
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  toggleSchedule,
  applyPresetToAllLamps,
  getPendingActions,
  clearAllPending,
  getCurrentTimeWindow,
  getPresetForTimeWindow,
} from '../scheduling';
import {
  broadcastHomeStatus,
  broadcastPendingActions,
  broadcastSchedulesChanged,
} from '../ws/device-broadcast';

const presets = new Hono();

// Get available presets
presets.get('/', (c) => {
  const presetList = getLampPresets();
  const result: Record<string, { name: string; brightness: number; colorTemp: number; power: boolean }> = {};
  for (const p of presetList) {
    result[p.id] = {
      name: p.name,
      brightness: p.brightness,
      colorTemp: p.color_temp,
      power: p.power,
    };
  }
  return c.json(result);
});

// Create preset
presets.post('/', zValidator('json', LampPresetSchema), async (c) => {
  const { id, name, brightness, color_temp, power } = c.req.valid('json');

  try {
    const preset = createLampPreset(id, name, brightness, color_temp, power);
    refreshLampPresetsCache();
    return c.json(preset);
  } catch (e: unknown) {
    const err = e as Error;
    return c.json({ error: err.message }, 400);
  }
});

// Update preset
presets.patch('/:id', zValidator('json', LampPresetUpdateSchema), async (c) => {
  const id = c.req.param('id');
  const body = c.req.valid('json');

  const updated = updateLampPreset(id, body.brightness, body.color_temp, body.power ?? true);
  if (!updated) {
    return c.json({ error: 'Preset not found' }, 404);
  }

  refreshLampPresetsCache();
  const presetList = getLampPresets();
  const preset = presetList.find(p => p.id === id);
  return c.json(preset);
});

// Delete preset
presets.delete('/:id', (c) => {
  const id = c.req.param('id');
  const deleted = deleteLampPreset(id);
  if (!deleted) {
    return c.json({ error: 'Preset not found' }, 404);
  }
  refreshLampPresetsCache();
  return c.json({ success: true });
});

// Apply preset to all lamps
presets.post('/:name/apply', async (c) => {
  const presetName = c.req.param('name');

  if (presetName === 'auto') {
    const timeWindow = getCurrentTimeWindow();
    const autoPreset = getPresetForTimeWindow(timeWindow);
    console.log(`Auto preset: ${autoPreset} (time window: ${timeWindow})`);
    const result = await applyPresetToAllLamps(autoPreset);
    broadcastHomeStatus();
    broadcastPendingActions();
    return c.json({ ...result, timeWindow, autoPreset });
  }

  if (!isValidPreset(presetName)) {
    return c.json({ error: `Invalid preset: ${presetName}` }, 400);
  }

  const result = await applyPresetToAllLamps(presetName);
  broadcastHomeStatus();
  broadcastPendingActions();
  return c.json(result);
});

// === SCHEDULES ===

// Get all schedules
presets.get('/schedules/list', (c) => {
  const schedules = getSchedules();
  return c.json(schedules);
});

// Create schedule
presets.post('/schedules', zValidator('json', LampScheduleSchema), async (c) => {
  const body = c.req.valid('json');

  if (!isValidPreset(body.preset)) {
    return c.json({ error: `Invalid preset: ${body.preset}` }, 400);
  }

  try {
    const schedule = createSchedule(body.name, body.preset, body.time);
    broadcastSchedulesChanged();
    return c.json(schedule, 201);
  } catch (e: unknown) {
    const err = e as Error;
    return c.json({ error: err.message }, 400);
  }
});

// Delete schedule
presets.delete('/schedules/:id', (c) => {
  const id = parseInt(c.req.param('id'));
  const deleted = deleteSchedule(id);
  if (deleted) broadcastSchedulesChanged();
  return c.json({ success: deleted });
});

// Toggle schedule
presets.patch('/schedules/:id/toggle', (c) => {
  const id = parseInt(c.req.param('id'));
  const schedule = toggleSchedule(id);
  if (!schedule) {
    return c.json({ error: 'Schedule not found' }, 404);
  }
  broadcastSchedulesChanged();
  return c.json(schedule);
});

// Update schedule
presets.patch('/schedules/:id', zValidator('json', LampScheduleUpdateSchema), async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = c.req.valid('json');

  try {
    const schedule = updateSchedule(id, {
      name: body.name,
      preset: body.preset,
      time: body.time,
    });
    if (!schedule) {
      return c.json({ error: 'Schedule not found' }, 404);
    }
    broadcastSchedulesChanged();
    return c.json(schedule);
  } catch (e: unknown) {
    const err = e as Error;
    return c.json({ error: err.message }, 400);
  }
});

// === PENDING ACTIONS ===

presets.get('/pending-actions', (c) => {
  const pending = getPendingActions();
  return c.json(pending);
});

presets.delete('/pending-actions', (c) => {
  clearAllPending();
  broadcastPendingActions();
  return c.json({ success: true });
});

export default presets;
