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
		client: {start:"_app/immutable/entry/start.C3rHrxqr.js",app:"_app/immutable/entry/app.L9j7ijd6.js",imports:["_app/immutable/entry/start.C3rHrxqr.js","_app/immutable/chunks/BDdixYRA.js","_app/immutable/chunks/-TS2BfOP.js","_app/immutable/chunks/B2drfW2D.js","_app/immutable/chunks/li-whztj.js","_app/immutable/chunks/Ck1TcYO7.js","_app/immutable/chunks/Dp1pzeXC.js","_app/immutable/entry/app.L9j7ijd6.js","_app/immutable/chunks/Dp1pzeXC.js","_app/immutable/chunks/B2drfW2D.js","_app/immutable/chunks/CEDFY9N9.js","_app/immutable/chunks/o9TOya3S.js","_app/immutable/chunks/DlUEK9fe.js","_app/immutable/chunks/Ck1TcYO7.js","_app/immutable/chunks/-TS2BfOP.js","_app/immutable/chunks/Bro-wCEF.js","_app/immutable/chunks/DIqNBuPr.js","_app/immutable/chunks/YQ8C_3nV.js","_app/immutable/chunks/Diics1BE.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
