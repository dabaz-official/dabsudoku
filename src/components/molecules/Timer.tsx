'use client';

import React, { useEffect, useRef, useState } from 'react';

type Props = {
  className?: string;
};

function pad(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

function formatTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(minutes)}:${pad(seconds)}`;
}

const Timer: React.FC<Props> = ({ className = '' }) => {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const startRef = useRef<number>(Date.now());
  const latestElapsedRef = useRef<number>(0);

  useEffect(() => {
    const tick = () => {
      const seconds = Math.floor((Date.now() - startRef.current) / 1000);
      latestElapsedRef.current = seconds;
      setElapsed(seconds);
    };
    const startTick = () => {
      if (intervalRef.current !== null) return;
      tick();
      intervalRef.current = window.setInterval(tick, 1000);
    };
    const stopTick = () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

// Start timing on mount
    startTick();

    const onPaused = (e: Event) => {
      const ce = e as CustomEvent<{ paused: boolean }>;
      const next = !!ce.detail?.paused;
      if (next) {
// Pause: stop timer, preserve elapsed
        stopTick();
      } else {
// Resume: continue from current elapsed (use ref to avoid stale closure)
        startRef.current = Date.now() - latestElapsedRef.current * 1000;
        startTick();
      }
    };

    window.addEventListener('sudoku:paused', onPaused as EventListener);
    return () => {
      window.removeEventListener('sudoku:paused', onPaused as EventListener);
      stopTick();
    };
  }, []);

  return (
    <div className={`text-left ${className} w-8`}>
      <div className="text-sm font-medium text-neutral-600">Time</div>
      <div className="text-md font-bold text-neutral-900">{formatTime(elapsed)}</div>
    </div>
  );
};

export default Timer;