export const config = {
  tuya: {
    accessId: Bun.env.TUYA_ACCESS_ID || '',
    accessSecret: Bun.env.TUYA_ACCESS_SECRET || '',
    region: Bun.env.TUYA_REGION || 'eu',
  },
  server: {
    port: parseInt(Bun.env.SERVER_PORT || '3001'),
  },
  db: {
    path: Bun.env.DB_PATH || '../data/smart-home.db',
  },
};
