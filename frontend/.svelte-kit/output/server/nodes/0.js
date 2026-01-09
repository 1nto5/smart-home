

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.jwwdMK6D.js","_app/immutable/chunks/BpQGbxjQ.js","_app/immutable/chunks/CeX5bisY.js","_app/immutable/chunks/CFnnMLjb.js","_app/immutable/chunks/KroyEBrN.js","_app/immutable/chunks/LV0sw-9a.js","_app/immutable/chunks/D688N9uT.js","_app/immutable/chunks/CxA4e2Oe.js","_app/immutable/chunks/UTtrt9yp.js","_app/immutable/chunks/Cp3xCf78.js","_app/immutable/chunks/Cvyj8RLr.js","_app/immutable/chunks/-TS2BfOP.js","_app/immutable/chunks/msA1evzn.js","_app/immutable/chunks/Ccl9NSUH.js","_app/immutable/chunks/SLPJEgCe.js"];
export const stylesheets = ["_app/immutable/assets/0.DHAb8xEl.css"];
export const fonts = [];
