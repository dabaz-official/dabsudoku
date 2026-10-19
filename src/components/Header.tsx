import type { Difficulty } from '../features/sudoku/types';
import type { Route } from '../hooks/useRoute';
import type { Theme } from '../hooks/useTheme';
import { ButtonLink } from './Button';
import { DifficultyTabs } from './DifficultyTabs';
import { Icon } from './Icon';
import styles from './Header.module.css';

export interface HeaderProps {
	readonly route: Route;
	readonly difficulty: Difficulty;
	readonly onSelectDifficulty: (difficulty: Difficulty) => void;
	readonly theme: Theme;
	readonly onToggleTheme: () => void;
}

function LogoMark() {
	return (
		<img className={styles.logo} src="/favicon.ico" alt="" width={26} height={26} />
	);
}

export function Header({
	route,
	difficulty,
	onSelectDifficulty,
	theme,
	onToggleTheme,
}: HeaderProps) {
	// The button shows the theme it switches to, matching DabMinesweeper.
	const isLight = theme === 'light';
	const themeLabel = isLight ? 'Switch to dark theme' : 'Switch to light theme';

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
						<ButtonLink
							href="#/how-to-play"
							icon="question"
							className={styles.collapsible}
							aria-label="How to play"
						>
							How to play
						</ButtonLink>
					) : (
						<ButtonLink
							href="#/"
							icon="arrow-left"
							className={styles.collapsible}
							aria-label="Back to game"
						>
							Back to game
						</ButtonLink>
					)}

					<button
						type="button"
						className={styles.themeToggle}
						onClick={onToggleTheme}
						aria-label={themeLabel}
						title={themeLabel}
					>
						<Icon name={isLight ? 'moon' : 'sun'} size={18} />
					</button>
				</div>
			</div>
		</header>
	);
}
