# Overdrive — Retro Arcade Cabinet Design Spec

**Version:** 1.0 (Implemented — shipped)
**Author:** Playology Entertainment
**Status:** Implemented (v1) — shipped. `Views.overdrive`, `recordOverdriveRun`, and 5 achievements are live in `PlayTools.html`; DNA vector `{reflex:12, control:8}` matches §6 exactly. (Doc header was left stale after ship; corrected here — see PlayTools ROADMAP.md for current state.)
**Parent Doc:** `PlayTools_DD.md` (this cabinet extends §5.5 Retro Arcade Module)

> **Brainstorm decisions (locked).** Single-player; **pseudo-3D rear-view**
> racer (faithful to *Pole Position*); goal is to **reach the finish line before
> the checkpoint clock runs out**, banking as much time as possible; obstacles
> are **rival traffic cars + static hazards** (oil/debris/off-road); collisions
> are a recoverable **spin-out**, not instant game-over; **name is *Overdrive***;
> setting is a **recognizable open-road race at a majestic sunset** (golden-hour
> coastal highway, OutRun-style, orange/yellow/purple sky) with PlayTools'
> neon/CRT treatment; **automatic gears**; **no hills** in v1 (flat road with
> curves); single fixed course. Proposed cabinet route `#/arcade/overdrive`,
> tool id `arcade_overdrive`.

---

## 1. Concept

**Overdrive** is a *Pole Position*-faithful pseudo-3D racer set on a **recognizable
open highway at a majestic sunset**. The player sits behind a low-slung race car
and screams toward a distant finish line as the road curves and streams into the
horizon, weaving through slower rival cars and dodging hazards on the asphalt.
A **countdown clock** is the opponent: blow through the **checkpoint gates** to
top the clock back up, and cross the finish line before it hits zero.

