import TuyAPI from 'tuyapi';
import { getDb, recordContactChange, getLastContactState, recordSensorReading } from '../db/database';
import { triggerAlarm } from '../notifications/alarm-service';
import { evaluateSensorTrigger } from '../automations/automation-triggers';
import { broadcastTuyaStatus } from '../ws/device-broadcast';
import { discoverTuyaGatewayIp } from './tuya-discover';
import { config } from '../config';
import { deviceCircuits, CircuitOpenError } from '../utils/circuit-breaker';
import { getErrorMessage } from '../utils/errors';
import { logger } from '../utils/logger';

type DpsValue = boolean | number | string;
type DpsRecord = Record<string, DpsValue>;

interface TuyaStatusResponse {
  dps?: DpsRecord;
}

interface DeviceConnection {
  device: TuyAPI;
  connected: boolean;
  lastStatus: DpsRecord;
}

// Store active connections
const connections = new Map<string, DeviceConnection>();

// Gateway info (all Zigbee devices go through this)
const GATEWAY_ID = config.tuya.gatewayId;

// Reconnect state
let reconnectTimeout: Timer | null = null;
let reconnectAttempts = 0;
const RECONNECT_DELAY_MS = 5000;
const MAX_RECONNECT_ATTEMPTS = 10;

// Timeout for TuyAPI operations (prevents hanging requests)
const TUYA_OPERATION_TIMEOUT_MS = 15000;

/**
 * Wrap a promise with a timeout
 */
