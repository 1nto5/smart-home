import { browser } from '$app/environment';

export type ThemeMode = 'system' | 'light' | 'dark';

function createThemeStore() {
	let mode = $state<ThemeMode>('system');
	let resolvedTheme = $state<'light' | 'dark'>('light');

	function init() {
		if (!browser) return;

		// Load saved preference
		const saved = localStorage.getItem('theme-mode') as ThemeMode | null;
		if (saved && ['system', 'light', 'dark'].includes(saved)) {
			mode = saved;
		}

		// Apply initial theme
		applyTheme();

		// Listen for system preference changes
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		mediaQuery.addEventListener('change', () => {
			if (mode === 'system') {
				applyTheme();
			}
		});
	}

	function setMode(newMode: ThemeMode) {
		mode = newMode;
		if (browser) {
			if (newMode === 'system') {
				localStorage.removeItem('theme-mode');
			} else {
				localStorage.setItem('theme-mode', newMode);
			}
			applyTheme();
		}
	}

	function applyTheme() {
		if (!browser) return;

		const isDark =
			mode === 'dark' ||
			(mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

		resolvedTheme = isDark ? 'dark' : 'light';

		// Remove both classes first
		document.documentElement.classList.remove('light', 'dark');

		// Add the appropriate class
		if (mode !== 'system') {
			document.documentElement.classList.add(mode);
		} else if (isDark) {
			// For system mode, we need to add dark class to trigger CSS variables
			document.documentElement.classList.add('dark');
		}
	}

	function toggle() {
		const modes: ThemeMode[] = ['system', 'light', 'dark'];
		const currentIndex = modes.indexOf(mode);
		const nextIndex = (currentIndex + 1) % modes.length;
		setMode(modes[nextIndex]);
	}

	return {
		get mode() {
			return mode;
		},
		get resolvedTheme() {
			return resolvedTheme;
		},
		get isDark() {
			return resolvedTheme === 'dark';
		},
		init,
		setMode,
		toggle
	};
}

export const theme = createThemeStore();
