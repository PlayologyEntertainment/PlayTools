# Overdrive — Retro Arcade Cabinet Design Spec

**Version:** 0.1 (Draft — for sign-off, pre-code)
**Author:** Playology Entertainment
**Status:** Proposed — not yet built
**Parent Doc:** `PlayTools_DD.md` (this cabinet extends §5.5 Retro Arcade Module)
**Working title:** *Overdrive* (alternatives in §10.1 — name not yet locked)

> **Brainstorm decisions (locked this round).** Single-player; **pseudo-3D
> rear-view** racer (faithful to *Pole Position*); goal is to **reach the finish
> line before the checkpoint clock runs out**, banking as much time as possible;
> obstacles are **rival traffic cars + static hazards** (oil/debris/off-road);
> collisions are a recoverable **spin-out**, not instant game-over;
> **neon-cyberpunk reskin** (a data-highway street racer, kin to *Jack-In*) with
> **automatic gears**. Proposed cabinet route `#/arcade/overdrive`, tool id
> `arcade_overdrive`.

---

## 1. Concept

**Overdrive** is a *Pole Position*-faithful pseudo-3D racer, reskinned as a
neon-cyberpunk dash down a **data-highway**. The player sits behind a low-slung
light-cycle / street machine and screams toward a distant finish gate while the
road curves and crests into the horizon, weaving through slower rival "traffic
daemons" and dodging hazards on the asphalt. A **countdown clock** is the
opponent: blow through the **data gates** to top the clock back up, and cross the
finish line before it hits zero.

The design philosophy matches the rest of the Arcade — **"a recognizable classic
under a neon PlayTools skin"** (cf. Mac Pan = Pac-Man, Jack-In = Blackjack). The
*Pole Position* core is kept faithful — the into-the-screen pseudo-3D road, the
curve-induced lateral pull, slower traffic to thread, spin-out crashes, and the
checkpoint-extended timer — while the edge cases (the original's qualifying-lap
gate, the literal Lo/Hi manual gearbox, the exact 8086 speed/curve math) are
trimmed or simplified into clean, readable approximations sized for a
short browser arcade session.

### 1.1 The hero — "the machine"

* A low, wide street machine seen from **behind and slightly above** — the
  classic rear-3/4 racer read. The rear wing, twin exhausts / thruster glow, and
  two big rear tyres are the silhouette.
* Neon under-glow in the player's **accent color** (pulled from the Gamer DNA
  profile, same as the rest of PlayTools) so the car is unmistakably "yours."
* Steering tilts/leans the body and offsets it left/right on screen; hard curves
  add a visible weight-shift lean. At top speed, motion-streaks and a subtle
  speed-shake sell velocity.
* On a crash it **spins out** (a quick 360 + sparks/glitch burst), drifts to a
  stop, then re-accelerates from low speed — *Pole Position*'s spin, reskinned as
  a "signal scramble."

---

## 2. The Track & the Pseudo-3D World

### 2.1 Rendering model (how the pseudo-3D works)

Faithful to *Pole Position* / OutRun-style projection, **fully procedural** (no
image assets — consistent with DD §1.3 Sub-Second Asset Delivery and the existing
`pxCanvas`/`astSprite` approach):

* The track is a list of **road segments**, each with a length, a **curvature**
  value (left/right), and a **pitch** (hill up/down). A fixed loop of segments
  defines one course.
* A virtual **camera** sits a little behind and above the car at position `z`
  along the track. Each frame, `z` advances by the current speed.
* The road is drawn back-to-front as **stacked horizontal bands** from the
  horizon down to the bumper. Each band projects a segment: width and spacing
  scale with perspective (wide/near at the bottom, pinched at the horizon), and
  accumulated curvature shifts each band sideways so curves *bend* into the
  distance.
* Road furniture — **neon rumble strips** (alternating light/dark bands that
  stream past to convey speed), **roadside pylons / billboards / data-spires**,
  and the **start/finish gantry** — are sprites placed at a segment `z` + lateral
  offset, scaled by the same projection.
* **Sprites (rival cars, hazards)** are likewise placed by `(z, xOffset)`, scaled
  and z-sorted so nearer ones draw on top and "rush" the camera as you close in.

