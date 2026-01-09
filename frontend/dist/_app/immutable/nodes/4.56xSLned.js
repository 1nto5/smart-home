import{c as B,a as v,d as H,f as b,s as y}from"../chunks/1jsiGTgY.js";import{f as K,p as k,c,s as m,k as o,g as l,d as w,t as $,i as A,j as u,W as T,a9 as W,e as q,$ as C,af as D,ag as E}from"../chunks/js2fU5d7.js";import{g as F,s as G,e as J,h as Q}from"../chunks/Ba70ElLJ.js";import{h as R}from"../chunks/C6CS1puY.js";import{i as M}from"../chunks/DykED0dc.js";import{c as U}from"../chunks/D3_2R_nA.js";import"../chunks/MGp4GRcg.js";import{I as V,s as X}from"../chunks/CeF91h_T.js";import{l as Y,s as Z}from"../chunks/D_bOTIDI.js";import{P as ee}from"../chunks/CqDWA_kn.js";import{M as te,S as ae}from"../chunks/CoAw0ab-.js";import{b as se}from"../chunks/oDMcWFnN.js";function re(f,t){const n=Y(t,["children","$$slots","$$events","$$legacy"]);/**
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
 */const a=[["path",{d:"M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"}],["path",{d:"M9 18h6"}],["path",{d:"M10 22h4"}]];V(f,Z({name:"lightbulb"},()=>n,{get iconNode(){return a},children:(d,s)=>{var r=B(),i=K(r);X(i,t,"default",{}),v(d,r)},$$slots:{default:!0}}))}var oe=b('<span class="absolute top-1 right-1 w-2 h-2 bg-white rounded-full animate-pulse"></span>'),ne=b('<p class="text-xs mt-2 text-content-secondary"> </p>'),ie=b('<div class="card p-4"><div class="flex items-center gap-3 mb-3"><!> <div><h3 class="font-medium text-content-primary"> </h3> <p class="text-xs text-content-secondary"> </p></div></div> <button class="w-full py-2 rounded-lg bg-accent hover:bg-accent/80 text-white font-medium relative transition-all">Apply to All Lamps <!></button> <!></div>');function ce(f,t){k(t,!0);let n=w(!1),a=w(null);async function d(){u(n,!0),u(a,null);try{u(a,await F(t.name),!0),G.refreshPending()}catch(e){console.error(e)}u(n,!1)}function s(e){switch(e){case"day":return ae;case"night":return te;case"off":return ee;default:return re}}var r=ie(),i=c(r),g=c(i);U(g,()=>s(t.name),(e,p)=>{p(e,{class:"w-6 h-6 text-accent"})});var h=m(g,2),x=c(h),I=c(x,!0);o(x);var P=m(x,2),L=c(P,!0);o(P),o(h),o(i);var _=m(i,2);_.__click=d;var S=m(c(_));{var j=e=>{var p=oe();v(e,p)};M(S,e=>{l(n)&&e(j)})}o(_);var N=m(_,2);{var O=e=>{var p=ne(),z=c(p);o(p),$(()=>y(z,`${l(a).success.length??""} applied, ${l(a).pending.length??""} pending`)),v(e,p)};M(N,e=>{l(a)&&e(O)})}o(r),$(()=>{y(I,t.preset.name),y(L,t.preset.power?`${t.preset.brightness}% / ${t.preset.colorTemp}K`:"Off")}),v(f,r),A()}H(["click"]);var le=b('<div class="space-y-6"><h2 class="text-lg font-medium text-content-primary">Lamp Presets</h2> <p class="text-sm text-content-secondary">Apply a preset to all lamps at once</p> <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"></div></div>');function we(f,t){k(t,!0);let n=w(T({}));W(()=>{se&&Q().then(s=>u(n,s,!0))});var a=le();R("ib7llb",s=>{q(()=>{C.title="Smart Home - Presets"})});var d=m(c(a),4);J(d,21,()=>Object.entries(l(n)),([s,r])=>s,(s,r)=>{var i=D(()=>E(l(r),2));let g=()=>l(i)[0],h=()=>l(i)[1];ce(s,{get name(){return g()},get preset(){return h()}})}),o(d),o(a),v(f,a),A()}export{we as component};
