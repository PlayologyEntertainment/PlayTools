# Cloud Account — Discord OAuth2 Login & Cross-Device Sync Design Spec

**Version:** 1.0 (PR 1 shipped: Discord sign-in + DNA sync. Friends v2 —
real Discord-identity friend requests — is schema-ready but not yet wired
into the client; see §7.)
**Author:** Playology Entertainment
**Status:** Live in-app under route `#/account`, linked from the rail only
when a deployment has Supabase configured (`Auth.isConfigured()` in
`PlayTools.html`). On the shipped default (no config filled in) this
feature is completely invisible and inert — see §1.
**Parent Doc:** `PlayTools_DD.md` §1.3 (Core Principles) and §3.1.2.1
(Platform Link — a **different, unrelated** feature, see §2 below)

> **Why this exists.** PlayTools' anonymous, browser-only, no-backend model
> (`PlayTools_DD.md` §1.3) is a deliberate, locked product principle, and it
> stays exactly that — **by default**. This spec adds one narrow, explicitly
> opt-in exception: a player who wants their Gamer DNA, achievements, Rig,
> and RetroPets progress to follow them across devices, and who wants a real
> (not manually-typed) friends list, can sign in with Discord to get that.
> Nothing about the anonymous path changes. No leaderboards, no Discord Rich
> Presence, and no requirement to ever create an account are introduced by
> this feature.

---

## 1. Guardrails (what stays true regardless of this feature)

- **Opt-in, not opt-out.** The app boots, plays, and saves progress exactly
  as it always has for a player who never visits `#/account`. Cloud sign-in
  is additive, never required.
- **Invisible when unconfigured.** A deployment that hasn't filled in
  `SUPABASE_URL`/`SUPABASE_ANON_KEY` (the `Auth` module, `PlayTools.html`)
  shows zero cloud UI anywhere — no rail entry, no prompts. `#/account`
  itself still mounts (so it never hard-404s) but only shows a "not set up"
  notice.
- **Explicit sync whitelist, not "everything."** See §3 — several fields
  that live in the same local `dna` blob are deliberately excluded from
  sync because they either promise to stay local elsewhere in the app, or
  are meaningless/misleading across devices.
- **No leaderboards, no presence.** This feature is identity + sync +
  friends only. Every arcade cabinet DD and `Rig_DD.md`/`RetroMall_DD.md`
  still correctly say "no online leaderboards" — that stance is unchanged.
- **Money guardrail unaffected.** NetCoin/Loot Boxes remain impossible to
  buy with real money; cloud sync moves the same NetCoin balance across
  devices, it doesn't create a new acquisition path.

---

## 2. Relationship to Platform Link (do not confuse these)

