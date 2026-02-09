import type { Lamp, LampStatus, RoborockStatus, Preset, LampPreset, Schedule, PendingAction, ApplyResult, TuyaDevice, YamahaDevice, YamahaStatus, AirPurifierStatus, HeaterPreset, HeaterPresetDevice, HeaterSchedule, PendingHeaterAction, HeaterOverride, HomeStatusData, Automation, AutomationLog } from './types';
import { AUTH_TOKEN } from './config';

// Use relative URL so it works through nginx proxy
const API_BASE = '/api';

async function fetcher<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  // Add auth header if token is configured
  if (AUTH_TOKEN) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${AUTH_TOKEN}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
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

export async function discoverLampIp(deviceId?: string): Promise<{
  success: boolean;
  discovered: number;
  updates: Array<{ id: string; name: string; old_ip: string; new_ip: string }>;
  message: string;
}> {
  return fetcher('/xiaomi/discover', {
    method: 'POST',
    body: JSON.stringify(deviceId ? { device_id: deviceId } : {}),
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

export async function updateLampPreset(
  id: string,
  brightness: number,
  color_temp: number,
  power: boolean
): Promise<LampPreset> {
  return fetcher(`/presets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ brightness, color_temp, power }),
  });
}

export async function createLampPreset(
  id: string,
  name: string,
  brightness: number,
  color_temp: number,
  power: boolean
): Promise<LampPreset> {
  return fetcher('/presets', {
    method: 'POST',
    body: JSON.stringify({ id, name, brightness, color_temp, power }),
  });
}

export async function deleteLampPreset(id: string): Promise<{ success: boolean }> {
  return fetcher(`/presets/${id}`, { method: 'DELETE' });
}

// Schedules
export async function getSchedules(): Promise<Schedule[]> {
  return fetcher('/presets/schedules/list');
}

export async function createSchedule(name: string, preset: string, time: string): Promise<Schedule> {
  return fetcher('/presets/schedules', {
    method: 'POST',
    body: JSON.stringify({ name, preset, time }),
  });
}

export async function deleteSchedule(id: number): Promise<{ success: boolean }> {
  return fetcher(`/presets/schedules/${id}`, { method: 'DELETE' });
}

export async function toggleSchedule(id: number): Promise<Schedule> {
  return fetcher(`/presets/schedules/${id}/toggle`, { method: 'PATCH' });
}

export async function updateSchedule(
  id: number,
  updates: { name?: string; preset?: string; time?: string }
): Promise<Schedule> {
  return fetcher(`/presets/schedules/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

// Pending Actions
export async function getPendingActions(): Promise<PendingAction[]> {
  return fetcher('/presets/pending-actions');
}

export async function clearPendingActions(): Promise<{ success: boolean }> {
  return fetcher('/presets/pending-actions', { method: 'DELETE' });
}

// Tuya devices
export async function getTuyaDevices(): Promise<TuyaDevice[]> {
  return fetcher('/devices');
}

export async function getTuyaDeviceStatus(id: string): Promise<{ device_id: string; status: Record<string, unknown> }> {
  return fetcher(`/devices/${id}/status`);
}

export async function controlTuyaDevice(
  id: string,
  dps: number,
  value: unknown
): Promise<{ success: boolean }> {
  return fetcher(`/devices/${id}/control`, {
    method: 'POST',
    body: JSON.stringify({ dps, value }),
  });
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
  cmd: { power?: boolean; mode?: string; fan_speed?: number; led_brightness?: number }
): Promise<{ success: boolean }> {
  return fetcher('/purifier/control', {
    method: 'POST',
    body: JSON.stringify(cmd),
  });
}

// Heater presets
export async function getHeaterPresets(): Promise<HeaterPreset[]> {
  return fetcher('/heater/presets');
}

export async function updateHeaterPreset(id: string, target_temp: number): Promise<HeaterPreset> {
  return fetcher(`/heater/presets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ target_temp }),
  });
}

export async function applyHeaterPreset(id: string): Promise<ApplyResult> {
  return fetcher(`/heater/presets/${id}/apply`, { method: 'POST' });
}

export async function createHeaterPreset(id: string, name: string, target_temp: number): Promise<HeaterPreset> {
  return fetcher('/heater/presets', {
    method: 'POST',
    body: JSON.stringify({ id, name, target_temp }),
  });
}

export async function deleteHeaterPreset(id: string): Promise<{ success: boolean }> {
  return fetcher(`/heater/presets/${id}`, { method: 'DELETE' });
}

// Per-device heater preset temps
export async function getPresetDeviceTemps(presetId: string): Promise<HeaterPresetDevice[]> {
  return fetcher(`/heater/presets/${presetId}/devices`);
}

export async function setPresetDeviceTemp(
  presetId: string,
  deviceId: string,
  target_temp: number
): Promise<HeaterPresetDevice> {
  return fetcher(`/heater/presets/${presetId}/devices`, {
    method: 'POST',
    body: JSON.stringify({ device_id: deviceId, target_temp }),
  });
}

export async function deletePresetDeviceTemp(
  presetId: string,
  deviceId: string
): Promise<{ success: boolean }> {
  return fetcher(`/heater/presets/${presetId}/devices/${deviceId}`, { method: 'DELETE' });
}

// Heater schedules
export async function getHeaterSchedules(): Promise<HeaterSchedule[]> {
  return fetcher('/heater/schedules');
}

export async function createHeaterSchedule(name: string, preset_id: string, time: string): Promise<HeaterSchedule> {
  return fetcher('/heater/schedules', {
    method: 'POST',
    body: JSON.stringify({ name, preset_id, time }),
  });
}

export async function deleteHeaterSchedule(id: number): Promise<{ success: boolean }> {
  return fetcher(`/heater/schedules/${id}`, { method: 'DELETE' });
}

export async function toggleHeaterSchedule(id: number): Promise<HeaterSchedule> {
  return fetcher(`/heater/schedules/${id}/toggle`, { method: 'PATCH' });
}

export async function updateHeaterSchedule(
  id: number,
  updates: { name?: string; preset_id?: string; time?: string }
): Promise<HeaterSchedule> {
  return fetcher(`/heater/schedules/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

// Pending heater actions
export async function getPendingHeaterActions(): Promise<PendingHeaterAction[]> {
  return fetcher('/heater/pending-actions');
}

export async function clearPendingHeaterActions(): Promise<{ success: boolean }> {
  return fetcher('/heater/pending-actions', { method: 'DELETE' });
}

// Heater override (vacation/pause mode)
export async function getHeaterOverride(): Promise<HeaterOverride> {
  return fetcher('/heater/override');
}

export async function setHeaterOverride(
  enabled: boolean,
  mode: 'pause' | 'fixed',
  fixed_temp?: number
): Promise<HeaterOverride> {
  return fetcher('/heater/override', {
    method: 'POST',
    body: JSON.stringify({ enabled, mode, fixed_temp }),
  });
}

// Alarm system
export interface AlarmStatus {
  armed: boolean;
  updated_at: string;
}

export async function getAlarmStatus(): Promise<AlarmStatus> {
  return fetcher('/alarm');
}

export async function armAlarm(): Promise<AlarmStatus> {
  return fetcher('/alarm/arm', { method: 'POST' });
}

export async function disarmAlarm(): Promise<AlarmStatus> {
  return fetcher('/alarm/disarm', { method: 'POST' });
}

// Home status
export async function getHomeStatus(): Promise<HomeStatusData> {
  return fetcher('/home-status');
}

// Automations
export async function getAutomations(): Promise<Automation[]> {
  return fetcher('/automations');
}

export async function getAutomation(id: number): Promise<Automation> {
  return fetcher(`/automations/${id}`);
}

export async function createAutomation(automation: Omit<Automation, 'id' | 'created_at'>): Promise<Automation> {
  return fetcher('/automations', {
    method: 'POST',
    body: JSON.stringify(automation),
  });
}

export async function updateAutomation(
  id: number,
  updates: Partial<Omit<Automation, 'id' | 'created_at'>>
): Promise<Automation> {
  return fetcher(`/automations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export async function deleteAutomation(id: number): Promise<{ success: boolean }> {
  return fetcher(`/automations/${id}`, { method: 'DELETE' });
}

export async function toggleAutomation(id: number): Promise<Automation> {
  return fetcher(`/automations/${id}/toggle`, { method: 'PATCH' });
}

export async function getAutomationLog(limit?: number): Promise<AutomationLog[]> {
  return fetcher(`/automations/log${limit ? `?limit=${limit}` : ''}`);
}
