

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.DJNEchNO.js","_app/immutable/chunks/CjotZmkh.js","_app/immutable/chunks/D-6XIZR8.js","_app/immutable/chunks/C8iX40Sw.js","_app/immutable/chunks/D3e3VSPU.js","_app/immutable/chunks/CpFjEKQZ.js","_app/immutable/chunks/DlT9II2j.js","_app/immutable/chunks/ks5tSOE-.js","_app/immutable/chunks/BvlVR2yQ.js","_app/immutable/chunks/-TS2BfOP.js","_app/immutable/chunks/BtSPheYN.js","_app/immutable/chunks/BT1uXSIj.js","_app/immutable/chunks/BSwr6Mpb.js","_app/immutable/chunks/BSP8ppFM.js","_app/immutable/chunks/Dp1pzeXC.js","_app/immutable/chunks/CcuWYFwD.js","_app/immutable/chunks/Bn7Fy7Nk.js"];
export const stylesheets = ["_app/immutable/assets/0.Bwc_OJgk.css"];
export const fonts = [];
