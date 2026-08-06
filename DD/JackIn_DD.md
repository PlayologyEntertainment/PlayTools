# Jack-In — Retro Arcade Cabinet Design Spec

**Version:** 1.0
**Author:** Playology Entertainment
**Status:** Implemented (v1) — shipped into the Retro Arcade in `PlayTools.html`
**Parent Doc:** `PlayTools_DD.md` (this cabinet extends §5.5 Retro Arcade Module)

> **Build note (v1 as shipped).** Implemented per this spec with the signed-off
> decisions: single-player vs. **The House** AI dealer; neon-cyberpunk "netrunner
> heist" reskin with the name **Jack-In**; bankroll economy (start 1000 credits,
> bet per hand, play to bust-out or cash-out); **Hit / Stand / Double Down** only
> — **Split is deferred** to a follow-up (§8). Cabinet route `#/arcade/jackin`,
> tool id `arcade_jackin`. Going over 21 ships as an **OVERLOAD** glitch tell
> rather than the word "bust."

---

## 1. Concept

**Jack-In** is a *Blackjack (21)*-faithful card cabinet, reskinned around a
PlayTools netrunner heist. The player "jacks in" to a casino mainframe — **The
House** — and plays straight Blackjack against it for **credits**. Cards are
glowing CRT data-chips; the dealer's hole card is an **encrypted** packet until
the hand resolves; busting past 21 is an **OVERLOAD** (the screen glitches red).

The design philosophy matches the rest of the Arcade — **"a recognizable classic
under a neon skin"** (cf. Mac Pan = Pac-Man, B0ggle = Boggle). The 21 rules are
kept faithful so anyone who has played Blackjack is instantly at home; the
arcade-ification is the **bankroll score chase** layered on top, which turns a
single coin-flip hand into a session with a high-score, a letter grade, and
cabinet achievements.

### 1.1 The dealer — "The House"

* The opponent is a mainframe AI, not a person. It plays the book dealer rules
  (no decisions to make), so there is no AI difficulty to tune — the tension
  comes entirely from the player's bet sizing and hit/stand calls.
* The dealer's second card is dealt face-down as an **encrypted** data-chip
  (a glyph-scrambled back). It **decrypts** (flips) when the player stands,
  doubles, or busts — the classic hole-card reveal.

---

## 2. Core Loop — faithful Blackjack

A session is a run of hands played from a shared bankroll:

1. **Bet.** With credits in the bank, the player picks a stake from chip buttons
   (**25 / 50 / 100 / 250** + **MAX**), then **DEAL**.
2. **Deal.** Player gets two face-up chips, The House gets one up + one encrypted.
3. **Naturals.** A two-card 21 is a **JACKPOT** (natural blackjack). Player
   blackjack pays **3:2**; a tie with a dealer natural **pushes** (bet returned).
4. **Player turn.** Actions:
   * **Hit** — draw another chip. Going over 21 = **OVERLOAD** → the hand is lost.
   * **Stand** — lock the total, hand passes to The House.
   * **Double Down** — *first two cards only, if the bank can cover it*: double the
     stake, draw **exactly one** chip, then auto-stand.
   * **Split is out of scope for v1** (§8).
5. **House turn.** The encrypted card decrypts. The House **hits on 16 or less,
   stands on 17 or more** (stands on all 17s, including soft 17 — simplest faithful
   rule). If The House overloads, the player wins.
6. **Settle.** Higher total ≤ 21 wins. Win pays **1:1** (blackjack 3:2); push
   returns the stake; loss forfeits the stake. Credits update, streak updates.
7. **Repeat** until the player **Cashes Out** (banks the run) or **busts out**
   (bank drops below the 25-credit minimum bet) → game over + grade.

### 2.1 Hand value

Standard: number cards = face value, J/Q/K = 10, Ace = 1 **or** 11. Aces count
as 11 and are demoted to 1 as needed to avoid an overload; a hand still holding
an 11-Ace is **soft**.

---

## 3. The Economy (arcade score chase)

