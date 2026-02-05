/**
 * Device DPS mappings for Tuya local control
 */

export interface DpsMapping {
  dps: number;
  name: string;
  type: 'number' | 'string' | 'boolean';
  scale?: number; // divide by this to get real value (e.g., 10 for temp)
  unit?: string;
  readonly?: boolean;
}

export interface DeviceConfig {
  category: string;
  name: string;
  dps: DpsMapping[];
  batteryPowered?: boolean;
}

export const deviceConfigs: Record<string, DeviceConfig> = {
  // TRV - Thermostatic Radiator Valve
  wkf: {
    category: 'wkf',
    name: 'TRV',
    dps: [
      { dps: 1, name: 'switch', type: 'boolean' }, // power on/off
      { dps: 2, name: 'mode', type: 'string' }, // "manual", "schedule"
      { dps: 3, name: 'valve', type: 'string' }, // "opened", "closed"
      { dps: 4, name: 'target_temp', type: 'number', scale: 10, unit: '°C' },
      { dps: 5, name: 'current_temp', type: 'number', scale: 10, unit: '°C', readonly: true },
      { dps: 7, name: 'child_lock', type: 'boolean' },
      { dps: 35, name: 'battery', type: 'number', unit: '%', readonly: true },
      { dps: 36, name: 'window_detection', type: 'boolean' },
      { dps: 39, name: 'frost_protection', type: 'boolean' },
      { dps: 47, name: 'calibration', type: 'number', scale: 10 },
    ],
  },

  // Door/Window sensor (Zigbee uses dps 101-103)
  mcs: {
    category: 'mcs',
    name: 'Door Sensor',
    batteryPowered: true,
    dps: [
      { dps: 101, name: 'contact', type: 'boolean', readonly: true }, // false=open, true=closed
      { dps: 103, name: 'battery', type: 'number', unit: '%', readonly: true },
    ],
  },

  // Water leak sensor
  sj: {
    category: 'sj',
    name: 'Water Sensor',
    batteryPowered: true,
    dps: [
      { dps: 1, name: 'leak', type: 'string', readonly: true }, // "2"=no leak
      { dps: 4, name: 'battery', type: 'number', unit: '%', readonly: true },
    ],
  },

  // Weather station (Zigbee uses dps 101-103)
  wsdcg: {
    category: 'wsdcg',
    name: 'Weather Station',
    batteryPowered: true,
    dps: [
      { dps: 101, name: 'humidity', type: 'number', scale: 100, unit: '%', readonly: true },
      { dps: 102, name: 'battery', type: 'number', unit: '%', readonly: true },
      { dps: 103, name: 'temperature', type: 'number', scale: 100, unit: '°C', readonly: true },
    ],
  },

  // Zigbee Gateway
  wfcon: {
    category: 'wfcon',
    name: 'Gateway',
    dps: [
      { dps: 1, name: 'switch', type: 'boolean' },
    ],
  },
};

/**
 * Get device config by category
 */
export function getDeviceConfig(category: string): DeviceConfig | null {
  return deviceConfigs[category] || null;
}

/**
 * Parse DPS values to human-readable format
 */
export function parseDps(category: string, dps: Record<string, any>): Record<string, any> {
  const config = getDeviceConfig(category);
  if (!config) return dps;

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(dps)) {
    const mapping = config.dps.find(m => m.dps === parseInt(key));
    if (mapping) {
      let parsedValue = value;
      if (mapping.scale && typeof value === 'number') {
        parsedValue = value / mapping.scale;
      }
      result[mapping.name] = {
        value: parsedValue,
        unit: mapping.unit,
        readonly: mapping.readonly,
      };
    } else {
      result[`dps_${key}`] = value;
    }
  }
  return result;
}
