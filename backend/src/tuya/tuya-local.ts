import TuyAPI from 'tuyapi';
import { getDb, recordContactChange, getLastContactState, recordSensorReading } from '../db/database';
import { triggerAlarm } from '../notifications/alarm-service';

interface DeviceConnection {
  device: TuyAPI;
  connected: boolean;
  lastStatus: Record<string, any>;
}

// Store active connections
const connections = new Map<string, DeviceConnection>();

// Gateway info (all Zigbee devices go through this)
const GATEWAY_ID = 'bf889f95067d327853rwzw';

interface TuyaDevice {
  id: string;
  name: string;
  local_key: string;
  uuid: string | null;
  node_id: string | null;
  gateway_id: string | null;
  ip: string | null;
  category: string;
}

/**
 * Get device from database
 */
function getDevice(deviceId: string): TuyaDevice | null {
  const db = getDb();
  return db.query('SELECT id, name, local_key, uuid, node_id, gateway_id, ip, category FROM devices WHERE id = ?').get(deviceId) as TuyaDevice | null;
}

/**
 * Get cid for local control - uses node_id if available, otherwise uuid if different from id
 */
function getCid(device: TuyaDevice): string {
  if (device.node_id) return device.node_id;
  if (device.uuid && device.uuid !== device.id) return device.uuid;
  return device.id;
}

/**
 * Find device by node_id (cid) - used for subdevice event handling
 */
function findDeviceByNodeId(nodeId: string): TuyaDevice | null {
  const db = getDb();
  return db.query(
    'SELECT id, name, local_key, uuid, node_id, gateway_id, ip, category FROM devices WHERE node_id = ? OR uuid = ?'
  ).get(nodeId, nodeId) as TuyaDevice | null;
}

/**
 * Handle subdevice data event from gateway (door/window/water sensor state change)
 */
function handleSubdeviceEvent(cid: string, dps: Record<string, any>): void {
  const device = findDeviceByNodeId(cid);
  if (!device) {
    console.log(`Unknown subdevice with cid: ${cid}`);
    return;
  }

  // Door/window sensor (mcs) - DPS 101 = contact state
  if (device.category === 'mcs' && dps['101'] !== undefined) {
    const isOpen = dps['101'] === true || dps['101'] === 'true';
    const lastState = getLastContactState(device.id);

    // Only record if state changed
    if (lastState === null || lastState !== isOpen) {
      recordContactChange(device.id, device.name, isOpen);
      console.log(`📍 ${device.name}: ${isOpen ? 'OPENED' : 'CLOSED'}`);

      // Trigger door alarm (only creates if alarm is armed, handled inside triggerAlarm)
      if (isOpen) {
        triggerAlarm('door', device.id, device.name).catch((err) => {
          console.error('Failed to trigger door alarm:', err);
        });
      }
    }
  }

  // Water sensor (sj) - DPS 1 = leak state
  if (device.category === 'sj' && dps['1'] !== undefined) {
    const isLeaking = dps['1'] === '1' || dps['1'] === 1;
    const lastState = getLastContactState(device.id);

    // Only record if state changed (treat leak as "open")
    if (lastState === null || lastState !== isLeaking) {
      recordContactChange(device.id, device.name, isLeaking);
      if (isLeaking) {
        console.log(`🚨 WATER LEAK DETECTED: ${device.name}`);

        // Trigger flood alarm (always, regardless of alarm armed state)
        triggerAlarm('flood', device.id, device.name).catch((err) => {
          console.error('Failed to trigger flood alarm:', err);
        });
      } else {
        console.log(`✓ ${device.name}: Water sensor normal`);
      }
    }
  }

  // Weather station (wsdcg) - temperature/humidity
  if (device.category === 'wsdcg') {
    const temp = dps['103'] !== undefined ? dps['103'] / 100 : null;
    const humidity = dps['101'] !== undefined ? dps['101'] / 100 : null;
    const battery = dps['102'] !== undefined ? dps['102'] : null;

    if (temp !== null || humidity !== null) {
      recordSensorReading(device.id, device.name, temp, humidity, null, battery);
      console.log(`🌡️ ${device.name}: ${temp}°C, ${humidity}%`);
    }
  }

  // TRV (wkf) - temperature data
  if (device.category === 'wkf') {
    const currentTemp = dps['5'] !== undefined ? dps['5'] / 10 : null;
    const targetTemp = dps['4'] !== undefined ? dps['4'] / 10 : null;
    const battery = dps['35'] !== undefined ? dps['35'] : null;

    if (currentTemp !== null) {
      recordSensorReading(device.id, device.name, currentTemp, null, targetTemp, battery);
      console.log(`🔥 ${device.name}: ${currentTemp}°C (target: ${targetTemp}°C)`);
    }
  }
}

