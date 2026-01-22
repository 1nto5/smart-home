import { Hono } from 'hono';
import { getDb } from '../db/database';
import {
  getLampStatus,
  setLampPower,
  setLampBrightness,
  setLampColorTemp,
  toggleLamp,
  setLampMoonlight,
  setLampDaylightMode,
} from '../xiaomi/xiaomi-lamp';

const xiaomi = new Hono();

// Get all Xiaomi devices
xiaomi.get('/', (c) => {
  const db = getDb();
  const devices = db.query('SELECT * FROM xiaomi_devices ORDER BY room, name').all();
  return c.json(devices);
});

// Get single Xiaomi device
xiaomi.get('/:id', (c) => {
  const db = getDb();
  const device = db.query('SELECT * FROM xiaomi_devices WHERE id = ?').get(c.req.param('id'));
  if (!device) {
    return c.json({ error: 'Device not found' }, 404);
  }
  return c.json(device);
});

// Get Xiaomi lamp status
xiaomi.get('/:id/status', async (c) => {
  const id = c.req.param('id');
  const db = getDb();

  const status = await getLampStatus(id);
  if (!status) {
    return c.json({ error: 'Failed to get status' }, 500);
  }

  db.run(
    'UPDATE xiaomi_devices SET last_status = ?, online = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [JSON.stringify(status), id]
  );

  return c.json({ device_id: id, status });
});

// Control Xiaomi lamp
xiaomi.post('/:id/control', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const results: Record<string, boolean> = {};

  if (body.moonlight !== undefined) {
    if (body.moonlight) {
      results.moonlight = await setLampMoonlight(id, body.moonlight_brightness);
    } else {
      results.moonlight = await setLampDaylightMode(id);
    }
  } else {
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

export default xiaomi;
