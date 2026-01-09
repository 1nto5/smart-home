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
		client: {start:"_app/immutable/entry/start.CFGschdL.js",app:"_app/immutable/entry/app.CILbwN6B.js",imports:["_app/immutable/entry/start.CFGschdL.js","_app/immutable/chunks/BA2B7deI.js","_app/immutable/chunks/-TS2BfOP.js","_app/immutable/chunks/DSyWC8IU.js","_app/immutable/chunks/BZczM5D-.js","_app/immutable/chunks/D_fblim4.js","_app/immutable/chunks/Dl92ZAIs.js","_app/immutable/chunks/Dp1pzeXC.js","_app/immutable/entry/app.CILbwN6B.js","_app/immutable/chunks/Dp1pzeXC.js","_app/immutable/chunks/DSyWC8IU.js","_app/immutable/chunks/DZ0_ip0j.js","_app/immutable/chunks/CXwYO5u8.js","_app/immutable/chunks/BXR5lUZa.js","_app/immutable/chunks/D_fblim4.js","_app/immutable/chunks/-TS2BfOP.js","_app/immutable/chunks/vIkUB9pr.js","_app/immutable/chunks/byg3CW2Z.js","_app/immutable/chunks/Dl92ZAIs.js","_app/immutable/chunks/BNDA24ZJ.js","_app/immutable/chunks/Dvu50Twt.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
