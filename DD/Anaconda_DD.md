# My Anaconda — Retro Arcade Cabinet Design Spec

**Version:** 1.0
**Author:** Playology Entertainment
**Status:** Implemented (v1) — shipped into the Retro Arcade in `PlayTools.html`; documented retroactively 2026-08-06 per `ROADMAP.md` backlog item A2 (undocumented-cabinet audit).
**Parent Doc:** `PlayTools_DD.md` (this cabinet extends §5.5 Retro Arcade Module)

> **Build note (as shipped).** A faithful, grid-based Snake on a fixed **20×20**
> board with **three difficulty tiers** (Easy / Medium / Hard) that scale step
> speed and add static obstacle blocks — walls are solid on every tier, there is
> no screen-wrap. The run ends on any wall, self, or obstacle collision; scoring
> is a flat 10 points per pellet, graded against a per-tier par (`gradeMax`) via
> the shared `arcadeGrade()` ladder. Tool id `arcade_snake`, route `#/arcade/snake`.

---

## 1. Concept

**My Anaconda** is a *Snake*-faithful grid-crawler, reskinned as a neon serpent
loose on a CRT grid. The player steers a growing line of glowing segments
around a dark, gridlined board, devouring pulsing magenta pellets that make the
snake longer and the game faster, while avoiding the one thing that ends the
run instantly: touching a wall, a solid obstacle block, or its own tail. It's
the same "recognizable classic under a neon skin" treatment as the rest of the
Arcade line (cf. Mac Pan = Pac-Man, Overdrive = Pole Position) — no rules are
bent for the theme, just re-lit.

---

## 2. Core Loop

* **Board:** a fixed **20×20** grid (`SNK_GW=20, SNK_GH=20`), rendered at 18px
  per cell (`CELL=18`) for a 360×360 canvas, CRT-wrapped via `crtWrapTV()`.
* **Movement:** classic tick-stepped Snake — the snake advances one cell per
  step on a timer (`stepMs`), not continuously. Direction input is buffered
  into `nextDir` and applied at the start of the next step, and a reversal
  straight into the snake's own body is rejected outright (`setDir` ignores an
  input that is the exact opposite of the current heading once length > 1).
* **Controls:** Arrow keys or **W / A / S / D**. **Space / Enter** starts the
  run when not already playing.
* **Growth & speed:** eating a pellet appends a new head segment without
  popping the tail (the snake grows by one), awards **+10 score**, and
  immediately recomputes the step interval via
  `curStep() = Math.max(lvl.floor, lvl.start - snake.length*lvl.accel)` — the
  snake gets faster as it gets longer, down to a per-tier floor speed. Moving
  into an empty cell advances normally (head added, tail popped — no growth).
* **Death:** the run ends immediately (`gameOver()`) if the next head position
  is off the 20×20 grid, occupies any existing snake segment, or occupies an
  obstacle cell. There is no wrap-around on any tier.
* **Difficulty tiers** (`SNAKE_LEVELS`), selectable pre-run via a segmented
  control (locked once playing):

  | Tier | `start` (ms/step @ len 0) | `floor` (ms/step cap) | `accel` (ms shaved/segment) | `gradeMax` (score for S) | Obstacles |
  | --- | --- | --- | --- | --- | --- |
  | Easy | 155 | 95 | 1.6 | 360 | none |
  | Medium | 135 | 78 | 2.0 | 300 | 4 vertical bars (`SNK_MED_OBS`) flanking the centre |
  | Hard | 115 | 62 | 2.4 | 230 | Medium's bars + top/bottom horizontal bars + two short inner pillars (`SNK_HARD_OBS`) |

  Per the in-code comment, `gradeMax` deliberately **rises on Easy and falls on
  Hard** — Easy lets a skilled player survive indefinitely and farm score, so
  it needs a higher bar for a full grade; Hard's extra speed and obstacles end
  runs early, so a smaller score still represents comparable skill. All
  obstacle layouts avoid grid rows 9–11 so the centre spawn corridor
  (`snake` starts at `(9,10),(8,10),(7,10)`) is always clear.

---

## 3. Scoring & Grade

* **Score:** flat **+10 per pellet eaten**. There is no chain/combo scoring —
  score is simply `pellets eaten × 10`.
