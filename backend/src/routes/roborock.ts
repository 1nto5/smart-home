import { Hono } from 'hono';
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
roborock.post('/command', async (c) => {
  const body = await c.req.json();
  const cmd = body.cmd;

  if (!cmd) {
    return c.json({ error: 'cmd required (start, pause, stop, home, find)' }, 400);
  }

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
    default:
      return c.json({ error: `Unknown command: ${cmd}` }, 400);
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
roborock.post('/volume', async (c) => {
  const { volume } = await c.req.json();
  if (typeof volume !== 'number' || volume < 0 || volume > 100) {
    return c.json({ error: 'volume must be 0-100' }, 400);
  }
  const success = await setVolume(volume);
  return c.json({ success, volume });
});

// Set fan speed
roborock.post('/fan-speed', async (c) => {
  const { mode } = await c.req.json();
  if (typeof mode !== 'number' || mode < 101 || mode > 104) {
    return c.json({ error: 'mode must be 101-104' }, 400);
  }
  const success = await setFanSpeed(mode);
  return c.json({ success, mode });
});

// Set mop mode
roborock.post('/mop-mode', async (c) => {
  const { mode } = await c.req.json();
  if (typeof mode !== 'number' || mode < 200 || mode > 203) {
    return c.json({ error: 'mode must be 200-203' }, 400);
  }
  const success = await setMopMode(mode);
  return c.json({ success, mode });
});

// Clean segments
roborock.post('/clean-segments', async (c) => {
  const { segments } = await c.req.json();
  if (!Array.isArray(segments) || segments.length === 0) {
    return c.json({ error: 'segments array required' }, 400);
  }
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
roborock.post('/reset-consumable', async (c) => {
  const body = await c.req.json<{ consumable: string }>();
  const success = await resetConsumable(body.consumable);
  if (!success) {
    return c.json({ error: 'Failed to reset consumable' }, 500);
  }
  return c.json({ success: true });
});

export default roborock;
