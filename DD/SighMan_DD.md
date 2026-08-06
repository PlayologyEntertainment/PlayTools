# SighMan — Retro Arcade Cabinet Design Spec

**Version:** 1.0
**Author:** Playology Entertainment
**Status:** Implemented (v1) — shipped into the Retro Arcade in `PlayTools.html`; documented retroactively 2026-08-06 per `ROADMAP.md` backlog item A2 (undocumented-cabinet audit).
**Parent Doc:** `PlayTools_DD.md` (this cabinet extends §5.5 Retro Arcade Module)

> **Build note (as shipped).** SighMan is a faithful Simon pad game: a 2×2
> quadrant canvas of four neon pads (teal / pink / yellow / purple), each with a
> black Roman numeral. The game flashes a growing sequence, the player taps it
> back in order, and a single wrong tap ends the run — score is the longest
> sequence fully recalled. Playback speeds up as the sequence grows. Cabinet
> route is `#/arcade/sequence`, tool id `arcade_seq`.

---

## 1. Concept

**SighMan** is a *Simon*-faithful pattern-memory cabinet, reskinned under
PlayTools' neon-CRT arcade look. Four glowing quadrant pads take turns lighting
up in a sequence; the player watches, then taps the sequence back from memory.
Each successful round tacks one more random step onto the sequence — the
classic "watch and repeat, one step further" escalation — until a single
mis-tap ends the run.

The fiction is minimal by design: unlike Mac Pan (Pac-Man under a kitchen
skin) or Overdrive (Pole Position under a sunset skin), SighMan doesn't layer
a theme on top of the mechanic — it *is* the mechanic, presented through
PlayTools' house neon/CRT treatment (glowing quadrant colors, a scanline
bezel, and a chiptune-style square-wave tone per pad).

**Disambiguation:** SighMan is a distinct cabinet from **Mnemonic**
(`arcade_memory`, DD §5.5, the flip-and-match memory grid). Both are
memory-genre cabinets and happen to share the identical DNA vector split
(Focus +14 · Consistency +6 — see §4.1), and both ROADMAP.md and
`PlayTools_DD.md` parenthetically gloss this cabinet as "Mnemonic / SighMan,"
but in the shipped code they are two entirely separate `Views.*` functions,
tool ids, and routes. This document covers **SighMan only** — the Simon-style
sequence-repeat pad game at lines ~11536–11669 of `PlayTools.html`.

---

## 2. Core Loop

* **Layout.** A single `<canvas>` (320×320) divided into four equal quadrants
  — top-left, top-right, bottom-left, bottom-right — each a pad in one of four
  fixed neon colors (`#16f2c8` teal, `#ff3df0` pink, `#ffd23d` yellow,
  `#7c5cff` purple). Each pad shows a centered black Roman numeral (laid out
  like Cartesian quadrants: top-right = **I**, top-left = **II**, bottom-left =
  **III**, bottom-right = **IV**), rendered in the app's embedded "Press Start
  2P" arcade face and auto-shrunk to fit the pad.
* **Sequence build.** Pressing **START** (or Space/Enter when idle) resets the
  run and appends one random pad (0–3) to an empty sequence, then plays it
  back.
* **Playback ("watch").** Each step in the sequence flashes its pad to full
  brightness (dim otherwise) and plays that pad's tone, one after another.
  Flash duration shrinks as the sequence grows — `Math.max(220, 480 -
  seq.length*14)` ms per step — so playback visibly speeds up round over
  round; the gap between flashes is a fixed 160ms.
* **Input ("input").** Once playback finishes, the player taps pads back in
  order (mouse/touch click on the canvas quadrant; there is no keyboard
  mapping for the pads themselves — keyboard input is Start/Restart only).
  Each correct tap flashes/tones that pad and advances the input pointer.
* **Round complete.** When the full sequence is matched, the score is set to
  the sequence length, the HUD updates, and after a 700ms pause one more
  random step is appended and the (now longer) full sequence replays from the
  start.
* **Fail condition.** A single incorrect tap during input immediately ends
  the run (`gameOver()`) — a descending three-note fail cascade plays
  (220 → 150 → 90Hz sawtooth), and the score is whatever the last **fully
  recalled** sequence length was. There is no timer and no lives; the only
  fail state is one wrong tap, exactly like the original Simon.

