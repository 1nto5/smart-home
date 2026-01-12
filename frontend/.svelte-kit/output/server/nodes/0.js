

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.cEq3NEap.js","_app/immutable/chunks/DN_vEeGv.js","_app/immutable/chunks/CEuPnrTr.js","_app/immutable/chunks/CK2TXMS2.js","_app/immutable/chunks/mpM_GrAP.js","_app/immutable/chunks/DjnKCaAL.js","_app/immutable/chunks/D5hXq-hi.js","_app/immutable/chunks/CAnHEzPj.js","_app/immutable/chunks/B1Sn1HrY.js","_app/immutable/chunks/-TS2BfOP.js","_app/immutable/chunks/-AolcYt_.js","_app/immutable/chunks/DQ4rmjTs.js","_app/immutable/chunks/BgD7rIv1.js","_app/immutable/chunks/Bqvi8cHG.js","_app/immutable/chunks/Dp1pzeXC.js","_app/immutable/chunks/BIvAi59F.js","_app/immutable/chunks/CPaTYCEG.js"];
export const stylesheets = ["_app/immutable/assets/0.CWPHaKfC.css"];
export const fonts = [];
