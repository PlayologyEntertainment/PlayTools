# Cold Stack — Retro Arcade Cabinet Design Spec

**Version:** 1.0 (brainstorm sign-off — ready for implementation)
**Author:** Playology Entertainment
**Status:** Approved — adds **Klondike Solitaire** to the Retro Arcade (§5.5), the
single most-installed card game on earth and the line's last obvious "everyone
already knows how to play this" gap.
**Parent Doc:** `PlayTools_DD.md` (this cabinet extends §5.5 Retro Arcade Module)

> **Why this cabinet.** The Arcade roster covers maze (Mac Pan), snake, paddle
> (Brick Breaker), reaction (Hopper Popper), memory (Mnemonic / SighMan), spatial
> puzzle (Pack Hacker), logic (Sudoku), word (B0ggle), match-3 (Defrag), racing
> (Overdrive) and one **card** cabinet — **Jack-In** (Blackjack, a *gambling*
> game against The House). It has **zero solitaire**, the most-shipped card game
> in computing history (it sold Windows). Cold Stack closes that gap with the
> same philosophy as the rest of the line: **a recognizable classic under a neon
> skin** — and it sits a world apart from Jack-In: lone-wolf **patience and
> planning** instead of betting against a dealer.

---

## 1. Concept

**Cold Stack** is a *Klondike Solitaire*-faithful card cabinet, reskinned around
the PlayTools netrunner motif shared with **Jack-In**, **B0ggle** and **Defrag**.
You've pulled a **cold stack** — a corrupted, offline block of memory — and your
job is to **sort the scrambled data into four clean root partitions**. Cards are
glowing CRT data-chips; the four foundations are **root stacks** (`root/♠ root/♥
root/♦ root/♣`) you **compile** Ace-up; the tableau is the fragmented sector you
untangle; flipping a face-down chip is **decrypting** it. Compile all 52 chips
home and the stack is **clean** — the drive is recovered.

The classic Klondike rules are kept strictly faithful, so anyone who has played
Windows/macOS Solitaire is instantly at home. The arcade-ification is the
**timed score chase** layered on top: a quiet game of Patience becomes a
speed-and-efficiency run with a high-score, a letter grade, and cabinet
achievements.

### 1.1 Why the netrunner skin

* Matches the established Arcade voice (Mac Pan, B0ggle DECRYPT, Jack-In
  OVERLOAD, Defrag CASCADE) — foundations are **root partitions**, a face-down
  card is **encrypted** until decrypted, winning is **STACK CLEAN**, and the
  hero stat is **% drive recovered** (cards compiled home / 52).
* Purely a presentation layer over standard Klondike — **no rules are bent for
  the theme** (cf. Jack-In keeping the 21 rules honest, Defrag keeping match-3
  faithful).
* The name doubles as the mechanic: the tableau columns are literal **stacks**
  you sort, and a "cold stack" is cyberpunk for offline/forensic memory — the
  block you're brought in to recover.

---

## 2. Core Loop — faithful Klondike

The standard 52-card Klondike layout:

* **Tableau** — **7 columns**, dealt 1·2·3·4·5·6·7 chips; only the **top chip of
  each column is face-up (decrypted)**, the rest are encrypted.
* **4 root foundations** — empty to start; built **up by suit, Ace → King**.
* **Stock + Waste** — the remaining 24 chips form the stock; flipping deals to
  the waste pile.

The faithful rules:

1. **Build the tableau down, alternating colour.** A face-up chip (or an ordered
   run of them) moves onto another tableau chip that is **one rank higher and the
   opposite colour** (e.g. red 9 onto black 10). Multi-card ordered runs move as
   a unit.
2. **Compile to root.** Move a chip to its root foundation when it's the next
   rank for that suit (**Ace first**, then 2, 3 … up to King). Roots build **up
   by suit**.
3. **Decrypt.** Emptying the face-up chip off a column **flips the next chip
   face-up** (decrypt) — the core engine of progress.
4. **Empty columns.** A fully cleared column is an empty slot that accepts **any
   King** (or a King-led run) — faithful Klondike.
5. **Deal from stock.** Tap the stock to deal to the waste — **Draw-1** (one chip
   at a time) or **Draw-3** (three at a time, only the top playable), per the
   cabinet toggle (§2.1). The waste's top chip is always live to play.
6. **Recycle.** When the stock empties, tap the empty stock to **recycle the
   waste** back into the stock and run it again. (Draw-1 = unlimited passes;
   Draw-3 likewise — faithful and forgiving; no pass cap in v1.)
