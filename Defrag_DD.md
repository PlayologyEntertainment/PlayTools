# Defrag — Retro Arcade Cabinet Design Spec

**Version:** 0.1 (brainstorm draft — for sign-off)
**Author:** Playology Entertainment
**Status:** Proposed — fills the open **match-3** genre gap in the Retro Arcade (§5.5)
**Parent Doc:** `PlayTools_DD.md` (this cabinet extends §5.5 Retro Arcade Module)

> **Why this cabinet.** The Arcade roster covers maze (Mac Pan), snake, paddle
> (Brick Breaker), reaction (Hopper Popper), memory (Mnemonic / SighMan), spatial
> puzzle (Pack Hacker), logic (Sudoku), word (B0ggle), cards (Jack-In) and racing
> (Overdrive) — but has **zero match-3**, the single most-played *casual* genre on
> earth (Bejeweled → Candy Crush). Defrag closes that gap with the same philosophy
> as the rest of the line: **a recognizable classic under a neon skin.**

---

## 1. Concept

**Defrag** is a *Bejeweled / match-3*-faithful swap-and-cascade cabinet, reskinned
around the PlayTools netrunner motif shared with **Jack-In** and **B0ggle**. The
board is a corrupted disk sector; the "gems" are glowing **data shards** of six
colors. The player **swaps adjacent shards** to line up **three or more of a kind**;
matched runs are purged from the drive, shards above **collapse down**, fresh data
streams in from the top, and any new lines formed **cascade** automatically for
chain bonuses. The fiction: you're **defragmenting** a hostile drive against the
clock — every match recovers data, every cascade is a chain-purge.

The classic match-3 rules are kept strictly faithful so anyone who has played
Bejeweled or Candy Crush is instantly at home. The arcade-ification is the
**timed score chase** layered on top: a single tidy swap becomes a 60-second run
with a high-score, a letter grade, and cabinet achievements.

### 1.1 Why the netrunner skin

* Matches the established Arcade voice (Mac Pan, B0ggle DECRYPT, Jack-In
  OVERLOAD) — the shards are **data cores**, a match is a **purge**, a long chain
  is a **CASCADE**, and the score readout is **% drive recovered**.
* Purely a presentation layer over standard match-3 — no rules are bent for the
  theme (cf. Jack-In keeping the 21 rules honest).

---

## 2. Core Loop — faithful match-3

An **8×8** grid of shards in **6 colors**. The board is seeded with **no
pre-existing matches** and is guaranteed to contain **at least one legal move**.

1. **Select & swap.** Click/tap a shard, then click/tap an **orthogonally
   adjacent** one (or drag one into its neighbor). The two shards swap.
2. **Validate.** If the swap creates a run of **3+ same-color** shards in a row or
   column, the swap **sticks** and the run is purged. If it creates **no** match,
   the shards **swap back** (the classic "illegal move" snap-back) — no time
   penalty, just no progress.
3. **Purge → collapse → refill.** Matched shards clear; everything above them
   **falls** to fill the gaps; new random shards drop in from the top.
4. **Cascade.** If the refill forms new matches, they purge automatically with an
   escalating **chain multiplier** — chains are where the big scores live.
5. **Specials (match-4 / match-5).** Faithful to Bejeweled's power pieces:
   * **Match-4** (line of 4) → forges a **Lance** core. Activating it (matching or
     swapping it) clears its entire **row or column**.
   * **Match-5** in a line → forges a **Hypercore** (color bomb). Swapping it with
     any shard **purges every shard of that color** on the board.
   * **T / L shape (5 in an intersection)** → **Nova**: clears a **3×3** blast.
6. **No-moves reshuffle.** If the board has no legal move, it auto-**reshuffles**
   (re-seeds with a guaranteed move) — no dead boards, no penalty.
7. **Time out.** The run ends when the **clock hits zero** → grade + Share Card.

### 2.1 Game mode (v1)

**Sprint** — a **60-second** score-attack (in the family of Hopper Popper's 30s
and the B0ggle clock). One mode, three **difficulties** that tune the timer and
color count, mirroring `Views.sudoku`'s difficulty selector:

