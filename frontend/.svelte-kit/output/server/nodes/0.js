

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.C4GVTWeW.js","_app/immutable/chunks/B_G7EnjR.js","_app/immutable/chunks/DAortCmQ.js","_app/immutable/chunks/CPDa7M0J.js","_app/immutable/chunks/BH17u12g.js","_app/immutable/chunks/yhGyEu1N.js","_app/immutable/chunks/C9KLA5Bu.js","_app/immutable/chunks/NXxA8x-m.js","_app/immutable/chunks/BhN2kyAR.js","_app/immutable/chunks/CC69UYZT.js","_app/immutable/chunks/7-8rnMVl.js","_app/immutable/chunks/CkGPgyzJ.js","_app/immutable/chunks/-TS2BfOP.js","_app/immutable/chunks/CP999QD0.js","_app/immutable/chunks/BsI0eHaE.js","_app/immutable/chunks/Br8doLew.js","_app/immutable/chunks/Z4NcMU7K.js","_app/immutable/chunks/Dp1pzeXC.js","_app/immutable/chunks/Ik-j-KQY.js","_app/immutable/chunks/DxwuCvmG.js"];
export const stylesheets = ["_app/immutable/assets/0.Bwc_OJgk.css"];
export const fonts = [];
