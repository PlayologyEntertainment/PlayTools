# RetroPets — Creature Collection, Care & Arena Design Spec

**Version:** 1.0 (Phase 1 implemented — shipped; Phases 2-3 not started)
**Author:** Playology Entertainment
**Status:** Phase 1 (Foundation / Vertical Slice, §10) is live in-app as
**RetroPets** under "The MetaGame" nav group, route `#/pets` (store at
`#/pets/store`) — the name **RetroPets** won the naming question in §12 by
default (every commit and code identifier uses it; "The RetroMall" / "RetroPet"
below are the original working titles, kept only where this doc's history is
being described). Phase 1 shipped *ahead* of spec (3 care mini-games instead of
the planned 1). Phase 2 (Arena, full cosmetics/Shard sinks) and Phase 3
(Gifting, seasonal boxes, habitat décor) are **not built** — see ROADMAP.md for
current v2 planning.
**Parent Doc:** `PlayTools_DD.md` (this introduces a **new top-level world** — a
collect/raise/battle layer that plugs into the existing **NetCoin** economy and
**GamerDNA** skill model; it is *not* a Retro Arcade cabinet)

> **Why this exists (and why it isn't just a clone of a virtual-pet site).**
> PlayTools is a gamer **identity + improvement** toolkit. Two of its strongest
> hooks — *daily return* (The Rig) and *honest skill measurement* (GamerDNA) —
> have never been wrapped in the single most durable engagement format in
> gaming history: **collect, raise, and bond with a creature you own.** The
> RetroMall does exactly that. It gives the NetCoin economy a *desirable thing to
> spend on* (creatures + cosmetics via Loot Boxes), gives skill a *warmer,
> friendlier on-ramp* (care mini-games and a PvE arena that write to GamerDNA),
> and gives the player a **persistent, personal, shareable** roster that grows
> for months. It is the spiritual successor to the 90s virtual-pet boom (NeoPets,
> Tamagotchi, Petz), rebuilt under the app's neon-80s skin and — critically —
> under its **honesty guardrails**.

> **Decisions locked in this brainstorm.**
> - **Name / fiction:** **The RetroMall** — a neon, 80s shopping-mall pet arcade.
>   The creatures you collect are **RetroPets**. (Working title; trivially
>   renamable. Other directions considered: PetMall, Mallrats, RetroPets.)
> - **Original creatures only.** No licensed/derivative species — RetroPets are
>   original pixel designs, procedurally rendered (no asset pipeline cost).
> - **Currency:** reuses **NetCoin** (one unified economy). Loot Boxes and
>   cosmetics are bought with NetCoin. A secondary crafting material, **Shards**,
>   comes *only* from recycling duplicate pulls.
> - **Care model:** **Light — 3 core meters** (Hunger, Happiness, Energy).
>   **Pets never die.** Neglect lowers Happiness → lowers idle earn-rate; that is
>   the *only* stake. No guilt, no death spiral.
> - **Two loops, two purposes:** **Tap** = active care/affection (NetCoin + mood
>   bursts, *no skill*). **Idle** = capped passive earning while away (*no skill*,
>   Rig-style). **Mini-games + Arena** = the *only* surfaces that move GamerDNA.
> - **Arena:** a **PvE skill arena** (Battledome homage) — reaction/timing combat
>   vs CPU, pays NetCoin + rare drops, feeds GamerDNA Strategy/Reflex.
> - **Social:** **Share Card flex + Gifting** — generate a Pet/Stable card; send a
>   treat/cosmetic to a friend via the existing P2P (zero-auth) pipeline. No live
>   server, no accounts, no trading economy.
> - **Honesty guardrail (sacred):** **money buys content, never skill.** NetCoin,
>   Loot Boxes, and cosmetics **never** move GamerDNA, grades, or Gamer Score.

---

## 1. Goals & Guardrails

### 1.1 Goals (in priority order)
1. **Give NetCoin a soul to spend on.** A persistent roster of collectible
   creatures is the most durable "thing to want" the economy can offer.
2. **A friendlier on-ramp to skill.** Care mini-games and the arena let a casual,
   cozy player build a real GamerDNA profile without ever touching a "serious"
   lab — the pet *is* the practice surface.
3. **Reward genuine daily care.** Like The Rig, returning and engaging compounds;
   a happy, well-raised stable earns more and performs better.
4. **Persistent, personal, shareable identity.** A stable you grow over months and
   flex via the Universal Share Card.
5. **Near-zero asset cost.** Procedural pixel rendering, single-file, client-only.

### 1.2 Guardrails (anti-goals — these keep it honest)
- **Money never buys skill.** NetCoin → *pets and cosmetics only.* Loot Box
  outcomes, rarity, and cosmetics have **zero** effect on GamerDNA, grades, or
  Gamer Score. The two currencies stay separate: **Gamer Score** = merit/skill;
  **NetCoin** = spendable economy.
- **Gacha stays kind.** A **pity timer** guarantees a rare within a bounded number
  of pulls; **duplicates always recycle into Shards** so a pull is never wasted.
  No real-money purchases — NetCoin is *earned* in-app.
- **No dark patterns / no death.** Pets cannot die or be permanently harmed.
  Neglect costs a *bonus* (idle multiplier), never your pet or your balance.
  Offline gains are **capped** (consistent with The Rig).
- **Everything flows back into real surfaces** — the wallet, the NetStore, the
  stable render, the Share Card, GamerDNA. No disconnected number-go-up.
- **Zero-auth, client-only.** All state in `localStorage`; all social via the
  existing P2P export/import pipeline. No backend.

---

## 2. Concept

**The RetroMall** is a neon 80s shopping mall whose anchor store is a glowing
**pet arcade**. You crack open **Loot Boxes** to discover **RetroPets** — original
pixel creatures — then raise a **stable** of them. You feed and play with them
(tap), let them earn and forage while you're away (idle), train them through
**skill-based care mini-games**, and prove them in the **PvE Arena**. The better
you care and the better you play, the more your stable earns, the rarer the
RetroPets you can chase, and the stronger your GamerDNA profile becomes.

Anyone who grew up with NeoPets/Tamagotchi is instantly at home; the neon-mall
skin and the NetCoin/GamerDNA plumbing make it unmistakably PlayTools.

---

## 3. The RetroPet (creature model)

### 3.1 Identity
Each RetroPet is an original, procedurally-rendered pixel creature with:
- **Species + variant** (the procedural seed → silhouette, palette, animation).
- **Rarity** (Common → Uncommon → Rare → Epic → Legendary) — drives drop rate,
  cosmetic flourish, and a **per-pet idle earn multiplier** (Common 1× → Legendary
  5×). Rarity affects *NetCoin earning only*; it **never** touches skill, grades,
  or Gamer Score.
- **Name** (player-set) and **adoption date**.
- **Bond level** — raised purely by *care actions over time* (tapping, mini-games,
  feeding). Bond unlocks cosmetic emotes/poses and small idle bonuses.

### 3.2 The three care meters (Light model)
| Meter | Drains via | Restored via | Drives |
|-------|-----------|--------------|--------|
| **Hunger** | time | feeding (tap, costs NetCoin/treats) | gates activities when empty |
| **Happiness** | neglect | tapping/affection, play, mini-games | **idle earn multiplier** |
| **Energy** | activities/arena | rest (idle), sleep | gates arena/mini-game performance |

- **Happiness** is the per-pet care lever: a happy stable earns at full idle rate;
  a neglected one earns less. The full idle rate stacks three multipliers —
  **Happiness × Rarity (per pet)**, then a stable-wide **Collection bonus**
  (+8% per unique species owned, replaced by a **2× Full-Stable capstone** once
  every species is collected). Care, rarity, and breadth all pay off.
- **Hunger/Energy** gate participation — a starving or exhausted RetroPet can't
  perform well in the arena or mini-games until cared for.
- **No death, no permanent loss.** Meters floor out; affection always recovers.

---

## 4. Core loops

| Loop | Mechanic | Reward | Writes GamerDNA? |
|------|----------|--------|:---:|
| **Tap** | Active care & affection (pet, feed, play) | NetCoin burst + Happiness | **No** |
| **Idle** | Pets passively earn NetCoin + forage while away, **capped** | NetCoin / treats | **No** |
| **Care mini-games** | Skill-based games (rhythm-feed, reaction-play, aim-groom) | NetCoin + stat/bond gains | **Yes** |
| **Arena (PvE)** | Reaction/timing combat vs CPU | NetCoin + rare drops | **Yes** |
| **Gacha** | Crack Loot Boxes (pity + dupe→Shard) | New RetroPets / cosmetics | **No** |

The first three mirror The Rig's philosophy (capped idle, daily return, honest
separation of economy from skill). The mini-games and arena are where the new
*skill* value is created.

