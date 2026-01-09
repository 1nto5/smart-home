import { getLamps, getRoborockStatus, getSchedules, getPendingActions, getTuyaDevices, getYamahaDevices, getAirPurifierStatus, getHeaterPresets, getHeaterSchedules, getPendingHeaterActions } from './api';
import type { Lamp, RoborockStatus, Schedule, PendingAction, LampStatus, TuyaDevice, YamahaDevice, AirPurifierStatus, HeaterPreset, HeaterSchedule, PendingHeaterAction } from './types';

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
  let loading = $state(false);
  let error = $state<string | null>(null);
  let wsConnected = $state(false);

  function connectWebSocket() {
    if (ws?.readyState === WebSocket.OPEN) return;

    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${location.host}/ws`);

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
        if (msg.type === 'lamp_status' && msg.deviceId && msg.status) {
          // Create new Map for Svelte 5 reactivity
          const newStatuses = new Map(lampStatuses);
          newStatuses.set(msg.deviceId, msg.status);
          lampStatuses = newStatuses;
          // Update online status in lamps array
          lamps = lamps.map(l => l.id === msg.deviceId ? { ...l, online: 1 } : l);
        } else if (msg.type === 'lamp_offline' && msg.deviceId) {
          // Create new Map for Svelte 5 reactivity
          const newStatuses = new Map(lampStatuses);
          newStatuses.delete(msg.deviceId);
          lampStatuses = newStatuses;
          // Update online status in lamps array
          lamps = lamps.map(l => l.id === msg.deviceId ? { ...l, online: 0 } : l);
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
    get loading() { return loading; },
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
      ]);
      loading = false;
    },
  };
}

export const store = createStore();
