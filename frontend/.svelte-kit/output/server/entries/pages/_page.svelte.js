import { $ as sanitize_props, a0 as spread_props, a1 as slot, X as attr_class, W as attr, _ as stringify, U as ensure_array_like, Y as attr_style, a2 as head } from "../../chunks/index2.js";
import { X, s as store, P as Play } from "../../chunks/x.js";
import { e as escape_html } from "../../chunks/context.js";
import "clsx";
import { P as Power, S as Sun, M as Moon } from "../../chunks/sun.js";
import { I as Icon } from "../../chunks/Icon.js";
import { H as House, Z as Zap } from "../../chunks/zap.js";
import { F as Flame } from "../../chunks/flame.js";
import { T as Thermometer } from "../../chunks/thermometer.js";
import { L as Lightbulb } from "../../chunks/lightbulb.js";
function Battery_low($$renderer, $$props) {
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
    ["path", { "d": "M22 14v-4" }],
    ["path", { "d": "M6 14v-4" }],
    [
      "rect",
      { "x": "2", "y": "6", "width": "16", "height": "12", "rx": "2" }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "battery-low" },
    $$sanitized_props,
    {
      /**
       * @component @name BatteryLow
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMjIgMTR2LTQiIC8+CiAgPHBhdGggZD0iTTYgMTR2LTQiIC8+CiAgPHJlY3QgeD0iMiIgeT0iNiIgd2lkdGg9IjE2IiBoZWlnaHQ9IjEyIiByeD0iMiIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/battery-low
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
function Battery($$renderer, $$props) {
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
    ["path", { "d": "M 22 14 L 22 10" }],
    [
      "rect",
      { "x": "2", "y": "6", "width": "16", "height": "12", "rx": "2" }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "battery" },
    $$sanitized_props,
    {
      /**
       * @component @name Battery
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNIDIyIDE0IEwgMjIgMTAiIC8+CiAgPHJlY3QgeD0iMiIgeT0iNiIgd2lkdGg9IjE2IiBoZWlnaHQ9IjEyIiByeD0iMiIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/battery
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
function Bot($$renderer, $$props) {
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
    ["path", { "d": "M12 8V4H8" }],
    [
      "rect",
      { "width": "16", "height": "12", "x": "4", "y": "8", "rx": "2" }
    ],
    ["path", { "d": "M2 14h2" }],
    ["path", { "d": "M20 14h2" }],
    ["path", { "d": "M15 13v2" }],
    ["path", { "d": "M9 13v2" }]
  ];
  Icon($$renderer, spread_props([
    { name: "bot" },
    $$sanitized_props,
    {
      /**
       * @component @name Bot
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTIgOFY0SDgiIC8+CiAgPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjEyIiB4PSI0IiB5PSI4IiByeD0iMiIgLz4KICA8cGF0aCBkPSJNMiAxNGgyIiAvPgogIDxwYXRoIGQ9Ik0yMCAxNGgyIiAvPgogIDxwYXRoIGQ9Ik0xNSAxM3YyIiAvPgogIDxwYXRoIGQ9Ik05IDEzdjIiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/bot
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
function Door_open($$renderer, $$props) {
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
    ["path", { "d": "M11 20H2" }],
    [
      "path",
      {
        "d": "M11 4.562v16.157a1 1 0 0 0 1.242.97L19 20V5.562a2 2 0 0 0-1.515-1.94l-4-1A2 2 0 0 0 11 4.561z"
      }
    ],
    ["path", { "d": "M11 4H8a2 2 0 0 0-2 2v14" }],
    ["path", { "d": "M14 12h.01" }],
    ["path", { "d": "M22 20h-3" }]
  ];
  Icon($$renderer, spread_props([
    { name: "door-open" },
    $$sanitized_props,
    {
      /**
       * @component @name DoorOpen
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTEgMjBIMiIgLz4KICA8cGF0aCBkPSJNMTEgNC41NjJ2MTYuMTU3YTEgMSAwIDAgMCAxLjI0Mi45N0wxOSAyMFY1LjU2MmEyIDIgMCAwIDAtMS41MTUtMS45NGwtNC0xQTIgMiAwIDAgMCAxMSA0LjU2MXoiIC8+CiAgPHBhdGggZD0iTTExIDRIOGEyIDIgMCAwIDAtMiAydjE0IiAvPgogIDxwYXRoIGQ9Ik0xNCAxMmguMDEiIC8+CiAgPHBhdGggZD0iTTIyIDIwaC0zIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/door-open
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
function Droplet($$renderer, $$props) {
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
        "d": "M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"
      }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "droplet" },
    $$sanitized_props,
    {
      /**
       * @component @name Droplet
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTIgMjJhNyA3IDAgMCAwIDctN2MwLTItMS0zLjktMy01LjVzLTMuNS00LTQtNi41Yy0uNSAyLjUtMiA0LjktNCA2LjVDNiAxMS4xIDUgMTMgNSAxNWE3IDcgMCAwIDAgNyA3eiIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/droplet
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
function Droplets($$renderer, $$props) {
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
        "d": "M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"
      }
    ],
    [
      "path",
      {
        "d": "M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"
      }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "droplets" },
    $$sanitized_props,
    {
      /**
       * @component @name Droplets
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNNyAxNi4zYzIuMiAwIDQtMS44MyA0LTQuMDUgMC0xLjE2LS41Ny0yLjI2LTEuNzEtMy4xOVM3LjI5IDYuNzUgNyA1LjNjLS4yOSAxLjQ1LTEuMTQgMi44NC0yLjI5IDMuNzZTMyAxMS4xIDMgMTIuMjVjMCAyLjIyIDEuOCA0LjA1IDQgNC4wNXoiIC8+CiAgPHBhdGggZD0iTTEyLjU2IDYuNkExMC45NyAxMC45NyAwIDAgMCAxNCAzLjAyYy41IDIuNSAyIDQuOSA0IDYuNXMzIDMuNSAzIDUuNWE2Ljk4IDYuOTggMCAwIDEtMTEuOTEgNC45NyIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/droplets
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
function Funnel($$renderer, $$props) {
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
        "d": "M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z"
      }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "funnel" },
    $$sanitized_props,
    {
      /**
       * @component @name Funnel
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTAgMjBhMSAxIDAgMCAwIC41NTMuODk1bDIgMUExIDEgMCAwIDAgMTQgMjF2LTdhMiAyIDAgMCAxIC41MTctMS4zNDFMMjEuNzQgNC42N0ExIDEgMCAwIDAgMjEgM0gzYTEgMSAwIDAgMC0uNzQyIDEuNjdsNy4yMjUgNy45ODlBMiAyIDAgMCAxIDEwIDE0eiIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/funnel
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
function Gauge($$renderer, $$props) {
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
    ["path", { "d": "m12 14 4-4" }],
    ["path", { "d": "M3.34 19a10 10 0 1 1 17.32 0" }]
  ];
  Icon($$renderer, spread_props([
    { name: "gauge" },
    $$sanitized_props,
    {
      /**
       * @component @name Gauge
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtMTIgMTQgNC00IiAvPgogIDxwYXRoIGQ9Ik0zLjM0IDE5YTEwIDEwIDAgMSAxIDE3LjMyIDAiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/gauge
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
function Pause($$renderer, $$props) {
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
      "rect",
      { "x": "14", "y": "3", "width": "5", "height": "18", "rx": "1" }
    ],
    [
      "rect",
      { "x": "5", "y": "3", "width": "5", "height": "18", "rx": "1" }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "pause" },
    $$sanitized_props,
    {
      /**
       * @component @name Pause
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cmVjdCB4PSIxNCIgeT0iMyIgd2lkdGg9IjUiIGhlaWdodD0iMTgiIHJ4PSIxIiAvPgogIDxyZWN0IHg9IjUiIHk9IjMiIHdpZHRoPSI1IiBoZWlnaHQ9IjE4IiByeD0iMSIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/pause
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
function Radio($$renderer, $$props) {
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
    ["path", { "d": "M16.247 7.761a6 6 0 0 1 0 8.478" }],
    ["path", { "d": "M19.075 4.933a10 10 0 0 1 0 14.134" }],
    ["path", { "d": "M4.925 19.067a10 10 0 0 1 0-14.134" }],
    ["path", { "d": "M7.753 16.239a6 6 0 0 1 0-8.478" }],
    ["circle", { "cx": "12", "cy": "12", "r": "2" }]
  ];
  Icon($$renderer, spread_props([
    { name: "radio" },
    $$sanitized_props,
    {
      /**
       * @component @name Radio
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTYuMjQ3IDcuNzYxYTYgNiAwIDAgMSAwIDguNDc4IiAvPgogIDxwYXRoIGQ9Ik0xOS4wNzUgNC45MzNhMTAgMTAgMCAwIDEgMCAxNC4xMzQiIC8+CiAgPHBhdGggZD0iTTQuOTI1IDE5LjA2N2ExMCAxMCAwIDAgMSAwLTE0LjEzNCIgLz4KICA8cGF0aCBkPSJNNy43NTMgMTYuMjM5YTYgNiAwIDAgMSAwLTguNDc4IiAvPgogIDxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjIiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/radio
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
function Scale($$renderer, $$props) {
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
    ["path", { "d": "M12 3v18" }],
    ["path", { "d": "m19 8 3 8a5 5 0 0 1-6 0zV7" }],
    ["path", { "d": "M3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1" }],
    ["path", { "d": "m5 8 3 8a5 5 0 0 1-6 0zV7" }],
    ["path", { "d": "M7 21h10" }]
  ];
  Icon($$renderer, spread_props([
    { name: "scale" },
    $$sanitized_props,
    {
      /**
       * @component @name Scale
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTIgM3YxOCIgLz4KICA8cGF0aCBkPSJtMTkgOCAzIDhhNSA1IDAgMCAxLTYgMHpWNyIgLz4KICA8cGF0aCBkPSJNMyA3aDFhMTcgMTcgMCAwIDAgOC0yIDE3IDE3IDAgMCAwIDggMmgxIiAvPgogIDxwYXRoIGQ9Im01IDggMyA4YTUgNSAwIDAgMS02IDB6VjciIC8+CiAgPHBhdGggZD0iTTcgMjFoMTAiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/scale
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
function Smartphone($$renderer, $$props) {
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
      "rect",
      {
        "width": "14",
        "height": "20",
        "x": "5",
        "y": "2",
        "rx": "2",
        "ry": "2"
      }
    ],
    ["path", { "d": "M12 18h.01" }]
  ];
  Icon($$renderer, spread_props([
    { name: "smartphone" },
    $$sanitized_props,
    {
      /**
       * @component @name Smartphone
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cmVjdCB3aWR0aD0iMTQiIGhlaWdodD0iMjAiIHg9IjUiIHk9IjIiIHJ4PSIyIiByeT0iMiIgLz4KICA8cGF0aCBkPSJNMTIgMThoLjAxIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/smartphone
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
function Snowflake($$renderer, $$props) {
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
    ["path", { "d": "m10 20-1.25-2.5L6 18" }],
    ["path", { "d": "M10 4 8.75 6.5 6 6" }],
    ["path", { "d": "m14 20 1.25-2.5L18 18" }],
    ["path", { "d": "m14 4 1.25 2.5L18 6" }],
    ["path", { "d": "m17 21-3-6h-4" }],
    ["path", { "d": "m17 3-3 6 1.5 3" }],
    ["path", { "d": "M2 12h6.5L10 9" }],
    ["path", { "d": "m20 10-1.5 2 1.5 2" }],
    ["path", { "d": "M22 12h-6.5L14 15" }],
    ["path", { "d": "m4 10 1.5 2L4 14" }],
    ["path", { "d": "m7 21 3-6-1.5-3" }],
    ["path", { "d": "m7 3 3 6h4" }]
  ];
  Icon($$renderer, spread_props([
    { name: "snowflake" },
    $$sanitized_props,
    {
      /**
       * @component @name Snowflake
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtMTAgMjAtMS4yNS0yLjVMNiAxOCIgLz4KICA8cGF0aCBkPSJNMTAgNCA4Ljc1IDYuNSA2IDYiIC8+CiAgPHBhdGggZD0ibTE0IDIwIDEuMjUtMi41TDE4IDE4IiAvPgogIDxwYXRoIGQ9Im0xNCA0IDEuMjUgMi41TDE4IDYiIC8+CiAgPHBhdGggZD0ibTE3IDIxLTMtNmgtNCIgLz4KICA8cGF0aCBkPSJtMTcgMy0zIDYgMS41IDMiIC8+CiAgPHBhdGggZD0iTTIgMTJoNi41TDEwIDkiIC8+CiAgPHBhdGggZD0ibTIwIDEwLTEuNSAyIDEuNSAyIiAvPgogIDxwYXRoIGQ9Ik0yMiAxMmgtNi41TDE0IDE1IiAvPgogIDxwYXRoIGQ9Im00IDEwIDEuNSAyTDQgMTQiIC8+CiAgPHBhdGggZD0ibTcgMjEgMy02LTEuNS0zIiAvPgogIDxwYXRoIGQ9Im03IDMgMyA2aDQiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/snowflake
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
function Sparkles($$renderer, $$props) {
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
        "d": "M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"
      }
    ],
    ["path", { "d": "M20 2v4" }],
    ["path", { "d": "M22 4h-4" }],
    ["circle", { "cx": "4", "cy": "20", "r": "2" }]
  ];
  Icon($$renderer, spread_props([
    { name: "sparkles" },
    $$sanitized_props,
    {
      /**
       * @component @name Sparkles
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTEuMDE3IDIuODE0YTEgMSAwIDAgMSAxLjk2NiAwbDEuMDUxIDUuNTU4YTIgMiAwIDAgMCAxLjU5NCAxLjU5NGw1LjU1OCAxLjA1MWExIDEgMCAwIDEgMCAxLjk2NmwtNS41NTggMS4wNTFhMiAyIDAgMCAwLTEuNTk0IDEuNTk0bC0xLjA1MSA1LjU1OGExIDEgMCAwIDEtMS45NjYgMGwtMS4wNTEtNS41NThhMiAyIDAgMCAwLTEuNTk0LTEuNTk0bC01LjU1OC0xLjA1MWExIDEgMCAwIDEgMC0xLjk2Nmw1LjU1OC0xLjA1MWEyIDIgMCAwIDAgMS41OTQtMS41OTR6IiAvPgogIDxwYXRoIGQ9Ik0yMCAydjQiIC8+CiAgPHBhdGggZD0iTTIyIDRoLTQiIC8+CiAgPGNpcmNsZSBjeD0iNCIgY3k9IjIwIiByPSIyIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/sparkles
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
function Thermometer_sun($$renderer, $$props) {
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
    ["path", { "d": "M12 2v2" }],
    ["path", { "d": "M12 8a4 4 0 0 0-1.645 7.647" }],
    ["path", { "d": "M2 12h2" }],
    ["path", { "d": "M20 14.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0z" }],
    ["path", { "d": "m4.93 4.93 1.41 1.41" }],
    ["path", { "d": "m6.34 17.66-1.41 1.41" }]
  ];
  Icon($$renderer, spread_props([
    { name: "thermometer-sun" },
    $$sanitized_props,
    {
      /**
       * @component @name ThermometerSun
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTIgMnYyIiAvPgogIDxwYXRoIGQ9Ik0xMiA4YTQgNCAwIDAgMC0xLjY0NSA3LjY0NyIgLz4KICA8cGF0aCBkPSJNMiAxMmgyIiAvPgogIDxwYXRoIGQ9Ik0yMCAxNC41NGE0IDQgMCAxIDEtNCAwVjRhMiAyIDAgMCAxIDQgMHoiIC8+CiAgPHBhdGggZD0ibTQuOTMgNC45MyAxLjQxIDEuNDEiIC8+CiAgPHBhdGggZD0ibTYuMzQgMTcuNjYtMS40MSAxLjQxIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/thermometer-sun
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
function Triangle_alert($$renderer, $$props) {
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
        "d": "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"
      }
    ],
    ["path", { "d": "M12 9v4" }],
    ["path", { "d": "M12 17h.01" }]
  ];
  Icon($$renderer, spread_props([
    { name: "triangle-alert" },
    $$sanitized_props,
    {
      /**
       * @component @name TriangleAlert
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtMjEuNzMgMTgtOC0xNGEyIDIgMCAwIDAtMy40OCAwbC04IDE0QTIgMiAwIDAgMCA0IDIxaDE2YTIgMiAwIDAgMCAxLjczLTMiIC8+CiAgPHBhdGggZD0iTTEyIDl2NCIgLz4KICA8cGF0aCBkPSJNMTIgMTdoLjAxIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/triangle-alert
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
function Tv($$renderer, $$props) {
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
    ["path", { "d": "m17 2-5 5-5-5" }],
    [
      "rect",
      { "width": "20", "height": "15", "x": "2", "y": "7", "rx": "2" }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "tv" },
    $$sanitized_props,
    {
      /**
       * @component @name Tv
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtMTcgMi01IDUtNS01IiAvPgogIDxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIxNSIgeD0iMiIgeT0iNyIgcng9IjIiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/tv
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
function Volume_2($$renderer, $$props) {
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
        "d": "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"
      }
    ],
    ["path", { "d": "M16 9a5 5 0 0 1 0 6" }],
    ["path", { "d": "M19.364 18.364a9 9 0 0 0 0-12.728" }]
  ];
  Icon($$renderer, spread_props([
    { name: "volume-2" },
    $$sanitized_props,
    {
      /**
       * @component @name Volume2
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTEgNC43MDJhLjcwNS43MDUgMCAwIDAtMS4yMDMtLjQ5OEw2LjQxMyA3LjU4N0ExLjQgMS40IDAgMCAxIDUuNDE2IDhIM2ExIDEgMCAwIDAtMSAxdjZhMSAxIDAgMCAwIDEgMWgyLjQxNmExLjQgMS40IDAgMCAxIC45OTcuNDEzbDMuMzgzIDMuMzg0QS43MDUuNzA1IDAgMCAwIDExIDE5LjI5OHoiIC8+CiAgPHBhdGggZD0iTTE2IDlhNSA1IDAgMCAxIDAgNiIgLz4KICA8cGF0aCBkPSJNMTkuMzY0IDE4LjM2NGE5IDkgMCAwIDAgMC0xMi43MjgiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/volume-2
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
function Volume_x($$renderer, $$props) {
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
        "d": "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"
      }
    ],
    ["line", { "x1": "22", "x2": "16", "y1": "9", "y2": "15" }],
    ["line", { "x1": "16", "x2": "22", "y1": "9", "y2": "15" }]
  ];
  Icon($$renderer, spread_props([
    { name: "volume-x" },
    $$sanitized_props,
    {
      /**
       * @component @name VolumeX
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTEgNC43MDJhLjcwNS43MDUgMCAwIDAtMS4yMDMtLjQ5OEw2LjQxMyA3LjU4N0ExLjQgMS40IDAgMCAxIDUuNDE2IDhIM2ExIDEgMCAwIDAtMSAxdjZhMSAxIDAgMCAwIDEgMWgyLjQxNmExLjQgMS40IDAgMCAxIC45OTcuNDEzbDMuMzgzIDMuMzg0QS43MDUuNzA1IDAgMCAwIDExIDE5LjI5OHoiIC8+CiAgPGxpbmUgeDE9IjIyIiB4Mj0iMTYiIHkxPSI5IiB5Mj0iMTUiIC8+CiAgPGxpbmUgeDE9IjE2IiB4Mj0iMjIiIHkxPSI5IiB5Mj0iMTUiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/volume-x
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
function Wind($$renderer, $$props) {
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
    ["path", { "d": "M12.8 19.6A2 2 0 1 0 14 16H2" }],
    ["path", { "d": "M17.5 8a2.5 2.5 0 1 1 2 4H2" }],
    ["path", { "d": "M9.8 4.4A2 2 0 1 1 11 8H2" }]
  ];
  Icon($$renderer, spread_props([
    { name: "wind" },
    $$sanitized_props,
    {
      /**
       * @component @name Wind
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTIuOCAxOS42QTIgMiAwIDEgMCAxNCAxNkgyIiAvPgogIDxwYXRoIGQ9Ik0xNy41IDhhMi41IDIuNSAwIDEgMSAyIDRIMiIgLz4KICA8cGF0aCBkPSJNOS44IDQuNEEyIDIgMCAxIDEgMTEgOEgyIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/wind
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
      $$renderer2.push(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4 dialog-overlay svelte-alpl3u" role="dialog" aria-modal="true" aria-labelledby="dialog-title" tabindex="-1"><div class="dialog-content w-full max-w-[calc(100vw-2rem)] sm:max-w-md max-h-[85vh] overflow-hidden animate-dialog-in svelte-alpl3u"><div class="relative px-5 py-4 border-b border-stroke-default"><div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent-glow)] to-transparent"></div> <div class="flex items-center justify-between"><h2 id="dialog-title" class="font-display text-base tracking-[0.1em] text-content-primary uppercase">${escape_html(title)}</h2> <button aria-label="Close dialog" class="w-10 h-10 rounded-lg bg-surface-recessed border border-stroke-default text-content-secondary hover:text-error hover:border-error hover:bg-[rgba(255,71,87,0.1)] transition-all duration-300 flex items-center justify-center hover:shadow-[0_0_15px_rgba(255,71,87,0.3)]">`);
      X($$renderer2, { class: "w-5 h-5" });
      $$renderer2.push(`<!----></button></div></div> <div class="relative p-5 overflow-y-auto max-h-[calc(85vh-80px)]"><div class="absolute inset-0 opacity-[0.02] pointer-events-none" style="background-image: linear-gradient(var(--color-accent) 1px, transparent 1px), linear-gradient(90deg, var(--color-accent) 1px, transparent 1px); background-size: 30px 30px;"></div> <div class="relative z-10">`);
      children($$renderer2);
      $$renderer2.push(`<!----></div></div></div></div>`);
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
    let isOnline = lamp.online === 1;
    let dialogOpen = false;
    let isPowerPending = false;
    let activePreset = null;
    let displayPower = isOnline ? status?.power ?? false : false;
    let displayBrightness = status?.brightness ?? 0;
    let displayColorTemp = status?.color_temp ?? 0;
    const presets = [
      {
        id: "day",
        label: "Day",
        brightness: 100,
        colorTemp: 5e3,
        moonlight: false,
        icon: Sun
      },
      {
        id: "night",
        label: "Night",
        brightness: 30,
        colorTemp: 2700,
        moonlight: false,
        icon: Moon
      },
      {
        id: "moonlight",
        label: "Moonlight",
        brightness: 10,
        colorTemp: 2700,
        moonlight: true,
        icon: Sparkles
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
    $$renderer2.push(`<div role="button" tabindex="0"${attr_class(`card ${stringify(compact ? "p-3" : "p-4")} w-full text-left cursor-pointer ${stringify(displayPower ? "card-active glow-lights" : "")}`)}><div class="flex items-center gap-3"><button${attr("disabled", !isOnline, true)}${attr_class(`power-btn glow-lights ${stringify(displayPower ? "power-btn-on" : "")} ${stringify(status?.moonlight_mode && displayPower ? "glow-audio" : "")} disabled:opacity-40 disabled:cursor-not-allowed`, void 0, { "pulse-ring": isPowerPending })}>`);
    Power($$renderer2, { class: "w-4 h-4" });
    $$renderer2.push(`<!----></button> <div class="min-w-0 flex-1"><h4 class="font-medium text-sm text-content-primary truncate">${escape_html(displayName)}</h4> `);
    if (!isOnline) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="text-xs text-content-tertiary">Offline</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (displayPower) {
        $$renderer2.push("<!--[-->");
        if (status?.moonlight_mode) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<p class="text-xs text-device-audio-text neon-text-subtle">Moonlight</p>`);
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`<p class="text-xs text-content-secondary"><span class="text-device-lights-text">${escape_html(displayBrightness)}%</span> <span class="mx-1 text-content-tertiary">/</span> <span>${escape_html(displayColorTemp)}K</span></p>`);
        }
        $$renderer2.push(`<!--]-->`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<p class="text-xs text-content-tertiary">Standby</p>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></div></div> `);
    DeviceDialog($$renderer2, {
      open: dialogOpen,
      onclose: () => dialogOpen = false,
      title: displayName,
      children: ($$renderer3) => {
        $$renderer3.push(`<div class="space-y-5"><div class="flex items-center justify-between py-2 px-3 rounded-lg bg-surface-recessed border border-stroke-subtle"><span class="text-sm text-content-secondary uppercase tracking-wider">Status</span> <span${attr_class(`font-medium text-sm ${stringify(displayPower ? status?.moonlight_mode ? "text-device-audio-text neon-text-subtle" : "text-device-lights-text neon-text-subtle" : "text-content-tertiary")}`)}>`);
        if (!isOnline) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`Offline`);
        } else {
          $$renderer3.push("<!--[!-->");
          if (displayPower) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`${escape_html(status?.moonlight_mode ? "Moonlight" : "Active")}`);
          } else {
            $$renderer3.push("<!--[!-->");
            $$renderer3.push(`Standby`);
          }
          $$renderer3.push(`<!--]-->`);
        }
        $$renderer3.push(`<!--]--></span></div> `);
        if (isOnline && status) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<button${attr_class(`w-full py-4 rounded-xl font-semibold uppercase tracking-wider transition-all relative overflow-hidden ${stringify(displayPower ? status.moonlight_mode ? "glow-audio power-btn-on" : "glow-lights power-btn-on" : "bg-surface-recessed border border-stroke-default text-content-secondary hover:border-stroke-strong")}`)}><span class="relative z-10">${escape_html(displayPower ? "Power Off" : "Power On")}</span> `);
          {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]--></button> `);
          if (displayPower) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div><p class="text-xs text-content-tertiary uppercase tracking-wider mb-3">Quick Presets</p> <div class="grid grid-cols-3 gap-2"><!--[-->`);
            const each_array = ensure_array_like(presets);
            for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
              let preset = each_array[$$index];
              const active = isPresetActive(preset) || activePreset === preset.id;
              $$renderer3.push(`<button${attr_class(`py-3 px-2 rounded-lg transition-all flex flex-col items-center gap-1.5 relative ${stringify(active ? preset.moonlight ? "glow-audio power-btn-on" : "glow-lights power-btn-on" : "bg-surface-recessed border border-stroke-default text-content-secondary hover:border-stroke-strong")}`)}><!---->`);
              preset.icon?.($$renderer3, { class: "w-4 h-4" });
              $$renderer3.push(`<!----> <span class="text-xs font-medium">${escape_html(preset.label)}</span> `);
              if (activePreset === preset.id) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<div class="absolute inset-0 rounded-lg border-2 border-current animate-glow"></div>`);
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]--></button>`);
            }
            $$renderer3.push(`<!--]--></div></div> `);
            if (!status.moonlight_mode) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div><div class="flex justify-between items-center mb-3"><span class="text-xs text-content-tertiary uppercase tracking-wider">Brightness</span> <span class="font-display text-lg text-device-lights-text neon-text-subtle">${escape_html(displayBrightness)}%</span></div> <input type="range" min="1" max="100"${attr("value", displayBrightness)} class="w-full" style="--color-accent: var(--color-lights-text); --color-accent-glow: var(--color-lights-glow);"/></div> <div><div class="flex justify-between items-center mb-3"><span class="text-xs text-content-tertiary uppercase tracking-wider">Temperature</span> <span class="font-display text-lg text-content-primary">${escape_html(displayColorTemp)}K</span></div> <input type="range" min="1700" max="6500" step="100"${attr("value", displayColorTemp)} class="w-full"/> <div class="flex justify-between text-[10px] text-content-tertiary mt-2 uppercase tracking-wider"><span class="text-orange-400">Warm</span> <span class="text-sky-400">Cool</span></div></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
              $$renderer3.push(`<div class="py-6 text-center rounded-lg bg-device-audio-bg/30 border border-device-audio-text/20">`);
              Sparkles($$renderer3, { class: "w-6 h-6 mx-auto mb-2 text-device-audio-text" });
              $$renderer3.push(`<!----> <p class="text-sm text-device-audio-text">Hardware Night Mode</p></div>`);
            }
            $$renderer3.push(`<!--]-->`);
          } else {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]--> <div class="pt-4 border-t border-stroke-subtle space-y-2"><div class="flex justify-between items-center"><span class="text-xs text-content-tertiary uppercase tracking-wider">IP Address</span> <span class="font-mono text-xs text-accent px-2 py-1 rounded bg-accent/10">${escape_html(lamp.ip)}</span></div></div>`);
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
    let pendingCommand = null;
    let pendingFanMode = null;
    let pendingMopMode = null;
    let displayFanPower = status?.fanPower ?? 102;
    let displayMopMode = status?.waterBoxMode ?? 200;
    let activeTab = "controls";
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
      { mode: 101, name: "Quiet", icon: Volume_x },
      { mode: 102, name: "Balanced", icon: Scale },
      { mode: 103, name: "Turbo", icon: Wind },
      { mode: 104, name: "Max", icon: Flame }
    ];
    const MOP_MODES = [
      { mode: 200, name: "Off", icon: X },
      { mode: 201, name: "Low", icon: Droplet, count: 1 },
      { mode: 202, name: "Med", icon: Droplet, count: 2 },
      { mode: 203, name: "High", icon: Droplet, count: 3 }
    ];
    function getStateName(state) {
      return STATE_MAP[state] || "Unknown";
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
          return { color: "text-success", bg: "glow-sensors" };
        case 8:
          return { color: "text-accent", bg: "glow-robot" };
        case 3:
          return { color: "text-content-tertiary", bg: "" };
        case 10:
          return { color: "text-warning", bg: "glow-lights" };
        case 6:
        case 15:
        case 16:
        case 26:
          return { color: "text-device-sensors-text", bg: "glow-sensors" };
        case 12:
        case 9:
          return { color: "text-error", bg: "" };
        default:
          return { color: "text-content-tertiary", bg: "" };
      }
    }
    let style = status ? stateStyle(status.state) : { color: "text-content-tertiary", bg: "" };
    let isActive = status && [5, 11, 17, 18].includes(status.state);
    $$renderer2.push(`<div role="button" tabindex="0"${attr_class(`card ${stringify(compact ? "p-3" : "p-4")} w-full text-left cursor-pointer ${stringify(isActive ? "card-active glow-robot" : "")}`)}><div class="flex items-center gap-3"><div${attr_class(`power-btn ${stringify(style.bg)} ${stringify(isActive ? "power-btn-on" : "")}`)}>`);
    Bot($$renderer2, { class: "w-4 h-4" });
    $$renderer2.push(`<!----></div> <div class="min-w-0 flex-1"><h4 class="font-medium text-sm text-content-primary truncate">Roborock</h4> `);
    if (status) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p${attr_class(`text-xs ${stringify(style.color)} ${stringify(isActive ? "neon-text-subtle" : "")}`)}>${escape_html(getStateName(status.state))}</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<p class="text-xs text-content-tertiary">Offline</p>`);
    }
    $$renderer2.push(`<!--]--></div> `);
    if (compact && status) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex items-center gap-1.5 text-xs shrink-0 px-2 py-1 rounded bg-surface-recessed">`);
      if (status.battery > 20) {
        $$renderer2.push("<!--[-->");
        Battery($$renderer2, { class: "w-3.5 h-3.5 text-success" });
      } else {
        $$renderer2.push("<!--[!-->");
        Battery_low($$renderer2, { class: "w-3.5 h-3.5 text-error" });
      }
      $$renderer2.push(`<!--]--> <span${attr_class(status.battery > 20 ? "text-content-secondary" : "text-error")}>${escape_html(status.battery)}%</span></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div> `);
    DeviceDialog($$renderer2, {
      open: dialogOpen,
      onclose: () => dialogOpen = false,
      title: "Roborock",
      children: ($$renderer3) => {
        $$renderer3.push(`<div class="space-y-5"><div class="flex items-center justify-between py-2 px-3 rounded-lg bg-surface-recessed border border-stroke-subtle"><span class="text-sm text-content-secondary uppercase tracking-wider">Status</span> <span${attr_class(`font-medium text-sm ${stringify(style.color)} ${stringify(isActive ? "neon-text-subtle" : "")}`)}>${escape_html(status ? getStateName(status.state) : "Offline")}</span></div> `);
        if (status) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<div class="grid grid-cols-2 gap-3"><div${attr_class(`rounded-xl p-4 text-center ${stringify(status.battery > 20 ? "bg-surface-recessed border border-stroke-subtle" : "bg-error/10 border border-error/30")}`)}><span class="text-xs text-content-tertiary uppercase tracking-wider">Battery</span> <p${attr_class(`font-display text-3xl mt-2 ${stringify(status.battery > 20 ? "text-content-primary" : "text-error")}`)}>${escape_html(status.battery)}%</p></div> <div class="rounded-xl p-4 text-center bg-surface-recessed border border-stroke-subtle"><span class="text-xs text-content-tertiary uppercase tracking-wider">Fan Speed</span> <p class="font-display text-2xl mt-2 text-content-primary">${escape_html(getFanModeName(status.fanPower))}</p></div></div> <div class="flex gap-1 bg-surface-recessed rounded-lg p-1 border border-stroke-subtle"><!--[-->`);
          const each_array = ensure_array_like([
            { id: "controls", label: "Controls" },
            { id: "rooms", label: "Rooms" },
            { id: "settings", label: "Settings" }
          ]);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let tab = each_array[$$index];
            $$renderer3.push(`<button${attr_class(`flex-1 py-2 px-2 sm:px-3 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${stringify(activeTab === tab.id ? "glow-robot power-btn-on" : "text-content-secondary hover:text-content-primary")}`)}>${escape_html(tab.label)}</button>`);
          }
          $$renderer3.push(`<!--]--></div> `);
          {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div class="grid grid-cols-3 gap-2"><!--[-->`);
            const each_array_1 = ensure_array_like([
              {
                cmd: "start",
                icon: Play,
                label: "Start",
                glow: "glow-sensors"
              },
              {
                cmd: "pause",
                icon: Pause,
                label: "Pause",
                glow: "glow-lights"
              },
              { cmd: "home", icon: House, label: "Home", glow: "glow-robot" }
            ]);
            for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
              let action = each_array_1[$$index_1];
              $$renderer3.push(`<button${attr_class(`py-4 rounded-xl text-sm font-medium relative transition-all flex flex-col items-center gap-1.5 ${stringify(action.glow)} power-btn-on hover:scale-[1.02]`)}><!---->`);
              action.icon?.($$renderer3, { class: "w-5 h-5" });
              $$renderer3.push(`<!----> ${escape_html(action.label)} `);
              if (pendingCommand === action.cmd) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<div class="absolute inset-0 rounded-xl border-2 border-current animate-glow"></div>`);
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]--></button>`);
            }
            $$renderer3.push(`<!--]--></div> <button class="w-full py-3 rounded-xl bg-surface-recessed border border-stroke-default text-content-secondary text-sm font-medium relative hover:border-stroke-strong transition-all">Find Robot `);
            {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--></button> <div><p class="text-xs text-content-tertiary uppercase tracking-wider mb-3">Suction Power</p> <div class="grid grid-cols-4 gap-1"><!--[-->`);
            const each_array_2 = ensure_array_like(FAN_MODES);
            for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
              let fan = each_array_2[$$index_2];
              $$renderer3.push(`<button${attr_class(`py-2.5 px-1 rounded-lg text-xs font-medium transition-all relative flex flex-col items-center gap-1 ${stringify(displayFanPower === fan.mode ? "glow-audio power-btn-on" : "bg-surface-recessed border border-stroke-default text-content-secondary hover:border-stroke-strong")}`)}><!---->`);
              fan.icon?.($$renderer3, { class: "w-4 h-4" });
              $$renderer3.push(`<!----> ${escape_html(fan.name)} `);
              if (pendingFanMode === fan.mode) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<div class="absolute inset-0 rounded-lg border-2 border-current animate-glow"></div>`);
              } else {
                $$renderer3.push("<!--[!-->");
              }
              $$renderer3.push(`<!--]--></button>`);
            }
            $$renderer3.push(`<!--]--></div></div> <div><p class="text-xs text-content-tertiary uppercase tracking-wider mb-3">Mop Intensity</p> <div class="grid grid-cols-4 gap-1"><!--[-->`);
            const each_array_3 = ensure_array_like(MOP_MODES);
            for (let $$index_4 = 0, $$length = each_array_3.length; $$index_4 < $$length; $$index_4++) {
              let mop = each_array_3[$$index_4];
              $$renderer3.push(`<button${attr_class(`py-2.5 px-1 rounded-lg text-xs font-medium transition-all relative flex flex-col items-center gap-1 ${stringify(displayMopMode === mop.mode ? "glow-sensors power-btn-on" : "bg-surface-recessed border border-stroke-default text-content-secondary hover:border-stroke-strong")}`)}><div class="flex items-center justify-center gap-0.5">`);
              if (mop.count) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<!--[-->`);
                const each_array_4 = ensure_array_like(Array(mop.count));
                for (let $$index_3 = 0, $$length2 = each_array_4.length; $$index_3 < $$length2; $$index_3++) {
                  each_array_4[$$index_3];
                  $$renderer3.push(`<!---->`);
                  mop.icon?.($$renderer3, { class: "w-3 h-3" });
                  $$renderer3.push(`<!---->`);
                }
                $$renderer3.push(`<!--]-->`);
              } else {
                $$renderer3.push("<!--[!-->");
                $$renderer3.push(`<!---->`);
                mop.icon?.($$renderer3, { class: "w-4 h-4" });
                $$renderer3.push(`<!---->`);
              }
              $$renderer3.push(`<!--]--></div> ${escape_html(mop.name)} `);
              if (pendingMopMode === mop.mode) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<div class="absolute inset-0 rounded-lg border-2 border-current animate-glow"></div>`);
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
          $$renderer3.push(`<div class="text-center py-8">`);
          Bot($$renderer3, {
            class: "w-12 h-12 mx-auto mb-3 text-content-tertiary opacity-50"
          });
          $$renderer3.push(`<!----> <p class="text-content-tertiary">Start bridge to control robot</p></div>`);
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
      sj: { label: "Water", icon: Droplet },
      mcs: { label: "Door", icon: Door_open },
      wsdcg: { label: "Climate", icon: Thermometer },
      wfcon: { label: "Gateway", icon: Radio },
      cz: { label: "Remote", icon: Tv }
    };
    const defaultIcon = Smartphone;
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
          if (isWet) return {
            text: "Water detected!",
            alert: true,
            color: "text-error",
            lowBattery,
            batteryPercent: battery
          };
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
    let config = categoryConfig[device.category] || { label: device.category, icon: defaultIcon };
    let statusInfo = getStatusInfo(parsedStatus(), device.category);
    $$renderer2.push(`<div role="button" tabindex="0"${attr_class(`card ${stringify(compact ? "p-3" : "p-4")} w-full text-left cursor-pointer ${stringify(statusInfo.alert ? "card-active border-error/50" : statusInfo.lowBattery ? "border-warning/50" : "")}`)}><div class="flex items-center gap-3"><div${attr_class(
      `power-btn ${stringify(statusInfo.alert ? "bg-error/20 text-error border-error/50" : statusInfo.lowBattery ? "bg-warning/20 text-warning border-warning/50" : "glow-sensors power-btn-on")}`,
      void 0,
      { "animate-glow": statusInfo.alert }
    )}><!---->`);
    config.icon?.($$renderer2, { class: "w-4 h-4" });
    $$renderer2.push(`<!----></div> <div class="min-w-0 flex-1"><h4 class="font-medium text-sm text-content-primary truncate">${escape_html(displayName)}</h4> <p${attr_class(`text-xs ${stringify(statusInfo.lowBattery ? "text-warning" : statusInfo.color)} ${stringify(statusInfo.alert ? "neon-text-subtle" : "")}`)}>${escape_html(statusInfo.text)}</p></div> <div${attr_class(`w-2 h-2 rounded-full shrink-0 ${stringify(device.online ? "bg-success animate-glow" : "bg-content-tertiary")}`)}></div></div></div> `);
    DeviceDialog($$renderer2, {
      open: dialogOpen,
      onclose: () => dialogOpen = false,
      title: displayName,
      children: ($$renderer3) => {
        $$renderer3.push(`<div class="space-y-5"><div${attr_class(`rounded-xl p-6 text-center ${stringify(statusInfo.alert ? "bg-error/10 border border-error/30" : "bg-surface-recessed border border-stroke-subtle")}`)}><div${attr_class(`flex justify-center ${stringify(statusInfo.alert ? "text-error" : "text-device-sensors-text")}`)}>`);
        if (statusInfo.alert) {
          $$renderer3.push("<!--[-->");
          Triangle_alert($$renderer3, { class: "w-12 h-12 animate-glow" });
        } else {
          $$renderer3.push("<!--[!-->");
          $$renderer3.push(`<!---->`);
          config.icon?.($$renderer3, { class: "w-12 h-12" });
          $$renderer3.push(`<!---->`);
        }
        $$renderer3.push(`<!--]--></div> <p${attr_class(`font-display text-2xl mt-3 ${stringify(statusInfo.color)} ${stringify(statusInfo.alert ? "neon-text" : "")}`)}>${escape_html(statusInfo.text)}</p> <p class="text-sm text-content-tertiary mt-1 uppercase tracking-wider">${escape_html(config.label)} Sensor</p></div> `);
        if (device.category === "wsdcg") {
          $$renderer3.push("<!--[-->");
          const status = parsedStatus();
          if (status) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div class="grid grid-cols-2 gap-3"><div class="rounded-xl p-4 text-center bg-surface-recessed border border-stroke-subtle"><span class="text-xs text-content-tertiary uppercase tracking-wider">Temperature</span> <p class="font-display text-2xl mt-2 text-device-sensors-text neon-text-subtle">${escape_html((status["103"] / 100).toFixed(1))}°C</p></div> <div class="rounded-xl p-4 text-center bg-surface-recessed border border-stroke-subtle"><span class="text-xs text-content-tertiary uppercase tracking-wider">Humidity</span> <p class="font-display text-2xl mt-2 text-accent neon-text-subtle">${escape_html(status["102"])}%</p></div></div>`);
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
              $$renderer3.push(`<div class="rounded-xl p-4 bg-surface-recessed border border-stroke-subtle"><div class="flex items-center justify-between mb-3"><span class="text-xs text-content-tertiary uppercase tracking-wider flex items-center gap-2">`);
              Battery($$renderer3, { class: "w-4 h-4" });
              $$renderer3.push(`<!----> Battery</span> <span${attr_class(`font-display text-lg ${stringify(battery > 20 ? "text-success" : "text-error")}`)}>${escape_html(battery)}%</span></div> <div class="h-2 bg-[var(--color-bg-base)] rounded-full overflow-hidden"><div${attr_class(`h-full rounded-full transition-all ${stringify(battery > 20 ? "bg-success" : "bg-error")} ${stringify(battery > 20 ? "" : "animate-glow")}`)}${attr_style(`width: ${stringify(battery)}%`)}></div></div></div>`);
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
        $$renderer3.push(`<!--]--> <div class="pt-4 border-t border-stroke-subtle space-y-2"><div class="flex justify-between items-center"><span class="text-xs text-content-tertiary uppercase tracking-wider">Type</span> <span class="text-sm font-medium text-content-primary">${escape_html(config.label)}</span></div> <div class="flex justify-between items-center"><span class="text-xs text-content-tertiary uppercase tracking-wider">Online</span> <span${attr_class(`text-xs ${stringify(device.online ? "text-success" : "text-error")}`)}>${escape_html(device.online ? "Connected" : "Offline")}</span></div> <div class="flex justify-between items-center"><span class="text-xs text-content-tertiary uppercase tracking-wider">Device ID</span> <span class="font-mono text-xs text-accent px-2 py-1 rounded bg-accent/10">${escape_html(device.id.slice(0, 12))}...</span></div></div></div>`);
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
    $$renderer2.push(`<div role="button" tabindex="0"${attr_class(`card ${stringify(compact ? "p-3" : "p-4")} w-full text-left cursor-pointer ${stringify(valve === "opened" ? "card-active glow-climate-heat" : "")}`)}><div class="flex items-center gap-3"><div${attr_class(`power-btn ${stringify(valve === "opened" ? "power-btn-on glow-climate-heat" : "glow-climate-cool")}`)}>`);
    if (valve === "opened") {
      $$renderer2.push("<!--[-->");
      Flame($$renderer2, { class: "w-4 h-4" });
    } else {
      $$renderer2.push("<!--[!-->");
      Snowflake($$renderer2, { class: "w-4 h-4" });
    }
    $$renderer2.push(`<!--]--></div> <div class="min-w-0 flex-1"><h4 class="font-medium text-sm text-content-primary truncate">${escape_html(displayName)}</h4> `);
    if (currentTemp !== null) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="text-xs text-content-secondary"><span${attr_class(valve === "opened" ? "text-device-climate-heat-text" : "")}>${escape_html(currentTemp)}°C</span> <span class="mx-1 text-content-tertiary">/</span> <span class="text-device-climate-heat-text">${escape_html(targetTemp)}°C</span></p>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<p class="text-xs text-content-tertiary">No data</p>`);
    }
    $$renderer2.push(`<!--]--></div></div></div> `);
    DeviceDialog($$renderer2, {
      open: dialogOpen,
      onclose: () => dialogOpen = false,
      title: displayName,
      children: ($$renderer3) => {
        $$renderer3.push(`<div class="space-y-5"><div class="flex items-center justify-between py-2 px-3 rounded-lg bg-surface-recessed border border-stroke-subtle"><span class="text-sm text-content-secondary uppercase tracking-wider">Valve</span> <span${attr_class(`font-medium text-sm ${stringify(valve === "opened" ? "text-device-climate-heat-text neon-text-subtle" : "text-device-climate-cool-text neon-text-subtle")}`)}>${escape_html(valve === "opened" ? "Heating" : "Idle")}</span></div> `);
        if (currentTemp !== null && targetTemp !== null) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<div class="grid grid-cols-2 gap-3"><div class="rounded-xl p-4 text-center bg-surface-recessed border border-stroke-subtle"><span class="text-xs text-content-tertiary uppercase tracking-wider">Current</span> <p class="font-display text-3xl mt-2 text-content-primary">${escape_html(currentTemp)}°</p></div> <div class="rounded-xl p-4 text-center glow-climate-heat power-btn-on"><span class="text-xs uppercase tracking-wider opacity-80">Target</span> <p class="font-display text-3xl mt-2">${escape_html(targetTemp)}°</p></div></div> <div><p class="text-xs text-content-tertiary uppercase tracking-wider mb-3">Set Temperature</p> <div class="flex items-center justify-center gap-4"><button${attr("disabled", targetTemp !== null && targetTemp <= 5, true)} class="w-14 h-14 rounded-full glow-climate-cool power-btn-on text-2xl font-medium hover:scale-105 disabled:opacity-40 transition-all">−</button> <div class="relative">`);
          {
            $$renderer3.push("<!--[!-->");
            $$renderer3.push(`<button class="font-display text-3xl w-28 text-center text-content-primary hover:text-device-climate-heat-text transition-colors cursor-text" title="Click to edit">${escape_html(targetTemp)}°C</button>`);
          }
          $$renderer3.push(`<!--]--> `);
          {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]--> `);
          {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]--></div> <button${attr("disabled", targetTemp !== null && targetTemp >= 30, true)} class="w-14 h-14 rounded-full glow-climate-heat power-btn-on text-2xl font-medium hover:scale-105 disabled:opacity-40 transition-all">+</button></div></div> <div><p class="text-xs text-content-tertiary uppercase tracking-wider mb-3">Quick Set</p> <div class="grid grid-cols-4 gap-2"><!--[-->`);
          const each_array = ensure_array_like([15, 18, 21, 24]);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let temp = each_array[$$index];
            $$renderer3.push(`<button${attr_class(`py-3 rounded-lg transition-all font-medium ${stringify(targetTemp === temp ? "glow-climate-heat power-btn-on" : "bg-surface-recessed border border-stroke-default text-content-secondary hover:border-stroke-strong")}`)}>${escape_html(temp)}°</button>`);
          }
          $$renderer3.push(`<!--]--></div></div>`);
        } else {
          $$renderer3.push("<!--[!-->");
          $$renderer3.push(`<div class="text-center py-8 text-content-tertiary">`);
          Thermometer_sun($$renderer3, { class: "w-12 h-12 mx-auto mb-3 opacity-50" });
          $$renderer3.push(`<!----> <p>No data available</p></div>`);
        }
        $$renderer3.push(`<!--]--> <div class="pt-4 border-t border-stroke-subtle space-y-2"><div class="flex justify-between items-center"><span class="text-xs text-content-tertiary uppercase tracking-wider">Device ID</span> <span class="font-mono text-xs text-accent px-2 py-1 rounded bg-accent/10">${escape_html(device.id.slice(0, 12))}...</span></div> <div class="flex justify-between items-center"><span class="text-xs text-content-tertiary uppercase tracking-wider">Online</span> <span${attr_class(`text-xs ${stringify(device.online ? "text-success" : "text-error")}`)}>${escape_html(device.online ? "Connected" : "Offline")}</span></div></div></div>`);
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
    let isPowerPending = false;
    $$renderer2.push(`<div role="button" tabindex="0"${attr_class(`card ${stringify(compact ? "p-3" : "p-4")} w-full text-left cursor-pointer ${stringify("")}`)}><div class="flex items-center gap-3"><button${attr("disabled", true, true)}${attr_class(`power-btn glow-audio ${stringify("")} disabled:opacity-40 disabled:cursor-not-allowed`, void 0, { "pulse-ring": isPowerPending })}>`);
    Volume_2($$renderer2, { class: "w-4 h-4" });
    $$renderer2.push(`<!----></button> <div class="min-w-0 flex-1"><h4 class="font-medium text-sm text-content-primary truncate">${escape_html(displayName)}</h4> `);
    {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<p class="text-xs text-content-tertiary">${escape_html("Offline")}</p>`);
    }
    $$renderer2.push(`<!--]--></div></div></div> `);
    DeviceDialog($$renderer2, {
      open: dialogOpen,
      onclose: () => dialogOpen = false,
      title: displayName,
      children: ($$renderer3) => {
        $$renderer3.push(`<div class="space-y-5"><div class="flex items-center justify-between py-2 px-3 rounded-lg bg-surface-recessed border border-stroke-subtle"><span class="text-sm text-content-secondary uppercase tracking-wider">Status</span> <span${attr_class(`font-medium text-sm ${stringify("text-content-tertiary")}`)}>${escape_html("Offline")}</span></div> `);
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
    let isPowerPending = false;
    let displayPower = status?.power ?? false;
    let displayMode = status?.mode ?? "auto";
    function aqiColor(aqi) {
      if (aqi <= 50) return "text-success";
      if (aqi <= 100) return "text-warning";
      if (aqi <= 150) return "text-device-climate-heat-text";
      return "text-error";
    }
    function aqiBg(aqi) {
      if (aqi <= 50) return "bg-success/10 border-success/30";
      if (aqi <= 100) return "bg-warning/10 border-warning/30";
      if (aqi <= 150) return "bg-device-climate-heat-bg border-device-climate-heat-text/30";
      return "bg-error/10 border-error/30";
    }
    function aqiLabel(aqi) {
      if (aqi <= 50) return "Good";
      if (aqi <= 100) return "Moderate";
      if (aqi <= 150) return "Unhealthy";
      return "Very Unhealthy";
    }
    const modes = [
      { value: "auto", label: "Auto", icon: Gauge },
      { value: "silent", label: "Night", icon: Moon },
      { value: "favorite", label: "Manual", icon: Zap }
    ];
    const modeLabels = { auto: "Auto", silent: "Night", favorite: "Manual" };
    $$renderer2.push(`<div role="button" tabindex="0"${attr_class(`card ${stringify(compact ? "p-3" : "p-4")} w-full text-left cursor-pointer ${stringify(displayPower ? "card-active glow-air" : "")}`)}><div class="flex items-center gap-3"><button${attr("disabled", !status, true)}${attr_class(`power-btn glow-air ${stringify(displayPower ? "power-btn-on" : "")} disabled:opacity-40 disabled:cursor-not-allowed`, void 0, { "pulse-ring": isPowerPending })}>`);
    Wind($$renderer2, { class: "w-4 h-4" });
    $$renderer2.push(`<!----></button> <div class="min-w-0 flex-1"><h4 class="font-medium text-sm text-content-primary truncate">Air Purifier</h4> `);
    if (displayPower) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="text-xs text-content-secondary"><span class="text-device-air-text">${escape_html(modeLabels[displayMode] || displayMode)}</span> <span class="mx-1 text-content-tertiary">/</span> <span${attr_class(aqiColor(status?.aqi ?? 0))}>${escape_html(status?.aqi ?? 0)} AQI</span></p>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<p class="text-xs text-content-tertiary">${escape_html(status ? "Standby" : "Offline")}</p>`);
    }
    $$renderer2.push(`<!--]--></div> `);
    if (compact && status?.power) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div${attr_class(`px-2 py-1 rounded-md text-xs font-medium shrink-0 border ${stringify(aqiBg(status.aqi))} ${stringify(aqiColor(status.aqi))}`)}>${escape_html(status.aqi)}</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div> `);
    DeviceDialog($$renderer2, {
      open: dialogOpen,
      onclose: () => dialogOpen = false,
      title: "Air Purifier",
      children: ($$renderer3) => {
        $$renderer3.push(`<div class="space-y-5"><div class="flex items-center justify-between py-2 px-3 rounded-lg bg-surface-recessed border border-stroke-subtle"><span class="text-sm text-content-secondary uppercase tracking-wider">Status</span> <span${attr_class(`font-medium text-sm ${stringify(displayPower ? "text-device-air-text neon-text-subtle" : "text-content-tertiary")}`)}>${escape_html(displayPower ? "Active" : status ? "Standby" : "Offline")}</span></div> `);
        if (status) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<button${attr_class(`w-full py-4 rounded-xl font-semibold uppercase tracking-wider transition-all relative overflow-hidden ${stringify(displayPower ? "glow-air power-btn-on" : "bg-surface-recessed border border-stroke-default text-content-secondary hover:border-stroke-strong")}`)}><span class="relative z-10 flex items-center justify-center gap-2">`);
          Power($$renderer3, { class: "w-5 h-5" });
          $$renderer3.push(`<!----> ${escape_html(displayPower ? "Power Off" : "Power On")}</span> `);
          {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]--></button> `);
          if (displayPower) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div${attr_class(`rounded-xl p-5 text-center border ${stringify(aqiBg(status.aqi))}`)}><span class="text-xs uppercase tracking-wider text-content-tertiary">Air Quality Index</span> <p${attr_class(`font-display text-5xl mt-2 ${stringify(aqiColor(status.aqi))} neon-text`)}>${escape_html(status.aqi)}</p> <p${attr_class(`text-sm mt-2 ${stringify(aqiColor(status.aqi))}`)}>${escape_html(aqiLabel(status.aqi))}</p></div> <div><p class="text-xs text-content-tertiary uppercase tracking-wider mb-3">Operating Mode</p> <div class="grid grid-cols-3 gap-2"><!--[-->`);
            const each_array = ensure_array_like(modes);
            for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
              let mode = each_array[$$index];
              $$renderer3.push(`<button${attr_class(`py-3 rounded-lg transition-all flex flex-col items-center gap-1.5 font-medium ${stringify(displayMode === mode.value ? "glow-air power-btn-on" : "bg-surface-recessed border border-stroke-default text-content-secondary hover:border-stroke-strong")}`)}><!---->`);
              mode.icon?.($$renderer3, { class: "w-5 h-5" });
              $$renderer3.push(`<!----> ${escape_html(mode.label)}</button>`);
            }
            $$renderer3.push(`<!--]--></div></div> <div class="grid grid-cols-3 gap-3">`);
            if (status.humidity !== void 0) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="rounded-xl p-3 text-center bg-surface-recessed border border-stroke-subtle">`);
              Droplets($$renderer3, { class: "w-4 h-4 mx-auto text-accent" });
              $$renderer3.push(`<!----> <p class="font-display text-lg mt-1 text-content-primary">${escape_html(status.humidity)}%</p> <span class="text-[10px] text-content-tertiary uppercase">Humidity</span></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--> `);
            if (status.temperature !== void 0) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div class="rounded-xl p-3 text-center bg-surface-recessed border border-stroke-subtle">`);
              Thermometer($$renderer3, { class: "w-4 h-4 mx-auto text-device-climate-heat-text" });
              $$renderer3.push(`<!----> <p class="font-display text-lg mt-1 text-content-primary">${escape_html(status.temperature)}°</p> <span class="text-[10px] text-content-tertiary uppercase">Temp</span></div>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--> `);
            if (status.filter_life !== void 0) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<div${attr_class(`rounded-xl p-3 text-center bg-surface-recessed border border-stroke-subtle ${stringify(status.filter_life < 20 ? "border-error/50" : "")}`)}>`);
              Funnel($$renderer3, {
                class: `w-4 h-4 mx-auto ${stringify(status.filter_life < 20 ? "text-error" : "text-device-sensors-text")}`
              });
              $$renderer3.push(`<!----> <p${attr_class(`font-display text-lg mt-1 ${stringify(status.filter_life < 20 ? "text-error" : "text-content-primary")}`)}>${escape_html(status.filter_life)}%</p> <span class="text-[10px] text-content-tertiary uppercase">Filter</span></div>`);
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
    $$renderer2.push(`<div class="pb-24 space-y-8 svelte-1uha8ag">`);
    if (store.loading && !hasLoaded) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="space-y-8 svelte-1uha8ag"><!--[-->`);
      const each_array = ensure_array_like(Array(4));
      for (let i = 0, $$length = each_array.length; i < $$length; i++) {
        each_array[i];
        $$renderer2.push(`<section class="relative svelte-1uha8ag"${attr_style(`animation-delay: ${stringify(i * 100)}ms`)}><div class="flex items-center gap-3 mb-4 svelte-1uha8ag"><div class="w-8 h-8 rounded-lg bg-surface-elevated skeleton-glow svelte-1uha8ag"></div> <div class="w-24 h-5 rounded bg-surface-elevated skeleton-glow svelte-1uha8ag"></div> <div class="flex-1 h-px bg-gradient-to-r from-stroke-subtle to-transparent svelte-1uha8ag"></div></div> <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 svelte-1uha8ag"><!--[-->`);
        const each_array_1 = ensure_array_like(Array(4));
        for (let j = 0, $$length2 = each_array_1.length; j < $$length2; j++) {
          each_array_1[j];
          $$renderer2.push(`<div class="card p-3 relative overflow-hidden svelte-1uha8ag"${attr_style(`animation-delay: ${stringify((i * 4 + j) * 50)}ms`)}><div class="flex items-center gap-3 svelte-1uha8ag"><div class="w-9 h-9 rounded-lg bg-surface-recessed skeleton-glow svelte-1uha8ag"></div> <div class="flex-1 space-y-2 svelte-1uha8ag"><div class="w-20 h-3.5 rounded bg-surface-recessed skeleton-glow svelte-1uha8ag"></div> <div class="w-14 h-3 rounded bg-surface-recessed skeleton-glow svelte-1uha8ag"></div></div></div> <div class="absolute inset-0 scan-line-overlay svelte-1uha8ag"></div></div>`);
        }
        $$renderer2.push(`<!--]--></div></section>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (lamps.length > 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<section class="svelte-1uha8ag"><div class="section-header section-header-lights svelte-1uha8ag"><div class="section-icon glow-lights svelte-1uha8ag">`);
        Lightbulb($$renderer2, { class: "w-4 h-4" });
        $$renderer2.push(`<!----></div> <h2 class="section-title svelte-1uha8ag">Lights</h2> <span class="section-count svelte-1uha8ag">${escape_html(lamps.length)}</span> <div class="section-line svelte-1uha8ag"></div></div> <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 svelte-1uha8ag"><!--[-->`);
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
        $$renderer2.push(`<section class="svelte-1uha8ag"><div class="section-header section-header-climate svelte-1uha8ag"><div class="section-icon glow-climate-heat svelte-1uha8ag">`);
        Thermometer($$renderer2, { class: "w-4 h-4" });
        $$renderer2.push(`<!----></div> <h2 class="section-title svelte-1uha8ag">Climate</h2> <span class="section-count svelte-1uha8ag">${escape_html(thermostats.length + (store.airPurifier ? 1 : 0))}</span> <div class="section-line svelte-1uha8ag"></div></div> <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 svelte-1uha8ag"><!--[-->`);
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
        $$renderer2.push(`<section class="svelte-1uha8ag"><div class="section-header section-header-sensors svelte-1uha8ag"><div class="section-icon glow-sensors svelte-1uha8ag">`);
        Radio($$renderer2, { class: "w-4 h-4" });
        $$renderer2.push(`<!----></div> <h2 class="section-title svelte-1uha8ag">Sensors</h2> <span class="section-count svelte-1uha8ag">${escape_html(sensors.length)}</span> <div class="section-line svelte-1uha8ag"></div></div> <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 svelte-1uha8ag"><!--[-->`);
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
        $$renderer2.push(`<section class="svelte-1uha8ag"><div class="section-header section-header-audio svelte-1uha8ag"><div class="section-icon glow-audio svelte-1uha8ag">`);
        Volume_2($$renderer2, { class: "w-4 h-4" });
        $$renderer2.push(`<!----></div> <h2 class="section-title svelte-1uha8ag">Audio</h2> <span class="section-count svelte-1uha8ag">${escape_html(store.yamahaDevices.length)}</span> <div class="section-line svelte-1uha8ag"></div></div> <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 svelte-1uha8ag"><!--[-->`);
        const each_array_5 = ensure_array_like(store.yamahaDevices);
        for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
          let device = each_array_5[$$index_5];
          YamahaCard($$renderer2, { device, compact: true });
        }
        $$renderer2.push(`<!--]--></div></section>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> <section class="svelte-1uha8ag"><div class="section-header section-header-robot svelte-1uha8ag"><div class="section-icon glow-robot svelte-1uha8ag">`);
      Bot($$renderer2, { class: "w-4 h-4" });
      $$renderer2.push(`<!----></div> <h2 class="section-title svelte-1uha8ag">Robot</h2> <span class="section-count svelte-1uha8ag">1</span> <div class="section-line svelte-1uha8ag"></div></div> <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 svelte-1uha8ag">`);
      RoborockCard($$renderer2, { status: store.roborock, compact: true });
      $$renderer2.push(`<!----></div></section>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  _page as default
};
