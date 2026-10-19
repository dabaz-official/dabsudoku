import { CELL_COUNT, PEERS, clampIndex, colOf, countPlaced, describeCell, firstEmptyIndex, rowOf, sameGrid } from './board';
import { difficultyLabel } from './difficulties';
import type { GeneratedPuzzle } from './generator';
import type { Difficulty, Grid, Notes } from './types';

export const MAX_MISTAKES = 3;
export const MAX_HINTS = 3;
const HISTORY_LIMIT = 120;

export type GameStatus = 'playing' | 'paused' | 'won' | 'lost';

interface Snapshot {
	readonly board: Grid;
	readonly notes: Notes;
	readonly wrong: readonly boolean[];
	readonly hinted: readonly boolean[];
	readonly hintsLeft: number;
}

export interface GameState {
	readonly id: number;
	readonly difficulty: Difficulty;
	readonly puzzle: Grid;
	readonly solution: Grid;
	readonly board: Grid;
	readonly notes: Notes;
	readonly wrong: readonly boolean[];
	readonly hinted: readonly boolean[];
	readonly selected: number;
	readonly status: GameStatus;
	readonly mistakes: number;
	readonly hintsLeft: number;
	readonly notesMode: boolean;
	readonly history: readonly Snapshot[];
	readonly message: string;
}

export type GameAction =
	| { readonly type: 'select'; readonly index: number }
	| { readonly type: 'move'; readonly dRow: number; readonly dCol: number }
	| { readonly type: 'input'; readonly digit: number }
	| { readonly type: 'erase' }
	| { readonly type: 'toggle-notes' }
	| { readonly type: 'hint' }
	| { readonly type: 'undo' }
	| { readonly type: 'pause' }
	| { readonly type: 'resume' }
	| { readonly type: 'new-game'; readonly id: number; readonly generated: GeneratedPuzzle };

export function createGame(generated: GeneratedPuzzle, id: number): GameState {
	return {
		id,
		difficulty: generated.difficulty,
		puzzle: generated.puzzle.slice(),
		solution: generated.solution.slice(),
		board: generated.puzzle.slice(),
		notes: new Array<number>(CELL_COUNT).fill(0),
		wrong: new Array<boolean>(CELL_COUNT).fill(false),
		hinted: new Array<boolean>(CELL_COUNT).fill(false),
		selected: firstEmptyIndex(generated.puzzle),
		status: 'playing',
		mistakes: 0,
		hintsLeft: MAX_HINTS,
		notesMode: false,
		history: [],
		message: `New ${difficultyLabel(generated.difficulty)} puzzle. Fill every row, column and box with 1–9.`,
	};
}

function snapshot(state: GameState): Snapshot {
	return {
		board: state.board.slice(),
		notes: state.notes.slice(),
		wrong: state.wrong.slice(),
		hinted: state.hinted.slice(),
		hintsLeft: state.hintsLeft,
	};
}

function pushHistory(state: GameState, entry: Snapshot): Snapshot[] {
	const history = [...state.history, entry];
	return history.length > HISTORY_LIMIT ? history.slice(history.length - HISTORY_LIMIT) : history;
}

function pickHintTarget(state: GameState): number {
	const { selected, puzzle, board, wrong } = state;
	if (puzzle[selected] === 0 && (board[selected] === 0 || wrong[selected])) {
		return selected;
	}
	for (let index = 0; index < CELL_COUNT; index += 1) {
		if (puzzle[index] === 0 && (board[index] === 0 || wrong[index])) {
			return index;
		}
	}
	return -1;
}

function placeCorrect(state: GameState, index: number, digit: number, source: 'user' | 'hint'): GameState {
	const board = state.board.slice();
	const notes = state.notes.slice();
	const wrong = state.wrong.slice();
	const hinted = state.hinted.slice();

	board[index] = digit;
	wrong[index] = false;
	hinted[index] = source === 'hint';
	notes[index] = 0;

	const bit = 1 << (digit - 1);
	for (const peer of PEERS[index]) {
		notes[peer] = (notes[peer] ?? 0) & ~bit;
	}

	const solved = sameGrid(board, state.solution);
	const base = {
		...state,
		board,
		notes,
		wrong,
		hinted,
		history: pushHistory(state, snapshot(state)),
	};

	if (solved) {
		const mistakes = state.mistakes === 1 ? '1 mistake' : `${state.mistakes} mistakes`;
		return { ...base, status: 'won', message: `Puzzle solved — ${mistakes}.` };
	}
	return {
		...base,
		message:
			source === 'hint'
				? `Hint placed ${digit} in ${describeCell(index)}.`
				: `Placed ${digit} in ${describeCell(index)}.`,
	};
}

