# Graveyard Shift — Retro Arcade Cabinet Design Spec

**Version:** 0.1 (brainstorm draft — for sign-off)
**Author:** Playology Entertainment
**Status:** Proposed — fills the open **fixed-shooter** genre gap in the Retro Arcade (§5.5)
**Parent Doc:** `PlayTools_DD.md` (this cabinet extends §5.5 Retro Arcade Module)

> **Why this cabinet.** The Arcade has no **shoot-'em-up** — the single most
> iconic arcade genre is entirely missing. StarDodger only *dodges*; nothing in
> the roster lets you *shoot back*. Graveyard Shift closes that gap with a
> *Galaga*-faithful **fixed shooter**, reskinned off the over-used space/alien
> setting into an **80s paranormal containment** job — same philosophy as the
> rest of the line: **a recognizable classic under a fresh skin** (cf. Mac Pan =
> Pac-Man, Defrag = Bejeweled).

---

## 1. Concept

**Graveyard Shift** is a *Galaga*-faithful **fixed-position shoot-'em-up**. You
work the night shift as a **ghost-wrangler**, manning a containment rig at the
bottom of a moonlit cemetery and firing a **plasma stream** straight up at a
formation of **spirits** that assemble overhead, sway in a grid, and peel off in
diving haunt-runs to reach you. Every Galaga beat is preserved — the swooping
formation entry, the side-to-side sway, the dive-bomb arcs, the **capture-and-
rescue** boss mechanic, the dual-fire reward, escalating stages, and the famous
no-fire **bonus round** — only the fiction changes from *outer space* to *the
graveyard shift*.

The design philosophy matches the rest of the Arcade: anyone who has played
Galaga is instantly at home; the skin makes it feel new. The spirits behave
exactly like Galaga's bees/butterflies/bosses, so the muscle memory transfers.

### 1.1 The bestiary (Galaga's three tiers, reskinned)

| Galaga | Graveyard Shift | Behaviour |
| --- | --- | --- |
| Bee (zako) | **Wisp** | Common, fills the lower formation rows; fast, erratic divers. |
| Butterfly (goei) | **Phantom** | Mid rows; dive in pairs, drop ectoplasm. |
| Boss Galaga | **Wraith** (boss) | Top row; takes **two hits**, projects the **possession beam** (the tractor-beam analog), worth the most points. |

### 1.2 The capture-and-rescue — the signature beat

The headline Galaga mechanic, kept 1:1:

* A **Wraith** descends and fires a downward **possession beam** (a slow cone of
  light). If it catches your wrangler, you are **possessed** — your unit is
  hauled up and pinned above the Wraith in the formation, and you respawn from
  reserve.
* If you then **destroy that Wraith** while it dives carrying your captured unit,
  the possessed wrangler is **freed** and **docks alongside you → dual stream**
  (double fire width), exactly like rescuing the captured fighter in Galaga.
* Mis-timing the shot (hitting the Wraith at the wrong point, or letting it reach
  the top) **loses the captured unit**. High-risk, high-reward — the soul of the
  game.

---

## 2. Core Loop — faithful Galaga

A run is a lives-based survival score-chase across escalating **stages**:

1. **Formation entry.** Each stage, spirits fly in along curved entry paths and
   lock into a swaying grid at the top (the Galaga choreography).
2. **Engage.** You move left/right along the bottom and fire upward. Like Galaga,
   only **two of your shots** may be on screen at once — fire discipline matters.
3. **Dives.** Spirits peel from the formation in arcing dive-bombs, dropping
   ectoplasm as they swoop, then loop back to their slot (or off-screen and
   re-enter). A diving spirit is worth **more** than one sitting in formation —
   the classic risk/reward of waiting for the dive.
4. **Boss play.** Wraiths take two hits and run the possession beam (§1.2).
5. **Clear → next stage.** Bust the whole formation to advance; speed, dive
   frequency and beam aggression ramp each stage.
