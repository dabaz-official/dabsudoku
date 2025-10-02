'use client';

import React from 'react';

type Props = {
  className?: string;
};

const NumericButtons: React.FC<Props> = ({ className = '' }) => {
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
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => handleClick(n)}
          aria-label={`Input ${n}`}
          className="border-none bg-transparent px-3 py-2 text-lg font-semibold text-neutral-900 hover:bg-neutral-100 rounded-md focus:outline-none focus:ring-0"
        >
          {n}
        </button>
      ))}
    </div>
  );
};

export default NumericButtons;