/**
 * Yamaha device types for YXC (Extended Control) API
 */

export interface YamahaDevice {
  id: string;
  name: string;
  ip: string;
  model: string | null;
  room: string | null;
  online: number;
  last_status: string | null;
  created_at: string;
  updated_at: string;
}

export interface YamahaDeviceInfo {
  response_code: number;
  model_name: string;
  destination: string;
  device_id: string;
  system_version: string;
  api_version: number;
  netmodule_version: string;
}

export interface YamahaSoundbarStatus {
  power: 'on' | 'standby';
  volume: number;
  mute: boolean;
  input: string;
  sound_program: string;
  clear_voice?: boolean;
  bass_extension?: boolean;
  subwoofer_volume?: number;
}

export interface YamahaMainStatus {
  response_code: number;
  power: 'on' | 'standby';
  volume: number;
  mute: boolean;
  input: string;
  sound_program?: string;
  clear_voice?: boolean;
  bass_extension?: boolean;
  subwoofer_volume?: number;
  actual_volume?: {
    mode: string;
    value: number;
  };
}

export type YamahaInput = 'optical1' | 'optical2' | 'coaxial' | 'hdmi' | 'bluetooth' | 'analog' | 'tv' | 'net_radio' | 'usb';

export type YamahaSoundProgram = 'movie' | 'music' | 'sports' | 'game' | 'stereo' | '3d_surround' | 'tv_program';
