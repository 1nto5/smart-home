/**
 * Add Xiaomi device to database
 * Usage: bun src/xiaomi/add-device.ts <id> <name> <ip> <token> <model> <category> [room]
 *
 * Categories: lamp, vacuum, purifier
 *
 * Example:
 *   bun src/xiaomi/add-device.ts 334274943 "Lampa salon" 10.10.10.112 abc123...def "yeelink.light.mono1" lamp "Salon"
 */

import { initDatabase, getDb } from '../db/database';
import { logger } from '../utils/logger';

const args = process.argv.slice(2);

if (args.length < 6) {
  logger.info('Usage: bun src/xiaomi/add-device.ts <id> <name> <ip> <token> <model> <category> [room]', { component: 'xiaomi-add-device' });
  logger.info('Categories: lamp, vacuum, purifier', { component: 'xiaomi-add-device' });
  logger.info('Example: bun src/xiaomi/add-device.ts 334274943 "Lampa salon" 10.10.10.112 abc123def "yeelink.light.mono1" lamp "Salon"', { component: 'xiaomi-add-device' });
  process.exit(1);
}

const id = args[0]!;
const name = args[1]!;
const ip = args[2]!;
const token = args[3]!;
const model = args[4]!;
const category = args[5]!;
const room = args[6];

initDatabase();
const db = getDb();

db.run(`
  INSERT INTO xiaomi_devices (id, name, ip, token, model, category, room, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    ip = excluded.ip,
    token = excluded.token,
    model = excluded.model,
    category = excluded.category,
    room = COALESCE(excluded.room, xiaomi_devices.room),
    updated_at = CURRENT_TIMESTAMP
`, [id, name, ip, token, model, category, room || null]);

logger.info('Added/Updated Xiaomi device', {
  component: 'xiaomi-add-device',
  deviceId: id,
  deviceName: name,
  ip,
  token: token.substring(0, 8) + '...',
  model,
  category,
  room: room || '(not set)',
});
