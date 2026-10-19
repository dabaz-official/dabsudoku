import { DIFFICULTY_CONFIG } from '../features/sudoku/difficulties';
import { formatTime } from '../features/sudoku/format';
import { MAX_MISTAKES } from '../features/sudoku/game';
import type { GameStatus } from '../features/sudoku/game';
import type { Difficulty } from '../features/sudoku/types';
import { Icon } from './Icon';
import styles from './GameStatusBar.module.css';

export interface GameStatusBarProps {
	readonly difficulty: Difficulty;
	readonly elapsed: number;
	readonly mistakes: number;
	readonly status: GameStatus;
	readonly shortcutHints: boolean;
	readonly onTogglePause: () => void;
}

export function GameStatusBar({
	difficulty,
	elapsed,
	mistakes,
	status,
	shortcutHints,
	onTogglePause,
}: GameStatusBarProps) {
	const paused = status === 'paused';
	const finished = status === 'won' || status === 'lost';
	const pauseLabel = paused ? 'Resume' : 'Pause';

	return (
		<div className={styles.bar}>
			<span className={styles.badge}>
				<Icon name="grid" size={14} className={styles.badgeIcon} />
				{DIFFICULTY_CONFIG[difficulty].label} puzzle
			</span>

			<div className={styles.stats}>
				<span className={styles.stat}>
					<Icon name="clock" size={16} />
					<span className="visually-hidden">Time elapsed</span>
					<span className={styles.timerValue}>{formatTime(elapsed)}</span>
					<button
						type="button"
						className={styles.iconButton}
						onClick={onTogglePause}
						disabled={finished}
						aria-label={paused ? 'Resume game' : 'Pause game'}
						title={shortcutHints ? `${pauseLabel} (Esc)` : pauseLabel}
					>
						<Icon name={paused ? 'play' : 'pause'} size={15} />
					</button>
				</span>

				<span className={styles.stat}>
					<Icon name="alert" size={16} />
					Mistakes
					<span className={styles.dots} aria-hidden="true">
						{Array.from({ length: MAX_MISTAKES }, (_, index) => (
							<span
								key={index}
								className={index < mistakes ? `${styles.dot} ${styles.dotUsed}` : styles.dot}
							/>
						))}
					</span>
					<span className={styles.count}>
						{mistakes}/{MAX_MISTAKES}
					</span>
				</span>
			</div>
		</div>
	);
}
