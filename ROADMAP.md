# PlayTools Roadmap

**Last audited:** 2026-07-01
**Method:** Full cross-reference of every design doc in `DD/` against the shipped code in `PlayTools.html` (~19,800 lines) and git history. Concrete drift found during this pass has been corrected directly in the DD files (see "Documentation fixes made this pass" below); this file is the living source of truth for where the app stands and where it's headed.

---

## 1. Version 1.0 — What's Actually Shipped

Everything described below is **live in the app today**. Treat all of it as the v1.0 baseline this roadmap builds forward from.

### 1.1 Core Platform (`DD/PlayTools_DD.md`)

| System | Status | Notes |
|---|---|---|
| Gamer DNA profile (demographics, persona) | ✅ Shipped | Missing only phone/TikTok fields vs. the original wishlist — minor. |
| Platform Link (Steam/Epic/Discord/Twitch) | ✅ Shipped | Manual-entry only, exactly per the locked v1 spec. Xbox/PSN/Riot/Nintendo deliberately deferred. |
| Mathematical Attribute Engine (7-vector radar) | ⚠️ Partially shipped | Diminishing-returns easing + idle decay (Stages 2–3) are implemented **exactly** to spec. The logistic benchmark-curve normalization (Stage 1) is **not** — tools use simple linear clamps instead. See §3 below. |
| Friends List (multi-sort, comparative radar) | ✅ Shipped | |
| Reflex Lab (Reaction, CPS, Precision Click) | ✅ Shipped | |
| Mouse Lab (Polling Rate, Accuracy) | ✅ Shipped | |
| Setup Lab (eDPI, Sensitivity Converter) | ✅ Shipped | |
| Fun Lab (DNA Report, Archetype Quiz) | ✅ Shipped | Plus an undocumented **Game Night Planner**. |
| Tabletop/RPG Lab (Dice Roller) | ✅ Shipped | Full notation parser, presets, advantage/disadvantage. Plus 4 undocumented tools: **Character Forge, NPC Generator, Initiative Tracker, Quest & Tavern**. |
| Expansion tools (§5: Flick/Tracking/Double-Click/Spacebar, Lift-Off/Drag/Jitter/Stability, FOV/Aspect/Refresh/Session Planner, Challenge/Username/Clan/Loadout/Roast generators) | ✅ Shipped | All present and routed. |
| Retro Arcade (original §5.5 roster) | ⚠️ Superseded | Only StarDodger + Mnemonic shipped as named. "Asteroid Survival" and "Reflex Rush" were never built — replaced by a much larger cabinet line (§1.2). |
| Universal Share Card | ✅ Shipped | Across nearly every tool. |
| Achievements | ✅ Shipped, expanded | All 11 originally-documented achievements exist, plus dozens more (one set per expansion tool/cabinet). One semantic drift: *Arcade Champion* is documented as "10,000 arcade points" but actually checks **total Gamer Score ≥ 10,000** — a global, not arcade-specific, gate. |

### 1.2 Retro Arcade Cabinet Line

Seven full cabinets, each with its own DD, all confirmed as genuine, substantial implementations (not stubs):

| Cabinet | Genre | Status | Doc accuracy |
|---|---|---|---|
| Cold Stack | Klondike solitaire | ✅ Shipped | Par constant retuned post-doc (900 → 1100 sprint / 950 zen) — doc corrected this pass. |
| Overdrive | Pseudo-3D racer | ✅ Shipped | Doc header still said "Proposed" — corrected this pass. |
| Jack-In | Blackjack | ✅ Shipped | Tightest doc-to-code match of the set. |
| Ecto | Galaga-style shooter | ✅ Shipped | Very tight fidelity; capture-mechanic follow-up correctly still unbuilt. |
| Crossload | Frogger-style | ✅ Shipped | Doc header said "Proposed" (corrected); `crossload_overclock` achievement shipped at half the documented threshold (10,000 vs 20,000, and without the difficulty gate) — doc corrected, decision on whether to retune flagged below. |
| Mac Pan | Pac-Man-style | ✅ Shipped | Solid, faithful build. |
| Defrag | Match-3 | ✅ Shipped | Cleanest match of the set. |

Beyond these seven, additional cabinets exist **with no standalone design doc yet**: Anaconda, Brick Breaker, Hopper Popper, SighMan, Pack Hacker, Sudoku, B0ggle. All 7+ documented cabinets and this extra set are wired into a universal NetCoin grade-payout gate (A=50/S=100 coins, once per cabinet per day) that predates none of the individual DDs.

**No arcade cabinet has been touched since 2026-06-12** — the line reads as a stable, completed feature set, not one still being actively iterated (all recent commits are RetroPets/Rig work).

### 1.3 RetroPets (`DD/RetroMall_DD.md`)

