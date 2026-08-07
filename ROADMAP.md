# PlayTools Roadmap

**Last audited:** 2026-07-01
**Last prioritized:** 2026-08-07
**Method:** Full cross-reference of every design doc in `DD/` against the shipped code in `PlayTools.html` (~20,000 lines) and git history. Concrete drift found during the 2026-07-01 pass was corrected directly in the DD files (see §2). On 2026-08-04, the remaining open questions from that pass were resolved directly with the product owner and turned into a single prioritized v2 backlog (see §3–§5). This file is the living source of truth for where the app stands and where it's headed.

---

## 1. Version 1.0 — What's Actually Shipped

Everything described below is **live in the app today**. Treat all of it as the v1.0 baseline this roadmap builds forward from.

### 1.1 Core Platform (`DD/PlayTools_DD.md`)

| System | Status | Notes |
|---|---|---|
| Gamer DNA profile (demographics, persona) | ✅ Shipped | Missing only phone/TikTok fields vs. the original wishlist — minor. |
| Platform Link (Steam/Epic/Discord) | ✅ Shipped | Manual-entry only, exactly per the locked v1 spec. Xbox/PSN/Riot/Nintendo deliberately deferred. Twitch removed. **Unrelated to** the separate, later, opt-in Cloud Account Discord login below — Platform Link stays local-only. |
| Cloud Account (Discord OAuth2 sign-in + cross-device sync) | ✅ Shipped (PR 1 + 2) | Opt-in only — app is 100% anonymous/local by default, this is additive. Syncs Gamer DNA/achievements/Rig/RetroPets/tool bests via Supabase. Friends v2 (real Discord friends — search, request, accept, redacted-stat compare) is now wired into `#/friends` — see `DD/CloudSync_DD.md` §7. No leaderboards, no Discord presence. |
| Mathematical Attribute Engine (7-vector radar) | ✅ Shipped | All three stages now implemented to spec. Stage 1's logistic benchmark curve (**Fixed 2026-08-06 — B2, ✅ done**) is wired into the 4 anchored tools (Reaction Time, CPS Test, Precision Click, Tracking Trainer); Dice needed no change. The ~30 Retro Arcade/RPG Lab/RetroPets tools outside that anchor table still use their own linear `clamp01` formulas — several double as the NetCoin arcade-grade gate, so converting those is deliberately out of scope here (a live-economy decision, not just radar math). See `PlayTools_DD.md` §3.1.3. |
| Friends List (multi-sort, comparative radar) | ✅ Shipped | |
| Reflex Lab (Reaction, CPS, Precision Click) | ✅ Shipped | |
| Mouse Lab (Polling Rate, Accuracy) | ✅ Shipped | |
| Setup Lab (eDPI, Sensitivity Converter) | ✅ Shipped | |
| Fun Lab (DNA Report, Archetype Quiz) | ✅ Shipped | Plus **Game Night Planner**, now specified in `PlayTools_DD.md` §4.4.3 (**Fixed 2026-08-06 — A3, ✅ done**). |
| Tabletop/RPG Lab (Dice Roller) | ✅ Shipped | Full notation parser, presets, advantage/disadvantage. Plus **Character Forge, NPC Generator, Initiative Tracker, Quest & Tavern**, now specified in `PlayTools_DD.md` §4.5.1/4.5.3-4.5.5 (**Fixed 2026-08-06 — A3, ✅ done**). |
| Expansion tools (§5: Flick/Tracking/Double-Click/Spacebar, Lift-Off/Drag/Jitter/Stability, FOV/Aspect/Refresh/Session Planner, Challenge/Username/Clan/Loadout/Roast generators) | ✅ Shipped | All present and routed. |
| Retro Arcade (original §5.5 roster) | ⚠️ Superseded | Only StarDodger + Mnemonic shipped as named. "Asteroid Survival" and "Reflex Rush" were never built — replaced by a much larger cabinet line (§1.2). |
| Universal Share Card | ✅ Shipped | Across nearly every tool. |
| Achievements | ✅ Shipped, expanded | All 11 originally-documented achievements exist, plus dozens more (one set per expansion tool/cabinet). One semantic drift, now fixed: *Arcade Champion* previously checked **total Gamer Score ≥ 10,000** (a global, not arcade-specific, gate) instead of the documented "10,000 arcade points." **Fixed 2026-08-06 — see backlog item A1 (✅ done).** |

