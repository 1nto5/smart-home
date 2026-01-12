export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.BLmAwLpD.js",app:"_app/immutable/entry/app.Ce5eoqmD.js",imports:["_app/immutable/entry/start.BLmAwLpD.js","_app/immutable/chunks/BMqi2BLT.js","_app/immutable/chunks/-TS2BfOP.js","_app/immutable/chunks/CEuPnrTr.js","_app/immutable/chunks/BgD7rIv1.js","_app/immutable/chunks/Bqvi8cHG.js","_app/immutable/chunks/Dp1pzeXC.js","_app/immutable/entry/app.Ce5eoqmD.js","_app/immutable/chunks/Dp1pzeXC.js","_app/immutable/chunks/CEuPnrTr.js","_app/immutable/chunks/DN_vEeGv.js","_app/immutable/chunks/CK2TXMS2.js","_app/immutable/chunks/-AolcYt_.js","_app/immutable/chunks/Bqvi8cHG.js","_app/immutable/chunks/-TS2BfOP.js","_app/immutable/chunks/CAnHEzPj.js","_app/immutable/chunks/CZoHeOXT.js","_app/immutable/chunks/B1Sn1HrY.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
