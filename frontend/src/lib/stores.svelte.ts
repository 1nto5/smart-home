import { getLamps, getRoborockStatus, getSchedules, getPendingActions, getTuyaDevices, getYamahaDevices, getAirPurifierStatus } from './api';
import type { Lamp, RoborockStatus, Schedule, PendingAction, LampStatus, TuyaDevice, YamahaDevice, AirPurifierStatus } from './types';

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
  let loading = $state(false);
  let error = $state<string | null>(null);

  return {
    get lamps() { return lamps; },
    get lampStatuses() { return lampStatuses; },
    get roborock() { return roborock; },
    get schedules() { return schedules; },
    get pendingActions() { return pendingActions; },
    get tuyaDevices() { return tuyaDevices; },
    get yamahaDevices() { return yamahaDevices; },
    get airPurifier() { return airPurifier; },
    get loading() { return loading; },
    get error() { return error; },

    updateLampStatus(id: string, status: LampStatus) {
      lampStatuses.set(id, status);
    },

    async refreshLamps() {
      try {
        lamps = await getLamps();
        console.log('Refreshed lamps:', lamps.length, lamps);
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

    async refreshTuya() {
      try {
        tuyaDevices = await getTuyaDevices();
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
      ]);
      loading = false;
    },
  };
}

export const store = createStore();