### 1.2 Retro Arcade Cabinet Line

Seven full cabinets, each with its own DD, all confirmed as genuine, substantial implementations (not stubs):

| Cabinet | Genre | Status | Doc accuracy |
|---|---|---|---|
| Cold Stack | Klondike solitaire | ✅ Shipped | Par constant retuned post-doc (900 → 1100 sprint / 950 zen) — doc corrected 2026-07-01. |
| Overdrive | Pseudo-3D racer | ✅ Shipped | Doc header corrected 2026-07-01. |
| Jack-In | Blackjack | ✅ Shipped | Tightest doc-to-code match of the set. |
| Ecto | Galaga-style shooter | ✅ Shipped | Very tight fidelity; capture-mechanic follow-up correctly still unbuilt. |
| Crossload | Frogger-style | ✅ Shipped | Doc header corrected 2026-07-01. `crossload_overclock` achievement ships at half the originally documented threshold (10,000 vs 20,000, and without the difficulty gate) — **decided 2026-08-04: the shipped 10,000/any-difficulty version is canon**, doc updated to match, no retune planned. |
| Mac Pan | Pac-Man-style | ✅ Shipped | Solid, faithful build. |
| Defrag | Match-3 | ✅ Shipped | Cleanest match of the set. |

Beyond these seven, additional cabinets now also have design docs, written retroactively 2026-08-06 (backlog item A2, ✅ done): Anaconda (`DD/Anaconda_DD.md`), Brick Breaker (`DD/BrickBreaker_DD.md`), Hopper Popper (`DD/HopperPopper_DD.md`), SighMan (`DD/SighMan_DD.md`), Pack Hacker (`DD/PackHacker_DD.md`), Sudoku (`DD/Sudoku_DD.md`), B0ggle (`DD/B0ggle_DD.md`). All 14 documented cabinets are wired into a universal NetCoin grade-payout gate (A=50/S=100 coins, once per cabinet per day). The audit surfaced a few small real drifts worth a follow-up pass: three cabinets' `Attr.applyVector` calls grant DNA components (a `consistency` or `focus` term) not mentioned in their `CABINETS` registry `dna` strings (Anaconda, Brick Breaker, Hopper Popper); `ctx.misses` (Hopper Popper) and the `mistakes` counter (Sudoku) are tracked but never consulted by any scoring/achievement logic; B0ggle uses its own `b0Grade(comp)` curve and a more generous `arcadePoints` divisor than its siblings, by original design, not drift.

**No arcade cabinet has been touched since 2026-06-12** — the line reads as a stable, completed feature set, not one still being actively iterated (all commits since are RetroPets/Rig work, then a volume-control UI pass and new Privacy Policy/Terms pages on 2026-07-09).

### 1.3 RetroPets (`DD/RetroMall_DD.md`)

Live under "The MetaGame" nav group, route `#/pets`. **Phase 1 shipped, and overshot spec**: gacha/loot-box system with pity timer + dupe→Shard recycling (plus a cinematic chest-opening ceremony never in the original doc), 8 procedural species, 3-meter care (Hunger/Happiness/Energy), capped idle earning, rarity-capped sale pricing, and **three** care mini-games (Rhythm-Feed, Tag/dodge, Fetch/groom) where only one was required — each posting honestly to GamerDNA.

**Phase 2's PvE Arena — the doc's centerpiece for "giving rare pets a purpose" — shipped 2026-08-07** (`#/pets/arena`, backlog item B1 — see §4). It shipped ahead of the original single-mode spec: a permanent Ladder rank (win-only advance, never regresses on a loss) plus an optional endless-run Gauntlet mode, a reaction/timing tell→counter combat loop reusing the existing Pet silhouette renderer for foes, 3 curated milestone bosses, rank-gated bonus Loot Box drops via the existing pity/dupe→Shard pull logic, and 5 new achievements — regression-tested in `test/pets-arena.mjs` (`npm run test:pets-arena`). **The rest of Phase 2 (cosmetics/Shard-spend catalog) and all of Phase 3 (Gifting, seasonal boxes, habitat décor) remain unbuilt.**

