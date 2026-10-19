import { useEffect, useRef } from 'react';
import { DIFFICULTY_CONFIG } from '../features/sudoku/difficulties';
import { formatTime } from '../features/sudoku/format';
import { MAX_MISTAKES } from '../features/sudoku/game';
import type { Difficulty } from '../features/sudoku/types';
import { Button, ButtonLink } from './Button';
import { Icon } from './Icon';
import styles from './BoardOverlay.module.css';

export type OverlayKind = 'loading' | 'paused' | 'won' | 'lost';

export interface BoardOverlayProps {
	readonly kind: OverlayKind | null;
	readonly difficulty: Difficulty;
	readonly elapsed: number;
	readonly mistakes: number;
	readonly hintsUsed: number;
	readonly onResume: () => void;
	readonly onNewGame: () => void;
}

export function BoardOverlay({
	kind,
	difficulty,
	elapsed,
	mistakes,
	hintsUsed,
	onResume,
	onNewGame,
}: BoardOverlayProps) {
	const primaryRef = useRef<HTMLButtonElement | null>(null);

	useEffect(() => {
		if (kind === 'paused' || kind === 'won' || kind === 'lost') {
			primaryRef.current?.focus();
		}
	}, [kind]);

	if (kind === null) {
		return null;
	}

	const label = DIFFICULTY_CONFIG[difficulty].label;

	if (kind === 'loading') {
		return (
			<div className={styles.overlay} role="status" aria-live="polite">
				<div className={styles.card}>
					<span className={styles.spinner} aria-hidden="true" />
					<p className={styles.title} style={{ marginTop: 'var(--space-4)' }}>
						Preparing your puzzle
					</p>
					<p className={styles.body}>Building a {label} grid with exactly one solution.</p>
				</div>
			</div>
		);
	}

	if (kind === 'paused') {
		return (
			<div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="overlay-title">
				<div className={styles.card}>
					<span className={styles.iconWrap} aria-hidden="true">
						<Icon name="pause" size={20} />
					</span>
					<p className={styles.title} id="overlay-title">
						Paused
					</p>
					<p className={styles.body}>The timer is stopped. Come back whenever you are ready.</p>
					<div className={styles.actions}>
						<Button ref={primaryRef} variant="primary" icon="play" onClick={onResume}>
							Resume
						</Button>
						<Button variant="secondary" icon="plus" onClick={onNewGame}>
							New game
						</Button>
					</div>
				</div>
			</div>
		);
	}

	const solved = kind === 'won';
	const hintText = hintsUsed === 1 ? '1 hint' : `${hintsUsed} hints`;

	return (
		<div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="overlay-title">
			<div className={styles.card}>
				<span
					className={`${styles.iconWrap} ${solved ? styles.iconSuccess : styles.iconError}`}
					aria-hidden="true"
				>
					<Icon name={solved ? 'check' : 'alert'} size={22} />
				</span>
				<p className={styles.title} id="overlay-title">
					{solved ? 'Puzzle solved' : 'Out of mistakes'}
				</p>
				<p className={styles.body}>
					{solved
						? `You finished the ${label.toLowerCase()} puzzle. Nicely done.`
						: `Three mistakes ends the round. This grid is closed — a fresh puzzle is one click away.`}
				</p>
				<p className={styles.stats}>
					{solved
						? `${label} · ${formatTime(elapsed)} · ${mistakes}/${MAX_MISTAKES} mistakes · ${hintText}`
						: `${label} · ${formatTime(elapsed)} · ${mistakes}/${MAX_MISTAKES} mistakes`}
				</p>
				<div className={styles.actions}>
					<Button ref={primaryRef} variant="primary" icon="plus" onClick={onNewGame}>
						New game
					</Button>
					<ButtonLink href="#/how-to-play" variant="secondary" icon="question">
						{solved ? 'How to play' : 'Review the rules'}
					</ButtonLink>
				</div>
			</div>
		</div>
	);
}
