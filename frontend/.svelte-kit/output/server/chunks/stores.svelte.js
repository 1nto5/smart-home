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
          lampStatuses.set(msg.deviceId, msg.status);
          const lamp = lamps.find((l) => l.id === msg.deviceId);
          if (lamp) lamp.online = 1;
        } else if (msg.type === "lamp_offline" && msg.deviceId) {
          lampStatuses.delete(msg.deviceId);
          const lamp = lamps.find((l) => l.id === msg.deviceId);
          if (lamp) lamp.online = 0;
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
      lampStatuses.set(id, status);
    },
    async refreshLamps() {
      try {
        lamps = await getLamps();
        for (const lamp of lamps) {
          if (lamp.last_status) {
            try {
              lampStatuses.set(lamp.id, JSON.parse(lamp.last_status));
            } catch {
            }
          }
        }
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
    async refreshAll() {
      loading = true;
      await Promise.all([
        this.refreshLamps(),
        this.refreshRoborock(),
        this.refreshSchedules(),
        this.refreshPending(),
        this.refreshTuya(),
        this.refreshYamaha(),
        this.refreshAirPurifier()
      ]);
      loading = false;
    }
  };
}
const store = createStore();
export {
  store as s
};
