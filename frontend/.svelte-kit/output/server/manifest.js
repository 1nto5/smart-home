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
		client: {start:"_app/immutable/entry/start.shuy7H6j.js",app:"_app/immutable/entry/app.D7pPUskF.js",imports:["_app/immutable/entry/start.shuy7H6j.js","_app/immutable/chunks/BT1uXSIj.js","_app/immutable/chunks/-TS2BfOP.js","_app/immutable/chunks/D-6XIZR8.js","_app/immutable/chunks/BSwr6Mpb.js","_app/immutable/chunks/BSP8ppFM.js","_app/immutable/chunks/Dp1pzeXC.js","_app/immutable/entry/app.D7pPUskF.js","_app/immutable/chunks/Dp1pzeXC.js","_app/immutable/chunks/D-6XIZR8.js","_app/immutable/chunks/CjotZmkh.js","_app/immutable/chunks/CpFjEKQZ.js","_app/immutable/chunks/BtSPheYN.js","_app/immutable/chunks/BSP8ppFM.js","_app/immutable/chunks/-TS2BfOP.js","_app/immutable/chunks/BrodxcLD.js","_app/immutable/chunks/ks5tSOE-.js","_app/immutable/chunks/CFwbL9Lj.js","_app/immutable/chunks/BvlVR2yQ.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
