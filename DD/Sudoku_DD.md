# Sudoku — Retro Arcade Cabinet Design Spec

**Version:** 1.0
**Author:** Playology Entertainment
**Status:** Implemented (v1) — shipped into the Retro Arcade in `PlayTools.html`; documented retroactively 2026-08-06 per `ROADMAP.md` backlog item A2 (undocumented-cabinet audit).
**Parent Doc:** `PlayTools_DD.md` (this cabinet extends §5.5 Retro Arcade Module)

> **Build note (as shipped).** Classic 9×9 Sudoku: a backtracking generator
> produces a randomized complete solution, then digs a guaranteed-unique puzzle
> down to a per-difficulty clue count (Easy 42, Medium 34, Hard 27 givens).
> Mistakes never end the run — the scoring/grade is entirely time- and
> hint-based, with a flat 30s penalty added to elapsed time per hint used.
> Ships as `Views.sudoku` at tool id `arcade_sudoku`, route `#/arcade/sudoku`.

---

## 1. Concept

**Sudoku** is a faithful, unskinned classic 9×9 logic puzzle dropped into the
Retro Arcade under PlayTools' house neon-CRT treatment rather than a themed
reskin (contrast Mac Pan/Overdrive, which reskin their source material). The
puzzle itself carries no fiction — the "theming" is purely the presentation:
a DOM grid rendered inside the shared `crtWrapTV()` bezel with a neon-violet
glow (`var(--neon-4)` border, violet box-shadow bloom), teal/violet cell-state
highlighting, and a chunky pixel-font neon number pad below the board. The
game trains **Focus** (sustained attention across a long single-sitting solve)
and **Strategy** (deduction), per its DNA vector.

## 2. Core Loop

* **Board generation.** `generate(givensTarget)` first fills an empty 81-cell
  grid via randomized backtracking (`fillSolution`, trying digits 1–9 in
  shuffled order at each cell) to get a complete valid solution. It then visits
  cells in random order and tries clearing each one, keeping the removal only
  if `countSolutions(puz, 2)` still returns exactly `1` — i.e. every puzzle
  shipped is checked to have a **unique** solution before a clue is dropped.
  Digging stops once `81 - givensTarget` cells have been successfully cleared.
* **Difficulty tiers** (`SK_LEVELS`), selected before pressing START and locked
  for the duration of a board:

  | Difficulty | Givens (clues) | `parA` (s) | `reward` | `base` score |
  | --- | --- | --- | --- | --- |
  | Easy | 42 | 240 | 0.5 | 600 |
  | Medium | 34 | 420 | 0.75 | 1200 |
  | Hard | 27 | 720 | 1.0 | 2400 |

* **Input.** Tap/click a cell to select it (arrow keys also move the
  selection), then tap a number-pad digit 1–9 or press the matching key to
  fill it; erase via the `⌫` pad button, `0`, `Backspace`, or `Delete`. Given
  (pre-filled) cells are not editable. Only empty/incorrect non-given cells
  accept input.
* **Live feedback, not lives.** There is no fail state from entering a wrong
  digit — `commit()` always writes the value. A digit that doesn't match the
  solution is tinted with the `.error` class and increments an internal
  `mistakes` counter that is tracked but never read by scoring, the recorder,
  or achievements (mistakes affect nothing downstream as shipped). A correct
  self-entered digit glows green (`.hintv` class, shared with the hint
  highlight). Peer cells (same row/column/box) and same-value cells get subtle
  highlight treatments; completed digits (9 placed) dim out on the number pad.
* **Undo / Redo.** Every commit pushes `{idx, prev, next}` onto a `history`
  stack (and clears the `future` redo stack); Undo/Redo pop/push between the
  two stacks.