async function withTimeout<T>(promise: Promise<T>, ms: number, op: string): Promise<T> {
  let timeoutId: Timer;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`${op} timed out after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timeoutId!);
  }
}

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
function handleSubdeviceEvent(cid: string, dps: DpsRecord): void {
  const device = findDeviceByNodeId(cid);
  if (!device) {
    logger.debug('Unknown subdevice event', { component: 'tuya-local', cid });
    return;
  }

  // Door/window sensor (mcs) - DPS 101 = contact state
  if (device.category === 'mcs' && dps['101'] !== undefined) {
    const isOpen = dps['101'] === true || dps['101'] === 'true';
    const lastState = getLastContactState(device.id);

    // Only record if state changed
    if (lastState === null || lastState !== isOpen) {
      recordContactChange(device.id, device.name, isOpen);
      broadcastTuyaStatus(device.id, device.category, { '101': isOpen });
      logger.info(`Contact sensor ${isOpen ? 'opened' : 'closed'}`, { component: 'tuya-local', deviceId: device.id, deviceName: device.name });

      // Trigger automations
      evaluateSensorTrigger(device.id, device.name, isOpen ? 'open' : 'closed');

      // Trigger door alarm (only creates if alarm is armed, handled inside triggerAlarm)
      if (isOpen) {
        triggerAlarm('door', device.id, device.name).catch((err) => {
          logger.error('Failed to trigger door alarm', { component: 'tuya-local', deviceId: device.id, deviceName: device.name, error: getErrorMessage(err) });
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
      broadcastTuyaStatus(device.id, device.category, { '1': isLeaking ? 1 : 0 });
      if (isLeaking) {
        logger.warn('Water leak detected', { component: 'tuya-local', deviceId: device.id, deviceName: device.name });

        // Trigger flood alarm (always, regardless of alarm armed state)
        triggerAlarm('flood', device.id, device.name).catch((err) => {
          logger.error('Failed to trigger flood alarm', { component: 'tuya-local', deviceId: device.id, deviceName: device.name, error: getErrorMessage(err) });
        });
      } else {
        logger.info('Water sensor normal', { component: 'tuya-local', deviceId: device.id, deviceName: device.name });
      }
    }
  }

  // Weather station (wsdcg) - temperature/humidity
  if (device.category === 'wsdcg') {
    const temp = dps['103'] !== undefined ? Number(dps['103']) / 100 : null;
    const humidity = dps['101'] !== undefined ? Number(dps['101']) / 100 : null;
    const battery = dps['102'] !== undefined ? Number(dps['102']) : null;

    if (temp !== null || humidity !== null) {
      recordSensorReading(device.id, device.name, temp, humidity, null, battery);
      broadcastTuyaStatus(device.id, device.category, { temp, humidity, battery });
      logger.debug('Sensor reading', { component: 'tuya-local', deviceId: device.id, deviceName: device.name, temp, humidity });
    }
  }

  // TRV (wkf) - temperature and power data
  if (device.category === 'wkf') {
    const switchState = dps['1'] !== undefined ? dps['1'] === true : null;
    const currentTemp = dps['5'] !== undefined ? Number(dps['5']) / 10 : null;
    const targetTemp = dps['4'] !== undefined ? Number(dps['4']) / 10 : null;
    const battery = dps['35'] !== undefined ? Number(dps['35']) : null;

    if (currentTemp !== null || switchState !== null) {
      recordSensorReading(device.id, device.name, currentTemp, null, targetTemp, battery);
      broadcastTuyaStatus(device.id, device.category, { switchState, currentTemp, targetTemp, battery });
      if (switchState === false) {
        logger.debug('TRV off', { component: 'tuya-local', deviceId: device.id, deviceName: device.name });
      } else if (currentTemp !== null) {
        logger.debug('TRV reading', { component: 'tuya-local', deviceId: device.id, deviceName: device.name, currentTemp, targetTemp });
      }
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
      // @ts-expect-error ip is set after find()
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
    logger.error('Device not found or missing local_key', { component: 'tuya-local', deviceId });
    return null;
  }

  let ip = dbDevice.ip;

  // If no IP, try to discover
  if (!ip) {
    logger.info('Discovering device IP', { component: 'tuya-local', deviceId });
    ip = await discoverDevice(deviceId, dbDevice.local_key);
    if (ip) {
      // Save IP to database
      const db = getDb();
      db.run('UPDATE devices SET ip = ? WHERE id = ?', [ip, deviceId]);
      logger.info('Device IP discovered', { component: 'tuya-local', deviceId, ip });
    } else {
      logger.error('Could not discover device IP', { component: 'tuya-local', deviceId });
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
    logger.info('Device connected', { component: 'tuya-local', deviceId, deviceName: dbDevice.name });
    connection.connected = true;
    // Reset reconnect attempts on successful connection
    if (deviceId === GATEWAY_ID) {
      reconnectAttempts = 0;
    }
  });

  device.on('disconnected', () => {
    logger.info('Device disconnected', { component: 'tuya-local', deviceId, deviceName: dbDevice.name });
    connection.connected = false;

    // Auto-reconnect for gateway (with max retry limit)
    if (deviceId === GATEWAY_ID && !reconnectTimeout) {
      if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        logger.error('Gateway reconnect failed, giving up', { component: 'tuya-local', attempts: MAX_RECONNECT_ATTEMPTS });
        return;
      }
      reconnectAttempts++;
      logger.info('Scheduling gateway reconnect', { component: 'tuya-local', delayMs: RECONNECT_DELAY_MS, attempt: reconnectAttempts, maxAttempts: MAX_RECONNECT_ATTEMPTS });
      reconnectTimeout = setTimeout(async () => {
        reconnectTimeout = null;
        await reconnectGateway();
      }, RECONNECT_DELAY_MS);
    }
  });

  device.on('error', (error: Error) => {
    logger.error('Device error', { component: 'tuya-local', deviceId, deviceName: dbDevice.name, error: error.message });
  });

  // TuyAPI types data as DPSObject; cast to access dps/cid fields
  device.on('data', (rawData) => {
    const data = rawData as { dps?: DpsRecord; cid?: string };
    logger.debug('Device data received', { component: 'tuya-local', deviceId, deviceName: dbDevice.name, data });
    if (data.dps) {
      connection.lastStatus = data.dps;
      // Save to history
      saveDeviceHistory(deviceId, data.dps);

      // If this is the gateway and data has cid, it's a subdevice event
      if (deviceId === GATEWAY_ID && data.cid) {
        try {
          handleSubdeviceEvent(data.cid, data.dps);
        } catch (error: unknown) {
          logger.error('Subdevice event handler error', { component: 'tuya-local', cid: data.cid, error: getErrorMessage(error) });
        }
      }
    }
  });

  try {
    await device.connect();
    connections.set(deviceId, connection);
    return connection;
  } catch (error: unknown) {
    logger.error('Device connection failed', { component: 'tuya-local', deviceId, error: getErrorMessage(error) });

    // Trigger IP discovery for gateway on connection failure
    if (dbDevice.category === 'wfcon') {
      discoverTuyaGatewayIp(dbDevice.id, dbDevice.local_key).catch(() => {});
    }

    return null;
  }
}

/**
 * Get device status (handles subdevices via gateway)
 */
export async function getDeviceStatus(deviceId: string): Promise<TuyaStatusResponse | null> {
  const dbDevice = getDevice(deviceId);
  if (!dbDevice) {
    logger.error('Device not found in database', { component: 'tuya-local', deviceId });
    return null;
  }

  const circuit = deviceCircuits.tuyaLocal();

  // All devices except gateway (wfcon) are Zigbee subdevices
  const isSubdevice = dbDevice.category !== 'wfcon';

  if (isSubdevice) {
    // Get status through gateway
    let gatewayConn: DeviceConnection | null | undefined = connections.get(GATEWAY_ID);
    if (!gatewayConn?.connected) {
      gatewayConn = await connectDevice(GATEWAY_ID);
    }
    if (!gatewayConn) return null;

    const cid = getCid(dbDevice);
    const gw = gatewayConn; // Capture for closure

    try {
      const status = await circuit.execute(async () => {
        return withTimeout(
          gw.device.get({ cid, schema: true }),
          TUYA_OPERATION_TIMEOUT_MS,
          `getDeviceStatus(${dbDevice.name})`
        ) as Promise<TuyaStatusResponse | null>;
      });
      if (status?.dps) {
        saveDeviceHistory(deviceId, status.dps);
      }
      return status;
    } catch (error: unknown) {
      if (error instanceof CircuitOpenError) {
        logger.warn('Circuit open for tuya-local', { component: 'tuya-local', error: error.message });
      } else {
        logger.error('Failed to get device status', { component: 'tuya-local', deviceId, deviceName: dbDevice.name, error: getErrorMessage(error) });
      }
      return null;
    }
  } else {
    // Direct connection
    let conn: DeviceConnection | null | undefined = connections.get(deviceId);
    if (!conn?.connected) {
      conn = await connectDevice(deviceId);
    }
    if (!conn) return null;

    const device = conn; // Capture for closure

    try {
      const status = await circuit.execute(async () => {
        return withTimeout(
          device.device.get({ schema: true }),
          TUYA_OPERATION_TIMEOUT_MS,
          `getDeviceStatus(${dbDevice.name})`
        ) as Promise<TuyaStatusResponse | null>;
      });
      if (status?.dps) {
        device.lastStatus = status.dps;
        saveDeviceHistory(deviceId, status.dps);
      }
      return status;
    } catch (error: unknown) {
      if (error instanceof CircuitOpenError) {
        logger.warn('Circuit open for tuya-local', { component: 'tuya-local', error: error.message });
      } else {
        logger.error('Failed to get device status', { component: 'tuya-local', deviceId, deviceName: dbDevice.name, error: getErrorMessage(error) });
      }
      return device.lastStatus ? { dps: device.lastStatus } : null;
    }
  }
}

/**
 * Send command to device (through gateway for Zigbee subdevices)
 */
export async function sendDeviceCommand(
  deviceId: string,
  dps: number,
  value: DpsValue
): Promise<boolean> {
  const dbDevice = getDevice(deviceId);
  if (!dbDevice) {
    logger.error('Device not found in database', { component: 'tuya-local', deviceId });
    return false;
  }

  const circuit = deviceCircuits.tuyaLocal();

  // All devices except gateway (wfcon) are Zigbee subdevices
  const isSubdevice = dbDevice.category !== 'wfcon';

  if (isSubdevice) {
    // Connect to gateway and send to subdevice
    let gatewayConn: DeviceConnection | null | undefined = connections.get(GATEWAY_ID);
    if (!gatewayConn?.connected) {
      gatewayConn = await connectDevice(GATEWAY_ID);
    }
    if (!gatewayConn) {
      logger.error('Cannot connect to gateway for subdevice control', { component: 'tuya-local' });
      return false;
    }

    const cid = getCid(dbDevice);
    const gw = gatewayConn; // Capture for closure

    try {
      await circuit.execute(async () => {
        return withTimeout(
          gw.device.set({ dps, set: value, cid }),
          TUYA_OPERATION_TIMEOUT_MS,
          `sendDeviceCommand(${dbDevice.name})`
        );
      });
      logger.info('Command sent via gateway', { component: 'tuya-local', deviceId, deviceName: dbDevice.name, cid, dps, value });
      return true;
    } catch (error: unknown) {
      if (error instanceof CircuitOpenError) {
        logger.warn('Circuit open for tuya-local', { component: 'tuya-local', error: error.message });
      } else {
        logger.error('Failed to send command to subdevice', { component: 'tuya-local', deviceId, deviceName: dbDevice.name, error: getErrorMessage(error) });
      }
      return false;
    }
  } else {
    // Direct connection for WiFi devices
    let conn: DeviceConnection | null | undefined = connections.get(deviceId);
    if (!conn?.connected) {
      conn = await connectDevice(deviceId);
    }
    if (!conn) return false;

    const device = conn; // Capture for closure

    try {
      await circuit.execute(async () => {
        return withTimeout(
          device.device.set({ dps, set: value }),
          TUYA_OPERATION_TIMEOUT_MS,
          `sendDeviceCommand(${dbDevice.name})`
        );
      });
      logger.info('Command sent', { component: 'tuya-local', deviceId, deviceName: dbDevice.name, dps, value });
      return true;
    } catch (error: unknown) {
      if (error instanceof CircuitOpenError) {
        logger.warn('Circuit open for tuya-local', { component: 'tuya-local', error: error.message });
      } else {
        logger.error('Failed to send command', { component: 'tuya-local', deviceId, deviceName: dbDevice.name, error: getErrorMessage(error) });
      }
      return false;
    }
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
function saveDeviceHistory(deviceId: string, status: DpsRecord): void {
  try {
    const db = getDb();
    db.run(
      'INSERT INTO device_history (device_id, status_json) VALUES (?, ?)',
      [deviceId, JSON.stringify(status)]
    );
  } catch (error) {
    logger.error('Failed to save device history', { component: 'tuya-local', deviceId, error: getErrorMessage(error) });
  }
}

/**
 * Test connection to gateway
 */
export async function testGatewayConnection(): Promise<boolean> {
  const gateway = getDevice(GATEWAY_ID);
  if (!gateway) {
    logger.error('Gateway not found in database', { component: 'tuya-local' });
    return false;
  }

  logger.info('Testing gateway connection', { component: 'tuya-local', deviceName: gateway.name });
  const conn = await connectDevice(GATEWAY_ID);

  if (conn?.connected) {
    logger.info('Gateway connected successfully', { component: 'tuya-local' });
    const status = await getDeviceStatus(GATEWAY_ID);
    logger.debug('Gateway status', { component: 'tuya-local', status });
    return true;
  }

  return false;
}

/**
 * Get gateway connection status
 */
export function getGatewayConnectionStatus(): boolean {
  const conn = connections.get(GATEWAY_ID);
  return conn?.connected ?? false;
}

/**
 * Reconnect to gateway
 */
export async function reconnectGateway(): Promise<boolean> {
  logger.info('Attempting gateway reconnect', { component: 'tuya-local' });

  // Disconnect existing connection if any
  disconnectDevice(GATEWAY_ID);

  // Wait a moment before reconnecting
  await new Promise(resolve => setTimeout(resolve, 1000));

  const conn = await connectDevice(GATEWAY_ID);
  return conn?.connected ?? false;
}
