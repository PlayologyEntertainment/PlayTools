# Crossload — Retro Arcade Cabinet Design Spec

**Version:** 1.0 (Implemented — shipped)
**Author:** Playology Entertainment
**Status:** Implemented (v1) — shipped. Code is live at `PlayTools.html` (~lines 9254-9634, `recordCrossloadRun` ~15518), with 5 achievements wired. (Doc header was left stale after ship; corrected here — see PlayTools ROADMAP.md for current state.)
**Parent Doc:** `PlayTools_DD.md` (this cabinet extends §5.5 Retro Arcade Module)

> **Why this cabinet.** The Arcade roster covers maze (Mac Pan), snake, paddle
> (Brick Breaker), reaction (Hopper Popper), memory (Mnemonic / SighMan), spatial
> puzzle (Pack Hacker), logic (Sudoku), word (B0ggle), match-3 (Defrag), card
> (Jack-In / Cold Stack), fixed-shooter (Ecto) and racing (Overdrive) — but has
> **zero crosser**, one of the most iconic and recognizable arcade genres. Nothing
> in the roster is about *threading lane traffic to reach the other side*. Crossload
> closes that gap with the same philosophy as the rest of the line: **a recognizable
> classic under a neon skin** (cf. Mac Pan = Pac-Man, Defrag = Bejeweled, Ecto =
> Galaga).

> **Brainstorm decisions (to lock at sign-off).** Single-player; *Frogger*-faithful
> grid-hop crosser; two-zone board (a **traffic bus** to dodge + a **data stream**
> to ride across); fall in the stream = death; **5 sockets** to fill per board;
> **3 lives**; per-crossing **time bonus**; difficulty selector consistent with
> Snake / Bricks / Mac Pan; **name is *Crossload***; setting is the shared PlayTools
> **netrunner** world (the same data-heist motif as Jack-In, Defrag and B0ggle).
> Proposed cabinet route `#/arcade/crossload`, tool id `arcade_crossload`.

---

## 1. Concept

**Crossload** is a *Frogger*-faithful **crosser** cabinet, reskinned around the
PlayTools netrunner motif. The player guides **a literal "bug in the code"** — a
neon **ladybug** process — across a live **system bus**, hopping one tile at a
time between lanes of hostile data traffic, then **riding carrier-blocks** across
a scrolling data **stream** to dock in one of five open **sockets** at the far
edge. Drop into the stream (or get crushed by traffic) and the bug is **flushed**.

The design philosophy is **"faithful but simplified"** (the house rule, per Mac
Pan §1): keep the soul of Frogger — the two-zone board, discrete grid hops,
multi-speed bidirectional lanes, the deadly river you survive only by riding
floats, the five home bays, and a per-crossing timer — but trim the deep
edge-case roster (diving turtles, the crocodile in the home row, the lady-frog
escort, the snake on the median) into clean, readable approximations sized for a
short browser arcade session. Those extras are catalogued as **v1.1 follow-ups**
(§8).

### 1.1 The Hero — "the bug"

* A neon **ladybug** — the "bug in the code" you're trying to walk safely through
  the system. The classic red-domed, black-spotted silhouette reads instantly and
  is charming, while the *gameplay* silhouette (a small thing hopping discrete
  tiles across lanes toward slots) is what signals "Frogger" to anyone who's
  played it. Deliberately **not** a frog, to keep clear daylight from the source.
* It moves in **discrete hops**, one grid cell per input — never free-sliding. The
  discrete hop *is* the genre's signature feel and is preserved exactly.
* Facing rotates to the last hop direction (up / down / left / right) so the
  player always reads which way a queued hop will go.
* On death it does a brief **"glitch / corrupt"** dissolve (pixel scatter) — the
  bug gets squashed out of the code — rather than the original splat.

---

## 2. The Board

A single fixed board for v1, structurally a Frogger-proportion grid (13 columns ×
~15 rows, scaled to the cabinet canvas), read **bottom-to-top**:

