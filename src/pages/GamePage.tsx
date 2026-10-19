import { useEffect, useMemo } from 'react';
import type { Dispatch } from 'react';
import { BoardOverlay, type OverlayKind } from '../components/BoardOverlay';
import { Button } from '../components/Button';
import { GameControls } from '../components/GameControls';
import { GameStatusBar } from '../components/GameStatusBar';
import { NumberPad } from '../components/NumberPad';
import { SudokuBoard } from '../components/SudokuBoard';
import { digitCounts, type GameAction, type GameState } from '../features/sudoku/game';
import styles from './GamePage.module.css';

export interface GamePageProps {
	readonly state: GameState;
	readonly elapsed: number;
	readonly isGenerating: boolean;
	readonly dispatch: Dispatch<GameAction>;
	readonly onNewGame: () => void;
}

const ARROW_MOVES: Record<string, { dRow: number; dCol: number }> = {
	ArrowUp: { dRow: -1, dCol: 0 },
	ArrowDown: { dRow: 1, dCol: 0 },
	ArrowLeft: { dRow: 0, dCol: -1 },
	ArrowRight: { dRow: 0, dCol: 1 },
};

export function GamePage({ state, elapsed, isGenerating, dispatch, onNewGame }: GamePageProps) {
	const counts = useMemo(() => digitCounts(state), [state]);
	const { status, notesMode, hintsLeft, history } = state;

	const overlayKind: OverlayKind | null = isGenerating
		? 'loading'
		: status === 'paused'
			? 'paused'
			: status === 'won'
				? 'won'
				: status === 'lost'
					? 'lost'
					: null;

	const locked = overlayKind !== null;

	// Keyboard shortcuts. Arrow keys move the selection from anywhere on the
	// page; the board keeps focus in sync with it.
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent): void => {
			if (isGenerating) {
				return;
			}
			const target = event.target;
			if (
				target instanceof HTMLElement &&
				(target.tagName === 'INPUT' ||
					target.tagName === 'TEXTAREA' ||
					target.tagName === 'SELECT' ||
					target.isContentEditable)
			) {
				return;
			}

			if (event.key === 'Escape') {
				if (status === 'playing') {
					dispatch({ type: 'pause' });
				} else if (status === 'paused') {
					dispatch({ type: 'resume' });
				}
				return;
			}

			if (status === 'paused') {
				if (event.key === ' ' || event.key === 'Enter') {
					event.preventDefault();
					dispatch({ type: 'resume' });
				}
				return;
			}

			if (status !== 'playing') {
				return;
			}

			const move = ARROW_MOVES[event.key];
			if (move !== undefined) {
				event.preventDefault();
				dispatch({ type: 'move', dRow: move.dRow, dCol: move.dCol });
				return;
			}

			if (event.ctrlKey || event.metaKey || event.altKey) {
				if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
					event.preventDefault();
					dispatch({ type: 'undo' });
				}
				return;
			}

			if (event.key >= '1' && event.key <= '9') {
				event.preventDefault();
				dispatch({ type: 'input', digit: Number(event.key) });
				return;
			}

			if (event.key === 'Backspace' || event.key === 'Delete' || event.key === '0') {
				event.preventDefault();
				dispatch({ type: 'erase' });
				return;
			}

			if (event.key.toLowerCase() === 'n') {
				event.preventDefault();
				dispatch({ type: 'toggle-notes' });
				return;
			}

			if (event.key.toLowerCase() === 'h') {
				event.preventDefault();
				dispatch({ type: 'hint' });
				return;
			}

			if (event.key === ' ') {
				const isControl =
					target instanceof HTMLElement &&
					(target.tagName === 'BUTTON' || target.tagName === 'A');
				if (!isControl) {
					event.preventDefault();
					dispatch({ type: 'pause' });
				}
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [dispatch, isGenerating, status]);

	return (
		<main id="game-main" className={styles.page}>
			<div className={`container ${styles.layout}`}>
				<div className={styles.boardColumn}>
					<GameStatusBar
						difficulty={state.difficulty}
						elapsed={elapsed}
						mistakes={state.mistakes}
						status={status}
						onTogglePause={() => dispatch({ type: status === 'paused' ? 'resume' : 'pause' })}
					/>

					<div className={styles.boardShell}>
						<SudokuBoard state={state} locked={locked} dispatch={dispatch} />
						<BoardOverlay
							kind={overlayKind}
							difficulty={state.difficulty}
							elapsed={elapsed}
							mistakes={state.mistakes}
							hintsUsed={3 - hintsLeft}
							onResume={() => dispatch({ type: 'resume' })}
							onNewGame={onNewGame}
						/>
					</div>

					<p className={styles.statusLine} role="status" aria-live="polite">
						{state.message}
					</p>
				</div>

				<aside className={styles.panel} aria-label="Game controls">
					<section className={styles.panelCard}>
						<h2 className={styles.panelTitle}>Numbers</h2>
						<NumberPad
							counts={counts}
							disabled={locked}
							onDigit={(digit) => dispatch({ type: 'input', digit })}
						/>
					</section>

					<section className={styles.panelCard}>
						<h2 className={styles.panelTitle}>Tools</h2>
						<GameControls
							canUndo={history.length > 0}
							notesMode={notesMode}
							hintsLeft={hintsLeft}
							disabled={locked}
							onUndo={() => dispatch({ type: 'undo' })}
							onErase={() => dispatch({ type: 'erase' })}
							onToggleNotes={() => dispatch({ type: 'toggle-notes' })}
							onHint={() => dispatch({ type: 'hint' })}
						/>
					</section>

					<Button variant="primary" size="lg" icon="plus" fullWidth onClick={onNewGame}>
						New game
					</Button>

					<section className={styles.panelCard}>
						<h2 className={styles.panelTitle}>Keyboard</h2>
						<ul className={styles.shortcuts}>
							<li>
								<span>Move selection</span>
								<span className={styles.keys}>
									<kbd>↑</kbd>
									<kbd>↓</kbd>
									<kbd>←</kbd>
									<kbd>→</kbd>
								</span>
							</li>
							<li>
								<span>Fill a cell</span>
								<span className={styles.keys}>
									<kbd>1</kbd>
									<kbd>–</kbd>
									<kbd>9</kbd>
								</span>
							</li>
							<li>
								<span>Pencil notes</span>
								<kbd>N</kbd>
							</li>
							<li>
								<span>Hint</span>
								<kbd>H</kbd>
							</li>
							<li>
								<span>Erase</span>
								<kbd>⌫</kbd>
							</li>
							<li>
								<span>Undo</span>
								<span className={styles.keys}>
									<kbd>Ctrl</kbd>
									<kbd>Z</kbd>
								</span>
							</li>
							<li>
								<span>Pause or resume</span>
								<kbd>Esc</kbd>
							</li>
						</ul>
					</section>
				</aside>
			</div>
		</main>
	);
}
