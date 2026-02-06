/**
 * Automation Actions
 * Executes actions defined in automation rules
 */

import { getDb, logAutomation, createAutomationPending, type Automation } from '../db/database';
import { applyPresetToAllHeaters, applyTempToHeater } from '../scheduling/heater-schedule-service';
import { setPurifierPower, setPurifierMode } from '../xiaomi/air-purifier';
import { setSoundbarPower } from '../yamaha/yamaha-soundbar';
import { sendMessage, editMessage } from '../telegram/telegram-bot';
import { getTelegramConfig } from '../db/database';

export interface TriggerContext {
  deviceId: string;
  deviceName: string;
  room: string | null;
  condition: string;
}

export interface AutomationAction {
  type: string;
  target?: string;
  value?: string;
}

/**
 * Safely parse actions JSON with validation
 */
function safeParseActions(json: string): AutomationAction[] {
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) {
      console.error('Invalid automation actions: not an array');
      return [];
    }
    return parsed.filter(
      (a): a is AutomationAction =>
        typeof a === 'object' && a !== null && typeof a.type === 'string'
    );
  } catch (e: unknown) {
    const err = e as Error;
    console.error('Invalid automation actions JSON:', err.message);
    return [];
  }
}

/**
 * Execute all actions from an automation rule
 */
export async function executeAutomationActions(
  automation: Automation,
  context: TriggerContext
): Promise<void> {
  const actions = safeParseActions(automation.actions);
  if (actions.length === 0) {
    console.warn(`Automation "${automation.name}" has no valid actions`);
    return;
  }

  for (const action of actions) {
    if (action.type === 'telegram_prompt') {
      // Send Telegram prompt with buttons
      await sendTelegramPrompt(automation, context);
    } else {
      // Execute immediately
      await executeSingleAction(action, context, automation.name);
    }
  }
}

/**
 * Execute a single action
 */
export async function executeSingleAction(
  action: AutomationAction,
  context: TriggerContext,
  automationName: string
): Promise<boolean> {
  const actionDescription = `${action.type}${action.target ? `:${action.target}` : ''}${action.value ? `=${action.value}` : ''}`;

  try {
    let success = false;

    switch (action.type) {
      case 'set_heater_preset':
        if (action.target === 'all') {
          await applyPresetToAllHeaters(action.value || 'off');
          success = true;
        } else if (action.target === 'room' && context.room) {
          await applyHeaterPresetToRoom(context.room, action.value || 'off');
          success = true;
        }
        break;

      case 'set_heater_temp': {
        const temp = parseFloat(action.value || '5');
        if (action.target === 'room' && context.room) {
          await applyTempToRoom(context.room, temp);
          success = true;
        } else if (action.target && action.target !== 'room') {
          await applyTempToHeater(action.target, temp);
          success = true;
        }
        break;
      }

      case 'purifier_off':
        success = await setPurifierPower(false);
        break;

      case 'purifier_on':
        success = await setPurifierPower(true);
        if (success && action.value) {
          await setPurifierMode(action.value as 'auto' | 'silent' | 'favorite');
        }
        break;

      case 'purifier_mode':
        // Set purifier mode without changing power state
        if (action.value) {
          success = await setPurifierMode(action.value as 'auto' | 'silent' | 'favorite');
        }
        break;

      case 'soundbar_off':
        success = await setSoundbarPowerAll(false);
        break;

      case 'soundbar_on':
        success = await setSoundbarPowerAll(true);
        break;

      default:
        console.warn(`Unknown automation action type: ${action.type}`);
        return false;
    }

    logAutomation(automationName, context.deviceName, actionDescription, success ? 'success' : 'failed');
    console.log(`Automation "${automationName}": ${actionDescription} -> ${success ? 'success' : 'failed'}`);
    return success;
  } catch (error: any) {
    console.error(`Automation action failed: ${actionDescription}`, error.message);
    logAutomation(automationName, context.deviceName, actionDescription, 'error');
    return false;
  }
}

/**
 * Apply heater preset to all TRVs in a room
 */
async function applyHeaterPresetToRoom(room: string, presetId: string): Promise<void> {
  const db = getDb();
  const trvs = db.query("SELECT id FROM devices WHERE category = 'wkf' AND room = ?").all(room) as { id: string }[];

  const { getEffectiveTemp } = await import('../scheduling/heater-presets');

  for (const trv of trvs) {
    const temp = getEffectiveTemp(presetId, trv.id);
    await applyTempToHeater(trv.id, temp);
  }
}

/**
 * Apply temperature to all TRVs in a room
 */
async function applyTempToRoom(room: string, temp: number): Promise<void> {
  const db = getDb();
  const trvs = db.query("SELECT id FROM devices WHERE category = 'wkf' AND room = ?").all(room) as { id: string }[];

  for (const trv of trvs) {
    await applyTempToHeater(trv.id, temp);
  }
}

/**
 * Turn all soundbars on or off
 */
async function setSoundbarPowerAll(on: boolean): Promise<boolean> {
  const db = getDb();
  const soundbars = db.query('SELECT id FROM yamaha_devices').all() as { id: string }[];

  let anySuccess = false;
  for (const sb of soundbars) {
    const result = await setSoundbarPower(sb.id, on);
    if (result) anySuccess = true;
  }
  return anySuccess;
}

/**
 * Send Telegram prompt with Yes/No buttons
 */
async function sendTelegramPrompt(
  automation: Automation,
  context: TriggerContext
): Promise<void> {
  const config = getTelegramConfig();
  if (!config.enabled || !config.chat_id) {
    console.warn('Telegram not configured, skipping automation prompt');
    return;
  }

  // Create pending confirmation
  const pendingId = createAutomationPending(
    automation.id,
    context.deviceName,
    context.room
  );

  // Format message
  let message = automation.telegram_prompt || 'Automation triggered';
  message = message
    .replace('{device}', context.deviceName)
    .replace('{room}', context.room || 'Unknown');

  const keyboard = {
    inline_keyboard: [
      [
        { text: '✅ Yes', callback_data: `auto:yes:${pendingId}` },
        { text: '❌ No', callback_data: `auto:no:${pendingId}` },
      ],
    ],
  };

  await sendMessage(config.chat_id, message, keyboard);
  logAutomation(automation.name, context.deviceName, 'telegram_prompt', 'sent');
}

/**
 * Execute actions from Telegram confirmation
 */
export async function executeConfirmedActions(
  actionsJson: string,
  context: TriggerContext,
  automationName: string
): Promise<string[]> {
  const actions = safeParseActions(actionsJson);
  const results: string[] = [];

  for (const action of actions) {
    const success = await executeSingleAction(action, context, automationName);
    results.push(`${action.type}: ${success ? '✅' : '❌'}`);
  }

  return results;
}
