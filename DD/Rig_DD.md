# The Rig — Idle Meta-Progression & NetCoin Economy Design Spec

**Version:** 0.1 (Draft — for iteration, pre-code)
**Author:** Playology Entertainment
**Status:** Proposed — not yet built
**Parent Doc:** `PlayTools_DD.md` (this introduces a **new top-level meta-progression
layer** — it is *not* a Retro Arcade cabinet)

> **Why this exists (and why it isn't just an idle game for its own sake).**
> PlayTools is a gamer **identity + improvement** toolkit. The thing that actually
> makes someone better at games is **showing up consistently**. The Rig turns that
> real behavior into the engine of a persistent, personal, shareable meta-game:
> you return daily, your habit compounds, and you spend the proceeds building a
> battlestation that's unmistakably *yours*. It also fixes a real structural gap —
> today credits are siloed (Jack-In resets to 1000 every session, nothing carries
> over) — by introducing **one currency, NetCoin**, that unifies the economy and
> can fund future games and unlocks.

> **Decisions locked in this brainstorm.**
> - **Name / theme:** **The Rig** — literally your **NetCoin mining rig**, a
>   battlestation builder (fits the whole audience and bridges the Hardware/Setup
>   labs — not just the Arcade). Name comes straight from the fiction.
> - **Currency:** **NetCoin** — one unified currency, usable across future games
>   and to buy parts that upgrade your rig.
> - **Store:** the **NetStore**, where NetCoin is spent.
> - **Goal blend:** show up + use applets → a **multiplier**; a **daily payout**
>   to incentivize daily return; **each consecutive day pays slightly more**;
>   **missing a day clears the streak bonus**; extra rewards at **7-day** and
>   **30-day** streaks.
> - **Identity:** the Rig is **personal, persistent, and shareable**.
> - **Honesty guardrail:** idle/NetCoin **never** grants skill or GamerDNA.

---

## 1. Goals & Guardrails

### 1.1 Goals (in priority order)
1. **Reward genuine consistency.** Earn-rate scales with your streak and with
   actually *using applets* — modelling the real-world driver of improvement
   (regular practice), not binge sessions.
2. **Drive daily return.** A daily payout that compounds with consecutive days
   gives a concrete reason to open PlayTools even on non-grind days.
3. **Persistent, personal, shareable identity.** A battlestation you grow over
   weeks and flex via the Universal Share Card.
4. **Unify the economy.** One currency (NetCoin) that today's and tomorrow's
   systems all plug into.

### 1.2 Guardrails (anti-goals — these keep it honest)
- **Idle never accrues skill.** NetCoin and rig parts are an *economy*; they do
  **not** move GamerDNA, grades, or Gamer Score. Two currencies stay separate:
  **Gamer Score** = merit/skill reputation; **NetCoin** = spendable economy.
- **No dark patterns.** No punishing decay or guilt. Offline gains are **capped**
  so missing a day costs you a *bonus*, never your *balance* or your rig.
- **Everything flows back into real surfaces** — the wallet, the NetStore, the
  rig render, the Share Card. No disconnected number-go-up.
- **Near-zero asset/maintenance cost** — procedural rendering, single-file,
  client-only `localStorage` (consistent with DD §1.3 and the existing
  GamerDNA/prefs persistence).

---

## 2. Concept

**The Rig** is your persistent **NetCoin mining rig** — a gaming battlestation you
build out. While you're away, the rig's idle compute **mines NetCoin**. When you return, you collect a **daily payout**
that grows with your streak, and using the app's tools **overclocks** your
mining rate for the day. You spend NetCoin in the **NetStore** on **parts** that
both **raise your mining rate** and **visibly upgrade the battlestation** — a flex
you can share.

The fiction is deliberately honest: the rig mines NetCoin on **uptime/compute**,
not on your talent. Building a monster rig makes you *richer and cooler*, never
*better-aimed* — skill still only comes from real practice in the labs.

---

## 3. The NetCoin Economy

### 3.1 Sources
| Source | Cadence | Notes |
| --- | --- | --- |
| **Idle mining** | continuous (capped offline) | Base rate × rig multiplier × overclock (§4) |
| **Daily payout** | once per local calendar day | Escalates with streak (§5) |
| **Streak milestones** | at 7 & 30 consecutive days | Lump NetCoin + an exclusive part/cosmetic |
| **Achievements** | once per unlock | Lump NetCoin per achievement — gives the existing achievement system real purpose (see below) |
| **Jack-In winnings** | per session, **net-negative** | Two-way: stake NetCoin, win NetCoin — but the house edge makes it a **sink in aggregate** and bounded per day (§3.4) |

> **No per-applet drips.** Using a tool does **not** pay NetCoin directly — that
> path is reserved for the **Overclock multiplier** (§5.3), which rewards
> engagement by boosting the *mining rate*. Direct NetCoin instead comes from
> **achievements**, which turns the achievement system from a vanity list into a
> meaningful, paying objective board.

### 3.2 Sinks
| Sink | Notes |
| --- | --- |
| **Rig parts (functional)** | Raise mining rate / cap (§6) |
| **Battlestation cosmetics** | Pure identity/flex (§6) |
| **Jack-In stakes (net)** | NetCoin staked at the table — net-negative over time (§3.4) |
| *(Future)* New games & unlocks | NetCoin is the shared currency going forward |

### 3.4 Jack-In & gambling guardrails
Jack-In is allowed to **pay out NetCoin**, which makes it both a source *and* a
sink. To stop it inflating the tuned economy, it is designed as a **bounded,
net-negative** interaction:

1. **Stake-only cash-out.** Only NetCoin **you staked** (and its winnings) is
   cashable back to your wallet. The free **1,000-chip "house loan"** that seeds a
   session is **practice money** — it can never be converted to NetCoin. (This
   closes the obvious free-money printer.)
2. **House edge → net sink.** The cashable table carries a house edge, so over
   time Jack-In **removes** NetCoin from the economy. Grinding the casino is a
   *losing* strategy in expectation — it can never reliably out-earn the
   consistency loop, so it stays a flutter with surplus, not the optimal path.
3. **Bounded tail.** A **max bet** and a **daily net cash-out cap** (≈ 1–2 days of
   idle income) keep even a hot streak from skipping the multi-week curve.
4. **Low blast radius.** PlayTools is single-player and client-side with no shared
   marketplace — a lucky run only changes *that player's* pacing, it doesn't
   devalue anyone else's rig. So this is tuned for **feel** (fun, bounded, never
   dominant), not anti-cheat.

