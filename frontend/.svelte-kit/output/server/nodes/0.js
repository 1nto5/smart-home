

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.DapqKoV_.js","_app/immutable/chunks/CEDFY9N9.js","_app/immutable/chunks/B2drfW2D.js","_app/immutable/chunks/Y5QuyOWE.js","_app/immutable/chunks/CDrra-OC.js","_app/immutable/chunks/o9TOya3S.js","_app/immutable/chunks/BzB2s1pN.js","_app/immutable/chunks/DIqNBuPr.js","_app/immutable/chunks/Diics1BE.js","_app/immutable/chunks/-TS2BfOP.js","_app/immutable/chunks/DlUEK9fe.js","_app/immutable/chunks/BDdixYRA.js","_app/immutable/chunks/li-whztj.js","_app/immutable/chunks/Ck1TcYO7.js","_app/immutable/chunks/Dp1pzeXC.js","_app/immutable/chunks/d-WRx-C9.js","_app/immutable/chunks/4tE47fZ7.js"];
export const stylesheets = ["_app/immutable/assets/0.CPaG76az.css"];
export const fonts = [];
