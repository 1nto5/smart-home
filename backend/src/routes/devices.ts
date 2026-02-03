import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { getDb } from '../db/database';
import { sendCommand, getDeviceStatus as getCloudStatus, getDeviceInfo } from '../tuya/tuya-api';
import { sendDeviceCommand, getDeviceStatus as getLocalStatus } from '../tuya/tuya-local';
import { translateName } from '../utils/translations';
import { DeviceUpdateSchema, DeviceControlSchema } from '../validation/schemas';
import { getErrorMessage } from '../utils/errors';

const devices = new Hono();

// Get all devices
devices.get('/', async (c) => {
  const db = getDb();
  const refresh = c.req.query('refresh') === 'true';

  if (refresh) {
    const trvs = db.query("SELECT id, name FROM devices WHERE category = 'wkf'").all() as { id: string; name: string }[];
    // Fetch all TRV statuses in parallel to avoid N+1 query pattern
    await Promise.all(trvs.map(async (trv) => {
      try {
        const status = await getLocalStatus(trv.id);
        if (status && status.dps) {
          db.run(
            'UPDATE devices SET last_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [JSON.stringify(status.dps), trv.id]
          );
        }
      } catch (e: unknown) {
        console.error(`TRV refresh failed for ${trv.name}:`, getErrorMessage(e));
      }
    }));
  }

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

  if ('dps' in body) {
    console.log(`Local control ${id}: dps ${body.dps} = ${body.value}`);
    try {
      const success = await sendDeviceCommand(id, body.dps, body.value);
      if (success) {
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

// Get device status
devices.get('/:id/status', async (c) => {
  const id = c.req.param('id');
  const source = c.req.query('source');
  const db = getDb();

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
    } catch (e: unknown) {
      const err = e as Error;
      console.log(`Local status failed for ${id}:`, err.message);
    }
  }

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
    } catch (e: unknown) {
      const err = e as Error;
      console.error(`Cloud status error for ${id}:`, err.message);
      return c.json({ error: err.message }, 500);
    }
  }

  return c.json({ error: 'Could not get status' }, 500);
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
