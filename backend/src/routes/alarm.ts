import { Hono } from 'hono';
import {
  getAlarmConfig,
  setAlarmArmed,
  getActiveAlarms,
  acknowledgeAlarm,
  acknowledgeAllAlarms,
} from '../db/database';
import { logger } from '../utils/logger';

const alarm = new Hono();

// Get alarm status
alarm.get('/', (c) => {
  const config = getAlarmConfig();
  return c.json(config);
});

// Arm alarm
alarm.post('/arm', (c) => {
  const config = setAlarmArmed(true);
  logger.info('Alarm ARMED', { component: 'alarm-route' });
  return c.json(config);
});

// Disarm alarm
alarm.post('/disarm', (c) => {
  const config = setAlarmArmed(false);
  logger.info('Alarm DISARMED', { component: 'alarm-route' });
  return c.json(config);
});

// Get active alarms
alarm.get('/active', (c) => {
  const alarms = getActiveAlarms();
  return c.json(alarms);
});

// Acknowledge single alarm
alarm.post('/acknowledge/:id', (c) => {
  const id = parseInt(c.req.param('id'));
  acknowledgeAlarm(id, 'api');
  return c.json({ success: true });
});

// Acknowledge all alarms
alarm.post('/acknowledge-all', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const count = acknowledgeAllAlarms(body.type, 'api');
  return c.json({ success: true, acknowledged: count });
});

export default alarm;
