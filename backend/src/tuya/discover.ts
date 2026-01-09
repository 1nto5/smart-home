import TuyAPI from 'tuyapi';
import { initDatabase, getDb } from '../db/database';

async function main() {
  console.log('Initializing database...');
  initDatabase();

  const db = getDb();
  const gateway = db.query('SELECT * FROM devices WHERE category = ?').get('wfcon') as any;

  if (!gateway) {
    console.error('Gateway not found');
    process.exit(1);
  }

  console.log('\nGateway info:');
  console.log('  ID:', gateway.id);
  console.log('  Name:', gateway.name);
  console.log('  Local Key:', gateway.local_key);
  console.log('  Current IP:', gateway.ip || '(not set)');

  console.log('\nStarting UDP discovery (this may take up to 30 seconds)...');
  console.log('Make sure you are on the same network as the gateway.\n');

  const device = new TuyAPI({
    id: gateway.id,
    key: gateway.local_key,
  });

  device.on('error', (err: Error) => {
    console.error('Error:', err.message);
  });

  try {
    await device.find({ timeout: 20 });
    // @ts-ignore
    const ip = device.device?.ip;

    if (ip) {
      console.log('✓ Found device at IP:', ip);

      // Save to database
      db.run('UPDATE devices SET ip = ? WHERE id = ?', [ip, gateway.id]);
      console.log('✓ IP saved to database');
    } else {
      console.log('✗ Device found but no IP returned');
    }
  } catch (error: any) {
    console.error('✗ Discovery failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure you are on the same WiFi network as the gateway');
    console.log('2. Check if UDP ports 6666/6667 are open');
    console.log('3. Try power cycling the gateway');
    console.log('4. Verify the local_key is correct');
  } finally {
    device.disconnect();
    process.exit(0);
  }
}

main();
