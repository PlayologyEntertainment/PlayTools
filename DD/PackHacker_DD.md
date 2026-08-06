# Pack Hacker — Retro Arcade Cabinet Design Spec

**Version:** 1.0
**Author:** Playology Entertainment
**Status:** Implemented (v1) — shipped into the Retro Arcade in `PlayTools.html`; documented retroactively 2026-08-06 per `ROADMAP.md` backlog item A2 (undocumented-cabinet audit).
**Parent Doc:** `PlayTools_DD.md` (this cabinet extends §5.5 Retro Arcade Module)

> **Build note (as shipped).** A Block-Blast / 1010!-style block-packing puzzle:
> drag one of three neon polyomino blocks onto a fixed **10×10** grid; any row
> or column that fills completely clears, and consecutive clearing placements
> stack a combo multiplier up to **×5**. The tray refills with three fresh
> random pieces once all three are used. The run is endless — it ends only
> when none of the remaining tray pieces can legally fit anywhere on the
> board ("NO ROOM"). Lives at route `#/arcade/packer`, tool id
> `arcade_packer`, view `Views.packer`.

---

## 1. Concept

**Pack Hacker** takes the well-worn block-packing puzzle formula (the genre
popularized by *1010!* and, more recently, *Block Blast*) and drops it into
the Retro Arcade under a "hacker" skin: a dark, CRT-wrapped grid lit in
violet (`rgba(124,92,255,…)` empty-cell tint, matching one of the piece
colors) with polyomino blocks rendered as glowing, beveled neon tiles rather
than flat squares — each block gets a linear-gradient shade, a colored glow
outline, and a soft specular highlight strip, so it reads as "packing glowing
data blocks into a grid" rather than a plain puzzle-app board. Unlike its
sibling cabinets (Mac Pan's cast-iron-pan-in-a-maze, Overdrive's sunset
highway), Pack Hacker doesn't carry an explicit narrative or in-fiction
dialogue — the "hacker" framing lives in the name, the 📦 icon, and the
neon/violet palette rather than in any on-screen story text. It's the
leanest theming job in the lab, and that's a genuine, accurate read of what
shipped, not a gap.

A fun, real detail baked directly into the tool registry: the cabinet's
`dna` string ends in `- Designed by Aysha!` — a credit shipped in the live
code (`PlayTools.html` line 4560), attributing this cabinet's design to
Aysha.

## 2. Core Loop

* **Grid:** fixed **10×10** board (`COLS=10, ROWS=10`), rendered on a 360×360
  logical-pixel `<canvas>` wrapped in the shared CRT bezel (`crtWrapTV`).
* **Tray:** three pieces at a time (`genPieces()` fills three tray slots),
  each an independently random draw from a fixed set of **25 polyomino
  shapes** (`PK_PIECES` — monominoes, dominoes, I/L/S/T tetromino-style
  shapes, and 2×2/2×3/3×3 blocks) in one of **7 neon colors** (`PK_COLORS`).
  There is no shape "bag" — each of the three slots is drawn independently,
  so repeats are possible.
* **Placement:** the player drags a tray piece with pointer events
  (`pointerdown`/`pointermove`/`pointerup`, touch- and mouse-compatible via
  the Pointer Events API). A floating ghost canvas follows the cursor; a
  live preview on the board shows the target cells in the piece's color if
  the drop is legal, or in translucent red if not (`canPlace()` checks board
  bounds and that every covered cell is empty).
* **Clear condition:** after a piece is committed, every row and every
  column is checked for being completely full; any that are full clear
  simultaneously (multiple lines can clear off a single placement).
* **Combo:** a placement that clears at least one line bumps the combo
  multiplier by +1, capped at **×5**; a placement that clears nothing resets
  the combo back to ×1.
* **Tray refill:** once all three tray pieces have been used, a fresh set of
  three random pieces is generated.
* **Game over ("NO ROOM"):** after every placement, `checkStuck()` checks
  whether every remaining (unused) tray piece has *no* legal placement
  anywhere on the board; if so the run ends. There are no lives and no
  timer — it's a pure "how long can you keep the board open" endless mode.

