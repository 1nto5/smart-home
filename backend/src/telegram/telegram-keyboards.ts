import { getAlarmConfig, getDb } from '../db/database';
import { getLampPresets, getHeaterPresets, getHeaterOverride } from '../scheduling';

type SensorReading = {
  temperature: number | null;
  humidity: number | null;
  battery: number | null;
  recorded_at: string;
};

type InlineKeyboard = { inline_keyboard: Array<Array<{ text: string; callback_data: string }>> };

/**
 * Main menu keyboard
 */
export async function mainMenuKeyboard(): Promise<{ text: string; keyboard: InlineKeyboard }> {
  const alarm = getAlarmConfig();
  const alarmStatus = alarm.armed ? '🔴 ARMED' : '🟢 Disarmed';

  const text = `🏠 <b>Smart Home Control</b>

Select a category:`;

  return {
    text,
    keyboard: {
      inline_keyboard: [
        [{ text: `🛡️ Alarm: ${alarmStatus}`, callback_data: 'menu:alarm' }],
        [{ text: '🤖 Vacuum', callback_data: 'menu:roborock' }],
        [{ text: '🔊 Soundbar', callback_data: 'menu:soundbar' }],
        [{ text: '💡 Lights', callback_data: 'menu:lamps' }],
        [{ text: '🔥 Heating', callback_data: 'menu:heaters' }],
        [{ text: '🌬️ Air Purifier', callback_data: 'menu:purifier' }],
        [{ text: '🌡️ Weather Station', callback_data: 'menu:weather' }],
        [{ text: '📊 Status', callback_data: 'status' }],
      ],
    },
  };
}

/**
 * Alarm control keyboard
 */
export function alarmKeyboard(): { text: string; keyboard: InlineKeyboard } {
  const alarm = getAlarmConfig();
  const status = alarm.armed ? '🔴 ARMED' : '🟢 Disarmed';

  const text = `🛡️ <b>Alarm System</b>

Status: <b>${status}</b>`;

  const buttons: Array<Array<{ text: string; callback_data: string }>> = [];

  if (alarm.armed) {
    buttons.push([{ text: '🔓 Disarm Alarm', callback_data: 'alarm:disarm' }]);
  } else {
    buttons.push([{ text: '🔐 Arm Alarm', callback_data: 'alarm:arm' }]);
  }

  buttons.push([{ text: '« Back to Menu', callback_data: 'menu:main' }]);

  return { text, keyboard: { inline_keyboard: buttons } };
}

/**
 * Lamps menu keyboard
 */
export function lampsKeyboard(): { text: string; keyboard: InlineKeyboard } {
  const presets = getLampPresets();

  const text = `💡 <b>Lighting Control</b>

Select a preset to apply to all lamps:`;

  const buttons: Array<Array<{ text: string; callback_data: string }>> = [];

  // Preset buttons (2 per row)
  const presetButtons = presets.map((p) => ({
    text: p.name,
    callback_data: `lamp:preset:${p.id}`,
  }));

  for (let i = 0; i < presetButtons.length; i += 2) {
    buttons.push(presetButtons.slice(i, i + 2));
  }

  // Individual lamp control
  buttons.push([{ text: '🔦 Individual Lamps', callback_data: 'lamp:list' }]);
  buttons.push([{ text: '« Back to Menu', callback_data: 'menu:main' }]);

  return { text, keyboard: { inline_keyboard: buttons } };
}

/**
 * Individual lamps list
 */
export function lampsListKeyboard(): { text: string; keyboard: InlineKeyboard } {
  const db = getDb();
  const lamps = db.query(`
    SELECT id, name, last_status
    FROM xiaomi_devices
    WHERE category = 'lamp'
    ORDER BY room, name
  `).all() as Array<{ id: string; name: string; last_status: string | null }>;

  const text = `💡 <b>Individual Lamps</b>

Toggle individual lamp power:`;

  const buttons: Array<Array<{ text: string; callback_data: string }>> = [];

  for (const lamp of lamps) {
    let isOn = false;
    if (lamp.last_status) {
      try {
        const status = JSON.parse(lamp.last_status);
        isOn = status.power === 'on' || status.power === true;
      } catch {}
    }
    const icon = isOn ? '🟢' : '⚫';
    buttons.push([{ text: `${icon} ${lamp.name}`, callback_data: `lamp:toggle:${lamp.id}` }]);
  }

  buttons.push([{ text: '« Back to Lights', callback_data: 'menu:lamps' }]);

  return { text, keyboard: { inline_keyboard: buttons } };
}

