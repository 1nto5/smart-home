

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.BrHR1WeO.js","_app/immutable/chunks/DN_vEeGv.js","_app/immutable/chunks/CEuPnrTr.js","_app/immutable/chunks/CK2TXMS2.js","_app/immutable/chunks/B98XAycf.js","_app/immutable/chunks/DjnKCaAL.js","_app/immutable/chunks/BXz9woy6.js","_app/immutable/chunks/CAnHEzPj.js","_app/immutable/chunks/B1Sn1HrY.js","_app/immutable/chunks/-TS2BfOP.js","_app/immutable/chunks/-AolcYt_.js","_app/immutable/chunks/BwOtyEnL.js","_app/immutable/chunks/BgD7rIv1.js","_app/immutable/chunks/Bqvi8cHG.js","_app/immutable/chunks/Dp1pzeXC.js","_app/immutable/chunks/C0FFwbO2.js","_app/immutable/chunks/B33j1F3D.js"];
export const stylesheets = ["_app/immutable/assets/0.CFepNwrB.css"];
export const fonts = [];
