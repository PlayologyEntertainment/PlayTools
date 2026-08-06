# Hopper Popper — Retro Arcade Cabinet Design Spec

**Version:** 1.0
**Author:** Playology Entertainment
**Status:** Implemented (v1) — shipped into the Retro Arcade in `PlayTools.html`; documented retroactively 2026-08-06 per `ROADMAP.md` backlog item A2 (undocumented-cabinet audit).
**Parent Doc:** `PlayTools_DD.md` (this cabinet extends §5.5 Retro Arcade Module)

> **Build note (as shipped).** A faithful whack-a-mole: a fixed **30-second**
> round (`ROUND=30`) on a **3×3 (nine-hole)** board — matching the registry
> tagline exactly. Click/tap a "hopper" the instant it rises; three flat
> difficulty tiers (Easy/Medium/Hard, default Medium) set pop-up duration,
> spawn gap, and how many hoppers can be up at once. Route `#/arcade/whack`,
> tool id `arcade_whack`, view function `Views.whackMole`.

---

## 1. Concept

**Hopper Popper** is a *whack-a-mole*-faithful reaction cabinet, reskinned
around a **Pixar "Hoppers"-inspired** rodent rendered in PlayTools' neon-retro
palette (per the in-code comment at the mole-drawing routine). Nine dirt mounds
sit in a 3×3 grid over a dark CRT-purple backdrop; a critter with round ears,
buck teeth, a cowlick tuft, and big cartoon eyes pops up out of a mound at
random, and the player has a split second to smack it before it drops back
down. It's the same "recognizable classic under a neon skin" treatment as the
rest of the Arcade — no rules bent, just re-themed art and the standard
PlayTools scoring/grade/Share Card wrapper around it.

The mole itself is fully procedural (`<canvas>`-drawn, no image assets): a
gradient-shaded body, rim-lit in cyan on one side and warm on the other,
animated ears/whiskers/paws that rise out of the mound, a breathing/bob idle
wiggle, and eyes that flip to an "X" expression for the half-second after
it's been whacked, with a small trailing burst of stars.

## 2. Core Loop

* **Board:** a fixed 3×3 grid of nine holes (`holes[]`, one entry per mound),
  rendered on a 360×360 canvas inside the shared CRT bezel (`crtWrapTV`).
* **Controls:** click/tap directly on a risen hopper. The canvas click handler
  maps the click's `(x,y)` back to a row/column index and checks whether that
  hole is currently `active`. `Space`/`Enter` on the keyboard starts (or
  restarts) the round when it isn't already running — there's no in-round
  keyboard control, only mouse/touch on the mounds themselves.
* **Difficulty selector** (segmented control, matches the Tracking lab's
  widget), locked once a round starts:

  | Tier | `up` (s a hopper stays up) | `gap` (s between pop attempts) | `maxUp` (simultaneous hoppers) | `target` (hits for top grade) | `reward` |
  | --- | --- | --- | --- | --- | --- |
  | Easy | 1.30 | 1.00 | 1 | 14 | 0.5 |
  | Medium (default) | 0.85 | 0.65 | 2 | 26 | 0.75 |
  | Hard | 0.55 | 0.45 | 3 | 38 | 1.0 |

  Per the in-code comment, these are **flat pacing per tier — no in-round
  ramp**; the numbers don't escalate as the 30 seconds tick down.
* **Spawn logic:** a spawn timer counts down by `gap`; when it fires, if fewer
  than `maxUp` hoppers are currently active, one random idle/settled hole is
  chosen and its hopper pops up for `up` seconds. A rise/fall is smoothly
  interpolated (`h.rise` eases toward 1 while active, back toward 0 once its
  time-to-live expires or it's whacked) rather than a hard cut.
* **Hit / miss resolution:**
  * Clicking an **active** hopper: it's immediately deactivated, hits a
    half-second "whacked" flash (`WHACK_DUR=0.5`, eyes go to an X, a squash
    wobble, star burst), `hits++`, and a hit blip plays.
    * Clicking anywhere that **isn't** an active hopper (an empty mound, a
      just-missed one, or the background) counts as `misses++` with no sound
      cue beyond the ambient pop.
  * A hopper that reaches the end of its `up` window **unwhacked** also
    increments `misses++` when it retracts on its own.
