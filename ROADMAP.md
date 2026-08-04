# PlayTools Roadmap

**Last audited:** 2026-07-01
**Last prioritized:** 2026-08-04
**Method:** Full cross-reference of every design doc in `DD/` against the shipped code in `PlayTools.html` (~20,000 lines) and git history. Concrete drift found during the 2026-07-01 pass was corrected directly in the DD files (see §2). On 2026-08-04, the remaining open questions from that pass were resolved directly with the product owner and turned into a single prioritized v2 backlog (see §3–§5). This file is the living source of truth for where the app stands and where it's headed.

---

## 1. Version 1.0 — What's Actually Shipped

Everything described below is **live in the app today**. Treat all of it as the v1.0 baseline this roadmap builds forward from.

### 1.1 Core Platform (`DD/PlayTools_DD.md`)

| System | Status | Notes |
|---|---|---|
| Gamer DNA profile (demographics, persona) | ✅ Shipped | Missing only phone/TikTok fields vs. the original wishlist — minor. |
| Platform Link (Steam/Epic/Discord/Twitch) | ✅ Shipped | Manual-entry only, exactly per the locked v1 spec. Xbox/PSN/Riot/Nintendo deliberately deferred. |
| Mathematical Attribute Engine (7-vector radar) | ⚠️ Partially shipped | Diminishing-returns easing + idle decay (Stages 2–3) are implemented **exactly** to spec. The logistic benchmark-curve normalization (Stage 1) is **not** — tools use simple linear clamps instead. See §4 below. |
| Friends List (multi-sort, comparative radar) | ✅ Shipped | |
| Reflex Lab (Reaction, CPS, Precision Click) | ✅ Shipped | |
| Mouse Lab (Polling Rate, Accuracy) | ✅ Shipped | |
| Setup Lab (eDPI, Sensitivity Converter) | ✅ Shipped | |
| Fun Lab (DNA Report, Archetype Quiz) | ✅ Shipped | Plus an undocumented **Game Night Planner**. |
| Tabletop/RPG Lab (Dice Roller) | ✅ Shipped | Full notation parser, presets, advantage/disadvantage. Plus 4 undocumented tools: **Character Forge, NPC Generator, Initiative Tracker, Quest & Tavern**. |
| Expansion tools (§5: Flick/Tracking/Double-Click/Spacebar, Lift-Off/Drag/Jitter/Stability, FOV/Aspect/Refresh/Session Planner, Challenge/Username/Clan/Loadout/Roast generators) | ✅ Shipped | All present and routed. |
| Retro Arcade (original §5.5 roster) | ⚠️ Superseded | Only StarDodger + Mnemonic shipped as named. "Asteroid Survival" and "Reflex Rush" were never built — replaced by a much larger cabinet line (§1.2). |
| Universal Share Card | ✅ Shipped | Across nearly every tool. |
| Achievements | ✅ Shipped, expanded | All 11 originally-documented achievements exist, plus dozens more (one set per expansion tool/cabinet). One semantic drift, now decided: *Arcade Champion* is documented as "10,000 arcade points" but actually checks **total Gamer Score ≥ 10,000** — a global, not arcade-specific, gate. **Decision (2026-08-04): fix the code to be arcade-specific** — see backlog item A1. |

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

Beyond these seven, additional cabinets exist **with no standalone design doc yet**: Anaconda, Brick Breaker, Hopper Popper, SighMan, Pack Hacker, Sudoku, B0ggle. All 7+ documented cabinets and this extra set are wired into a universal NetCoin grade-payout gate (A=50/S=100 coins, once per cabinet per day). Writing DDs for these seven is now backlog item A2 — see §4.

**No arcade cabinet has been touched since 2026-06-12** — the line reads as a stable, completed feature set, not one still being actively iterated (all commits since are RetroPets/Rig work, then a volume-control UI pass and new Privacy Policy/Terms pages on 2026-07-09).

### 1.3 RetroPets (`DD/RetroMall_DD.md`)

Live under "The MetaGame" nav group, route `#/pets`. **Phase 1 shipped, and overshot spec**: gacha/loot-box system with pity timer + dupe→Shard recycling (plus a cinematic chest-opening ceremony never in the original doc), 8 procedural species, 3-meter care (Hunger/Happiness/Energy), capped idle earning, rarity-capped sale pricing, and **three** care mini-games (Rhythm-Feed, Tag/dodge, Fetch/groom) where only one was required — each posting honestly to GamerDNA.

