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
  dependency). Below the 640px breakpoint the header has no room for the label
  next to the theme button, so it collapses to the icon and the link keeps its
  accessible name.
- Explains the single rule, with an interactive example grid that highlights a
  row, column or box.
- Covers the flow of a game, three solving habits, the full control list with
  keyboard shortcuts, and links to the sudoku.com rules as a reference.

**Themes**

- Light and dark, switched by the sun/moon button in the header (the same icon
  pair DabMinesweeper uses). The button shows the theme it switches *to*.
- The choice is saved in `localStorage` and re-applied by an inline script in
  `index.html` before first paint, so a returning dark-theme visitor never sees
  a white flash. A first-time visitor gets the system preference.
- Theme switching is entirely a token concern: `data-theme` on `<html>` selects
  a second set of semantic values, and no component knows which theme is live.

**Installable / offline**

- Ships a web app manifest and a service worker, so the game installs to the
  home screen and keeps working with no connection once it has been opened
  once. See [Installable PWA](#installable-pwa).

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
- The theme button is a labelled control ("Switch to dark theme"), not an
  unlabelled icon, and it updates the browser `theme-color` to match.

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
index.html                     icon/manifest/OG tags + font links + theme boot script
public/                        brand icons, manifest.webmanifest, sw.js
src/
  App.tsx                      routing, game lifecycle, difficulty state
  components/                  Icon, Button, Header, DifficultyTabs, SudokuBoard,
                               NumberPad, GameControls, GameStatusBar, BoardOverlay
  features/sudoku/             engine, reducer, timer, tests
  hooks/useRoute.ts            hash router
  hooks/useTheme.ts            light/dark theme, persisted
  pages/                       GamePage, HowToPlayPage
  styles/tokens.css            primitives, semantic tokens, Notion palette,
                               dark theme overrides
  styles/global.css            reset, container, focus ring, reduced motion
```

## Brand assets

All five assets live in `public/` and are referenced from `index.html`:

| Asset | Size | Used for |
| --- | --- | --- |
| `favicon.png` | 256×256 | `<link rel="icon">` |
| `header-logo.png` | 512×512 | The logo mark beside the wordmark in the header |
| `og.jpg` | 1280×720 | `og:image` and `twitter:image` |
| `pwa-icon-192.png` | 192×192 | Manifest icon (`any`), `<link rel="apple-touch-icon">` |
| `pwa-icon-512.png` | 512×512 | Manifest icon (`any`) |
| `pwa-icon-maskable-192.png` | 192×192 | Manifest icon (`maskable`) |
| `pwa-icon-maskable-512.png` | 512×512 | Manifest icon (`maskable`) |

The two `maskable` files are the same artwork inset to 56.25% of the canvas
(the largest square whose corners still fit inside the maskable safe zone — a
circle 80% of the icon's width), centred on the artwork's own white background.
A launcher that masks icons to a circle or a squircle therefore never clips the
grid's outer frame. Every non-white pixel sits within 174px of the centre on the
512 file, against a 204.8px safe radius.

## Installable PWA

The app installs to the home screen and runs offline.

- `public/manifest.webmanifest` declares the name, `standalone` display, the
  start URL and scope, and the four icons: the full-bleed pair as `purpose:
  "any"` and the padded pair as `purpose: "maskable"`, so a masked launcher
  takes the inset artwork while everything else takes the full-bleed one.
  `theme_color` is the light `--color-canvas` (`#ffffff`) and
  `background_color` the page background (`--color-surface-soft`, `#fafaf9`);
  the `<meta name="theme-color">` tag is re-pointed at the dark canvas by
  `useTheme` while the app is running.
- `public/sw.js` precaches the shell (document, manifest, icons) on install and
  serves navigations network-first with the cached shell as the offline
  fallback. Everything else the page pulls in — Vite's hashed bundles, the
  Inter webfont — is cached stale-while-revalidate as it is used, so a second
  visit paints from disk and a new build is picked up on the visit after that.
  Bump `CACHE_VERSION` in `sw.js` to retire the old caches.
- `src/main.tsx` registers the worker on `load` and **only in the production
  build**, so the dev server is never served from a stale cache.

iOS does not read `maskable` icons, so `<link rel="apple-touch-icon">` still
points at the full-bleed `pwa-icon-192.png`. iOS rounds that icon with a
squircle whose corner radius is about 22% of its width, which can nick the
corners of the grid frame; an 85%-scale variant is what would avoid that if it
ever looks wrong on a home screen.

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

- **Dark theme values that the design documents do not define.** The canonical
  document's dark mapping table covers surfaces, text and borders, and those are
  used as-is. It defines nothing for the Notion pastel tints, the functional
  colors, or the shadow scale — and the Notion reference documents no dark theme
  at all — so those had to be derived rather than copied. Every derivation is
  listed under [Dark theme derivation](#dark-theme-derivation) with its measured
  contrast ratio. The canonical document marks functional colors, the shadow
  scale and the focus ring as open decisions, so none of this is presented as an
  approved standard.
- **Typeface.** Notion Sans is proprietary and unavailable; Inter is its
  documented fallback and the canonical primary typeface, so Inter is loaded
  from Google Fonts with a CJK-capable system fallback.
- **Focus ring.** Purple 2px, mirroring Notion's focused-input treatment. The
  canonical document leaves focus-ring values open, so this is provisional. Dark
  uses `brand-purple-300`, because the primary purple ring only reaches 2.70:1
  against the dark canvas.
- **Motion.** 150–180ms ease, the range the Notion reference suggests.
- **Difficulty is defined by clue count** plus a uniqueness guarantee. It does
  not grade solving techniques, so an Expert grid can occasionally play easier
  than its clue count implies.

## Dark theme derivation

`data-theme="dark"` on `<html>` re-points the semantic tokens in `tokens.css`;
the primitives never change. Three rules were used, in order of preference:

1. **Use the canonical dark mapping where it exists.** Page background
   `gray-950`, card/board background `gray-900`, secondary surface `gray-800`,
   text `gray-50` / `gray-300` / `gray-400`, borders `gray-800` / `gray-700`.
   DabSudoku's light theme already orders these the same way (page darkest, cards
   above it), so dark keeps that relationship.
2. **Reuse an approved value in a new role.** The purple text and focus ring
   become `brand-purple-300`, an approved Notion value; the primary purple only
   reaches 2.70:1 as text on the dark canvas. The CTA keeps the original purple
   fill, since white on it measures 6.57:1 either way.
3. **Derive from an approved value with `color-mix()`** where neither document
   defines a dark equivalent. No new hex literals were introduced:

| Token | Dark value | Derivation |
| --- | --- | --- |
| Card tints | `--color-tint-*` | approved pastel at 24% over the dark canvas |
| Board highlights | `--cell-bg-*` | the same pastels at 10–28%, see below |
| `--color-link` | `#4d9ee8` | Notion link blue at 70% toward white |
| `--color-link-pressed` | `#66aceb` | Notion link blue at 60% toward white |
| `--color-error` | `#eb7979` | Notion error red at 65% toward white |
| `--color-tint-wash` | translucent white | 10% white |
| `--color-board-veil` | translucent `gray-950` | 86%, matching the light veil's alpha |
| Shadows | stronger black | same alphas DabMinesweeper uses, so the two apps agree |

Lightening rather than darkening the functional colors is the point: the Notion
link blue measures 3.93:1 and the error red 2.56:1 on the dark canvas, both
under the 4.5:1 target, and going darker would only make it worse.

**Board highlights need their own percentages.** The light theme separates its
five board tints by hue at almost equal lightness (1.08–1.29:1 against white),
which works because pastels keep their chroma. Mixing the same pastels into a
near-black canvas does not: at one shared percentage all five collapse into the
same dark grey, and the selected cell became indistinguishable from the
row/column highlight — 1.03:1 between them, which is how the first version of
this shipped. The board therefore keeps the light theme's *ordering* but widens
the selection's step, because on a dark surface the selection has to be carried
by lightness rather than hue:

| Board role | Light (vs white) | Dark (vs canvas) |
| --- | --- | --- |
| Selected cell — lavender 28% | 1.29 | 2.22 |
| Error cell — rose 24% | 1.23 | 1.98 |
| Peer highlight — sky 12% | 1.21 | 1.37 |
| Hint highlight — mint 12% | 1.18 | 1.36 |
| Same-digit highlight — yellow 10% | 1.08 | 1.30 |

Every role ends up stronger in dark than its light counterpart, so nothing on
the board got fainter — the selection simply gained a real step instead of a
hue shift. The ceiling on it is its own text: the purple user digit only reaches
4.57:1 on a 28% cell, so going lighter would cost the contrast of the digits the
player just entered.

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

**Dark theme.** The same formula, re-run over the dark values:

| Pair | Ratio | Target |
| --- | --- | --- |
| Primary text on canvas / surface / soft | 17.18 / 14.50 / 18.97 | 4.5 |
| Secondary text on canvas / surface / soft | 12.09 / 10.21 / 13.36 | 4.5 |
| Tertiary text on canvas (icons only) | 7.11 | 3 |
| White on purple CTA / CTA hover | 6.57 / 8.77 | 4.5 |
| Purple user digit on canvas / surface | 10.14 / 8.56 | 4.5 |
| Link on canvas / surface | 6.29 / 5.31 | 4.5 |
| Link hover on canvas | 7.40 | 4.5 |
| Error red on canvas / soft | 6.44 / 7.11 | 4.5 |
| Focus ring on canvas / surface (non-text) | 10.14 / 8.56 | 3 |
| Accent border on canvas (non-text) | 10.14 | 3 |
| Primary text on card tints (worst: yellow) | 8.14 | 4.5 |
| Canvas text on the active difficulty pill | 17.93 | 4.5 |
| Rule-icon ink on the wash over a peach card | 6.40 | 4.5 |
| Board veil text contrast | 18.74 | 4.5 |
| **Selected cell** vs canvas / peer / same / hint | 2.22 / 1.62 / 1.70 / 1.63 | 1.5 |
| Peer / same-digit / hint highlight vs canvas | 1.37 / 1.30 / 1.36 | 1.2 |
| Error cell vs canvas / peer highlight | 1.98 / 1.45 | 1.2 |
| Given digit on selected / peer / same / hint | 7.74 / 12.53 / 13.19 / 12.60 | 4.5 |
| Purple user digit on selected / peer / same / hint | 4.57 / 7.40 / 7.79 / 7.44 | 4.5 |
| Pencil notes on selected / peer cell | 5.45 / 8.82 | 4.5 |
| Box separator on selected / peer cell (non-text) | 7.74 / 12.53 | 3 |
| Error digit and dot on the rose cell | 3.25 | 3 |
| Hint dot on the mint cell (non-text) | 12.60 | 3 |
| Grid line vs peer / selected cell | 1.16 / 1.87 | 1 |
| Disabled text on canvas (inactive control, exempt) | 2.29 | — |

56 of the 57 pairs checked clear their target. The exception is
**`--color-hairline-strong` on canvas at 1.73:1**, below the 3:1 non-text
target. It is not a dark-mode regression and it is not fixed here: the canonical
dark mapping table assigns `gray-700` to `color-border-strong`, and the light
theme's equivalent (`#c8c4be` on white) measures 1.75:1 for the same reason.
Raising it would mean overriding an approved mapping in both themes, which is a
design-system decision rather than a dark-mode one — flagging it instead. The
same caveat as light applies to the error red on the rose cell: it clears the
3:1 large-text target but not 4.5:1, and the board font is 17px on a narrow
phone.

## Verification

- `pnpm typecheck`, `pnpm test` (32 tests) and `pnpm build` all pass.
- Test coverage: solver validity, unique solutions per difficulty, symmetric
  givens, clue-count targets, generation performance, and the full reducer
  (correct/wrong input, notes and peer note cleanup, erase, hint allowance,
  undo, pause, digit counts, win and loss).
- Visually verified in the in-app browser at 1280×1000 and 375×812 on both
  pages: no horizontal overflow, correct board geometry (2px box separators),
  header wrapping, and all four overlays (loading, paused, solved, out of
  mistakes). The win path was verified end-to-end by solving a full puzzle
  through the real UI.
- The theme was verified the same way: both pages at 1280×900 and 375×812 in
  light and dark, the toggle round-trip, the persisted value, the updated
  `theme-color`, and no horizontal overflow at 375px. Light mode is unchanged
  from the pre-dark-theme build, since the light side of every new token is an
  alias of the value it replaced, and the dark board percentages are overrides
  that only apply under `data-theme="dark"`.
- The board's selection contrast was checked by reading the computed background
  of every cell in a real game, not by eye: with a cell selected, the four
  distinct cell colours present were `#171717` (plain), `#2f3132` (peer),
  `#2e2d2a` (same digit) and `#514f55` (selected).
- The icons and the PWA wiring were checked in the in-app browser against the
  production build (`pnpm preview`, since the worker is production-only): the
  manifest is served as `application/manifest+json` and parses, `favicon.png`,
  `header-logo.png` (loaded at 512×512) and `og.jpg` are the ones referenced,
  the worker activates and controls the page, and after one reload the shell
  cache holds the document, manifest and icons while the runtime cache holds the
  hashed bundles, the Google Fonts stylesheet and the Inter `woff2`. The caches
  were inspected rather than played back with the network actually cut, so an
  offline load was not exercised end to end.

## Not done

- No sound and no statistics history.
- The theme follows the system preference only on the first visit; it does not
  keep following it if the OS theme changes while the app is open, because an
  explicit choice in the header always wins afterwards.
- `prefers-contrast` is not handled.
- There is no in-app "new version ready" prompt: a new build is picked up on
  the visit after the one that installs it.