* **Hint.** `hint()` fills in the correct digit for the currently selected
  cell if it's wrong/empty, else the first incorrect/empty cell found by
  scanning the board. Each hint increments `hintsUsed` and is itself routed
  through `commit(idx, solution[idx], true)`, so a hinted cell is
  indistinguishable on the board from a correct manual entry (both get
  `.hintv`) — only the `hintsUsed` counter records that it was assisted.
* **Reset vs. New Board.** "⟲ Reset" wipes all entries back to the original
  givens on the *same* puzzle (restarts the timer, keeps `given`/`solution`).
  "✦ New Board" calls `startGame()` again, which regenerates a fresh puzzle at
  the currently selected difficulty.
* **Win condition.** After every commit, `checkSolved()` compares the full
  81-cell board against `solution` cell-by-cell; an exact match calls
  `finish()`.
* **Timer.** A plain elapsed-time stopwatch (`elapsedMs`), started on
  `startGame()`/`resetBoard()`, ticking and re-rendering the HUD once per
  second, stopped on `finish()`. There is no countdown — the clock only
  counts up, and only affects the eventual grade (see §3), not a fail state.

## 3. Scoring & Grade

On `finish()`:

```js
const seconds = elapsedMs/1000;
const effective = seconds + hintsUsed*SK_HINT_PENALTY;          // hints cost time toward your grade
const comp = clamp01(0.9 * lv.parA / Math.max(1, effective));   // solving at par-A time lands comfortably in A; beating par earns S
const g = arcadeGrade(comp);
const score = Math.round(lv.base * comp);
```

`SK_HINT_PENALTY = 30` — each hint used adds a flat 30 simulated seconds to
your solve time before grading, so hints cost time-toward-grade rather than
being free. `comp` is a completion-quality ratio, not a raw time: solving in
exactly `0.9 × parA` effective seconds yields `comp = 1.0`; going faster than
that pushes `comp` above 1.0 before `clamp01` caps it, so beating 90% of par
time is what "comfortably lands in A / earns S" as the code comment states.
The shared `arcadeGrade(comp)` helper (line 9882) then buckets it:

```js
function arcadeGrade(comp){ return comp>=0.92?'S':comp>=0.8?'A':comp>=0.65?'B':comp>=0.45?'C':'F'; }
```

`score = Math.round(lv.base * comp)`, so score scales with both the
difficulty's `base` value and how comfortably par was beaten. `Attr.applyVector`
is called with `{focus:12, strategy:8}` scaled by `comp*lv.reward` — so Focus/
Strategy gains scale with both solve quality and the chosen difficulty's
`reward` multiplier (0.5 / 0.75 / 1.0 for Easy/Medium/Hard), rewarding harder
boards more per point of `comp`.

## 4. PlayTools Integration

### 4.1 Tool registry + route

```js
{ id:'arcade_sudoku', lab:'Arcade', name:'Sudoku', railName:'Sudoku', icon:'🔢', tag:'mvp', route:'#/arcade/sudoku',
  desc:'Fill the 9×9 grid so every row, column & box holds 1–9 — pick a difficulty, beat the clock & lean on hints only if you must.', dna:'Focus +12 · Strategy +8' },
```

```js
Router.add('#/arcade/sudoku', Views.sudoku);
```

* **DNA vector:** Focus +12 · Strategy +8 — a long single-sitting logic solve
  rewards sustained concentration (Focus) more than pure deduction skill
  (Strategy), matching the 12/8 weighting used elsewhere for
  attention-heavy over pattern-heavy cabinets.

### 4.2 Metagame recorder

