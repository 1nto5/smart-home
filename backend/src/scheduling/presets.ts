/**
 * Hardcoded lamp presets
 */

export const LAMP_PRESETS = {
  day: {
    name: 'Day Mode',
    brightness: 100,
    colorTemp: 5000, // Cool white
    power: true,
    moonlight: false,
  },
  night: {
    name: 'Night Mode',
    brightness: 30,
    colorTemp: 2700, // Warm white
    power: true,
    moonlight: false,
  },
  moonlight: {
    name: 'Moonlight',
    brightness: 10, // Moonlight brightness
    colorTemp: 2700,
    power: true,
    moonlight: true, // Triggers hardware night light mode
  },
  off: {
    name: 'All Off',
    brightness: 0,
    colorTemp: 4000,
    power: false,
    moonlight: false,
  },
} as const;

export type PresetName = keyof typeof LAMP_PRESETS;

export function isValidPreset(name: string): name is PresetName {
  return name in LAMP_PRESETS;
}
