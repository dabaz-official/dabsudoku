'use client';

import React, { useEffect, useState } from 'react';
import { CirclePlay, CirclePause } from 'lucide-react';

type Props = {
  className?: string;
};

const Pause: React.FC<Props> = ({ className = '' }) => {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      // 同步外部状态（如果有其它地方改变暂停状态）
      try {
        const ce = e as CustomEvent<{ paused: boolean }>;
        if (typeof ce.detail?.paused === 'boolean') {
          setPaused(ce.detail.paused);
        }
      } catch {}
    };
    window.addEventListener('sudoku:paused', handler as EventListener);
    return () => window.removeEventListener('sudoku:paused', handler as EventListener);
  }, []);

  const toggle = () => {
    const next = !paused;
    setPaused(next);
    window.dispatchEvent(new CustomEvent('sudoku:paused', { detail: { paused: next } }));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white p-2 text-neutral-900 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-400 ${className}`}
      aria-pressed={paused}
      aria-label={paused ? 'Resume' : 'Pause'}
    >
      {paused ? (
        <CirclePlay className="h-5 w-5" />
      ) : (
        <CirclePause className="h-5 w-5" />
      )}
    </button>
  );
};

export default Pause;