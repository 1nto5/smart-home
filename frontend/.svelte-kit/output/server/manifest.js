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
		client: {start:"_app/immutable/entry/start.D0CBiGzb.js",app:"_app/immutable/entry/app.tG76Ogq6.js",imports:["_app/immutable/entry/start.D0CBiGzb.js","_app/immutable/chunks/DPREU_UA.js","_app/immutable/chunks/-TS2BfOP.js","_app/immutable/chunks/NvR4cXbL.js","_app/immutable/chunks/pPTqgpg4.js","_app/immutable/chunks/qArPLUTz.js","_app/immutable/chunks/Dp1pzeXC.js","_app/immutable/entry/app.tG76Ogq6.js","_app/immutable/chunks/Dp1pzeXC.js","_app/immutable/chunks/NvR4cXbL.js","_app/immutable/chunks/zvZFzcKP.js","_app/immutable/chunks/BBmoO9PJ.js","_app/immutable/chunks/kTUlFWdF.js","_app/immutable/chunks/qArPLUTz.js","_app/immutable/chunks/-TS2BfOP.js","_app/immutable/chunks/bWZpNnq_.js","_app/immutable/chunks/Du68J5SX.js","_app/immutable/chunks/Dc3FeliZ.js","_app/immutable/chunks/CmMMdMVi.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