```js
// record a solved Sudoku board. Replayable puzzle, so toolsCompleted is credited
// only on the first-ever solve to keep Gamer Score honest; best score, per-difficulty
// best solve time, modest arcade points and counters update every solve.
function recordSudokuRun(score, ctx){
  Store.update(d=>{
    d.runs++;
    if(!d.bests.arcade_sudoku){ d.toolsCompleted++; d.bests.arcade_sudoku={value:score, mode:'max'}; }
    else if(score>d.bests.arcade_sudoku.value){ d.bests.arcade_sudoku.value=score; }
    const bt = d.bests.arcade_sudoku.times || (d.bests.arcade_sudoku.times={});  // best (min) seconds per difficulty
    if(ctx && ctx.diff && ctx.seconds!=null){
      if(!(ctx.diff in bt) || ctx.seconds<bt[ctx.diff]) bt[ctx.diff]=ctx.seconds;
    }
    d.arcadePoints += Math.round(score/30);   // modest metagame contribution — avoids grind-farming the Gamer Score
    d.counters.sudokuSolves=(d.counters.sudokuSolves||0)+1;
    if(ctx && ctx.diff==='hard' && ctx.hints===0) d.counters.sudokuHardClean=(d.counters.sudokuHardClean||0)+1;
  });
}
```

