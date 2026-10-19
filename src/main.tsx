import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/tokens.css';
import './styles/global.css';

const container = document.getElementById('root');

if (container === null) {
	throw new Error('Root element #root was not found.');
}

createRoot(container).render(
	<StrictMode>
		<App />
	</StrictMode>,
);

// Offline support and installability. Registered only in the production build,
// so the dev server is never served from a stale cache.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/sw.js').catch(() => {
			// Non-fatal: the game still runs, it just is not installable offline.
		});
	});
}
