/**
 * Test Yeelight LAN control (no token required)
 */
import net from 'net';

const LAMP_IP = '10.10.10.111';
const LAMP_PORT = 55443;

async function sendCommand(ip: string, method: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    socket.setTimeout(5000);

    const cmd = JSON.stringify({
      id: 1,
      method,
      params,
    }) + '\r\n';

    socket.connect(LAMP_PORT, ip, () => {
      console.log(`Connected to ${ip}:${LAMP_PORT}`);
      socket.write(cmd);
    });

    socket.on('data', (data) => {
      const response = data.toString().trim();
      console.log('Response:', response);
      try {
        const json = JSON.parse(response);
        socket.destroy();
        resolve(json);
      } catch {
        socket.destroy();
        resolve(response);
      }
    });

    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error('Connection timeout'));
    });

    socket.on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  console.log(`\n=== Testing Yeelight LAN Control on ${LAMP_IP} ===\n`);

  try {
    // Get properties
    console.log('1. Getting lamp status...');
    const status = await sendCommand(LAMP_IP, 'get_prop', ['power', 'bright', 'ct', 'color_mode', 'active_mode', 'nl_br']);
    console.log('Status:', status);

    // Toggle power
    console.log('\n2. Toggling power...');
    const toggle = await sendCommand(LAMP_IP, 'toggle', []);
    console.log('Toggle result:', toggle);

    // Wait and toggle back
    await new Promise(r => setTimeout(r, 1500));

    console.log('\n3. Toggling back...');
    const toggleBack = await sendCommand(LAMP_IP, 'toggle', []);
    console.log('Toggle back result:', toggleBack);

    console.log('\n=== TEST PASSED! Yeelight LAN control works! ===\n');
  } catch (error: any) {
    console.error('\n=== TEST FAILED ===');
    console.error('Error:', error.message);
  }
}

main();
