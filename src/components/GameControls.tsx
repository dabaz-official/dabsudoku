import { Button } from './Button';
import styles from './GameControls.module.css';

export interface GameControlsProps {
	readonly canUndo: boolean;
	readonly notesMode: boolean;
	readonly hintsLeft: number;
	readonly disabled: boolean;
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
				title="Undo (Ctrl+Z)"
				disabled={disabled || !canUndo}
				onClick={onUndo}
			>
				Undo
			</Button>
			<Button variant="tool" icon="erase" title="Erase (Backspace)" disabled={disabled} onClick={onErase}>
				Erase
			</Button>
			<Button
				variant="tool"
				icon="notes"
				title="Pencil notes (N)"
				aria-pressed={notesMode}
				disabled={disabled}
				onClick={onToggleNotes}
			>
				Notes
			</Button>
			<Button
				variant="tool"
				icon="hint"
				title="Reveal a cell (H)"
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
