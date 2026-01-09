

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.C7WelMQ1.js","_app/immutable/chunks/Dlj6haWL.js","_app/immutable/chunks/D2JNcFbJ.js","_app/immutable/chunks/mhC6JEJ7.js","_app/immutable/chunks/CjV97wi5.js","_app/immutable/chunks/BwITrpGR.js","_app/immutable/chunks/D0VUfHch.js","_app/immutable/chunks/CxA4e2Oe.js","_app/immutable/chunks/Dh9yLgg6.js","_app/immutable/chunks/BkCIzrVu.js","_app/immutable/chunks/BWKFy5ZE.js","_app/immutable/chunks/-TS2BfOP.js","_app/immutable/chunks/DYeyR9bb.js","_app/immutable/chunks/CEt9MgGk.js","_app/immutable/chunks/DXg-5gAH.js","_app/immutable/chunks/Dp1pzeXC.js"];
export const stylesheets = ["_app/immutable/assets/0.DrXtYCxH.css"];
export const fonts = [];
