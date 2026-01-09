import { $ as head, U as ensure_array_like } from "../../../chunks/index2.js";
import { e as escape_html } from "../../../chunks/context.js";
import "clsx";
function PresetButton($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { name, preset } = $$props;
    function icon(presetName) {
      switch (presetName) {
        case "day":
          return "☀️";
        case // sun
        "night":
          return "🌙";
        case // moon
        "off":
          return "⚡";
        default:
          return "💡";
      }
    }
    $$renderer2.push(`<div class="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4"><div class="flex items-center gap-3 mb-3"><span class="text-2xl">${escape_html(icon(name))}</span> <div><h3 class="font-medium">${escape_html(preset.name)}</h3> <p class="text-xs text-[var(--muted)]">${escape_html(preset.power ? `${preset.brightness}% / ${preset.colorTemp}K` : "Off")}</p></div></div> <button class="w-full py-2 rounded bg-[var(--accent)] hover:bg-blue-600 relative transition-all">Apply to All Lamps `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></button> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let presets = {};
    head("ib7llb", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Smart Home - Presets</title>`);
      });
    });
    $$renderer2.push(`<div class="space-y-6"><h2 class="text-lg font-medium">Lamp Presets</h2> <p class="text-sm text-[var(--muted)]">Apply a preset to all lamps at once</p> <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"><!--[-->`);
    const each_array = ensure_array_like(Object.entries(presets));
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let [name, preset] = each_array[$$index];
      PresetButton($$renderer2, { name, preset });
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
export {
  _page as default
};
