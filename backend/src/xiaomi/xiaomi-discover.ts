/**
 * Xiaomi/Mi Home device discovery
 * Uses miio protocol to find devices on local network
 */

import miio from 'miio';
import { getDb } from '../db/database';
import { logger } from '../utils/logger';

interface DiscoveredDevice {
  id: string;
  address: string;
  model?: string;
  token?: string;
}

// Cooldown between scans
let lastDiscoveryTime = 0;
const DISCOVERY_COOLDOWN = 60_000;

/**
 * Discover Xiaomi devices on local network
 */
export async function discoverXiaomiDevices(timeout = 30000): Promise<DiscoveredDevice[]> {
  return new Promise((resolve) => {
    logger.debug('Discovering Xiaomi devices', { component: 'xiaomi-discover', timeout: timeout / 1000 });

    const discoveredDevices: DiscoveredDevice[] = [];
    const browser = miio.browse();

    // miio types the callback as Record<string, unknown>, so we cast inside
    browser.on('available', (raw: Record<string, unknown>) => {
      const discovered: DiscoveredDevice = {
        id: raw.id != null ? String(raw.id) : 'unknown',
        address: String(raw.address ?? ''),
        model: raw.model != null ? String(raw.model) : undefined,
        token: raw.token instanceof Buffer ? raw.token.toString('hex') : undefined,
      };

      // Avoid duplicates
      if (!discoveredDevices.find(d => d.id === discovered.id)) {
        discoveredDevices.push(discovered);
        logger.debug('Found device', { component: 'xiaomi-discover', deviceId: discovered.id, address: discovered.address, model: discovered.model || 'unknown' });
      }
    });

    setTimeout(() => {
      browser.stop();
      resolve(discoveredDevices);
    }, timeout);
  });
}

/**
 * Scan network and update IP for all known Xiaomi devices
 * Returns map of deviceId -> newIp for devices with changed IPs
 */
export async function refreshDeviceIps(timeout = 15000): Promise<Map<string, string>> {
  // Check cooldown
  const now = Date.now();
  if (now - lastDiscoveryTime < DISCOVERY_COOLDOWN) {
    return new Map();
  }
  lastDiscoveryTime = now;

  const changes = new Map<string, string>();
  const db = getDb();

  // Get all known Xiaomi devices
  const knownDevices = db.query('SELECT id, ip FROM xiaomi_devices').all() as { id: string; ip: string }[];
  const knownMap = new Map(knownDevices.map(d => [d.id, d.ip]));

  // Discover devices on network
  const discovered = await discoverXiaomiDevices(timeout);

  // Update IPs that have changed
  for (const device of discovered) {
    const currentIp = knownMap.get(device.id);
    if (currentIp && currentIp !== device.address) {
      db.run('UPDATE xiaomi_devices SET ip = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [device.address, device.id]);
      changes.set(device.id, device.address);
      logger.info('Updated device IP', { component: 'xiaomi-discover', deviceId: device.id, oldIp: currentIp, newIp: device.address });
    }
  }

  return changes;
}

/**
 * Find specific device by ID and update its IP if found
 */
export async function findAndUpdateDeviceIp(deviceId: string, timeout = 10000): Promise<string | null> {
  // Check cooldown
  const now = Date.now();
  if (now - lastDiscoveryTime < DISCOVERY_COOLDOWN) {
    return null;
  }
  lastDiscoveryTime = now;

  const discovered = await discoverXiaomiDevices(timeout);
  const device = discovered.find(d => d.id === deviceId);

  if (device) {
    const db = getDb();
    db.run('UPDATE xiaomi_devices SET ip = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [device.address, deviceId]);
    logger.info('Updated device IP', { component: 'xiaomi-discover', deviceId, newIp: device.address });
    return device.address;
  }

  return null;
}

/**
 * Save discovered device to database
 */
export function saveXiaomiDevice(
  id: string,
  name: string,
  ip: string,
  token: string,
  model: string,
  category: string
): void {
  const db = getDb();

  db.run(`
    INSERT INTO xiaomi_devices (id, name, ip, token, model, category, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      ip = excluded.ip,
      token = COALESCE(excluded.token, xiaomi_devices.token),
      model = excluded.model,
      category = excluded.category,
      updated_at = CURRENT_TIMESTAMP
  `, [id, name, ip, token, model, category]);

  logger.info('Saved Xiaomi device', { component: 'xiaomi-discover', deviceId: id, deviceName: name });
}

// CLI discovery
if (import.meta.main) {
  (async () => {
    const devices = await discoverXiaomiDevices(20000);
    logger.info('Discovered devices', { component: 'xiaomi-discover', count: devices.length, devices });
    process.exit(0);
  })();
}
