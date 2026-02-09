/**
 * Compute home status summary for broadcasting and API responses
 */

import { getDb, getHomeStatus } from './database';
import { getLampPresets, getHeaterPresets, getHeaterOverride } from '../scheduling';

export interface ComputedHomeStatus {
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
    override: ReturnType<typeof getHeaterOverride> | null;
  };
}

export function computeHomeStatus(): ComputedHomeStatus {
  const db = getDb();
  const status = getHomeStatus();

  const weatherSensor = db.query(`
    SELECT last_status FROM devices WHERE category = 'wsdcg' LIMIT 1
  `).get() as { last_status: string | null } | null;

  let weather: ComputedHomeStatus['weather'] = null;
  if (weatherSensor?.last_status) {
    try {
      const parsed = JSON.parse(weatherSensor.last_status);
      weather = {
        temperature: parsed['103'] !== undefined ? parsed['103'] / 100 : null,
        humidity: parsed['101'] !== undefined ? parsed['101'] / 100 : null,
        battery: parsed['102'] ?? null,
      };
    } catch {
      // Ignore parse errors
    }
  }

  const override = getHeaterOverride();

  const heaters = db.query(`
    SELECT last_status FROM devices WHERE category = 'wkf' AND online = 1
  `).all() as { last_status: string | null }[];

  let heaterAvgTemp: number | null = null;
  const temps: number[] = [];
  for (const h of heaters) {
    if (h.last_status) {
      try {
        const parsed = JSON.parse(h.last_status);
        if (parsed['5'] !== undefined) {
          temps.push(parsed['5'] / 10);
        }
      } catch {
        // Ignore parse errors
      }
    }
  }
  if (temps.length > 0) {
    heaterAvgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
  }

  const lampPreset = status.lamp_preset ? getLampPresets().find(p => p.id === status.lamp_preset) : null;
  const heaterPreset = status.heater_preset ? getHeaterPresets().find(p => p.id === status.heater_preset) : null;

  return {
    weather,
    lamp: {
      preset_id: status.lamp_preset,
      preset_name: lampPreset?.name ?? null,
    },
    heater: {
      preset_id: status.heater_preset,
      preset_name: heaterPreset?.name ?? null,
      avg_temp: heaterAvgTemp !== null ? Math.round(heaterAvgTemp * 10) / 10 : null,
      override: override.enabled ? override : null,
    },
  };
}
