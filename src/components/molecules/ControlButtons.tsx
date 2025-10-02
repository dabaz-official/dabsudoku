'use client';

import React, { useState, useEffect } from 'react';
import { Eraser, Pencil } from 'lucide-react';

type Props = {
  className?: string;
};

const ControlButtons: React.FC<Props> = ({ className = '' }) => {
  const [notes, setNotes] = useState(false);

  useEffect(() => {
    const sync = (e: Event) => {
      try {
        const ce = e as CustomEvent<{ enabled: boolean }>;
        if (typeof ce.detail?.enabled === 'boolean') {
          setNotes(ce.detail.enabled);
        }
      } catch {}
    };
    window.addEventListener('sudoku:noteMode', sync as EventListener);
    return () => window.removeEventListener('sudoku:noteMode', sync as EventListener);
  }, []);

  const toggleNotes = () => {
    const next = !notes;
    setNotes(next);
    window.dispatchEvent(new CustomEvent('sudoku:noteMode', { detail: { enabled: next } }));
  };

  const erase = () => {
    window.dispatchEvent(new Event('sudoku:erase'));
  };

  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      <button
        type="button"
        onClick={erase}
        aria-label="Erase cell"
        className="inline-flex items-center p-1 text-neutral-900 hover:text-neutral-700 focus:outline-none"
      >
        <Eraser className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={toggleNotes}
        aria-label="Toggle notes"
        aria-pressed={notes}
        className="inline-flex items-center p-1 text-neutral-900 hover:text-neutral-700 focus:outline-none"
      >
        <Pencil className="h-5 w-5" />
      </button>
    </div>
  );
};

export default ControlButtons;