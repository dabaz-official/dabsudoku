import { describe, expect, it } from 'vitest';
import { CELL_COUNT, PEERS, firstEmptyIndex } from './board';
import { generatePuzzle } from './generator';
import { MAX_HINTS, MAX_MISTAKES, createGame, digitCounts, gameReducer } from './game';
import type { GameState } from './game';
import type { Rng } from './types';

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

function newGame(seed = 5): GameState {
	return createGame(generatePuzzle('easy', mulberry32(seed)), 1);
}

function wrongDigitFor(state: GameState, index: number): number {
	const correct = state.solution[index];
	return (correct % 9) + 1;
}

describe('createGame', () => {
	it('starts from the givens with a selected empty cell', () => {
		const state = newGame();
		expect(state.board).toEqual(state.puzzle);
		expect(state.status).toBe('playing');
		expect(state.mistakes).toBe(0);
		expect(state.hintsLeft).toBe(MAX_HINTS);
		expect(state.selected).toBe(firstEmptyIndex(state.puzzle));
		expect(state.puzzle[state.selected]).toBe(0);
	});
});

describe('placing digits', () => {
	it('accepts a correct digit and clears the cell', () => {
		const state = newGame();
		const index = state.selected;
		const digit = state.solution[index];
		const next = gameReducer(state, { type: 'input', digit });

		expect(next.board[index]).toBe(digit);
		expect(next.wrong[index]).toBe(false);
		expect(next.mistakes).toBe(0);
	});

	it('counts a mistake for a wrong digit', () => {
		const state = newGame();
		const index = state.selected;
		const digit = wrongDigitFor(state, index);
		const next = gameReducer(state, { type: 'input', digit });

		expect(next.board[index]).toBe(digit);
		expect(next.wrong[index]).toBe(true);
		expect(next.mistakes).toBe(1);
	});

	it('ends the game after the third mistake', () => {
		let state = newGame();
		const emptyIndices = state.board
			.map((value, index) => (value === 0 ? index : -1))
			.filter((index) => index >= 0);

		for (let step = 0; step < MAX_MISTAKES; step += 1) {
			const index = emptyIndices[step] as number;
			state = gameReducer(state, { type: 'select', index });
			state = gameReducer(state, { type: 'input', digit: wrongDigitFor(state, index) });
		}

		expect(state.mistakes).toBe(MAX_MISTAKES);
		expect(state.status).toBe('lost');
	});

	it('ignores input on given cells', () => {
		const state = newGame();
		const givenIndex = state.puzzle.findIndex((value) => value !== 0);
		const next = gameReducer(state, { type: 'select', index: givenIndex });
		const after = gameReducer(next, { type: 'input', digit: 5 });
		expect(after.board[givenIndex]).toBe(state.puzzle[givenIndex]);
		expect(after.mistakes).toBe(0);
	});

	it('marks the puzzle solved when the last cell is filled', () => {
		let state = newGame();
		for (let index = 0; index < CELL_COUNT; index += 1) {
			if (state.puzzle[index] !== 0) {
				continue;
			}
			state = gameReducer(state, { type: 'select', index });
			state = gameReducer(state, { type: 'input', digit: state.solution[index] });
		}
		expect(state.status).toBe('won');
		expect(state.board).toEqual(state.solution);
	});
});

describe('notes', () => {
	it('toggles pencil marks without filling the cell', () => {
		const state = newGame();
		const index = state.selected;
		const withNotes = gameReducer(state, { type: 'toggle-notes' });
		const noted = gameReducer(withNotes, { type: 'input', digit: 4 });
		const removed = gameReducer(noted, { type: 'input', digit: 4 });

		expect(withNotes.notesMode).toBe(true);
		expect(noted.board[index]).toBe(0);
		expect(noted.notes[index]).toBe(1 << 3);
		expect(removed.notes[index]).toBe(0);
	});

	it('clears matching notes from peers when a digit is placed', () => {
		let state = gameReducer(newGame(), { type: 'toggle-notes' });
		const index = state.selected;
		const digit = state.solution[index];
		const peers = PEERS[index]
			.filter((peer) => state.puzzle[peer] === 0 && peer !== index)
			.slice(0, 4);

		expect(peers.length).toBeGreaterThan(0);

		for (const peer of peers) {
			state = gameReducer(state, { type: 'select', index: peer });
			state = gameReducer(state, { type: 'input', digit });
		}

		state = gameReducer(state, { type: 'toggle-notes' });
		state = gameReducer(state, { type: 'select', index });
		state = gameReducer(state, { type: 'input', digit });

		for (const peer of peers) {
			expect((state.notes[peer] ?? 0) & (1 << (digit - 1))).toBe(0);
		}
	});
});

