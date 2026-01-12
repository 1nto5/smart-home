import { U as sanitize_props, V as spread_props, W as slot } from "./index2.js";
import { I as Icon } from "./Icon.js";
function Flame($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
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
  const iconNode = [
    [
      "path",
      {
        "d": "M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"
      }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "flame" },
    $$sanitized_props,
    {
      /**
       * @component @name Flame
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTIgM3ExIDQgNCA2LjV0MyA1LjVhMSAxIDAgMCAxLTE0IDAgNSA1IDAgMCAxIDEtMyAxIDEgMCAwIDAgNSAwYzAtMi0xLjUtMy0xLjUtNXEwLTIgMi41LTQiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/flame
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
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
  "Czujnik zalania kuchnia": "Kitchen Sensor",
  "Czujnik zalania łazienka": "Bathroom Sensor",
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
function getSimplifiedName(name, category) {
  const translated = translateDeviceName(name);
  if (category === "wkf") {
    return translated.replace(/^(Radiator|Heater|Grzejnik)\s+/i, "").replace(/\s+(Radiator|Heater|Grzejnik)$/i, "");
  }
  if (category === "sj") {
    const match = translated.match(/^(.+?)\s*Sensor$/i);
    if (match) return match[1];
    const roomMatch = translated.match(/(Kitchen|Bathroom|Living Room|Bedroom|Hallway)/i);
    if (roomMatch) return roomMatch[1];
    return translated;
  }
  if (category === "mcs") {
    const lower = translated.toLowerCase();
    if (lower.includes("kitchen") || lower.includes("kuchnia")) return "Kitchen";
    if (lower.includes("door") || lower.includes("drzwi")) return "Door";
    if (lower.includes("bathroom") || lower.includes("łazienka")) return "Bathroom";
    return translated.replace(/\s*Sensor$/i, "");
  }
  return translated;
}
export {
  Flame as F,
  getSimplifiedName as g,
  translateDeviceName as t
};
