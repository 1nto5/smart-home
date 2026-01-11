import{c as O,a as _,d as F,f as z,s as V}from"../chunks/C6IfJnDo.js";import{k as s,s as D,g as $,D as G,f as A,p as J,d as K,j as x,t as j,l as U,m as o,n,o as X,v as Y}from"../chunks/DKHSd8_d.js";import{l as ee,s as te,i as C,a as se,b as re}from"../chunks/DTZz9ds9.js";import{I as ae,s as oe,e as ne,a as S,l as M,d as ie}from"../chunks/BcugN2hX.js";import{s as ce,H as le}from"../chunks/DGq6GpK4.js";import{c as me}from"../chunks/YQ5o6Efk.js";import{b as y}from"../chunks/D1qDfmfk.js";import{g as de}from"../chunks/C06WGzbn.js";import{B as ue}from"../chunks/-TS2BfOP.js";import{s as fe}from"../chunks/K9kmAE4-.js";import{Z as he,L as pe,M as ve,S as ge}from"../chunks/CJAfQMn7.js";import{T as be}from"../chunks/BjrDeP2o.js";import"../chunks/BFRcN8qg.js";const xe=!1,_e=!1,Pe=Object.freeze(Object.defineProperty({__proto__:null,prerender:_e,ssr:xe},Symbol.toStringTag,{value:"Module"}));function ye(){let e=D("system"),a=D("light");function f(){if(!y)return;const t=localStorage.getItem("theme-mode");t&&["system","light","dark"].includes(t)&&$(e,t,!0),c(),window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{s(e)==="system"&&c()})}function u(t){$(e,t,!0),y&&(t==="system"?localStorage.removeItem("theme-mode"):localStorage.setItem("theme-mode",t),c())}function c(){if(!y)return;const t=s(e)==="dark"||s(e)==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches;$(a,t?"dark":"light",!0),document.documentElement.classList.remove("light","dark"),s(e)!=="system"?document.documentElement.classList.add(s(e)):t&&document.documentElement.classList.add("dark")}function p(){const t=["system","light","dark"],v=(t.indexOf(s(e))+1)%t.length;u(t[v])}return{get mode(){return s(e)},get resolvedTheme(){return s(a)},get isDark(){return s(a)==="dark"},init:f,setMode:u,toggle:p}}const h=ye(),H=()=>{const e=ue?fe:de("__svelte__");return{page:{subscribe:e.page.subscribe},navigating:{subscribe:e.navigating.subscribe},updated:e.updated}},ke={subscribe(e){return(G?we("page"):H().page).subscribe(e)}};function we(e){try{return H()[e]}catch{throw new Error(`Cannot subscribe to '${e}' store on the server outside of a Svelte component, as it is bound to the current request via component context. This prevents state from leaking between users.For more information, see https://svelte.dev/docs/kit/state-management#avoid-shared-state-on-the-server`)}}function $e(e,a){const f=ee(a,["children","$$slots","$$events","$$legacy"]);/**
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
 */const u=[["rect",{width:"20",height:"14",x:"2",y:"3",rx:"2"}],["line",{x1:"8",x2:"16",y1:"21",y2:"21"}],["line",{x1:"12",x2:"12",y1:"17",y2:"21"}]];ae(e,te({name:"monitor"},()=>f,{get iconNode(){return u},children:(c,p)=>{var t=O(),l=A(t);oe(l,a,"default",{}),_(c,t)},$$slots:{default:!0}}))}var Se=z('<a><!> <span class="hidden sm:inline text-sm"> </span></a>'),Ie=z(`<div class="min-h-screen bg-surface-base"><header class="sticky top-0 z-40 app-header"><nav class="flex items-center justify-between max-w-6xl mx-auto px-4 py-3"><a href="/" class="flex items-center gap-3 group"><div class="w-10 h-10 rounded-xl bg-[var(--color-accent-subtle)] border border-[var(--color-accent)]
                    flex items-center justify-center transition-all duration-200"><!></div> <div class="hidden sm:block"><h1 class="font-display text-sm text-content-primary">Smart Home</h1> <p class="text-xs text-content-tertiary">Control Center</p></div></a> <div class="flex items-center gap-1"><!> <button class="theme-toggle ml-2"><!></button></div></nav></header> <main class="max-w-6xl mx-auto px-4 py-6"><!></main></div>`);function Qe(e,a){J(a,!0);const f=()=>re(ke,"$page",u),[u,c]=se();K(()=>{if(y){h.init(),S.initWebSocket(),S.refreshAll();const r=setInterval(()=>S.refreshAll(),3e4);return()=>clearInterval(r)}});const p=[{href:"/",label:"Dashboard",icon:le},{href:"/lighting",label:"Lighting",icon:pe},{href:"/heater-schedule",label:"Climate",icon:be}];var t=Ie(),l=o(t),v=o(l),k=o(v),I=o(k),B=o(I);he(B,{class:"w-5 h-5 text-accent"}),n(I),X(2),n(k);var T=x(k,2),E=o(T);ne(E,17,()=>p,r=>r.href,(r,m)=>{const w=Y(()=>f().url.pathname===s(m).href);var d=Se(),b=o(d);me(b,()=>s(m).icon,(Z,q)=>{q(Z,{class:"w-4 h-4"})});var i=x(b,2),W=o(i,!0);n(i),n(d),j(()=>{M(d,"href",s(m).href),ie(d,1,`nav-pill flex items-center gap-2 ${s(w)?"nav-pill-active":"text-content-secondary hover:text-content-primary hover:bg-surface-recessed"}`),V(W,s(m).label)}),_(r,d)});var g=x(E,2);g.__click=()=>h.toggle();var N=o(g);{var P=r=>{$e(r,{class:"w-4 h-4"})},Q=r=>{var m=O(),w=A(m);{var d=i=>{ve(i,{class:"w-4 h-4"})},b=i=>{ge(i,{class:"w-4 h-4"})};C(w,i=>{h.isDark?i(d):i(b,!1)},!0)}_(r,m)};C(N,r=>{h.mode==="system"?r(P):r(Q,!1)})}n(g),n(T),n(v),n(l);var L=x(l,2),R=o(L);ce(R,()=>a.children),n(L),n(t),j(()=>M(g,"title",`Toggle theme (${h.mode??""})`)),_(e,t),U(),c()}F(["click"]);export{Qe as component,Pe as universal};
