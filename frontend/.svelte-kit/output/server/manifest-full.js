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
		client: {start:"_app/immutable/entry/start.BqZNmdqK.js",app:"_app/immutable/entry/app.DuBUBx_e.js",imports:["_app/immutable/entry/start.BqZNmdqK.js","_app/immutable/chunks/Ccl9NSUH.js","_app/immutable/chunks/-TS2BfOP.js","_app/immutable/chunks/CeX5bisY.js","_app/immutable/chunks/SLPJEgCe.js","_app/immutable/chunks/Cp3xCf78.js","_app/immutable/entry/app.DuBUBx_e.js","_app/immutable/chunks/SLPJEgCe.js","_app/immutable/chunks/CeX5bisY.js","_app/immutable/chunks/BpQGbxjQ.js","_app/immutable/chunks/CxA4e2Oe.js","_app/immutable/chunks/msA1evzn.js","_app/immutable/chunks/-TS2BfOP.js","_app/immutable/chunks/J5d8E7TX.js","_app/immutable/chunks/LV0sw-9a.js","_app/immutable/chunks/DdI1FX7l.js","_app/immutable/chunks/UTtrt9yp.js","_app/immutable/chunks/Cp3xCf78.js","_app/immutable/chunks/Cvyj8RLr.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
