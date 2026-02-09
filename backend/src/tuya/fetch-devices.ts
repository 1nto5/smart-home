import { getDevices, getDeviceInfo, getDeviceStatus } from './tuya-api';
import { Database } from 'bun:sqlite';
import { config } from '../config';
import path from 'path';
import { getErrorMessage } from '../utils/errors';
import { logger } from '../utils/logger';

// Convert cloud API status (code/value array) to DPS format
function cloudStatusToDps(status: Array<{ code: string; value: string | number | boolean }>, _category: string): Record<string, string | number | boolean> {
  const dps: Record<string, string | number | boolean> = {};
  for (const item of status) {
    switch (item.code) {
      // Water sensor (sj)
      case 'watersensor_state':
        dps['1'] = item.value === 'normal' ? '2' : '1';
        break;
      case 'battery_percentage':
        dps['4'] = item.value;
        break;
      // Door/Window sensor (mcs)
      case 'doorcontact_state':
        dps['101'] = item.value;
        break;
      case 'battery_value':
        dps['103'] = item.value;
        break;
    }
  }
  return dps;
}

async function main() {
  logger.info('Fetching devices from Tuya Cloud API', { component: 'fetch-devices' });

  try {
    const devices = await getDevices();
    logger.info('Devices found', { component: 'fetch-devices', count: devices.length });

    // Create database
    const dbPath = path.resolve(__dirname, '../../', config.db.path);
    const db = new Database(dbPath);

    // Insert or update devices
    const stmt = db.prepare(`
      INSERT INTO devices (id, name, local_key, uuid, node_id, gateway_id, category, product_name, online, ip, model, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        local_key = COALESCE(excluded.local_key, devices.local_key),
        uuid = COALESCE(excluded.uuid, devices.uuid),
        node_id = COALESCE(excluded.node_id, devices.node_id),
        gateway_id = COALESCE(excluded.gateway_id, devices.gateway_id),
        category = excluded.category,
        product_name = excluded.product_name,
        online = excluded.online,
        ip = excluded.ip,
        model = excluded.model,
        updated_at = CURRENT_TIMESTAMP
    `);

    for (const device of devices) {
      // Fetch device details to get node_id for local control
      let uuid: string | null = null;
      let nodeId: string | null = null;
      let gatewayId: string | null = null;

      try {
        const details = await getDeviceInfo(device.id);
        uuid = details.uuid || null;
        nodeId = details.node_id || null;
        gatewayId = details.gateway_id || null;

        logger.debug('Device details fetched', {
          component: 'fetch-devices',
          deviceId: device.id,
          deviceName: device.name,
          nodeId: nodeId || '(none)',
          sub: details.sub ? 'Yes' : 'No',
          category: device.category,
        });
      } catch (e: unknown) {
        logger.warn('Failed to get device details', { component: 'fetch-devices', deviceId: device.id, deviceName: device.name, error: getErrorMessage(e) });
      }

      // Don't overwrite local IP with cloud IP (cloud often returns external IP)
      stmt.run(
        device.id,
        device.name,
        device.local_key || null,
        uuid,
        nodeId,
        gatewayId,
        device.category,
        device.product_name,
        device.online ? 1 : 0,
        null, // Don't update IP - use discover.ts for that
        device.model || null
      );

      // Fetch and store status for sensors
      if (['sj', 'mcs'].includes(device.category)) {
        try {
          const status = await getDeviceStatus(device.id);
          if (status && status.length > 0) {
            const dps = cloudStatusToDps(status, device.category);
            db.run('UPDATE devices SET last_status = ? WHERE id = ?', [JSON.stringify(dps), device.id]);
            logger.debug('Device status fetched', { component: 'fetch-devices', deviceId: device.id, dps });
          }
        } catch (e: unknown) {
          logger.warn('Status fetch failed', { component: 'fetch-devices', deviceId: device.id, error: getErrorMessage(e) });
        }
      }
    }

    logger.info('Devices saved to database', { component: 'fetch-devices', count: devices.length, dbPath });
    db.close();

  } catch (error) {
    logger.error('Failed to fetch devices', { component: 'fetch-devices', error: getErrorMessage(error) });
    process.exit(1);
  }
}

main();
