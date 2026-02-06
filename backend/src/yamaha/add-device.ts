/**
 * Add Yamaha device to database
 * Usage: bun src/yamaha/add-device.ts <id> <name> <ip> [model] [room]
 *
 * Example:
 *   bun src/yamaha/add-device.ts yas306-1 "Soundbar Salon" 192.168.1.50 YAS-306 Salon
 */

import { initDatabase, getDb } from '../db/database';
import { YamahaClient } from './yamaha-client';

const args = process.argv.slice(2);

if (args.length < 3) {
  console.log('Usage: bun src/yamaha/add-device.ts <id> <name> <ip> [model] [room]');
  console.log('');
  console.log('Example:');
  console.log('  bun src/yamaha/add-device.ts yas306-1 "Soundbar Salon" 192.168.1.50 YAS-306 Salon');
  process.exit(1);
}

const id = args[0]!;
const name = args[1]!;
const ip = args[2]!;
const model = args[3];
const room = args[4];

// Test connection and auto-detect model if not provided
console.log(`Testing connection to ${ip}...`);
const client = new YamahaClient(ip);
const info = await client.getDeviceInfo();

if (!info) {
  console.error(`Failed to connect to Yamaha device at ${ip}`);
  console.error('Make sure the device is powered on and on the same network.');
  process.exit(1);
}

const detectedModel = model || info.model_name;
console.log(`Connected to ${info.model_name} (API v${info.api_version})`);

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

console.log(`\nAdded/Updated Yamaha device:`);
console.log(`  ID: ${id}`);
console.log(`  Name: ${name}`);
console.log(`  IP: ${ip}`);
console.log(`  Model: ${detectedModel}`);
console.log(`  Room: ${room || '(not set)'}`);
console.log(`  Device ID: ${info.device_id}`);
console.log(`  Firmware: ${info.system_version}`);