Live under "The MetaGame" nav group, route `#/pets`. **Phase 1 shipped, and overshot spec**: gacha/loot-box system with pity timer + dupe→Shard recycling (plus a cinematic chest-opening ceremony never in the original doc), 8 procedural species, 3-meter care (Hunger/Happiness/Energy), capped idle earning, rarity-capped sale pricing, and **three** care mini-games (Rhythm-Feed, Tag/dodge, Fetch/groom) where only one was required — each posting honestly to GamerDNA.

**Phase 2 (Arena, cosmetics/Shard sinks) and Phase 3 (Gifting, seasonal boxes, habitat décor) are entirely unbuilt.** The PvE Arena in particular — the doc's centerpiece for "giving rare pets a purpose" — has no route or logic anywhere in the code.

The doc originally shipped under the working name "MallPals" in a fictional "RetroMall" — the team quietly renamed everything to **RetroPets** in code without updating the doc; that's fixed now.

### 1.4 The Rig (`DD/Rig_DD.md`, `Rig_3D_Asset_Spec.md`)

The most complete and polished subsystem in the app. Phase 1 shipped in full (and beyond): NetCoin idle mining, escalating daily streaks with a 30-day recurring calendar, overclock multiplier, arcade-grade NetCoin payouts, a genuinely real-time **Three.js 3D battlestation** (20 real `.glb` models, real textures, HDRI lighting, SVG fallback for no-WebGL), a live WebGL Share Card capture, and a full NetStore. Phase 2 (cosmetics, Jack-In credits sink) is essentially done too.

**Phase 3 — prestige/rebuild loop, seasonal events, NetCoin usable in other games, a visual (not just numeric) friend-rig comparison — is unbuilt.** GPU/cooling/PSU 3D models remain unsourced (flagged low-priority in the asset spec itself).

One naming trap fixed this pass: the "Loot Box Store" / chest-opening ceremony people might assume is part of The Rig is actually **RetroPets'** gacha shop — a separate system Rig_DD.md never mentions.

---

## 2. Documentation Fixes Made This Pass

Per your instruction to keep the DDs accurate, these corrections were made directly in `DD/`:

- **PlayTools_DD.md**: added a status banner pointing to the Rig/RetroPets/Arcade docs that supersede/extend it; flagged Stage 1 of the Attribute Engine as unimplemented (linear clamps, not the logistic curve); corrected the *Arcade Champion* achievement description; marked §5.5's arcade roster as superseded; documented the 4 unlisted RPG Lab tools and Game Night Planner; noted the achievement roster has grown far past the original 11.
- **RetroMall_DD.md**: renamed "MallPal(s)" → "RetroPets" throughout to match shipped code; resolved the "final name lock" open question; marked Phase 1 complete (and where it overshot), Phases 2–3 as not started; corrected the `#/mall` routes to the shipped `#/pets`.
- **Rig_DD.md**: marked Phase 1 complete (and where it overshot), Phase 2 mostly complete, Phase 3 not started; clarified the Loot Box Store is RetroPets', not Rig's.
- **Rig_3D_Asset_Spec.md**: corrected the stale "Share Card capture still open" note — it shipped.
- **Overdrive_DD.md, Crossload_DD.md**: flipped stale "Proposed — not yet built" status headers to "Implemented — shipped."
- **ColdStack_DD.md**: documented the retuned par constants (900 → 1100/950).
- **Crossload_DD.md**: documented the `crossload_overclock` achievement's actual (easier, ungated) shipped threshold.

Two things were **found but deliberately left unresolved**, pending your call (see §5):
- Whether *Arcade Champion* should become a true arcade-specific gate (code change) or the doc should just permanently describe the global-score behavior.
- Whether Crossload's `crossload_overclock` should be retuned tighter to match the original 20,000/Overclocked-only design, or the easier shipped version is the intended balance now.

---

## 3. Version 2.0 — Brainstorm

Organized by pillar. Since the direction is a **balanced mix of deepening existing systems and adding 1-2 new pillars**, with **no single business metric to over-index on**, ideas below aren't yet prioritized against each other — that's what §5's questions are for.

