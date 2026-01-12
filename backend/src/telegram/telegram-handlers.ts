import { sendMessage, editMessage, answerCallbackQuery } from './telegram-bot';
import {
  mainMenuKeyboard,
  alarmKeyboard,
  lampsKeyboard,
  lampsListKeyboard,
  heatersKeyboard,
  heatersListKeyboard,
  heaterDeviceKeyboard,
  roborockKeyboard,
  roborockFanKeyboard,
  roborockMopKeyboard,
  roborockRoomsKeyboard,
  purifierKeyboard,
  purifierFanSpeedKeyboard,
  soundbarKeyboard,
  soundbarProgramsKeyboard,
  soundbarAudioKeyboard,
  weatherKeyboard,
} from './telegram-keyboards';
import {
  setAlarmArmed,
  getAlarmConfig,
  getDb,
  getHomeStatus,
  acknowledgeAlarm,
  acknowledgeAllAlarms,
  getAutomationPending,
  updateAutomationPendingStatus,
} from '../db/database';
import { executeConfirmedActions, type TriggerContext } from '../automations/automation-actions';
import { getLampPresets, getHeaterPresets } from '../scheduling';
import {
  applyPresetToAllLamps,
  applyPresetToAllHeaters,
  applyTempToHeater,
} from '../scheduling';
import { toggleLamp, getLampStatus } from '../xiaomi/xiaomi-lamp';
import {
  startCleaning,
  pauseCleaning,
  stopCleaning,
  goHome,
  findMe,
  getStatus as getRoborockStatus,
  setFanSpeed,
  setMopMode,
  cleanSegments,
} from '../roborock/roborock';
import {
  getPurifierStatus,
  setPurifierPower,
  setPurifierMode,
  setPurifierFanSpeed,
} from '../xiaomi/air-purifier';
import {
  getSoundbarStatus,
  setSoundbarPower,
  setSoundbarVolume,
  setSoundbarMute,
  setSoundbarInput,
  setSoundbarSoundProgram,
  setSoundbarClearVoice,
  setSoundbarBassExtension,
  setSoundbarSubwooferVolume,
} from '../yamaha/yamaha-soundbar';

/**
 * Handle text commands
 */
export async function handleCommand(
  text: string,
  chatId: number,
  _messageId: number
): Promise<void> {
  const cmd = text.trim().toLowerCase();

  if (cmd === '/start' || cmd === '/menu') {
    const menu = await mainMenuKeyboard();
    await sendMessage(chatId, menu.text, menu.keyboard);
    return;
  }

  if (cmd === '/status') {
    await sendStatusMessage(chatId);
    return;
  }

  // Unknown command - show menu
  const menu = await mainMenuKeyboard();
  await sendMessage(chatId, menu.text, menu.keyboard);
}

/**
 * Handle inline keyboard callback queries
 */
export async function handleCallbackQuery(
  callbackId: string,
  data: string,
  chatId: number,
  messageId: number
): Promise<void> {
  const [action, ...args] = data.split(':');

  try {
    switch (action) {
      case 'menu':
        await handleMenuNavigation(args[0], chatId, messageId);
        break;
      case 'alarm':
        await handleAlarmAction(args[0], chatId, messageId);
        break;
      case 'alarm_ack':
        if (args[0]) await handleAlarmAcknowledge(args[0], chatId, messageId);
        break;
      case 'alarm_ack_all':
        await handleAlarmAcknowledgeAll(chatId, messageId);
        break;
      case 'alarm_disarm_ack':
        await handleAlarmDisarmAndAcknowledge(chatId, messageId);
        break;
      case 'lamp':
        await handleLampAction(args, chatId, messageId);
        break;
      case 'heater':
        await handleHeaterAction(args, chatId, messageId);
        break;
      case 'roborock':
        await handleRoborockAction(args, chatId, messageId);
        break;
      case 'purifier':
        await handlePurifierAction(args, chatId, messageId);
        break;
      case 'soundbar':
        await handleSoundbarAction(args, chatId, messageId);
        break;
      case 'weather':
        await handleWeatherAction(args, chatId, messageId);
        break;
      case 'status':
        await sendStatusMessage(chatId, messageId);
        break;
      case 'auto':
        await handleAutomationCallback(args, chatId, messageId);
        break;
    }
  } catch (error: any) {
    console.error('Callback handler error:', error.message);
    await answerCallbackQuery(callbackId, '❌ Error occurred');
    return;
  }

  await answerCallbackQuery(callbackId);
}