| Parameter | Value |
| --- | --- |
| Starting bank | **1000 credits** |
| Minimum bet | **25 credits** |
| Chip denominations | 25 / 50 / 100 / 250 / **MAX** |
| Blackjack payout | **3 : 2** |
| Bust-out (game over) | bank `< 25` (can't cover the minimum bet) |

* **Score** for the high-score / grade is the **peak bank** reached during the
  session — so a strong run that later gives some back still records its best
  moment, and cashing out at a high tells the same story.
* Because the bank both rises and falls, the player decides when to walk: press
  your luck for a higher peak, or **Cash Out** to lock the run.

### 3.1 Grade

The letter grade rides the standard `arcadeGrade(comp)` ladder, with `comp`
keyed to how much the player grew the starting stake:

```
comp = clamp01( (peakBank − 1000) / 2000 )
```

So peak 1000 → F (broke even), ~1900 → C, ~2600 → A, **3000+ → S**. Tuned so
roughly doubling the bank is an A and tripling it is an S, in line with the other
cabinets' "beat par for an A, smash it for an S" feel.

---

## 4. PlayTools Integration

Jack-In is a standard Retro Arcade cabinet and reuses the existing plumbing in
`PlayTools.html` — no new architecture.

### 4.1 Tool registry + route

One entry in the tool registry array (alongside the other `lab:'Arcade'` tools)
and one router line:

```js
{ id:'arcade_jackin', lab:'Arcade', name:'Jack-In', railName:'Jack-In',
  icon:'🃏', tag:'mvp', route:'#/arcade/jackin',
  desc:'Jack into the casino mainframe and beat The House at 21 — bet your
        credits, hit or stand, and cash out before you OVERLOAD.',
  dna:'Strategy +12 · Focus +8' }

Router.add('#/arcade/jackin', Views.jackIn);
```

* **DNA vector:** **Strategy + Focus** — bet sizing and hit/stand expected-value
  calls (Strategy) under the pressure of a depleting bank (Focus).
* **View:** `Views.jackIn = function(container){ … return teardown; }`, mounting
  the CRT-wrapped felt table (dealer row + player row), the HUD (Credits / Bet /
  Streak / Best), bet chips, and the action row — matching the DOM structure of
  `Views.sudoku`.

### 4.2 Metagame recorder (honest Gamer Score contract)

Add `recordJackInRun(score, ctx)` following the exact pattern used by
`recordSnakeRun` / `recordSudokuRun`:

* `toolsCompleted++` credited **only on the first-ever run** (replayable game →
  no Gamer-Score grind-farming).
* `d.bests.arcade_jackin` updates on a new max (peak bank).
* `d.arcadePoints += Math.round(score/40)` — a **modest** metagame contribution
  in line with the other arcade recorders.
* Counters for the cabinet achievements: `jackinRuns`, `jackinBlackjacks`,
  `jackinMaxWins`, `jackinCooler`, plus a `jackinBestStreak` high-water mark.
* Feeds the existing **Arcade Champion** achievement (10,000 arcade points) and the
  Universal Share Card via `ShareCard.open({ lab:'RETRO ARCADE', tool:'Jack-In',
  glyph:'🃏', … })` on game over.

### 4.3 Cabinet achievements

| id | Name | Icon | Condition |
| --- | --- | --- | --- |
| `jackin_ace` | Jack-In Ace | 🃏 | Earn an A grade or better in Jack-In. |
| `jackin_jackpot` | Jackpot | 🂡 | Land a natural blackjack (two-card 21). |
| `jackin_clean_run` | Clean Run | 🔗 | Win 5 hands in a row in one session. |
| `jackin_high_roller` | High Roller | 💰 | Win a hand staked at the table maximum. |
| `jackin_cooler` | The Cooler | 🧊 | Claw back from under 100 credits to over 1000. |

(Wired into the existing achievements array exactly like `sudoku_ace` /
`b0ggle_overclock`, with counter fallbacks so they persist across sessions.)

---

## 5. Art & Audio Direction

* **Rendering:** procedurally styled DOM cards (no image files — DD §1.3
  Sub-Second Asset Delivery). Each card is a `.ji-card` chip with a rank pip and
  suit glyph; hearts/diamonds render in the neon-danger red, spades/clubs in ink.
* **Encrypted card:** the dealer hole card shows a scrambled glyph back until it
  **decrypts** (flip) on reveal.
* **OVERLOAD tell:** when a hand goes over 21 the table flashes the neon-danger
  red and stamps **OVERLOAD** — the cyberpunk read on "bust."
* **Palette:** dark CRT felt with a neon-rim table, gold chip accents
  (`--neon-3`), matching the existing cabinets; the whole table is mounted in the
  shared `crtWrapTV()` scanline frame.
* **Audio:** optional, deferred-style WebAudio blips through the shared
  `makeBlip()` / `soundToggle()` helpers (deal, hit, win chime, OVERLOAD buzz) —
  no audio files, consistent with the asset-weight principle.

---

## 6. Session Rules summary

| Action | Result |
| --- | --- |
| Win (normal) | +stake (1:1) |
| Win (natural blackjack) | +stake × 1.5 (3:2) |
| Push (tie) | stake returned |
| Loss / OVERLOAD | −stake |
| Cash Out | end run, bank the peak, grade + share |
| Bust out (bank < 25) | end run, grade + share |

* **Controls:** click/tap the chip + action buttons. Keyboard shortcuts:
  **H** = Hit, **S** = Stand, **D** = Double, **Space/Enter** = Deal / Next Hand.
* **Touch-playable** like every Arcade cabinet (PlayTools is PC-focused per DD
  §3.1.2.1, but cabinets stay tap-friendly).

---

## 7. Out of Scope for v1 (candidate follow-ups)

* **Split pairs** (and re-splits) — the one Blackjack action deferred from v1.
* **Insurance / surrender** side bets.
* Multi-hand play, shoe/deck-count selection, or a visible card counter.
* Online/shared leaderboards (PlayTools is zero-auth, client-only — DD §1.3);
  bests stay local and surface through the Share Card.

---

## 8. Open Questions for Sign-off

1. **Name** — *Jack-In* (locked at brainstorm). Keep, or revisit the leetspeak
   alternative *Bl4ckjack*?
2. **Soft-17 rule** — v1 ships **dealer stands on all 17s** (incl. soft 17) for
   simplicity. Switch to "hits soft 17" for a touch more house edge?
3. **Split** — confirmed deferred for v1 (§7); good as the first follow-up?

### 8.1 Decided

* **Players — single-player vs. The House (locked).** No CPU rival beyond the
  book-rules dealer.
* **Theme — neon-cyberpunk heist + pun name (locked).** Ships as *Jack-In*.
* **Economy — bankroll + bet per hand (locked).** Start 1000, bet to bust-out
  or cash-out; score = peak bank (§3).
* **Split — deferred (locked).** Hit / Stand / Double only for v1 (§7).
