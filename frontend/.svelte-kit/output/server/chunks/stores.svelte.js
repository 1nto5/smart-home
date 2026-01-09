import "clsx";
const API_BASE = "/api";
async function fetcher(path, options) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers
    }
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}
async function getLamps() {
  return fetcher("/xiaomi");
}
async function getRoborockStatus() {
  return fetcher("/roborock/status");
}
async function getSchedules() {
  return fetcher("/schedules");
}
async function getPendingActions() {
  return fetcher("/pending-actions");
}
async function getTuyaDevices(refresh = false) {
  return fetcher(`/devices${refresh ? "?refresh=true" : ""}`);
}
async function getYamahaDevices() {
  return fetcher("/yamaha");
}
async function getAirPurifierStatus() {
  return fetcher("/purifier/status");
}
async function getHeaterPresets() {
  return fetcher("/heater-presets");
}
async function getHeaterSchedules() {
  return fetcher("/heater-schedules");
}
async function getPendingHeaterActions() {
  return fetcher("/pending-heater-actions");
}
let ws = null;
let wsReconnectDelay = 1e3;
function createStore() {
  let lamps = [];
  let lampStatuses = /* @__PURE__ */ new Map();
  let roborock = null;
  let schedules = [];
  let pendingActions = [];
  let tuyaDevices = [];
  let yamahaDevices = [];
  let airPurifier = null;
  let heaterPresets = [];
  let heaterSchedules = [];
  let pendingHeaterActions = [];
  let loading = false;
  let error = null;
  let wsConnected = false;
  function connectWebSocket() {
    if (ws?.readyState === WebSocket.OPEN) return;
    const protocol = location.protocol === "https:" ? "wss:" : "ws:";
    ws = new WebSocket(`${protocol}//${location.host}/ws`);
    ws.onopen = () => {
      console.log("WebSocket connected");
      wsConnected = true;
      wsReconnectDelay = 1e3;
    };
    ws.onclose = () => {
      console.log(`WebSocket disconnected, reconnecting in ${wsReconnectDelay}ms`);
      wsConnected = false;
      setTimeout(connectWebSocket, wsReconnectDelay);
      wsReconnectDelay = Math.min(wsReconnectDelay * 2, 3e4);
    };
    ws.onerror = () => {
      ws?.close();
    };
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "lamp_status" && msg.deviceId && msg.status) {
          const newStatuses = new Map(lampStatuses);
          newStatuses.set(msg.deviceId, msg.status);
          lampStatuses = newStatuses;
          lamps = lamps.map((l) => l.id === msg.deviceId ? { ...l, online: 1 } : l);
        } else if (msg.type === "lamp_offline" && msg.deviceId) {
          const newStatuses = new Map(lampStatuses);
          newStatuses.delete(msg.deviceId);
          lampStatuses = newStatuses;
          lamps = lamps.map((l) => l.id === msg.deviceId ? { ...l, online: 0 } : l);
        }
      } catch {
      }
    };
  }
  return {
    get lamps() {
      return lamps;
    },
    get lampStatuses() {
      return lampStatuses;
    },
    get roborock() {
      return roborock;
    },
    get schedules() {
      return schedules;
    },
    get pendingActions() {
      return pendingActions;
    },
    get tuyaDevices() {
      return tuyaDevices;
    },
    get yamahaDevices() {
      return yamahaDevices;
    },
    get airPurifier() {
      return airPurifier;
    },
    get heaterPresets() {
      return heaterPresets;
    },
    get heaterSchedules() {
      return heaterSchedules;
    },
    get pendingHeaterActions() {
      return pendingHeaterActions;
    },
    get loading() {
      return loading;
    },
    get error() {
      return error;
    },
    get wsConnected() {
      return wsConnected;
    },
    initWebSocket() {
      connectWebSocket();
    },
    updateLampStatus(id, status) {
      const newStatuses = new Map(lampStatuses);
      newStatuses.set(id, status);
      lampStatuses = newStatuses;
    },
    async refreshLamps() {
      try {
        lamps = await getLamps();
        const newStatuses = new Map(lampStatuses);
        for (const lamp of lamps) {
          if (lamp.last_status) {
            try {
              newStatuses.set(lamp.id, JSON.parse(lamp.last_status));
            } catch {
            }
          }
        }
        lampStatuses = newStatuses;
      } catch (e) {
        console.error("Failed to fetch lamps:", e);
      }
    },
    async refreshRoborock() {
      try {
        roborock = await getRoborockStatus();
      } catch (e) {
        roborock = null;
      }
    },
    async refreshSchedules() {
      try {
        schedules = await getSchedules();
      } catch (e) {
        console.error("Failed to fetch schedules:", e);
      }
    },
    async refreshPending() {
      try {
        pendingActions = await getPendingActions();
      } catch (e) {
        console.error("Failed to fetch pending actions:", e);
      }
    },
    async refreshTuya(refresh = true) {
      try {
        tuyaDevices = await getTuyaDevices(refresh);
      } catch (e) {
        console.error("Failed to fetch Tuya devices:", e);
      }
    },
    async refreshYamaha() {
      try {
        yamahaDevices = await getYamahaDevices();
      } catch (e) {
        console.error("Failed to fetch Yamaha devices:", e);
      }
    },
    async refreshAirPurifier() {
      try {
        airPurifier = await getAirPurifierStatus();
      } catch (e) {
        airPurifier = null;
      }
    },
    async refreshHeaterPresets() {
      try {
        heaterPresets = await getHeaterPresets();
      } catch (e) {
        console.error("Failed to fetch heater presets:", e);
      }
    },
    async refreshHeaterSchedules() {
      try {
        heaterSchedules = await getHeaterSchedules();
      } catch (e) {
        console.error("Failed to fetch heater schedules:", e);
      }
    },
    async refreshPendingHeater() {
      try {
        pendingHeaterActions = await getPendingHeaterActions();
      } catch (e) {
        console.error("Failed to fetch pending heater actions:", e);
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
        this.refreshPendingHeater()
      ]);
      loading = false;
    }
  };
}
const store = createStore();
export {
  store as s
};