---

## 3. Scoring & Grade

* **Score** = the length of the longest sequence the player fully recalled
  before the miss (`score = seq.length` at the moment a round is completed).
* **Grade** is computed at game over via the shared `arcadeGrade(comp)` ladder
  (`function arcadeGrade(comp){ return comp>=0.92?'S':comp>=0.8?'A':comp>=0.65?'B':comp>=0.45?'C':'F'; }`),
  fed by:

  ```js
  const comp=clamp01(score/12), g=arcadeGrade(comp);
  ```

  Par is a sequence of **12** — the same length the `sequence_savant`
  achievement targets (§4.3). Because `comp` clamps at 1, any score of 12+
  reads as `comp=1.0`, which always clears the `S` threshold (`>=0.92`); by
  the integer math, `S` is first reached at score 12, `A` at score 10, `B` at
  score 8, `C` at score 6, and anything below that is `F`.

---

## 4. PlayTools Integration

### 4.1 Tool registry + route

```js
{ id:'arcade_seq', lab:'Arcade', name:'SighMan', railName:'SighMan', icon:SEQ_ICON, tag:'mvp', route:'#/arcade/sequence',
  desc:'Watch the pattern, repeat it back & push your memory one step further.', dna:'Focus +14 · Consistency +6' }

Router.add('#/arcade/sequence', Views.sequence);
```

* **DNA vector:** **Focus +14 · Consistency +6** — recalling a growing pattern
  under an accelerating playback speed is a sustained-attention (Focus) task,
  with Consistency rewarding steady, error-free recall rather than raw speed.
  This is the same split used by Mnemonic, the app's other memory-genre
  cabinet — both games train the same underlying skill, just via a different
  mechanic (flip-and-match vs. watch-and-repeat).

### 4.2 Metagame recorder

`recordSimonRun(score, ctx)` (line 16477) is called from `gameOver()`:

```js
function recordSimonRun(score, ctx){
  Store.update(d=>{
    d.runs++;
    if(!d.bests.arcade_seq){ d.toolsCompleted++; d.bests.arcade_seq={value:score, mode:'max'}; }
    else if(score>d.bests.arcade_seq.value){ d.bests.arcade_seq.value=score; }
    d.arcadePoints += Math.round(score*2);
    d.counters.simonRuns=(d.counters.simonRuns||0)+1;
  });
}
```

* `d.runs++` every game over.
* `toolsCompleted++` is credited **only on the very first-ever run**
  (`!d.bests.arcade_seq`) — the same honest, no-grind-farming contract every
  other replayable arcade cabinet uses.
* `d.bests.arcade_seq` tracks a simple max (`mode:'max'`) — there is no
  difficulty selector on this cabinet, so unlike Mac Pan/Overdrive/Sudoku
  there is no per-`diff` best map.
* `d.arcadePoints += Math.round(score*2)` — note this is a **multiply**-based
  contribution, whereas sibling arcade recorders (Mac Pan, Packer, Defrag)
  divide the raw score by ~30–40. That's consistent with SighMan's score
  being a small integer (a sequence length, typically single/low-double
  digits) rather than a four-or-five-digit arcade score — the shipped formula
  is scaled accordingly.
* `d.counters.simonRuns` increments every run.
* **Naming quirk (as shipped, not a bug):** the recorder function is named
  `recordSimonRun`, a holdover from the genre's classic name ("Simon"), even
  though the cabinet ships under the brand name **SighMan**. Worth knowing
  when grepping the code — `Simon` in identifiers refers to this cabinet, not
  a separate game.
* **NetCoin payout:** SighMan's A/S grade clears pay out through the
  universal Arcade grade-payout gate documented in `DD/Rig_DD.md` (the
  "Arcade grade clears" row and its checklist confirmation) — A pays 50
  NetCoin, S pays 100, below A pays nothing, capped at once per cabinet per
  local day. No cabinet-specific payout logic exists in SighMan itself.
* **Share Card:** `gameOver()` appends a `shareRow({...})` call with
  `lab:'RETRO ARCADE', tool:'SighMan', glyph:'🟦', glyphQuads:SEQ_PADS, grade:g`.
  `SEQ_PADS` (`['#16f2c8','#ff3df0','#ffd23d','#7c5cff']`) feeds the share
  card's own quadrant-swatch rendering so the shared result card visually
  echoes the four in-game pad colors. The metric row shows the recalled step
  count; the `designation` string reads Total Recall (S) / Pattern Ace (A) /
  Sharp Memory (B) / Short-Term (else); a `SighMan Savant` badge is attached
  when `score>=12`, matching the achievement of the same name (§4.3).

