# Cloud Account — Discord OAuth2 Login & Cross-Device Sync Design Spec

**Version:** 1.1 (PR 1 shipped: Discord sign-in + DNA sync. PR 2 shipped:
Friends v2 — real Discord-identity friend requests, wired into `#/friends`;
see §7.)
**Author:** Playology Entertainment
**Status:** Live in-app under route `#/account`, linked from the rail.
Supabase is configured for the production deployment
(`Auth.isConfigured()` in `PlayTools.html` returns `true`); a build with no
config filled in stays completely invisible and inert instead — see §1.
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
- **`Cloud`** — sync (`push`/`pullAndMerge`) and friends (`searchProfiles`,
  `sendFriendRequest`, `listIncomingRequests`, `respondToRequest`,
  `listAcceptedFriends`, `removeFriendLink`). Hooks `Store.subscribe()` to
  debounce-push on every local save; never edits `Store` itself, so `Store`
  stays dependency-free and the hook is a guaranteed no-op for anonymous/
  signed-out players.

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

## 7. Friends v2 (shipped)

The migration ships `friend_links` and the `get_friend_dna(friend_id)`
redacting RPC, and `#/friends` now wires the full flow on top of them for
signed-in players:
- Search other signed-in players by Discord username (`profiles.discord_username`)
  via `Cloud.searchProfiles()`, and send a request via `Cloud.sendFriendRequest()`
  — which checks both directions first so a duplicate/already-friends/
  already-pending attempt fails with a clear error instead of a second row.
- Incoming requests (`Cloud.listIncomingRequests()`) render as an
  Accept/Decline list at the top of the Discord Friends box on `#/friends`;
  accepting or declining calls `Cloud.respondToRequest()` (`friend_links`
  state machine `pending → accepted|declined`) and re-renders the view.
  `listIncomingRequests()` also refreshes a small pending-count cache
  (`Cloud.pendingRequestCount()`) that lights a rail dot on Friends — the
  same "ready to collect" dot mechanism The Rig/RetroPets already use
  (`UI.railCollectAlert`/`syncRailDot`) — so a player doesn't have to open
  Friends to notice a pending request. Refreshed on every sign-in and every
  `#/friends` visit; there's no realtime push.
- An accepted friend's redacted DNA (`Cloud.listAcceptedFriends()`, via
  `get_friend_dna`, which strips `profile.contacts` before returning
  anything) is fetched fresh every time `#/friends` mounts — no local
  caching of another player's stats — and mapped into the exact same entry
  shape `ProfileIO.payloadToFriend()` already produces for imported P2P
  friends, tagged `source:'cloud'`. `Views.friends` merges both kinds into
  one sorted roster/grid rather than a parallel UI; `friendCard()` shows a
  "☁ DISCORD" chip and swaps the P2P "Remove" button for "Unfriend"
  (`Cloud.removeFriendLink()`, which deletes the `friend_links` row so
  either side can re-request later) on cloud entries, and skips the
  local-only contact note field for them (there's no local roster row to
  key a note off). The existing P2P Import/Export/Email flow is untouched
  and keeps working for everyone, signed in or not.
- Explicitly **not** in scope: leaderboards, Discord Rich Presence/status,
  cancelling an outgoing request before the other side responds (decline it
  from their side, or send a fresh request after removing the link).

**Test coverage.** No CI environment can complete a real Discord OAuth
consent screen or reach the live Supabase project, so the `playtools-friends`
case in `test/smoke.mjs` fakes out only the Supabase transport (a small
`.from()`/`.rpc()` emulator over an in-memory `profiles`/`friend_links`/dna
store) and drives the real `Cloud`/`Views.friends`/`friendCard` code as two
identities ("alice"/"bob") sharing that store — flipping which id
`Auth.user()` returns between visits to `#/friends` simulates two separate
signed-in sessions hitting one backend. It exercises the full round trip:
search → send request → duplicate-request rejection → incoming request +
rail dot on the addressee's side → accept → redacted stats + Discord badge
appear on both sides → unfriend → `friend_links` row removed. This is
regression coverage for the client logic, not a substitute for a real
round trip against a live Supabase project + real Discord accounts (RLS
policies and the OAuth flow itself aren't exercised by the fake transport)
— see `docs/CLOUD_SETUP.md` §7 for that manual check.
