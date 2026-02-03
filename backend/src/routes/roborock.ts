import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import {
  RoborockCommandSchema,
  RoborockVolumeSchema,
  RoborockFanSpeedSchema,
  RoborockMopModeSchema,
  RoborockCleanSegmentsSchema,
  RoborockResetConsumableSchema,
} from '../validation/schemas';
import {
  getStatus,
  startCleaning,
  pauseCleaning,
  stopCleaning,
  goHome,
  findMe,
  getCleanSummary,
  getRooms,
  getVolume,
  setVolume,
  setFanSpeed,
  setMopMode,
  cleanSegments,
  getConsumables,
  resetConsumable,
} from '../roborock/roborock';

const roborock = new Hono();

// Get Roborock status
roborock.get('/status', async (c) => {
  const status = await getStatus();
  if (!status) {
    return c.json({ error: 'Failed to get status (is bridge running?)' }, 500);
  }
  return c.json(status);
});

// Get clean summary
roborock.get('/summary', async (c) => {
  const summary = await getCleanSummary();
  if (!summary) {
    return c.json({ error: 'Failed to get summary' }, 500);
  }
  return c.json(summary);
});

// Send command
roborock.post('/command', zValidator('json', RoborockCommandSchema), async (c) => {
  const { cmd } = c.req.valid('json');

  let success = false;
  switch (cmd) {
    case 'start':
      success = await startCleaning();
      break;
    case 'pause':
      success = await pauseCleaning();
      break;
    case 'stop':
      success = await stopCleaning();
      break;
    case 'home':
      success = await goHome();
      break;
    case 'find':
      success = await findMe();
      break;
  }

  return c.json({ success, command: cmd });
});

// Get rooms
roborock.get('/rooms', async (c) => {
  const rooms = await getRooms();
  if (!rooms) {
    return c.json({ error: 'Failed to get rooms' }, 500);
  }
  return c.json(rooms);
});

// Get volume
roborock.get('/volume', async (c) => {
  const vol = await getVolume();
  if (!vol) {
    return c.json({ error: 'Failed to get volume' }, 500);
  }
  return c.json(vol);
});

// Set volume
roborock.post('/volume', zValidator('json', RoborockVolumeSchema), async (c) => {
  const { volume } = c.req.valid('json');
  const success = await setVolume(volume);
  return c.json({ success, volume });
});

// Set fan speed
roborock.post('/fan-speed', zValidator('json', RoborockFanSpeedSchema), async (c) => {
  const { mode } = c.req.valid('json');
  const success = await setFanSpeed(mode);
  return c.json({ success, mode });
});

// Set mop mode
roborock.post('/mop-mode', zValidator('json', RoborockMopModeSchema), async (c) => {
  const { mode } = c.req.valid('json');
  const success = await setMopMode(mode);
  return c.json({ success, mode });
});

// Clean segments
roborock.post('/clean-segments', zValidator('json', RoborockCleanSegmentsSchema), async (c) => {
  const { segments } = c.req.valid('json');
  const success = await cleanSegments(segments);
  return c.json({ success, segments });
});

// Get consumables
roborock.get('/consumables', async (c) => {
  const consumables = await getConsumables();
  if (!consumables) {
    return c.json({ error: 'Failed to get consumables' }, 500);
  }
  return c.json(consumables);
});

// Reset consumable
roborock.post('/reset-consumable', zValidator('json', RoborockResetConsumableSchema), async (c) => {
  const { consumable } = c.req.valid('json');
  const success = await resetConsumable(consumable);
  if (!success) {
    return c.json({ error: 'Failed to reset consumable' }, 500);
  }
  return c.json({ success: true });
});

export default roborock;
