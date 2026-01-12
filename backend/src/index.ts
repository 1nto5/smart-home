// Global error handlers to prevent crashes from async errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err.message);
});
process.on('unhandledRejection', (reason: any) => {
  console.error('Unhandled rejection:', reason?.message || reason);
});

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serveStatic, createBunWebSocket } from 'hono/bun';
import { addClient, removeClient } from './ws/broadcast';
import { config } from './config';
import {
  initDatabase,
  getDb,
  getAlarmConfig,
  setAlarmArmed,
  getTelegramConfig,
  updateTelegramConfig,
  getTelegramLog,
  getHomeStatus,
} from './db/database';
import { sendTestTelegram } from './notifications/telegram-service';
import { startTelegramBot } from './telegram/telegram-bot';
import { startAlarmNotificationLoop } from './notifications/alarm-service';
import { sendCommand, getDeviceStatus as getCloudStatus, getDeviceInfo } from './tuya/tuya-api';
import { sendDeviceCommand, getDeviceStatus as getLocalStatus, connectDevice, disconnectAll } from './tuya/tuya-local';
import {
  getSoundbarStatus,
  setSoundbarPower,
  setSoundbarVolume,
  setSoundbarMute,
  setSoundbarInput,
  setSoundbarSoundProgram,
  setSoundbarClearVoice,
  setSoundbarBassExtension,
  setSoundbarSubwooferVolume,
  getSoundbarInfo,
} from './yamaha/yamaha-soundbar';
import {
  getLampStatus,
  setLampPower,
  setLampBrightness,
  setLampColorTemp,
  toggleLamp,
  setLampMoonlight,
  setLampDaylightMode,
} from './xiaomi/xiaomi-lamp';
import {
  getStatus as getRoborockStatus,
  startCleaning,
  pauseCleaning,
  stopCleaning,
  goHome,
  findMe,
  getCleanSummary,
  getRooms,
  getVolume,
  setVolume,
  setFanSpeed,
  setMopMode,
  cleanSegments,
  getConsumables,
  resetConsumable,
} from './roborock/roborock';
import {
  LAMP_PRESETS,
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
  startScheduler,
  startPoller,
  getCurrentTimeWindow,
  getPresetForTimeWindow,
  // Heater scheduling
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
} from './scheduling';

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

// Start alarm notification loop (persistent notifications)
startAlarmNotificationLoop();

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all devices
app.get('/api/devices', async (c) => {
  const db = getDb();
  const refresh = c.req.query('refresh') === 'true';

  if (refresh) {
    // Refresh TRV statuses from local API
    const trvs = db.query("SELECT id, name FROM devices WHERE category = 'wkf'").all() as { id: string; name: string }[];
    for (const trv of trvs) {
      try {
        const status = await getLocalStatus(trv.id);
        if (status && status.dps) {
          db.run(
            'UPDATE devices SET last_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [JSON.stringify(status.dps), trv.id]
          );
        }
      } catch (e: any) {
        console.error(`TRV refresh failed for ${trv.name}:`, e.message);
      }
    }
  }

  const devices = db.query('SELECT * FROM devices ORDER BY room, name').all();
  return c.json(devices);
});

// Get single device
app.get('/api/devices/:id', (c) => {
  const db = getDb();
  const device = db.query('SELECT * FROM devices WHERE id = ?').get(c.req.param('id'));
  if (!device) {
    return c.json({ error: 'Device not found' }, 404);
  }
  return c.json(device);
});

