'use client';

import React, { useEffect, useRef } from 'react';

type Props = {
  className?: string;
  // 期望最大显示尺寸（CSS像素），默认 720，与现有组件一致
  maxSize?: number;
};

function roundHalf(x: number) {
  // 将坐标对齐到 0.5，以在 1px 线宽下获得更清晰的像素对齐
  return Math.round(x) + 0.5;
}

const SudokuGrid: React.FC<Props> = ({ className = '', maxSize = 720 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectedRef = useRef<{ row: number; col: number } | null>(null);
  // 9x9 数组，0 表示空
  const boardRef = useRef<number[][]>(Array.from({ length: 9 }, () => Array(9).fill(0)));
  // 记录最后一次用户输入的格子位置
  const lastInputRef = useRef<{ row: number; col: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = Math.max(window.devicePixelRatio || 1, 1);

    const draw = () => {
      const size = Math.min(container.clientWidth, maxSize); // CSS 像素尺寸（正方形）
      if (size <= 0) return;

      // 物理像素尺寸，考虑 DPR
      canvas.width = Math.floor(size * dpr);
      canvas.height = Math.floor(size * dpr);
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 将坐标系缩放到 CSS 像素维度
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // 背景（白色）
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);

      const cell = size / 9;
      // 预先创建冲突矩阵（在绘制数字时也会使用）
      let conflicts: boolean[][] = Array.from({ length: 9 }, () => Array(9).fill(false));

      // 选中格所在的行/列/宫高亮（blue-100），选中格本身为 blue-200
      if (selectedRef.current) {
        const { row, col } = selectedRef.current;
        // 行
        ctx.fillStyle = '#e3e8f0'; // tailwind blue-100
        ctx.fillRect(0, row * cell, size, cell);
        // 列
        ctx.fillRect(col * cell, 0, cell, size);
        // 宫（3x3）
        const blockRow = Math.floor(row / 3) * 3;
        const blockCol = Math.floor(col / 3) * 3;
        ctx.fillRect(blockCol * cell, blockRow * cell, cell * 3, cell * 3);

        // 同数字高亮（blue-300），覆盖在行/列/宫之上
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

        // 选中格覆盖为更深色（blue-200）
        ctx.fillStyle = '#bfdbfe'; // tailwind blue-200
        ctx.fillRect(col * cell, row * cell, cell, cell);
      }

      // 冲突高亮：任何行/列/宫中出现重复数字的格子以 red-200 背景高亮
      {
        // 行冲突
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
        // 列冲突
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
        // 宫冲突
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
        // 绘制冲突背景：所有冲突格子都为 red-200；若为当前选中格，则保持其蓝色背景
        ctx.fillStyle = '#fecaca'; // tailwind red-200
        const sel = selectedRef.current;
        for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
            if (conflicts[r][c]) {
              if (sel && sel.row === r && sel.col === c) {
                // 当前选中格：保留其蓝色选中背景，不覆盖为红色
              } else {
                ctx.fillRect(c * cell, r * cell, cell, cell);
              }
            }
          }
        }
      }

      // 1) 普通网格线：neutral-400（先绘制，避免覆盖黑色粗线）
      // Tailwind neutral-400 约为 #a3a3a3（rgb(163, 163, 163)）
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#a3a3a3';
      for (let i = 1; i <= 8; i++) {
        if (i % 3 === 0) continue; // 跳过 3x3 宫边线
        const pos = i * cell;
        // 横向细线
        ctx.beginPath();
        ctx.moveTo(roundHalf(0), roundHalf(pos));
        ctx.lineTo(roundHalf(size), roundHalf(pos));
        ctx.stroke();
        // 纵向细线
        ctx.beginPath();
        ctx.moveTo(roundHalf(pos), roundHalf(0));
        ctx.lineTo(roundHalf(pos), roundHalf(size));
        ctx.stroke();
      }

      // 2) 3x3 宫边框：黑色（内部粗线）
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#000000';
      for (let i = 1; i <= 2; i++) {
        const pos = i * 3 * cell;
        // 横向线
        ctx.beginPath();
        ctx.moveTo(roundHalf(0), roundHalf(pos));
        ctx.lineTo(roundHalf(size), roundHalf(pos));
        ctx.stroke();
        // 纵向线
        ctx.beginPath();
        ctx.moveTo(roundHalf(pos), roundHalf(0));
        ctx.lineTo(roundHalf(pos), roundHalf(size));
        ctx.stroke();
      }

      // 3) 外边框：黑色（最后绘制，覆盖所有细线端点）
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(roundHalf(0), roundHalf(0), Math.floor(size) - 1, Math.floor(size) - 1);

      // 绘制数字（默认颜色为蓝色；若为最后输入且存在冲突，则字体为 red-800）
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${Math.floor(cell * 0.6)}px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif`;
      const last = lastInputRef.current;
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          const v = boardRef.current[r][c];
          if (v) {
            const x = c * cell + cell / 2;
            const y = r * cell + cell / 2;
            // 默认字体颜色
            let fill = '#223BB2';
            if (last && last.row === r && last.col === c && conflicts[r][c]) {
              fill = '#991b1b'; // tailwind red-800（最后输入且冲突，直到下次输入前保持）
            }
            ctx.fillStyle = fill;
            ctx.fillText(String(v), x, y);
          }
        }
      }
    };

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

    const handleKeyDown = (e: KeyboardEvent) => {
      const sel = selectedRef.current;
      const ensureSelection = () => {
        if (!selectedRef.current) selectedRef.current = { row: 0, col: 0 };
      };

      // 方向键
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

      // 删除键
      if ((e.key === 'Backspace' || e.key === 'Delete') && sel) {
        boardRef.current[sel.row][sel.col] = 0;
        draw();
        e.preventDefault();
        return;
      }

      // 数字键 1-9（含数字小键盘）
      let val: number | null = null;
      if (/^[1-9]$/.test(e.key)) {
        val = parseInt(e.key, 10);
      } else if (/^Numpad[1-9]$/.test(e.code)) {
        val = parseInt(e.code.replace('Numpad', ''), 10);
      }
      if (val && sel) {
        boardRef.current[sel.row][sel.col] = val;
        lastInputRef.current = { row: sel.row, col: sel.col };
        // 重新绘制以更新冲突矩阵
        draw();
        // 如果当前输入导致冲突，派发一次全局事件供 MistakeCounter 统计
        (function dispatchMistakeIfAny() {
          const r = sel.row, c = sel.col;
          const v = boardRef.current[r][c];
          if (!v) return;
          // 行检查
          let conflict = false;
          {
            let cnt = 0;
            for (let cc = 0; cc < 9; cc++) if (boardRef.current[r][cc] === v) cnt++;
            if (cnt > 1) conflict = true;
          }
          // 列检查
          if (!conflict) {
            let cnt = 0;
            for (let rr = 0; rr < 9; rr++) if (boardRef.current[rr][c] === v) cnt++;
            if (cnt > 1) conflict = true;
          }
          // 宫检查
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

    return () => {
      ro.disconnect();
      canvas?.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
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