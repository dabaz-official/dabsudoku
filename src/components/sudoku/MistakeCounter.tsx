'use client';

import React, { useEffect, useState } from 'react';

type Props = {
  className?: string;
};

const MistakeCounter: React.FC<Props> = ({ className = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const onMistake = () => setCount((c) => c + 1);
    window.addEventListener('sudoku:mistake', onMistake as EventListener);
    return () => {
      window.removeEventListener('sudoku:mistake', onMistake as EventListener);
    };
  }, []);

  return (
    <div className={`text-right ${className}`}>
      <div className="text-sm font-medium text-neutral-600">Mistakes</div>
      <div className="text-md font-bold text-neutral-900">{count}</div>
    </div>
  );
};

export default MistakeCounter;