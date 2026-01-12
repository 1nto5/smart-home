import{c as L,a as b,d as me,f as D,s as ue}from"../chunks/C6IfJnDo.js";import{k as s,s as C,g as h,D as ve,f as k,p as fe,d as he,j as x,t as G,l as pe,m as o,n,o as J,v as ge}from"../chunks/DKHSd8_d.js";import{l as N,s as O,i as S,a as be,b as ye}from"../chunks/DTZz9ds9.js";import{I as F,s as P,e as _e,D as xe,E as $e,a as g,d as E,F as M,G as ke}from"../chunks/DFRAfWca.js";import{s as we,H as Se}from"../chunks/CdWe51vq.js";import{c as Ae}from"../chunks/YQ5o6Efk.js";import{b as A}from"../chunks/D1qDfmfk.js";import{g as Ce}from"../chunks/C06WGzbn.js";import{B as Le}from"../chunks/-TS2BfOP.js";import{s as Ie}from"../chunks/DMFOwEd8.js";import{Z as U,L as je,M as ze,S as Te}from"../chunks/C12-r8ef.js";import{T as Ee}from"../chunks/DT-qxdWo.js";import"../chunks/BFRcN8qg.js";const Me=!1,De=!1,rt=Object.freeze(Object.defineProperty({__proto__:null,prerender:De,ssr:Me},Symbol.toStringTag,{value:"Module"}));function Ne(){let a=C("system"),r=C("light");function u(){if(!A)return;const t=localStorage.getItem("theme-mode");t&&["system","light","dark"].includes(t)&&h(a,t,!0),l(),window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{s(a)==="system"&&l()})}function d(t){h(a,t,!0),A&&(t==="system"?localStorage.removeItem("theme-mode"):localStorage.setItem("theme-mode",t),l())}function l(){if(!A)return;const t=s(a)==="dark"||s(a)==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches;h(r,t?"dark":"light",!0),document.documentElement.classList.remove("light","dark"),s(a)!=="system"?document.documentElement.classList.add(s(a)):t&&document.documentElement.classList.add("dark")}function i(){const t=["system","light","dark"],I=(t.indexOf(s(a))+1)%t.length;d(t[I])}return{get mode(){return s(a)},get resolvedTheme(){return s(r)},get isDark(){return s(r)==="dark"},init:u,setMode:d,toggle:i}}const $=Ne(),Y=()=>{const a=Le?Ie:Ce("__svelte__");return{page:{subscribe:a.page.subscribe},navigating:{subscribe:a.navigating.subscribe},updated:a.updated}},Oe={subscribe(a){return(ve?Fe("page"):Y().page).subscribe(a)}};function Fe(a){try{return Y()[a]}catch{throw new Error(`Cannot subscribe to '${a}' store on the server outside of a Svelte component, as it is bound to the current request via component context. This prevents state from leaking between users.For more information, see https://svelte.dev/docs/kit/state-management#avoid-shared-state-on-the-server`)}}function Pe(a,r){const u=N(r,["children","$$slots","$$events","$$legacy"]);/**
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
 */const d=[["rect",{width:"20",height:"14",x:"2",y:"3",rx:"2"}],["line",{x1:"8",x2:"16",y1:"21",y2:"21"}],["line",{x1:"12",x2:"12",y1:"17",y2:"21"}]];F(a,O({name:"monitor"},()=>u,{get iconNode(){return d},children:(l,i)=>{var t=L(),v=k(t);P(v,r,"default",{}),b(l,t)},$$slots:{default:!0}}))}function Be(a,r){const u=N(r,["children","$$slots","$$events","$$legacy"]);/**
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
 */const d=[["path",{d:"m2 2 20 20"}],["path",{d:"M5 5a1 1 0 0 0-1 1v7c0 5 3.5 7.5 7.67 8.94a1 1 0 0 0 .67.01c2.35-.82 4.48-1.97 5.9-3.71"}],["path",{d:"M9.309 3.652A12.252 12.252 0 0 0 11.24 2.28a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1v7a9.784 9.784 0 0 1-.08 1.264"}]];F(a,O({name:"shield-off"},()=>u,{get iconNode(){return d},children:(l,i)=>{var t=L(),v=k(t);P(v,r,"default",{}),b(l,t)},$$slots:{default:!0}}))}function He(a,r){const u=N(r,["children","$$slots","$$events","$$legacy"]);/**
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
 */const d=[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"}]];F(a,O({name:"shield"},()=>u,{get iconNode(){return d},children:(l,i)=>{var t=L(),v=k(t);P(v,r,"default",{}),b(l,t)},$$slots:{default:!0}}))}var Re=D(`<div class="fixed inset-0 bg-surface-base z-50 flex items-center justify-center"><div class="flex flex-col items-center gap-4"><div class="w-12 h-12 rounded-xl bg-[var(--color-accent-subtle)] border border-[var(--color-accent)]
                  flex items-center justify-center animate-pulse"><!></div> <div class="flex gap-1"><div class="w-2 h-2 rounded-full bg-accent animate-bounce" style="animation-delay: 0ms;"></div> <div class="w-2 h-2 rounded-full bg-accent animate-bounce" style="animation-delay: 150ms;"></div> <div class="w-2 h-2 rounded-full bg-accent animate-bounce" style="animation-delay: 300ms;"></div></div></div></div>`),Ze=D('<a><!> <span class="hidden sm:inline text-sm"> </span></a>'),Qe=D(`<!> <div><header class="sticky top-0 z-40 app-header"><nav class="flex items-center justify-between max-w-6xl mx-auto px-4 py-3"><a href="/" class="flex items-center gap-3 group"><div class="w-10 h-10 rounded-xl bg-[var(--color-accent-subtle)] border border-[var(--color-accent)]
                    flex items-center justify-center transition-all duration-200"><!></div> <div class="hidden sm:block"><h1 class="font-display text-sm text-content-primary">Smart Home</h1> <p class="text-xs text-content-tertiary">Control Center</p></div></a> <div class="flex items-center gap-1"><!> <button><!></button> <button class="theme-toggle ml-1"><!></button></div></nav></header> <main class="max-w-6xl mx-auto px-4 py-6"><!></main></div>`,1);function ot(a,r){fe(r,!0);const u=()=>ye(Oe,"$page",d),[d,l]=be();let i=C(!1),t=C(!1);async function v(){try{const e=await ke();h(i,e.armed,!0)}catch(e){console.error("Failed to load alarm status:",e)}}async function I(){h(t,!0);try{if(s(i)){const e=await xe();h(i,e.armed,!0)}else{const e=await $e();h(i,e.armed,!0)}}catch(e){console.error("Failed to toggle alarm:",e)}finally{h(t,!1)}}he(()=>{if(A){$.init(),g.initWebSocket(),g.refreshAll(),v();const e=setInterval(()=>g.refreshAll(),3e4);return()=>clearInterval(e)}});const K=[{href:"/",label:"Dashboard",icon:Se},{href:"/lighting",label:"Lighting",icon:je},{href:"/heater-schedule",label:"Climate",icon:Ee}];var B=Qe(),H=k(B);{var X=e=>{var c=Re(),y=o(c),m=o(y),_=o(m);U(_,{class:"w-6 h-6 text-accent"}),n(m),J(2),n(y),n(c),b(e,c)};S(H,e=>{g.initialLoadComplete||e(X)})}var j=x(H,2);let R;var z=o(j),Z=o(z),T=o(Z),Q=o(T),ee=o(Q);U(ee,{class:"w-5 h-5 text-accent"}),n(Q),J(2),n(T);var V=x(T,2),W=o(V);_e(W,17,()=>K,e=>e.href,(e,c)=>{const y=ge(()=>u().url.pathname===s(c).href);var m=Ze(),_=o(m);Ae(_,()=>s(c).icon,(ce,de)=>{de(ce,{class:"w-4 h-4"})});var f=x(_,2),le=o(f,!0);n(f),n(m),G(()=>{M(m,"href",s(c).href),E(m,1,`nav-pill flex items-center gap-2 ${s(y)?"nav-pill-active":"text-content-secondary hover:text-content-primary hover:bg-surface-recessed"}`),ue(le,s(c).label)}),b(e,m)});var p=x(W,2);p.__click=I;var te=o(p);{var ae=e=>{He(e,{class:"w-4 h-4"})},se=e=>{Be(e,{class:"w-4 h-4"})};S(te,e=>{s(i)?e(ae):e(se,!1)})}n(p);var w=x(p,2);w.__click=()=>$.toggle();var re=o(w);{var oe=e=>{Pe(e,{class:"w-4 h-4"})},ne=e=>{var c=L(),y=k(c);{var m=f=>{ze(f,{class:"w-4 h-4"})},_=f=>{Te(f,{class:"w-4 h-4"})};S(y,f=>{$.isDark?f(m):f(_,!1)},!0)}b(e,c)};S(re,e=>{$.mode==="system"?e(oe):e(ne,!1)})}n(w),n(V),n(Z),n(z);var q=x(z,2),ie=o(q);we(ie,()=>r.children),n(q),n(j),G(()=>{R=E(j,1,"min-h-screen bg-surface-base",null,R,{"opacity-0":!g.initialLoadComplete,"transition-opacity":g.initialLoadComplete,"duration-300":g.initialLoadComplete}),p.disabled=s(t),E(p,1,`ml-2 p-2 rounded-lg transition-all duration-200 ${s(i)?"bg-red-500/20 text-red-500 hover:bg-red-500/30":"text-content-secondary hover:text-content-primary hover:bg-surface-recessed"}`),M(p,"title",s(i)?"Alarm UZBROJONY - kliknij aby rozbroić":"Alarm rozbrojony - kliknij aby uzbroić"),M(w,"title",`Toggle theme (${$.mode??""})`)}),b(a,B),pe(),l()}me(["click"]);export{ot as component,rt as universal};