/**
 * Discover device IP using UDP broadcast
 */
export async function discoverDevice(deviceId: string, key: string): Promise<string | null> {
  return new Promise((resolve) => {
    const device = new TuyAPI({
      id: deviceId,
      key: key,
    });

    const timeout = setTimeout(() => {
      device.disconnect();
      resolve(null);
    }, 10000);

    device.find().then(() => {
      clearTimeout(timeout);
      // @ts-ignore - ip is set after find()
      const ip = device.device?.ip;
      device.disconnect();
      resolve(ip || null);
    }).catch(() => {
      clearTimeout(timeout);
      resolve(null);
    });
  });
}

/**
 * Connect to device
 */
export async function connectDevice(deviceId: string): Promise<DeviceConnection | null> {
  // Check if already connected
  const existing = connections.get(deviceId);
  if (existing?.connected) {
    return existing;
  }

  const dbDevice = getDevice(deviceId);
  if (!dbDevice || !dbDevice.local_key) {
    console.error(`Device ${deviceId} not found or missing local_key`);
    return null;
  }

  let ip = dbDevice.ip;

  // If no IP, try to discover
  if (!ip) {
    console.log(`Discovering IP for ${deviceId}...`);
    ip = await discoverDevice(deviceId, dbDevice.local_key);
    if (ip) {
      // Save IP to database
      const db = getDb();
      db.run('UPDATE devices SET ip = ? WHERE id = ?', [ip, deviceId]);
      console.log(`Found IP: ${ip}`);
    } else {
      console.error(`Could not discover IP for ${deviceId}`);
      return null;
    }
  }

  // Version 3.3 for Zigbee gateways
  const device = new TuyAPI({
    id: deviceId,
    key: dbDevice.local_key,
    ip: ip,
    version: '3.3',
    issueRefreshOnConnect: true,
    nullPayloadOnJSONError: true, // Return null instead of throwing on JSON errors
  });

  const connection: DeviceConnection = {
    device,
    connected: false,
    lastStatus: {},
  };

  // Event handlers
  device.on('connected', () => {
    console.log(`Connected to ${dbDevice.name} (${deviceId})`);
    connection.connected = true;
  });

  device.on('disconnected', () => {
    console.log(`Disconnected from ${dbDevice.name} (${deviceId})`);
    connection.connected = false;
  });

  device.on('error', (error: Error) => {
    console.error(`Error from ${dbDevice.name}:`, error.message);
  });

  device.on('data', (data: any) => {
    console.log(`Data from ${dbDevice.name}:`, data);
    if (data.dps) {
      connection.lastStatus = data.dps;
      // Save to history
      saveDeviceHistory(deviceId, data.dps);

      // If this is the gateway and data has cid, it's a subdevice event
      if (deviceId === GATEWAY_ID && data.cid) {
        handleSubdeviceEvent(data.cid, data.dps);
      }
    }
  });

  try {
    await device.connect();
    connections.set(deviceId, connection);
    return connection;
  } catch (error: any) {
    console.error(`Failed to connect to ${deviceId}:`, error.message);
    return null;
  }
}

/**
 * Get device status (handles subdevices via gateway)
 */
export async function getDeviceStatus(deviceId: string): Promise<Record<string, any> | null> {
  const dbDevice = getDevice(deviceId);
  if (!dbDevice) {
    console.error(`Device ${deviceId} not found in database`);
    return null;
  }

  // All devices except gateway (wfcon) are Zigbee subdevices
  const isSubdevice = dbDevice.category !== 'wfcon';

  if (isSubdevice) {
    // Get status through gateway
    let gatewayConn = connections.get(GATEWAY_ID);
    if (!gatewayConn?.connected) {
      gatewayConn = await connectDevice(GATEWAY_ID);
    }
    if (!gatewayConn) return null;

    const cid = getCid(dbDevice);

    try {
      const status = await gatewayConn.device.get({ cid, schema: true });
      if (status?.dps) {
        saveDeviceHistory(deviceId, status.dps);
      }
      return status;
    } catch (error: any) {
      console.error(`Failed to get status for ${dbDevice.name}:`, error.message);
      return null;
    }
  } else {
    // Direct connection
    let conn = connections.get(deviceId);
    if (!conn?.connected) {
      conn = await connectDevice(deviceId);
    }
    if (!conn) return null;

    try {
      const status = await conn.device.get({ schema: true });
      if (status?.dps) {
        conn.lastStatus = status.dps;
        saveDeviceHistory(deviceId, status.dps);
      }
      return status;
    } catch (error: any) {
      console.error(`Failed to get status for ${dbDevice.name}:`, error.message);
      return conn.lastStatus || null;
    }
  }
}