`PlayTools_DD.md` §3.1.2.1's **Platform Link** ships a manual-entry Discord
*stats card* (`dna.platforms.discord` — handle, server count, Nitro status
typed in by the player). That feature is unrelated to this one, stays
100% local, and its own copy ("no login, no network required, and nothing
ever leaves this browser") remains **true** — Platform Link is not wired to
Supabase or OAuth in any way.

**Cloud Account** (this doc) is a *different* Discord touchpoint: real OAuth2
sign-in, used only to (a) identify the player for sync and (b) let them find
real friends by Discord username. The `#/account` view explicitly tells
players this distinction in its own copy.

---

## 3. What syncs (and what deliberately doesn't)

Cloud sync piggybacks on the existing `Store` shape (`PlayTools.html`,
`Store` module) rather than re-normalizing state into new client-side
structures. `Cloud.buildPayload()` whitelists:

| Synced | Not synced | Why not |
|---|---|---|
| `profile` (Gamer DNA identity/persona) | `platforms` | Platform Link explicitly promises to never leave the browser (§2) |
| `attributes`, `attrPeaks`, `attrActiveAt` | `friends` | Replaced for signed-in players by the relational friend system (§7); local P2P entries stay local |
| `toolsCompleted`, `runs`, `arcadePoints` | `calibration`, `sensitivity` | Device-specific hardware measurements — syncing them would silently misrepresent a different machine's hardware as canonical |
| `bests` (every scored tool's best result — this includes **all arcade high scores**; there's no separate arcade-only key to split out) | `favorites` | Pure UI/nav preference, same tier as `playtools.prefs.v1` |
| `counters`, `achievements` | | |
| `rig` (NetCoin, parts, streaks) | | |
| `pets` (RetroPets roster, shards, care state) | | |

`counters` incidentally carries two CharForge-derived tallies
(`charCount`, `charMaxLevel`) — harmless to sync as plain integers. The full
CharForge roster (`playtools.charforge.v1`) and the RPG Initiative Tracker's
scratch state (`pt_initiative`) are **separate localStorage keys, never
touched by Cloud** — they stay local-only, full stop.

---

## 4. Architecture

```
Player's browser                          Supabase (owner-provisioned)
┌─────────────────────┐   OAuth2 (PKCE)   ┌───────────────────────────┐
│ Auth.signInWithDiscord() ───────────────▶│ Auth: Discord provider    │
│                      │◀──────────────────│ (Client ID/Secret live    │
│                      │   session/JWT     │  only in Supabase config) │
├─────────────────────┤                   ├───────────────────────────┤
│ Cloud.push()/pull()  │──REST (RLS-scoped)▶│ Postgres:                 │
│  via supabase-js     │◀──────────────────│  profiles, dna_states,    │
│  (tools/cloud-sync.  │                   │  friend_links,            │
│  bundle.js, lazy-    │                   │  get_friend_dna() RPC     │
│  loaded)             │                   └───────────────────────────┘
└─────────────────────┘
```

No custom server exists or is needed — Supabase's hosted Auth (Discord
provider) performs the OAuth2 code exchange, and Postgres Row Level
Security (not a bespoke API layer) enforces that a player can only read/
write their own rows (and, for friends, a narrow RPC-mediated slice of an
accepted friend's row). See `supabase/migrations/20260805000000_cloud_sync_and_friends.sql`
for the exact schema and policies, and `docs/CLOUD_SETUP.md` for how the
project owner provisions it.

**Client modules** (`PlayTools.html`, inserted directly after the `Store`
module):
- **`Auth`** — session lifecycle (`signInWithDiscord`, `signOut`,
  `isSignedIn`, `onChange`). Lazily imports the bundled Supabase SDK only
  once a player actually opens `#/account` or has a session to restore —
  the anonymous default path never downloads it.
- **`Cloud`** — sync (`push`/`pullAndMerge`) and (from PR 2 onward) friends.
  Hooks `Store.subscribe()` to debounce-push on every local save; never
  edits `Store` itself, so `Store` stays dependency-free and the hook is a
  guaranteed no-op for anonymous/signed-out players.

---

## 5. Merge strategy

On a fresh sign-in transition (not on every boot — see `Views.account`),
`Cloud.pullAndMerge()`:
1. **No cloud row yet** → seeds the cloud from the local device (first-ever
   login).
2. **Cloud row exists, no meaningful divergence** → last-write-wins by
   comparing `dna.updatedAt` (local) against `client_updated_at` (cloud).
3. **Both sides have real progress with different achievement sets**
   (`looksDivergent()`) → surfaces an explicit "Keep This Device / Use Cloud
   Data" choice in `#/account` rather than silently discarding either side.

This is a whole-payload strategy, not per-field merging — merging
individual fields (e.g. partially combining two different `rig.parts`
sets) would produce states neither device actually had and was rejected as
more confusing than a clear either/or choice.

---

## 6. Account deletion — a documented v1 gap

`Cloud.deleteCloudData()` (wired to "Delete My Cloud Data" in `#/account`)
removes the player's `dna_states`, `friend_links`, and `profiles` rows using
their own session — this is everything the anon Supabase client is allowed
to do under RLS. It does **not** delete the underlying `auth.users` row
(the Discord-linked identity Supabase itself retains), because that
requires a service-role Edge Function that isn't built yet. The delete
confirmation copy states this explicitly rather than implying a full
account deletion. A future `supabase/functions/delete-account` Edge
Function is the natural follow-up if/when that gap needs closing.

---

## 7. Friends v2 (schema-ready, not yet wired into the client)

The migration ships `friend_links` and the `get_friend_dna(friend_id)`
redacting RPC now (so the project owner only runs one migration), but the
client-side request/accept/search code and the `Views.friends` integration
land in a follow-up PR. When it ships, the design is:
- Search other signed-in players by Discord username (`profiles.discord_username`).
- Send/accept/decline requests (`friend_links`, state machine
  `pending → accepted|declined`).
- An accepted friend's redacted DNA (via `get_friend_dna`, which strips
  `profile.contacts` before returning anything) is mapped into the exact
  same entry shape `ProfileIO.payloadToFriend()` already produces for
  imported P2P friends, tagged `source:'cloud'`, so `Views.friends` renders
  both kinds side by side rather than needing a parallel UI. The existing
  P2P Import/Export/Email flow is untouched and keeps working for everyone,
  signed in or not.
- Explicitly **not** in scope: leaderboards, Discord Rich Presence/status.
