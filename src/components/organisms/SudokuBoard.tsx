'use client';

import React, { useEffect, useRef } from 'react';
import { generateSudoku } from '@/features/sudoku';

type Props = {
  className?: string;
// Preferred max display size (CSS pixels), default 720, matches existing
  maxSize?: number;
};

function roundHalf(x: number) {
// Align coordinates to 0.5 for crisp 1px lines
  return Math.round(x) + 0.5;
}

const SudokuGrid: React.FC<Props> = ({ className = '', maxSize = 720 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectedRef = useRef<{ row: number; col: number } | null>(null);
// 9x9 array, 0 means empty
  const boardRef = useRef<number[][]>(Array.from({ length: 9 }, () => Array(9).fill(0)));
// Fixed givens mask: true means puzzle fixed value, not editable
  const fixedRef = useRef<boolean[][]>(Array.from({ length: 9 }, () => Array(9).fill(false)));
// Optional: store solution for future validation (not used here)
  const solutionRef = useRef<number[][] | null>(null);
// 9x9 candidates (note mode), each cell holds 1-9
  const candidatesRef = useRef<number[][][]>(
    Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => []))
  );
// Track last input cell position
  const lastInputRef = useRef<{ row: number; col: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = Math.max(window.devicePixelRatio || 1, 1);

    const draw = () => {
const size = Math.min(container.clientWidth, maxSize); // CSS pixel size (square)
      if (size <= 0) return;

// Physical pixels, respect DPR
      canvas.width = Math.floor(size * dpr);
      canvas.height = Math.floor(size * dpr);
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

// Scale the coordinate system to CSS pixels
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

// Background (white)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);

      const cell = size / 9;
// Precompute conflict matrix (also used while drawing numbers)
      let conflicts: boolean[][] = Array.from({ length: 9 }, () => Array(9).fill(false));

// Highlight row/column/block of selection (blue-100), selected cell blue-200
      if (selectedRef.current) {
        const { row, col } = selectedRef.current;
// Row
        ctx.fillStyle = '#e3e8f0'; // tailwind blue-100
        ctx.fillRect(0, row * cell, size, cell);
// Column
        ctx.fillRect(col * cell, 0, cell, size);
// Block (3x3)
        const blockRow = Math.floor(row / 3) * 3;
        const blockCol = Math.floor(col / 3) * 3;
        ctx.fillRect(blockCol * cell, blockRow * cell, cell * 3, cell * 3);

// Same-number highlight (blue-300), over row/column/block
        const selectedVal = boardRef.current[row][col];
        if (selectedVal) {
          ctx.fillStyle = '#deeafd'; // tailwind blue-300
          for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
              if (boardRef.current[r][c] === selectedVal) {
                ctx.fillRect(c * cell, r * cell, cell, cell);
              }
            }
          }
        }

// Selected cell overlay (blue-200)
        ctx.fillStyle = '#bfdbfe'; // tailwind blue-200
        ctx.fillRect(col * cell, row * cell, cell, cell);
      }

      // Conflict highlight: duplicate numbers in row/column/block get red-200 background
      {
// Row conflicts
        for (let r = 0; r < 9; r++) {
          const map = new Map<number, number[]>();
          for (let c = 0; c < 9; c++) {
            const v = boardRef.current[r][c];
            if (!v) continue;
            const arr = map.get(v) || [];
            arr.push(c);
            map.set(v, arr);
          }
          for (const [, cols] of map) {
            if (cols.length > 1) {
              for (const c of cols) conflicts[r][c] = true;
            }
          }
        }
        // Also mark cells that differ from the unique solution as conflicts (same visual style)
        if (solutionRef.current) {
          for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
              const v = boardRef.current[r][c];
              if (!v) continue;
              if (fixedRef.current[r][c]) continue;
              if (solutionRef.current[r][c] !== v) conflicts[r][c] = true;
            }
          }
        }
// Column conflicts
        for (let c = 0; c < 9; c++) {
          const map = new Map<number, number[]>();
          for (let r = 0; r < 9; r++) {
            const v = boardRef.current[r][c];
            if (!v) continue;
            const arr = map.get(v) || [];
            arr.push(r);
            map.set(v, arr);
          }
          for (const [, rows] of map) {
            if (rows.length > 1) {
              for (const r of rows) conflicts[r][c] = true;
            }
          }
        }
