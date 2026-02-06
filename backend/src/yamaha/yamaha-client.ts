/**
 * Yamaha Extended Control (YXC) API client
 * HTTP-based local control for MusicCast devices
 */

import type { YamahaDeviceInfo, YamahaMainStatus } from './yamaha-types';
import { getErrorMessage } from '../utils/errors';

const YXC_BASE = '/YamahaExtendedControl/v1';

export class YamahaClient {
  private ip: string;
  private timeout: number;

  constructor(ip: string, timeout = 5000) {
    this.ip = ip;
    this.timeout = timeout;
  }

  private async request<T>(path: string): Promise<T | null> {
    try {
      const url = `http://${this.ip}${YXC_BASE}${path}`;
      const response = await fetch(url, {
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        console.error(`YXC request failed: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json() as T & { response_code: number };

      // YXC returns response_code 0 for success
      if (data.response_code !== 0) {
        console.error(`YXC error response: ${data.response_code}`);
        return null;
      }

      return data;
    } catch (error: unknown) {
      console.error(`YXC request error (${path}):`, getErrorMessage(error));
      return null;
    }
  }

  // System endpoints
  async getDeviceInfo(): Promise<YamahaDeviceInfo | null> {
    return this.request<YamahaDeviceInfo>('/system/getDeviceInfo');
  }

  // Main zone endpoints
  async getStatus(): Promise<YamahaMainStatus | null> {
    return this.request<YamahaMainStatus>('/main/getStatus');
  }

  async setPower(power: 'on' | 'standby'): Promise<boolean> {
    const result = await this.request(`/main/setPower?power=${power}`);
    return result !== null;
  }

  async setVolume(volume: number): Promise<boolean> {
    const clamped = Math.max(0, Math.min(100, Math.round(volume)));
    const result = await this.request(`/main/setVolume?volume=${clamped}`);
    return result !== null;
  }

  async setMute(enable: boolean): Promise<boolean> {
    const result = await this.request(`/main/setMute?enable=${enable}`);
    return result !== null;
  }

  async setInput(input: string): Promise<boolean> {
    const result = await this.request(`/main/setInput?input=${input}`);
    return result !== null;
  }

  async setSoundProgram(program: string): Promise<boolean> {
    const result = await this.request(`/main/setSoundProgram?program=${program}`);
    return result !== null;
  }

  async setClearVoice(enable: boolean): Promise<boolean> {
    const result = await this.request(`/main/setClearVoice?enable=${enable}`);
    return result !== null;
  }

  async setBassExtension(enable: boolean): Promise<boolean> {
    const result = await this.request(`/main/setBassExtension?enable=${enable}`);
    return result !== null;
  }

  async setSubwooferVolume(volume: number): Promise<boolean> {
    // Subwoofer volume range is typically -6 to +6
    const clamped = Math.max(-6, Math.min(6, Math.round(volume)));
    const result = await this.request(`/main/setSubwooferVolume?volume=${clamped}`);
    return result !== null;
  }

  // Convenience methods
  async powerOn(): Promise<boolean> {
    return this.setPower('on');
  }

  async powerOff(): Promise<boolean> {
    return this.setPower('standby');
  }

  async volumeUp(step = 1): Promise<boolean> {
    const status = await this.getStatus();
    if (!status) return false;
    return this.setVolume(status.volume + step);
  }

  async volumeDown(step = 1): Promise<boolean> {
    const status = await this.getStatus();
    if (!status) return false;
    return this.setVolume(status.volume - step);
  }

  async toggleMute(): Promise<boolean> {
    const status = await this.getStatus();
    if (!status) return false;
    return this.setMute(!status.mute);
  }
}
