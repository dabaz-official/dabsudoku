import { useEffect, useRef } from 'react';
import { CELL_COUNT, PEERS, colOf, describeCell, rowOf } from '../features/sudoku/board';
import type { GameAction, GameState } from '../features/sudoku/game';
import styles from './SudokuBoard.module.css';

export interface SudokuBoardProps {
	readonly state: GameState;
	readonly locked: boolean;
	readonly dispatch: (action: GameAction) => void;
}

function noteSummary(mask: number): string {
	const digits: number[] = [];
	for (let slot = 0; slot < 9; slot += 1) {
		if ((mask & (1 << slot)) !== 0) {
			digits.push(slot + 1);
		}
	}
	return digits.join(', ');
}

export function SudokuBoard({ state, locked, dispatch }: SudokuBoardProps) {
	const cellRefs = useRef<Array<HTMLButtonElement | null>>([]);
	const hasMounted = useRef(false);
	const { selected } = state;
	const selectedValue = state.board[selected] ?? 0;
	const peerSet = new Set(PEERS[selected]);

	// Keep keyboard focus with the selection when it moves (for example after a
	// hint), but never steal focus from the controls in the side panel.
	useEffect(() => {
		if (!hasMounted.current) {
			hasMounted.current = true;
			return;
		}
		const board = cellRefs.current[selected]?.parentElement;
		const active = document.activeElement;
		if (board && (active === document.body || board.contains(active))) {
			cellRefs.current[selected]?.focus({ preventScroll: true });
		}
	}, [selected]);

	// Arrow keys are handled once, at the page level, so the selection also moves
	// while focus sits on a control. Focus follows the selection via the effect
	// above.

	const cells = [];
	for (let index = 0; index < CELL_COUNT; index += 1) {
		const value = state.board[index] ?? 0;
		const isGiven = state.puzzle[index] !== 0;
		const isSelected = index === selected;
		const isPeer = !isSelected && peerSet.has(index);
		const isSame = !isSelected && selectedValue !== 0 && value === selectedValue;
		const isWrong = state.wrong[index] === true;
		const isHinted = state.hinted[index] === true;
		const notes = state.notes[index] ?? 0;

		const position = describeCell(index);
		let label = `${position}, empty`;
		if (value !== 0) {
			if (isGiven) {
				label = `${position}, given ${value}`;
			} else if (isWrong) {
				label = `${position}, ${value}, incorrect`;
			} else if (isHinted) {
				label = `${position}, ${value}, revealed by a hint`;
			} else {
				label = `${position}, ${value}`;
			}
		} else if (notes !== 0) {
			label = `${position}, empty, notes ${noteSummary(notes)}`;
		}
		if (isSelected) {
			label = `${label}, selected`;
		}

		const classNames = [styles.cell];
		if (!isGiven && value !== 0) {
			classNames.push(styles.user);
		}
		if (isPeer) {
			classNames.push(styles.peer);
		}
		if (isSame) {
			classNames.push(styles.same);
		}
		if (isHinted) {
			classNames.push(styles.hintCell);
		}
		if (isSelected) {
			classNames.push(styles.selected);
		}
		if (isWrong) {
			classNames.push(styles.wrong);
		}

		cells.push(
			<button
				key={index}
				type="button"
				ref={(element) => {
					cellRefs.current[index] = element;
				}}
				className={classNames.join(' ')}
				data-row={rowOf(index)}
				data-col={colOf(index)}
				tabIndex={isSelected ? 0 : -1}
				aria-label={label}
				onClick={() => {
					dispatch({ type: 'select', index });
					cellRefs.current[index]?.focus({ preventScroll: true });
				}}
			>
				{value === 0 ? null : <span aria-hidden="true">{value}</span>}
				{value === 0 && notes !== 0 ? (
					<span className={styles.notes} aria-hidden="true">
						{Array.from({ length: 9 }, (_, slot) =>
							(notes & (1 << slot)) !== 0 ? (
								<span key={slot} className={styles.note}>
									{slot + 1}
								</span>
							) : (
								<span key={slot} className={styles.noteHidden}>
									{slot + 1}
								</span>
							),
						)}
					</span>
				) : null}
			</button>,
		);
	}

	return (
		<div
			className={locked ? `${styles.board} ${styles.locked}` : styles.board}
			role="group"
			aria-label="Sudoku board. Use the arrow keys to move, and 1 to 9 to fill a cell."
		>
			{cells}
		</div>
	);
}
