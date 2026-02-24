# Smart Home

A self-hosted home automation system with local-only device control — no cloud dependencies. Controls Xiaomi lights, Tuya Zigbee sensors, Yamaha soundbar, Xiaomi air purifier, and Roborock vacuum through a unified web dashboard.

> **Note:** This project is created entirely by artificial intelligence models (Claude, Anthropic) as part of a test exploring AI-driven software development. All code — backend, frontend, bridge, tests, CI, and infrastructure — was written by AI.

## Supported Devices

| Device | Protocol | Capabilities |
|--------|----------|-------------|
| **Xiaomi Yeelight Lamps** | MiOT (LAN) | Power, brightness, color temperature, presets |
| **Xiaomi Air Purifier 3C** | MiOT (LAN) | Power, mode, fan speed, LED, AQI monitoring, filter life |
| **Tuya Zigbee TRVs** | Tuya Local DPS | Temperature control, scheduling, presets |
| **Tuya Door/Window Sensors** | Tuya Local DPS | Open/close state, alarm triggers |
| **Tuya Water Leak Sensors** | Tuya Local DPS | Flood detection, alarm triggers |
| **Tuya Weather Station** | Tuya Local DPS | Temperature, humidity, battery |
| **Yamaha Soundbar** | Yamaha API (LAN) | Power, volume, subwoofer, input, sound programs |
| **Roborock Vacuum** | Roborock RPC (LAN) | Start/pause/stop/dock, room cleaning, fan/mop modes, consumables |

## Architecture

```
                       ┌──────────────┐
                       │   nginx :80  │
                       │  (frontend)  │
                       └──────┬───────┘
                              │ /api/* proxy
                       ┌──────▼───────┐        ┌───────────────────┐
                       │  Bun + Hono  │        │  Python + FastAPI  │
                       │  Backend     │───────►│  Roborock Bridge   │
                       │  :3001       │        │  :3002             │
                       └──────┬───────┘        └───────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
        ┌─────▼─────┐  ┌─────▼─────┐  ┌──────▼──────┐
        │ Tuya Local │  │  Xiaomi   │  │   Yamaha    │
        │ (Zigbee    │  │  MiOT     │  │   (HTTP)    │
        │  Gateway)  │  │  (miio)   │  │             │
        └───────────┘  └───────────┘  └─────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | SvelteKit 2, Svelte 5 (runes), Tailwind CSS 4, Vite 6 |
| Backend | Bun, Hono, SQLite (bun:sqlite), Zod |
| Roborock Bridge | Python 3.13, FastAPI, uvicorn |
| Real-time | WebSocket |
| Icons | lucide-svelte |
| CI | GitHub Actions |
| Deployment | Docker Compose or NSSM on Windows |

## Features

- **Dashboard** — unified view of all devices with real-time WebSocket updates
- **Lighting Control** — presets (day/night/moonlight), time-based scheduling, per-lamp brightness and color temperature
- **Climate Control** — TRV presets, temperature scheduling with time windows
- **Automations** — trigger-based rules on device state changes (door open, flood detected, AQI threshold), with configurable actions and quiet windows
- **Telegram Integration** — alert notifications (flood, door, errors), interactive confirmation prompts for automation actions
- **Alarm System** — door and flood alarms with acknowledgment tracking
- **Vacuum Control** — room-specific cleaning, fan/mop modes, consumable tracking
- **Air Quality** — AQI monitoring with threshold-based automations

## Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard — all devices, quick access cards, home status |
| `/lighting` | Lamp presets, schedules, pending actions |
| `/heater-schedule` | Heater presets, temperature schedules |
| `/automations` | Automation rules editor, activity log |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (backend + frontend build)
- [Python 3.13+](https://python.org) with [uv](https://github.com/astral-sh/uv) (Roborock bridge)
- Tuya Zigbee gateway on local network
- Devices paired and accessible on LAN

### Environment Variables

Create a `.env` file in the project root:

```env
# Tuya (Zigbee gateway)
TUYA_ACCESS_ID=...
TUYA_ACCESS_SECRET=...
TUYA_REGION=eu
TUYA_GATEWAY_ID=...

# Roborock
ROBOROCK_IP=...
ROBOROCK_LOCAL_KEY=...
ROBOROCK_ROOM_NAMES={"1":"Living Room","2":"Kitchen"}

# Telegram (optional)
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...

# Auth (optional)
AUTH_TOKEN=...

# Database
DB_PATH=./data/smart-home.db
```

### Development

```bash
# Install dependencies
bun install
bun install --cwd backend
bun install --cwd frontend

# Start backend
bun run --cwd backend src/index.ts

# Start frontend dev server
bun run --cwd frontend dev

# Start roborock bridge
cd roborock-bridge && uv run uvicorn main:app --port 3002
```

### Docker

```bash
docker compose up -d
```

This starts all three services (frontend on :80, backend on :3001, roborock bridge on :3002).

## Testing

```bash
# Backend (229 tests)
bun run --cwd backend test

# Frontend (80 tests)
bun run --cwd frontend test

# Lint
bun run lint

# Typecheck
bun run --cwd backend tsc --noEmit
```

## API

All endpoints under `/api/*` require `Authorization: Bearer <AUTH_TOKEN>` when `AUTH_TOKEN` is set.

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Service health check |
| `/api/devices` | Tuya device discovery and status |
| `/api/xiaomi` | Lamp control |
| `/api/yamaha` | Soundbar control |
| `/api/roborock` | Vacuum control (proxied to bridge) |
| `/api/purifier` | Air purifier control |
| `/api/presets` | Lamp and heater presets |
| `/api/heater` | TRV scheduling |
| `/api/sensors` | Sensor readings and history |
| `/api/automations` | Automation CRUD and logs |
| `/api/alarm` | Alarm config and active alarms |
| `/api/telegram` | Telegram bot configuration |
| `/api/admin` | System diagnostics |
| `WS /ws` | Real-time device state updates |

## License

Private project — not licensed for redistribution.
