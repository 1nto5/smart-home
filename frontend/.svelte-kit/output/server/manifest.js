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
		client: {start:"_app/immutable/entry/start.ClOJ2PqQ.js",app:"_app/immutable/entry/app.wW9k-yPV.js",imports:["_app/immutable/entry/start.ClOJ2PqQ.js","_app/immutable/chunks/BsI0eHaE.js","_app/immutable/chunks/-TS2BfOP.js","_app/immutable/chunks/DAortCmQ.js","_app/immutable/chunks/Br8doLew.js","_app/immutable/chunks/Z4NcMU7K.js","_app/immutable/chunks/CC69UYZT.js","_app/immutable/chunks/Dp1pzeXC.js","_app/immutable/entry/app.wW9k-yPV.js","_app/immutable/chunks/Dp1pzeXC.js","_app/immutable/chunks/DAortCmQ.js","_app/immutable/chunks/B_G7EnjR.js","_app/immutable/chunks/BH17u12g.js","_app/immutable/chunks/CP999QD0.js","_app/immutable/chunks/Z4NcMU7K.js","_app/immutable/chunks/-TS2BfOP.js","_app/immutable/chunks/DAdKMhpF.js","_app/immutable/chunks/7-8rnMVl.js","_app/immutable/chunks/CvOIg5GG.js","_app/immutable/chunks/BhN2kyAR.js","_app/immutable/chunks/CC69UYZT.js","_app/immutable/chunks/CkGPgyzJ.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
