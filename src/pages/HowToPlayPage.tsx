import { useState } from 'react';
import { Button, ButtonLink } from '../components/Button';
import { Icon, type IconName } from '../components/Icon';
import styles from './HowToPlayPage.module.css';

export interface HowToPlayPageProps {
	readonly onStart: () => void;
}

type Unit = 'row' | 'column' | 'box';

const UNIT_TABS: ReadonlyArray<{ id: Unit; label: string }> = [
	{ id: 'row', label: 'Row' },
	{ id: 'column', label: 'Column' },
	{ id: 'box', label: 'Box' },
];

const UNIT_CAPTIONS: Record<Unit, string> = {
	row: 'A row is nine cells across. Every row must hold 1–9 exactly once.',
	column: 'A column is nine cells down. Every column must hold 1–9 exactly once.',
	box: 'A box is a 3×3 block. Every box must hold 1–9 exactly once.',
};

/** A finished, valid grid used only to illustrate the three groups. */
const EXAMPLE_GRID = [
	5, 3, 4, 6, 7, 8, 9, 1, 2, 6, 7, 2, 1, 9, 5, 3, 4, 8, 1, 9, 8, 3, 4, 2, 5, 6, 7, 8, 5, 9, 7, 6, 1, 4,
	2, 3, 4, 2, 6, 8, 5, 3, 7, 9, 1, 7, 1, 3, 9, 2, 4, 8, 5, 6, 9, 6, 1, 5, 3, 7, 2, 8, 4, 2, 8, 7, 4, 1, 9,
	6, 3, 5, 3, 4, 5, 2, 8, 6, 1, 7, 9,
];

const HIGHLIGHTED_ROW = 4;
const HIGHLIGHTED_COLUMN = 4;

function inUnit(unit: Unit, row: number, col: number): boolean {
	if (unit === 'row') {
		return row === HIGHLIGHTED_ROW;
	}
	if (unit === 'column') {
		return col === HIGHLIGHTED_COLUMN;
	}
	return row >= 3 && row <= 5 && col >= 3 && col <= 5;
}

const RULE_CARDS: ReadonlyArray<{
	readonly tint: string;
	readonly icon: IconName;
	readonly title: string;
	readonly body: string;
}> = [
	{
		tint: styles.tintPeach,
		icon: 'rows',
		title: 'Rows',
		body: 'Each of the nine horizontal lines must contain every digit from 1 to 9, with no repeats.',
	},
	{
		tint: styles.tintMint,
		icon: 'columns',
		title: 'Columns',
		body: 'Each of the nine vertical lines must contain every digit from 1 to 9, with no repeats.',
	},
	{
		tint: styles.tintLavender,
		icon: 'boxes',
		title: 'Boxes',
		body: 'Each 3×3 block — nine of them in total — must also contain 1–9 exactly once.',
	},
];

const STEPS: ReadonlyArray<{ readonly title: string; readonly body: string }> = [
	{
		title: 'Choose a difficulty',
		body: 'Easy puzzles have the most starting numbers; Expert has the fewest. Difficulty only changes how many cells you are given.',
	},
	{
		title: 'Select an empty cell',
		body: 'Click a cell, or move with the arrow keys. Rows, columns and boxes that share the cell are highlighted, along with every matching number.',
	},
	{
		title: 'Enter a number',
		body: 'Use the number pad or press 1–9. A wrong entry is marked and costs one of your three mistakes; the third mistake ends the round.',
	},
	{
		title: 'Reach for the tools',
		body: 'Notes turn the pad into pencil marks, Erase clears a cell, Hint reveals a correct digit, and Undo takes back your last move.',
	},
];

const TIPS: ReadonlyArray<{ readonly title: string; readonly body: string }> = [
	{
		title: 'Scan the busiest digit',
		body: 'Pick the number that appears most often and check where it can still go in each row, column and box.',
	},
	{
		title: 'Crosshatch to narrow a cell',
		body: 'Combine a row and a column that already contain a digit to rule out most of a box, often leaving a single square.',
	},
	{
		title: 'Take notes instead of guessing',
		body: 'Write the candidates in a cell. When one candidate disappears from every other cell in a group, that cell is decided.',
	},
];

