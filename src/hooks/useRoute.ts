import { useEffect, useState } from 'react';

export type Route = 'game' | 'how-to-play';

export const ROUTE_HASH: Record<Route, string> = {
	game: '#/',
	'how-to-play': '#/how-to-play',
};

function readRoute(): Route {
	return window.location.hash === ROUTE_HASH['how-to-play'] ? 'how-to-play' : 'game';
}

export function useRoute(): Route {
	const [route, setRoute] = useState<Route>(readRoute);

	useEffect(() => {
		const handleChange = (): void => setRoute(readRoute());
		window.addEventListener('hashchange', handleChange);
		return () => window.removeEventListener('hashchange', handleChange);
	}, []);

	return route;
}

export function navigate(route: Route): void {
	if (window.location.hash === ROUTE_HASH[route]) {
		return;
	}
	window.location.hash = ROUTE_HASH[route];
}