---

## 5. GamerDNA bridge (the honest mapping)

Only skill surfaces write to GamerDNA. The care mini-games and arena map cleanly
onto the existing 7 vectors, so the RetroMall becomes a **new on-ramp to the same
skill profile** the labs feed — without ever letting NetCoin touch it.

| Surface | Skill exercised | GamerDNA vector(s) |
|---------|-----------------|--------------------|
| **Rhythm-feed** (feed on the beat) | timing / steadiness | Consistency, Speed |
| **Reaction-play / dodge** | stimulus response | Reflex, Focus |
| **Aim-groom** (target moving spots) | fine pointer control | Precision, Control |
| **Arena** (read tells, pick counters) | tactical decisions | Strategy (+ Reflex) |

> Design rule: a mini-game may only post GamerDNA if its outcome is determined by
> *player input quality*, never by pet rarity, stats, or NetCoin spend.

---

## 6. The Arena (PvE skill)

A **Battledome homage**, reframed as a neon mall fighting-game cabinet.
- You pilot one RetroPet vs escalating CPU foes through a **reaction/timing**
  mini-game (read the tell → choose attack/guard/dodge in the window).
- **Outcome is skill-driven.** Pet Energy gates *entry*; rarity affects *cosmetics
  and flavor*, not the win — the player's timing decides the match.