/**
 * Navigate between menus
 */
async function handleMenuNavigation(
  menu: string,
  chatId: number,
  messageId: number
): Promise<void> {
  let result: { text: string; keyboard: any };

  switch (menu) {
    case 'main':
      result = await mainMenuKeyboard();
      break;
    case 'alarm':
      result = alarmKeyboard();
      break;
    case 'lamps':
      result = lampsKeyboard();
      break;
    case 'heaters':
      result = heatersKeyboard();
      break;
    case 'roborock':
      result = roborockKeyboard();
      break;
    case 'purifier':
      result = purifierKeyboard();
      break;
    case 'soundbar':
      result = soundbarKeyboard();
      break;
    case 'weather':
      result = weatherKeyboard();
      break;
    default:
      result = await mainMenuKeyboard();
  }

  await editMessage(chatId, messageId, result.text, result.keyboard);
}

/**
 * Handle alarm actions
 */
async function handleAlarmAction(
  action: string,
  chatId: number,
  messageId: number
): Promise<void> {
  if (action === 'arm') {
    setAlarmArmed(true);
    console.log('Telegram: Alarm ARMED');
  } else if (action === 'disarm') {
    setAlarmArmed(false);
    console.log('Telegram: Alarm DISARMED');
  }

  const result = alarmKeyboard();
  await editMessage(chatId, messageId, result.text, result.keyboard);
}

/**
 * Handle acknowledge single alarm
 */
async function handleAlarmAcknowledge(
  alarmIdStr: string,
  chatId: number,
  messageId: number
): Promise<void> {
  const alarmId = parseInt(alarmIdStr);
  if (isNaN(alarmId)) {
    await editMessage(chatId, messageId, '❌ Invalid alarm ID', backToMenuKeyboard());
    return;
  }

  acknowledgeAlarm(alarmId, 'telegram');
  console.log(`Telegram: Alarm ${alarmId} acknowledged`);

  await editMessage(chatId, messageId, '✅ <b>Alarm acknowledged</b>\n\nNotifications stopped.', backToMenuKeyboard());
}

/**
 * Handle acknowledge all alarms
 */
async function handleAlarmAcknowledgeAll(
  chatId: number,
  messageId: number
): Promise<void> {
  const count = acknowledgeAllAlarms(undefined, 'telegram');
  console.log(`Telegram: ${count} alarm(s) acknowledged`);

  await editMessage(
    chatId,
    messageId,
    `✅ <b>${count} alarm(s) acknowledged</b>\n\nAll notifications stopped.`,
    backToMenuKeyboard()
  );
}

/**
 * Handle disarm + acknowledge all alarms
 */
async function handleAlarmDisarmAndAcknowledge(
  chatId: number,
  messageId: number
): Promise<void> {
  setAlarmArmed(false);
  const count = acknowledgeAllAlarms(undefined, 'telegram');
  console.log(`Telegram: Alarm DISARMED + ${count} alarm(s) acknowledged`);

  await editMessage(
    chatId,
    messageId,
    `✅ <b>Alarm disarmed + ${count} alarm(s) acknowledged</b>\n\nSystem disarmed, all notifications stopped.`,
    backToMenuKeyboard()
  );
}

/**
 * Simple back to menu keyboard
 */
function backToMenuKeyboard() {
  return {
    inline_keyboard: [[{ text: '« Back to Menu', callback_data: 'menu:main' }]],
  };
}

