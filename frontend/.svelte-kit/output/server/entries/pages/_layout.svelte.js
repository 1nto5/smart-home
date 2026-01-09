import { U as ensure_array_like, V as attr, W as attr_class, X as stringify, Y as store_get, Z as unsubscribe_stores } from "../../chunks/index2.js";
import { g as getContext, e as escape_html } from "../../chunks/context.js";
import "clsx";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/state.svelte.js";
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
    $$renderer2.push(`<div class="min-h-screen bg-[var(--bg)]"><header class="sticky top-0 z-40 glass-card border-b border-[var(--glass-border)]"><nav class="flex items-center justify-between max-w-6xl mx-auto px-4 py-2.5"><h1 class="text-base font-semibold flex items-center gap-2"><span class="text-lg">🏡</span> <span class="hidden sm:inline">Smart Home</span></h1> <div class="flex gap-1"><!--[-->`);
    const each_array = ensure_array_like(navItems);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let item = each_array[$$index];
      $$renderer2.push(`<a${attr("href", item.href)}${attr_class(`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1.5 ${stringify(store_get($$store_subs ??= {}, "$page", page).url.pathname === item.href ? "bg-[var(--accent)]/15 text-[var(--accent)]" : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/5")}`)}><span class="text-sm">${escape_html(item.icon)}</span> <span class="hidden sm:inline">${escape_html(item.label)}</span></a>`);
    }
    $$renderer2.push(`<!--]--></div></nav></header> <main class="max-w-6xl mx-auto px-4 py-4">`);
    children($$renderer2);
    $$renderer2.push(`<!----></main></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _layout as default
};