- **Rewards:** NetCoin, rare cosmetic/RetroPet drops, and GamerDNA (Strategy/Reflex).
- Gives rare and well-raised RetroPets a **purpose** beyond display.
- **PvE only** in scope (single-player/client-side). No live PvP.

---

## 7. Gacha economy

- **Loot Box** purchased with **NetCoin** (earned in-app; no real money).
- **Pity timer:** a rare-or-better is guaranteed within a bounded number of pulls,
  so no infinite dry streak.
- **Duplicates → Shards:** every duplicate pull auto-recycles into **Shards**.
- **Shards** craft/target specific RetroPets or cosmetics — duplicates always
  advance a goal.
- **Cosmetics** (mall fashions, habitat décor, arena skins) are NetCoin/Shard
  sinks that personalize without touching skill or earning.
- Tuning lives in a companion balance tool (see §11).

---

## 8. Social — Share Card flex + Gifting

- **Universal Share Card:** new card types for a single **RetroPet** (hero shot,
  rarity, bond, name) and the full **Stable** (roster flex). Generated as an image
  through the existing `ShareCard` framework.
- **Gifting:** a light async layer over the existing **P2P export/import**
  pipeline — send a friend a **treat or cosmetic**. Zero-auth, no server, no
  trading market (avoids economy-exploit surface).
- No guilds/visiting/live features in scope; can be revisited later.

---

## 9. PlayTools Integration

No new external dependencies; reuses existing plumbing.

* **Persistence:** a new `mall` block in the existing `Store` state, e.g.
  `{ pals:[{id, seed, species, rarity, name, bond, hunger, happy, energy,
  lastTickTs}], shards, pity:{count}, cosmetics:{}, arena:{rank, lastTs},
  achievements:{} }` — saved via the same `localStorage` path GamerDNA/prefs and
  the Rig already use. **NetCoin balance stays in the shared wallet**, not here.
* **Header:** RetroMall is a **top-level nav entry**, alongside The Rig. NetCoin
  balance (shared wallet) shows in the top bar as it already does.
* **Routes:** `#/mall` (stable + care dashboard), `#/mall/store` (Loot Box +
  cosmetics, a NetStore tab), `#/mall/arena` (PvE arena) — wired through the
  existing `Router.add` pattern.
