import { DIFFICULTY_CONFIG } from '../features/sudoku/difficulties';
import { DIFFICULTY_ORDER, type Difficulty } from '../features/sudoku/types';
import styles from './DifficultyTabs.module.css';

export interface DifficultyTabsProps {
	readonly value: Difficulty;
	readonly onChange: (difficulty: Difficulty) => void;
}

export function DifficultyTabs({ value, onChange }: DifficultyTabsProps) {
	return (
		<div className={styles.tabs} role="group" aria-label="Puzzle difficulty">
			{DIFFICULTY_ORDER.map((difficulty) => {
				const config = DIFFICULTY_CONFIG[difficulty];
				const active = difficulty === value;
				return (
					<button
						key={difficulty}
						type="button"
						className={active ? `${styles.tab} ${styles.active}` : styles.tab}
						aria-pressed={active}
						title={config.description}
						onClick={() => onChange(difficulty)}
					>
						{config.label}
					</button>
				);
			})}
		</div>
	);
}