// Block conflicts
        for (let br = 0; br < 3; br++) {
          for (let bc = 0; bc < 3; bc++) {
            const map = new Map<number, Array<[number, number]>>();
            for (let r = br * 3; r < br * 3 + 3; r++) {
              for (let c = bc * 3; c < bc * 3 + 3; c++) {
                const v = boardRef.current[r][c];
                if (!v) continue;
                const arr = map.get(v) || [];
                arr.push([r, c]);
                map.set(v, arr);
              }
            }
            for (const [, coords] of map) {
              if (coords.length > 1) {
                for (const [r, c] of coords) conflicts[r][c] = true;
              }
            }
          }
        }
// Draw conflict background: red-200 for conflicts; keep blue for selected cell
        ctx.fillStyle = '#fecaca'; // tailwind red-200
        const sel = selectedRef.current;
        for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
            if (conflicts[r][c]) {
              if (sel && sel.row === r && sel.col === c) {
// Selected cell: keep blue background, do not overwrite with red
              } else {
                ctx.fillRect(c * cell, r * cell, cell, cell);
              }
            }
          }
        }
      }

// 1) Regular grid lines: neutral-400 (draw first, avoid covering bold lines)
// Tailwind neutral-400 ≈ #a3a3a3 (rgb(163,163,163))
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#a3a3a3';
      for (let i = 1; i <= 8; i++) {
if (i % 3 === 0) continue; // Skip 3x3 block borders
        const pos = i * cell;
// Thin horizontal lines
        ctx.beginPath();
        ctx.moveTo(roundHalf(0), roundHalf(pos));
        ctx.lineTo(roundHalf(size), roundHalf(pos));
        ctx.stroke();
// Thin vertical lines
        ctx.beginPath();
        ctx.moveTo(roundHalf(pos), roundHalf(0));
        ctx.lineTo(roundHalf(pos), roundHalf(size));
        ctx.stroke();
      }

// 2) 3x3 block borders: black (inner bold lines)
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#000000';
      for (let i = 1; i <= 2; i++) {
        const pos = i * 3 * cell;
// Horizontal lines
        ctx.beginPath();
        ctx.moveTo(roundHalf(0), roundHalf(pos));
        ctx.lineTo(roundHalf(size), roundHalf(pos));
        ctx.stroke();
// Vertical lines
        ctx.beginPath();
        ctx.moveTo(roundHalf(pos), roundHalf(0));
        ctx.lineTo(roundHalf(pos), roundHalf(size));
        ctx.stroke();
      }

// 3) Outer border: black (draw last, cover all line endpoints)
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(roundHalf(0), roundHalf(0), Math.floor(size) - 1, Math.floor(size) - 1);

      // Draw numbers/candidates (default color blue; last input with conflict uses red-800)
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const bigFont = `${Math.floor(cell * 0.6)}px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif`;
      const smallFont = `${Math.floor(cell * 0.22)}px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif`;
      const last = lastInputRef.current;
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          const v = boardRef.current[r][c];
          if (v) {
            const x = c * cell + cell / 2;
            const y = r * cell + cell / 2;
// Default font color
            let fill = '#223BB2';
            const isFixed = fixedRef.current[r][c];
            // Priority: fixed -> black; last-conflict -> red-800; otherwise blue
            if (isFixed) {
              fill = '#000000';
            } else if (last && last.row === r && last.col === c && conflicts[r][c]) {
              fill = '#991b1b'; // red-800 for conflict on last input (includes wrong vs solution)
            }
            ctx.font = bigFont; // Use big font for digits; avoid being affected by small candidate font
            ctx.fillStyle = fill;
            ctx.fillText(String(v), x, y);
          } else {
// Draw candidates if no digit
            const cand = candidatesRef.current[r][c];
            if (cand && cand.length > 0) {
              const sub = cell / 3;
              ctx.fillStyle = '#223BB2';
ctx.font = smallFont; // Use small font for candidates; does not affect later digits
              for (const n of cand) {
                const rr = Math.floor((n - 1) / 3);
                const cc = (n - 1) % 3;
                const x = c * cell + cc * sub + sub / 2;
                const y = r * cell + rr * sub + sub / 2;
                ctx.fillText(String(n), x, y);
              }
            }
          }
        }
      }
    };

    // Helper: check if board equals the unique solution exactly
    const isSolvedBySolution = (): boolean => {
      if (!solutionRef.current) return false;
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (boardRef.current[r][c] !== solutionRef.current[r][c]) return false;
        }
      }
      return true;
    };

    const maybeAutoPause = () => {
      if (isSolvedBySolution()) {
        // Dispatch paused event; Timer listens and will stop ticking
        window.dispatchEvent(new CustomEvent('sudoku:paused', { detail: { paused: true } }));
      }
    };

    // Compute digits (1-9) that are completely and correctly placed per solution.
    const computeCompleteDigits = () => {
      if (!solutionRef.current) return;
      const completed: number[] = [];
      for (let n = 1; n <= 9; n++) {
        let ok = true;
        for (let r = 0; r < 9 && ok; r++) {
          for (let c = 0; c < 9; c++) {
            const s = solutionRef.current![r][c];
            const b = boardRef.current[r][c];
            if (s === n) {
              if (b !== n) { ok = false; break; }
            } else {
              if (b === n) { ok = false; break; }
            }
          }
        }
        if (ok) completed.push(n);
      }
      window.dispatchEvent(new CustomEvent('sudoku:completeDigits', { detail: { digits: completed } }));
    };

    const loadPuzzle = (d: 'easy' | 'medium' | 'hard') => {
      const { puzzle, solution } = generateSudoku(d);
      // Fill board and fixed mask; clear candidates, selection, last input
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          const v = puzzle[r][c];
          boardRef.current[r][c] = v;
          fixedRef.current[r][c] = v !== 0;
          candidatesRef.current[r][c] = [];
        }
      }
      selectedRef.current = null;
      lastInputRef.current = null;
      solutionRef.current = solution;
      // Resume timer and remove paused overlay if any
      window.dispatchEvent(new CustomEvent('sudoku:paused', { detail: { paused: false } }));
      // Reset timer for a new puzzle
      window.dispatchEvent(new Event('sudoku:resetTimer'));
      // Notify difficulty for UI label
      window.dispatchEvent(new CustomEvent('sudoku:difficulty', { detail: { difficulty: d } }));
      // Update derived UI states
      computeCompleteDigits();
      draw();
    };

    // Initialize puzzle on first mount with random difficulty
    (function initPuzzle() {
      const difficulties = ['easy', 'medium', 'hard'] as const;
      const d = difficulties[Math.floor(Math.random() * difficulties.length)];
      loadPuzzle(d);
    })();

    const ro = new ResizeObserver(() => draw());
    ro.observe(container);
    draw();

    const handleClick = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const col = Math.floor((x / rect.width) * 9);
      const row = Math.floor((y / rect.height) * 9);
      if (row >= 0 && row < 9 && col >= 0 && col < 9) {
        selectedRef.current = { row, col };
        draw();
      }
    };

    canvas.addEventListener('click', handleClick);