## 3. Scoring & Grade

Per placement (`commitPlace`):

* Base points = number of cells the piece occupies (`cells`).
* If one or more lines clear: `lineBonus = totalLines*totalLines*10` (1
  line → 10, 2 → 40, 3 → 90, 4 → 160), and the placement's score is
  `gained = Math.round((cells + cleared.size + lineBonus) * combo)`, where
  `cleared.size` is the total number of cells removed across all clearing
  lines and `combo` is the *post-increment* multiplier for this placement.
* If no line clears, `gained = cells` (no multiplier applied) and combo
  resets to ×1.

At game over, the run is graded through the shared arcade helper:

```js
const comp = clamp01(linesCleared/18*0.7 + (maxCombo-1)/4*0.3);
const g = arcadeGrade(comp);
```

i.e. completion (`comp`, 0–1) is 70% weighted on total lines cleared over the
run (normalized to 18 lines) and 30% weighted on the highest combo reached
during the run (normalized to a max combo of 5), then passed through the
shared `arcadeGrade(comp)` thresholds (S ≥0.92, A ≥0.8, B ≥0.65, C ≥0.45,
else F) that every Retro Arcade cabinet uses.

## 4. PlayTools Integration

### 4.1 Tool registry + route

```js
{ id:'arcade_packer', lab:'Arcade', name:'Pack Hacker', railName:'Packer', icon:'📦', tag:'mvp', route:'#/arcade/packer',
  desc:'Drag blocks onto the grid & pack full rows and columns to clear them — chain combos before you run out of room.',
  dna:'Strategy +14 · Control +6 - Designed by Aysha!' }

Router.add('#/arcade/packer', Views.packer);
```

* **DNA vector:** **Strategy +14 · Control +6** — applied on game over via
  `Attr.applyVector({strategy:14, control:6}, comp)`. Strategy dominates
  because the core skill is spatial planning (reading the board and picking
  which of the three offered shapes fits where, several moves ahead, to
  avoid getting boxed in); Control is the smaller secondary component for
  the precision of the drag-and-drop placement itself.

### 4.2 Metagame recorder

`recordPackerRun(score, ctx)` (called with `ctx = {maxClear, lines:
linesCleared}`) follows the standard arcade-recorder contract:

* `d.runs++` every run.
* `d.bests.arcade_packer` is a `mode:'max'` best; `toolsCompleted++` is
  credited only the **first** time a best is recorded for this cabinet
  (i.e. the first-ever run), keeping Gamer Score honest against a
  replayable endless mode.
* `d.arcadePoints += Math.round(score/30)` — the modest metagame
  contribution shared by other arcade recorders, explicitly commented in
  the source as avoiding grind-farming the Gamer Score.
* `d.counters.packerRuns` increments every run; `d.counters.packerBigClears`
  increments whenever `ctx.maxClear >= 3` (a run that landed at least a
  triple-line clear at some point).
* A/S grade clears additionally pay out through the universal NetCoin
  arcade-grade gate documented in `Rig_DD.md` §86/§292 (A pays 50, S pays
  100 NetCoin, capped to once per cabinet per local day) — Pack Hacker uses
  that shared mechanism as-is, with no cabinet-specific override.
* On game over, `shareRow(...)` wires the Universal Share Card with
  `lab:'RETRO ARCADE'`, `tool:'Pack Hacker'`, `glyph:'📦'`, the run's
  `grade`, metrics for Score / Lines / Best Combo, a grade-based
  `designation` string (S → "Master Packer", A → "Space Optimizer", B →
  "Tidy Stacker", C → "Block Juggler", else "Box Fumbler"), and a
  `'Multi-Line Master'` badge when `maxClear >= 3`.

### 4.3 Cabinet achievements

| id | Name | Icon | Condition |
| --- | --- | --- | --- |
| `packer_ace` | Packer Ace | 📦 | `desc`: "Earn an A grade or better in Packer." `test:(d,c)=> c && c.tool==='packer' && (c.grade==='A'||c.grade==='S')` |

