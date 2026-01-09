import type { Lamp, LampStatus, RoborockStatus, Preset, Schedule, PendingAction, ApplyResult, TuyaDevice, YamahaDevice, YamahaStatus, AirPurifierStatus } from './types';

// Use relative URL so it works through nginx proxy
const API_BASE = '/api';

async function fetcher<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

// Lamps
export async function getLamps(): Promise<Lamp[]> {
  return fetcher('/xiaomi');
}

export async function getLampStatus(id: string): Promise<{ device_id: string; status: LampStatus }> {
  return fetcher(`/xiaomi/${id}/status`);
}

export async function controlLamp(
  id: string,
  cmd: { power?: boolean; brightness?: number; color_temp?: number; toggle?: boolean; moonlight?: boolean; moonlight_brightness?: number }
): Promise<{ success: boolean }> {
  return fetcher(`/xiaomi/${id}/control`, {
    method: 'POST',
    body: JSON.stringify(cmd),
  });
}

// Roborock
export async function getRoborockStatus(): Promise<RoborockStatus> {
  return fetcher('/roborock/status');
}

export async function sendRoborockCommand(cmd: string): Promise<{ success: boolean }> {
  return fetcher('/roborock/command', {
    method: 'POST',
    body: JSON.stringify({ cmd }),
  });
}

export async function getRoborockRooms(): Promise<{ rooms: { segmentId: number; iotId: string; name: string }[] }> {
  return fetcher('/roborock/rooms');
}

export async function getRoborockVolume(): Promise<{ volume: number }> {
  return fetcher('/roborock/volume');
}

export async function setRoborockVolume(volume: number): Promise<{ success: boolean }> {
  return fetcher('/roborock/volume', {
    method: 'POST',
    body: JSON.stringify({ volume }),
  });
}

export async function setRoborockFanSpeed(mode: number): Promise<{ success: boolean }> {
  return fetcher('/roborock/fan-speed', {
    method: 'POST',
    body: JSON.stringify({ mode }),
  });
}

export async function setRoborockMopMode(mode: number): Promise<{ success: boolean }> {
  return fetcher('/roborock/mop-mode', {
    method: 'POST',
    body: JSON.stringify({ mode }),
  });
}

export async function cleanRoborockSegments(segments: number[]): Promise<{ success: boolean }> {
  return fetcher('/roborock/clean-segments', {
    method: 'POST',
    body: JSON.stringify({ segments }),
  });
}

export async function getRoborockConsumables(): Promise<{
  mainBrushWorkTime: number;
  sideBrushWorkTime: number;
  filterWorkTime: number;
  sensorDirtyTime: number;
}> {
  return fetcher('/roborock/consumables');
}

export async function resetRoborockConsumable(consumable: string): Promise<{ success: boolean }> {
  return fetcher('/roborock/reset-consumable', {
    method: 'POST',
    body: JSON.stringify({ consumable }),
  });
}

// Presets
export async function getPresets(): Promise<Record<string, Preset>> {
  return fetcher('/presets');
}

export async function applyPreset(name: string): Promise<ApplyResult> {
  return fetcher(`/presets/${name}/apply`, { method: 'POST' });
}

// Schedules
export async function getSchedules(): Promise<Schedule[]> {
  return fetcher('/schedules');
}

export async function createSchedule(name: string, preset: string, time: string): Promise<Schedule> {
  return fetcher('/schedules', {
    method: 'POST',
    body: JSON.stringify({ name, preset, time }),
  });
}

export async function deleteSchedule(id: number): Promise<{ success: boolean }> {
  return fetcher(`/schedules/${id}`, { method: 'DELETE' });
}

export async function toggleSchedule(id: number): Promise<Schedule> {
  return fetcher(`/schedules/${id}/toggle`, { method: 'PATCH' });
}

// Pending Actions
export async function getPendingActions(): Promise<PendingAction[]> {
  return fetcher('/pending-actions');
}

export async function clearPendingActions(): Promise<{ success: boolean }> {
  return fetcher('/pending-actions', { method: 'DELETE' });
}

// Tuya devices
export async function getTuyaDevices(): Promise<TuyaDevice[]> {
  return fetcher('/devices');
}

export async function getTuyaDeviceStatus(id: string): Promise<{ device_id: string; status: Record<string, any> }> {
  return fetcher(`/devices/${id}/status`);
}

// Yamaha devices
export async function getYamahaDevices(): Promise<YamahaDevice[]> {
  return fetcher('/yamaha');
}

export async function getYamahaStatus(id: string): Promise<{ device_id: string; status: YamahaStatus }> {
  return fetcher(`/yamaha/${id}/status`);
}

export async function controlYamaha(
  id: string,
  cmd: {
    power?: boolean;
    volume?: number;
    mute?: boolean;
    input?: string;
    sound_program?: string;
    clear_voice?: boolean;
    bass_extension?: boolean;
    subwoofer_volume?: number;
  }
): Promise<{ success: boolean }> {
  return fetcher(`/yamaha/${id}/control`, {
    method: 'POST',
    body: JSON.stringify(cmd),
  });
}

// Air Purifier
export async function getAirPurifierStatus(): Promise<AirPurifierStatus> {
  return fetcher('/purifier/status');
}

export async function controlAirPurifier(
  cmd: { power?: boolean; mode?: string; fan_speed?: number }
): Promise<{ success: boolean }> {
  return fetcher('/purifier/control', {
    method: 'POST',
    body: JSON.stringify(cmd),
  });
}
