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
		client: {start:"_app/immutable/entry/start.BJya9POv.js",app:"_app/immutable/entry/app.DqQ6Quqj.js",imports:["_app/immutable/entry/start.BJya9POv.js","_app/immutable/chunks/FwCmAPfl.js","_app/immutable/chunks/-TS2BfOP.js","_app/immutable/chunks/CKtoZ9Il.js","_app/immutable/chunks/CzHiguD5.js","_app/immutable/chunks/CUKEFdg2.js","_app/immutable/entry/app.DqQ6Quqj.js","_app/immutable/chunks/CzHiguD5.js","_app/immutable/chunks/CKtoZ9Il.js","_app/immutable/chunks/BdGXCaaf.js","_app/immutable/chunks/CxA4e2Oe.js","_app/immutable/chunks/CgKhIfc2.js","_app/immutable/chunks/-TS2BfOP.js","_app/immutable/chunks/CbCO2Vro.js","_app/immutable/chunks/CTz3f5B3.js","_app/immutable/chunks/ChVwLISL.js","_app/immutable/chunks/B_d42h2W.js","_app/immutable/chunks/CUKEFdg2.js","_app/immutable/chunks/yUrKyb_5.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