/**
 * Handle lamp actions
 */
async function handleLampAction(
  args: string[],
  chatId: number,
  messageId: number
): Promise<void> {
  const [subAction, param] = args;

  if (subAction === 'preset' && param) {
    console.log(`Telegram: Applying lamp preset ${param}`);
    const result = await applyPresetToAllLamps(param);
    const menu = lampsKeyboard();
    const successCount = result.results.filter((r: any) => r.success).length;
    const text = `${menu.text}\n\n✅ Applied <b>${param}</b> to ${successCount}/${result.results.length} lamps`;
    await editMessage(chatId, messageId, text, menu.keyboard);
    return;
  }

  if (subAction === 'list') {
    const result = lampsListKeyboard();
    await editMessage(chatId, messageId, result.text, result.keyboard);
    return;
  }

  if (subAction === 'toggle' && param) {
    console.log(`Telegram: Toggling lamp ${param}`);
    const success = await toggleLamp(param);

    // Update status in DB
    if (success) {
      const status = await getLampStatus(param);
      if (status) {
        const db = getDb();
        db.run(
          'UPDATE xiaomi_devices SET last_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [JSON.stringify(status), param]
        );
      }
    }

    const result = lampsListKeyboard();
    await editMessage(chatId, messageId, result.text, result.keyboard);
    return;
  }

  // Default: show lamps menu
  const menu = lampsKeyboard();
  await editMessage(chatId, messageId, menu.text, menu.keyboard);
}

/**
 * Handle heater actions
 */
async function handleHeaterAction(
  args: string[],
  chatId: number,
  messageId: number
): Promise<void> {
  const [subAction, param, param2] = args;

  if (subAction === 'preset' && param) {
    console.log(`Telegram: Applying heater preset ${param}`);
    const result = await applyPresetToAllHeaters(param);
    const menu = heatersKeyboard();
    const successCount = result.results.filter((r: any) => r.success).length;
    const text = `${menu.text}\n\n✅ Applied <b>${param}</b> to ${successCount}/${result.results.length} heaters`;
    await editMessage(chatId, messageId, text, menu.keyboard);
    return;
  }

  if (subAction === 'list') {
    const result = heatersListKeyboard();
    await editMessage(chatId, messageId, result.text, result.keyboard);
    return;
  }

  if (subAction === 'device' && param) {
    const result = heaterDeviceKeyboard(param);
    await editMessage(chatId, messageId, result.text, result.keyboard);
    return;
  }

  if (subAction === 'set' && param && param2) {
    const deviceId = param;
    const temp = parseFloat(param2);
    console.log(`Telegram: Setting heater ${deviceId} to ${temp}°C`);
    const success = await applyTempToHeater(deviceId, temp);
    const result = heaterDeviceKeyboard(deviceId);
    const statusText = success ? `✅ Set to ${temp}°C` : `❌ Failed to set temperature`;
    await editMessage(chatId, messageId, `${result.text}\n\n${statusText}`, result.keyboard);
    return;
  }

  // Default: show heaters menu
  const menu = heatersKeyboard();
  await editMessage(chatId, messageId, menu.text, menu.keyboard);
}

/**
 * Handle roborock actions
 */
