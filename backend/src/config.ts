export const config = {
  tuya: {
    accessId: Bun.env.TUYA_ACCESS_ID || '',
    accessSecret: Bun.env.TUYA_ACCESS_SECRET || '',
    region: Bun.env.TUYA_REGION || 'eu',
    gatewayId: Bun.env.TUYA_GATEWAY_ID || '',
  },
  server: {
    port: parseInt(Bun.env.SERVER_PORT || '3001'),
  },
  db: {
    path: Bun.env.DB_PATH || '../data/smart-home.db',
  },
  roborock: {
    bridgeUrl: Bun.env.ROBOROCK_BRIDGE_URL || 'http://roborock:3002',
  },
  auth: {
    token: Bun.env.AUTH_TOKEN || '',
  },
  retention: {
    sensorHistoryDays: parseInt(Bun.env.RETENTION_SENSOR_DAYS || '90'),
    deviceHistoryDays: parseInt(Bun.env.RETENTION_DEVICE_DAYS || '30'),
    contactHistoryDays: parseInt(Bun.env.RETENTION_CONTACT_DAYS || '180'),
    telegramLogDays: parseInt(Bun.env.RETENTION_TELEGRAM_DAYS || '30'),
    automationLogDays: parseInt(Bun.env.RETENTION_AUTOMATION_DAYS || '30'),
  },
};
