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
		client: {start:"_app/immutable/entry/start.C6mEqoDV.js",app:"_app/immutable/entry/app.B6WXY2AU.js",imports:["_app/immutable/entry/start.C6mEqoDV.js","_app/immutable/chunks/BEpBIeFa.js","_app/immutable/chunks/-TS2BfOP.js","_app/immutable/chunks/CxzkeP2L.js","_app/immutable/chunks/Cc_vj6Fx.js","_app/immutable/chunks/BLKChfIF.js","_app/immutable/chunks/Dp1pzeXC.js","_app/immutable/entry/app.B6WXY2AU.js","_app/immutable/chunks/Dp1pzeXC.js","_app/immutable/chunks/CxzkeP2L.js","_app/immutable/chunks/KsRpIQI_.js","_app/immutable/chunks/CxA4e2Oe.js","_app/immutable/chunks/_OUmbySw.js","_app/immutable/chunks/BLKChfIF.js","_app/immutable/chunks/-TS2BfOP.js","_app/immutable/chunks/JY_fI8Mb.js","_app/immutable/chunks/CEFYxjNz.js","_app/immutable/chunks/FSvs7gAD.js","_app/immutable/chunks/DY9VI_77.js","_app/immutable/chunks/BwEXeUC-.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
				id: "/presets",
				pattern: /^\/presets\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/schedule",
				pattern: /^\/schedule\/?$/,
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