async function handleRoborockAction(
  args: string[],
  chatId: number,
  messageId: number
): Promise<void> {
  const [action, param] = args;
  let actionResult = false;
  let actionName = '';

  // Fan speed submenu
  if (action === 'fan_menu') {
    const menu = roborockFanKeyboard();
    await editMessage(chatId, messageId, menu.text, menu.keyboard);
    return;
  }

  // Mop mode submenu
  if (action === 'mop_menu') {
    const menu = roborockMopKeyboard();
    await editMessage(chatId, messageId, menu.text, menu.keyboard);
    return;
  }

  // Rooms submenu
  if (action === 'rooms_menu') {
    const menu = roborockRoomsKeyboard();
    await editMessage(chatId, messageId, menu.text, menu.keyboard);
    return;
  }

  // Clean specific room
  if (action === 'room' && param) {
    const segmentId = parseInt(param);
    const roomNames: Record<number, string> = {
      16: 'Living Room', 17: 'Kitchen', 18: 'Hallway', 19: 'Bathroom',
      20: 'Bedroom', 21: 'Office', 22: 'Kids Room',
    };
    const roomName = roomNames[segmentId] || `Room ${segmentId}`;
    console.log(`Telegram: Starting room cleaning for ${roomName} (segment ${segmentId})`);
    const actionResult = await cleanSegments([segmentId]);
    const menu = roborockRoomsKeyboard();
    const statusText = actionResult ? `✅ Cleaning ${roomName}` : `❌ Failed to start`;
    await editMessage(chatId, messageId, `${menu.text}\n\n${statusText}`, menu.keyboard);
    return;
  }

  // Set fan speed
  if (action === 'fan' && param) {
    const mode = parseInt(param);
    actionResult = await setFanSpeed(mode);
    const fanNames: Record<number, string> = { 101: 'Quiet', 102: 'Balanced', 103: 'Turbo', 104: 'Max' };
    actionName = `Fan: ${fanNames[mode] || mode}`;
    const menu = roborockFanKeyboard();
    const statusText = actionResult ? `✅ ${actionName}` : `❌ ${actionName} failed`;
    await editMessage(chatId, messageId, `${menu.text}\n\n${statusText}`, menu.keyboard);
    return;
  }

  // Set mop mode
  if (action === 'mop' && param) {
    const mode = parseInt(param);
    actionResult = await setMopMode(mode);
    const mopNames: Record<number, string> = { 200: 'Off', 201: 'Low', 202: 'Medium', 203: 'High' };
    actionName = `Mop: ${mopNames[mode] || mode}`;
    const menu = roborockMopKeyboard();
    const statusText = actionResult ? `✅ ${actionName}` : `❌ ${actionName} failed`;
    await editMessage(chatId, messageId, `${menu.text}\n\n${statusText}`, menu.keyboard);
    return;
  }

  switch (action) {
    case 'start':
      actionResult = await startCleaning();
      actionName = 'Start';
      break;
    case 'pause':
      actionResult = await pauseCleaning();
      actionName = 'Pause';
      break;
    case 'stop':
      actionResult = await stopCleaning();
      actionName = 'Stop';
      break;
    case 'home':
      actionResult = await goHome();
      actionName = 'Go Home';
      break;
    case 'find':
      actionResult = await findMe();
      actionName = 'Find';
      break;
    case 'status':
      const status = await getRoborockStatus();
      const menu = roborockKeyboard();
      if (status) {
        const stateMap: Record<number, string> = {
          1: 'Starting',
          2: 'Charger disconnected',
          3: 'Idle',
          4: 'Remote control',
          5: 'Cleaning',
          6: 'Returning home',
          7: 'Manual mode',
          8: 'Charging',
          9: 'Charging error',
          10: 'Paused',
          11: 'Spot cleaning',
          12: 'Error',
          13: 'Shutting down',
          14: 'Updating',
          15: 'Docking',
          16: 'Go to target',
          17: 'Zoned cleaning',
          18: 'Segment cleaning',
          100: 'Full',
        };
        const fanNames: Record<number, string> = { 101: 'Quiet', 102: 'Balanced', 103: 'Turbo', 104: 'Max' };
        const stateName = stateMap[status.state] || `Unknown (${status.state})`;
        const fanName = status.fan_power !== undefined ? (fanNames[status.fan_power] || `${status.fan_power}`) : 'N/A';
        const text = `${menu.text}\n\n📊 <b>Status:</b>\nState: ${stateName}\nBattery: ${status.battery}%\nFan: ${fanName}`;
        await editMessage(chatId, messageId, text, menu.keyboard);
      } else {
        await editMessage(chatId, messageId, `${menu.text}\n\n❌ Could not get status`, menu.keyboard);
      }
      return;
  }

  console.log(`Telegram: Roborock ${actionName} - ${actionResult ? 'success' : 'failed'}`);
  const menu = roborockKeyboard();
  const statusText = actionResult ? `✅ ${actionName} sent` : `❌ ${actionName} failed`;
  await editMessage(chatId, messageId, `${menu.text}\n\n${statusText}`, menu.keyboard);
}

