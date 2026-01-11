import{c as R,a as $,d as W,f as D,s as q}from"../chunks/CEDFY9N9.js";import{g as s,s as L,c as _,D as F,f as V,p as G,b as J,d as g,t as j,h as K,i as o,n as U,j as a}from"../chunks/B2drfW2D.js";import{I as X,s as Y,e as Z,a as k,z as H,d as ee}from"../chunks/Y5QuyOWE.js";import{H as M,s as te}from"../chunks/BzB2s1pN.js";import{c as z}from"../chunks/DIqNBuPr.js";import{l as se,s as re,a as ae,b as oe}from"../chunks/o9TOya3S.js";import{b}from"../chunks/Diics1BE.js";import{g as ne}from"../chunks/DlUEK9fe.js";import{B as ie}from"../chunks/-TS2BfOP.js";import{s as ce}from"../chunks/BDdixYRA.js";import{L as le,M as me,S as de}from"../chunks/d-WRx-C9.js";import{T as ue}from"../chunks/4tE47fZ7.js";import"../chunks/CDrra-OC.js";const he=!1,pe=!1,De=Object.freeze(Object.defineProperty({__proto__:null,prerender:pe,ssr:he},Symbol.toStringTag,{value:"Module"}));function fe(){let e=L("system"),r=L("light");function d(){if(!b)return;const t=localStorage.getItem("theme-mode");t&&["system","light","dark"].includes(t)&&_(e,t,!0),n(),window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{s(e)==="system"&&n()})}function l(t){_(e,t,!0),b&&(t==="system"?localStorage.removeItem("theme-mode"):localStorage.setItem("theme-mode",t),n())}function n(){if(!b)return;const t=s(e)==="dark"||s(e)==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches;_(r,t?"dark":"light",!0),document.documentElement.classList.remove("light","dark"),s(e)!=="system"?document.documentElement.classList.add(s(e)):t&&document.documentElement.classList.add("dark")}function p(){const t=["system","light","dark"],u=(t.indexOf(s(e))+1)%t.length;l(t[u])}return{get mode(){return s(e)},get resolvedTheme(){return s(r)},get isDark(){return s(r)==="dark"},init:d,setMode:l,toggle:p}}const v=fe(),O=()=>{const e=ie?ce:ne("__svelte__");return{page:{subscribe:e.page.subscribe},navigating:{subscribe:e.navigating.subscribe},updated:e.updated}},ge={subscribe(e){return(F?ve("page"):O().page).subscribe(e)}};function ve(e){try{return O()[e]}catch{throw new Error(`Cannot subscribe to '${e}' store on the server outside of a Svelte component, as it is bound to the current request via component context. This prevents state from leaking between users.For more information, see https://svelte.dev/docs/kit/state-management#avoid-shared-state-on-the-server`)}}function be(e,r){const d=se(r,["children","$$slots","$$events","$$legacy"]);/**
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
 */const l=[["rect",{width:"20",height:"14",x:"2",y:"3",rx:"2"}],["line",{x1:"8",x2:"16",y1:"21",y2:"21"}],["line",{x1:"12",x2:"12",y1:"17",y2:"21"}]];X(e,re({name:"monitor"},()=>d,{get iconNode(){return l},children:(n,p)=>{var t=R(),i=V(t);Y(i,r,"default",{}),$(n,t)},$$slots:{default:!0}}))}var xe=D('<a><!> <span class="hidden sm:inline"> </span></a>'),ye=D(`<div class="min-h-screen bg-surface-base transition-colors duration-200"><header class="sticky top-0 z-40 bg-surface-elevated border-b border-stroke-default"><nav class="flex items-center justify-between max-w-6xl mx-auto px-4 py-2.5"><h1 class="text-base font-semibold text-content-primary flex items-center gap-2"><!> <span class="hidden sm:inline">Smart Home</span></h1> <div class="flex items-center gap-2"><div class="flex gap-1"></div> <button class="ml-2 p-2 rounded-lg text-content-secondary hover:text-content-primary
                 hover:bg-surface-recessed transition-colors min-h-[44px] min-w-[44px]
                 flex items-center justify-center"><!></button></div></nav></header> <main class="max-w-6xl mx-auto px-4 py-4"><!></main></div>`);function Oe(e,r){G(r,!0);const d=()=>oe(ge,"$page",l),[l,n]=ae();J(()=>{if(b){v.init(),k.initWebSocket(),k.refreshAll();const c=setInterval(()=>k.refreshAll(),3e4);return()=>clearInterval(c)}});const p=[{href:"/",label:"Home",icon:M},{href:"/lighting",label:"Lighting",icon:le},{href:"/heater-schedule",label:"Heating",icon:ue}],t={system:be,light:de,dark:me};var i=ye(),u=o(i),w=o(u),x=o(w),A=o(x);M(A,{class:"w-5 h-5 text-accent"}),U(2),a(x);var S=g(x,2),y=o(S);Z(y,21,()=>p,c=>c.href,(c,m)=>{var h=xe(),T=o(h);z(T,()=>s(m).icon,(P,Q)=>{Q(P,{class:"w-4 h-4"})});var E=g(T,2),N=o(E,!0);a(E),a(h),j(()=>{H(h,"href",s(m).href),ee(h,1,`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1.5
                     ${d().url.pathname===s(m).href?"bg-accent/15 text-accent":"text-content-secondary hover:text-content-primary hover:bg-surface-recessed"}`),q(N,s(m).label)}),$(c,h)}),a(y);var f=g(y,2);f.__click=()=>v.toggle();var B=o(f);z(B,()=>t[v.mode],(c,m)=>{m(c,{class:"w-5 h-5"})}),a(f),a(S),a(w),a(u);var I=g(u,2),C=o(I);te(C,()=>r.children),a(I),a(i),j(()=>H(f,"title",`Theme: ${v.mode??""}`)),$(e,i),K(),n()}W(["click"]);export{Oe as component,De as universal};
