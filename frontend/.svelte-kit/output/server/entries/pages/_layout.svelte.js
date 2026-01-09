import { U as ensure_array_like, V as attr, W as attr_class, X as stringify, Y as store_get, Z as unsubscribe_stores } from "../../chunks/index2.js";
import "clsx";
import { g as getContext, e as escape_html } from "../../chunks/context.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/state.svelte.js";
function createThemeStore() {
  let mode = "system";
  let resolvedTheme = "light";
  function init() {
    return;
  }
  function setMode(newMode) {
    mode = newMode;
  }
  function toggle() {
    const modes = ["system", "light", "dark"];
    const currentIndex = modes.indexOf(mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setMode(modes[nextIndex]);
  }
  return {
    get mode() {
      return mode;
    },
    get resolvedTheme() {
      return resolvedTheme;
    },
    get isDark() {
      return resolvedTheme === "dark";
    },
    init,
    setMode,
    toggle
  };
}
const theme = createThemeStore();
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
      { href: "/", label: "Home", icon: "🏠" },
      { href: "/presets", label: "Presets", icon: "🎨" },
      { href: "/schedule", label: "Schedule", icon: "📅" }
    ];
    const themeIcons = { system: "🌓", light: "☀️", dark: "🌙" };
    $$renderer2.push(`<div class="min-h-screen bg-surface-base transition-colors duration-200"><header class="sticky top-0 z-40 bg-surface-elevated border-b border-stroke-default"><nav class="flex items-center justify-between max-w-6xl mx-auto px-4 py-2.5"><h1 class="text-base font-semibold text-content-primary flex items-center gap-2"><span class="text-lg">🏡</span> <span class="hidden sm:inline">Smart Home</span></h1> <div class="flex items-center gap-2"><div class="flex gap-1"><!--[-->`);
    const each_array = ensure_array_like(navItems);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let item = each_array[$$index];
      $$renderer2.push(`<a${attr("href", item.href)}${attr_class(`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1.5 ${stringify(store_get($$store_subs ??= {}, "$page", page).url.pathname === item.href ? "bg-accent/15 text-accent" : "text-content-secondary hover:text-content-primary hover:bg-surface-recessed")}`)}><span class="text-sm">${escape_html(item.icon)}</span> <span class="hidden sm:inline">${escape_html(item.label)}</span></a>`);
    }
    $$renderer2.push(`<!--]--></div> <button class="ml-2 p-2 rounded-lg text-content-secondary hover:text-content-primary hover:bg-surface-recessed transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"${attr("title", `Theme: ${stringify(theme.mode)}`)}><span class="text-lg">${escape_html(themeIcons[theme.mode])}</span></button></div></nav></header> <main class="max-w-6xl mx-auto px-4 py-4">`);
    children($$renderer2);
    $$renderer2.push(`<!----></main></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _layout as default
};