The economy baseline (§11) treats idle/daily/achievements as the *reliable*
sources; Jack-In's average contribution is a small drain, and its capped ceiling
is modelled in the tuner so the upside envelope is visible.

### 3.3 Separation from Gamer Score (critical)
NetCoin is **never** earned by being skillful and **never** converts to Gamer
Score or GamerDNA. You can be rich and unranked, or elite and broke. This keeps
the skill profile trustworthy and the economy free to be generous/fun.

---

## 4. The Idle Engine

* **Base rate:** an illustrative **12 NetCoin / hour** at Rig Score 0 (tunable).
* **Effective rate** = `base × rigMultiplier × overclockMultiplier`, where
  `rigMultiplier` comes from owned functional parts (§6) and `overclockMultiplier`
  from today's activity (§5.3).
* **Offline cap:** accrual **is capped** at a **rolling window (illustrative 12h)**
  so the rig "fills up" and then stops. This is intentional: a full tank is the
  hook that **motivates the player to return and collect/reset it**. Returning
  daily collects a full tank; vanishing for a week doesn't multiply your balance.
  It is still a **gentle nudge, never a penalty** — you never lose banked NetCoin,
  you just stop *accruing* once full. Parts can raise the cap (bigger "storage"),
  letting committed players bank more between visits.
