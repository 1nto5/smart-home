/**
 * Yeelight SSDP discovery scan
 */
import dgram from 'dgram';

const socket = dgram.createSocket('udp4');
const msg = 'M-SEARCH * HTTP/1.1\r\nHOST: 239.255.255.250:1982\r\nMAN: "ssdp:discover"\r\nST: wifi_bulb\r\n\r\n';

const found: string[] = [];

socket.on('message', (data, rinfo) => {
  const text = data.toString();
  const idMatch = text.match(/id: (\d+)/);
  const modelMatch = text.match(/model: (\S+)/);
  if (idMatch) {
    const info = `${rinfo.address} ID=${idMatch[1]} model=${modelMatch?.[1] || 'unknown'}`;
    if (!found.includes(info)) {
      found.push(info);
      console.log('Found:', info);
    }
  }
});

socket.bind(() => {
  socket.setBroadcast(true);
  socket.send(msg, 1982, '239.255.255.250');
  console.log('Scanning for Yeelight devices (8s)...');
});

setTimeout(() => {
  socket.close();
  console.log(`\nTotal: ${found.length} device(s)`);
  process.exit(0);
}, 8000);
