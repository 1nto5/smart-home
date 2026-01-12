import { getAlarmConfig, getDb } from '../db/database';
import { getLampPresets, getHeaterPresets } from '../scheduling';

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

  const text = `🔥 <b>Heating Control</b>

Select a preset to apply to all heaters:`;

  const buttons: Array<Array<{ text: string; callback_data: string }>> = [];

  // Preset buttons (2 per row)
  const presetButtons = presets.map((p) => ({
    text: `${p.name} (${p.target_temp}°C)`,
    callback_data: `heater:preset:${p.id}`,
  }));

  for (let i = 0; i < presetButtons.length; i += 2) {
    buttons.push(presetButtons.slice(i, i + 2));
  }

  // Individual heater control
  buttons.push([{ text: '🌡️ Individual Heaters', callback_data: 'heater:list' }]);
  buttons.push([{ text: '« Back to Menu', callback_data: 'menu:main' }]);

  return { text, keyboard: { inline_keyboard: buttons } };
}

/**
 * Individual heaters list
 */
export function heatersListKeyboard(): { text: string; keyboard: InlineKeyboard } {
  const db = getDb();
  const heaters = db.query(`
    SELECT id, name, last_status, online
    FROM devices
    WHERE category = 'wkf'
    ORDER BY name
  `).all() as Array<{ id: string; name: string; last_status: string | null; online: number }>;

  const text = `🌡️ <b>Individual Heaters</b>

Select a heater to adjust:`;

  const buttons: Array<Array<{ text: string; callback_data: string }>> = [];

  for (const heater of heaters) {
    let temp = '?';
    let targetTemp = '?';
    if (heater.last_status) {
      try {
        const status = JSON.parse(heater.last_status);
        // DPS 5 = current temp (scaled by 10), DPS 4 = target temp (scaled by 10)
        if (status['5'] !== undefined) temp = `${(status['5'] / 10).toFixed(1)}`;
        if (status['4'] !== undefined) targetTemp = `${(status['4'] / 10).toFixed(0)}`;
      } catch {}
    }
    const icon = heater.online ? '🟢' : '⚫';
    const shortName = heater.name.replace(' Heater', '').replace(' TRV', '');
    buttons.push([{
      text: `${icon} ${shortName}: ${temp}°C → ${targetTemp}°C`,
      callback_data: `heater:device:${heater.id}`,
    }]);
  }

  buttons.push([{ text: '« Back to Heating', callback_data: 'menu:heaters' }]);

  return { text, keyboard: { inline_keyboard: buttons } };
}

/**
 * Individual heater control keyboard
 */
export function heaterDeviceKeyboard(deviceId: string): { text: string; keyboard: InlineKeyboard } {
  const db = getDb();
  const heater = db.query(`
    SELECT id, name, last_status, online
    FROM devices
    WHERE id = ?
  `).get(deviceId) as { id: string; name: string; last_status: string | null; online: number } | null;

  if (!heater) {
    return {
      text: '❌ Heater not found',
      keyboard: { inline_keyboard: [[{ text: '« Back', callback_data: 'heater:list' }]] },
    };
  }

  let currentTemp = 'N/A';
  let targetTemp = 20;
  if (heater.last_status) {
    try {
      const status = JSON.parse(heater.last_status);
      if (status['5'] !== undefined) currentTemp = `${(status['5'] / 10).toFixed(1)}°C`;
      if (status['4'] !== undefined) targetTemp = status['4'] / 10;
    } catch {}
  }

  const shortName = heater.name.replace(' Heater', '').replace(' TRV', '');
  const text = `🌡️ <b>${shortName}</b>

Current: <b>${currentTemp}</b>
Target: <b>${targetTemp}°C</b>
Status: ${heater.online ? '🟢 Online' : '⚫ Offline'}

Set target temperature:`;

  const buttons: Array<Array<{ text: string; callback_data: string }>> = [];

  // Temperature buttons (5°C to 25°C in 2 rows)
  const temps1 = [5, 10, 15, 18, 20];
  const temps2 = [21, 22, 23, 24, 25];

  buttons.push(temps1.map(t => ({
    text: t === targetTemp ? `[${t}°C]` : `${t}°C`,
    callback_data: `heater:set:${deviceId}:${t}`,
  })));

  buttons.push(temps2.map(t => ({
    text: t === targetTemp ? `[${t}°C]` : `${t}°C`,
    callback_data: `heater:set:${deviceId}:${t}`,
  })));

  buttons.push([{ text: '« Back to Heaters', callback_data: 'heater:list' }]);

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
    { id: 21, name: 'Wardrobe' },
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
        [{ text: '⚙️ Manual', callback_data: 'purifier:mode:favorite' }],
        [{ text: '🌀 Fan Speed', callback_data: 'purifier:rpm_menu' }],
        [{ text: '💡 LED Brightness', callback_data: 'purifier:led_menu' }],
        [{ text: '📊 Status', callback_data: 'purifier:status' }],
        [{ text: '« Back to Menu', callback_data: 'menu:main' }],
      ],
    },
  };
}