/**
 * Heaters menu keyboard
 */
export function heatersKeyboard(): { text: string; keyboard: InlineKeyboard } {
  const presets = getHeaterPresets();
  const override = getHeaterOverride();

  let overrideStatus = '✅ Normal';
  if (override.enabled) {
    overrideStatus = override.mode === 'pause' ? '⏸️ Paused' : `🌡️ Fixed ${override.fixed_temp}°C`;
  }

  const text = `🔥 <b>Heating Control</b>

Override: <b>${overrideStatus}</b>

Select a preset or control override:`;

  const buttons: Array<Array<{ text: string; callback_data: string }>> = [];

  // Preset buttons (2 per row)
  const presetButtons = presets.map((p) => ({
    text: `${p.name} (${p.target_temp}°C)`,
    callback_data: `heater:preset:${p.id}`,
  }));

  for (let i = 0; i < presetButtons.length; i += 2) {
    buttons.push(presetButtons.slice(i, i + 2));
  }

  // Override controls
  if (override.enabled) {
    buttons.push([{ text: '▶️ Disable Override', callback_data: 'heater:override:off' }]);
  } else {
    buttons.push([
      { text: '⏸️ Pause', callback_data: 'heater:override:pause' },
      { text: '🌡️ Fixed 18°C', callback_data: 'heater:override:fixed' },
    ]);
  }

  buttons.push([{ text: '« Back to Menu', callback_data: 'menu:main' }]);

  return { text, keyboard: { inline_keyboard: buttons } };
}

/**
 * Roborock menu keyboard
 */
export function roborockKeyboard(): { text: string; keyboard: InlineKeyboard } {
  const text = `🤖 <b>Vacuum Control</b>

Select an action:`;

  return {
    text,
    keyboard: {
      inline_keyboard: [
        [
          { text: '▶️ Start', callback_data: 'roborock:start' },
          { text: '⏸️ Pause', callback_data: 'roborock:pause' },
        ],
        [
          { text: '⏹️ Stop', callback_data: 'roborock:stop' },
          { text: '🏠 Home', callback_data: 'roborock:home' },
        ],
        [{ text: '📍 Find', callback_data: 'roborock:find' }],
        [{ text: '🏠 Clean Rooms', callback_data: 'roborock:rooms_menu' }],
        [{ text: '💨 Fan Speed', callback_data: 'roborock:fan_menu' }],
        [{ text: '💧 Mop Mode', callback_data: 'roborock:mop_menu' }],
        [{ text: '📊 Status', callback_data: 'roborock:status' }],
        [{ text: '« Back to Menu', callback_data: 'menu:main' }],
      ],
    },
  };
}

/**
 * Roborock fan speed menu
 */
export function roborockFanKeyboard(): { text: string; keyboard: InlineKeyboard } {
  const text = `🤖 <b>Vacuum - Fan Speed</b>

Select suction power:`;

  return {
    text,
    keyboard: {
      inline_keyboard: [
        [
          { text: '🔈 Quiet', callback_data: 'roborock:fan:101' },
          { text: '⚖️ Balanced', callback_data: 'roborock:fan:102' },
        ],
        [
          { text: '💨 Turbo', callback_data: 'roborock:fan:103' },
          { text: '🌀 Max', callback_data: 'roborock:fan:104' },
        ],
        [{ text: '« Back to Vacuum', callback_data: 'menu:roborock' }],
      ],
    },
  };
}

/**
 * Roborock mop mode menu
 */
export function roborockMopKeyboard(): { text: string; keyboard: InlineKeyboard } {
  const text = `🤖 <b>Vacuum - Mop Intensity</b>

Select water flow:`;

  return {
    text,
    keyboard: {
      inline_keyboard: [
        [
          { text: '🚫 Off', callback_data: 'roborock:mop:200' },
          { text: '💧 Low', callback_data: 'roborock:mop:201' },
        ],
        [
          { text: '💧💧 Medium', callback_data: 'roborock:mop:202' },
          { text: '💧💧💧 High', callback_data: 'roborock:mop:203' },
        ],
        [{ text: '« Back to Vacuum', callback_data: 'menu:roborock' }],
      ],
    },
  };
}

/**
 * Roborock rooms menu - hardcoded room list
 */
