import styles from './NumberPad.module.css';

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export interface NumberPadProps {
	/** Correct placements per digit, indexed by digit (0 unused). */
	readonly counts: readonly number[];
	readonly disabled: boolean;
	readonly onDigit: (digit: number) => void;
}

export function NumberPad({ counts, disabled, onDigit }: NumberPadProps) {
	return (
		<div className={styles.pad} role="group" aria-label="Number pad">
			{DIGITS.map((digit) => {
				const placed = counts[digit] ?? 0;
				const remaining = Math.max(0, 9 - placed);
				const complete = remaining === 0;
				return (
					<button
						key={digit}
						type="button"
						className={styles.key}
						disabled={disabled || complete}
						onClick={() => onDigit(digit)}
						aria-label={
							complete
								? `${digit}: all nine are already placed`
								: `Enter ${digit}, ${remaining} remaining`
						}
					>
						<span aria-hidden="true">{digit}</span>
						<span className={styles.remaining} aria-hidden="true">
							{complete ? 'done' : `${remaining} left`}
						</span>
					</button>
				);
			})}
		</div>
	);
}
