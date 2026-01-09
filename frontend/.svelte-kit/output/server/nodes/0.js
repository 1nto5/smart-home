

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.DqFXTIL1.js","_app/immutable/chunks/KsRpIQI_.js","_app/immutable/chunks/CxzkeP2L.js","_app/immutable/chunks/NTh6LLl8.js","_app/immutable/chunks/Bcugs9fK.js","_app/immutable/chunks/CEFYxjNz.js","_app/immutable/chunks/BRTiwp6z.js","_app/immutable/chunks/CxA4e2Oe.js","_app/immutable/chunks/DY9VI_77.js","_app/immutable/chunks/BLKChfIF.js","_app/immutable/chunks/BwEXeUC-.js","_app/immutable/chunks/-TS2BfOP.js","_app/immutable/chunks/_OUmbySw.js","_app/immutable/chunks/12JyGcPZ.js","_app/immutable/chunks/Cc_vj6Fx.js","_app/immutable/chunks/Dp1pzeXC.js"];
export const stylesheets = ["_app/immutable/assets/0.NEuY8aRK.css"];
export const fonts = [];
