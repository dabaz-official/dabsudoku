import type { Difficulty } from '../features/sudoku/types';
import type { Route } from '../hooks/useRoute';
import { ButtonLink } from './Button';
import { DifficultyTabs } from './DifficultyTabs';
import styles from './Header.module.css';

export interface HeaderProps {
	readonly route: Route;
	readonly difficulty: Difficulty;
	readonly onSelectDifficulty: (difficulty: Difficulty) => void;
}

function LogoMark() {
	return (
		<img className={styles.logo} src="/favicon.ico" alt="" width={26} height={26} />
	);
}

export function Header({ route, difficulty, onSelectDifficulty }: HeaderProps) {
	return (
		<header className={styles.header}>
			<div className={`container ${styles.inner}`}>
				<a className={styles.brand} href="#/" aria-label="DabSudoku home">
					<LogoMark />
					<span>DabSudoku</span>
				</a>

				<nav className={styles.nav} aria-label="Difficulty">
					<DifficultyTabs value={difficulty} onChange={onSelectDifficulty} />
				</nav>

				<div className={styles.actions}>
					{route === 'game' ? (
						<ButtonLink href="#/how-to-play" icon="question">
							How to play
						</ButtonLink>
					) : (
						<ButtonLink href="#/" icon="arrow-left">
							Back to game
						</ButtonLink>
					)}
				</div>
			</div>
		</header>
	);
}
