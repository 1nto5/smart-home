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
  invalidateConnection,
} from '../xiaomi/xiaomi-lamp';
import { discoverXiaomiDevices } from '../xiaomi/xiaomi-discover';

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

// Discover new IP for a device (or all devices if no id)
xiaomi.post('/discover', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const targetId = body.device_id;
  const db = getDb();

  // Run discovery for 15 seconds
  const discovered = await discoverXiaomiDevices(15000);

  if (discovered.length === 0) {
    return c.json({ success: false, message: 'No devices found on network' });
  }

  const updates: Array<{ id: string; name: string; old_ip: string; new_ip: string }> = [];

  for (const device of discovered) {
    // If targeting specific device, skip others
    if (targetId && device.id !== targetId) continue;

    const existing = db.query('SELECT id, name, ip FROM xiaomi_devices WHERE id = ?').get(device.id) as {
      id: string;
      name: string;
      ip: string;
    } | null;

    if (existing && existing.ip !== device.address) {
      db.run('UPDATE xiaomi_devices SET ip = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [
        device.address,
        device.id,
      ]);
      invalidateConnection(device.id);
      updates.push({
        id: device.id,
        name: existing.name,
        old_ip: existing.ip,
        new_ip: device.address,
      });
    }
  }

  return c.json({
    success: true,
    discovered: discovered.length,
    updates,
    message: updates.length > 0 ? `Updated ${updates.length} device(s)` : 'No IP changes detected',
  });
});

export default xiaomi;