| Difficulty | Timer | Colors | Feel |
| --- | --- | --- | --- |
| **Sector** (easy) | 75s | 5 | More matches on screen, gentle |
| **Volume** (normal) | 60s | 6 | The standard run |
| **Kernel** (hard) | 45s | 7 | Sparse, scan-heavy, expert |

---

## 3. Scoring & Grade (arcade score chase)

| Event | Points |
| --- | --- |
| Match-3 | **30** (10 / shard) |
| Each extra shard in a run (4th, 5th…) | **+15** each |
| Cascade step | running **×2, ×3, ×4 …** chain multiplier on that step |
| Special forged | **+50** bonus |
| Special detonation | scores every shard it clears at base rate |

* **Score** = total points purged during the run. **Cascades are the skill
  ceiling** — setting up a swap that chain-reacts three deep dwarfs three flat
  match-3s, which is exactly the Bejeweled mastery curve.
* A subtle **"% drive recovered"** flavor readout tracks total shards purged, for
  the netrunner skin and the Share Card hero stat.

### 3.1 Grade

Rides the standard `arcadeGrade(comp)` ladder used by every cabinet, `comp` keyed
to score against a tuned par (Volume difficulty):

```
comp = clamp01( score / 4000 )
```

So ~0 → F, ~1500 → C, ~3000 → A, **4000+ → S** — tuned so a clean run of flat
matches lands a B/C and only **cascade play** reaches A/S, matching the line's
"beat par for an A, smash it for an S" feel. (Easy/Hard scale par via the same
constant so the grade reads honestly across difficulty.)

---

## 4. PlayTools Integration

Defrag is a standard Retro Arcade cabinet and reuses the existing plumbing in
`PlayTools.html` — **no new architecture** (cf. Jack-In §4).

### 4.1 Tool registry + route

One entry in the `CABINETS` array (alongside the other `lab:'Arcade'` tools) and
one router line:

```js
{ id:'arcade_defrag', lab:'Arcade', name:'Defrag', railName:'Defrag',
  icon:'💎', tag:'mvp', route:'#/arcade/defrag',
  desc:'Swap adjacent data shards to purge runs of three, trigger chain
        CASCADES, and defrag the drive before the clock flatlines.',
  dna:'Focus +12 · Speed +8' }

Router.add('#/arcade/defrag', Views.defrag);
```

* **DNA vector:** **Focus + Speed** — rapid board-scanning for the next run under
  a live clock. Deliberately *not* another Strategy+Focus entry (B0ggle / Sudoku /
  Packer already cluster there) — match-3's signature is fast visual scanning, so
  it diversifies the DNA spread.
* **View:** `Views.defrag = function(container){ … return teardown; }`, mounting
  the CRT-wrapped board (`crtWrapTV()`), the HUD (Time / Score / Chain / Best), and
  the difficulty selector — matching the DOM structure of `Views.sudoku` /
  `Views.packer`.

### 4.2 Metagame recorder (honest Gamer Score contract)

Add `recordDefragRun(score, ctx)` following the exact pattern used by
`recordSnakeRun` / `recordSudokuRun` / `recordJackInRun`:

* `toolsCompleted++` credited **only on the first-ever run** (replayable game → no
  Gamer-Score grind-farming).
* `d.bests.arcade_defrag` updates on a new max score.
* `d.arcadePoints += Math.round(score/40)` — a **modest** metagame contribution in
  line with the other arcade recorders.
* Counters for the cabinet achievements: `defragRuns`, `defragBestChain`
  (high-water mark), `defragHypercores`, plus a `defragRecovered` running total.
* Feeds the existing **Arcade Champion** achievement (10,000 Gamer Score) and the
  Universal Share Card via `ShareCard.open({ lab:'RETRO ARCADE', tool:'Defrag',
  glyph:'💎', … })` on time-out.

### 4.3 Cabinet achievements

