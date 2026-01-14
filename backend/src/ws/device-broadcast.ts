/**
 * Device-specific WebSocket broadcast helpers with change detection
 */

import { broadcast } from './broadcast';
import type { RoborockStatus } from '../roborock/roborock';
import type { YamahaSoundbarStatus } from '../yamaha/yamaha-types';

// Cache for change detection
const lastStatus = new Map<string, string>();

/**
 * Broadcast only if data changed from last broadcast
 */
function broadcastIfChanged(key: string, data: object): boolean {
  const json = JSON.stringify(data);
  if (lastStatus.get(key) === json) return false;
  lastStatus.set(key, json);
  broadcast(data);
  return true;
}

/**
 * Clear cached status (use when device goes offline)
 */
function clearCachedStatus(key: string): void {
  lastStatus.delete(key);
}

// Tuya devices (sensors, heaters, doors)
export function broadcastTuyaStatus(deviceId: string, category: string, status: Record<string, unknown>): boolean {
  return broadcastIfChanged(`tuya:${deviceId}`, { type: 'tuya_status', deviceId, category, status });
}

export function broadcastTuyaOffline(deviceId: string): void {
  broadcast({ type: 'tuya_offline', deviceId });
  clearCachedStatus(`tuya:${deviceId}`);
}

// Roborock vacuum
export function broadcastRoborockStatus(status: RoborockStatus): boolean {
  return broadcastIfChanged('roborock', { type: 'roborock_status', status });
}

// Yamaha soundbar
export function broadcastYamahaStatus(deviceId: string, status: YamahaSoundbarStatus, online: boolean): boolean {
  return broadcastIfChanged(`yamaha:${deviceId}`, { type: 'yamaha_status', deviceId, status, online });
}

export function broadcastYamahaOffline(deviceId: string): void {
  broadcast({ type: 'yamaha_status', deviceId, status: null, online: false });
  clearCachedStatus(`yamaha:${deviceId}`);
}

// Air Purifier
interface PurifierStatus {
  power: boolean;
  mode: string;
  aqi: number;
  filter_life: number;
  fan_speed?: number;
  motor_rpm?: number;
  led_brightness?: number; // 0-8 (0=off, 8=brightest)
}

export function broadcastPurifierStatus(status: PurifierStatus): boolean {
  return broadcastIfChanged('purifier', { type: 'purifier_status', status });
}
