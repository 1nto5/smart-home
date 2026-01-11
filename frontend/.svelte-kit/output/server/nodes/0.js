

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.CEmEdtKD.js","_app/immutable/chunks/zvZFzcKP.js","_app/immutable/chunks/NvR4cXbL.js","_app/immutable/chunks/BzB3Y-EY.js","_app/immutable/chunks/hZtl0Sbs.js","_app/immutable/chunks/BBmoO9PJ.js","_app/immutable/chunks/Co7DyAqw.js","_app/immutable/chunks/Du68J5SX.js","_app/immutable/chunks/CmMMdMVi.js","_app/immutable/chunks/-TS2BfOP.js","_app/immutable/chunks/kTUlFWdF.js","_app/immutable/chunks/DPREU_UA.js","_app/immutable/chunks/pPTqgpg4.js","_app/immutable/chunks/qArPLUTz.js","_app/immutable/chunks/Dp1pzeXC.js","_app/immutable/chunks/DSlHrGK7.js","_app/immutable/chunks/heuJVR3F.js"];
export const stylesheets = ["_app/immutable/assets/0.-UagWCi4.css"];
export const fonts = [];
