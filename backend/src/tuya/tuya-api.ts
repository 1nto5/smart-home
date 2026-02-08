import crypto from 'crypto';
import { config } from '../config';
import { getErrorMessage } from '../utils/errors';

const BASE_URL = `https://openapi.tuya${config.tuya.region}.com`;

interface TokenResponse {
  access_token: string;
  expire_time: number;
  refresh_token: string;
  uid: string;
}

interface TuyaDevice {
  id: string;
  name: string;
  local_key: string;
  category: string;
  product_name: string;
  online: boolean;
  ip?: string;
  model?: string;
}

interface TuyaDeviceInfo {
  id: string;
  name: string;
  local_key: string;
  category: string;
  product_name: string;
  online: boolean;
  ip?: string;
  model?: string;
  uuid?: string;
  node_id?: string;
  gateway_id?: string;
  sub?: boolean;
}

interface TuyaStatusItem {
  code: string;
  value: string | number | boolean;
}

let accessToken: string | null = null;
let tokenExpiry: number = 0;

function stringToSign(
  method: string,
  path: string,
  body: string = ''
): string {
  const contentHash = crypto.createHash('sha256').update(body).digest('hex');
  return `${method}\n${contentHash}\n\n${path}`;
}

function generateSign(
  clientId: string,
  secret: string,
  timestamp: string,
  token: string = '',
  method: string = 'GET',
  path: string = '',
  body: string = ''
): string {
  const signStr = stringToSign(method, path, body);
  const str = clientId + token + timestamp + signStr;
  return crypto.createHmac('sha256', secret).update(str).digest('hex').toUpperCase();
}

async function request<T>(
  path: string,
  method: 'GET' | 'POST' = 'GET',
  body?: object,
  useToken: boolean = true
): Promise<T> {
  const timestamp = Date.now().toString();
  const token = useToken && accessToken ? accessToken : '';
  const bodyStr = body ? JSON.stringify(body) : '';

  const sign = generateSign(
    config.tuya.accessId,
    config.tuya.accessSecret,
    timestamp,
    token,
    method,
    path,
    bodyStr
  );

  const headers: Record<string, string> = {
    client_id: config.tuya.accessId,
    sign: sign,
    t: timestamp,
    sign_method: 'HMAC-SHA256',
  };

  if (token) {
    headers['access_token'] = token;
  }

  if (method === 'POST') {
    headers['Content-Type'] = 'application/json';
  }

  const url = `${BASE_URL}${path}`;
  // console.log('Request:', method, url);
  // console.log('Headers:', headers);

  const response = await fetch(url, {
    method,
    headers,
    body: method === 'POST' ? bodyStr : undefined,
  });

  const data = await response.json() as { success: boolean; msg?: string; code?: number; result: T };

  if (!data.success) {
    throw new Error(`Tuya API Error: ${data.msg} (code: ${data.code})`);
  }

  return data.result;
}

export async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  console.log('Getting new access token...');
  const result = await request<TokenResponse>('/v1.0/token?grant_type=1', 'GET', undefined, false);

  accessToken = result.access_token;
  tokenExpiry = Date.now() + result.expire_time * 1000 - 60000;

  console.log('Access token obtained');
  return accessToken;
}

export async function getDevices(): Promise<TuyaDevice[]> {
  await getAccessToken();

  const devices: TuyaDevice[] = [];

  try {
    // Get devices from linked app account
    const result = await request<{ devices: TuyaDevice[]; total: number }>(
      '/v1.0/iot-01/associated-users/devices?page_no=1&page_size=100',
      'GET'
    );

    for (const device of result.devices || []) {
      devices.push({
        id: device.id,
        name: device.name,
        local_key: device.local_key,
        category: device.category,
        product_name: device.product_name,
        online: device.online,
        ip: device.ip,
        model: device.model,
      });
    }
  } catch (error: unknown) {
    console.log('First endpoint failed:', getErrorMessage(error));
    console.log('Trying alternative endpoint...');

    // Try getting device list for specific user
    try {
      const result = await request<TuyaDevice[]>('/v1.0/devices', 'GET');
      for (const device of result || []) {
        devices.push({
          id: device.id,
          name: device.name,
          local_key: device.local_key || '',
          category: device.category,
          product_name: device.product_name,
          online: device.online,
          ip: device.ip,
          model: device.model,
        });
      }
    } catch (err: unknown) {
      console.log('Alternative also failed:', getErrorMessage(err));
    }
  }

  return devices;
}

export async function getDeviceInfo(deviceId: string): Promise<TuyaDeviceInfo> {
  await getAccessToken();
  return request<TuyaDeviceInfo>(`/v1.0/devices/${deviceId}`, 'GET');
}

export async function getDeviceStatus(deviceId: string): Promise<TuyaStatusItem[]> {
  await getAccessToken();
  return request<TuyaStatusItem[]>(`/v1.0/devices/${deviceId}/status`, 'GET');
}

export async function sendCommand(
  deviceId: string,
  commands: { code: string; value: string | number | boolean }[]
): Promise<boolean> {
  await getAccessToken();

  try {
    await request(`/v1.0/devices/${deviceId}/commands`, 'POST', { commands });
    return true;
  } catch (error) {
    console.error(`Error sending command to ${deviceId}:`, error);
    return false;
  }
}
