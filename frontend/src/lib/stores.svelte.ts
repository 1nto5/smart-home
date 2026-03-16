import { getLamps, getRoborockStatus, getSchedules, getPendingActions, getTuyaDevices, getYamahaDevices, getAirPurifierStatus, getHeaterPresets, getHeaterSchedules, getPendingHeaterActions, getHeaterOverride, getHomeStatus } from './api';
import type { Lamp, RoborockStatus, Schedule, PendingAction, LampStatus, TuyaDevice, YamahaDevice, AirPurifierStatus, HeaterPreset, HeaterSchedule, PendingHeaterAction, HeaterOverride, HomeStatusData, WsMessage } from './types';
import { AUTH_TOKEN } from './config';
import { notify } from './toast.svelte';

// WebSocket connection state
let ws: WebSocket | null = null;
let wsReconnectDelay = 1000;

// Pending refresh promise (for requestRefreshAndWait)
let pendingRefresh: {
  resolve: (result: 'completed' | 'skipped' | 'timeout' | 'disconnected') => void;
  timeoutId: ReturnType<typeof setTimeout>;
} | null = null;

function resolvePendingRefresh(result: 'completed' | 'skipped' | 'disconnected') {
  if (pendingRefresh) {
    clearTimeout(pendingRefresh.timeoutId);
    pendingRefresh.resolve(result);
    pendingRefresh = null;
  }
}

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
  const error = $state<string | null>(null);
  let wsConnected = $state(false);
  let lastDeviceFetch = $state<Date | null>(null);

  async function safeRefresh<T>(fetcher: () => Promise<T>, setter: (v: T) => void, label: string): Promise<void> {
    try {
      setter(await fetcher());
    } catch (e) {
      console.error(`Failed to fetch ${label}:`, e);
    }
  }

  function connectWebSocket() {
    if (ws?.readyState === WebSocket.OPEN) return;

    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const tokenParam = AUTH_TOKEN ? `?token=${encodeURIComponent(AUTH_TOKEN)}` : '';
    ws = new WebSocket(`${protocol}//${location.host}/ws${tokenParam}`);

    ws.onopen = () => {
      console.log('WebSocket connected');
      wsConnected = true;
      wsReconnectDelay = 1000;
      // Request full state snapshot on (re)connect
      ws?.send(JSON.stringify({ type: 'request_snapshot' }));
    };

    ws.onclose = () => {
      console.log(`WebSocket disconnected, reconnecting in ${wsReconnectDelay}ms`);
      wsConnected = false;
      resolvePendingRefresh('disconnected');
      setTimeout(connectWebSocket, wsReconnectDelay);
      wsReconnectDelay = Math.min(wsReconnectDelay * 2, 30000);
    };

    ws.onerror = () => {
      ws?.close();
    };

    ws.onmessage = (event) => {
      try {
        const msg: WsMessage = JSON.parse(event.data);

        switch (msg.type) {
          case 'lamp_status': {
            const newStatuses = new Map(lampStatuses);
            newStatuses.set(msg.deviceId, msg.status);
            lampStatuses = newStatuses;
            lamps = lamps.map(l => l.id === msg.deviceId ? { ...l, online: 1 } : l);
            break;
          }
          case 'lamp_offline': {
            const newStatuses = new Map(lampStatuses);
            newStatuses.delete(msg.deviceId);
            lampStatuses = newStatuses;
            lamps = lamps.map(l => l.id === msg.deviceId ? { ...l, online: 0 } : l);
            break;
          }
          case 'tuya_status': {
            tuyaDevices = tuyaDevices.map(d => {
              if (d.id !== msg.deviceId) return d;
              // Merge new DPS into existing status (partial events only update some keys)
              const existing = d.last_status ? JSON.parse(d.last_status) : {};
              const merged = { ...existing, ...msg.status };
              return { ...d, last_status: JSON.stringify(merged), online: 1 };
            });
            break;
          }
          case 'tuya_offline': {
            tuyaDevices = tuyaDevices.map(d =>
              d.id === msg.deviceId ? { ...d, online: 0 } : d
            );
            break;
          }
          case 'roborock_status': {
            roborock = msg.status;
            break;
          }
          case 'yamaha_status': {
            yamahaDevices = yamahaDevices.map(d =>
              d.id === msg.deviceId
                ? { ...d, last_status: msg.status ? JSON.stringify(msg.status) : null, online: msg.online ? 1 : 0 }
                : d
            );
            break;
          }
          case 'purifier_status': {
            airPurifier = msg.status;
            break;
          }
          case 'home_status': {
            homeStatus = msg.status;
            break;
          }
          case 'pending_actions': {
            pendingActions = msg.actions;
            break;
          }
          case 'pending_heater_actions': {
            pendingHeaterActions = msg.actions;
            break;
          }
          case 'schedules_changed': {
            schedules = msg.schedules;
            break;
          }
          case 'heater_schedules_changed': {
            heaterSchedules = msg.schedules;
            break;
          }
          case 'heater_presets_changed': {
            heaterPresets = msg.presets;
            break;
          }
          case 'heater_override_changed': {
            heaterOverride = msg.override;
            break;
          }
          case 'full_state_snapshot': {
            lamps = msg.lamps;
            // Parse cached last_status into lampStatuses map
            const snapshotStatuses = new Map<string, LampStatus>();
            for (const lamp of msg.lamps) {
              if (lamp.last_status) {
                try {
                  snapshotStatuses.set(lamp.id, JSON.parse(lamp.last_status));
                } catch { /* ignore */ }
              }
            }
            lampStatuses = snapshotStatuses;
            tuyaDevices = msg.tuyaDevices;
            yamahaDevices = msg.yamahaDevices;
            roborock = msg.roborock;
            airPurifier = msg.airPurifier;
            schedules = msg.schedules;
            pendingActions = msg.pendingActions;
            heaterPresets = msg.heaterPresets;
            heaterSchedules = msg.heaterSchedules;
            pendingHeaterActions = msg.pendingHeaterActions;
            heaterOverride = msg.heaterOverride;
            homeStatus = msg.homeStatus;
            if (msg.lastDeviceFetch) {
              lastDeviceFetch = new Date(msg.lastDeviceFetch);
            }
            if (!initialLoadComplete) {
              initialLoadComplete = true;
              if (typeof document !== 'undefined') {
                document.documentElement.classList.add('app-ready');
              }
            }
            break;
          }
          case 'refresh_complete': {
            lastDeviceFetch = new Date(msg.lastDeviceFetch);
            resolvePendingRefresh('completed');
            break;
          }
          case 'refresh_skipped': {
            notify.info(`Refresh available in ${msg.nextAvailableIn}s`);
            resolvePendingRefresh('skipped');
            break;
          }
        }
      } catch { /* ignore parse errors */ }
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
    get lastDeviceFetch() { return lastDeviceFetch; },

    initWebSocket() {
      connectWebSocket();
    },

    updateLampStatus(id: string, status: LampStatus) {
      const newStatuses = new Map(lampStatuses);
      newStatuses.set(id, status);
      lampStatuses = newStatuses;
    },

    updateAirPurifierStatus(update: Partial<AirPurifierStatus>) {
      if (airPurifier) {
        airPurifier = { ...airPurifier, ...update };
      }
    },

    async refreshLamps() {
      try {
        lamps = await getLamps();
        const newStatuses = new Map(lampStatuses);
        for (const lamp of lamps) {
          if (lamp.last_status) {
            try { newStatuses.set(lamp.id, JSON.parse(lamp.last_status)); } catch { /* ignore */ }
          }
        }
        lampStatuses = newStatuses;
      } catch (e) {
        console.error('Failed to fetch lamps:', e);
      }
    },

    async refreshRoborock() {
      try { roborock = await getRoborockStatus(); } catch { roborock = null; }
    },

    async refreshAirPurifier() {
      try { airPurifier = await getAirPurifierStatus(); } catch { airPurifier = null; }
    },

    refreshSchedules: () => safeRefresh(getSchedules, v => schedules = v, 'schedules'),
    refreshPending: () => safeRefresh(getPendingActions, v => pendingActions = v, 'pending actions'),
    refreshTuya: () => safeRefresh(getTuyaDevices, v => tuyaDevices = v, 'Tuya devices'),
    refreshYamaha: () => safeRefresh(getYamahaDevices, v => yamahaDevices = v, 'Yamaha devices'),
    refreshHeaterPresets: () => safeRefresh(getHeaterPresets, v => heaterPresets = v, 'heater presets'),
    refreshHeaterSchedules: () => safeRefresh(getHeaterSchedules, v => heaterSchedules = v, 'heater schedules'),
    refreshPendingHeater: () => safeRefresh(getPendingHeaterActions, v => pendingHeaterActions = v, 'pending heater actions'),
    refreshHeaterOverride: () => safeRefresh(getHeaterOverride, v => heaterOverride = v, 'heater override'),
    refreshHomeStatus: () => safeRefresh(getHomeStatus, v => homeStatus = v, 'home status'),

    requestRefresh() {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'request_refresh' }));
      }
    },

    requestRefreshAndWait(timeoutMs = 30_000): Promise<'completed' | 'skipped' | 'timeout' | 'disconnected'> {
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        return Promise.resolve('disconnected');
      }
      if (pendingRefresh) {
        clearTimeout(pendingRefresh.timeoutId);
        pendingRefresh.resolve('timeout');
      }
      return new Promise((resolve) => {
        const timeoutId = setTimeout(() => {
          pendingRefresh = null;
          resolve('timeout');
        }, timeoutMs);
        pendingRefresh = { resolve, timeoutId };
        ws!.send(JSON.stringify({ type: 'request_refresh' }));
      });
    },

    async refreshAll() {
      loading = true;
      this.requestRefresh();
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