export function roborockRoomsKeyboard(): { text: string; keyboard: InlineKeyboard } {
  const text = `🤖 <b>Vacuum - Clean Rooms</b>

Select a room to clean:`;

  // Rooms from Roborock API (segmentId -> name)
  const rooms = [
    { id: 16, name: 'Living Room' },
    { id: 17, name: 'Kitchen' },
    { id: 18, name: 'Hallway' },
    { id: 19, name: 'Bathroom' },
    { id: 20, name: 'Bedroom' },
    { id: 21, name: 'Office' },
    { id: 22, name: 'Kids Room' },
  ];

  const buttons: Array<Array<{ text: string; callback_data: string }>> = [];

  // 2 rooms per row
  for (let i = 0; i < rooms.length; i += 2) {
    const row = rooms.slice(i, i + 2).map((r) => ({
      text: `🧹 ${r.name}`,
      callback_data: `roborock:room:${r.id}`,
    }));
    buttons.push(row);
  }

  buttons.push([{ text: '« Back to Vacuum', callback_data: 'menu:roborock' }]);

  return {
    text,
    keyboard: { inline_keyboard: buttons },
  };
}

/**
 * Air purifier menu keyboard
 */
export function purifierKeyboard(): { text: string; keyboard: InlineKeyboard } {
  const text = `🌬️ <b>Air Purifier Control</b>

Select an action:`;

  return {
    text,
    keyboard: {
      inline_keyboard: [
        [
          { text: '🟢 On', callback_data: 'purifier:on' },
          { text: '⚫ Off', callback_data: 'purifier:off' },
        ],
        [
          { text: '🅰️ Auto', callback_data: 'purifier:mode:auto' },
          { text: '😴 Silent', callback_data: 'purifier:mode:silent' },
        ],
        [
          { text: '💨 Favorite', callback_data: 'purifier:mode:favorite' },
          { text: '🌀 Fan', callback_data: 'purifier:mode:fan' },
        ],
        [{ text: '📊 Status', callback_data: 'purifier:status' }],
        [{ text: '« Back to Menu', callback_data: 'menu:main' }],
      ],
    },
  };
}

/**
 * Soundbar menu keyboard
 */
export function soundbarKeyboard(): { text: string; keyboard: InlineKeyboard } {
  const text = `🔊 <b>Soundbar Control</b>

Select an action:`;

  return {
    text,
    keyboard: {
      inline_keyboard: [
        [
          { text: '🟢 On', callback_data: 'soundbar:on' },
          { text: '⚫ Off', callback_data: 'soundbar:off' },
        ],
        [
          { text: '🔉 Vol-', callback_data: 'soundbar:vol:down' },
          { text: '🔊 Vol+', callback_data: 'soundbar:vol:up' },
        ],
        [
          { text: '🔇 Mute', callback_data: 'soundbar:mute' },
          { text: '🔈 Unmute', callback_data: 'soundbar:unmute' },
        ],
        [{ text: '📊 Status', callback_data: 'soundbar:status' }],
        [{ text: '« Back to Menu', callback_data: 'menu:main' }],
      ],
    },
  };
}

/**
 * Weather station keyboard with current readings
 */
export function weatherKeyboard(): { text: string; keyboard: InlineKeyboard } {
  const db = getDb();

  // Get weather station device with last_status
  const device = db.query(`
    SELECT last_status, updated_at FROM devices WHERE category = 'wsdcg' LIMIT 1
  `).get() as { last_status: string | null; updated_at: string } | null;

  let statusText = 'No data available';
  if (device?.last_status) {
    try {
      const status = JSON.parse(device.last_status);
      // DPS mapping: 103=temp*100, 101=humidity*100, 102=battery
      const temp = status['103'] !== undefined ? `${(status['103'] / 100).toFixed(1)}°C` : 'N/A';
      const hum = status['101'] !== undefined ? `${(status['101'] / 100).toFixed(1)}%` : 'N/A';
      const bat = status['102'] !== undefined ? `${status['102']}%` : 'N/A';
      statusText = `🌡️ Temperature: <b>${temp}</b>
💧 Humidity: <b>${hum}</b>
🔋 Battery: <b>${bat}</b>`;
    } catch {}
  }

  // Show current time for "Retrieved"
  const now = new Date().toLocaleString('en-GB', { timeZone: 'Europe/Warsaw' });

  const text = `🌡️ <b>Weather Station</b>

${statusText}

🕐 Retrieved: ${now}`;

  return {
    text,
    keyboard: {
      inline_keyboard: [
        [{ text: '🔄 Refresh', callback_data: 'weather:refresh' }],
        [{ text: '« Back to Menu', callback_data: 'menu:main' }],
      ],
    },
  };
}