describe('erase, hint and undo', () => {
	it('erases a filled cell', () => {
		const state = newGame();
		const index = state.selected;
		const filled = gameReducer(state, { type: 'input', digit: state.solution[index] });
		const erased = gameReducer(filled, { type: 'erase' });
		expect(erased.board[index]).toBe(0);
	});

	it('reveals a correct digit with a hint', () => {
		const state = newGame();
		const index = state.selected;
		const hinted = gameReducer(state, { type: 'hint' });

		expect(hinted.board[index]).toBe(state.solution[index]);
		expect(hinted.hinted[index]).toBe(true);
		expect(hinted.hintsLeft).toBe(MAX_HINTS - 1);
	});

	it('refuses a hint once the allowance is used up', () => {
		let state = newGame();
		for (let step = 0; step < MAX_HINTS; step += 1) {
			state = gameReducer(state, { type: 'hint' });
		}
		const extra = gameReducer(state, { type: 'hint' });
		expect(state.hintsLeft).toBe(0);
		expect(extra.hintsLeft).toBe(0);
	});

	it('undoes the last move', () => {
		const state = newGame();
		const index = state.selected;
		const filled = gameReducer(state, { type: 'input', digit: state.solution[index] });
		const undone = gameReducer(filled, { type: 'undo' });
		expect(undone.board[index]).toBe(0);
		expect(undone.history).toHaveLength(0);
	});

	it('keeps the mistake count when undoing a wrong entry', () => {
		const state = newGame();
		const index = state.selected;
		const wrong = gameReducer(state, { type: 'input', digit: wrongDigitFor(state, index) });
		const undone = gameReducer(wrong, { type: 'undo' });

		expect(wrong.mistakes).toBe(1);
		expect(undone.board[index]).toBe(0);
		expect(undone.mistakes).toBe(1);
	});

	it('still counts a repeated mistake after undoing it', () => {
		const state = newGame();
		const index = state.selected;
		const digit = wrongDigitFor(state, index);
		const first = gameReducer(state, { type: 'input', digit });
		const undone = gameReducer(first, { type: 'undo' });
		const second = gameReducer(undone, { type: 'input', digit });

		expect(second.mistakes).toBe(2);
	});
});

describe('pause', () => {
	it('blocks input while paused', () => {
		const state = gameReducer(newGame(), { type: 'pause' });
		const index = state.selected;
		const blocked = gameReducer(state, { type: 'input', digit: state.solution[index] });
		expect(state.status).toBe('paused');
		expect(blocked.board[index]).toBe(0);
	});

	it('resumes and accepts input again', () => {
		const paused = gameReducer(newGame(), { type: 'pause' });
		const resumed = gameReducer(paused, { type: 'resume' });
		const index = resumed.selected;
		const filled = gameReducer(resumed, { type: 'input', digit: resumed.solution[index] });
		expect(resumed.status).toBe('playing');
		expect(filled.board[index]).toBe(resumed.solution[index]);
	});
});

describe('digitCounts', () => {
	it('counts correct placements only', () => {
		const state = newGame();
		const index = state.selected;
		const digit = state.solution[index];
		const baseline = digitCounts(state)[digit];
		const wrong = gameReducer(state, { type: 'input', digit: wrongDigitFor(state, index) });
		const right = gameReducer(state, { type: 'input', digit });

		// A wrong entry never counts towards the digit's progress.
		expect(digitCounts(wrong)[digit]).toBe(baseline);
		expect(digitCounts(right)[digit]).toBe(baseline + 1);
	});
});
