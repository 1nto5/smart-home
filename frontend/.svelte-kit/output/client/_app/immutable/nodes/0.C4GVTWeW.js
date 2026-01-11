import{c as w,a as p,d as J,f as B,s as K}from"../chunks/B_G7EnjR.js";import{g as r,d as H,j as _,D as U,f as S,p as X,a9 as Y,s as g,t as D,i as Z,c as l,ap as ee,k as c}from"../chunks/DAortCmQ.js";import{e as te,s as k,x as L,a as se}from"../chunks/CPDa7M0J.js";import{H as O,s as re}from"../chunks/yhGyEu1N.js";import{c as A}from"../chunks/7-8rnMVl.js";import{l as I,s as M,a as ae,b as oe}from"../chunks/BhN2kyAR.js";import{b}from"../chunks/CkGPgyzJ.js";import{g as ne}from"../chunks/CP999QD0.js";import{B as ce}from"../chunks/-TS2BfOP.js";import{s as ie}from"../chunks/BsI0eHaE.js";import"../chunks/C9KLA5Bu.js";import{I as T,s as C}from"../chunks/NXxA8x-m.js";import{T as le}from"../chunks/Ik-j-KQY.js";import{M as de,S as me}from"../chunks/DxwuCvmG.js";const ue=!1,he=!1,De=Object.freeze(Object.defineProperty({__proto__:null,prerender:he,ssr:ue},Symbol.toStringTag,{value:"Module"}));function fe(){let e=H("system"),s=H("light");function i(){if(!b)return;const t=localStorage.getItem("theme-mode");t&&["system","light","dark"].includes(t)&&_(e,t,!0),a(),window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{r(e)==="system"&&a()})}function n(t){_(e,t,!0),b&&(t==="system"?localStorage.removeItem("theme-mode"):localStorage.setItem("theme-mode",t),a())}function a(){if(!b)return;const t=r(e)==="dark"||r(e)==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches;_(s,t?"dark":"light",!0),document.documentElement.classList.remove("light","dark"),r(e)!=="system"?document.documentElement.classList.add(r(e)):t&&document.documentElement.classList.add("dark")}function m(){const t=["system","light","dark"],h=(t.indexOf(r(e))+1)%t.length;n(t[h])}return{get mode(){return r(e)},get resolvedTheme(){return r(s)},get isDark(){return r(s)==="dark"},init:i,setMode:n,toggle:m}}const x=fe(),Q=()=>{const e=ce?ie:ne("__svelte__");return{page:{subscribe:e.page.subscribe},navigating:{subscribe:e.navigating.subscribe},updated:e.updated}},pe={subscribe(e){return(U?ve("page"):Q().page).subscribe(e)}};function ve(e){try{return Q()[e]}catch{throw new Error(`Cannot subscribe to '${e}' store on the server outside of a Svelte component, as it is bound to the current request via component context. This prevents state from leaking between users.For more information, see https://svelte.dev/docs/kit/state-management#avoid-shared-state-on-the-server`)}}function ge(e,s){const i=I(s,["children","$$slots","$$events","$$legacy"]);/**
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
 */const n=[["path",{d:"M8 2v4"}],["path",{d:"M16 2v4"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2"}],["path",{d:"M3 10h18"}]];T(e,M({name:"calendar"},()=>i,{get iconNode(){return n},children:(a,m)=>{var t=w(),o=S(t);C(o,s,"default",{}),p(a,t)},$$slots:{default:!0}}))}function xe(e,s){const i=I(s,["children","$$slots","$$events","$$legacy"]);/**
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
 */const n=[["rect",{width:"20",height:"14",x:"2",y:"3",rx:"2"}],["line",{x1:"8",x2:"16",y1:"21",y2:"21"}],["line",{x1:"12",x2:"12",y1:"17",y2:"21"}]];T(e,M({name:"monitor"},()=>i,{get iconNode(){return n},children:(a,m)=>{var t=w(),o=S(t);C(o,s,"default",{}),p(a,t)},$$slots:{default:!0}}))}function be(e,s){const i=I(s,["children","$$slots","$$events","$$legacy"]);/**
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
 */const n=[["path",{d:"M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"}],["circle",{cx:"13.5",cy:"6.5",r:".5",fill:"currentColor"}],["circle",{cx:"17.5",cy:"10.5",r:".5",fill:"currentColor"}],["circle",{cx:"6.5",cy:"12.5",r:".5",fill:"currentColor"}],["circle",{cx:"8.5",cy:"7.5",r:".5",fill:"currentColor"}]];T(e,M({name:"palette"},()=>i,{get iconNode(){return n},children:(a,m)=>{var t=w(),o=S(t);C(o,s,"default",{}),p(a,t)},$$slots:{default:!0}}))}var ye=B('<a><!> <span class="hidden sm:inline"> </span></a>'),$e=B(`<div class="min-h-screen bg-surface-base transition-colors duration-200"><header class="sticky top-0 z-40 bg-surface-elevated border-b border-stroke-default"><nav class="flex items-center justify-between max-w-6xl mx-auto px-4 py-2.5"><h1 class="text-base font-semibold text-content-primary flex items-center gap-2"><!> <span class="hidden sm:inline">Smart Home</span></h1> <div class="flex items-center gap-2"><div class="flex gap-1"></div> <button class="ml-2 p-2 rounded-lg text-content-secondary hover:text-content-primary
                 hover:bg-surface-recessed transition-colors min-h-[44px] min-w-[44px]
                 flex items-center justify-center"><!></button></div></nav></header> <main class="max-w-6xl mx-auto px-4 py-4"><!></main></div>`);function Le(e,s){X(s,!0);const i=()=>oe(pe,"$page",n),[n,a]=ae();Y(()=>{if(b){x.init(),k.initWebSocket(),k.refreshAll();const d=setInterval(()=>k.refreshAll(),3e4);return()=>clearInterval(d)}});const m=[{href:"/",label:"Home",icon:O},{href:"/presets",label:"Presets",icon:be},{href:"/schedule",label:"Schedule",icon:ge},{href:"/heater-schedule",label:"Heating",icon:le}],t={system:xe,light:me,dark:de};var o=$e(),h=l(o),E=l(h),y=l(E),R=l(y);O(R,{class:"w-5 h-5 text-accent"}),ee(2),c(y);var z=g(y,2),$=l(z);te($,21,()=>m,d=>d.href,(d,u)=>{var f=ye(),P=l(f);A(P,()=>r(u).icon,(V,G)=>{G(V,{class:"w-4 h-4"})});var j=g(P,2),F=l(j,!0);c(j),c(f),D(()=>{L(f,"href",r(u).href),se(f,1,`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1.5
                     ${i().url.pathname===r(u).href?"bg-accent/15 text-accent":"text-content-secondary hover:text-content-primary hover:bg-surface-recessed"}`),K(F,r(u).label)}),p(d,f)}),c($);var v=g($,2);v.__click=()=>x.toggle();var W=l(v);A(W,()=>t[x.mode],(d,u)=>{u(d,{class:"w-5 h-5"})}),c(v),c(z),c(E),c(h);var N=g(h,2),q=l(N);re(q,()=>s.children),c(N),c(o),D(()=>L(v,"title",`Theme: ${x.mode??""}`)),p(e,o),Z(),a()}J(["click"]);export{Le as component,De as universal};