### 3.1 Core Platform & Gamer DNA
- **Implement the real Stage 1 logistic benchmark curve.** This is the single clearest "finish what was designed" item — the doc's whole percentile-without-a-backend pitch depends on it, and today's linear clamps quietly break the intended feel (numbers ease/decay per spec, but the initial quality score per run isn't calibrated the way v1.0 was designed to be).
- **Expand Platform Link** — Xbox Live, PlayStation Network, Riot Games were explicitly deferred, still manual-entry only to preserve the zero-auth principle.
- **New Lab candidates:** a Controller/Gamepad Lab (stick drift, trigger travel, input lag), a Keyboard Lab (N-key rollover, actuation timing — complements the existing Spacebar Speed Test), or a Network/Ping Lab (jitter, packet loss self-diagnosis, all still client-measurable).
- **Cross-tool daily quests** — a unifying "do X across labs/arcade/pets today for bonus NetCoin" system. Ties the Labs, Arcade, Rig, and RetroPets together into one daily-return loop instead of four separate ones. This is a strong retention lever if you want one without adopting a single specific metric focus.

### 3.2 Retro Arcade
- **Write DDs for the undocumented cabinets** (Anaconda, Brick Breaker, Hopper Popper, SighMan, Pack Hacker, Sudoku, B0ggle) so the whole line has the same audit trail as the other seven.
- **Deferred features that recur across nearly every cabinet doc:** daily-seed boards (Cold Stack, Defrag), audio/juice passes, additional variants per game (FreeCell/Spider for Cold Stack, multi-course Overdrive, split/insurance for Jack-In, capture mechanic for Ecto, more hazard types for Crossload, maze rotation for Mac Pan). Any of these is a contained, well-scoped v2 slice.
- **Online/global leaderboards** are listed as a deferred "candidate follow-up" in literally every cabinet's DD — this is the most recurring unresolved idea in the whole depot, and it's a real architecture fork (see §5, Q1).

### 3.3 RetroPets — Phase 2/3
- **PvE Arena** is the obvious next build: it's the doc's stated purpose for rare/well-raised pets, fully spec'd (§6 of RetroMall_DD.md), and currently the single biggest gap between design and reality in the app.
- Cosmetics catalog + Shard crafting (Shards are currently minted but never spent — a real economy dead end worth closing).
- Gifting via the existing P2P pipeline, seasonal loot boxes, habitat/room décor.
- Decide the Bond → idle-bonus question flagged in the doc's own guardrail section.

### 3.4 The Rig — Phase 3
- Prestige/rebuild loop (reset-for-permanent-bonus, a classic idle-game retention lever).
- Seasonal events, NetCoin usable inside more games.
- A real visual friends'-rig comparison (today it's a numeric Rig Score only — RetroPets' comparative radar pattern could be reused here).
- GPU/cooling/PSU 3D models; NetStore-ifying the books/posters that are currently hero-render-only flair.

### 3.5 New Pillars (net-new candidates)
- **Async "ghost" battles** — already floated as a RetroPets open question, but the pattern (import a friend's exported state, fight/compare against a CPU-piloted copy) generalizes to Arcade and Rig too, and fits the zero-auth architecture without needing a live server.
- **A shared "Daily Challenge" cabinet** — same random seed for every player each day (like Wordle), scores compared only via the existing Share Card + Friends P2P import, never a server. This could be the answer to the leaderboard itch without breaking the browser-only/zero-auth principle — flagged as a recommendation in §5.
- Full audio/sound design pass — several cabinet docs explicitly deferred an "audio package."
- PWA/offline installability, since the app is already 100% client-side.

---

## 4. Suggested Sequencing (draft — confirm before committing)

A balanced first v2.1 slice, mixing deepen + new:
1. RetroPets Arena (Phase 2 headline item — closes the biggest existing gap).
2. Attribute Engine Stage 1 logistic curve (finishes a core system as originally designed).
3. One new pillar: either the Daily Challenge cabinet (net-new, cross-cutting) or Rig Phase 3 prestige loop (deepens the most polished system).
4. Cross-tool daily quests, once the above land, to tie everything together.

This is a starting proposal, not a commitment — see the questions below before locking it in.

---

## 5. Open Questions

1. **Leaderboards.** Nearly every arcade DD defers "online leaderboards" as future scope, but the app's core principle is zero-auth/browser-only/no-backend. Do you want to (a) keep it fully client-side forever and lean on Share Cards + Friends P2P import for bragging rights, (b) introduce the Daily Challenge idea (§3.5) as a server-free middle ground, or (c) accept a small backend specifically for leaderboards, accepting that it breaks the "no server" principle for that one feature?
2. **Arcade Champion achievement.** Fix the code to be arcade-specific (matching original intent), or keep the shipped global-Gamer-Score behavior and just leave the corrected doc wording as final? 
3. **Crossload's `crossload_overclock` threshold.** Retune it back up to the documented 20,000/Overclocked-only, or treat the shipped 10,000/any-difficulty version as the real, intended balance now?
4. **Sequencing.** Does the draft sequencing in §4 look right, or is there a different priority order (e.g., you'd rather see a brand-new Lab before RetroPets Phase 2)?
5. **Undocumented cabinets.** Do you want DDs written for Anaconda/Brick Breaker/Hopper Popper/SighMan/Pack Hacker/Sudoku/B0ggle as a documentation task, or is that lower priority than net-new feature work?
6. **Monetization guardrail.** You picked "general growth" over a specific business metric — should "NetCoin/Loot Boxes are never purchasable with real money" (RetroMall_DD.md §1.2) remain a permanent guardrail for v2, or is real-money monetization something to keep on the table for later?
