export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png","icon-180.png","icon-192.png","icon-512.png","icon-maskable-512.png","icon-maskable.svg","icon.svg","manifest.json","splash-1170x2532.png","splash-1179x2556.png","splash-1284x2778.png","splash-1290x2796.png"]),
	mimeTypes: {".png":"image/png",".svg":"image/svg+xml",".json":"application/json"},
	_: {
		client: {start:"_app/immutable/entry/start.B0CMymkW.js",app:"_app/immutable/entry/app.Bjb-DvYB.js",imports:["_app/immutable/entry/start.B0CMymkW.js","_app/immutable/chunks/D3MBBfOV.js","_app/immutable/chunks/-TS2BfOP.js","_app/immutable/chunks/CEuPnrTr.js","_app/immutable/chunks/BgD7rIv1.js","_app/immutable/chunks/Bqvi8cHG.js","_app/immutable/chunks/Dp1pzeXC.js","_app/immutable/entry/app.Bjb-DvYB.js","_app/immutable/chunks/Dp1pzeXC.js","_app/immutable/chunks/CEuPnrTr.js","_app/immutable/chunks/DN_vEeGv.js","_app/immutable/chunks/CK2TXMS2.js","_app/immutable/chunks/-AolcYt_.js","_app/immutable/chunks/Bqvi8cHG.js","_app/immutable/chunks/-TS2BfOP.js","_app/immutable/chunks/CAnHEzPj.js","_app/immutable/chunks/CZoHeOXT.js","_app/immutable/chunks/B1Sn1HrY.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/heater-schedule",
				pattern: /^\/heater-schedule\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/lighting",
				pattern: /^\/lighting\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
