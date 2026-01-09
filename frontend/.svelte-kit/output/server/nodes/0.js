

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.DKh_MQJ9.js","_app/immutable/chunks/1jsiGTgY.js","_app/immutable/chunks/js2fU5d7.js","_app/immutable/chunks/Ba70ElLJ.js","_app/immutable/chunks/CFFBHRKH.js","_app/immutable/chunks/ucg4ymqI.js","_app/immutable/chunks/MGp4GRcg.js","_app/immutable/chunks/CeF91h_T.js","_app/immutable/chunks/D_bOTIDI.js","_app/immutable/chunks/B5hkrpvM.js","_app/immutable/chunks/D3_2R_nA.js","_app/immutable/chunks/oDMcWFnN.js","_app/immutable/chunks/-TS2BfOP.js","_app/immutable/chunks/BBW-ze6J.js","_app/immutable/chunks/CgkFBs8D.js","_app/immutable/chunks/Dhfg4Q9V.js","_app/immutable/chunks/ByN_QlpT.js","_app/immutable/chunks/Dp1pzeXC.js","_app/immutable/chunks/CoAw0ab-.js"];
export const stylesheets = ["_app/immutable/assets/0.DoXIbPVm.css"];
export const fonts = [];