/**
 * Handle purifier actions
 */
async function handlePurifierAction(
  args: string[],
  chatId: number,
  messageId: number
): Promise<void> {
  const [subAction, param] = args;
  let success = false;
  let actionName = '';

  if (subAction === 'on') {
    success = await setPurifierPower(true);
    actionName = 'Power On';
  } else if (subAction === 'off') {
    success = await setPurifierPower(false);
    actionName = 'Power Off';
  } else if (subAction === 'mode' && param) {
    success = await setPurifierMode(param as 'auto' | 'silent' | 'favorite');
    const modeLabels: Record<string, string> = { auto: 'Auto', silent: 'Night', favorite: 'Manual' };
    actionName = `Mode: ${modeLabels[param] || param}`;
  } else if (subAction === 'fan') {
    // Show fan speed submenu
    const menu = purifierFanSpeedKeyboard();
    await editMessage(chatId, messageId, menu.text, menu.keyboard);
    return;
  } else if (subAction === 'speed' && param) {
    const level = parseInt(param, 10);
    success = await setPurifierFanSpeed(level);
    const speedLabels: Record<number, string> = { 1: 'Low', 2: 'Medium', 3: 'High' };
    actionName = `Fan Speed: ${speedLabels[level] || level}`;
  } else if (subAction === 'status') {
    const status = await getPurifierStatus();
    const menu = purifierKeyboard();
    if (status) {
      const modeLabels: Record<string, string> = { auto: 'Auto', silent: 'Night', favorite: 'Manual' };
      const speedLabels: Record<number, string> = { 1: 'Low', 2: 'Medium', 3: 'High' };
      let statusLines = `Power: ${status.power ? 'On' : 'Off'}\nMode: ${modeLabels[status.mode] || status.mode}\nAQI: ${status.aqi}\nFilter: ${status.filter_life}%`;
      if (status.mode === 'favorite' && status.fan_level) {
        statusLines += `\nFan: ${speedLabels[status.fan_level] || status.fan_level}`;
      }
      const text = `${menu.text}\n\n📊 <b>Status:</b>\n${statusLines}`;
      await editMessage(chatId, messageId, text, menu.keyboard);
    } else {
      await editMessage(chatId, messageId, `${menu.text}\n\n❌ Could not get status`, menu.keyboard);
    }
    return;
  }

  console.log(`Telegram: Purifier ${actionName} - ${success ? 'success' : 'failed'}`);
  const menu = purifierKeyboard();
  const statusText = success ? `✅ ${actionName}` : `❌ ${actionName} failed`;
  await editMessage(chatId, messageId, `${menu.text}\n\n${statusText}`, menu.keyboard);
}

/**
 * Handle soundbar actions
 */