Pack Hacker ships with a lean, single-achievement set — just `packer_ace` in
the `Ach` module's `DEFS` array. That's the real shipped state, not an
oversight: unlike Mac Pan (four achievements) or Overdrive (five), this
cabinet relies on the one grade-based achievement plus the universal Arcade
Champion (cumulative arcade-points) achievement that every cabinet feeds via
`d.arcadePoints`.

## 5. Art & Audio Direction

* **Rendering:** fully procedural on a single `<canvas>` (360×360 logical
  px), wrapped in the shared `crtWrapTV` CRT bezel with `accent:
  labColor('Arcade')` and jitter disabled. No image assets.
* **Board:** a dark violet vertical gradient background (`#0a0618` →
  `#05030f`); empty cells render as a faint violet-tinted rounded square
  (`rgba(124,92,255,0.06)` fill, `rgba(124,92,255,0.16)` stroke) so the grid
  itself carries a subtle "circuit board" tint.
* **Blocks:** each filled cell is drawn by `drawBlock()` as a rounded square
  with a top-lit-to-bottom-shaded linear gradient (128%/72% shade of the
  piece's base color), a colored glow stroke (`shadowBlur` matched to the
  piece color), and a soft white specular highlight bar near the top —
  giving the blocks a glossy, glowing-tile look rather than flat color
  swatches. Seven neon colors are used across pieces (`PK_COLORS`:
  turquoise, magenta, yellow, violet, green, orange, cyan).
* **Placement preview:** a legal drop location previews the piece at 55%
  opacity in its real color; an illegal location previews a translucent red
  overlay on the same cells.
* **Line-clear flash:** cleared cells flash white and fade over ~340ms
  (`clearing` state, animated via `requestAnimationFrame`) before being
  emptied; the animation is skipped outright when
  `prefersReducedMotion()` is true.
* **Tray:** each of the three tray pieces renders on its own small canvas
  via the same `drawBlock()` routine, auto-sized (15–24px per cell) to the
  piece's bounding box.
* **Audio:** short synthesized WebAudio blips via the shared `makeBlip`
  helper, gated by a per-cabinet mute pref (`packerMute`) — a square-wave
  tick on placement, a two-note square chime on a line clear, a scaling
  2–5-note triangle-wave arpeggio on combo clears (note count tracks
  `totalLines + combo`), and a descending three-note sawtooth "power down"
  on game over. No audio files, consistent with the rest of the Arcade.

## 6. Session Rules summary

| Action | Result |
| --- | --- |
| Press START / Space / Enter (not playing) | Board resets, score/combo reset, a fresh 3-piece tray is dealt |
| Drag a tray piece over the grid | Live preview shown: piece-colored if the drop is legal, translucent red if not |
| Drop on a legal cell | Piece committed to the board; any full row(s)/column(s) clear; score awarded per §3 |
| Drop on an illegal cell (or off-grid) | Piece returns to its tray slot; nothing is committed |
| A placement clears ≥1 line | Combo multiplier +1 (capped ×5); clear-flash animation plays; combo/clear sounds play |
| A placement clears no line | Combo multiplier resets to ×1 |
| All 3 tray pieces used | Tray refills with 3 new random pieces |
| No unused tray piece can be placed anywhere on the board | Run ends ("NO ROOM"); grade computed, DNA/metagame/achievements/Share Card fire |

## 7. Notes from retroactive documentation

* The shipped code carries no explicit "hacker" narrative text (no
  dialogue, no terminal-log flavor strings) — the theme is expressed only
  through the name, icon, and the violet neon palette described in §5. This
  doc documents that as the accurate shipped state rather than assuming a
  deeper fiction exists.
* Piece and color draws in `genPieces()` are independent per tray slot with
  no de-duplication or "bag" logic, so a tray of three identical pieces (in
  shape and/or color) is possible by chance; this is the real shipped
  behavior, not a bug.