### 1.4 The Rig (`DD/Rig_DD.md`, `Rig_3D_Asset_Spec.md`)

The most complete and polished subsystem in the app. Phase 1 shipped in full (and beyond): NetCoin idle mining, escalating daily streaks with a 30-day recurring calendar, overclock multiplier, arcade-grade NetCoin payouts, a genuinely real-time **Three.js 3D battlestation** (20 real `.glb` models, real textures, HDRI lighting, SVG fallback for no-WebGL), a live WebGL Share Card capture, and a full NetStore. Phase 2 (cosmetics, Jack-In credits sink) is essentially done too.

**Phase 3 — prestige/rebuild loop, seasonal events, NetCoin usable in other games, a visual (not just numeric) friend-rig comparison — is unbuilt.** GPU/cooling/PSU 3D models remain unsourced (flagged low-priority in the asset spec itself).

---

## 2. Documentation Fixes Made 2026-07-01

Per instruction to keep the DDs accurate, these corrections were made directly in `DD/`:

- **PlayTools_DD.md**: added a status banner pointing to the Rig/RetroPets/Arcade docs that supersede/extend it; flagged Stage 1 of the Attribute Engine as unimplemented (linear clamps, not the logistic curve); corrected the *Arcade Champion* achievement description; marked §5.5's arcade roster as superseded; documented the 4 unlisted RPG Lab tools and Game Night Planner; noted the achievement roster has grown far past the original 11.
- **RetroMall_DD.md**: renamed "MallPal(s)" → "RetroPets" throughout to match shipped code; resolved the "final name lock" open question; marked Phase 1 complete (and where it overshot), Phases 2–3 as not started; corrected the `#/mall` routes to the shipped `#/pets`.
- **Rig_DD.md**: marked Phase 1 complete (and where it overshot), Phase 2 mostly complete, Phase 3 not started; clarified the Loot Box Store is RetroPets', not Rig's.
- **Rig_3D_Asset_Spec.md**: corrected the stale "Share Card capture still open" note — it shipped.
- **Overdrive_DD.md, Crossload_DD.md**: flipped stale "Proposed — not yet built" status headers to "Implemented — shipped."
- **ColdStack_DD.md**: documented the retuned par constants (900 → 1100/950).
- **Crossload_DD.md**: documented the `crossload_overclock` achievement's actual (easier, ungated) shipped threshold.

---

## 3. Decisions Locked 2026-08-04

The 2026-07-01 pass surfaced six open questions (formerly §5 of this doc). All six are now resolved with the product owner. These decisions are the basis for the prioritized backlog in §4.

