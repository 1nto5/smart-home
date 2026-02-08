import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { getDb } from '../db/database';
import { sendCommand, getDeviceStatus as getCloudStatus, getDeviceInfo } from '../tuya/tuya-api';
import { sendDeviceCommand, getDeviceStatus as getLocalStatus } from '../tuya/tuya-local';
import { translateName } from '../utils/translations';
import { DeviceUpdateSchema, DeviceControlSchema } from '../validation/schemas';
import { broadcastTuyaStatus } from '../ws/device-broadcast';

const devices = new Hono();

// Get all devices (always returns cached DB data)
devices.get('/', (c) => {
  const db = getDb();
  const deviceList = db.query('SELECT * FROM devices ORDER BY room, name').all() as Record<string, unknown>[];
  const translated = deviceList.map(d => ({ ...d, name: translateName(d.name as string) }));
  return c.json(translated);
});

// Update device metadata
devices.patch('/:id', zValidator('json', DeviceUpdateSchema), async (c) => {
  const db = getDb();
  const id = c.req.param('id');
  const body = c.req.valid('json');

  const updates: string[] = [];
  const values: (string | number | boolean | null)[] = [];

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
devices.post('/:id/control', zValidator('json', DeviceControlSchema), async (c) => {
  const id = c.req.param('id');
  const body = c.req.valid('json');

  // Helper: after successful command, fetch updated status and broadcast
  const refreshAndBroadcast = async () => {
    try {
      const updated = await getLocalStatus(id);
      if (updated?.dps) {
        const db = getDb();
        const device = db.query('SELECT category FROM devices WHERE id = ?').get(id) as { category: string } | null;
        db.run('UPDATE devices SET last_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [JSON.stringify(updated.dps), id]);
        if (device) broadcastTuyaStatus(id, device.category, updated.dps);
      }
    } catch { /* best-effort */ }
  };

  if ('dps' in body) {
    console.log(`Local control ${id}: dps ${body.dps} = ${body.value}`);
    try {
      const success = await sendDeviceCommand(id, body.dps, body.value);
      if (success) {
        refreshAndBroadcast();
        return c.json({ success: true, device_id: id, dps: body.dps, value: body.value, method: 'local' });
      } else {
        return c.json({ success: false, error: 'Local command failed' }, 500);
      }
    } catch (e: unknown) {
      const err = e as Error;
      console.error(`Local control error for ${id}:`, err.message);
      return c.json({ success: false, error: err.message }, 500);
    }
  }

  // Cloud command control
  console.log(`Cloud control ${id}:`, body.commands);
  try {
    const success = await sendCommand(id, body.commands);
    if (success) {
      refreshAndBroadcast();
      return c.json({ success: true, device_id: id, commands: body.commands, method: 'cloud' });
    } else {
      return c.json({ success: false, error: 'Cloud command failed' }, 500);
    }
  } catch (e: unknown) {
    const err = e as Error;
    console.error(`Cloud control error for ${id}:`, err.message);
    return c.json({ success: false, error: err.message }, 500);
  }
});

// Get device status (returns cached DB data)
devices.get('/:id/status', (c) => {
  const id = c.req.param('id');
  const db = getDb();

  const device = db.query('SELECT last_status FROM devices WHERE id = ?').get(id) as { last_status: string | null } | null;
  if (!device) {
    return c.json({ error: 'Device not found' }, 404);
  }

  let status: Record<string, unknown> | null = null;
  if (device.last_status) {
    try {
      status = JSON.parse(device.last_status);
    } catch {
      // Ignore parse errors
    }
  }

  return c.json({ device_id: id, status, method: 'cache' });
});

// Get device info
devices.get('/:id/info', async (c) => {
  const id = c.req.param('id');
  try {
    const info = await getDeviceInfo(id);
    return c.json(info);
  } catch (e: unknown) {
    const err = e as Error;
    console.error(`Info error for ${id}:`, err.message);
    return c.json({ error: err.message }, 500);
  }
});

// Get device history
devices.get('/:id/history', (c) => {
  const db = getDb();
  const id = c.req.param('id');
  const limit = Math.min(parseInt(c.req.query('limit') || '100'), 1000);

  const history = db.query(`
    SELECT * FROM device_history
    WHERE device_id = ?
    ORDER BY recorded_at DESC
    LIMIT ?
  `).all(id, limit);

  return c.json(history);
});

// Get rooms
devices.get('/rooms/list', (c) => {
  const db = getDb();
  const rooms = db.query(`
    SELECT room, COUNT(*) as device_count
    FROM devices
    WHERE room IS NOT NULL
    GROUP BY room
  `).all();
  return c.json(rooms);
});

export default devices;
