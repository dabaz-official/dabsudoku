export const DIFFICULTY_ORDER = ['easy', 'medium', 'hard', 'expert'] as const;

export type Difficulty = (typeof DIFFICULTY_ORDER)[number];

/** A flat, row-major 9x9 grid. `0` means "empty". */
export type Grid = number[];

/** Per-cell pencil marks stored as a 9-bit mask (bit 0 => digit 1). */
export type Notes = number[];

export type Rng = () => number;
