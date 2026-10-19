/*
 * DabSudoku service worker.
 *
 * The app is a hash-routed SPA with a single HTML entry, so there is nothing
 * worth precaching beyond the shell: navigations are network-first and fall
 * back to the cached shell when offline, and everything else the page loads
 * (Vite's hashed bundles, the fonts) is cached as it is used.
 *
 * Bump CACHE_VERSION to publish a new shell; the old caches are dropped on the
 * next activate.
 */
const CACHE_VERSION = 'v1';
const SHELL_CACHE = `dabsudoku-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `dabsudoku-runtime-${CACHE_VERSION}`;
const CURRENT_CACHES = new Set([SHELL_CACHE, RUNTIME_CACHE]);

/** Enough of the app to boot and render the board offline. */
const SHELL_URLS = [
	'/',
	'/index.html',
	'/manifest.webmanifest',
	'/favicon.png',
	'/header-logo.png',
	'/pwa-icon-192.png',
	'/pwa-icon-512.png',
];

/** Cross-origin hosts whose responses are worth keeping for offline play. */
const FONT_HOSTS = new Set(['fonts.googleapis.com', 'fonts.gstatic.com']);

self.addEventListener('install', (event) => {
	event.waitUntil(
		(async () => {
			const cache = await caches.open(SHELL_CACHE);
			// Individually, so one missing file cannot fail the whole install.
			await Promise.all(
				SHELL_URLS.map((url) => cache.add(url).catch(() => undefined)),
			);
			await self.skipWaiting();
		})(),
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			const keys = await caches.keys();
			await Promise.all(
				keys.filter((key) => !CURRENT_CACHES.has(key)).map((key) => caches.delete(key)),
			);
			await self.clients.claim();
		})(),
	);
});

self.addEventListener('fetch', (event) => {
	const { request } = event;
	if (request.method !== 'GET') {
		return;
	}

	if (request.mode === 'navigate') {
		event.respondWith(navigationResponse(request));
		return;
	}

	const url = new URL(request.url);
	if (url.origin === self.location.origin || FONT_HOSTS.has(url.hostname)) {
		event.respondWith(staleWhileRevalidate(request));
	}
});

/** Fresh HTML when the network is there, the cached shell when it is not. */
async function navigationResponse(request) {
	try {
		const response = await fetch(request);
		if (response.ok) {
			const cache = await caches.open(SHELL_CACHE);
			await cache.put('/index.html', response.clone());
		}
		return response;
	} catch {
		const cache = await caches.open(SHELL_CACHE);
		const cached = (await cache.match('/index.html')) ?? (await cache.match('/'));
		return cached ?? Response.error();
	}
}

/**
 * Serve the cached copy immediately and refresh it in the background, so a
 * repeat visit paints from disk and a new build is picked up on the next one.
 */
async function staleWhileRevalidate(request) {
	const cache = await caches.open(RUNTIME_CACHE);
	const cached = await cache.match(request);

	const revalidated = fetch(request)
		.then(async (response) => {
			// Opaque responses (the cross-origin fonts) are stored as-is.
			if (response.ok || response.type === 'opaque') {
				await cache.put(request, response.clone());
			}
			return response;
		})
		.catch(() => undefined);

	return cached ?? (await revalidated) ?? Response.error();
}
