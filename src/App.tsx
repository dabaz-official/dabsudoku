import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import styles from './App.module.css';
import { Header } from './components/Header';
import { generatePuzzle } from './features/sudoku/generator';
import { createGame, gameReducer } from './features/sudoku/game';
import { useGameTimer } from './features/sudoku/useGameTimer';
import type { Difficulty } from './features/sudoku/types';
import { navigate, useRoute } from './hooks/useRoute';
import { GamePage } from './pages/GamePage';
import { HowToPlayPage } from './pages/HowToPlayPage';

/** Delay before generating, so the loading state can paint first. */
const GENERATE_DELAY_MS = 40;

export default function App() {
	const route = useRoute();
	const [difficulty, setDifficulty] = useState<Difficulty>('easy');
	const [isGenerating, setIsGenerating] = useState(false);
	const [state, dispatch] = useReducer(gameReducer, null, () =>
		createGame(generatePuzzle('easy'), 1),
	);

	const requestRef = useRef(0);
	const nextIdRef = useRef(2);
	const elapsed = useGameTimer(state.status === 'playing', state.id);

	const startNewGame = useCallback((next: Difficulty) => {
		setDifficulty(next);
		const request = requestRef.current + 1;
		requestRef.current = request;
		setIsGenerating(true);

		window.setTimeout(() => {
			if (requestRef.current !== request) {
				return;
			}
			const generated = generatePuzzle(next);
			dispatch({ type: 'new-game', id: nextIdRef.current, generated });
			nextIdRef.current += 1;
			setIsGenerating(false);
		}, GENERATE_DELAY_MS);
	}, []);

	const handleSelectDifficulty = useCallback(
		(next: Difficulty) => {
			if (route !== 'game') {
				navigate('game');
			}
			startNewGame(next);
		},
		[route, startNewGame],
	);

	// Leaving the game pauses it, so the timer never runs while the rules are
	// being read.
	useEffect(() => {
		if (route === 'how-to-play') {
			dispatch({ type: 'pause' });
		}
	}, [route]);

	// Pause when the tab is hidden: the clock should not run unattended.
	useEffect(() => {
		const handleVisibility = (): void => {
			if (document.hidden) {
				dispatch({ type: 'pause' });
			}
		};
		document.addEventListener('visibilitychange', handleVisibility);
		return () => document.removeEventListener('visibilitychange', handleVisibility);
	}, []);

	useEffect(() => {
		document.title =
			route === 'game' ? 'DabSudoku — a calm puzzle break' : 'How to play — DabSudoku';
		window.scrollTo({ top: 0, behavior: 'auto' });
	}, [route]);

	return (
		<div className={styles.app}>
			<button
				type="button"
				className={styles.skipLink}
				onClick={() => document.getElementById('main-content')?.focus()}
			>
				Skip to main content
			</button>

			<Header route={route} difficulty={difficulty} onSelectDifficulty={handleSelectDifficulty} />

			<div className={styles.main} id="main-content" tabIndex={-1}>
				{route === 'game' ? (
					<GamePage
						state={state}
						elapsed={elapsed}
						isGenerating={isGenerating}
						dispatch={dispatch}
						onNewGame={() => startNewGame(difficulty)}
					/>
				) : (
					<HowToPlayPage onStart={() => handleSelectDifficulty(difficulty)} />
				)}
			</div>

			<footer className={styles.footer}>
				<div className={`container ${styles.footerInner}`}>
					<span>© {new Date().getFullYear()} DabAZ.</span>
					<span>
						<a href="#/how-to-play">How to play</a>
						{' · '}
						<a href="https://sudoku.com/sudoku-rules" target="_blank" rel="noreferrer noopener">
							Rules reference
						</a>
					</span>
				</div>
			</footer>
		</div>
	);
}