This is the standard pseudo-3D recipe and runs comfortably at 60fps on `<canvas>`
with `imageSmoothingEnabled=false` for the crisp pixel look, wrapped in the
existing `crtWrapTV()` bezel.

### 2.2 Curves, hills & the road edge

* **Curves** apply a **centrifugal pull**: in a corner the car drifts toward the
  outside of the bend unless the player steers into it — the core *Pole Position*
  skill. Pull scales with speed (fast + sharp = the car really wants to run wide).
* **Hills/crests** briefly hide what's over the rise — a classic tension beat for
  surprise traffic. (Optional for v1; flagged in §9.)
* **Leaving the asphalt** (onto the neon "grass"/grid shoulder) is **not** a
  crash but a heavy **drag**: the car slows hard and rumbles until steered back.
  Clipping a roadside object **is** a spin-out (§4.2). This mirrors *Pole
  Position*'s off-road penalty.

### 2.3 Course structure

* **v1 ships one fixed course** (locked, mirroring Mac Pan's single-maze launch
  decision) — a hand-tuned ribbon of straights, sweepers, a couple of tight
  corners, and (optionally) one crest, ending at the finish gantry.
* The course has a defined **length** (per difficulty, §5) and is divided into
  **sections by data gates** (§3).
* Post-launch follow-ups: additional courses / a course select, procedural night
  vs. day-grid skins, mirrored layouts (§8).

---

## 3. The Checkpoint Clock (the core loop)

The opponent is the **clock**, exactly like *Pole Position*'s race timer:

1. The run starts with a **time buffer** (e.g. 60s on Medium; see §5).
2. The buffer **counts down continuously** while racing.
3. The course is split into **sections**, each ending at a **data gate** (a neon
   arch across the road). Passing a gate **adds time** to the buffer (a "+TIME"
   pop, the classic checkpoint extension).
4. **Win:** cross the **finish gantry** before the clock hits zero. Any time
   **remaining is banked as a bonus** (this is where "as fast as possible" turns
   into a bigger score — see §5.1).
5. **Lose:** the clock hits **zero** before the finish → **TIME UP**, run ends,
   score is whatever was accumulated to that point.

There are **no "lives"** — spin-outs don't end the run, they just cost you the
seconds you lose while crashed and re-accelerating. The clock is the only
fail state. (This was the chosen failure model.)

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

### 4.1 Rival traffic cars ("traffic daemons")

* Slower neon vehicles that travel **the same direction** down their own lane,
  weaving slightly. The player must thread or overtake them.
* **Passing** a rival cleanly awards points (§5.1) and a small "overtaken" tick —
  the steady score drip that makes a clean run feel fast.
* Density and rival speed scale with difficulty (§5).

### 4.2 Static hazards & spin-outs

* **On-road hazards:** oil/data slicks, dropped debris, barrier sections — placed
  at fixed `z` on the course.
* **Collision result = spin-out (recoverable):** hitting a rival or a hazard
  triggers the spin animation, a sparks/glitch burst, and a **speed reset** (drop
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
| Pass a data gate | e.g. **+250** + the time extension |
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
* Mouse steer is an option to evaluate (consistent with Pixel Dodge offering
  mouse steering), flagged in §9.

### 5.3 Difficulty selector

Consistent with Snake/Bricks/Mac Pan, **three tiers** carrying a `diff` recorded
per best-score. Working theme — neon "signal" tiers (name TBD, §10.1):

| Tier | Course length | Start clock + gate bonus | Traffic density | Top speed | Curve sharpness |
| --- | --- | --- | --- | --- | --- |
| **Cruise** (easy) | shorter | generous | light | moderate | gentle |
| **Rush** (medium) | medium | balanced | medium | high | mixed |
| **Overdrive** (hard) | longer | tight | heavy | very high | aggressive |

`diff` is recorded per best-score (§6).

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
  desc:'Floor it down the neon data-highway — weave the traffic, hammer the data
        gates to beat the clock, and bank every second to the finish.',
  dna:'Reflex +12 · Control +8' }

