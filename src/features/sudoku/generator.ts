export type Difficulty = 'easy' | 'medium' | 'hard';

export type Board = number[][]; // 9x9, 0 means empty

// Bitmask helpers: use bits 1..9 to track used digits in row/col/box
type Masks = {
  row: number[];
  col: number[];
  box: number[];
};

const ALL_DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function cloneBoard(b: Board): Board {
  return b.map((row) => row.slice());
}

function getBoxIndex(r: number, c: number): number {
  return Math.floor(r / 3) * 3 + Math.floor(c / 3);
}

function bit(digit: number): number {
  return 1 << digit; // digit in [1..9]
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createEmptyBoard(): Board {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

function initMasks(board: Board): Masks | null {
  const row = Array(9).fill(0);
  const col = Array(9).fill(0);
  const box = Array(9).fill(0);
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = board[r][c];
      if (v) {
        const b = getBoxIndex(r, c);
        const m = bit(v);
        // invalid if already used
        if ((row[r] & m) || (col[c] & m) || (box[b] & m)) {
          return null;
        }
        row[r] |= m;
        col[c] |= m;
        box[b] |= m;
      }
    }
  }
  return { row, col, box };
}

function isValid(masks: Masks, r: number, c: number, v: number): boolean {
  const m = bit(v);
  const b = getBoxIndex(r, c);
  return !(masks.row[r] & m) && !(masks.col[c] & m) && !(masks.box[b] & m);
}

function place(masks: Masks, r: number, c: number, v: number): void {
  const m = bit(v);
  const b = getBoxIndex(r, c);
  masks.row[r] |= m;
  masks.col[c] |= m;
  masks.box[b] |= m;
}

function remove(masks: Masks, r: number, c: number, v: number): void {
  const m = bit(v);
  const b = getBoxIndex(r, c);
  masks.row[r] &= ~m;
  masks.col[c] &= ~m;
  masks.box[b] &= ~m;
}

// Generate a complete valid Sudoku solution using randomized backtracking.
export function generateFullSolution(): Board {
  const board = createEmptyBoard();
  const masks: Masks = { row: Array(9).fill(0), col: Array(9).fill(0), box: Array(9).fill(0) };

  function fill(pos: number): boolean {
    if (pos === 81) return true;
    const r = Math.floor(pos / 9);
    const c = pos % 9;
    const order = shuffle(ALL_DIGITS);
    for (const v of order) {
      if (isValid(masks, r, c, v)) {
        board[r][c] = v;
        place(masks, r, c, v);
        if (fill(pos + 1)) return true;
        remove(masks, r, c, v);
        board[r][c] = 0;
      }
    }
    return false;
  }

  // In practice, random order filling from top-left solves quickly.
  fill(0);
  return board;
}

// Find next empty cell using MRV heuristic: pick the one with minimal candidates.
function findBestEmptyCell(board: Board, masks: Masks): { r: number; c: number; candidates: number[] } | null {
  let best: { r: number; c: number; candidates: number[] } | null = null;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) {
        const candidates: number[] = [];
        for (let v = 1; v <= 9; v++) {
          if (isValid(masks, r, c, v)) candidates.push(v);
        }
        if (candidates.length === 0) return null; // dead end
        if (!best || candidates.length < best.candidates.length) {
          best = { r, c, candidates: shuffle(candidates) };
          if (best.candidates.length === 1) return best; // early
        }
      }
    }
  }
  return best;
}

// Count solutions for a puzzle, early exit above limit.
export function countSolutions(puzzle: Board, limit: number = 2): number {
  const masks = initMasks(puzzle);
  if (!masks) return 0; // invalid puzzle state
  const board = cloneBoard(puzzle);
  let solutions = 0;

  function backtrack(): boolean {
    const next = findBestEmptyCell(board, masks!);
    if (!next) {
      // no empty cells -> one solution found
      solutions++;
      return solutions >= limit; // stop if reached limit
    }
    const { r, c, candidates } = next;
    for (const v of candidates) {
      if (solutions >= limit) return true;
      board[r][c] = v;
      place(masks!, r, c, v);
      const stop = backtrack();
      remove(masks!, r, c, v);
      board[r][c] = 0;
      if (stop) return true;
    }
    return false;
  }

  backtrack();
  return solutions;
}

