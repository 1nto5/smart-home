import { a2 as head, Y as attr, X as ensure_array_like, Z as attr_class, _ as stringify } from "../../../chunks/index2.js";
import { s as store } from "../../../chunks/stores.svelte.js";
import { e as escape_html } from "../../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let newName = "";
    let newPreset = "night";
    let newTime = "19:00";
    head("19rgvlq", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Smart Home - Schedule</title>`);
      });
    });
    $$renderer2.push(`<div class="space-y-8"><section class="bg-surface-elevated border border-stroke-default rounded-xl p-4"><h2 class="text-lg font-medium text-content-primary mb-4">Create Schedule</h2> <div class="flex flex-col sm:flex-row flex-wrap gap-3"><input type="text" placeholder="Schedule name"${attr("value", newName)} class="bg-surface-recessed border border-stroke-default rounded-lg px-3 py-2 w-full sm:flex-1 sm:min-w-[150px] text-content-primary placeholder:text-content-tertiary"/> <div class="flex gap-3">`);
    $$renderer2.select(
      {
        value: newPreset,
        class: "bg-surface-recessed border border-stroke-default rounded-lg px-3 py-2 text-content-primary flex-1 sm:flex-initial"
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "day" }, ($$renderer4) => {
          $$renderer4.push(`Day Mode`);
        });
        $$renderer3.option({ value: "night" }, ($$renderer4) => {
          $$renderer4.push(`Night Mode`);
        });
        $$renderer3.option({ value: "off" }, ($$renderer4) => {
          $$renderer4.push(`All Off`);
        });
      }
    );
    $$renderer2.push(` <input type="time"${attr("value", newTime)} class="bg-surface-recessed border border-stroke-default rounded-lg px-3 py-2 text-content-primary"/></div> <button${attr("disabled", !newName.trim(), true)} class="bg-accent hover:bg-accent/80 disabled:opacity-50 px-4 py-2 rounded-lg text-white font-medium w-full sm:w-auto">Add</button></div></section> <section><h2 class="text-lg font-medium text-content-primary mb-4">Schedules (${escape_html(store.schedules.length)})</h2> `);
    if (store.schedules.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="text-content-secondary">No schedules yet</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="space-y-2"><!--[-->`);
      const each_array = ensure_array_like(store.schedules);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let schedule = each_array[$$index];
        $$renderer2.push(`<div${attr_class("bg-surface-elevated border border-stroke-default rounded-xl p-3 flex items-center justify-between", void 0, { "opacity-50": !schedule.enabled })}><div class="flex items-center gap-4"><span class="text-xl font-mono text-content-primary">${escape_html(schedule.time)}</span> <div><span class="font-medium text-content-primary">${escape_html(schedule.name)}</span> <span class="text-sm text-content-secondary ml-2">(${escape_html(schedule.preset)})</span></div></div> <div class="flex gap-2"><button${attr_class(`text-sm px-3 py-1 rounded-lg font-medium transition-colors ${stringify(schedule.enabled ? "bg-success/20 text-success" : "bg-surface-recessed text-content-secondary")}`)}>${escape_html(schedule.enabled ? "On" : "Off")}</button> <button class="text-sm px-3 py-1 rounded-lg bg-error/20 text-error hover:bg-error/30 font-medium transition-colors">Delete</button></div></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></section> <section><div class="flex items-center justify-between mb-4"><h2 class="text-lg font-medium text-content-primary">Pending Actions (${escape_html(store.pendingActions.length)})</h2> `);
    if (store.pendingActions.length > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button class="text-sm px-3 py-1 rounded-lg bg-surface-recessed text-content-secondary hover:bg-stroke-default transition-colors">Clear All</button>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    if (store.pendingActions.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="text-content-secondary">No pending actions (all lamps online)</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="space-y-2"><!--[-->`);
      const each_array_1 = ensure_array_like(store.pendingActions);
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let action = each_array_1[$$index_1];
        $$renderer2.push(`<div class="bg-surface-elevated border border-stroke-default rounded-xl p-3 flex items-center justify-between"><div><span class="font-mono text-sm text-content-primary">${escape_html(action.device_id)}</span> <span class="text-sm text-content-secondary ml-2">→ ${escape_html(action.preset)}</span></div> <span class="text-xs text-content-tertiary">Retry #${escape_html(action.retry_count)}</span></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></section></div>`);
  });
}
export {
  _page as default
};