async function handleSoundbarAction(
  args: string[],
  chatId: number,
  messageId: number
): Promise<void> {
  const db = getDb();
  const soundbar = db.query('SELECT id FROM yamaha_devices LIMIT 1').get() as { id: string } | null;

  if (!soundbar) {
    const menu = soundbarKeyboard();
    await editMessage(chatId, messageId, `${menu.text}\n\n❌ No soundbar configured`, menu.keyboard);
    return;
  }

  const [subAction, param] = args;
  let success = false;
  let actionName = '';

  // Power controls
  if (subAction === 'on') {
    success = await setSoundbarPower(soundbar.id, true);
    actionName = 'Power On';
  } else if (subAction === 'off') {
    success = await setSoundbarPower(soundbar.id, false);
    actionName = 'Power Off';
  }
  // Volume controls
  else if (subAction === 'vol') {
    const status = await getSoundbarStatus(soundbar.id);
    if (status) {
      const currentVol = status.volume ?? 50;
      const newVol = param === 'up' ? Math.min(100, currentVol + 5) : Math.max(0, currentVol - 5);
      success = await setSoundbarVolume(soundbar.id, newVol);
      actionName = `Volume: ${newVol}`;
    }
  } else if (subAction === 'mute') {
    success = await setSoundbarMute(soundbar.id, true);
    actionName = 'Mute';
  } else if (subAction === 'unmute') {
    success = await setSoundbarMute(soundbar.id, false);
    actionName = 'Unmute';
  }
  // Input selection
  else if (subAction === 'input' && param) {
    success = await setSoundbarInput(soundbar.id, param);
    actionName = `Input: ${param === 'tv' ? 'TV' : 'Bluetooth'}`;
  }
  // Sound programs submenu
  else if (subAction === 'programs') {
    const menu = soundbarProgramsKeyboard();
    await editMessage(chatId, messageId, menu.text, menu.keyboard);
    return;
  }
  // Sound program selection
  else if (subAction === 'program' && param) {
    success = await setSoundbarSoundProgram(soundbar.id, param);
    const programNames: Record<string, string> = {
      movie: 'Movie',
      music: 'Music',
      sports: 'Sports',
      game: 'Game',
      tv_program: 'TV',
      stereo: 'Stereo',
    };
    actionName = `Sound: ${programNames[param] || param}`;
  }
  // Audio settings submenu
  else if (subAction === 'audio') {
    const status = await getSoundbarStatus(soundbar.id);
    const menu = soundbarAudioKeyboard(
      status?.clear_voice ?? false,
      status?.bass_extension ?? false,
      status?.subwoofer_volume ?? 0
    );
    await editMessage(chatId, messageId, menu.text, menu.keyboard);
    return;
  }
  // Clear voice toggle
  else if (subAction === 'clearvoice') {
    const status = await getSoundbarStatus(soundbar.id);
    const newVal = !(status?.clear_voice ?? false);
    success = await setSoundbarClearVoice(soundbar.id, newVal);
    actionName = `Clear Voice: ${newVal ? 'On' : 'Off'}`;
    // Stay in audio menu
    if (success) {
      const newStatus = await getSoundbarStatus(soundbar.id);
      const menu = soundbarAudioKeyboard(
        newStatus?.clear_voice ?? false,
        newStatus?.bass_extension ?? false,
        newStatus?.subwoofer_volume ?? 0
      );
      await editMessage(chatId, messageId, `${menu.text}\n\n✅ ${actionName}`, menu.keyboard);
      return;
    }
  }
  // Bass extension toggle
  else if (subAction === 'bass') {
    const status = await getSoundbarStatus(soundbar.id);
    const newVal = !(status?.bass_extension ?? false);
    success = await setSoundbarBassExtension(soundbar.id, newVal);
    actionName = `Bass Extension: ${newVal ? 'On' : 'Off'}`;
    // Stay in audio menu
    if (success) {
      const newStatus = await getSoundbarStatus(soundbar.id);
      const menu = soundbarAudioKeyboard(
        newStatus?.clear_voice ?? false,
        newStatus?.bass_extension ?? false,
        newStatus?.subwoofer_volume ?? 0
      );
      await editMessage(chatId, messageId, `${menu.text}\n\n✅ ${actionName}`, menu.keyboard);
      return;
    }
  }
  // Subwoofer volume
  else if (subAction === 'subvol') {
    const status = await getSoundbarStatus(soundbar.id);
    const currentVol = status?.subwoofer_volume ?? 0;
    const newVol = param === 'up' ? Math.min(4, currentVol + 1) : Math.max(-4, currentVol - 1);
    success = await setSoundbarSubwooferVolume(soundbar.id, newVol);
    actionName = `Subwoofer: ${newVol > 0 ? '+' : ''}${newVol}`;
    // Stay in audio menu
    if (success) {
      const newStatus = await getSoundbarStatus(soundbar.id);
      const menu = soundbarAudioKeyboard(
        newStatus?.clear_voice ?? false,
        newStatus?.bass_extension ?? false,
        newStatus?.subwoofer_volume ?? 0
      );
      await editMessage(chatId, messageId, `${menu.text}\n\n✅ ${actionName}`, menu.keyboard);
      return;
    }
  }
  // Noop for display-only buttons
  else if (subAction === 'noop') {
    return;
  }
  // Status
  else if (subAction === 'status') {
    const status = await getSoundbarStatus(soundbar.id);
    const menu = soundbarKeyboard();
    if (status) {
      const programNames: Record<string, string> = {
        movie: 'Movie', music: 'Music', sports: 'Sports',
        game: 'Game', tv_program: 'TV', stereo: 'Stereo',
      };
      const text = `${menu.text}\n\n📊 <b>Status:</b>
Power: ${status.power}
Volume: ${status.volume}
Muted: ${status.mute ? 'Yes' : 'No'}
Input: ${status.input}
Sound: ${programNames[status.sound_program || ''] || status.sound_program || 'Unknown'}
Clear Voice: ${status.clear_voice ? 'On' : 'Off'}
Bass Ext: ${status.bass_extension ? 'On' : 'Off'}
Subwoofer: ${(status.subwoofer_volume ?? 0) > 0 ? '+' : ''}${status.subwoofer_volume ?? 0}`;
      await editMessage(chatId, messageId, text, menu.keyboard);
    } else {
      await editMessage(chatId, messageId, `${menu.text}\n\n❌ Could not get status`, menu.keyboard);
    }
    return;
  }

  console.log(`Telegram: Soundbar ${actionName} - ${success ? 'success' : 'failed'}`);
  const menu = soundbarKeyboard();
  const statusText = success ? `✅ ${actionName}` : `❌ ${actionName} failed`;
  await editMessage(chatId, messageId, `${menu.text}\n\n${statusText}`, menu.keyboard);
}

