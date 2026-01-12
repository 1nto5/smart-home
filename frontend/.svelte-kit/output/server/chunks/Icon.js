import "clsx";
import { U as sanitize_props, a3 as rest_props, a4 as attributes, a5 as clsx, Y as ensure_array_like, a6 as element, W as slot, a7 as bind_props } from "./index2.js";
import { f as fallback } from "./context.js";
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
async function getHeaterOverride() {
  return fetcher("/heater-override");
}
async function getHomeStatus() {
  return fetcher("/home-status");
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
  let heaterOverride = null;
  let homeStatus = null;
  let loading = false;
  let initialLoadComplete = false;
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
    get heaterOverride() {
      return heaterOverride;
    },
    get homeStatus() {
      return homeStatus;
    },
    get loading() {
      return loading;
    },
    get initialLoadComplete() {
      return initialLoadComplete;
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
    async refreshHeaterOverride() {
      try {
        heaterOverride = await getHeaterOverride();
      } catch (e) {
        console.error("Failed to fetch heater override:", e);
      }
    },
    async refreshHomeStatus() {
      try {
        homeStatus = await getHomeStatus();
      } catch (e) {
        console.error("Failed to fetch home status:", e);
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
        this.refreshHomeStatus()
      ]);
      loading = false;
      initialLoadComplete = true;
    }
  };
}
const store = createStore();
/**
 * @license lucide-svelte v0.562.0 - ISC
 *
 * ISC License
 * 
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
 * 
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 * 
 * ---
 * 
 * The MIT License (MIT) (for portions derived from Feather)
 * 
 * Copyright (c) 2013-2023 Cole Bemis
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 */
const defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": 2,
  "stroke-linecap": "round",
  "stroke-linejoin": "round"
};
function Icon($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "name",
    "color",
    "size",
    "strokeWidth",
    "absoluteStrokeWidth",
    "iconNode"
  ]);
  $$renderer.component(($$renderer2) => {
    let name = fallback($$props["name"], void 0);
    let color = fallback($$props["color"], "currentColor");
    let size = fallback($$props["size"], 24);
    let strokeWidth = fallback($$props["strokeWidth"], 2);
    let absoluteStrokeWidth = fallback($$props["absoluteStrokeWidth"], false);
    let iconNode = fallback($$props["iconNode"], () => [], true);
    const mergeClasses = (...classes) => classes.filter((className, index, array) => {
      return Boolean(className) && array.indexOf(className) === index;
    }).join(" ");
    $$renderer2.push(`<svg${attributes(
      {
        ...defaultAttributes,
        ...$$restProps,
        width: size,
        height: size,
        stroke: color,
        "stroke-width": absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
        class: clsx(mergeClasses("lucide-icon", "lucide", name ? `lucide-${name}` : "", $$sanitized_props.class))
      },
      void 0,
      void 0,
      void 0,
      3
    )}><!--[-->`);
    const each_array = ensure_array_like(iconNode);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let [tag, attrs] = each_array[$$index];
      element($$renderer2, tag, () => {
        $$renderer2.push(`${attributes({ ...attrs }, void 0, void 0, void 0, 3)}`);
      });
    }
    $$renderer2.push(`<!--]--><!--[-->`);
    slot($$renderer2, $$props, "default", {});
    $$renderer2.push(`<!--]--></svg>`);
    bind_props($$props, {
      name,
      color,
      size,
      strokeWidth,
      absoluteStrokeWidth,
      iconNode
    });
  });
}
export {
  Icon as I,
  store as s
};