1. **Leaderboards.** Every arcade DD deferred "online leaderboards," but the app's core principle is zero-auth/browser-only/no-backend. **Decided: build a Daily Challenge cabinet** — a shared random seed for every player each day (Wordle-style), scores compared only through the existing Share Card + Friends P2P import pipeline. No backend, ever, for this. Backlog item C1. *(Still true as of decision 7 below — Cloud Account adds an opt-in backend for sync/friends, but explicitly does not add leaderboards; this decision's "no backend, ever" stance for the Daily Challenge cabinet specifically is unchanged.)*
2. **Arcade Champion achievement.** **Decided: fix the code**, not the doc — the achievement will gate on actual arcade-cabinet points, matching the documentation's original intent. Backlog item A1 (small, concrete, ready to implement).
3. **Crossload's `crossload_overclock` threshold.** **Decided: the shipped 10,000/any-difficulty version is canon.** `Crossload_DD.md` updated 2026-08-04 to reflect this; no retune planned.
4. **Sequencing.** **Decided: rank the entire remaining backlog** into one master priority list rather than committing to a single next slice — see §4.
5. **Undocumented cabinets.** **Decided: yes, write DDs** for Anaconda, Brick Breaker, Hopper Popper, SighMan, Pack Hacker, Sudoku, B0ggle — and treat documentation/consistency work as the **top overall v2 priority**, ahead of new feature work. Backlog item A2.
6. **Monetization guardrail.** **Decided: permanent.** "NetCoin/Loot Boxes are never purchasable with real money" (already stated as a guardrail inside `Rig_DD.md` §1.2 and `RetroMall_DD.md` §1.2) is now a **locked, permanent product principle** — not just per-system guardrail language. Backlog item A4 formalizes this into `PlayTools_DD.md`'s top-level Core Principles (§1.3), so it's stated once, centrally, instead of duplicated per subsystem doc.
7. **Cloud Account (Discord OAuth2 login + cross-device sync).** **Decided 2026-08-05: build it, opt-in only.** The product owner asked for cloud save-sync and real social connectivity via Discord OAuth2 to help the app grow. This is the first exception to the zero-auth/no-backend Core Principles (`PlayTools_DD.md` §1.3) — resolved by amending those principles to "by default" rather than removing them: the app stays 100% anonymous/local-only unless a player explicitly signs in. Scope locked with the product owner: syncs Gamer DNA profile/achievements, Rig/RetroPets state, and all tool bests (arcade high scores included — there's no separate arcade-only key); explicitly **excludes** Platform Link cards, local friend notes, hardware calibration/sensitivity, UI favorites, the CharForge roster, and the RPG Initiative Tracker's scratch state (all stay local-only). Adds a real Discord-identity friends system (schema-ready; client wiring is a follow-up). Explicitly does **not** add leaderboards or Discord Rich Presence — decision 1 above is unaffected. Backed by Supabase (Postgres + Discord Auth provider + Row Level Security); see `DD/CloudSync_DD.md` for the full spec and `docs/CLOUD_SETUP.md` for how the project owner provisions it.
8. **RetroPets Bond → non-cosmetic idle bonus (backlog item D4).** **Decided 2026-08-07: allow it, small and capped.** `RetroMall_DD.md` §12 flagged that Bond only fed the sale-price ceiling (plus a modest Arena-win bump), and asked whether extending it to a real idle-earn bonus would brush against the honesty/monetization guardrail (decision 6 above). Resolved: yes, a small capped idle-NetCoin-earn bonus tied to Bond level is allowed — care investment should have a real economic payoff, not just cosmetic — as long as it stays low enough to read as a nice-to-have rather than a grind requirement. Does not touch the permanent guardrail: NetCoin/Loot Boxes still can never be bought with real money regardless of Bond level. `RetroMall_DD.md` §12 updated to match; the actual idle-earn-rate curve/cap is implementation work scoped into item B3 below, not a separate task.

**Overall v2 direction (re-ranked 2026-08-07):** Tier A documentation work is cheap enough to finish opportunistically regardless of theme. Beyond that, this cycle is explicitly optimizing for **closing the economy loop** — Shards have minted (via dupes and Arena drops) with nowhere to spend since B1 shipped, which is the clearest "broken-feeling" gap in the app today, so **B3 now leads the backlog**. **E3 (async ghost battles)** was explicitly blocked on the Arena (B1) existing; B1 shipped 2026-08-07, so E3 is promoted out of speculative Tier E into the main sequence, ranked alongside the other Tier B/D systems-deepening work. Everything else keeps its prior relative logic (retention loops next, then content breadth, then speculative/net-new).

---

## 4. Version 2.0 — Prioritized Backlog

One ranked list, top to bottom, across every pillar. Grouped into lettered tiers for readability; **the bracketed `[rN]` tag is the actual current priority order** (re-ranked 2026-08-07 per decision 8 above and the product owner's explicit economy-first steer for this cycle — see §3 item 8 and the "Overall v2 direction" note). Tier letters/numbers are kept stable as item IDs so cross-references elsewhere in this file and in the DDs still resolve; only the `[rN]` rank changes as priorities shift.

**Current order:** A4 → B3 → E3 → D2 → D1 → D3 → D7 → D8 → E4 → D5 → D6 → E1 → E2. (A1–A3, B1, B2, C1, D4 are done — see checkmarks below.)

### Tier A — Documentation & Consistency (do first, no new features)

1. **[A1] ✅ Fix the `arcade_champion` achievement** to gate on actual arcade-cabinet points instead of total Gamer Score, matching `PlayTools_DD.md`'s documented intent (decision 2 in §3). Small, self-contained code change. **Done 2026-08-06** — now tests `d.arcadePoints>=10000` instead of `Attr.gamerScore(d)>=10000`.
2. **[A2] ✅ Write DDs for the 7 undocumented cabinets** — Anaconda, Brick Breaker, Hopper Popper, SighMan, Pack Hacker, Sudoku, B0ggle — giving the whole Retro Arcade line the same audit trail as the other seven (Cold Stack, Overdrive, Jack-In, Ecto, Crossload, Mac Pan, Defrag). **Done 2026-08-06** — all 7 written retroactively against the shipped code; see §1.2 for the small drift items the audit surfaced.
3. **[A3] ✅ Write proper spec sections** in `PlayTools_DD.md` for the shipped-but-undocumented tools: **Game Night Planner** (Fun Lab) and **Character Forge, NPC Generator, Initiative Tracker, Quest & Tavern** (Tabletop/RPG Lab). **Done 2026-08-06** — all 5 now have full spec sections (§4.4.3, §4.5.1, §4.5.3-4.5.5) grounded in the shipped code, including their real DNA-vector formulas, achievement ties (or lack thereof), and telemetry.
4. **[A4] [r1] Formalize the permanent monetization guardrail.** Promote "money buys content/cosmetics, never skill or Gamer Score; NetCoin and Loot Boxes are never purchasable with real money" from per-subsystem guardrail language (currently duplicated in `Rig_DD.md` §1.2 and `RetroMall_DD.md` §1.2) into a single, explicit Core Principle in `PlayTools_DD.md` §1.3, so every future subsystem doc can just reference it.

### Tier B — Deepen Existing Systems (close the biggest gaps in what's already shipped)

5. **[B1] ✅ RetroPets Phase 2 — PvE Arena** (`#/pets/arena`). Was the single biggest gap between design and reality in the app; fully spec'd in `RetroMall_DD.md` §6. It's also the stated purpose for rare/well-raised pets and the prerequisite for the Async Ghost Battles idea (item E3 below), which is now unblocked (though not itself built). **Done 2026-08-07** — a reaction/timing tell→counter mini-game (read Lunge/Wind-up/Opening, counter with Dodge/Guard/Attack before the window closes; outcome is pure read/react quality, never Pet stats/rarity). Shipped ahead of the single-mode spec with two modes: a permanent **Ladder** rank that only ever advances on a win (a loss never regresses it — no punishing loss) and an optional endless-run **Gauntlet** that always restarts at foe #1, ends on the first loss, and pays a lump-sum bonus for the streak reached without ever touching the ladder rank. Foes are procedural (reusing the existing Pet silhouette renderer — zero new art) plus 3 curated milestone bosses (Rookie Titan/Veteran Specter/Champion Wyrm at ranks 10/25/50). Wins pay NetCoin scaling with rank and a rank-gated chance at a bonus Loot Box pull, reusing the exact paid-pull pity/dupe→Shard logic via a new shared `_applyPull` helper. Posts to GamerDNA (Strategy/Reflex) through the same recording path as every other RetroPets mini-game. 5 new achievements (First Blood, Rookie/Veteran/Arena Champ, Gauntlet Runner). Regression-tested in `test/pets-arena.mjs` (`npm run test:pets-arena`), including a live-DOM driven fight through the real timing loop. See `DD/RetroMall_DD.md` §6 for the full spec.
6. **[B2] ✅ Attribute Engine Stage 1 — logistic benchmark curve.** Implement the authored per-tool logistic normalization (`PlayTools_DD.md` §3.1.3) to replace the current linear clamps. This is the clearest "finish what was designed" item in the core platform — the whole percentile-without-a-backend pitch depends on it, and today's approximation quietly miscalibrates the very first stage of every attribute update. **Done 2026-08-06** — added `Attr.benchmarkQuality(x, {floor, median, elite, lowerBetter})` and wired it into the 4 tools the DD actually anchors (Reaction Time, CPS Test, Precision Click, Tracking Trainer); Dice needed no change. Scoped to just those 4, not the ~30 other `clamp01`-based tools (arcade cabinets, RPG Lab, RetroPets minigames) — several of those double their `comp` value as the NetCoin arcade-grade gate, so converting them is a separate, live-economy-affecting decision rather than pure radar math. Regression-tested in `test/attribute-benchmark.mjs` (`npm run test:attr-benchmark`).
7. **[B3] [r2] RetroPets Phase 2 — Cosmetics catalog + Shard crafting/spending.** Shards are currently minted via duplicate pulls (and, since B1 shipped, occasional Arena drops) but never spent anywhere — a real economy dead end. Closing this loop is a contained, well-scoped build now that both the gacha and Arena systems it feeds off of are stable (B1 done 2026-08-07). **Promoted to top of the open backlog 2026-08-07** — the product owner set "close the economy loop" as this cycle's priority axis, and this is the single clearest instance of that gap. Now also carries the Bond idle-earn-bonus implementation (decision 8 in §3, resolves former item D4): a small, capped Bond-level-scaled bonus to idle NetCoin earn-rate, on top of the cosmetics/crafting UI.

### Tier C — New Pillar (the one net-new system for this cycle)

8. **[C1] ✅ Daily Challenge cabinet.** The resolved answer to the leaderboard question (decision 1 in §3): a shared daily random seed, scores compared only via the existing Share Card + Friends P2P import. Originally sequenced after B1 (RetroPets Arena, still unbuilt) — **built out of order 2026-08-07 at the product owner's direct request**, ahead of B1. **Done 2026-08-07** — a hashed local-day key deterministically picks one of the 14 Retro Arcade cabinets and a `mulberry32` seed; all 14 cabinets were retrofitted to route their gameplay-relevant randomness through that seed (deck shuffles, board fills, spawn timing, enemy AI — see `DD/DailyChallenge_DD.md` §4.4 for the full per-cabinet inventory), so every player gets a byte-identical board/run on a given local day, confirmed by `test/daily-challenge.mjs`. One locked attempt/local day, strict streak-reset-on-miss (no grace), own `lab:'Daily Challenge'` nav group and bespoke NetCoin gate (not the generic per-cabinet Arcade grade cap). Comparison stays P2P-only — the Share Card gained a `Day` metric, and `ProfileIO`'s export payload gained a small `dailyChallenge` slice so an imported friend's snapshot can show today's result in Friends. New route `#/daily`, new `DailyChallenge` module, 5 new achievements. See `DD/DailyChallenge_DD.md` for the full spec.

### Tier D — Round Out Rig & RetroPets, Then Arcade Depth

9. **[D1] [r5] Rig Phase 3 — prestige/rebuild loop.** Reset-for-permanent-bonus, a classic idle-game retention lever, for the most polished existing subsystem.
10. **[D2] [r4] Cross-tool daily quests.** A unifying "do X across Labs/Arcade/Rig/RetroPets/Daily Challenge today for bonus NetCoin" system. Placed after B1 and C1 (both done) — quests are most valuable once there's a full daily surface (Arena + Daily Challenge + Rig) to draw tasks from. Ranked ahead of D1 in the current pass since it touches more of the already-shipped surface at once.
11. **[D3] [r6] RetroPets Phase 3 — Gifting** via the existing P2P export/import pipeline (send a friend a treat/cosmetic) **+ Stable-wide Share Card**. Was blocked on D4 (Bond's role); D4 resolved 2026-08-07, so this can now be scoped cleanly.
12. **[D4] ✅ Resolve the RetroPets Bond → idle-bonus open question.** `RetroMall_DD.md` §12 flagged that Bond currently only fed the sale-price ceiling, which arguably brushed the permanent monetization/honesty guardrail (decision 6 in §3) if extended to a non-cosmetic idle bonus. **Done 2026-08-07** — see decision 8 in §3: a small, capped non-cosmetic idle-earn bonus is allowed; `RetroMall_DD.md` §12 updated; the actual curve/cap implementation is scoped into B3, not tracked separately here.
13. **[D5] [r10] RetroPets Phase 3 — seasonal/event Loot Boxes, additional species, habitat/room décor.**
14. **[D6] [r11] Rig Phase 3 — remaining items:** seasonal events, NetCoin usable in more games, a real visual friends'-rig comparison (today it's numeric-only in Friends-compare; RetroPets' comparative radar pattern could be reused), GPU/cooling/PSU 3D models, NetStore-ifying the currently hero-render-only books/posters.
15. **[D7] [r7] Arcade — recurring deferred variants**, one contained slice per cabinet: FreeCell/Spider (Cold Stack), multi-course tracks (Overdrive), split/insurance (Jack-In), a capture mechanic (Ecto), more hazard types (Crossload), maze rotation (Mac Pan). Include daily-seed boards for Cold Stack/Defrag here too — they complement rather than duplicate the Daily Challenge cabinet (C1), which is a dedicated cabinet rather than a mode bolted onto existing ones. Individual per-cabinet slices are independently cherry-pickable and don't need to ship as one batch.
16. **[D8] [r8] Full audio/sound design pass** across the arcade line — an "audio package" is explicitly deferred in multiple individual cabinet DDs; worth doing as one consolidated pass rather than per-cabinet.

### Tier E — Speculative / Net-New (parked, lower confidence, revisit after the above)

17. **[E1] [r12] Expand Platform Link** — Xbox Live, PlayStation Network, Riot Games. Still manual-entry only, preserving the zero-auth principle.
18. **[E2] [r13] New Lab candidates** — a Controller/Gamepad Lab (stick drift, trigger travel, input lag), a Keyboard Lab (N-key rollover, actuation timing), or a Network/Ping Lab (jitter, packet loss self-diagnosis) — all still client-measurable.
19. **[E3] [r3] Async "ghost" battles** — import a friend's exported state and fight/compare against a CPU-piloted copy. Generalizes across RetroPets, Arcade, and Rig, and fits the zero-auth architecture without a live server. Was explicitly blocked on B1 (RetroPets Arena) existing first — **B1 shipped 2026-08-07, so this is unblocked and promoted out of Tier E into the main sequence** (kept in this tier's numbering as E3 for ID stability, but ranked r3 — right after B3 — per the product owner's 2026-08-07 call).
20. **[E4] [r9] PWA/offline installability**, since the app is already 100% client-side. Cheap and orthogonal to everything else — worth slotting in opportunistically even out of strict rank order if a contributor has a small block of time.

---

## 5. How This Backlog Should Be Used

- Tier letters/numbers (`A4`, `B3`, `E3`, ...) are stable IDs — cross-references elsewhere in this file and in the DDs point at them and shouldn't need to change as priorities shift. The **`[rN]` tag is the actual current rank** and is what changes when the priority axis changes; §4's "Current order" line is the single place to read the live sequence.
- The 2026-08-07 re-rank (decision 8 in §3) picked **closing the economy loop** as this cycle's axis: B3 (Shard spend) leads because it's the clearest dead-end in an otherwise-complete loop, and E3 (async ghost battles) jumped from parked Tier E to r3 the moment its only blocker (B1) shipped — "blocked" items should be re-evaluated the moment their blocker clears, not left at their original tier by default.
- Tier A remains cheap enough (mostly doc-only) that it's worth finishing opportunistically regardless of which axis is driving the rest of the backlog.
- Dependencies still constrain the order regardless of axis: D3 waited on D4 (now resolved); D2 still wants a full daily surface (Arena + Daily Challenge + Rig) to be worth building, which is most of why it sits after B3/E3 rather than because it's low-impact.
- If the priority axis changes again (e.g. back to retention-first or content-breadth), re-derive the `[rN]` ranks from the impact/effort read in this section rather than assuming the tier order is the intended order — it isn't, by design.
- This is a living document. As items ship, mark them ✅ in place (don't delete the row) so this file keeps functioning as an audit trail, the way §1–§2 do today.
