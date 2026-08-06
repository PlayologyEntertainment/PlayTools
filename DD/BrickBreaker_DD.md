# Brick Breaker — Retro Arcade Cabinet Design Spec

**Version:** 1.0
**Author:** Playology Entertainment
**Status:** Implemented (v1) — shipped into the Retro Arcade in `PlayTools.html`; documented retroactively 2026-08-06 per `ROADMAP.md` backlog item A2 (undocumented-cabinet audit).
**Parent Doc:** `PlayTools_DD.md` (this cabinet extends §5.5 Retro Arcade Module)

> **Build note (as shipped).** A faithful single-paddle *Breakout*-style ball-and-brick
> game: a fixed 7×5 brick grid, a mouse/keyboard-controlled paddle, 3 lives, and an
> Easy / Medium / Hard difficulty selector (matching the Hopper Popper segmented
> control) that tunes ball speed and paddle width while keeping the brick grid — and
> therefore the max score of 350 — identical across tiers. Route `#/arcade/bricks`,
> tool id `arcade_bricks`. Win by clearing every brick ("wall cleared"); lose by
> running out of lives.

---

## 1. Concept

**Brick Breaker** is a *Breakout*/*Arkanoid*-faithful paddle-and-ball cabinet,
rendered in PlayTools' neon-on-CRT house style — a recognizable classic under a
neon skin, the same design philosophy as its Arcade siblings (cf. Mac Pan = Pac-Man,
Overdrive = Pole Position). A ball ricochets around a walled court; the player
slides a paddle along the bottom edge to keep it in play while it chips away at a
grid of colored bricks stacked near the top of the screen. There is no theming
fiction beyond the classic itself — no named cast, no story dressing — just the
paddle, the ball, and the wall, dressed in the shared neon palette and wrapped in
the CRT bezel (`crtWrapTV`) common to every cabinet.

## 2. Core Loop

**Court & layout.** The play field is a `360×300` canvas. Bricks are arranged in a
fixed **7-column × 5-row** grid (`COLS=7, ROWS=5`), each brick `44×14` with a 4px
gap, centered horizontally and starting 34px from the top. Rows cycle through a
5-color palette (`#ff3df0, #ffd23d, #16f2c8, #7c5cff, #37e35b`) one color per row,
so the wall reads as horizontal color bands. The brick layout is **identical across
all three difficulty tiers** — only ball speed and paddle width change — which is
what keeps the maximum score fixed at 350 (35 bricks × 10 pts) regardless of tier.

**Paddle & ball physics.** The paddle sits near the bottom (`PAD_Y = H-22`,
height 10) and is dragged via mouse position over the canvas, or moved at a fixed
340 px/s via arrow keys / A-D. The ball (`BALL_R=5`) launches from center court at
game start with a random left/right horizontal direction and the tier's `vx0`/`vy0`
velocity components. It bounces elastically off the left, right, and top walls.
Hitting the paddle reflects the ball upward and adds "english": the ball's
horizontal velocity is nudged by how far off-center the hit was
(`off=(ball.x-padX)/(PAD_W/2); ball.vx += off*120`), and the resulting speed is
then clamped to the tier's `maxSpeed` while preserving the ball's direction angle.
Missing the paddle (ball crosses `y > H+BALL_R`) costs a life and respawns the ball
at center court aimed by a fresh random launch.

**Difficulty tiers.** Three tiers drive ball speed and paddle width only (comment
in source: "matches the Hopper Popper segmented control" pattern), selectable
before or between runs:

| Tier | Launch vx0 | Launch vy0 | Max speed | Paddle width |
| --- | --- | --- | --- | --- |
| **Easy** (default) | 120 | 210 | 340 | 58 |
| **Medium** | 140 | 250 | 400 | 48 |
| **Hard** | 165 | 290 | 470 | 40 |

Easy mirrors the game's original single-config tuning. Switching difficulty while
a run is in progress is blocked (`if(playing) return;`); switching while idle
rebuilds the wall and resets state immediately.

**Lives & end states.** The player starts each run with **3 lives**. Losing the
ball with 0 lives remaining ends the run as a loss (`gameOver(false)`, "GAME OVER").
Destroying every brick ends the run as a win (`gameOver(true)`, "WALL CLEARED"),
checked immediately after the last brick's collision resolves. A **flawless**
clear is recorded when the wall is cleared with all 3 lives still intact
(`flawless = cleared && lives===3`).

**Controls.** Arrow keys or A/D move the paddle (held, continuous); mouse movement
over the canvas sets paddle position directly; Space/Enter starts or restarts when
idle. A touch pad (`mountTouchPad`, pref key `brickPad`) mirrors mouse control for
touch play. Sound is a set of WebAudio square/triangle/sawtooth blips (paddle hit,
brick hit, lose-life descending sting, win ascending arpeggio) gated by a
per-cabinet mute toggle (`brickMute`).

## 3. Scoring & Grade

Each brick destroyed is worth a flat **10 points**; with 35 bricks (7×5) the
maximum achievable score is **350** regardless of difficulty tier, since the wall
layout doesn't change between tiers. There is no per-brick color/row value
differentiation and no combo/streak multiplier.

At game over, completion `comp` is computed as:

```js
const comp = clamp01(score/350) * (cleared?1:0.85) + (cleared?0.1:0);
const g = arcadeGrade(clamp01(comp));
```

So a cleared wall gets a full score ratio plus a flat +0.1 bonus (clamped to 1); an
incomplete run (ran out of lives) is scaled down to 85% of its raw score ratio,
with no completion bonus. That `comp` feeds the shared `arcadeGrade(comp)` helper
(`PlayTools.html` line 9882), which buckets into letter grades:

```js
function arcadeGrade(comp){ return comp>=0.92?'S':comp>=0.8?'A':comp>=0.65?'B':comp>=0.45?'C':'F'; }
```

## 4. PlayTools Integration

### 4.1 Tool registry + route

```js
{ id:'arcade_bricks', lab:'Arcade', name:'Brick Breaker', railName:'Bricks', icon:'🧱', tag:'mvp', route:'#/arcade/bricks',
  desc:'Bounce the ball, shatter every brick & keep the paddle under it.', dna:'Precision +12 · Reflex +6' },

Router.add('#/arcade/bricks', Views.brickBreaker);
```

* **DNA vector:** Precision +12 · Reflex +6 — tracking a moving paddle to a
  precise contact point under the ball's angle-of-attack is the dominant skill
  (Precision), with Reflex covering the split-second paddle repositioning as ball
  speed ramps up on higher tiers.

### 4.2 Metagame recorder

`recordBrickRun(score, ctx)` (line 16432) follows the standard Arcade recorder
pattern:

* `d.runs++` on every call.
* `d.toolsCompleted++` is credited **only on the first-ever run** — the first
  call initializes `d.bests.arcade_bricks = {value:score, mode:'max'}`; every
  subsequent call just updates `.value` on a new high score, with no repeat
  Gamer-Score credit (no grind-farming a replayable cabinet).
* `d.bests.arcade_bricks.diff[diff]` tracks a **best-score-per-difficulty** map
  independently of the overall best.
* `d.arcadePoints += Math.round(score/25)` — the metagame-points contribution
  from this cabinet.
* Counters: `brickRuns` (every run), `brickClears` (any cleared wall — feeds
  `brick_buster`), `brickHardClears` (cleared wall on Hard — feeds
  `brick_demolisher`), `brickFlawless` (cleared wall with all 3 lives intact —
  feeds `brick_flawless`). The "lives lost" signal is implicit: `flawless` is
  computed in the view as `cleared && lives===3`, i.e. zero lives lost, rather
  than a running lives-lost counter passed through `ctx`.
* NetCoin payout on A/S clears runs through the universal Arcade grade-payout
  gate documented in `DD/Rig_DD.md` §86/§292 (A pays 50, S pays 100, once per
  cabinet per local day) — Brick Breaker doesn't implement its own payout logic,
  it just produces the `g` grade that gate reads.
* `Attr.applyVector({precision:12, reflex:6, consistency:4}, clamp01(comp))` is
  called on every game over — note this actually applies a third `consistency:4`
  component not reflected in the registry's `dna` string (see §7).
* `Ach.evaluate({tool:'bricks', grade:g, score, cleared, diff:lvl.key, flawless})`
  fires the achievement checks (§4.3).
* The Universal Share Card is invoked via `shareRow({...})` on every game over,
  with `lab:'RETRO ARCADE'`, `tool:'Brick Breaker'`, `glyph:'🧱'`, the computed
  grade, a metric trio (Mode / Score / Bricks Left), a grade-based designation
  (`S`→"Wall Wrecker", `A`→"Ricochet Ace", `B`→"Steady Volley", else "Loose
  Cannon"), and a badge of `'Flawless Wall'` or `'Brick Buster'` when earned.

### 4.3 Cabinet achievements

| id | Name | Icon | Condition |
| --- | --- | --- | --- |
| `brick_buster` | Brick Buster | 🧱 | Clear an entire wall in Brick Breaker (`c.tool==='bricks' && c.cleared`, or the persistent `brickClears>=1` counter). |
| `brick_demolisher` | Wall Demolisher | 🧱 | Clear an entire wall on Hard difficulty in Brick Breaker (`c.cleared && c.diff==='hard'`, or `brickHardClears>=1`). |
| `brick_flawless` | Flawless Wall | 🧱 | Clear a wall in Brick Breaker without losing a single life (`c.cleared && c.flawless`, or `brickFlawless>=1`). |
| `brick_ace` | Brick Ace | 🧱 | Earn an A grade or better in Brick Breaker (`c.tool==='bricks' && (c.grade==='A'||c.grade==='S')`). |

## 5. Art & Audio Direction

Rendering is a single `<canvas>` (360×300) drawn each frame via `CanvasRenderingContext2D`
— a solid dark background fill (`#05030f`), flat-colored brick rectangles with a
thin lighter top-edge highlight strip (`rgba(255,255,255,0.18)`, 3px) for a subtle
beveled look, a solid cyan (`#16f2c8`) paddle, and a solid white square ball. No
image assets or sprite work — everything is drawn primitives, consistent with the
rest of the Arcade's lightweight-canvas approach. The whole stage is wrapped in
`crtWrapTV` using the Arcade lab's accent color, with `jitter:false`. Audio is
short WebAudio synth blips: a square-wave tone on brick hit, a triangle tone on
paddle hit, a three-note descending sawtooth sting on losing a life, and a
four-note ascending square arpeggio on clearing the wall — all gated by the
`brickMute` sound toggle.

## 6. Session Rules summary

| Action | Result |
| --- | --- |
| Ball destroys a brick | +10 score; brick removed; ball reflects off the hit side/face |
| Ball passes the paddle (bottom wall) | −1 life; if lives remain, ball relaunches from center; a lose-blip sting plays |
| Lives reach 0 | Run ends as a loss ("GAME OVER"); grade computed from `comp` |
| Last brick destroyed | Run ends as a win ("WALL CLEARED"); win fanfare plays |
| Wall cleared with all 3 lives intact | Run flagged `flawless`; feeds `brick_flawless` achievement and the Share Card's "Flawless Wall" badge |
| Wall cleared on Hard | Feeds `brick_demolisher` achievement |
| A/S grade on game over | Pays NetCoin via the universal Arcade grade-payout gate (`Rig_DD.md` §86/§292), once per cabinet per day |
| Switching difficulty mid-run | Blocked; only allowed while idle (between runs), and rebuilds/reset the wall immediately |

## 7. Notes from retroactive documentation

* `Attr.applyVector` on game over applies `{precision:12, reflex:6, consistency:4}`
  — a `consistency:4` component that isn't represented in the `CABINETS` registry's
  `dna:'Precision +12 · Reflex +6'` string. This doc reports both as found in the
  code rather than reconciling them; it's a minor inconsistency between the
  registry blurb and the actual attribute call, not something this retroactive doc
  should silently "fix."
* `brick_flawless`'s underlying signal is a boolean derived at game-over time
  (`lives===3`) rather than an explicit lives-lost counter — functionally
  equivalent for a 3-life game, but worth noting since the task brief flagged it
  as a thing to check for.