* **Computation:** on app load, `mined = min(cap, (now − lastMineTs) × rate)`;
  add to balance; set `lastMineTs = now`. Pure timestamp math — no background
  process needed.

---

## 5. The Consistency & Daily Loop

### 5.1 Daily payout
On the first open of each **local calendar day**, the player claims a **daily
payout** (illustrative base **100 NetCoin**).

### 5.2 Streak escalation & reset
* Each **consecutive** day claimed pays **slightly more** — illustrative
  **+15% of base per day**, capped (e.g. at **+150% → 2.5×** around day ~11) so it
  stays exciting without ballooning.
* **Missing a day clears the streak bonus** — the streak counter resets to day 1
  (the *balance* and *rig* are untouched; only the escalating bonus resets).
* **Milestones (recurring):** the **weekly** milestone pays a lump bonus + a
  cosmetic reward; the **monthly** milestone pays a larger lump + an **exclusive
  part/badge**. Both **re-arm and run again** off the same active streak: the
  weekly fires at days **7, 14, 21, 28, …** and the monthly at days **30, 60, 90,
  …** — so on day 8 a fresh weekly milestone begins, and on day 31 a fresh
  monthly one. A missed day **resets the streak to day 1**, restarting both clocks.

### 5.3 Activity multiplier ("Overclock")
Showing up is good; **using the tools is better.** Using **N distinct applets**
in a day (illustrative N=3) **overclocks** the rig — an extra mining-rate
multiplier (illustrative **+25%**) for that day. This is what makes the meta
reward *real engagement with the product*, not just opening the tab. We tap the
existing per-tool usage signals (counters / `toolsCompleted`) to detect distinct
tools used today.

> Net effect: a player who **returns daily** *and* **actually trains** earns the
> most — exactly the behavior the whole app is designed to encourage.

---

## 6. The Rig (the battlestation)

A procedurally-rendered battlestation that visibly assembles as you buy parts.
Parts fall in two classes:

### 6.1 Functional parts (raise mining rate / cap)
| Category | Effect | Fiction |
| --- | --- | --- |
| **GPU** | ↑ mining rate (biggest lever) | the hashing workhorse |
| **CPU** | ↑ mining rate | base compute |
| **RAM** | ↑ offline cap | "storage" between visits |
| **Cooling** | sustains high rate (reduces a "thermal throttle" softcap) | keeps tiers stable |
| **PSU** | gates the highest tiers | enables top-end parts |

Each category has **tiers** with escalating cost and effect.

### 6.2 Cosmetic / peripheral parts (identity, pure flex)
Monitor(s), Mouse, Keyboard, Headset, Chair, Desk, **RGB lighting**, posters,
desk-toys, etc. These change the **render** and the **Rig Score**. Most are
identity-first, but **some peripherals also grant a small mining bump** — a nice
extra dimension so the cosmetic tab isn't a pure money-sink and there's a reason
to chase the *good* gear, not just the prettiest. (Which peripherals carry a
bump, and how big, is a tuning detail.) Peripherals tie narratively to the
**Hardware & Setup labs** (your rig literally *has* the mouse/monitor those tools
measure and tune).

### 6.3 Rig Score
A single flex number = weighted sum of owned part tiers. It headlines the Share
Card and is the "how decked-out is your setup" brag. (Distinct from Gamer Score.)

---

## 7. The NetStore

The shop where NetCoin is spent. Proposed tabs:
* **Hardware** — functional parts (§6.1).
* **Battlestation** — cosmetics/peripherals (§6.2).
* *(Phase 2)* **Credits** — convert NetCoin → game credits (Jack-In bankroll, etc.).

