import { U as sanitize_props, V as spread_props, W as slot, Z as attr_class, Y as attr, _ as stringify, X as ensure_array_like, a1 as attr_style, a2 as head } from "../../chunks/index2.js";
import { X, s as store, P as Play } from "../../chunks/x.js";
import { e as escape_html } from "../../chunks/context.js";
import "clsx";
import { P as Power } from "../../chunks/power.js";
import { I as Icon } from "../../chunks/Icon.js";
import { H as House } from "../../chunks/house.js";
import { T as Thermometer } from "../../chunks/thermometer.js";
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
function Globe($$renderer, $$props) {
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
    ["circle", { "cx": "12", "cy": "12", "r": "10" }],
    [
      "path",
      { "d": "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" }
    ],
    ["path", { "d": "M2 12h20" }]
  ];
  Icon($$renderer, spread_props([
    { name: "globe" },
    $$sanitized_props,
    {
      /**
       * @component @name Globe
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgLz4KICA8cGF0aCBkPSJNMTIgMmExNC41IDE0LjUgMCAwIDAgMCAyMCAxNC41IDE0LjUgMCAwIDAgMC0yMCIgLz4KICA8cGF0aCBkPSJNMiAxMmgyMCIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/globe
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
      $$renderer2.push(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4 dialog-overlay animate-fade-in svelte-alpl3u" role="dialog" aria-modal="true" aria-labelledby="dialog-title" tabindex="-1"><div class="dialog-content w-full max-w-[calc(100vw-2rem)] sm:max-w-md max-h-[80vh] overflow-hidden"><div class="flex items-center justify-between p-4 border-b border-stroke-default"><h2 id="dialog-title" class="text-lg font-semibold text-content-primary">${escape_html(title)}</h2> <button aria-label="Close dialog" class="w-10 h-10 rounded-xl bg-surface-recessed text-content-secondary hover:text-content-primary hover:bg-stroke-default transition-colors flex items-center justify-center">`);
      X($$renderer2, { class: "w-5 h-5" });
      $$renderer2.push(`<!----></button></div> <div class="p-4 overflow-y-auto max-h-[calc(80vh-64px)]">`);
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
    let isOnline = lamp.online === 1;
    let dialogOpen = false;
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
    $$renderer2.push(`<div role="button" tabindex="0"${attr_class(`card transition-card hover:scale-[1.02] ${stringify(compact ? "p-2.5" : "p-3")} w-full text-left cursor-pointer`)}><div class="flex items-center gap-2.5"><button${attr("disabled", !isOnline, true)}${attr_class(
      `w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 relative ${stringify(displayPower ? status?.moonlight_mode ? "bg-device-audio-bg text-device-audio-text" : "badge-lights" : "bg-surface-recessed text-content-tertiary")} hover:scale-105 disabled:opacity-50 disabled:hover:scale-100`,
      void 0,
      { "status-active": displayPower }
    )}>`);
    Power($$renderer2, { class: "w-4 h-4" });
    $$renderer2.push(`<!----> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></button> <div class="min-w-0 flex-1"><h4 class="font-medium text-sm text-content-primary truncate">${escape_html(displayName)}</h4> `);
    if (!isOnline) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="text-xs text-content-secondary">Offline</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
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
        $$renderer2.push(`<p class="text-xs text-content-secondary">Off</p>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></div></div> `);
    DeviceDialog($$renderer2, {
      open: dialogOpen,
      onclose: () => dialogOpen = false,
      title: displayName,
      children: ($$renderer3) => {
        $$renderer3.push(`<div class="space-y-4"><div class="flex items-center justify-between"><span class="text-content-secondary">Status</span> <span${attr_class(`font-medium ${stringify(displayPower ? status?.moonlight_mode ? "text-device-audio-text" : "text-device-lights-text" : "text-content-tertiary")}`)}>`);
        if (!isOnline) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`Offline`);
        } else {
          $$renderer3.push("<!--[!-->");
          if (displayPower) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`${escape_html(status?.moonlight_mode ? "Moonlight" : "On")}`);
          } else {
            $$renderer3.push("<!--[!-->");
            $$renderer3.push(`Off`);
          }
          $$renderer3.push(`<!--]-->`);
        }
        $$renderer3.push(`<!--]--></span></div> `);
        if (isOnline && status) {
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
    })}>`);
    Globe($$renderer2, { class: "w-4 h-4" });
    $$renderer2.push(`<!----></div> <div class="min-w-0 flex-1"><h4 class="font-medium text-sm text-content-primary truncate">Roborock</h4> `);
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
      $$renderer2.push(`<div class="flex items-center gap-1 text-xs shrink-0">`);
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
        $$renderer3.push(`<div class="space-y-4"><div class="flex items-center justify-between"><span class="text-content-secondary">Status</span> <span${attr_class(`font-medium ${stringify(style.color)}`)}>${escape_html(status ? getStateName(status.state) : "Offline")}</span></div> `);
        if (status) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<div class="grid grid-cols-2 gap-3"><div class="bg-surface-recessed rounded-xl p-4 text-center"><span class="text-xs text-content-secondary">Battery</span> <p${attr_class(`text-3xl font-bold mt-1 ${stringify(status.battery > 20 ? "text-content-primary" : "text-error")}`)}>${escape_html(status.battery)}%</p></div> <div class="bg-surface-recessed rounded-xl p-4 text-center"><span class="text-xs text-content-secondary">Fan Speed</span> <p class="text-2xl font-bold mt-1 text-content-primary">${escape_html(getFanModeName(status.fanPower))}</p></div></div> <div class="flex gap-1 bg-surface-recessed rounded-lg p-1"><button${attr_class(`flex-1 py-2 px-2 sm:px-3 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${stringify(
            "bg-surface-elevated text-content-primary"
          )}`)}>Controls</button> <button${attr_class(`flex-1 py-2 px-2 sm:px-3 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${stringify("text-content-secondary hover:text-content-primary")}`)}>Rooms</button> <button${attr_class(`flex-1 py-2 px-2 sm:px-3 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${stringify("text-content-secondary hover:text-content-primary")}`)}>Settings</button></div> `);
          {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div><p class="text-sm text-content-secondary mb-2">Actions</p> <div class="grid grid-cols-3 gap-2"><button class="py-4 rounded-xl bg-success/20 text-success text-sm font-medium relative hover:bg-success/30 transition-colors flex flex-col items-center gap-1">`);
            Play($$renderer3, { class: "w-5 h-5" });
            $$renderer3.push(`<!----> Start `);
            {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--></button> <button class="py-4 rounded-xl bg-warning/20 text-warning text-sm font-medium relative hover:bg-warning/30 transition-colors flex flex-col items-center gap-1">`);
            Pause($$renderer3, { class: "w-5 h-5" });
            $$renderer3.push(`<!----> Pause `);
            {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--></button> <button class="py-4 rounded-xl bg-info/20 text-info text-sm font-medium relative hover:bg-info/30 transition-colors flex flex-col items-center gap-1">`);
            House($$renderer3, { class: "w-5 h-5" });
            $$renderer3.push(`<!----> Home `);
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
              $$renderer3.push(`<button${attr_class(`py-2 px-1 rounded-lg text-xs font-medium transition-colors relative ${stringify(displayFanPower === fan.mode ? "badge-audio ring-1 ring-device-audio-text/50" : "bg-surface-recessed text-content-secondary hover:bg-stroke-default")}`)}><!---->`);
              fan.icon?.($$renderer3, { class: "w-4 h-4 mb-0.5" });
              $$renderer3.push(`<!----> ${escape_html(fan.name)} `);
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
            for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
              let mop = each_array_1[$$index_2];
              $$renderer3.push(`<button${attr_class(`py-2 px-1 rounded-lg text-xs font-medium transition-colors relative ${stringify(displayMopMode === mop.mode ? "badge-sensors ring-1 ring-device-sensors-text/50" : "bg-surface-recessed text-content-secondary hover:bg-stroke-default")}`)}><div class="flex items-center justify-center gap-0.5 mb-0.5">`);
              if (mop.count) {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<!--[-->`);
                const each_array_2 = ensure_array_like(Array(mop.count));
                for (let $$index_1 = 0, $$length2 = each_array_2.length; $$index_1 < $$length2; $$index_1++) {
                  each_array_2[$$index_1];
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
    let config = categoryConfig[device.category] || { label: device.category, icon: defaultIcon };
    let statusInfo = getStatusInfo(parsedStatus(), device.category);
    $$renderer2.push(`<div role="button" tabindex="0"${attr_class(`card transition-card hover:scale-[1.02] ${stringify(compact ? "p-2.5" : "p-3")} w-full text-left cursor-pointer ${stringify(statusInfo.lowBattery ? "border-warning/50 bg-warning/10" : "")}`)}><div class="flex items-center gap-2.5"><div${attr_class(
      `w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stringify(statusInfo.alert ? "bg-error/20 text-error" : statusInfo.lowBattery ? "bg-warning/20 text-warning" : "badge-sensors")}`,
      void 0,
      { "status-active": statusInfo.alert }
    )}><!---->`);
    config.icon?.($$renderer2, { class: "w-4 h-4" });
    $$renderer2.push(`<!----></div> <div class="min-w-0 flex-1"><h4 class="font-medium text-sm text-content-primary truncate">${escape_html(displayName)}</h4> <p${attr_class(`text-xs ${stringify(statusInfo.lowBattery ? "text-warning" : statusInfo.color)}`)}>${escape_html(statusInfo.text)}</p></div> <div${attr_class(`w-2 h-2 rounded-full shrink-0 ${stringify(device.online ? "bg-success" : "bg-content-tertiary")}`, void 0, { "status-dot": device.online })}></div></div></div> `);
    DeviceDialog($$renderer2, {
      open: dialogOpen,
      onclose: () => dialogOpen = false,
      title: displayName,
      children: ($$renderer3) => {
        $$renderer3.push(`<div class="space-y-4"><div${attr_class(`rounded-xl p-6 text-center ${stringify(statusInfo.alert ? "bg-error/20" : "bg-surface-recessed")}`)}><div${attr_class(`flex justify-center ${stringify(statusInfo.alert ? "text-error" : "text-device-sensors-text")}`)}><!---->`);
        config.icon?.($$renderer3, { class: "w-10 h-10" });
        $$renderer3.push(`<!----></div> <p${attr_class(`text-2xl font-bold mt-2 ${stringify(statusInfo.color)}`)}>${escape_html(statusInfo.text)}</p> <p class="text-sm text-content-secondary mt-1">${escape_html(config.label)} Sensor</p></div> `);
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
      Flame($$renderer2, { class: "w-4 h-4" });
    } else {
      $$renderer2.push("<!--[!-->");
      Radio($$renderer2, { class: "w-4 h-4" });
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
          $$renderer3.push(`<div class="grid grid-cols-2 gap-3"><div class="bg-surface-recessed rounded-xl p-4 text-center"><span class="text-xs text-content-secondary uppercase tracking-wide">Current</span> <p class="text-2xl sm:text-3xl font-bold mt-1 text-content-primary">${escape_html(currentTemp)}°C</p></div> <div class="bg-surface-recessed rounded-xl p-4 text-center"><span class="text-xs text-content-secondary uppercase tracking-wide">Target</span> <p class="text-2xl sm:text-3xl font-bold mt-1 text-device-climate-heat-text">${escape_html(targetTemp)}°C</p></div></div> <div><p class="text-sm text-content-secondary mb-3">Set Temperature</p> <div class="flex items-center justify-center gap-4"><button${attr("disabled", targetTemp !== null && targetTemp <= 5, true)} class="w-14 h-14 rounded-full badge-climate-cool text-2xl font-medium hover:opacity-80 disabled:opacity-50 transition-all">−</button> <div class="relative">`);
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
    )}>`);
    Volume_2($$renderer2, { class: "w-4 h-4" });
    $$renderer2.push(`<!----> `);
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
    )}>`);
    Wind($$renderer2, { class: "w-4 h-4" });
    $$renderer2.push(`<!----> `);
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
