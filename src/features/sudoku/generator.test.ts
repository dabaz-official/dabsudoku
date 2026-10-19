import { describe, expect, it } from 'vitest';
import { CELL_COUNT, countClues } from './board';
import { DIFFICULTY_CONFIG } from './difficulties';
import { generatePuzzle, generateSolution } from './generator';
import { countSolutions, isValidSolution } from './solver';
import { DIFFICULTY_ORDER } from './types';
import type { Rng } from './types';

/** Deterministic RNG so generated puzzles are reproducible in tests. */
function mulberry32(seed: number): Rng {
	let state = seed >>> 0;
	return () => {
		state = (state + 0x6d2b79f5) >>> 0;
		let t = state;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

describe('generateSolution', () => {
	it('produces a fully filled, valid grid', () => {
		const solution = generateSolution(mulberry32(1));
		expect(solution).toHaveLength(CELL_COUNT);
		expect(solution.every((value) => value >= 1 && value <= 9)).toBe(true);
		expect(isValidSolution(solution)).toBe(true);
	});

	it('produces different grids for different seeds', () => {
		const first = generateSolution(mulberry32(1));
		const second = generateSolution(mulberry32(2));
		expect(first).not.toEqual(second);
	});
});

describe.each(DIFFICULTY_ORDER)('%s puzzles', (difficulty) => {
	const config = DIFFICULTY_CONFIG[difficulty];

	it('has a unique solution and valid givens', () => {
		const generated = generatePuzzle(difficulty, mulberry32(42));

		expect(isValidSolution(generated.solution)).toBe(true);
		expect(countSolutions(generated.puzzle, 2)).toBe(1);
		expect(generated.clueCount).toBe(countClues(generated.puzzle));
		expect(generated.difficulty).toBe(difficulty);

		for (let index = 0; index < CELL_COUNT; index += 1) {
			const given = generated.puzzle[index];
			if (given !== 0) {
				expect(given).toBe(generated.solution[index]);
			}
		}
	});

	it('removes givens symmetrically', () => {
		const { puzzle } = generatePuzzle(difficulty, mulberry32(7));
		for (let index = 0; index < CELL_COUNT; index += 1) {
			expect(puzzle[index] === 0).toBe(puzzle[CELL_COUNT - 1 - index] === 0);
		}
	});

	it('stays close to the requested clue count', () => {
		const generated = generatePuzzle(difficulty, mulberry32(99));
		expect(generated.clueCount).toBeGreaterThanOrEqual(17);
		expect(generated.clueCount).toBeLessThanOrEqual(config.clues + 4);
	});
});

describe('generation performance', () => {
	it('generates one puzzle per difficulty quickly', () => {
		const rng = mulberry32(2024);
		const startedAt = Date.now();
		for (const difficulty of DIFFICULTY_ORDER) {
			generatePuzzle(difficulty, rng);
		}
		const elapsed = Date.now() - startedAt;
		expect(elapsed).toBeLessThan(8000);
	});
});
