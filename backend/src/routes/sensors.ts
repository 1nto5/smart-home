import { Hono } from 'hono';
import { getDb } from '../db/database';
import { translateName } from '../utils/translations';
import { computeHomeStatus } from '../db/home-status';

const sensors = new Hono();

// Get sensor history
sensors.get('/history', (c) => {
  const db = getDb();
  const deviceId = c.req.query('device_id');
  const from = c.req.query('from');
  const to = c.req.query('to');
  const limit = Math.min(parseInt(c.req.query('limit') || '100'), 1000);

  let query = 'SELECT * FROM sensor_history WHERE 1=1';
  const params: (string | number)[] = [];

  if (deviceId) {
    query += ' AND device_id = ?';
    params.push(deviceId);
  }
  if (from) {
    query += ' AND recorded_at >= ?';
    params.push(from);
  }
  if (to) {
    query += ' AND recorded_at <= ?';
    params.push(to);
  }

  query += ' ORDER BY recorded_at DESC LIMIT ?';
  params.push(limit);

  const history = db.query(query).all(...params);
  return c.json(history);
});

// Get averaged sensor readings
sensors.get('/history/averaged', (c) => {
  const db = getDb();
  const deviceId = c.req.query('device_id');
  const interval = c.req.query('interval') || 'hour';
  const from = c.req.query('from');
  const to = c.req.query('to');

  const ALLOWED_FORMATS: Record<string, string> = {
    day: '%Y-%m-%d',
    hour: '%Y-%m-%d %H:00',
  };
  const dateFormat = ALLOWED_FORMATS[interval] ?? '%Y-%m-%d %H:00';

  let query = `
    SELECT
      device_id,
      device_name,
      strftime(?, recorded_at) as period,
      AVG(temperature) as avg_temperature,
      AVG(humidity) as avg_humidity,
      AVG(target_temp) as avg_target_temp,
      MIN(temperature) as min_temperature,
      MAX(temperature) as max_temperature,
      COUNT(*) as reading_count
    FROM sensor_history
    WHERE 1=1
  `;
  const params: (string | number)[] = [dateFormat];

  if (deviceId) {
    query += ' AND device_id = ?';
    params.push(deviceId);
  }
  if (from) {
    query += ' AND recorded_at >= ?';
    params.push(from);
  }
  if (to) {
    query += ' AND recorded_at <= ?';
    params.push(to);
  }

  query += ` GROUP BY device_id, period ORDER BY period DESC`;

  const history = db.query(query).all(...params);
  return c.json(history);
});

// Get all sensors with latest readings
sensors.get('/', (c) => {
  const db = getDb();
  const sensorList = db.query(`
    SELECT d.id, d.name, d.category, d.room, d.last_status,
      (SELECT temperature FROM sensor_history WHERE device_id = d.id ORDER BY recorded_at DESC LIMIT 1) as latest_temp,
      (SELECT humidity FROM sensor_history WHERE device_id = d.id ORDER BY recorded_at DESC LIMIT 1) as latest_humidity,
      (SELECT recorded_at FROM sensor_history WHERE device_id = d.id ORDER BY recorded_at DESC LIMIT 1) as latest_reading_at
    FROM devices d
    WHERE d.category IN ('wsdcg', 'wkf', 'sj', 'mcs')
    ORDER BY d.room, d.name
  `).all() as Record<string, unknown>[];
  const translated = sensorList.map(s => ({ ...s, name: translateName(s.name as string) }));
  return c.json(translated);
});

// Get contact history
sensors.get('/contacts/history', (c) => {
  const db = getDb();
  const deviceId = c.req.query('device_id');
  const from = c.req.query('from');
  const to = c.req.query('to');
  const limit = Math.min(parseInt(c.req.query('limit') || '100'), 1000);

  let query = 'SELECT * FROM contact_history WHERE 1=1';
  const params: (string | number)[] = [];

  if (deviceId) {
    query += ' AND device_id = ?';
    params.push(deviceId);
  }
  if (from) {
    query += ' AND recorded_at >= ?';
    params.push(from);
  }
  if (to) {
    query += ' AND recorded_at <= ?';
    params.push(to);
  }

  query += ' ORDER BY recorded_at DESC LIMIT ?';
  params.push(limit);

  const history = db.query(query).all(...params);
  return c.json(history);
});

// Get home status
sensors.get('/home-status', (c) => {
  return c.json(computeHomeStatus());
});

export default sensors;
