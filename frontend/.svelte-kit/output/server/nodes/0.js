

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.CEZGsdeQ.js","_app/immutable/chunks/BdGXCaaf.js","_app/immutable/chunks/CKtoZ9Il.js","_app/immutable/chunks/YN5YbcMn.js","_app/immutable/chunks/b25NGLIX.js","_app/immutable/chunks/CTz3f5B3.js","_app/immutable/chunks/C2tPD3ws.js","_app/immutable/chunks/CxA4e2Oe.js","_app/immutable/chunks/B_d42h2W.js","_app/immutable/chunks/CUKEFdg2.js","_app/immutable/chunks/yUrKyb_5.js","_app/immutable/chunks/-TS2BfOP.js","_app/immutable/chunks/CgKhIfc2.js","_app/immutable/chunks/CidvXcsZ.js","_app/immutable/chunks/CzHiguD5.js"];
export const stylesheets = ["_app/immutable/assets/0.ChUURvra.css"];
export const fonts = [];