### 4.3 Cabinet achievements

| id | Name | Icon | Condition |
| --- | --- | --- | --- |
| `sequence_savant` | SighMan Savant | `SEQ_ICON` (neon quadrant glyph) | "Recall a sequence of length 12 in SighMan." — `test:(d,c)=> c && c.tool==='sequence' && c.length>=12` |
| `sequence_ace` | SighMan Ace | `SEQ_ICON` (neon quadrant glyph) | "Earn an A grade or better in SighMan." — `test:(d,c)=> c && c.tool==='sequence' && (c.grade==='A'||c.grade==='S')` |

Both are evaluated from the `Ach.evaluate({tool:'sequence', grade:g, length:score})`
call at the end of `gameOver()` — note the context object passes `length`
(not `score`) for the length check, which is what `sequence_savant`'s `test`
reads.

---

## 5. Art & Audio Direction

* **Pad identity:** per the branding comment block (~line 2707), SighMan's
  visual identity is "four neon quadrant pads matching the in-game colours
  (teal/pink/yellow/purple), connected with a thin dark gap." `SEQ_ICON` is an
  inline SVG (four colored `<rect>`s in a 2×2 grid) so the same glyph renders
  correctly anywhere an icon string lands — cabinet tile, rail, page title,
  achievement row, or toast — without relying on font glyph coverage. The
  `.seq-quads` CSS class (~line 435) scales the icon to `1em`, matching the
  surrounding text size wherever it's dropped in.
* **In-game palette:** active pads render at full saturation (`PAD_COL`);
  idle pads render dimmed (`PAD_DIM`) — the classic Simon "lit vs. unlit"
  read. Each pad's black Roman numeral is centered and auto-shrunk to fit,
  so `III`/`IV` never crowd the pad.
* **Frame:** the stage is wrapped in the shared `crtWrapTV()` scanline bezel
  with the Arcade lab's accent color and `jitter:false` (no shake — this is a
  precision-recall game, not an action cabinet).
* **Audio:** genuinely tone-driven, per the Simon tradition — each of the
  four pads has its own fixed pitch (`TONES = [330, 415, 494, 622]` Hz),
  played as a short square wave (`blip(TONES[i], 0.22, 'square', 0.1)`) both
  during playback and on the player's own taps, so correct/incorrect input
  is audibly distinguishable pad-by-pad. Game over plays a descending
  three-note sawtooth cascade (220 → 150 → 90Hz) as a fail cue. Sound is
  mutable via the shared `soundToggle('seqMute')` control, and `blip.prime()`
  is called on the Start press and on direct pad taps to keep the WebAudio
  context warmed/live on user gesture.

---

## 6. Session Rules summary

| Action | Result |
| --- | --- |
| Start / Restart (button, or Space/Enter while idle) | Resets sequence & score, appends one random step, begins playback |
| Correct tap during input | Advances input pointer; on full-sequence match, score = sequence length, then a new step is appended and the longer sequence replays after a 700ms pause |
| Incorrect tap during input | Immediate Game Over — fail tone cascade plays, run ends, score locked at the last fully-recalled length |
| Sequence length increases | Playback speeds up per step (`max(220ms, 480 - 14×length)` flash duration; fixed 160ms gap between steps) |
| Game Over | Grade computed via `arcadeGrade(clamp01(score/12))`; `Attr.applyVector` and `recordSimonRun` fire; achievements evaluated; Share Card appended |

---

## 7. Notes from retroactive documentation

* No difficulty selector exists for this cabinet, unlike several Arcade
  siblings (Mac Pan, Overdrive, Sudoku) — best score is a flat max with no
  per-difficulty map.
* The `recordSimonRun` / "Simon" naming (§4.2) and the ROADMAP/PlayTools_DD
  "Mnemonic / SighMan" parenthetical (§1) both reflect the game's classic
  lineage and pre-rename history in the codebase and docs; neither is treated
  as an error here, just flagged for anyone cross-referencing identifiers.
