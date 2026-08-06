# Ecto — Retro Arcade Cabinet Design Spec

**Version:** 1.0 (signed off — ready for implementation)
**Author:** Playology Entertainment
**Status:** Approved — fills the open **fixed-shooter** genre gap in the Retro Arcade (§5.5)
**Parent Doc:** `PlayTools_DD.md` (this cabinet extends §5.5 Retro Arcade Module)

> **Why this cabinet.** The Arcade has no **shoot-'em-up** — the most iconic
> arcade genre is entirely missing. StarDodger only *dodges*; nothing in the
> roster lets you *shoot back*. Ecto closes that gap with a *Galaga*-faithful
> **fixed shooter**, reskinned off the over-used space/alien setting into an **80s
> paranormal containment** job — same philosophy as the rest of the line: **a
> recognizable classic under a fresh skin** (cf. Mac Pan = Pac-Man, Defrag =
> Bejeweled).

> **Build note (v1 as signed off).** Ships the core *Galaga* formation-shooter:
> swooping formation entry, sway, dive-bomb arcs, three enemy tiers, bonus
> "Séance" stages, and a lives-based endless high-score chase. Two decisions
> shape v1: **hold-to-autofire** (not Galaga's manual 2-shot cap), and the
> **capture-and-rescue** boss mechanic is **deferred to v1.1** (§7) — the Wraith
> boss still appears as the tough top tier, just without the possession beam for
> now. Cabinet name **Ecto**, tool id `arcade_ecto`, route `#/arcade/ecto`.

---

## 1. Concept

**Ecto** is a *Galaga*-faithful **fixed-position shoot-'em-up**. You work the
night shift as a **ghost-wrangler**, manning a containment rig at the bottom of a
moonlit cemetery and streaming **plasma** straight up at a formation of **spirits**
that assemble overhead, sway in a grid, and peel off in diving haunt-runs to reach
you. The Galaga beats are preserved — the swooping formation entry, the side-to-
side sway, the dive-bomb arcs, escalating stages, and the famous no-fire **bonus
round** — only the fiction changes from *outer space* to *the graveyard shift*.

Anyone who has played Galaga is instantly at home; the skin makes it feel new. The
spirits behave like Galaga's bees/butterflies/bosses, so the muscle memory
transfers.

### 1.1 The bestiary (Galaga's three tiers, reskinned)

| Galaga | Ecto | Behaviour |
| --- | --- | --- |
| Bee (zako) | **Wisp** | Common, fills the lower formation rows; fast, erratic divers. |
| Butterfly (goei) | **Phantom** | Mid rows; dive in pairs, drop ectoplasm. |
| Boss Galaga | **Wraith** (boss) | Top row; takes **two hits**, dives aggressively, worth the most points. *(In v1.1 the Wraith gains the possession beam — §7.)* |

---

## 2. Core Loop — faithful Galaga

A run is a lives-based survival score-chase across escalating **stages**:

1. **Formation entry.** Each stage, spirits fly in along curved entry paths and
   lock into a swaying grid at the top (the Galaga choreography).
2. **Engage.** You move left/right along the bottom and **hold to fire** an
   upward plasma stream (capped fire rate — see §2.2). A spirit sitting in the
   formation is worth less than one mid-dive, so picking targets still matters.
3. **Dives.** Spirits peel from the formation in arcing dive-bombs, dropping
   ectoplasm as they swoop, then loop back to their slot (or off-screen and
   re-enter). A diving spirit is worth **more** than one in formation — the
   classic risk/reward of baiting the dive.
4. **Boss play.** Wraiths take two hits and dive hard for big points.
5. **Clear → next stage.** Bust the whole formation to advance; speed, dive
   frequency and aggression ramp each stage.
6. **Bonus "Séance" stage** (every few stages): a flock of spirits flies through
   in set patterns and **never attacks** — strafe them all for a **PERFECT**
   bonus (Galaga's challenging stage, reskinned). Pure points, no risk.
7. **Game over** when your last reserve is lost → grade + Share Card.

### 2.1 Lives & reserves

Start with **3 wranglers** (one active + two in reserve), Galaga-standard. An
extra wrangler is awarded at a score milestone (e.g. 10,000), like Galaga's bonus
life.

### 2.2 Fire model (v1 decision)

**Hold-to-autofire.** Holding the fire input streams plasma at a **capped rate**
(rather than Galaga's manual tap with a 2-bullet on-screen limit). Chosen for a
more forgiving, modern feel and clean touch play; the skill stays in *movement
and target priority*, not trigger-mashing. (Manual-fire is noted as a possible
toggle in §7.)

---

## 3. Scoring & Grade

Galaga's "dives are worth more" economy, reskinned:

| Event | Points |
| --- | --- |
| Wisp — in formation / diving | **50 / 100** |
| Phantom — in formation / diving | **80 / 160** |
| Wraith — in formation / diving | **150 / 400** |
| Séance PERFECT (all spirits bagged) | **+1500** bonus |
| Stage clear | **+100 × stage** |

* **Score** is the run total. Escalating stages plus the dive bonuses give the
  skill ceiling — a player who baits dives dramatically out-scores spray-and-pray.

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
{ id:'arcade_ecto', lab:'Arcade', name:'Ecto', railName:'Ecto',
  icon:'👻', tag:'mvp', route:'#/arcade/ecto',
  desc:'Work the graveyard shift — stream plasma at the swooping spirits,
        bait their dives for double points, and survive the rising haunt.',
  dna:'Precision +12 · Reflex +8' }

Router.add('#/arcade/ecto', Views.ecto);
```

* **DNA vector:** **Precision + Reflex** — twitch aiming at fast diving targets
  (Precision) under the pressure of reading the swarm and reacting to dives
  (Reflex). The honest fit for a fixed shooter.
* **View:** `Views.ecto = function(container){ … return teardown; }`, mounting the
  CRT-wrapped canvas, the HUD (Score / Stage / Lives / Best) and the difficulty
  selector — matching the DOM structure of `Views.defrag` / the other canvas
  cabinets.

### 4.2 Metagame recorder (honest Gamer Score contract)

Add `recordEctoRun(score, ctx)` following the exact pattern used by
`recordDefragRun` / `recordSnakeRun`:

* `toolsCompleted++` credited **only on the first-ever run** (replayable game → no
  Gamer-Score grind-farming).
* `d.bests.arcade_ecto` updates on a new max (overall + per-difficulty).
* `d.arcadePoints += Math.round(score/40)` — a **modest** metagame contribution
  in line with the other arcade recorders.
* Counters for the cabinet achievements: `ectoRuns`, `ectoBusted` (lifetime
  spirits), `ectoPerfects`, and a `ectoBestStage` high-water mark.
* Feeds the existing **Arcade Champion** achievement (10,000 arcade points) and the
  Universal Share Card via `ShareCard.open({ lab:'RETRO ARCADE', tool:'Ecto',
  glyph:'👻', … })` on game over.

### 4.3 Cabinet achievements

| id | Name | Icon | Condition |
| --- | --- | --- | --- |
| `ecto_ace` | Ecto Ace | 👻 | Earn an A grade or better in Ecto. |
| `ecto_perfect` | Clean Séance | 🕯️ | Score a PERFECT on a bonus Séance stage. |
| `ecto_nightowl` | Night Owl | 🦉 | Reach Stage 5. |
| `ecto_cleanshift` | Clean Shift | ✨ | Clear Stage 3 without losing a wrangler. |
| `ecto_marathon` | Spirit Warden | ⚰️ | Bust **1,000** spirits (lifetime). |

(Wired into the existing achievements array exactly like `defrag_ace` /
`jackin_ace`, with counter fallbacks so they persist across sessions. The
v1.1 capture-and-rescue adds an **Exorcist** achievement — §7.)

---

## 5. Art & Audio Direction

* **Rendering:** a **canvas** cemetery at night — dark gradient sky, a low fog
  band, silhouetted headstones, a moon. All entities are **procedurally drawn**
  (no image files — DD §1.3 Sub-Second Asset Delivery), each tier a distinct
  **shape *and* colour** for clarity: Wisp = a small glowing orb + tail; Phantom
  = a classic sheet-ghost; Wraith = a larger horned skull with eye-glow. The
  wrangler is a compact rig with a glowing emitter.
* **Plasma stream:** a bright crackling bolt with a soft muzzle glow.
* **Palette:** moonlit blues/violets with neon spirit glows and gold score pops,
  mounted in the shared `crtWrapTV()` scanline frame — consistent with the line.
* **Audio:** optional, deferred-style WebAudio via the shared `makeBlip()` /
  `soundToggle()` helpers (fire zap, spirit bust, dive wail, stage-clear
  arpeggio, séance-perfect chime) — no audio files, full deference to the global
  Reduce-Motion preference (which also calms screen shake and particle density).

---

## 6. Session Rules summary

| Action | Result |
| --- | --- |
| Move + hold fire | Strafe the bottom, stream plasma, bust spirits |
| Bust a diver | Worth ~2× the same spirit in formation |
| Get hit by a diver / ectoplasm | Lose the active unit, respawn from reserve |
| Clear the formation | Advance a stage (faster, deadlier) |
| Bonus Séance, bag them all | **PERFECT** bonus |
| Lose the last reserve | End run → grade + Share Card |

* **Controls:** **← →** / **A D** to move, **hold Space** to fire. Touch: drag to
  move, hold to fire. Touch-playable like every Arcade cabinet.

---

## 7. Out of Scope for v1 (candidate follow-ups)

* **Capture-and-rescue (v1.1, the priority follow-up).** Galaga's signature beat:
  the Wraith projects a downward **possession beam**; if it catches your wrangler
  you're abducted into the formation, and destroying that Wraith mid-dive **frees
  the unit → dual stream**. Adds the **Exorcist** achievement. Deferred from v1 as
  the most complex piece; the Wraith ships in v1 already, so v1.1 is purely the
  beam + rescue layer.
* **Manual-fire toggle** (Galaga's tap-fire + 2-shot cap) as an option.
* **Transforming spirits** (Galaga's later-stage morphing enemies).
* **Named bosses** / a deeper bestiary beyond the three tiers.
* Two-player alternating play.
* Online/shared leaderboards (PlayTools is zero-auth, client-only — DD §1.3);
  bests stay local and surface through the Share Card.

---

## 8. Sign-off — Decided

All four open questions were resolved at brainstorm sign-off (2026-06-12):

1. **Name — *Ecto* (locked).** Tool id `arcade_ecto`, route `#/arcade/ecto`.
2. **Capture-and-rescue — *deferred to v1.1* (locked).** v1 ships the core
   formation-shooter; the Wraith appears without the possession beam (§7).
3. **Fire model — *hold-to-autofire* (locked).** Capped fire rate, no 2-shot
   limit (§2.2).
4. **Run shape — *lives-based endless* (locked).** 3 wranglers, stages escalate
   forever, high-score chase (§2.1).

### 8.1 Leaning (confirm at implementation)

* **DNA — Precision + Reflex.** Honest fit for a fixed shooter; reweight toward
  Focus (swarm-reading) only if preferred.