7. **Undo.** **Unlimited undo** rewinds the last move(s) — quality-of-life
   expected in any modern Solitaire (§2.2). Undo is free in Zen; in Sprint the
   clock keeps running (no time refund), so undo costs you tempo, not points.
8. **Auto-complete.** Once every chip is decrypted and no chip blocks another, a
   **COMPILE** button (and double-tap-to-send) sweeps the board home
   automatically — no tedious end-game clicking.
9. **Win — STACK CLEAN.** All **52 chips compiled to root** → the stack is clean,
   the run ends with a victory flourish → grade + Share Card.
10. **Stuck / give up.** If no productive move remains, the player can **bank the
    run** (Zen) or it ends on the clock (Sprint). A partial solve still scores
    every chip sent home (§3), so there's no "wasted" run.

### 2.1 Game modes (v1)

Two independent toggles on the cabinet front — a **draw toggle** and a **mode
toggle** — mirroring `Views.sudoku`'s difficulty selector and Defrag's two-mode
launch.

**Draw toggle — Draw-1 / Draw-3** (default **Draw-1**):

| Draw | Feel | Win rate |
| --- | --- | --- |
| **Draw-1** (default) | Approachable; nearly every deal is winnable | High |
| **Draw-3** | The classic "hard" Klondike; tighter stock access | Lower |

**Mode toggle — Sprint / Zen** (default **Sprint**):

* **Sprint** — a live clock; the headline high-score chase. Time and efficiency
  both feed the score (§3), so a fast, tight solve is the path to an **S**.
* **Zen** — no timer; the relaxed on-ramp. Same scoring **minus** the time
  component (it grades on efficiency + completion), so a careful Zen solve and a
  frantic Sprint both produce a comparable score/grade for the Share Card.

(Draw and mode combine freely — Draw-1 Zen is the gentle on-ramp; Draw-3 Sprint
is the expert score chase.)

### 2.2 Quality-of-life (shipping in v1)

* **Unlimited undo** — a full move-history stack; rewind as far as you like.
* **Auto-complete (COMPILE)** — one-tap board sweep once the deal is trivially
  solvable, plus **double-tap a chip** to auto-send it to root when legal.
* **Smart move hint** is **out of scope for v1** (§7) to keep the score chase
  honest.

> **Decided against for v1:** the **Daily Seed** deal. It was on the table for
> comparable scores but adds determinism/seed plumbing that, like Defrag, we're
> deferring (§7). v1 deals are freshly shuffled each run.

---

## 3. Scoring & Grade (arcade score chase)

Klondike is fundamentally **win/lose**, so — exactly like Defrag turned a tidy
swap into a 60-second chase — Cold Stack layers an **honest score** on top that
rewards **progress, speed and efficiency**, and still scores a non-winning run by
how far it got.

| Event | Points |
| --- | --- |
| Chip **decrypted** (tableau flip) | **+5** |
| Chip **compiled to root** | **+10** |
| Chip moved **off root** (back to tableau) | **−10** (nets to zero; no farming) |
| Empty a tableau column | **+20** |
| **STACK CLEAN** (full 52-card solve) | **+250** win bonus |
| **Speed bonus** (Sprint only) | remaining-time scaled, up to **+300** on a fast clean |
| **Efficiency bonus** | `+max(0, 150 − 1·movesOverPar)` — fewer moves, bigger bonus |

* **Score** = the sum of the above for the run. **Completion dominates** (52
  compiles + the win bonus + a fast clock is the S-tier run), but a partial solve
  still banks every decrypt/compile it earned — no zero runs.
* Moving a chip **back off** a foundation refunds its compile points, so you
  can't pump score by shuffling a chip on and off root.
