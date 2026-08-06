# B0ggle — Retro Arcade Cabinet Design Spec

**Version:** 1.0
**Author:** Playology Entertainment
**Status:** Implemented (v1) — shipped into the Retro Arcade in `PlayTools.html`; documented retroactively 2026-08-06 per `ROADMAP.md` backlog item A2 (undocumented-cabinet audit).
**Parent Doc:** `PlayTools_DD.md` (this cabinet extends §5.5 Retro Arcade Module)

> **Build note (as shipped).** B0ggle is a faithful Boggle/Wordshake word hunt on
> a 4×4 (Easy) or 5×5 (Medium/Hard) grid of authentic letter-frequency dice,
> traced by drag or tap-by-tap across 8-way-adjacent nodes and validated against
> a bundled ~36k-word lexicon. Three difficulty tiers each carry their own timer
> (120s/150s/90s) and score target; longer decrypted words pay more. Route
> `#/arcade/b0ggle`, tool id `arcade_b0ggle`, and the cabinet uses its own grade
> curve rather than the shared `arcadeGrade` ladder used by its siblings.

---

## 1. Concept

**B0ggle** is a *Boggle*-faithful word-hunt cabinet, reskinned around the
PlayTools netrunner motif shared with **Jack-In**, **Defrag**, and **Cold
Stack**. The letter grid is a scrambled data node-field; tracing a path across
adjacent nodes to spell a word is framed as **decrypting** it; a valid word is
"cracked" and paid out, an invalid attempt is **ACCESS DENIED**, and a
already-found word flashes **ALREADY CRACKED**. The player is jacking into a
grid of encrypted letter-nodes and racing the clock to pull as much value out
of it as possible before the trace times out.

The classic Boggle rule set is kept faithful — real letter-frequency dice
(including the combined "Qu" die face), 8-way adjacency, a 3-letter minimum,
and no reusing a node within a word — while the arcade-ification is the
**timed score chase** with a Security Tier difficulty selector, a live HUD, and
cabinet achievements.

The cabinet's own branding is a deliberate detail: the wordmark and badge don't
render a literal letter "O" — they use a **slashed zero ("0")**, the
programmer/terminal glyph, styled via a dedicated `.slz` CSS treatment. The
tool-registry name is authored as literal markup,
`<span class="b0-word">B<span class="slz">0</span>ggle</span>`, and the
cabinet's badge (`B0_ICON`) renders the same "B0" with the slashed zero on a
purple chip — a small but intentional bit of hacker-terminal flavor rather than
a typo.

---

## 2. Core Loop

1. **Pick a Security Tier.** Three difficulties (`B0_LEVELS`), each fixing the
   board size, the round clock, and the score needed for a full grade:

   | Tier | Board | Timer | `gradeMax` (score for comp=1) | DNA `reward` scalar |
   | --- | --- | --- | --- | --- |
   | **Easy** | 4×4 | 120s | 40 | 0.5 |
   | **Medium** | 5×5 | 150s | 90 | 0.75 |
   | **Hard** | 5×5 | 90s | 70 | 1.0 |

   The idle board is shown empty ("Pick a tier · Press JACK IN") — letters
   aren't rolled until the player presses **JACK IN**, so nothing is revealed
   early.

2. **Roll the grid.** On start, tiles are drawn from authentic Boggle dice
   sets: 16 classic dice (`B0_DICE_4`) for the 4×4 board, 25 Big-Boggle dice
   (`B0_DICE_5`) for the 5×5 boards. Each die's face is picked at random from
   its six letters. A rolled **`Q`** renders as the combined **"Qu"** tile
   (real-Boggle behavior), both for display (`face`) and for word matching
   (`val`).

