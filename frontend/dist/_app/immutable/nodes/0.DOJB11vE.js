import{c as w,a as g,d as oe,f as V,s as ne}from"../chunks/C6IfJnDo.js";import{k as s,s as k,g as f,D as ie,f as S,p as le,d as ce,j as b,t as Z,l as de,m as i,n as l,o as me,v as ue}from"../chunks/DKHSd8_d.js";import{l as M,s as D,i as C,a as fe,b as he}from"../chunks/DTZz9ds9.js";import{I as N,s as O,e as ve,D as pe,E as ge,a as E,d as Q,F as L,G as be}from"../chunks/C61pVXLe.js";import{s as _e,H as ye}from"../chunks/BC8zPdL3.js";import{c as xe}from"../chunks/YQ5o6Efk.js";import{b as $}from"../chunks/D1qDfmfk.js";import{g as $e}from"../chunks/C06WGzbn.js";import{B as ke}from"../chunks/-TS2BfOP.js";import{s as we}from"../chunks/CnQ9MZ-t.js";import{Z as Se,L as Ae,M as Ie,S as ze}from"../chunks/BES3RAfQ.js";import{T as Te}from"../chunks/DHj1fn9y.js";import"../chunks/BFRcN8qg.js";const je=!1,Ce=!1,Xe=Object.freeze(Object.defineProperty({__proto__:null,prerender:Ce,ssr:je},Symbol.toStringTag,{value:"Module"}));function Ee(){let a=k("system"),r=k("light");function d(){if(!$)return;const t=localStorage.getItem("theme-mode");t&&["system","light","dark"].includes(t)&&f(a,t,!0),n(),window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{s(a)==="system"&&n()})}function c(t){f(a,t,!0),$&&(t==="system"?localStorage.removeItem("theme-mode"):localStorage.setItem("theme-mode",t),n())}function n(){if(!$)return;const t=s(a)==="dark"||s(a)==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches;f(r,t?"dark":"light",!0),document.documentElement.classList.remove("light","dark"),s(a)!=="system"?document.documentElement.classList.add(s(a)):t&&document.documentElement.classList.add("dark")}function o(){const t=["system","light","dark"],A=(t.indexOf(s(a))+1)%t.length;c(t[A])}return{get mode(){return s(a)},get resolvedTheme(){return s(r)},get isDark(){return s(r)==="dark"},init:d,setMode:c,toggle:o}}const _=Ee(),W=()=>{const a=ke?we:$e("__svelte__");return{page:{subscribe:a.page.subscribe},navigating:{subscribe:a.navigating.subscribe},updated:a.updated}},Le={subscribe(a){return(ie?Me("page"):W().page).subscribe(a)}};function Me(a){try{return W()[a]}catch{throw new Error(`Cannot subscribe to '${a}' store on the server outside of a Svelte component, as it is bound to the current request via component context. This prevents state from leaking between users.For more information, see https://svelte.dev/docs/kit/state-management#avoid-shared-state-on-the-server`)}}function De(a,r){const d=M(r,["children","$$slots","$$events","$$legacy"]);/**
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
 */const c=[["rect",{width:"20",height:"14",x:"2",y:"3",rx:"2"}],["line",{x1:"8",x2:"16",y1:"21",y2:"21"}],["line",{x1:"12",x2:"12",y1:"17",y2:"21"}]];N(a,D({name:"monitor"},()=>d,{get iconNode(){return c},children:(n,o)=>{var t=w(),m=S(t);O(m,r,"default",{}),g(n,t)},$$slots:{default:!0}}))}function Ne(a,r){const d=M(r,["children","$$slots","$$events","$$legacy"]);/**
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
 */const c=[["path",{d:"m2 2 20 20"}],["path",{d:"M5 5a1 1 0 0 0-1 1v7c0 5 3.5 7.5 7.67 8.94a1 1 0 0 0 .67.01c2.35-.82 4.48-1.97 5.9-3.71"}],["path",{d:"M9.309 3.652A12.252 12.252 0 0 0 11.24 2.28a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1v7a9.784 9.784 0 0 1-.08 1.264"}]];N(a,D({name:"shield-off"},()=>d,{get iconNode(){return c},children:(n,o)=>{var t=w(),m=S(t);O(m,r,"default",{}),g(n,t)},$$slots:{default:!0}}))}function Oe(a,r){const d=M(r,["children","$$slots","$$events","$$legacy"]);/**
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
 */const c=[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"}]];N(a,D({name:"shield"},()=>d,{get iconNode(){return c},children:(n,o)=>{var t=w(),m=S(t);O(m,r,"default",{}),g(n,t)},$$slots:{default:!0}}))}var Fe=V('<a><!> <span class="hidden sm:inline text-sm"> </span></a>'),Pe=V(`<div class="min-h-screen bg-surface-base"><header class="sticky top-0 z-40 app-header"><nav class="flex items-center justify-between max-w-6xl mx-auto px-4 py-3"><a href="/" class="flex items-center gap-3 group"><div class="w-10 h-10 rounded-xl bg-[var(--color-accent-subtle)] border border-[var(--color-accent)]
                    flex items-center justify-center transition-all duration-200"><!></div> <div class="hidden sm:block"><h1 class="font-display text-sm text-content-primary">Smart Home</h1> <p class="text-xs text-content-tertiary">Control Center</p></div></a> <div class="flex items-center gap-1"><!> <button><!></button> <button class="theme-toggle ml-1"><!></button></div></nav></header> <main class="max-w-6xl mx-auto px-4 py-6"><!></main></div>`);function et(a,r){le(r,!0);const d=()=>he(Le,"$page",c),[c,n]=fe();let o=k(!1),t=k(!1);async function m(){try{const e=await be();f(o,e.armed,!0)}catch(e){console.error("Failed to load alarm status:",e)}}async function A(){f(t,!0);try{if(s(o)){const e=await pe();f(o,e.armed,!0)}else{const e=await ge();f(o,e.armed,!0)}}catch(e){console.error("Failed to toggle alarm:",e)}finally{f(t,!1)}}ce(()=>{if($){_.init(),E.initWebSocket(),E.refreshAll(),m();const e=setInterval(()=>E.refreshAll(),3e4);return()=>clearInterval(e)}});const q=[{href:"/",label:"Dashboard",icon:ye},{href:"/lighting",label:"Lighting",icon:Ae},{href:"/heater-schedule",label:"Climate",icon:Te}];var I=Pe(),z=i(I),F=i(z),T=i(F),P=i(T),G=i(P);Se(G,{class:"w-5 h-5 text-accent"}),l(P),me(2),l(T);var B=b(T,2),H=i(B);ve(H,17,()=>q,e=>e.href,(e,v)=>{const j=ue(()=>d().url.pathname===s(v).href);var p=Fe(),x=i(p);xe(x,()=>s(v).icon,(se,re)=>{re(se,{class:"w-4 h-4"})});var u=b(x,2),ae=i(u,!0);l(u),l(p),Z(()=>{L(p,"href",s(v).href),Q(p,1,`nav-pill flex items-center gap-2 ${s(j)?"nav-pill-active":"text-content-secondary hover:text-content-primary hover:bg-surface-recessed"}`),ne(ae,s(v).label)}),g(e,p)});var h=b(H,2);h.__click=A;var J=i(h);{var U=e=>{Oe(e,{class:"w-4 h-4"})},Y=e=>{Ne(e,{class:"w-4 h-4"})};C(J,e=>{s(o)?e(U):e(Y,!1)})}l(h);var y=b(h,2);y.__click=()=>_.toggle();var K=i(y);{var X=e=>{De(e,{class:"w-4 h-4"})},ee=e=>{var v=w(),j=S(v);{var p=u=>{Ie(u,{class:"w-4 h-4"})},x=u=>{ze(u,{class:"w-4 h-4"})};C(j,u=>{_.isDark?u(p):u(x,!1)},!0)}g(e,v)};C(K,e=>{_.mode==="system"?e(X):e(ee,!1)})}l(y),l(B),l(F),l(z);var R=b(z,2),te=i(R);_e(te,()=>r.children),l(R),l(I),Z(()=>{h.disabled=s(t),Q(h,1,`ml-2 p-2 rounded-lg transition-all duration-200 ${s(o)?"bg-red-500/20 text-red-500 hover:bg-red-500/30":"text-content-secondary hover:text-content-primary hover:bg-surface-recessed"}`),L(h,"title",s(o)?"Alarm UZBROJONY - kliknij aby rozbroić":"Alarm rozbrojony - kliknij aby uzbroić"),L(y,"title",`Toggle theme (${_.mode??""})`)}),g(a,I),de(),n()}oe(["click"]);export{et as component,Xe as universal};
