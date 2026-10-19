import { useEffect, useRef } from 'react';
import { DIFFICULTY_CONFIG } from '../features/sudoku/difficulties';
import { DIFFICULTY_ORDER, type Difficulty } from '../features/sudoku/types';
import { Button } from './Button';
import styles from './NewGameDialog.module.css';

export interface NewGameDialogProps {
	readonly open: boolean;
	readonly current: Difficulty;
	readonly onSelect: (difficulty: Difficulty) => void;
	readonly onClose: () => void;
}

export function NewGameDialog({ open, current, onSelect, onClose }: NewGameDialogProps) {
	const dialogRef = useRef<HTMLDialogElement | null>(null);
	const currentRef = useRef<HTMLButtonElement | null>(null);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (dialog === null) {
			return;
		}
		if (open && !dialog.open) {
			dialog.showModal();
			currentRef.current?.focus();
		} else if (!open && dialog.open) {
			dialog.close();
		}
	}, [open]);

	return (
		<dialog
			ref={dialogRef}
			className={styles.dialog}
			aria-labelledby="new-game-title"
			onClose={onClose}
			onClick={(event) => {
				if (event.target === event.currentTarget) {
					onClose();
				}
			}}
		>
			<div className={styles.content}>
				<h2 className={styles.title} id="new-game-title">
					New game
				</h2>
				<p className={styles.body}>Choose a difficulty for the next puzzle.</p>

				<div className={styles.options}>
					{DIFFICULTY_ORDER.map((difficulty) => {
						const config = DIFFICULTY_CONFIG[difficulty];
						const isCurrent = difficulty === current;
						return (
							<button
								key={difficulty}
								ref={isCurrent ? currentRef : undefined}
								type="button"
								className={isCurrent ? `${styles.option} ${styles.current}` : styles.option}
								aria-current={isCurrent ? 'true' : undefined}
								onClick={() => onSelect(difficulty)}
							>
								<span className={styles.optionLabel}>{config.label}</span>
								<span className={styles.optionDescription}>{config.description}</span>
							</button>
						);
					})}
				</div>

				<Button variant="secondary" fullWidth onClick={onClose}>
					Cancel
				</Button>
			</div>
		</dialog>
	);
}
