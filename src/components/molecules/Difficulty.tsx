'use client';

import React, { useEffect, useState } from 'react';

type Props = {
  className?: string;
};

const labelMap: Record<string, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

const Difficulty: React.FC<Props> = ({ className = '' }) => {
  const [difficulty, setDifficulty] = useState<string>('');

  useEffect(() => {
    const onDiff = (e: Event) => {
      try {
        const ce = e as CustomEvent<{ difficulty: 'easy' | 'medium' | 'hard' }>;
        if (ce.detail?.difficulty) {
          setDifficulty(ce.detail.difficulty);
        }
      } catch {}
    };
    window.addEventListener('sudoku:difficulty', onDiff as EventListener);
    return () => window.removeEventListener('sudoku:difficulty', onDiff as EventListener);
  }, []);

  const label = difficulty ? labelMap[difficulty] ?? difficulty : '';

  return (
    <div className={`text-left ${className} w-16`}>
      <div className="text-sm font-medium text-neutral-600">Difficulty</div>
      <div className="text-md font-bold text-neutral-900">{label || '-'}</div>
    </div>
  );
};

export default Difficulty;