import { DIFFICULTY_ORDER, type Difficulty } from './types';

export interface DifficultyConfig {
	readonly id: Difficulty;
	readonly label: string;
	/** Target number of given cells. Digging is symmetric, so counts are odd. */
	readonly clues: number;
	readonly description: string;
	/** How many fresh solution grids to try before accepting the best result. */
	readonly attempts: number;
}

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
	easy: {
		id: 'easy',
		label: 'Easy',
		clues: 45,
		description: 'A gentle warm-up with plenty of starting numbers.',
		attempts: 2,
	},
	medium: {
		id: 'medium',
		label: 'Medium',
		clues: 35,
		description: 'A steady puzzle that still rewards scanning.',
		attempts: 3,
	},
	hard: {
		id: 'hard',
		label: 'Hard',
		clues: 29,
		description: 'Sparser givens — notes and crosshatching help.',
		attempts: 5,
	},
	expert: {
		id: 'expert',
		label: 'Expert',
		clues: 25,
		description: 'Very few givens. Patience required.',
		attempts: 8,
	},
};

export function isDifficulty(value: string): value is Difficulty {
	return (DIFFICULTY_ORDER as readonly string[]).includes(value);
}

export function difficultyLabel(difficulty: Difficulty): string {
	return DIFFICULTY_CONFIG[difficulty].label;
}