3. **Trace a path.** Nodes are 8-way adjacent (`adjacent()` checks
   `|Δrow|<=1 && |Δcol|<=1`, excluding the same cell). Input works two ways:
   * **Drag** across nodes — each new adjacent node under the pointer extends
     the path (`extend()`); releasing after a drag auto-submits the word.
   * **Tap-by-tap** — tapping builds the path one node at a time; tapping the
     current head node again submits it (`⮕ DECRYPT`).
   * Tapping the second-to-last node in the path **backtracks** one step.
   * **⌫ PURGE** clears the in-progress path; **⟳ SCRAMBLE** reshuffles the
     same letters into new positions mid-round (a visual aid, not a re-roll).

4. **Validate on submit (`submitPath`).**
   * Words under 3 letters are rejected silently/with a `bad` flash (no
     penalty).
   * A word already found flashes **"ALREADY CRACKED"** (`dup` sound, no
     score).
   * A word not in the bundled lexicon flashes **"ACCESS DENIED"** (`bad`
     sound, no score).
   * Otherwise it's a valid new word: scored, added to the found set, and the
     path/found list re-render with a `+<points>` flash.

5. **Dictionary.** Validation is against `B0_DICT`, a `Set` lazily built on
   first play from `B0_WORDS` — a large (~36k word, per source comment)
   whitespace-delimited block of length 3–12 dictionary words packed inline in
   the file, cached for the session (`b0Dict()`).

6. **Timer.** A 1-second `setInterval` (`tick()`) counts `timeLeft` down from
   the tier's `time`; hitting zero calls `finish()` and ends the round. There
   is no separate "out of moves" end condition — the clock is the only fail
   state, matching the rest of the Arcade's timed cabinets.

---

## 3. Scoring & Grade

### 3.1 Word scoring — longer words crack a bigger payload

`b0WordScore(len)` pays by word length:

| Length | 3 | 4 | 5 | 6 | 7 | 8 | 9+ |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Points | 1 | 2 | 4 | 6 | 9 | 12 | `12 + (len-8)*4` |

(Words under 3 letters score 0 and are rejected at submit anyway.)

### 3.2 Grade — B0ggle's own curve, not the shared `arcadeGrade` ladder

Unlike its Arcade siblings (Defrag, Jack-In, Cold Stack, Overdrive, Mac Pan),
B0ggle does **not** use the shared `arcadeGrade(comp)` ladder
(`S≥0.92, A≥0.8, B≥0.65, C≥0.45`). It has its own, gentler function,
`b0Grade(comp)`:

```js
function b0Grade(comp){ return comp>=0.85?'S': comp>=0.58?'A': comp>=0.35?'B': comp>=0.16?'C':'F'; }
```

The source comment explains why:

> "B0ggle uses a gentler grade curve than the shared arcadeGrade: word-hunting
> yields lower raw scores than the action cabinets, so a modest haul should
> still clear a C. S stays reserved for a strong, near-target round."

`comp` itself is `clamp01(score / lv.gradeMax)` — i.e. score measured against
the **per-tier** `gradeMax` from §2 (40 / 90 / 70), so the grade reads honestly
across Easy/Medium/Hard even though the tiers have very different timers and
board sizes.

On finish, the resulting grade also scales the Gamer DNA delta:
`Attr.applyVector({strategy:14, focus:6}, comp*lv.reward)` — the per-tier
`reward` scalar (0.5/0.75/1.0) means Hard-tier play contributes proportionally
more DNA per unit of `comp` than Easy.

---

## 4. PlayTools Integration

### 4.1 Tool registry + route

```js
{ id:'arcade_b0ggle', lab:'Arcade', name:'<span class="b0-word">B<span class="slz">0</span>ggle</span>', railName:'B0ggle', icon:B0_ICON, tag:'mvp', route:'#/arcade/b0ggle',
  desc:'Trace adjacent letter-nodes to DECRYPT words against the clock — longer words crack a bigger payload. Cyberpunk word-hunt with a retro-CRT skin.',
  dna:'Strategy +14 · Focus +6' }

Router.add('#/arcade/b0ggle', Views.b0ggle);
```

