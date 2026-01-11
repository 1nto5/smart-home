import { a2 as head, U as ensure_array_like, W as attr, X as attr_class, _ as stringify } from "../../../chunks/index2.js";
import { X, P as Play, s as store } from "../../../chunks/x.js";
import { L as Lightbulb } from "../../../chunks/lightbulb.js";
import { P as Plus, C as Clock, T as Trash_2, a as Circle_alert } from "../../../chunks/trash-2.js";
import { P as Power, M as Moon, S as Sun } from "../../../chunks/sun.js";
import { e as escape_html } from "../../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let presets = {};
    let applyingPreset = null;
    let newName = "";
    let newPreset = "night";
    let newTime = "19:00";
    let loading = false;
    let editingPreset = null;
    let editBrightness = 100;
    let editColorTemp = 4e3;
    let editPower = true;
    function getIcon(presetName) {
      switch (presetName) {
        case "day":
          return Sun;
        case "night":
          return Moon;
        case "off":
          return Power;
        default:
          return Lightbulb;
      }
    }
    function getPresetName(presetId) {
      const preset = presets[presetId];
      return preset?.name ?? presetId;
    }
    head("92554t", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Smart Home - Lighting</title>`);
      });
    });
    $$renderer2.push(`<div class="space-y-8 pb-24"><section><div class="section-header section-header-lights svelte-92554t"><div class="section-icon glow-lights svelte-92554t">`);
    Lightbulb($$renderer2, { class: "w-4 h-4" });
    $$renderer2.push(`<!----></div> <h2 class="section-title svelte-92554t">Lamp Presets</h2> <span class="section-count svelte-92554t">${escape_html(Object.keys(presets).length)}</span> <div class="section-line svelte-92554t"></div> <button class="ml-3 px-3 py-1.5 rounded-lg glow-lights power-btn-on text-sm font-medium flex items-center gap-1.5 transition-transform hover:scale-105">`);
    Plus($$renderer2, { class: "w-4 h-4" });
    $$renderer2.push(`<!----> Add</button></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"><!--[-->`);
    const each_array = ensure_array_like(Object.entries(presets));
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let [name, preset] = each_array[$$index];
      $$renderer2.push(`<div class="card relative group hover:border-device-lights-text/30 transition-colors"><button class="absolute top-2 right-2 p-1.5 rounded-lg bg-error/10 text-error border border-error/30 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error/20" title="Delete preset">`);
      X($$renderer2, { class: "w-3 h-3" });
      $$renderer2.push(`<!----></button> <div class="p-4"><div class="flex items-center justify-between mb-3"><div class="flex items-center gap-2"><div class="w-8 h-8 rounded-lg glow-lights power-btn-on flex items-center justify-center"><!---->`);
      getIcon(name)?.($$renderer2, { class: "w-4 h-4" });
      $$renderer2.push(`<!----></div> <span class="font-display text-sm uppercase tracking-wider text-content-primary">${escape_html(preset.name)}</span></div> <button${attr("disabled", applyingPreset !== null, true)}${attr_class("p-2 rounded-lg bg-surface-recessed border border-stroke-default text-device-lights-text hover:glow-lights hover:power-btn-on transition-all disabled:opacity-50", void 0, { "pulse-ring": applyingPreset === name })} title="Apply to all lamps">`);
      Play($$renderer2, { class: "w-4 h-4" });
      $$renderer2.push(`<!----></button></div> `);
      if (editingPreset === name) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="space-y-3 pt-2 border-t border-stroke-subtle"><label class="flex items-center gap-2 cursor-pointer"><input type="checkbox"${attr("checked", editPower, true)} class="sr-only peer"/> <div class="w-9 h-5 rounded-full bg-surface-recessed border border-stroke-default peer-checked:glow-lights peer-checked:power-btn-on transition-all relative"><div class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-content-tertiary peer-checked:translate-x-4 peer-checked:bg-white transition-all"></div></div> <span class="text-sm text-content-primary">Power</span></label> <div class="space-y-1"><div class="flex items-center justify-between"><span class="text-xs text-content-tertiary">Brightness</span> <span class="font-display text-sm text-device-lights-text">${escape_html(editBrightness)}%</span></div> <input type="range" min="1" max="100"${attr("value", editBrightness)} class="w-full" style="--color-accent: var(--color-lights-text);"/></div> <div class="space-y-1"><div class="flex items-center justify-between"><span class="text-xs text-content-tertiary">Color Temp</span> <span class="font-display text-sm text-device-lights-text">${escape_html(editColorTemp)}K</span></div> <input type="range" min="2700" max="6500" step="100"${attr("value", editColorTemp)} class="w-full" style="--color-accent: var(--color-lights-text);"/></div> <div class="flex gap-2 pt-1"><button${attr("disabled", loading, true)} class="flex-1 py-2 rounded-lg bg-success/20 text-success border border-success/30 font-medium text-sm disabled:opacity-50 hover:bg-success/30 transition-colors">Save</button> <button class="px-3 py-2 rounded-lg bg-surface-recessed border border-stroke-default text-content-secondary text-sm hover:border-stroke-strong transition-colors">Cancel</button></div></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<button class="text-sm text-content-secondary hover:text-device-lights-text transition-colors flex items-center gap-2">`);
        if (preset.power) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<span class="font-display">${escape_html(preset.brightness)}%</span> <span class="text-content-tertiary">/</span> <span class="font-display">${escape_html(preset.colorTemp)}K</span>`);
        } else {
          $$renderer2.push("<!--[!-->");
          Power($$renderer2, { class: "w-4 h-4 text-content-tertiary" });
          $$renderer2.push(`<!----> <span>Off</span>`);
        }
        $$renderer2.push(`<!--]--></button>`);
      }
      $$renderer2.push(`<!--]--></div></div>`);
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></section> <section><div class="section-header svelte-92554t"><div class="section-icon svelte-92554t" style="background: color-mix(in srgb, var(--color-accent) 15%, transparent); border-color: color-mix(in srgb, var(--color-accent) 30%, transparent); color: var(--color-accent);">`);
    Plus($$renderer2, { class: "w-4 h-4" });
    $$renderer2.push(`<!----></div> <h2 class="section-title svelte-92554t" style="color: var(--color-accent);">Create Schedule</h2> <div class="section-line svelte-92554t" style="background: linear-gradient(90deg, color-mix(in srgb, var(--color-accent) 40%, transparent) 0%, transparent 100%);"></div></div> <div class="card p-4"><div class="flex flex-col sm:flex-row flex-wrap gap-3"><input type="text" placeholder="Schedule name"${attr("value", newName)} class="bg-surface-recessed border border-stroke-default rounded-lg px-3 py-2.5 w-full sm:flex-1 sm:min-w-[150px] text-content-primary placeholder:text-content-tertiary focus:border-accent focus:outline-none transition-colors"/> <div class="flex gap-3">`);
    $$renderer2.select(
      {
        value: newPreset,
        class: "bg-surface-recessed border border-stroke-default rounded-lg px-3 py-2.5 text-content-primary flex-1 sm:flex-initial focus:border-accent focus:outline-none transition-colors"
      },
      ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        const each_array_1 = ensure_array_like(Object.entries(presets));
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let [name, preset] = each_array_1[$$index_1];
          $$renderer3.option(
            { value: name, class: "" },
            ($$renderer4) => {
              $$renderer4.push(`${escape_html(preset.name)}`);
            },
            "svelte-92554t"
          );
        }
        $$renderer3.push(`<!--]-->`);
      },
      "svelte-92554t"
    );
    $$renderer2.push(` <input type="time"${attr("value", newTime)} class="bg-surface-recessed border border-stroke-default rounded-lg px-3 py-2.5 text-content-primary font-display focus:border-accent focus:outline-none transition-colors"/></div> <button${attr("disabled", !newName.trim(), true)}${attr_class(
      `px-5 py-2.5 rounded-lg font-semibold uppercase tracking-wider transition-all w-full sm:w-auto ${stringify(newName.trim() ? "glow-accent power-btn-on" : "bg-surface-recessed border border-stroke-default text-content-tertiary")}`,
      "svelte-92554t"
    )} style="--color-accent-glow: var(--color-accent-glow);">Add</button></div></div></section> <section><div class="section-header svelte-92554t"><div class="section-icon svelte-92554t" style="background: color-mix(in srgb, var(--color-accent) 15%, transparent); border-color: color-mix(in srgb, var(--color-accent) 30%, transparent); color: var(--color-accent);">`);
    Clock($$renderer2, { class: "w-4 h-4" });
    $$renderer2.push(`<!----></div> <h2 class="section-title svelte-92554t" style="color: var(--color-accent);">Schedules</h2> <span class="section-count svelte-92554t">${escape_html(store.schedules.length)}</span> <div class="section-line svelte-92554t" style="background: linear-gradient(90deg, color-mix(in srgb, var(--color-accent) 40%, transparent) 0%, transparent 100%);"></div></div> `);
    if (store.schedules.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="card p-6 text-center">`);
      Clock($$renderer2, {
        class: "w-10 h-10 mx-auto text-content-tertiary mb-2 opacity-50"
      });
      $$renderer2.push(`<!----> <p class="text-content-tertiary">No schedules configured</p></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="space-y-2"><!--[-->`);
      const each_array_2 = ensure_array_like(store.schedules);
      for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
        let schedule = each_array_2[$$index_2];
        $$renderer2.push(`<div${attr_class("card p-3 flex items-center justify-between transition-opacity svelte-92554t", void 0, {
          "opacity-50": !schedule.enabled,
          "card-active": schedule.enabled,
          "glow-accent": schedule.enabled
        })}><div class="flex items-center gap-4"><div class="font-display text-2xl text-accent neon-text-subtle">${escape_html(schedule.time)}</div> <div class="h-8 w-px bg-stroke-subtle"></div> <div><span class="font-medium text-content-primary">${escape_html(schedule.name)}</span> <span class="text-sm text-content-tertiary ml-2"><span class="text-device-lights-text">${escape_html(getPresetName(schedule.preset))}</span></span></div></div> <div class="flex gap-2"><button${attr_class(
          `px-3 py-1.5 rounded-lg font-medium text-sm transition-all ${stringify(schedule.enabled ? "glow-accent power-btn-on" : "bg-surface-recessed border border-stroke-default text-content-tertiary hover:border-stroke-strong")}`,
          "svelte-92554t"
        )}>${escape_html(schedule.enabled ? "On" : "Off")}</button> <button class="p-1.5 rounded-lg bg-error/10 text-error border border-error/30 hover:bg-error/20 transition-colors">`);
        Trash_2($$renderer2, { class: "w-4 h-4" });
        $$renderer2.push(`<!----></button></div></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></section> <section><div class="section-header svelte-92554t"><div class="section-icon svelte-92554t" style="background: color-mix(in srgb, var(--color-warning) 15%, transparent); border-color: color-mix(in srgb, var(--color-warning) 30%, transparent); color: var(--color-warning);">`);
    Circle_alert($$renderer2, { class: "w-4 h-4" });
    $$renderer2.push(`<!----></div> <h2 class="section-title svelte-92554t" style="color: var(--color-warning);">Pending Actions</h2> <span class="section-count svelte-92554t">${escape_html(store.pendingActions.length)}</span> <div class="section-line svelte-92554t" style="background: linear-gradient(90deg, color-mix(in srgb, var(--color-warning) 40%, transparent) 0%, transparent 100%);"></div> `);
    if (store.pendingActions.length > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button class="ml-3 px-3 py-1.5 rounded-lg bg-surface-recessed border border-stroke-default text-content-secondary text-sm hover:border-stroke-strong transition-colors">Clear All</button>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    if (store.pendingActions.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="card p-4 flex items-center gap-3"><div class="w-2 h-2 rounded-full bg-success animate-glow"></div> <p class="text-content-secondary text-sm">All lamps online - no pending actions</p></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="space-y-2"><!--[-->`);
      const each_array_3 = ensure_array_like(store.pendingActions);
      for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
        let action = each_array_3[$$index_3];
        $$renderer2.push(`<div class="card p-3 flex items-center justify-between border-warning/30"><div class="flex items-center gap-3"><div class="w-2 h-2 rounded-full bg-warning animate-glow"></div> <span class="font-mono text-sm text-content-primary">${escape_html(action.device_id)}</span> <span class="text-content-tertiary">→</span> <span class="text-sm text-device-lights-text">${escape_html(getPresetName(action.preset))}</span></div> <span class="text-xs font-display text-content-tertiary px-2 py-1 rounded bg-surface-recessed">Retry #${escape_html(action.retry_count)}</span></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></section></div>`);
  });
}
export {
  _page as default
};
