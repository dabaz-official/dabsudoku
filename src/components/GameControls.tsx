import { Button } from './Button';
import styles from './GameControls.module.css';

export interface GameControlsProps {
	readonly canUndo: boolean;
	readonly notesMode: boolean;
	readonly hintsLeft: number;
	readonly disabled: boolean;
	readonly shortcutHints: boolean;
	readonly onUndo: () => void;
	readonly onErase: () => void;
	readonly onToggleNotes: () => void;
	readonly onHint: () => void;
}

export function GameControls({
	canUndo,
	notesMode,
	hintsLeft,
	disabled,
	shortcutHints,
	onUndo,
	onErase,
	onToggleNotes,
	onHint,
}: GameControlsProps) {
	return (
		<div className={styles.controls}>
			<Button
				variant="tool"
				icon="undo"
				title={shortcutHints ? 'Undo (Ctrl+Z)' : 'Undo'}
				disabled={disabled || !canUndo}
				onClick={onUndo}
			>
				Undo
			</Button>
			<Button
				variant="tool"
				icon="erase"
				title={shortcutHints ? 'Erase (Backspace)' : 'Erase'}
				disabled={disabled}
				onClick={onErase}
			>
				Erase
			</Button>
			<Button
				variant="tool"
				icon="notes"
				title={shortcutHints ? 'Pencil notes (N)' : 'Pencil notes'}
				aria-pressed={notesMode}
				disabled={disabled}
				onClick={onToggleNotes}
			>
				Notes
			</Button>
			<Button
				variant="tool"
				icon="hint"
				title={shortcutHints ? 'Reveal a cell (H)' : 'Reveal a cell'}
				disabled={disabled || hintsLeft === 0}
				onClick={onHint}
			>
				Hint
				<span className={hintsLeft === 0 ? `${styles.badge} ${styles.badgeEmpty}` : styles.badge}>
					{hintsLeft}
				</span>
			</Button>
		</div>
	);
}