1. **Start dock** (bottom row): safe neon platform where the packet spawns.
2. **The Bus** (traffic zone): **5 lanes** of moving data traffic. Lanes
   alternate direction and run at different speeds. Touching any traffic = death.
   This is solid ground otherwise — standing between cars is safe.
3. **The Median** (middle safe row): a neon rail where the packet can pause and
   re-read the board. (The classic safe strip between road and river.)
4. **The Stream** (data-river zone): **5 lanes** of scrolling **carrier-blocks**
   (data convoys / packet-rafts) moving at varying speeds and directions. Here the
   rule **inverts**: the lane surface is **deadly void** — the packet survives
   only by **standing on a carrier** and is **carried along with it**. Ride a
   carrier off the screen edge and you're flushed; mind the gap and you fall in.
5. **The Sockets** (top row): **5 open ports** separated by wall segments. Docking
   the packet in an empty socket scores it and resets the packet to start. Fill
   all five to **clear the board**.

### 2.1 Lane behaviour

* Each lane has a fixed **direction**, **speed**, and **spacing** of objects,
  wrapping seamlessly edge-to-edge.
* Speeds and gaps are tuned so every board is **always solvable** with correct
  timing (no unwinnable lane phases), and escalate with level (§5) — faster lanes,
  tighter gaps, shorter timer.
* The Stream's carrier-blocks come in 1-, 2- and 3-cell widths; a wider carrier is
  a more forgiving ride, a single-cell carrier demands a precise hop.

### 2.2 The bonus capture (the "fly")

Frogger's fly is reskinned: now and then a **data-bounty** (a glowing token —
"a loose key" / bonus payload) appears in one of the **empty sockets** for a few
seconds. Docking *that* socket while the bounty is lit pays a bonus (§5.1). Only
one bounty is live at a time; it relocates if missed.

---

## 3. Session Rules, Lives & Difficulty

* **Lives:** the packet starts with **3** instances. Losing all ends the run.
* **Death:** by traffic (touched a moving vehicle in the Bus), by **flush**
  (stepped into the Stream void / rode a carrier off-edge), or by **timeout**
  (the crossing timer empties). Death resets the packet to the start dock; the
  board state (already-filled sockets, lane positions) persists.
