import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { TelegramConfigSchema, TelegramTestSchema } from '../validation/schemas';
import { getTelegramConfig, updateTelegramConfig, getTelegramLog } from '../db/database';
import { sendTestTelegram } from '../notifications/telegram-service';

const telegram = new Hono();

// Get Telegram config (hide token)
telegram.get('/config', (c) => {
  const config = getTelegramConfig();
  return c.json({
    ...config,
    bot_token: config.bot_token ? '********' : null,
  });
});

// Update Telegram config
telegram.patch('/config', zValidator('json', TelegramConfigSchema), async (c) => {
  const body = c.req.valid('json');
  const config = updateTelegramConfig(body);

  console.log('Telegram config updated:', {
    enabled: config.enabled,
    hasToken: !!config.bot_token,
    hasChatId: !!config.chat_id,
    floodAlerts: config.flood_alerts,
    doorAlerts: config.door_alerts,
    errorAlerts: config.error_alerts,
  });

  return c.json({
    ...config,
    bot_token: config.bot_token ? '********' : null,
  });
});

// Send test message
telegram.post('/test', zValidator('json', TelegramTestSchema), async (c) => {
  const body = c.req.valid('json');
  const message = body.message || '🏠 Test message from Smart Home';

  const result = await sendTestTelegram(message);
  if (result.success) {
    return c.json({ success: true, message: 'Test message sent' });
  } else {
    return c.json({ success: false, error: result.error }, 500);
  }
});

// Get notification log
telegram.get('/log', (c) => {
  const limit = parseInt(c.req.query('limit') || '50');
  const log = getTelegramLog(limit);
  return c.json(log);
});

export default telegram;
