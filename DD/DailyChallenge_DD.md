# Daily Challenge — Retro Arcade Cabinet Design Spec

**Version:** 1.0
**Author:** Playology Entertainment
**Status:** Implemented (v1) — shipped into `PlayTools.html` 2026-08-07 per `ROADMAP.md` backlog item **C1**.
**Parent Doc:** `PlayTools_DD.md` (this cabinet extends §5.5 Retro Arcade Module and resolves `ROADMAP.md` §3 decision 1, the "online leaderboards" question)

> **Build note (as shipped).** Daily Challenge is not a new minigame — it's a
> shared, hashed-local-day seed that rotates one of the 14 existing Retro
> Arcade cabinets each day and forces that cabinet's board/deck/run to be
> byte-identical for every player who plays it that day (Wordle-style). Route
> `#/daily`, tool/cab id `daily`, its own `lab:'Daily Challenge'` nav group
> (deliberately not `lab:'Arcade'`). No backend of any kind, ever — the day's
> pick and seed are pure functions of the player's local calendar date,
> computed independently on every device. Comparison between players is only
> ever via the Universal Share Card or an imported Friends P2P profile — never
> a live leaderboard.

---

## 1. Concept

`ROADMAP.md` §3 decision 1 records the resolution to a tension that ran
through every Arcade cabinet DD: each one deferred "online leaderboards" as
out of scope, because PlayTools' Core Principle (`PlayTools_DD.md` §1.3) is
zero-auth/browser-only/no-backend by default. A leaderboard needs a server to
be a leaderboard. The decision was to build something that delivers the same
social, competitive "same puzzle, everyone" feeling as Wordle without ever
introducing one: a **shared daily seed**.

Framed in-app as a rotating cabinet feature rather than a new cabinet in its
own right: each real-world calendar day, PlayTools picks one of the 14
existing Arcade cabinets and a deterministic seed, purely as a function of
that day's date string. Every player's device computes the identical (pick,
seed) pair independently — there is nothing to synchronize, nothing to poll,
nothing to fetch. Playing "today's" cabinet under that seed guarantees every
player who plays that day gets the literal same board: the same shuffled
deck, the same generated maze, the same letter grid, the same sequence of
spawns. What differs is only the player's own skill and choices — which is
exactly what a fair, server-free "leaderboard" needs to be comparable at all.

---

## 2. Core Loop

1. **Compute today's pick.** `DailyChallenge.cabinetFor(dayKey)` hashes the
   player's local `YYYY-M-D` string (FNV-1a, `hashSeed()`) and indexes into
   the 14-cabinet rotation pool. `DailyChallenge.seedFor(dayKey)` hashes a
   differently-salted version of the same day string into the integer seed
   fed to that cabinet's `mulberry32` stream. Both are pure functions — same
   day in, same (cabinet, seed) out, every time, on every device.
2. **Hub (`#/daily`).** Shows today's featured cabinet, current/best streak,
   a 14-day streak calendar, and — before playing — a single **Play Today's
   Challenge** button. The button routes into the underlying cabinet's own
   existing view with a `?daily=1` query flag, e.g. `#/arcade/coldstack?daily=1`.
3. **The round itself is the underlying cabinet, unmodified.** Daily Challenge
   has no gameplay UI of its own — the player plays Cold Stack, or Sudoku, or
   Ecto exactly as they otherwise would. The only difference is invisible:
   that cabinet's random-number source is swapped from `Math.random` to a
   `mulberry32(seed)` stream for the whole run, so every gameplay-relevant
   draw (deck shuffle, board fill, spawn timing, AI turn choice — see §4.4 for
   the full per-cabinet inventory) comes from the same deterministic sequence
   every player gets that day.
4. **One locked attempt per local day.** `DailyChallenge.available()` is
   `false` once `dailyChallenge.lastPlayedDay === today()`. Revisiting `#/daily`
   after playing shows the result summary and a "come back tomorrow" notice
   instead of a replay button — there is no practice-replay mode for v1.
5. **Missing a day breaks the streak.** `record()` sets
   `streak = (lastPlayedDay === yesterday()) ? streak+1 : 1` — the same
   strict-reset semantics as the Rig's own daily streak (`Rig.claimDaily`),
   not a grace/freeze mechanic.

