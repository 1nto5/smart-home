import { getLamps, getRoborockStatus, getSchedules, getPendingActions, getTuyaDevices, getYamahaDevices, getAirPurifierStatus, getHeaterPresets, getHeaterSchedules, getPendingHeaterActions, getHeaterOverride, getHomeStatus } from './api';
import type { Lamp, RoborockStatus, Schedule, PendingAction, LampStatus, TuyaDevice, YamahaDevice, AirPurifierStatus, HeaterPreset, HeaterSchedule, PendingHeaterAction, HeaterOverride, HomeStatusData } from './types';
import { AUTH_TOKEN } from './config';

// WebSocket connection state
let ws: WebSocket | null = null;
let wsReconnectDelay = 1000;

// Use object with properties for Svelte 5 module state
function createStore() {
  let lamps = $state<Lamp[]>([]);
  let lampStatuses = $state<Map<string, LampStatus>>(new Map());
  let roborock = $state<RoborockStatus | null>(null);
  let schedules = $state<Schedule[]>([]);
  let pendingActions = $state<PendingAction[]>([]);
  let tuyaDevices = $state<TuyaDevice[]>([]);
  let yamahaDevices = $state<YamahaDevice[]>([]);
  let airPurifier = $state<AirPurifierStatus | null>(null);
  let heaterPresets = $state<HeaterPreset[]>([]);
  let heaterSchedules = $state<HeaterSchedule[]>([]);
  let pendingHeaterActions = $state<PendingHeaterAction[]>([]);
  let heaterOverride = $state<HeaterOverride | null>(null);
  let homeStatus = $state<HomeStatusData | null>(null);
  let loading = $state(false);
  let initialLoadComplete = $state(false);
  let error = $state<string | null>(null);
  let wsConnected = $state(false);

  function connectWebSocket() {
    if (ws?.readyState === WebSocket.OPEN) return;

    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const tokenParam = AUTH_TOKEN ? `?token=${encodeURIComponent(AUTH_TOKEN)}` : '';
    ws = new WebSocket(`${protocol}//${location.host}/ws${tokenParam}`);

    ws.onopen = () => {
      console.log('WebSocket connected');
      wsConnected = true;
      wsReconnectDelay = 1000;
    };

    ws.onclose = () => {
      console.log(`WebSocket disconnected, reconnecting in ${wsReconnectDelay}ms`);
      wsConnected = false;
      setTimeout(connectWebSocket, wsReconnectDelay);
      wsReconnectDelay = Math.min(wsReconnectDelay * 2, 30000);
    };

    ws.onerror = () => {
      ws?.close();
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        // Lamp status
        if (msg.type === 'lamp_status' && msg.deviceId && msg.status) {
          const newStatuses = new Map(lampStatuses);
          newStatuses.set(msg.deviceId, msg.status);
          lampStatuses = newStatuses;
          lamps = lamps.map(l => l.id === msg.deviceId ? { ...l, online: 1 } : l);
        } else if (msg.type === 'lamp_offline' && msg.deviceId) {
          const newStatuses = new Map(lampStatuses);
          newStatuses.delete(msg.deviceId);
          lampStatuses = newStatuses;
          lamps = lamps.map(l => l.id === msg.deviceId ? { ...l, online: 0 } : l);
        }

        // Tuya devices (sensors, heaters, doors)
        else if (msg.type === 'tuya_status' && msg.deviceId && msg.status) {
          tuyaDevices = tuyaDevices.map(d =>
            d.id === msg.deviceId
              ? { ...d, last_status: JSON.stringify(msg.status), online: 1 }
              : d
          );
        } else if (msg.type === 'tuya_offline' && msg.deviceId) {
          tuyaDevices = tuyaDevices.map(d =>
            d.id === msg.deviceId ? { ...d, online: 0 } : d
          );
        }

        // Roborock vacuum
        else if (msg.type === 'roborock_status' && msg.status) {
          roborock = msg.status;
        }

        // Yamaha soundbar
        else if (msg.type === 'yamaha_status' && msg.deviceId) {
          yamahaDevices = yamahaDevices.map(d =>
            d.id === msg.deviceId
              ? { ...d, last_status: msg.status ? JSON.stringify(msg.status) : null, online: msg.online ? 1 : 0 }
              : d
          );
        }

        // Air purifier
        else if (msg.type === 'purifier_status' && msg.status) {
          airPurifier = msg.status;
        }
      } catch {}
    };
  }

  return {
    get lamps() { return lamps; },
    get lampStatuses() { return lampStatuses; },
    get roborock() { return roborock; },
    get schedules() { return schedules; },
    get pendingActions() { return pendingActions; },
    get tuyaDevices() { return tuyaDevices; },
    get yamahaDevices() { return yamahaDevices; },
    get airPurifier() { return airPurifier; },
    get heaterPresets() { return heaterPresets; },
    get heaterSchedules() { return heaterSchedules; },
    get pendingHeaterActions() { return pendingHeaterActions; },
    get heaterOverride() { return heaterOverride; },
    get homeStatus() { return homeStatus; },
    get loading() { return loading; },
    get initialLoadComplete() { return initialLoadComplete; },
    get error() { return error; },
    get wsConnected() { return wsConnected; },

    initWebSocket() {
      connectWebSocket();
    },

    updateLampStatus(id: string, status: LampStatus) {
      const newStatuses = new Map(lampStatuses);
      newStatuses.set(id, status);
      lampStatuses = newStatuses;
    },

    async refreshLamps() {
      try {
        lamps = await getLamps();
        // Parse cached last_status into lampStatuses map
        const newStatuses = new Map(lampStatuses);
        for (const lamp of lamps) {
          if (lamp.last_status) {
            try {
              newStatuses.set(lamp.id, JSON.parse(lamp.last_status));
            } catch {}
          }
        }
        lampStatuses = newStatuses;
      } catch (e: any) {
        console.error('Failed to fetch lamps:', e);
      }
    },

    async refreshRoborock() {
      try {
        roborock = await getRoborockStatus();
      } catch (e: any) {
        roborock = null;
      }
    },

    async refreshSchedules() {
      try {
        schedules = await getSchedules();
      } catch (e: any) {
        console.error('Failed to fetch schedules:', e);
      }
    },

    async refreshPending() {
      try {
        pendingActions = await getPendingActions();
      } catch (e: any) {
        console.error('Failed to fetch pending actions:', e);
      }
    },

    async refreshTuya(refresh = true) {
      try {
        tuyaDevices = await getTuyaDevices(refresh);
      } catch (e: any) {
        console.error('Failed to fetch Tuya devices:', e);
      }
    },

    async refreshYamaha() {
      try {
        yamahaDevices = await getYamahaDevices();
      } catch (e: any) {
        console.error('Failed to fetch Yamaha devices:', e);
      }
    },

    async refreshAirPurifier() {
      try {
        airPurifier = await getAirPurifierStatus();
      } catch (e: any) {
        airPurifier = null;
      }
    },

    async refreshHeaterPresets() {
      try {
        heaterPresets = await getHeaterPresets();
      } catch (e: any) {
        console.error('Failed to fetch heater presets:', e);
      }
    },

    async refreshHeaterSchedules() {
      try {
        heaterSchedules = await getHeaterSchedules();
      } catch (e: any) {
        console.error('Failed to fetch heater schedules:', e);
      }
    },

    async refreshPendingHeater() {
      try {
        pendingHeaterActions = await getPendingHeaterActions();
      } catch (e: any) {
        console.error('Failed to fetch pending heater actions:', e);
      }
    },

    async refreshHeaterOverride() {
      try {
        heaterOverride = await getHeaterOverride();
      } catch (e: any) {
        console.error('Failed to fetch heater override:', e);
      }
    },

    async refreshHomeStatus() {
      try {
        homeStatus = await getHomeStatus();
      } catch (e: any) {
        console.error('Failed to fetch home status:', e);
      }
    },

    async refreshAll() {
      loading = true;
      await Promise.all([
        this.refreshLamps(),
        this.refreshRoborock(),
        this.refreshSchedules(),
        this.refreshPending(),
        this.refreshTuya(),
        this.refreshYamaha(),
        this.refreshAirPurifier(),
        this.refreshHeaterPresets(),
        this.refreshHeaterSchedules(),
        this.refreshPendingHeater(),
        this.refreshHeaterOverride(),
        this.refreshHomeStatus(),
      ]);
      loading = false;
      initialLoadComplete = true;
      // Signal to app.html that Svelte is ready - hide initial loader, show app
      if (typeof document !== 'undefined') {
        document.documentElement.classList.add('app-ready');
      }
    },
  };
}

export const store = createStore();