**Phase 2 (Arena, cosmetics/Shard sinks) and Phase 3 (Gifting, seasonal boxes, habitat décor) are entirely unbuilt.** The PvE Arena in particular — the doc's centerpiece for "giving rare pets a purpose" — has no route or logic anywhere in the code. This is now the single highest-ranked *feature* item in the backlog (B1) — see §4.

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

1. **Leaderboards.** Every arcade DD deferred "online leaderboards," but the app's core principle is zero-auth/browser-only/no-backend. **Decided: build a Daily Challenge cabinet** — a shared random seed for every player each day (Wordle-style), scores compared only through the existing Share Card + Friends P2P import pipeline. No backend, ever, for this. Backlog item C1.
2. **Arcade Champion achievement.** **Decided: fix the code**, not the doc — the achievement will gate on actual arcade-cabinet points, matching the documentation's original intent. Backlog item A1 (small, concrete, ready to implement).
3. **Crossload's `crossload_overclock` threshold.** **Decided: the shipped 10,000/any-difficulty version is canon.** `Crossload_DD.md` updated 2026-08-04 to reflect this; no retune planned.
4. **Sequencing.** **Decided: rank the entire remaining backlog** into one master priority list rather than committing to a single next slice — see §4.
5. **Undocumented cabinets.** **Decided: yes, write DDs** for Anaconda, Brick Breaker, Hopper Popper, SighMan, Pack Hacker, Sudoku, B0ggle — and treat documentation/consistency work as the **top overall v2 priority**, ahead of new feature work. Backlog item A2.
6. **Monetization guardrail.** **Decided: permanent.** "NetCoin/Loot Boxes are never purchasable with real money" (already stated as a guardrail inside `Rig_DD.md` §1.2 and `RetroMall_DD.md` §1.2) is now a **locked, permanent product principle** — not just per-system guardrail language. Backlog item A4 formalizes this into `PlayTools_DD.md`'s top-level Core Principles (§1.3), so it's stated once, centrally, instead of duplicated per subsystem doc.

**Overall v2 direction:** documentation & consistency work first (closes every known doc/code drift and gives the seven undocumented cabinets the same audit trail as the rest of the line), then deepen the two systems with the biggest existing gaps (RetroPets Arena, Attribute Engine Stage 1), then the Daily Challenge cabinet as the one new pillar, then round out Rig/RetroPets Phase 3 and Arcade variant/audio work, then speculative net-new ideas.

---

## 4. Version 2.0 — Prioritized Backlog

One ranked list, top to bottom, across every pillar. Grouped into lettered tiers for readability; the number is the actual priority order.

### Tier A — Documentation & Consistency (do first, no new features)

1. **[A1] Fix the `arcade_champion` achievement** to gate on actual arcade-cabinet points instead of total Gamer Score, matching `PlayTools_DD.md`'s documented intent (decision 2 in §3). Small, self-contained code change.
2. **[A2] Write DDs for the 7 undocumented cabinets** — Anaconda, Brick Breaker, Hopper Popper, SighMan, Pack Hacker, Sudoku, B0ggle — giving the whole Retro Arcade line the same audit trail as the other seven (Cold Stack, Overdrive, Jack-In, Ecto, Crossload, Mac Pan, Defrag).
3. **[A3] Write proper spec sections** in `PlayTools_DD.md` for the shipped-but-undocumented tools: **Game Night Planner** (Fun Lab) and **Character Forge, NPC Generator, Initiative Tracker, Quest & Tavern** (Tabletop/RPG Lab).
4. **[A4] Formalize the permanent monetization guardrail.** Promote "money buys content/cosmetics, never skill or Gamer Score; NetCoin and Loot Boxes are never purchasable with real money" from per-subsystem guardrail language (currently duplicated in `Rig_DD.md` §1.2 and `RetroMall_DD.md` §1.2) into a single, explicit Core Principle in `PlayTools_DD.md` §1.3, so every future subsystem doc can just reference it.

### Tier B — Deepen Existing Systems (close the biggest gaps in what's already shipped)

5. **[B1] RetroPets Phase 2 — PvE Arena** (`#/pets/arena`). The single biggest gap between design and reality in the app today: fully spec'd in `RetroMall_DD.md` §6, and currently has no route or combat logic anywhere in the code. It's also the stated purpose for rare/well-raised pets and the prerequisite for the Async Ghost Battles idea (item E3 below).
6. **[B2] Attribute Engine Stage 1 — logistic benchmark curve.** Implement the authored per-tool logistic normalization (`PlayTools_DD.md` §3.1.3) to replace the current linear clamps. This is the clearest "finish what was designed" item in the core platform — the whole percentile-without-a-backend pitch depends on it, and today's approximation quietly miscalibrates the very first stage of every attribute update.
7. **[B3] RetroPets Phase 2 — Cosmetics catalog + Shard crafting/spending.** Shards are currently minted via duplicate pulls but never spent anywhere — a real economy dead end. Closing this loop is a contained, well-scoped build once the gacha and Arena systems it feeds off of are stable.