* **DNA vector:** **Strategy +14 · Focus +6** — scanning an 8-way grid for legal
  paths and prioritizing high-value (longer) words is a Strategy task, with
  Focus reflecting the sustained attention needed to keep tracing efficiently
  as the clock runs down.

### 4.2 Metagame recorder

`recordB0ggleRun(score, ctx)`, preceded by the "honest-Gamer-Score contract"
comment ("record a B0ggle round — same honest-Gamer-Score contract as the
other arcade cabinets: toolsCompleted credited once, best score + per-difficulty
best + modest arcadePoints + counters every round"):

* `d.runs++` every round.
* `toolsCompleted++` credited **only on the first-ever run** — `d.bests.arcade_b0ggle`
  is created with `{value:score, mode:'max'}` the first time, then only bumped
  on a new max thereafter (no Gamer-Score grind-farming on replays).
* `d.bests.arcade_b0ggle.diff[diff]` tracks a **per-difficulty** best score
  (`ctx.diff`, defaulting to `'easy'` if absent).
* `d.arcadePoints += Math.round(score/4)` — notably a **more generous** divisor
  than the `/40` used by Defrag, Mac Pan, Overdrive, Jack-In, and Cold Stack,
  consistent with B0ggle's own raw scores running much lower (single/low-double
  digits per word) than the action cabinets' scores.
* Counters: `d.counters.b0ggleRuns` increments every round; `d.counters.b0ggleLong`
  increments when `ctx.longest>=7` (a 7+ letter word was cracked that round) —
  this is the persisted fallback that backs the `b0ggle_breach` achievement.
* The call site passes `ctx = {diff:lv.key, words:foundOrder.length, longest}`
  (current tier key, words found this round, longest word length this round).

This cabinet's A/S grade clears pay out through the universal NetCoin
arcade-grade gate documented in `DD/Rig_DD.md` §86/§292 (A pays 50 NetCoin, S
pays 100, capped to once per cabinet per local day) — no B0ggle-specific
payout logic exists; it rides the same gate as every other Arcade cabinet.

The round also opens the Universal Share Card on finish:

```js
shareRow({
  lab:'RETRO ARCADE', tool:'B0ggle', glyph:'🔠', grade:g,
  metric:[{k:'Tier', v:lv.name}, {k:'Score', v:String(score)}, {k:'Words', v:String(foundOrder.length)}],
  designation: g==='S'?'Cipher Ghost': g==='A'?'Codebreaker': g==='B'?'Net Runner': g==='C'?'Script Kiddie':'Lurker',
  badge: longest>=7 ? 'Deep Breach' : null
});
```

The grade-to-designation ladder (Cipher Ghost / Codebreaker / Net Runner /
Script Kiddie / Lurker) and the "Deep Breach" badge for a 7+ letter word are
both cosmetic Share Card flavor layered on top of the same `g`/`longest` values
used by the achievements below.

### 4.3 Cabinet achievements

| id | Name | Icon | Condition |
| --- | --- | --- | --- |
| `b0ggle_ace` | B0ggle Ace | 🔠 | Earn an A grade or better in B0ggle. (`test:(d,c)=> c && c.tool==='b0ggle' && (c.grade==='A'||c.grade==='S')`) |
| `b0ggle_breach` | Deep Breach | 🛰️ | Decrypt a word of 7+ letters in B0ggle. (`test:(d,c)=> (c && c.tool==='b0ggle' && c.longest>=7) \|\| !!(d.counters && d.counters.b0ggleLong>=1)`) |
| `b0ggle_overclock` | Overclocked | ⚡ | Score 100+ in a single B0ggle round. (`test:(d,c)=> c && c.tool==='b0ggle' && c.score>=100`) |

Note that `b0ggle_breach` (like `sudoku_purist`) has a persisted-counter
fallback (`d.counters.b0ggleLong>=1`) in addition to the live-context check, so
it still unlocks retroactively if the counter was already incremented in an
earlier round.