---

## 3. Scoring & Grade

Daily Challenge does **not** invent a new scoring or grade curve. The round
is graded entirely by whichever cabinet is featured that day, using that
cabinet's own existing formula (`arcadeGrade`, or a cabinet-specific curve
like B0ggle's `b0Grade`) — there is nothing Daily-Challenge-specific to
recompute. The only new number is a bespoke NetCoin payout (§4.2) keyed off
that same grade.

---

## 4. PlayTools Integration

### 4.1 Tool registry + route

```js
{ id:'daily', lab:'Daily Challenge', name:'Daily Challenge', railName:'Daily', icon:'🗓️', tag:'mvp', route:'#/daily',
  desc:'One shared seed, one shot — every player gets the identical board on today\'s rotating cabinet. No server, no leaderboard.',
  dna:'Consistency +weighted' }

Router.add('#/daily', Views.dailyChallenge);
```

`lab:'Daily Challenge'` is a **new, dedicated nav-rail group** — deliberately
not `lab:'Arcade'`. `arcadeToolIds()` (`Rig_DD.md` §5.2/§86) filters strictly
on `c.lab==='Arcade'`, so keeping Daily Challenge out of that lab means the
existing per-cabinet-per-day `Rig.payArcadeGrade` gate is structurally
unreachable from a Daily Challenge run — no code change to that gate was
needed to keep it separate; the registry lab alone does it.

### 4.2 Seed derivation, rotation, and the bespoke NetCoin gate

New `DailyChallenge` module (parallel to `Rig`/`Pets`, not nested inside
either):

```js
const POOL = ['coldstack','jackin','ecto','crossload','defrag','macpan','snake',
  'bricks','whack','sequence','overdrive','packer','sudoku','b0ggle'];
function dayKey(ts){ const t=ts?new Date(ts):new Date(); return t.getFullYear()+'-'+(t.getMonth()+1)+'-'+t.getDate(); }
function cabinetFor(dk){ return POOL[hashSeed((dk||today())+'::pick') % POOL.length]; }
function seedFor(dk){ return hashSeed((dk||today())+'::seed'); }
```

`hashSeed` (FNV-1a) and `mulberry32` are new shared top-level utilities
(alongside `rnd`/`pick`) — `mulberry32` was already used twice in the
codebase for cosmetic-only purposes (RetroPets' per-pet palette, Overdrive's
cloud/city art) before this feature; this is its first use for actual
gameplay-state generation across the Arcade line (Overdrive's own course
generation was already fully mulberry32-seeded per tier — see §4.4).

`Store.dailyChallenge` (new top-level block, same "deep-merge on load" shape
as `rig`/`pets`):

```js
dailyChallenge: {
  lastPlayedDay: null,  // local day key of the last completed attempt — the once-per-day lock
  streak: 0,
  bestStreak: 0,
  history: []           // [{day, cabinet, grade, score}], most-recent last, capped ~30
}
```

`DailyChallenge.record(grade, score)` — called once per round from the
featured cabinet's own round-end code when `dailyMode` is true (§4.3) — is a
**bespoke gate**, independent of `Rig.payArcadeGrade`:

```js
const GRADE_COIN = { S:100, A:50, B:20, C:0, F:0 };
```

Same NetCoin magnitudes as the existing A/S arcade-grade gate (50/100,
`Rig_DD.md` §86), plus a smaller B-grade consolation (20) that the generic
gate doesn't have, since Daily Challenge only ever pays once per *day* rather
than once per *cabinet* per day — there's no way to farm it by replaying, so a
slightly softer floor is safe. `record()` is a hard no-op (`{paid:0}`) if
`available()` is already false that day.

### 4.3 Wiring into each cabinet's round-end (`dailyMode`)

Each of the 14 cabinets' `Views.<cabinet>` closures gained:

```js
const dailyMode = Router.query().get('daily')==='1';
let rng = dailyMode ? mulberry32(DailyChallenge.seedFor(DailyChallenge.today())) : Math.random;
```

