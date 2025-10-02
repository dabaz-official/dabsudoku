'use client';

import React, { useEffect, useState } from 'react';

type Props = {
  className?: string;
};

const NumericButtons: React.FC<Props> = ({ className = '' }) => {
  const [hidden, setHidden] = useState<Set<number>>(new Set());

  useEffect(() => {
    const onCompleteDigits = (e: Event) => {
      try {
        const ce = e as CustomEvent<{ digits: number[] }>;
        const digits = ce.detail?.digits ?? [];
        setHidden(new Set(digits));
      } catch {}
    };
    window.addEventListener('sudoku:completeDigits', onCompleteDigits as EventListener);
    return () => window.removeEventListener('sudoku:completeDigits', onCompleteDigits as EventListener);
  }, []);
  const handleClick = (n: number) => {
// Dispatch keyboard events so SudokuBoard captures input (it listens to window keydown)
    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: String(n),
        code: `Digit${n}`,
      })
    );
  };

  return (
    <div className={`flex items-center gap-2 justify-between select-none ${className}`}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
        const isHidden = hidden.has(n);
        return (
          <button
            key={n}
            type="button"
            onClick={() => handleClick(n)}
            aria-label={`Input ${n}`}
            disabled={isHidden}
            className={`border-none bg-transparent px-3 py-2 text-lg font-semibold rounded-md focus:outline-none focus:ring-0 ${
              isHidden ? 'opacity-0 pointer-events-none' : 'text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
};

export default NumericButtons;