* **Offline/idle calc** runs once on app load and on route entry (capped),
  exactly like the Rig's offline mining.
* **Skill hook:** mini-games and arena post to GamerDNA through the **same
  recording path** the labs use — no new skill plumbing, no change to how skill is
  recorded.
* **Share Card:** new card types in the existing `ShareCard` framework.
* **Achievements:** RetroMall-themed achievements wired into the existing
  achievements array (First Hatch, Full Stable, First Legendary, Arena Champ,
  Bond milestones) — **achievements pay NetCoin**.

---

## 10. Build Phasing

Three phases. Phase 1 proves the loop end-to-end as a vertical slice; later phases
add depth and social.

**Phase 1 — Foundation / Vertical Slice — ✅ SHIPPED (overshot spec):**
1. ✅ `Pets` state block + persistence; RetroPets nav entry + `#/pets` route
   (doc originally specified a `mall` block / `#/mall` — shipped naming won).
2. ✅ **Loot Box gacha:** NetCoin cost, rarity table, **pity timer**, **dupe→Shard**,
   plus a cinematic chest-opening ceremony beyond the original spec.
3. ✅ **Stable** screen: roster, procedural RetroPet render, adopt/name.
4. ✅ **3-meter care** (Hunger/Happiness/Energy) + **Tap** affection (NetCoin/mood).
5. ✅ **Idle earning:** capped offline accrual, Happiness multiplier (Rig-style calc).
6. ✅ **Three care mini-games** shipped (Rhythm-Feed, Tag/dodge, Fetch/groom) —
   spec only required one; all three post to GamerDNA (consistency/speed,
   reflex/focus, precision/control respectively).
7. ✅ **RetroPet Share Card** + rarity-capped sale price (`sellPrice()`).

**Phase 2 — Depth — ❌ NOT STARTED:**
1. ❌ **PvE Arena** (`#/pets/arena`) — no route, no combat logic exists anywhere
   in the codebase. This is the single biggest gap versus this doc.
2. ✅ Care mini-games already cover 6 of 7 vectors (see Phase 1 note above).
3. ❌ **Cosmetics** catalog / NetStore tab for Pets — not built. Shards are
   minted (via dupes) but never spent — no crafting/targeting UI exists.
4. ⚠️ **Bond** exists and feeds the sale-price ceiling, but no broader stable
   management UI or deeper species/rarity expansion has shipped.
5. ⚠️ Achievement set exists but is not the full Phase-2-scope list envisioned.

**Phase 3 — Social & Polish — ❌ NOT STARTED:**
1. ❌ Gifting (P2P treats/cosmetics) + Stable-wide Share Card.
2. ❌ Seasonal/event Loot Boxes; more RetroPets species.
3. ⚠️ Some animation/juice polish shipped (ear redesigns, chest-opening
   ceremony) but no habitat décor.

---

## 11. Economy Baseline & Tuning *(to follow)*

A live, editable balance tool will ship alongside this doc (cf.
`Rig_Economy_Tuner.html`) to tune: Loot Box price, rarity drop table, pity
threshold, Shard yields/costs, idle earn-rate + Happiness multiplier curve, care
drain rates, and arena payouts. It will simulate Grinder / Regular / Casual
archetypes auto-reinvesting NetCoin into pulls and cosmetics so the economy
compounds sensibly.

---

## 12. Open Questions / Future

- ✅ **Resolved:** Final name lock — **RetroPets** shipped and is the name used
  everywhere in code/commits; this doc's "RetroMall/RetroPet" title is legacy.
- Whether bond unlocks any *non-cosmetic* idle bonus — currently Bond only feeds
  the sale-price ceiling, which is arguably already brushing against the
  honesty guardrail (§1.2). Worth an explicit decision in v2 planning.
- Async "ghost" friend battles (import a friend's stable to fight CPU-piloted
  copies) — deferred; blocked on the Arena existing at all (Phase 2, unbuilt).
- Habitat/room builder as a deeper cosmetic sink (post-Phase 3, unbuilt).

**See `ROADMAP.md` for how these open items are being prioritized for v2.**
