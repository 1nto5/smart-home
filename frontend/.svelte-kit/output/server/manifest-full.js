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
		client: {start:"_app/immutable/entry/start.CrY7vNTk.js",app:"_app/immutable/entry/app.Cu5Z0A4o.js",imports:["_app/immutable/entry/start.CrY7vNTk.js","_app/immutable/chunks/CEt9MgGk.js","_app/immutable/chunks/-TS2BfOP.js","_app/immutable/chunks/D2JNcFbJ.js","_app/immutable/chunks/DXg-5gAH.js","_app/immutable/chunks/BkCIzrVu.js","_app/immutable/chunks/Dp1pzeXC.js","_app/immutable/entry/app.Cu5Z0A4o.js","_app/immutable/chunks/Dp1pzeXC.js","_app/immutable/chunks/D2JNcFbJ.js","_app/immutable/chunks/Dlj6haWL.js","_app/immutable/chunks/CxA4e2Oe.js","_app/immutable/chunks/DYeyR9bb.js","_app/immutable/chunks/BkCIzrVu.js","_app/immutable/chunks/-TS2BfOP.js","_app/immutable/chunks/KdfE8kWJ.js","_app/immutable/chunks/BwITrpGR.js","_app/immutable/chunks/JyOeKW3E.js","_app/immutable/chunks/Dh9yLgg6.js","_app/immutable/chunks/BWKFy5ZE.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
