# DabSudoku

A quiet, focused Sudoku game. Four difficulties, pencil notes, hints, undo, a
mistake limit, and a short "How to play" tutorial.

Built on the branch `rebuild/notion-sudoku`, which replaced the previous
Next.js prototype from scratch.

- Stack: React + TypeScript, Vite, CSS custom properties + CSS Modules, pnpm,
  Vitest (the stack required by the DabAZ design specification).
- Design: the **Notion** company style was explicitly requested and is the
  primary visual reference. The canonical DabAZ design document was read first
  and still governs tokens, spacing, radius, typography scale, breakpoints and
  accessibility. Where the two disagree, Notion wins — see
  [Design decisions](#design-decisions).
- Game logic references [sudoku.com](https://sudoku.com); the tutorial
  references [sudoku.com/sudoku-rules](https://sudoku.com/sudoku-rules). All
  copy in this project is original.

## Getting started

```bash
pnpm install
pnpm dev        # http://127.0.0.1:5173
pnpm build      # tsc --noEmit && vite build
pnpm preview    # serve the production build
pnpm test       # Vitest
pnpm typecheck  # tsc --noEmit
```

## Features

**Game**

- Four difficulties — Easy (45 givens), Medium (35), Hard (29), Expert (25).
  Selecting one in the header immediately starts a new puzzle.
- Every puzzle is generated with **exactly one solution**, verified before it is
  shown, and givens are removed with 180° rotational symmetry like most
  published puzzles.
- Timer (wall-clock accurate, pauses with the game), mistake counter with a
  three-mistake limit, three hints per puzzle.
- Pencil notes per cell, undo history, erase, pause, and a "New game" action.
- Wrong entries are marked in place and counted; notes are auto-cleaned from
  peers when a digit is placed.
- Keyboard: arrows move the selection from anywhere on the page, `1`–`9` fill,
  `N` toggles notes, `H` hints, `Backspace`/`Delete`/`0` erases, `Ctrl+Z` undoes,
  `Esc` pauses.
- The game pauses automatically when the tab is hidden or when you open the
  tutorial, so the clock cannot run unattended.

**How to play**

- Header button navigates to `#/how-to-play` (hash routing, no router
  dependency).
- Explains the single rule, with an interactive example grid that highlights a
  row, column or box.
- Covers the flow of a game, three solving habits, the full control list with
  keyboard shortcuts, and links to the sudoku.com rules as a reference.

**Accessibility**

- Semantic landmarks, a skip link, and 81 board cells as real `<button>`
  elements with descriptive accessible names (row, column, value, "incorrect",
  "revealed by a hint", notes).
- Roving `tabindex` on the board (one tab stop, arrows to move).
- A polite live region announces every action ("Mistake in row 1, column 3 — 2
  of 3 left.", "Puzzle solved — 0 mistakes.").
- Status is never communicated by color alone: mistakes have dots **and** a
  `n / 3` count, wrong cells have a dot and the word "incorrect" in their label,
  and all overlays are labeled dialogs. The selected cell is shown by its
  lavender background only, so its accessible name also reports "selected".
- Visible focus rings everywhere; `prefers-reduced-motion` is respected.

## How the engine works

| File | Responsibility |
| --- | --- |
| `src/features/sudoku/board.ts` | Grid constants, row/column/box math, precomputed peers, cell descriptions. |
| `src/features/sudoku/solver.ts` | Bitmask solver with an MRV heuristic; `countSolutions(grid, limit)` and `isValidSolution`. |
| `src/features/sudoku/generator.ts` | Builds a full grid from a shuffled base pattern, then digs symmetric holes, keeping uniqueness after every removal. |
| `src/features/sudoku/game.ts` | Pure reducer: selection, input, notes, erase, hint, undo, pause, win/loss, and the digit counters for the number pad. |
| `src/features/sudoku/difficulties.ts` | Clue targets and per-difficulty generation attempts. |
| `src/features/sudoku/useGameTimer.ts` | Wall-clock timer derived from `Date.now()`, so a throttled tab cannot drift. |

Generation tries several solution grids per difficulty and keeps the sparsest
result, because a target clue count is not always reachable from a given
solution. Uniqueness is confirmed with a counting solver that stops at two
solutions, which is far cheaper than enumerating all of them. Generating one
puzzle per difficulty takes well under a second (measured in the test suite).

## Project structure

```
index.html                     preserved icon/OG tags + font links
public/                        favicon.ico, apple-icon.png, opengraph-image.jpg
src/
  App.tsx                      routing, game lifecycle, difficulty state
  components/                  Icon, Button, Header, DifficultyTabs, SudokuBoard,
                               NumberPad, GameControls, GameStatusBar, BoardOverlay
  features/sudoku/             engine, reducer, timer, tests
  hooks/useRoute.ts            hash router
  pages/                       GamePage, HowToPlayPage
  styles/tokens.css            primitives, semantic tokens, Notion palette
  styles/global.css            reset, container, focus ring, reduced motion
```

## Preserved assets

The previous application's branding assets were kept, unchanged, and are still
wired up in `index.html`:

| Asset | Previous path | New path | Used for |
| --- | --- | --- | --- |
| `favicon.ico` | `src/app/icon.ico` | `public/favicon.ico` | `<link rel="icon">` and the header logo |
| `apple-icon.png` | `src/app/apple-icon.png` | `public/apple-icon.png` | `<link rel="apple-touch-icon">` |
| `opengraph-image.jpg` | `src/app/opengraph-image.jpg` | `public/opengraph-image.jpg` | `og:image` and `twitter:image` |

Everything else from the previous implementation was deleted; the new app was
written from scratch.

## Design decisions

Read first: the canonical DabAZ `design.md`, plus `notion.md` for the requested
company style.

**Followed from the canonical specification:** the 14 approved neutral
primitives, the 4px spacing scale, the radius scale, control/icon sizing, the
five breakpoints, container widths and gutters (16/24/32px), the WCAG AA
contrast targets, the "never rely on color alone" rule, and the required stack.

**Overridden by the requested Notion style (and why):**

1. **A brand accent color.** The canonical document is neutral-first with no
   permanent accent. Notion's purple (`#5645d4`) is used for the dominant CTA
   ("New game", "Start a puzzle") and for user-entered digits, exactly as the
   Notion reference reserves it.
2. **Warm neutrals and pastel tints.** Surfaces, hairlines and text use the
   Notion values (`#37352f` charcoal, `#f6f5f4` surface, `#e5e3df` hairline,
   slate/steel text) rather than the canonical gray mapping, and the tutorial
   uses Notion's pastel card tints.
3. **Type scale.** Notion's scale (11–48px with negative tracking on headings)
   is used instead of the canonical 12–48px scale.

**Provisional decisions that still need review:**

- **No dark theme.** The Notion reference documents no dark tokens beyond its
  navy hero band, and the canonical document forbids inventing them. Only light
  is implemented.
- **Typeface.** Notion Sans is proprietary and unavailable; Inter is its
  documented fallback and the canonical primary typeface, so Inter is loaded
  from Google Fonts with a CJK-capable system fallback.
- **Focus ring.** Purple 2px, mirroring Notion's focused-input treatment. The
  canonical document leaves focus-ring values open, so this is provisional.
- **Motion.** 150–180ms ease, the range the Notion reference suggests.
- **Difficulty is defined by clue count** plus a uniqueness guarantee. It does
  not grade solving techniques, so an Expert grid can occasionally play easier
  than its clue count implies.

**Contrast verification.** All foreground/background pairs actually used were
measured with the WCAG relative-luminance formula:

| Pair | Ratio | Target |
| --- | --- | --- |
| Charcoal on canvas / surface / soft | 12.26 / 11.26 / 11.74 | 4.5 |
| Slate on canvas / surface | 6.80 / 6.24 | 4.5 |
| Purple user digit on canvas / lavender / sky / yellow | 6.57 / 5.11 / 5.45 / 6.09 | 4.5 |
| White on purple CTA | 6.57 | 4.5 |
| Link blue on canvas | 4.57 | 4.5 |
| Error red on canvas | 4.51 | 4.5 |
| Error red on rose (large digits only) | 3.66 | 3 |
| Purple-800 on lavender (active notes toggle) | 11.06 | 4.5 |
| White on the active difficulty pill | 21.00 | 4.5 |
| Charcoal on pastel cards (peach / mint / lavender / yellow-bold) | 10.36 / 10.43 / 9.54 / 9.90 | 4.5 |
| Error dot on rose (non-text) | 3.66 | 3 |
| Steel on canvas (icons only) | 4.54 | 3 |

One failure was found and fixed during this check: Notion's teal
(`#2a9d99`) on the mint hint tint measured **2.80:1**, under the 3:1 non-text
target, so the hint marker now uses charcoal (10.43:1). Steel is deliberately
kept out of text roles because it measures 4.54:1 on white but only ~4.2:1 on
the warm surface.

## Verification

- `pnpm typecheck`, `pnpm test` (30 tests) and `pnpm build` all pass.
- Test coverage: solver validity, unique solutions per difficulty, symmetric
  givens, clue-count targets, generation performance, and the full reducer
  (correct/wrong input, notes and peer note cleanup, erase, hint allowance,
  undo, pause, digit counts, win and loss).
- Visually verified in the in-app browser at 1280×1000 and 375×812 on both
  pages: no horizontal overflow, correct board geometry (2px box separators),
  header wrapping, and all four overlays (loading, paused, solved, out of
  mistakes). The win path was verified end-to-end by solving a full puzzle
  through the real UI.

## Not done

- Nothing is committed: the branch `rebuild/notion-sudoku` holds the work as
  unstaged changes so you can review it before the first commit.
- No persistence: refreshing starts a new puzzle (state is not stored in
  `localStorage`).
- No dark theme, no sound, no statistics history.
