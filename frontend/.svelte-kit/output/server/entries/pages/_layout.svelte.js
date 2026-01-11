import { U as ensure_array_like, V as store_get, W as attr, X as attr_class, Y as attr_style, Z as unsubscribe_stores, _ as stringify } from "../../chunks/index2.js";
import { g as getContext, e as escape_html } from "../../chunks/context.js";
import "clsx";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/state.svelte.js";
import { Z as Zap, H as House } from "../../chunks/zap.js";
import { L as Lightbulb } from "../../chunks/lightbulb.js";
import { T as Thermometer } from "../../chunks/thermometer.js";
const getStores = () => {
  const stores$1 = getContext("__svelte__");
  return {
    /** @type {typeof page} */
    page: {
      subscribe: stores$1.page.subscribe
    },
    /** @type {typeof navigating} */
    navigating: {
      subscribe: stores$1.navigating.subscribe
    },
    /** @type {typeof updated} */
    updated: stores$1.updated
  };
};
const page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  }
};
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { children } = $$props;
    const navItems = [
      { href: "/", label: "Dashboard", icon: House },
      { href: "/lighting", label: "Lighting", icon: Lightbulb },
      {
        href: "/heater-schedule",
        label: "Climate",
        icon: Thermometer
      }
    ];
    $$renderer2.push(`<div class="min-h-screen bg-surface-base circuit-bg"><header class="sticky top-0 z-40 futuristic-header"><nav class="flex items-center justify-between max-w-6xl mx-auto px-4 py-3"><a href="/" class="flex items-center gap-3 group"><div class="relative"><div class="w-10 h-10 rounded-xl bg-[var(--color-accent-subtle)] border border-[var(--color-accent)] flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_20px_var(--color-accent-glow)]">`);
    Zap($$renderer2, { class: "w-5 h-5 text-accent" });
    $$renderer2.push(`<!----></div> <div class="absolute -top-0.5 -left-0.5 w-2 h-2 border-t-2 border-l-2 border-accent rounded-tl-md"></div> <div class="absolute -bottom-0.5 -right-0.5 w-2 h-2 border-b-2 border-r-2 border-accent rounded-br-md"></div></div> <div class="hidden sm:block"><h1 class="font-display text-sm tracking-[0.2em] text-content-primary uppercase">Smart Home</h1> <p class="text-[10px] tracking-[0.3em] text-content-tertiary uppercase">Control Center</p></div></a> <div class="flex items-center gap-1"><!--[-->`);
    const each_array = ensure_array_like(navItems);
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      let item = each_array[i];
      const isActive = store_get($$store_subs ??= {}, "$page", page).url.pathname === item.href;
      $$renderer2.push(`<a${attr("href", item.href)}${attr_class(`nav-pill flex items-center gap-2 ${stringify(isActive ? "nav-pill-active" : "text-content-secondary hover:text-content-primary hover:bg-surface-recessed")}`)}${attr_style(`animation-delay: ${stringify(i * 50)}ms`)}><!---->`);
      item.icon?.($$renderer2, { class: "w-4 h-4" });
      $$renderer2.push(`<!----> <span class="hidden sm:inline text-sm">${escape_html(item.label)}</span></a>`);
    }
    $$renderer2.push(`<!--]--></div></nav></header> <main class="relative z-10 max-w-6xl mx-auto px-4 py-6">`);
    children($$renderer2);
    $$renderer2.push(`<!----></main> <div class="fixed bottom-0 left-0 right-0 h-32 pointer-events-none z-0 bg-gradient-to-t from-[rgba(0,245,255,0.03)] to-transparent"></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _layout as default
};