The setting is a sweeping golden-hour coast — a big **sunset gradient
(orange → yellow → purple)** behind distant mountains and the sea, palms and
billboards streaming past the roadside — i.e. the instantly-recognizable arcade
racer backdrop (think *OutRun*/*Pole Position*), rendered in PlayTools' house
style: crisp pixel sprites, neon-glow rumble strips, and the CRT bezel/scanlines
that wrap every cabinet.

The design philosophy matches the rest of the Arcade — **"a recognizable classic
under a PlayTools skin"** (cf. Mac Pan = Pac-Man, Jack-In = Blackjack). The
*Pole Position* core is kept faithful — the into-the-screen pseudo-3D road, the
curve-induced lateral pull, slower traffic to thread, spin-out crashes, and the
checkpoint-extended timer — while the edge cases (the original's qualifying-lap
gate, the literal Lo/Hi manual gearbox, the exact 8086 speed/curve math) are
trimmed or simplified into clean, readable approximations sized for a short
browser arcade session.

### 1.1 The hero — "the machine"

* A low, wide race car seen from **behind and slightly above** — the classic
  rear-3/4 racer read. The rear wing, twin exhausts, and two big rear tyres are
  the silhouette.
* A subtle neon under-glow in the player's **accent color** (pulled from the
  Gamer DNA profile, same as the rest of PlayTools) so the car is unmistakably
  "yours" against the sunset.
* Steering tilts/leans the body and offsets it left/right on screen; hard curves
  add a visible weight-shift lean. At top speed, motion-streaks and a subtle
  speed-shake sell velocity.
* On a crash it **spins out** (a quick 360 + a puff of smoke/sparks), drifts to a
  stop, then re-accelerates from low speed — *Pole Position*'s signature spin.

---

## 2. The Track & the Pseudo-3D World

### 2.1 Rendering model (how the pseudo-3D works)

Faithful to *Pole Position* / OutRun-style projection, **fully procedural** (no
image assets — consistent with DD §1.3 Sub-Second Asset Delivery and the existing
`pxCanvas`/`astSprite` approach):

* The track is a list of **road segments**, each with a length and a **curvature**
  value (left/right). A fixed loop of segments defines one course. *(No pitch/hill
  term in v1 — see §2.2.)*
* A virtual **camera** sits a little behind and above the car at position `z`
  along the track. Each frame, `z` advances by the current speed.
* The road is drawn back-to-front as **stacked horizontal bands** from the
  horizon down to the bumper. Each band projects a segment: width and spacing
  scale with perspective (wide/near at the bottom, pinched at the horizon), and
  accumulated curvature shifts each band sideways so curves *bend* into the
  distance.
* Road furniture — **neon rumble strips** (alternating light/dark bands that
  stream past to convey speed), recognizable **roadside scenery** (palms,
  billboards, distant mountains, the sea, a low sun on the horizon), and the
  **start/finish gantry** — are sprites placed at a segment `z` + lateral offset,
  scaled by the same projection.
* **Sprites (rival cars, hazards)** are likewise placed by `(z, xOffset)`, scaled
  and z-sorted so nearer ones draw on top and "rush" the camera as you close in.
* The **sky** is a big static **sunset gradient (orange → yellow → purple)** with
  the sun near the horizon; the road meets it at a clean vanishing point. Distant
  scenery parallax-scrolls slowly against it on curves.

This is the standard pseudo-3D recipe and runs comfortably at 60fps on `<canvas>`
with `imageSmoothingEnabled=false` for the crisp pixel look, wrapped in the
existing `crtWrapTV()` bezel.

### 2.2 Curves & the road edge (flat road — no hills in v1)

* **No hills/crests in v1 (locked).** The road is flat with **left/right curves
  only**. This keeps the projection simple and the v1 build tight; hills remain a
  candidate follow-up (§8).
* **Curves** apply a **centrifugal pull**: in a corner the car drifts toward the
  outside of the bend unless the player steers into it — the core *Pole Position*
  skill. Pull scales with speed (fast + sharp = the car really wants to run wide).
* **Leaving the asphalt** (onto the roadside/grass shoulder) is **not** a crash
  but a heavy **drag**: the car slows hard and rumbles until steered back.
  Clipping a roadside object **is** a spin-out (§4.2). This mirrors *Pole
  Position*'s off-road penalty.

### 2.3 Course structure

* **v1 ships one fixed course** (locked, mirroring Mac Pan's single-maze launch
  decision) — a hand-tuned ribbon of straights, sweepers, and a couple of tight
  corners, ending at the finish gantry.
* The course has a defined **length** (per difficulty, §5) and is divided into
  **sections by checkpoint gates** (§3).
* Post-launch follow-ups: additional courses / a course-select, hills/crests,
  alternate times-of-day skins, mirrored layouts (§8).

---

## 3. The Checkpoint Clock (the core loop)

The opponent is the **clock**, exactly like *Pole Position*'s race timer:

1. The run starts with a **time buffer** (e.g. 60s on Rush; see §5).
2. The buffer **counts down continuously** while racing.
3. The course is split into **sections**, each ending at a **checkpoint gate** (a
   banner/arch across the road). Passing a gate **adds time** to the buffer (a
   "+TIME" pop — the classic checkpoint extension).
4. **Win:** cross the **finish gantry** before the clock hits zero. Any time
   **remaining is banked as a bonus** (this is where "as fast as possible" turns
   into a bigger score — see §5.1).
5. **Lose:** the clock hits **zero** before the finish → **TIME UP**, run ends,
   score is whatever was accumulated to that point.

There are **no "lives"** — spin-outs don't end the run, they just cost you the
seconds you lose while crashed and re-accelerating. The clock is the only fail
state.

### 3.1 Why this fits an all-high-score arcade

The rest of the Arcade rewards *bigger numbers*, but a pure stopwatch rewards
*smaller* ones. The checkpoint model resolves it: **driving faster banks more
leftover time**, and the finish bonus scales with that banked time — so the
fastest run is also the **highest-scoring** run. No special-casing needed in the
metagame; `arcadePoints` and "Arcade Champion" work exactly as for every other
cabinet (§6).

---

## 4. Obstacles

Both obstacle types from the brainstorm ship in v1:

### 4.1 Rival traffic cars

* Slower cars that travel **the same direction** down their own lane, weaving
  slightly. The player must thread or overtake them.
* **Passing** a rival cleanly awards points (§5.1) and a small "overtaken" tick —
  the steady score drip that makes a clean run feel fast.
* Density and rival speed scale with difficulty (§5).

### 4.2 Static hazards & spin-outs

* **On-road hazards:** oil slicks, dropped debris, barrier sections — placed at
  fixed `z` on the course.
* **Collision result = spin-out (recoverable):** hitting a rival or a hazard
  triggers the spin animation, a puff of smoke/sparks, and a **speed reset** (drop
  to a crawl, then re-accelerate). You **lose time**, not the run. This is the
  forgiving model chosen in the brainstorm — no single-collision game-over.
* **Off-road** = drag/slow only (§2.2), not a spin.

A short post-spin **invulnerability/grace** window prevents instant
re-collisions, and the car re-enters near the road center.

---

## 5. Controls, Difficulty & Scoring

### 5.1 Scoring summary

| Action | Points |
| --- | --- |
| Distance traveled | small drip per segment (keeps the score always moving) |
| Overtake a rival | e.g. **100** each (clean pass) |
| Pass a checkpoint gate | e.g. **+250** + the time extension |
| **Finish bonus** | **banked time × multiplier** (the headline reward — rewards speed) |
| Spin-out | no point penalty; the cost is the **time lost** |

*(All exact values are tuning knobs, set at build time against the existing
cabinets so a strong Overdrive run is worth roughly what a strong Pixel
Dodge / Asteroid run is.)*

### 5.2 Controls

* **Desktop:** **◀ ▶ / A D** to steer, **↑ / W** accelerate, **↓ / S** brake.
  **Auto gears** (no manual shift — decided). **P / Esc** pauses.
* **Touch:** tilt or on-screen left/right + a hold-to-accelerate pedal (PlayTools
  is PC-focused per DD §3.1.2.1, but cabinets stay touch-playable).
* Mouse steer is an option to evaluate (consistent with StarDodger offering
  mouse steering), flagged in §9.

### 5.3 Difficulty selector

Consistent with Snake/Bricks/Mac Pan, **three tiers** carrying a `diff` recorded
per best-score:

| Tier | Course length | Start clock + gate bonus | Traffic density | Top speed | Curve sharpness |
| --- | --- | --- | --- | --- | --- |
| **Cruise** (easy) | shorter | generous | light | moderate | gentle |
| **Rush** (medium) | medium | balanced | medium | high | mixed |
| **Redline** (hard) | longer | tight | heavy | very high | aggressive |

`diff` is recorded per best-score (§6). *(Tier names finalized: Cruise / Rush /
Redline — the old "Overdrive" hard-tier label was renamed now that Overdrive is
the cabinet name.)*

---

## 6. PlayTools Integration

Overdrive is a standard Retro Arcade cabinet and reuses the existing plumbing in
`PlayTools.html` — **no new architecture** (confirmed against the codebase: a
cabinet is a `CABINETS` registry entry + a `Views.fn` + a `Router.add`).

### 6.1 Tool registry + route

Add one entry to the `CABINETS` array (alongside the other `lab:'Arcade'`
cabinets) and one router line:

```js
{ id:'arcade_overdrive', lab:'Arcade', name:'Overdrive', railName:'Overdrive',
  icon:'🏎️', tag:'mvp', route:'#/arcade/overdrive',
  desc:'Floor it down the sunset highway — weave the traffic, hammer the
        checkpoint gates to beat the clock, and bank every second to the finish.',
  dna:'Reflex +12 · Control +8' }

Router.add('#/arcade/overdrive', Views.overdrive);
```

* **DNA vector:** **Reflex + Control** — split-second hazard reaction (Reflex,
  like StarDodger) plus sustained steering precision through curves under speed
  (Control, like My Anaconda / Tracking). (Adding **Speed** is an option, but
  PlayTools' `Speed` attribute is tied to *tapping/click* speed, so Reflex+Control
  is the cleaner fit. Final split tuned at build time — §9.)
* **View:** `Views.overdrive = function(c){ … return teardown; }`, mounting a
  `<canvas>` (CRT-wrapped via `crtWrapTV`), a START + difficulty overlay, and a
  live HUD (clock / score / speed / best) — matching the structure of
  `Views.pixelDodge`. Returns a teardown that cancels the RAF and detaches
  listeners (per repo convention).

### 6.2 Metagame recorder (honest Gamer Score contract)

Add `recordOverdriveRun(score, ctx)` following the exact pattern of
`recordDodgeRun` / `recordSnakeRun`:

* `toolsCompleted++` credited **only on the first-ever run** (replayable game →
  no Gamer-Score grind-farming).
* `d.bests.arcade_overdrive` updates on a new **max** (`mode:'max'`), with a
  per-`diff` best map.
* `d.arcadePoints += Math.round(score/40)` — a modest metagame contribution in
  line with the other arcade recorders (exact divisor tuned at build time).
* Counters for achievements: `overdriveRuns`, plus context flags
  (`finished`, `cleanRun`, `bestTime`, `tier`).
* `Attr.applyVector({ reflex:12, control:8 }, quality)` on game-over, where
  `quality` is derived from finish + banked time + clean-driving (0..1).
* Feeds the existing **Arcade Champion** achievement (10,000 Gamer Score) and the
  Universal Share Card via `shareRow({ lab:'RETRO ARCADE', tool:'Overdrive',
  glyph:'🏎️', grade, metric:[…] })` on game over.

### 6.3 Proposed cabinet achievements

| id | Name | Icon | Condition |
| --- | --- | --- | --- |
| `overdrive_finisher` | Crossed the Line | 🏁 | Reach the finish before the clock runs out. |
| `overdrive_clean` | No Scratches | ✨ | Finish a run with **zero** spin-outs. |
| `overdrive_redline` | Redline | 🔥 | Score 20,000+ in a single run. |
| `overdrive_sundown` | Sundown Sprint | 🌇 | Finish on **Redline** difficulty. |

(Wired into the existing achievements array exactly like `pixel_pilot` /
`dodge_ace`, via `Ach.evaluate({ tool:'overdrive', grade, score, … })`.)

---

## 7. Art & Audio Direction

* **Rendering:** procedurally drawn pixel sprites + projected road on `<canvas>`,
  in the style of the existing helpers — keeps the bundle lightweight and avoids
  image files.
* **Palette — the sunset (locked direction):** a big **orange → yellow → purple**
  sky gradient with a low sun on the horizon; warm-lit asphalt; recognizable
  roadside scenery (palms, billboards, distant purple mountains, the sea) silhou-
  etted/warm-rimmed against the sky. PlayTools' neon treatment shows in the
  glowing rumble strips, the car's accent under-glow, and the CRT scanline wrap —
  so it reads as a recognizable arcade racer, not an abstract world.
* **Speed feedback:** streaming rumble strips, motion streaks, a subtle
  speed-shake at high velocity; corner lean on the car.
* **Spin-out feedback:** smoke/sparks + a brief screen shudder, then a clean
  re-acquire.
* **Clock feedback:** the HUD clock pulses/strobes red in the final seconds —
  the classic "running out of time" tell.
* **Audio:** optional/deferred for v1. If added, short **WebAudio** synth (engine
  whine that pitches with speed, gate-pass chime, crash thud) — no audio files,
  consistent with the asset-weight principle. The repo's MP3s are site music and
  are **not** part of this cabinet.

---

## 8. Out of Scope for v1 (candidate follow-ups)

* Multiple courses / a course-select; mirrored layouts.
* **Hills/crests** (cut from v1 — §2.2); would add the "surprise traffic over the
  rise" tension later.
* Alternate times-of-day / weather skins (the sunset is the v1 look).
* A literal manual Lo/Hi gearbox as a skill mechanic.
* Manual qualifying lap (the original's pre-race gate).
* A rival "ghost" of your best run to race against.
* Online/shared leaderboards (PlayTools is zero-auth, client-only — DD §1.3);
  bests stay local and surface through the Share Card.
* Audio package (see §7).

---

## 9. Build-Time Tuning Knobs (decide during implementation)

* Exact point values, clock start, gate bonus, finish-bonus multiplier (§5.1).
* Whether to offer **mouse steering** alongside keyboard (§5.2).
* Final **DNA split** (Reflex/Control, ± Speed) (§6.1).
* Spin-out severity (speed reset depth + grace window) (§4.2).
* Curve-pull strength curve vs. speed (the corner-difficulty feel) (§2.2).

---

## 10. Sign-off Status

### 10.1 Decided

* **Name — *Overdrive* (locked).**
* **Perspective — pseudo-3D rear view (locked).** Faithful *Pole Position*
  into-the-screen projection (§2.1).
* **Failure model — checkpoint clock (locked).** Beat the timer to the finish; no
  lives; spin-outs cost time, not the run (§3).
* **Obstacles — rival traffic + static hazards (locked); recoverable spin-out
  (locked)** (§4).
* **Setting/theme — recognizable open-road race at a majestic sunset (locked):**
  golden-hour coastal highway, orange/yellow/purple sky, PlayTools neon/CRT
  treatment (§1, §7).
* **Road — flat with curves, no hills in v1 (locked)** (§2.2).
* **Gears — automatic (locked)** (§5.2).
* **Difficulty tiers — Cruise / Rush / Redline (locked)** (§5.3).
* **Scope — single fixed course for launch (locked)**, mirroring Mac Pan (§2.3).

### 10.2 Remaining minor calls (can be made at build time)

* Mouse steering on/off (§5.2); final DNA split (§6.1); the numeric tuning in §9.
* Achievement names/thresholds (§6.3) — proposed, easy to adjust.