(Overdrive is the one exception — its course generation was already fully
seeded per-tier via its own local `mulberry32`; the retrofit there is folding
the daily seed into that existing formula rather than introducing a new `rng`
reference — see §4.4.)

Every cabinet's single round-end call site gained a `dailyMode` branch that
reroutes the achievement/DNA/NetCoin identity to `'dailychallenge'` instead of
the cabinet's own tool id, and calls `DailyChallenge.record()`:

```js
if(dailyMode){ DailyChallenge.record(g, score); Ach.evaluate({ tool:'dailychallenge', dailyCabinet:'coldstack', grade:g, score, ... }); }
else Ach.evaluate({ tool:'coldstack', grade:g, score, ... });
```

This means a Daily Challenge run **never** touches the underlying cabinet's
own achievements or its per-cabinet-per-day arcade-grade NetCoin bonus — it
has its own tool identity (`'dailychallenge'`) end to end, consistent with
§4.1's registry-lab separation.

### 4.4 Per-cabinet determinism retrofit — what actually got seeded

All 14 cabinets route their gameplay-relevant randomness through the local
`rng` reference above (decorative/particle/audio randomness is deliberately
left on plain `Math.random()` — it doesn't affect the board/run and seeding
it would just be wasted determinism):

| Cabinet | What's seeded | Mid-round? |
| --- | --- | --- |
| Cold Stack | Deck shuffle at deal | No — deal only |
| Jack-In | Shoe shuffle, including any mid-session reshuffle when the shoe drops below 12 cards | Yes |
| Ecto | Which spirit dives, dive cadence, enemy bullet trajectory | Yes — continuous during `'fight'` |
| Crossload | Bounty socket + spawn cooldown | Yes — every frame via `updateBounty()` |
| Defrag | Initial color fill, `applyGravity()` refills after every clear/cascade, stuck-board reshuffle, Hypercore color pick | Yes, heavily |
| Mac Pan | Frightened-enemy turn choice at each intersection | Yes — per-tick during power-up windows |
| Anaconda | Food placement | Yes — every pellet eaten |
| Brick Breaker | Ball launch direction (round start + each life lost) | Low — ≤3×/round |
| Hopper Popper | Which hole pops next | Yes — every spawn gap, whole round |
| SighMan | Each new sequence step | Yes — once per successful round-advance |
| Overdrive | Already fully seeded per-tier (track/gates/hazards/traffic) via its own local `mulberry32`; the daily seed is XORed into that existing per-tier seed formula | No — course built once |
| Pack Hacker | Tray piece shape + color, re-rolled every time the 3-piece tray empties | Yes — every tray refill, whole run |
| Sudoku | Solved-grid backtracking fill + hole-digging order (a single-pass, bounded generator — confirmed safe to reseed, no infinite-loop risk) | No — round start / New Board only |
| B0ggle | Letter-dice order + face pick | No — round start only (the player-triggered SCRAMBLE button reorders already-rolled letters and is left on the same seeded stream too, since it has no gameplay-state effect) |

