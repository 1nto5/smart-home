import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { AirPurifierControlSchema } from '../validation/schemas';
import {
  getPurifierStatus,
  setPurifierPower,
  setPurifierMode,
  setPurifierFanSpeed,
  setLedBrightness,
} from '../xiaomi/air-purifier';

const purifier = new Hono();

// Get air purifier status
purifier.get('/status', async (c) => {
  const status = await getPurifierStatus();
  if (!status) {
    return c.json({ error: 'Failed to get status' }, 500);
  }
  return c.json(status);
});

// Control air purifier
purifier.post('/control', zValidator('json', AirPurifierControlSchema), async (c) => {
  const body = c.req.valid('json');
  const results: Record<string, boolean> = {};

  if (body.power !== undefined) {
    results.power = await setPurifierPower(body.power);
  }
  if (body.mode !== undefined) {
    results.mode = await setPurifierMode(body.mode);
  }
  if (body.fan_speed !== undefined) {
    results.fan_speed = await setPurifierFanSpeed(body.fan_speed);
  }
  if (body.led_brightness !== undefined) {
    results.led_brightness = await setLedBrightness(body.led_brightness);
  }

  const allSuccess = Object.values(results).every((v) => v);
  return c.json({ success: allSuccess, results });
});

export default purifier;
