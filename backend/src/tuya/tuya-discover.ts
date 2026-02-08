/**
 * Tuya gateway IP discovery
 * Uses TuyAPI UDP broadcast to find gateway
 */

import TuyAPI from 'tuyapi';
import { getDb } from '../db/database';
import { logger } from '../utils/logger';

/**
 * Discover Tuya gateway IP and update database
 */
export async function discoverTuyaGatewayIp(deviceId: string, key: string, timeout = 10): Promise<string | null> {
  const device = new TuyAPI({
    id: deviceId,
    key: key,
  });

  try {
    await device.find({ timeout });
    // @ts-expect-error ip is set after find()
    const ip = device.device?.ip;

    if (ip) {
      const db = getDb();
      db.run('UPDATE devices SET ip = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [ip, deviceId]);
      logger.info('Gateway IP updated', { component: 'tuya-discover', deviceId, ip });
      return ip;
    }
  } catch (e) {
    // Discovery failed silently
  } finally {
    device.disconnect();
  }
  return null;
}