For the continuous/per-frame cabinets (Ecto, Mac Pan, Defrag's cascades),
draw order is driven by accumulated game-time (`dt`), not wall-clock frame
count, so different frame rates land on the same sequence of draws in the
same game-time order — the same guarantee Overdrive's existing per-tier
seeding already relied on before this feature existed.

### 4.5 Share Card

Rather than editing all 14 cabinets' individual `shareRow()` call sites, the
shared `shareRow()` helper itself became daily-aware — the round-end screen
is still on the `?daily=1` route, so it checks `Router.query().get('daily')`
at share-click time and overrides the card:

```js
if(Router.query().get('daily')==='1'){
  cd = Object.assign({}, cardData, {
    lab: 'DAILY CHALLENGE',
    metric: [{k:'Day', v: DailyChallenge.today()}, {k:'Streak', v: String(DailyChallenge.state().streak)}].concat(cardData.metric||[])
  });
}
```

The `Day` metric is what lets two players' independently-generated cards
visually confirm they played the same day's challenge.

### 4.6 DNA vector

`DailyChallenge` does not call `Attr.applyVector` itself — each cabinet's own
existing call (already scaled by that cabinet's own `comp`) fires exactly as
it would on a normal run, since the underlying scoring/grading path is
unchanged. The "Consistency +weighted" label in the registry entry (§4.1) is
descriptive framing for players, not a separate vector call — reusing each
cabinet's own attribute story rather than inventing a parallel one is a
smaller, more consistent change than parametrizing 14 different
`applyVector` call sites for a mode that already reduces to "play the
cabinet."

### 4.7 Friends P2P comparison (`ProfileIO`)

`ProfileIO.buildPayload()`/`payloadToFriend()` — previously a fixed field set
with no per-cabinet score capability at all — gained one field:

```js
dailyChallenge: { streak, bestStreak, last: history.slice(-7) }  // last 7 days only, keeps exports small
```

`Views.friends`' `friendCard()` shows a friend's Daily Challenge result for
**today only**, if their imported snapshot happens to include an entry for
the viewer's local `today()`. A stale snapshot from an earlier day shows
streak/best-streak only, with an honest "no snapshot of today's run yet"
note — this is a point-in-time file import, never a live feed, consistent
with the "no backend, ever" decision.

### 4.8 Achievements

| id | Name | Icon | Condition |
| --- | --- | --- | --- |
| `daily_first` | Show Up | 🗓️ | Complete your first Daily Challenge. |
| `daily_streak_3` | Creature of Habit | 🔥 | Reach a 3-day streak. |
| `daily_streak_7` | Week One | 📆 | Reach a 7-day streak. (750 NetCoin — same tier as `rig_streak_7`) |
| `daily_streak_30` | Every Single Day | 🏅 | Reach a 30-day streak. (2000 NetCoin — same tier as `rig_streak_30`) |
| `daily_rotation` | Cabinet Tourist | 🎡 | Play a Daily Challenge on every one of the 14 rotating cabinets at least once. |

`daily_rotation` has no guaranteed timeline — the rotation is a hash pick,
not a round-robin, so it's an intentionally long-tail achievement like
`arcade_champion`.

---

## 5. Art & Audio Direction

* **Hub (`#/daily`):** plain `toolShell` header + `stat-cards` (streak / best
  streak / today's cabinet), reusing the exact visual language of `Views.dna`
  — no bespoke chrome.
* **Streak calendar:** reuses the Rig's existing `.rig-daily-cal`/`.cal-grid`/
  `.cal-cell` CSS wholesale (`collected`/`today` cell states) rather than
  introducing a parallel calendar style — the 30-day cycle semantics don't
  apply here (there's no bonus-day coloring), so only the two states it needs
  are used.
* **In-round:** none — the round is the underlying cabinet's own existing
  art/audio, unmodified.
* **Friends card:** a small dashed-border chip (`.fc-daily`) below the
  existing stat-chip row, styled to sit quietly alongside them rather than
  compete for attention.

---

## 6. Session Rules summary

| Action | Result |
| --- | --- |
| Visit `#/daily`, `available()===true` | Shows today's cabinet + Play button |
| Press Play | Routes to `<cabinet route>?daily=1`; that cabinet's `rng` is seeded from today's hash |
| Finish the round | Cabinet's own grade/DNA/Share Card path fires under the `'dailychallenge'` tool identity; `DailyChallenge.record()` pays NetCoin, updates streak/history |
| Revisit `#/daily` same local day | Shows today's result + "come back tomorrow," no replay |
| Skip a day | Next play resets `streak` to 1 (no grace) |
| Import a friend's exported profile | Their Daily Challenge chip shows today's result only if their snapshot includes it |

* **Controls:** whatever the featured cabinet's own controls are — Daily
  Challenge adds no new input surface.
* **Touch-playable:** inherits whichever cabinet is featured that day.

---

## 7. Guardrails reaffirmed

Per `PlayTools_DD.md` §1.3 and the permanent monetization guardrail
(`ROADMAP.md` §3 decision 6): Daily Challenge's NetCoin payout (§4.2) is not
purchasable with real money, same as every other NetCoin source in the app.
Per `ROADMAP.md` §3 decision 1: no backend of any kind supports this feature
— the day's pick, seed, streak, and history all live entirely in the local
`Store` blob, computed from the device's own clock.
