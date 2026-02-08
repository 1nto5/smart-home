/**
 * Roborock vacuum control via Python HTTP bridge
 * Bridge runs on port 3002
 */

import { broadcastRoborockStatus } from '../ws/device-broadcast';
import { config } from '../config';
import { deviceCircuits, CircuitOpenError } from '../utils/circuit-breaker';
import { getErrorMessage } from '../utils/errors';
import { fetchWithTimeout, TIMEOUTS } from '../utils/fetch-timeout';

// In Docker, use service name; locally use localhost
const BRIDGE_URL = config.roborock.bridgeUrl;

export interface RoborockStatus {
  state: string;
  battery: number;
  fan_power: number;
  error_code: number;
  clean_time: number;
  clean_area: number;
  water_box_status?: number;
  mop_mode?: number;
}

// Module-level cached status for instant API responses
let cachedRoborockStatus: RoborockStatus | null = null;

export function getCachedRoborockStatus(): RoborockStatus | null {
  return cachedRoborockStatus;
}

export interface CleanSummary {
  total_area: number;
  total_time: number;
  total_count: number;
}

export interface Room {
  segmentId: number;
  iotId: string;
  name: string;
}

export interface RoomsResponse {
  rooms: Room[];
}

export interface Consumables {
  mainBrushWorkTime: number;
  sideBrushWorkTime: number;
  filterWorkTime: number;
  filterElementWorkTime: number;
  sensorDirtyTime: number;
  dustCollectionWorkTimes: number;
}

/**
 * Get vacuum status
 */
export async function getStatus(): Promise<RoborockStatus | null> {
  const circuit = deviceCircuits.roborock();

  try {
    return await circuit.execute(async () => {
      const res = await fetchWithTimeout(`${BRIDGE_URL}/status`, {}, TIMEOUTS.ROBOROCK);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const status = await res.json() as RoborockStatus;
      cachedRoborockStatus = status;
      broadcastRoborockStatus(status);
      return status;
    });
  } catch (error: unknown) {
    if (error instanceof CircuitOpenError) {
      console.warn(`Circuit open for roborock: ${error.message}`);
    } else {
      console.error('Roborock status error:', getErrorMessage(error));
    }
    return null;
  }
}

/**
 * Send command to vacuum
 */
async function sendCommand(cmd: string): Promise<boolean> {
  const circuit = deviceCircuits.roborock();

  try {
    await circuit.execute(async () => {
      const res = await fetchWithTimeout(`${BRIDGE_URL}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cmd }),
      }, TIMEOUTS.ROBOROCK);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    });
    console.log(`Roborock: ${cmd}`);
    return true;
  } catch (error: unknown) {
    if (error instanceof CircuitOpenError) {
      console.warn(`Circuit open for roborock: ${error.message}`);
    } else {
      console.error(`Roborock command ${cmd} error:`, getErrorMessage(error));
    }
    return false;
  }
}

/**
 * Start cleaning
 */
export async function startCleaning(): Promise<boolean> {
  return sendCommand('start');
}

/**
 * Pause cleaning
 */
export async function pauseCleaning(): Promise<boolean> {
  return sendCommand('pause');
}

/**
 * Stop cleaning
 */
export async function stopCleaning(): Promise<boolean> {
  return sendCommand('stop');
}

/**
 * Go home to charge
 */
export async function goHome(): Promise<boolean> {
  return sendCommand('home');
}

/**
 * Find vacuum (make it speak)
 */
export async function findMe(): Promise<boolean> {
  return sendCommand('find');
}

/**
 * Get clean summary
 */
export async function getCleanSummary(): Promise<CleanSummary | null> {
  try {
    const res = await fetchWithTimeout(`${BRIDGE_URL}/clean-summary`, {}, TIMEOUTS.ROBOROCK);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json() as CleanSummary;
  } catch (error: unknown) {
    console.error('Roborock clean-summary error:', getErrorMessage(error));
    return null;
  }
}

/**
 * Get rooms list
 */
export async function getRooms(): Promise<RoomsResponse | null> {
  try {
    const res = await fetchWithTimeout(`${BRIDGE_URL}/rooms`, {}, TIMEOUTS.ROBOROCK);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json() as RoomsResponse;
  } catch (error: unknown) {
    console.error('Roborock rooms error:', getErrorMessage(error));
    return null;
  }
}

/**
 * Get volume
 */
export async function getVolume(): Promise<{ volume: number } | null> {
  try {
    const res = await fetchWithTimeout(`${BRIDGE_URL}/volume`, {}, TIMEOUTS.ROBOROCK);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json() as { volume: number };
  } catch (error: unknown) {
    console.error('Roborock volume error:', getErrorMessage(error));
    return null;
  }
}

/**
 * Set volume (0-100)
 */
export async function setVolume(volume: number): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(`${BRIDGE_URL}/set-volume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ volume }),
    }, TIMEOUTS.ROBOROCK);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  } catch (error: unknown) {
    console.error('Roborock set-volume error:', getErrorMessage(error));
    return false;
  }
}

/**
 * Set fan speed mode (101=quiet, 102=balanced, 103=turbo, 104=max)
 */
export async function setFanSpeed(mode: number): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(`${BRIDGE_URL}/set-fan-speed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode }),
    }, TIMEOUTS.ROBOROCK);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  } catch (error: unknown) {
    console.error('Roborock set-fan-speed error:', getErrorMessage(error));
    return false;
  }
}

/**
 * Set mop intensity (200=off, 201=low, 202=medium, 203=high)
 */
export async function setMopMode(mode: number): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(`${BRIDGE_URL}/set-mop-mode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode }),
    }, TIMEOUTS.ROBOROCK);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  } catch (error: unknown) {
    console.error('Roborock set-mop-mode error:', getErrorMessage(error));
    return false;
  }
}

/**
 * Clean specific rooms by segment IDs
 */
export async function cleanSegments(segments: number[]): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(`${BRIDGE_URL}/clean-segments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ segments }),
    }, TIMEOUTS.ROBOROCK);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  } catch (error: unknown) {
    console.error('Roborock clean-segments error:', getErrorMessage(error));
    return false;
  }
}

/**
 * Get consumables status
 */
export async function getConsumables(): Promise<Consumables | null> {
  try {
    const res = await fetchWithTimeout(`${BRIDGE_URL}/consumables`, {}, TIMEOUTS.ROBOROCK);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json() as Consumables;
  } catch (error: unknown) {
    console.error('Roborock consumables error:', getErrorMessage(error));
    return null;
  }
}

/**
 * Reset consumable timer
 */
export async function resetConsumable(consumable: string): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(`${BRIDGE_URL}/reset-consumable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consumable }),
    }, TIMEOUTS.ROBOROCK);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  } catch (error: unknown) {
    console.error('Roborock reset-consumable error:', getErrorMessage(error));
    return false;
  }
}
