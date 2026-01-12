import{c as x,a as g,d as de,f as J,s as me}from"../chunks/DN_vEeGv.js";import{k as s,s as $,g as u,D as ue,f as k,p as fe,d as he,j as b,t as V,l as ve,m as c,n as d,o as pe,v as W}from"../chunks/CEuPnrTr.js";import{l as I,s as z,i as O,a as ge,b as be}from"../chunks/CK2TXMS2.js";import{I as L,s as T,e as _e,a as A,B as ye,C as $e,D as xe,d as q,E as R}from"../chunks/mpM_GrAP.js";import{s as ke,H as we}from"../chunks/D5hXq-hi.js";import{c as Se}from"../chunks/CAnHEzPj.js";import{b as M}from"../chunks/B1Sn1HrY.js";import{g as Ae}from"../chunks/-AolcYt_.js";import{B as Me}from"../chunks/-TS2BfOP.js";import{s as Ie}from"../chunks/D3MBBfOV.js";import{Z as ze,L as Le,M as Te,S as Ce}from"../chunks/BIvAi59F.js";import"../chunks/DjnKCaAL.js";import{T as Ne}from"../chunks/CPaTYCEG.js";const je=!1,Ee=!1,rt=Object.freeze(Object.defineProperty({__proto__:null,prerender:Ee,ssr:je},Symbol.toStringTag,{value:"Module"}));function De(){let a=$("system"),r=$("light");function m(){if(!M)return;const t=localStorage.getItem("theme-mode");t&&["system","light","dark"].includes(t)&&u(a,t,!0),n(),window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{s(a)==="system"&&n()})}function l(t){u(a,t,!0),M&&(t==="system"?localStorage.removeItem("theme-mode"):localStorage.setItem("theme-mode",t),n())}function n(){if(!M)return;const t=s(a)==="dark"||s(a)==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches;u(r,t?"dark":"light",!0),document.documentElement.classList.remove("light","dark"),s(a)!=="system"?document.documentElement.classList.add(s(a)):t&&document.documentElement.classList.add("dark")}function i(){const t=["system","light","dark"],C=(t.indexOf(s(a))+1)%t.length;l(t[C])}return{get mode(){return s(a)},get resolvedTheme(){return s(r)},get isDark(){return s(r)==="dark"},init:m,setMode:l,toggle:i}}const y=De(),U=()=>{const a=Me?Ie:Ae("__svelte__");return{page:{subscribe:a.page.subscribe},navigating:{subscribe:a.navigating.subscribe},updated:a.updated}},Oe={subscribe(a){return(ue?Re("page"):U().page).subscribe(a)}};function Re(a){try{return U()[a]}catch{throw new Error(`Cannot subscribe to '${a}' store on the server outside of a Svelte component, as it is bound to the current request via component context. This prevents state from leaking between users.For more information, see https://svelte.dev/docs/kit/state-management#avoid-shared-state-on-the-server`)}}function Pe(a,r){const m=I(r,["children","$$slots","$$events","$$legacy"]);/**
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
 */const l=[["rect",{width:"20",height:"14",x:"2",y:"3",rx:"2"}],["line",{x1:"8",x2:"16",y1:"21",y2:"21"}],["line",{x1:"12",x2:"12",y1:"17",y2:"21"}]];L(a,z({name:"monitor"},()=>m,{get iconNode(){return l},children:(n,i)=>{var t=x(),o=k(t);T(o,r,"default",{}),g(n,t)},$$slots:{default:!0}}))}function Be(a,r){const m=I(r,["children","$$slots","$$events","$$legacy"]);/**
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
 */const l=[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"}],["path",{d:"M21 3v5h-5"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"}],["path",{d:"M8 16H3v5"}]];L(a,z({name:"refresh-cw"},()=>m,{get iconNode(){return l},children:(n,i)=>{var t=x(),o=k(t);T(o,r,"default",{}),g(n,t)},$$slots:{default:!0}}))}function He(a,r){const m=I(r,["children","$$slots","$$events","$$legacy"]);/**
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
 */const l=[["path",{d:"m2 2 20 20"}],["path",{d:"M5 5a1 1 0 0 0-1 1v7c0 5 3.5 7.5 7.67 8.94a1 1 0 0 0 .67.01c2.35-.82 4.48-1.97 5.9-3.71"}],["path",{d:"M9.309 3.652A12.252 12.252 0 0 0 11.24 2.28a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1v7a9.784 9.784 0 0 1-.08 1.264"}]];L(a,z({name:"shield-off"},()=>m,{get iconNode(){return l},children:(n,i)=>{var t=x(),o=k(t);T(o,r,"default",{}),g(n,t)},$$slots:{default:!0}}))}function Fe(a,r){const m=I(r,["children","$$slots","$$events","$$legacy"]);/**
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
 */const l=[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"}]];L(a,z({name:"shield"},()=>m,{get iconNode(){return l},children:(n,i)=>{var t=x(),o=k(t);T(o,r,"default",{}),g(n,t)},$$slots:{default:!0}}))}var Ze=J('<a><!> <span class="hidden sm:inline text-sm"> </span></a>'),Qe=J(`<div class="min-h-screen bg-surface-base"><header class="sticky top-0 z-40 app-header"><nav class="flex items-center justify-between max-w-6xl mx-auto px-4 py-3"><a href="/" class="flex items-center gap-3 group"><div class="w-10 h-10 rounded-xl bg-[var(--color-accent-subtle)] border border-[var(--color-accent)]
                    flex items-center justify-center transition-all duration-200"><!></div> <div class="hidden sm:block"><h1 class="font-display text-sm text-content-primary">Smart Home</h1> <p class="text-xs text-content-tertiary">Control Center</p></div></a> <div class="flex items-center gap-1"><!> <button class="ml-2 p-2 rounded-lg transition-all duration-200 text-content-secondary hover:text-content-primary hover:bg-surface-recessed" title="Odśwież"><!></button> <button><!></button> <button class="theme-toggle ml-1"><!></button></div></nav></header> <main class="max-w-6xl mx-auto px-4 py-6"><!></main></div>`);function ot(a,r){fe(r,!0);const m=()=>be(Oe,"$page",l),[l,n]=ge();let i=$(!1),t=$(!1),o=$(!1);async function C(){u(o,!0),await A.refreshAll(),await P(),setTimeout(()=>u(o,!1),500)}async function P(){try{const e=await ye();u(i,e.armed,!0)}catch(e){console.error("Failed to load alarm status:",e)}}async function Y(){u(t,!0);try{if(s(i)){const e=await $e();u(i,e.armed,!0)}else{const e=await xe();u(i,e.armed,!0)}}catch(e){console.error("Failed to toggle alarm:",e)}finally{u(t,!1)}}he(()=>{if(M){y.init(),A.initWebSocket(),A.refreshAll(),P();const e=setInterval(()=>A.refreshAll(),3e4);return()=>clearInterval(e)}});const G=[{href:"/",label:"Dashboard",icon:we},{href:"/lighting",label:"Lighting",icon:Le},{href:"/heater-schedule",label:"Climate",icon:Ne}];var N=Qe(),j=c(N),B=c(j),E=c(B),H=c(E),K=c(H);ze(K,{class:"w-5 h-5 text-accent"}),d(H),pe(2),d(E);var F=b(E,2),Z=c(F);_e(Z,17,()=>G,e=>e.href,(e,v)=>{const D=W(()=>m().url.pathname===s(v).href);var p=Ze(),S=c(p);Se(S,()=>s(v).icon,(le,ce)=>{ce(le,{class:"w-4 h-4"})});var f=b(S,2),ie=c(f,!0);d(f),d(p),V(()=>{R(p,"href",s(v).href),q(p,1,`nav-pill flex items-center gap-2 ${s(D)?"nav-pill-active":"text-content-secondary hover:text-content-primary hover:bg-surface-recessed"}`),me(ie,s(v).label)}),g(e,p)});var _=b(Z,2);_.__click=C;var X=c(_);{let e=W(()=>s(o)?"animate-spin":"");Be(X,{get class(){return`w-4 h-4 ${s(e)??""}`}})}d(_);var h=b(_,2);h.__click=Y;var ee=c(h);{var te=e=>{Fe(e,{class:"w-4 h-4"})},ae=e=>{He(e,{class:"w-4 h-4"})};O(ee,e=>{s(i)?e(te):e(ae,!1)})}d(h);var w=b(h,2);w.__click=()=>y.toggle();var se=c(w);{var re=e=>{Pe(e,{class:"w-4 h-4"})},oe=e=>{var v=x(),D=k(v);{var p=f=>{Te(f,{class:"w-4 h-4"})},S=f=>{Ce(f,{class:"w-4 h-4"})};O(D,f=>{y.isDark?f(p):f(S,!1)},!0)}g(e,v)};O(se,e=>{y.mode==="system"?e(re):e(oe,!1)})}d(w),d(F),d(B),d(j);var Q=b(j,2),ne=c(Q);ke(ne,()=>r.children),d(Q),d(N),V(()=>{_.disabled=s(o),h.disabled=s(t),q(h,1,`p-2 rounded-lg transition-all duration-200 ${s(i)?"bg-red-500/20 text-red-500 hover:bg-red-500/30":"text-content-secondary hover:text-content-primary hover:bg-surface-recessed"}`),R(h,"title",s(i)?"Alarm UZBROJONY - kliknij aby rozbroić":"Alarm rozbrojony - kliknij aby uzbroić"),R(w,"title",`Toggle theme (${y.mode??""})`)}),g(a,N),ve(),n()}de(["click"]);export{ot as component,rt as universal};
