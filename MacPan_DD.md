# Mac Pan — Retro Arcade Cabinet Design Spec

**Version:** 1.0
**Author:** Playology Entertainment
**Status:** Implemented (v1) — shipped into the Retro Arcade in `PlayTools.html`
**Parent Doc:** `PlayTools_DD.md` (this cabinet extends §5.5 Retro Arcade Module)

> **Build note (v1 as shipped).** Implemented per this spec with the signed-off
> decisions: single fixed maze; Rare / Medium / Well Done difficulties; named
> cast Roma / Barry / Brock / Ginger with the cooked→core→regrow loop; Burner
> Heat Mode with the 200/400/800/1600 sauté chain; Special of the Day; 3 lives
> with a bonus pan at 10,000. Cabinet route `#/arcade/macpan`, tool id
> `arcade_macpan`. Cooked visual ships as a "wilt + sizzle + score-pop" treatment
> rather than a literal charred sprite (open question §9.4 — easy to dial up).

---

## 1. Concept

**Mac Pan** is a *Pac-Man*-faithful maze-chase arcade cabinet, reskinned around
the PlayTools kitchen. The player guides **Mac** — a dirty, well-seasoned cast
iron pan — through a neon maze, eating colorful diced food while a cast of four
fruits & vegetables hunt him down. When Mac picks up a **Burner** (the
power-pellet equivalent) he glows *red-hot* and the tables turn: he sautés his
pursuers for escalating points before they cool him back down.

The design philosophy is **"faithful but simplified"** (per sign-off): keep the
soul of Pac-Man — the maze, the four-enemy chase, scatter/chase phases, the
power-pellet fright reversal, tunnels, and a bonus item — but trim the
edge-case rules (fractional per-tile speed tables, the exact original ghost
"cruise elroy" thresholds, the maze-jail dot-counter release logic) into clean,
readable approximations sized for a short browser arcade session.

### 1.1 The Hero — "Mac"

* A rounded cast-iron skillet seen top-down. The classic Pac-Man wedge mouth is
  the pan's pour spout / the gap where food goes in; it opens and closes in the
  direction of travel (the signature chomp).
* A short **handle** trails off the back of the body (opposite the mouth),
  rotating to point *behind* the direction of motion. This is the one silhouette
  change from a plain circle and is the character's signature read.
* Finish: dark graphite cast-iron with a subtle seasoned-oil sheen highlight, so
  he still pops against the dark CRT background without being "a yellow circle."
* When **heated** (power mode) the iron glows from a dull ember at the rim to a
  bright orange-red core, with heat-shimmer above him.

---

## 2. The Maze & Collectibles

### 2.1 Layout

* A single fixed maze for v1, structurally a Pac-Man-style symmetric labyrinth
  (28×31 tile classic proportion, scaled to the cabinet canvas). Walls render in
  the PlayTools neon-rim style (greasy-neon piping) over the dark CRT screen.
* **Grease Channels (tunnels):** the left and right mid-row openings wrap the
  player and enemies edge-to-edge, exactly like Pac-Man's warp tunnels. Enemies
  move at reduced speed inside a channel.
* **The Crisper (the pen):** the central enemy box is a glowing refrigerator
  drawer. Eaten enemies return here as a bare "core" and **regrow** fresh before
  re-entering play (see §4.3).

### 2.2 Pellets — "the little colorful pieces of food"

* **Diced bits (standard pellets):** the ~240 small dots are diced mixed
  ingredients — corn kernels, peas, diced red/green pepper, carrot cubes —
  cycling colors around the maze so the paths read as "confetti food." **10 pts**
  each. Clearing every pellet + Burner completes the level.
* **Burners (power pellets):** four large flashing items, one near each corner,
  drawn as a **lit gas-flame / glowing chili pepper**. Eating one triggers
  **Heat Mode** (§3) and is worth **50 pts**.

### 2.3 Special of the Day (the bonus item)

The Pac-Man "fruit" is reskinned — since the *enemies* are fruit, the bonus is a
**premium ingredient** that appears twice per level beneath the Crisper, lingers
briefly, then leaves. It rotates by level and escalates in value:

| Level | Special of the Day | Points |
| --- | --- | --- |
| 1 | Pat of Butter | 100 |
| 2 | Egg | 300 |
| 3–4 | Mushroom | 500 |
| 5–6 | Strip of Bacon | 700 |
| 7–8 | Cut of Steak | 1000 |
| 9–10 | Wheel of Cheese | 2000 |
| 11+ | Golden Truffle | 5000 |

---

## 3. Heat Mode (the power-pellet reversal)

Eating a **Burner** ignites Mac:

