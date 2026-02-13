import { Hono } from 'hono';
import { getDb } from '../db/database';
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
} from '../yamaha/yamaha-soundbar';

const yamaha = new Hono();

// Get all Yamaha devices
yamaha.get('/', (c) => {
  const db = getDb();
  const devices = db.query('SELECT * FROM yamaha_devices ORDER BY room, name').all();
  return c.json(devices);
});

// Get single Yamaha device
yamaha.get('/:id', (c) => {
  const db = getDb();
  const device = db.query('SELECT * FROM yamaha_devices WHERE id = ?').get(c.req.param('id'));
  if (!device) {
    return c.json({ error: 'Device not found' }, 404);
  }
  return c.json(device);
});

// Get Yamaha device status
yamaha.get('/:id/status', async (c) => {
  const id = c.req.param('id');
  const status = await getSoundbarStatus(id);
  if (!status) {
    return c.json({ error: 'Failed to get status' }, 500);
  }
  return c.json({ device_id: id, status });
});

// Get Yamaha device info
yamaha.get('/:id/info', async (c) => {
  const id = c.req.param('id');
  const info = await getSoundbarInfo(id);
  if (!info) {
    return c.json({ error: 'Failed to get info' }, 500);
  }
  return c.json(info);
});

// Control Yamaha device
yamaha.post('/:id/control', async (c) => {
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

  // Refresh status so WS broadcast reflects the new state
  if (allSuccess) {
    getSoundbarStatus(id).catch(() => {});
  }

  return c.json({ success: allSuccess, results, device_id: id });
});

export default yamaha;