Router.add('#/arcade/overdrive', Views.overdrive);
```

* **DNA vector:** **Reflex + Control** — split-second hazard reaction (Reflex,
  like Pixel Dodge) plus sustained steering precision through curves under speed
  (Control, like Neon Snake / Tracking). (Adding **Speed** is an option, but
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
| `overdrive_overclocked` | Overclocked | ⚡ | Finish on **Overdrive** difficulty. |

(Wired into the existing achievements array exactly like `pixel_pilot` /
`dodge_ace`, via `Ach.evaluate({ tool:'overdrive', grade, score, … })`.)

---

## 7. Art & Audio Direction

* **Rendering:** procedurally drawn pixel sprites + projected road on `<canvas>`,
  in the style of the existing helpers — keeps the bundle lightweight and avoids
  image files.
* **Palette:** deep CRT-black sky with a neon **synthwave** gradient, glowing grid
  shoulders, hot magenta/cyan rumble strips, and the player's accent color on the
  car's under-glow. Rivals are saturated, distinct hues so they read at distance.
* **Speed feedback:** streaming rumble strips, motion streaks, a subtle
  speed-shake and FOV-ish widening at high velocity; corner lean on the car.
* **Spin-out feedback:** glitch/scanline tear + sparks + a brief screen shudder
  ("signal scramble"), then a clean re-acquire.
* **Clock feedback:** the HUD clock pulses/strobes red in the final seconds —
  the classic "running out of time" tell.
* **Audio:** optional/deferred for v1. If added, short **WebAudio** synth (engine
  whine that pitches with speed, gate-pass chime, crash glitch) — no audio files,
  consistent with the asset-weight principle. The repo's MP3s are site music and
  are **not** part of this cabinet.

---

## 8. Out of Scope for v1 (candidate follow-ups)

* Multiple courses / a course-select; mirrored or night/day variants.
* Hills/crests (if cut from v1 for simplicity — see §9).
* A literal manual Lo/Hi gearbox as a skill mechanic.
* Manual qualifying lap (the original's pre-race gate).
* A rival "ghost" of your best run to race against.
* Online/shared leaderboards (PlayTools is zero-auth, client-only — DD §1.3);
  bests stay local and surface through the Share Card.
* Audio package (see §7).

---

## 9. Build-Time Tuning Knobs (decide during implementation)

* Exact point values, clock start, gate bonus, finish-bonus multiplier (§5.1).
* Whether v1 includes **hills/crests** or ships flat-with-curves only (§2.2).
* Whether to offer **mouse steering** alongside keyboard (§5.2).
* Final **DNA split** (Reflex/Control, ± Speed) (§6.1).
* Spin-out severity (speed reset depth + grace window) (§4.2).

---

## 10. Open Questions for Sign-off

1. **Name.** Working title is *Overdrive* — see alternatives in §10.1. Lock one?
2. **Difficulty labels.** *Cruise / Rush / Overdrive* — keep, or rename to match
   another scheme? (Note "Overdrive" is reused as both a hard-tier label and a
   candidate cabinet name — pick one use to avoid the clash.)
3. **Gate naming.** "Data gates" for the time-extension checkpoints — good, or
   prefer something else (checkpoints / relays / nodes)?
4. **Theme literalness.** Full neon-cyberpunk data-highway (chosen), or dial it
   toward a more literal "neon night street race" with recognizable cars?
5. **Crest/hills in v1?** Include for surprise-traffic tension, or keep the road
   flat-with-curves for the first build and add hills later (§8)?

### 10.1 Candidate names

*Overdrive* · *Redline* · *Data Run* · *Gridrunner* · *Neon Drift* · *Slipstream*
*(Note: "Neon Snake" and "Neon Bricks" already use the "Neon" prefix — leaning
non-"Neon" here keeps the cabinet names distinct.)*

### 10.2 Decided this round

* **Perspective — pseudo-3D rear view (locked).** Faithful *Pole Position* into-
  the-screen projection (§2.1).
* **Failure model — checkpoint clock (locked).** Beat the timer to the finish; no
  lives; spin-outs cost time, not the run (§3).
* **Obstacles — rival traffic + static hazards (locked); recoverable spin-out
  (locked)** (§4).
* **Theme — neon-cyberpunk reskin; automatic gears (locked)** (§1, §5.2).
* **Scope — single fixed course for launch (locked)**, mirroring Mac Pan (§2.3).
