

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.NUU8lB1D.js","_app/immutable/chunks/C6IfJnDo.js","_app/immutable/chunks/DKHSd8_d.js","_app/immutable/chunks/DTZz9ds9.js","_app/immutable/chunks/nRrXvAMk.js","_app/immutable/chunks/BFRcN8qg.js","_app/immutable/chunks/Cfp2di-K.js","_app/immutable/chunks/YQ5o6Efk.js","_app/immutable/chunks/D1qDfmfk.js","_app/immutable/chunks/-TS2BfOP.js","_app/immutable/chunks/C06WGzbn.js","_app/immutable/chunks/DGBsgk9i.js","_app/immutable/chunks/SJeoz1Uq.js","_app/immutable/chunks/tlJ6si76.js","_app/immutable/chunks/Dp1pzeXC.js","_app/immutable/chunks/B8XO69PC.js","_app/immutable/chunks/BYJj_oVh.js"];
export const stylesheets = ["_app/immutable/assets/0.BwF54SMz.css"];
export const fonts = [];