* A subtle **"% drive recovered"** flavor readout tracks chips compiled / 52, for
  the netrunner skin and the Share Card hero stat (cf. Defrag's "% drive
  recovered", Jack-In's peak bank).

### 3.1 Grade

Rides the standard `arcadeGrade(comp)` ladder used by every cabinet
(`S ≥ 0.92, A ≥ 0.8, B ≥ 0.65, C ≥ 0.45, else F` — `PlayTools.html`), with `comp`
keyed to score against a tuned par (Draw-1 Sprint baseline):

```
comp = clamp01( score / 900 )
```

So ~0 → F, a partial solve (~half the chips home) → C, a clean but slow/loose
solve → A, and a **fast, efficient STACK CLEAN → S (900+)**. Tuned so that
**finishing the deal is roughly an A** and only **speed + efficiency** pushes
into S — matching the line's "beat par for an A, smash it for an S" feel. Draw-3
and Zen scale par via the same constant so the grade reads honestly across the
toggles (Zen drops the Sprint speed bonus, so its par is lowered to match).

---

## 4. PlayTools Integration

Cold Stack is a standard Retro Arcade cabinet and reuses the existing plumbing in
`PlayTools.html` — **no new architecture** (cf. Jack-In §4, Defrag §4).

### 4.1 Tool registry + route

One entry in the `CABINETS` array (alongside the other `lab:'Arcade'` tools) and
one router line:

```js
{ id:'arcade_coldstack', lab:'Arcade', name:'Cold Stack', railName:'Cold Stack',
  icon:'🃏', tag:'mvp', route:'#/arcade/coldstack',
  desc:'Sort a corrupted cold stack of data-chips into four clean root
        partitions — faithful Klondike under a neon skin. Decrypt, sequence,
        and COMPILE the whole stack before the clock flatlines.',
  dna:'Strategy +12 · Speed +8' }

Router.add('#/arcade/coldstack', Views.coldStack);
```

* **DNA vector:** **Strategy + Speed** — forward-planning the sequence of
  decrypts and moves (Strategy) raced against the Sprint clock (Speed).
  Deliberately **not** Strategy + Focus: Jack-In already owns that pairing, so
  Cold Stack borrows Sprint's speed axis to diversify the DNA spread (cf. Defrag
  choosing Focus + Speed to dodge the Strategy cluster). *(If we'd rather frame
  Klondike as pure patience, Strategy + Focus is the honest alternative — flagged
  in §8.)*
* **View:** `Views.coldStack = function(container){ … return teardown; }`,
  mounting the CRT-wrapped board (`crtWrapTV()`), the HUD (Time / Score /
  Recovered% / Best), and the Draw + Mode toggles — matching the DOM structure of
  `Views.sudoku` / `Views.jackIn`.

### 4.2 Metagame recorder (honest Gamer Score contract)

Add `recordColdStackRun(score, ctx)` following the exact pattern used by
`recordSnakeRun` / `recordSudokuRun` / `recordJackInRun` / `recordDefragRun`:

* `toolsCompleted++` credited **only on the first-ever run** (replayable game → no
  Gamer-Score grind-farming).
* `d.bests.arcade_coldstack` updates on a new max score.
* `d.arcadePoints += Math.round(score/40)` — a **modest** metagame contribution in
  line with the other arcade recorders.
* Counters for the cabinet achievements: `coldstackRuns`, `coldstackWins`,
  `coldstackBestTime` (fastest clean, low-water mark), `coldstackDraw3Wins`,
  plus a `coldstackRecovered` lifetime total of chips compiled.
* Feeds the existing **Arcade Champion** achievement (10,000 Gamer Score) and the
  Universal Share Card via `ShareCard.open({ lab:'RETRO ARCADE', tool:'Cold
  Stack', glyph:'🃏', … })` on run end.

### 4.3 Cabinet achievements

| id | Name | Icon | Condition |
| --- | --- | --- | --- |
| `coldstack_ace` | Cold Stack Ace | 🃏 | Earn an A grade or better in Cold Stack. |
| `coldstack_clean` | Stack Clean | ✅ | Win a deal (compile all 52 chips home). |
| `coldstack_speedrun` | Speed Runner | ⚡ | Clear a deal in **under 2 minutes** (Sprint). |
| `coldstack_hardcore` | Deep Sort | 🧊 | Win a **Draw-3** deal. |
| `coldstack_surgeon` | Drive Surgeon | 🩺 | Compile **520** chips to root (lifetime). |

(Wired into the existing achievements array exactly like `sudoku_ace` /
`b0ggle_overclock` / `jackin_ace` / `defrag_ace`, with counter fallbacks so they
persist across sessions.)

---

## 5. Art & Audio Direction

* **Rendering:** procedurally styled DOM cards (no image files — DD §1.3
  Sub-Second Asset Delivery), reusing **Jack-In's `.ji-card` chip** language for
  visual consistency between the two card cabinets. Each chip is a rank pip +
  suit glyph; hearts/diamonds render in neon-danger red, spades/clubs in ink —
  and colour is never the only signal (suit glyph + red/black + position), so the
  board stays readable under the global **Reduce-CRT** / colourblind-safe
  preference.
