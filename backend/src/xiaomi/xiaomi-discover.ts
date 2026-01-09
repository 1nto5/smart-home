/**
 * Xiaomi/Mi Home device discovery
 * Uses miio protocol to find devices on local network
 */

import miio from 'miio';
import { getDb } from '../db/database';

interface DiscoveredDevice {
  id: string;
  address: string;
  model?: string;
  token?: string;
}

const discoveredDevices: DiscoveredDevice[] = [];

/**
 * Discover Xiaomi devices on local network
 */
export async function discoverXiaomiDevices(timeout = 30000): Promise<DiscoveredDevice[]> {
  return new Promise((resolve) => {
    console.log(`Discovering Xiaomi devices for ${timeout / 1000}s...`);

    const browser = miio.browse();

    browser.on('available', (device: any) => {
      const discovered: DiscoveredDevice = {
        id: device.id?.toString() || 'unknown',
        address: device.address,
        model: device.model,
        token: device.token?.toString('hex'),
      };

      // Avoid duplicates
      if (!discoveredDevices.find(d => d.id === discovered.id)) {
        discoveredDevices.push(discovered);
        console.log(`Found: ${discovered.id} at ${discovered.address} (${discovered.model || 'unknown model'})`);
      }
    });

    setTimeout(() => {
      browser.stop();
      resolve(discoveredDevices);
    }, timeout);
  });
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

  console.log(`Saved Xiaomi device: ${name} (${id})`);
}

// CLI discovery
if (import.meta.main) {
  (async () => {
    const devices = await discoverXiaomiDevices(20000);
    console.log('\n=== Discovered Devices ===');
    console.log(JSON.stringify(devices, null, 2));
    process.exit(0);
  })();
}
