import { useEffect, useRef, useState } from 'react';

/**
 * Wall-clock timer. Time is derived from `Date.now()` rather than counted
 * ticks, so a throttled background tab cannot make the clock drift. `resetKey`
 * starts a fresh measurement (a new game).
 */
export function useGameTimer(running: boolean, resetKey: number): number {
	const [seconds, setSeconds] = useState(0);
	const accumulated = useRef(0);

	useEffect(() => {
		accumulated.current = 0;
		setSeconds(0);
	}, [resetKey]);

	useEffect(() => {
		if (!running) {
			return;
		}

		const startedAt = Date.now() - accumulated.current * 1000;
		const update = (): void => {
			setSeconds(Math.floor((Date.now() - startedAt) / 1000));
		};

		update();
		const interval = window.setInterval(update, 250);

		return () => {
			window.clearInterval(interval);
			accumulated.current = (Date.now() - startedAt) / 1000;
		};
	}, [running, resetKey]);

	return seconds;
}
