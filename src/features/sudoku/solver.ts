import { BOX_SIZE, CELL_COUNT, DIGIT_MASK, SIZE, boxOf, colOf, rowOf } from './board';
import type { Grid } from './types';

function popcount(value: number): number {
	let count = 0;
	let remaining = value;
	while (remaining !== 0) {
		remaining &= remaining - 1;
		count += 1;
	}
	return count;
}

function digitFromBit(bit: number): number {
	return 32 - Math.clz32(bit);
}

interface Masks {
	rows: number[];
	cols: number[];
	boxes: number[];
}

function buildMasks(grid: readonly number[]): Masks | null {
	const rows = new Array<number>(SIZE).fill(0);
	const cols = new Array<number>(SIZE).fill(0);
	const boxes = new Array<number>(SIZE).fill(0);

	for (let index = 0; index < CELL_COUNT; index += 1) {
		const value = grid[index];
		if (value === 0) {
			continue;
		}
		const bit = 1 << (value - 1);
		const row = rowOf(index);
		const col = colOf(index);
		const box = boxOf(index);
		if ((rows[row] & bit) !== 0 || (cols[col] & bit) !== 0 || (boxes[box] & bit) !== 0) {
			return null;
		}
		rows[row] |= bit;
		cols[col] |= bit;
		boxes[box] |= bit;
	}

	return { rows, cols, boxes };
}

interface SearchState {
	cells: number[];
	masks: Masks;
}

function findBestEmptyCell(state: SearchState): { index: number; candidates: number } | null {
	const { cells, masks } = state;
	let bestIndex = -1;
	let bestCandidates = 0;
	let bestCount = SIZE + 1;

	for (let index = 0; index < CELL_COUNT; index += 1) {
		if (cells[index] !== 0) {
			continue;
		}
		const used = masks.rows[rowOf(index)] | masks.cols[colOf(index)] | masks.boxes[boxOf(index)];
		const candidates = DIGIT_MASK & ~used;
		const count = popcount(candidates);
		if (count === 0) {
			return { index, candidates: 0 };
		}
		if (count < bestCount) {
			bestIndex = index;
			bestCandidates = candidates;
			bestCount = count;
			if (count === 1) {
				break;
			}
		}
	}

	if (bestIndex === -1) {
		return null;
	}
	return { index: bestIndex, candidates: bestCandidates };
}

function place(state: SearchState, index: number, bit: number): void {
	state.cells[index] = digitFromBit(bit);
	state.masks.rows[rowOf(index)] |= bit;
	state.masks.cols[colOf(index)] |= bit;
	state.masks.boxes[boxOf(index)] |= bit;
}

function unplace(state: SearchState, index: number, bit: number): void {
	state.cells[index] = 0;
	state.masks.rows[rowOf(index)] &= ~bit;
	state.masks.cols[colOf(index)] &= ~bit;
	state.masks.boxes[boxOf(index)] &= ~bit;
}

/**
 * Counts solutions of `grid`, stopping once `limit` is reached. A unique puzzle
 * is therefore confirmed with `countSolutions(grid, 2) === 1`, which is much
 * cheaper than enumerating every solution.
 */
export function countSolutions(grid: readonly number[], limit = 2): number {
	const masks = buildMasks(grid);
	if (masks === null) {
		return 0;
	}

	const state: SearchState = { cells: grid.slice(), masks };
	let found = 0;

	const search = (): void => {
		const next = findBestEmptyCell(state);
		if (next === null) {
			found += 1;
			return;
		}
		if (next.candidates === 0) {
			return;
		}

		let candidates = next.candidates;
		while (candidates !== 0) {
			const bit = candidates & -candidates;
			candidates ^= bit;
			place(state, next.index, bit);
			search();
			unplace(state, next.index, bit);
			if (found >= limit) {
				return;
			}
		}
	};

	search();
	return found;
}

/** Returns the first solution found, or `null` when the grid is unsolvable. */
export function solve(grid: readonly number[]): Grid | null {
	const masks = buildMasks(grid);
	if (masks === null) {
		return null;
	}

	const state: SearchState = { cells: grid.slice(), masks };
	let solution: Grid | null = null;

	const search = (): boolean => {
		const next = findBestEmptyCell(state);
		if (next === null) {
			solution = state.cells.slice();
			return true;
		}
		if (next.candidates === 0) {
			return false;
		}

		let candidates = next.candidates;
		while (candidates !== 0) {
			const bit = candidates & -candidates;
			candidates ^= bit;
			place(state, next.index, bit);
			if (search()) {
				return true;
			}
			unplace(state, next.index, bit);
		}
		return false;
	};

	return search() ? solution : null;
}

/** True when `grid` is completely filled and every row, column and box is 1–9. */
export function isValidSolution(grid: readonly number[]): boolean {
	if (grid.length !== CELL_COUNT) {
		return false;
	}

	for (let unit = 0; unit < SIZE; unit += 1) {
		let rowMask = 0;
		let colMask = 0;
		let boxMask = 0;
		for (let step = 0; step < SIZE; step += 1) {
			const rowValue = grid[unit * SIZE + step];
			const colValue = grid[step * SIZE + unit];
			const boxValue =
				grid[
					Math.floor(unit / BOX_SIZE) * BOX_SIZE * SIZE +
						(unit % BOX_SIZE) * BOX_SIZE +
						Math.floor(step / BOX_SIZE) * SIZE +
						(step % BOX_SIZE)
				];
			if (rowValue < 1 || rowValue > 9 || colValue < 1 || colValue > 9 || boxValue < 1 || boxValue > 9) {
				return false;
			}
			rowMask |= 1 << (rowValue - 1);
			colMask |= 1 << (colValue - 1);
			boxMask |= 1 << (boxValue - 1);
		}
		if (rowMask !== DIGIT_MASK || colMask !== DIGIT_MASK || boxMask !== DIGIT_MASK) {
			return false;
		}
	}
	return true;
}