// Note mode (candidate input) state
    let noteMode = false;
    const handleKeyDown = (e: KeyboardEvent) => {
      const sel = selectedRef.current;
      const ensureSelection = () => {
        if (!selectedRef.current) selectedRef.current = { row: 0, col: 0 };
      };

// Arrow keys
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        ensureSelection();
        const { row, col } = selectedRef.current!;
        let nr = row, nc = col;
        if (e.key === 'ArrowUp') nr = Math.max(0, row - 1);
        if (e.key === 'ArrowDown') nr = Math.min(8, row + 1);
        if (e.key === 'ArrowLeft') nc = Math.max(0, col - 1);
        if (e.key === 'ArrowRight') nc = Math.min(8, col + 1);
        selectedRef.current = { row: nr, col: nc };
        draw();
        e.preventDefault();
        return;
      }

// Delete key
      if ((e.key === 'Backspace' || e.key === 'Delete') && sel) {
        // Prevent deleting fixed givens
        if (fixedRef.current[sel.row][sel.col]) {
          e.preventDefault();
          return;
        }
        boardRef.current[sel.row][sel.col] = 0;
        candidatesRef.current[sel.row][sel.col] = [];
        draw();
        maybeAutoPause();
        computeCompleteDigits();
        e.preventDefault();
        return;
      }

