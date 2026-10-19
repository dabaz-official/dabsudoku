import { CELL_COUNT, countClues } from './board';
import { DIFFICULTY_CONFIG } from './difficulties';
import { countSolutions } from './solver';
import type { Difficulty, Grid, Rng } from './types';

export interface GeneratedPuzzle {
	readonly puzzle: Grid;
	readonly solution: Grid;
	readonly clueCount: number;
	readonly difficulty: Difficulty;
}

function shuffle<T>(items: readonly T[], rng: Rng): T[] {
	const result = items.slice();
	for (let index = result.length - 1; index > 0; index -= 1) {
		const swap = Math.floor(rng() * (index + 1));
		const current = result[index] as T;
		result[index] = result[swap] as T;
		result[swap] = current;
	}
	return result;
}

function shuffleInPlace<T>(items: T[], rng: Rng): void {
	for (let index = items.length - 1; index > 0; index -= 1) {
		const swap = Math.floor(rng() * (index + 1));
		const current = items[index] as T;
		items[index] = items[swap] as T;
		items[swap] = current;
	}
}

/**
 * Builds a complete, valid grid from a base pattern, then randomises it by
 * shuffling bands, stacks and digit labels. This always produces a valid
 * solution, unlike random backtracking.
 */
export function generateSolution(rng: Rng = Math.random): Grid {
	const bands = shuffle([0, 1, 2], rng);
	const rows = bands.flatMap((band) => shuffle([0, 1, 2], rng).map((row) => band * 3 + row));
	const stacks = shuffle([0, 1, 2], rng);
	const cols = stacks.flatMap((stack) => shuffle([0, 1, 2], rng).map((col) => stack * 3 + col));
	const digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], rng);

	const pattern = (row: number, col: number): number =>
		(3 * (row % 3) + Math.floor(row / 3) + col) % 9;

	const grid: Grid = [];
	for (const row of rows) {
		for (const col of cols) {
			grid.push(digits[pattern(row, col)] as number);
		}
	}
	return grid;
}

/**
 * Removes givens in 180°-rotationally symmetric pairs, keeping the puzzle
 * unique at every step. Symmetry matches the look of most published Sudoku
 * puzzles (including sudoku.com) while uniqueness keeps the puzzle fair.
 */
function digPuzzle(solution: Grid, target: number, rng: Rng): Grid {
	const puzzle = solution.slice();
	let clues = countClues(puzzle);

	const pairs: number[] = [];
	for (let index = 0; index < 40; index += 1) {
		pairs.push(index);
	}

	// A second pass revisits pairs that failed earlier: removals elsewhere can
	// make a previously impossible removal safe.
	for (let pass = 0; pass < 2 && clues > target; pass += 1) {
		shuffleInPlace(pairs, rng);
		for (const index of pairs) {
			if (clues <= target) {
				break;
			}
			const mirror = CELL_COUNT - 1 - index;
			const first = puzzle[index] as number;
			const second = puzzle[mirror] as number;
			if (first === 0 && second === 0) {
				continue;
			}
			puzzle[index] = 0;
			puzzle[mirror] = 0;
			if (countSolutions(puzzle, 2) === 1) {
				clues -= (first === 0 ? 0 : 1) + (second === 0 ? 0 : 1);
			} else {
				puzzle[index] = first;
				puzzle[mirror] = second;
			}
		}
	}

	// The centre cell is its own mirror, so it is handled separately.
	const centre = Math.floor(CELL_COUNT / 2);
	if (clues > target && puzzle[centre] !== 0) {
		const value = puzzle[centre] as number;
		puzzle[centre] = 0;
		if (countSolutions(puzzle, 2) === 1) {
			clues -= 1;
		} else {
			puzzle[centre] = value;
		}
	}

	return puzzle;
}

/**
 * Generates a puzzle with a single solution for the requested difficulty.
 * Because a low clue count is not always reachable for a given solution grid,
 * several grids are tried and the sparsest result is kept.
 */
export function generatePuzzle(difficulty: Difficulty, rng: Rng = Math.random): GeneratedPuzzle {
	const config = DIFFICULTY_CONFIG[difficulty];
	let best: GeneratedPuzzle | null = null;

	for (let attempt = 0; attempt < config.attempts; attempt += 1) {
		const solution = generateSolution(rng);
		const puzzle = digPuzzle(solution, config.clues, rng);
		const clueCount = countClues(puzzle);

		if (best === null || clueCount < best.clueCount) {
			best = { puzzle, solution, clueCount, difficulty };
		}
		if (best.clueCount <= config.clues) {
			break;
		}
	}

	// `attempts` is always at least 1, so a candidate is always produced.
	if (best === null) {
		throw new Error(`Failed to generate a ${difficulty} puzzle.`);
	}
	return best;
}