/**
 * Send command to device (through gateway for Zigbee subdevices)
 */
export async function sendDeviceCommand(
  deviceId: string,
  dps: number,
  value: any
): Promise<boolean> {
  const dbDevice = getDevice(deviceId);
  if (!dbDevice) {
    console.error(`Device ${deviceId} not found in database`);
    return false;
  }

  // All devices except gateway (wfcon) are Zigbee subdevices
  const isSubdevice = dbDevice.category !== 'wfcon';

  if (isSubdevice) {
    // Connect to gateway and send to subdevice
    let gatewayConn = connections.get(GATEWAY_ID);
    if (!gatewayConn?.connected) {
      gatewayConn = await connectDevice(GATEWAY_ID);
    }
    if (!gatewayConn) {
      console.error('Cannot connect to gateway for subdevice control');
      return false;
    }

    const cid = getCid(dbDevice);

    try {
      // Send command to subdevice via gateway
      await gatewayConn.device.set({
        dps,
        set: value,
        cid,
      });
      console.log(`Set ${dbDevice.name} (${cid}) via gateway: dps ${dps} = ${value}`);
      return true;
    } catch (error: any) {
      console.error(`Failed to send to subdevice ${dbDevice.name}:`, error.message);
      return false;
    }
  } else {
    // Direct connection for WiFi devices
    let conn = connections.get(deviceId);
    if (!conn?.connected) {
      conn = await connectDevice(deviceId);
    }
    if (!conn) return false;

    try {
      await conn.device.set({ dps, set: value });
      console.log(`Set ${dbDevice.name} dps ${dps} = ${value}`);
      return true;
    } catch (error: any) {
      console.error(`Failed to send to ${dbDevice.name}:`, error.message);
      return false;
    }
  }
}

/**
 * Send multiple commands
 */
export async function sendDeviceCommands(
  deviceId: string,
  commands: Record<string, any>
): Promise<boolean> {
  let conn = connections.get(deviceId);
  if (!conn?.connected) {
    conn = await connectDevice(deviceId);
  }
  if (!conn) return false;

  try {
    await conn.device.set({ multiple: true, data: commands });
    console.log(`Set ${deviceId} dps:`, commands);
    return true;
  } catch (error: any) {
    console.error(`Failed to send commands to ${deviceId}:`, error.message);
    return false;
  }
}

/**
 * Disconnect device
 */
export function disconnectDevice(deviceId: string): void {
  const conn = connections.get(deviceId);
  if (conn) {
    conn.device.disconnect();
    connections.delete(deviceId);
  }
}

/**
 * Disconnect all devices
 */
export function disconnectAll(): void {
  for (const [id] of connections) {
    disconnectDevice(id);
  }
}

/**
 * Save device status to history
 */
function saveDeviceHistory(deviceId: string, status: Record<string, any>): void {
  try {
    const db = getDb();
    db.run(
      'INSERT INTO device_history (device_id, status_json) VALUES (?, ?)',
      [deviceId, JSON.stringify(status)]
    );
  } catch (error) {
    console.error('Failed to save device history:', error);
  }
}

/**
 * Test connection to gateway
 */
export async function testGatewayConnection(): Promise<boolean> {
  const gateway = getDevice(GATEWAY_ID);
  if (!gateway) {
    console.error('Gateway not found in database');
    return false;
  }

  console.log(`Testing connection to gateway: ${gateway.name}`);
  const conn = await connectDevice(GATEWAY_ID);

  if (conn?.connected) {
    console.log('Gateway connected successfully!');
    const status = await getDeviceStatus(GATEWAY_ID);
    console.log('Gateway status:', status);
    return true;
  }

  return false;
}