/**
 * Handle weather actions
 */
async function handleWeatherAction(
  args: string[],
  chatId: number,
  messageId: number
): Promise<void> {
  // For refresh or any action, just show updated weather data
  const result = weatherKeyboard();
  await editMessage(chatId, messageId, result.text, result.keyboard);
}

/**
 * Handle automation confirmation callbacks (auto:yes:123 or auto:no:123)
 */
async function handleAutomationCallback(
  args: string[],
  chatId: number,
  messageId: number
): Promise<void> {
  const [response, pendingIdStr] = args;
  const pendingId = parseInt(pendingIdStr);

  if (isNaN(pendingId)) {
    await editMessage(chatId, messageId, '❌ Invalid automation ID', backToMenuKeyboard());
    return;
  }

  const pending = getAutomationPending(pendingId);
  if (!pending) {
    await editMessage(chatId, messageId, '⏰ This automation prompt has expired.', backToMenuKeyboard());
    return;
  }

  if (response === 'yes') {
    updateAutomationPendingStatus(pendingId, 'confirmed');

    // Build context from pending data
    const context: TriggerContext = {
      deviceId: '',
      deviceName: pending.trigger_device_name || 'Unknown',
      room: pending.room,
      condition: 'confirmed',
    };

    // Execute the yes actions
    if (pending.telegram_action_yes) {
      const results = await executeConfirmedActions(
        pending.telegram_action_yes,
        context,
        pending.name
      );
      await editMessage(
        chatId,
        messageId,
        `✅ <b>Automation executed:</b>\n${results.join('\n')}`,
        backToMenuKeyboard()
      );
    } else {
      await editMessage(chatId, messageId, '✅ Confirmed (no actions defined)', backToMenuKeyboard());
    }

    console.log(`Telegram: Automation "${pending.name}" confirmed`);
  } else {
    updateAutomationPendingStatus(pendingId, 'declined');
    await editMessage(chatId, messageId, '❌ Automation cancelled', backToMenuKeyboard());
    console.log(`Telegram: Automation "${pending.name}" declined`);
  }
}