* **The crossing timer:** each fresh packet has a depleting timer bar. Docking a
  socket **banks the remaining time as bonus points** and resets the bar for the
  next crossing. The timer is the pressure source that keeps runs short and tense
  (faithful to Frogger's per-frog timer).
* **Board clear:** fill all **5 sockets** → brief flourish → next board (same
  layout, faster lanes, tighter gaps, shorter timer, higher bonus values).
* **Difficulty selector** (consistent with Snake / Bricks / Mac Pan which carry a
  `diff`): themed bandwidth tiers — **Throttled / Standard / Overclocked** — set
  base lane speed, gap tightness, and timer length. `diff` is recorded per
  best-score (§6).
* **Controls:**
  * Desktop: **Arrow keys / WASD** = one discrete hop per press (up / down / left /
    right). Input is **debounced to one hop per cell** so a held key doesn't
    machine-gun the packet into traffic. **P / Esc** pauses.
  * Touch: **swipe** in a direction to hop; on-screen **d-pad** fallback.
    (PlayTools is PC-focused per DD §3.1.2.1, but arcade cabinets stay
    touch-playable — same contract as Mac Pan §5.)

### 3.1 Scoring summary

| Action | Points |
| --- | --- |
| Forward hop (net new furthest row) | 10 |
| Dock a socket | 50 |
| Time bonus on dock | remaining-time × 10 |
| Data-bounty socket (the "fly") | 200 |
| Clear the board (all 5 sockets) | 1000 + board number × 250 |
| Flawless board (no deaths) | +500 "Clean Run" bonus |

Forward-hop points credit only on reaching a **new furthest row** that crossing
(so you can't farm points by hopping back and forth — faithful to the original).

---

## 4. The Hazards — v1 roster

v1 ships the **core** crosser: multi-speed bidirectional traffic and ride-the-
carrier stream. The deeper Frogger hazard menagerie is deferred (§8). The named,
color-coded traffic classes below give the Bus its read:

| Class | Theme | Behaviour |
| --- | --- | --- |
| **Pingers** | Slow freight packets | Wide, slow, easy to time — the gentle lanes. |
| **Daemons** | Mid-speed processes | Standard speed; the workhorse threat. |
| **Spikes** | Fast interrupt bursts | Narrow and fast; the lane that punishes hesitation. |

Stream carriers are neutral **convoy-blocks** (no class personality in v1) — the
threat there is the **void between them**, not the blocks themselves.

---

## 5. Look & Feel

* **Rendering:** procedurally drawn pixel/wireframe sprites on `<canvas>`, in the
  style of the existing `astSprite`-type helpers — keeps the bundle lightweight
  (DD §1.3 Sub-Second Asset Delivery), no image files shipped.
* **Palette:** dark CRT background; the Bus lanes read as a dim **circuit-trace
  highway**; the Stream reads as a luminous **data current** (animated scanline
  flow) so the deadly void is unmistakable vs. the solid Bus ground — the single
  most important readability contract (water-is-death, faithful to Frogger's clear
  road/river split). Traffic classes are color-coded so the player reads lane
  threat at a glance.
* **Feedback:** socket-dock flash + score-pop; "flush" glitch-dissolve on a void
  death; a screen-edge pulse as the crossing timer runs low.
* **Audio:** optional and deferred for v1. If added, short synthesized blips (hop,
  dock, flush, timeout) via WebAudio — no audio files, consistent with the
  asset-weight principle. The repo's existing MP3s are site music and are **not**
  part of this cabinet.

---

## 6. PlayTools Integration

Crossload is a standard Retro Arcade cabinet and reuses the existing plumbing in
`PlayTools.html` — **no new architecture** (same contract Mac Pan §6 followed).

> **Note.** Exact identifiers below (recorder name, DNA axis split, ShareCard
> signature) are confirmed against the live `PlayTools.html` plumbing during
> build and reconciled with the existing recorders before code lands.

### 6.1 Tool registry + route

Add one entry to the tool registry array (alongside the other `lab:'Arcade'`
tools) and one router line:

```js
{ id:'arcade_crossload', lab:'Arcade', name:'Crossload', railName:'Crossload',
  icon:'🐞', tag:'mvp', route:'#/arcade/crossload',
  desc:'Hop a courier packet across the system bus — dodge the data traffic, ride
        the carriers over the stream, and dock all five sockets before you flush.',
  dna:'Reflex +12 · Control +8' }

Router.add('#/arcade/crossload', Views.crossload);
```

* **DNA vector:** **Reflex + Control** — lane-reading and timing under a shrinking
  clock (Reflex) plus precise discrete hop placement (Control). Final split tuned
  against existing tools at build time.
* **View:** `Views.crossload = function(container){ … return teardown; }`, mounting
  a `canvas.game`, START overlay, HUD (score / hi-score / lives / board / timer
  bar / sockets-filled), and the difficulty selector — matching the structure of
  `Views.pixelDodge` (the reference real-time cabinet, per Mac Pan §6.1).

### 6.2 Metagame recorder (honest Gamer Score contract)

Add `recordCrossloadRun(score, ctx)` following the exact pattern used by
`recordSnakeRun` / `recordBrickRun` / `recordMacPanRun`:

* `toolsCompleted++` credited **only on the first-ever run** (replayable game → no
  Gamer-Score grind-farming).
* `d.bests.arcade_crossload` updates on a new max, with a per-`diff` best map.
* `d.arcadePoints += Math.round(score/40)` — a **modest** metagame contribution in
  line with the other arcade recorders (exact divisor tuned so a strong Crossload
  run is worth roughly what a strong Snake / Bricks / Mac Pan run is).
* Counters: `crossloadRuns`, plus context flags for achievements (`boardsCleared`,
  `flawlessBoard`, `bountyGrabs`).
* Feeds the existing **Arcade Champion** achievement (10,000 arcade points) and the
  Universal Share Card via `ShareCard.open({ lab:'RETRO ARCADE', tool:'Crossload',
  glyph:'🐸', metric })` on game over.

### 6.3 Proposed cabinet achievements

| id | Name | Icon | Condition |
| --- | --- | --- | --- |
| `crossload_firstdock` | First Contact | 🐸 | Dock your first socket. |
| `crossload_fullboard` | Full Handshake | 🔌 | Fill all five sockets in one board. |
| `crossload_flawless` | Clean Run | ✨ | Clear a board with zero deaths. |
| `crossload_overclock` | Overclocked | ⚡ | Score 10,000+ in a single run, any difficulty. Shipped without the Overclocked-difficulty gate / at half the 20,000 threshold this doc originally specified. **Decided (2026-08-04, see ROADMAP.md):** the shipped version is canon — this is the intended balance, no retune planned. |

(Wired into the existing achievements array exactly like `pixel_pilot` /
`dodge_ace` / `macpan_seasoned`.)

---

## 7. Build Plan (v1)

A small, self-contained cabinet — the "low-hanging fruit" pick. Suggested order:

1. Registry entry + route + empty `Views.crossload` shell with START overlay and
   teardown (mirrors `Views.pixelDodge`).
2. Grid + render scaffold: board rows, canvas sizing, CRT frame.
3. Packet hop logic: discrete grid movement, debounced input, facing, furthest-row
   tracking.
4. The Bus: lane model (dir / speed / spacing), traffic spawning + wrap, collision
   = death.
5. The Stream: carrier-blocks, ride-along carrying, void death, edge-flush.
6. Sockets: dock detection, fill state, board-clear, the data-bounty.
7. Lives, crossing timer + time bonus, scoring, difficulty selector, level scaling.
8. HUD + game-over result screen (`result-tile` pattern) + recorder + ShareCard +
   achievements wiring.
9. Touch controls (swipe + d-pad).
10. Browser smoke test via the existing harness (`npm run test:browser`).

---

## 8. Out of Scope for v1 (candidate v1.1 follow-ups)

* **Diving carriers** (the Frogger diving-turtle equivalent — a carrier that
  submerges on a cycle, becoming briefly deadly).
* **The crocodile socket** (a hazard that masquerades as a safe socket).
* **The median snake** and **otter/predator** hazards on the safe strips.
* **Escort payload** (the lady-frog — ride a second packet home for a bonus).
* Multiple distinct board layouts / a board rotation.
* Online/shared leaderboards (PlayTools is zero-auth, client-only — DD §1.3);
  bests stay local and surface through the Share Card.
* Audio package (see §5).

---

## 9. Open Questions for Sign-off

1. **Cabinet name** — *Crossload*: keep, or prefer another netrunner pun
   (Leapfrog, Crossfeed, Packet, Datahop)?
2. **Hero** — shipped as a neon **ladybug** ("bug in the code"). Keep, or push it
   further (e.g. a more abstract glitch-sprite)?
3. **Difficulty labels** — *Throttled / Standard / Overclocked* (under a
   **"Difficulty"** field label, consistent across all cabinets): keep the tier
   names, or rename?
4. **Stream death model** — v1 ships **void-is-death + ride-the-carrier**
   (faithful). Confirm we want the deadly-water rule rather than a softer
   "swim slowly / take damage" variant.

### 9.1 Proposed v1 locks (pending your nod)

* **Scope — single board for launch.** v1 ships one fixed board (§2); extra
  layouts and the deeper hazard menagerie (§8) are post-launch follow-ups.
* **Core mechanic — two-zone Frogger** (dodge the Bus, ride the Stream) exactly as
  in §2; no rule inversions beyond the classic road/river split.