* **Timer:** the round is a straight 30-second countdown (`ROUND=30`,
  displayed rounded up in the HUD); at zero the round ends immediately
  (`gameOver()`), regardless of hits/misses so far.

## 3. Scoring & Grade

There's no separate points formula — the raw metric is simply **hits** for the
round. Grade is derived by comparing hits against the active difficulty's
`target` (the hit count that represents a top-tier run for that tier's mole
volume):

```js
const comp = clamp01(hits / lvl.target), g = arcadeGrade(comp);
```

`arcadeGrade(comp)` is the shared Arcade helper (`function arcadeGrade(comp)`,
line 9882): `comp>=0.92` → **S**, `>=0.8` → **A**, `>=0.65` → **B**, `>=0.45` →
**C**, else **F**. So hitting the tier's `target` count exactly lands almost
exactly at the S threshold, and misses don't directly subtract from `comp` —
they only cost you by eating spawn opportunities you didn't convert.

GamerDNA is applied straight off that same `comp`, scaled by the tier's
`reward` (so a maxed-out Easy run is worth less DNA than a maxed-out Hard run):

```js
Attr.applyVector({reflex:14, speed:6, focus:4}, comp * lvl.reward);
```

## 4. PlayTools Integration

### 4.1 Tool registry + route

```js
{ id:'arcade_whack', lab:'Arcade', name:'Hopper Popper', railName:'Popper', icon:'🔨', tag:'mvp', route:'#/arcade/whack',
  desc:'Thirty seconds, nine holes — pop every hopper the instant it pops up.', dna:'Reflex +14 · Speed +6' }

Router.add('#/arcade/whack', Views.whackMole);
```

