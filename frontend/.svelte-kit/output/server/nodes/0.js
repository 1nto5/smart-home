

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.CeIFq_wr.js","_app/immutable/chunks/DZ0_ip0j.js","_app/immutable/chunks/DSyWC8IU.js","_app/immutable/chunks/B5VcDGCH.js","_app/immutable/chunks/CXwYO5u8.js","_app/immutable/chunks/C2o-Wsy3.js","_app/immutable/chunks/BWxY5iS2.js","_app/immutable/chunks/BsUt5DDx.js","_app/immutable/chunks/byg3CW2Z.js","_app/immutable/chunks/Dl92ZAIs.js","_app/immutable/chunks/Dvu50Twt.js","_app/immutable/chunks/-TS2BfOP.js","_app/immutable/chunks/BXR5lUZa.js","_app/immutable/chunks/BA2B7deI.js","_app/immutable/chunks/BZczM5D-.js","_app/immutable/chunks/D_fblim4.js","_app/immutable/chunks/Dp1pzeXC.js","_app/immutable/chunks/CSq0IjtE.js"];
export const stylesheets = ["_app/immutable/assets/0.v_rBX4E-.css"];
export const fonts = [];
