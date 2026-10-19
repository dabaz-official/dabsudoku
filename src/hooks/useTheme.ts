import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

/**
 * Kept in sync with the inline script in index.html, which applies the theme
 * before first paint so the page never flashes the wrong one.
 */
const STORAGE_KEY = 'dabsudoku.theme.v1';

/** Mirrors `--color-canvas`, the background of the sticky header the browser
 * chrome sits against. */
const THEME_COLORS: Record<Theme, string> = {
	light: '#ffffff',
	dark: '#171717',
};

function systemTheme(): Theme {
	return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** The saved theme, falling back to the system preference. */
export function loadTheme(): Theme {
	try {
		const stored = window.localStorage.getItem(STORAGE_KEY);
		if (stored === 'light' || stored === 'dark') {
			return stored;
		}
	} catch {
		// Storage can be unavailable (private mode, blocked cookies).
	}
	return systemTheme();
}

/**
 * Switches between the light and dark themes.
 *
 * The theme is carried by `data-theme` on <html>, which the tokens in
 * tokens.css key off, so every component follows without knowing about it.
 * The system preference is only consulted for the first visit; after that the
 * user's explicit choice wins.
 */
export function useTheme() {
	const [theme, setTheme] = useState<Theme>(loadTheme);

	useEffect(() => {
		document.documentElement.dataset.theme = theme;
		document
			.querySelector('meta[name="theme-color"]')
			?.setAttribute('content', THEME_COLORS[theme]);
		try {
			window.localStorage.setItem(STORAGE_KEY, theme);
		} catch {
			// Non-fatal: the theme simply resets next visit.
		}
	}, [theme]);

	const toggleTheme = useCallback(() => {
		setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
	}, []);

	return { theme, toggleTheme };
}