export function gameReducer(state: GameState, action: GameAction): GameState {
	switch (action.type) {
		case 'new-game':
			return createGame(action.generated, action.id);

		case 'select': {
			const index = clampIndex(action.index);
			if (index === state.selected) {
				return state;
			}
			return { ...state, selected: index };
		}

		case 'move': {
			const row = Math.min(8, Math.max(0, rowOf(state.selected) + action.dRow));
			const col = Math.min(8, Math.max(0, colOf(state.selected) + action.dCol));
			const index = row * 9 + col;
			if (index === state.selected) {
				return state;
			}
			return { ...state, selected: index };
		}

		case 'input': {
			if (state.status !== 'playing') {
				return state;
			}
			const index = state.selected;
			const digit = action.digit;
			if (digit < 1 || digit > 9 || state.puzzle[index] !== 0) {
				return state;
			}
			if (countPlaced(state.board, state.wrong, digit) >= 9) {
				return state;
			}

			if (state.notesMode) {
				const notes = state.notes.slice();
				const bit = 1 << (digit - 1);
				notes[index] = (notes[index] ?? 0) ^ bit;
				const added = ((notes[index] ?? 0) & bit) !== 0;
				return {
					...state,
					notes,
					history: pushHistory(state, snapshot(state)),
					message: added
						? `Note ${digit} added in ${describeCell(index)}.`
						: `Note ${digit} removed in ${describeCell(index)}.`,
				};
			}

			if (state.solution[index] === digit) {
				return placeCorrect(state, index, digit, 'user');
			}

			const board = state.board.slice();
			const notes = state.notes.slice();
			const wrong = state.wrong.slice();
			const hinted = state.hinted.slice();
			board[index] = digit;
			wrong[index] = true;
			hinted[index] = false;
			notes[index] = 0;

			const mistakes = state.mistakes + 1;
			const lost = mistakes >= MAX_MISTAKES;

			return {
				...state,
				board,
				notes,
				wrong,
				hinted,
				mistakes,
				status: lost ? 'lost' : 'playing',
				history: pushHistory(state, snapshot(state)),
				message: lost
					? `That was mistake ${MAX_MISTAKES} of ${MAX_MISTAKES}. The puzzle is over.`
					: `Mistake in ${describeCell(index)} — ${MAX_MISTAKES - mistakes} of ${MAX_MISTAKES} left.`,
			};
		}

		case 'erase': {
			if (state.status !== 'playing') {
				return state;
			}
			const index = state.selected;
			if (state.puzzle[index] !== 0) {
				return state;
			}
			if (state.board[index] === 0 && state.notes[index] === 0 && !state.wrong[index]) {
				return state;
			}
			const board = state.board.slice();
			const notes = state.notes.slice();
			const wrong = state.wrong.slice();
			const hinted = state.hinted.slice();
			board[index] = 0;
			notes[index] = 0;
			wrong[index] = false;
			hinted[index] = false;
			return {
				...state,
				board,
				notes,
				wrong,
				hinted,
				history: pushHistory(state, snapshot(state)),
				message: `Cleared ${describeCell(index)}.`,
			};
		}

		case 'toggle-notes': {
			if (state.status !== 'playing') {
				return state;
			}
			return {
				...state,
				notesMode: !state.notesMode,
				message: state.notesMode ? 'Notes off.' : 'Notes on. Numbers become pencil marks.',
			};
		}

		case 'hint': {
			if (state.status !== 'playing' || state.hintsLeft <= 0) {
				return state;
			}
			const target = pickHintTarget(state);
			if (target === -1) {
				return state;
			}
			const placed = placeCorrect(state, target, state.solution[target], 'hint');
			return {
				...placed,
				selected: target,
				hintsLeft: state.hintsLeft - 1,
				message:
					placed.status === 'won'
						? placed.message
						: `Hint placed ${state.solution[target]} in ${describeCell(target)}. ${state.hintsLeft - 1} hint(s) left.`,
			};
		}

		case 'undo': {
			if (state.status !== 'playing' && state.status !== 'paused') {
				return state;
			}
			const entry = state.history[state.history.length - 1];
			if (entry === undefined) {
				return state;
			}
			return {
				...state,
				board: entry.board.slice(),
				notes: entry.notes.slice(),
				wrong: entry.wrong.slice(),
				hinted: entry.hinted.slice(),
				// Mistakes are permanent: undoing a wrong entry must not give
				// the player a mistake back.
				mistakes: state.mistakes,
				hintsLeft: entry.hintsLeft,
				history: state.history.slice(0, -1),
				message: 'Undid the last move.',
			};
		}

		case 'pause': {
			if (state.status !== 'playing') {
				return state;
			}
			return { ...state, status: 'paused', message: 'Game paused.' };
		}

		case 'resume': {
			if (state.status !== 'paused') {
				return state;
			}
			return { ...state, status: 'playing', message: 'Game resumed.' };
		}

		default:
			return state;
	}
}

/** How many of each digit are correctly placed, indexed by digit (0 unused). */
export function digitCounts(state: GameState): number[] {
	const counts = new Array<number>(10).fill(0);
	for (let index = 0; index < CELL_COUNT; index += 1) {
		const value = state.board[index];
		if (value !== 0 && !state.wrong[index]) {
			counts[value] += 1;
		}
	}
	return counts;
}