6. **Bonus "Séance" stage** (every few stages): a flock of spirits flies through
   in set patterns and **never attacks** — strafe them all for a **PERFECT**
   bonus (Galaga's challenging stage, reskinned). Pure points, no risk.
7. **Game over** when your last reserve is lost → grade + Share Card.

### 2.1 Lives & reserves

Start with **3 wranglers** (one active + two in reserve), Galaga-standard. A
captured unit sitting in the formation is *not* a life until rescued; lose your
last active unit while one is captured and the run still ends.

---

## 3. Scoring & Grade

Galaga's "dives are worth more" economy, reskinned:

| Event | Points |
| --- | --- |
| Wisp — in formation / diving | **50 / 100** |
| Phantom — in formation / diving | **80 / 160** |
| Wraith — in formation / diving | **150 / 400** |
| **Rescue** (free a captured unit) | **+1000** bonus |
| Séance PERFECT (all spirits bagged) | **+1500** bonus |
| Stage clear | **+100 × stage** |

* **Score** is the run total. The escalating stages plus the dive/rescue bonuses
  give the skill ceiling — a careful player who baits dives and pulls off a
  rescue dramatically out-scores a spray-and-pray run.

### 3.1 Grade

Rides the standard `arcadeGrade(comp)` ladder, `comp` keyed to score against a
per-difficulty par:

```
comp = clamp01( score / par )         // par: Rookie 8000 · Night 6000 · Witching 4500
```

Tuned (like every cabinet) so beating par is an A and smashing it is an S; the
harder difficulties carry a lower par because spirits are faster and deadlier, so
the grade reads honestly across difficulty.

---

## 4. PlayTools Integration

A standard Retro Arcade cabinet reusing the existing plumbing in `PlayTools.html`
— **no new architecture** (cf. Defrag §4, Jack-In §4).

### 4.1 Tool registry + route

One `CABINETS` entry and one router line:

```js
{ id:'arcade_graveyard', lab:'Arcade', name:'Graveyard Shift', railName:'Graveyard',
  icon:'👻', tag:'mvp', route:'#/arcade/graveyard',
  desc:'Work the graveyard shift — wrangle the swooping spirits, bait their
        dives, and time the rescue to free a captured unit for dual fire.',
  dna:'Precision +12 · Reflex +8' }

Router.add('#/arcade/graveyard', Views.graveyard);
```

* **DNA vector:** **Precision + Reflex** — twitch aiming at fast diving targets
  (Precision) under the pressure of reading the swarm and reacting to dives
  (Reflex). The honest fit for a fixed shooter.
* **View:** `Views.graveyard = function(container){ … return teardown; }`,
  mounting the CRT-wrapped canvas, the HUD (Score / Stage / Lives / Best) and the
  difficulty selector — matching the DOM structure of `Views.defrag` / the other
  canvas cabinets.

### 4.2 Metagame recorder (honest Gamer Score contract)

Add `recordGraveyardRun(score, ctx)` following the exact pattern used by
`recordDefragRun` / `recordSnakeRun`:

* `toolsCompleted++` credited **only on the first-ever run** (replayable game → no
  Gamer-Score grind-farming).
* `d.bests.arcade_graveyard` updates on a new max (overall + per-difficulty).
* `d.arcadePoints += Math.round(score/40)` — a **modest** metagame contribution
  in line with the other arcade recorders.
* Counters for the cabinet achievements: `graveyardRuns`, `graveyardBusted`
  (lifetime spirits), `graveyardRescues`, `graveyardPerfects`, and a
  `graveyardBestStage` high-water mark.
* Feeds the existing **Arcade Champion** achievement (10,000 Gamer Score) and the
  Universal Share Card via `ShareCard.open({ lab:'RETRO ARCADE', tool:'Graveyard
  Shift', glyph:'👻', … })` on game over.

### 4.3 Cabinet achievements

| id | Name | Icon | Condition |
| --- | --- | --- | --- |
| `graveyard_ace` | Graveyard Ace | 👻 | Earn an A grade or better in Graveyard Shift. |
| `graveyard_exorcist` | Exorcist | ✝️ | Pull off a capture-and-rescue (free a possessed unit → dual fire). |
| `graveyard_perfect` | Clean Séance | 🕯️ | Score a PERFECT on a bonus Séance stage. |
| `graveyard_nightowl` | Night Owl | 🦉 | Reach Stage 5. |
| `graveyard_marathon` | Spirit Warden | ⚰️ | Bust **1,000** spirits (lifetime). |

(Wired into the existing achievements array exactly like `defrag_ace` /
`jackin_ace`, with counter fallbacks so they persist across sessions.)

---

## 5. Art & Audio Direction

* **Rendering:** a **canvas** cemetery at night — dark gradient sky, a low fog
  band, silhouetted headstones, a moon. All entities are **procedurally drawn**
  (no image files — DD §1.3 Sub-Second Asset Delivery), each tier a distinct
  **shape *and* colour** for clarity: Wisp = a small glowing orb + tail; Phantom
  = a classic sheet-ghost; Wraith = a larger horned skull with eye-glow. The
  wrangler is a compact rig with a glowing emitter.
* **Plasma stream:** a bright crackling bolt; the **possession beam** is a slow
  translucent cone with a tell so the player can dodge or bait it.
* **Capture tell:** the screen edges flash and a low groan plays when you're
  possessed; a rising chime + flash on a successful **rescue**.
* **Palette:** moonlit blues/violets with neon spirit glows and gold score pops,
  mounted in the shared `crtWrapTV()` scanline frame — consistent with the line.
* **Audio:** optional, deferred-style WebAudio via the shared `makeBlip()` /
  `soundToggle()` helpers (fire zap, spirit bust, dive wail, possession groan,
  rescue chime, stage-clear arpeggio) — no audio files, full deference to the
  global Reduce-Motion preference.

---

## 6. Session Rules summary

| Action | Result |
| --- | --- |
| Move + fire | Strafe the bottom, ≤2 shots on screen, bust spirits |
| Bust a diver | Worth ~2× the same spirit in formation |
| Get caught by the beam | Possessed — lose the active unit, respawn from reserve |
| Destroy a Wraith carrying your unit | **Rescue** → dual stream + 1000 |
| Clear the formation | Advance a stage (faster, deadlier) |
| Bonus Séance, bag them all | **PERFECT** bonus |
| Lose the last reserve | End run → grade + Share Card |

* **Controls:** **← →** / **A D** to move, **Space** to fire. Touch: drag to
  move, tap/hold to fire. Touch-playable like every Arcade cabinet.

---

## 7. Out of Scope for v1 (candidate follow-ups)

* **Transforming spirits** (Galaga's later-stage enemies that morph mid-dive).
* **Named bosses** / a deeper bestiary beyond the three tiers.
* Two-player alternating play.
* **Triple fighter** (Galaga only ever goes dual; we match that).
* Online/shared leaderboards (PlayTools is zero-auth, client-only — DD §1.3);
  bests stay local and surface through the Share Card.

---

## 8. Open Questions for Sign-off

1. **Name** — working title *Graveyard Shift* (route/id `arcade_graveyard`).
   Keep, or prefer *Ecto*, *Spook Squad*, *Containment*, or *Phantasm*?
2. **Capture-and-rescue** — it's Galaga's signature *and* the most complex piece
   to build. Ship it **in v1** (recommended — it's what makes it Galaga rather
   than Space Invaders), or land the core formation-shooter first and add rescue
   in v1.1?
3. **Fire model** — Galaga-faithful **manual tap-fire with a 2-shot on-screen
   cap** (recommended), or **hold-to-autofire** for a more forgiving, modern
   feel?
4. **Run shape** — **lives-based endless** escalating stages with a high-score
   chase (recommended, Galaga-true), or a **fixed wave count** with a finish
   line like a level?

### 8.1 Leaning (pending your call)

* **DNA — Precision + Reflex.** Honest fit for a fixed shooter; confirm or
  reweight toward Focus (swarm-reading) if preferred.
