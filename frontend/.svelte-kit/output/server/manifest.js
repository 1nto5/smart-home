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
		client: {start:"_app/immutable/entry/start.DNa3l9Ir.js",app:"_app/immutable/entry/app.DpsvmsYA.js",imports:["_app/immutable/entry/start.DNa3l9Ir.js","_app/immutable/chunks/CS9KKY-l.js","_app/immutable/chunks/-TS2BfOP.js","_app/immutable/chunks/DKHSd8_d.js","_app/immutable/chunks/SJeoz1Uq.js","_app/immutable/chunks/tlJ6si76.js","_app/immutable/chunks/Dp1pzeXC.js","_app/immutable/entry/app.DpsvmsYA.js","_app/immutable/chunks/Dp1pzeXC.js","_app/immutable/chunks/DKHSd8_d.js","_app/immutable/chunks/C6IfJnDo.js","_app/immutable/chunks/DTZz9ds9.js","_app/immutable/chunks/C06WGzbn.js","_app/immutable/chunks/tlJ6si76.js","_app/immutable/chunks/-TS2BfOP.js","_app/immutable/chunks/YQ5o6Efk.js","_app/immutable/chunks/CPl0XGhf.js","_app/immutable/chunks/D1qDfmfk.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
