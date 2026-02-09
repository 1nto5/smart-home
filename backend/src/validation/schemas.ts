import { z } from 'zod';

// === DEVICE SCHEMAS ===

export const DeviceUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  room: z.string().max(50).optional(),
  type: z.string().max(50).optional(),
});

export const DeviceControlSchema = z.union([
  // Direct DPS control
  z.object({
    dps: z.number().int().min(1),
    value: z.union([z.string(), z.number(), z.boolean()]),
  }),
  // Cloud command control
  z.object({
    commands: z.array(
      z.object({
        code: z.string(),
        value: z.union([z.string(), z.number(), z.boolean()]),
      })
    ).min(1),
  }),
]);

// === LAMP SCHEMAS ===

export const LampControlSchema = z.object({
  power: z.boolean().optional(),
  brightness: z.number().int().min(1).max(100).optional(),
  colorTemp: z.number().int().min(1700).max(6500).optional(),
  moonlight: z.boolean().optional(),
  daylightMode: z.boolean().optional(),
});

export const LampPresetSchema = z.object({
  id: z.string().min(1).max(50).regex(/^[a-z0-9_-]+$/i, 'ID must be alphanumeric with dashes/underscores'),
  name: z.string().min(1).max(100),
  brightness: z.number().int().min(0).max(100),
  color_temp: z.number().int().min(1700).max(6500),
  power: z.boolean().optional().default(true),
});

export const LampPresetUpdateSchema = z.object({
  brightness: z.number().int().min(0).max(100),
  color_temp: z.number().int().min(1700).max(6500),
  power: z.boolean().optional(),
});

// === SCHEDULE SCHEMAS ===

const TimeStringSchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:MM format');

export const LampScheduleSchema = z.object({
  name: z.string().min(1).max(100),
  preset: z.string().min(1).max(50),
  time: TimeStringSchema,
});

export const LampScheduleUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  preset: z.string().min(1).max(50).optional(),
  time: TimeStringSchema.optional(),
});

// === HEATER SCHEMAS ===

export const HeaterPresetSchema = z.object({
  id: z.string().min(1).max(50).regex(/^[a-z0-9_-]+$/i, 'ID must be alphanumeric with dashes/underscores'),
  name: z.string().min(1).max(100),
  target_temp: z.number().min(5).max(30),
});

export const HeaterPresetUpdateSchema = z.object({
  target_temp: z.number().min(5).max(30),
  name: z.string().min(1).max(100).optional(),
});

export const HeaterPresetDeviceTempSchema = z.object({
  device_id: z.string().min(1),
  target_temp: z.number().min(5).max(30),
});

export const HeaterScheduleSchema = z.object({
  name: z.string().min(1).max(100),
  preset_id: z.string().min(1).max(50),
  time: TimeStringSchema,
});

export const HeaterScheduleUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  preset_id: z.string().min(1).max(50).optional(),
  time: TimeStringSchema.optional(),
});

export const HeaterOverrideSchema = z.object({
  enabled: z.boolean(),
  mode: z.enum(['pause', 'fixed']).optional(),
  fixed_temp: z.number().min(5).max(30).optional(),
});

// === YAMAHA SCHEMAS ===

export const YamahaControlSchema = z.object({
  power: z.boolean().optional(),
  volume: z.number().int().min(0).max(100).optional(),
  mute: z.boolean().optional(),
  input: z.string().optional(),
  soundProgram: z.string().optional(),
  clearVoice: z.boolean().optional(),
  bassExtension: z.boolean().optional(),
  subwooferVolume: z.number().int().min(0).max(100).optional(),
});

// === ROBOROCK SCHEMAS ===

export const RoborockCommandSchema = z.object({
  cmd: z.enum(['start', 'pause', 'stop', 'home', 'find']),
});

export const RoborockVolumeSchema = z.object({
  volume: z.number().int().min(0).max(100),
});

export const RoborockFanSpeedSchema = z.object({
  mode: z.number().int().min(101).max(104),
});

export const RoborockMopModeSchema = z.object({
  mode: z.number().int().min(200).max(203),
});

export const RoborockCleanSegmentsSchema = z.object({
  segments: z.array(z.number().int().positive()).min(1).max(20),
  repeat: z.number().int().min(1).max(3).optional().default(1),
});

export const RoborockResetConsumableSchema = z.object({
  consumable: z.enum(['main_brush', 'side_brush', 'filter', 'sensor']),
});

// === AUTOMATION SCHEMAS ===

const _QuietWindowSchema = z.object({
  start: TimeStringSchema,
  end: TimeStringSchema,
});

export const AutomationSchema = z.object({
  name: z.string().min(1).max(100),
  enabled: z.number().int().min(0).max(1).default(1),
  trigger_type: z.enum(['device_state', 'schedule', 'sunrise', 'sunset']),
  trigger_device_id: z.string().nullable().default(null),
  trigger_condition: z.string().min(1),
  actions: z.string().min(2), // JSON string
  telegram_prompt: z.string().nullable().default(null),
  telegram_action_yes: z.string().nullable().default(null),
  quiet_windows: z.string().nullable().default(null), // JSON string
});

export const AutomationUpdateSchema = AutomationSchema.partial();

// === TELEGRAM SCHEMAS ===

export const TelegramConfigSchema = z.object({
  enabled: z.boolean().optional(),
  bot_token: z.string().nullable().optional(),
  chat_id: z.string().nullable().optional(),
  flood_alerts: z.boolean().optional(),
  door_alerts: z.boolean().optional(),
  error_alerts: z.boolean().optional(),
  cooldown_minutes: z.number().int().min(1).max(60).optional(),
});

export const TelegramTestSchema = z.object({
  message: z.string().min(1).max(1000).optional(),
});

// === AIR PURIFIER SCHEMAS ===

export const AirPurifierControlSchema = z.object({
  power: z.boolean().optional(),
  mode: z.enum(['auto', 'silent', 'favorite']).optional(),
  fan_speed: z.number().int().min(0).max(16).optional(),
  led_brightness: z.number().int().min(0).max(8).optional(),
});

// === DB MAINTENANCE SCHEMAS ===

export const CleanupConfigSchema = z.object({
  sensorHistoryDays: z.number().int().min(1).max(365).optional(),
  deviceHistoryDays: z.number().int().min(1).max(365).optional(),
  contactHistoryDays: z.number().int().min(1).max(365).optional(),
  telegramLogDays: z.number().int().min(1).max(365).optional(),
  automationLogDays: z.number().int().min(1).max(365).optional(),
});

// === WEBSOCKET SCHEMAS ===

export const WsMessageSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('request_snapshot') }),
]);

export type WsMessage = z.infer<typeof WsMessageSchema>;

// Type exports for use in route handlers
export type DeviceUpdate = z.infer<typeof DeviceUpdateSchema>;
export type DeviceControl = z.infer<typeof DeviceControlSchema>;
export type LampControl = z.infer<typeof LampControlSchema>;
export type LampPreset = z.infer<typeof LampPresetSchema>;
export type LampPresetUpdate = z.infer<typeof LampPresetUpdateSchema>;
export type LampSchedule = z.infer<typeof LampScheduleSchema>;
export type HeaterPreset = z.infer<typeof HeaterPresetSchema>;
export type HeaterOverride = z.infer<typeof HeaterOverrideSchema>;
export type YamahaControl = z.infer<typeof YamahaControlSchema>;
export type RoborockCommand = z.infer<typeof RoborockCommandSchema>;
export type Automation = z.infer<typeof AutomationSchema>;
export type TelegramConfig = z.infer<typeof TelegramConfigSchema>;