export function HowToPlayPage({ onStart }: HowToPlayPageProps) {
	const [unit, setUnit] = useState<Unit>('row');

	return (
		<main id="how-to-play" className={styles.page}>
			<div className={`container ${styles.hero}`}>
				<p className={styles.eyebrow}>How to play</p>
				<h1 className={styles.title}>Sudoku is a logic puzzle, not a maths test.</h1>
				<p className={styles.lede}>
					Fill a 9×9 grid so that every row, every column and every 3×3 box contains the digits 1 to 9
					exactly once. You never have to guess — each puzzle here is built with a single solution.
				</p>
				<div className={styles.heroActions}>
					<Button variant="primary" size="lg" icon="play" onClick={onStart}>
						Start a puzzle
					</Button>
					<ButtonLink href="#/" variant="secondary" size="lg" icon="arrow-left">
						Back to game
					</ButtonLink>
				</div>
			</div>

			<div className={`container ${styles.body}`}>
				<section className={styles.section} aria-labelledby="rules-heading">
					<h2 className={styles.sectionTitle} id="rules-heading">
						The only rule
					</h2>
					<p className={styles.sectionLede}>
						Three groups overlap on the grid, and each one has the same requirement: all nine digits,
						no repeats.
					</p>

					<div className={styles.ruleGrid}>
						{RULE_CARDS.map((card) => (
							<article key={card.title} className={`${styles.ruleCard} ${card.tint}`}>
								<span className={styles.ruleIcon} aria-hidden="true">
									<Icon name={card.icon} size={22} />
								</span>
								<h3>{card.title}</h3>
								<p>{card.body}</p>
							</article>
						))}
					</div>

					<div className={styles.example}>
						<div className={styles.exampleHeader}>
							<div className={styles.unitTabs} role="group" aria-label="Highlight a group on the example grid">
								{UNIT_TABS.map((tab) => (
									<button
										key={tab.id}
										type="button"
										className={
											unit === tab.id ? `${styles.unitTab} ${styles.unitTabActive}` : styles.unitTab
										}
										aria-pressed={unit === tab.id}
										onClick={() => setUnit(tab.id)}
									>
										{tab.label}
									</button>
								))}
							</div>
							<p className={styles.exampleCaption} aria-live="polite">
								{UNIT_CAPTIONS[unit]}
							</p>
						</div>

						<div className={styles.exampleBoard} aria-hidden="true">
							{EXAMPLE_GRID.map((value, index) => {
								const row = Math.floor(index / 9);
								const col = index % 9;
								const highlighted = inUnit(unit, row, col);
								const focused = row === HIGHLIGHTED_ROW && col === HIGHLIGHTED_COLUMN;
								const classNames = [styles.exampleCell];
								if (highlighted) {
									classNames.push(styles.exampleHighlight);
								}
								if (focused) {
									classNames.push(styles.exampleFocus);
								}
								return (
									<span key={index} className={classNames.join(' ')} data-row={row} data-col={col}>
										{value}
									</span>
								);
							})}
						</div>
					</div>
				</section>

				<section className={styles.section} aria-labelledby="steps-heading">
					<h2 className={styles.sectionTitle} id="steps-heading">
						How a game works
					</h2>
					<div className={styles.steps}>
						{STEPS.map((step, index) => (
							<article key={step.title} className={styles.step}>
								<span className={styles.stepNumber} aria-hidden="true">
									{index + 1}
								</span>
								<div className={styles.stepBody}>
									<h3>{step.title}</h3>
									<p>{step.body}</p>
								</div>
							</article>
						))}
					</div>
				</section>

				<section className={styles.section} aria-labelledby="tips-heading">
					<h2 className={styles.sectionTitle} id="tips-heading">
						Good habits
					</h2>
					<div className={styles.ruleGrid}>
						{TIPS.map((tip) => (
							<article key={tip.title} className={`${styles.ruleCard} ${styles.tintMint}`}>
								<span className={styles.ruleIcon} aria-hidden="true">
									<Icon name="search" size={22} />
								</span>
								<h3>{tip.title}</h3>
								<p>{tip.body}</p>
							</article>
						))}
					</div>
				</section>

				<aside className={styles.callout}>
					<p className={styles.calloutTitle}>You never need to guess.</p>
					<p>
						A well-formed Sudoku has exactly one solution, and every puzzle in this game is checked for
						uniqueness before you see it. If two candidates look equally valid, there is always a piece
						of logic that rules one of them out.
					</p>
				</aside>

				<section className={styles.section} aria-labelledby="controls-heading">
					<h2 className={styles.sectionTitle} id="controls-heading">
						Controls
					</h2>
					<div className={styles.controlsList}>
						<div className={styles.controlRow}>
							<span className={styles.controlName}>Select a cell</span>
							<span className={styles.keys}>
								<kbd>Click</kbd>
								<kbd>↑</kbd>
								<kbd>↓</kbd>
								<kbd>←</kbd>
								<kbd>→</kbd>
							</span>
						</div>
						<div className={styles.controlRow}>
							<span className={styles.controlName}>Enter a number</span>
							<span className={styles.keys}>
								<kbd>1</kbd>
								<kbd>–</kbd>
								<kbd>9</kbd>
							</span>
						</div>
						<div className={styles.controlRow}>
							<span className={styles.controlName}>Pencil notes</span>
							<span className={styles.keys}>
								<kbd>N</kbd>
							</span>
							<span className={styles.controlHint}>
								Toggles the number pad between filling a cell and writing candidate marks.
							</span>
						</div>
						<div className={styles.controlRow}>
							<span className={styles.controlName}>Erase a cell</span>
							<span className={styles.keys}>
								<kbd>⌫</kbd>
							</span>
							<span className={styles.controlHint}>Clears the selected cell and its notes.</span>
						</div>
						<div className={styles.controlRow}>
							<span className={styles.controlName}>Hint</span>
							<span className={styles.keys}>
								<kbd>H</kbd>
							</span>
							<span className={styles.controlHint}>
								Reveals the correct digit for the selected cell. Three hints per puzzle.
							</span>
						</div>
						<div className={styles.controlRow}>
							<span className={styles.controlName}>Undo</span>
							<span className={styles.keys}>
								<kbd>Ctrl</kbd>
								<kbd>Z</kbd>
							</span>
							<span className={styles.controlHint}>Steps back through your entries and notes.</span>
						</div>
						<div className={styles.controlRow}>
							<span className={styles.controlName}>Pause</span>
							<span className={styles.keys}>
								<kbd>Esc</kbd>
							</span>
							<span className={styles.controlHint}>Stops the timer and hides the board.</span>
						</div>
					</div>
					<p className={styles.reference}>
						Rules reference:{' '}
						<a href="https://sudoku.com/sudoku-rules" target="_blank" rel="noreferrer noopener">
							Sudoku rules on sudoku.com
						</a>
						.
					</p>
				</section>

				<div className={styles.ctaCard}>
					<h2>Ready for a quiet five minutes?</h2>
					<p>Pick a difficulty in the header and the grid is ready. Notes and hints are there if you need them.</p>
					<Button variant="primary" size="lg" icon="play" onClick={onStart}>
						Start a puzzle
					</Button>
				</div>
			</div>
		</main>
	);
}
