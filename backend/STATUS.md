# Smart Home Backend - Status

## Devices

### Tuya (12 devices) - Local + Cloud API
| Category | Count | Type |
|----------|-------|------|
| wkf | 5 | TRV (radiator valves) |
| mcs | 2 | Door/window sensors |
| sj | 2 | Water leak sensors |
| wfcon | 1 | Zigbee gateway |
| wsdcg | 1 | Temp/humidity sensor |
| cz | 1 | Smart plug |

**Control:** `tuya-local.ts` (primary), `tuya-api.ts` (cloud fallback)

### Xiaomi (8 devices) - Local miio/MIoT
| Category | Count | Type |
|----------|-------|------|
| lamp | 7 | Yeelight ceiling lamps |
| purifier | 1 | Mi Air Purifier 3C |

**Control:**
- Lamps: `xiaomi-lamp.ts` (miio protocol)
- Purifier: `air-purifier.ts` (MIoT protocol)

### Yamaha (1 device) - YXC HTTP API
| Name | Model | IP |
|------|-------|-----|
| Soundbar | YAS-306 | 10.10.10.150 |

**Control:** `yamaha-soundbar.ts` (Yamaha Extended Control API)
**Features:** power, volume, mute, input, sound program

### Roborock (1 device) - python-roborock
| Name | Model | IP |
|------|-------|-----|
| Mania | roborock.vacuum.a51 (S8) | 10.10.10.120 |

**Control:** `roborock` CLI (python-roborock)

## Architecture

```
src/
├── index.ts          # Hono API server
├── config.ts         # Environment config
├── db/
│   └── database.ts   # SQLite (bun:sqlite)
├── tuya/
│   ├── tuya-local.ts # Local TuyAPI control
│   ├── tuya-api.ts   # Cloud API fallback
│   ├── device-config.ts
│   ├── discover.ts
│   └── fetch-devices.ts
├── xiaomi/
│   ├── xiaomi-lamp.ts    # Yeelight control
│   ├── air-purifier.ts   # Purifier control
│   ├── xiaomi-discover.ts
│   └── add-device.ts     # CLI to add devices
└── yamaha/
    ├── yamaha-client.ts   # YXC HTTP client
    ├── yamaha-soundbar.ts # Soundbar control
    ├── yamaha-types.ts    # TypeScript types
    └── add-device.ts      # CLI to add devices
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| GET | /api/devices | List all Tuya devices |
| GET | /api/devices/:id | Get device |
| PATCH | /api/devices/:id | Update device |
| POST | /api/devices/:id/control | Control device |
| GET | /api/devices/:id/status | Get status |
| GET | /api/rooms | List rooms |
| GET | /api/yamaha | List Yamaha devices |
| GET | /api/yamaha/:id | Get Yamaha device |
| GET | /api/yamaha/:id/status | Get soundbar status |
| GET | /api/yamaha/:id/info | Get device info |
| POST | /api/yamaha/:id/control | Control soundbar |

## CLI Tools

```bash
# Tuya
bun src/tuya/fetch-devices.ts     # Sync from cloud
bun src/tuya/discover.ts          # Discover local

# Xiaomi
bun src/xiaomi/add-device.ts <id> <name> <ip> <token> <model> <category> [room]
bun src/xiaomi/xiaomi-discover.ts # Discover miio devices

# Yamaha
bun src/yamaha/add-device.ts <id> <name> <ip> [model] [room]

# Roborock
roborock login
roborock discover
roborock status --device_id <id>
roborock command --device_id <id> --cmd app_start
roborock command --device_id <id> --cmd app_charge
```

### Yamaha Control Examples

```bash
# Get status
curl http://localhost:3001/api/yamaha/yas306/status

# Control (all fields optional)
curl -X POST http://localhost:3001/api/yamaha/yas306/control \
  -H "Content-Type: application/json" \
  -d '{"power":true,"volume":30,"mute":false,"input":"hdmi","sound_program":"movie"}'
```

**Inputs:** `tv`, `hdmi`, `optical1`, `optical2`, `coaxial`, `analog`, `bluetooth`
**Sound programs:** `stereo`, `movie`, `music`, `sports`, `game`, `3d_surround`

## Database

SQLite at `data/smart-home.db`:
- `devices` - Tuya devices
- `xiaomi_devices` - Xiaomi + Roborock devices
- `yamaha_devices` - Yamaha soundbars/speakers
- `device_history` - Status history
- `rooms` - Room definitions