// Number keys 1-9 (incl. numpad)
      let val: number | null = null;
      if (/^[1-9]$/.test(e.key)) {
        val = parseInt(e.key, 10);
      } else if (/^Numpad[1-9]$/.test(e.code)) {
        val = parseInt(e.code.replace('Numpad', ''), 10);
      }
      if (val && sel) {
// Value input: behavior depends on note mode
        if (noteMode) {
// Only empty cells can record candidates
          if (boardRef.current[sel.row][sel.col] === 0 && !fixedRef.current[sel.row][sel.col]) {
            const arr = candidatesRef.current[sel.row][sel.col];
            const idx = arr.indexOf(val);
            if (idx >= 0) arr.splice(idx, 1);
            else arr.push(val);
// Sort to ensure stable display
            arr.sort((a, b) => a - b);
            draw();
          }
        } else {
// Non-note mode: write value and clear candidate of same number in row/column/block
          const r = sel.row, c = sel.col;
          // Prevent overwriting fixed givens
          if (fixedRef.current[r][c]) {
            e.preventDefault();
            return;
          }
          boardRef.current[r][c] = val;
          candidatesRef.current[r][c] = [];
          lastInputRef.current = { row: r, col: c };

// Row: remove candidate of this value
          for (let cc = 0; cc < 9; cc++) {
            if (cc === c) continue;
            const arr = candidatesRef.current[r][cc];
            const idx = arr.indexOf(val);
            if (idx >= 0) arr.splice(idx, 1);
          }
// Column: remove candidate of this value
          for (let rr = 0; rr < 9; rr++) {
            if (rr === r) continue;
            const arr = candidatesRef.current[rr][c];
            const idx = arr.indexOf(val);
            if (idx >= 0) arr.splice(idx, 1);
          }
// Block: remove candidate of this value
          const br = Math.floor(r / 3) * 3;
          const bc = Math.floor(c / 3) * 3;
          for (let rr = br; rr < br + 3; rr++) {
            for (let cc = bc; cc < bc + 3; cc++) {
              if (rr === r && cc === c) continue;
              const arr = candidatesRef.current[rr][cc];
              const idx = arr.indexOf(val);
              if (idx >= 0) arr.splice(idx, 1);
            }
          }

          // Redraw to update conflict matrix and candidate rendering
          draw();
          maybeAutoPause();
          computeCompleteDigits();
        }
// If input causes conflict, dispatch global event for MistakeCounter
        (function dispatchMistakeIfAny() {
          const r = sel.row, c = sel.col;
          const v = boardRef.current[r][c];
          if (!v) return;
// Row check
          let conflict = false;
          {
            let cnt = 0;
            for (let cc = 0; cc < 9; cc++) if (boardRef.current[r][cc] === v) cnt++;
            if (cnt > 1) conflict = true;
          }
// Column check
          if (!conflict) {
            let cnt = 0;
            for (let rr = 0; rr < 9; rr++) if (boardRef.current[rr][c] === v) cnt++;
            if (cnt > 1) conflict = true;
          }
// Block check
          if (!conflict) {
            const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
            let cnt = 0;
            for (let rr = br; rr < br + 3; rr++) {
              for (let cc = bc; cc < bc + 3; cc++) {
                if (boardRef.current[rr][cc] === v) cnt++;
              }
            }
            if (cnt > 1) conflict = true;
          }
          if (conflict) {
            window.dispatchEvent(new Event('sudoku:mistake'));
          }
        })();
        e.preventDefault();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

// Listen for note mode toggle
    const onNoteMode = (e: Event) => {
      const ce = e as CustomEvent<{ enabled: boolean }>;
      noteMode = !!ce.detail?.enabled;
    };
    window.addEventListener('sudoku:noteMode', onNoteMode as EventListener);

    // Listen for erase event
    const onErase = () => {
      if (!selectedRef.current) return;
      const { row, col } = selectedRef.current;
      // Prevent erasing fixed givens
      if (fixedRef.current[row][col]) return;
      boardRef.current[row][col] = 0;
      candidatesRef.current[row][col] = [];
      draw();
      maybeAutoPause();
      computeCompleteDigits();
    };
    window.addEventListener('sudoku:erase', onErase as EventListener);

    // Listen for new puzzle request with specified difficulty
    const onNewPuzzle = (e: Event) => {
      const ce = e as CustomEvent<{ difficulty: 'easy' | 'medium' | 'hard' }>;
      const d = ce.detail?.difficulty ?? 'easy';
      loadPuzzle(d);
    };
    window.addEventListener('sudoku:newPuzzle', onNewPuzzle as EventListener);

    return () => {
      ro.disconnect();
      canvas?.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('sudoku:noteMode', onNoteMode as EventListener);
      window.removeEventListener('sudoku:erase', onErase as EventListener);
      window.removeEventListener('sudoku:newPuzzle', onNewPuzzle as EventListener);
    };
  }, [maxSize]);

  const [paused, setPaused] = React.useState(false);

  useEffect(() => {
    const onPaused = (e: Event) => {
      const ce = e as CustomEvent<{ paused: boolean }>;
      setPaused(!!ce.detail?.paused);
    };
    window.addEventListener('sudoku:paused', onPaused as EventListener);
    return () => window.removeEventListener('sudoku:paused', onPaused as EventListener);
  }, []);

  return (
    <div className={`w-full ${className}`}>
      <div
        ref={containerRef}
        className="mx-auto relative"
        style={{ aspectRatio: '1 / 1', maxWidth: `min(100%, ${maxSize}px)` }}
      >
        <canvas ref={canvasRef} />
        {paused && (
          <div
            className="absolute inset-0 backdrop-blur-3xl bg-white/50"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
};

export default SudokuGrid;