
import root from '../root.js';
import { set_building, set_prerendering } from '__sveltekit/environment';
import { set_assets } from '$app/paths/internal/server';
import { set_manifest, set_read_implementation } from '__sveltekit/server';
import { set_private_env, set_public_env } from '../../../node_modules/@sveltejs/kit/src/runtime/shared-server.js';

export const options = {
	app_template_contains_nonce: false,
	async: false,
	csp: {"mode":"auto","directives":{"upgrade-insecure-requests":false,"block-all-mixed-content":false},"reportOnly":{"upgrade-insecure-requests":false,"block-all-mixed-content":false}},
	csrf_check_origin: true,
	csrf_trusted_origins: [],
	embedded: false,
	env_public_prefix: 'PUBLIC_',
	env_private_prefix: '',
	hash_routing: false,
	hooks: null, // added lazily, via `get_hooks`
	preload_strategy: "modulepreload",
	root,
	service_worker: false,
	service_worker_options: undefined,
	templates: {
		app: ({ head, body, assets, nonce, env }) => "<!DOCTYPE html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"utf-8\" />\n    <link rel=\"icon\" href=\"" + assets + "/favicon.png\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, viewport-fit=cover\" />\n\n    <!-- PWA -->\n    <link rel=\"manifest\" href=\"/manifest.json\" />\n    <meta name=\"apple-mobile-web-app-capable\" content=\"yes\" />\n    <meta name=\"apple-mobile-web-app-status-bar-style\" content=\"black-translucent\" />\n    <meta name=\"apple-mobile-web-app-title\" content=\"Smart Home\" />\n    <link rel=\"apple-touch-icon\" href=\"/icon-180.png\" />\n    <meta name=\"theme-color\" content=\"#0a0a0b\" media=\"(prefers-color-scheme: dark)\" />\n    <meta name=\"theme-color\" content=\"#fafafa\" media=\"(prefers-color-scheme: light)\" />\n\n    <!-- iOS Splash Screens -->\n    <link rel=\"apple-touch-startup-image\" href=\"/splash-1170x2532.png\"\n          media=\"(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)\">\n    <link rel=\"apple-touch-startup-image\" href=\"/splash-1179x2556.png\"\n          media=\"(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)\">\n    <link rel=\"apple-touch-startup-image\" href=\"/splash-1284x2778.png\"\n          media=\"(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)\">\n    <link rel=\"apple-touch-startup-image\" href=\"/splash-1290x2796.png\"\n          media=\"(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)\">\n\n    <style>\n      /* Prevent flash of unstyled content - hide SvelteKit body until app ready */\n      html { background: #0a0a0f; }\n      html.light { background: #f8fafc; }\n      #svelte-app { visibility: hidden; }\n      html.app-ready #svelte-app { visibility: visible; }\n      html.app-ready #initial-loader { display: none; }\n\n      /* Initial loader styles */\n      #initial-loader {\n        position: fixed;\n        inset: 0;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        z-index: 9999;\n      }\n      .loader-box {\n        width: 48px;\n        height: 48px;\n        border-radius: 12px;\n        background: rgba(234, 179, 8, 0.1);\n        border: 1px solid rgba(234, 179, 8, 0.3);\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        animation: pulse 2s ease-in-out infinite;\n      }\n      html.light .loader-box {\n        background: rgba(234, 179, 8, 0.15);\n        border-color: rgba(234, 179, 8, 0.4);\n      }\n      .loader-icon {\n        width: 24px;\n        height: 24px;\n        color: #eab308;\n      }\n      @keyframes pulse {\n        0%, 100% { opacity: 1; }\n        50% { opacity: 0.5; }\n      }\n    </style>\n    <script>\n      // Apply theme immediately to prevent flash\n      (function() {\n        const mode = localStorage.getItem('theme-mode');\n        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;\n        if (mode === 'light' || (mode !== 'dark' && !prefersDark)) {\n          document.documentElement.classList.add('light');\n        }\n      })();\n    </script>\n    " + head + "\n  </head>\n  <body data-sveltekit-preload-data=\"hover\">\n    <!-- Initial loader shown before Svelte hydrates -->\n    <div id=\"initial-loader\">\n      <div class=\"loader-box\">\n        <svg class=\"loader-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n          <polygon points=\"13 2 3 14 12 14 11 22 21 10 12 10 13 2\"></polygon>\n        </svg>\n      </div>\n    </div>\n    <div id=\"svelte-app\" style=\"display: contents\">" + body + "</div>\n  </body>\n</html>\n",
		error: ({ status, message }) => "<!doctype html>\n<html lang=\"en\">\n\t<head>\n\t\t<meta charset=\"utf-8\" />\n\t\t<title>" + message + "</title>\n\n\t\t<style>\n\t\t\tbody {\n\t\t\t\t--bg: white;\n\t\t\t\t--fg: #222;\n\t\t\t\t--divider: #ccc;\n\t\t\t\tbackground: var(--bg);\n\t\t\t\tcolor: var(--fg);\n\t\t\t\tfont-family:\n\t\t\t\t\tsystem-ui,\n\t\t\t\t\t-apple-system,\n\t\t\t\t\tBlinkMacSystemFont,\n\t\t\t\t\t'Segoe UI',\n\t\t\t\t\tRoboto,\n\t\t\t\t\tOxygen,\n\t\t\t\t\tUbuntu,\n\t\t\t\t\tCantarell,\n\t\t\t\t\t'Open Sans',\n\t\t\t\t\t'Helvetica Neue',\n\t\t\t\t\tsans-serif;\n\t\t\t\tdisplay: flex;\n\t\t\t\talign-items: center;\n\t\t\t\tjustify-content: center;\n\t\t\t\theight: 100vh;\n\t\t\t\tmargin: 0;\n\t\t\t}\n\n\t\t\t.error {\n\t\t\t\tdisplay: flex;\n\t\t\t\talign-items: center;\n\t\t\t\tmax-width: 32rem;\n\t\t\t\tmargin: 0 1rem;\n\t\t\t}\n\n\t\t\t.status {\n\t\t\t\tfont-weight: 200;\n\t\t\t\tfont-size: 3rem;\n\t\t\t\tline-height: 1;\n\t\t\t\tposition: relative;\n\t\t\t\ttop: -0.05rem;\n\t\t\t}\n\n\t\t\t.message {\n\t\t\t\tborder-left: 1px solid var(--divider);\n\t\t\t\tpadding: 0 0 0 1rem;\n\t\t\t\tmargin: 0 0 0 1rem;\n\t\t\t\tmin-height: 2.5rem;\n\t\t\t\tdisplay: flex;\n\t\t\t\talign-items: center;\n\t\t\t}\n\n\t\t\t.message h1 {\n\t\t\t\tfont-weight: 400;\n\t\t\t\tfont-size: 1em;\n\t\t\t\tmargin: 0;\n\t\t\t}\n\n\t\t\t@media (prefers-color-scheme: dark) {\n\t\t\t\tbody {\n\t\t\t\t\t--bg: #222;\n\t\t\t\t\t--fg: #ddd;\n\t\t\t\t\t--divider: #666;\n\t\t\t\t}\n\t\t\t}\n\t\t</style>\n\t</head>\n\t<body>\n\t\t<div class=\"error\">\n\t\t\t<span class=\"status\">" + status + "</span>\n\t\t\t<div class=\"message\">\n\t\t\t\t<h1>" + message + "</h1>\n\t\t\t</div>\n\t\t</div>\n\t</body>\n</html>\n"
	},
	version_hash: "17sh2gt"
};

export async function get_hooks() {
	let handle;
	let handleFetch;
	let handleError;
	let handleValidationError;
	let init;
	

	let reroute;
	let transport;
	

	return {
		handle,
		handleFetch,
		handleError,
		handleValidationError,
		init,
		reroute,
		transport
	};
}

export { set_assets, set_building, set_manifest, set_prerendering, set_private_env, set_public_env, set_read_implementation };
