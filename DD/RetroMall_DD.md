# The RetroMall — Creature Collection, Care & Arena Design Spec

**Version:** 0.1 (Draft — for iteration, pre-code)
**Author:** Playology Entertainment
**Status:** Proposed — not yet built
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
>   The creatures you collect are **MallPals**. (Working title; trivially
>   renamable. Other directions considered: PetMall, Mallrats, RetroPets.)
> - **Original creatures only.** No licensed/derivative species — MallPals are
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
**pet arcade**. You crack open **Loot Boxes** to discover **MallPals** — original
pixel creatures — then raise a **stable** of them. You feed and play with them
(tap), let them earn and forage while you're away (idle), train them through
**skill-based care mini-games**, and prove them in the **PvE Arena**. The better
you care and the better you play, the more your stable earns, the rarer the
MallPals you can chase, and the stronger your GamerDNA profile becomes.

Anyone who grew up with NeoPets/Tamagotchi is instantly at home; the neon-mall
skin and the NetCoin/GamerDNA plumbing make it unmistakably PlayTools.

---

## 3. The MallPal (creature model)

### 3.1 Identity
Each MallPal is an original, procedurally-rendered pixel creature with:
- **Species + variant** (the procedural seed → silhouette, palette, animation).
- **Rarity** (Common → Uncommon → Rare → Epic → Legendary) — drives drop rate and
  cosmetic flourish *only*, **not** combat or earning power beyond cosmetic feel.
- **Name** (player-set) and **adoption date**.
- **Bond level** — raised purely by *care actions over time* (tapping, mini-games,
  feeding). Bond unlocks cosmetic emotes/poses and small idle bonuses.

### 3.2 The three care meters (Light model)
| Meter | Drains via | Restored via | Drives |
|-------|-----------|--------------|--------|
| **Hunger** | time | feeding (tap, costs NetCoin/treats) | gates activities when empty |
| **Happiness** | neglect | tapping/affection, play, mini-games | **idle earn multiplier** |
| **Energy** | activities/arena | rest (idle), sleep | gates arena/mini-game performance |

- **Happiness** is the economic lever: a happy stable earns at full idle rate; a
  neglected one earns less. That is the *whole* stake.
- **Hunger/Energy** gate participation — a starving or exhausted MallPal can't
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
| **Gacha** | Crack Loot Boxes (pity + dupe→Shard) | New MallPals / cosmetics | **No** |

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
- You pilot one MallPal vs escalating CPU foes through a **reaction/timing**
  mini-game (read the tell → choose attack/guard/dodge in the window).
- **Outcome is skill-driven.** Pet Energy gates *entry*; rarity affects *cosmetics
  and flavor*, not the win — the player's timing decides the match.
- **Rewards:** NetCoin, rare cosmetic/MallPal drops, and GamerDNA (Strategy/Reflex).
- Gives rare and well-raised MallPals a **purpose** beyond display.
- **PvE only** in scope (single-player/client-side). No live PvP.

---

## 7. Gacha economy

- **Loot Box** purchased with **NetCoin** (earned in-app; no real money).
- **Pity timer:** a rare-or-better is guaranteed within a bounded number of pulls,
  so no infinite dry streak.
- **Duplicates → Shards:** every duplicate pull auto-recycles into **Shards**.
- **Shards** craft/target specific MallPals or cosmetics — duplicates always
  advance a goal.
- **Cosmetics** (mall fashions, habitat décor, arena skins) are NetCoin/Shard
  sinks that personalize without touching skill or earning.
- Tuning lives in a companion balance tool (see §11).

---

## 8. Social — Share Card flex + Gifting

- **Universal Share Card:** new card types for a single **MallPal** (hero shot,
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

**Phase 1 — Foundation / Vertical Slice (proves the loop):**
1. `mall` state block + persistence; RetroMall nav entry + `#/mall` route.
2. **Loot Box gacha:** NetCoin cost, rarity table, **pity timer**, **dupe→Shard**.
3. **Stable** screen: roster, procedural MallPal render, adopt/name.
4. **3-meter care** (Hunger/Happiness/Energy) + **Tap** affection (NetCoin/mood).
5. **Idle earning:** capped offline accrual, Happiness multiplier (Rig-style calc).
6. **One care mini-game** wired to **GamerDNA** (proves the honest skill bridge).
7. **MallPal Share Card** + a few NetCoin-paying achievements.

**Phase 2 — Depth:**
1. **PvE Arena** (`#/mall/arena`) — full reaction/timing combat + drops + GamerDNA.
2. **Remaining care mini-games** to cover all 7 GamerDNA vectors.
3. **Cosmetics** catalog (NetStore tab) + **Shard crafting/targeting**.
4. **Bond** progression, more species/rarities, stable management UI.
5. Full achievement set.

**Phase 3 — Social & Polish:**
1. **Gifting** (P2P treats/cosmetics) + **Stable Share Card**.
2. Seasonal/event Loot Boxes; more MallPals.
3. Audio/juice polish, animations, habitat décor.

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

- Final name lock (**The RetroMall** vs PetMall/Mallrats/RetroPets).
- Whether bond unlocks any *non-cosmetic* idle bonus (currently: small, cosmetic-
  leaning only — keep an eye on the guardrail).
- Async "ghost" friend battles (import a friend's stable to fight CPU-piloted
  copies) — deferred; would extend the arena without a server.
- Habitat/room builder as a deeper cosmetic sink (post-Phase 3).
