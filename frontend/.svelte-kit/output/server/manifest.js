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
		client: {start:"_app/immutable/entry/start.CP7Nxhfl.js",app:"_app/immutable/entry/app.BWJgBFyz.js",imports:["_app/immutable/entry/start.CP7Nxhfl.js","_app/immutable/chunks/CgkFBs8D.js","_app/immutable/chunks/-TS2BfOP.js","_app/immutable/chunks/js2fU5d7.js","_app/immutable/chunks/Dhfg4Q9V.js","_app/immutable/chunks/ByN_QlpT.js","_app/immutable/chunks/B5hkrpvM.js","_app/immutable/chunks/Dp1pzeXC.js","_app/immutable/entry/app.BWJgBFyz.js","_app/immutable/chunks/Dp1pzeXC.js","_app/immutable/chunks/js2fU5d7.js","_app/immutable/chunks/1jsiGTgY.js","_app/immutable/chunks/CFFBHRKH.js","_app/immutable/chunks/BBW-ze6J.js","_app/immutable/chunks/ByN_QlpT.js","_app/immutable/chunks/-TS2BfOP.js","_app/immutable/chunks/DykED0dc.js","_app/immutable/chunks/D3_2R_nA.js","_app/immutable/chunks/B-XyxzyO.js","_app/immutable/chunks/D_bOTIDI.js","_app/immutable/chunks/B5hkrpvM.js","_app/immutable/chunks/oDMcWFnN.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js'))
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
				id: "/presets",
				pattern: /^\/presets\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/schedule",
				pattern: /^\/schedule\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
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
