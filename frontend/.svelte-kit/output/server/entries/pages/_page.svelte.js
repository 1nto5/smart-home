import { W as attr_class, V as attr, X as stringify, U as ensure_array_like, _ as attr_style, $ as head } from "../../chunks/index2.js";
import { s as store } from "../../chunks/stores.svelte.js";
import { e as escape_html } from "../../chunks/context.js";
import "clsx";
const deviceNameTranslations = {
  // Exact device name mappings (case-insensitive matching)
  "korytarz 1": "Hallway 1",
  "korytarz 2": "Hallway 2",
  "kuchnia": "Kitchen",
  "salon": "Living Room",
  "sypialnia": "Bedroom",
  "łazienka": "Bathroom",
  "pokój dzieci": "Kids Room",
  "jadalnia": "Dining Room",
  "gabinet": "Study",
  "pralnia": "Laundry",
  // Sensors
  "Czujnik zalania kuchnia": "Water Sensor Kitchen",
  "Czujnik zalania łazienka": "Water Sensor Bathroom",
  "Czujnik zalania": "Water Sensor",
  "Stacja meteo": "Weather Station",
  "Drzwi": "Door Sensor",
  // Thermostats
  "Grzejnik salon": "Radiator Living Room",
  "Grzejnik sypialnia": "Radiator Bedroom",
  "Grzejnik kuchnia": "Radiator Kitchen",
  "Grzejnik łazienka": "Radiator Bathroom",
  "Grzejnik korytarz": "Radiator Hallway",
  "Grzejnik pokój dzieci": "Radiator Kids Room",
  "Grzejnik": "Radiator"
};
const wordReplacements = {
  "korytarz": "Hallway",
  "kuchnia": "Kitchen",
  "salon": "Living Room",
  "sypialnia": "Bedroom",
  "łazienka": "Bathroom",
  "pokój dzieci": "Kids Room",
  "pokój": "Room",
  "dzieci": "Kids",
  "Czujnik zalania": "Water Sensor",
  "Stacja meteo": "Weather Station",
  "Grzejnik": "Radiator",
  "Drzwi": "Door",
  "Lampa": "Light",
  "duży": "Large",
  "mały": "Small",
  "główny": "Main",
  "górny": "Upper",
  "dolny": "Lower"
};
function translateDeviceName(name) {
  if (!name) return name;
  const lowerName = name.toLowerCase();
  for (const [polish, english] of Object.entries(deviceNameTranslations)) {
    if (lowerName === polish.toLowerCase()) {
      return english;
    }
  }
  let translated = name;
  const sortedReplacements = Object.entries(wordReplacements).sort((a, b) => b[0].length - a[0].length);
  for (const [polish, english] of sortedReplacements) {
    const regex = new RegExp(polish, "gi");
    translated = translated.replace(regex, english);
  }
  return translated;
}
function DeviceDialog($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { open = false, onclose, title, children } = $$props;
    if (open) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4 dialog-overlay animate-fade-in svelte-alpl3u" role="dialog" aria-modal="true" aria-labelledby="dialog-title" tabindex="-1"><div class="dialog-content w-full max-w-md max-h-[80vh] overflow-hidden"><div class="flex items-center justify-between p-4 border-b border-stroke-default"><h2 id="dialog-title" class="text-lg font-semibold text-content-primary">${escape_html(title)}</h2> <button aria-label="Close dialog" class="w-10 h-10 rounded-xl bg-surface-recessed text-content-secondary hover:text-content-primary hover:bg-stroke-default transition-colors flex items-center justify-center"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div> <div class="p-4 overflow-y-auto max-h-[calc(80vh-64px)]">`);
      children($$renderer2);
      $$renderer2.push(`<!----></div></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function LampCard($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { lamp, compact = false } = $$props;
    let displayName = translateDeviceName(lamp.name);
    let status = store.lampStatuses.get(lamp.id);
    let dialogOpen = false;
    let activePreset = null;
    let displayPower = status?.power ?? false;
    let displayBrightness = status?.brightness ?? 0;
    let displayColorTemp = status?.color_temp ?? 0;
    const presets = [
      {
        id: "day",
        label: "Day",
        brightness: 100,
        colorTemp: 5e3,
        moonlight: false
      },
      {
        id: "night",
        label: "Night",
        brightness: 30,
        colorTemp: 2700,
        moonlight: false
      },
      {
        id: "moonlight",
        label: "Moonlight",
        brightness: 10,
        colorTemp: 2700,
        moonlight: true
      }
    ];
    function isPresetActive(preset) {
      if (!displayPower) return false;
      if (preset.moonlight) return status?.moonlight_mode ?? false;
      if (status?.moonlight_mode) return false;
      const brightMatch = Math.abs((status?.brightness ?? 0) - preset.brightness) <= 5;
      const tempMatch = Math.abs((status?.color_temp ?? 0) - preset.colorTemp) <= 200;
      return brightMatch && tempMatch;
    }
    $$renderer2.push(`<div role="button" tabindex="0"${attr_class(`card transition-card hover:scale-[1.02] ${stringify(compact ? "p-2.5" : "p-3")} w-full text-left cursor-pointer`)}><div class="flex items-center gap-2.5"><button${attr("disabled", !status, true)}${attr_class(
      `w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 relative ${stringify(displayPower ? status?.moonlight_mode ? "bg-device-audio-bg text-device-audio-text" : "badge-lights" : "bg-surface-recessed text-content-tertiary")} hover:scale-105 disabled:opacity-50 disabled:hover:scale-100`,
      void 0,
      { "status-active": displayPower }
    )}><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a.75.75 0 01.75.75v6.5a.75.75 0 01-1.5 0v-6.5A.75.75 0 0110 2z"></path><path d="M5.404 4.343a.75.75 0 10-1.06 1.06 6.5 6.5 0 109.192 0 .75.75 0 00-1.06-1.06 5 5 0 11-7.072 0z"></path></svg> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></button> <div class="min-w-0 flex-1"><h4 class="font-medium text-sm text-content-primary truncate">${escape_html(displayName)}</h4> `);
    if (displayPower) {
      $$renderer2.push("<!--[-->");
      if (status?.moonlight_mode) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<p class="text-xs text-device-audio-text">Moonlight</p>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<p class="text-xs text-content-secondary">${escape_html(displayBrightness)}% · ${escape_html(displayColorTemp)}K</p>`);
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<p class="text-xs text-content-secondary">${escape_html(status ? "Off" : "Offline")}</p>`);
    }
    $$renderer2.push(`<!--]--></div></div></div> `);
    DeviceDialog($$renderer2, {
      open: dialogOpen,
      onclose: () => dialogOpen = false,
      title: displayName,
      children: ($$renderer3) => {
        $$renderer3.push(`<div class="space-y-4"><div class="flex items-center justify-between"><span class="text-content-secondary">Status</span> <span${attr_class(`font-medium ${stringify(displayPower ? status?.moonlight_mode ? "text-device-audio-text" : "text-device-lights-text" : "text-content-tertiary")}`)}>`);
        if (displayPower) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`${escape_html(status?.moonlight_mode ? "Moonlight" : "On")}`);
        } else {
          $$renderer3.push("<!--[!-->");
          $$renderer3.push(`${escape_html(status ? "Off" : "Offline")}`);
        }
        $$renderer3.push(`<!--]--></span></div> `);
        if (status) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<button${attr_class(`w-full py-4 rounded-xl text-lg font-medium transition-all relative ${stringify(displayPower ? status.moonlight_mode ? "bg-device-audio-bg text-device-audio-text" : "badge-lights" : "bg-surface-recessed text-content-secondary")} hover:scale-[1.02]`)}>${escape_html(displayPower ? "Turn Off" : "Turn On")} `);
          {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]--></button> `);
          if (displayPower) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div><p class="text-sm text-content-secondary mb-2">Presets</p> <div class="grid grid-cols-3 gap-2"><!--[-->`);
            const each_array = ensure_array_like(presets);
            for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
              let preset = each_array[$$index];
              $$renderer3.push(`<button${attr_class(`py-2.5 text-sm rounded-lg transition-all relative ${stringify(isPresetActive(preset) || activePreset === preset.id ? preset.moonlight ? "bg-device-audio-bg text-device-audio-text" : "badge-lights" : "bg-surface-recessed text-content-secondary hover:bg-stroke-default")}`)}>${escape_html(preset.label)} `);
              if (activePreset === preset.id) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<span class="absolute top-1 right-1 w-1.5 h-1.5 bg-device-lights-text rounded-full animate-pulse"></span>`);
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]--></button>`);
            }
            $$renderer3.push(`<!--]--></div></div> `);
            if (!status.moonlight_mode) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div><div class="flex justify-between text-sm text-content-secondary mb-2"><span>Brightness</span> <span class="font-medium text-content-primary">${escape_html(displayBrightness)}%</span></div> <input type="range" min="1" max="100"${attr("value", displayBrightness)} class="w-full"/></div> <div><div class="flex justify-between text-sm text-content-secondary mb-2"><span>Color Temperature</span> <span class="font-medium text-content-primary">${escape_html(displayColorTemp)}K</span></div> <input type="range" min="1700" max="6500" step="100"${attr("value", displayColorTemp)} class="w-full"/> <div class="flex justify-between text-xs text-content-tertiary mt-1"><span>Warm</span> <span>Cool</span></div></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
              $$renderer3.push(`<div class="py-4 text-center text-sm text-device-audio-text/80">Hardware night light mode active</div>`);
            }
            $$renderer3.push(`<!--]-->`);
          } else {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]--> <div class="pt-4 border-t border-stroke-default space-y-2 text-sm"><div class="flex justify-between"><span class="text-content-secondary">IP Address</span> <span class="font-mono text-xs text-content-tertiary">${escape_html(lamp.ip)}</span></div></div>`);
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--></div>`);
      }
    });
    $$renderer2.push(`<!---->`);
  });
}
function RoborockCard($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { status, compact = false } = $$props;
    let dialogOpen = false;
    let pendingFanMode = null;
    let pendingMopMode = null;
    let displayFanPower = status?.fanPower ?? 102;
    let displayMopMode = status?.waterBoxMode ?? 200;
    const STATE_MAP = {
      1: "Starting",
      2: "Charger disconnected",
      3: "Idle",
      4: "Remote control",
      5: "Cleaning",
      6: "Returning",
      7: "Manual mode",
      8: "Charging",
      9: "Charging problem",
      10: "Paused",
      11: "Spot cleaning",
      12: "Error",
      13: "Shutting down",
      14: "Updating",
      15: "Docking",
      16: "Going to target",
      17: "Zoned cleaning",
      18: "Segment cleaning",
      22: "Emptying dustbin",
      23: "Washing mop",
      26: "Going to wash mop"
    };
    const FAN_MODES = [
      { mode: 101, name: "Quiet", icon: "🔇" },
      { mode: 102, name: "Balanced", icon: "⚖️" },
      { mode: 103, name: "Turbo", icon: "💨" },
      { mode: 104, name: "Max", icon: "🔥" }
    ];
    const MOP_MODES = [
      { mode: 200, name: "Off", icon: "❌" },
      { mode: 201, name: "Low", icon: "💧" },
      { mode: 202, name: "Med", icon: "💧💧" },
      { mode: 203, name: "High", icon: "💧💧💧" }
    ];
    function getStateName(state) {
      return STATE_MAP[state] || `Unknown`;
    }
    function getFanModeName(fanPower) {
      const mode = FAN_MODES.find((m) => m.mode === fanPower);
      return mode ? mode.name : `${fanPower}%`;
    }
    function stateStyle(state) {
      switch (state) {
        case 5:
        case 11:
        case 17:
        case 18:
          return { color: "text-success", bg: "bg-success/20" };
        case 8:
          return { color: "text-info", bg: "bg-info/20" };
        case 3:
          return { color: "text-content-tertiary", bg: "bg-surface-recessed" };
        case 10:
          return { color: "text-warning", bg: "bg-warning/20" };
        case 6:
        case 15:
        case 16:
        case 26:
          return {
            color: "text-device-sensors-text",
            bg: "bg-device-sensors-bg"
          };
        case 12:
        case 9:
          return { color: "text-error", bg: "bg-error/20" };
        default:
          return { color: "text-content-tertiary", bg: "bg-surface-recessed" };
      }
    }
    let style = status ? stateStyle(status.state) : { color: "text-content-tertiary", bg: "bg-surface-recessed" };
    $$renderer2.push(`<div role="button" tabindex="0"${attr_class(`card transition-card hover:scale-[1.02] ${stringify(
      // Load extended data when dialog opens
      compact ? "p-2.5" : "p-3"
    )} w-full text-left cursor-pointer`)}><div class="flex items-center gap-2.5"><div${attr_class(`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stringify(style.bg)} ${stringify(style.color)}`, void 0, {
      "status-active": status?.state === 5 || status?.state === 11 || status?.state === 17 || status?.state === 18
    })}><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clip-rule="evenodd"></path></svg></div> <div class="min-w-0 flex-1"><h4 class="font-medium text-sm text-content-primary truncate">Roborock</h4> `);
    if (status) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p${attr_class(`text-xs ${stringify(style.color)}`)}>${escape_html(getStateName(status.state))}</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<p class="text-xs text-content-secondary">Offline</p>`);
    }
    $$renderer2.push(`<!--]--></div> `);
    if (compact && status) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex items-center gap-1 text-xs shrink-0"><svg${attr_class(`w-3.5 h-3.5 ${stringify(status.battery > 20 ? "text-success" : "text-error")}`)} fill="currentColor" viewBox="0 0 20 20"><path d="M2 11.5a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-1zm4-3a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v4a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-4z"></path><path d="M8 4.5a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v8a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-8z"></path></svg> <span${attr_class(status.battery > 20 ? "text-content-secondary" : "text-error")}>${escape_html(status.battery)}%</span></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div> `);
    DeviceDialog($$renderer2, {
      open: dialogOpen,
      onclose: () => dialogOpen = false,
      title: "Roborock",
      children: ($$renderer3) => {
        $$renderer3.push(`<div class="space-y-4"><div class="flex items-center justify-between"><span class="text-content-secondary">Status</span> <span${attr_class(`font-medium ${stringify(style.color)}`)}>${escape_html(status ? getStateName(status.state) : "Offline")}</span></div> `);
        if (status) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<div class="grid grid-cols-2 gap-3"><div class="bg-surface-recessed rounded-xl p-4 text-center"><span class="text-xs text-content-secondary">Battery</span> <p${attr_class(`text-3xl font-bold mt-1 ${stringify(status.battery > 20 ? "text-content-primary" : "text-error")}`)}>${escape_html(status.battery)}%</p></div> <div class="bg-surface-recessed rounded-xl p-4 text-center"><span class="text-xs text-content-secondary">Fan Speed</span> <p class="text-2xl font-bold mt-1 text-content-primary">${escape_html(getFanModeName(status.fanPower))}</p></div></div> <div class="flex gap-1 bg-surface-recessed rounded-lg p-1"><button${attr_class(`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${stringify(
            "bg-surface-elevated text-content-primary"
          )}`)}>Controls</button> <button${attr_class(`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${stringify("text-content-secondary hover:text-content-primary")}`)}>Rooms</button> <button${attr_class(`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${stringify("text-content-secondary hover:text-content-primary")}`)}>Settings</button></div> `);
          {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div><p class="text-sm text-content-secondary mb-2">Actions</p> <div class="grid grid-cols-3 gap-2"><button class="py-4 rounded-xl bg-success/20 text-success text-sm font-medium relative hover:bg-success/30 transition-colors flex flex-col items-center gap-1"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg> Start `);
            {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--></button> <button class="py-4 rounded-xl bg-warning/20 text-warning text-sm font-medium relative hover:bg-warning/30 transition-colors flex flex-col items-center gap-1"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg> Pause `);
            {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--></button> <button class="py-4 rounded-xl bg-info/20 text-info text-sm font-medium relative hover:bg-info/30 transition-colors flex flex-col items-center gap-1"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg> Home `);
            {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--></button></div></div> <div><button class="w-full py-3 rounded-xl bg-surface-recessed text-content-secondary text-sm font-medium relative hover:bg-stroke-default transition-colors">Find Robot `);
            {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--></button></div> <div><p class="text-sm text-content-secondary mb-2">Suction Power</p> <div class="grid grid-cols-4 gap-1"><!--[-->`);
            const each_array = ensure_array_like(FAN_MODES);
            for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
              let fan = each_array[$$index];
              $$renderer3.push(`<button${attr_class(`py-2 px-1 rounded-lg text-xs font-medium transition-colors relative ${stringify(displayFanPower === fan.mode ? "badge-audio ring-1 ring-device-audio-text/50" : "bg-surface-recessed text-content-secondary hover:bg-stroke-default")}`)}><div class="text-base mb-0.5">${escape_html(fan.icon)}</div> ${escape_html(fan.name)} `);
              if (pendingFanMode === fan.mode) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<span class="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-device-audio-text rounded-full animate-pulse"></span>`);
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]--></button>`);
            }
            $$renderer3.push(`<!--]--></div></div> <div><p class="text-sm text-content-secondary mb-2">Mop Intensity</p> <div class="grid grid-cols-4 gap-1"><!--[-->`);
            const each_array_1 = ensure_array_like(MOP_MODES);
            for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
              let mop = each_array_1[$$index_1];
              $$renderer3.push(`<button${attr_class(`py-2 px-1 rounded-lg text-xs font-medium transition-colors relative ${stringify(displayMopMode === mop.mode ? "badge-sensors ring-1 ring-device-sensors-text/50" : "bg-surface-recessed text-content-secondary hover:bg-stroke-default")}`)}><div class="text-base mb-0.5">${escape_html(mop.icon)}</div> ${escape_html(mop.name)} `);
              if (pendingMopMode === mop.mode) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<span class="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-device-sensors-text rounded-full animate-pulse"></span>`);
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]--></button>`);
            }
            $$renderer3.push(`<!--]--></div></div>`);
          }
          $$renderer3.push(`<!--]-->`);
        } else {
          $$renderer3.push("<!--[!-->");
          $$renderer3.push(`<div class="text-center py-8 text-content-secondary">Start bridge to control robot</div>`);
        }
        $$renderer3.push(`<!--]--></div>`);
      }
    });
    $$renderer2.push(`<!---->`);
  });
}
function TuyaSensorCard($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { device, compact = false } = $$props;
    let displayName = translateDeviceName(device.name);
    let dialogOpen = false;
    let parsedStatus = () => {
      if (!device.last_status) return null;
      try {
        return JSON.parse(device.last_status);
      } catch {
        return null;
      }
    };
    const categoryConfig = {
      sj: { label: "Water", icon: "💧" },
      mcs: { label: "Door", icon: "🚪" },
      wsdcg: { label: "Climate", icon: "🌡️" },
      wfcon: { label: "Gateway", icon: "📡" },
      cz: { label: "Remote", icon: "📺" }
    };
    const LOW_BATTERY_THRESHOLD = 15;
    function getStatusInfo(status, category) {
      if (!status) {
        if (category === "sj" || category === "mcs") return {
          text: "Monitoring",
          alert: false,
          color: "text-content-tertiary",
          lowBattery: false
        };
        return {
          text: "No data",
          alert: false,
          color: "text-content-tertiary",
          lowBattery: false
        };
      }
      switch (category) {
        case "sj": {
          const waterValue = status["1"];
          const isWet = waterValue === "alarm" || waterValue === "1" || waterValue === 1;
          const battery = status["4"];
          const lowBattery = battery !== void 0 && battery <= LOW_BATTERY_THRESHOLD;
          if (isWet) {
            return {
              text: "Water detected!",
              alert: true,
              color: "text-error",
              lowBattery,
              batteryPercent: battery
            };
          }
          return {
            text: lowBattery ? `Dry · ${battery}%` : "Dry",
            alert: false,
            color: "text-success",
            lowBattery,
            batteryPercent: battery
          };
        }
        case "mcs": {
          const isOpen = status["101"] === true || status["1"] === true;
          const battery = status["103"] || status["4"];
          const lowBattery = battery !== void 0 && battery <= LOW_BATTERY_THRESHOLD;
          return {
            text: lowBattery ? `${isOpen ? "Open" : "Closed"} · ${battery}%` : isOpen ? "Open" : "Closed",
            alert: isOpen,
            color: isOpen ? "text-warning" : "text-success",
            lowBattery,
            batteryPercent: battery
          };
        }
        case "wsdcg": {
          const temp = status["103"];
          const humidity = status["102"];
          if (temp !== void 0 && humidity !== void 0) {
            return {
              text: `${(temp / 100).toFixed(1)}°C · ${humidity}%`,
              alert: false,
              color: "text-device-sensors-text",
              lowBattery: false
            };
          }
          return {
            text: "N/A",
            alert: false,
            color: "text-content-tertiary",
            lowBattery: false
          };
        }
        default:
          return {
            text: device.online ? "Online" : "Offline",
            alert: false,
            color: device.online ? "text-success" : "text-content-tertiary",
            lowBattery: false
          };
      }
    }
    let config = categoryConfig[device.category] || { label: device.category, icon: "📱" };
    let statusInfo = getStatusInfo(parsedStatus(), device.category);
    $$renderer2.push(`<div role="button" tabindex="0"${attr_class(`card transition-card hover:scale-[1.02] ${stringify(compact ? "p-2.5" : "p-3")} w-full text-left cursor-pointer ${stringify(statusInfo.lowBattery ? "border-warning/50 bg-warning/10" : "")}`)}><div class="flex items-center gap-2.5"><div${attr_class(
      `w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0 ${stringify(statusInfo.alert ? "bg-error/20" : statusInfo.lowBattery ? "bg-warning/20" : "badge-sensors")}`,
      void 0,
      { "status-active": statusInfo.alert }
    )}>${escape_html(config.icon)}</div> <div class="min-w-0 flex-1"><h4 class="font-medium text-sm text-content-primary truncate">${escape_html(displayName)}</h4> <p${attr_class(`text-xs ${stringify(statusInfo.lowBattery ? "text-warning" : statusInfo.color)}`)}>${escape_html(statusInfo.text)}</p></div> <div${attr_class(`w-2 h-2 rounded-full shrink-0 ${stringify(device.online ? "bg-success" : "bg-content-tertiary")}`, void 0, { "status-dot": device.online })}></div></div></div> `);
    DeviceDialog($$renderer2, {
      open: dialogOpen,
      onclose: () => dialogOpen = false,
      title: displayName,
      children: ($$renderer3) => {
        $$renderer3.push(`<div class="space-y-4"><div${attr_class(`rounded-xl p-6 text-center ${stringify(statusInfo.alert ? "bg-error/20" : "bg-surface-recessed")}`)}><span class="text-4xl">${escape_html(config.icon)}</span> <p${attr_class(`text-2xl font-bold mt-2 ${stringify(statusInfo.color)}`)}>${escape_html(statusInfo.text)}</p> <p class="text-sm text-content-secondary mt-1">${escape_html(config.label)} Sensor</p></div> `);
        if (device.category === "wsdcg") {
          $$renderer3.push("<!--[-->");
          const status = parsedStatus();
          if (status) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div class="grid grid-cols-2 gap-3"><div class="bg-surface-recessed rounded-xl p-4 text-center"><span class="text-xs text-content-secondary">Temperature</span> <p class="text-2xl font-bold mt-1 text-device-sensors-text">${escape_html((status["103"] / 100).toFixed(1))}°C</p></div> <div class="bg-surface-recessed rounded-xl p-4 text-center"><span class="text-xs text-content-secondary">Humidity</span> <p class="text-2xl font-bold mt-1 text-info">${escape_html(status["102"])}%</p></div></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]-->`);
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--> `);
        if (device.category === "sj" || device.category === "mcs") {
          $$renderer3.push("<!--[-->");
          const status = parsedStatus();
          if (status) {
            $$renderer3.push("<!--[-->");
            const battery = status["4"] || status["103"];
            if (battery !== void 0) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="bg-surface-recessed rounded-xl p-4"><div class="flex items-center justify-between"><span class="text-content-secondary">Battery</span> <span${attr_class(`font-bold ${stringify(battery > 20 ? "text-success" : "text-error")}`)}>${escape_html(battery)}%</span></div> <div class="mt-2 h-2 bg-stroke-default rounded-full overflow-hidden"><div${attr_class(`h-full rounded-full transition-all ${stringify(battery > 20 ? "bg-success" : "bg-error")}`)}${attr_style(`width: ${stringify(battery)}%`)}></div></div></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]-->`);
          } else {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]-->`);
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--> <div class="pt-4 border-t border-stroke-default space-y-2 text-sm"><div class="flex justify-between"><span class="text-content-secondary">Type</span> <span class="font-medium text-content-primary">${escape_html(config.label)}</span></div> <div class="flex justify-between"><span class="text-content-secondary">Online</span> <span${attr_class(device.online ? "text-success" : "text-error")}>${escape_html(device.online ? "Yes" : "No")}</span></div> <div class="flex justify-between"><span class="text-content-secondary">Device ID</span> <span class="font-mono text-xs text-content-tertiary">${escape_html(device.id.slice(0, 12))}...</span></div></div></div>`);
      }
    });
    $$renderer2.push(`<!---->`);
  });
}
function TRVCard($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { device, compact = false } = $$props;
    let displayName = translateDeviceName(device.name);
    let dialogOpen = false;
    let status = () => {
      if (!device.last_status) return null;
      try {
        return JSON.parse(device.last_status);
      } catch {
        return null;
      }
    };
    let currentTemp = status()?.["5"] ? status()["5"] / 10 : null;
    let serverTargetTemp = status()?.["4"] ? status()["4"] / 10 : null;
    let targetTemp = serverTargetTemp;
    let valve = status()?.["3"] || "unknown";
    $$renderer2.push(`<div role="button" tabindex="0"${attr_class(`card transition-card hover:scale-[1.02] ${stringify(compact ? "p-2.5" : "p-3")} w-full text-left cursor-pointer`)}><div class="flex items-center gap-2.5"><div${attr_class(`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stringify(valve === "opened" ? "badge-climate-heat" : "badge-climate-cool")}`, void 0, { "status-active": valve === "opened" })}>`);
    if (valve === "opened") {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd"></path></svg>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072 1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415zM10 9a1 1 0 011 1v.01a1 1 0 11-2 0V10a1 1 0 011-1z"></path></svg>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="min-w-0 flex-1"><h4 class="font-medium text-sm text-content-primary truncate">${escape_html(displayName)}</h4> `);
    if (currentTemp !== null) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="text-xs text-content-secondary">${escape_html(currentTemp)}°C ${escape_html(valve === "opened" ? "→" : "·")} ${escape_html(targetTemp)}°C</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<p class="text-xs text-content-secondary">No data</p>`);
    }
    $$renderer2.push(`<!--]--></div></div></div> `);
    DeviceDialog($$renderer2, {
      open: dialogOpen,
      onclose: () => dialogOpen = false,
      title: displayName,
      children: ($$renderer3) => {
        $$renderer3.push(`<div class="space-y-4"><div class="flex items-center justify-between"><span class="text-content-secondary">Valve</span> <span${attr_class(`font-medium ${stringify(valve === "opened" ? "text-device-climate-heat-text" : "text-device-climate-cool-text")}`)}>${escape_html(valve === "opened" ? "Heating" : "Idle")}</span></div> `);
        if (currentTemp !== null && targetTemp !== null) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<div class="grid grid-cols-2 gap-3"><div class="bg-surface-recessed rounded-xl p-4 text-center"><span class="text-xs text-content-secondary uppercase tracking-wide">Current</span> <p class="text-3xl font-bold mt-1 text-content-primary">${escape_html(currentTemp)}°C</p></div> <div class="bg-surface-recessed rounded-xl p-4 text-center"><span class="text-xs text-content-secondary uppercase tracking-wide">Target</span> <p class="text-3xl font-bold mt-1 text-device-climate-heat-text">${escape_html(targetTemp)}°C</p></div></div> <div><p class="text-sm text-content-secondary mb-3">Set Temperature</p> <div class="flex items-center justify-center gap-4"><button${attr("disabled", targetTemp !== null && targetTemp <= 5, true)} class="w-14 h-14 rounded-full badge-climate-cool text-2xl font-medium hover:opacity-80 disabled:opacity-50 transition-all">−</button> <div class="relative">`);
          {
            $$renderer3.push("<!--[!-->");
            $$renderer3.push(`<button class="text-3xl font-bold w-24 text-center text-content-primary hover:text-device-climate-heat-text transition-colors cursor-text" title="Click to edit">${escape_html(targetTemp)}°C</button>`);
          }
          $$renderer3.push(`<!--]--> `);
          {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]--> `);
          {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]--></div> <button${attr("disabled", targetTemp !== null && targetTemp >= 30, true)} class="w-14 h-14 rounded-full badge-climate-heat text-2xl font-medium hover:opacity-80 disabled:opacity-50 transition-all">+</button></div></div> <div><p class="text-sm text-content-secondary mb-2">Quick Set</p> <div class="grid grid-cols-4 gap-2"><!--[-->`);
          const each_array = ensure_array_like([15, 18, 21, 24]);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let temp = each_array[$$index];
            $$renderer3.push(`<button${attr_class(`py-2 text-sm rounded-lg transition-colors ${stringify(targetTemp === temp ? "badge-climate-heat" : "bg-surface-recessed text-content-secondary hover:bg-stroke-default")}`)}>${escape_html(temp)}°</button>`);
          }
          $$renderer3.push(`<!--]--></div></div>`);
        } else {
          $$renderer3.push("<!--[!-->");
          $$renderer3.push(`<div class="text-center py-8 text-content-secondary">No data available</div>`);
        }
        $$renderer3.push(`<!--]--> <div class="pt-4 border-t border-stroke-default space-y-2 text-sm"><div class="flex justify-between"><span class="text-content-secondary">Device ID</span> <span class="font-mono text-xs text-content-tertiary">${escape_html(device.id.slice(0, 12))}...</span></div> <div class="flex justify-between"><span class="text-content-secondary">Online</span> <span${attr_class(device.online ? "text-success" : "text-error")}>${escape_html(device.online ? "Yes" : "No")}</span></div></div></div>`);
      }
    });
    $$renderer2.push(`<!---->`);
  });
}
function YamahaCard($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { device, compact = false } = $$props;
    let displayName = translateDeviceName(device.name);
    let dialogOpen = false;
    let displayPower = "standby";
    $$renderer2.push(`<div role="button" tabindex="0"${attr_class(`card transition-card hover:scale-[1.02] ${stringify(compact ? "p-2.5" : "p-3")} w-full text-left cursor-pointer`)}><div class="flex items-center gap-2.5"><button${attr("disabled", true, true)}${attr_class(
      `w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 relative ${stringify("bg-surface-recessed text-content-tertiary")} hover:scale-105 disabled:opacity-50 disabled:hover:scale-100`,
      void 0,
      { "status-active": displayPower === "on" }
    )}><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clip-rule="evenodd"></path></svg> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></button> <div class="min-w-0 flex-1"><h4 class="font-medium text-sm text-content-primary truncate">${escape_html(displayName)}</h4> `);
    {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<p class="text-xs text-content-secondary">${escape_html("Offline")}</p>`);
    }
    $$renderer2.push(`<!--]--></div></div></div> `);
    DeviceDialog($$renderer2, {
      open: dialogOpen,
      onclose: () => dialogOpen = false,
      title: displayName,
      children: ($$renderer3) => {
        $$renderer3.push(`<div class="space-y-4"><div class="flex items-center justify-between"><span class="text-content-secondary">Status</span> <span${attr_class(`font-medium ${stringify("text-content-tertiary")}`)}>${escape_html("Offline")}</span></div> `);
        {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--></div>`);
      }
    });
    $$renderer2.push(`<!---->`);
  });
}
function AirPurifierCard($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { compact = false } = $$props;
    let status = store.airPurifier;
    let dialogOpen = false;
    let displayPower = status?.power ?? false;
    let displayMode = status?.mode ?? "auto";
    function aqiColor(aqi) {
      if (aqi <= 50) return "text-success bg-success/20";
      if (aqi <= 100) return "text-warning bg-warning/20";
      if (aqi <= 150) return "text-device-climate-heat-text bg-device-climate-heat-bg";
      return "text-error bg-error/20";
    }
    function aqiLabel(aqi) {
      if (aqi <= 50) return "Good";
      if (aqi <= 100) return "Moderate";
      if (aqi <= 150) return "Unhealthy";
      return "Very Unhealthy";
    }
    const modeLabels = { auto: "Auto", silent: "Night", favorite: "Manual" };
    $$renderer2.push(`<div role="button" tabindex="0"${attr_class(`card transition-card hover:scale-[1.02] ${stringify(compact ? "p-2.5" : "p-3")} w-full text-left cursor-pointer`)}><div class="flex items-center gap-2.5"><button${attr("disabled", !status, true)}${attr_class(
      `w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 relative ${stringify(displayPower ? "badge-air" : "bg-surface-recessed text-content-tertiary")} hover:scale-105 disabled:opacity-50 disabled:hover:scale-100`,
      void 0,
      { "status-active": displayPower }
    )}><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.414 1.415l.708-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clip-rule="evenodd"></path></svg> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></button> <div class="min-w-0 flex-1"><h4 class="font-medium text-sm text-content-primary truncate">Air Purifier</h4> `);
    if (displayPower) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="text-xs text-content-secondary">${escape_html(modeLabels[displayMode] || displayMode)} · ${escape_html(status?.aqi ?? 0)} AQI</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<p class="text-xs text-content-secondary">${escape_html(status ? "Off" : "Offline")}</p>`);
    }
    $$renderer2.push(`<!--]--></div> `);
    if (compact && status?.power) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div${attr_class(`px-2 py-1 rounded-md text-xs font-medium shrink-0 ${stringify(aqiColor(status.aqi))}`)}>${escape_html(status.aqi)}</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div> `);
    DeviceDialog($$renderer2, {
      open: dialogOpen,
      onclose: () => dialogOpen = false,
      title: "Air Purifier",
      children: ($$renderer3) => {
        $$renderer3.push(`<div class="space-y-4"><div class="flex items-center justify-between"><span class="text-content-secondary">Status</span> <span${attr_class(`font-medium ${stringify(displayPower ? "text-device-air-text" : "text-content-tertiary")}`)}>${escape_html(displayPower ? "On" : status ? "Off" : "Offline")}</span></div> `);
        if (status) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<button${attr_class(`w-full py-4 rounded-xl text-lg font-medium transition-all relative ${stringify(displayPower ? "badge-air" : "bg-surface-recessed text-content-secondary")} hover:scale-[1.02]`)}>${escape_html(displayPower ? "Turn Off" : "Turn On")} `);
          {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]--></button> `);
          if (displayPower) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div${attr_class(`rounded-xl p-4 text-center ${stringify(aqiColor(status.aqi))}`)}><span class="text-xs uppercase tracking-wide opacity-80">Air Quality Index</span> <p class="text-4xl font-bold mt-1">${escape_html(status.aqi)}</p> <p class="text-sm mt-1">${escape_html(aqiLabel(status.aqi))}</p></div> <div><p class="text-sm text-content-secondary mb-2">Mode</p> <div class="grid grid-cols-3 gap-2"><!--[-->`);
            const each_array = ensure_array_like([
              { value: "auto", label: "Auto" },
              { value: "silent", label: "Night" },
              { value: "favorite", label: "Manual" }
            ]);
            for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
              let mode = each_array[$$index];
              $$renderer3.push(`<button${attr_class(`py-3 text-sm rounded-lg transition-colors ${stringify(displayMode === mode.value ? "badge-air" : "bg-surface-recessed text-content-secondary hover:bg-stroke-default")}`)}>${escape_html(mode.label)}</button>`);
            }
            $$renderer3.push(`<!--]--></div></div> <div class="grid grid-cols-3 gap-3">`);
            if (status.humidity !== void 0) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="bg-surface-recessed rounded-xl p-3 text-center"><span class="text-xs text-content-secondary">Humidity</span> <p class="text-lg font-bold mt-1 text-content-primary">${escape_html(status.humidity)}%</p></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--> `);
            if (status.temperature !== void 0) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="bg-surface-recessed rounded-xl p-3 text-center"><span class="text-xs text-content-secondary">Temp</span> <p class="text-lg font-bold mt-1 text-content-primary">${escape_html(status.temperature)}°C</p></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--> `);
            if (status.filter_life !== void 0) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="bg-surface-recessed rounded-xl p-3 text-center"><span class="text-xs text-content-secondary">Filter</span> <p${attr_class(`text-lg font-bold mt-1 ${stringify(status.filter_life < 20 ? "text-error" : "text-content-primary")}`)}>${escape_html(status.filter_life)}%</p></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]-->`);
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--></div>`);
      }
    });
    $$renderer2.push(`<!---->`);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let lamps = store.lamps.filter((l) => l.category === "lamp");
    let thermostats = store.tuyaDevices.filter((d) => d.category === "wkf");
    let sensors = store.tuyaDevices.filter((d) => ["sj", "mcs", "wsdcg"].includes(d.category));
    let hasLoaded = store.lamps.length > 0 || store.tuyaDevices.length > 0 || store.yamahaDevices.length > 0;
    head("1uha8ag", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Smart Home</title>`);
      });
    });
    $$renderer2.push(`<div class="pb-24 space-y-6">`);
    if (store.loading && !hasLoaded) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="space-y-6"><!--[-->`);
      const each_array = ensure_array_like(Array(3));
      for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
        each_array[$$index_1];
        $$renderer2.push(`<section><div class="w-20 h-5 rounded bg-surface-recessed animate-pulse mb-3"></div> <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2"><!--[-->`);
        const each_array_1 = ensure_array_like(Array(4));
        for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
          each_array_1[$$index];
          $$renderer2.push(`<div class="card rounded-xl p-2.5"><div class="flex items-center gap-2.5"><div class="w-9 h-9 rounded-lg bg-surface-recessed animate-pulse"></div> <div class="flex-1 space-y-1.5"><div class="w-20 h-3.5 rounded bg-surface-recessed animate-pulse"></div> <div class="w-14 h-3 rounded bg-surface-recessed animate-pulse"></div></div></div></div>`);
        }
        $$renderer2.push(`<!--]--></div></section>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (lamps.length > 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<section><h2 class="text-sm font-medium text-content-secondary mb-3 flex items-center gap-2"><span class="text-device-lights-text">💡</span> Lights <span class="text-xs text-content-tertiary">(${escape_html(lamps.length)})</span></h2> <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2"><!--[-->`);
        const each_array_2 = ensure_array_like(lamps);
        for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
          let lamp = each_array_2[$$index_2];
          LampCard($$renderer2, { lamp, compact: true });
        }
        $$renderer2.push(`<!--]--></div></section>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (thermostats.length > 0 || store.airPurifier) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<section><h2 class="text-sm font-medium text-content-secondary mb-3 flex items-center gap-2"><span class="text-device-climate-heat-text">🌡️</span> Climate <span class="text-xs text-content-tertiary">(${escape_html(thermostats.length + (store.airPurifier ? 1 : 0))})</span></h2> <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2"><!--[-->`);
        const each_array_3 = ensure_array_like(thermostats);
        for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
          let device = each_array_3[$$index_3];
          TRVCard($$renderer2, { device, compact: true });
        }
        $$renderer2.push(`<!--]--> `);
        if (store.airPurifier) {
          $$renderer2.push("<!--[-->");
          AirPurifierCard($$renderer2, { compact: true });
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--></div></section>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (sensors.length > 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<section><h2 class="text-sm font-medium text-content-secondary mb-3 flex items-center gap-2"><span class="text-device-sensors-text">📡</span> Sensors <span class="text-xs text-content-tertiary">(${escape_html(sensors.length)})</span></h2> <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2"><!--[-->`);
        const each_array_4 = ensure_array_like(sensors);
        for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
          let device = each_array_4[$$index_4];
          TuyaSensorCard($$renderer2, { device, compact: true });
        }
        $$renderer2.push(`<!--]--></div></section>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (store.yamahaDevices.length > 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<section><h2 class="text-sm font-medium text-content-secondary mb-3 flex items-center gap-2"><span class="text-device-audio-text">🔊</span> Audio <span class="text-xs text-content-tertiary">(${escape_html(store.yamahaDevices.length)})</span></h2> <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2"><!--[-->`);
        const each_array_5 = ensure_array_like(store.yamahaDevices);
        for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
          let device = each_array_5[$$index_5];
          YamahaCard($$renderer2, { device, compact: true });
        }
        $$renderer2.push(`<!--]--></div></section>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> <section><h2 class="text-sm font-medium text-content-secondary mb-3 flex items-center gap-2"><span class="text-device-robot-text">🤖</span> Robot <span class="text-xs text-content-tertiary">(1)</span></h2> <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">`);
      RoborockCard($$renderer2, { status: store.roborock, compact: true });
      $$renderer2.push(`<!----></div></section>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  _page as default
};
