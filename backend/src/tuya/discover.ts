import TuyAPI from 'tuyapi';
import { initDatabase, getDb } from '../db/database';
import { getErrorMessage } from '../utils/errors';
import { logger } from '../utils/logger';

async function main() {
  logger.info('Initializing database', { component: 'discover' });
  initDatabase();

  const db = getDb();
  const gateway = db.query('SELECT * FROM devices WHERE category = ?').get('wfcon') as {
    id: string;
    name: string;
    local_key: string;
    ip: string | null;
  } | null;

  if (!gateway) {
    logger.error('Gateway not found', { component: 'discover' });
    process.exit(1);
  }

  logger.info('Gateway info', {
    component: 'discover',
    deviceId: gateway.id,
    deviceName: gateway.name,
    currentIp: gateway.ip || '(not set)',
  });

  logger.info('Starting UDP discovery', { component: 'discover' });

  const device = new TuyAPI({
    id: gateway.id,
    key: gateway.local_key,
  });

  device.on('error', (err: Error) => {
    logger.error('Discovery error', { component: 'discover', error: err.message });
  });

  try {
    await device.find({ timeout: 20 });
    // @ts-expect-error ip is set after find()
    const ip = device.device?.ip;

    if (ip) {
      logger.info('Device found', { component: 'discover', ip });

      // Save to database
      db.run('UPDATE devices SET ip = ? WHERE id = ?', [ip, gateway.id]);
      logger.info('IP saved to database', { component: 'discover' });
    } else {
      logger.warn('Device found but no IP returned', { component: 'discover' });
    }
  } catch (error: unknown) {
    logger.error('Discovery failed', { component: 'discover', error: getErrorMessage(error) });
    logger.info('Troubleshooting: ensure same WiFi network, UDP ports 6666/6667 open, try power cycling gateway, verify local_key', { component: 'discover' });
  } finally {
    device.disconnect();
    process.exit(0);
  }
}

main();