/**
 * Send status summary
 */
async function sendStatusMessage(chatId: number, messageId?: number): Promise<void> {
  const alarm = getAlarmConfig();
  const homeStatus = getHomeStatus();

  // Get device counts
  const db = getDb();
  const lampCount = (db.query("SELECT COUNT(*) as c FROM xiaomi_devices WHERE category LIKE 'yeelink%'").get() as { c: number }).c;
  const heaterCount = (db.query("SELECT COUNT(*) as c FROM devices WHERE category = 'wkf'").get() as { c: number }).c;

  // Get weather station data (indoor)
  let weatherTemp: number | null = null;
  let humidity = 'N/A';
  const weatherDevice = db.query(`SELECT last_status FROM devices WHERE category = 'wsdcg' LIMIT 1`).get() as { last_status: string | null } | null;
  if (weatherDevice?.last_status) {
    try {
      const ws = JSON.parse(weatherDevice.last_status);
      if (ws['103'] !== undefined) weatherTemp = ws['103'] / 100;
      if (ws['101'] !== undefined) humidity = `${(ws['101'] / 100).toFixed(0)}%`;
    } catch {}
  }

  // Get heater temps
  const heaters = db.query(`SELECT last_status FROM devices WHERE category = 'wkf' AND online = 1`).all() as { last_status: string | null }[];
  const heaterTemps: number[] = [];
  for (const h of heaters) {
    if (h.last_status) {
      try {
        const parsed = JSON.parse(h.last_status);
        if (parsed['5'] !== undefined) heaterTemps.push(parsed['5'] / 10);
      } catch {}
    }
  }

  // Weather station temp and heater avg temp as separate values
  const stationTemp = weatherTemp !== null ? `${weatherTemp.toFixed(1)}°C` : 'N/A';
  const heaterAvgTemp = heaterTemps.length > 0
    ? `${(heaterTemps.reduce((a, b) => a + b, 0) / heaterTemps.length).toFixed(1)}°C`
    : 'N/A';

  // Get roborock status
  let roborockState = 'Unknown';
  const roborockStatus = await getRoborockStatus();
  if (roborockStatus) {
    const stateMap: Record<number, string> = {
      3: 'Idle', 5: 'Cleaning', 6: 'Returning', 8: 'Charging', 10: 'Paused',
    };
    roborockState = stateMap[roborockStatus.state] || `State ${roborockStatus.state}`;
  }

  // Get purifier status with AQI
  let purifierAqi = 'N/A';
  let aqiLabel = '';
  const purifierStatus = await getPurifierStatus();
  if (purifierStatus) {
    purifierAqi = String(purifierStatus.aqi);
    if (purifierStatus.aqi <= 50) aqiLabel = 'Good';
    else if (purifierStatus.aqi <= 100) aqiLabel = 'Moderate';
    else aqiLabel = 'Poor';
  }

  const text = `📊 <b>Smart Home Status</b>

🌡️ Station: <b>${stationTemp}</b> · ${humidity}
🔥 Heaters: <b>${heaterAvgTemp}</b> avg
🌬️ Air Quality: <b>${purifierAqi}</b> ${aqiLabel}
🛡️ Alarm: <b>${alarm.armed ? '🔴 ARMED' : '🟢 Disarmed'}</b>
🤖 Vacuum: ${roborockState}${roborockStatus ? ` (${roborockStatus.battery}%)` : ''}`;

  const keyboard = {
    inline_keyboard: [[{ text: '« Back to Menu', callback_data: 'menu:main' }]],
  };

  if (messageId) {
    await editMessage(chatId, messageId, text, keyboard);
  } else {
    await sendMessage(chatId, text, keyboard);
  }
}
