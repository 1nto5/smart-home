export interface Lamp {
  id: string;
  name: string;
  ip: string;
  model: string;
  room: string | null;
  online: number;
  last_status: string | null;
}

export interface LampStatus {
  power: boolean;
  brightness: number;
  color_temp: number;
  color_mode: number;
  rgb: number;
  moonlight_mode?: boolean;
  moonlight_brightness?: number;
}

export interface RoborockStatus {
  state: number;
  battery: number;
  fanPower: number;
  errorCode: number;
  cleanTime: number;
  cleanArea: number;
  waterBoxStatus?: number;
  waterBoxMode?: number;
  mopMode?: number;
  chargeStatus?: number;
}

export interface Preset {
  name: string;
  brightness: number;
  colorTemp: number;
  power: boolean;
}

export interface LampPreset {
  id: string;
  name: string;
  brightness: number;
  color_temp: number;
  power: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Schedule {
  id: number;
  name: string;
  preset: string;
  time: string;
  enabled: number;
  created_at: string;
  updated_at: string;
}

export interface PendingAction {
  id: number;
  device_id: string;
  preset: string;
  schedule_id: number | null;
  retry_count: number;
  created_at: string;
}

export interface ApplyResult {
  success: string[];
  pending: string[];
  failed: string[];
}

// Tuya devices
export interface TuyaDevice {
  id: string;
  name: string;
  category: string;
  online: number;
  ip: string | null;
  room: string | null;
  last_status: string | null;
}

// Category types: sj=water sensor, mcs=door/window, wkf=TRV, wsdcg=weather station
export interface TuyaSensorStatus {
  battery?: number;
  waterLeak?: boolean;
  doorOpen?: boolean;
  temperature?: number;
  humidity?: number;
}

// Yamaha soundbar
export interface YamahaDevice {
  id: string;
  name: string;
  ip: string;
  model: string;
  room: string | null;
  online: number;
  last_status: string | null;
}

export interface YamahaStatus {
  power: 'on' | 'standby';
  volume: number;
  mute: boolean;
  input: string;
  sound_program: string;
  clear_voice?: boolean;
  bass_extension?: boolean;
  subwoofer_volume?: number;
}

// Air Purifier
export interface AirPurifierStatus {
  power: boolean;
  mode: string;
  aqi: number;
  humidity?: number;
  temperature?: number;
  filter_life?: number;
  fan_speed?: number;
  led_brightness?: number; // 0-8 (0=off, 8=brightest)
}

// Heater presets and schedules
export interface HeaterPreset {
  id: string;
  name: string;
  target_temp: number;
  created_at?: string;
  updated_at?: string;
}

export interface HeaterPresetDevice {
  preset_id: string;
  device_id: string;
  target_temp: number;
}

export interface HeaterSchedule {
  id: number;
  name: string;
  preset_id: string;
  time: string;
  enabled: number;
  created_at: string;
  updated_at: string;
}

export interface PendingHeaterAction {
  id: number;
  device_id: string;
  preset_id: string;
  schedule_id: number | null;
  retry_count: number;
  created_at: string;
}

export interface HeaterOverride {
  id: number;
  enabled: boolean;
  mode: 'pause' | 'fixed';
  fixed_temp: number;
  updated_at: string;
}

// Home status summary
export interface HomeStatusData {
  weather: {
    temperature: number | null;
    humidity: number | null;
    battery: number | null;
  } | null;
  lamp: {
    preset_id: string | null;
    preset_name: string | null;
  };
  heater: {
    preset_id: string | null;
    preset_name: string | null;
    avg_temp: number | null;
    override: HeaterOverride | null;
  };
}

// Automations
export interface AutomationAction {
  type: string;
  target?: string;
  value?: string;
}

export interface QuietWindow {
  start: string;
  end: string;
}

export interface Automation {
  id: number;
  name: string;
  enabled: number;
  trigger_type: string;
  trigger_device_id: string | null;
  trigger_condition: string;
  actions: string; // JSON array of AutomationAction
  telegram_prompt: string | null;
  telegram_action_yes: string | null;
  quiet_windows: string | null; // JSON array of QuietWindow
  created_at: string;
}

export interface AutomationLog {
  id: number;
  automation_name: string;
  trigger_device_name: string | null;
  action_executed: string;
  result: string;
  executed_at: string;
}

// WebSocket message types (discriminated union)
export type WsMessage =
  | { type: 'lamp_status'; deviceId: string; status: LampStatus }
  | { type: 'lamp_offline'; deviceId: string }
  | { type: 'tuya_status'; deviceId: string; category: string; status: Record<string, unknown> }
  | { type: 'tuya_offline'; deviceId: string }
  | { type: 'roborock_status'; status: RoborockStatus }
  | { type: 'yamaha_status'; deviceId: string; status: YamahaStatus | null; online: boolean }
  | { type: 'purifier_status'; status: AirPurifierStatus }
  | { type: 'home_status'; status: HomeStatusData }
  | { type: 'pending_actions'; actions: PendingAction[] }
  | { type: 'pending_heater_actions'; actions: PendingHeaterAction[] }
  | { type: 'schedules_changed'; schedules: Schedule[] }
  | { type: 'heater_schedules_changed'; schedules: HeaterSchedule[] }
  | { type: 'heater_presets_changed'; presets: HeaterPreset[] }
  | { type: 'heater_override_changed'; override: HeaterOverride }
  | { type: 'full_state_snapshot'; lamps: Lamp[]; tuyaDevices: TuyaDevice[]; yamahaDevices: YamahaDevice[]; roborock: RoborockStatus | null; airPurifier: AirPurifierStatus | null; schedules: Schedule[]; pendingActions: PendingAction[]; heaterPresets: HeaterPreset[]; heaterSchedules: HeaterSchedule[]; pendingHeaterActions: PendingHeaterAction[]; heaterOverride: HeaterOverride | null; homeStatus: HomeStatusData | null };