* **Encrypted chips:** face-down tableau/stock chips show a **scrambled glyph
  back** (reusing Jack-In's encrypted hole-card look); they **decrypt** (flip)
  when exposed.
* **Root partitions:** the four foundations are labelled `root/♠ ♥ ♦ ♣` slots
  that **fill with a rising neon column** as they compile Ace→King — a literal
  progress bar per suit.
* **STACK CLEAN tell:** a full solve triggers a **cascade flourish** (the chips
  fountain home, à la the classic Windows bouncing cards) and stamps **STACK
  CLEAN** in the shared neon palette — the cabinet's victory moment.
* **Palette:** dark CRT board with neon-rim framing and gold accents (`--neon-3`),
  mounted in the shared `crtWrapTV()` scanline frame — consistent with the line.
* **Audio:** optional deferred WebAudio blips through the shared `makeBlip()` /
  `soundToggle()` helpers (deal, decrypt flip, compile chime, invalid-move buzz,
  STACK CLEAN fanfare, time-low pulse) — no audio files, consistent with the
  asset-weight principle.

---

## 6. Session Rules summary

| Action | Result |
| --- | --- |
| Move chip / run onto next-rank-down opposite-colour | Legal tableau build |
| Send next-rank chip to its root | Compiled, score up, "% recovered" up |
| Expose a face-down chip | Decrypt (flip), score up |
| Empty a column | Open slot, accepts any King, score up |
| Tap stock | Deal to waste (Draw-1 / Draw-3); empty stock → recycle waste |
| Undo | Rewind last move(s); free in Zen, clock keeps running in Sprint |
| COMPILE / double-tap | Auto-send when the board is trivially solvable |
| All 52 home | **STACK CLEAN** → win flourish → grade + Share Card |
| Sprint clock hits 0 / Zen bank-run | End run (partial solve still scores) → grade + Share |

* **Controls:** click/tap a chip then its destination, **or** drag a chip (or an
  ordered run) onto a target; **double-tap** auto-sends to root. Keyboard:
  **Space** deals from stock, **U** undo, **Enter/C** COMPILE — keeping the
  cabinet usable without a mouse.
* **Touch-playable** like every Arcade cabinet (drag-move and double-tap-to-root
  are the natural mobile gestures).

---

## 7. Out of Scope for v1 (candidate follow-ups)

* **Daily-seed deal** for fair, comparable scores (deferred at sign-off, §2.2).
* **Smart move hints / "no more moves" detector** (kept out to protect the score
  chase; auto-complete stays).
* **Vegas cumulative scoring** (the bankroll alternative to time+efficiency —
  considered and set aside so it doesn't overlap Jack-In's economy).
* **Other variants** — FreeCell (pure-skill), Spider (two-deck), TriPeaks — as
  sibling cabinets or a mode menu once Klondike ships.
* **Guaranteed-winnable shuffles** (solver-filtered deals) for a "no dead deal"
  promise.
* Online/shared leaderboards (PlayTools is zero-auth, client-only — DD §1.3);
  bests stay local and surface through the Share Card.

---

## 8. Sign-off — Decided

All four brainstorm questions were resolved at sign-off (2026-06-13):

1. **Variant — *Klondike* (locked).** The "recognizable classic" the line is
   built on; FreeCell/Spider/TriPeaks deferred to follow-up cabinets (§7).
2. **Scoring — *time + efficiency* (locked).** An honest score chase over win/lose
   Solitaire feeding the standard `arcadeGrade` ladder; partial solves still
   score (§3). Vegas cumulative explicitly set aside to avoid overlapping
   Jack-In (§7).
3. **Modes — *Draw-1/Draw-3 toggle + Sprint/Zen + unlimited undo & auto-complete,
   all at launch* (locked).** Default **Draw-1 Sprint**. Daily seed deferred
   (§2.2, §7).
4. **Name / skin — *Cold Stack* (locked).** Netrunner skin: tableau = data
   stacks, foundations = `root/` partitions, win = **STACK CLEAN**. *Stackrunner*
   kept as the alternate/subtitle.

### 8.1 Still to confirm at implementation

* **DNA vector** — *Strategy + Speed* proposed to diversify away from Jack-In's
  Strategy + Focus (§4.1); confirm, or switch to **Strategy + Focus** if we'd
  rather frame Klondike as pure patience.
* **Par constant** — `score / 900` is a first tuning pass (§3.1); confirm against
  a few real playtest solves and adjust so "finish ≈ A, fast clean = S" holds for
  both Draw-1 and Draw-3.
* **Recycle cap** — v1 ships **unlimited** stock passes (§2 step 6); confirm, or
  cap Draw-3 passes for a touch more difficulty.