**Pricing curve:** a cheap entry part affordable within the **first ~1–2 minutes**
(so the hook lands immediately), then an escalating per-tier cost that gives a
satisfying early ramp and a long 30-day-plus tail. Numbers are illustrative and
to be tuned against the earn rates in §4–5.

---

## 8. Identity & Share Card

* **The battlestation render** is the persistent, personal artifact — it's
  recognizably *your* setup and grows for weeks.
* Extend the **Universal Share Card** framework (§5.1 of the parent DD) with a
  **Rig / Battlestation card**: the rendered rig, **Rig Score**, total NetCoin
  earned, current/best streak, and milestone badges. This is the virality hook.

---

## 9. PlayTools Integration

No new external dependencies; reuses existing plumbing.

* **Persistence:** a new `rig` block in the existing `Store` state, e.g.
  `{ netcoin, parts:{}, rigScore, lastMineTs, cap, streak, lastClaimDay,
  milestones:{}, overclock:{ day, toolsUsed:[] } }` — saved via the same
  `localStorage` path GamerDNA/prefs already use.
* **Header:** show the **NetCoin balance** in the top bar near Gamer Score / Rank,
  prefixed by the **NetCoin coin icon** (see below).
* **NetCoin icon:** a **colorful, ornate coin** drawn from the **Playology logo
  palette** — an **arcade-gold** body (`--neon-3` `#ffd23d`) with engraved
  detailing in **teal** (`--neon` `#16f2c8`, the "PLAY" side) and **magenta**
  (`--neon-2` `#ff3df0`, the "TOOLS" side), finished with a **violet** rim/glow
  (`--neon-4` `#7c5cff`). Rendered as an inline SVG so it scales crisply in the
  header, the wallet, the NetStore, and the Share Card.
* **Navigation:** The Rig is a **top-level nav entry**, positioned directly
  **under "The Lobby" and above "Friends."** It is kept **fully separate from
  Gamer DNA** for now (its own surface, its own state).
* **Routes:** `#/rig` (battlestation + mining/daily dashboard) and `#/rig/store`
  (NetStore), wired through the existing `Router.add` pattern.
* **Offline/daily calc** runs once on app load (and on route entry).
* **Activity hook:** read the existing tool-usage counters to mark distinct
  applets used today for the Overclock multiplier — **no change to how skill is
  recorded**.
* **Share Card:** new card type in the existing `ShareCard` framework.
* **Achievements:** optional Rig-themed achievements wired into the existing
  achievements array (First Build, 7-Day Streak, 30-Day Streak, Maxed a category,
  Rig Score milestones).

---

## 10. Build Phasing

**Phase 1 (MVP)** — proves the loop end-to-end:
1. NetCoin currency + header balance.
2. Idle mining (rate, cap, offline calc).
3. Daily payout + escalating streak + **strict** reset + 7/30 milestones.
4. Overclock activity multiplier (≥N tools/day).
5. **Achievements pay NetCoin** (wire NetCoin rewards into the existing achievements).
6. The Rig screen: a handful of functional parts + procedural render.
7. NetStore (Hardware tab).
8. Battlestation Share Card.

**Phase 2:** cosmetic/peripheral catalog (incl. the peripherals that carry a
mining bump); NetCoin → Jack-In credits sink; more tiers.

**Phase 3 (future):** prestige/rebuild, seasonal events, NetCoin in new games,
friends' rig comparison.

---

## 11. Economy Baseline & Tuning

A live, editable balance tool ships alongside this doc:
**[`Rig_Economy_Tuner.html`](./Rig_Economy_Tuner.html)** — edit any parameter or
catalog row and the summary, graphs, and affordability table recompute. It
simulates three archetypes (Grinder = daily + overclock, Regular = daily only,
Casual = every other day → streak keeps resetting), each auto-reinvesting into
parts (respecting `needs` prereqs) so the rig compounds.

