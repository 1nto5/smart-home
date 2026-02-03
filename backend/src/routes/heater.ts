import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import {
  HeaterPresetSchema,
  HeaterPresetUpdateSchema,
  HeaterPresetDeviceTempSchema,
  HeaterScheduleSchema,
  HeaterScheduleUpdateSchema,
  HeaterOverrideSchema,
} from '../validation/schemas';
import {
  getHeaterPresets,
  updateHeaterPreset,
  isValidHeaterPreset,
  createHeaterPreset,
  deleteHeaterPreset,
  getPresetDeviceTemps,
  setPresetDeviceTemp,
  deletePresetDeviceTemp,
  getHeaterSchedules,
  createHeaterSchedule,
  updateHeaterSchedule,
  deleteHeaterSchedule,
  toggleHeaterSchedule,
  applyPresetToAllHeaters,
  applyFixedTempToAllHeaters,
  getPendingHeaterActions,
  clearAllPendingHeater,
  getHeaterOverride,
  setHeaterOverride,
} from '../scheduling';

const heater = new Hono();

// === HEATER PRESETS ===

heater.get('/presets', (c) => {
  const presets = getHeaterPresets();
  return c.json(presets);
});

heater.post('/presets', zValidator('json', HeaterPresetSchema), async (c) => {
  const { id, name, target_temp } = c.req.valid('json');

  try {
    const preset = createHeaterPreset(id, name, target_temp);
    return c.json(preset);
  } catch (e: unknown) {
    const err = e as Error;
    return c.json({ error: err.message }, 400);
  }
});

heater.delete('/presets/:id', (c) => {
  const id = c.req.param('id');
  const deleted = deleteHeaterPreset(id);
  if (!deleted) {
    return c.json({ error: 'Preset not found' }, 404);
  }
  return c.json({ success: true });
});

heater.patch('/presets/:id', zValidator('json', HeaterPresetUpdateSchema), async (c) => {
  const id = c.req.param('id');
  const body = c.req.valid('json');

  const updated = updateHeaterPreset(id, body.target_temp, body.name);
  if (!updated) {
    return c.json({ error: 'Preset not found' }, 404);
  }

  const presets = getHeaterPresets();
  const preset = presets.find(p => p.id === id);
  return c.json(preset);
});

heater.post('/presets/:id/apply', async (c) => {
  const presetId = c.req.param('id');

  if (!isValidHeaterPreset(presetId)) {
    return c.json({ error: `Invalid preset: ${presetId}` }, 400);
  }

  try {
    const result = await applyPresetToAllHeaters(presetId);
    return c.json(result);
  } catch (error: any) {
    console.error(`Error applying preset ${presetId}:`, error);
    return c.json({ success: [], pending: [], failed: [], error: error.message }, 500);
  }
});

// === PRESET DEVICE TEMPS ===

heater.get('/presets/:id/devices', (c) => {
  const id = c.req.param('id');
  const temps = getPresetDeviceTemps(id);
  return c.json(temps);
});

heater.post('/presets/:id/devices', zValidator('json', HeaterPresetDeviceTempSchema), async (c) => {
  const presetId = c.req.param('id');
  const { device_id, target_temp } = c.req.valid('json');

  setPresetDeviceTemp(presetId, device_id, target_temp);
  return c.json({ success: true, preset_id: presetId, device_id, target_temp });
});

heater.delete('/presets/:id/devices/:deviceId', (c) => {
  const presetId = c.req.param('id');
  const deviceId = c.req.param('deviceId');
  const deleted = deletePresetDeviceTemp(presetId, deviceId);
  return c.json({ success: deleted });
});

// === HEATER SCHEDULES ===

heater.get('/schedules', (c) => {
  const schedules = getHeaterSchedules();
  return c.json(schedules);
});

heater.post('/schedules', zValidator('json', HeaterScheduleSchema), async (c) => {
  const body = c.req.valid('json');

  if (!isValidHeaterPreset(body.preset_id)) {
    return c.json({ error: `Invalid preset: ${body.preset_id}` }, 400);
  }

  try {
    const schedule = createHeaterSchedule(body.name, body.preset_id, body.time);
    return c.json(schedule, 201);
  } catch (e: unknown) {
    const err = e as Error;
    return c.json({ error: err.message }, 400);
  }
});

heater.patch('/schedules/:id/toggle', (c) => {
  const id = parseInt(c.req.param('id'));
  const schedule = toggleHeaterSchedule(id);
  if (!schedule) {
    return c.json({ error: 'Schedule not found' }, 404);
  }
  return c.json(schedule);
});

heater.patch('/schedules/:id', zValidator('json', HeaterScheduleUpdateSchema), async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = c.req.valid('json');

  try {
    const schedule = updateHeaterSchedule(id, {
      name: body.name,
      preset_id: body.preset_id,
      time: body.time,
    });
    if (!schedule) {
      return c.json({ error: 'Schedule not found' }, 404);
    }
    return c.json(schedule);
  } catch (e: unknown) {
    const err = e as Error;
    return c.json({ error: err.message }, 400);
  }
});

heater.delete('/schedules/:id', (c) => {
  const id = parseInt(c.req.param('id'));
  const deleted = deleteHeaterSchedule(id);
  return c.json({ success: deleted });
});

// === PENDING ACTIONS ===

heater.get('/pending-actions', (c) => {
  const pending = getPendingHeaterActions();
  return c.json(pending);
});

heater.delete('/pending-actions', (c) => {
  clearAllPendingHeater();
  return c.json({ success: true });
});

// === OVERRIDE ===

heater.get('/override', (c) => {
  const override = getHeaterOverride();
  return c.json(override);
});

heater.post('/override', zValidator('json', HeaterOverrideSchema), async (c) => {
  const { enabled, mode, fixed_temp } = c.req.valid('json');

  const override = setHeaterOverride(enabled, mode || 'pause', fixed_temp || 18);

  if (enabled && mode === 'fixed' && fixed_temp) {
    console.log(`Override enabled: applying fixed temp ${fixed_temp}°C to all heaters`);
    applyFixedTempToAllHeaters(fixed_temp);
  }

  return c.json(override);
});

export default heater;