| id | Name | Icon | Condition |
| --- | --- | --- | --- |
| `defrag_ace` | Defrag Ace | 💎 | Earn an A grade or better in Defrag. |
| `defrag_cascade` | Chain Reaction | ⚡ | Trigger a **4-deep** (or longer) cascade. |
| `defrag_hypercore` | Hypercore | 🌀 | Forge and detonate a Hypercore (color bomb). |
| `defrag_overclock` | Overclock | 🔥 | Score **4000+** in a single run. |
| `defrag_marathon` | Drive Surgeon | 🩺 | Purge **1,000** total shards (lifetime). |

(Wired into the existing achievements array exactly like `sudoku_ace` /
`b0ggle_overclock` / `jackin_ace`, with counter fallbacks so they persist across
sessions.)

---

## 5. Art & Audio Direction

* **Rendering:** a **canvas** board (like the action cabinets) of procedurally
  drawn shards — **6 distinct color *and* glyph** pairs (◆ ▲ ⬢ ● ★ ✚) so the game
  stays playable under the global **Reduce-CRT** / colorblind-safe preference (no
  image files — DD §1.3 Sub-Second Asset Delivery).
* **Specials:** Lance cores show a directional streak; the Hypercore is a
  rainbow-spun glyph; Nova pulses. Detonations flash the shared neon palette.
* **Cascade tell:** each chain step bumps a **CASCADE ×N** banner and pitches the
  blip up a step — the dopamine ramp that defines the genre.
* **Palette:** dark CRT board with neon-rim framing and gold accents (`--neon-3`),
  mounted in the shared `crtWrapTV()` scanline frame — consistent with the line.
* **Audio:** optional deferred WebAudio blips through the shared `makeBlip()` /
  `soundToggle()` helpers (swap, purge, ascending cascade chime, special forge,
  time-low pulse) — no audio files, consistent with the asset-weight principle.

---

## 6. Session Rules summary

| Action | Result |
| --- | --- |
| Swap → forms a run | Run purges, score up, gravity + refill + cascade |
| Swap → no run | Snap back, no penalty |
| Match-4 / 5 / T-L | Forge Lance / Hypercore / Nova special |
| No legal moves | Auto-reshuffle (guaranteed move), no penalty |
| Clock hits 0 | End run → grade + Share Card |

* **Controls:** click/tap a shard then its neighbor, **or** drag a shard into a
  neighbor. Keyboard: **arrow keys** move a cursor, **Space/Enter** picks up /
  swaps — keeping the cabinet fully usable without a mouse.
* **Touch-playable** like every Arcade cabinet (drag-swap is the natural mobile
  gesture).

---

## 7. Out of Scope for v1 (candidate follow-ups)

* **Endless / "Zen" mode** (no timer, play to a dead board) as a second mode.
* **Move-limited "puzzle" mode** with hand-authored boards (the Candy Crush half).
* Obstacle tiles (locked / encrypted / armored shards needing 2 matches).
* Daily-seed board for fair score comparison.
* Online/shared leaderboards (PlayTools is zero-auth, client-only — DD §1.3);
  bests stay local and surface through the Share Card.

---

## 8. Open Questions for Sign-off

1. **Name** — *Defrag* (netrunner skin, ties to Jack-In / B0ggle). Keep, or prefer
   a gem-forward name (*Crystik*, *Shardware*, *Core Match*)?
2. **Primary mode** — v1 ships a **60s timed Sprint** (fits the short-session
   cabinet mandate). Good, or lead with an **endless/Zen** board instead?
3. **DNA vector** — proposed **Focus + Speed** to diversify away from the
   Strategy-heavy cluster. Keep, or weight toward **Strategy** to reward cascade
   planning?
4. **Board size / colors** — **8×8 / 6 colors** as the Volume default. Confirm, or
   go classic Bejeweled **8×8 / 7 colors**?

### 8.1 To be decided at sign-off

* **Special-piece set** — Lance / Hypercore / Nova proposed (§2.5); confirm the
  match-4/5/T-L mapping or trim to just Lance + Hypercore for v1.
