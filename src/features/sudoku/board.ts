import type { Grid } from './types';

export const SIZE = 9;
export const BOX_SIZE = 3;
export const CELL_COUNT = SIZE * SIZE;
export const DIGIT_MASK = 0b111111111;

export function rowOf(index: number): number {
	return Math.floor(index / SIZE);
}

export function colOf(index: number): number {
	return index % SIZE;
}

export function boxOf(index: number): number {
	return Math.floor(rowOf(index) / BOX_SIZE) * BOX_SIZE + Math.floor(colOf(index) / BOX_SIZE);
}

export function indexOf(row: number, col: number): number {
	return row * SIZE + col;
}

export function clampIndex(index: number): number {
	return Math.min(CELL_COUNT - 1, Math.max(0, index));
}

/** Human-readable position, used in accessible labels and announcements. */
export function describeCell(index: number): string {
	return `row ${rowOf(index) + 1}, column ${colOf(index) + 1}`;
}

const peers: number[][] = [];

for (let index = 0; index < CELL_COUNT; index += 1) {
	const row = rowOf(index);
	const col = colOf(index);
	const related = new Set<number>();
	for (let step = 0; step < SIZE; step += 1) {
		related.add(indexOf(row, step));
		related.add(indexOf(step, col));
	}
	const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
	const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
	for (let r = 0; r < BOX_SIZE; r += 1) {
		for (let c = 0; c < BOX_SIZE; c += 1) {
			related.add(indexOf(boxRow + r, boxCol + c));
		}
	}
	related.delete(index);
	peers.push([...related]);
}

/** Cells sharing a row, column or box with `index` (excluding itself). */
export const PEERS: readonly (readonly number[])[] = peers;

/** Number of correct placements of `digit` on the board. */
export function countPlaced(board: readonly number[], wrong: readonly boolean[], digit: number): number {
	let total = 0;
	for (let index = 0; index < CELL_COUNT; index += 1) {
		if (board[index] === digit && !wrong[index]) {
			total += 1;
		}
	}
	return total;
}

export function countClues(grid: readonly number[]): number {
	let total = 0;
	for (let index = 0; index < CELL_COUNT; index += 1) {
		if (grid[index] !== 0) {
			total += 1;
		}
	}
	return total;
}

export function firstEmptyIndex(grid: readonly number[]): number {
	for (let index = 0; index < CELL_COUNT; index += 1) {
		if (grid[index] === 0) {
			return index;
		}
	}
	return 0;
}

export function sameGrid(a: readonly number[], b: readonly number[]): boolean {
	for (let index = 0; index < CELL_COUNT; index += 1) {
		if (a[index] !== b[index]) {
			return false;
		}
	}
	return true;
}

export function emptyGrid(): Grid {
	return new Array<number>(CELL_COUNT).fill(0);
}