Called on every solve as `recordSudokuRun(score, {diff:lv.key, seconds,
hints:hintsUsed})`. Behavior, exactly as the shipped comment states:
`toolsCompleted` is credited **only on the first-ever solve** (Sudoku is a
replayable puzzle, so repeated solves don't keep pumping Gamer Score);
`d.bests.arcade_sudoku.value` tracks the max `score` seen; a nested
`d.bests.arcade_sudoku.times{easy,medium,hard}` map tracks the **minimum**
(best) solve time per difficulty independently of score; `arcadePoints`
grows by `Math.round(score/30)` every solve (a modest, uncapped-but-small
metagame contribution, same divisor pattern used by the Packer recorder);
`d.counters.sudokuSolves` increments every solve; and
`d.counters.sudokuHardClean` increments specifically when a Hard board is
solved with zero hints — a persistent counter that backs the `sudoku_purist`
achievement (§4.3) even outside the triggering run's own context.

This cabinet's A/S grade clears pay into the universal NetCoin arcade-grade
gate documented in `DD/Rig_DD.md` §86/§292 (`GRADE_A=50`, `GRADE_S=100`,
capped to once per cabinet per local day) — no cabinet-specific payout logic
exists in `Views.sudoku` itself; the grade computed in §3 is simply what that
shared gate reads.

`Ach.evaluate({tool:'sudoku', grade:g, score, difficulty:lv.key,
hints:hintsUsed, seconds})` fires the achievement check (§4.3), and the
Universal Share Card is invoked via `shareRow({ lab:'RETRO ARCADE',
tool:'Sudoku', glyph:'🔢', grade:g, metric:[{k:'Mode',...},{k:'Time',...},
{k:'Hints',...}], designation: ..., badge: (lv.key==='hard' &&
hintsUsed===0) ? 'Sudoku Purist' : null })` — the designation string ladders
S→"Grid Master", A→"Logic Ace", B→"Steady Solver", C→"Casual Puzzler", else
"Pencil Pusher", and the share card carries a one-off "Sudoku Purist" badge
label whenever that same Hard/zero-hint condition is met on the just-finished
run (independent of, but aligned with, the persistent achievement below).

### 4.3 Cabinet achievements

| id | Name | Icon | Condition |
| --- | --- | --- | --- |
| `sudoku_ace` | Sudoku Ace | 🔢 | `test:(d,c)=> c && c.tool==='sudoku' && (c.grade==='A'||c.grade==='S')` — earn an A grade or better in Sudoku. |
| `sudoku_purist` | Sudoku Purist | 🧩 | `test:(d,c)=> (c && c.tool==='sudoku' && c.difficulty==='hard' && c.hints===0) \|\| !!(d.counters && d.counters.sudokuHardClean>=1)` — "Solve a Hard Sudoku with no hints." |

`sudoku_purist`'s test is doubly satisfiable: it passes either on the exact
run just finished (Hard difficulty, `hintsUsed===0`, matching the view's own
`lv.key==='hard' && hintsUsed===0` badge check at `finish()`) **or** at any
later evaluation via the persistent `d.counters.sudokuHardClean` counter
that `recordSudokuRun` bumps under the same condition — so a clean Hard solve
unlocks it immediately, and it also stays unlockable retroactively via the
counter if the achievement check is re-run (e.g. after an achievements-list
update) without requiring another live Hard/no-hint run.

## 5. Art & Audio Direction

* **Rendering:** the board is a real DOM grid — 81 reusable `<div class="sk-cell">`
  elements laid out via CSS grid (`display:grid; grid-template-columns:repeat(9,1fr)`)
  inside a `.sk-board` housed in the shared `crtWrapTV()` bezel, rather than a
  `<canvas>`. This matches the comment at line 1064
  ("Sudoku (Retro Arcade) — DOM 9×9 grid + neon number pad") and is the one
  Retro Arcade cabinet documented so far built this way instead of on canvas.
* **Palette:** dark near-black board background (`#05030f`) with a violet
  neon border/glow (`var(--neon-4)`, `rgba(124,92,255,…)` box-shadow bloom);
  3×3 box separators are drawn as thicker violet rule lines via `nth-child`
  CSS selectors rather than a separate overlay layer. Given (pre-filled)
  digits render in a cooler off-white (`#cdd6ff`) to read as distinct from
  player-entered digits; correct/hinted entries glow in the secondary neon
  accent (`--neon-5`); errors tint in the shared `--danger` red; the selected
  cell, its row/column/box peers, and same-value cells each get a distinct
  translucent highlight tint (teal `same`, violet `peer`, brighter teal
  `selected`).
* **Number pad:** a row of 1–9 pixel-font buttons plus an erase (`⌫`) button
  below the board (`.sk-pad`), styled to match the arcade's other button
  chrome; a digit's pad button dims to 25% opacity and stops accepting clicks
  once all 9 copies of that digit are placed on the board.
* **Audio:** short WebAudio-synthesized blips via the shared `makeBlip`
  helper, muteable per-cabinet (`soundToggle('sudokuMute')`) — a square-wave
  tone on placing a digit, a triangle-wave tone on erase, a sine tone on
  hint, a sawtooth tone on an incorrect placement, and a four-note ascending
  square-wave arpeggio (523/659/784/1047 Hz) on solving the board. No audio
  files; all tones are generated at runtime.

## 6. Session Rules summary

| Action | Result |
| --- | --- |
| Select a cell, enter 1–9 | Fills the cell (if it's an editable non-given cell); wrong digits show a red `.error` tint but do not end the run. |
| Erase (`⌫` / `0` / Backspace / Delete) | Clears the selected cell's entry. |
| Undo / Redo | Steps backward/forward through the commit history stack. |
| Hint | Fills the selected (or first) incorrect/empty cell with its correct digit; increments `hintsUsed`, which adds a flat 30s penalty to effective solve time at grading. |
| Reset | Clears all non-given entries on the current puzzle back to blank; restarts the timer; keeps the same puzzle/solution. |
| New Board | Generates and starts a fresh puzzle at the currently selected difficulty. |
| Fill every cell to match the solution | Triggers `finish()` — stops the timer, computes score/grade, applies DNA, records the run, evaluates achievements, opens the Share Card. |
| Change difficulty | Only permitted while not `playing` (the difficulty selector is dimmed and inert mid-board). |

## 7. Notes from retroactive documentation

* The `mistakes` counter is tracked throughout play (incremented on any wrong
  entry) but is never read by the scoring formula, the recorder, or any
  achievement `test:` — as shipped it has no gameplay or metagame
  consequence beyond driving the red `.error` cell tint.
* `parA` reads as "par at grade A" (0.9× of it yields `comp=1.0`), but the
  code has no inline comment defining the name — this doc infers the
  intent from its usage in the `comp` formula and the surrounding comment
  ("solving at par-A time lands comfortably in A; beating par earns S").
