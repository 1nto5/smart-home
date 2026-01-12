import{c as l,a as c}from"./DN_vEeGv.js";import"./DjnKCaAL.js";import{f as d}from"./CEuPnrTr.js";import{I as m,s as u}from"./mpM_GrAP.js";import{l as h,s as p}from"./CK2TXMS2.js";function S(i,r){const a=h(r,["children","$$slots","$$events","$$legacy"]);/**
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
 */const e=[["path",{d:"M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"}]];m(i,p({name:"flame"},()=>a,{get iconNode(){return e},children:(o,n)=>{var t=l(),s=d(t);u(s,r,"default",{}),c(o,t)},$$slots:{default:!0}}))}const z={"korytarz 1":"Hallway 1","korytarz 2":"Hallway 2",kuchnia:"Kitchen",salon:"Living Room",sypialnia:"Bedroom",łazienka:"Bathroom","pokój dzieci":"Kids Room",jadalnia:"Dining Room",gabinet:"Study",pralnia:"Laundry","Czujnik zalania kuchnia":"Kitchen Sensor","Czujnik zalania łazienka":"Bathroom Sensor","Czujnik zalania":"Water Sensor","Stacja meteo":"Weather Station",Drzwi:"Door Sensor","Grzejnik salon":"Radiator Living Room","Grzejnik sypialnia":"Radiator Bedroom","Grzejnik kuchnia":"Radiator Kitchen","Grzejnik łazienka":"Radiator Bathroom","Grzejnik korytarz":"Radiator Hallway","Grzejnik pokój dzieci":"Radiator Kids Room",Grzejnik:"Radiator"},k={korytarz:"Hallway",kuchnia:"Kitchen",salon:"Living Room",sypialnia:"Bedroom",łazienka:"Bathroom","pokój dzieci":"Kids Room",pokój:"Room",dzieci:"Kids","Czujnik zalania":"Water Sensor","Stacja meteo":"Weather Station",Grzejnik:"Radiator",Drzwi:"Door",Lampa:"Light",duży:"Large",mały:"Small",główny:"Main",górny:"Upper",dolny:"Lower"};function f(i){if(!i)return i;const r=i.toLowerCase();for(const[o,n]of Object.entries(z))if(r===o.toLowerCase())return n;let a=i;const e=Object.entries(k).sort((o,n)=>n[0].length-o[0].length);for(const[o,n]of e){const t=new RegExp(o,"gi");a=a.replace(t,n)}return a}function $(i,r){const a=f(i);if(r==="wkf")return a.replace(/^(Radiator|Heater|Grzejnik)\s+/i,"").replace(/\s+(Radiator|Heater|Grzejnik)$/i,"");if(r==="sj"){const e=a.match(/^(.+?)\s*Sensor$/i);if(e)return e[1];const o=a.match(/(Kitchen|Bathroom|Living Room|Bedroom|Hallway)/i);return o?o[1]:a}if(r==="mcs"){const e=a.toLowerCase();return e.includes("kitchen")||e.includes("kuchnia")?"Kitchen":e.includes("door")||e.includes("drzwi")?"Door":e.includes("bathroom")||e.includes("łazienka")?"Bathroom":a.replace(/\s*Sensor$/i,"")}return a}export{S as F,$ as g,f as t};