// Update device (room, type, name)
app.patch('/api/devices/:id', async (c) => {
  const db = getDb();
  const id = c.req.param('id');
  const body = await c.req.json();

  const updates: string[] = [];
  const values: any[] = [];

  if (body.name !== undefined) {
    updates.push('name = ?');
    values.push(body.name);
  }
  if (body.room !== undefined) {
    updates.push('room = ?');
    values.push(body.room);
  }
  if (body.type !== undefined) {
    updates.push('type = ?');
    values.push(body.type);
  }

  if (updates.length === 0) {
    return c.json({ error: 'No fields to update' }, 400);
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  db.run(`UPDATE devices SET ${updates.join(', ')} WHERE id = ?`, values);

  const device = db.query('SELECT * FROM devices WHERE id = ?').get(id);
  return c.json(device);
});

// Control device via Local API (DPS-based)
app.post('/api/devices/:id/control', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();

  // Accept either { dps: number, value: any } or { commands: [...] }
  if (body.dps !== undefined && body.value !== undefined) {
    // Direct DPS control (local)
    console.log(`Local control ${id}: dps ${body.dps} = ${body.value}`);
    try {
      const success = await sendDeviceCommand(id, body.dps, body.value);
      if (success) {
        return c.json({ success: true, device_id: id, dps: body.dps, value: body.value, method: 'local' });
      } else {
        return c.json({ success: false, error: 'Local command failed' }, 500);
      }
    } catch (error: any) {
      console.error(`Local control error for ${id}:`, error.message);
      return c.json({ success: false, error: error.message }, 500);
    }
  }

  // Cloud API fallback (code-based commands)
  if (!body.commands || !Array.isArray(body.commands)) {
    return c.json({ error: 'Either {dps, value} or {commands} required' }, 400);
  }

  console.log(`Cloud control ${id}:`, body.commands);
  try {
    const success = await sendCommand(id, body.commands);
    if (success) {
      return c.json({ success: true, device_id: id, commands: body.commands, method: 'cloud' });
    } else {
      return c.json({ success: false, error: 'Cloud command failed' }, 500);
    }
  } catch (error: any) {
    console.error(`Cloud control error for ${id}:`, error.message);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get device status (tries local first, falls back to cloud)
app.get('/api/devices/:id/status', async (c) => {
  const id = c.req.param('id');
  const source = c.req.query('source'); // 'local', 'cloud', or default
  const db = getDb();

  // Try local status first
  if (source !== 'cloud') {
    try {
      const status = await getLocalStatus(id);
      if (status) {
        db.run(
          'UPDATE devices SET last_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [JSON.stringify(status.dps || status), id]
        );
        return c.json({ device_id: id, status: status.dps || status, method: 'local' });
      }
    } catch (error: any) {
      console.log(`Local status failed for ${id}:`, error.message);
    }
  }

  // Fall back to cloud
  if (source !== 'local') {
    try {
      const status = await getCloudStatus(id);
      db.run(
        'INSERT INTO device_history (device_id, status_json) VALUES (?, ?)',
        [id, JSON.stringify(status)]
      );
      db.run(
        'UPDATE devices SET last_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [JSON.stringify(status), id]
      );
      return c.json({ device_id: id, status, method: 'cloud' });
    } catch (error: any) {
      console.error(`Cloud status error for ${id}:`, error.message);
      return c.json({ error: error.message }, 500);
    }
  }

  return c.json({ error: 'Could not get status' }, 500);
});

// Get device info from Cloud API
app.get('/api/devices/:id/info', async (c) => {
  const id = c.req.param('id');

  try {
    const info = await getDeviceInfo(id);
    return c.json(info);
  } catch (error: any) {
    console.error(`Info error for ${id}:`, error.message);
    return c.json({ error: error.message }, 500);
  }
});

// Get device history
app.get('/api/devices/:id/history', (c) => {
  const db = getDb();
  const id = c.req.param('id');
  const limit = parseInt(c.req.query('limit') || '100');

  const history = db.query(`
    SELECT * FROM device_history
    WHERE device_id = ?
    ORDER BY recorded_at DESC
    LIMIT ?
  `).all(id, limit);

  return c.json(history);
});

// Get rooms
app.get('/api/rooms', (c) => {
  const db = getDb();
  const rooms = db.query(`
    SELECT room, COUNT(*) as device_count
    FROM devices
    WHERE room IS NOT NULL
    GROUP BY room
  `).all();
  return c.json(rooms);
});

// === YAMAHA DEVICES ===

// Get all Yamaha devices
app.get('/api/yamaha', (c) => {
  const db = getDb();
  const devices = db.query('SELECT * FROM yamaha_devices ORDER BY room, name').all();
  return c.json(devices);
});

// Get single Yamaha device
app.get('/api/yamaha/:id', (c) => {
  const db = getDb();
  const device = db.query('SELECT * FROM yamaha_devices WHERE id = ?').get(c.req.param('id'));
  if (!device) {
    return c.json({ error: 'Device not found' }, 404);
  }
  return c.json(device);
});

// Get Yamaha device status
app.get('/api/yamaha/:id/status', async (c) => {
  const id = c.req.param('id');
  const status = await getSoundbarStatus(id);
  if (!status) {
    return c.json({ error: 'Failed to get status' }, 500);
  }
  return c.json({ device_id: id, status });
});

// Get Yamaha device info
app.get('/api/yamaha/:id/info', async (c) => {
  const id = c.req.param('id');
  const info = await getSoundbarInfo(id);
  if (!info) {
    return c.json({ error: 'Failed to get info' }, 500);
  }
  return c.json(info);
});

// Control Yamaha device
app.post('/api/yamaha/:id/control', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const results: Record<string, boolean> = {};

  if (body.power !== undefined) {
    results.power = await setSoundbarPower(id, body.power);
  }
  if (body.volume !== undefined) {
    results.volume = await setSoundbarVolume(id, body.volume);
  }
  if (body.mute !== undefined) {
    results.mute = await setSoundbarMute(id, body.mute);
  }
  if (body.input !== undefined) {
    results.input = await setSoundbarInput(id, body.input);
  }
  if (body.sound_program !== undefined) {
    results.sound_program = await setSoundbarSoundProgram(id, body.sound_program);
  }
  if (body.clear_voice !== undefined) {
    results.clear_voice = await setSoundbarClearVoice(id, body.clear_voice);
  }
  if (body.bass_extension !== undefined) {
    results.bass_extension = await setSoundbarBassExtension(id, body.bass_extension);
  }
  if (body.subwoofer_volume !== undefined) {
    results.subwoofer_volume = await setSoundbarSubwooferVolume(id, body.subwoofer_volume);
  }

  const allSuccess = Object.values(results).every((v) => v);
  return c.json({ success: allSuccess, results, device_id: id });
});

// === XIAOMI DEVICES ===

// Get all Xiaomi devices
app.get('/api/xiaomi', (c) => {
  const db = getDb();
  const devices = db.query('SELECT * FROM xiaomi_devices ORDER BY room, name').all();
  return c.json(devices);
});

// Get single Xiaomi device
app.get('/api/xiaomi/:id', (c) => {
  const db = getDb();
  const device = db.query('SELECT * FROM xiaomi_devices WHERE id = ?').get(c.req.param('id'));
  if (!device) {
    return c.json({ error: 'Device not found' }, 404);
  }
  return c.json(device);
});

// Get Xiaomi lamp status
app.get('/api/xiaomi/:id/status', async (c) => {
  const id = c.req.param('id');
  const db = getDb();

  const status = await getLampStatus(id);
  if (!status) {
    return c.json({ error: 'Failed to get status' }, 500);
  }

  // Update last_status in DB
  db.run(
    'UPDATE xiaomi_devices SET last_status = ?, online = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [JSON.stringify(status), id]
  );

  return c.json({ device_id: id, status });
});

// Control Xiaomi lamp
app.post('/api/xiaomi/:id/control', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const results: Record<string, boolean> = {};

  // Moonlight mode takes precedence (ceiling lights only)
  if (body.moonlight !== undefined) {
    if (body.moonlight) {
      results.moonlight = await setLampMoonlight(id, body.moonlight_brightness);
    } else {
      results.moonlight = await setLampDaylightMode(id);
    }
  } else {
    // Standard controls
    if (body.power !== undefined) {
      results.power = await setLampPower(id, body.power);
    }
    if (body.toggle !== undefined && body.toggle) {
      results.toggle = await toggleLamp(id);
    }
  }
  if (body.brightness !== undefined) {
    results.brightness = await setLampBrightness(id, body.brightness);
  }
  if (body.color_temp !== undefined) {
    results.color_temp = await setLampColorTemp(id, body.color_temp);
  }

  const allSuccess = Object.values(results).every((v) => v);
  return c.json({ success: allSuccess, results, device_id: id });
});

// === ROBOROCK ===

// Get Roborock status
app.get('/api/roborock/status', async (c) => {
  const status = await getRoborockStatus();
  if (!status) {
    return c.json({ error: 'Failed to get status (is bridge running?)' }, 500);
  }
  return c.json(status);
});

// Get clean summary
app.get('/api/roborock/summary', async (c) => {
  const summary = await getCleanSummary();
  if (!summary) {
    return c.json({ error: 'Failed to get summary' }, 500);
  }
  return c.json(summary);
});

// Send command to Roborock
app.post('/api/roborock/command', async (c) => {
  const body = await c.req.json();
  const cmd = body.cmd;

  if (!cmd) {
    return c.json({ error: 'cmd required (start, pause, stop, home, find)' }, 400);
  }

  let success = false;
  switch (cmd) {
    case 'start':
      success = await startCleaning();
      break;
    case 'pause':
      success = await pauseCleaning();
      break;
    case 'stop':
      success = await stopCleaning();
      break;
    case 'home':
      success = await goHome();
      break;
    case 'find':
      success = await findMe();
      break;
    default:
      return c.json({ error: `Unknown command: ${cmd}` }, 400);
  }

  return c.json({ success, command: cmd });
});

// Get rooms
app.get('/api/roborock/rooms', async (c) => {
  const rooms = await getRooms();
  if (!rooms) {
    return c.json({ error: 'Failed to get rooms' }, 500);
  }
  return c.json(rooms);
});

// Get volume
app.get('/api/roborock/volume', async (c) => {
  const vol = await getVolume();
  if (!vol) {
    return c.json({ error: 'Failed to get volume' }, 500);
  }
  return c.json(vol);
});

// Set volume
app.post('/api/roborock/volume', async (c) => {
  const { volume } = await c.req.json();
  if (typeof volume !== 'number' || volume < 0 || volume > 100) {
    return c.json({ error: 'volume must be 0-100' }, 400);
  }
  const success = await setVolume(volume);
  return c.json({ success, volume });
});

// Set fan speed
app.post('/api/roborock/fan-speed', async (c) => {
  const { mode } = await c.req.json();
  if (typeof mode !== 'number' || mode < 101 || mode > 104) {
    return c.json({ error: 'mode must be 101-104' }, 400);
  }
  const success = await setFanSpeed(mode);
  return c.json({ success, mode });
});

// Set mop intensity
app.post('/api/roborock/mop-mode', async (c) => {
  const { mode } = await c.req.json();
  if (typeof mode !== 'number' || mode < 200 || mode > 203) {
    return c.json({ error: 'mode must be 200-203' }, 400);
  }
  const success = await setMopMode(mode);
  return c.json({ success, mode });
});

// Clean specific rooms
app.post('/api/roborock/clean-segments', async (c) => {
  const { segments } = await c.req.json();
  if (!Array.isArray(segments) || segments.length === 0) {
    return c.json({ error: 'segments array required' }, 400);
  }
  const success = await cleanSegments(segments);
  return c.json({ success, segments });
});

// Get consumables
app.get('/api/roborock/consumables', async (c) => {
  const consumables = await getConsumables();
  if (!consumables) {
    return c.json({ error: 'Failed to get consumables' }, 500);
  }
  return c.json(consumables);
});

// Reset consumable
app.post('/api/roborock/reset-consumable', async (c) => {
  const body = await c.req.json<{ consumable: string }>();
  const success = await resetConsumable(body.consumable);
  if (!success) {
    return c.json({ error: 'Failed to reset consumable' }, 500);
  }
  return c.json({ success: true });
});

// === SCHEDULING ===

// Get available presets (DB-backed)
app.get('/api/presets', (c) => {
  const presets = getLampPresets();
  // Transform to legacy format for compatibility
  const result: Record<string, { name: string; brightness: number; colorTemp: number; power: boolean }> = {};
  for (const p of presets) {
    result[p.id] = {
      name: p.name,
      brightness: p.brightness,
      colorTemp: p.color_temp,
      power: p.power,
    };
  }
  return c.json(result);
});

// Create lamp preset
app.post('/api/presets', async (c) => {
  const body = await c.req.json();
  const { id, name, brightness, color_temp, power } = body;

  if (!id || !name || brightness === undefined || color_temp === undefined) {
    return c.json({ error: 'id, name, brightness, and color_temp are required' }, 400);
  }

  try {
    const preset = createLampPreset(id, name, brightness, color_temp, power ?? true);
    refreshLampPresetsCache();
    return c.json(preset);
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

// Update lamp preset
app.patch('/api/presets/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();

  if (body.brightness === undefined || body.color_temp === undefined) {
    return c.json({ error: 'brightness and color_temp required' }, 400);
  }

  const updated = updateLampPreset(id, body.brightness, body.color_temp, body.power ?? true);
  if (!updated) {
    return c.json({ error: 'Preset not found' }, 404);
  }

  refreshLampPresetsCache();
  const presets = getLampPresets();
  const preset = presets.find(p => p.id === id);
  return c.json(preset);
});

// Delete lamp preset
app.delete('/api/presets/:id', (c) => {
  const id = c.req.param('id');
  const deleted = deleteLampPreset(id);
  if (!deleted) {
    return c.json({ error: 'Preset not found' }, 404);
  }
  refreshLampPresetsCache();
  return c.json({ success: true });
});

// Apply preset to all lamps now
app.post('/api/presets/:name/apply', async (c) => {
  const presetName = c.req.param('name');

  // Handle "auto" - apply preset based on current time window
  if (presetName === 'auto') {
    const timeWindow = getCurrentTimeWindow();
    const autoPreset = getPresetForTimeWindow(timeWindow);
    console.log(`Auto preset: ${autoPreset} (time window: ${timeWindow})`);
    const result = await applyPresetToAllLamps(autoPreset);
    return c.json({ ...result, timeWindow, autoPreset });
  }

  if (!isValidPreset(presetName)) {
    return c.json({ error: `Invalid preset: ${presetName}` }, 400);
  }

  const result = await applyPresetToAllLamps(presetName);
  return c.json(result);
});

// Get all schedules
app.get('/api/schedules', (c) => {
  const schedules = getSchedules();
  return c.json(schedules);
});

// Create schedule
app.post('/api/schedules', async (c) => {
  const body = await c.req.json();

  if (!body.name || !body.preset || !body.time) {
    return c.json({ error: 'name, preset, and time required' }, 400);
  }

  if (!isValidPreset(body.preset)) {
    return c.json({ error: `Invalid preset: ${body.preset}` }, 400);
  }

  try {
    const schedule = createSchedule(body.name, body.preset, body.time);
    return c.json(schedule, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
});

// Delete schedule
app.delete('/api/schedules/:id', (c) => {
  const id = parseInt(c.req.param('id'));
  const deleted = deleteSchedule(id);
  return c.json({ success: deleted });
});

// Toggle schedule enabled
app.patch('/api/schedules/:id/toggle', (c) => {
  const id = parseInt(c.req.param('id'));
  const schedule = toggleSchedule(id);
  if (!schedule) {
    return c.json({ error: 'Schedule not found' }, 404);
  }
  return c.json(schedule);
});

// Update schedule
app.patch('/api/schedules/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();

  try {
    const schedule = updateSchedule(id, {
      name: body.name,
      preset: body.preset,
      time: body.time,
    });
    if (!schedule) {
      return c.json({ error: 'Schedule not found' }, 404);
    }
    return c.json(schedule);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
});

// Get pending actions
app.get('/api/pending-actions', (c) => {
  const pending = getPendingActions();
  return c.json(pending);
});

// Clear all pending actions
app.delete('/api/pending-actions', (c) => {
  clearAllPending();
  return c.json({ success: true });
});

// === HEATER SCHEDULING ===

// Get heater presets
app.get('/api/heater-presets', (c) => {
  const presets = getHeaterPresets();
  return c.json(presets);
});

// Create heater preset
app.post('/api/heater-presets', async (c) => {
  const body = await c.req.json();
  const { id, name, target_temp } = body;

  if (!id || !name || target_temp === undefined) {
    return c.json({ error: 'id, name, and target_temp are required' }, 400);
  }

  try {
    const preset = createHeaterPreset(id, name, target_temp);
    return c.json(preset);
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

// Delete heater preset
app.delete('/api/heater-presets/:id', (c) => {
  const id = c.req.param('id');
  const deleted = deleteHeaterPreset(id);
  if (!deleted) {
    return c.json({ error: 'Preset not found' }, 404);
  }
  return c.json({ success: true });
});

// Update heater preset temperature
app.patch('/api/heater-presets/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();

  if (body.target_temp === undefined) {
    return c.json({ error: 'target_temp required' }, 400);
  }

  if (typeof body.target_temp !== 'number' || body.target_temp < 5 || body.target_temp > 30) {
    return c.json({ error: 'target_temp must be 5-30' }, 400);
  }

  const updated = updateHeaterPreset(id, body.target_temp);
  if (!updated) {
    return c.json({ error: 'Preset not found' }, 404);
  }

  const presets = getHeaterPresets();
  const preset = presets.find(p => p.id === id);
  return c.json(preset);
});

// Apply heater preset to all TRVs
app.post('/api/heater-presets/:id/apply', async (c) => {
  const presetId = c.req.param('id');

  if (!isValidHeaterPreset(presetId)) {
    return c.json({ error: `Invalid preset: ${presetId}` }, 400);
  }

  const result = await applyPresetToAllHeaters(presetId);
  return c.json(result);
});

// Get per-device temps for a preset
app.get('/api/heater-presets/:id/devices', (c) => {
  const presetId = c.req.param('id');
  if (!isValidHeaterPreset(presetId)) {
    return c.json({ error: `Invalid preset: ${presetId}` }, 400);
  }
  const deviceTemps = getPresetDeviceTemps(presetId);
  return c.json(deviceTemps);
});

// Set per-device temp for a preset
app.put('/api/heater-presets/:presetId/devices/:deviceId', async (c) => {
  const presetId = c.req.param('presetId');
  const deviceId = c.req.param('deviceId');
  const body = await c.req.json();

  if (!isValidHeaterPreset(presetId)) {
    return c.json({ error: `Invalid preset: ${presetId}` }, 400);
  }

  if (body.target_temp === undefined) {
    return c.json({ error: 'target_temp required' }, 400);
  }

  try {
    const result = setPresetDeviceTemp(presetId, deviceId, body.target_temp);
    return c.json(result);
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

// Delete per-device temp (revert to preset default)
app.delete('/api/heater-presets/:presetId/devices/:deviceId', (c) => {
  const presetId = c.req.param('presetId');
  const deviceId = c.req.param('deviceId');

  const deleted = deletePresetDeviceTemp(presetId, deviceId);
  return c.json({ success: deleted });
});

// Get all heater schedules
app.get('/api/heater-schedules', (c) => {
  const schedules = getHeaterSchedules();
  return c.json(schedules);
});

// Create heater schedule
app.post('/api/heater-schedules', async (c) => {
  const body = await c.req.json();

  if (!body.name || !body.preset_id || !body.time) {
    return c.json({ error: 'name, preset_id, and time required' }, 400);
  }

  if (!isValidHeaterPreset(body.preset_id)) {
    return c.json({ error: `Invalid preset: ${body.preset_id}` }, 400);
  }

  try {
    const schedule = createHeaterSchedule(body.name, body.preset_id, body.time);
    return c.json(schedule, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
});

// Delete heater schedule
app.delete('/api/heater-schedules/:id', (c) => {
  const id = parseInt(c.req.param('id'));
  const deleted = deleteHeaterSchedule(id);
  return c.json({ success: deleted });
});

// Toggle heater schedule enabled
app.patch('/api/heater-schedules/:id/toggle', (c) => {
  const id = parseInt(c.req.param('id'));
  const schedule = toggleHeaterSchedule(id);
  if (!schedule) {
    return c.json({ error: 'Schedule not found' }, 404);
  }
  return c.json(schedule);
});

// Update heater schedule
app.patch('/api/heater-schedules/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();

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
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
});

// Get pending heater actions
app.get('/api/pending-heater-actions', (c) => {
  const pending = getPendingHeaterActions();
  return c.json(pending);
});

// Clear all pending heater actions
app.delete('/api/pending-heater-actions', (c) => {
  clearAllPendingHeater();
  return c.json({ success: true });
});

// Get heater override status
app.get('/api/heater-override', (c) => {
  const override = getHeaterOverride();
  return c.json(override);
});

// Set heater override
app.post('/api/heater-override', async (c) => {
  const body = await c.req.json();
  const { enabled, mode, fixed_temp } = body;

  if (typeof enabled !== 'boolean') {
    return c.json({ error: 'enabled must be boolean' }, 400);
  }
  if (mode && mode !== 'pause' && mode !== 'fixed') {
    return c.json({ error: 'mode must be "pause" or "fixed"' }, 400);
  }

  const override = setHeaterOverride(enabled, mode || 'pause', fixed_temp || 18);

  // If enabling fixed mode, apply fixed temp to all heaters immediately
  if (enabled && mode === 'fixed' && fixed_temp) {
    console.log(`Override enabled: applying fixed temp ${fixed_temp}°C to all heaters`);
    applyFixedTempToAllHeaters(fixed_temp);
  }

  return c.json(override);
});

// === AIR PURIFIER ===
import {
  getPurifierStatus,
  setPurifierPower,
  setPurifierMode,
  setPurifierFanSpeed,
} from './xiaomi/air-purifier';

// Get air purifier status
app.get('/api/purifier/status', async (c) => {
  const status = await getPurifierStatus();
  if (!status) {
    return c.json({ error: 'Failed to get status' }, 500);
  }
  return c.json(status);
});

// Control air purifier
app.post('/api/purifier/control', async (c) => {
  const body = await c.req.json();
  const results: Record<string, boolean> = {};

  if (body.power !== undefined) {
    results.power = await setPurifierPower(body.power);
  }
  if (body.mode !== undefined) {
    results.mode = await setPurifierMode(body.mode);
  }
  if (body.fan_speed !== undefined) {
    results.fan_speed = await setPurifierFanSpeed(body.fan_speed);
  }

  const allSuccess = Object.values(results).every((v) => v);
  return c.json({ success: allSuccess, results });
});

// === SENSOR HISTORY ===

// Get sensor history (temperature/humidity readings)
app.get('/api/sensors/history', (c) => {
  const db = getDb();
  const deviceId = c.req.query('device_id');
  const from = c.req.query('from');
  const to = c.req.query('to');
  const limit = parseInt(c.req.query('limit') || '100');

  let query = 'SELECT * FROM sensor_history WHERE 1=1';
  const params: any[] = [];

  if (deviceId) {
    query += ' AND device_id = ?';
    params.push(deviceId);
  }
  if (from) {
    query += ' AND recorded_at >= ?';
    params.push(from);
  }
  if (to) {
    query += ' AND recorded_at <= ?';
    params.push(to);
  }

  query += ' ORDER BY recorded_at DESC LIMIT ?';
  params.push(limit);

  const history = db.query(query).all(...params);
  return c.json(history);
});

// Get averaged sensor readings (for charts)
app.get('/api/sensors/history/averaged', (c) => {
  const db = getDb();
  const deviceId = c.req.query('device_id');
  const interval = c.req.query('interval') || 'hour'; // 'hour' or 'day'
  const from = c.req.query('from');
  const to = c.req.query('to');

  // SQLite date formatting for grouping
  const dateFormat = interval === 'day' ? '%Y-%m-%d' : '%Y-%m-%d %H:00';

  let query = `
    SELECT
      device_id,
      device_name,
      strftime('${dateFormat}', recorded_at) as period,
      AVG(temperature) as avg_temperature,
      AVG(humidity) as avg_humidity,
      AVG(target_temp) as avg_target_temp,
      MIN(temperature) as min_temperature,
      MAX(temperature) as max_temperature,
      COUNT(*) as reading_count
    FROM sensor_history
    WHERE 1=1
  `;
  const params: any[] = [];

  if (deviceId) {
    query += ' AND device_id = ?';
    params.push(deviceId);
  }
  if (from) {
    query += ' AND recorded_at >= ?';
    params.push(from);
  }
  if (to) {
    query += ' AND recorded_at <= ?';
    params.push(to);
  }

  query += ` GROUP BY device_id, period ORDER BY period DESC`;

  const history = db.query(query).all(...params);
  return c.json(history);
});

// Get contact history (door/window/water sensor state changes)
app.get('/api/contacts/history', (c) => {
  const db = getDb();
  const deviceId = c.req.query('device_id');
  const from = c.req.query('from');
  const to = c.req.query('to');
  const limit = parseInt(c.req.query('limit') || '100');

  let query = 'SELECT * FROM contact_history WHERE 1=1';
  const params: any[] = [];

  if (deviceId) {
    query += ' AND device_id = ?';
    params.push(deviceId);
  }
  if (from) {
    query += ' AND recorded_at >= ?';
    params.push(from);
  }
  if (to) {
    query += ' AND recorded_at <= ?';
    params.push(to);
  }

  query += ' ORDER BY recorded_at DESC LIMIT ?';
  params.push(limit);

  const history = db.query(query).all(...params);
  return c.json(history);
});

// Get all sensors with latest readings
app.get('/api/sensors', (c) => {
  const db = getDb();
  const sensors = db.query(`
    SELECT d.id, d.name, d.category, d.room, d.last_status,
      (SELECT temperature FROM sensor_history WHERE device_id = d.id ORDER BY recorded_at DESC LIMIT 1) as latest_temp,
      (SELECT humidity FROM sensor_history WHERE device_id = d.id ORDER BY recorded_at DESC LIMIT 1) as latest_humidity,
      (SELECT recorded_at FROM sensor_history WHERE device_id = d.id ORDER BY recorded_at DESC LIMIT 1) as latest_reading_at
    FROM devices d
    WHERE d.category IN ('wsdcg', 'wkf', 'sj', 'mcs')
    ORDER BY d.room, d.name
  `).all();
  return c.json(sensors);
});

// === HOME STATUS ===

// Get home status (weather, presets, heater avg temp)
app.get('/api/home-status', (c) => {
  const db = getDb();
  const status = getHomeStatus();

  // Get weather station data (category wsdcg)
  const weatherSensor = db.query(`
    SELECT last_status FROM devices WHERE category = 'wsdcg' LIMIT 1
  `).get() as { last_status: string | null } | null;

  let weather = null;
  if (weatherSensor?.last_status) {
    try {
      const parsed = JSON.parse(weatherSensor.last_status);
      weather = {
        temperature: parsed['103'] !== undefined ? parsed['103'] / 100 : null,
        humidity: parsed['101'] !== undefined ? parsed['101'] / 100 : null,
        battery: parsed['102'] ?? null,
      };
    } catch {}
  }

  // Get heater override status
  const override = getHeaterOverride();

  // Get average heater temperature from TRVs (category wkf)
  const heaters = db.query(`
    SELECT last_status FROM devices WHERE category = 'wkf' AND online = 1
  `).all() as { last_status: string | null }[];

  let heaterAvgTemp = null;
  const temps: number[] = [];
  for (const h of heaters) {
    if (h.last_status) {
      try {
        const parsed = JSON.parse(h.last_status);
        // current_temp is DPS 5, scaled by 10
        if (parsed['5'] !== undefined) {
          temps.push(parsed['5'] / 10);
        }
      } catch {}
    }
  }
  if (temps.length > 0) {
    heaterAvgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
  }

  // Get preset names
  const lampPreset = status.lamp_preset ? getLampPresets().find(p => p.id === status.lamp_preset) : null;
  const heaterPreset = status.heater_preset ? getHeaterPresets().find(p => p.id === status.heater_preset) : null;

  return c.json({
    weather,
    lamp: {
      preset_id: status.lamp_preset,
      preset_name: lampPreset?.name ?? null,
    },
    heater: {
      preset_id: status.heater_preset,
      preset_name: heaterPreset?.name ?? null,
      avg_temp: heaterAvgTemp !== null ? Math.round(heaterAvgTemp * 10) / 10 : null,
      override: override.enabled ? override : null,
    },
  });
});

// === ALARM SYSTEM ===

// Get alarm status
app.get('/api/alarm', (c) => {
  const alarm = getAlarmConfig();
  return c.json(alarm);
});

// Arm alarm
app.post('/api/alarm/arm', (c) => {
  const alarm = setAlarmArmed(true);
  console.log('Alarm ARMED');
  return c.json(alarm);
});

// Disarm alarm
app.post('/api/alarm/disarm', (c) => {
  const alarm = setAlarmArmed(false);
  console.log('Alarm DISARMED');
  return c.json(alarm);
});

// === TELEGRAM NOTIFICATIONS ===

// Get Telegram config
app.get('/api/telegram/config', (c) => {
  const config = getTelegramConfig();
  // Hide bot token in response
  return c.json({
    ...config,
    bot_token: config.bot_token ? '********' : null,
  });
});

// Update Telegram config
app.patch('/api/telegram/config', async (c) => {
  const body = await c.req.json();
  const config = updateTelegramConfig(body);
  return c.json({
    ...config,
    bot_token: config.bot_token ? '********' : null,
  });
});

// Get Telegram log
app.get('/api/telegram/log', (c) => {
  const limit = parseInt(c.req.query('limit') || '50');
  const log = getTelegramLog(limit);
  return c.json(log);
});

// Send test Telegram
app.post('/api/telegram/test', async (c) => {
  const result = await sendTestTelegram();
  if (result.success) {
    return c.json({ success: true, message: 'Test message sent to Telegram' });
  } else {
    return c.json({ success: false, error: result.error }, 500);
  }
});

// WebSocket for real-time status updates
const { upgradeWebSocket, websocket } = createBunWebSocket();

app.get('/ws', upgradeWebSocket(() => ({
  onOpen(_event, ws) {
    addClient(ws.raw as any);
  },
  onClose(_event, ws) {
    removeClient(ws.raw as any);
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