The catalog table mirrors the live NetStore in `PlayTools.html` (the `PARTS` +
`COSMETICS` arrays) and carries the full store shape — `id`, name,
`description`, `cost`, category, `rate`/`cap`/`score` and a `model` (the
`rig_manifest.json` id for the item's `.glb`). To **add a NetStore item**: add a
row, fill those fields, watch its balance impact, then **Export for NetStore** —
it emits ready-to-paste catalog entries (split into `PARTS` / `COSMETICS` the
same way the app does) plus a `rig_manifest.json` model stub. Drop the `.glb`
into `assets/rig/models/<id>.glb` and position it with `npm run rig:edit`
(the 3D layout editor owns placement; the tuner owns price/description/economy).

**Proposed baseline (starting point, all tunable):**

| Lever | Baseline |
| --- | --- |
| Idle base rate | **10 NetCoin/hr**; **12h** offline cap |
| Daily payout | base **100**; **+15%/consecutive day**, capped at **+150%** (2.5×) |
| Overclock | **≥3 distinct tools/day → +25%** mining rate |
| Milestones | **+750** weekly (7/14/21…), **+5,000** monthly (30/60/90…) |
| Achievements | front-loaded drip ≈ **200/day** week 1, **8-day** half-life |
| Jack-In | **~3% house edge**, avg bet **200**, ~10 hands/day → small daily **drain**; **daily cash-out cap ~250** (≈ 1–2 days of idle) bounds the ceiling |
| Store curve | first part **80** (session 1) → flagship **GPU Mk III 30,000** (~8-week goal) |

**What the baseline produces:** first part bought **day 1**; a **healthy week-1
income mix** (≈ idle 43% / daily 20% / achievements 22% / milestones 15% — every
source matters early); idle naturally **compounds to dominate the long run** (by
design for a *mining* rig); flagship part reached around **day ~60**; and a **~5.7×
wealth gap** between a daily Grinder and a streak-breaking Casual — strong
reinforcement of consistency that **never removes anything** the player earned.

### 11.1 Open Question (the only one left before build)

1. **Sign-off on the numbers.** The shape is right; the exact values above need a
   review pass in the tuner. Open sub-knobs: precise idle rate vs. store curve so
   the flagship lands where we want (6 vs 8 weeks), how big the per-achievement
   payouts are and which achievements pay, and which peripherals carry a mining
   bump + how much.

### 11.1 Decided (this brainstorm)
- **Name** = **The Rig** — straight from the fiction (your *NetCoin mining rig*).
- **NetCoin icon** = colorful, ornate **gold coin** with teal + magenta engraving
  and a violet rim, drawn from the Playology logo palette (`--neon-3 / --neon /
  --neon-2 / --neon-4`); inline SVG.
- **Offline earnings are capped** — a full tank stops accruing, motivating the
  player to return and reset it (never loses banked NetCoin).
- **Navigation:** top-level nav entry, **under "The Lobby," above "Friends,"**
  kept fully separate from Gamer DNA for now.
- **Milestones recur:** weekly re-arms every 7 streak-days (7/14/21/…), monthly
  every 30 (30/60/90/…); a missed day resets the streak and both clocks.
- Theme = **battlestation builder**; currency = **NetCoin**; store = **NetStore**.
- Goal blend: consistency multiplier (show up **and** use applets) + escalating
  daily payout + reset-on-miss + **7-day & 30-day** milestone rewards.
- **Streak reset is strict** — miss a day, the bonus resets to day 1. No freeze
  token (avoids a dark pattern).
- **Achievements pay NetCoin** (lump per unlock); **no direct per-applet drips** —
  applet engagement is rewarded via the Overclock *multiplier* instead.
- **Some peripherals also grant a small mining bump** (not pure cosmetic), adding
  a dimension to the cosmetic catalog.
- The Rig is **personal, persistent, shareable**.
- NetCoin **unifies the economy**, buys rig parts, and funds future games.
- Idle/NetCoin **never** grants skill or GamerDNA (kept separate from Gamer Score).