---

## 5. Art & Audio Direction

* **Rendering:** the grid is DOM cells (`.bg-cell`) inside a `.bg-board`,
  mounted in the shared `crtWrapTV()` scanline frame like the other Arcade
  cabinets — no image assets.
* **Badge:** `B0_ICON` is a small `<span class="b0-ico">` chip — **white "B0" on
  a purple chip** (`background:var(--neon-4)`), using the pixel font, so it
  reads distinctly from Sudoku's number glyph at a glance. Per its own source
  comment: "B0ggle's cabinet badge: white 'B0' on a purple chip... Sized to
  ~1em like the SVG icons above."
* **Slashed zero:** the `.slz` CSS class draws a diagonal stroke across the "0"
  (`transform: rotate(-28deg)` bar via `::after`) so it reads as the
  programmer/terminal slashed-zero glyph. It's reused in both the wordmark
  (`name` in the tool registry) and the badge (`B0_ICON`).
  cf. the CSS comment: "slashed zero — draw a diagonal stroke across a '0' so
  it reads as the programmer/terminal slashed-zero glyph (used in the B0ggle
  wordmark + icon)."
  Its color follows `currentColor`, so it inherits whatever ink color the
  surrounding text uses.
* **In-round feedback:** the "current word" readout (`.bg-current`) flashes
  state classes (`ok` / `bad` / `dup`) with matching WebAudio blips
  (`sndTick`, `sndOk`, `sndDup`, `sndBad`, `sndEnd`) via the shared
  `makeBlip()` / `soundToggle()` helpers — an ascending three-note chime on a
  cracked word, a low sawtooth buzz on a denied one, a descending four-note
  phrase on round end. No audio files.
* **Selected-path highlighting:** cells in the current trace get a `sel` class,
  with the current head node additionally marked `head` — the visible "your
  finger/cursor is here" trail across the grid.

---

## 6. Session Rules summary

| Action | Result |
| --- | --- |
| Drag/tap a valid adjacent path, submit | Word validated; if new & 3+ letters & in dictionary → scored, added to Decrypted list |
| Submit a word already found | "ALREADY CRACKED" flash, no score |
| Submit a word not in the dictionary | "ACCESS DENIED" flash, no score |
| Submit under 3 letters | Silent/`bad` flash, no score |
| Tap the head node again | Submits the current path (same as DECRYPT button) |
| Tap the second-to-last node | Backtracks one step off the path |
| PURGE | Clears the in-progress path |
| SCRAMBLE | Reshuffles the same letters into new grid positions mid-round |
| Timer hits 0 | Round ends → grade (`b0Grade`) + DNA vector + recorder + achievements + Share Card |

* **Controls:** pointer drag or tap-by-tap tracing (see §2 step 3); no
  documented keyboard-only path was found in the read code (unlike Jack-In's
  H/S/D shortcuts) — input is pointer-event driven (`pointerdown` on cells,
  window-level `pointermove`/`pointerup`).
* **Touch-playable** like every Arcade cabinet — drag-tracing is the natural
  mobile gesture.

---

## 7. Notes from retroactive documentation

* The bundled `B0_WORDS` lexicon is described in its own source comment as a
  "~36k frequency-ranked, dictionary-valid words, length 3–12" list, but its
  actual visible content is a mix of common conversational/dialogue words
  (skewing toward everyday spoken vocabulary) followed by a long tail of much
  rarer/obscure words — its exact provenance (e.g. whether it was derived from
  a subtitle/dialogue corpus) isn't stated in the file and wasn't further
  determined here.
* No explicit keyboard-shortcut path (equivalent to Jack-In's H/S/D or Cold
  Stack's Space/U/Enter) was found for B0ggle in the read code — tracing
  appears to be pointer/touch-only in the shipped v1.
