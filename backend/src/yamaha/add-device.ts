/**
 * Add Yamaha device to database
 * Usage: bun src/yamaha/add-device.ts <id> <name> <ip> [model] [room]
 *
 * Example:
 *   bun src/yamaha/add-device.ts yas306-1 "Soundbar Salon" 192.168.1.50 YAS-306 Salon
 */

import { initDatabase, getDb } from '../db/database';
import { logger } from '../utils/logger';
import { YamahaClient } from './yamaha-client';

const args = process.argv.slice(2);

if (args.length < 3) {
  logger.info('Usage: bun src/yamaha/add-device.ts <id> <name> <ip> [model] [room]', { component: 'yamaha-add-device' });
  logger.info('Example: bun src/yamaha/add-device.ts yas306-1 "Soundbar Salon" 192.168.1.50 YAS-306 Salon', { component: 'yamaha-add-device' });
  process.exit(1);
}

const id = args[0]!;
const name = args[1]!;
const ip = args[2]!;
const model = args[3];
const room = args[4];

// Test connection and auto-detect model if not provided
logger.debug('Testing connection', { component: 'yamaha-add-device', ip });
const client = new YamahaClient(ip);
const info = await client.getDeviceInfo();

if (!info) {
  logger.error('Failed to connect to Yamaha device', { component: 'yamaha-add-device', ip });
  logger.error('Make sure the device is powered on and on the same network', { component: 'yamaha-add-device' });
  process.exit(1);
}

const detectedModel = model || info.model_name;
logger.info('Connected to device', { component: 'yamaha-add-device', model: info.model_name, apiVersion: info.api_version });

initDatabase();
const db = getDb();

db.run(`
  INSERT INTO yamaha_devices (id, name, ip, model, room, online, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    ip = excluded.ip,
    model = excluded.model,
    room = COALESCE(excluded.room, yamaha_devices.room),
    online = 1,
    updated_at = CURRENT_TIMESTAMP
`, [id, name, ip, detectedModel, room || null]);

logger.info('Added/Updated Yamaha device', {
  component: 'yamaha-add-device',
  deviceId: id,
  deviceName: name,
  ip,
  model: detectedModel,
  room: room || '(not set)',
  yamahaDeviceId: info.device_id,
  firmware: info.system_version,
});
