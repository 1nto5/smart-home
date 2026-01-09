/**
 * Roborock vacuum control via Python HTTP bridge
 * Bridge runs on port 3002
 */

// In Docker, use service name; locally use localhost
const BRIDGE_URL = process.env.ROBOROCK_BRIDGE_URL || 'http://roborock:3002';

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
  try {
    const res = await fetch(`${BRIDGE_URL}/status`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error: any) {
    console.error('Roborock status error:', error.message);
    return null;
  }
}

/**
 * Send command to vacuum
 */
async function sendCommand(cmd: string): Promise<boolean> {
  try {
    const res = await fetch(`${BRIDGE_URL}/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cmd }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    console.log(`Roborock: ${cmd}`);
    return true;
  } catch (error: any) {
    console.error(`Roborock command ${cmd} error:`, error.message);
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
    const res = await fetch(`${BRIDGE_URL}/clean-summary`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error: any) {
    console.error('Roborock clean-summary error:', error.message);
    return null;
  }
}

/**
 * Get rooms list
 */
export async function getRooms(): Promise<RoomsResponse | null> {
  try {
    const res = await fetch(`${BRIDGE_URL}/rooms`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error: any) {
    console.error('Roborock rooms error:', error.message);
    return null;
  }
}

/**
 * Get volume
 */
export async function getVolume(): Promise<{ volume: number } | null> {
  try {
    const res = await fetch(`${BRIDGE_URL}/volume`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error: any) {
    console.error('Roborock volume error:', error.message);
    return null;
  }
}

/**
 * Set volume (0-100)
 */
export async function setVolume(volume: number): Promise<boolean> {
  try {
    const res = await fetch(`${BRIDGE_URL}/set-volume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ volume }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  } catch (error: any) {
    console.error('Roborock set-volume error:', error.message);
    return false;
  }
}

/**
 * Set fan speed mode (101=quiet, 102=balanced, 103=turbo, 104=max)
 */
export async function setFanSpeed(mode: number): Promise<boolean> {
  try {
    const res = await fetch(`${BRIDGE_URL}/set-fan-speed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  } catch (error: any) {
    console.error('Roborock set-fan-speed error:', error.message);
    return false;
  }
}

/**
 * Set mop intensity (200=off, 201=low, 202=medium, 203=high)
 */
export async function setMopMode(mode: number): Promise<boolean> {
  try {
    const res = await fetch(`${BRIDGE_URL}/set-mop-mode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  } catch (error: any) {
    console.error('Roborock set-mop-mode error:', error.message);
    return false;
  }
}

/**
 * Clean specific rooms by segment IDs
 */
export async function cleanSegments(segments: number[]): Promise<boolean> {
  try {
    const res = await fetch(`${BRIDGE_URL}/clean-segments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ segments }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  } catch (error: any) {
    console.error('Roborock clean-segments error:', error.message);
    return false;
  }
}

/**
 * Get consumables status
 */
export async function getConsumables(): Promise<Consumables | null> {
  try {
    const res = await fetch(`${BRIDGE_URL}/consumables`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error: any) {
    console.error('Roborock consumables error:', error.message);
    return null;
  }
}

/**
 * Reset consumable timer
 */
export async function resetConsumable(consumable: string): Promise<boolean> {
  try {
    const res = await fetch(`${BRIDGE_URL}/reset-consumable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consumable }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  } catch (error: any) {
    console.error('Roborock reset-consumable error:', error.message);
    return false;
  }
}