* **DNA vector:** Reflex +14 · Speed +6 — the whole cabinet is a pure
  see-it/hit-it reaction test on a hard 30-second clock, so it leans almost
  entirely on Reflex with a Speed kicker for how quickly hits land; both are
  the same pairing StarDodger and Brick Breaker lean on for reaction-heavy
  cabinets. (The actual `Attr.applyVector` call also folds in a small
  `focus:4` component not mentioned in the registry's DNA string — see §7.)

### 4.2 Metagame recorder

`function recordWhackRun(score, ctx)` (score = `hits`, `ctx = {misses, diff}`):

* `d.runs++` every call.
* `toolsCompleted++` is credited **only the first time** `d.bests.arcade_whack`
  doesn't yet exist — the standard "replayable game, no Gamer-Score
  grind-farming" pattern shared with every other arcade recorder.
* `d.bests.arcade_whack` stores an overall `{value, mode:'max'}` best, plus a
  per-difficulty best map at `d.bests.arcade_whack.diff[diff]` — this is what
  the HUD's "Best" pill and the results tile read back via `whackBest(diff)`.
* `d.arcadePoints += Math.round(score/3)` — i.e. **hits ÷ 3, rounded**. This is
  a notably more generous divisor than most siblings (Brick Breaker uses
  `score/25`; Defrag/Overdrive/Mac Pan's specs all use `score/40`), which
  tracks with `score` here being a raw hit count rather than an inflated point
  total.
* `d.counters.whackRuns` increments every run. No other per-run context flags
  are recorded — `ctx.misses` and `ctx.diff` are captured in the best-map logic
  above but no separate miss-streak/flawless-style counters exist for this
  cabinet.
* The universal NetCoin arcade-grade payout gate (A = 50 / S = 100 NetCoin,
  capped to once per cabinet per local day) documented in `DD/Rig_DD.md` §3
  applies to Hopper Popper exactly as it does to every other cabinet — no
  special-casing here.
* On game over, `Ach.evaluate({tool:'whack', grade:g, hits, difficulty:lvl.key})`
  fires (separately from `recordWhackRun`), and the Universal Share Card is
  invoked via `shareRow({ lab:'RETRO ARCADE', tool:'Hopper Popper', glyph:'🔨',
  grade:g, metric:[...], designation, badge })`, with `designation` mapped
  S→"Mallet Maestro", A→"Quick Hammer", B→"Steady Swing", else "Slow
  Reflexes", and a one-off `badge:'Hopper Masher'` when `hits>=25`.

### 4.3 Cabinet achievements

| id | Name | Icon | Condition |
| --- | --- | --- | --- |
| `whack_ace` | Popper Ace | 🔨 | `test:(d,c)=> c && c.tool==='whack' && (c.grade==='A'||c.grade==='S')` — earn an A grade or better in a single run. |

Hopper Popper ships with just this **one** achievement, unlike several
siblings (Mac Pan, Defrag) that carry four or five. That's the real, current
shipped state rather than a documentation gap — there's no lifetime-hits,
streak, or difficulty-specific achievement defined anywhere in the `Ach.DEFS`
array for this cabinet.

## 5. Art & Audio Direction

* **Rendering:** a single 360×360 `<canvas>` (`ctx2d`), fully procedural — no
  image assets. The board is wrapped in the shared `crtWrapTV()` CRT bezel
  (`accent: labColor('Arcade')`, `jitter:false`), consistent with the rest of
  the Arcade.
* **Board layout:** a 3×3 grid (`CW = W/3` wide columns, `CH = (H-TOP_PAD)/3`
  tall rows, with a 26px top pad so a fully-risen hopper's head clears the CRT
  frame).
* **Mole art** (per the in-code comment, "Pixar 'Hoppers'-inspired form,
  neon-retro palette"): a layered dirt mound (back rim, dark hole, front lip,
  a purple glow-pulse ring while active) with a critter that rises out of it —
  gradient-shaded body, cream belly, cyan rim-light on one side and warm
  highlight on the other, ear/whisker/cowlick/buck-teeth detailing, small paws
  that fade in partway through the rise, and a squash/stretch "wobble" plus
  eye-to-X swap on a successful whack, with a brief 3-point star flourish.
* **Idle motion:** each hopper has its own animation seed so the breathing
  bob/wobble desyncs across the board rather than all mounds animating in
  lockstep.
* **Audio:** WebAudio-only via the shared `makeBlip()` helper, gated by the
  cabinet's own mute toggle (`soundToggle('whackMute')`): a square-wave pop
  when a hopper spawns (`sndPop`, 440Hz), a square-wave hit chime on a
  successful whack (`sndHit`, 880Hz), and a 3-note ascending square-wave
  flourish at round end (`sndEnd`). No audio files.

## 6. Session Rules summary

| Action | Result |
| --- | --- |
| Click an active hopper | Hopper retracts, `hits++`, hit blip, whack animation + stars |
| Click an inactive hole / empty background | `misses++`, no hit sound |
| A hopper's pop-up window expires unclicked | Retracts on its own, `misses++` |
| Timer reaches 0 | Round ends immediately (`gameOver()`) regardless of active hoppers |
| Round end | Grade computed from `hits/target`, DNA applied, run recorded, achievement check, results panel + Share Card shown |
| "Play Again" | Restarts with the same difficulty selection |

* **Difficulty lock:** the difficulty selector is disabled (dimmed,
  pointer-events off) for the duration of a running round and re-enabled after
  `gameOver()`.

## 7. Notes from retroactive documentation

* The registry's DNA string (`Reflex +14 · Speed +6`) doesn't mention the
  `focus:4` component that the actual `Attr.applyVector` call also grants on
  every game-over. This is a minor display/DNA-vector mismatch worth a look if
  the registry text is ever revisited, but it's the genuine as-shipped
  behavior, not a doc error.
* `recordWhackRun`'s `ctx.misses` is passed in but never read back out —
  misses aren't currently fed into any counter, achievement, or displayed
  lifetime stat beyond the immediate post-round results tile. Not a bug, just
  an observation that "misses" is presently a display-only stat for this
  cabinet.
