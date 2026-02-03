export const config = {
  tuya: {
    accessId: Bun.env.TUYA_ACCESS_ID || '',
    accessSecret: Bun.env.TUYA_ACCESS_SECRET || '',
    region: Bun.env.TUYA_REGION || 'eu',
    gatewayId: Bun.env.TUYA_GATEWAY_ID || 'bf889f95067d327853rwzw',
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
};