/**
 * Air purifier RPM control keyboard
 */
export function purifierRpmKeyboard(currentRpm: number): { text: string; keyboard: InlineKeyboard } {
  const text = `🌬️ <b>Air Purifier - Fan Speed</b>

Current: <b>${currentRpm} RPM</b>
Range: 300 - 2200 RPM

Select speed:`;

  // RPM presets in 2 rows
  const presets1 = [300, 600, 900, 1200];
  const presets2 = [1500, 1800, 2000, 2200];

  return {
    text,
    keyboard: {
      inline_keyboard: [
        presets1.map(rpm => ({
          text: rpm === currentRpm ? `[${rpm}]` : `${rpm}`,
          callback_data: `purifier:rpm:${rpm}`,
        })),
        presets2.map(rpm => ({
          text: rpm === currentRpm ? `[${rpm}]` : `${rpm}`,
          callback_data: `purifier:rpm:${rpm}`,
        })),
        [
          { text: '➖ 100', callback_data: 'purifier:rpm_adj:-100' },
          { text: '➕ 100', callback_data: 'purifier:rpm_adj:100' },
        ],
        [{ text: '« Back to Purifier', callback_data: 'menu:purifier' }],
      ],
    },
  };
}

/**
 * Air purifier LED brightness control keyboard
 */
export function purifierLedKeyboard(currentLevel: string): { text: string; keyboard: InlineKeyboard } {
  const levelNames: Record<string, string> = { bright: 'Bright', dim: 'Dim', off: 'Off' };
  const text = `🌬️ <b>Air Purifier - LED Brightness</b>

Current: <b>${levelNames[currentLevel] || currentLevel}</b>

Select brightness:`;

  const levels = ['bright', 'dim', 'off'] as const;
  const icons: Record<string, string> = { bright: '☀️', dim: '🔅', off: '🌑' };

  return {
    text,
    keyboard: {
      inline_keyboard: [
        levels.map(level => ({
          text: level === currentLevel ? `[${icons[level]} ${levelNames[level]}]` : `${icons[level]} ${levelNames[level]}`,
          callback_data: `purifier:led:${level}`,
        })),
        [{ text: '« Back to Purifier', callback_data: 'menu:purifier' }],
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
        [
          { text: '📺 TV', callback_data: 'soundbar:input:tv' },
          { text: '🔵 Bluetooth', callback_data: 'soundbar:input:bluetooth' },
        ],
        [{ text: '🎵 Sound Programs »', callback_data: 'soundbar:programs' }],
        [{ text: '🎚️ Audio Settings »', callback_data: 'soundbar:audio' }],
        [{ text: '📊 Status', callback_data: 'soundbar:status' }],
        [{ text: '« Back to Menu', callback_data: 'menu:main' }],
      ],
    },
  };
}

/**
 * Soundbar sound programs submenu
 */
export function soundbarProgramsKeyboard(): { text: string; keyboard: InlineKeyboard } {
  const text = `🎵 <b>Sound Programs</b>

Select a sound mode:`;

  return {
    text,
    keyboard: {
      inline_keyboard: [
        [
          { text: '🎬 Movie', callback_data: 'soundbar:program:movie' },
          { text: '🎵 Music', callback_data: 'soundbar:program:music' },
        ],
        [
          { text: '⚽ Sports', callback_data: 'soundbar:program:sports' },
          { text: '🎮 Game', callback_data: 'soundbar:program:game' },
        ],
        [
          { text: '📺 TV', callback_data: 'soundbar:program:tv_program' },
          { text: '🎧 Stereo', callback_data: 'soundbar:program:stereo' },
        ],
        [{ text: '« Back', callback_data: 'menu:soundbar' }],
      ],
    },
  };
}

/**
 * Soundbar audio settings submenu
 */
export function soundbarAudioKeyboard(
  clearVoice: boolean,
  bassExtension: boolean,
  subwooferVol: number
): { text: string; keyboard: InlineKeyboard } {
  const text = `🎚️ <b>Audio Settings</b>

Clear Voice: ${clearVoice ? '✅ On' : '❌ Off'}
Bass Extension: ${bassExtension ? '✅ On' : '❌ Off'}
Subwoofer: ${subwooferVol > 0 ? '+' : ''}${subwooferVol}`;

  return {
    text,
    keyboard: {
      inline_keyboard: [
        [
          {
            text: `🗣️ Clear Voice: ${clearVoice ? 'ON' : 'OFF'}`,
            callback_data: 'soundbar:clearvoice:toggle',
          },
        ],
        [
          {
            text: `🔊 Bass Ext: ${bassExtension ? 'ON' : 'OFF'}`,
            callback_data: 'soundbar:bass:toggle',
          },
        ],
        [
          { text: '➖', callback_data: 'soundbar:subvol:down' },
          { text: `Sub: ${subwooferVol > 0 ? '+' : ''}${subwooferVol}`, callback_data: 'soundbar:noop' },
          { text: '➕', callback_data: 'soundbar:subvol:up' },
        ],
        [{ text: '« Back', callback_data: 'menu:soundbar' }],
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