* **Grade:** on game over, completion is computed against the active tier's par
  and fed through the shared `arcadeGrade(comp)` ladder (`DD/Rig_DD.md` defines
  this same helper's thresholds — S≥0.92, A≥0.8, B≥0.65, C≥0.45, else F):

  ```js
  const comp=clamp01(score/lvl.gradeMax), g=arcadeGrade(comp);
  ```

  Because `gradeMax` is tier-specific (§2), an A/S on Hard represents a smaller
  raw score than an A/S on Easy — the grade is calibrated to be a comparable
  skill bar across tiers, not a comparable score bar.

---

## 4. PlayTools Integration

### 4.1 Tool registry + route

```js
{ id:'arcade_snake', lab:'Arcade', name:'My Anaconda', railName:'Anaconda', icon:'🐍', tag:'mvp', route:'#/arcade/snake',
  desc:'Steer the neon serpent, devour pellets & grow without biting your own tail.', dna:'Control +14 · Focus +6' }

Router.add('#/arcade/snake', Views.snake);
```

* **DNA vector:** **Control +14 · Focus +6** — sustained precision steering
  under an accelerating tick-clock (Control) plus continuously scanning the
  board for the pellet and the tail's own growing footprint (Focus). Note the
  live `Attr.applyVector` call on game over (§4.2) also folds in a small
  `consistency:4` contribution not reflected in this registry string (see §7).

### 4.2 Metagame recorder

`recordSnakeRun(score, ctx)` — called from `gameOver()` with `ctx={length, diff:lvl.key}` —
follows the standard Arcade-recorder contract:

* `d.runs++` on every run.
* `toolsCompleted++` is credited **only the first time** `d.bests.arcade_snake`
  is set (first-ever Snake run); subsequent runs just update the max.
* `d.bests.arcade_snake` is a `{value, mode:'max'}` best, updated whenever
  `score` beats the stored value.
* A **per-difficulty best map** at `d.bests.arcade_snake.diff[diff]` is also
  tracked and updated on a new per-tier max — this is what the in-game HUD's
  "Best" pill and the game-over result tile read via `snakeBest(lvl.key)`.
* `d.arcadePoints += Math.round(score/20)` — the metagame point contribution
  for this cabinet.
* `d.counters.snakeRuns++` every run; `d.counters.snakeLong++` specifically
  when `ctx.length>=30` (feeds the `snake_charmer` achievement, §4.3).
* On game over, `Ach.evaluate({tool:'snake', grade:g, score, length:len})` runs
  achievement checks, and `Attr.applyVector({control:14, focus:6, consistency:4}, comp)`
  applies the Gamer DNA vector scaled by the run's `comp` (§3).
* A/S grade clears pay out through the universal NetCoin arcade-grade gate
  documented in `DD/Rig_DD.md` §86/§292 (A=50, S=100 coins, capped to once per
  cabinet per local day) — no cabinet-specific payout logic lives in this view.
* The **Universal Share Card** is invoked via `shareRow({...})` on every game
  over, with `lab:'RETRO ARCADE'`, `tool:'My Anaconda'`, `glyph:'🐍'`, the run's
  grade, a `[Mode, Score, Length]` metric row, a grade-based `designation`
  string (**S**: Apex Serpent, **A**: Coil Master, **B**: Steady Slither, else
  Fresh Hatchling), and a `badge:'Snake Charmer'` when `len>=30`.

### 4.3 Cabinet achievements

| id | Name | Icon | Condition |
| --- | --- | --- | --- |
| `snake_charmer` | Snake Charmer | 🐍 | Grow to length 30 in My Anaconda. `test:(d,c)=> (c && c.tool==='snake' && c.length>=30) \|\| !!(d.counters && d.counters.snakeLong>=1)` — true either on the qualifying run itself or from the persisted `snakeLong` counter. |
| `snake_ace` | Snake Ace | 🐍 | Earn an A grade or better in My Anaconda. `test:(d,c)=> c && c.tool==='snake' && (c.grade==='A'||c.grade==='S')`. |

---

## 5. Art & Audio Direction

* **Rendering:** a single `<canvas>` (360×360, `CELL=18`), 2D context, wrapped
  in the shared `crtWrapTV()` bezel with `accent: labColor('Arcade')` and
  `jitter:false`. No image assets — everything is drawn procedurally each
  frame.
* **Background/grid:** solid near-black `#05030f` fill with a faint purple
  gridline overlay (`rgba(124,92,255,0.08)`) traced at every cell boundary.
* **Snake:** rounded-rect segments (`rr()` helper) with a per-segment color
  gradient from a bright cyan-green head (`rgb(22,242,200)`) fading to a deep
  teal tail (`rgb(10,120,95)`), plus a cyan glow (`shadowBlur`, stronger on the
  head). Two small dark eye dots are drawn on the head, offset in the current
  direction of travel.
* **Pellet:** a pulsing magenta orb (`#ff3df0`) with a sinusoidal glow/radius
  pulse (`Math.sin(now/220)`) and a small white highlight, giving it a "breathing"
  read against the dark board.
* **Obstacles (Medium/Hard):** solid neon-purple blocks (`#7c5cff`, purple glow)
  with a thin white top highlight strip, rendered as rounded rects.
* **Feedback:** eating a pellet spawns a 12-particle gold sparkle burst
  (`spawnSparkle`) that expands, falls under light gravity, and fades over its
  particle `life`.
* **Audio:** WebAudio-only via the shared `makeBlip('snakeMute')` helper (with
  a per-game mute toggle) — a short square-wave blip on eating a pellet, and a
  descending three-note sawtooth "die" stinger on game over. No audio files are
  used, consistent with the rest of the Arcade line; there is no music or
  ambient track.

---

## 6. Session Rules summary

| Action | Result |
| --- | --- |
| Move into an empty cell | Head advances, tail pops — snake length unchanged |
| Move into the pellet | +10 score, snake grows by one segment, pellet re-placed on a random unoccupied cell, step interval recalculated (faster), sparkle + eat sound |
| Move into a wall, obstacle, or own body | Immediate game over — die sound, run recorded, grade computed, Share Card shown |
| Reverse directly into own body (length > 1) | Input ignored — heading unchanged |
| Difficulty change while not playing | Resets the board to the new tier's start state |

---

## 7. Notes from retroactive documentation

* The registry's DNA string (`Control +14 · Focus +6`) doesn't mention the
  `consistency:4` term that the actual `Attr.applyVector` call on game over
  also applies — worth reconciling in a future pass, but not something this
  retroactive doc should silently "fix" by inventing a rationale.
* `gradeMax` (the score needed for a full grade) is tier-relative by design
  (§2/§3), so raw score is not directly comparable across Easy/Medium/Hard —
  only the per-difficulty best map and the grade are apples-to-apples.
