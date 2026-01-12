

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.B7Fb5ZxV.js","_app/immutable/chunks/C6IfJnDo.js","_app/immutable/chunks/DKHSd8_d.js","_app/immutable/chunks/DTZz9ds9.js","_app/immutable/chunks/Dw9FfEim.js","_app/immutable/chunks/BFRcN8qg.js","_app/immutable/chunks/DS9RkjwY.js","_app/immutable/chunks/YQ5o6Efk.js","_app/immutable/chunks/D1qDfmfk.js","_app/immutable/chunks/-TS2BfOP.js","_app/immutable/chunks/C06WGzbn.js","_app/immutable/chunks/Br7FkIj4.js","_app/immutable/chunks/SJeoz1Uq.js","_app/immutable/chunks/tlJ6si76.js","_app/immutable/chunks/Dp1pzeXC.js","_app/immutable/chunks/Cv_DhP46.js","_app/immutable/chunks/3mf9VtbY.js"];
export const stylesheets = ["_app/immutable/assets/0.kX3_ghZl.css"];
export const fonts = [];