// Solve a puzzle to one solution (returns solved board), or null if unsolvable.
export function solveOne(puzzle: Board): Board | null {
  const masks = initMasks(puzzle);
  if (!masks) return null;
  const board = cloneBoard(puzzle);

  function backtrack(): boolean {
    const next = findBestEmptyCell(board, masks!);
    if (!next) return true;
    const { r, c, candidates } = next;
    for (const v of candidates) {
      board[r][c] = v;
      place(masks!, r, c, v);
      if (backtrack()) return true;
      remove(masks!, r, c, v);
      board[r][c] = 0;
    }
    return false;
  }

  return backtrack() ? board : null;
}

// Generate a puzzle by removing cells with symmetry, ensuring uniqueness at each step.
export function generateSudoku(difficulty: Difficulty): { puzzle: Board; solution: Board } {
  const solution = generateFullSolution();
  let puzzle = cloneBoard(solution);

  const targets: Record<Difficulty, number> = { easy: 40, medium: 50, hard: 60 };
  const targetHoles = targets[difficulty];

  // Build list of all coordinates for random removal order
  const coords: Array<{ r: number; c: number }> = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) coords.push({ r, c });
  }
  const order = shuffle(coords);

  let holes = 0;
  let attempts = 0;
  const MAX_ATTEMPTS = 5000;

  // Symmetric removal: remove (r,c) and (8-r, 8-c) together when possible
  function tryRemovePair(r: number, c: number): boolean {
    const r2 = 8 - r;
    const c2 = 8 - c;
    if (puzzle[r][c] === 0) return false;
    const v1 = puzzle[r][c];
    const v2 = puzzle[r2][c2];
    // Avoid removing twice if symmetric cell already empty
    puzzle[r][c] = 0;
    let removed = 1;
    if (!(r === r2 && c === c2) && v2 !== 0) {
      puzzle[r2][c2] = 0;
      removed = 2;
    }
    // Ensure uniqueness after removal
    const solCount = countSolutions(puzzle, 2);
    if (solCount === 1) {
      holes += removed;
      return true;
    } else {
      // revert
      puzzle[r][c] = v1;
      if (removed === 2) puzzle[r2][c2] = v2;
      return false;
    }
  }

  // Iterate random positions until target holes reached or attempts exhausted
  while (holes < targetHoles && attempts < MAX_ATTEMPTS) {
    const idx = attempts % order.length; // cycle through order
    const { r, c } = order[idx];
    tryRemovePair(r, c);
    attempts++;
  }

  // If we couldn't reach target, retry a limited number of times by regenerating solution.
  // This keeps generation robust under strict uniqueness.
  let retries = 0;
  const MAX_RETRIES = 3;
  while (holes < targetHoles && retries < MAX_RETRIES) {
    const next = generateFullSolution();
    puzzle = cloneBoard(next);
    holes = 0;
    attempts = 0;
    const ord2 = shuffle(coords);
    while (holes < targetHoles && attempts < MAX_ATTEMPTS) {
      const idx2 = attempts % ord2.length;
      const { r, c } = ord2[idx2];
      tryRemovePair(r, c);
      attempts++;
    }
    retries++;
  }

  return { puzzle, solution };
}

// Optional: score puzzle difficulty by number of givens and branching factor.
// This can be extended to a more precise rating if needed.
export function estimateDifficulty(puzzle: Board): number {
  const givens = puzzle.flat().filter((v) => v !== 0).length;
  // Simple heuristic: fewer givens => higher difficulty
  // Normalize to [0,1]
  return (81 - givens) / 81;
}