1. Mac glows red-hot (ember → orange-red) with heat-shimmer.
2. All active enemies **wilt**: they desaturate to a sweating, frightened state,
   reverse direction, and slow down (they're trying to escape the heat).
3. While hot, contact **sautés** an enemy instead of killing Mac.
4. Heat **duration shrinks with level** (faithful fright-timer decay):

| Level | Heat duration | Final flash warning |
| --- | --- | --- |
| 1 | 7.0 s | last 2.0 s |
| 2–3 | 6.0 s | last 2.0 s |
| 4–5 | 4.0 s | last 1.5 s |
| 6–8 | 3.0 s | last 1.5 s |
| 9–11 | 2.0 s | last 1.0 s |
| 12+ | 0 s (no fright; enemies still scatter once) | — |

During the **final flash**, the enemies blink between wilted and normal color to
warn the player that the pan is cooling — identical tell to Pac-Man.

### 3.1 Sauté scoring (the chain)

Eating enemies during one Heat window doubles each time, exactly like ghosts:

| Enemy # this heat | Points |
| --- | --- |
| 1st | 200 |
| 2nd | 400 |
| 3rd | 800 |
| 4th | 1600 |

A clean **four-in-one-heat** ("Full Course") is the skill-flex moment and ties
to an achievement (§6).

---

## 4. The Enemies — proposed named cast of four

Per sign-off we ship **both**: a named, color-coded cast *and* the
cooked-then-respawn loop. Each maps one-to-one onto a classic ghost personality
so the maze "reads" correctly to anyone who's played Pac-Man, then re-themed as
produce.

| Name | Produce | Color | Maps to | Personality |
| --- | --- | --- | --- | --- |
| **Roma** | Tomato | Red | Blinky | **The Chaser.** Targets Mac's exact tile — relentless direct pursuit. Speeds up as the maze empties (our simplified "Elroy": +speed at 20 pellets left, again at 10). |
| **Barry** | Strawberry | Pink | Pinky | **The Ambusher.** Targets four tiles *ahead* of Mac's mouth to cut him off, not chase his tail. |
| **Brock** | Broccoli | Teal/green | Inky | **The Flanker.** Unpredictable: aims at a point projected from Mac using **Roma's** position as a pivot (the classic Inky vector), so the two pincer the player. |
| **Ginger** | Carrot | Orange | Clyde | **The Shy One.** Chases when far from Mac, but bolts for his home corner when he gets close — loose, skittish, opens escape lanes. |

### 4.1 Scatter / Chase rhythm (simplified)

Enemies alternate between **Scatter** (retreat to their personal home corner)
and **Chase** (run their targeting rule above), on a fixed wave timeline that
shortens with level. v1 wave table (seconds), looping on the last Chase:

```
Scatter 7  → Chase 20 → Scatter 7 → Chase 20 → Scatter 5 → Chase ∞
```

(Higher levels compress the Scatter phases toward 5s/0s, biasing toward Chase —
the same escalation Pac-Man uses, without reproducing its frame-exact table.)

### 4.2 Speeds (relative to Mac = 100%)

Simplified, level-scaled bands rather than per-dot fractions:

| State | Speed |
| --- | --- |
| Enemy, chase/scatter | 75% → 95% across levels 1→12 |
| Enemy, wilted (Heat Mode) | 50% |
| Enemy, returning core | 160% (snaps home fast) |
| Enemy, inside Grease Channel | 40% |
| Mac, normal | 100% (80% base × difficulty; see §5) |
| Mac, eating a pellet | brief 90% (the classic micro-stutter that lets a trailing enemy gain — kept because it matters to chase tension) |

### 4.3 Cooked → respawn loop

When Mac sautés a wilted enemy:

1. The enemy flashes to a **cooked/charred sprite** showing its chain value
   (200/400/800/1600) for ~0.6 s while the game briefly pauses that actor.
2. Only its **core** (a seed/pit/stub) then races back to **The Crisper** at
   return speed.
3. In the Crisper the core **regrows** into a fresh, fully-colored fruit/veg over
   a short beat, then re-enters the maze in its normal hunting state.

This mirrors "ghost eyes return to the box and respawn," themed as produce being
picked, cooked, and regrown.

---

## 5. Session Rules, Lives & Difficulty

* **Lives:** Mac starts with **3** pans; **+1 bonus pan at 10,000 pts** (one-time).
  Losing all pans ends the run.
* **Death:** touching a non-wilted enemy. Mac does a short "clatter" lose
  animation, the maze resets actors to start positions, remaining pellets persist.
* **Level clear:** eat every diced bit + every Burner → brief flourish → next
  level (same maze, faster enemies, shorter Heat, higher Special value).
* **Difficulty selector** (consistent with Snake/Bricks which carry a `diff`):
  **Rare / Medium / Well Done** — sets Mac's base speed, starting enemy speed
  band, and Heat-duration multiplier. `diff` is recorded per best-score (§6).
* **Controls:**
  * Desktop: **Arrow keys / WASD.** Direction is **queued** — pressing toward a
    not-yet-reachable turn buffers it so Mac corners cleanly (Pac-Man "cornering"
    feel). **P / Esc** pauses.
  * Touch: **swipe** to set heading; on-screen d-pad fallback. (PlayTools is
    PC-focused per DD §3.1.2.1, but the arcade cabinets stay touch-playable.)

### 5.1 Scoring summary

| Action | Points |
| --- | --- |
| Diced bit | 10 |
| Burner | 50 |
| Sauté enemy | 200 / 400 / 800 / 1600 (chain) |
| Special of the Day | 100 → 5000 (table §2.3) |
| Bonus pan | at 10,000 (one-time) |

---

## 6. PlayTools Integration

Mac Pan is a standard Retro Arcade cabinet and reuses the existing plumbing in
`PlayTools.html` — no new architecture.

### 6.1 Tool registry + route

Add one entry to the tool registry array (alongside the other `lab:'Arcade'`
tools) and one router line:

```js
{ id:'arcade_macpan', lab:'Arcade', name:'Mac Pan', railName:'Mac Pan',
  icon:'🍳', tag:'mvp', route:'#/arcade/macpan',
  desc:'Steer Mac the cast-iron pan through the maze — gobble the food, dodge the
        produce, grab a Burner and sauté your pursuers.',
  dna:'Control +12 · Strategy +8' }

Router.add('#/arcade/macpan', Views.macPan);
```

* **DNA vector:** **Control + Strategy** — pathing under pressure (Control, like
  Neon Snake) plus route planning around four pursuers (Strategy). Final split
  to be tuned against existing tools at build time.
* **View:** `Views.macPan = function(container){ … return teardown; }`, mounting
  a `canvas.game`, START overlay, HUD (score / hi-score / lives as little pan
  icons / level), and the difficulty selector — matching the structure of
  `Views.pixelDodge`.

### 6.2 Metagame recorder (honest Gamer Score contract)

Add `recordMacPanRun(score, ctx)` following the exact pattern used by
`recordSnakeRun` / `recordBrickRun`:

* `toolsCompleted++` credited **only on the first-ever run** (replayable game →
  no Gamer-Score grind-farming).
* `d.bests.arcade_macpan` updates on a new max, with a per-`diff` best map.
* `d.arcadePoints += Math.round(score/40)` — a **modest** metagame contribution
  in line with the other arcade recorders (exact divisor tuned so a strong Mac
  Pan run is worth roughly what a strong Snake/Bricks run is).
* Counters: `macpanRuns`, plus context flags for achievements (`fullCourse`,
  `levelsCleared`, `flawlessLevel`).
* Feeds the existing **Arcade Champion** achievement (10,000 Gamer Score) and the
  Universal Share Card via `ShareCard.open({ lab:'RETRO ARCADE', tool:'Mac Pan',
  glyph:'🍳', metric })` on game over.

### 6.3 Proposed cabinet achievements

| id | Name | Icon | Condition |
| --- | --- | --- | --- |
| `macpan_seasoned` | Seasoned | 🍳 | Clear level 1 in a single run. |
| `macpan_full_course` | Full Course | 🔥 | Sauté all four enemies on one Burner. |
| `macpan_hot_streak` | Hot Streak | 🌶️ | Score 20,000+ in a single run. |
| `macpan_michelin` | Michelin Pan | ⭐ | Clear level 5 on Well Done difficulty. |

(Wired into the existing achievements array exactly like `pixel_pilot` /
`dodge_ace`.)

---

## 7. Art & Audio Direction

* **Rendering:** procedurally drawn pixel sprites on `<canvas>`, in the style of
  the existing `astSprite`-type helpers — keeps the bundle lightweight (DD §1.3
  Sub-Second Asset Delivery) and avoids shipping image files.
* **Palette:** dark CRT background, neon-rim maze walls, graphite Mac with an
  oil-sheen highlight, and saturated produce so the four enemies are instantly
  distinguishable by color (red / pink / teal / orange) the way the ghosts are.
* **Wilted state:** a single shared "sweating, desaturated, frightened" look
  (cool blue cast) so fright is unmistakable regardless of which produce it is —
  same readability contract as Pac-Man's blue ghosts.
* **Heat-Mode feedback:** screen-edge warm glow + Mac's ember gradient + light
  heat-shimmer; intensifies, then strobes during the final-flash cool-down.
* **Audio:** optional and deferred for v1. If added, short synthesized blips
  (chomp, Burner ignite, sizzle on sauté, lose-clatter) generated via WebAudio —
  no audio files, consistent with the asset-weight principle. The repo's existing
  MP3s are site music and are **not** part of this cabinet.

---

## 8. Out of Scope for v1 (candidate follow-ups)

* Multiple distinct maze layouts / a maze rotation.
* Frame-exact reproduction of the original speed/Elroy/release tables.
* Cutscene interludes (the Pac-Man "intermission" animations).
* Online/shared leaderboards (PlayTools is zero-auth, client-only — DD §1.3);
  bests stay local and surface through the Share Card.
* Audio package (see §7).

---

## 9. Open Questions for Sign-off

1. **Enemy names** — are *Roma / Barry / Brock / Ginger* good, or do you want
   different produce / punnier names?
2. **Difficulty labels** — *Rare / Medium / Well Done* — keep, or rename?
3. **Bonus naming** — "Special of the Day" for the bonus ingredient: good?
4. **Heat theme literalness** — enemies shown as literally *cooked/charred* on
   sauté: on-brand, or too much? (Alternative: they just "wilt away.")

### 9.1 Decided

* **Scope — single maze for launch (locked).** v1 ships one fixed maze (§2.1);
  additional layouts / a maze rotation remain a post-launch follow-up (§8).