### Tier C — New Pillar (the one net-new system for this cycle)

8. **[C1] Daily Challenge cabinet.** The resolved answer to the leaderboard question (decision 1 in §3): a shared daily random seed, scores compared only via the existing Share Card + Friends P2P import. Sequenced here — after the Arena and Attribute Engine fixes land — so it launches with a stable comparison target (accurate radar) and isn't competing for build attention with the two biggest existing-system gaps.

### Tier D — Round Out Rig & RetroPets, Then Arcade Depth

9. **[D1] Rig Phase 3 — prestige/rebuild loop.** Reset-for-permanent-bonus, a classic idle-game retention lever, for the most polished existing subsystem.
10. **[D2] Cross-tool daily quests.** A unifying "do X across Labs/Arcade/Rig/RetroPets/Daily Challenge today for bonus NetCoin" system. Placed after B1, C1, and D1 deliberately — quests are most valuable once there's a full daily surface (Arena + Daily Challenge + Rig) to draw tasks from.
11. **[D3] RetroPets Phase 3 — Gifting** via the existing P2P export/import pipeline (send a friend a treat/cosmetic) **+ Stable-wide Share Card**.
12. **[D4] Resolve the RetroPets Bond → idle-bonus open question.** `RetroMall_DD.md` §12 flags that Bond currently only feeds the sale-price ceiling, which arguably brushes the permanent monetization/honesty guardrail (decision 6 in §3) if extended to a non-cosmetic idle bonus. Needs an explicit decision before Phase 3 cosmetics/gifting work locks in Bond's final role.
13. **[D5] RetroPets Phase 3 — seasonal/event Loot Boxes, additional species, habitat/room décor.**
14. **[D6] Rig Phase 3 — remaining items:** seasonal events, NetCoin usable in more games, a real visual friends'-rig comparison (today it's numeric-only in Friends-compare; RetroPets' comparative radar pattern could be reused), GPU/cooling/PSU 3D models, NetStore-ifying the currently hero-render-only books/posters.
15. **[D7] Arcade — recurring deferred variants**, one contained slice per cabinet: FreeCell/Spider (Cold Stack), multi-course tracks (Overdrive), split/insurance (Jack-In), a capture mechanic (Ecto), more hazard types (Crossload), maze rotation (Mac Pan). Include daily-seed boards for Cold Stack/Defrag here too — they complement rather than duplicate the Daily Challenge cabinet (C1), which is a dedicated cabinet rather than a mode bolted onto existing ones.
16. **[D8] Full audio/sound design pass** across the arcade line — an "audio package" is explicitly deferred in multiple individual cabinet DDs; worth doing as one consolidated pass rather than per-cabinet.

### Tier E — Speculative / Net-New (parked, lower confidence, revisit after the above)

17. **[E1] Expand Platform Link** — Xbox Live, PlayStation Network, Riot Games. Still manual-entry only, preserving the zero-auth principle.
18. **[E2] New Lab candidates** — a Controller/Gamepad Lab (stick drift, trigger travel, input lag), a Keyboard Lab (N-key rollover, actuation timing), or a Network/Ping Lab (jitter, packet loss self-diagnosis) — all still client-measurable.
19. **[E3] Async "ghost" battles** — import a friend's exported state and fight/compare against a CPU-piloted copy. Generalizes across RetroPets, Arcade, and Rig, and fits the zero-auth architecture without a live server. Explicitly blocked on B1 (RetroPets Arena) existing first.
20. **[E4] PWA/offline installability**, since the app is already 100% client-side.

---

## 5. How This Backlog Should Be Used

- Treat Tier A as a single documentation/consistency sprint — none of it requires design decisions beyond what's already locked in §3, and it closes every known drift item in the repo.
- Tiers B–D are ordered by (a) size of existing gap, (b) how much later items depend on earlier ones (e.g. D2 deliberately waits on B1/C1/D1; E3 waits on B1), and (c) the "deepen before adding" preference implied by prioritizing documentation/consistency over new pillars this cycle.
- Tier E is intentionally not sequenced tightly against the others — it's genuinely net-new and lower-confidence, and should be revisited once Tiers A–D are further along rather than committed to now.
- This is a living document. As items ship, mark them ✅ in place (don't delete the row) so this file keeps functioning as an audit trail, the way §1–§2 do today.
