import {
  getTelegramConfig,
  getUpdateOffset,
  setUpdateOffset,
} from '../db/database';
import { handleCommand, handleCallbackQuery } from './telegram-handlers';

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: { id: number; first_name: string };
    chat: { id: number; type: string };
    date: number;
    text?: string;
  };
  callback_query?: {
    id: string;
    from: { id: number; first_name: string };
    message: {
      message_id: number;
      chat: { id: number };
    };
    data: string;
  };
}

let isPolling = false;
let pollInterval: Timer | null = null;
let watchdogInterval: Timer | null = null;
let lastPollTime = 0;
const WATCHDOG_TIMEOUT_MS = 30000; // 30 seconds

/**
 * Fetch updates from Telegram Bot API
 */
async function getUpdates(botToken: string, offset: number): Promise<TelegramUpdate[]> {
  try {
    const url = `https://api.telegram.org/bot${botToken}/getUpdates?offset=${offset}&timeout=5`;
    const response = await fetch(url);
    const data = await response.json() as { ok: boolean; result: TelegramUpdate[] };

    if (data.ok) {
      return data.result;
    }
    return [];
  } catch (error: any) {
    console.error('Telegram getUpdates error:', error.message);
    return [];
  }
}

/**
 * Process a single update
 */
async function processUpdate(update: TelegramUpdate): Promise<void> {
  const config = getTelegramConfig();

  // Verify chat_id for security
  if (update.message) {
    const chatId = update.message.chat.id.toString();
    if (chatId !== config.chat_id) {
      console.log(`Ignoring message from unauthorized chat: ${chatId}`);
      return;
    }

    // Handle text command
    if (update.message.text) {
      await handleCommand(update.message.text, update.message.chat.id, update.message.message_id);
    }
  }

  if (update.callback_query) {
    const chatId = update.callback_query.message.chat.id.toString();
    if (chatId !== config.chat_id) {
      console.log(`Ignoring callback from unauthorized chat: ${chatId}`);
      return;
    }

    // Handle inline button callback
    await handleCallbackQuery(
      update.callback_query.id,
      update.callback_query.data,
      update.callback_query.message.chat.id,
      update.callback_query.message.message_id
    );
  }
}

/**
 * Poll for updates
 */
async function pollUpdates(): Promise<void> {
  if (isPolling) return;

  const config = getTelegramConfig();
  if (!config.enabled || !config.bot_token || !config.chat_id) {
    return;
  }

  isPolling = true;

  try {
    const offset = getUpdateOffset();
    const updates = await getUpdates(config.bot_token, offset);

    for (const update of updates) {
      await processUpdate(update);
      setUpdateOffset(update.update_id + 1);
    }

    // Mark successful poll for watchdog
    lastPollTime = Date.now();
  } catch (error: any) {
    console.error('Poll updates error:', error.message);
  } finally {
    isPolling = false;
  }
}

/**
 * Watchdog: restart polling if stalled
 */
function checkPollingHealth(): void {
  const config = getTelegramConfig();
  if (!config.enabled || !config.bot_token || !config.chat_id) {
    return;
  }

  const timeSinceLastPoll = Date.now() - lastPollTime;

  if (lastPollTime > 0 && timeSinceLastPoll > WATCHDOG_TIMEOUT_MS) {
    console.warn(`🐕 Telegram watchdog: polling stalled (${Math.round(timeSinceLastPoll / 1000)}s), restarting...`);

    // Reset state
    isPolling = false;

    // Clear and restart polling interval
    if (pollInterval) {
      clearInterval(pollInterval);
    }
    pollInterval = setInterval(pollUpdates, 2000);
    pollUpdates();

    console.log('🐕 Telegram watchdog: polling restarted');
  }
}

/**
 * Start Telegram bot polling
 */
export function startTelegramBot(): void {
  const config = getTelegramConfig();

  if (!config.enabled || !config.bot_token || !config.chat_id) {
    console.log('🤖 Telegram bot not configured, skipping');
    return;
  }

  console.log('🤖 Starting Telegram bot polling...');

  // Initialize watchdog timestamp
  lastPollTime = Date.now();

  // Poll every 2 seconds
  pollInterval = setInterval(pollUpdates, 2000);

  // Watchdog checks every 30 seconds
  watchdogInterval = setInterval(checkPollingHealth, WATCHDOG_TIMEOUT_MS);

  // Initial poll
  pollUpdates();
}

/**
 * Stop Telegram bot polling
 */
export function stopTelegramBot(): void {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
  if (watchdogInterval) {
    clearInterval(watchdogInterval);
    watchdogInterval = null;
  }
  console.log('🤖 Telegram bot stopped');
}

/**
 * Send message with inline keyboard
 */
export async function sendMessage(
  chatId: number | string,
  text: string,
  replyMarkup?: any
): Promise<boolean> {
  const config = getTelegramConfig();
  if (!config.bot_token) return false;

  try {
    const url = `https://api.telegram.org/bot${config.bot_token}/sendMessage`;
    const body: any = {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    };

    if (replyMarkup) {
      body.reply_markup = replyMarkup;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json() as { ok: boolean };
    return data.ok;
  } catch (error: any) {
    console.error('sendMessage error:', error.message);
    return false;
  }
}

/**
 * Edit existing message
 */
export async function editMessage(
  chatId: number | string,
  messageId: number,
  text: string,
  replyMarkup?: any
): Promise<boolean> {
  const config = getTelegramConfig();
  if (!config.bot_token) return false;

  try {
    const url = `https://api.telegram.org/bot${config.bot_token}/editMessageText`;
    const body: any = {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
    };

    if (replyMarkup) {
      body.reply_markup = replyMarkup;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json() as { ok: boolean };
    return data.ok;
  } catch (error: any) {
    console.error('editMessage error:', error.message);
    return false;
  }
}

/**
 * Answer callback query (required to stop loading indicator)
 */
export async function answerCallbackQuery(
  callbackQueryId: string,
  text?: string
): Promise<boolean> {
  const config = getTelegramConfig();
  if (!config.bot_token) return false;

  try {
    const url = `https://api.telegram.org/bot${config.bot_token}/answerCallbackQuery`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
      }),
    });

    const data = await response.json() as { ok: boolean };
    return data.ok;
  } catch (error: any) {
    console.error('answerCallbackQuery error:', error.message);
    return false;
  }
}
